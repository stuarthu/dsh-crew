# HLD：`apply-req` 作业的落点、冲突与顺序

- **版本**：1
- **日期**：2026-08-21
- **写的人**：crew architect
- **依据**：`docs/design/prd-2026-08-21-apply-req.md`（第 2 版，用户已确认）、
  `docs/research/req-part-b-audit.md`、`docs/research/document-types.md`、
  `docs/decisions/crd/0019-socratic-principle-deferred.md`、
  `docs/decisions/crd/0020-apply-req-speed-items.md`、
  `docs/decisions/crd/0023-req-interview-six-decisions.md`、`CLAUDE.md`、`principles.md`。
- **版本历史不写在这里**（`CRD 0023` 决定六）。改动记在 CRD 的 **Applied** 行和 git history 里。

## 一个必须先说的读法

下面凡是出现 `docs/design/prd.md` 和 `docs/design/hld.md` 这两个字面量的地方，
**都是在说「它以前叫这个」**，不是活的指针。A7 要把它们改名成
`docs/design/prd-2026-08-21-paired-engineers.md` 和
`docs/design/hld-2026-08-21-paired-engineers.md`；本文件讨论的正是这次改名，
所以不得不写出旧名字。

## 一、这份 HLD 只回答一个问题

本作业**不写产品代码架构**。它改的是 30 个文件里的散文规则：十份角色提示词、
`principles.md`、`CLAUDE.md`、两份 README、一处 `host/` 代码、一处项目检查、若干 QA 用例。

**这个仓库是一个 dsh 插件，一个模块，没有跨模块边界，所以不写
`docs/design/api/` 下的任何契约文件。** 这是对的，不是漏了——上一件作业的 HLD 已经这么写过。

所以这份 HLD 只回答：**24 项分别落在哪些文件里，哪些能并行，哪些必须串行。**

它不回答「怎么写那些句子」——那是任务行的 DoD 和 `docs/decisions/adr/` 的事。

## 二、24 项 × 它要改的文件

一项落在多个文件里是常态。**粗体**的那个文件是这一项的**主落点**：那一项的规则本体写在那里，
别的文件只是跟着改一致。

