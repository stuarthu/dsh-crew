# CRD 0019：苏格拉底式访谈要成为一条原则——但和它的应用一起落地，不在本作业

## 谁提的

用户，2026-08-21，在 T-52 提交之后、T-53/T-54/T-55 在跑的时候。原话：
「I want to add a new idea into principle, that idea is destilled and wrote in ~/idea」，
并且明确「**don't let engineer touch principle, you edit it**」（PM 自己写，不经过 engineer）。

PM 给了两条路，用户选了第二条：

1. 现在就写成编号原则 22，`Lives in` 诚实写「今天还没有角色提示词应用它」；
2. **等它的应用版做完，一起进。**

**用户选 2。**

## 他们要什么

把 `~/idea` 里蒸馏好的**苏格拉底式访谈方法**变成 `principles.md` 的一条编号原则。

## 为什么等——这不是拖延，是这个文件自己的规矩

`principles.md` 里一个**编号**是四件事的承诺：**规则、为什么、承载它的文件、外部来源**
（`ADR 0014` 就是用这条规矩否掉「给用词表编号」的）。

这个想法四件里有三件是现成的：规则清楚，理由清楚，**外部来源有十条真实链接**（见下）。
**缺的是第四件：今天仓库里没有任何一份角色提示词应用它。** 应用版是改
`roles/pm.md` 团队通道第 2 步（`~/req` 第 8 项），而用户决定 `~/req` 整件事在本作业之后做。

所以现在落地，它的 `Lives in` 会是一张纯承诺清单。等应用版一起进，它落地时就是事实。

## 决定

**deferred（推迟），不是 rejected。** 用户决定，2026-08-21。
和 `~/req` 第 8 项一起做，成为**下一件作业**的一部分。本作业不动 `principles.md`。

**这条 CRD 不删。** 它是这个决定的记录，也是那件作业的输入。

## 耐久的那一半:内容搬进仓库,不依赖仓库外的文件

`~/idea`（166 行）和 `~/req`（916 行）**都在仓库外面**（用户的主目录）。按 `CRD 0006`
「按寿命分家」的道理，一件将来要做的活不能只靠一个仓库外的文件活着——那个文件可能被改、被删、
或者换一台机器就没了。所以下面是**将来写那条原则所需要的全部东西**。

### 规则（一句话）

**不要告诉，去问——而且问那个正好对着你不知道的那个洞的问题。**

### 六种问题类型（这是方法的核心）

先看清自己缺的是哪一类东西，再挑对应的类型。随便问一个是外行的做法。

| # | 类型 | 它打开什么 | 例子 |
| --- | --- | --- | --- |
| 1 | **澄清** | 那些词到底指什么 | 「你说的『快』是什么意思？」「能给一个例子吗？」 |
| 2 | **探问预设** | 没检查就相信的东西 | 「你这里把什么当成理所当然了？」「它总是成立吗？」 |
| 3 | **理由与证据** | 那个判断有没有依据 | 「你怎么知道的？」「你见到过什么支持它？」 |
| 4 | **别的视角** | 没人摆到桌上的选项 | 「谁会不同意，为什么？」「有别的做法吗？」 |
| 5 | **推论** | 这个选择背后拖进来的东西 | 「照那样建，接下来会怎样？」「什么会坏？」 |
| 6 | **质疑这个问题本身** | 这到底是不是该解的问题 | 「这是该要的东西吗？」「这个要求本身假设了什么？」 |

**第 6 类是最常被跳过、而且最省工的一类。** 它给出「我认为你可能在解错的问题」的许可。
要早用——那时候改方向还便宜。

### 漏斗：先宽后窄

开放问题在前，精确问题在后。**顺序很重要**：先窄只会确认你脑子里已有的画面，
永远问不到你没想到要问的东西。

### 两种失败模式

1. **引导性问题**——把想要的答案藏在问题里（「你需要它很快，对吧？」）。
   **规则**：如果你觉得自己已经知道答案了，**去查**（代码、他给的文件、他已经说过的话），
   不要把自己的猜测套上问号。
2. **让人觉得在被考**——一旦对方觉得被评判、被逼、被显得笨，他就不再说真话，
   只说能让问题停下来的话。那时候访谈比没做更糟，因为它产出**自信的错答案**。
   **规则**：不比分，不抓人，两个人一起看问题，不是互相看。

### 停止规则（用户在 `~/req` 里说这是最要紧的一条）

**在你能把整份开场文档每一节都写下来、一处猜测都不剩的那一刻停。早一个问题不行，晚一个也不行。**
「问到答案定下来」这种说法太软。没有正确的问题数量：五个可以，二十个可以；
**不可以的是问一个你已经有答案的问题。**

### 已经在 crew 里的两条（不是新东西）

- **一轮一个问题**，各带 PM 自己的推荐答案——`roles/pm.md` 团队通道第 2 步今天就有。
- **能自己查到的先自己查**（`Never guess`）——今天也有。

