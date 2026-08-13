import CaseTable from "../common/CaseTable";
import { store } from "../../lib/store";

export default function ItrApp() {
  return (
    <>
      <div className="filters" style={{ paddingBottom: 0 }}>
        <h2 style={{ margin: 0 }}>ITR Filing Tracker</h2>
      </div>
      <CaseTable store={store} title="ITR cases" />
    </>
  );
}
