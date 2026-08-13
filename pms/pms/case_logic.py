"""Shared server-side logic for case DocTypes (ITR Filing, Statutory Case).

Mirrors the stage gates and helpers in the frontend lib/config.js so the same
rules are enforced on the server, no matter which client writes the record.
"""

import json
import re

import frappe
from frappe.utils import now_datetime

STAGES = [
	"onboarding",
	"data_collection",
	"preparation",
	"senior_approval",
	"client_approval",
	"ready_to_file",
	"filed",
	"everified",
]

PAN_RE = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")


def is_valid_pan(pan: str) -> bool:
	return bool(PAN_RE.match((pan or "").upper()))


def _load(value, fallback):
	if not value:
		return fallback
	if isinstance(value, (list, dict)):
		return value
	try:
		return json.loads(value)
	except Exception:
		return fallback


def gate_problems(doc, target: str):
	"""What must be true BEFORE `doc` may enter `target`. Empty list = allowed."""
	problems = []
	if target == "data_collection":
		if not doc.get("pan"):
			problems.append("PAN is missing")
		elif not is_valid_pan(doc.get("pan")):
			problems.append("PAN doesn't look valid (AAAAA9999A)")
		if not _load(doc.get("sources"), []):
			problems.append("Select at least one income source")
	elif target == "preparation":
		checklist = _load(doc.get("checklist"), [])
		open_items = [x for x in checklist if not x.get("done") and not x.get("nr")]
		if open_items:
			n = len(open_items)
			problems.append(f"{n} document{'' if n == 1 else 's'} still pending — collect or mark N/A")
	elif target == "filed":
		if not doc.get("filing_date"):
			problems.append("Filing date is missing")
		if not doc.get("ack_no"):
			problems.append("Acknowledgement no. is missing")
	return problems


def stage_index(key: str) -> int:
	try:
		return STAGES.index(key)
	except ValueError:
		return -1


def apply_case_logic(doc):
	"""Call from a case controller's validate(). Enforces forward stage gates,
	stamps stage_since on stage change, and back-fills a few fields from the
	linked Client Master."""
	# Normalise PAN
	if doc.get("pan"):
		doc.pan = doc.pan.strip().upper()

	before = doc.get_doc_before_save()
	old_stage = before.stage if before else None

	if doc.stage != old_stage:
		# Enforce the gate only when moving FORWARD; moving back is always free.
		if stage_index(doc.stage) > stage_index(old_stage):
			problems = gate_problems(doc, doc.stage)
			if problems:
				frappe.throw(
					"Can't advance to <b>{0}</b>:<br>• {1}".format(
						doc.stage, "<br>• ".join(problems)
					),
					title="Stage gate",
				)
		doc.stage_since = now_datetime()
	elif not doc.get("stage_since"):
		doc.stage_since = now_datetime()

	# Back-fill shared identity from Client Master when linked and blank.
	if doc.get("client"):
		cm = frappe.db.get_value(
			"Client Master", doc.client, ["pan", "email", "mobile"], as_dict=True
		)
		if cm:
			if not doc.get("pan") and cm.pan:
				doc.pan = cm.pan
			if not doc.get("email") and cm.email:
				doc.email = cm.email
			if not doc.get("phone") and cm.mobile:
				doc.phone = cm.mobile
