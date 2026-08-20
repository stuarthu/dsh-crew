// Task T-01 — acceptance check 12.
// Proves roles/pm.md still holds no `{{` (dsh would try to interpolate it and
// the whole prompt assembly would fail) and that line 1 is untouched.
import { pm, check, done } from "../lib/qa.mjs";

const text = pm();

check("roles/pm.md contains no {{", !text.includes("{{"),
  `first at index ${text.indexOf("{{")}`);
check("line 1 is still the original title",
  text.split("\n")[0] === "# Crew role: product manager (PM)", JSON.stringify(text.split("\n")[0]));

done();
