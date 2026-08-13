import { useFrappeGetDocCount } from "frappe-react-sdk";
import { Link } from "react-router-dom";

function StatCard({ n, label, to, tone }) {
  const inner = (
    <div className="stat">
      <div className={`n ${tone || ""}`}>{n ?? "…"}</div>
      <div className="l">{label}</div>
    </div>
  );
  return to ? (
    <Link to={to} style={{ textDecoration: "none", flex: 1 }}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function Dashboard() {
  const { data: itrCount } = useFrappeGetDocCount("ITR Filing");
  const { data: statCount } = useFrappeGetDocCount("Statutory Case");
  const { data: clientCount } = useFrappeGetDocCount("Client Master");
  const { data: itrFiled } = useFrappeGetDocCount("ITR Filing", [["stage", "in", ["filed", "everified"]]]);
  const { data: itrPending } = useFrappeGetDocCount("ITR Filing", [["pending_client", "=", 1]]);

  return (
    <main>
      <h2 style={{ margin: "10px 0" }}>Overview</h2>
      <div className="stats">
        <StatCard n={clientCount} label="Clients" to="/clients" />
        <StatCard n={itrCount} label="ITR Cases" to="/itr" />
        <StatCard n={itrFiled} label="ITR Filed" tone="good" to="/itr" />
        <StatCard n={itrPending} label="Pending from Client" tone="warn" to="/itr" />
        <StatCard n={statCount} label="Statutory Cases" to="/statutory" />
      </div>
      <p style={{ color: "var(--muted)", padding: "18px" }}>
        Welcome to the NAQD Practice Management System. Use the navigation above to
        open a module.
      </p>
    </main>
  );
}
