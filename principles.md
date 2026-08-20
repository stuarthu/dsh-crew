# Crew principles

This file says **why** the crew works the way it does.

Every rule in `roles/*.md` is short and bossy on purpose — a role prompt is read
by a model that has to act, not argue. The reasons live here instead. Read this
before you change a role, so you do not remove a rule without seeing the cost it
was paying for.

Who "the user" means in this file: whoever installed the plugin and is running
the session. Not the person who wrote the plugin.

Short names used below: **PRD** (product requirements document, the file
`docs/design/prd.md`, which opens both lanes), **DoD** (definition of done — always
a **section** of another document, never a file of its own; see principle 20),
**HLD** (high level design, the file `docs/design/hld.md`), **ADR** (architecture decision record),
**CRD** (change request document), **QA** (the role that tests the result).

Each principle below has:

- **Rule** — what the crew actually does.
- **Why** — the reason, in one or two sentences.
- **Lives in** — the files that carry it. Change one, check the others.
- **Source** — where the idea comes from, on the principles that borrowed one.

A principle marked **(ours)** came from running the crew and watching it fail, not
from a book, and has no **Source** line — do not invent one for it. Those are the
ones a newcomer is most likely to delete.

---

## 1. The crew is flat, so the documents have to carry everything

**Rule.** Only the PM starts agents. A role talks to the PM and to nobody else.
Two roles can never talk to each other.

**Why.** dsh delivers a message to direct children only, so a grandchild would be
out of the PM's reach forever. But the deeper reason is worth keeping in mind:
a system ends up shaped like the communication of the people who build it. Our
builders cannot communicate at all. So anything two of them must agree on has to
be written down first, or it will not be agreed at all.

This is why the architect writes so much, and why "ask the other engineer" is
never an option anywhere in the crew.

**Lives in** `host/roles.js` (the deny lists), `host/roles-preset.js`
(`maxDepth: 1`), `preset/crew/agent.cordis.yml`, `roles/pm.md`,
`roles/architect.md`, `CLAUDE.md` design rule 1.

