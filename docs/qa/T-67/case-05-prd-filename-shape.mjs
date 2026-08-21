// T-67, DoD item 4 (the PRD's M1 DoD item 11): the A7 filename SHAPE holds at
// both ends — the shape `roles/pm.md` teaches carries a date AND a job slug, and
// every real file in `docs/design/` is named that way.
//
// WHY THIS CASE EXISTS — IT CLOSES A HOLE THAT WAS REPORTED, NOT GUESSED.
// When `docs/qa/T-60/case-09` was moved off the two fixed paths and onto a
// pattern, the QA that moved it said out loud what the move gave up: "the A7
// filename shape (`prd-<date>-<job-slug>.md`) is guarded by nobody in this
// repository today". `case-09` asks `^prd-.+\.md$` — by design, because its
// subject is whether a PRD and an HLD EXIST at all. A file called
// `prd-x.md`, or `prd-2026-8-21-apply-req.md` with an unpadded month, passes it.
// This case is the other half.
//
// THE DIVISION OF LABOUR, IN ONE LINE: `T-60/case-09` asks whether the documents
// ARE THERE (by pattern, with a byte floor so a one-line tombstone cannot pass);
// this case asks whether they are NAMED RIGHT (the exact shape, in the prompt and
// on disk). Neither one is complete without the other, and neither one may be
// rewritten into the other: a case-09 that judged the name would stop being a
// premise check, and a case-05 that judged existence would go red for the wrong
// reason on a checkout mid-rename.
//
// WHY THE SHAPE NEEDS BOTH SEGMENTS, AND WHY A DATE ALONE IS THE FAILURE MODE.
// The user refused a date-only name in the opening interview (`CRD 0023`
// decision two) for a reason this repository can point at: the previous job's PRD
// and this job's PRD are BOTH dated 2026-08-21, so a date-only name would have
// had the second job overwrite the first with nothing going red. That is the same
// loss the fixed name `docs/design/prd.md` nearly caused. So "a date is in the
// name" is not the requirement — "a date AND the job's own slug" is, and a slide
// back to either weaker shape has to be red.
//
// HOW THE ANCHOR IS READ, AND WHY IT IS NOT COPIED FROM THE DoD.
// `docs/qa/gaps.md` item 27: an anchor string quoted in a DoD cell is the
// RENDERED shape, not what the source file holds. This cell is exactly that
// trap — the DoD cell writes the two placeholders of the shape in Chinese, the
// language that table is written in, while `roles/pm.md` writes them in English:
// `docs/design/prd-<date>-<job-slug>.md`. A pin that copied the DoD's anchor
// byte for byte could never go red. So the shape is read STRUCTURALLY instead:
// find every `prd-…md` / `hld-…md` written with `<…>` placeholders, then ask what
// those placeholders MEAN — one of them a date, another one the job. That accepts
// a rewording (`<the date>-<job slug>`) and still refuses a missing segment.
//
// AND `docs/qa/gaps.md` item 21: every prose read here is FLATTENED first. The
// shape sits on one line in `roles/pm.md` today (473, 477, 729, 1840), but this
// file wraps at 80 columns and a sentence carrying a long path is exactly the kind
// that moves. The count-it-twice guard at the end of part A prints both counts, so
// a future wrap is visible instead of silent.
//
// WHAT THIS CASE DOES NOT PROVE. It cannot prove the slug in a real filename is
// really that job's name, or that the date is really the day the document was
// opened — both are facts about a job that no file in the repository records in a
// machine-readable way. It proves the SHAPE only.

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { REPO, check, done, flat, pm, step } from "../lib/qa.mjs";

// ------------------------------------------------------------------ part A
// The shape `roles/pm.md` teaches, read inside step 4 — the step that owns it, so
// a shape mentioned anywhere else in a 1900-line prompt cannot answer for it.

const pmText = pm();
const pmFlat = flat(pmText);
const stepFourFlat = flat(step(pmText, 4));

/**
 * Every `prd-…md` / `hld-…md` written as a SHAPE, with at least one `<…>`
 * placeholder in it. Real filenames (no placeholder) are part B's business.
 */
function shapes(text, prefix) {
  const found = [];
  const pattern = new RegExp(`${prefix}-((?:<[^<>]*>|[A-Za-z0-9._-])+)\\.md`, "g");
  for (const match of text.matchAll(pattern)) {
    const placeholders = [...match[1].matchAll(/<([^<>]*)>/g)].map((one) => one[1]);
    if (placeholders.length > 0) found.push({ text: match[0], placeholders });
  }
  return found;
}

const carriesBoth = (shape) =>
  shape.placeholders.some((one) => /date|day/i.test(one))
  && shape.placeholders.some((one) => /slug|job|name/i.test(one));