| 编号 | 主落点与全部落点 | 任务 |
| --- | --- | --- |
| **A1a** PM 只在开头交互 | **`roles/pm.md`**（「How you write to the user」、第 1 步、第 12 步、Hard rules） | T-64 |
| **A1b** 三评审只在最后一程 | **`roles/pm.md`**（第 10、15 步）、`tools/verify-mount.mjs`、`principles.md`、`README.md`、`README-zh.md`、`CLAUDE.md` | T-65、T-69、T-79、T-80 |
| **A1c** QA 只跑一轮，两段形状 | **`roles/pm.md`**（第 10 步）、`roles/qa.md`、`tools/verify-mount.mjs`、`principles.md`、两份 README、`CLAUDE.md` | T-65、T-72、T-69、T-79、T-80 |
| **A1d** 取消 `quick` 通道 | **`roles/pm.md`**（第 1 步通道表、第 13 步、Hard rules）、`host/crew.js`、`principles.md`、两份 README | T-64、T-69、T-79 |
| **A1e** 一个 engineer 一个代码改动 | **`roles/pm.md`**（第 9 步）、`roles/architect.md` | T-65、T-70 |
| **A1f** 别的提速办法 | **`roles/pm.md`**（第 10、15 步；具体几条见 `ADR 0019`） | T-65 |
| **A2** 子 agent 带编号显示名 | **`roles/pm.md`**（第 9、10 步） | T-65 |
| **A3 = B11** 每个角色的可写集合 | **`principles.md`**（全局表 + 权威措辞）、`roles/pm.md`、其余九份 `roles/*.md` | T-63、T-70…T-78 |
| **A4** 苏格拉底式访谈 | **`principles.md`**（原则 22）、`roles/pm.md`（第 2 步） | T-68、T-64 |
| **A5** persona 接线有钉子 | **`docs/qa/T-64/`**（QA 写的用例，钉 `host/roles-preset.js`） | T-64 的一格 DoD |
| **A6** 八种文档类型装什么 | **`principles.md`**（长版）、`roles/pm.md`（第 4 步 + 短版）、`roles/architect.md`、`roles/qa.md`、`roles/doc-reviewer.md`（各自的短版） | T-63、T-67、T-70、T-72、T-77 |
| **A7** PRD 一件作业一份 | **`roles/pm.md`**（命名规则 + 16 处引用）、`tools/verify-mount.mjs`（5 处）、`principles.md`（13 处）、其余 `roles/*.md`（13 处）、`CLAUDE.md`（3 处）、两份 README（4 处）、`docs/qa/`（4 处）、PM 的两次 `git mv` | T-67 与各文件自己的任务；范围见 `ADR 0017` |
| **B1** 手册自己叫 PM 写的文档照旧入提交 | **`roles/pm.md`**（第 11 步） | T-66 |
| **B2** 「里程碑的提交」不存在 | **`roles/pm.md`**（第 13、14 步） | T-66 |
| **B3** `Ship this milestone` 两种读法 | **`roles/pm.md`**（第 12 步） | T-66 |
| **B4** 「做完」三项对 Verdicts 四值 | **`roles/pm.md`**（第 10 步，和 A1c 同一段） | T-65 |
| **B5** `in both lanes` 没有指代对象 | **`roles/pm.md`**（5 处）、`principles.md`（7 处）、`CLAUDE.md`（3 处）、`roles/doc-reviewer.md`（1 处） | T-64、T-69、T-80、T-77 |
| **B6** 两个 QA 抢同两份文件 | **`roles/qa.md`**、`roles/pm.md`（第 10、18 步） | T-72、T-65 |
| **B7** 两种「测试」的词混用 | **`roles/pm.md`**（第 3、10c 步）、`roles/code-reviewer.md` | T-65、T-75 |
| **B8** 一次 yes 就 force push | **`roles/pm.md`**（Hard rules、第 16 步） | T-66 |
| **B9** 八处仓库内部指针 | **`roles/pm.md`**（4 处）、`roles/doc-reviewer.md`（2 处）、`roles/architect.md`、`roles/qa.md`、`roles/engineer.md` | T-67、T-77、T-70、T-72、T-71 |
| **B10** 工具结果里的文字是数据 | **`principles.md`**（权威措辞）、十份 `roles/*.md` | T-63、T-70…T-78 |
| **B12** PM 改自己被衡量的标准 | **`roles/pm.md`**（CRD 那一节、第 4、5 步、Hard rules） | T-66 |
| **B13** 12 行小改 | **`roles/pm.md`**（12 个从句，全部在这一个文件里） | T-65（4 个）、T-66（8 个） |

**一件事写在这里免得后面反复解释**：`docs/qa/` 下的任何改动都归 **QA**，不归 engineer、
不归 PM（`CLAUDE.md`「State and documents」）。所以上表里凡是落在 `docs/qa/` 的格子，
都是**某个任务的一格 DoD**，那一格由 QA 在同一个提交里完成，没有它任务不算做完。
这个「承载点」写法在这个仓库有先例：T-51 的第 17 条、T-52 的第 18 条。

## 三、文件冲突图

「冲突」的意思是：**同一个文件被多项要求同时改动**。而这个仓库的硬规矩是
**两个任务永不共有一个文件**（`principles.md` 18、上一件作业的任务表）。
所以每一个多项落在同一个文件的地方，只有两种出路：**合成一个任务**，或者**排成串行链**。

```
                        被几项要求改动     出路
roles/pm.md                  21 项        串行链，5 环（T-63→T-64→T-65→T-66→T-67）
principles.md                 8 项        串行链，3 环（T-63→T-68→T-69）
tools/verify-mount.mjs        2 项 + 3 处  搭 pm.md 那条链的车（T-63→T-65→T-67）
roles/qa.md                   6 项        一个任务（T-72）
roles/architect.md            5 项        一个任务（T-70）
roles/doc-reviewer.md         5 项        一个任务（T-77）
roles/engineer.md             4 项        一个任务（T-71）
roles/code-reviewer.md        4 项        一个任务（T-75）
roles/security-reviewer.md    3 项        一个任务（T-76）
roles/test-engineer.md        3 项        一个任务（T-73）
roles/code-engineer.md        2 项        一个任务（T-74）
roles/researcher.md           2 项        一个任务（T-78）
CLAUDE.md                     5 项        一个任务（T-80）
README.md + README-zh.md      5 项        一个任务（T-79，两份必须同一个人同一个提交）
host/crew.js                  1 项        跟 A1d 一起（T-64）
CHANGELOG.md                  1 项        一个任务（T-81）
docs/qa/*（已有用例）         5 处        QA 改断言，见第六节
docs/design/*、docs/decisions/* —         PM 与 architect 的文件，不属于任何任务
```

