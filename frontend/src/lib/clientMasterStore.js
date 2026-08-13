// ============================================================================
//  Client Master store — backed by the Client Master DocType.
//  The reference Client Master register used camelCase keys and lived as one
//  JSON blob; here each client is a real DocType row. This adapter translates
//  between the reference record shape and the DocType fields so the ported
//  Client Master UI runs unchanged.
// ============================================================================
import { db, parseJSON, blankToNull } from "./frappe";

const DT = "Client Master";

// reference key  ->  DocType fieldname (scalars)
const FIELD_MAP = {
  name: "client_name",
  type: "client_type",
  status: "status",
  pan: "pan",
  gstin: "gstin",
  cin: "cin",
  tan: "tan",
  state: "state",
  doi: "doi",
  address: "address",
  contact: "contact_person",
  mobile: "mobile",
  email: "email",
  consultant: "consultant",
  pod: "pod",
  feeSlab: "fee_slab",
  fee: "fee",
  gstFreq: "gst_freq",
  gstRegType: "gst_reg_type",
  folder: "folder",
  credRef: "cred_ref",
  engLetter: "eng_letter",
  notes: "notes",
  contribution: "contribution",
  digital95: "digital95",
  lastActivity: "last_activity",
};
const CHECK_KEYS = { staleFolder: "stale_folder", statusConfirmed: "status_confirmed" };
// reference key -> DocType JSON field
const JSON_MAP = { directors: "directors_json", docs: "docs_json" };
const NULLABLE = new Set(["doi", "consultant"]);

function docToRecord(doc) {
  const r = { id: doc.name, created_at: doc.creation, updated_at: doc.modified };
  for (const [ref, f] of Object.entries(FIELD_MAP)) r[ref] = doc[f] ?? "";
  for (const [ref, f] of Object.entries(CHECK_KEYS)) r[ref] = !!doc[f];
  for (const [ref, f] of Object.entries(JSON_MAP)) r[ref] = parseJSON(doc[f], ref === "directors" || ref === "docs" ? [] : {});
  // year-wise data + compliance sub-objects
  const yd = parseJSON(doc.year_data_json, {});
  r.turnover = yd.turnover || {};
  r.yearWiseData = yd.yearWiseData || {};
  const comp = parseJSON(doc.compliance_json, {});
  r.mca = comp.mca || {};
  r.gst = comp.gst || {};
  r.it = comp.it || {};
  r.tds = comp.tds || {};
  return r;
}

function recordToDoc(rec) {
  const d = {};
  for (const [ref, f] of Object.entries(FIELD_MAP)) {
    if (rec[ref] === undefined) continue;
    d[f] = NULLABLE.has(ref) ? blankToNull(rec[ref]) : rec[ref];
  }
  for (const [ref, f] of Object.entries(CHECK_KEYS)) if (rec[ref] !== undefined) d[f] = rec[ref] ? 1 : 0;
  for (const [ref, f] of Object.entries(JSON_MAP)) if (rec[ref] !== undefined) d[f] = JSON.stringify(rec[ref]);
  d.year_data_json = JSON.stringify({ turnover: rec.turnover || {}, yearWiseData: rec.yearWiseData || {} });
  d.compliance_json = JSON.stringify({ mca: rec.mca || {}, gst: rec.gst || {}, it: rec.it || {}, tds: rec.tds || {} });
  return d;
}

const isNew = (id) => !id || String(id).startsWith("NCPL-TMP") || String(id).startsWith("c_");

export const clientMasterStore = {
  async list() {
    const rows = await db.getDocList(DT, {
      fields: ["*"],
      orderBy: { field: "client_name", order: "asc" },
      limit: 0,
    });
    return (rows || []).map(docToRecord);
  },
  async get(id) {
    return docToRecord(await db.getDoc(DT, id));
  },
  async upsert(client) {
    const payload = recordToDoc(client);
    const saved = isNew(client.id)
      ? await db.createDoc(DT, payload)
      : await db.updateDoc(DT, client.id, payload);
    return docToRecord(saved);
  },
  async remove(id) {
    await db.deleteDoc(DT, id);
  },
  subscribe(onChange) {
    const iv = setInterval(() => {
      try {
        onChange();
      } catch {
        /* ignore */
      }
    }, 30000);
    return () => clearInterval(iv);
  },
};

export default clientMasterStore;
