# dsh-crew

English | [中文](README-zh.md)

Run work in [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness)
as a small crew of role agents.

Your own dsh session becomes the **product manager (PM)**. The PM is the only one
who talks to you. It writes down what "done" means, asks you to confirm it, then
starts an **architect** to design the work, **engineers** to write the code, and
**reviewers** to judge both. The roles never talk to each other — they share work
through files on disk, and the PM passes messages.

> **Version 0.9.0.**
>
> - **"What done means" is a section of your own repository**, not a file that
>   gets dropped.
> - The **language and stack** are settled first, and you approve them before any
>   work starts.
> - QA's cases **stay on disk** and run again on every later task.
> - Every finished task **records its four reviews** in your repository, on one
>   line at the top of its task section.
> - Every change to scope or to a contract gets a **written change request**.
> - Pushing happens **only with your permission**, and the PM then watches CI.
> - A job can be **picked up again after a crash**.
> - The roles: PM, researcher, architect, engineer, QA, code reviewer, security
>   reviewer, doc reviewer.

## Two planes

dsh keeps model-facing tools in an **agent preset**, not in your profile. dsh-crew
follows that, and splits itself in two:

| Piece | Where | Why there |
| --- | --- | --- |
| PM rules | host plane (your profile) | They need no tools, so they work in every session, on any preset |
| Role tools | the `crew` agent preset | A role's allow/deny list is checked against the preset when a child starts, so the names must be defined in the same place |

The first dsh start after installing writes the preset into
`$DSH_HOME/.agent-presets/crew`. Start a session on the **crew** preset to get
the roles. In a session on another preset the PM still behaves like a PM,
notices it has no role tools, and offers to either move to the crew preset or do
the job itself.

The crew preset is dsh's own `standard` preset with one change: `subagent`,
`subagent_fork`, `workflow`, `ralph` and the product subagents are gone, and the
crew roles are there instead. So inside it, **a crew role is the only way to
start an agent.**

## Why the crew is flat

dsh has three hard rules about agents, and the design follows them:

| dsh rule | What it means here |
| --- | --- |
| A message can only go to a **direct child** | Every role is a direct child of the PM, so the PM can reach all of them |
| A child answers only its **direct parent** (`report`) | Every answer comes back to the PM |
| Two children **cannot** talk to each other at all | Roles share work through files, not chat |

If the architect started the engineers, the PM could not reach the engineers at
all. So only the PM starts agents. Four independent guards enforce that:

- every role is denied the crew delegation tools;
- each role tool has `maxDepth: 1`, so a crew child cannot start another crew
  child — and that guard names no tool at all, so no preset change can weaken it;
- the crew preset removes every other way to start an agent, so a role cannot
  route around the filters through `workflow`, `ralph` or a bare `subagent`;
- dsh checks the family line itself when a message is sent. A sibling is not a
  child, so the message is refused even if a role holds the tool. This one names
  no tool and quotes no prompt, so no edit to a filter or a persona can weaken
  it.

## What a role really is

A role is not a prompt the PM pastes in. It is a real delegation tool built from
`@deepseek-ai/dsh-tool-subagent`:

| Role | Tool | Persona | Tools |
| --- | --- | --- | --- |
| Researcher | `crew_researcher` | `roles/researcher.md` | **only** `read`, `glob`, `grep`, `write`, `web_search` — no shell |
| Architect | `crew_architect` | `roles/architect.md` | everything **except** the crew tools |
| Engineer | `crew_engineer` | `roles/engineer.md` | everything **except** the crew tools |
| Test engineer | `crew_test_engineer` | `roles/test-engineer.md` | everything **except** the crew tools |
| Code engineer | `crew_code_engineer` | `roles/code-engineer.md` | everything **except** the crew tools |
| QA | `crew_qa` | `roles/qa.md` | everything **except** the crew tools — it must run the software |
| Code reviewer | `crew_code_reviewer` | `roles/code-reviewer.md` | **only** `read`, `glob`, `grep` |
| Security reviewer | `crew_security_reviewer` | `roles/security-reviewer.md` | **only** `read`, `glob`, `grep` |
| Doc reviewer | `crew_doc_reviewer` | `roles/doc-reviewer.md` | **only** `read`, `glob`, `grep` |

So a code reviewer **cannot** change a file, even if it decides it wants to. The
persona is locked in as that child's own system prompt.

Every persona also carries a **What you may write** section: the classes of file
that role may write, and the ones it must refuse even when a briefing hands one
over — the document that judges its own work, above all. **Reading is not
restricted.** All ten of those sections are in `roles/`, readable once you install.

Three of those nine roles build a task, and which of them the PM starts depends
on the task's **shape**: `crew_engineer` writes one task's unit tests and its
product code alone, which is the default, while `crew_test_engineer` and
`crew_code_engineer` split one task in two — one writes only the unit tests, the
other only the product code, and neither can see the other's half while it is
being written. **The paired shape**, further down, says how that runs and what it
proves.

The reviewer uses an allow list, and two live tests are the reason:

1. With `write` and `edit` denied, it created a file anyway with
   `echo hello > file`. A shell is a file-writing tool.
2. With the shell denied too, its own tool report still listed `workflow`,
   `ralph` and a set of desktop-control MCP tools — every one of them a way out.