**只有两个文件真的是瓶颈**：`roles/pm.md` 和 `principles.md`。别的文件都是「几项落在一起，
一个人一次做完」——那不是冲突，那是一个大小合适的任务。

`tools/verify-mount.mjs` 是第三个要盯的文件，但它的问题不是「项数多」，是**时机**：见第五节。

## 四、串行链

### 4.1 `roles/pm.md`：五环（切法的理由与被否掉的选项在 `ADR 0016`）

`roles/pm.md` 今天 1485 行，21 项要改它。切法是**按主题切，一环拿走一整项**，
而不是按步骤号切一块地。理由一句话：**一项被切成两半，是这个仓库真吃过的亏**——
上一件作业的文档评审抓到的第一条 blocking 就是「一处交叉引用只做了一半」。

```
T-63  共同措辞的地基
      （A3 的段落形状与全局表、B10 的权威措辞、A6 的长版）
  │   交接 roles/pm.md、principles.md、tools/verify-mount.mjs
  ├──────────────────────────────┐
  ▼                              ▼
T-64  通道、访谈、与用户的交互      T-68  原则 22（苏格拉底）
      A1d、A4（第 2 步）、A1a、          │
      B5 五处、host/crew.js             ▼
  │                              T-69  principles.md 其余：流程规则、
  ▼                                    B5 七处、A7 十三处
T-65  第 9、10、15 步
      A1b、A1c、B4、B6、B7、A1e、
      A2、A1f、B13 四个从句
      ＋ tools/verify-mount.mjs 两处钉子
  │
  ▼
T-66  第 11–18 步与 Hard rules
      B1、B2、B3、B8、B12、B13 八个从句
  │
  ▼
T-67  第 4 步的文档形状与指针
      A6 短版、A7 命名规则 ＋ 本文件 16 处引用、B9 四处
      ＋ tools/verify-mount.mjs:886
```

**每一环为什么必须在前一环之后**：

| 环 | 为什么不能更早 |
| --- | --- |
| **T-64** 在 T-63 之后 | 它要在 `roles/pm.md` 里写下的「你能写什么」那一段和规则 A/B，是 T-63 定的**逐字文本**。T-63 之前那段文本不存在，T-64 只能自己编一套，那就和另外九份角色提示词对不上——而 DoD 第 7、8 条要的正是「十份对得上」。 |
| **T-65** 在 T-64 之后 | 两件事。① A1d 取消 `quick` 之后，「一个改动至少一个里程碑」才成立，而第 10 步的「一个任务做完」正是围着这句话写的；顺序反了，T-65 会先写出一句下一环要推翻的话。② B5 那五处里有两处在第 9 步（`roles/pm.md` 560 附近），和 T-65 要重写的段落挨着。 |
| **T-66** 在 T-65 之后 | 第 11 步暂存什么、第 12 步问什么、第 18 步收尾核什么，全部引用「一个任务做完」的定义——那句话由 T-65 改写。先改收尾，收尾就指着一个还没变的定义。 |
| **T-67** 在 T-66 之后 | A7 要把这个文件里 16 处旧路径全改掉，**包括前面三环刚写下的新句子里出现的那些**。改名放在最后，只扫一遍；放在前面，每一环都要再扫一次，而且漏一处没人看得见。 |

**T-64 和 T-68 可以同时跑**：T-63 交工时把 `roles/pm.md` 交给 T-64、把 `principles.md` 交给
T-68，两条链之后各走各的，不共有任何文件。

