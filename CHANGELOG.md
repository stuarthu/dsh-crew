# Changelog

What changed in each released version of `dsh-crew`, newest first. The top
section is marked `unreleased`: it is the next version, written as the work
lands, and it has no date until the release goes out.

Every version bump rewrites `$DSH_HOME/.agent-presets/crew`. Files you edited
there are kept as `<name>.bak` and named in the boot log, but your settings do
**not** come back on their own. Copy them into the new file after an upgrade.

## 0.8.0 — 2026-08-21

### Changed

- **An empty `roleAllow` or `roleDeny` now stops dsh from starting, and it used
  to hand that role every tool.** Both settings live in the `dsh-crew-roles`
  config in the crew preset — `preset/crew/agent.cordis.yml` in the repository,
  and the copy of it under `$DSH_HOME/.agent-presets/crew` if that is the one
  you edited. A filter you write there has to name at least one tool, and it has
  to be a list. Write `[]`, `""`, `0`, `false`, `{}`, or a value that is not a
  list at all (`roleDeny: engineer: read` instead of
  `roleDeny: engineer: ['read']`), and dsh-crew now refuses to start, with a
  message naming the field, the role key, and what to write instead. Earlier
  versions failed on those two groups differently, and only one of them failed
  quietly. An **empty** value was dropped without a word, and where it was the
  only filter that role had, the child started with **no tool filter at all** —
  every tool this preset registers, `bash`, `write` and `edit` included. A value
  that was **not a list** was passed on as the filter as it stood, so the role
  failed tool-subagent's own config schema on every start: wrong, but loudly. On a read-only reviewer that undid the read-only rule,
  which this repository learned the hard way twice: with only `write` and `edit`
  denied, a reviewer wrote a file with `echo hello > file`, and with the shell
  denied as well its own tool list still held `workflow`, `ralph` and
  desktop-control tools. Nothing in the boot log said any of it had happened.

  **What to do before you upgrade:** read your own `roleAllow` and `roleDeny`
  lines. If one of them holds an empty value, dsh will not start until you write
  out the tool names you want, or delete the line. **Leaving the line out, or
  setting it to nothing at all — a bare `~` in YAML — is still the right way to
  say "use the shipped list", and that is unchanged.** This was never a way
  around the config: anybody who can edit that file could always widen a role by
  naming the tools. The harm was that an empty value looked like the opposite of
  what it did.
- **If you wrote the crew tool names out by hand in your own `roleDeny`, there
  are two more of them now.** Every role whose shipped filter is a deny list
  gets that list from the full set of crew role tool names, so it grew from
  seven names to nine along with the two new roles below. A hand-written
  seven-name list is two names short: add `crew_test_engineer` and
  `crew_code_engineer`. The same note applies as to the `roleDeny` example
  corrected in `0.7.0` below: this is not a hole in the crew's safety, because
  `maxDepth: 1` still stops a role from starting a role whatever the filter
  says, but your deny list is again not what you think it is.

### Added

