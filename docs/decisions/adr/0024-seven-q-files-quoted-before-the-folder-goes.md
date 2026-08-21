# ADR 0024：七份 `Q-` 文件的选项，逐字搬出来——因为那个文件夹马上就要被丢掉

## 在决定什么

本作业里七个 engineer 各留下一份 `<job folder>/inbox/Q-<编号>.md`，每一份都有一节
「**我看到的几条路，各自的代价**」和一句「**我会选哪一条**」。

**那七份文件住在作业文件夹里，作业一结束就丢。**

而本 crew 自己的规矩写着（`principles.md` 20，以及 `CLAUDE.md` 的「State and documents」一节）：

> 丢掉一份单次用的文档，**要先把它持久的那一半搬出去**……
> 同一个理由让一份 ADR **逐字引用** engineer 的 `Q-` 文件：
> 一份写着「options: 见 Q-03」的 ADR，**指的是一个马上要消失的文件**。

**PM 在 T-93 之后核过：七份里有六份在整个仓库里一处都没有被引用**
（`Q-64-01` 145 行、`Q-70-01` 71 行、`Q-84-01` 98 行，各 0 处；
`Q-66-1`、`Q-71-01` 各 1 处，`Q-75-01` 2 处，都只是被点了名字、没有引内容）。

**也就是说：如果 PM 照常丢掉那个文件夹，这七份里的选项和代价全部消失**——
而这个仓库正是因为这种方式，在一小时里丢掉过 75 条验收检查
（`docs/design/tasks.md` 开头那一节记着，48 条靠 QA 用例的头部注释救回来）。

## 决定

**逐字搬，不转述，全部放进这一份。** PM 决定，2026-08-22。

**为什么是一份而不是七份**：七份 ADR 会让「一件作业里 engineer 提过哪些选项」
散在七个文件里，而它们的共同点恰恰是最有价值的东西（见文末「七份合起来说明了什么」）。
一份 ADR 收七份，代价是这一份长；收益是**读一次就看得到那个模式**。

**为什么不写进各自的任务行**：任务行讲的是「要做什么、怎么算做完」。
一条被否掉的路和它的代价不属于那里——它属于「当时桌上有什么」的记录，那是 ADR 的活。

---

## 七份的原文（逐字，一个字不改）

### Q-64-01 —— Q-64-01 — T-64 的文件范围和它自己的 DoD 第 1、9 条互相矛盾

## 我看到的三条路

### 路一：把这 6 处一起划给 T-64（我建议这一条）

改动只是替换一个词组，落在别人的段落里但**不改变那些段落的意思**，
所以它不会和下游三环抢内容——下游改的是那些段落**说什么**，我改的是
它们**怎么称呼通道**。

- **改哪些文件**：只有 `roles/pm.md`，多 6 个改动块。
- **代价**：`git diff` 会出现在第 4、9、13 步和 bug 那一节里，
  所以 T-64 的 DoD 第 14 条、T-65 的第 17 条、T-66 的第 11 条
  「每一块都落在我的段落里」这句检查要跟着放宽成「除这 6 处词组替换之外」。
  改 DoD 是 PM 的事，不是我的。
- **将来哪里疼**：几乎不疼。下游三环改同一段时会看到一个已经改好的词组。

### 路二：把这 6 处划给下游三环，各自捡自己范围里的

- **改哪些文件**：`roles/pm.md`，分三次。
- **代价**：第 273 行仍然没人要——bug 那一节不在任何人的范围里，
  所以要么给 T-66 加一节，要么单开一个任务行。
  另外 T-65、T-66 的 DoD 里那句「仍然是 0」是**假的**，
  要改成一个逐环递减的真实数字，否则 T-65 一开工就看到一条它自己的 DoD 在说假话。
- **将来哪里疼**：一个数字要在三份 DoD 里保持同步，
  而这个仓库为「一条从写下起就不可能变红的检查」红过七次——
  一条从写下起就**必然**变红的检查同样坏。

### 路三：我只改我范围里的 3 处，另外 6 处开一个新任务行（T-64b）

- **改哪些文件**：`roles/pm.md`，本任务 3 处，新任务 6 处。
- **代价**：串行链多一环，而这条链已经是本作业的瓶颈（PRD 的风险表第一行）。
  新任务和 T-65、T-66、T-67 抢同一个文件，所以它只能插在链里，不能并行。