### 4.2 `principles.md`：三环

```
T-63 ── T-68（原则 22） ── T-69（流程规则跟改 ＋ B5 七处 ＋ A7 十三处）
```

- **T-68 在 T-63 之后**：T-63 在这个文件里加了两节非编号内容（A6 的八种类型、A3 的全局表），
  T-68 加的是编号原则 22。两者都动这个文件的顶层结构，同时做会互相盖掉。
  为什么先非编号后编号：`ADR 0021` 说明。
- **T-69 在 T-68 之后**：T-69 要扫 B5 的七处和 A7 的十三处，其中若干处落在
  T-63、T-68 刚写的新段落里。同 T-67 的理由：**扫描类的改动放在写作类的改动之后，只扫一遍。**
- **一件要报给 PM 的事**：`CRD 0019` 记着用户的原话「don't let engineer touch principle,
  you edit it」，所以这三环里 `principles.md` 那一半**由 PM 自己写**，QA 照旧验。
  任务行照样写，因为 DoD 和文件归属要留在仓库里；**谁动手是 PM 的事，不是我能定的。**

### 4.3 `tools/verify-mount.mjs`：搭 `roles/pm.md` 那条链的车

它被三环拥有：T-63 → T-65 → T-67，**顺序和 pm.md 那条链完全一样**，所以它没有增加任何一次
额外的等待。理由见第五节。这个仓库有更极端的先例：上一件作业里这一个文件被 **15 个任务**
先后拥有过（`ADR 0013`）。**先后，不是同时。**

### 4.4 交接的护栏

三条链上的交接，用的是 `ADR 0013` 已经定过的那一套，不发明新的：

1. **交工报告里写下文件的行数**，下一环从那个数接着（今天：`roles/pm.md` 1485 行、
   `principles.md` 1387 行、`tools/verify-mount.mjs` 1193 行）。
2. **下一环不许动上一环改过的段落**，任务行里点名是哪几段。
3. **上一环留下的 QA 用例是第二道护栏**：下一环把上一环的东西改坏了，那些用例会红。
4. **占位记号只对 persona 占位有效**（`ADR 0013`），这三个文件里没有任何一行是「应该消失」的，
   所以不用记号。

## 五、时机：为什么 `tools/verify-mount.mjs` 必须和散文同一个提交

`tools/verify-mount.mjs` 对 `roles/pm.md` 的散文下了三道**故意脆**的钉子。本作业会踩到三道里的
三道：

| 钉子 | 它今天钉着的字符串 | 谁踩到它 | 为什么 |
| --- | --- | --- | --- |
| 第 10 步的完成门 | `A task is finished when code review passes` | **T-65** | A1c 把「做完」改成「它的单元测试通过」，B4 再补上第四项文档评审。这句话必须改写，钉子跟着改。 |
| 第 10 步的并行锚 | `Parallel is the default` | **T-65** | A1b、A1c 之后，第 10 步不再是「三道检查默认并行、逐任务跑」。钉子的失败信息今天写着「the code review, the security review and QA started in one message」——那句话马上就成假话。 |
| PM 那一节的两个路径 | `docs/design/prd.md` | **T-67** | A7 改名。 |

**钉子的注释自己写着怎么办**：`or update this string in tools/verify-mount.mjs in the same
commit`。所以这不是我发明的规矩，是这个文件自己定的：**改散文的那个任务同时拥有那道钉子。**

同一件事也发生在 QA 那一侧，见下一节。

## 六、哪些任务会让已有的 QA 用例变红，那条用例归谁改

**归 QA。** `docs/qa/` 是 QA 的家，engineer 不碰它，PM 也不碰它。
修法是**改断言，不是删用例**（PRD「范围外」最后一条）。
每一处都在**同一个提交**里改完，因为 `npm test` 每个任务都要绿。

