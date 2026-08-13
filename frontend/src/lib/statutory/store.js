// Statutory Case store — same interface, backed by the Statutory Case DocType.
import { makeCaseStore, STATUTORY_FIELDS } from "../caseStore";
import { directory } from "../directory";

const cases = makeCaseStore("Statutory Case", STATUTORY_FIELDS);

export const store = { ...cases, ...directory };
export default store;
