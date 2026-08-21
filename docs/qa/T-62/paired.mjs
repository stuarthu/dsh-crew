// Shared helpers for the T-62 cases. This file is NOT a case: the runners only
// execute files named `case-*.mjs`.
//
// Everything here is read-only against the repository.
//
// WHY THIS FILE EXISTS — the scope trap that this whole folder is about.
// T-62 wrote its eight-step flow INSIDE step 9 of `roles/pm.md`, a file of about
// 1465 lines that T-56 had already added a paired-shape passage to in step 4. So
// a whole-file `grep -c` is the wrong instrument here twice over:
//
//   * `grep -c 'unit test' roles/pm.md` was already 4 after T-56 landed, so a
//     whole-file count for T-62's step ④ is true whatever T-62 did — the task
//     table says so in its own words ("自动为真、证明不了你干了活");
//   * `grep -c 'pair shape' roles/pm.md` was already non-zero from T-56 for the
//     same reason.
//
// Every helper here therefore hands back a SLICE, never the whole file, and each
// case says which slice it stands on.
//
// WRAPPING. `roles/pm.md` is prose wrapped at about 80 columns, so nearly every
// sentence in it spans two or three lines, and one of the sentences these cases
// pin wraps mid-phrase in the real file ("the\n   single working directory").
// A line-based pin on a sentence reports "not there" for a sentence that IS
// there — the trap that bit this job eight times. So:
//
//   * FLATTENED (`flat` from the shared lib) for anything that is a sentence;
//   * LINE-BASED only for what cannot wrap: a numbered-item marker, a fenced
//     command, a `## ` heading.

import { flat, pm, repoFile, step } from "../lib/qa.mjs";

export { check, done, flat, pm, repoFile, step } from "../lib/qa.mjs";

/** Step 9 of the PM prompt — "Run the tasks, one milestone at a time". */
export const stepNine = () => step(pm(), 9);

/**
 * The paired-shape flow inside step 9: from the sentence that opens it to the
 * end of step 9. This is the ~157 lines T-62 wrote and that nothing in
 * `npm test` looks at.
 *
 * @throws when the opening sentence is not there — a case must die loudly on a
 * moved file instead of quietly passing on an empty slice.
 */
export function pairedFlow() {
  const nine = stepNine();
  const start = flat(nine).indexOf(OPENING);
  if (start === -1) {
    throw new Error(`step 9 of roles/pm.md no longer contains ${JSON.stringify(OPENING)} — the paired flow is gone or was reworded`);
  }
  // Slice the UNFLATTENED text, so the line-based helpers below still work: find
  // the opening sentence's first word in the raw text instead.
  const raw = nine.indexOf("A paired task is two engineers");
  return nine.slice(raw);
}

/** The sentence that says the flow is there at all. */
export const OPENING = "A paired task is two engineers, and running it is eight steps.";

/**
 * The numbered items of the flow, as raw text blocks. They are indented by three
 * spaces inside step 9, which is what tells them apart from step 9's own
 * siblings ("10. **Check the finished task") at zero indent.
 */
export function flowItems() {
  const text = pairedFlow();
  const marker = /^ {3}(\d+)\. \*\*/gm;
  const starts = [];
  for (let hit = marker.exec(text); hit !== null; hit = marker.exec(text)) {
    starts.push({ number: Number(hit[1]), at: hit.index });
  }
  return starts.map((item, index) => ({
    number: item.number,
    text: text.slice(item.at, index + 1 < starts.length ? starts[index + 1].at : undefined),
  }));
}

/** One numbered item of the flow, by its number. @throws when it is not there */
export function flowItem(number) {
  const found = flowItems().find((item) => item.number === number);
  if (!found) throw new Error(`the paired flow in step 9 has no item ${number}`);
  return found.text;
}
