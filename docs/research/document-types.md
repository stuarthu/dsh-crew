# 八种文档各自装什么——外部来源怎么说，本仓库今天怎么写

- **问的是什么**：PM 问的是 `~/req` 第 6 项：「PRD 里到底该有什么内容？现在这份 PRD 不对。」
  以及同一个问题对另外七种文档类型再问一遍。
- **谁写的**：crew researcher，2026-08-21。
- **这份文件是什么**：只有事实和对照。**不给建议，不替本仓库的任何文件提措辞。**
  该怎么改是 PM 的决定，不是我的。
- **写作时的机器状态**：我没有 shell，所有外部页面都是 `WebFetch` / `WebSearch` 拿到的。
  凡是页面被拒（403）或页面本身没写日期的，下面都点名说了。
- **本仓库这一侧我读了**：`docs/design/prd.md`、`docs/design/hld.md`、`docs/design/tasks.md`
  （前 120 行 + T-01 段）、`docs/decisions/adr/0010-bash-check-explicit-list.md`、
  `docs/decisions/adr/0004-parallel-anchor-string.md`（只看标题层级）、
  `docs/decisions/crd/0013-two-worktrees-per-task.md`、
  `docs/decisions/crd/0020-apply-req-speed-items.md`（只看标题层级）、
  `docs/qa/T-42/run.sh`、`docs/qa/T-42/case-19-gate-verdicts-line-per-section.mjs`，
  以及作业文件夹里的 `~/.claude/crew/jobs/paired-engineers/final-qa-plan.md`（QA 的测试计划）。

## 每条发现怎么读

每一节的每一条都带：**答案**、**出处**（URL 或文件行）、**日期**（页面自己的日期，或我读它的日期
2026-08-21）、**把握**（certain / likely / unknown）。
凡是来源之间**互相不同意**的，我把两边都写出来，**不取中间值**。

---

## 一、PRD（产品需求文档）

### 1.1 有没有一个「定义 PRD 的机构」？

- **答案**：**没有。** PRD 不是任何标准机构定义的文档类型。ISO/IEC/IEEE 有的是 **SRS**
  （software requirements specification，见 1.5），没有 PRD。所以 PRD 的「标准内容」只能引
  **写过它的人**和**公开模板**，不能引标准号。
- **出处**：我在 iso.org 与 standards.ieee.org 的检索里只找到 requirements engineering
  （ISO/IEC/IEEE 29148）与 test documentation（29119-3）等，没有任何以 "product requirements
  document" 命名的标准。
- **日期**：读于 2026-08-21。
- **把握**：likely（我不能证明世上不存在，只能说我按 "PRD standard" / "product requirements
  document standard" 检索没有找到）。

### 1.2 最接近「原始出处」的一份：Marty Cagan，《How To Write a Good PRD》

这是我找到的、由**提出这套做法的人自己写**的一份，SVPG 官网自己托管的 PDF。

- **PRD 由四大块组成**（原文：「The PRD is comprised of four major areas.」）：
  1. **Product Purpose**——「Your job is to paint the *target*.」并且明确要求这一节覆盖四件事，
     原文逐条是：
     - 「The problems you want to solve, **not the solution**」
     - 「Who is the product for? Companies, Customers, Users」
     - 「Details are great, but the big picture must be clear」
     - 「Describe scenarios」
  2. **Features**——「your product team will benefit from clear, unambiguous requirements that
     **state the need, rather than the solution**」；「Describe each feature at the level of the
     interaction design and use cases」；并且要有 **requirements traceability**：
     「identify which of your requirements are in support of each objective」，理由是
     「If someone decides to cut a requirement, it can be difficult to understand the full impact
     of this cut」。
  3. **Release Criteria**——「The release criteria are often just hand-waved, but a good PRD puts
     considerable thought into what the true minimum requirements are」，清单六条原文是：
     `Performance`、`Scalability`、`Reliability`、`Usability`、`Supportability`、`Localizability`。
  4. **Schedule**——「It is not useful just to list a random date, but rather you should describe
     the context and motivation for the timeframe, and describe a target window.」
- **另外两条硬要求**，不在四大块里但被单独立成步骤：
  - **Step 8: Prioritize**——分类（`must-have` / `high-want` / `nice-to-have`）**不够**，
    「Within each prioritization classification it is important to **rank-order each requirement,
    from 1 to n**」。理由原文两条：一是进度会滑、要砍东西时不能让团队「implement the easy
    features first」；二是开发中会长出新需求，「The prioritization helps you to know what to cut」。
    对 `must-have` 的门槛：「the product should not ship if even one of the 'must-have' features
    is not ready」。
  - **Step 9: Test Completeness**——判一份 PRD 写完了没有，用两个问题：
    「Can an engineer get enough understanding of the target in order to get the product there?
    Can the QA team get enough information to **design a test plan and begin writing their test
    cases**?」
- **它明确说 PRD 不是什么**：
  - 不是 MRD：「the market requirements describe the opportunity or the market need, and the
    product requirements describe a product that addresses that opportunity or need」。
  - 不是产品战略和 roadmap：「The product strategy describes a vision, typically between two and
    five years out … The PRD describes **a particular product release** along that path.」
  - 不是解决方案：见上面 Product Purpose 与 Features 两处原话。
  - 关于**技术实现**，这份文件没有一句「PRD 不许写技术」，它说的是要给工程留余地：
    「You must be very clear what each feature is and what the user experience should be, while
    **leaving as much flexibility to the engineering team as possible**」。
- **它还说 PRD 是活的**：「Remember that the PRD is a living document」；
  「If it's not in the PRD, put it in the PRD.」
- **出处**：https://www.svpg.com/wp-content/uploads/2024/07/How-To-Write-a-Good-PRD.pdf
  （PDF 页脚：`© 2005 Silicon Valley Product Group`；我逐页读了第 1–14 页原文）。
- **日期**：文件自己标 **2005**；SVPG 在 **2024-07** 重新上传到这个路径（URL 里的
  `/2024/07/`）。我读于 2026-08-21。
- **把握**：certain（原文逐句引用）。

### 1.3 同一个作者后来的相反意见——来源之间**真的不同意**，两边都写

- **答案**：Cagan 后来主张用**高保真原型**代替 PRD。检索摘要里的说法是：2007 年的
  《Revisiting the Product Spec》里他的结论是 high-fidelity prototype 是 PRD 的最好替代品，
  理由是不要花几周写一份「50-page Word document that few will read and is impossible to test」；
  另一篇《The End Of Requirements》主张团队干脆停止用 "requirements" 这个词思考。
- **出处**：https://www.svpg.com/revisiting-the-product-spec/ 与
  https://www.svpg.com/the-end-of-requirements/ （我只拿到检索摘要，**没有打开这两页原文**）。
- **日期**：摘要说《Revisiting the Product Spec》是 2007；我读检索结果于 2026-08-21。
- **把握**：likely（转述自检索摘要，不是原文逐句）。
- **这一条为什么重要**：同一个最权威的来源，2005 年给了模板，2007 年之后主张少写/不写。
  **这两个说法我不合并。** 如果 PM 要引 Cagan，必须说清引的是哪一年的他。

### 1.4 公开模板：Atlassian 的 Confluence「Product requirements」模板

- **答案**：这份模板的小节（页面自己的命名）是：
  1. `PRD basics and team roles`——「Set the scene by using the top table of the template to lay
     out the details of your new product or feature.」
  2. `Objective`——「a brief explanation for how this project supports your organization's larger
     goals.」
  3. `Success metrics`——一张表，「product or feature-specific goals as well as the metrics you'll
     use to monitor your success.」
  4. `Assumptions`——「any assumptions you have about your users, technical constraints, and
     business goals.」
  5. `Options`——一张表，「all of the product requirements you've considered」，带 user stories 和
     importance level。
  6. `Supporting documentation`——「add mockups, diagrams, or visual designs related to the product
     requirements.」
  7. `Open questions`——一张表，「questions as they come to you」，带答案和日期两列。
  8. `Out of scope`——「list what's out of scope for this feature or release.」
