// ============================================================================
//  Case-store factory. One instance per case DocType (ITR Filing / Statutory
//  Case). Implements the SAME interface the reference UI expects from
//  lib/store.js — list / upsert / remove / bulkInsert / subscribe — so the
//  ported components run unchanged.
//
//  Field mapping notes:
//   * Frappe reserves `name` as the primary key, so the assessee's legal name
//     lives in `assessee_name`. The reference uses `c.id` (PK) and `c.name`
//     (legal name); we translate both ways here.
//   * Amorphous structures (sources, subs, counts, review, invoice, checklist)
//     are stored as JSON text on the DocType and round-tripped here — faithful
//     to the reference, which stored them as JSONB. Normalising checklist to a
//     child table is a documented follow-up.
// ============================================================================
import { db, parseJSON, toFrappeDatetime, blankToNull } from "./frappe";

// Fields shared by both case DocTypes.
const BASE_FIELDS = [
  "client", "alias", "group_name", "entity_type", "pan", "email", "phone",
  "it_portal_reg", "it_portal_password", "assigned_staff", "assessment_year",
  "itr_form", "consultant", "residential_status", "due_category",
  "gst_registered", "stage", "filing_date", "ack_no", "outcome_type",
  "outcome_amount", "everify_date", "fee_quoted", "fee_status",
  "pending_client", "next_followup", "notes", "stage_since", "last_followup",
];

// Statutory Case adds accounts / audit / 3CD / MCA fields.
export const STATUTORY_FIELDS = [
  "accounts_type", "accounts_prep", "audit", "income_tax_filing", "mca_filing",
  "audit_due_date", "gst_user", "gst_password", "audit_form",
  "filing_3cd_date", "udin",
];

const JSON_ARRAY_FIELDS = ["sources", "checklist"];
const JSON_OBJ_FIELDS = ["subs", "counts", "review", "invoice"];
const JSON_FIELDS = [...JSON_ARRAY_FIELDS, ...JSON_OBJ_FIELDS];

const CHECK_FIELDS = [
  "it_portal_reg", "gst_registered", "pending_client",
  "accounts_prep", "audit", "income_tax_filing", "mca_filing",
];
const DATETIME_FIELDS = ["stage_since", "last_followup"];
const DATE_FIELDS = ["filing_date", "everify_date", "next_followup", "filing_3cd_date"];
const LINK_OR_SELECT = ["client", "assigned_staff", "consultant", "outcome_type", "audit_form"];

export function makeCaseStore(doctype, extraFields = []) {
  const scalarFields = [...BASE_FIELDS, ...extraFields];

  function docToRecord(doc) {
    const r = {
      id: doc.name,
      name: doc.assessee_name || "",
      created_at: doc.creation,
      updated_at: doc.modified,
    };
    scalarFields.forEach((f) => {
      r[f] = doc[f];
    });
    JSON_ARRAY_FIELDS.forEach((f) => (r[f] = parseJSON(doc[f], [])));
    JSON_OBJ_FIELDS.forEach((f) => (r[f] = parseJSON(doc[f], {})));
    CHECK_FIELDS.forEach((f) => {
      if (f in r) r[f] = !!r[f];
    });
    return r;
  }

  function recordToDoc(rec) {
    const d = {};
    if (rec.name != null) d.assessee_name = rec.name;
    scalarFields.forEach((f) => {
      if (rec[f] === undefined) return;
      let v = rec[f];
      if (CHECK_FIELDS.includes(f)) v = v ? 1 : 0;
      else if (DATETIME_FIELDS.includes(f)) v = blankToNull(toFrappeDatetime(v));
      else if (DATE_FIELDS.includes(f) || LINK_OR_SELECT.includes(f)) v = blankToNull(v);
      d[f] = v;
    });
    JSON_FIELDS.forEach((f) => {
      if (rec[f] !== undefined) d[f] = JSON.stringify(rec[f]);
    });
    return d;
  }

  const isNew = (id) => !id || String(id).startsWith("c_");

  return {
    async list() {
      const rows = await db.getDocList(doctype, {
        fields: ["*"],
        orderBy: { field: "modified", order: "desc" },
        limit: 0,
      });
      return (rows || []).map(docToRecord);
    },

    async upsert(client) {
      const payload = recordToDoc(client);
      let saved;
      if (isNew(client.id)) {
        saved = await db.createDoc(doctype, payload);
      } else {
        saved = await db.updateDoc(doctype, client.id, payload);
      }
      return docToRecord(saved);
    },

    async remove(id) {
      await db.deleteDoc(doctype, id);
    },

    async bulkInsert(clients) {
      // No bulk endpoint in frappe-js-sdk; insert sequentially.
      for (const c of clients) {
        await db.createDoc(doctype, recordToDoc(c));
      }
    },

    // Live sync: poll-and-refetch. onChange() triggers the app's reload.
    // (Upgrade path: frappe.realtime over socket.io — see README.)
    subscribe(onChange) {
      const iv = setInterval(() => {
        try {
          onChange();
        } catch (e) {
          /* ignore */
        }
      }, 20000);
      return () => clearInterval(iv);
    },
  };
}