- **将来哪里疼**：链更长，作业更慢——正好和本作业的目的相反。

## 我会选哪一条，为什么

**路一。** 理由一句话：这 6 处是**同一个词组替换**，不是 6 个决定，
而把一个词组替换切成三份、再为它加一环串行，买到的只是一句更漂亮的
「每一块都落在我的段落里」，付出的是本作业最贵的那样东西（串行链的长度）
和一条必然说假话的 DoD。

第 273 行必须有人改，无论走哪条路：它所在的那一节今天不属于任何人，
而它写着一条已经取消的通道。

### Q-65-01 —— Q-65-01 — B7: step 3's own half of the two-words split is outside my file scope

## What is still one-sided

Step 3's own sentence still says the confirmed test command is the one "QA writes its cases
with", which is the wording that made the two ends collide in the first place. It is now
harmless, but it is the half that still uses one word for two things.

**My recommendation**: give step 3 one clause in a later task — say that the confirmed
command is the command an engineer's **unit tests** run in, and that wiring QA's cases into
it is step 10c's edit and not a stack change. It is one sentence. I did not write it, because
step 3 is not in my file list and a briefing cannot widen that.

### Q-66-1 —— Q-66-1 — B13 clause 8: the "Stand by" paragraph is not in step 16, and not in my file scope

## The options I see

1. **Widen T-66's scope by one paragraph** — the PM adds `## While the crew is working` to
   T-66's owned lines in `docs/design/tasks.md` and wakes this engineer again. The edit is
   about three lines: while the crew works, the roles you started in one message are running
   **right now**, so standing by is not idling — an unrelated task started here steals your
   attention from the reports that are about to arrive.
2. **Give it to T-67** — it is the last link of the chain and already sweeps the whole file
   for paths and pointers, so one more paragraph costs it little. Its own line budget is the
   argument against: T-66 leaves it 45 of the 97 shared lines.
3. **Give it to a task of its own** after this chain hands the file back, so no link of the
   chain has to be reopened.
4. **Drop the clause** and record it in `docs/qa/gaps.md` as a known, unclosed item of B13.
   I do not recommend this: the clause is cheap and the audit found it standing.

I have made **no** edit for clause ⑧, and I have not touched
`## While the crew is working`.

### Q-70-01 —— Q-70-01 — the common DoD cell 4 names a check that cannot fire on `roles/*.md`

## Options I see, for the PM to pick from

1. **Leave the cell as it is** and accept that cell 4 is checked by hand, per file,
   by the command above. Cost: nine files' worth of "no Chinese" rests on nine
   engineers each remembering to run it, and nothing in the repository holds it
   afterwards.
2. **Point the cell at the QA case the common section already plans.** The common
   section says the real check for this batch is "一条 QA 用例遍历 `roles/*.md`",
   written in the last QA round and covering ten files. A CJK scan over
   `roles/*.md` belongs in that same case, and then the cell has a check that runs
   on every future change, not only on this one. Cost: the cell is unverifiable
   until that QA task lands.
3. **Widen `docs/qa/T-52/case-16` itself** to read `roles/*.md` as well as
   `principles.md`. Cost: `docs/qa/T-52/` belongs to a finished job, and a case
   file that grows a second subject stops matching its own task id — so this looks
   cheap and is the option I would not take.

**Which I would pick**: option 2. The batch already planned a QA case that walks
`roles/*.md`, so the missing check has a home that is already being built; putting
the CJK scan there costs one more assertion in a case that has to exist anyway,
and it is the only one of the three that still holds next year.

### Q-71-01 —— Q-71-01 —— engineer 的可写集合里那份 ADR，和 `principles.md` 的全局表打架

## 三种可能的收尾，各自的代价

1. **保持现在这样**（推荐）。代价：`principles.md` 那张表仍然只写「the PM on small work」，
   而 `roles/engineer.md` 多了一句「任务行点名时可以写」。两者不是硬矛盾，但也不是同一句话。
2. **`principles.md` 那张表加一句例外**：ADR 那一行补上「an engineer may write one under a task
   row with its own DoD section」。代价：`principles.md` 只有 PM 能改（PRD v3 明写），
   而且 `roles/pm.md` 的短表要同一个提交里跟着改。
