# PMS — Practice Management System (Frappe + React)

A CA / tax-practice workbench built on **Frappe** with a **Doppio-style React
SPA** frontend (Vite + `frappe-react-sdk`), served behind the Frappe login.

It migrates three components of the legacy Next.js + Supabase
[`itr_filing_tracker`](https://github.com/naqdtech/itr_filing_tracker) — used
here **for reference only** — onto one Frappe backend:

| Module | DocType(s) | What it is |
|---|---|---|
| **Client Master** | `Client Master` (+ Consultant, Staff) | The shared client register — the hub every case links to. |
| **ITR Filing Tracker** | `ITR Filing` | 7-stage gated pipeline for income-tax return filing. |
| **Statutory / Audit Tracker** | `Statutory Case` | Accounts + tax-audit (3CD) + MCA case tracking (a superset of ITR). |

### Why this shape

- **Bundled Frappe app (Raven/Mint pattern), not headless-on-Vercel.** These are
  internal staff tools; everyone is already a Frappe user, so the SPA is served
  at `/frontend` behind the Frappe session — no CORS, no separate login, and
  Frappe realtime is same-origin. (The sibling `invoicing_app` stays headless on
  Vercel because it is customer/field-facing — different audience, different
  pattern.)
- **Client Master is a real DocType, so cases `Link` to it** and share identity
  through the link. The legacy `crossSync.js` PAN-matching hack is not ported —
  it is designed out.
- **Real auth + roles from day one.** Three roles (`PMS Staff`,
  `PMS Senior Reviewer`, `PMS Admin`) replace the legacy anon-key/no-login model,
  and the plaintext credential fields (`it_portal_password`, `gst_user`,
  `gst_password`) are locked to **permlevel 1** (Admin / System Manager only).

---

## Architecture

```
pmstest/                     # the Frappe app repo (app name: pms)
├── pyproject.toml           # app metadata (flit)
├── package.json             # root build orchestration (delegates to frontend/)
├── pms/                     # Python package
│   ├── hooks.py             # website_route_rules -> serve SPA at /frontend; fixtures (roles)
│   ├── install.py           # after_install: roles + seed Consultant/Staff
│   ├── www/frontend.py      # login-gated boot context + CSRF for the SPA
│   └── pms/                 # the "PMS" module
│       ├── case_logic.py    # shared stage gates / deadline logic (server-side)
│       └── doctype/         # Client Master, ITR Filing, Statutory Case, Consultant, Staff, PMS Settings
└── frontend/                # Doppio React SPA (Vite + frappe-react-sdk)
    ├── vite.config.js       # build -> ../pms/public/frontend
    ├── proxyOptions.js      # dev proxy to the bench
    └── src/
        ├── lib/
        │   ├── config.js            # domain config + pure helpers (ported verbatim from the reference)
        │   ├── frappe.js            # frappe-js-sdk client (same-origin, cookie+CSRF)
        │   ├── caseStore.js         # case-store factory (reference list/upsert/remove/subscribe interface)
        │   ├── store.js             # ITR Filing store
        │   ├── statutory/store.js   # Statutory Case store
        │   ├── clientMasterStore.js # Client Master store
        │   └── directory.js         # Consultants / Staff / settings
        ├── modules/         # itr, statutory, clientMaster, common
        └── pages/           # Home, Dashboard, Settings
```

**The data-layer seam:** the reference app talked to storage only through a
`store` object (`list / upsert / remove / subscribe / …`). This project keeps
that exact interface but backs it with Frappe (`frappe-js-sdk`), mapping the
DocType `name` ⇄ the reference `id`, `assessee_name` ⇄ the reference `name`, and
round-tripping the amorphous structures (`sources`, `subs`, `counts`, `review`,
`invoice`, `checklist`) as JSON — so the reference React components port with
almost no change.

---

## Install (on your bench)

```bash
# from your bench directory
bench get-app pms https://github.com/naqdtech/pmstest.git
bench --site your-site.local install-app pms
bench --site your-site.local migrate
```

Build the SPA:

```bash
cd apps/pms/frontend
yarn install
yarn build          # outputs to pms/public/frontend + copies www/frontend.html
```

Then open **`https://your-site.local/frontend`** (log in as a Frappe user first).
Assign users the `PMS Staff`, `PMS Senior Reviewer`, or `PMS Admin` role.

### Develop the SPA with hot-reload

```bash
cd apps/pms/frontend
yarn dev            # http://localhost:8080  (proxies /api, /assets, etc. to the bench)
```

---

## Seeding Client Master

Per the migration decision, this is a **fresh start** — no automated migration
from Supabase. Load your existing client register via Frappe's built-in
**Data Import** into the `Client Master` DocType (Desk → Client Master → Menu →
Import), or add clients in the SPA. Cases (`ITR Filing` / `Statutory Case`) are
created going forward and `Link`ed to their Client Master row.

---

## Status

**Done**
- Frappe app + Doppio SPA scaffold, served at `/frontend`, login-gated.
- Full data model: `Client Master`, `ITR Filing`, `Statutory Case`, `Consultant`,
  `Staff`, `PMS Settings`.
- Roles + permissions; permlevel-1 lock on credential fields.
- Server-side stage gates + `stage_since` stamping + Client Master back-fill.
- Frontend shared layer (config, Frappe-backed stores) + app shell, dashboard,
  and list views for all three modules.

**Next (in progress)**
- Port the rich reference UI onto these stores: Board (kanban + drag/drop),
  ClientDetail (stepper, checklist, gates, fees), ClientForm (income-source →
  checklist builder), Today queue, Reports, and the senior-review / client-confirm
  / invoice / import modals.
- The full Client Master editor (directors, year-wise data, compliance).
- Optional: swap the 20s poll in the stores for `frappe.realtime` over socket.io;
  normalise `checklist` into a child table; move invoices to a Frappe Print Format.

> Legacy app referenced for behaviour only; no legacy code is deployed.
