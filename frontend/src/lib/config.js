// ============================================================================
//  Shared domain config + pure helpers (no React, no DOM).
//  Ported verbatim from the reference ITR Filing Tracker (lib/config.js).
// ============================================================================

export const ASSESSMENT_YEAR = "2026-27";

// Shown in follow-up messages. Change to your firm's name.
export const FIRM_NAME = "Our Tax Team";

// Billing entity — used on generated invoices (header, bank & UPI details).
export const COMPANY = {
  name: "NAQD CONSULTING PRIVATE LIMITED",
  addressLines: ["OPPOSITE KENDRIYA VIDYALAYA", "AK ROAD MALAPPURAM -676505"],
  email: "info.naqd@gmail.com",
  invoicePrefix: "NCG/ITR",          // invoice no. = NCG/ITR/<serial, 3-digit>
  bank: {
    name: "NAQD CONSULTING PVT LTD",
    accNo: "50200076296528",
    ifsc: "HDFC0009043",
    branch: "MALAPPURAM",
  },
  upi: "9343540123@pthdfc",
};

// First invoice serial number (used until an invoice is generated & stored).
export const INVOICE_SEQ_START = 101;

// Invoice number from a serial, e.g. 101 -> "NCG/ITR/101".
export function formatInvoiceNo(seq) {
  return `${COMPANY.invoicePrefix}/${String(seq).padStart(3, "0")}`;
}

// AY "2026-27" -> FY "2025-26" (previous year, shown on the invoice line).
export function fyFromAY(ay) {
  const m = /^(\d{4})-(\d{2})$/.exec(ay || "");
  if (!m) return ay || "";
  const start = parseInt(m[1], 10) - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

// Indian-format rupee amount to words, e.g. 1500 -> "INR One Thousand Five Hundred Only".
export function amountInWordsINR(value) {
  let n = Math.round(Number(value) || 0);
  if (n === 0) return "INR Zero Only";
  const A = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const B = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const sub = (x) => {
    let s = "";
    if (x > 99) { s += A[Math.floor(x / 100)] + " Hundred "; x %= 100; }
    if (x > 19) { s += B[Math.floor(x / 10)] + " "; x %= 10; }
    if (x > 0) s += A[x] + " ";
    return s;
  };
  let out = "";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) out += sub(crore) + "Crore ";
  if (lakh) out += sub(lakh) + "Lakh ";
  if (thousand) out += sub(thousand) + "Thousand ";
  if (n) out += sub(n);
  return "INR " + out.trim().replace(/\s+/g, " ") + " Only";
}

// Invoice date format matching the sample: "9-Jul-26".
export function fmtInvoiceDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const mon = d.toLocaleDateString("en-IN", { month: "short" });
  return `${d.getDate()}-${mon}-${String(d.getFullYear()).slice(2)}`;
}

// Statutory filing due-date categories. When the ITD extends a deadline,
// change the date here once — every client in that category updates.
export const DUE_CATEGORIES = [
  { key: "jul31", label: "31 Jul (Non-audit)", date: "2026-07-31" },
  { key: "aug31", label: "31 Aug",             date: "2026-08-31" },
  { key: "oct31", label: "31 Oct (Audit)",     date: "2026-10-31" },
];
export const dueCategoryMeta = (k) =>
  DUE_CATEGORIES.find((d) => d.key === k) || DUE_CATEGORIES[0];

export const STAGES = [
  { key: "onboarding",      label: "Onboarding",      color: "#64748b" },
  { key: "data_collection", label: "Data Collection", color: "#0ea5e9" },
  { key: "preparation",     label: "Preparation",     color: "#8b5cf6" },
  { key: "senior_approval", label: "Senior Approval", color: "#f59e0b" },
  { key: "client_approval", label: "Client Approval", color: "#ec4899" },
  { key: "ready_to_file",   label: "Ready to File",   color: "#10b981" },
  { key: "filed",           label: "Filed",           color: "#6366f1" },
  { key: "everified",       label: "E-Verified ✓", color: "#16a34a" },
];
export const stageIndex = (k) => STAGES.findIndex((s) => s.key === k);
export const stageMeta  = (k) => STAGES.find((s) => s.key === k) || STAGES[0];