**Source.** [Conway's Law](https://lawsofsoftwareengineering.com/laws/conways-law/) ·
[Team Topologies and Conway's Law alignment](https://archman.dev/docs/domain-driven-design/strategic-design/team-topologies-and-conways-law-alignment)

---

## 2. Between two modules there is a written contract, and nothing else

**Rule.** When two or more modules talk, the architect writes one file per
boundary in `docs/design/api/<caller>-<callee>.md`. It holds the style, the format,
and every call with its inputs, output and named errors. It also holds the rules
each side keeps, who owns the data, and what the caller may believe about it.

**Why.** Team Topologies calls this "X-as-a-service": one part serves another
through a documented contract, and the contract is the *only* way in. It works
in industry because it removes the need to talk. For us that is not a saving —
it is the only mode we have.

The test of a good contract file: could two people build the two sides from this
file alone, having never met? If you would need to ask a question, the file is
not finished.

**Lives in** `roles/architect.md`, `roles/engineer.md`, `roles/doc-reviewer.md`,
`roles/pm.md`.

**Source.** [Team Topologies](https://umbrex.com/resources/frameworks/organization-frameworks/team-topologies/) ·
[API-first development and contract testing](https://dasroot.net/posts/2026/02/api-first-development-contract-testing/)

---

## 3. Every boundary has a test on each side

**Rule.** Each contract file names one test per side. The callee's test proves it
answers exactly what the file says, errors included. The caller's test runs
against a **stub** — a small fake stand-in for the other side, built from the
file — never against the real other side. Both are written before the code, like
every other test here.

**Why.** A contract in prose is a promise. Two engineers who cannot talk will
each read the same sentence and build something different, and nothing will catch
it until the halves are joined. Industry calls this contract testing and uses
it "as soon as more than one team consumes an API". We use it as soon as there
are two modules. Our two sides are further apart than two human teams: they
cannot talk at all.

**Lives in** `roles/architect.md` (names the tests), `roles/engineer.md` (writes
them first), `roles/code-reviewer.md` (blocks without them),
`roles/doc-reviewer.md` (checks they are named).

**Source.** [Contract testing for microservices](https://totalshiftleft.ai/blog/contract-testing-for-microservices) ·
[What is API contract testing?](https://totalshiftleft.ai/blog/what-is-api-contract-testing) ·
[Consumer-driven contract tests: lessons learned](https://medium.com/pcg-dach/consumer-driven-contract-tests-lessons-learned-b4e1ac471d0c)

---

## 4. The first task is a walking skeleton

**Rule.** When the design has a boundary, `T-01` is the thinnest real path across
the **riskiest** boundary, running for real. One engineer owns it, and it is the
only task allowed to own files on both sides. Everything else waits for it.

**Why.** A walking skeleton is "the thinnest possible slice of real functionality
that we can build, deploy and test end to end". It exists to find integration
problems while they are still cheap. Our version of that risk is sharp. If the
contract does not fit, there are two moments to find out. One is task one, while
a single engineer holds both ends and the contract can still change cheaply. The
other is the end, after two finished halves have to be thrown away.

The same idea appears in recent work on AI-assisted development as
"hardest-first ordering": build the part most likely to break the plan first.

**Lives in** `roles/architect.md`, `roles/pm.md`, `roles/engineer.md`,
`roles/doc-reviewer.md`.

**Source.** [Walking Skeleton](https://distilledpatterns.org/patterns/walking-skeleton/) ·
[What is a vertical slice?](https://monday.com/blog/rnd/vertical-slice/) ·
[The Spec Growth Engine, arXiv 2606.27045](https://arxiv.org/abs/2606.27045)

---

## 5. Big work stops at milestones, and the user judges each one

**Rule.** A PRD is cut into three to six milestones. Each is something the user
can look at and judge, written in their words. `M1` is the proof of concept and
holds the walking skeleton. When a milestone's tasks are done and committed, the
PM stops. It shows what works and how to try it, then asks: go on, change
something, or stop. Nothing starts until the user answers.

**Why.** Scrum's rule is that the team delivers "a valuable, useful Increment
every Sprint" — something real, often, rather than one big reveal. The reason is
feedback: a wrong direction found in week one costs a week. An agent crew can
build a wrong thing faster than a human team can, so the stops matter more, not
less.

The milestone goals are the PM's and the user confirms them. The architect may
not add, rename or reorder them. If one cannot be built as written, the architect
says so, and the PM takes it back to the user.

**Lives in** `roles/pm.md` (step 4 **Write the opening document**, step 5
**Confirm**, step 8 **Design**, step 9 **Run the tasks**, step 12 **Milestone
review**), `roles/architect.md`,
`roles/doc-reviewer.md`, `host/jobs.js` (a restart says which milestone).

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html)

---

## 6. Tests come before code, and the report has to prove it

**Rule.** An engineer writes a failing test, checks it fails for the right
reason, then writes the smallest code that passes. Its report shows the failing
run and then the passing run. A report without the failing run is not accepted.

**Why (ours).** An agent that writes code first will write a test that passes
against whatever it just wrote, including the bugs. The failing run is the only
evidence that the test could ever have failed. Scrum says the same thing another
way: developers build quality in "by adhering to a Definition of Done". Quality
is built in, not checked afterwards.

**Lives in** `roles/engineer.md`, `roles/architect.md`, `roles/pm.md`,
`roles/code-reviewer.md`. Where that test file lives, and how it is run again
later, is principle 13.

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html)

---

## 7. Reuse before you invent, and judge a module by how easy it is to use

**Rule.** Before adding a module, the architect looks for one that already exists
in the repository, or a library it already depends on. `hld.md` lists what was
reused, what is new, and why the new parts had to be new. A module is judged by
how hard it is to call wrongly, not by how tidy it is inside.

**Why.** Architect job descriptions describe the role as reducing long-term
delivery risk through clear direction and reuse of existing standards, not as
producing new boxes. A crew has its own weakness here. An agent
asked to design will design, because that is the thing it was asked to do. The
rule pushes back on that.

**Lives in** `roles/architect.md`, `roles/code-reviewer.md` (reuse is a review
item).

**Source.** [Software architect job description (Interview Kickstart)](https://interviewkickstart.com/job-description/software-architect) ·
[Software architect role blueprint](https://www.devopsschool.com/blog/software-architect-role-blueprint-responsibilities-skills-kpis-and-career-path/)

---

## 8. The stack is settled once and confirmed, then shape and library split

**Rule.** Before anything is designed, the **PM** settles the language and stack
and the **user confirms it**, as a *Language and stack* section in
`docs/design/prd.md`, the opening document of both lanes:
language and version, package manager, framework, database, and the test framework
with its exact test command. If the repository already has a stack, that is the
stack — no options, no research, just state it and confirm. Only when the choice is
real does the PM start a `crew_researcher` for the options and their costs, then
decide and recommend one.

After that, the old line holds: the architect says "HTTP/REST, JSON" or
"in-process call, typed objects", never "FastAPI" or "grpc-go". Which of the
libraries the project already has an engineer uses is the engineer's call. Adding
a package the project does not depend on yet is the PM's call, and gets written
into the stack section. Changing the stack itself needs a CRD, like scope.

**Why.** Architect job descriptions put boundaries, patterns and standards with
the architect, and implementation with the engineers. Crossing that line costs
twice. The architect knows the repository's habits less well than the engineer
reading the code around the change. And a named library in a design document
starts an argument the crew has no way to hold.

**Why the up-front part (ours).** The old rule said the engineer uses "what the
repository already uses", which quietly assumed a repository that already exists.
On an empty one there is nothing to use, and roles cannot talk to each other, so
several engineers would each pick a language and a test framework and none of
them would find out. Worse, the choice reaches further than code: QA writes its
cases in the same framework, so a disagreement splits the tests too. It is also
the decision a user most wants a say in, and the PM is the only role that talks to
them.

**Why the PM and not the architect.** Small work has no architect at all, and
the design itself depends on the stack, so it must be settled before the architect
starts. Facts still come from a researcher — it lists candidates with costs and
sources and is forbidden to recommend one — so "the PM decides" does not mean the
PM guesses.

**Lives in** `roles/pm.md` (step 3 **Language and stack**), `roles/researcher.md`,
`roles/architect.md`, `roles/engineer.md`, `roles/qa.md`,
`roles/doc-reviewer.md` (a named library in a contract is a finding).

**Source.** [Software architect job description (Interview Kickstart)](https://interviewkickstart.com/job-description/software-architect)

---

## 9. Data ownership and consistency belong in the contract

**Rule.** Every contract says which module owns the data behind the boundary. It
also says what the caller may believe: is the answer true right now, or can it
lag? Where
does a transaction end? For events: the schema, and whether delivery is at least
once, and whether order is kept. Two modules writing the same data is not a
boundary — it is a bug in the split.

**Why.** These are the parts two sides silently disagree about, and the
disagreement shows up as a rare bug rather than a build error. Architect job
descriptions name exactly this set — transaction boundaries, data ownership,
consistency models, event schemas — as the architect's decisions.

**Lives in** `roles/architect.md`, `roles/doc-reviewer.md`.

**Source.** [Software architect role blueprint](https://www.devopsschool.com/blog/software-architect-role-blueprint-responsibilities-skills-kpis-and-career-path/)

---

## 10. A contract change mid-flight should be additive

**Rule.** A contract is frozen once either side's task starts. When it must
change, prefer adding: a new call, or a new field that is not required. Four
changes break the other side: renaming a field, removing one, making an optional
field required, and changing what an error means. Each of those needs both sides
re-run.

**Why.** This is ordinary backward-compatibility practice — add fields rather than
alter them — shrunk to the size of one job. Public APIs add version numbers and
deprecation windows on top. Those do not apply here — see the table below. The
additive habit does apply: it decides whether a mid-flight change costs one
engineer or two.

**Lives in** `roles/architect.md`, `roles/pm.md`.

**Source.** [API versioning and backward compatibility best practices](https://zuplo.com/learning-center/api-versioning-backward-compatibility-best-practices)

---

## 11. The spec and the code must not drift apart quietly

**Rule.** The code reviewer checks the change against the contract file, and
treats any call, field or error the contract does not have as blocking. Reaching
around the boundary — a shared table, a private import, a global — is blocking
too. If the contract itself is wrong, that is a finding for the architect, never
a change the engineer makes.

**Why.** Recent work on AI-assisted development names "silent spec-code drift" as
one of its two main failure modes. Its answer is a *drift gate*: a disagreement
between the code and the spec blocks the merge. Our review step is that gate, run
by a reader rather than a tool. It is weaker than a machine check, and worth
replacing with one if the chance comes.

**Lives in** `roles/code-reviewer.md`, `roles/engineer.md`.

**Source.** [The Spec Growth Engine, arXiv 2606.27045](https://arxiv.org/abs/2606.27045)

---

## 12. A reviewer that can write files is not a reviewer

**Rule (ours).** Reviewer roles use an allow list, never a deny list. No
allow-list role may name `bash`, `pwsh`, or any way to start an agent. No role
whose key contains `review` may name `write` or `edit`.

**Why.** A live test taught us this. With `write` and `edit` denied, a reviewer
still created a file with `echo hello > file` — a shell is a file-writing tool.
So we denied the shell too. Its tool list still held `workflow`, `ralph` and
desktop-control tools from an MCP server. (An MCP server is an outside tool
server that a deployment can plug in.) A deny list cannot name what a deployment
has not installed yet. An allow list does not have to.

**Lives in** `host/roles.js`, `tools/verify-mount.mjs`, `CLAUDE.md` design rule 2.

---

## 13. Every test lands on disk and runs again

**Rule.** An engineer's unit test is a file in the project's own test suite, named
in its task row and committed with the code. QA's cases are files too, in the
project's test framework, under `docs/qa/<task-id>/`, with a `run.sh` per
task and one `docs/qa/run-all.sh` that finds and runs them all. QA runs all
of them — including cases written for tasks that finished long ago — on every
task it checks, and an old case that now fails is a blocking regression.

**QA's test plan is not one of those files.** The plan is single-use: it exists to
turn the task's DoD items into cases, and once the cases are written the cases carry
the same information in a runnable form. So the plan is written to
`<job folder>/<task-id>-plan.md`, outside the repository, and it goes when the job
folder goes (principle 19). One part of it is durable and must not go with it:
**"what I could not test here, and why"**. That moves to `docs/qa/gaps.md`, a
standing list about this product's testability, grouped by the thing that cannot
be checked and never by task id. QA writes it there itself, in the same turn it
reports, because QA is the only role that knows why a thing could not be tested —
and nothing then depends on the plan still existing.

**Why (ours).** A crew job ends; the project does not. A case that only ever ran
inside an agent's shell proves something for ten minutes and then protects
nothing, so the next change breaks a promise nobody is watching. Written down,
the same cases become the project's regression suite, and each job leaves the
next one better guarded. This is the plain reading of the Scrum idea that quality
is built in: the Definition of Done has to survive the sprint that produced it.

**How the split is drawn.** Everything QA puts in the repository goes inside
`docs/qa/` — its cases, its `run.sh` files, and its entries in `gaps.md` — and
never into the product's own test folder. That keeps the existing file-ownership rule intact —
one task owns its files — and keeps a reviewer's question ("who wrote this test?")
answerable by the path alone. The cost is real and known: a runner that only
looks inside configured folders does not see `docs/qa/` on its own, so QA reports
that to the PM and the PM adds the one line that wires the folder in. "Not
runnable" is not an ending the PM may settle for. If that one line truly cannot
be written, it is a blocking finding the user has to hear, not a note. QA never
edits project config, and never moves its files to dodge the problem.

**And that line goes in the project's default test command.** A suite that runs
only when somebody remembers a second command rots, and that is a matter of time,
not of will. In this repository the line is `bash docs/qa/run-all.sh` at the end
of `npm test`, and `npm test` runs in CI on every push
(`.github/workflows/test.yml`); publishing stays on a `v*` tag and runs the same
checks again before it publishes, so a release never trusts an earlier push's
green.

Two costs, written down instead of discovered later. First, `npm test` gets
slower as cases pile up job after job — one day it needs layers (a fast check and
a full one), or a way to run only the last few tasks. Second, CI does not cover
everything: `tools/verify-mount.mjs` skips its role-tool half on any machine that
does not have `@deepseek-ai/dsh-tool-subagent` installed, and CI is such a
machine, because that package cannot be installed from the public registry. It
says out loud which half it skipped. Green CI here means "everything a public
runner can check", not "everything".

**Lives in** `roles/qa.md`, `roles/engineer.md` ("Your test is a file that
stays"), `roles/architect.md` (the test-file column in a task row),
`roles/pm.md` (step 4 **Write the opening document**, step 10c **QA**, step 11
**Commit**, step 12 **Milestone review**, step 18 **Finish**), `docs/qa/gaps.md` (which states its own
rules at the top), `package.json` (`scripts.test`),
`.github/workflows/test.yml`.

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html)

---

## 14. Documents are the only channel, and a change gets a CRD

**Rule.** Nothing that matters lives only in a message. A child's `report` points
at the file it wrote; the PM's answer points at the document it changed and that
document's new version. And any request that would change **what the user gets**
(scope, a DoD item, the milestone list) or **how two modules talk** (a
boundary contract) becomes a change request document — `docs/decisions/crd/NNNN-<short-name>.md` —
written by the PM before anything moves, whoever asked: the user, a role, or the
PM itself. A CRD is never deleted, and a rejected one stays.

Who decides: a contract fix that changes nothing the user sees is the PM's call,
reported at the next milestone review. Anything touching scope, a DoD item or the
milestone list needs the user's yes first.

**Why (ours).** The crew is flat, so a message reaches exactly one role and dies
there (principle 1). Two engineers building two sides of a boundary cannot
compare notes; if one of them was told something in a message, the other is
building against a different truth and nobody finds out until the halves are
joined. A document is the only thing every role, and every role started
tomorrow, reads the same way. The CRD adds the missing half of that: the record
of *why* a confirmed document changed, and who agreed to it. Without it a design
can drift a whole milestone and leave no trace of who asked.

**Why the scope is narrow.** A CRD for every question or review finding would
bury the ones that matter and put the PM in a writing job instead of a deciding
one. So an internal change that keeps the same behaviour and the same contract —
an ADR, an HLD detail, splitting one task in two — is only a version bump on the
document that owns it. A question the files can answer stays an inbox `Q-` file.
The one exception is the user overturning an ADR at a milestone review
(principle 17): the crew changing its own ADR is a version bump, but the user
changing a choice the crew already built on costs rebuilt work, so that one gets
a CRD.

**The channel is not the archive.** Being the only channel does not make a
document permanent. Some of the documents the crew talks through are single-use
and live in the job folder — QA's test plans, the `Q-` files in
`<job folder>/inbox/`, `state.json` itself — and they are dropped with the job
(principle 19). A DoD is no longer one of them: it is a section of a document that
stays in the repository, and principle 20 says what it cost to learn that. So the
rule has a second half. Anything that may not live only in a message may not live
only in a document that is about to be thrown away either — the reason is the
same one, that it has to be readable by somebody who is not here yet. A decision about **how** goes in an
ADR in `docs/decisions/adr/`, a decision about **what**, the scope or a contract
goes in a CRD in `docs/decisions/crd/`, a rule the crew must keep comes here, and
QA's untestable gaps go to `docs/qa/gaps.md`. That is why an ADR **quotes** the
engineer's `Q-` file word for word and may never say "options: see Q-03": the
pointer would outlive the file it points at, and the ADR's most valuable section
would be gone.

**Lives in** `roles/pm.md` ("Documents are the only channel", "Change requests",
"An ADR quotes, it never points"),
`roles/architect.md` ("When the PM sends you a CRD"), `roles/engineer.md`,
`roles/qa.md`.

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html) ·
[Change control in ISO 9001 / configuration management](https://en.wikipedia.org/wiki/Change_control)

---

## 15. A milestone that ships needs two written plans, and their shape is researched

**Rule.** When the user says a milestone ships, the PM writes two files before
anything is pushed: `docs/release/<milestone>-release.md` (version, release
notes, exact steps, who approves, how to check, how to undo) and
`docs/release/<milestone>-upgrade.md` (breaking changes, migration, skipped
versions, rollback, downtime). Their **shape is researched, not remembered**: the
PM asks a `crew_researcher` what those plans contain for this project type, with a
source and a date per claim, and reads what the repository already does first. A
milestone that is not shipping gets no plan — it gets a **gap list**: one honest
paragraph naming what is still missing before it could ship, carried forward and
shortened as milestones pass.

**Why.** The milestone stop already asks the user to judge direction (principle 5).
Shipping is the one part of that judgement the crew was silently leaving out, and
it is where the surprises live: a version scheme nobody agreed, a rollback nobody
tested, a token nobody has. Writing it down is also the only way the user can
approve the *plan* separately from the *push*.

**Why researched (ours).** These plans are not alike. An npm package cannot
un-publish a version; a mobile app waits for a store review; a web service rolls
back by redeploying; a database schema needs a migration that can run twice
safely. An agent writing from memory produces a plausible average plan that fits
none of them. The researcher lists what that type really needs, with dates,
because release habits go stale fast.

**Why not for every milestone.** A plan for a milestone nobody will ship is
fiction, and fiction that a reader may mistake for a decision. The gap list gives
the same early warning at a fraction of the cost, and turns into the real plan
when shipping starts.

**Lives in** `roles/pm.md` (step 12 **Milestone review** and step 13 **Release and
upgrade plans**), `roles/researcher.md`.

---

## 16. A branch is merged and deleted only on the user's word, and only when it is proven

**Rule (ours).** The PM merges the work branch into `main` and cleans it up only
when the user asks for it, and only with three separate yeses: one for the merge,
one for the push of `main`, one for deleting the branch. It never runs
`git merge --squash` and never `git branch -D`. Before it offers to delete, three
checks must each run **without an error** and give the answer it needs: the branch
is listed by `git branch --merged main`; `git log --oneline origin/main..main`
prints nothing; `git log --oneline main..origin/crew/<job-slug>` prints nothing.
The third check runs again in the same turn as the user's yes, just before the
delete. When a push of `main` would start a workflow that publishes, the PM warns
loudly and names the file — and still pushes when the user says yes. The
`<job-slug>` that all of these commands are built from has a fixed shape:
`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, at most 40 characters, never containing `..`.
The PM derives it from the user's job name itself and says in one line which slug
it will use.

**Why three separate yeses.** The merge, the push and the delete are three
different risks. A merge stays inside the repository and can be undone. A push of
`main` reaches everybody else and can start a release. A remote delete throws work
away for good. So one yes never carries over to the next thing: each one is asked
on its own, right before the command it pays for.

**Why never a squash.** The crew's output is one commit per task, each carrying
its test-first proof in the message. A squash merge replaces all of them with one
commit and one message. The history is the only place that proof survives the job,
so a squash would throw away the very thing the crew was built to produce.

**Why proof before the delete, and why the remote branch is the proof that
matters.** `git branch -d` refuses to delete a branch that is not merged, so the
local side already protects itself. `git push origin --delete` protects nothing.
If a commit reached the remote branch after the last push — from another machine,
another session, or somebody else — the delete destroys it with no warning, and no
disk anywhere holds a copy. That is why the third check reads the **remote**
branch and not the local one: `main..origin/crew/<job-slug>` must be empty.

**Why an empty output is not a proof.** A command that failed prints nothing
either. `git log --oneline origin/main..main` prints nothing when there is no
remote, when `origin/main` does not exist, and when the default branch has another
name — and read as a proof, that silence says "everything is pushed". So a check
counts only when the command itself ran without an error. Where the proofs can
never pass — no remote, or a work branch that was never pushed — the PM says the
local branch stays where it is and does not ask.

**Why the publish warning is loud but does not refuse (ours).** The user asked for
exactly this: warn plainly, then push if I say yes. The PM is the user's own
session, and refusing what the user just decided only teaches them to work around
the crew. What the warning must not do is cry wolf, so it follows the same rule
the crew's git guard uses — a workflow counts only when a **branch** push can
start it AND it publishes — instead of searching the CI files for the words
`npm publish`. This repository is the example: its `publish.yml` does contain
`npm publish`, but it is triggered by `tags:` only, so a push of `main` cannot
publish anything. A keyword search would warn on every single `main` push here,
and a warning that always fires teaches the user to say yes without reading it.

**Why the slug inside those commands has a fixed shape (ours).** The job slug is
not only a label. It is pasted into a file path
(`~/.dsh/crew/jobs/<job-slug>/state.json`) and into almost every git command of
step 7 **Branch** and step 17 **Merge and clean up**. A slug holding `..` writes
outside the jobs folder. A slug holding
a space or a `;` turns one command into two. And the session that runs those
commands is the PM's own — the root agent, the one the git guard trusts and lets
straight through. Two security reviews of the merge step landed on the same hole:
every command in this step assumes that value is safe, and nothing made it safe.
It is a rule in the prompt and not in the middleware because the PM invents the
slug itself; it is not input arriving from somewhere else. The PM converts the
user's words rather than asking them for a slug — asking moves a technical rule
onto the user and costs a turn, and refusing their job name is worse — and it says
the result out loud, so the user reads the folder and branch name before either
one exists.

**Why the window is only narrowed, not closed.** Between the third proof and the
delete a few seconds remain, and a commit can land inside them. Closing that gap
needs a delete that carries a lease, so that it refuses unless the remote branch
is still where it was — and this step forbids both `--force` and
`--force-with-lease` outright, whatever the guard would allow. Re-running the
proof in the same turn as the yes is the honest limit of this design, not a
guarantee. Say it that way; do not call it airtight.

**Lives in** `roles/pm.md` (step 6 **Job folder**, step 7 **Branch**, step 17
**Merge and clean up**, step 18 **Finish**), `tools/verify-mount.mjs`.

---

## 17. The one who finds the choice does not make it alone

**Rule (ours).** An engineer fixing a bug — a defect QA reported, a blocking
review finding, or one it hit while doing its own task — first finds at least
two ways that would really work. If the ways differ only in wording (same files,
same layer, same behaviour) it picks one, writes it, and says in its report
which ways it compared and why. If the difference **stays in the code** it
stops. Six things say the difference stays: which module owns the behaviour;
which layer holds the check or the fix; whether a boundary contract in
`docs/design/api/` is touched; whether a public name, command, config option or
output format changes; whether behaviour the user can see changes; whether speed
or compatibility changes. When it stops it uses the channel that already exists
— an `inbox/Q-<number>.md` file holding the cause of the bug, every way it found
(which files each one changes, what it costs, where it will hurt later), and
**the way it would pick, with the reason** — reports the task as blocked, and
works on another task it was given, if it can finish that one alone. The PM
decides by the same line a CRD uses: a difference the user can see goes to the
user; a difference that stays inside the code is the PM's own call, named at the
next milestone review — or, in small work that has no milestone review, in
the PM's finish summary; a way that would change a boundary contract gets a CRD.

Every such decision is written into a document before the engineer starts again,
and holds the same five things: the cause, **every** option with its cost and
**why it lost**, which one was chosen, who chose it, and the reason. It goes in an
ADR at `docs/decisions/adr/NNNN-<short-name>.md`, whatever the size of the job.
Big work may have a fresh architect write it; small work has no architect, so
the PM writes it itself, in the same shape. And every ADR — bug fix
or not — lists every option with its cost and why it lost, **marks** the one it
recommends with a one sentence reason, and
is written so a reader who has never seen the code can tell the options apart.
The design does not stop and wait: the architect keeps designing on its own
recommendation, the PM lays every choice of the milestone in front of the user
at the milestone review, and the user may overturn one — which is a CRD.

**Why options have to survive the choosing.** A choice that is made and not
written down disappears at the moment it is made. Whoever reads the code next
sees one road and no sign that there ever were others, so they cannot tell a
decision from an accident, and they cannot see what it bought. Six months later
the same question comes back and is answered the other way by somebody who never
knew it had been asked once. This principle is ours in a different way from the
rest: the user asked for it directly, after watching the crew choose in silence.
There is no outside source behind it.

**Why a bug fix counts.** A fix feels small while you are making it. Where the
check sits, which module carries the rule — those read like a coin toss at the
time, and then stay in the code for as long as the code lives. The choice is
usually bigger than the bug.

**Why not every fork.** Stopping at every fork would cost more than it saves: a
meeting for every typo. Wording, a name, the order of two lines — nobody outside
the file has to see those, so the engineer picks one and keeps moving. The test
is whether the difference will still be there next year, and the six items above
are that test written out so nobody has to guess.

**Why the engineer recommends.** It has just read the failing code, so it knows
which way will hurt. Asking it for a list and no opinion throws that knowledge
away. Recommending is not deciding — the PM still decides, and can pick another
way. This is the opposite of the researcher's rule on purpose: a researcher
answers a question of fact for a PM that has not judged yet, so a recommendation
there ends the judging before it starts. An engineer's recommendation arrives
after the PM already owns the decision.

**Why the PM's line is the CRD line.** A difference the user can see is a scope
question, and scope belongs to the user (principle 14). Reusing that same line
means there is one boundary to learn instead of two that can quietly drift
apart.

**Why the ADR shape got stricter.** An ADR used to be read by engineers, so "the
options you weighed" could be honoured with half a sentence and nobody was worse
off. Now the PM puts these files in front of the user at the milestone review,
so an option left out is a decision the user never got to make. That is why the
shape is strict: every option, why each one lost, and the recommended one
marked.

**Why the design does not wait.** One design can hold five ADRs. Stopping at
each one would stop the job five times, and would hand the user five questions
about the inside of the code. So the architect recommends and keeps going. The
cost is real and known: the user's check happens later, at the milestone review,
and overturning a recommendation then means redoing the tasks that were already
built on it, through a CRD. Options the **user can see** are the exception — the
PM asks about those on the spot and does not wait for the review.

**Lives in** `roles/engineer.md` ("When you fix a bug: find at least two ways
first"), `roles/architect.md` (**Your outputs**, decision records),
`roles/doc-reviewer.md` (check 7), `roles/pm.md` (step 10 **Check the finished
task** and step 12 **Milestone review**).

---

## 18. Agents run in parallel by default, and serializing needs a real reason

**Rule (ours).** Every task that can start now starts now, in one message. Two
tasks run together when their file lists do not overlap. The crew serializes
only for a real dependency: the two tasks share a file, or the later one has to
read what the earlier one wrote. Nothing else counts. One agent that would cover
several tasks is a signal to **split** the work, not to bundle it. Agent count
is never a reason to serialize — if a live-agent limit really is in the way, the
PM stops and asks the user. The three checks of step 10 **Check the finished
task** — code review, security
review, QA — also start together by default; running them in a fixed order is a
named exception the PM picks out loud for a risky change.

**Why the wording had to change (ours).** The old rule was a permission:
engineers *may* run at the same time when their files do not overlap. A
permission carries a default, and that default was one at a time. This job is
the evidence. Four tasks' worth of QA went into a single agent to save agent
count, and it took about four times as long as four agents would have. The user
asked why it was so slow. Agent count is easy to count, so it is easy to feel
good about saving it; the time the user waits is the resource that actually
costs, and it shows up in no report at all. A rule that only permits parallel
work loses that trade every time, so the default was moved.

**Why the fixed order stayed, as an exception.** Step 10's old reason is still
true for a risky change: each check should read code that has stopped moving,
because a blocking review finding changes the code and throws that round of QA
away. What was wrong is that this reason was doing two jobs at once — a good
reason for some changes, and a silent default for all of them. Now it is only
the first, and the PM has to name which of the two it picked, and why.

**An honest limit: no shared file does not mean no collision.** The test asks
about overlapping **writes** — two tasks may not own the same file. But every
engineer is also asked to prove its work by running the project's own suite, and
that suite reads *everyone's* files. So three tasks with no file in common can
still collide through their own verification. It happened twice in this job.
`roles/pm.md` and `tools/verify-mount.mjs` were being rewritten by one task
while another task's QA cases read them, and `docs/qa/run-all.sh` gave
three different answers in three minutes. The danger is not that a bad change
gets in; nothing landed that should not have. The danger is a **false red**,
which can send an engineer to fix something that was never broken, and a **false
green**, which hides a real failure behind a half-written file. The parallel test
itself still only asks about overlapping **writes**, and that has not changed —
what changed is that the engineer is now told what to do when the reading side
bites. `roles/engineer.md` ("A false red is not evidence") says it plainly: a red
from a check that reads a file another running task owns is not evidence about
your work, so name the file, say **"the tree was moving"**, and never weaken or
edit a case to make it green. What closes the hole is that instruction, not a new
test — no test can tell a half-written file from a broken one. And the run that
counts is still the PM's own, on a still tree, after every parallel task has
landed. An engineer's or QA's green is evidence, not the verdict.

**Lives in** `roles/pm.md` (step 9 **Run the tasks** and step 10 **Check the
finished task**), `roles/engineer.md` ("A false red is
not evidence").

---

## 19. Documents are split by how long they live, not by who was in the room

**Rule (ours).** A crew document's home is decided by one question: **does it
outlive the job?**

- **Durable, in the repository.** An ADR in `docs/decisions/adr/` for a decision
  about **how**; a CRD in `docs/decisions/crd/` for a decision about **what**, the
  scope or a contract; the opening document `docs/design/prd.md`, the task table
  `docs/design/tasks.md`, the design and the boundary contracts, all in
  `docs/design/`; QA's runnable cases and `gaps.md`, its standing list of what no
  case can check, in `docs/qa/`; a
  researcher's answers in `docs/research/`; the release and upgrade plans in
  `docs/release/`; a rule the crew must keep, here in `principles.md`. **Every DoD
  section rides in one of those two `docs/design/` files** — that is principle 20,
  and it is the correction this principle needed most.
- **Single-use, in the job folder** (`~/.dsh/crew/jobs/<job-slug>/`, outside the
  repository): **`state.json`**, which is progress and nothing else; **QA's test
  plans** (`<task-id>-plan.md`), because the cases carry the same information in a
  runnable form as soon as they are written; the **`Q-` files** in `inbox/`; and the
  **output of a test run**, which was never on disk and now may not be. A **DoD**
  used to head this list, and taking it off cost 75 acceptance checks (principle
  20).
- **Neither the size of the job nor who was in the room decides anything.** An
  ADR is written for a one-file bug fix as readily as for a milestone, and small
  work — which has no architect — has the PM write it.
- **Dropping a single-use document requires moving its durable half out first**,
  and only after the PM has given the user the final summary. There are **seven**
  destinations, not five: a rule goes to `principles.md`, a decision about how to
  an ADR, a decision about what to a CRD, this change's reasons and its real test
  numbers to the commit message, QA's "what I could not test here, and why" to
  `docs/qa/gaps.md`, **a DoD item's own wording** to `docs/design/tasks.md`, and
  **which files a task owns** to `docs/design/tasks.md`. The last two were added
  after each of them nearly leaked a second time; principle 20 has the count and
  the reason.

**Why not by who was in the room (ours).** The old rule sent a decision to an ADR
when there was an architect and to a **Decisions** section of the DoD when there
was not — back when a DoD was still a file of its own. So where a reader had to look depended on who happened to be staffed on
the job, which tells them nothing about the decision. An ADR does not need an
architect to exist; it needs a decision to exist.

**Why not by the size of the job.** That was the first alternative, and it repeats
the same mistake one step along: a year later, finding a decision would mean first
knowing whether that job was big or small. It also collides with the shapes of the
two file types. A CRD is built around changing something already agreed — who
asked, the scope, the cost, whether the user must say yes — and "there are two ways
to write this fix" has none of that: nobody asked, and nothing the user sees
changes. The proof is this crew's own job. It was **small work** and it wrote nine
CRDs (`0001`–`0009`), every one a real change to what was already agreed, and every
one decided by the user. Had small work's CRD folder been taken over by design
decisions, two completely different kinds of file would be lying in one folder.

**Why the record outlives the negotiation.** `state.json` is job progress wearing
a document's clothes: it lives outside the repository so the user's `git status`
stays clean, and it holds nothing a later reader needs. That reading was extended
to the DoD, and that was the mistake — principle 20 records what it cost, and the
DoD is now a section of a file that stays. The reasoning itself still holds, and
it is the more important half: what gets *written inside* a single-use document
usually is not single-use. That is the
asymmetry the split has to respect, and it is where this rule earns its keep: the
`Q-` file that an ADR quotes is dropped with the job, so an ADR must copy the
options in and may never point at the file; and the `Q-` files of this crew's own
job survived only because the PM happened to write their answers into documents —
nothing in the rules asked it to. Now something does.

**Why "not needed any more" has to be earned.** The cheap reading of "single-use"
is "delete it and move on", and that quietly means "lost". The migration step is
what makes the word honest. It also runs late on purpose: not when the acceptance
checks all turn green, but after the PM's final summary. This job's own DoD — a
file of its own at the time — had every check green at version 19 and then carried
five more rounds of decisions, up to version 26.

**The known cost.** Every job now ends with a step that produces files somebody
has to read — and a PM in a hurry can do it badly, which is worse than not having
the step, because the folder is gone afterwards either way. The doc reviewer's last
pass (step 15, **Last doc review**) and the PM's final summary are where that shows
up. It has already been paid once: see principle 20.

**Lives in** `roles/pm.md` (step 4 **Write the opening document**, step 10c **QA**,
step 11 **Commit**, step 18 **Finish**, and the hard rules),
`roles/qa.md` (the plan's home, and its step 6 **Feed the standing gap list**),
`roles/engineer.md`,
`roles/architect.md`, `roles/doc-reviewer.md`, `docs/qa/gaps.md`,
`docs/decisions/crd/0006-split-by-lifetime.md` (the change request that settled
it) and `docs/decisions/crd/0010-dod-is-a-section.md` (the one that took the DoD
off the single-use list).

---

## 20. Every change leaves a record in the repository, and one table holds the whole flow

**Rule (ours).** Any change, requirement or decision — big or small — has to leave
a record that **survives the job**. Surviving has exactly one meaning here: **the
record is in the repository.** The job folder is not a record. It is progress, and
it is dropped when the job ends.

So `DoD` is the name of a **section**, never the name of a file. There is no
`dod.md`, in any folder, including `docs/design/`. Both lanes open with the same
document, `docs/design/prd.md`, and both keep one task table,
`docs/design/tasks.md`. Every milestone carries a DoD section (big work) and every
task row carries one (both lanes), and a DoD section says two things at least:
what "done" means for that one thing, and **how somebody else checks it** — which
QA case under `docs/qa/<task-id>/`, and which exact command. A check is an item
inside one of those sections, named that way ("item 2 of T-05's DoD"). There is no
globally numbered list of checks anywhere.

**The flow is one table.** The workflow (which step, who does it) and the document
flow (what that step produces, where it lives, whether it survives) are columns of
the same table, never two tables. The `Lane` column says which of the three lanes
the row belongs to — `big`, `small`, `bug` — so each lane is covered without
repeating a row that all three share.

| Lane | Step, by name | Who does it | What it produces | Where that lives | Survives the job? |
| --- | --- | --- | --- | --- | --- |
| all | Step 1 of the lane rules, **Pick a lane** | PM | one line naming the lane (`[lane: team]`) | the reply to the user | No — and nothing needs it. Only the `team` lane runs the steps below |
| team | Step 1, **Language** | PM asks, user answers | the language every crew document is written in | the documents themselves; `state.json` names it | The documents, yes. `state.json`, no |
| team | Step 2, **Grill** | PM asks, user answers | settled answers, one question per turn | nothing of its own — they become the content of step 4, **Write the opening document** | No. Step 4 is where they land |
| team | Step 3, **Language and stack** | PM decides, user confirms; a `crew_researcher` when the choice is real | the **Language and stack** section: language and version, package manager, framework, database, test framework with its exact command. Plus the researcher's answer, with a source per claim | the section in `docs/design/prd.md`; the answer in `docs/research/<short-name>.md` | Yes, both |
| team | Step 4, **Write the opening document** | PM | `docs/design/prd.md`. Small work: goal, out of scope, Language and stack. Big work: the same file with the problem, the users, success, risks, open questions and the **milestones, each with a DoD section** | `docs/design/prd.md` | Yes |
| small, bug | Step 4, **Write the task table** | PM, because small work has no architect | `docs/design/tasks.md`: one row per task with an id, one sentence of work, the exact files it owns, the test file it must write, and its **DoD section** | `docs/design/tasks.md` | Yes |
| bug | **A bug becomes a task row** — before any engineer starts | PM, never the engineer that will do the fix | one row: **what was reported** (who reported it, the command, the input, what happened, what was expected) and its **DoD section** (the failing case that must exist and pass, and the behaviour that must change) | `docs/design/tasks.md` | Yes |
| team | Step 5, **Confirm** | PM asks, user answers | the user's yes on the document, on the stack, and — big work — on the milestone list on its own | no file; the confirmed document is the record | No, and the document carries it |
| team | Step 6, **Job folder** | PM | `state.json`: tasks, milestones, document versions, the CRD list, the merge result | `~/.dsh/crew/jobs/<job-slug>/state.json` | **No, on purpose.** It is progress, not a record, and it stays out of the user's `git status` |
| team | Step 7, **Branch** | PM | the work branch `crew/<job-slug>` | git | The branch is deleted in step 17, **Merge and clean up**. Its commits stay on `main`, so the work survives |
| big | Step 8, **Design** | `crew_architect` | `docs/design/hld.md`; `docs/design/tasks.md` with a **DoD section on every row**; one contract per boundary; an ADR per open choice, with every option and why it lost | `docs/design/`, `docs/design/api/<caller>-<callee>.md`, `docs/decisions/adr/` | Yes |
| big | Step 8, **Doc review before any code** | `crew_doc_reviewer` | findings, each blocking or optional — including "this row has no DoD section" | its report to the PM; the fix lands in the document | The report, no. The corrected documents, yes |
| team | Step 9, **Run the tasks** | PM starts one `crew_engineer` per task | the code and its test file, both named in the task row, with the failing run shown before the passing one | the project's own source and test folders | Yes |
| team | Step 9 or 10, **a question the files cannot answer** | engineer, QA or architect | `inbox/Q-<number>.md`: the cause, every way found, the files each one changes, its cost, and the way it recommends | `<job folder>/inbox/` | **No** — which is why the ADR below **quotes** it word for word and may never point at it |
| team | Step 10a, **Code review** | `crew_code_reviewer` | findings with file and line, each blocking or optional | report to the PM; fixes land in the code | The report, no. The code, yes |
| team | Step 10b, **Security review** | `crew_security_reviewer`, when the change earns one | findings, or the PM's stated reason it was skipped | report to the PM; the skip reason goes into step 12 **Milestone review** or step 18 **Finish** | The report, no. The reason, yes, in the summary |
| team | Step 10c, **QA** | `crew_qa` | the test plan, written from the document before it reads the code; then runnable cases, a `run.sh` per task and `docs/qa/run-all.sh`; then what no case can check | plan in `<job folder>/<task-id>-plan.md`; cases in `docs/qa/<task-id>/`, with any helper they share in `docs/qa/lib/`; gaps in `docs/qa/gaps.md` | Plan, no — the cases say the same thing in a form that runs. Cases and gaps, yes |
| team | Step 10, **two ways to fix — the PM decides** | PM; the user when they can see the difference | an ADR: the cause, **every** option with its cost and why it lost, the choice, who decided, and the reason | `docs/decisions/adr/NNNN-<short-name>.md` | Yes |
| team | Any step, **a change to scope, a DoD item, the milestone list or a contract** | PM, whoever asked | a CRD — and the DoD items it adds are written into the task row or the milestone it changes, with a note in the CRD of where they went and how many | `docs/decisions/crd/NNNN-<short-name>.md`, plus `docs/design/tasks.md` or `docs/design/prd.md` | Yes |
| team | Step 11, **Commit** | PM, the only one who uses git | the commit: the task's files, QA's cases, its `gaps.md` entries, any ADR or CRD — and the message, which carries this change's reasons and its real test numbers | git history | Yes |
| big | Step 12, **Milestone review** | PM reports, user answers | what works now, how to try it, what is missing, the real test numbers, every CRD and every ADR of that milestone, one line each | the reply to the user; whatever the user decides becomes a CRD | The report, no. Its decisions, yes |
| big | Step 13, **Release and upgrade plans**, for a milestone that really ships | PM plus a `crew_researcher`, with a source and a date per claim | `<milestone>-release.md` and `<milestone>-upgrade.md`; or, when nothing ships, a gap list naming what is still missing | `docs/release/` | The plans, yes. The gap list travels in the review and is carried forward by hand |
| team | Step 14, **README** | PM | `README.md` in English, plus `README-<lang>.md` when the job's language is not English | the repository root | Yes |
| team | Step 15, **Last doc review** | `crew_doc_reviewer` | findings on every document this job produced or changed, the README included | report to the PM; fixes land in the documents | The report, no. The documents, yes |
| team | Step 16, **Push and CI** | PM, with the user's yes every single time | the pushed commits, and `merge.publishCheck` — the CI files that were read and whether this push would publish | the remote; `state.json` | The commits, yes. `publishCheck`, no, and it is re-read after a restart |
| team | Step 17, **Merge and clean up** | PM, three separate yeses | the merge commit on `main`, never squashed, so every task's commit and its test-first proof stay readable; then the deleted branch | git history | Yes |
| team | Step 18, **Finish**, and the migration inside it | PM | every DoD section re-read and confirmed item by item, the real numbers from both test commands, the closing summary — and then the durable half moved out of everything about to be dropped, to **seven** destinations | a rule to `principles.md`; a decision about how to `docs/decisions/adr/`; a decision about what, the scope or a contract to `docs/decisions/crd/`; the reasons and the test numbers to the commit message; what no case can check to `docs/qa/gaps.md`; **a DoD item's own wording to `docs/design/tasks.md`**; **which files a task owns to `docs/design/tasks.md`** | Everything it moves, yes. The job folder goes, and a test run's output was never a file at all |

**The matching rule, and it is meant to be checked.** Every step that produces a
document appears in that table, and every crew document in the repository has a
step in that table that produces it. Run it in both directions. A surplus on the
step side means a step writes something nobody can find; a surplus on the document
side means a file exists that no rule asked for. Either way the rules and the
repository have come apart, and the table is the thing to fix first.

Run on this repository, it already finds one: **`CHANGELOG.md` exists and no step
produces it.** Step 13 writes "the release notes a user will read" into a release
plan, and a changelog is where those notes actually live in a package like this
one, but no step says so, and a changelog is written per change rather than once
per release. That is a real hole, written down here rather than left to be
discovered — which is the whole point of running the rule in the second
direction.

**Why (ours): 75 acceptance checks were lost in an hour.** The closing migration
step named five destinations — a rule to `principles.md`, a decision about how to
an ADR, a decision about what to a CRD, this change's reasons and test numbers to
the commit message, a testability gap to `docs/qa/gaps.md`. **A DoD item's own
wording is none of those five.** It is not a rule, not a how-decision, not a
scope decision, not a test number, not a gap. So when this crew's own job folder
was dropped, all 75 of its acceptance checks went with it — they fell between all
five destinations at once. Four change requests still pointed at check numbers that
no document defined any more (CRD `0001`'s 18-21, `0002`'s 44-46, `0005`'s 33,
`0006`'s 67), and 22 pushed commit subjects named a task whose defining document
had been deleted.

**The recovery, measured.** Digging the checks back out of the repository got
**48 of 75 back with their wording**, **7 back with only a number and a topic**,
and **20 lost outright**. 46 of those 48 came from one place nobody had planned as
an archive: the header comment each of the 42 QA cases writes about which check it
covers. The lesson is not "we were lucky". It is that the only parts that survived
were the parts that had been written into the repository for another reason.

**Why the root cause was an asymmetry, not a location.** Big work's opening
document lived in `docs/design/` and survived every job. Small work's opening
document lived in the job folder and was destroyed by design. The two are the same
position in the flow, played by the same role, and the destroyed one was the one
that carried the acceptance checks. Moving a file would have fixed one case; giving
both lanes the same document, in the repository, fixes the class.

**Why the DoD is not folded into a CRD.** That was the first shape proposed, and it
is wrong for a reason worth keeping: a CRD is the record of one decision at one
moment and must never be rewritten, while a DoD is a living document — this job's
went through 26 versions. One file cannot be both an immutable record and a living
document. The answer was not a different file, it was **no file**: what "done" means
grows inside the thing it belongs to.

**Why the flat numbered list of checks is gone.** A global number points into a
table that nobody keeps in step with the work. Three of this job's own checks
failed *as checks* for exactly that reason: check 11 contradicted checks 48-52
(it forbade touching anything under `host/` except the guard, while a later task
had to change `host/crew.js`), check 67 was too literal to pass on correct code,
and check 70 pointed at a folder that no longer existed once the documents moved. A check that sits
next to the task it governs is read by the person doing that task, so it gets
fixed instead of rotting.

**Why a bug's DoD section is written by the PM, before the fix.** Test-first does
produce a test — but the person doing the fix writes it. That is precisely how a
fix for a symptom passes: the engineer writes a test for the behaviour it decided
to fix, and before it started, nobody else had said what "fixed" means. Two people,
two moments: the PM says what fixed means, then the engineer proves it. This is the
`team` lane only. A `quick` fix — a typo, a one-line change — stays a well-written
commit message, or the rule reads as "every typo needs a document" and nobody
follows it at all.

**Why one file name for both lanes.** It removes a name instead of adding one. The
weight belongs in the content, not in the file name: a small job's
`docs/design/prd.md` is three paragraphs, and that is correct rather than lazy. Two
names for the same position in the flow is what produced the asymmetry above.

**Why one table and not two.** Two descriptions of one thing drift apart, and this
repository has been bitten by that three times: the README against the code,
`CLAUDE.md` against the folder layout, and step 17's own sentence against what the
git guard really covers. A workflow table beside a document table is the same
entrance, left open on purpose. One table can still be wrong, but it cannot
disagree with itself.

**Why a step is named and not only numbered.** Principle 13's pointer once read
"step 17" and meant Finish. Then the merge step took 17, Finish became 18, and the
pointer was stale the moment the new step landed. A pointer that reads "step 18,
Finish" still finds its target after the numbers move, and a reader can see when
the two halves disagree.

**An honest limit: the migration step now has seven destinations, and it still
runs on trust.** The two new ones exist because two more things nearly leaked a
second time, in the very job that was cleaning up after the first leak. A DoD
item's wording: check 67's text survived only inside
`<job folder>/inbox/Q-19.md`, a file the rules mark for deletion, and it was
copied into `docs/design/tasks.md` by hand. Which files a task owns: that list
survived only because one QA case happened to hardcode it into an assertion. Both
were coincidences. Seven destinations is a longer list than five, not a proof that
the list is complete — the next thing to leak will be the next thing nobody thought
to name. And the step is still done by a PM in a hurry, after the folder's contents
are the only copy. The matching rule above is the cheapest defence there is: if a
document exists that no step produces, or a step produces something no destination
holds, that is the leak, before it happens.

**Lives in** `roles/pm.md` (**A bug becomes a task row, and you write its DoD
section first**, step 4 **Write the opening document**, step 8 **Design**, step 9
**Run the tasks**, step 10c **QA**, step 18 **Finish**, and the hard rules),
`roles/architect.md` (**Task breakdown**), `roles/engineer.md` (what to read
first, and the bug-fix section), `roles/qa.md` (the plan starts from the task's
DoD section), `roles/doc-reviewer.md` (check 1),
`docs/design/tasks.md` (this job's own rebuilt table, with every recovered check
and every lost one marked as lost),
`docs/decisions/crd/0010-dod-is-a-section.md` (the change request that settled it,
with its own corrections at the end), `CLAUDE.md` (**State and documents**), both
READMEs.

---

## What we looked at and did not take

| Idea | Why not |
| --- | --- |
| API version numbers, deprecation notice of 6–12 months | A job lasts hours. There is no second consumer to give notice to. The additive habit (principle 10) is the part that survives at this size. |
| Standups, sprint planning, retrospectives | Every ceremony is peers talking to peers. Crew roles cannot talk to each other at all, so these become the PM talking to itself. |
| A throwaway proof of concept, deleted after review | Considered for `M1`. Rejected: it makes the crew build the same thing twice. `M1` is the walking skeleton instead, and its code is kept and grown. |
| A named Definition of Ready, with INVEST | Our task rules already require independence (no shared files), small size, and a named test. A separate checklist would mostly repeat them. Worth revisiting if task rows start arriving unfinished. |
| arc42's quality requirements, crosscutting concepts and glossary sections | Real value for a large system, but `hld.md` is written fresh for every job, including small ones. The cost is empty sections; the benefit needs a project big enough to have crosscutting concerns. Worth revisiting. |
| Consumer-driven contracts, where the calling side owns the contract | Assumes two teams that negotiate. We have one architect writing both sides of the contract, so the architect owns every contract file and the caller/callee split is only about who builds what. |
| QA writing its cases straight into the project's test folder | One test command for everything, and CI would run the QA cases too. Rejected: QA would then own files inside the product, which breaks the rule that one task owns its files, and makes an engineer's and a reviewer's job harder to tell apart. `docs/qa/` plus `run-all.sh` buys the same protection without moving that line. |
| QA cases as plain shell scripts, one exit code each | Portable and needs no framework. Rejected: a shell can only test what a shell can reach, so a library's return value or a browser app has to be squeezed through a command, and the assertions end up weaker than the ones the project already has. The project's own framework is used instead, with the runner-cannot-see-the-folder problem handled by asking the PM. |
| A CRD for every request, question and review finding | A complete audit trail, and nothing lost. Rejected: most of those are answered from the files in one turn, and the PM would spend the job writing records instead of deciding. Scope and contract changes are the ones that cost real work, so those are the ones that get a file. |
| The PM deciding scope changes on its own, and telling the user later | Faster, and the CRD folder would still hold the history. Rejected: it defeats the milestone stop (principle 5). The whole reason milestones exist is that the user judges direction while changing it is cheap. |
| The architect chooses the stack | It is the most technical decision in the job, so this looked right. Rejected: small work has no architect, the design already depends on the stack, and the user has to approve it — and only the PM talks to the user. The architect designs inside the stack instead, and must say so if the stack cannot carry the design. |
| Each engineer picks its own libraries in a new repository | This is what the old principle 8 implied. Rejected once the crew met an empty repository: roles cannot talk, so two engineers pick two languages and two test frameworks and nobody notices until the halves are joined. QA's cases would split the same way. |
| The researcher recommends a stack | It has the sources in front of it. Rejected: a researcher that recommends is deciding, and its findings are then read as a verdict nobody approved. It lists candidates and costs; the PM decides and the user confirms. |
| A full release and upgrade plan at every milestone | The user asked for exactly this first, then chose the narrower rule with the cost in front of them. A plan for a milestone nobody ships is written from guesses, and a reader cannot tell a guessed plan from an agreed one. The gap list carries the warning instead. |
| The PM writing the release plan from what it knows | Faster, and it would look right. Rejected: the plans differ so much by project type that a remembered one is an average of all of them — it would tell an npm package to roll back by redeploying, and a mobile app to un-publish. A researcher with dated sources answers for the actual type. |
| The release plan doubling as permission to push | It would save a round trip. Rejected: a plan is written once and a push happens many times. Approving the plan is not approving each run of it, and the push rule (ask every single time) is the one that has kept a wrong push from happening. |
| A squash merge, so `main` gets one tidy commit per job | Rejected: the crew's one commit per task, each with its test-first proof, is the record. A squash keeps the code and deletes the record. |
| The user merges the branch by hand, and the PM only cleans up afterwards | Rejected: the PM is the only one who uses git, and it is the one that knows which tasks are committed and whether CI is green. Handing the merge back splits that knowledge, and the clean-up would then be proved against work the PM never did. |
| Refusing a push of `main` that would start a publishing workflow | Considered, and the user chose the loud warning instead, with the cost in front of them. A refusal in the user's own session is a rule they would route around, and the guard already refuses the same push from every child. |
| Closing the gap between the last proof and the remote delete with a leased delete | It would make the delete safe against a commit that arrives while the user is thinking. Rejected: it is the `--force-with-lease` shape, and this step forbids every force form — that ban is what has kept a wrong push from happening. Re-running the proof in the same turn narrows the window, and the limit is written down instead of hidden. |
| Checking the job slug's shape in the git guard instead of the prompt | Rejected: the slug is not input arriving from outside, it is a value the PM invents in step 6, **Job folder**. The middleware reads command text and would only see the damage after the fact, while the guard trusts the root session anyway. The place to make a value safe is where it is made. |
| The team writes its own Definition of Done (Scrum) | Ours is written by the PM and confirmed by the user. There is no self-organising team here to agree on anything, and the user is the only one who can say what "done" is worth. |
| A new document type, `docs/decisions/fix/<task-id>.md`, for bug-fix choices | Rejected: an ADR is already the file that records one open choice, so a second type would give the same thing two homes and split the place a reader has to look. Small work writes an ADR too (principle 19), so there is no size of job left for a second folder to serve. |
| Sending a small job's decision to a **Decisions** section of the DoD | This was the rule for one day, and principle 19 replaced it. Rejected: it made the home of a decision depend on whether the job had an architect, and the DoD was then a file of its own, single-use — the decision would have been dropped with the job folder. Principle 20 has since removed that file altogether. |
| Folding the DoD into a CRD, as a section of it | The user's first shape, and it keeps every check in the repository. Rejected after the PM pushed back, and the user then tightened it further himself: a CRD is the record of one decision at one moment and must never be rewritten, while a DoD is a living document — this job's went through 26 versions. One file cannot be both. What replaced it is not another file but **no file**: the DoD grows inside the thing it belongs to. |
| Keeping a `dod.md`, but moving it into `docs/design/` so it survives | The one-line fix, and it would have saved this job's 75 checks. Rejected: it fixes one case and leaves the class. Two names for the same position in the flow is what produced the asymmetry in the first place — big work opened with a PRD, small work with a DoD — so the shape that holds is one opening document for both lanes, with the checks living in the task or milestone they belong to. |
| A global, numbered list of acceptance checks | It reads well in a review and gives every check a short name. Rejected on this crew's own evidence: three of its 75 checks failed *as checks* because they sat far from the work they governed (11 contradicted 48-52, 67 was too literal, 70 pointed at a renamed folder), and four CRDs still point at numbers no document defines. A check now lives in the DoD section of its task or milestone and is named that way. |
| Every ADR stops and waits for the user to pick | Rejected: one design often holds several ADRs, so the job would stop once per ADR and the user would be interrupted with choices about the inside of the code. The architect marks a recommendation and the design keeps moving; the user sees every option at the milestone review and may overturn one. Options the user can see are still asked on the spot. |

---

## Keeping this file honest

- When you change a rule in `roles/*.md`, change the principle here that carries
  it. A rule with no reason written down is the next one somebody deletes.
- When you add a rule that came from a live failure, write it as **(ours)** and
  say what failed. That sentence is worth more than any link.
- When you take an idea from outside, link the source. When you reject one, put
  it in the table above with the reason. The rejections save the next person from
  re-running the same search.
