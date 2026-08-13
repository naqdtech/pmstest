import frappe

PMS_ROLES = ["PMS Staff", "PMS Senior Reviewer", "PMS Admin"]


def after_install():
	create_roles()
	seed_consultants()
	seed_staff()
	frappe.db.commit()


def create_roles():
	for role in PMS_ROLES:
		if not frappe.db.exists("Role", role):
			frappe.get_doc(
				{
					"doctype": "Role",
					"role_name": role,
					"desk_access": 1,
				}
			).insert(ignore_permissions=True)


def seed_consultants():
	if not frappe.db.exists("Consultant", "Direct Customer"):
		frappe.get_doc(
			{"doctype": "Consultant", "consultant_name": "Direct Customer"}
		).insert(ignore_permissions=True)


def seed_staff():
	for name in ["Dennis", "Shibily", "Dhilshad"]:
		if not frappe.db.exists("Staff", name):
			frappe.get_doc({"doctype": "Staff", "staff_name": name}).insert(
				ignore_permissions=True
			)
