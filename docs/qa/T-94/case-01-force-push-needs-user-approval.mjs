// T-94 DoD item 1, item 2, item 3 and item 4 (and T-95 DoD item 2 and item 3).
// CRD 0024 decision 1, in the user's own three sentences (2026-08-22):
//   "force push is forbidden on all branches, unless I approve"
//   "I mean unless user approve, not just me"
//   "main is ok if user approve"
// Proves `roles/pm.md` states that rule with all four of its parts -- every
// branch, `main` included, the USER's approval, one approval per push -- and
// that the same passage says out loud that the guard lets the PM through, so
// this wording is the only thing enforcing it.
//
// WHY THIS PASSAGE NEEDS A CASE AT ALL. `host/git-guard.js` returns early for
// the root agent (`if (trustRootAgent && isRootAgent) return next();`), and the
// root agent IS the PM. A child's force push is refused by the guard; the PM's
// is not refused by anything. So for the PM this rule has no runtime enforcer:
// it lives only in the sentences it reads. That is why the fourth thing checked
// here is not part of the rule but part of its honesty -- the passage has to
// admit there is no second line of defence. What no case can check is whether a
// PM that read the sentence actually goes and asks; see `docs/qa/gaps.md`.
//
// ------------------------------------------------------ method, and why it is this
//
// 1. TWO PLACES, FOUND BY CONTENT, NEVER BY LINE NUMBER (ADR 0023 shape 7):
//    the one bullet of `## Hard rules` that talks about a force push, and the
//    paragraphs of step 17 that talk about one. Both are located by what they
//    say, so a reworded opening sentence does not move them, and an anchor that
//    matches nothing is a NAMED failure rather than an empty slice that passes
//    while reading nothing.
//
// 2. STEP 17 IS JUDGED AS THE UNION OF ITS FORCE-PUSH PARAGRAPHS, not paragraph
//    by paragraph. The merge paragraph states the scope and then delegates the
//    detail ("the rule is written out in the push of `main` below"), which is
//    correct writing and would fail a per-paragraph pin -- a false red on a file
//    that is right. The union asks the honest question: does step 17, taken
//    whole, state all four parts?
//
// 3. PHRASE FAMILIES, NOT ONE SENTENCE. Each part is a list of wordings and any
//    one of them satisfies it. A single-sentence pin here would go red the first
//    time somebody rewords the passage legitimately, and `docs/qa/gaps.md` item
//    21 records what happens next: the person meeting the false red deletes the
//    check to get their commit green. The self-test at the bottom rewrites the
//    whole bullet -- new words, new line breaks -- and requires every part to
//    stay green. The price is written down rather than hidden: a family is a
//    proxy. A legitimate reword that uses a wording outside the list is a false
//    red (fix the list in the same commit, never weaken the check), and a reword
//    that keeps a listed wording while changing the meaning is a false green.
//    `docs/qa/gaps.md` item 26 measured that trade for the mention-versus-rule
//    problem and found no string-only middle point; this case takes the strict
//    side and covers the false-red half with a self-test.
//
// 4. COUNTED AS WORDINGS PER PLACE -- how many members of a family appear in
//    that place -- never lines and never occurrences (ADR 0023 shape 8, which
//    this repository met when `grep -c` and `grep -o | wc -l` disagreed and a
//    correct change was read as a reduction). One wording appearing twice is
//    still one wording. Every count is printed in the check name, so the reader
//    gets numbers instead of a promise.
//
// 5. JUDGED FLATTENED AND WITHOUT CASE, THROUGH ONE FUNCTION. This prose wraps at 80 columns and
//    it already wraps INSIDE a pinned wording today: `on` ends one line and
//    `every branch and on `main` alike` opens the next, so a line-by-line scan
//    reads zero on a file that plainly carries it (ADR 0023 shape 1,
//    `docs/qa/gaps.md` item 21). Case is dropped for the same class of reason
//    (`docs/qa/gaps.md` item 30): a wording that opens a sentence is
//    capitalised, and mutant 5 below caught exactly that as a false red before
//    this case was committed. Locating and comparing both go through
//    `partsMissingIn`, so a self-test cannot pass on a sample it flattened
//    itself while the real path has lost its flattening.
//
// 6. NOT THE SAME CHECK AS THE PIN T-94 ADDED TO `tools/verify-mount.mjs`, and
//    the difference is the point of having both:
//      - that pin reads the ASSEMBLED PM prompt (`ctx.sections[0].text`); this
//        case reads the SOURCE file `roles/pm.md`, which is the half a person
//        edits;
//      - that pin asks two things: are the three `main`-only wordings absent,
//        and does at least one of three wide-scope wordings appear per place;
//      - this case asks a different question: are all FOUR parts of the rule
//        stated, plus the no-second-defence sentence. Nothing in that pin can
//        tell the user from a named person, nothing in it looks at "one approval
//        never covers the next", and nothing in it looks at the guard sentence.
//        Nothing here looks at whether the three old wordings disappeared word
//        for word -- that is the pin's job, and
//        `docs/qa/T-66/case-04-no-force-push-permission.mjs`'s job on the
//        source file.
//
// 7. Read-only and repeatable. It reads `roles/pm.md` once, does every mutation
//    on a string in memory, writes no file, uses no network and no git history,
//    and gives the same result run twice.