// Income-source templates.
//  - `qty` sources/subs generate one checklist item per unit (counts[key]).
//  - `subs` are optional sub-options (checkboxes) stored in client.subs[key].
export const SOURCES = {
  salary: { label: "💼 Salary", items: ["Form 16", "Salary slips"] },
  bank: {
    label: "🏦 Bank / Savings Interest",
    qty: true, qlabel: "No. of bank accounts",
    item: (i) => `Bank statement / interest cert — Bank ${i}`,
  },
  capital_gains: {
    label: "📈 Capital Gains",
    subs: [
      {
        key: "cg_securities", label: "Shares / Mutual funds (demat)",
        qty: true, qlabel: "No. of demat / trading a/c",
        item: (i) => `Broker P&L / capital gains statement — A/c ${i}`,
        items: ["Mutual fund capital gains statement"],
      },
      {
        key: "cg_property", label: "Property / other asset sale",
        qty: true, qlabel: "No. of asset sales",
        item: (i) => `Sale & purchase deed — Asset ${i}`,
        items: ["Cost of acquisition / improvement proofs", "Reinvestment / exemption proof (54/54F/54EC), if any"],
      },
    ],
  },
  business: {
    label: "🏭 Business / Profession",
    items: ["Sales & purchase summary", "Profit & Loss + Balance sheet", "Business bank statement"],
    subs: [
      {
        key: "gst_registered", label: "GST registered",
        items: ["GSTR-3B / GSTR-1 summary", "GST reconciliation"],
      },
      {
        key: "firm_partner", label: "Partner in Firm / LLP (remuneration / interest)",
        qty: true, qlabel: "No. of firms / LLPs",
        item: (i) => `Financial statements of Firm / LLP ${i}`,
        items: ["Partner's remuneration & interest computation", "Firm / LLP ITR acknowledgement"],
      },
    ],
  },
  house_property: {
    label: "🏠 House Property / Rent",
    qty: true, qlabel: "No. of properties",
    item: (i) => `Rent & ownership details — Property ${i}`,
    items: ["Home loan interest certificate", "Municipal tax receipt"],
  },
  other: {
    label: "💵 Other Sources",
    items: ["Interest certificates (FD/RD)", "Dividend statement"],
  },
};

// All sub-option definitions flattened, for lookups.
export const ALL_SUBS = Object.values(SOURCES).flatMap((s) => s.subs || []);
export const subMeta = (key) => ALL_SUBS.find((x) => x.key === key);

// Entity being filed for. Each maps to its own onboarding document checklist
// (firm/LLP/company need incorporation & audit paperwork, not Form 16/Aadhaar).
export const ENTITY_TYPES = [
  { key: "individual", label: "👤 Individual" },
  { key: "firm", label: "🤝 Firm / Partnership" },
  { key: "llp", label: "🏛 LLP" },
  { key: "company", label: "🏢 Company" },
];
export const entityTypeMeta = (k) => ENTITY_TYPES.find((e) => e.key === k) || ENTITY_TYPES[0];

export const GENERAL_ITEMS_BY_ENTITY = {
  individual: [
    "PAN card copy", "Aadhaar copy", "Form 26AS / AIS / TIS",
    "Previous year ITR copy", "Bank a/c for refund",
  ],
  firm: [
    "PAN card of firm", "Partnership deed", "Partners' PAN & Aadhaar",
    "Firm's bank statements", "Profit & Loss + Balance sheet",
    "Tax audit report (if applicable)", "Previous year ITR copy", "Bank a/c for refund",
  ],
  llp: [
    "PAN card of LLP", "LLP agreement", "Designated partners' PAN & Aadhaar",
    "LLP's bank statements", "Profit & Loss + Balance sheet",
    "Tax audit report (if applicable)", "Form 11 / Form 8 (MCA annual filings)",
    "Previous year ITR copy", "Bank a/c for refund",
  ],
  company: [
    "PAN card of company", "Certificate of incorporation", "MOA & AOA",
    "Company's bank statements", "Audited financial statements",
    "Statutory audit report", "Board resolution for ITR filing",
    "DSC of authorized signatory", "Previous year ITR copy", "Bank a/c for refund",
  ],
};
// Back-compat alias — the individual checklist, as before.
export const GENERAL_ITEMS = GENERAL_ITEMS_BY_ENTITY.individual;

export const ITR_FORMS = ["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7", "—"];

