# Changelog

What changed in each released version of `dsh-crew`, newest first.

Every version bump rewrites `$DSH_HOME/.agent-presets/crew`. Files you edited
there are kept as `<name>.bak` and named in the boot log, but your settings do
**not** come back on their own. Copy them into the new file after an upgrade.

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