for (const [prefix, what] of [["prd", "PRD"], ["hld", "design document"]]) {
  const inStepFour = shapes(stepFourFlat, prefix);
  const good = inStepFour.filter(carriesBoth);
  check(
    `step 4 of roles/pm.md names the ${what} filename shape with BOTH a date segment and a job-slug segment`,
    good.length >= 1,
    inStepFour.length === 0
      ? `step 4 holds no \`${prefix}-<...>.md\` shape at all — A7's naming rule is not taught where it is taught today`
      : `step 4 holds ${inStepFour.length} \`${prefix}-<...>.md\` shape(s), none carrying both segments: `
        + inStepFour.map((shape) => `${JSON.stringify(shape.text)} -> [${shape.placeholders.join(", ")}]`).join(" ; "),
  );
}

// The regression this case was written for: a shape with ONE placeholder is the
// date-only name the user refused, and it is judged over the WHOLE prompt, not
// just step 4 — a second copy of the rule elsewhere in the file (there is one in
// the closing rules today) must not be allowed to teach the weaker shape.
for (const [prefix, what] of [["prd", "PRD"], ["hld", "design document"]]) {
  const oneSegment = shapes(pmFlat, prefix).filter((shape) => shape.placeholders.length === 1);
  check(
    `roles/pm.md nowhere teaches a one-segment ${what} name (a date alone, or a slug alone, collides between two jobs)`,
    oneSegment.length === 0,
    `${oneSegment.length} shape(s) with a single placeholder: `
      + oneSegment.map((shape) => `${JSON.stringify(shape.text)} -> [${shape.placeholders.join(", ")}]`).join(" ; "),
  );
}

// Count it twice (gaps.md item 21). The shape is one token today, so the two
// counts agree; when a future edit wraps it, this prints the difference instead of
// letting a line-based reader of this file believe the shape is gone.
const anchor = shapes(pmFlat, "prd").find(carriesBoth)?.text;
if (anchor) {
  const flatHits = pmFlat.split(anchor).length - 1;
  const lineHits = pmText.split("\n").filter((line) => line.includes(anchor)).length;
  check(
    "count-it-twice: the flattened count of the PRD shape is never lower than the line-based count",
    flatHits >= lineHits,
    `flattened ${flatHits} vs line-based ${lineHits} — a line-based count above the flattened one means the counter is broken`,
  );
  console.log(
    `note  ${JSON.stringify(anchor)} appears ${flatHits} time(s) flattened and ${lineHits} time(s) on a single line`
    + `${flatHits > lineHits ? " — it wraps, so a line-based grep on it would MISS a hit" : ""}`,
  );
}

// ------------------------------------------------------------------ part B
// The real filenames on disk. Read with readdirSync, never a hand-written list:
// a hand-written list is a pin on today's two jobs, and A7's whole point is that
// the next job adds a third and a fourth.

const DESIGN = join(REPO, "docs", "design");
const SHAPE = /^(prd|hld)-\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/;

// `docs/design/tasks.md` keeps its plain name on purpose: it is one table for the
// whole repository, not one per job. It is the only exception, and it is named
// here rather than pattern-matched so that a second plain name cannot slip in
// beside it.
const PLAIN_NAMES = new Set(["tasks.md"]);

// Folders are skipped: `docs/design/api/<caller>-<callee>.md` is a documented
// future folder whose contents A7 says nothing about.
const entries = readdirSync(DESIGN).filter((name) => statSync(join(DESIGN, name)).isFile());
const judged = entries.filter((name) => !PLAIN_NAMES.has(name));

check(
  "this case really had filenames to judge in docs/design/",
  judged.length >= 1,
  `docs/design/ holds ${entries.length} file(s) and none of them is judged here, so every check below would be`
    + ` a vacuous pass. It holds: ${entries.join(", ") || "(nothing)"}`,
);

for (const name of judged) {
  check(
    `docs/design/${name} matches the A7 shape <prd|hld>-YYYY-MM-DD-<job-slug>.md`,
    SHAPE.test(name),
    `docs/design/${name} does not match ${SHAPE}. A7 requires the prefix \`prd-\` or \`hld-\`, a zero-padded`
      + ` YYYY-MM-DD date, then this job's slug in lower-case letters, digits and hyphens. The only file in`
      + ` docs/design/ allowed a plain name is tasks.md.`,
  );
}

// The old fixed names, named on their own so the most likely regression of all
// reports itself in words instead of as "some file does not match a regex". This
// is not what `T-60/case-09` asks: that case asks whether a PRD and an HLD exist,
// and it would stay green with `prd.md` sitting right beside them.
for (const old of ["prd.md", "hld.md"]) {
  check(
    `docs/design/${old} — the fixed name A7 replaced — is not back`,
    !entries.includes(old),
    `docs/design/${old} exists again. A fixed name silently overwrites the previous job's document:`
      + ` that is the loss A7 and CRD 0023 decision two were written to stop.`,
  );
}

console.log(`note  docs/design/ files judged: ${judged.join(", ") || "(none)"}${PLAIN_NAMES.size ? `; plain name allowed: ${[...PLAIN_NAMES].join(", ")}` : ""}`);

done();
