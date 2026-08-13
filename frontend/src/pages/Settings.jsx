import { COMPANY, DUE_CATEGORIES, ASSESSMENT_YEAR, FIRM_NAME } from "../lib/config";

// Read-only view of the firm-level config for now. Editing writes to the
// PMS Settings single DocType (see lib/directory.js getSetting/setSetting) and
// is wired in a later pass; today these defaults live in lib/config.js.
export default function Settings() {
  return (
    <main>
      <h2 style={{ margin: "10px 0" }}>Settings</h2>
      <div className="tablewrap" style={{ padding: 18 }}>
        <div className="section-t">Firm</div>
        <div className="kv">
          Firm name: <b>{FIRM_NAME}</b>
        </div>
        <div className="kv">
          Assessment year: <b>{ASSESSMENT_YEAR}</b>
        </div>

        <div className="section-t">Billing entity</div>
        <div className="kv">
          <b>{COMPANY.name}</b>
        </div>
        <div className="kv">{COMPANY.addressLines.join(", ")}</div>
        <div className="kv">
          Bank: <b>{COMPANY.bank.name}</b> · A/c {COMPANY.bank.accNo} · {COMPANY.bank.ifsc}
        </div>
        <div className="kv">
          UPI: <b>{COMPANY.upi}</b> · Invoice prefix {COMPANY.invoicePrefix}
        </div>

        <div className="section-t">Filing deadlines</div>
        {DUE_CATEGORIES.map((d) => (
          <div className="kv" key={d.key}>
            {d.label}: <b>{d.date}</b>
          </div>
        ))}
      </div>
    </main>
  );
}
