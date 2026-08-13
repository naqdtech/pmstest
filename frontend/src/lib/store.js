// ITR Filing case store — the reference `store` interface, backed by Frappe.
import { makeCaseStore } from "./caseStore";
import { directory } from "./directory";

const cases = makeCaseStore("ITR Filing");

export const store = { ...cases, ...directory };
export default store;
