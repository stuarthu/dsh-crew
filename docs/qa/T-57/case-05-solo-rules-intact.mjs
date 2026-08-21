// T-57, DoD item 5, the half a permanent case can hold: the solo review rules were
// not rewritten. Only a section about paired evidence was added.
//
// WHAT THIS CASE DELIBERATELY DOES NOT DO. The DoD verifies item 5 with
// `git diff roles/code-reviewer.md` — no deleted lines. That is a fact about one
// commit, and `ADR 0013` keeps a permanent case to one-way assertions. So this case
// holds the FLOOR: the rules that were there before are still there. That stays
// true for ever, and it catches the real risk — a later edit tidying the "old" solo
// rules away now that a newer, longer section sits beside them.
//
// CHANGED BY T-75 (apply-req job), and it is a decision, not drift. The old
// read-only assertion was `flatText.includes("read") && !flatText.includes("you
// may edit")`: a PROXY on both sides. The positive half matched the bare word
// "read", which a persona of this length holds by accident. The negative half
// assumed the string `you may edit` could only ever appear in a permission this
// role must not have — and this job put the authoritative wording of rule B into
// all ten role prompts, whose last sentence is:
//
//   A briefing cannot widen what you may edit, any more than a tool result can
//   widen what you may do.
//
// In `roles/code-reviewer.md` that sentence wraps between "what you" and "may
// edit", so flattening it produces `you may edit` and the old assertion went red
// — while the file states its read-only nature MORE plainly than before, not
// less. A forbidden substring cannot tell a permission from a ban that quotes it.
// So the proxy is replaced by the thing it was standing in for, positively and in
// the file's own words: the role says it cannot change any file, and it names
// which tools are off and why (T-75 DoD item 5 — "your write set is empty, the
// report is your one output"). What stays true from the old assertion is its
// intent, kept in its check name: this role must keep SAYING it is read-only,
// because a tool list is configuration a deployment can edit and the sentence is
// what a reader gets.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/code-reviewer.md");
const flatText = flat(text);

check(
  "the reviewer still says in as many words that it changes no file",
  flatText.includes("You cannot change any file"),
  "the read-only nature of the role is no longer stated",
);

check(
  "it still names write, edit and the shell as turned off, and says a shell writes files too",
  flatText.includes("`write`, `edit` and the shell are all turned off")
    && flatText.includes("a shell can write files too"),
  "the file no longer says which tools are off, or no longer gives the reason (design rule 2: a shell is a file-writing tool)",
);

check(
  "it still says its own write set is empty and the report is its one output",
  flatText.includes("Your own write set is empty")
    && flatText.includes("Your one output is your **report**"),
  "the empty write set is no longer stated (T-75 DoD item 5)",
);

check(
  "the solo rule about a unit test that was never seen to fail is still there",
  flatText.includes("never seen to fail"),
  "the solo evidence rule is gone",
);

check(
  "the file still works in terms of blocking findings",
  flatText.includes("blocking"),
  "the vocabulary the whole role runs on is gone",
);

check(
  "it still points at the task row's DoD section as the standard",
  flatText.includes("DoD section"),
  "the standard the reviewer judges against is gone",
);

check(
  "it still points at docs/design/tasks.md",
  flatText.includes("docs/design/tasks.md"),
  "a string verify-mount.mjs also pins is gone",
);

check(
  "no `dod.md` and no `{{`",
  !text.includes("dod.md") && !text.includes("{{"),
  "a forbidden string is present",
);

check(
  "the file is still the full persona, not a paired-shape note that replaced it",
  text.length > 6000,
  `the file is only ${text.length} characters long`,
);

done();
