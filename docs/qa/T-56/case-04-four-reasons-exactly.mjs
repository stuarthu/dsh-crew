// T-56, DoD item 4: the reasons to recommend the paired shape are a numbered list
// of EXACTLY FOUR. The DoD says it in as many words: "恰好 4 条，不许有第 5 条".
//
// What it proves: the list stays closed. An open list of reasons to use an
// expensive shape grows, and each new reason looks locally sensible; four reasons
// with a stated "there is no fifth" makes anyone adding a fifth argue for it.
// `CRD 0012` item 13 fixed the four: a DoD section that cannot be worded sharply, a
// row on a module boundary contract, a mistake costing money or permissions or
// data, and an earlier defect in that part of the code.
//
// PINNING STYLE: LINE-BASED for counting the numbered items (a list marker cannot
// wrap), FLATTENED for the sentences.
//
// TWO-WAY, and deliberately so: this is a count the document itself fixes at four
// and says has no fifth. That is not the forbidden "true today, false tomorrow"
// shape of `ADR 0013` — it is a property the document asserts about itself for ever.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const four = step(pm(), 4);
const flatFour = flat(four);

check(
  "step 4 says a recommendation rests on one of four reasons, and there is no fifth",
  flatFour.includes("rests on one of four reasons, and there is no fifth"),
  "the closing sentence is missing, so the list reads as open",
);

// The numbered items of that list. They are indented inside step 4, which is what
// separates them from the prompt's own top-level numbered steps.
const start = four.indexOf("rests on one of four reasons");
const after = four.slice(start);
const end = after.search(/\n\s*\*\*One hard limit/);
const listText = end === -1 ? after : after.slice(0, end);
const items = [...listText.matchAll(/^ {3}(\d+)\. /gm)].map((hit) => Number(hit[1]));

check(
  "the list really has four numbered items",
  items.length === 4,
  `found ${items.length}: ${items.join(", ")} — the DoD requires exactly four, with no fifth`,
);

check(
  "they are numbered 1 to 4",
  items.join(",") === "1,2,3,4",
  `numbering is ${items.join(", ")}`,
);

const flatList = flat(listText);

check(
  "reason 1: the DoD section cannot be worded sharply",
  flatList.includes("you cannot word that row's **DoD section** sharply"),
  "the first reason is missing or reworded",
);

check(
  "reason 2: the row sits on a module boundary contract",
  flatList.includes("sits on a module boundary contract"),
  "the second reason is missing",
);

check(
  "reason 3: getting it wrong costs money, permissions or data",
  flatList.includes("costs money, permissions, or data"),
  "the third reason is missing",
);

check(
  "reason 4: an earlier task in that part of the code produced a defect",
  flatList.includes("produced a defect"),
  "the fourth reason is missing",
);

check(
  "a row matching none of the four is solo, and nothing more is written about it",
  flatFour.includes("A row that matches none of the four is `solo`"),
  "the default for a row matching nothing is not stated",
);

done();