A deny list cannot name what a deployment has not installed yet. An allow list
does not have to. The PM pastes the diff into the review task and runs any
command the reviewer asks for.

### Editing the roles

Role personas are plain markdown in `roles/`. Copy one into
`~/.dsh/crew/roles/` under the same name and it replaces the shipped version.
One limit: prompt text may not contain `{{` — dsh would read it as a variable,
and the plugin fails at startup naming the file.

Role tool filters and per-role models are configured where the roles live: the
`dsh-crew-roles` row in `~/.dsh/.agent-presets/crew/agent.cordis.yml`.

That file sits inside the installed preset, and a new version of dsh-crew
replaces the whole folder. Your edited files are kept beside the new ones as
`agent.cordis.yml.bak`, and the boot log names them — but the settings do **not**
come back by themselves. After an upgrade, copy your changes into the new file.

## How a job runs

1. The PM sorts your ask into one of **two** lanes: `ask` (answer only) or `team`
   (the full flow). A change of any size — a typo, a rename, a one-line fix, a
   whole feature — takes `team`, and gets a **milestone**: at least one task, one
   round of QA, and one round each of the code, security and doc reviews. **A
   milestone is not a release.** It is one full cycle plus one commit; pushing and
   tagging sit outside it and each still needs your own yes, every time. If it
   cannot tell an answer from a change, it asks you.
2. It asks which language to use. It never guesses.
3. It interviews you, and the interview has a method: **one question per turn**,
   each with a recommended answer, waiting for that answer before the next one,
   never a list. It picks the kind of question that fits the hole in what it
   knows, and one of those kinds is "is this the right thing to ask for at all?" —
   its permission to say you may be solving the wrong problem, early, while
   changing direction is cheap. It stops the moment it could write the opening
   document with no guess left in it. It looks up every fact it can in the
   repository first, and for anything bigger than a quick look it starts a
   `crew_researcher`, which writes findings with a source for every answer — so
   you are only asked what the files cannot answer.
4. **It settles the language and stack, and you approve it.** If the repository
   already has one, that is the stack. The PM reads the manifest, the lock file,
   the test folder and the CI workflow, says what it found, and you confirm it in
   one line.

   When the choice is real — an empty repository, a new service — the PM starts a
   `crew_researcher` first. The researcher reports what this kind of project is
   normally built with today, with a source for every claim, what the machine
   already has, and what each option costs. It lists the options and is not allowed
   to recommend one.

   Then the PM recommends one, names the runner-up and why it lost, and writes a
   **Language and stack** section into the document: language and version, package
   manager, framework, database, and the **test framework with the exact test
   command**. That last one matters most. Engineers write their tests with it and
   QA writes its cases with it, so it has to be one choice, not five.

   You confirm the stack together with the document. After that it moves only
   through a **CRD** — a change request document, explained further down. An
   engineer may pick freely among the libraries the project
   already has; adding a brand-new dependency goes back to the PM.
5. It writes the opening document. **There is one per job, and its name carries
   the job: `docs/design/prd-<date>-<job-slug>.md`** (a PRD, a product
   requirements document) — for a small job as much as for a real product. Both
   halves of that name are needed: two jobs can start on one day, and a fixed name
   would silently overwrite the PRD of the job before. The design document takes
   the same shape, `docs/design/hld-<date>-<job-slug>.md`, while
   `docs/design/tasks.md` keeps its plain name — it is one table for the whole
   repository, not one per job. The weight is in the content, not in the file
   name: a small job's PRD is three paragraphs, the goal, what is out of scope, and
   the Language and stack section. It says how big it judged the job, and one word
   changes that. **You confirm before any work starts.**
   A big job's PRD is cut into **milestones** — three to six stops, each one
   something you can look at and judge, written in your words rather than in code
   words. `M1` is the proof of concept: the thinnest real path through the riskiest
   part, running for real. You confirm the milestone list on its own, because it
   decides when you get a say.

   **"What done means" is a section, never a separate file.** Every milestone
   carries a **DoD** section (definition of done), and so does every task row in
   the task table `docs/design/tasks.md`. A DoD section says two things: what
   "done" means for that one thing, and **how somebody else checks it** — which QA
   case, and which exact command. Both live in your repository, so what was
   promised is still readable long after the job is over. There is no `dod.md` any
   more, and no numbered list of acceptance checks: a check is "item 2 of T-05's
   DoD", written next to the work it governs.
6. It turns your job name into a short slug — lowercase letters, digits and `-`,
   nothing else — tells you the slug it picked, and creates a `crew/<job-slug>`
   branch with it. Then, for a big job, it starts `crew_architect`, which writes
   the high level design, the decision records and the task table
   `docs/design/tasks.md`, with a DoD section on every row. On a small job there
   is no architect, so the PM writes that same table itself, in the same place and
   the same shape — only the typist changes.

   **Modules, and a contract per boundary.** The architect splits the system into
   modules — reusing what the repository already has before it invents anything
   new — and when two or more modules talk to each other it writes one contract
   file per boundary in `docs/design/api/`: how the two sides talk (in-process
   call, HTTP, gRPC, events, and so on), the data format, every call with its
   inputs, output and errors, and how the shape stops a caller getting it wrong.
   It picks the style, not the library.

   **Why the contracts matter.** They are what let two engineers build the two
   sides at the same time, because crew roles cannot talk to each other. So each
   contract also names one **test per side** — the callee proves it answers what
   the file says, the caller tests against a stub built from the file. And when
   there is a boundary, the first task is a **walking skeleton**: one engineer
   builds the thinnest real path across the riskiest boundary, alone, before
   anything runs in parallel. A contract that does not fit is cheapest to fix
   there.

   Every task goes under one of your milestones — the architect cannot add,
   rename or reorder them. Then `crew_doc_reviewer` must pass all of it before a
   single line of code is written.
