import frappe
from frappe.utils import get_system_timezone

no_cache = 1


def get_context(context):
	# The /frontend SPA is login-gated: bounce guests to the Frappe login,
	# then back to the app.
	if frappe.session.user == "Guest":
		frappe.local.flags.redirect_location = "/login?redirect-to=/frontend"
		raise frappe.Redirect

	csrf_token = frappe.sessions.get_csrf_token()
	frappe.db.commit()
	context.csrf_token = csrf_token
	context.boot = get_boot()
	context.boot.csrf_token = csrf_token
	return context


def get_boot():
	return frappe._dict(
		{
			"frappe_version": frappe.__version__,
			"site_name": frappe.local.site,
			"user": frappe.session.user,
			"read_only_mode": frappe.flags.read_only,
			"system_timezone": get_system_timezone(),
		}
	)