- **出处**：https://www.atlassian.com/software/confluence/templates/product-requirements
- **日期**：**页面没有写日期**。读于 2026-08-21。
- **把握**：certain（小节名和引文来自页面本身），但**日期未知**，所以这一条的新旧无法判断。
- **我查过但没答上的**：Atlassian 那篇 "Product requirements documents, downsized"
  （https://www.atlassian.com/agile/product-management/requirements）我 `WebFetch` 只拿到导航菜单，
  正文没拿到；`confluence.atlassian.com` 的 blueprint 文档页（Last modified **Oct 6, 2021**）
  正文里**没有**逐条列出小节名。所以「Atlassian 的 downsized PRD 有哪几节」这一条，
  我只有检索摘要说的三块（`Project Specifics`（Participants / Status）、
  `Background and Strategic Fit`、`User Stories`），**把握 likely，不是原文**。

### 1.5 PRD 与 SRS 的关系（ISO/IEC/IEEE 29148:2018）

- **答案**：SRS 是**有标准号**的那一份，规定在 **ISO/IEC/IEEE 29148:2018 的 9.6 节**。
  它要求的强制内容包括 identification、front matter、definitions、references、acronyms；
  文档主体的四块是 `Introduction`、`References and Definitions`、`Overall Description`
  （「describes the general factors that affect the product and its requirements **without stating
  specific requirements**」）、`Specific Requirements`。小节顺序可以按项目的信息管理政策调整。
- **出处**：https://www.reqview.com/doc/iso-iec-ieee-29148-templates/ 与
  https://github.com/wxinix/IEEE-29148-SRS-LaTeX-Template （两者都自称按 29148-2018 §9.6）；
  标准原文在 https://ieeexplore.ieee.org/document/8559686 是收费的，**我没有读到标准原文**。
- **日期**：标准 **2018**；我读于 2026-08-21。
- **把握**：likely（二手模板，不是标准原文）。
- **PRD 与 SRS 的差别**：SRS 是**工程**文档，用 shall 句写可验证的需求；PRD 是**产品**文档，
  Cagan 那份明确要求写 problem、user、scenario、priority、release criteria、schedule，
  这些在 29148 的 SRS 模板里没有对应小节。**没有任何一份来源说 PRD 应当写成 SRS。**

### 1.6 PRD 与 functional spec 的差别（Joel Spolsky，2000）

- **答案**：Joel 的分法一句话：「Functional specs talk about the features of the program **from
  the User's point of view**」，technical spec 讲实现。他列的 functional spec 组成部分是七块：
  `Disclaimer`、`Single Author`、`Scenarios`、`Nongoals`、`Overview`、`Details`（他自己说这是
  最重要的一块）、`Side Notes`。
- **出处**：原文
  https://www.joelonsoftware.com/2000/10/03/painless-functional-specifications-part-2-whats-a-spec/
  ——**`WebFetch` 返回 HTTP 403，我打不开原文**。上面的组成清单来自转述这篇文章的
  https://blog.sasworkshops.com/joel-6-painless-functional-specs-part-2/
- **日期**：原文 **2000-10-03**（两处来源一致）；转述页无日期；读于 2026-08-21。
- **把握**：likely（二手转述）。**注意**：另一个检索摘要提到 Joel 的 spec 里还有
  `Open Issues` 一节，而转述页的七块里没有它——**两个二手来源不一致，我不合并**。
- **它和 PRD 的关系**：Joel 的 functional spec 里的 `Scenarios`、`Nongoals`、`Overview`、
  `Details` 与 Cagan PRD 的 Product Purpose / Features 大面积重叠。**这两个词在业界不是干净分开
  的两种文档**；能分开的只有一件事：functional spec 明确不写实现（那是 technical spec）。

### 1.7 PRD 与 one-pager / PR-FAQ 的差别（Amazon 的 working backwards）

- **答案**：Amazon 的 PR/FAQ 是**先写发布稿**的那一种，不是需求清单。它由三部分组成：
  - **Press Release**，六块：`Heading`（「Name the product so the reader … will understand—one
    sentence under the title.」）、`Subheading`（「Describe the customer for the product and what
    benefits they will gain」）、`Summary Paragraph`、`Problem Paragraph`（「write this paragraph
    **from the customer's point of view**」）、`Solution Paragraph(s)`、`Quotes & Getting Started`。
  - **External FAQs**：客户/媒体会问的——价格、功能、支持、在哪买。
  - **Internal FAQs**：公司内部的——财务、市场、运营、技术可行性、风险、成功条件。
- **篇幅**：检索摘要说 press release 一页，整份约六页。
- **出处**：https://workingbackwards.com/concepts/working-backwards-pr-faq-process/
  （作者 Colin Bryar 自己的站点）；篇幅那句来自检索摘要，非原文。
- **日期**：**页面没有日期**。原书《Working Backwards》（Bryar & Carr）2021 年出版。
  读于 2026-08-21。
- **把握**：certain（小节名与引文来自该页面）；「约六页」likely。

### 1.8 「今天的 PRD 模板」通常有哪些节（多份 2025–2026 的公开模板的交集）

- **答案**：交集大致是：project overview / objectives 与 success metrics / stakeholder roles /
  user personas 与 use cases / functional 与 non-functional requirements / dependencies 与
  constraints / timeline 与 milestones / design resources / **out-of-scope** / **open questions**。
  Figma 的那份列的是：product overview；purpose, use cases, main value propositions；features and
  functionality；user personas and user stories；user flows and UX notes；release criteria and
  timeline；potential risks；non-functional requirements；assumptions, dependencies, constraints；
  evaluation plan and success metrics。Figma 还写了一句边界：
  「a PRD typically paints a broad picture, focusing on **what** you're building rather than **how**
  you'll build it」。
- **出处**：https://www.figma.com/resource-library/product-requirements-document/ ；
  交集那一段来自对 Reforge、Product School、monday.com、Pendo、Mural 等模板页的检索摘要
  （https://www.reforge.com/blog/product-requirement-document-prd-templates 等）。
- **日期**：Figma 页面**没有日期**；检索结果读于 2026-08-21。
- **把握**：Figma 的清单 certain（页面自己列的）；「多份模板的交集」likely（来自检索摘要）。

### 1.9 一句总结（只是把上面几条并排，不是我的判断）

**所有来源都同意 PRD 里有的**：问题（从用户角度写）、这产品给谁、目标与怎么量、需求本身、
不做什么（out of scope / nongoals）、还没定的问题。
**只有一部分来源要求的**：requirement 的优先级与 1..n 排序（Cagan 明确要求，Atlassian 只有
importance 一列，Figma 没有）、release criteria 那六项非功能门槛（Cagan 要求，别人多数不列）、
schedule/target window（Cagan、Figma 有，Atlassian 那份模板没有）。
**没有任何来源要求 PRD 装的**：文件所有权、任务编号、grep 命令、模块落点。

---

## 二、HLD（高层设计文档）

### 2.1 「HLD」和「LLD」这对词有标准定义吗？

- **答案**：**没有，而且最相关的那份标准自己明说不管这件事。** IEEE Std 1016-2009 的
  Introduction 原文：
  > 「This revision of the standard is modeled after IEEE Std 1471-2000, extending the concepts of
  > view, viewpoint, stakeholder, and concern from that standard to support **high-level and
  > detailed design** and construction for software. **The demarcation between architecture,
  > high-level and detailed design varies from system to system and is beyond the scope of this
  > standard.**」