7. It runs one `crew_engineer` per task, one milestone at a time. Two engineers
   run together only when their file lists do not overlap, and never across a
   milestone line. Every
   engineer works **test first**: it writes one unit test, runs it, checks that it
   fails for the right reason, then writes the smallest code that makes it pass.
   Its report has to show you the failing run and then the passing run. Every one
   of those tests is a real file in your project's test suite, named in the task
   row and committed with the code — never a command someone ran once in a shell.
   An engineer that believes a test cannot come first must ask the PM before it
   writes any code.

   **A task is finished when its own unit tests pass**, and nothing else holds it
   open: QA and the three reviews have not run yet, so neither of them calls a task
   done. The task row still records all four verdicts, and a check that has not run
   is written down as `not run` with its reason, never as `pass`.

   **Every task row also carries a shape, and `solo` is the default.** Solo is
   the paragraph above, and not one word of it changed when the second shape
   arrived. A row marked `pair` is built by two engineers who never meet: one
   writes only the unit tests, the other only the product code.
   **The paired shape**, after this list, says what that buys, how the PM runs
   it, and what a green run does not prove.
8. **QA and the three reviews run once per milestone, at the end of it** — not
   once per task. The PM starts them when the last task has landed and the coding
   has stopped, because a blocking finding changes the code and throws an earlier
   check away. **Only the changed part is in scope**, and nothing outside this
   milestone, however much a reviewer dislikes what it sees elsewhere.

   **One round of QA first, in two steps.** One `crew_qa` turns the **DoD
   sections** into a list of cases, one line each, and writes nothing else — it
   does **not read the code**, because the side being measured must not set the
   questions. The PM reads that list, then starts **one agent per case, all in
   parallel**; each writes its single case as a real test file under
   `docs/qa/<task-id>/`, in your project's own test framework, with a `run.sh`
   beside it, and runs the suite.

   **Then the other three, in one message, one round each, in parallel:**

   - **code review** — correctness first, then the tests that drove the change,
     then reuse, simpler code, readability and this repository's own style. The
     reviewer may hold up the work on those last four, but only if it shows the
     exact replacement it wants. Otherwise the finding is optional.
   - **security review** — only when the change touches the network, login,
     secrets, files outside the project, the shell, user input, customer data or
     a new dependency. That list is the whole test of the word "risky"; there is
     no second one.
   - **doc review** — one agent per document this milestone changed.

   **Only a change made because of a review's own finding brings that review
   back**: a code change re-runs the code review, a documentation change the doc
   review, a security change the security review. The three never re-run together,
   and a second round re-checks only the blocking findings. If the two sides still
   disagree, the PM stops and puts both cases in front of you.

   **The cost, said out loud, because it was chosen knowingly.** One round at the
   end finds a defect later, with more work sitting on top of it, so the rework is
   wider. What it demands in return is that the one round is a **full** one: every
   item of every task's DoD section, whatever the test run said.

   **QA's cases stay on disk, and the plan does not.** Once the cases exist they
   say the same thing in a form that runs, so the plan is dropped with the job. The
   one part of it that must not be lost is "what I could not test here, and why":
   that goes into `docs/qa/gaps.md`, a standing list about your product's
   testability that later jobs shorten. `bash docs/qa/run-all.sh` runs every task's
   cases, and the PM wires it into your project's own default test command, so an
   earlier case guards later work without anyone remembering it. A case that starts
   failing is a blocking regression, and nobody is allowed to edit it green. If
   your test runner cannot see the folder, the PM adds the one line that makes it
   visible; "the cases are not runnable" is a problem the PM brings to you, not a
   place to stop.
9. The PM commits — engineers never touch git. It stages only the files that task
   owns, never `git add -A`.
10. **Milestone review — the PM stops and asks you.** When every task in the
   milestone has passed those checks and is committed, the PM reports what works
   now, the exact commands to try it yourself, what is deliberately not there
   yet, the test results, and where shipping stands. Then you say: ship this
   milestone (release it to real users), go on without shipping, change
   something, or stop — one question, four answers. A change that touches the PRD sends the plan back through the
   architect and the doc reviewer before code starts again. No milestone begins
   until you have answered the one before it. A small job has no review stop —
   it is one piece of work with one report at the end.