import { check, done, flat, pm, section, step } from "../lib/qa.mjs";

const text = pm();

// ------------------------------------------------------------- the four parts

/**
 * The rule the user approved, one entry per part. Each `family` is a list of
 * wordings, and a place satisfies the part when it states ANY of them.
 */
const PARTS = [
  {
    id: "1",
    what: "the rule covers every branch, not one",
    family: ["on every branch", "on any branch", "on all branches", "every other branch", "whatever the branch"],
    why: "before T-94 all three copies of this rule named `main` and nothing else, so a force push of a WORK branch was covered by the ordinary push yes and named by no rule at all -- that is the hole CRD 0024 decision 1 closed",
  },
  {
    id: "2",
    what: "`main` is inside that scope, not carved out of it",
    family: ["`main` included", "on `main` alike", "including `main`", "on `main` and on every other branch", "`main` too"],
    why: "the user was asked twice and answered `main is ok if user approve`, so `main` is one branch among all of them -- a rule that says every branch but leaves `main` unnamed reads as the old absolute ban to anyone who remembers it",
  },
  {
    id: "3",
    what: "the approval comes from the USER",
    family: ["the user has approved", "the user's approval", "the user approves", "the user has just approved"],
    why: "the user's second sentence was `I mean unless user approve, not just me`. This prompt ships in an npm package and is read by a PM in somebody else's repository, so the granter has to be `the user`",
  },
  {
    id: "4",
    what: "one approval covers one push and never the next",
    family: ["ask again the next time", "never covers the next", "nothing after it", "one approval never covers"],
    why: "the same shape as a push, a tag and a publish: asked once, granted once, done once. A rule without this half turns the first yes into a standing permission",
  },
];

// Part 3 has a negative half: the granter may be `the user` and never a person.
// A prompt that names a human names the wrong human in every repository but
// this one.
const NAMED_GRANTER = ["stuart", "unless i approve", "my approval", "my own approval", "when i approve"];

// The passage also has to admit there is no second line of defence: the guard
// is named, it is said to let the PM through, and this rule is said to be the
// only thing in the way. All three, or the sentence stops being an admission.
const NO_SECOND_DEFENCE = [
  { what: "names the guard", family: ["the guard"] },
  { what: "says the guard lets the PM's own force push through", family: ["trusts you", "trusts your own session", "straight through", "lets a force push"] },
  { what: "says this rule is the only thing in the way", family: ["nothing but this rule", "nothing else holds you", "the only thing standing in front of it", "this rule is the only"] },
];

// ------------------------------------------------------------- the two places

/** Does this block of prose talk about a force push at all? */
const aboutForce = (block) => block.includes("force push") || block.includes("--force");

/**
 * The places in `roles/pm.md` that carry this rule, each already flattened.
 *
 * Both are found by content. The Hard rules place is the bullet that talks
 * about a force push -- not the bullet in a fixed position, and not the bullet
 * whose first words are known -- and step 17's place is the union of its
 * force-push paragraphs, for the reason in note 2 above.
 *
 * @returns [where, flattened text, how many blocks it was built from][]
 */
function placesIn(someText) {
  const { bullets, paragraphs } = rawPlacesIn(someText);
  return [
    ["the **Hard rules** push bullet", flat(bullets.join("\n")), bullets.length],
    ["step 17's force-push paragraphs", flat(paragraphs.join("\n")), paragraphs.length],
  ];
}

/** The same two places, as the raw blocks they are in the file. */
function rawPlacesIn(someText) {
  return {
    bullets: section(someText, "Hard rules")
      .split(/\n- /)
      .map((bullet, index) => (index === 0 ? bullet : `- ${bullet}`))
      .filter(aboutForce),
    paragraphs: step(someText, 17).split(/\n[ \t]*\n/).filter(aboutForce),
  };
}

