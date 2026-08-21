// T-52, DoD item 11: the glossary carries the rule itself — if a sentence could
// mean two of these, the precise noun has to be used, and bare "test" is allowed
// only where it deliberately means any of them.
//
// What it proves: the glossary is a rule and not only a table. Without the rule,
// the table is four definitions nobody has to follow, and every later persona
// (T-53 to T-61) is written against nothing. It also proves the escape hatch is
// written down: bare "test" is not banned, it is bounded — which is what makes
// the bounded clean-up of DoD item 15 defensible instead of arbitrary.
//
// PINNING STYLE: FLATTENED. Both sentences wrap in the file.
//
// What this case does NOT prove, and cannot: that any given sentence in the
// repository uses the right noun. That is the hole `ADR 0014` names and
// `docs/qa/gaps.md` records (see case-18). Reading this case as "the wording is
// correct" would be exactly the false green the gap warns about.
//
// One-way: the rule stays as long as the glossary does.

import { check, done, flatten, principles, sectionOf } from "./principles.mjs";

const glossary = flatten(sectionOf(principles(), "Words we use"));

check(
  "the glossary states the rule for an ambiguous sentence",
  /If a sentence could mean two of these, the precise noun has to be used/.test(glossary),
  "the rule sentence is gone; the table would then be definitions with no obligation",
);

check(
  "bare \"test\" is bounded, not banned",
  /Bare "test" is allowed only where it deliberately means \*any\* of them/.test(glossary),
  "the boundary for bare \"test\" is gone",
);

check(
  "the glossary names the one place in this file that uses bare \"test\" on purpose",
  /principle 6's heading is such a place/.test(glossary),
  "the exception is claimed but not located, so a reader cannot tell a deliberate bare \"test\" from a missed one",
);

check(
  "the glossary says how far the clean-up went (DoD 15's reason, written where a reader meets it)",
  /How far the clean-up went/.test(glossary) && /the clean-up follows the new roles/.test(glossary),
  "the bounded clean-up is not explained, so the mixed wording in this file looks like an oversight",
);

check(
  "the glossary says a reader will meet both kinds of wording",
  /A reader will meet both kinds of wording in the same file/.test(glossary),
  "the honest admission is gone (PRD v3 清理的边界, ADR 0014 代价)",
);

done();