11. **A milestone you ship gets two plans, and their shape is looked up, not
   guessed.** These plans are not alike. An npm package cannot un-publish a
   version. A mobile app waits for a store review. A web service rolls back by
   redeploying. A database schema needs a migration that is safe to run twice.

   So the PM starts a `crew_researcher` and asks what those two plans hold **for
   your project type**, with a source and a date for every claim. It reads what
   your repository already does first: the workflows, the changelog, the tags, any
   release script. Then it writes two files:

   - `docs/release/<milestone>-release.md` — the version and the rule behind
     it, the release notes, the exact steps and who approves each one, what must be
     true before you start, how you check afterwards that it worked, and how to
     undo it. If it cannot be undone, the plan says so in those words.
   - `docs/release/<milestone>-upgrade.md` — who is upgrading and from which
     versions, every breaking change and what the user must do about it, the
     migration steps and whether they are safe to run twice, what happens to
     someone who skips a version, how to go back and what data that loses, how long
     it takes, and what goes offline while it runs.

   A milestone you are **not** shipping gets no plan. It gets a **shipping gap
   list** instead, in your repository at `docs/release/<milestone>-gaps.md`: one
   honest paragraph naming what is still missing before it could ship. The next
   milestone shortens that same file. And approving a plan is not approving
   a push — every push and publish still needs its own yes, every time.
12. The PM updates the reader-facing files to match what was built. `README.md`
   is always English. If you chose another language for the job, it keeps a second
   file beside it — `README-zh.md`, `README-ja.md` — saying the same thing. It
   also adds a `CHANGELOG.md` entry when a user would notice the change, and edits
   `CLAUDE.md` when your repository's own rules or layout moved. If
   nothing a reader would notice changed, it leaves those files alone and tells
   you so.
13. A last `crew_doc_reviewer` pass — the **tail** of step 8's doc review, not a
    second round of it. It reads only what landed after that round: the
    reader-facing files above, the README included. It checks that the documents
    can be worked from, that they stay consistent (one name per idea, one shape,
    and the language files saying the same thing), and that they read easily for
    someone about 14 years old whose first language is not English — by counting
    things like sentence length, idioms and unexplained terms, not by taste. It
    may hold up the job on wording, but only if it writes the replacement
    sentence itself.
14. **Push and CI, if you allow it.** The PM checks there is a remote, a
    workflow and a working `gh` first. Then it asks you — before **every** push,
    including a re-push after a fix. It pushes only what you said yes to — a
    `crew/*` branch, `main`, or a release tag — watches the run, and sends a red
    CI's real error text back to the engineer that owns those files.
15. **Merge and clean up, only when you ask for it.** The PM merges the
    `crew/<job-slug>` branch into `main` itself. It asks you three separate
    times — once for the merge, once for pushing `main`, once for deleting the
    branch — and one yes never covers the next thing. The merge is never
    squashed, so your one commit per task and its test-first proof stay readable
    in the history. Before it pushes `main` it tells you whether that push would
    start a workflow that publishes, naming the file it read — and if you still
    say yes, it pushes. It offers to delete the branch only after it has proved
    the work is merged and really on the remote, including that the remote
    branch holds nothing `main` does not: `git push origin --delete` has no
    protection of its own. With `trustRootAgent: false` that remote delete is
    refused on purpose; the PM then hands you the command to run yourself
    instead of retrying. A work branch that simply stays is a normal ending too.
16. **A bug becomes a task row, and the PM writes what "fixed" means before
    anyone fixes it.** A real bug — one you reported, one QA found, one a review
    found — gets its own row in `docs/design/tasks.md`, written by the PM before
    any engineer starts. The row holds what was reported (who saw it, the command,
    what happened, what they expected) and its **DoD section**: the failing case
    that has to exist and pass, and the behaviour that has to change. The engineer
    doing the fix never writes that section. Test first does produce a test, but
    the person doing the fix writes it — and that is exactly how a fix for a
    symptom passes: nobody else had said what "fixed" means before the work
    started. A one-line typo fix is not this: that stays a well-written commit
    message.

    **Then fixing it can come back to you as a question, and every choice gets
    written down.** This can happen at any time inside step 8. An engineer
    fixing a bug — a defect QA found, a blocking review finding, or one it hit
    itself — first finds at least two ways that would really work. If the ways
    only differ in wording, it picks one and says in its report which ones it
    compared. If the difference would stay in the code, it stops. The
    difference stays in the code when any one of these six is different between
    the ways:

    - which module is responsible for this behaviour;
    - which layer the check or the fix sits in;
    - whether it touches a module boundary contract in `docs/design/api/`;
    - whether it changes a public name, a command, a config option, or an
      output format;
    - whether behaviour you can see changes;
    - whether speed or compatibility changes.

    When it stops, it hands the PM the cause of the bug and every way it found,
    each with the files it would change, what it costs and where it would hurt
    later, plus the one it recommends. Then the PM decides by the same line a
    CRD uses: a difference you can see, it asks you about right away; a
    difference that stays inside the code, it decides itself and names at the
    next milestone review. New features and refactors do not go this way.

    The decision is written down before any code is built, and it holds
    **every** option. It goes in one place, whatever the size of the job: an
    **ADR** — a decision record in `docs/decisions/adr/`. On a big job an
    architect may write it; a small job has no architect, so the PM writes it
    itself. The ADR holds the cause of the bug, every option with what it costs,
    where it would hurt later and **why it lost**, which one was taken, who
    decided, and the reason. The options section **quotes the engineer's own
    question file word for word** — the PM adds only the decision and the
    reason, so it cannot quietly reshape the options into a case for the choice
    it already made, and a pointer like "options: see Q-03" is not allowed
    because that file is dropped with the job. **Every
    ADR is written for you**: a reader who has never seen the code must be able
    to tell the options apart, and the recommended one is marked. The design
    does not stop and wait for you to pick — the architect keeps going on its
    own recommendation, and at the milestone review the PM puts the options
    from every ADR of that milestone in front of you. You may overturn any of
    them; that is a CRD, and the tasks already built the old way are done
    again.