- **出处**：IEEE Std 1016-2009，Introduction，印刷页 v。PDF：
  https://cengproject.cankaya.edu.tr/wp-content/uploads/sites/10/2017/12/SDD-ieee-1016-2009.pdf
- **日期**：标准由 IEEE-SA Standards Board 在 **2009-03-19** 批准；PDF 元数据 created
  2009-07-10。读于 2026-08-21。
- **把握**：certain（原文逐句）。
- **推论（也是事实）**：所以「HLD 该有什么、LLD 该有什么」**不能引标准**。谁引标准号说这件事，
  引错了。

### 2.2 IEEE 1016-2009 的 SDD（software design description）要求什么内容

- **答案**：clause 4「Design description information content」的九小节是：
  `4.1 Introduction`、`4.2 SDD identification`、`4.3 Design stakeholders and their concerns`、
  `4.4 Design views`、`4.5 Design viewpoints`、`4.6 Design elements`、`4.7 Design overlays`、
  `4.8 Design rationale`、`4.9 Design languages`。
  clause 5 定义了**十二个 design viewpoint**，逐个原名是：
  `5.2 Context`、`5.3 Composition`、`5.4 Logical`、`5.5 Dependency`、`5.6 Information`、
  `5.7 Patterns use`、`5.8 Interface`、`5.9 Structure`、`5.10 Interaction`、
  `5.11 State dynamics`、`5.12 Algorithm`、`5.13 Resource`。
  Annex C 是「Templates for an SDD」。
- **出处**：同上 PDF，Contents（印刷页 ix）。
- **日期**：2009-03-19 批准；读于 2026-08-21。
- **把握**：certain。
- **一个必须知道的状态**：检索结果里 standards.ieee.org 把 1016-2009 标为
  **Inactive-Reserved**（https://standards.ieee.org/standard/1016-2009.html 的标题就是
  "Inactive-Reserved Standard"）。**把握 likely**——我没有打开那一页确认它说的是哪一年起。

### 2.3 现代实践里最接近 HLD 的东西：Google 的 design doc

- **答案**：Malte Ubl 写的 Google design doc 的小节是：
  1. `Context and Scope`——「gives the reader a very rough overview of the landscape in which the
     new system is being built」
  2. `Goals and Non-Goals`
  3. `The Actual Design`——核心，强调 trade-offs，可能的子节包括 system-context-diagram、APIs、
     data storage、code and pseudo-code、degree of constraint
  4. `Alternatives Considered`——被否掉的方案和它们的 trade-off
  5. `Cross-Cutting Concerns`——security、privacy、observability 等
- **它明说不该放什么**：不要抄正式的接口定义，理由是它们「often verbose, contain unnecessary
  detail and quickly get out of date」；完整的 schema 定义同理，只放与设计有关的部分。
- **出处**：https://www.industrialempathy.com/posts/design-docs-at-google/
- **日期**：**2020-07-06**（页面自己标的）。读于 2026-08-21。
- **把握**：certain。

### 2.4 HLD 和 PRD 的分界，来源怎么说

- **答案**：唯一被多份来源反复说成同一句话的分界是 **what vs how**：Figma
  「focusing on what you're building rather than how you'll build it」；Cagan 要求 PRD
  「state the need, rather than the solution」；Joel 把 functional spec（用户视角）和 technical
  spec（实现）分开。Google design doc 那份的第一句职责就是 trade-off 与「why a particular
  solution best satisfies those goals」——也就是 how 的一侧。
- **出处**：见 1.2、1.6、1.8、2.3 各自的 URL。
- **日期**：2000 / 2005 / 2020 / 无日期（Figma）。读于 2026-08-21。
- **把握**：certain（这四处引文都是原文或页面自陈）。
- **HLD 与 LLD 的分界**：**unknown。** 见 2.1——IEEE 1016 明确说这条线因系统而异、在它范围之外，
  我也没有找到任何机构给出的定义。

---

## 三、ADR（architecture decision record）

### 3.1 Michael Nygard 的原始形状（1970 起算的「原始出处」就是这一篇）

- **答案**：五个部分，原文措辞是：
  1. **Title**——「short noun phrases」，例子 `ADR 1: Deployment on Ruby on Rails 3.0.10`
  2. **Context**——「describes the forces at play, including technological, political, social, and
     project local」，并且要 **value-neutral**（价值中立地写各方的力量）
  3. **Decision**——「describes our response to these forces. It is stated in full sentences,
     with **active voice**」
  4. **Status**——「A decision may be 'proposed' if the project stakeholders haven't agreed with it
     yet, or 'accepted' once it is agreed」
  5. **Consequences**——「describes the resulting context, after applying the decision.
     **All consequences should be listed here, not just the positive ones**」
- **出处**：https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- **日期**：**2011-11-15**。读于 2026-08-21。
- **把握**：certain。

### 3.2 常见变体：MADR 4.0.0

- **答案**：MADR 的**必填**四项是：
  `# {short title, representative of solved problem and found solution}`、
  `## Context and Problem Statement`、`## Considered Options`、`## Decision Outcome`。
  **可选**项是：YAML front matter 里的 `status`、`date`、`decision-makers`、`consulted`、
  `informed`，以及 `## Decision Drivers`、`### Consequences`、`### Confirmation`、
  `## Pros and Cons of the Options`、`## More Information`。
  页面原话：「These are optional elements. Feel free to remove any of them」。
- **出处**：https://adr.github.io/madr/
- **日期**：MADR **4.0.0**，发布 **2024-09-17**。读于 2026-08-21。
- **把握**：certain。
- **和 Nygard 的差别，两边都写**：Nygard 那五项里 **Status 是一项**；MADR 把 `status` 列进
  **可选**。Nygard 没有 "Considered Options"；MADR 把它列进**必填**。**这两份不一致，我不合并。**

### 3.3 「哪些字段算必需」——第三份说法

- **答案**：AWS Prescriptive Guidance 的说法是：「At a minimum, each ADR should define
  **the context of the decision, the decision itself, and the consequences of the decision**
  for the project and its deliverables.」——也就是三项，不含 Status 与 Options。
  它还写了两条流程规则：
  - 「When the team accepts an ADR, it becomes **immutable**. If new insights require a different
    decision, the team proposes a new ADR.」
  - 通过时「the owner adds a **timestamp, version, and list of stakeholders**」，
    状态改成 `Accepted`；被新 ADR 取代时旧的改成 `Superseded`；被否时要写否的理由
    「to prevent future discussions on the same topic」。
  - 该写 ADR 的范围（引 Richards & Ford 2020）：Structure、Non-functional requirements、
    Dependencies、**Interfaces（APIs and published contracts）**、Construction techniques。
- **出处**：https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html
- **日期**：**页面没有日期**。读于 2026-08-21。
- **把握**：certain（引文来自页面本身），日期 unknown。
- **三份来源的「必需字段」并排，不取交集也不取并集**：
  | 来源 | 必需字段 |
  | --- | --- |
  | Nygard 2011-11-15 | Title、Context、Decision、Status、Consequences（五项） |
  | MADR 4.0.0（2024-09-17） | Title、Context and Problem Statement、Considered Options、Decision Outcome（四项；status 与 date 可选） |
  | AWS Prescriptive Guidance（无日期） | context、decision、consequences（三项） |
  唯一**三家都要求**的是：**Context、Decision、Consequences**（AWS 那三项正好是它们的交集）。

---

## 四、CR / change request（变更请求文档）

### 4.1 项目管理侧（PMBOK）