| 会红的用例 | 谁弄红的 | 为什么 | 承载在哪 |
| --- | --- | --- | --- |
| `docs/qa/T-52/case-01-principle-numbers-1-to-21.mjs` | **T-68** | 它断言 `principles.md` 里**没有** `## 22.`；A4 就是要加 `## 22.` | T-68 的一格 DoD |
| `docs/qa/T-52/case-19-pointer-rule-lives-in-principle-20.mjs` | **T-68** | 它断言「没有 `## 22.`」，还断言「编号刚好是 1 到 21」 | T-68 的一格 DoD |
| `docs/qa/T-52/case-09-glossary-placement.mjs` | **T-68** | 它断言 `## Words we use` 是**紧跟原则 21 的下一节**。原则 22 一插进来，这条就假了——用词表得挪到最后一条原则之后 | T-68 的一格 DoD |
| `docs/qa/T-42/case-12-finish-gate-sentence.mjs` | **T-65** | 它拿 `A task is finished when code review passes` 去做变异测试，连 `verify-mount.mjs` 的**失败信息原文**都写死了 | T-65 的一格 DoD |
| `docs/qa/T-56/case-08-existing-pins-intact.mjs` | **T-65** | 它断言 `Parallel is the default` 和 `A task is finished when code review passes` 原样在 | T-65 的一格 DoD |
| `docs/qa/T-60/case-09-prd-and-hld-exist-now.mjs` | **T-67**，再一次 **T-80** | 它用 `existsSync` 断言 `docs/design/prd.md` 和 `hld.md` **存在**（改名之后不存在了），还断言 `CLAUDE.md` 里有 `` `prd.md` — the opening document of **both** lanes ``（B5 要改掉 `both lanes`，A7 要改掉 `prd.md`） | T-67 的一格 DoD；T-80 再改一次 |

`CRD 0019` 已经**预告**了前两条，并且明确写着「那一步要 QA 做，不是 engineer，也不是 PM」。
**后四条是我在拆任务时数出来的，`CRD 0019` 里没有**——其中 `case-09` 那一条最容易被漏掉：
它不是在断言某个字符串，它在断言**节的顺序**。

**T-63 加的那一节（A6 的八种文档类型）必须放在 `## Words we use` 之后**，
不能放在原则 21 和用词表之间——那样 `case-09` 会红，而 T-63 是链的第一环，
第一环就把基线弄红，后面每一环都分不清新红和旧红。

**这里有一件必须报给 PM 的事**：A1c 说「QA 只跑一轮，在编码结束之后」。但上面五处必须在
**它们各自那个任务的提交里**改完，也就是编码还没结束的时候。这两件事不矛盾，
但要说清它们是**两回事**：

- **一轮 QA** = 从 DoD 写清单、一个 agent 一条用例、写新用例。它在最后。
- **改一条已有用例的断言** = 一次点名的、小的、跟着一个任务走的编辑。它在那个任务的提交里。

我建议 PM 在任务行的 DoD 里就用这两个不同的说法，别都叫「跑 QA」——
这个仓库为「一个词干两份活」已经付过两次代价了（`principles.md` 的用词表、B7）。
选项和被否掉的做法在 `ADR 0018`。

## 七、并行组

`M1` 只有一个里程碑，19 个任务。**并行是默认，串行要有一个真实的理由**（`principles.md` 18）。
下面每一组内部**没有任何两个任务共有一个文件**，所以可以在一条消息里全部启动。

```
第 0 波（一个人，别的全部等它）
  T-63  共同措辞的地基

第 1 波（11 个任务同时跑）
  T-64  roles/pm.md（通道与访谈）＋ host/crew.js
  T-68  principles.md（原则 22）
  T-70  roles/architect.md
  T-71  roles/engineer.md
  T-72  roles/qa.md
  T-73  roles/test-engineer.md
  T-74  roles/code-engineer.md
  T-75  roles/code-reviewer.md
  T-76  roles/security-reviewer.md
  T-77  roles/doc-reviewer.md
  T-78  roles/researcher.md

第 2 波（2 个任务同时跑）
  T-65  roles/pm.md（第 9、10、15 步）＋ tools/verify-mount.mjs
  T-69  principles.md（其余）

第 3 波（1 个任务）
  T-66  roles/pm.md（第 11–18 步与 Hard rules）

第 4 波（1 个任务）
  T-67  roles/pm.md（第 4 步、A7、B9）＋ tools/verify-mount.mjs

第 5 波（3 个任务同时跑，读者可见的文件，等前面全部交工）
  T-79  README.md ＋ README-zh.md
  T-80  CLAUDE.md
  T-81  CHANGELOG.md
```

