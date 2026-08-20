# Crew principles

This file says **why** the crew works the way it does.

Every rule in `roles/*.md` is short and bossy on purpose — a role prompt is read
by a model that has to act, not argue. The reasons live here instead. Read this
before you change a role, so you do not remove a rule without seeing the cost it
was paying for.

Who "the user" means in this file: whoever installed the plugin and is running
the session. Not the person who wrote the plugin.

Short names used below: **PRD** (product requirements document), **DoD** (definition of done),
**HLD** (high level design, the file `docs/crew/hld.md`), **ADR** (architecture decision record),
**CRD** (change request document), **QA** (the role that tests the result).

Each principle below has:

- **Rule** — what the crew actually does.
- **Why** — the reason, in one or two sentences.
- **Lives in** — the files that carry it. Change one, check the others.
- **Source** — where the idea comes from, when it comes from outside.

A principle marked **(ours)** came from running the crew and watching it fail, not
from a book. Those are the ones a newcomer is most likely to delete.

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
boundary in `docs/crew/api/<caller>-<callee>.md`. It holds the style, the format,
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

**Lives in** `roles/pm.md` (steps 4, 5, 8, 9, 12), `roles/architect.md`,
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
and the **user confirms it**, as a *Language and stack* section in the PRD or DoD:
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

**Why the PM and not the architect.** Small DoD work has no architect at all, and
the design itself depends on the stack, so it must be settled before the architect
starts. Facts still come from a researcher — it lists candidates with costs and
sources and is forbidden to recommend one — so "the PM decides" does not mean the
PM guesses.

**Lives in** `roles/pm.md` (step 3), `roles/researcher.md`,
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
project's test framework, under `docs/crew/qa/<task-id>/`, with a `run.sh` per
task and one `docs/crew/qa/run-all.sh` that finds and runs them all. QA runs all
of them — including cases written for tasks that finished long ago — on every
task it checks, and an old case that now fails is a blocking regression.

**Why (ours).** A crew job ends; the project does not. A case that only ever ran
inside an agent's shell proves something for ten minutes and then protects
nothing, so the next change breaks a promise nobody is watching. Written down,
the same cases become the project's regression suite, and each job leaves the
next one better guarded. This is the plain reading of the Scrum idea that quality
is built in: the Definition of Done has to survive the sprint that produced it.

**How the split is drawn.** QA writes only inside `docs/crew/qa/`, never into the
product's own test folder. That keeps the existing file-ownership rule intact —
one task owns its files — and keeps a reviewer's question ("who wrote this test?")
answerable by the path alone. The cost is real and known: a runner that only
looks inside configured folders will not see `docs/crew/qa/`, so QA reports that
to the PM and the PM either adds the one config line or records the cases as not
runnable. QA never edits project config, and never moves its files to dodge the
problem.

**Lives in** `roles/qa.md`, `roles/engineer.md` ("Your test is a file that
stays"), `roles/architect.md` (the test-file column in a task row),
`roles/pm.md` (steps 4, 10c, 11, 12, 18).

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html)

---

## 14. Documents are the only channel, and a change gets a CRD

**Rule.** Nothing that matters lives only in a message. A child's `report` points
at the file it wrote; the PM's answer points at the document it changed and that
document's new version. And any request that would change **what the user gets**
(scope, an acceptance check, the milestone list) or **how two modules talk** (a
boundary contract) becomes a change request document — `docs/crew/crd/NNNN-<short-name>.md` —
written by the PM before anything moves, whoever asked: the user, a role, or the
PM itself. A CRD is never deleted, and a rejected one stays.

Who decides: a contract fix that changes nothing the user sees is the PM's call,
reported at the next milestone review. Anything touching scope, an acceptance
check or the milestone list needs the user's yes first.

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