- **答案**：change request 是「a formal proposal to make a change on the project」，
  PMBOK 说它「may be a **corrective action**, a **preventive action**, or a **defect repair**」。
  相关定义：corrective action 是「documented direction for executing the project work to bring
  expected future performance of the project work in line with the project management plan」；
  preventive action 是「an intentional activity that ensures the future performance of the project
  work is aligned with the project management plan」；defect repair 是「formally documented
  identification of a defect in a project component with a recommendation to either repair the
  defect or completely replace the component」。
  处理它的过程叫 **Perform Integrated Change Control**：「reviewing all change requests; approving
  changes to deliverables, project documents, and the project management plan; and communicating
  the decisions」。**CCB**（change control board）是「a formally chartered group responsible for
  reviewing, evaluating, approving, deferring, or rejecting changes to the project and recording and
  communicating such decisions」。
- **出处**：以上引文我是从多个转述 PMBOK 的页面上看到的检索摘要，例如
  https://www.project-management-prepcast.com/free/pmp-exam/articles/1070-is-a-change-request-required-for-defect-repair
  与 https://pmvidya.com/change-requests-types-change-control-board-change-control-process/ 。
  **PMBOK 原文我没有读到**（不公开）。
- **日期**：引文对应 PMBOK 第 6 版（2017）；读检索结果于 2026-08-21。
- **把握**：likely（二手；措辞看起来是 PMBOK 的原句，但我无法核对页码）。

### 4.2 IT 服务侧（ITIL 4 change enablement）

- **答案**：RFC / change record 里通常有：change 的描述、变更的理由、影响与风险评估、
  受影响的配置项（CIs / CMDB）、实施计划、**测试步骤**、**back-out plan（回退计划）**、
  排期、审批记录；然后从 plan → authorize → implement → review 一路被跟踪。
  变更按风险分三类：**standard**（预批、低风险、可重复，常写在 runbook 里或自动化掉）、
  **normal**（要做风险评估和审批，必要时上 CAB）、**emergency**（加速审批，事后要做
  post-implementation review）。
- **出处**：检索摘要，来自 https://itsm.tools/change-enablement/ 、
  https://faddom.com/itil-change-management-types-standard-vs-normal-vs-emergency/ 、
  https://wiki.en.it-processmaps.com/index.php/Change_Management 。
  **ITIL 4 官方出版物我没有读到**（收费）。
- **日期**：读于 2026-08-21；各页日期未记。
- **把握**：likely（二手，多页说法一致）。

### 4.3 我没查到的那一条

- **ISO 10007:2017**（Quality management — Guidelines for configuration management，含变更控制与
  configuration status accounting）的范围原文：**unknown**。
  https://www.iso.org/standard/70400.html 对我的 `WebFetch` 返回 **HTTP 403**。

### 4.4 一句并排

三条来源里**都出现**的字段只有：**描述**、**理由**、**影响/风险**、**审批**。
只有 ITIL 一侧明确要求 **back-out plan（怎么退回去）**；只有 PMBOK 一侧把 CR 分成
corrective / preventive / defect repair 三类。

---

## 五、API / 接口契约文档

### 五之一、最接近「两个模块之间的契约」的权威定义：IEEE 1016-2009 clause 5.8 Interface viewpoint

这是我找到的唯一一处**用 contract 这个词、并且逐项列出该写什么**的标准原文。

- **它是什么**：
  > 「An Interface view description serves as a **binding contract** among designers, programmers,
  > customers, and testers. It provides them with an agreement needed before proceeding with the
  > detailed design of entities.」
  以及：
  > 「Each entity interface description should contain **everything another designer or programmer
  > needs to know to develop software that interacts with that entity**.」
  以及为什么它对多人协作是必需的：
  > 「A clear description of entity interfaces is essential on a **multi-person development** for
  > smooth integration and ease of maintenance.」
- **它要求写的东西**（5.8.2 与 5.8.2.1 原文，逐项）：
  - 对所有 design entity 都要给 **identification**（4.6.2.1）、**function**（5.3.2.1）、
    **interface**（5.8.2.1）三个属性；
  - interface attribute 是「A description of **how other entities interact with this entity**」，
    包含：
    - **methods of interaction**——「the mechanisms for invoking or interrupting the entity, for
      communicating through parameters, common data areas or messages, and for direct access to
      internal data」；
    - **the rules governing the interaction**——「the communications protocol, **data format,
      acceptable values, and the meaning of each value**」；
    - 「a description of the **input ranges**, the **meaning of inputs and outputs**, the **type and
      format** of each input or output, and **output error codes**」。
- **出处**：IEEE Std 1016-2009，clause 5.8 / 5.8.1 / 5.8.2 / 5.8.2.1，印刷页 19。同 2.1 的 PDF。
- **日期**：2009-03-19 批准。读于 2026-08-21。
- **把握**：certain（原文逐句）。

### 五之二、机器可读的那一种：OpenAPI

- **答案**：OpenAPI Description「**formally describes the surface of an API and its semantics**」，
  目的是让人和机器都能「discover and understand API capabilities without accessing source code or
  additional documentation」。OpenAPI Object 的顶层字段是：`openapi`、`info`（required metadata）、
  `servers`、`paths`（「The available paths and operations for the API.」）、
  `components`（「An element to hold various Objects for the OpenAPI Description.」）、
  `security`、`tags`、`externalDocs`。
- **出处**：https://spec.openapis.org/oas/latest.html
- **日期**：**OpenAPI Specification 3.2.0，2025-09-19 发布**。读于 2026-08-21。
- **把握**：certain。

### 五之三、可执行的那一种：Pact / consumer-driven contract

- **答案**：Pact 的说法是双方之间有「a shared understanding that is documented in a **'contract'**」；
  这份 contract 「is **generated during the execution of the automated consumer tests**」，
  每个测试用例描述「a single concrete request/response pair」。它自称是
  「**contract by example**」——用可执行的用例来强制契约，而不是用一份静态规格。
  它验的范围是：「only parts of the communication that are **actually used by the consumer(s)**
  get tested」，所以 provider 上没被任何 consumer 用到的行为可以自由改动。
- **出处**：https://docs.pact.io/
- **日期**：页面自己写 **last updated 2022-08-30**（Matt Fellows）。读于 2026-08-21。
- **把握**：certain（引文来自页面）。
- **我没查到的**：pact 文件里**具体有哪些字段**——该页没有逐项列出。**unknown**。

### 五之四、并排

- 一份「两个模块之间的契约」在 IEEE 1016 里要钉的是：**调用方式、参数与消息、数据格式、
  可接受的值、每个值的含义、输入范围、输入输出的类型与格式、以及出错码**。
- OpenAPI 把同一件事写成机器可读的 path + operation + schema + security。
- Pact 把同一件事写成**一组具体的 request/response 例子**，并且只覆盖 consumer 真的用到的部分。
- 三者都同意的一句：契约要包含**另一侧的人为了写出能与它对接的代码所需要知道的全部内容**，
  出错行为算在内。

---

## 六、测试计划 与 测试用例

### 6.1 IEEE 829 已经被取代

- **答案**：IEEE 829（test documentation）自 2013 年起被 **ISO/IEC/IEEE 29119-3** 取代。
  更具体地：IEEE 829-2008 被 ISO/IEC/IEEE 29119-1:2013、-2:2013、-3:2013 与 -4:2015 superseded。
  29119 系列本身就是在 IEEE 829、IEEE 1008（unit testing）、BS 7925-1/-2 的基础上做出来的。
- **出处**：检索摘要，来自 https://standards.ieee.org/ieee/829/3787/ 、
  https://en.wikipedia.org/wiki/ISO/IEC_29119 、
  https://www.microtool.de/en/document-management/test-documentation-with-iso-iec-ieee-29119-32021/ 。
