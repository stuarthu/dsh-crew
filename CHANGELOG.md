# Changelog

What changed in each released version of `dsh-crew`, newest first.

Every version bump rewrites `$DSH_HOME/.agent-presets/crew`. Files you edited
there are kept as `<name>.bak` and named in the boot log, but your settings do
**not** come back on their own. Copy them into the new file after an upgrade.

## 0.7.0 — 2026-08-20

### Added

- **QA's test cases are files you keep.** QA still writes its plan from the
  document before it reads the code, but now every case becomes a real test file
  in your project's own test framework, under `docs/crew/qa/<task-id>/`, with a
  `run.sh` beside it. They are committed with the task, so they outlive the job.
- **One command runs every QA case ever written.** `docs/crew/qa/run-all.sh`
  finds each task's `run.sh` by itself and runs them all. QA runs it on every
  task it checks, so a case from an earlier task guards the new work. A case that
  used to pass and now fails is a blocking regression, and nobody may edit it
  green — it goes back to the engineer that owns those files.
- **The language and stack are settled before anything is designed, and you
  approve them.** If your repository already has a stack, that is the stack: the PM
  reads the manifest, the lock file, the test folder and the CI workflow, states
  what it found, and you confirm it in one line. When the choice is real — an empty
  repository, a new service — the PM starts a `crew_researcher` first, which lists
  the candidates with a source per claim, what the machine already has, and what
  each one costs, and is **not** allowed to recommend one. The PM then recommends
  one, names the runner-up and why not, and writes a **Language and stack** section
  into the PRD or DoD: language and version, package manager, framework, database,
  and the test framework with its exact test command. You confirm it together with
  the document. After that it moves only through a CRD.
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
  writes `docs/crew/release/<milestone>-release.md` (the version and the rule
  behind it, the release notes, the exact steps and who approves each one, what
  must be true before starting, how it is checked afterwards, and how to undo it —
  or the plain words that it cannot be undone) and
  `docs/crew/release/<milestone>-upgrade.md` (who upgrades from what, every
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
- **A milestone you are not shipping gets no plan** — it gets one honest paragraph
  naming what is still missing before it could ship (a version scheme, release
  notes, an untested rollback, a missing token, an unwritten migration). That list
  shortens as milestones pass, so the first real release is not a surprise.
  Approving a plan is not approving a push: every push and publish still needs its
  own yes.
- **Change request documents (CRDs).** When anyone — you, a crew role, or the PM
  itself — asks for something that changes what you get (the scope, an acceptance
  check, the milestone list) or how two modules talk (a boundary contract), the PM
  writes `docs/crew/crd/NNNN-<short-name>.md` first: who asked, what they want,
  why, which documents and tasks it touches, the cost, and the decision with its
  reason. Nothing is built from an undecided CRD, and a rejected one is kept.
  Small questions and code review findings deliberately do **not** get a CRD.
- **Who decides a CRD.** A contract fix that changes nothing you can see is the
  PM's call — it writes the CRD, sends the architect to change the contract file,
  and names it in the next milestone report. Anything that changes scope, an
  acceptance check or the milestone list needs your yes: the PM stops and asks,
  and raises no version until you answer.
- **The state file tracks CRDs**, so a session that picks the job up after a crash
  knows which change requests are still undecided.

### Changed

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
  `docs/crew/qa/run-all.sh`.
- If your test runner cannot see `docs/crew/qa/` (many only look inside folders
  their config names), QA reports it with the exact command, the message, and the
  one config line that would fix it. The PM either adds that line or says plainly
  that those cases cannot run yet. QA never edits your project's config and never
  moves its files into your test folder.

## 0.6.0 — 2026-08-20

### Added

- **The architect designs the module boundaries.** It now splits the system into
  modules in `docs/crew/hld.md`, saying where each line falls and why, and it
  must look for a module or library the repository already has before it invents
  a new one. Every new module needs a reason it had to be new.
- **One contract file per boundary.** When two or more modules talk to each
  other, the architect writes `docs/crew/api/<caller>-<callee>.md`: how the two
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
- **`docs/principles.md`** — why the crew works this way, one entry per rule
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
