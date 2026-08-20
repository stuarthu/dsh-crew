# Crew principles

This file says **why** the crew works the way it does.

Every rule in `roles/*.md` is short and bossy on purpose — a role prompt is read
by a model that has to act, not argue. The reasons live here instead. Read this
before you change a role, so you do not remove a rule without seeing the cost it
was paying for.

Who "the user" means in this file: whoever installed the plugin and is running
the session. Not the person who wrote the plugin.

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

**Lives in** `roles/pm.md` (steps 3, 4, 7, 8, 11), `roles/architect.md`,
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

**Lives in** `roles/engineer.md`, `roles/pm.md`, `roles/code-reviewer.md`.

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

## 8. The architect picks the shape, the engineer picks the library

**Rule.** The architect says "HTTP/REST, JSON" or "in-process call, typed
objects". It never says "FastAPI" or "grpc-go". Which framework or helper writes
it is the engineer's call, using what the repository already uses.

**Why.** Architect job descriptions put boundaries, patterns and standards with
the architect, and implementation with the engineers. Crossing that line costs
twice. The architect knows the repository's habits less well than the engineer
reading the code around the change. And a named library in a design document
starts an argument the crew has no way to hold.

**Lives in** `roles/architect.md`, `roles/doc-reviewer.md` (a named library in a
contract is a finding).

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

## What we looked at and did not take

| Idea | Why not |
| --- | --- |
| API version numbers, deprecation notice of 6–12 months | A job lasts hours. There is no second consumer to give notice to. The additive habit (principle 10) is the part that survives at this size. |
| Standups, sprint planning, retrospectives | Every ceremony is peers talking to peers. Crew roles cannot talk to each other at all, so these become the PM talking to itself. |
| A throwaway proof of concept, deleted after review | Considered for `M1`. Rejected: it makes the crew build the same thing twice. `M1` is the walking skeleton instead, and its code is kept and grown. |
| A named Definition of Ready, with INVEST | Our task rules already require independence (no shared files), small size, and a named test. A separate checklist would mostly repeat them. Worth revisiting if task rows start arriving unfinished. |
| arc42's quality requirements, crosscutting concepts and glossary sections | Real value for a large system, but `hld.md` is written fresh for every job, including small ones. The cost is empty sections; the benefit needs a project big enough to have crosscutting concerns. Worth revisiting. |
| Consumer-driven contracts, where the calling side owns the contract | Assumes two teams that negotiate. We have one architect writing both sides of the contract, so the architect owns every contract file and the caller/callee split is only about who builds what. |
| The team writes its own Definition of Done (Scrum) | Ours is written by the PM and confirmed by the user. There is no self-organising team here to agree on anything, and the user is the only one who can say what "done" is worth. |

---

## Keeping this file honest

- When you change a rule in `roles/*.md`, change the principle here that carries
  it. A rule with no reason written down is the next one somebody deletes.
- When you add a rule that came from a live failure, write it as **(ours)** and
  say what failed. That sentence is worth more than any link.
- When you take an idea from outside, link the source. When you reject one, put
  it in the table above with the reason. The rejections save the next person from
  re-running the same search.