## The paired shape

Every task row in `docs/design/tasks.md` carries a **shape**, and `solo` is the
default: one engineer writes the failing unit test and then the code that passes
it, the way **How a job runs** describes above.

The other shape is `pair`, and it splits one task between two engineers who never
meet:

- `crew_test_engineer` writes **only** the unit test files that task owns.
- `crew_code_engineer` writes **only** the product code.
- Each works in a git worktree of its own. While the two halves are being
  written, the unit tests are not in the code half's tree at all, so it is
  "cannot read them", not "should not".
- Both read the same two documents and nothing else: that task row's
  **DoD section**, and the **interface ADR** in which the architect pinned the
  line between the two halves.
- They cannot talk to each other. That is the platform, not manners: a sibling
  agent is not a child, so the message is refused even if a role holds the tool.
- The PM merges the two halves and runs the project's test command itself,
  **exactly once**, and reports what came out.

It is **independent verification**, the kind safety-critical engineering uses:
two readings of one document, made without any talking, so the place where the
two readings differ shows up instead of being talked away.

**It is not pair programming**, and that contrast is the clearest way to say what
it is. Two people at one keyboard talk continuously and check continuously, and
their goal is to **converge** on one shared understanding. This shape removes the
talking completely and wants the opposite: the two readings must not converge,
because the place where they differ is the whole point. So it is not
pair programming with the chat switched off — it is a different thing, and this
repository calls it the paired shape everywhere.

**What it buys.** Test first gives you a unit test that was red before the code
existed. But in the solo shape that unit test is written by the same agent that
is about to write the code, so it can be bent towards the code that agent already
meant to write. The paired shape takes that possibility away by construction: the
one who writes the check is deliberately not the one who writes the code. The
second thing it buys is larger — **two independent readings of one document**.
Where the document allowed two readings, the two halves do not fit, and you find
out at the merge instead of finding out in production. A disagreement is not a
mishap here; it is the cheapest signal there is that a document everybody had
already agreed on is not clear.

### How the PM runs one

1. **Two git worktrees**, one per half, each on a branch of its own, both grown
   from the same base point:

   ```sh
   git worktree add -b <tests branch> <tests tree path> <base>
   git worktree add -b <code branch> <code tree path> <base>
   ```

   A fresh worktree holds only what git tracks. Whatever your project's own
   checks need beside that goes into **both** trees in this same step, before
   either engineer is briefed. **Leave it out and nothing fails — the checks get
   quietly weaker**, because a check that cannot run one part of itself may say
   so and carry on while the run still ends green. In this repository it is one
   symbolic link per tree, and without it `tools/verify-mount.mjs` skips its
   role-tool half while the tree still looks green.
2. **Both halves are briefed and started in the same message**, so neither gets a
   head start. Each briefing carries that half's own worktree path, **only that
   half's file list** — the two lists never overlap — the task row's DoD section,
   and the path of the interface ADR.
3. **The first meeting.** The PM merges the two halves, runs
   the project's test command once, and reports the output as it came out. It
   never changes something and runs it again for a better result: repeating that
   run turns the whole thing back into ordinary test first, with every mismatch
   read as "the code is wrong" and edited away, and not one disagreement ever
   reported.
4. **A red sends each half back to check its own half, once.** Whatever is still
   inconsistent after that is the disagreement, and it is written down: what the
   document says, what each half read out of it, and where the two readings part.
   The PM settles it, or brings it to you when both readings are defensible. The
   half that wrote the unit tests may never weaken an assertion to make a
   disagreement go away; only the PM may approve a change to what a unit test
   demands, and that change has to trace back to the words of the DoD section.
5. **A fix is written in the merged tree**, where the code half can now read the
   unit tests. **The isolation ends there, on purpose**: that half's independent
   reading is already on disk and already in the evidence, so blindfolding it
   during the fix would buy no new signal and only make the fix harder.
6. **The PM removes both worktrees and both branches**, and hands the code
   reviewer three pieces of evidence: the red run from the unit-test half, the
   single result of the first meeting, and the disagreement record — which is
   empty when that meeting was green.

### Where it exists, and where it does not

- **Only in a job that has an architect.** Before either engineer writes a line,
  both have to land on the same five things: the import path, the exported name,
  the signature, the shape of the return value, and what happens on an error.
  They cannot see each other, so any one of those five landing differently makes
  the merged run red for a reason nobody learns anything from — a clash of names,
  not a disagreement — and that would happen so often that the real signal would
  drown in it. The architect settles those five in the interface ADR, and only
  the architect may change it. A small job has no architect, so every row of a
  small job is `solo`.