- **A task can now be built by two engineers who never meet, and there are two
  new roles for it: `crew_test_engineer` and `crew_code_engineer`.** The PM can
  start nine crew roles now instead of seven. In the **paired shape** one of
  those two engineers writes only the unit test files and the other writes only
  the product code. The PM opens **a git worktree for each of them** with
  `git worktree add` — two real directories, on two branches grown from the same
  base point — so the unit test file is not something the code half "should not
  read": it is not in that half's directory at all. The two never talk to each
  other either. A sibling agent is not a child, and dsh refuses to deliver the
  message even if a role holds the tool for it. Then the PM merges the two
  halves and runs those unit tests **exactly once**, and reports what came out,
  green or red, before anything is changed. A red sends each half back to check
  its own half once; whatever is still inconsistent after that is the
  **disagreement**, and it goes to the PM, and on to you when both readings are
  defensible and the document really does allow both. The half that wrote the
  unit tests may never weaken an assertion to make a disagreement go away: only
  the PM may approve a change to one, and that change has to trace back to the
  words of the task's DoD section.

  **What it is for.** Two independent readings of one document. Where the two
  halves do not fit, the document allowed two readings, and the crew learns that
  at the merge instead of learning it in production. This is independent
  verification, the kind safety-critical engineering uses. It is the opposite of
  two people at one keyboard talking until they agree: those two are meant to
  converge, and these two are meant not to.

  **What a green first meeting does not prove.** When that single run comes out
  all green it says exactly one thing: **the two readings matched**. It does
  **not** say the document was clear, and no report may claim that it does. Two
  readers can take the same wrong meaning out of one weak sentence — and then
  the two halves fit, everything is green, and nothing is reported at all.
  `crew_qa`, which comes afterwards and writes its own cases from the document
  before it reads the code, is the crew's net for that kind, and it is
  unchanged. So is the code review.

  **Where the paired shape is allowed, and where it is not.** It exists **only
  in a job that has an architect**. Before either engineer writes a line, both
  have to land on the same five things — the import path, the exported name, the
  signature, the shape of the return value, and what happens on an error — and
  they cannot see each other, so any one of the five landing differently makes
  the merged run red for a reason nobody learns anything from: a clash of names,
  not a disagreement. The architect settles those five in an **interface ADR**,
  so the shape rides on a design step that already exists. On small work, where
  the PM writes the task table itself and starts no architect, there is **no
  paired shape at all** and every row is `solo`. One more limit: a task whose
  unit tests and whose product code have to change the same file cannot be
  paired, because the two halves own two file lists and those may not overlap.

  **The solo shape is still the default, and not one word of it changed.** One
  `crew_engineer` writes the failing unit test and then the code that passes it,
  exactly as before. Which rows are paired is written in the task's own row in
  `docs/design/tasks.md`, as a shape bullet whose value is `solo` or `pair`,
  proposed by the architect when it writes that table; a `pair` row also names
  its interface ADR. Reckon roughly 35% to 75% more effort on a paired task than
  on the same task done solo — an estimate with a reason behind it and not a
  measurement, because the writing is split in two while the reading of the
  document is done twice. Wall time can come out shorter, because the two halves
  are written at the same time.
- **`principles.md` now carries principle 21 — the paired shape, with its
  evidence and its limits — and principle 6 says the test-first rule covers both
  shapes.** That file also gained a **Words we use** table, because three roles
  now write something that checks the product, so the bare word "test" had come
  to mean three different things. The table gives four precise names to use
  instead: a **unit test** (one behaviour, written before the code that
  satisfies it, living in the project's own test suite), a **case** (one DoD
  item, checked the way you would see it, only under `docs/qa/<task-id>/`),
  **the project's test command** (here `npm test`, which runs all of it
  together), and a **contract test** (one on each side of a module boundary).
  The name that invites the most confusion is spelled out there:
  `crew_test_engineer` is a programmer, not a tester. `principles.md` lives in
  the repository and is **not** part of the npm package, so you have it if you
  cloned the repository and not if you installed the plugin.

## 0.7.0 — 2026-08-21

### Added

- **QA's test cases are files you keep.** QA still writes its plan from the
  document before it reads the code, but now every case becomes a real test file
  in your project's own test framework, under `docs/qa/<task-id>/`, with a
  `run.sh` beside it. They are committed with the task, so they outlive the job.
- **One command runs every QA case ever written.** Run
  `bash docs/qa/run-all.sh`. It finds each task's `run.sh` by itself and
  runs them all. QA runs it on every task it checks, so a case from an earlier
  task guards the new work. A case that used to pass and now fails is a blocking
  regression, and nobody may edit it green — it goes back to the engineer that
  owns those files.
- **The language and stack are settled before anything is designed, and you
  approve them.** If your repository already has a stack, that is the stack: the PM
  reads the manifest, the lock file, the test folder and the CI workflow, states
  what it found, and you confirm it in one line. When the choice is real — an empty
  repository, a new service — the PM starts a `crew_researcher` first, which lists
  the candidates with a source per claim, what the machine already has, and what
  each one costs, and is **not** allowed to recommend one. The PM then recommends
  one, names the runner-up and why not, and writes a **Language and stack** section
  into `docs/design/prd.md`, the one opening document of both lanes: language and
  version, package manager, framework, database, and the test framework with its
  exact test command. You confirm it together with the document. After that it
  moves only through a CRD.
- **One test framework for the whole crew.** Engineers write their tests with the
  framework that section names, and QA writes its cases with the same one, so the
  tests cannot split in two on an empty repository.
