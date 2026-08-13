// ============================================================================
//  Consultants, Staff and app settings — the non-case reference data.
//  Same interface the reference store exposed (listConsultants / listStaff /
//  getSetting / setSetting), backed by Frappe DocTypes.
// ============================================================================
import { db, parseJSON } from "./frappe";

const SETTINGS_DT = "PMS Settings";

export const directory = {
  async listConsultants() {
    const rows = await db.getDocList("Consultant", {
      fields: ["name"],
      orderBy: { field: "name", order: "asc" },
      limit: 0,
    });
    return (rows || []).map((r) => ({ id: r.name, name: r.name }));
  },
  async upsertConsultant(consultant) {
    if (!consultant.id || String(consultant.id).startsWith("cons_")) {
      const saved = await db.createDoc("Consultant", { consultant_name: consultant.name });
      return { id: saved.name, name: saved.name };
    }
    return consultant; // rename handled in Frappe desk if ever needed
  },
  async removeConsultant(id) {
    await db.deleteDoc("Consultant", id);
  },

  async listStaff() {
    const rows = await db.getDocList("Staff", {
      fields: ["name"],
      orderBy: { field: "name", order: "asc" },
      limit: 0,
    });
    return (rows || []).map((r) => ({ id: r.name, name: r.name }));
  },
  async upsertStaff(staff) {
    if (!staff.id || String(staff.id).startsWith("staff_")) {
      const saved = await db.createDoc("Staff", { staff_name: staff.name });
      return { id: saved.name, name: saved.name };
    }
    return staff;
  },
  async removeStaff(id) {
    await db.deleteDoc("Staff", id);
  },

  // Settings live as one JSON map on the PMS Settings single doctype.
  async getSetting(key) {
    try {
      const doc = await db.getDoc(SETTINGS_DT, SETTINGS_DT);
      const map = parseJSON(doc.settings_json, {});
      return key in map ? map[key] : null;
    } catch {
      return null;
    }
  },
  async setSetting(key, value) {
    let map = {};
    try {
      const doc = await db.getDoc(SETTINGS_DT, SETTINGS_DT);
      map = parseJSON(doc.settings_json, {});
    } catch {
      /* first write */
    }
    map[key] = value;
    await db.updateDoc(SETTINGS_DT, SETTINGS_DT, { settings_json: JSON.stringify(map) });
  },
};