**所以那条原则真正新增的是：六种问题类型、漏斗、两种失败模式、以及那条停止规则。**

### 我们自己的证据（`principles.md` 的 `Why (ours)` 那一栏要用的）

本作业本身就是最好的例子，而且每一件都能在仓库里查到：

- 这场访谈跑了十几轮、一轮一个问题，**用户在过程中改了三次自己的主张**：两个 engineer 要不要
  对话（`CRD 0012` 否决表第一行，用户先提、自己又否掉）、两棵工作树取代「A 先跑一小段」
  （`CRD 0013`）、双人形状必须有 architect（`CRD 0014`）。**三次都是问出来的，不是被告知的。**
- **第 6 类问题救过两次**：PM 指出「你要的这套不是结对编程，它靠不收敛，而结对靠收敛」
  （`CRD 0012`「它不是结对编程」一节）；文档评审指出「T-56 拆得开，而且这个作业自己的
  `ADR 0013` 就证明了」（`CRD 0017` 之前那一轮）。**两次都是把请求本身判为需要重新表述。**
- **反例也在仓库里**：PM 发出的简报里有三处自带错误（说「只碰两个文件」却又要求红灯长在测试
  文件里；把「拿到全部工具」当成通用后果而它只在 18 种情况的 9 种成立；照抄的原文里含
  `roleDeny: {` 撞坏了 `case-04`）。**三次都是「以为自己知道答案」而没有先去查**——
  正好是「引导性问题」那条规则要防的同一个毛病，只是发生在指示里而不是问题里。

### 外部来源（十条，`~/idea` 里的原始清单）

- [6 types of Socratic Questions — University of Michigan](https://websites.umich.edu/~elements/probsolv/strategy/cthinking.htm)
- [The Six Types of Socratic Questions (PDF)](https://www.trigonweb.com/dowload/SOCRATIC%20QUESTIONS.pdf)
- [Socratic Questioning in Psychology: Examples and Techniques](https://positivepsychology.com/socratic-questioning/)
- [Socratic Questioning as a requirements elicitation tool](https://masteringbusinessanalysis.com/mba180-socratic-questioning/)
- [How to Use the Socratic Questioning Technique](https://therightquestions.co/the-socratic-method-questioning-technique/)
- [Improve Investigative Interviews with Socratic Questioning](https://taproot.com/improve-investigative-interviews-with-socratic-questioning/)
- [Effective questioning techniques — the funnel](https://pdf.ai/resources/effective-questioning-techniques)
- [Towards a typology of questions for requirements elicitation interviews (PDF)](https://www.yorku.ca/liaskos/Papers/RE2021/RE2021.pdf)
- [LLMREI: Automating Requirements Elicitation Interviews with LLMs](https://arxiv.org/pdf/2507.02564)
- [Clarifying Agent in Dialogue Systems](https://www.emergentmind.com/topics/clarifying-agent)

用户在 `~/req` 第 8 项里还加了一条本仓库特有的要求：**PM 被允许告诉用户「你要的这件事本身
可能是错的」，用户明确说想要那个**（第 6 类问题的授权）。

## 它动到什么

**本作业：什么都不动。** `principles.md` 一个字不改，T-53/T-54/T-55 不受影响。

**下一件作业**（`~/req`）：`principles.md` 加一条编号原则（届时是 22，除非中间又加了别的），
以及它的应用版——`roles/pm.md` 团队通道第 2 步。

## 提前记下一个会咬人的地方

`docs/qa/T-52/case-01-principle-numbers-1-to-21.mjs` **断言这个文件里没有 `## 22.`**，
`case-19` 也引用了「1–21」这个范围。**加原则 22 会让这两条变红。**

QA 自己在 `case-01` 的头部写了这个失效方向和正确做法：
「**the file may grow principle 22 one day … whoever adds principle 22 changes this line
together with the file, in the same commit**」。

**所以那件作业必须在同一个提交里同时改 `principles.md` 和这两条用例，而 `docs/qa/` 是 QA 的家
——那一步要 QA 做，不是 engineer，也不是 PM。** 先写在这里，免得那天有人以为它是回归。

## 一个 departure，写下来不藏

用户明确说「**don't let engineer touch principle, you edit it**」——PM 直接写产品文件。
这偏离 crew 自己的形状（PM 只写文档和提交，产品文件由 engineer 写、QA 验）。
**本作业没有真的执行它**（因为用户随后选了推迟），但那条指示对下一件作业仍然有效，
所以记在这里：那件作业里 `principles.md` 由 PM 写，QA 照旧验。

## 代价

- **想法不会丢**：内容已经搬进仓库，不再只靠 `~/idea` 活着。
- **规则晚落地一件作业**。用户判断「有承载文件时再落地」比「先落地一张承诺清单」好。
- 那件作业要多做一步：同一个提交里更新两条 QA 用例。

## Applied

**本作业没有任何文件因本 CRD 改动。** 它是一份写给下一件作业的输入。