- **Adding a dependency is the PM's call.** An engineer still picks freely among
  the libraries the project already has, but a brand-new package comes back to the
  PM, which says yes or no and writes it into the stack section. Engineers may not
  edit the manifest or the lock file to slip one in.
- **A release plan and an upgrade plan for every milestone you ship.** At the
  milestone review the PM now asks one question with four answers: ship this
  milestone, go on without shipping, change something, or stop. If you ship, it
  writes `docs/release/<milestone>-release.md` (the version and the rule
  behind it, the release notes, the exact steps and who approves each one, what
  must be true before starting, how it is checked afterwards, and how to undo it —
  or the plain words that it cannot be undone) and
  `docs/release/<milestone>-upgrade.md` (who upgrades from what, every
  breaking change and what the user must do, migration steps and whether they are
  safe to run twice, skipping a version, going back and what data is lost, how
  long it takes, what goes offline).
- **The shape of those plans is looked up, not guessed.** They differ a lot by
  project type — a published npm version cannot be pulled back, a mobile app waits
  for a store review, a web service rolls back by redeploying, a database schema
  needs a migration that is safe to run twice. So the PM starts a
  `crew_researcher` for what the two plans contain for *your* project type, with a
  source and a date per claim, and reads what your repository already does first:
  the workflows, the changelog, the tags, any release script.
- **A milestone you are not shipping gets no plan** — it gets a **shipping gap
  list** at `docs/release/<milestone>-gaps.md`: one honest paragraph naming what
  is still missing before it could ship (a version scheme, release notes, an
  untested rollback, a missing token, an unwritten migration). The next milestone
  shortens that same file, so the first real release is not a surprise. The name
  keeps it apart from `docs/qa/gaps.md`, QA's standing list of what no test can
  check.
  Approving a plan is not approving a push: every push and publish still needs its
  own yes.
- **Change request documents (CRDs).** When anyone — you, a crew role, or the PM
  itself — asks for something that changes what you get (the scope, a DoD
  item, the milestone list) or how two modules talk (a boundary contract), the PM
  writes `docs/decisions/crd/NNNN-<short-name>.md` first: who asked, what they want,
  why, which documents and tasks it touches, the cost, and the decision with its
  reason. Nothing is built from an undecided CRD, and a rejected one is kept.
  Small questions and code review findings deliberately do **not** get a CRD.
- **Who decides a CRD.** A contract fix that changes nothing you can see is the
  PM's call — it writes the CRD, sends the architect to change the contract file,
  and names it in the next milestone report. Anything that changes scope, a DoD
  item or the milestone list needs your yes: the PM stops and asks, and raises no
  version until you answer.
- **The state file tracks CRDs**, so a session that picks the job up after a crash
  knows which change requests are still undecided.
- **A bug with more than one real fix now comes back as a question.** Before an
  engineer fixes a bug, it must find at least two ways that would really work.
  This covers a defect QA found, a blocking review finding, and a bug the
  engineer hit while doing its task. If the ways only differ in wording, it picks
  one and says in its report which ways it compared and why. If the difference
  would stay in the code, it stops and hands the ways to the PM. Six things make
  a difference stay:

  - which module owns the behaviour;
  - which layer holds the check;
  - whether it touches a boundary contract in `docs/design/api/`;
  - whether a public name, command, config option or output format changes;
  - whether behaviour you can see changes;
  - whether speed or compatibility changes.

  The engineer writes the cause of the bug and, for each way, the files it
  changes, what it costs, and where it will hurt later. It also recommends one.
  The PM then decides on the same line a CRD uses. If you can see the
  difference, it asks you and waits for a clear answer. If the difference stays
  inside the code, it decides itself and names the choice at the next milestone
  review. The decision goes into a document before the engineer builds it: an
  **architecture decision record (ADR)** under `docs/decisions/adr/`, whatever
  the size of the job. That record holds the cause, every way
  that was found with its cost and why it lost, the way that was taken, who
  decided, and the reason. New features and refactors do not go this way —
  there the design and the engineer's judgement decide, as
  before.
