import frappe
from frappe.model.document import Document

from pms.pms.case_logic import apply_case_logic


class ITRFiling(Document):
	def validate(self):
		apply_case_logic(self)