**关键路径是 5 步**：T-63 → T-64 → T-65 → T-66 → T-67，然后第 5 波。
第 1 波的九份角色提示词加 T-68 全部并行，不在关键路径上。

**A1e 在这里是怎么落地的**：用户要的是「一个 engineer 一个代码改动」。第 1 波的十一个任务
就是十一个 engineer，每人一个文件一件事。`roles/pm.md` 那条链是这条规则在这个文件上的
**例外**——它必须写在任务行里（PRD 风险表明确要求），理由就是「两个任务永不共有一个文件」。

**第 5 波为什么必须等**：两份 README 和 `CLAUDE.md` 说的是「产品现在是什么样」。
前面还在改产品的时候写它，写完就过期。这也是 `roles/pm.md` 第 14 步本来的位置。

## 八、我复用了什么，什么是新的

**这份设计里几乎没有新东西**，这是有意的：

| 复用 | 从哪来 |
| --- | --- |
| 同一个文件的所有权先后交接 | `ADR 0013`，上一件作业 `roles/pm.md`（T-56→T-62）和 `tools/verify-mount.mjs`（15 个任务）都走过 |
| 「一格 DoD 当承载点」把 QA 该做的事挂在一个任务上 | 上一件作业 T-51 第 17 条、T-52 第 18 条 |
| 「故意脆的散文钉」和「改散文的人同时改钉子」 | `ADR 0004`、`ADR 0007`，以及 `verify-mount.mjs` 自己的注释 |
| 非编号一节而不是编号原则 | `ADR 0014`（用词表的先例） |
| 交接护栏用行数，不用会消失的记号 | `ADR 0013` |

**新的只有一样**：一份**权威措辞**放在 `principles.md` 里，让九个互相看不见的 engineer
逐字抄。这个仓库以前没有这么做过，因为以前没有一条规则要同时进十个文件。
它是本作业唯一真正的**边界**，所以它是第一个任务，选项和代价在 `ADR 0020`。

## 九、这个作业里最容易翻车的地方

没有模块边界，所以没有经典意义上的 walking skeleton。但**风险最高的那件事是清楚的**：

> **九个 engineer 要在九个文件里写下同一段话，而他们之间没有任何通道。**

DoD 第 7 条要的是「十份角色提示词都有那四样东西，少一份就红」；DoD 第 8 条要的是
「两张全局表说的是同一件事」。这两条**都不是某一个 engineer 能自己满足的**，
它们是九个人的**一致性**。

而这个仓库对不一致的历史记录很难看：上一件作业最后一轮文档评审的八条 blocking，
第一条就是「一处交叉引用只做了一半」。九个人写九份措辞，就是九次机会。

**T-63 就是为这一件事存在的**，它做的正是 walking skeleton 做的事：
**让一个人同时握住边界的两端，把最贵的那件事在第一个任务里就走通一遍。**

- T-63 在 `principles.md` 里写下**四段逐字文本**：小节标题、「读不受限」那一句、
  规则 A、规则 B；
- 同一个 engineer 立刻把它们落进 `roles/pm.md`——**这就是那条端到端的路**，
  证明这四段话真的能放进一份角色提示词，而不只是在 `principles.md` 里好看；
- 之后九个任务只做一件事：**照抄**，加上自己那一份的可写集合清单（内容各不相同，形状一样）。

一条 QA 用例遍历十份文件断言那四段逐字文本在，就能钉住整件事——**一个字符串，十个文件**。
这是 DoD 第 7 条唯一能被自动检查的形状。

**第二危险的地方**：A7 的改名。它要碰 30 个文件 99 处，其中 30 处在**历史快照**里
（`docs/decisions/crd/` 15 处、`docs/research/` 12 处、`CHANGELOG.md` 3 处），
而这个仓库的规矩是「CRD 是某一刻的快照，不重写」。
DoD 第 11 条按字面读要求那两个路径**在整个仓库里一次都不出现**，
按字面做就是重写历史。选项和推荐在 `ADR 0017`，**这一条要 PM 拍**。