- **Every ADR is now written for you, and you can overturn one.** An ADR used to
  need only "the options you weighed", which could be one sentence. Now it lists
  **every** option, the ones dropped early included. Each option says what it
  costs, where it will hurt later, and why it lost. One option is marked as the
  recommended one, with a reason. The whole file has to be readable by someone
  who has never seen the code. The design does not stop and wait for you — the
  architect keeps designing on its own recommendation. At the milestone review
  the PM puts every ADR from that milestone in front of you, options and all. You
  may overturn any of them. That is a change request: the PM writes the CRD,
  raises the versions of the documents it touches, and the tasks already built
  the old way are built again. When one of the options is something you can see,
  the PM does not wait for the review — it asks you when it comes up. The doc
  reviewer has a new check for this: an ADR that hides an option, skips a "why it
  lost", or does not mark its recommendation is a finding.
- **The PM can merge your work branch and clean it up — when you ask, and in
  three steps.** A new step near the end of a job: the PM merges
  `crew/<job-slug>` into `main` itself, and asks you three separate times — once
  for the merge, once for pushing `main`, once for deleting the branch — because
  one yes never covers the next thing. The merge is never squashed, so every
  task's commit and its test-first proof stay in the history. Before the push of
  `main` it names the CI files it read and says whether that push would publish,
  and it still pushes if you say yes. It offers to delete the branch only after
  three checks pass, one of them being that the **remote** branch holds nothing
  `main` does not — `git push origin --delete` has no protection of its own. It
  never merges or deletes anything you did not ask for, and a branch that simply
  stays is still a normal ending.
- **The PM tells you which job slug it will use.** You name the job in your own
  words; the slug that name becomes now has a fixed shape — lowercase letters,
  digits and `-`, at most 40 characters, never `..` — and the PM converts your
  name itself and says the result in one line before it creates the job folder or
  the branch. That slug is pasted into a file path and into almost every git
  command the PM runs in your own trusted session, so a name carrying a space, a
  `;` or `..` is no longer used as it stands.
- **Every finished task now records its four reviews in your repository.** The
  PM writes one **Verdicts** line at the top of each task section in
  `docs/design/tasks.md`: `code`, `security`, `qa`, `doc`. A review that did
  not happen is written `not run — <the reason>`, never left out and never a
  bare `not run`; a skip carries its own reason on its own value; a
  `changes needed` names the task that carries the fix. A task with no
  Verdicts line is not finished and is not committed. So a skipped review is
  visible in your repository the same day, instead of only when you ask.
- **`npm test` ends with a new check that guards the crew's own record
  keeping.** In this repository `scripts.test` is now the four project checks,
  then `bash docs/qa/run-all.sh`, then `node tools/verify-tasks.mjs`. That last one
  reads `docs/design/tasks.md`, where every task section carries a
  **Verdicts** line — the PM's report of the four reviews. It turns **red** when:

  - a task section has no Verdicts line, or has more than one;
  - any of the four values (`code`, `security`, `qa`, `doc`) is missing;
  - a `not run` or `skipped` value carries no reason of its own after the dash;
  - a `changes needed` value names no task id to carry the fix.

  Every run prints the totals out loud.

  **Passing is not the same as clean.** The PM writes that line,
  and reviewers cannot write files by design, so the gate proves the line was
  written and every skip carries a reason — it **cannot** prove a review
  happened, because a `code: pass` typed by the PM passes it. Nothing automated
  can close that hole. It exists because the PM of this repository's own job
  skipped code review on about 20 tasks and doc review on most of the job,
  nothing went red, and nobody knew until the user asked. The gate makes
  the next such skip visible the same day instead of twenty tasks later. The rule
  it enforces is honesty, not effort: a skip is allowed, a silent skip is not.
  The change request is
  `docs/decisions/crd/0011-verdicts-gate-in-npm-test.md`.

### Fixed

- **A branch or file whose name contains `push-ok` no longer blocks every git
  command.** The guard protects the one-shot push approval file
  (`~/.dsh/crew/push-ok`) by name, and it used to look for that name anywhere
  inside the command text. So a job branch called `crew/push-ok-flow` had every
  git command refused — merge, push, delete — with an error about touching the
  approval file, and your own session was refused too, not only the crew roles.
  The name is now matched as a whole file name: `crew/push-ok-flow`,
  `push-okay.md` and `push-ok.bak` pass, while `touch push-ok`, `rm ./push-ok`,
  the quoted spellings and the full path are still refused for everyone. A
  command that
  only mentions the name — a commit message, a `grep` — is still refused, as
  before.
