import { Link } from "react-router-dom";

const MODULES = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/itr", icon: "📄", label: "ITR Filing Tracker" },
  { to: "/statutory", icon: "⚖️", label: "Statutory / Audit Cases" },
  { to: "/clients", icon: "👥", label: "Client Master" },
  { to: "/settings", icon: "⚙️", label: "Settings" },
];

export default function Home() {
  return (
    <div className="home-page-container active">
      <div className="home-header">
        <h1>NAQD Practice Management</h1>
        <p>Select a module to get started</p>
      </div>
      <div className="home-grid">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} style={{ textDecoration: "none" }}>
            <button className="home-btn" style={{ width: "100%", height: "100%" }}>
              <span className="icon">{m.icon}</span>
              <span className="label">{m.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