/**
 * The wordings of `family` that this already-flattened place states, compared
 * WITHOUT case (`docs/qa/gaps.md` item 30, and mutant 5 below found the first
 * instance of it here): a wording that opens a sentence is capitalised, so
 * `the guard` matched nothing in a legitimate reword that wrote `The guard will
 * not save you here`. That was a false red on a correct file, caught by this
 * case's own self-test before the case was ever committed. Nothing in these
 * families depends on case for its meaning.
 */
const stated = (place, family) => {
  const lower = place.toLowerCase();
  return family.filter((wording) => lower.includes(wording.toLowerCase()));
};

/**
 * Which places fail to state any wording of `family`, and what each place
 * stated. The one function the real checks and every self-test go through, so
 * the flattening cannot be lost from the real path while a self-test keeps
 * passing on a sample it flattened itself.
 */
function partsMissingIn(someText, family) {
  const places = placesIn(someText);
  return {
    silent: places.filter(([, place]) => stated(place, family).length === 0).map(([where]) => where),
    counts: places.map(([where, place]) => `${where}: ${stated(place, family).length}/${family.length}`).join(", "),
  };
}

// --------------------------------------------------- the places were really found

let places;
try {
  places = placesIn(text);
} catch (error) {
  check(
    "the two places that carry the force-push rule are still findable in roles/pm.md",
    false,
    `${error.message}\n      the \`## Hard rules\` heading or step 17 has moved. Fix the anchor in this case in the same commit -- never delete the case: with no place to read, every check below would pass on an empty string`,
  );
  places = [];
  done();
}

check(
  `the **Hard rules** section has exactly one bullet about a force push (${places[0][2]} found)`,
  places[0][2] === 1,
  "no bullet means this case reads an empty string and every check below passes on nothing; two bullets means the rule is written twice in one section, which is the drift that put two different rules in this file before T-94 and let the reader pick",
);
check(
  `step 17 has at least one paragraph about a force push (${places[1][2]} found)`,
  places[1][2] >= 1,
  "step 17 is where the merge and the push of `main` happen, so the rule has to be stated there and not only in the hard rules at the end of the file",
);

// ------------------------------------------------- the four parts of the rule

for (const part of PARTS) {
  const { silent, counts } = partsMissingIn(text, part.family);
  check(
    `part ${part.id}: ${part.what} (${counts})`,
    silent.length === 0,
    `${silent.join(" | ")} state none of ${part.family.map((wording) => `\`${wording}\``).join(", ")}. ${part.why}. Either write the part into roles/pm.md, or -- if this is a legitimate reword -- add the new wording to part ${part.id}'s family in this case in the same commit. Never widen it to make a narrower rule pass`,
  );
}

// The negative half of part 3: the granter is `the user`, never a person.
{
  const named = placesIn(text)
    .map(([where, place]) => [where, NAMED_GRANTER.filter((wording) => place.toLowerCase().includes(wording))])
    .filter(([, hits]) => hits.length);
  check(
    "part 3, the other half: the approval is the user's, and no place names a person instead",
    named.length === 0,
    `${named.map(([where, hits]) => `${where}: ${hits.join(", ")}`).join(" | ")} -- roles/pm.md ships in an npm package, so a name here is the wrong name in every repository but this one`,
  );
}

// ---------------------------------- the passage admits there is no second defence

for (const half of NO_SECOND_DEFENCE) {
  const { silent, counts } = partsMissingIn(text, half.family);
  check(
    `the rule admits it is the only thing enforcing itself: it ${half.what} (${counts})`,
    silent.length === 0,
    `${silent.join(" | ")} state none of ${half.family.map((wording) => `\`${wording}\``).join(", ")}. \`host/git-guard.js\` returns early for the root agent, and the root agent is the PM, so a force push of the PM's is refused by nothing. A rule that hides that reads like a rule something else is enforcing`,
  );
}

// --------------------------------------------------------------- self-tests
//
// A check is only a check if the thing it guards can turn it red. Every mutant
// here is a string in memory: nothing is written and the repository is never
// touched. Each one asserts a DELTA against the real file rather than an
// absolute count, because the file may legitimately gain another wording
// tomorrow and a self-test written with absolutes would go red on a correct
// file -- the false red one level up (`docs/qa/gaps.md` item 21).
//
// AND EVERY MUTANT IS ANCHORED ON THE FAMILY, NOT ON TODAY'S SENTENCE. This is
// the correction this section earned rather than a precaution. Written the
// obvious way, each mutant quoted the current sentence and edited it; a run of
// this case against a legitimately REWORDED `roles/pm.md` then turned all five
// self-tests red at once, because their anchors were exactly the sentences the
// reword had changed -- five false reds on a file that was correct, in the one
// case whose whole point is not to produce that. So a mutant now says "remove
// the thing this part is about, wherever and however it is written": it looks
// up the wordings really in the file and scrubs those. Rewording the passage
// moves nothing here, and a mutant that matches nothing throws by name instead
// of quietly reporting a pass for a check it never exercised.

