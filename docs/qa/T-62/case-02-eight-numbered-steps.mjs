// T-62, DoD item 1: the paired execution order is a numbered list of EIGHT
// steps, each one its own item.
//
// What it proves: a reader can count what they missed. The DoD cell spells out
// why this is not decoration — "不许写成一句话里的一串箭头，那种句子读的人数不清
// 自己漏了哪一步" — and the passage itself repeats the reason. Eight items that
// have collapsed into a paragraph of arrows is the failure this case exists for.
//
// PINNING STYLE: LINE-BASED. A numbered-item marker (`   1. **`) cannot wrap, and
// the three-space indent is what separates the flow's items from step 9's own
// siblings at zero indent ("10. **Check the finished task").
//
// One-way: the count is asserted as "at least eight, and the numbering starts at
// 1 and has no gaps". A ninth step is a legitimate future addition; seven is the
// shape falling apart. Per `ADR 0013` this case never says "and it must never
// grow" — it says the eight that CRD 0013 and CRD 0012 require are all there.

import { check, done, flat, flowItems, pairedFlow } from "./paired.mjs";

const items = flowItems();

check(
  "the paired flow is a numbered list of at least 8 items",
  items.length >= 8,
  `found ${items.length} numbered item(s): ${items.map((item) => item.number).join(", ")}`,
);

check(
  "the numbering runs 1, 2, 3 … with no gap and no repeat",
  items.slice(0, 8).every((item, index) => item.number === index + 1),
  `numbering is ${items.map((item) => item.number).join(", ")}`,
);

check(
  "the passage says out loud that the eight steps are reported one at a time",
  flat(pairedFlow()).includes("report them one at a time"),
  "the rule against stringing the steps into one sentence is missing",
);

check(
  "every one of the eight items has real content, not just a title",
  items.slice(0, 8).every((item) => item.text.length > 200),
  `shortest item is ${Math.min(...items.slice(0, 8).map((item) => item.text.length))} characters`,
);

done();
