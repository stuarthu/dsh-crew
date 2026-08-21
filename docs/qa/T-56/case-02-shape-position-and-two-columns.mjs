// T-56, DoD item 1, the position half: the shape bullet sits directly AFTER the
// milestone bullet and BEFORE the list of files the task owns.
//
// What it proves: the order is not cosmetic, and the file says why — the shape
// decides what the file list looks like. A reader who meets the file list first has
// already read one list before learning it should have been two. `roles/architect.md`
// pins the same order for the role that actually writes the table, so the two
// prompts agree; this case holds the PM's copy.
//
// PINNING STYLE: FLATTENED, sliced to step 4.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const flatFour = flat(step(pm(), 4));

check(
  "the shape bullet is placed directly after the milestone bullet",
  flatFour.includes("directly after the milestone bullet"),
  "the position relative to the milestone bullet is not stated",
);

check(
  "and before the list of files the task owns",
  flatFour.includes("before the list of files the task owns"),
  "the position relative to the file list is not stated",
);

check(
  "the order is called deliberate, with its reason",
  flatFour.includes("that order is deliberate")
    && flatFour.includes("the shape decides what the file list looks like"),
  "the reason for the order is missing, so a later edit will treat it as arbitrary",
);

check(
  "the field name follows the job's language, like the rest of that file",
  flatFour.includes("The field name follows the job's language"),
  "nothing says what happens to the field name in a non-English task table",
);

done();