- **A folder-shaped `approvalFile` now fails at startup instead of protecting the
  wrong name.** Writing `approvalFile: ~/.dsh/crew/`, with the trailing slash,
  used to leave `crew` as the protected name: every push of a `crew/...` branch
  was refused as if it had touched the approval file, while the guard was
  watching a folder instead of the file, so the one-shot approval no longer
  worked as written. The guard now refuses to load and the message tells you to
  name the file itself.

### Changed

- **The three checks of a finished task now start together by default.** The code
  review, the security review (when the change earns one) and QA used to run one
  after another, so each one read code that had stopped moving. That fixed order is
  now the **named exception**, not the default: the PM starts all three in one
  message, serializes them only for a risky change, and says in its summary which
  of the two it picked and why. Both ways cost something. If you do not wait and
  the review then reports a blocking finding, that round of QA is wasted. If you
  do wait and it reports nothing, you spent your own time for nothing — and that
  cost shows up in no report at all.
- **The README step now covers the other files a reader meets.** As well as
  `README.md` and its language copies, the PM writes a `CHANGELOG.md` entry when a
  user would notice the change, and edits `CLAUDE.md` when the repository's own
  rules or layout moved. Both were files the crew already changed with no rule
  saying so.
- **There is no `dod.md` any more. "What done means" is a section, and it lives in
  your repository.** Both lanes now open with one document, `docs/design/prd.md` —
  for a small job as much as for a real product, because the weight belongs in the
  content and not in the file name (a small job's PRD is three paragraphs). Both
  lanes keep one task table, `docs/design/tasks.md`: one row per task with the
  files it owns, the test file it must write, and its **DoD section**. Every
  milestone of a big job carries a DoD section too. A DoD section says what "done"
  means for that one thing and **how somebody else checks it** — which QA case,
  which exact command. There is no numbered list of acceptance checks anywhere: a
  check is "item 2 of T-05's DoD", written next to the work it governs.

  **A bug now becomes a task row, and the PM writes its DoD section before the
  fix starts** — never the engineer doing the fix. The row also holds what was
  reported: who saw it, the command, what happened, what they expected. Test first
  does produce a test, but the person doing the fix writes it, and that is exactly
  how a fix for a symptom passes: before the work started, nobody else had said
  what "fixed" means. A one-line typo fix is not this; it stays a well-written
  commit message.

  **Why this changed, plainly: the job that wrote these rules lost 75 of its own
  acceptance checks in about an hour, and got 48 of them back.** They lived in a
  `dod.md` in the job folder, which the rules said to drop at the end of the job,
  and the closing migration step named five destinations that a DoD item's own
  wording fits none of. Four change requests were left pointing at check numbers no
  document defined any more, and more than twenty pushed commit subjects named a
  task whose defining document had been deleted. Of the 75, 48 were recovered with
  their wording, 7 with only a number and a topic, and 20 are gone; 46 of the 48
  came from the header comments QA's own case files happen to write. The recovered table
  is in this repository at `docs/design/tasks.md`, with every lost item marked as
  lost. The migration step now has **seven** destinations, the two new ones being a
  DoD item's own wording and the list of files a task owns, both going to
  `docs/design/tasks.md`. `principles.md` 20 carries the whole flow in one table
  and the reasons; `docs/decisions/crd/0010-dod-is-a-section.md` is the change
  request, corrections included.
- **No cap any more on how many crew agents one job may use, and 20 awake at
  once instead of 4.** One job used to be limited to 20 agents in total, and only
  4 of them could be awake together. So tasks whose files did not overlap queued
  for no reason, and a long job ran out of its 20 right where the last reviews
  were. The total cap is gone: a job uses as many agents as the work needs.
  `limits.liveAgents` now defaults to `20`. If your profile still sets
  `limits.agentsPerJob`, dsh starts as before — the plugin ignores that setting
  and says one line about it in the boot log. You can delete the line.
- **An engineer's test must be a file that stays.** It goes in your project's test
  suite, in the naming that project already uses, is named in the task row, and is
  committed with the code. No proving a behaviour with a throwaway command, no
  deleting or weakening a test once it passes, and every test has to pass twice in
  a row.
- **Documents are the only channel between the PM and its roles.** A role's report
  points at the file it wrote; the PM's answer points at the document it changed
  and that document's new version. Nothing that matters may live only inside a
  message — if the PM's answer is a new rule, name or number, it goes into a
  document first. The engineer and QA are told to ask for that in writing before
  they build or test it.
- **The architect designs inside the stack and may not change it.** If it believes
  the stack cannot carry the design, it stops and says what breaks, and the PM
  brings that to you as a CRD. It never works around the stack quietly. QA does the
  same check from the other side: if the document's stack section and your project
  disagree about the test framework, that is a finding it reports, not a choice it
  makes.
- The PM's milestone report now lists every CRD since the last review, and its
  final report gives the numbers from both the project's test command and
  `bash docs/qa/run-all.sh`.
- If your test runner cannot see `docs/qa/` (many only look inside folders
  their config names), QA reports it with the exact command, the message, and the
  one config line that would fix it. The PM then **adds that line** — a suite
  nobody runs stops protecting anything, so "those cases cannot run" is a blocking
  problem the PM brings to you, not somewhere it may stop. QA never edits your
  project's config and never moves its files into your test folder.
- **QA's cases now run from `npm test`, and CI runs the tests on every push.**
  In this repository `scripts.test` runs `bash docs/qa/run-all.sh`, so every QA
  case in the repository is part of the default test command instead of a
  command somebody has to remember. The new `.github/workflows/test.yml` runs
  `npm test` on **every push**; publishing is still a separate workflow that only
  a `v*` tag starts, and it runs `npm test` again before it publishes, so a
  release never trusts an earlier push's green. A check now keeps that shape:
  `tools/verify-mount.mjs` reads **every** file under `.github/workflows/`, and
  any workflow that carries a live `npm publish` must be tag-only on push (a `v*`
  tag filter and no branches filter) and must run `npm test`, unconditionally and
  in the same job, before it publishes. It checks out with
  `fetch-depth: 0` on purpose: some cases read this repository's own commits, and
  the default shallow clone has no history to read. The cost, written down rather
  than discovered: **`npm test` gets slower**, and it keeps getting slower as jobs
  add cases, because every job's cases now run on every change. That is the point
  — it is the regression net — but one day it will need layers, a fast check and a
  full one. And CI is not full coverage: `tools/verify-mount.mjs` skips its
  role-tool half wherever `@deepseek-ai/dsh-tool-subagent` is not installed, which
  includes CI. It says out loud which half it skipped.
- **Where crew documents live changed.** `docs/crew/` is gone. Documents now sit
  in folders named after what they hold: `docs/design/` (PRD, HLD, task list, and
  the boundary contracts in `docs/design/api/`), `docs/decisions/` (`adr/` for how
  something was done, `crd/` for change requests), `docs/qa/` (QA's runnable cases
  and its standing list of what no case can check), `docs/research/` (a
  researcher's answers) and `docs/release/` (the
  release and upgrade plan per shipped milestone). There is no `dod.md` at any
  path, and never was in a released version: "what done means" is a section, which
  is the entry at the top of this section. Every role writes to the new paths. If you have a job in
  flight with files under `docs/crew/`, move them to the matching new folder — nothing
  reads the old path any more.
- **A decision about *how* now gets an ADR, whatever the size of the job.** The
  rule used to depend on who was staffed: big work wrote an ADR, and small work
  wrote a **Decisions** section inside its DoD. So where you had to look for a
  decision depended on whether that job happened to have an architect. Now there
  is one home — `docs/decisions/adr/NNNN-<short-name>.md` — and one question tells
  an ADR from a CRD: **did someone ask for this?** Someone asked (you, QA, a
  review) → a change request, so a CRD. Nobody asked, and the crew ran into a
  choice while doing the work → an ADR. Small work has no architect, so the PM
  writes the ADR itself, and its options section **quotes the engineer's `Q-`
  question file word for word** — the PM adds only the decision and the reason. It
  may not write "options: see Q-03" either: that file is dropped with the job, and
  a pointer at a file that disappears deletes the most valuable part of the record.
- **What survives a job, and what does not.** Documents are now split by how long
  they live. Single-use documents stay in the job folder outside your repository
  and go when it goes: `state.json`, QA's test plans (`<task-id>-plan.md`), the `Q-`
  question files in `inbox/`, and a test run's output, which is printed and never
  written to a file. The DoD is **not** on that list: it is a section of a file
  that stays, which is the entry at the top of this section. Durable documents are
  in your repository: the ADRs and CRDs, the PRD and design, QA's runnable cases,
  the release plans, the researcher's answers. **Before anything is dropped, the durable half moves out** — a rule the
  crew must keep to `principles.md`, a decision about how to an ADR, a decision
  about what or a contract to a CRD, this change's reasons and its real test
  numbers to the commit message. And QA's "what I could not test here, and why"
  now has a standing home in **`docs/qa/gaps.md`**, written by QA itself, grouped
  by the thing that cannot be checked rather than by task id, and shortened by
  later jobs. That move happens **after** the PM's closing summary, not when the
  DoD items turn green — this crew's own job carried five more rounds of
  decisions after every check was already green.
- **An engineer no longer chases a red that another running task caused.** Two
  tasks whose file lists do not overlap still meet inside the same test suite,
  because the project's checks read everyone's files. So a whole-suite run could
  give three different answers in three minutes and send an engineer to fix
  something that was never broken. The rule now says it plainly: a red from a check
  that reads a file another running task owns is **not evidence** about your work.
  The engineer says "the tree was moving", names the file, and carries on — and it
  may never weaken or edit a case to make it green. The run that counts is still
  the PM's own, on a still tree, after every parallel task has landed.
- **The `roleDeny` example in `preset/crew/agent.cordis.yml` was wrong, and the
  comment above these settings now says what they really do.** Both settings
  **replace** the shipped list for that role; they are not added to it. So the
  old example `roleDeny: { engineer: ['crew_engineer'] }` cut the engineer's
  seven `crew_*` deny names down to one. If you copied it, write all seven names
  out (`crew_researcher`, `crew_architect`, `crew_engineer`, `crew_qa`,
  `crew_code_reviewer`, `crew_security_reviewer`, `crew_doc_reviewer`), or delete
  your own `roleDeny` line and keep the shipped list. This was not a hole in the
  crew's safety: `maxDepth: 1` has always stopped a role from starting a role,
  whatever the filter says. But a short list gives up one of the guards that keep
  the crew flat, and your deny list was not what you thought it was.

## 0.6.0 — 2026-08-20

### Added

- **The architect designs the module boundaries.** It now splits the system into
  modules in `docs/design/hld.md`, saying where each line falls and why, and it
  must look for a module or library the repository already has before it invents
  a new one. Every new module needs a reason it had to be new.
- **One contract file per boundary.** When two or more modules talk to each
  other, the architect writes `docs/design/api/<caller>-<callee>.md`: how the two
  sides talk (in-process call, HTTP, gRPC, events, and so on), the data format,
  every call with its inputs, output and named errors, who owns the data and
  what the caller may believe about it, and — for events — the schema and the
  delivery promise. It picks the style, never the library; the engineer uses
  what the repository already uses. One-module work gets no contract files.
- **A contract test on each side.** Each contract names one test per side. The
  callee's test proves it answers exactly what the file says. The caller's test
  runs against a stub built from the file, not against the real other side. The
  engineer writes it first, like every other test, and the code reviewer blocks
  a boundary task that arrives without it.
- **The first task is a walking skeleton.** When there is a boundary, `T-01` is
  the thinnest real path across the riskiest one, running for real. One engineer
  owns it, it is the only task allowed to own files on both sides, and nothing
  runs beside it. A contract that does not fit is cheapest to fix there.
- **Milestones for big work.** A PRD is now cut into three to six milestones,
  each one something you can look at and judge, written in your words. `M1` is
  the proof of concept and holds the walking skeleton. You confirm the milestone
  list on its own before any design starts.
- **A milestone review, every cycle.** When a milestone's tasks are all checked
  and committed, the PM stops and shows you what works now, the exact commands
  to try it yourself, what is deliberately not there yet, and the test results.
  Then you say go on, change something, or stop. A change that touches the PRD
  goes back through the architect and the doc reviewer before code starts again.
  No milestone begins until you have answered the one before it.
- **A restart knows the milestone.** The unfinished-job notice now says which
  milestone a job stopped in, and says plainly when a milestone is waiting for
  your answer.
- **`principles.md`** — why the crew works this way, one entry per rule
  with its source, plus the ideas we looked at and turned down. For people
  changing the plugin; it is not published to npm.

### Changed

- A contract is frozen once either side's task starts. Only the architect edits
  one. When it must change, an additive change (a new call, a new optional
  field) costs one side; a rename or a removal costs both.
- The doc reviewer checks the contracts and the milestones, and the code
  reviewer checks the code against the contract it was built from.
- Small DoD work is unchanged: no modules, no contracts, no milestones.

## 0.5.0 — 2026-08-19

### Changed

- **The PM is trusted for git and publishing.** Your own session is the root
  agent, and the git guard now lets it pass straight through — push `main`, push
  a release tag, force push, delete, or run `npm publish` — instead of refusing
  it like a crew role. The PM still asks you before every push; the ask is the
  rule, not a block. Every crew role stays fully guarded, and even the PM cannot
  write the approval file, so a child's push still needs your own hand. Set
  `trustRootAgent: false` to guard the PM exactly like every child.

## 0.4.3 — 2026-08-18

### Changed

- **Engineers write the test first.** The loop is now red, green, run again,
  refactor. The failing test must come before the code and must fail for the
  right reason — the behaviour is missing, not a typo or a test runner that
  could not start. An engineer that believes a test cannot come first stops and
  asks the PM before writing any code.
- **The engineer's report must prove it.** It shows the failing run before the
  code and the passing run after. A report without the failure is not done.
- **The PM plans for it.** Before writing a task row it names the test it
  expects. A task it cannot name a test for is not ready. It sends each engineer
  the project's test command, sends back a report with no proof, and passes the
  proof to the code reviewer with the diff.
- **The code reviewer judges craft.** Reuse, simpler code, readability and this
  repository's style may now hold up a task. To block on one, the reviewer must
  show the replacement: the helper that already exists with its file and line,
  the shorter lines pasted in, the exact new name, or a file in the repository
  that does it the other way. No replacement means the finding is optional.
- **Readability gets numbers.** Function length, nesting depth, parameter count,
  `true`/`false` switch parameters, unnamed values. A number that trips says
  *where to look*, not what is wrong — if the repository writes that way
  everywhere, the code fits and there is no finding.
- **The doc reviewer checks consistency.** One name per idea, one shape for
  headings, task rows and ids, crew documents that agree with `README.md`, and
  language files that match each other section by section.
- **The doc reviewer checks readability by counting.** The reader is about 14
  years old and English is not their first language. Sentences over 25 words,
  two ideas in one sentence, a term used before it is explained, idioms, passive
  voice, three nouns in a row, long paragraphs. Wording may block, but only with
  the replacement sentence written out.

## 0.4.2 — 2026-08-18

### Fixed

- **An upgrade no longer throws away your preset settings.** Role tool filters
  and per-role models are configured inside the installed preset, and a version
  bump used to delete and rewrite that folder with no warning. The installer now
  reads every file that differs from the shipped copy, writes it back as
  `<name>.bak`, and names it in the boot log. A backup that fails is reported as
  a warning. An install nobody edited still upgrades quietly.

## 0.4.1 — 2026-08-18

### Changed

- **The PM asks one question per turn.** This used to read as a style hint. It
  is now a rule: ask one question, wait for the answer, never send a list.
- Added `CLAUDE.md`, which records the host and agent plane split, the design
  rules the checks enforce, and the steps for adding a role.

## 0.4.0 — 2026-08-18

### Added

- **Push with your permission.** The PM first checks that a push is even
  possible — a remote, a workflow, `gh` logged in — then asks you before *every*
  push, including a re-push after a fix. It pushes only the `crew/*` branch,
  watches the CI run, and sends a red run's real error text back to the engineer
  that owns those files. `main`, tags and force pushes stay blocked whatever
  anyone says.
- **Pick a job up after a crash.** The plugin reads the job folder every turn.
  An unfinished job is put in front of the PM, which must tell you about it and
  ask whether to carry on or start clean before doing anything else. Jobs from
  other folders are ignored, and a state file it cannot read is reported instead
  of counted as done.

---

Versions before 0.4.0 were early releases. See the git history for those.