## 十、明确不做的事

- **不拆 `roles/pm.md`**（PRD 范围外）。它 1485 行、21 项要改它、拆开很诱人——不做。
- **不写 `docs/design/api/` 下的任何文件**。一个模块，没有跨模块边界。
- **不新开「全库用词清理」任务**。沿用 `ADR 0014` 的边界：只清理本作业本来就要动的文件，
  每一处由已经拥有那个文件的那个任务顺手做。
- **不删任何一条已有 QA 用例**。改断言。
- **不动 `docs/design/tasks.md` 里 T-01 到 T-62 的任何一个字**，包括那 6 处旧路径引用——
  它们在 `ADR 0017` 的范围问题里，归 PM。
- **不改 `docs/design/prd-2026-08-21-apply-req.md`**。它是判本作业的标准。
  我在第十一节写了在它里面看到的问题，一个字都没有改它。
- **不引入任何测试框架**（PRD 语言与技术栈）。
- **不发版**。`package.json` 的 `version` 动不动，PRD 没说，见第十一节。

## 十一、我不确定的地方，和 PRD 里我认为还弱的地方

**我一个字都没有改 PRD。** 下面每一条都是报给 PM 的。

1. **DoD 第 3 条的那条检查今天就已经「通不了红」。** 它要求「**不再**出现
   `Stop when the answers are settled` 这句软话」。这句话在 `roles/pm.md` 第 2 步里真的存在，
   但它在第 236–237 行**换行了**（`Stop when the answers are` / `   settled.`），
   所以按字面 grep 一次都命中不了——**这条检查从写下的那一刻起就不可能变红**。
   这正是这个仓库吃过七次的那个陷阱，`docs/qa/T-60/case-09` 的头部注释把方法写下来了：
   **数两次**，把文本压平再数一次，两个数不一样就说明它换行了。
   我在 T-64 的 DoD 里已经写成压平后的检查。
2. **DoD 第 6 条的 `grep -c 'quick' roles/pm.md` 判不了它要判的事。** `grep -c` 给的是一个数，
   不是位置；而这个文件里 `quick` 今天有 5 处，其中第 36 行的 `a quick look`
   是一句正常英文，和通道无关，改完之后它还在。所以那条命令永远不会是 0。
   我在 T-64 的 DoD 里改成了钉 `` `quick` ``（带反引号的那一种）的处数。
3. **DoD 第 15 条指着一道不存在的检查。** 它写「`node tools/verify-mount.mjs` 里两份 README
   的对齐检查照旧过」。`tools/verify-mount.mjs` 里**没有任何一处提到 README**（我 grep 过，0 处）。
   两份 README 的对齐检查是 `docs/qa/T-59/` 里的 QA 用例。这一条要 PM 改成正确的命令，
   不然它是第二条「不可能变红」的检查。
4. **DoD 第 10 条和两道已有的硬钉子正面冲突。** 它要求「十份角色提示词里**没有任何**
   `docs/decisions/`、`docs/qa/gaps.md`、`principles.md`、`CLAUDE.md` 的路径」——
   而 `tools/verify-mount.mjs` 今天**要求** `roles/pm.md` 里有 `principles.md` 和至少
   **3 处** `docs/qa/gaps.md`（今天 4 处），还**要求**五份角色提示词里有 `docs/decisions/adr/`。
   我读 DoD 第 10 条的后半句「出现在**「去读这个文件」的位置上**」，认为它只禁「去读」，
   不禁「往这里写」——那样两边就不冲突了。**但这个区别要靠人判断上下文，
   QA 的用例写不出可靠的自动判据。** 我在 T-67、T-70、T-71、T-72、T-77 的 DoD 里
   按「只禁去读」写了，并把那条判不了的部分写进 `docs/qa/gaps.md` 的承载格。

   **我自己第一版就踩进这个坑，写在这里当证据**：我原本给的验法是
   `grep -c 'docs/decisions/crd/' roles/pm.md` ＝ 0。那条命令今天是 **6**，
   而其中只有 **3** 处是「去读某一份具体的历史文件」（310、1301、1320 行），
   另外 3 处是「往这里写一份 CRD」的目的地（93、1310、1462 行）——照那条命令做，
   engineer 会把写的目的地一起删掉，然后 `tools/verify-mount.mjs` 变红。
   现在的验法是 `grep -cE 'docs/decisions/crd/[0-9]{4}-'`（只数指向具体编号文件的那种）。
   **同一个坑在 `roles/doc-reviewer.md` 上更深**：它的 2 处 `principles.md` 里，
   194 行是要删的指针，203 行是「你要评审的文件清单」里的一项——删掉它等于让文档评审
   不再读这个文件。**B9 的八条（实际是 9 个位置，其中 `roles/pm.md` 那一行覆盖两处）
   没有一条能用「这个路径出现几次」来验，每一条都要看它出现在什么位置上。**
   **如果 PM 读 DoD 第 10 条是「一处都不许有」，那这一项做不了，要回去找用户。**
