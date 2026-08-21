# CRD 0020：按 `~/req` 第 1、2、3 项改流程——QA 不再逐任务，评审只在最后一轮且只看改动部分

## 谁提的

用户，2026-08-21。PM 问「optional 那一类往下怎么办」并给了一份耗时分析；用户的回答是
**「check ~/req, there are some thoughts you can use in this round」**——那份文件里第 1–7 项
正是同一个问题的答案，而且是用户先写下来的。

本 CRD 只落地**能立刻用在本作业剩下任务上**的三项（第 1、2、3 项）。第 4、5、6、7 项记在末尾，
作为 `~/req` 那件作业的输入，**本作业不动它们**（用户第 1 项自己写着「pm should reject out of
scope change in principle」）。

## 用户的原话（不转述，照抄）

**第 1 项**：`minimize user inteaction: pm only interact with user at the beginning, once scope is
set and crd written, pm should decide by himself in the rest of the whole time. but in case user
want to interfere or add scope or change decision, pm should give a summary about the output docs
for user to read so that user can interrupt. pm should reject out of scope change in principle,
unless user specified.`

**第 2 项**：`minimize review cycles: I feel the 3 round review is too much. how about the
reviewers only review at the end of a milestone after coding and qa finished, before ready to
commit. and code/doc/sec reviewers each only review 1 round, in parallel. unless the reviewer
proposed change needs a re-review. for example, a code change need code re-review, doc change need
doc re-review. security change need sec re-review. review scope only changed part. do not review
those not touched or out of scope content.`

**第 3 项**：`minimize qa cycle: only do qa 1 round, after coding and before review at the end of
milestone, not in every task. The task is considered done if code passed ut. no need qa for a task.
ut is still needed.`

## 定下来的（本作业剩下的任务立刻照这个跑）

1. **QA 不再逐任务。** 一个任务做完的定义变成：**它的单元测试/项目检查通过**（`npm test` 绿）。
   **QA 只在全部编码结束后跑一轮**，在三个评审之前。
   → 这一条**取代** `CRD 0018` 里「QA 照旧逐任务跑」那一句。`CRD 0018` 的其余部分不变，也不重写。
2. **三个评审（code / security / doc）在最后各跑一轮，并行，只看改动的部分。**
   不看没被碰过的、也不看范围外的内容。
   **只有一种情况重跑**：某个评审自己提的改动需要它自己再看一次——代码改动重跑代码评审，
   文档改动重跑文档评审，安全改动重跑安全评审。**不是三个一起重跑。**
3. **PM 之后自己决定，不再逐事问用户。** 范围已定、CRD 已写，剩下的 PM 自己判。
   用户想介入时，PM 给的是**产出文档的摘要**，让用户能主动打断，而不是 PM 逐条请示。
   **范围外的改动 PM 原则上拒绝**，除非用户明确指定。

## 它省下什么——用本作业的实测数字

各角色单轮实测时长（每个 agent 返回时带的 `duration_ms`）：
**QA 13–26 分**（最贵）、architect 23 分、文档评审 12–15 分、engineer 大轮 17 分、
代码/安全评审 5–7 分、engineer 小轮 2–6 分。

- **第 3 项省得最多**：剩下 8 个任务，原本每个一轮 QA。按 13–26 分算，**省掉的是小时级**，
  而不是分钟级。
- **第 2 项省的是往返**：T-51 上代码评审跑了 3 轮、安全评审 2 轮，其中有 3 轮是
  「评审跑完代码又变了、评审因此过期」。只跑一轮 + 只在自己那一类改动后重看，把这一类归零。
- **第 1 项省的是等待**：本作业前半段 PM 逐事请示，用户答了二十多次。

## 代价，写下来不藏

- **缺陷会更晚被发现。** T-51 上逐任务 QA 抓到过真东西（`ADR 0014` 要两处交叉引用只做了一处、
  依赖禁令的反向不对称）。放到最后一轮，这类东西会在**更多代码已经写完之后**才暴露，
  返工面更大。**这是用户明确接受的交换。**
- **「任务做完」的门槛降低了。** 从「代码评审 + 安全评审 + QA 三关」变成「单元测试通过」。
  提交时 Verdicts 行必须写真话（`qa: not run — 按 CRD 0020，QA 集中在最后一轮`），
  **不许写 `pass`**。
- **PM 自己决定会犯错。** 本作业已有记录：PM 发出的简报里有三处自带错误（说「只碰两个文件」
  却又要求红灯长在测试文件里；把「拿到全部工具」当成通用后果而它只在 18 种情况的 9 种成立；
  照抄的原文含 `roleDeny: {` 撞坏了 `case-04`），三次都被 engineer 顶回来。少一层请示，
  这类错误被接住的机会也少一层。

## 立刻生效的具体后果

- **T-53、T-54、T-55 不跑 QA。** 三个任务的完成判据是 `npm test` 绿（已有 113 个用例 +
  `verify-mount.mjs` 的 79 条挂载检查照旧跑，它们本来就是这三个文件的机器检查）。
- 之后的 T-56、T-57、T-58、T-62、T-59、T-60、T-61 同样不跑逐任务 QA。
- 全部编码结束后：**一轮 QA** → **三个评审并行各一轮，只看改动部分** → 回填 Verdicts →
  收尾提交 → 找用户验收（`CRD 0017` 定的那一道门）。

## 记下、本作业不做的四项（`~/req` 那件作业的输入）

- **第 4 项 里程碑最少化**：用户的定义是「一个里程碑 = 提交 + 推送 + 打一个新版本」，
  所以正常只要一个。本作业已经是 M1（已提交）+ M2（其余全部），来不及并；`CRD 0017` 已经
  把四个并成一个。用户还写了一条硬要求：**再小的改动也要有一个里程碑，里面有任务和完整的
  qa/review 循环。**
- **第 5 项**「你自己想别的提速办法」——PM 已给的四条（交工前一次关门扫描、DoD 的验证命令
  先自己跑通、不用精确整句钉散文、QA 开跑前冻结 DoD）写在这里，那件作业可以直接用。
- **第 6 项 子 agent 加编号后缀**（`crew-engineer-1`、`crew-qa-2`）：这是产品改动，
  而 `host/roles.js` 在 T-51 交工后已关门。留给那件作业。
- **第 7 项 每个角色能读写哪些文件，在角色提示词里明确列出**，防止 engineer 去改 PM 的
  `prd.md` 或 `principles.md`。**本作业有一次真实事故支持它**：T-51 的 QA 把测试计划写进了
  `docs/qa/T-51-plan.md`，而 `roles/qa.md` 加粗禁止这件事，**79 条挂载检查和 92 个用例全绿，
  一条都没红**，是 engineer 用眼睛发现的（`docs/qa/gaps.md` 第 20 条）。
  PM 判断这一项是**范围外**（本作业是「双人形状」，不是「全角色文件权限表」），
  按第 1 项「范围外的改动原则上拒绝」不在本作业做——**除非用户明确说要**。

## 决定

**accepted。用户 2026-08-21 指向 `~/req` 并说「there are some thoughts you can use in this
round」。** 第 1、2、3 项本作业立刻生效；第 4、5、6、7 项留给 `~/req` 那件作业。

## Applied

`docs/design/prd.md`（评审与 QA 那一节）、`state.json`，以及从 T-53 起每个任务的 Verdicts 行。
**没有任何 DoD 条目因本 CRD 增减。**
