import { useState, useEffect, useCallback } from "react";
import { clientMasterStore as store } from "../../lib/clientMasterStore";

export default function ClientMasterApp() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await store.list());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsub = store.subscribe(load);
    return unsub;
  }, [load]);

  const types = [...new Set(rows.map((r) => r.type).filter(Boolean))].sort();
  const filtered = rows.filter((r) => {
    if (type && r.type !== type) return false;
    if (q) {
      const s = q.toLowerCase();
      return (
        (r.name || "").toLowerCase().includes(s) ||
        (r.pan || "").toLowerCase().includes(s) ||
        (r.gstin || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <>
      <div className="filters" style={{ paddingBottom: 0 }}>
        <h2 style={{ margin: 0 }}>Client Master</h2>
      </div>
      <main>
        <div className="filters">
          <div className="search">
            <span>🔎</span>
            <input placeholder="Search name / PAN / GSTIN…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <span className="lbl">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span style={{ flex: 1 }} />
          <span className="kv">
            <b>{filtered.length}</b> of {rows.length} clients
          </span>
        </div>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>PAN</th>
                <th>GSTIN</th>
                <th>Status</th>
                <th>Consultant</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    No clients yet. Import your register via the Client Master DocType, or add clients here.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <b>{r.name}</b>
                    </td>
                    <td>{r.type || "—"}</td>
                    <td className="pan">{r.pan || "—"}</td>
                    <td className="pan">{r.gstin || "—"}</td>
                    <td>{r.status || "—"}</td>
                    <td>{r.consultant || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