**Lives in** `roles/pm.md` ("Documents are the only channel", "Change requests"),
`roles/architect.md` ("When the PM sends you a CRD"), `roles/engineer.md`,
`roles/qa.md`.

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html) ·
[Change control in ISO 9001 / configuration management](https://en.wikipedia.org/wiki/Change_control)

---

## 15. A milestone that ships needs two written plans, and their shape is researched

**Rule.** When the user says a milestone ships, the PM writes two files before
anything is pushed: `docs/crew/release/<milestone>-release.md` (version, release
notes, exact steps, who approves, how to check, how to undo) and
`docs/crew/release/<milestone>-upgrade.md` (breaking changes, migration, skipped
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

**Lives in** `roles/pm.md` (steps 12 and 13), `roles/researcher.md`.

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
steps 7 and 17. A slug holding `..` writes outside the jobs folder. A slug holding
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

**Lives in** `roles/pm.md` (steps 6, 7, 17 and 18), `tools/verify-mount.mjs`.

---

## 17. The one who finds the choice does not make it alone

**Rule (ours).** An engineer fixing a bug — a defect QA reported, a blocking
review finding, or one it hit while doing its own task — first finds at least
two ways that would really work. If the ways differ only in wording (same files,
same layer, same behaviour) it picks one, writes it, and says in its report
which ways it compared and why. If the difference **stays in the code** it
stops. Six things say the difference stays: which module owns the behaviour;
which layer holds the check or the fix; whether a boundary contract in
`docs/crew/api/` is touched; whether a public name, command, config option or
output format changes; whether behaviour the user can see changes; whether speed
or compatibility changes. When it stops it uses the channel that already exists
— an `inbox/Q-<number>.md` file holding the cause of the bug, every way it found
(which files each one changes, what it costs, where it will hurt later), and
**the way it would pick, with the reason** — reports the task as blocked, and
works on another task it was given, if it can finish that one alone. The PM
decides by the same line a CRD uses: a difference the user can see goes to the
user; a difference that stays inside the code is the PM's own call, named at the
next milestone review — or, in small DoD work that has no milestone review, in
the PM's finish summary; a way that would change a boundary contract gets a CRD.

Every such decision is written into a document before the engineer starts again,
and holds the same five things: the cause, **every** option with its cost and
**why it lost**, which one was chosen, who chose it, and the reason. PRD work
puts it in an ADR written by a fresh architect; small DoD work has no architect,
so the PM writes it into a **Decisions** section of `docs/crew/dod.md`, in the
same shape. And every ADR — bug fix or not — lists every option with its cost
and why it lost, **marks** the one it recommends with a one sentence reason, and
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
`roles/doc-reviewer.md` (check 7), `roles/pm.md` (steps 10 and 12).

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
| QA writing its cases straight into the project's test folder | One test command for everything, and CI would run the QA cases too. Rejected: QA would then own files inside the product, which breaks the rule that one task owns its files, and makes an engineer's and a reviewer's job harder to tell apart. `docs/crew/qa/` plus `run-all.sh` buys the same protection without moving that line. |
| QA cases as plain shell scripts, one exit code each | Portable and needs no framework. Rejected: a shell can only test what a shell can reach, so a library's return value or a browser app has to be squeezed through a command, and the assertions end up weaker than the ones the project already has. The project's own framework is used instead, with the runner-cannot-see-the-folder problem handled by asking the PM. |
| A CRD for every request, question and review finding | A complete audit trail, and nothing lost. Rejected: most of those are answered from the files in one turn, and the PM would spend the job writing records instead of deciding. Scope and contract changes are the ones that cost real work, so those are the ones that get a file. |
| The PM deciding scope changes on its own, and telling the user later | Faster, and the CRD folder would still hold the history. Rejected: it defeats the milestone stop (principle 5). The whole reason milestones exist is that the user judges direction while changing it is cheap. |
| The architect chooses the stack | It is the most technical decision in the job, so this looked right. Rejected: small DoD work has no architect, the design already depends on the stack, and the user has to approve it — and only the PM talks to the user. The architect designs inside the stack instead, and must say so if the stack cannot carry the design. |
| Each engineer picks its own libraries in a new repository | This is what the old principle 8 implied. Rejected once the crew met an empty repository: roles cannot talk, so two engineers pick two languages and two test frameworks and nobody notices until the halves are joined. QA's cases would split the same way. |
| The researcher recommends a stack | It has the sources in front of it. Rejected: a researcher that recommends is deciding, and its findings are then read as a verdict nobody approved. It lists candidates and costs; the PM decides and the user confirms. |
| A full release and upgrade plan at every milestone | The user asked for exactly this first, then chose the narrower rule with the cost in front of them. A plan for a milestone nobody ships is written from guesses, and a reader cannot tell a guessed plan from an agreed one. The gap list carries the warning instead. |
| The PM writing the release plan from what it knows | Faster, and it would look right. Rejected: the plans differ so much by project type that a remembered one is an average of all of them — it would tell an npm package to roll back by redeploying, and a mobile app to un-publish. A researcher with dated sources answers for the actual type. |
| The release plan doubling as permission to push | It would save a round trip. Rejected: a plan is written once and a push happens many times. Approving the plan is not approving each run of it, and the push rule (ask every single time) is the one that has kept a wrong push from happening. |
| A squash merge, so `main` gets one tidy commit per job | Rejected: the crew's one commit per task, each with its test-first proof, is the record. A squash keeps the code and deletes the record. |
| The user merges the branch by hand, and the PM only cleans up afterwards | Rejected: the PM is the only one who uses git, and it is the one that knows which tasks are committed and whether CI is green. Handing the merge back splits that knowledge, and the clean-up would then be proved against work the PM never did. |
| Refusing a push of `main` that would start a publishing workflow | Considered, and the user chose the loud warning instead, with the cost in front of them. A refusal in the user's own session is a rule they would route around, and the guard already refuses the same push from every child. |
| Closing the gap between the last proof and the remote delete with a leased delete | It would make the delete safe against a commit that arrives while the user is thinking. Rejected: it is the `--force-with-lease` shape, and this step forbids every force form — that ban is what has kept a wrong push from happening. Re-running the proof in the same turn narrows the window, and the limit is written down instead of hidden. |
| Checking the job slug's shape in the git guard instead of the prompt | Rejected: the slug is not input arriving from outside, it is a value the PM invents in step 6. The middleware reads command text and would only see the damage after the fact, while the guard trusts the root session anyway. The place to make a value safe is where it is made. |
| The team writes its own Definition of Done (Scrum) | Ours is written by the PM and confirmed by the user. There is no self-organising team here to agree on anything, and the user is the only one who can say what "done" is worth. |
| A new document type, `docs/crew/fix/<task-id>.md`, for bug-fix choices | Rejected: an ADR is already the file that records one open choice, so a second type would give the same thing two homes and split the place a reader has to look. And small DoD work writes no ADR at all — a **Decisions** section inside `docs/crew/dod.md` carries the same five things without a new folder to keep in step. |
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