/**
 * A regex matching `wording` in the RAW file even where the line wraps, and
 * whatever the case. Every regex metacharacter is escaped first, so a wording
 * carrying a `.` or a `(` cannot be read as a pattern (ADR 0023 shape 6), and
 * only then is each run of spaces opened up to any whitespace.
 */
const loose = (wording) => new RegExp(wording.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"), "gi");

/**
 * Replace every wording of `family` inside one raw block with `to`.
 * @throws when the block states none of them, so no mutant can be a no-op
 */
function scrub(block, family, to) {
  let scrubbed = block;
  for (const wording of family) scrubbed = scrubbed.replace(loose(wording), to);
  if (scrubbed === block) {
    throw new Error(`none of ${JSON.stringify(family)} is in this block, so there is nothing to scrub -- the real check above is the one that should have said so`);
  }
  return scrubbed;
}

/**
 * Rewrite the Hard rules force-push bullet through `change` and hand back the
 * whole file. Located by content, so a reworded bullet is still found.
 * @throws when the bullet is missing or `change` altered nothing
 */
function inHardRules(someText, change) {
  const [bullet] = rawPlacesIn(someText).bullets;
  if (bullet === undefined) throw new Error("the Hard rules state no force-push bullet at all, so there is nothing to mutate");
  const at = someText.indexOf(bullet);
  if (at === -1) throw new Error("the Hard rules bullet could not be found again in the raw file");
  const changed = change(bullet);
  if (changed === bullet) throw new Error("this mutation changed nothing, so it would report a pass for a check it never exercised");
  return someText.slice(0, at) + changed + someText.slice(at + bullet.length);
}

/**
 * Run one self-test, turning a moved anchor into a named failure instead of a
 * crash. The helpers above throw on purpose -- an edit that matched nothing
 * would leave the mutant identical to the file -- but a throw that escapes ends
 * the run, so the checks after it never report and the totals never print.
 */
function selfTest(what, body) {
  try {
    body();
  } catch (error) {
    check(what, false, `${error.message}\n      this self-test could not build its mutant: read roles/pm.md and fix it in the same commit -- never delete the self-test`);
  }
}

const HARD_RULES = "the **Hard rules** push bullet";

/** Which places are silent about `family` in this mutant that were not silent in the file. */
const newlySilent = (mutant, family) => {
  const before = partsMissingIn(text, family).silent;
  return partsMissingIn(mutant, family).silent.filter((where) => !before.includes(where));
};

selfTest("mutant 1: scoping the hard rules back to `main` alone is caught", () => {
  // Whatever words the bullet uses for "every branch" and for "`main` too",
  // they become plain "on `main`" -- which is the pre-T-94 rule.
  const mutant = inHardRules(text, (bullet) => scrub(scrub(bullet, PARTS[0].family, "on `main`"), PARTS[1].family, "on `main`"));
  for (const part of PARTS.slice(0, 2)) {
    const lost = newlySilent(mutant, part.family);
    check(
      `mutant 1: narrowing the rule back to \`main\` alone turns part ${part.id} red (${lost.join(", ") || "nothing"})`,
      lost.includes(HARD_RULES),
      `part ${part.id} stayed green on a bullet that scopes the rule to \`main\` alone -- the family matched something outside the rule, or the flattening is reading text this place should not contain`,
    );
  }
});

selfTest("mutant 2: turning one approval into a standing permission is caught", () => {
  const mutant = inHardRules(text, (bullet) => scrub(bullet, PARTS[3].family, "for good"));
  const lost = newlySilent(mutant, PARTS[3].family);
  check(
    `mutant 2: an approval that covers every later force push turns part 4 red (${lost.join(", ") || "nothing"})`,
    lost.includes(HARD_RULES),
    "part 4 stayed green on a bullet that turns the first approval into a standing permission, which is the one reading CRD 0024 decision 1 rules out",
  );
});

selfTest("mutant 3: naming a person instead of the user is caught", () => {
  // Anchored on `the user`, which every wording of part 3 has to contain.
  const mutant = inHardRules(text, (bullet) => bullet.replace(loose("the user"), "Stuart"));
  const lost = newlySilent(mutant, PARTS[2].family);
  const named = placesIn(mutant).filter(([, place]) => NAMED_GRANTER.some((wording) => place.toLowerCase().includes(wording)));
  check(
    `mutant 3: a named person instead of the user turns part 3 red (${lost.join(", ") || "nothing"}) and is named as a person (${named.length} place(s))`,
    lost.includes(HARD_RULES) && named.length === 1,
    "the prompt ships in an npm package and is read in other people's repositories, so both halves of part 3 have to catch this: the user wording is gone, and a person is named",
  );
});

selfTest("mutant 4: dropping the guard admission is caught", () => {
  const mutant = inHardRules(text, (bullet) => NO_SECOND_DEFENCE.reduce((so_far, half) => {
    try {
      return scrub(so_far, half.family, "anyway");
    } catch {
      return so_far; // this half is not in the bullet; the real check above says so
    }
  }, bullet));
  const lost = NO_SECOND_DEFENCE.map((half) => newlySilent(mutant, half.family)).filter((silent) => silent.includes(HARD_RULES));
  check(
    `mutant 4: deleting the guard admission turns it red (${lost.length} of ${NO_SECOND_DEFENCE.length} half/halves)`,
    lost.length >= 1,
    "with the guard sentence gone the bullet reads like a rule something else enforces, and `host/git-guard.js` enforces nothing here: it returns early for the root agent, which is the PM",
  );
});

selfTest("mutant 5: a legitimate reword of the whole bullet stays green", () => {
  // The same rule in different words, folded in different places. This is the
  // false red this case exists to avoid: a person rewriting the passage in good
  // faith must not have to fight the check, or they will delete it. It is also
  // where the case-insensitive comparison was found -- this reword opens a
  // sentence with `The guard`, and the first version of `stated` compared with
  // case and reported the rule as missing.
  const REWORD = `- Ask the user before every push — including a re-push after a fix — and
  before publishing a package. Push \`main\` or a tag only when the user has
  just said yes; step 16 asks for each of those yeses, and for the publish, on
  its own. The ask is the rule. A force push takes a yes of its very own, on
  all branches and including \`main\`: run \`git push --force\` or
  \`--force-with-lease\` only after the user approves that exact command for
  that exact push (step 17), and ask again the next time. The guard will not
  save you here — it trusts your own session and lets a force push of yours
  straight through, so nothing but this rule stops you. Children stay guarded,
  and a child's push still needs the user's own approval file.`;
  const mutant = inHardRules(text, () => REWORD);
  const everyCheck = [...PARTS.map((part) => [`part ${part.id}`, part.family]), ...NO_SECOND_DEFENCE.map((half) => [half.what, half.family])];
  const broken = everyCheck.filter(([, family]) => newlySilent(mutant, family).length).map(([name]) => name);
  check(
    `mutant 5: a reworded, re-wrapped bullet keeps all ${everyCheck.length} check(s) green (${broken.join(", ") || "none broken"})`,
    broken.length === 0,
    `${broken.join(", ")} went red on a bullet that says the same rule in other words. That is a false red, and the next person meeting it deletes this case to get their commit green: widen the family in the same commit instead`,
  );
});

selfTest("mutant 6: the flattening is doing the work, not luck", () => {
  // A sample that folds INSIDE the wordings, the way this prose folds today:
  // `on` already ends a line and `every branch and on \`main\` alike` opens the
  // next one in the real file. Two halves, and each one can be false. Take
  // `flat` out of `partsMissingIn` and the first half goes red; edit the sample
  // so nothing folds inside a wording and only the second half notices.
  const FOLDED = [
    "- A force push takes a yes of its own, on",
    "  every branch and on `main` alike: run `git push --force` only when",
    "  the user has approved that one command for that one push, and ask",
    "  again the next time. Whatever the guard allows, it trusts you and",
    "  lets a force push of yours straight through, so nothing but this",
    "  rule stops you.",
  ].join("\n");
  const families = [...PARTS.map((part) => part.family), ...NO_SECOND_DEFENCE.map((half) => half.family)];
  const flatFound = families.filter((family) => stated(flat(FOLDED), family).length > 0).length;
  const perLineFound = families.filter((family) => FOLDED.split("\n").some((line) => stated(line, family).length > 0)).length;
  check(
    `mutant 6: a folded sample states all ${families.length} families when flattened, and fewer line by line (flat ${flatFound}, per line ${perLineFound})`,
    flatFound === families.length && perLineFound < families.length,
    flatFound === families.length
      ? "the sample no longer folds inside any wording, so it stopped testing the folding this passage really does at 80 columns -- refold it rather than dropping this self-test"
      : "the flattening was lost from `partsMissingIn`: a wording that wraps across two lines now reads as absent, and this file wraps inside a pinned wording today",
  );
});

done();
