// T-62, DoD item 8: the small-work road has NO paired shape, said inside T-62's
// own passage.
//
// SCOPE, and this is the point of the case. `grep -c 'pair shape' roles/pm.md`
// was already non-zero before T-62 started, because T-56 wrote the same fact into
// step 4 where the PM writes a small job's task table. The DoD cell says so and
// tells the engineer to write its own sentence in step 9's flow. So this case
// counts inside the paired flow ONLY — a whole-file count would pass on T-56's
// work and prove nothing about T-62's.
//
// PINNING STYLE: FLATTENED sentences, sliced to the paired flow.

import { check, done, flat, pairedFlow, pm } from "./paired.mjs";

const flow = flat(pairedFlow());

check(
  "the paired flow itself says small work has no pair shape",
  flow.includes("Small work has no pair shape at all"),
  "step 9's flow does not rule the paired shape out for small work",
);

check(
  "it gives the reason: the shape needs an architect to pin the interface first",
  flow.includes("lives only in a job that has an architect")
    && flow.includes("five interface decisions"),
  "the reason the shape needs an architect is missing",
);

check(
  "it says the design step is skipped on small work and every row is solo",
  flow.includes("is skipped") && flow.includes("`solo`"),
  "the passage does not connect skipping the design step to every row being solo",
);

check(
  "it says none of the eight steps ever runs on small work",
  flow.includes("none of these eight steps ever runs"),
  "the passage does not close the road explicitly",
);

// The guard on this case's own premise: the slice must be a slice. If it ever
// became the whole file, the checks above could be satisfied by T-56's passage.
check(
  "the slice this case counted is a slice, not the whole file",
  pairedFlow().length < pm().length / 2,
  `the slice is ${pairedFlow().length} characters of a ${pm().length}-character file`,
);

done();