3. **DoD 第 5 格改成两类可写**（产品文件 ＋ 单元测试），把 ADR 挪去「不可写」那一组。
   代价：DoD 是判我工作的文档，只有 PM 能改；而且 engineer 就再也没有任何一处能写 ADR，
   `verify-mount.mjs` 要求的 `docs/decisions/adr/` 就只剩「目的地」这一种用法（那仍然合规）。

**我会选第 1 种**，因为它今天已经在文件里、不需要动任何一份别人拥有的文件；
如果 PM 想让十份提示词和那张表逐字对齐，第 2 种更彻底，但要 PM 自己动 `principles.md`。

### Q-75-01 —— Q-75-01 — A1b is in my briefing and in the PRD, but not in T-75's task row

## Options I see, for the PM to pick from

1. **Add A1b to T-75's row**: put `A1b` in `要求来源` and add one DoD cell for it,
   for example "评审只跑一轮、只看改动部分、只有同类改动重跑同类评审，代价写下来"
   verified by reading the section plus
   `grep -c 'Later rounds' roles/code-reviewer.md` = 0. Cost: one edit to the task
   row after the work landed, which the append rule already allows for. This is
   the option that makes the work checkable.
2. **Leave the row as it is** and let the A1b paragraphs stand as work with no DoD
   cell behind them. Cost: the reviewers of the final round have nothing to check
   them against, and a later job reading the row would think this file was never
   brought into the A1b shape — the row would say B7 only.
3. **Take A1b back out of `roles/code-reviewer.md`** and leave it in `roles/pm.md`
   alone, as the PRD's `主要落在哪` column suggests. Cost: the PM's prompt would
   say one round while the reviewer's own prompt says "a second or third round",
   and the reviewer's prompt is the one the reviewer reads. Two prompts
   contradicting each other about the same round is the exact class of defect
   Part B of this PRD exists to fix, so I would not take this option.

**Which I would pick**: option 1. The work is done and it is right; what is
missing is a line in the row saying somebody should check it. If A1b also belongs
in T-76 and T-77, the same line is worth adding there — I cannot see those files'
briefings, so that is the PM's call, not mine.

### Q-84-01 —— Q-84-01 — T-84 的 DoD 第 1、2 条和 T-64 的 DoD 第 5 条直接打架，第 11 条因此过不了

## 我找到的三条路，以及它们差在哪

三条路的差别**留在代码里**（判据归谁、公开规则要不要改、读者看到的行为变不变），所以我按规矩停下来问。

### 路一：退役 `docs/qa/T-64/case-01` 里那一道检查（**我推荐这条**）

把第 128–132 行那道 `check` 删掉，或者把它反过来（断言步骤 2 **不**按编号指
`principles.md`），并在用例头部写下为什么：T-64 的 DoD 第 5 条被 T-67 的新规则取代了。

- **改哪些文件**：`docs/qa/T-64/case-01-step-2-socratic-interview.mjs`（我不许碰），
  可能还要在 `docs/design/tasks.md` 的 T-64 那一节记一句「第 5 条已被 T-67 取代」。
- **代价**：动的是一份已经交工的 QA 用例。按本仓库的规矩，改断言而不是删用例更好，
  所以「反过来断言」比「删掉」更合规——它把新规则也钉住了，用例数不减（今天 223 条）。
- **以后会疼在哪**：不疼。这是把一条过期的判据换成当前规则的判据，方向和 T-67、T-84 一致。
- **谁来做**：需要一个新任务行 + 一个 QA（或 PM），因为 T-84 的 DoD 第 8 条明确不许我碰
  `docs/qa/`。

### 路二：留着那个指针，撤掉 T-84 的第 1、2 条

- **改哪些文件**：把 `roles/pm.md` 第 2 步那句话改回去；T-84 的 DoD 第 1、2、6、7 条一起划掉。
- **代价**：T-67 定下的规则在十份提示词里就留下一个公开的例外，而这个例外恰好是**唯一一处
  绕过全部四种验法的形状**。C-35 报它的理由一个字都没被回答。
- **以后会疼在哪**：疼得最久。下一个人读到「这里可以按编号指」，规则就作废了。
- **我不推荐。**