- **Not where the two halves would have to change the same file.** The two file
  lists of a paired task may not overlap, and one file cannot be in both of them.
  The task is split until the halves own different files, or it stays `solo`.
- **It is confirmed with the table it sits in, never row by row.** The architect
  proposes a shape for every row when it writes the task table. On small work the
  PM writes that table itself and you stamp it with the rest of the opening
  document — but small work has no paired shape at all. On big work, the only
  road where a paired task can exist, the architect writes the table after you
  have already confirmed the opening document, so the PM confirms the shapes and
  you meet them at the milestone review. Either way it is one yes for a whole
  table: a job of fifty tasks is not fifty decisions. What the architect brings
  is one default for the whole table and a list of exceptions, each exception
  with its reason: a DoD section it could
  not word sharply, a row sitting on a module boundary contract, a mistake that
  would cost money, permissions or data, or an earlier defect in that part of the
  code.
- **It costs more, and the number is an estimate.** Reckon roughly 35% to 75%
  more effort than the same task done solo: the writing is split in two, but the
  reading of the document is done twice, and on a small task the reading is often
  the larger half. Wall time can come out shorter, because the two halves are
  written at the same time. None of those numbers is a measurement.

### The three roles that write something which checks the product

They are easy to confuse now that there are three of them, and one of the names
invites the confusion: **`crew_test_engineer` is a programmer, not QA.**

| | `crew_test_engineer` | `crew_code_engineer` | `crew_qa` |
| --- | --- | --- | --- |
| Who it is | a **programmer** | a programmer | **QA** |
| What it writes | **unit tests** | product code | **cases**, acceptance and black box |
| Granularity | **one behaviour per unit test** | — | **one DoD item per case**, checked the way you would see it |
| When | **before** the code exists | — | **after** the code is finished |
| Home | **your project's own test suite**; a file the task owns, committed with the code | product code files | **`docs/qa/<task-id>/`, nowhere else** |
| Can it see the code | No — its own worktree, where the code does not exist yet | — | Not the agent that writes the case list; the per-case agents may |
| Scope | **this task only** | this task only | this task, **plus every earlier task's cases run again** |