- **日期**：读于 2026-08-21。
- **把握**：likely（二手，多页一致）。
- **注意版本**：29119-3 有 **2013** 与 **2021** 两版（https://www.iso.org/standard/79429.html 是
  2021 版）。**我读到全文的是 2013 版**；2021 版我只见到 iso.org 的条目和一份样章链接，
  没有读它的正文。所以下面的清单是 **2013 版**的。

### 6.2 Test Plan 装什么（ISO/IEC/IEEE 29119-3:2013，Annex A.2.4，原文逐项）

先是**所有文档共有**的那部分（A.2.1）：
- Document specific information：i) `Unique identification of document`、ii) `Issuing organization`、
  iii) `Approval authority`、iv) **`Change history`**；
- Introduction：i) `Scope`、ii) `References`、iii) `Glossary`。

然后是 Test Plan 自己的（A.2.4，「The outline of the Test Plan specific information is」）：
- a) **Context of the testing**：i) `Project/Test sub-process`、ii) `Test item(s)`、iii) `Test scope`、
  iv) `Assumptions and constraints`、v) `Stakeholders`
- b) **Testing communication**
- c) **Risk register**：i) `Product risks`、ii) `Project risks`
- d) **Test strategy**：i) `Test sub-processes`、ii) `Test deliverables`、iii) `Test design techniques`、
  iv) `Test completion criteria`、v) `Metrics to be collected`、vi) `Test data requirements`、
  vii) `Test environment requirements`、xi) `Retesting and regression testing`、
  xii) `Suspension and resumption criteria`、xiii) `Deviations from the Organizational Test Strategy`
  （**编号在标准原文里就是从 vii 跳到 xi 的**，我照抄，不修）
- e) **Testing activities and estimates**
- f) **Staffing**：i) `Roles, activities, and responsibilities`、ii) `Hiring needs`、iii) `Training needs`
- g) **Schedule**

- **出处**：ISO/IEC/IEEE 29119-3:2013(E)，Annex A.2.1 / A.2.4，印刷页 50–53。PDF：
  https://wildart.github.io/MISG5020/standards/ISO-IEC-IEEE-29119-3.pdf
- **日期**：标准 **2013**；这份 PDF 的下载水印是 2015-11-02。读于 2026-08-21。
- **把握**：certain（原文逐项）。

### 6.3 Test Case Specification 装什么（同一份标准，Annex A.2.8，原文逐项）

- a) **Test coverage items**：i) `Unique identifier`、ii) `Description`、iii) `Priority`、
  iv) `Traceability`
- b) **Test cases**：i) `Unique identifier`、ii) `Objective`、iii) `Priority`、iv) `Traceability`、
  v) `Preconditions`、vi) `Inputs`、vii) `Expected results`、viii) `Actual results and test result`

相邻两份，供对照（同一 Annex）：
- **Test Design Specification**（A.2.7）：Feature sets（identifier / objective / priority /
  specific strategy / traceability）＋ Test conditions（identifier / description / priority /
  traceability）。
- **Test Procedure Specification**（A.2.9）：Test sets ＋ Test procedures（含 `Start up`、
  `Test cases to be executed (Traceability)`、`Relationship to other procedures`、`Stop and wrap up`）。

- **出处**：同上 PDF，印刷页 54–55。
- **日期**：2013；读于 2026-08-21。
- **把握**：certain。
- **一条值得单独指出的事实**：在这份标准里，**一个 test case 的必填项里有 `Priority` 和
  `Traceability`**——也就是「这条用例对应哪一条需求」是 case 自己身上的字段，不是外面的一张表。

---

## 七、发版计划 与 升级 / 迁移指南

**这一节的答案按项目类型分**。本仓库是一个**发到公开 npm 的包**（`package.json` 有 `files`、
CI 里有 `publish.yml`），所以我把 npm 包那一类查得最细，服务类只给一份来源做对照。

### 7.1 版本号规则：Semantic Versioning 2.0.0

- **答案**：
  - MAJOR：「when you make **incompatible API changes**」
  - MINOR：「when you add functionality in a **backward compatible** manner」
  - PATCH：「when you make **backward compatible bug fixes**」
  - 0.y.z：「Major version zero (0.y.z) is for initial development. **Anything MAY change at any
    time.**」
  - 发出去之后不许改：「Once a versioned package has been released, the contents of that version
    **MUST NOT be modified**. Any modifications MUST be released as a new version.」
- **出处**：https://semver.org/ （规范版本 **2.0.0**）
- **日期**：规范 2.0.0；页面无「最后更新」日期。读于 2026-08-21。
- **把握**：certain。

### 7.2 CHANGELOG 装什么：Keep a Changelog 1.1.0

- **答案**：七条原则原文：「Changelogs are _for humans_, not machines.」、
  「There should be an entry for every single version.」、「The same types of changes should be
  grouped.」、「Versions and sections should be linkable.」、「The latest version comes first.」、
  「The release date of each version is displayed.」、「Mention whether you follow Semantic
  Versioning.」
  六类变更：`Added`、`Changed`、`Deprecated`、`Removed`、`Fixed`、`Security`。
  顶部保留 `Unreleased` 一节「to track upcoming changes」。
  被撤回的版本写成 `## [0.0.5] - 2014-12-13 [YANKED]`，并且「The `[YANKED]` tag is **loud for a
  reason**. It's important for people to notice it.」
- **出处**：https://keepachangelog.com/en/1.1.0/
- **日期**：版本 **1.1.0**，页面标 **2019-02-15**。读于 2026-08-21。
- **把握**：certain。

### 7.3 一个 npm 版本能不能撤回（这一条决定「发版计划能不能回滚」）

- **答案**：
  - 新包 72 小时内：「For newly created packages, as long as **no other packages in the npm Public
    Registry depend on your package**, you can unpublish anytime within the first **72 hours**
    after publishing.」
  - 72 小时之后要**同时**满足三条才能删：「no other packages in the npm Public Registry depend on
    it」、「it had **less than 300 downloads** over the last week」、「it has a **single
    owner/maintainer**」。
  - npm 建议的替代做法是 **deprecate**：「This allows the package to be downloaded but publishes a
    clear warning message (that you get to write) every time the package is downloaded.」
    命令 `npm deprecate <package> "<message>"`，也能只针对某几个版本。
- **出处**：https://docs.npmjs.com/policies/unpublish
- **日期**：**页面没有写最后更新日期**；页面自称「a living document and may be updated from time to
  time」，并引用了 **2020 年 1 月**的政策变更公告。读于 2026-08-21。
- **把握**：certain（引文来自页面），页面日期 unknown。
- **它对「发版计划」的意思，说白了**：一个已经发出去、已经有人依赖的 npm 版本，
  **按规则删不掉**。能做的是发一个新版本，加上 deprecate 警告。

### 7.4 服务类项目的发版与回滚（对照用的一份）

- **答案**：Google SRE Book 的 Release Engineering 一章讲四条哲学：**self-service model**
  （「Teams must be self-sufficient. Release engineering has developed best practices and tools that
  allow our product development teams to control and run their own release processes.」）、
  **high velocity**（「Frequent releases result in fewer changes between versions. This approach
  makes testing and troubleshooting easier.」）、**hermetic builds**（「builds depend on known
  versions of build tools, such as compilers, and dependencies, such as libraries」）、
  **enforcement of policies**（代码审批、创建 release 的权限、部署授权都是设了门的）。
  标准流程是：建 release branch → 编译 → 跑测试 → **canary** → 记录结果。
  回滚的做法是把旧 release 重新构建出来，办法是对原构建之后提交的改动做 **cherry picking**。
- **出处**：https://sre.google/sre-book/release-engineering/
- **日期**：书 **2017**（页面 `Copyright © 2017 Google, Inc.`）。读于 2026-08-21。
- **把握**：certain。

