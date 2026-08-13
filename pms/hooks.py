app_name = "pms"
app_title = "PMS"
app_publisher = "NAQD Consulting"
app_description = (
	"Practice Management System — ITR filing, statutory/audit case tracking, "
	"and a shared client master for a CA / tax practice."
)
app_email = "info.naqd@gmail.com"
app_license = "MIT"
required_apps = ["frappe"]

# ------------------------------------------------------------------------------
# Doppio React SPA
# ------------------------------------------------------------------------------
# The SPA is built into pms/public/frontend and served (behind the Frappe login)
# at /frontend. This route rule sends every /frontend/* path to the SPA so
# client-side routing works on hard refresh.
website_route_rules = [
	{"from_route": "/frontend/<path:app_path>", "to_route": "frontend"},
]

# ------------------------------------------------------------------------------
# Fixtures — ship the custom roles with the app
# ------------------------------------------------------------------------------
fixtures = [
	{
		"dt": "Role",
		"filters": [["name", "in", ["PMS Staff", "PMS Senior Reviewer", "PMS Admin"]]],
	},
]

# ------------------------------------------------------------------------------
# Document Events
# ------------------------------------------------------------------------------
# (Stage gates, deadline computation and checklist sync live in the DocType
#  controllers themselves — see pms/pms/doctype/*/*.py)

# ------------------------------------------------------------------------------
# Installation
# ------------------------------------------------------------------------------
after_install = "pms.install.after_install"