### 路三：把「principle 22」和「principles.md」两个串在第 2 步里拆远，让两边的检查都绿

`flatTwo` 里两个正则是**分别**判的，不要求相邻。所以只要让它们隔开超过 24 个字符，
T-84 第 1 条的正则、`case-03` 的两个匹配器、我新加的那道钉子**全都读 0**，
而 T-64 那道检查**照样绿**。

- **改哪些文件**：只有 `roles/pm.md`，一处。
- **代价**：**这是在骗检查。** 六条 DoD 会全绿，而那句话在语义上仍然是「去读那个不存在的
  文件里的第 22 条」——正是 T-67 要禁的东西。本仓库把这个病记过很多次
  （`docs/qa/gaps.md` 第 16 条那类「打绿的检查什么也没看」）。
- **以后会疼在哪**：最坏的一种。检查全绿，规则实际已破，而且下一个人看不出来。
- **我不推荐，而且我没有建这条路**，尽管它是唯一一条能让我一个人把第 11 条做绿的路。

## 我的推荐

**路一，并且用「反过来断言」而不是「删掉」**：让 `docs/qa/T-64/case-01` 那一道检查改成断言
步骤 2 **不**按编号指 `principles.md`，用例头部写清它为什么翻转（T-67 取代了 T-64 的第 5 条）。
这样用例数不减、新规则多一道钉子、两条 DoD 不再打架。

**在那之前，T-84 的第 1 到第 10 条我已经做完并留在树上**（第 11 条卡住）。
如果 PM 决定走路二，我改回来只要一次编辑。
---

## 七份合起来说明了什么（这一段是 PM 写的，不是引文）

**一、七份里有六份报的是同一类事：任务行自己和自己打架，或者任务行和别的文档打架。**
`Q-64-01`（文件范围和 DoD 第 1、9 条矛盾）、`Q-65-01`（B7 的另一半在文件范围外）、
`Q-66-1`（要改的那一段不在指定的步骤里）、`Q-70-01`（共同 DoD 第 4 格点名的检查
在 `roles/*.md` 上不可能触发）、`Q-71-01`（可写集合和权威表打架）、
`Q-75-01`（A1b 在简报和 PRD 里、不在任务行里）。
**六份都不是「我不会做」，是「叫我做的两件事不能同时为真」。**

**二、七份里每一份都自己给了推荐，而且都说清了为什么。** 没有一份只是把问题丢回来。
`Q-71-01` 那一份最完整：它写了三种收尾各自的代价、说了自己会选哪一种，
**而 PM 选了第三种**，它照做了并把 PM 的答复写回同一份文件里。

**三、`Q-84-01` 是唯一一份报「这一格不可能满足」而不是「两件事矛盾」的。**
它的第三条路（把两个串在文件里拆远，让两边检查都绿）是**唯一能让那个 engineer
一个人把 DoD 做绿的路**，而它的原话是：

> 六格全绿而规则实际已破，**这是骗检查**，我没有建这条路，尽管它是唯一能让我一个人
> 把第 11 格做绿的路。

**这句话是本作业里最重要的一句 agent 原话，所以它必须活过那个文件夹。**

**四、一件 PM 要认的事**：这七份问题里，**至少五份的根都是 PM 写的任务行或简报**
（范围写窄了、两件事没对齐、DoD 引了一句不存在的话）。
本作业总共记下 PM 的 21 处这类错误，其中九格是「写下来就不可能满足」的验法
（`ADR 0023` 第 ⑤ 到第 ⑨ 种全部由 PM 造）。
**七份 `Q-` 文件是那 21 处的另一面：每一次 PM 写错，都有一个 agent 停下来问，而不是猜。**

## 后果

- 这七份 `Q-` 文件现在可以随作业文件夹一起丢掉了。**在这一份写出来之前，不可以。**
- 下一件作业的 PM 在第 18 步做搬运时，**要按 `inbox/` 里的文件逐份核一次**，
  而不是只核 `state.json` 和那份工作笔记。**本作业差一点漏掉这七份。**
- 发现它的方式值得记：PM 在补 T-93 那一行时去数「哪些 `Q-` 文件被仓库引用过」，
  才看到六份是 0 处。**如果不是那道 Verdicts 门先抓到 T-92、T-93，这一步不会发生。**