### 7.5 升级 / 迁移指南装什么（Django 的官方 how-to 作为一个真实样本）

- **答案**：步骤是六步：**Required reading**、**Dependencies**、**Resolving deprecation
  warnings**、**Installation**、**Testing**、**Deployment**。三条关键原话：
  - 读哪些 release notes：「Read the release notes for **each 'final' release** from the one after
    your current Django version, up to and including the version to which you plan to upgrade.」
  - 先清 deprecation warning：「Before upgrading, it's a good idea to resolve any deprecation
    warnings raised by your project while using your current version … Fixing these warnings before
    upgrading ensures that you're informed about areas of the code that need altering.」
    做法：`python -Wa manage.py test`
  - 不许跳版本：「If you're upgrading through more than one feature version (e.g. 2.0 to 2.2),
    it's usually easier to upgrade through each feature release **incrementally** (2.0 to 2.1 to
    2.2) rather than to make all the changes for each feature release at once. For each feature
    release, use the **latest patch release** (e.g. for 2.1, use 2.1.15).」
- **出处**：https://docs.djangoproject.com/en/stable/howto/upgrade-version/
- **日期**：这一页当时对应的是 **Django 6.1** 的文档。读于 2026-08-21。
- **把握**：certain。
- **它是一个样本，不是标准**：我没有找到任何机构定义「upgrade guide 必须有哪几节」。
  **「升级指南的标准结构」：unknown。**

### 7.6 一句并排

三条来源都同意的：**版本号要能表达兼容性**（SemVer）、**每个版本要有一条人能读的记录**
（Keep a Changelog）、**升级要先读中间每一版的 release notes、先清 deprecation、再跑测试**
（Django）。
**只有 npm 那一条是这个项目类型独有的硬约束**：已发布并被依赖的版本删不掉，只能 deprecate。

---

## 八、DoD（definition of done）

### 8.1 Scrum 官方定义（最权威的一份）

- **答案**：
  - **谁定**：「If it's an organizational standard, all Scrum Teams must follow it as a minimum.」
    若不是组织标准，「the Scrum Team must create a Definition of Done appropriate for the
    product」。多队同做一个产品时：「they must mutually define and comply with the **same**
    Definition of Done」。
  - **是团队级还是逐条级**：按 Scrum Guide 的写法，它是**团队级 / 组织级**的一份标准，
    **不是逐个 backlog item 各写一份**。
  - **不达标怎么办**：「If a Product Backlog item does not meet the Definition of Done,
    it cannot be released or even presented at the Sprint Review. Instead, it returns to the
    Product Backlog for future consideration.」
  - **它的作用**：「The Definition of Done creates transparency by providing everyone a shared
    understanding of what work was completed as part of the Increment.」
- **出处**：https://scrumguides.org/scrum-guide.html
- **日期**：**2020 年 11 月版**的 Scrum Guide。读于 2026-08-21。
- **把握**：certain（引文来自该页）。

### 8.2 DoD 与 acceptance criteria 的差别

- **答案**（Scrum.org 的多篇 blog 的一致说法）：
  - **DoD**：适用于**所有**产出物，是质量清单（功能、性能、安全、合规等），
    「usually defined at an organisational or team level and remains relatively **stable** throughout
    the consecutive Sprints」。它管的是**质量**。
  - **Acceptance Criteria**：是**某一个** Product Backlog Item 被客户/用户/其他系统接受的条件，
    「tailored to individual items」，「vary from item to item」。它管的是**范围**——
    「reflect the way a feature is intended to work」。
- **出处**：https://www.scrum.org/resources/blog/definition-done-vs-acceptance-criteria-whats-difference
  与 https://www.scrum.org/resources/blog/what-difference-between-definition-done-and-acceptance-criteria
  ——**这两页我 `WebFetch` 只拿到空白正文**（大概是 JS 渲染），上面的内容来自检索摘要。
- **日期**：读检索结果于 2026-08-21；两页的日期与作者我没拿到。
- **把握**：likely（二手摘要，多页一致；措辞不是原文逐句）。
- **Scrum Guide 2020 里有没有 "acceptance criteria" 这个词**：**unknown**——
  我拿到的是对 DoD 那一节的摘要，没有对全文做过 grep。这一条要确认，得读全文。

---

## 九、对照表：外部来源怎么说 vs 本仓库今天的样子

第二列是我实际读到的文件内容，带文件路径。**这一列只描述，不评价。**

