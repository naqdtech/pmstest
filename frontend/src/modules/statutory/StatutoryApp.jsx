import CaseTable from "../common/CaseTable";
import { store } from "../../lib/statutory/store";

export default function StatutoryApp() {
  return (
    <>
      <div className="filters" style={{ paddingBottom: 0 }}>
        <h2 style={{ margin: 0 }}>Statutory / Audit Case Tracker</h2>
      </div>
      <CaseTable store={store} title="statutory cases" />
    </>
  );
}