**Four differences, and not one of them is optional**: granularity (one unit
behaviour against one acceptance item), timing (before the code against after
it), home (your project's own test suite against `docs/qa/`), and scope (this
task against every task's cases run again as a regression).

### What a green run does not prove

This is the half of the shape worth reading twice, so it is written out here
rather than left as a note.

**A green first meeting says exactly one thing: the two readings matched.** It
does **not** say the document was clear, and no report — the engineers', the
PM's, or a reviewer's — may claim that it does. A report that turns
a green first meeting into "the DoD section was unambiguous" is a blocking
finding for the code reviewer, because somebody would build on that sentence
later.

**A document has two kinds of ambiguity, and this shape only catches one.** One
kind makes two readers disagree; that is the kind the paired shape was built for.
The other kind makes two readers take the *same* wrong meaning out of one weak
sentence, and to that kind the shape is completely blind: the halves fit, the run
is green, and nothing at all is reported. That blind kind is common, and it is
measured rather than feared. Across 5 harnesses, 23 models and 48
implementations, simultaneous failures came in at 3.7 times what an independence
model predicts (*N-Version Programming with Coding Agents*, arXiv, 2026-06), and
they cluster where the specification is weakest — which is to say it arrives
wearing the costume of the best possible result. Giving the two halves different
models does not close it: perfectly correlated failure survives a change of model
and of harness, while a weaker model on one side would bury the PM in false
disagreements. So both halves run on the same model on purpose, and **this shape
is not the last net.** QA — afterwards, blindfolded, writing its own cases from
the document — is the crew's net for a shared misreading, and the code reviewer's
job does not shrink because a first meeting came out green.

**And there is a ceiling.** Everything this shape can buy is capped by the
quality of that one DoD section, and **that DoD section has
no second pair of eyes**: nobody produces an independent second reading of it
the way these two engineers produce two independent readings of the code. That
is the deepest limit of the design, written here rather than left for you to
find out later.

## Nothing important lives in a chat message

The crew is flat: the PM talks to each role, and two roles can never talk to each
other. So a message reaches one role and dies there. That is why the crew talks
**through documents** — a role's report points at the file it wrote, and the PM's
answer points at the document it changed and that document's new version. Two
engineers building two sides of the same boundary read the same file, and a role
started tomorrow reads what a role started an hour ago read.

On top of that, every **change request** gets its own file. If anyone — you, a
role, or the PM itself — asks for something that changes what you get (the scope,
a DoD item, the milestone list) or how two modules talk (a boundary
contract), the PM writes `docs/decisions/crd/NNNN-<short-name>.md` first: who asked,
what they want, why, which documents and tasks it touches, what it costs, and the
decision with its reason. Nothing is built from an undecided one, and a rejected
one is kept, so you can see later what was asked for and refused.

Who decides which:

- **A contract fix that changes nothing you see** is the PM's call. It writes the
  CRD, sends the architect to change the contract file, and tells you at the next
  milestone review.
- **Anything that changes scope, a DoD item or the milestone list needs
  your yes.** The PM writes the CRD, then stops and asks. No version is raised and
  no task starts until you answer.

Small questions do not become CRDs — a role's question that the files can answer
is just a note in the job folder, and a review finding about code is a review
finding. Only scope and contracts, the two things that cost real work to redo.

**A decision about *how* gets an ADR instead, whatever the size of the job.** One
question tells the two apart: **did someone ask for this?** If someone did — you,
QA, a review — it is a change request and gets a CRD. If nobody did, and the crew
ran into a choice while doing the work, it is an ADR in `docs/decisions/adr/`.
Nothing else decides where it lands: not how big the job was, and not whether it
had an architect. Small work has no architect, so the PM writes the ADR itself.

**Where a document lives depends on how long it lives.** What outlives the job is
in your repository, under `docs/`, and each folder name says what it holds: the
PRD, the task table and the design in `docs/design/` (with one contract file per
module boundary in `docs/design/api/`) — and with them every DoD section, so what
"done" meant is still readable next year; the decision records and the change
requests in
`docs/decisions/` (`adr/` and `crd/`), QA's runnable cases and its standing list
of what no test can check in `docs/qa/`, the release and upgrade plans for each milestone you ship in
`docs/release/` (with a shipping gap list there for a milestone you do not ship),
and the researcher's answers in `docs/research/`.

What belongs to this one job is outside the repository, in
`~/.dsh/crew/jobs/<job-slug>/`, so your `git status` stays clean: the job state
(`state.json`), QA's test plans, and the `Q-` question files a
role leaves for the PM. That whole folder is dropped when the job ends, and a test
run's output was never a file at all. What "done" means is deliberately **not** in
there any more: it is a DoD section inside the job's own PRD or
`docs/design/tasks.md`, in your repository, because a file of its own is a file
that gets dropped.

**Before anything is dropped, the durable half moves out.** This is a real step at
the end of a job, and it happens after the PM's closing summary to you — not the
moment the DoD items turn green, because the thinking usually carries on
past that point. A rule the crew must keep next time goes into `principles.md`, a
decision about how into an ADR, a decision about what or a contract into a CRD,
this change's reasons and its real test numbers into the commit message, QA's
"what I could not test here, and why" into `docs/qa/gaps.md`, and — the two the
crew added after losing them once — a DoD item's own wording and the list of
files a task owns into `docs/design/tasks.md`. "Not needed any
more" has to be earned. It is the same reason an ADR copies the engineer's options
in instead of pointing at the file they came from.

## After a crash

The state file alone is not enough — the next session has to *know* about it. So
dsh-crew reads the job folder on every turn and, when something is unfinished,
puts a short note in front of the PM:

```
Unfinished crew work: 1 job left in /home/you/.dsh/crew/jobs.

- "add-sso-login" in /home/you/project (branch crew/add-sso-login):
  5 of 9 tasks done, 2 blocked. Last change 2026-08-18 09:12.
```

The PM must tell you before it does anything else, and ask one question: carry on
or start clean. It never does either without your answer. A job belonging to a
different folder is ignored, and a state file it cannot read is reported rather
than counted as finished. Turn the whole thing off with `resumeNotice: false`.

## The git guard

`host/git-guard.js` inspects every shell command. Your own session is the root
agent, and it is trusted: its git and publishing commands pass straight through.
Every crew role is a child agent, and the guard refuses, from a child:

- `git push` of `main`, `master`, `trunk`, `develop`, `HEAD`, or with no branch
  named;
- any tag push, remote delete, `--mirror`, `--all`, or force push;
- `npm`/`pnpm`/`yarn`/`bun publish`, `npm dist-tag`, `gh release create`;
- a push into a repository whose GitHub Actions CI runs on a branch push and
  looks like it publishes;
- any shell command that names the approval file — your own session included,
  so no agent can approve itself with a shell command. The name is matched as a
  whole file name, so a longer name that merely contains it is left alone: a
  `crew/push-ok-flow` branch, a `push-okay.md` file and a `push-ok.bak` backup
  are not mistaken for the approval file.

A child's other branch push needs a one-shot approval that **you** create:

```sh
mkdir -p ~/.dsh/crew && touch ~/.dsh/crew/push-ok
```

The guard deletes that file as soon as one push uses it. One approval, one push.

A refused child is told to ask you, and is **not** shown those two commands.
Only your own session sees them, so the agent that was just refused does not
also get the recipe.

Set `trustRootAgent: false` to guard your own session exactly like every child.

`approvalFile` must name a file, never a folder. A value like `~/.dsh/crew/`
would leave `crew` as the protected name, so the guard refuses to load and the
message tells you to name the file itself.

Three honest limits. Each one is a real hole, not a caveat.

1. **It reads command text**, so it is a strong seat belt, not a locked door. A
   command hidden inside a script file could still slip past, and so does a file
   name the shell builds from pieces. It cuts the other way too: a command that
   only *mentions* the approval file by name is refused as well, your own session
   included, so a commit message with `push-ok` in it will not run.
2. **It reads `bash` and `pwsh` only.** A role that can write files — the
   engineer can — could create the approval file as a plain file write, and the
   guard never sees that call. Nothing here stops that; dsh's own approval prompt
   for writing a file is what stops it. Your dsh approval prompts stay the real
   gate.
3. **The publishing scan is GitHub-only.** The guard reads `.github/workflows`
   and understands GitHub's `on: push:` shape. GitLab, CircleCI, Jenkins and
   Azure Pipelines are outside it, on purpose: stretching GitHub's trigger rules
   half-way onto another CI system would produce false alarms, and a false alarm
   is worse than no alarm, because it teaches you to say yes without reading.

So the guard is a GitHub-only backstop for child agents. The wider check is the
PM's own judgement: in the merge step (15 above) it also reads `.gitlab-ci.yml`,
`.circleci/config.yml`, `Jenkinsfile` and `azure-pipelines.yml` when they
exist, and tells you what it found before it pushes `main`.

## Install

```sh
dsh plugin --profile tui add dsh-crew     # or --profile web
```

Then restart dsh. Starting it writes the `crew` preset into
`$DSH_HOME/.agent-presets/crew` (a `crew` folder somebody else wrote is left
alone). Pick the **Crew** preset for a session to get the roles.

To check the plugin without dsh:

```sh
npm test        # the guard rules, the mount, every QA case, then the Verdicts gate; no dsh needed
```

This repository's own CI runs `npm test` on every push, and publishes only when a
`v*` tag is pushed. One gap is worth knowing about: `tools/verify-mount.mjs`
skips its role-tool half on any machine without `@deepseek-ai/dsh-tool-subagent`
installed, and CI is such a machine. It says out loud which half it skipped, so a
green run means "everything a public runner can check", not "everything".

The last thing `npm test` runs is a gate on the crew's own record keeping.
`node tools/verify-tasks.mjs` reads `docs/design/tasks.md`, where every task
section carries a **Verdicts** line — the PM's report of the four reviews
(`code`, `security`, `qa`, `doc`). It turns **red** when:

- a task section has no `- **Verdicts**：` line, or has more than one;
- any of the four values is missing;
- a `not run` or `skipped` value carries no reason of its own after the dash;
- a `changes needed` value names no task id to carry the fix.

Every run prints the totals out loud: how many values are still `not run` and
how many are `skipped`.

**Passing is not the same as clean.** The PM writes that line, and reviewers
cannot write files by design. So the gate proves the line was written and every
skip carries a reason. It **cannot** prove a review happened: a `code: pass`
typed by the PM passes it, and no automated check can close that hole. It exists
because the PM of this repository's own job skipped code review on about 20
tasks and doc review on most of the job, nothing went red, and nobody knew
until the user asked. The gate does not stop that; it makes the next such skip
visible the same day instead of twenty tasks later.

## Configuration

Everything is optional. Settings live in the plane they belong to.

**PM and guard** — the `dsh-crew-core` and `dsh-crew-git-guard` rows in your
profile's `cordis.patch.yml`:

| Setting | Default | What it does |
| --- | --- | --- |
| `rolesDir` | `~/.dsh/crew/roles` | Your own role markdown files replace the shipped ones, by file name |
| `limits.liveAgents` | `20` | Crew agents awake at the same time |
| `limits.reviewRounds` | `3` | Review rounds before the PM asks you to decide |
| `installPreset` | `true` | Write the `crew` preset into `$DSH_HOME/.agent-presets` |
| `jobsDir` | `~/.dsh/crew/jobs` | Where job state lives, and what the crash notice reads |
| `resumeNotice` | `true` | Put unfinished jobs in front of the PM at session start |
| `enabled` (guard) | `true` | Turn the git guard off — not recommended |
| `trustRootAgent` (guard) | `true` | Trust your own session (the PM) with any git or publish command |
| `approvalFile` | `~/.dsh/crew/push-ok` | One-shot push approval file. A file path, never a folder — a trailing slash fails at startup |

**Roles** — the `dsh-crew-roles` row in
`~/.dsh/.agent-presets/crew/agent.cordis.yml`:

| Setting | Default | What it does |
| --- | --- | --- |
| `rolesDir` | `~/.dsh/crew/roles` | Same override folder, for the role personas |
| `roleAllow` | reviewers: `read, glob, grep`; researcher: `read, glob, grep, write, web_search` | Only these tools for that role; everything else is closed |
| `roleDeny` | architect, engineer, test engineer, code engineer, QA: the crew tools | Everything except these for that role |
| `roleModels` | session model | Per-role provider and model |

The key in `roleAllow`, `roleDeny` and `roleModels` is the role's tool name
without the `crew_` prefix — `researcher`, `architect`, `engineer`,
`test_engineer`, `code_engineer`, `qa`, `code_reviewer`, `security_reviewer`,
`doc_reviewer`. That file's own comments list all nine.

**A filter you write there has to name at least one tool, and it has to be a
list.** An empty list makes dsh-crew **refuse to start**, and so does an empty
string, `0`, `false`, `{}` or any other value that is not a list of tool names;
the message names the field and the role key. Earlier versions took such a value
quietly and dropped your line, and where it was that role's only filter the child
was left with **no** filter at all — a read-only reviewer got every tool this
preset registers, `bash`, `write` and `edit` included, and nothing said so. There
is no way to spell "no filter": to widen a role, list the tools it may have. To
go back to the shipped list, delete the line, or set it to nothing at all (a bare
`~` in YAML), which still means "use the shipped list". See `CHANGELOG.md` for
the version this landed in.

## License

MIT