5. **优先级表和 DoD 互相矛盾。** 「很想有」里的 **B9** 对应 DoD 第 10 条，
   「有就好、最先砍」的 **A5** 对应 DoD 第 12 条。按切割顺序砍掉它们，
   M1 的 DoD 就有两条过不了；而 PRD 说砍了「这件活仍然成立」。
   **两个说法不能同时为真。** 要么砍的时候同时删掉那两条 DoD（那要用户点头，
   因为 DoD 条目属于判本作业的标准），要么把那两项挪进「必须有」。这一条我不能自己定。
6. **A7 的数字对不上。** PRD 和 `CRD 0023` 都写「29 个文件 85 处」。
   我今天实测是 **30 个文件 99 处**（79 处 `prd.md` ＋ 20 处 `hld.md`）。
   差别的一部分是本作业自己新写的三个文件（PRD、两份研究）里又新增了引用。
   这不改变任何一件要做的事，只改计数——但 DoD 第 11 条是按「一处都不剩」验的，
   所以真实的数字比 85 重要。
7. **`package.json` 的 `version` 动不动，PRD 没说。** DoD 第 15 条要求
   `CHANGELOG.md` 有 **0.9.0** 一节。这个仓库的规矩是「改 CHANGELOG、bump `package.json`、
   提交、推 `main`、再推 `v*` tag」，而本作业不推送、不发版。
   一个写着 0.9.0 的 CHANGELOG 配一个还写着 0.8.0 的 `package.json`，
   是这个仓库以前没出现过的状态。**要 PM 定**，我没有把 `package.json` 放进任何任务。
8. **A1d 要改 `host/crew.js`，而 PRD 的范围外只排除了「为 A2 改 `host/`」。**
   `host/crew.js` 里有一句 `The \`ask\` and \`quick\` lanes work either way.`——
   它是 PM 提示词的一部分，由宿主插件拼出来。取消 `quick` 通道就得改它。
   我把它放进了 T-64。**这是一处代码改动，PRD 没有预告过**；如果 PM 认为它超范围，
   那 A1d 就只做了一半，而且是看不见的那一半。
9. **A1f 到底写哪几条，PRD 把它留给 ADR。** 我在 `ADR 0019` 里列了四条、推荐了三条。
   PM 有权换。
10. **`docs/design/tasks.md` 里 T-01 到 T-62 有 6 处旧路径引用，我按简报不许动。**
    A7 的 DoD 第 11 条要求全仓库一处不剩。这 6 处只有 PM 能改。
11. **DoD 第 2 条的「不少于 193」没有给命令。** `bash docs/qa/run-all.sh` 打的是
    「17 个任务」，不是用例总数。今天 `ls docs/qa/*/case-*.mjs | wc -l` = **193**。
    我在任务行里用的是这条命令；PM 可能想把它写进 DoD。
12. **我没有为「三个评审只重跑同类」写任何自动检查。** A1b 里那半句
    （代码改动只重跑代码评审）是 PM 自己的行为，`npm test` 看不见它。
    它只能靠 `roles/pm.md` 里的散文和文档评审。这不是漏了，是测不到——
    该进 `docs/qa/gaps.md`。