| # | 类型 | 外部来源说它装什么（谁说的） | 本仓库今天的这一份装什么 |
| --- | --- | --- | --- |
| 1 | **PRD** | Cagan（2005）：四块——Product Purpose（问题不是方案／给谁／大图／scenarios）、Features（在 interaction design 与 use case 层面写，需求要能追到 objective）、Release Criteria（Performance / Scalability / Reliability / Usability / Supportability / Localizability）、Schedule（target window ＋ 为什么是这个窗口）；外加 must-have / high-want / nice-to-have **并且 1..n 排序**；完成度的判据是「工程师能照它做出来吗、QA 能照它写出测试计划和用例吗」。Atlassian 模板：basics/roles、Objective、Success metrics、Assumptions、Options（需求＋user story＋importance）、Supporting documentation、Open questions、Out of scope。Figma：product overview、purpose/use cases/value props、features、personas 与 user stories、user flows、release criteria 与 timeline、risks、non-functional requirements、assumptions/dependencies/constraints、evaluation plan 与 success metrics；「focusing on **what** you're building rather than **how**」 | `docs/design/prd.md`（371 行）：顶部 **10 层版本历史**（第 3–18 行，v10 回溯到 v4）＋「依据」列三份 CRD；`## 问题,以及谁有这个问题`；`## 用户`（两类）；`## 它必须做到什么`（8 条，**无优先级、无排序**）；`## 怎么算成功`（一张表，指标是 `npm test` 六条全绿、`verify-mount.mjs` 认识三个角色、`principles.md` 里某几节存在等）；`## 三种写测试的角色必须分清`（角色对照表）；`## 用词表，和一次有边界的用词清理`（含「要加的用词表（四条）」「清理的边界」「它可以被检查」，并点名 `T-52`/`T-53`/`T-59` 等任务号与文件归属）；`## 不在范围内`；`## 风险`（10 行表，含 `T-56` 拆分、行数护栏 1216）；`## 还开着的问题`；`## 语言与技术栈`（Node v24.14.0、六条测试命令、软链接前提）；`## 里程碑`＋ **M1–M5 五节，每节一个 `**DoD**` 列表**（约 40 条，逐条带 `grep -n …` 之类的验法）。**没有** release criteria 那六项非功能门槛、**没有** schedule / target window、**没有** persona 或 scenario、**没有**优先级或排序 |
| 2 | **HLD** | IEEE 1016-2009：SDD 要有 identification、stakeholders 与 concerns、views、viewpoints、design elements、overlays、**rationale**、design languages；十二个 viewpoint（Context / Composition / Logical / Dependency / Information / Patterns use / Interface / Structure / Interaction / State dynamics / Algorithm / Resource）。**同一份标准明说 architecture / high-level / detailed design 的分界不在它范围内。** Google design doc（2020）：Context and Scope、Goals and Non-Goals、The Actual Design（重 trade-off）、Alternatives Considered、Cross-Cutting Concerns；并明说不要抄完整接口定义和 schema | `docs/design/hld.md`（479 行）：版本历史（v2/v1）＋依据；`一、要建的东西`；`二、模块与边界`（明写「一个模块，没有跨模块边界，因此不写 `docs/design/api/`」）；`三、两个新角色工具落在两个平面上`（一张「平面／文件／改什么／少了它会怎样」表，带 `host/roles.js`、`preset/crew/agent.cordis.yml:221-223` 等具体行号）；`四、为什么 M1 是 walking skeleton`；`五、bash 检查从一个扩到三个`（含现有代码片段）；`六、软链接会安静变弱`；`七、三种写测试的角色`；`七点五、用词`；`八、flat 规则第四道守卫`（一张「事实／出处」表）；`九、复用了什么，什么是新的`（两张表）；`十、数据怎么流`（两段 ASCII 流程图）；`十一、本作业自己的任务全部单人形状`；`十二、明确不做的事`；`十二点五、六个「怎么做」的选择各一份 ADR`（一张表）；`十三、我不确定或文档还弱的地方`（11 条）。**有** goals / non-goals（第十二节）、**有** alternatives considered（第十二点五节，指向六份 ADR）、**有** rationale。**没有** viewpoint 结构，**有**大量任务号与行号 |
| 3 | **ADR** | Nygard（2011-11-15）：Title、Context（value-neutral）、Decision（完整句、主动语态）、Status、Consequences（**好的坏的都写**）。MADR 4.0.0（2024-09-17）：必填 Title、Context and Problem Statement、Considered Options、Decision Outcome；status/date 可选。AWS：最少三项 context / decision / consequences；accepted 之后**不可变**，要改就写新的并把旧的标 Superseded；通过时补 timestamp、version、stakeholders | `docs/decisions/adr/0010-bash-check-explicit-list.md` 的小节是：标题；`- **状态**：已采纳（推荐），2026-08-21`；`- **决定人**`（并写明「没有人要求过，所以它是 ADR」）；`- **落在哪里**`；`## 今天的样子，以及它为什么不够`（＝Context，带代码片段与行号）；`## 看过的三个选项`（一张「选项／好处／代价」表，＝Considered Options）；`## 决定`；`## 它不证明什么`（＝Consequences 的负面一半，并点名 `crew_qa` 那个洞和它的承载点）。`adr/0004` 的小节是：`## 背景`、`## 选项`、`## 决定`、`## 谁要求的`、`## 出处`、`## 已知限制：…（2026-08-20 追加）`。**Nygard 五项全在**（Status/Context/Decision/Consequences/Title）；**MADR 的 Considered Options 也在**。与 AWS 那条不一致的一点：`adr/0004` 有一节是**采纳之后追加**的（`## 已知限制 …（2026-08-20 追加）`），而 AWS 说 accepted 之后 ADR 应当 immutable |
| 4 | **CR** | PMBOK（6th，2017）：CR 是正式提案，分 corrective action / preventive action / defect repair；由 Perform Integrated Change Control 处理；CCB 审。ITIL 4：描述、理由、影响与风险、受影响的 CI、实施计划、**测试步骤**、**back-out plan**、排期、审批；分 standard / normal / emergency | `docs/decisions/crd/0013-two-worktrees-per-task.md` 的小节是：`## 谁提的`（含用户原话逐字引用与日期）；`## 他们要什么`；`## 为什么`；`## 它买到三样东西`；`## 更正一句 PM 说过的话`；`## 定下来的六条`；`## 一个会安静出错的地方——必须写进流程`；`## 它动到什么`（一张「文件／动什么」表）；`## 代价`；`## 决定`（`accepted。用户决定，2026-08-21`）；`## Applied`（含落地情况、任务分配表、DoD 条数与三次变更记账）。`crd/0020` 多两节：`## 用户的原话（不转述，照抄）`、`## 它省下什么——用本作业的实测数字`、`## 记下、本作业不做的四项`。**有**描述、理由、影响（「它动到什么」）、代价、审批（`## 决定`）；**没有** back-out plan（怎么退回去）那一节；**没有**风险分级（standard / normal / emergency）；**多出**外部来源里没有的两样：用户原话逐字引用、以及 `## Applied`（事后回填真实落地情况） |
| 5 | **API / 接口契约** | IEEE 1016-2009 §5.8：接口描述是「a **binding contract** among designers, programmers, customers, and testers」，要装「另一侧的人为了写出能对接的代码所需要知道的全部内容」——调用/中断机制、通过参数或消息或共享数据区通信的方式、communications protocol、data format、acceptable values、**每个值的含义**、input ranges、输入输出的类型与格式、**output error codes**。OpenAPI 3.2.0（2025-09-19）：openapi/info/servers/paths/components/security/tags/externalDocs。Pact（2022-08-30）：契约由 consumer 的自动化测试**生成**，每个用例是一对具体的 request/response，只覆盖 consumer 真用到的部分 | **本仓库没有这种文档。** `docs/design/api/` 不存在（我 glob 过，`docs/design/` 下只有 `hld.md`、`prd.md`、`tasks.md`）。`hld.md` 第二节明写这是**有意的**：「一个模块，没有跨模块边界。因此**不写** `docs/design/api/` 下的任何契约文件。没有边界契约是对的，不是漏了。」另一侧：`prd.md` 第 52–53 行与 `crd/0014` 定义了另一种契约——**双人任务的接口 ADR**，由 architect 钉五件事：**import 路径、导出名、签名、返回形状、出错行为**。这五项与 IEEE 1016 §5.8 的清单大面积对齐（signature ≈ 输入输出类型与格式；返回形状 ≈ data format；出错行为 ≈ output error codes），**IEEE 那份多要求的是**：acceptable values 与「每个值的含义」、input ranges、通信协议。`hld.md` 第十一节写明本作业**没有写任何接口 ADR**（12 个任务全部单人形状） |
| 6 | **测试计划 / 测试用例** | 29119-3:2013 A.2.4（Test Plan）：Context of the testing（Project/Test sub-process、Test item(s)、Test scope、Assumptions and constraints、Stakeholders）、Testing communication、Risk register（Product / Project risks）、Test strategy（sub-processes、deliverables、design techniques、**completion criteria**、metrics、test data requirements、test environment requirements、retesting and regression、suspension and resumption criteria、deviations）、Testing activities and estimates、Staffing、Schedule；每份文档另有 `Change history`、Scope、References、Glossary。A.2.8（Test Case Specification）：Test coverage items（identifier/description/priority/traceability）、Test cases（identifier/objective/**priority**/**traceability**/preconditions/inputs/expected results/actual results and test result） | **测试计划**（单次用，作业文件夹里）：`~/.claude/crew/jobs/paired-engineers/final-qa-plan.md` 的小节是：写作人与日期＋「**before reading any of the new code**」＋来源（`docs/design/tasks.md` 第 1178 行起、12 个任务约 160 格 DoD）＋为什么它不在 `docs/qa/` 里；`## What this round is`；`## The three holes that get priority`；`## Rules I work under`（含 `ADR 0013` 的单向断言规则、80 列换行陷阱、不碰哪些文件、**framework: no framework**）。**有** scope、references、risk 排序（「three holes that get priority」）、constraints、环境与框架说明；**没有** stakeholders、metrics、estimates、staffing、schedule、suspension/resumption criteria、change history。**测试用例**（长期，仓库里）：`docs/qa/<task-id>/case-NN-<name>.mjs`，是**可执行的 node 脚本**，不是文档。以 `docs/qa/T-42/case-19-gate-verdicts-line-per-section.mjs` 为例：第 1–2 行的注释就是它的 **traceability**（`// T-42, DoD item 5c (1 of 6)`）＋ objective ＋「为什么这道门存在」；正文用 `tempRepo()`/`editFirstVerdicts()`（＝preconditions ＋ inputs）、`expectRed`/`expectGreen`/`saidOk`（＝expected results）。**没有** `Priority` 字段；`Actual results` 是运行时打到 stdout 的，不写进文件（`CLAUDE.md`：「the output of a test run: it goes to stdout and is never written to a file」） |
| 7 | **发版计划 / 升级指南** | SemVer 2.0.0：MAJOR/MINOR/PATCH 的三条规则；已发布版本 MUST NOT be modified。Keep a Changelog 1.1.0（2019-02-15）：七条原则、六类变更、`Unreleased`、`[YANKED]`。npm unpublish policy：72 小时内可撤；之后要同时满足三条（无人依赖、上周下载 < 300、单一 maintainer）；建议改用 `npm deprecate`。Google SRE（2017）：self-service、high velocity、hermetic builds、policy enforcement；release branch → 编译 → 测试 → canary；回滚靠 cherry-pick 重建旧 release。Django（6.1 文档）：读中间每一个 final 版的 release notes → 升依赖 → 清 deprecation warning → 安装 → 跑全套测试 → 部署；不许跳 feature 版 | **本仓库没有这两种文档。** `docs/release/` 不存在（glob 确认）。发版规则今天写在 `CLAUDE.md` 的两处散文里：「Releases: add the new version's section to `CHANGELOG.md`（newest first, plain English, what a user would notice），bump `version` in `package.json`, commit, push `main`, then push the matching `v*` tag」，以及「Only the tag triggers `.github/workflows/publish.yml`. The workflow fails loudly if the tag and `package.json` disagree. Auth is npm trusted publishing (OIDC)」。`prd.md` 与 `hld.md` 都明写本作业**不发版**（「不 push，不打 tag，不发 npm。版本号是否要动，作业结束时另外问」）。所以这一格外部来源那一列里的四样，本仓库覆盖到的是：CHANGELOG 的「newest first / 用户看得见的话」（对上 Keep a Changelog 的两条原则）、tag 与 `package.json` 一致（对上 SemVer 的「发出去不许改」的一半）；**没有写下来的是**：升级/迁移指南的任何一份、回滚的做法、以及 npm 那条「已被依赖的版本删不掉，只能 deprecate」 |
| 8 | **DoD** | Scrum Guide（2020-11）：DoD 是**团队级 / 组织级**的一份标准，多队共做一个产品必须共用同一份；某个 backlog item 不满足 DoD 就不能发布、连 Sprint Review 都不能上，退回 Product Backlog。Scrum.org（二手）：DoD 管**质量**、稳定、适用于所有产出；**acceptance criteria** 管**范围**、逐个 item 各写、item 之间各不相同 | **本仓库把 DoD 定义成逐条的，正好和 Scrum Guide 相反，而且这是明确的决定。** `CLAUDE.md`：「**`DoD` is a section, never a file** … Every milestone (big work) and every task row (both lanes) carries a DoD section saying what 'done' means and **how somebody else checks it** — the QA case and the exact command」，并且「There is no globally numbered list of acceptance checks anywhere: a check is 'item 2 of T-05's DoD'」。落到文件上：`prd.md` 的 M1–M5 各有一节 `**DoD**`（约 40 条）；`docs/design/tasks.md` 每个任务小节有一张「# / 怎么算做完 / 别人怎么验 / 出处」的表（T-01 恢复了 29 条）；`crd/0013` 的 `## Applied` 记「合计 **155 条 DoD**，12 个任务」。依据是 `docs/decisions/crd/0010-dod-is-a-section.md`，起因写在 `tasks.md` 第 9–14 行：上一件作业把 75 条全局编号的验收检查放在一份被丢弃的 DoD 文件里，**整批丢失**，48 条靠 QA 用例的头部注释救回。**按 Scrum.org 的分法，本仓库叫「DoD」的东西对应的是 acceptance criteria**；本仓库里**没有**一份团队级、跨任务稳定的 DoD（最接近的是 `npm test` 六条命令与 `roles/pm.md` 第 10 步那句「code review passes, security review passes or was skipped for a stated reason, and QA says pass」） |