// ----- stage gates -----
// What must be true BEFORE a client may enter `target`. Returns a list of
// human-readable problems; empty list = transition allowed.
export function gateProblems(c, target) {
  const problems = [];
  switch (target) {
    case "data_collection":
      if (!c.pan) problems.push("PAN is missing");
      else if (!isValidPAN(c.pan)) problems.push("PAN doesn't look valid (AAAAA9999A)");
      if (!(c.sources || []).length) problems.push("Select at least one income source");
      break;
    case "preparation": {
      const open = (c.checklist || []).filter((x) => !x.done && !x.nr).length;
      if (open) problems.push(`${open} document${open === 1 ? "" : "s"} still pending — collect or mark N/A`);
      break;
    }
    case "filed":
      if (!c.filing_date) problems.push("Filing date is missing");
      if (!c.ack_no) problems.push("Acknowledgement no. is missing");
      break;
    // senior_approval / client_approval / everified: judgment calls, no data gate
  }
  return problems;
}

// Normalised fee status: 'pending' (not invoiced) | 'invoiced' | 'collected'.
// Older records used 'paid'.
export function feeStatus(c) {
  const s = c.fee_status || "pending";
  return s === "paid" ? "collected" : s;
}

// ----- ids / dates -----
export const uid = () => "c_" + Math.random().toString(36).slice(2, 9);
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const daysBetween = (aISO, bISO) =>
  Math.round((new Date(bISO) - new Date(aISO)) / 864e5);

// ----- checklist generation (preserves done-state + custom items) -----
// buildChecklist(sources[], subs{key:bool}, counts{key:n}, existing[], entityType)
export function buildChecklist(sources, subs, counts, existing, entityType) {
  subs = subs || {}; counts = counts || {};
  const generalItems = GENERAL_ITEMS_BY_ENTITY[entityType] || GENERAL_ITEMS_BY_ENTITY.individual;
  const prev = {}; const customs = [];
  (existing || []).forEach((it) => {
    if (it.custom) customs.push(it);
    else prev[it.label] = { done: it.done, nr: !!it.nr };
  });
  const out = [];
  const push = (label, group) =>
    out.push({ id: uid(), label, group, custom: false, done: !!prev[label]?.done, nr: !!prev[label]?.nr });

  // Emit qty-items + fixed items for a source or sub definition.
  const emit = (def, key, group) => {
    if (def.qty) {
      const n = Math.max(1, counts[key] || 1);
      for (let i = 1; i <= n; i++) push(def.item(i), group);
    }
    (def.items || []).forEach((l) => push(l, group));
  };

  generalItems.forEach((l) => push(l, "General"));
  (sources || []).forEach((sk) => {
    const s = SOURCES[sk]; if (!s) return;
    emit(s, sk, s.label);
    (s.subs || []).forEach((sub) => { if (subs[sub.key]) emit(sub, sub.key, s.label); });
  });
  customs.forEach((c) => out.push({ ...c }));
  return out;
}

// Human-readable income summary (for client-facing documents).
export function incomeSummary(c) {
  const parts = [];
  (c.sources || []).forEach((sk) => {
    const s = SOURCES[sk]; if (!s) return;
    const base = s.label.replace(/^\S+\s/, ""); // strip leading emoji
    const on = (s.subs || []).filter((sub) => c.subs && c.subs[sub.key]).map((sub) => sub.label);
    parts.push(on.length ? `${base} — ${on.join(", ")}` : base);
  });
  return parts;
}

// ----- derived views -----
export function everifyInfo(c) {
  if (c.stage === "everified") return { state: "done", text: "E-verified", pill: "good" };
  if (c.stage !== "filed" || !c.filing_date) return null;
  const due = new Date(c.filing_date); due.setDate(due.getDate() + 30);
  const dueISO = due.toISOString().slice(0, 10);
  const left = daysBetween(todayISO(), dueISO);
  if (left < 0)  return { state: "overdue", text: `E-verify overdue ${-left}d`, pill: "bad", dueISO, left };
  if (left <= 7) return { state: "soon",    text: `E-verify in ${left}d`,        pill: "warn", dueISO, left };
  return { state: "ok", text: `E-verify by ${fmtDate(dueISO)}`, pill: "flag", dueISO, left };
}

