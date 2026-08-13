import { useState, useEffect, useCallback } from "react";
import { STAGES, stageMeta, checklistProgress, dueInfo, fmtMoney } from "../../lib/config";

// Shared list view for ITR Filing and Statutory Case modules. A faithful,
// compact port of the reference TableView. The full Board / ClientDetail /
// ClientForm ports layer on top of this same store interface.
export default function CaseTable({ store, title, newHref }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await store.list());
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    load();
    const unsub = store.subscribe(load);
    return unsub;
  }, [load, store]);

  const filtered = rows.filter((r) => {
    if (stage && r.stage !== stage) return false;
    if (q) {
      const s = q.toLowerCase();
      return (
        (r.name || "").toLowerCase().includes(s) ||
        (r.pan || "").toLowerCase().includes(s) ||
        (r.alias || "").toLowerCase().includes(s) ||
        (r.group_name || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <main>
      <div className="filters">
        <div className="search">
          <span>🔎</span>
          <input placeholder="Search name / PAN / group…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span className="lbl">Stage</span>
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All</option>
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <span style={{ flex: 1 }} />
        <span className="kv">
          <b>{filtered.length}</b> of {rows.length} {title}
        </span>
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>PAN</th>
              <th>Form</th>
              <th>Stage</th>
              <th>Progress</th>
              <th>Due</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="empty">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  No cases yet.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const sm = stageMeta(r.stage);
                const pr = checklistProgress(r);
                const di = dueInfo(r);
                return (
                  <tr key={r.id}>
                    <td>
                      <b>{r.name}</b>
                      {r.alias ? <div className="pan">{r.alias}</div> : null}
                    </td>
                    <td className="pan">{r.pan || "—"}</td>
                    <td>{r.itr_form || "—"}</td>
                    <td>
                      <span className="stage-badge" style={{ background: sm.color }}>
                        {sm.label}
                      </span>
                    </td>
                    <td>
                      <div className="row-flex">
                        <div className="prog" style={{ maxWidth: 90 }}>
                          <i style={{ width: pr.pct + "%" }} />
                        </div>
                        <span className="prog-num">
                          {pr.d}/{pr.t}
                        </span>
                      </div>
                    </td>
                    <td>{di ? <span className={`pill ${di.pill}`}>{di.text}</span> : "—"}</td>
                    <td>{fmtMoney(r.fee_quoted)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
