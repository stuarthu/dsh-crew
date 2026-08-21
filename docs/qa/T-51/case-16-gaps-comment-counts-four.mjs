// T-51, DoD item 18: the comment above the `docs/qa/gaps.md` count pin says FOUR
// copies and gives each copy its own job.
//
// What it proves: the comment no longer contradicts the file it describes. It
// used to say `docs/qa/gaps.md` appears THREE times in roles/pm.md while the file
// held four — and the pin's threshold is `< 3`, so deleting one copy is green.
// That is exactly the stale number that talks somebody into "tidying" a copy
// away. The comment is the only thing standing between a reader and that edit,
// and `tools/verify-mount.mjs` belongs to T-51: after handover nobody may fix it.
//
// What this case does NOT assert: that the comment's number equals today's live
// `grep -c` count. roles/pm.md belongs to T-56 and T-62, which may legitimately
// gain or lose a copy, while the comment may not be edited by anyone — an
// equality assertion would create a red that no task is allowed to clear. The
// live number is reported by hand at each milestone review instead (it was 4 on
// 2026-08-21).

import { check, done, repoFile } from "../lib/qa.mjs";

const mount = repoFile("tools/verify-mount.mjs");

// The comment block around the count pin, taken from the sentence that carries
// the number to the failing line itself.
const start = mount.indexOf("appears FOUR times");
check("the comment says `docs/qa/gaps.md` appears FOUR times", start !== -1, "the count in the comment is not four");
check("and it no longer says THREE times", !mount.includes("appears THREE times"), "the old, wrong number is still in the file");

if (start !== -1) {
  const block = mount.slice(start, mount.indexOf("copiesOf(section.text", start));

  // Each of the four copies gets a line saying what work it does. The four jobs,
  // named the way the PM prompt names them.
  const jobs = [
    { what: "step 10's review batching", pin: /step 10/ },
    { what: "step 11 staging the file", pin: /step 11[\s\S]{0,120}STAGES/ },
    { what: "step 18 filling it before a document is dropped", pin: /step 18[\s\S]{0,160}FILLS/ },
    { what: "the Hard rules summary restating the rule", pin: /\*\*Hard rules\*\*/ },
  ];
  for (const job of jobs) {
    check(`the comment says what the copy in ${job.what} is for`, job.pin.test(block), block);
  }

  // Four numbered lines, so the reader can count them against the file.
  for (const number of ["1.", "2.", "3.", "4."]) {
    check(`the comment numbers copy ${number}`, block.includes(`  ${number} `), block);
  }

  // And it says out loud that the threshold below it is a floor, not the count —
  // the sentence that stops the next reader from "fixing" the comment to match
  // the 3.
  check(
    "the comment says the threshold is a floor, not drift",
    /FLOOR|floor/.test(block),
    block,
  );
}

// The floor itself is still the one T-42's case pins, and the failing message
// still carries the substring that case anchors on.
check(
  "the count pin still uses a floor of 3",
  mount.includes('copiesOf(section.text, "docs/qa/gaps.md") < 3'),
  "the threshold moved — docs/qa/T-42/case-14 pins its message, so change both in one commit",
);
check(
  "the failing message still contains `and it needs 3`",
  mount.includes("and it needs 3"),
  "docs/qa/T-42/case-14-closing-migration-step-count.mjs anchors on that substring and would go red",
);

done();