// Filing due-date countdown (statutory deadline). null once filed/e-verified.
export function dueInfo(c) {
  if (c.stage === "filed" || c.stage === "everified") return null;
  const cat = dueCategoryMeta(c.due_category);
  const left = daysBetween(todayISO(), cat.date);
  if (left < 0)   return { state: "overdue", text: `Due date passed ${-left}d`, pill: "bad", cat, left };
  if (left <= 15) return { state: "soon",    text: `Filing due in ${left}d`,     pill: "warn", cat, left };
  return { state: "ok", text: `Due ${fmtDate(cat.date)}`, pill: "flag", cat, left };
}

// Days the client has been sitting in the current stage (stage_since is set
// automatically on every stage move; falls back to created_at for old rows).
export function daysInStage(c) {
  const since = c.stage_since || c.created_at;
  if (!since) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 864e5));
}

// Days since the client was last chased (follow-up copied / marked done).
// Falls back to time-in-stage when never followed up.
export function daysSinceFollowup(c) {
  if (!c.last_followup) return daysInStage(c);
  return Math.max(0, Math.floor((Date.now() - new Date(c.last_followup).getTime()) / 864e5));
}

// PAN format: 5 letters + 4 digits + 1 letter.
export function isValidPAN(pan) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test((pan || "").toUpperCase());
}

// Items marked "not required" (nr) are excluded from progress entirely.
export function checklistProgress(c) {
  const list = (c.checklist || []).filter((x) => !x.nr);
  const t = list.length; const d = list.filter((x) => x.done).length;
  return { d, t, pct: t ? Math.round((d / t) * 100) : 0 };
}

export function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
}
export function fmtMoney(n) {
  if (n == null || n === "") return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
}

export const REGIMES = ["New Tax Regime", "Old Tax Regime"];

// ----- Senior verification checklist -----
// Editable template used to generate the approver image. Item types:
//   'yn'     -> Yes / No / N-A
//   'amount' -> number
//   'text'   -> free text
//   'select' -> one of `options`
export const DEFAULT_REVIEW_TEMPLATE = {
  sections: [
    {
      key: "collection", title: "Data Collection",
      items: [
        { id: "aadhaar", label: "Aadhaar collected", type: "yn" },
        { id: "pan_link", label: "PAN–Aadhaar linked", type: "yn" },
        { id: "bank_stmt", label: "Bank statements collected", type: "yn" },
        { id: "form16", label: "Form 16 / salary slips (if salaried)", type: "yn" },
        { id: "prevalidate", label: "Bank account pre-validated for refund", type: "yn" },
      ],
    },
    {
      key: "entry", title: "Data Entry & Reconciliation",
      items: [
        { id: "f26as", label: "Form 26AS matched", type: "yn" },
        { id: "ais", label: "AIS / TIS checked", type: "yn" },
        { id: "interest", label: "Interest income (FD/SB) reported", type: "yn" },
        { id: "capgain", label: "Capital gains (shares/MF/property) considered", type: "yn" },
        { id: "other_inc", label: "Asked about other income (rent, foreign, etc.)", type: "yn" },
        { id: "ais_shortfall", label: "No shortfall vs AIS in computation", type: "yn" },
        { id: "debit_total", label: "Total debit in bank statement", type: "amount" },
        { id: "credit_total", label: "Total credit in bank statement", type: "amount" },
        { id: "gst_turnover", label: "GST turnover (if applicable)", type: "text" },
      ],
    },
    {
      key: "final", title: "Final Check",
      items: [
        { id: "regime", label: "Regime chosen", type: "select", options: REGIMES },
        { id: "verified", label: "All data verified", type: "yn" },
        { id: "tax_paid", label: "Tax payment / TDS details entered", type: "yn" },
        { id: "result", label: "Refund / Payable / Nil", type: "text" },
        { id: "client_ok", label: "Computation approved by client", type: "yn" },
      ],
    },
  ],
};

// Migrate a legacy client (top-level gst_registered, counts.capital_gains) to
// the new subs model. Returns { subs, counts } without mutating the input.
export function migrateIncomeModel(c) {
  const subs = { ...(c.subs || {}) };
  const counts = { ...(c.counts || {}) };
  if (c.gst_registered && subs.gst_registered === undefined) subs.gst_registered = true;
  if (counts.capital_gains && !subs.cg_securities && counts.cg_securities === undefined) {
    subs.cg_securities = true;
    counts.cg_securities = counts.capital_gains;
  }
  return { subs, counts };
}