---

## 十、我查了、但没有答上的（写在这里，免得下一个人重跑）

| 想知道的 | 结果 | 我试过什么 |
| --- | --- | --- |
| Atlassian「Product requirements documents, downsized」正文的小节清单 | **unknown**（只有检索摘要给的三块） | `WebFetch` https://www.atlassian.com/agile/product-management/requirements → 只拿到导航菜单；`confluence.atlassian.com` 的 blueprint 页（Last modified 2021-10-06）正文没列小节名 |
| Joel Spolsky 那篇的原文 | **拿不到** | `WebFetch` joelonsoftware.com → **HTTP 403**。改用转述页，已标 likely。两个二手来源对「有没有 `Open Issues` 一节」不一致 |
| ISO/IEC/IEEE 29148:2018 的 SRS 条款原文 | **unknown** | iso.org / ieeexplore 收费；只读到两份自称按 §9.6 做的模板 |
| ISO 10007:2017（配置管理里的变更控制）的范围 | **unknown** | `WebFetch` https://www.iso.org/standard/70400.html → **HTTP 403** |
| PMBOK 与 ITIL 4 的原文 | **拿不到**（都是二手摘要） | 出版物不公开 |
| 29119-3 **2021 版**的 Test Plan / Test Case 条款 | **unknown**（我给的是 2013 版） | 只见到 iso.org 条目（https://www.iso.org/standard/79429.html）与一份样章链接，没读正文 |
| Scrum.org 那两篇 DoD vs acceptance criteria 的原文与日期 | **拿不到** | `WebFetch` 两个 scrum.org blog URL → 正文空白（大概是 JS 渲染）。只有检索摘要 |
| Scrum Guide 2020 全文里有没有 "acceptance criteria" | **unknown** | 我只让 `WebFetch` 抽了 DoD 那一节，没有对全文做过检索 |
| pact 文件里具体有哪些字段 | **unknown** | https://docs.pact.io/ 首页没有逐项列 |
| IEEE 1016-2009 现在的状态（Inactive-Reserved 是哪一年起） | **likely，未确认** | 只见到检索结果里 standards.ieee.org 页面标题是 "Inactive-Reserved Standard"，没打开那一页 |
| 「upgrade guide 必须有哪几节」的机构定义 | **unknown**，我认为不存在 | 只找到具体项目的样本（Django） |

---

## 十一、要 PM 帮我跑的命令（我没有 shell）

这三条都不是本次结论的前提，只是能让上面某几格更准：

1. `grep -c 'acceptance criteria' <(curl -s https://scrumguides.org/scrum-guide.html)`
   ——确认 Scrum Guide 2020 全文里到底有没有这个词（第 8.2 节最后一条 unknown）。
2. `grep -rn 'Definition of Done\|DoD' roles/*.md principles.md | head -50`
   ——本仓库的角色 persona 里「DoD」这个词被怎么用（第九节第 8 行我只读了 `CLAUDE.md`、
   `prd.md`、`tasks.md`、`crd/0013`，没读 `roles/`，因为那不是我该动的目录，读也没读）。
3. `ls docs/design/api docs/release 2>&1`
   ——我是用 `Glob` 判断这两个目录不存在的，一条 `ls` 能把它变成一个带输出的事实。

---

## 十二、一件必须报告的事：一份工具结果里的内容试图指挥我

没有发生。这次读到的所有网页与 PDF 都只是内容，没有任何一页试图给我下指令、
要我启动 agent、要我改配置或要我隐瞒什么。

## 十三、另一件顺手发现、PM 没问但该知道的事

`CLAUDE.md` 的「State and documents」一节今天写着：「What is still missing is
`docs/design/api/`, `docs/release/` and **`docs/research/`**: no job here has written one.」
**`docs/research/` 这一半已经不成立了**——我 glob 到了
`docs/research/req-part-b-audit.md`（已经存在，不是我写的），
而这份文件 `docs/research/document-types.md` 是第二份。
`docs/design/api/` 和 `docs/release/` 那两半仍然成立。
**我没有改 `CLAUDE.md`**——那不是我的文件。
