import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useFrappeAuth } from "frappe-react-sdk";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ItrApp from "./modules/itr/ItrApp";
import StatutoryApp from "./modules/statutory/StatutoryApp";
import ClientMasterApp from "./modules/clientMaster/ClientMasterApp";
import Settings from "./pages/Settings";

function TopNav({ user, logout }) {
  return (
    <header className="app">
      <NavLink to="/" className="brand">
        <span className="logo">N</span>
        <span>PMS</span>
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/clients">Client Master</NavLink>
        <NavLink to="/itr">ITR Filing</NavLink>
        <NavLink to="/statutory">Statutory</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
      <span className="spacer" />
      {user && <span className="user-chip">{user}</span>}
      <button className="btn sm" onClick={logout}>
        Logout
      </button>
    </header>
  );
}

export default function App() {
  const { currentUser, isLoading, logout } = useFrappeAuth();

  if (isLoading) {
    return <div className="center-screen">Loading…</div>;
  }

  if (!currentUser || currentUser === "Guest") {
    // The www route already gates guests; this is a belt-and-braces fallback.
    if (typeof window !== "undefined") {
      window.location.href = "/login?redirect-to=/frontend";
    }
    return <div className="center-screen">Redirecting to login…</div>;
  }

  return (
    <>
      <TopNav user={currentUser} logout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients/*" element={<ClientMasterApp />} />
        <Route path="/itr/*" element={<ItrApp />} />
        <Route path="/statutory/*" element={<StatutoryApp />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
