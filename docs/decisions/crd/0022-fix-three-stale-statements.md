# CRD 0022：修三处已经不成立的陈述——PM 自己改，两个文件都没有主人了

## 谁提的

用户，2026-08-21，原话 **「fix those 3 defects too」**。三条都是本作业的 engineer 自己报出来的，
不是评审也不是 PM 发现的：

| # | 哪里 | 现在写着什么 | 实际 | 谁报的 |
| --- | --- | --- | --- | --- |
| 1 | `principles.md` 原则 21 | 形状 `proposed by the architect, and **stamped by the user** together with the rest of the table` | **在双人形状唯一能出现的地方（大作业）是假的**——`CRD 0021` 明写大作业里 **PM 确认，不是用户** | **T-61** |
| 2 | `principles.md` 原则 20 结尾 | `docs/design/prd.md`、`docs/design/hld.md` 是「这个仓库还没有的路径」 | **两份都在**（`ls docs/design/` = `hld.md prd.md tasks.md`），本作业写的 | **T-60** |
| 3 | `package.json` 的 `description` | 角色清单八个：`product manager, researcher, architect, engineer, QA, code reviewer, security reviewer, doc reviewer` | **少两个**（`crew_test_engineer`、`crew_code_engineer`）。这个字段**显示在 npm 页面上**，用户看得见 | **T-61** |

## 第 1 条是我自己造的，写清楚

`CRD 0021` 是 **PM 自己裁的**（按 `CRD 0020` 第 1 项，范围已定之后 PM 自己决定）。我裁它的时候
**没有想到原则 21 里有那半句**。所以这不是「文档年久失修」，是我在同一天里让两份文件互相打架，
而 T-61 在写 `CHANGELOG.md` 时撞上了它，**选择了少写一句而不是写一句假话**。

## 为什么这三条现在没有主人

- **`principles.md`** 归 **T-52**，已交工并提交。按 `docs/design/tasks.md` 的所有权规则和
  `ADR 0013`，一个任务交工之后别的任务不许再碰它拥有的文件。
- **`package.json`** —— 本作业**没有任何任务拥有它**（PM 核过：本作业那一节里 0 处命中）。

## 决定

**accepted。用户决定，2026-08-21。三条都修，PM 自己改。**

**PM 直接改产品文件，这是一个 departure，写下来不藏。** crew 的形状是 PM 只写文档和提交、
产品文件由 engineer 写、QA 验。用户在本作业中已经给过一次同样的指示（`CRD 0019` 记着：
**「don't let engineer touch principle, you edit it」**），这一次是它的延续。
`package.json` 那一条用户没有单独指示，PM 判断为同一类（一个字段的字符串、无主人、
起一个任务加一轮 engineer 不成比例），一并自己改并记在这里。

## 时序：为什么不马上改

**最后那一轮 QA 正在跑，而它正在读 `principles.md` 和 `package.json` 写用例。**
在它读的时候改，它的用例可能钉住旧文本——这就是 `roles/engineer.md`
「A false red is not evidence」那一节讲的「树在动」。

顺序：**QA 交工（它会把这三条报成缺陷，PM 已在简报里点名要它报）→ PM 修 →
三个评审看到修好之后的状态。** 三个评审本来就排在 QA 之后（`CRD 0020` 第 2 项），所以不多花一轮。

## 追加（最后一轮 QA 交工后）：第 1 条在**四个**文件里，本 CRD 原来只写了一个

**最后一轮 QA 报的 blocking，本 CRD 提交之前收到。** 那句「用户盖章」不止在 `principles.md`：

| # | 文件 | 原文 |
| --- | --- | --- |
| 1 | `principles.md` 原则 21 | `proposed by the architect, and stamped by the user together with the rest of the table` |
| 2 | `README.md` | `**You stamp it, together with the whole table, in one yes.**` |
| 3 | `README-zh.md` | `**是你盖章的，和整张表一起，一次点头。**` |
| 4 | **`roles/architect.md`（最重的一处）** | `your proposal reaches them with the whole table at step 5, **Confirm**, and they stamp the shapes together with everything else in it` |

**第 4 处最重，因为它是给 architect 的指令，而且点名第 5 步——它描述了一个大作业里不可能发生的
时刻**（大作业的任务表第 8 步才由 architect 自己写出来）。

**而 QA 的归因比 PM 的更准，照抄下来：** T-58 和 T-59 **照自己的 DoD 是合格的，错在 DoD**。
`CRD 0021` 是 T-58 交工**之后**才裁的，而 PM 当时只回改了 T-62 的两格验法，
**没有回改 T-58 的 DoD 和 T-59 的要求来源**。所以这不是两个 engineer 写错了，
是 PM 在一份已经发出去的判据后面改了规则却没有回头对齐。**这是 PM 在本作业的第七处错。**

QA 还核过：**没有任何已有用例钉住这四处旧文本**，所以修它们不会撞红任何用例
（`T-58/case-07` 的头部写明了它**故意只钉 `CRD 0021` 留下的那一半**）。

## 三条各自要改成什么

1. **原则 21**：不许把「用户盖章」写成无条件的事实。准确的说法要分两条路——小作业里 PM 第 4 步
   写表、用户第 5 步用同一个 yes 盖章；**大作业里 architect 第 8 步写表时提出，PM 确认**，
   用户在里程碑评审看到（`CRD 0021`）。而双人形状**只存在于大作业**（`CRD 0014`），
   所以那才是它实际走的那条路。
2. **原则 20 结尾**：`prd.md`、`hld.md` 现在都在；还没有的是 `docs/design/api/`、
   `docs/release/`、`docs/research/`。**改法要注意别造出下一处过期陈述**——本作业已经修过
   一次同类（原则 20 里那句 `holds 67 cases in 5 task folders today`，改法是**去掉对当前计数的
   依赖**，而不是换一个会再过期的数字）。这一条同理：写清「哪些在、哪些还没有」时，
   别引入任何会随下一件作业过期的计数。
3. **`package.json` 的 `description`**：补上两个新角色。这个字段**不挂在任何已发布的版本上**
   （它描述的是当前的包），所以补它不会造出「把未发布说成已发布」那种假话——
   这一点和两份 README 顶上那个 `Version 0.7.0` 方框**不同**，那个方框 PM 已经裁定留着。

## 代价

- **PM 直接改产品文件**，少了 engineer 那一层，也少了「engineer 顶回来」这个纠错机制——
  本作业里那个机制已经接住了 PM **六处**简报错误。三条改动之后由**三个评审**看（它们本来就要跑），
  所以不是没人看，只是看的人换了。
- **原则 21 那一处不是删一句、是要写准两条路**，比另外两条重。

## Applied

**待回填**：`principles.md`（原则 20、21）、`README.md`、`README-zh.md`、`roles/architect.md`、`package.json`（`description`）——**五个文件，不是两个**（见上面那节追加）。
以及 `docs/qa/` 里若有用例钉住了旧文本，需要在同一个提交里一起改（那是 QA 的家，
届时由 QA 改；`docs/qa/T-52/case-01` 的头部已经立过这个先例——
「whoever adds principle 22 changes this line together with the file, in the same commit」）。
