# 任务表：`pm-merge-step` 作业（事后重建）

## 这份文件是什么

**这是一份重建，不是当时的记录。**

- **重建时间**：2026-08-21。
- **重建人**：crew QA（任务 T-30）。
- **为什么要重建**：`pm-merge-step` 这件作业跑了 30 个任务，把 75 条编号的验收检查累积
  在一份 DoD 里。那份 DoD 按 CRD 0006 的搬运步骤被丢弃了，而「验收检查」不属于搬运步骤
  点名的五个目的地里的任何一个，所以它们整批丢失。四个 CRD 至今指着没有任何文档定义的
  编号（`0001` 的「验收检查 18-21」、`0002` 的「44-46」、`0005` 的「33」、`0006` 的
  「67」）。CRD 0010 决定废掉全局编号的平表，改成**每一行任务自带一节 DoD**，并要求把
  能救的检查按任务救回来。这份文件就是那一步。
- **形状依据**：`docs/decisions/crd/0010-dod-is-a-section.md`。
- **它不假装是当时写下的东西**。凡是有原始出处的条目都标了出处；凡是没有的，标
  **`已丢失`**，不补写、不推测成检查。宁可有诚实的洞，也不要一张看起来完整、实际上一半
  是虚构的表——那正是本任务要修的那种失效。

## 恢复到了什么程度（数字）

| | 条数 | 编号 |
| --- | --- | --- |
| 75 条检查总数 | 75 | 1-75 |
| **原文可恢复**（能读出这条检查要求什么、以及谁能验它） | **48** | 1-7、11-20、22-46、48-52、67 |
| **部分恢复**（编号和主题在，原文丢了） | **7** | 8、9、10、21、47、53、70 |
| **完全丢失**（连主题都没有） | **20** | 54-66、68、69、71-75 |

**按出处拆开那 48 条：**

| 出处 | 条数 | 说明 |
| --- | --- | --- |
| 仓库里 42 个 QA 用例的头部注释（`docs/qa/*/case-*.mjs`） | 46 | 42 个用例每一个都在第一行注明它覆盖哪条检查，合计覆盖 46 个不同编号 |
| `docs/qa/gaps.md` | 1 | 检查 1（`npm test` 四项全绿）；另外 14 个编号 gaps.md 也提到，但都已被用例注释覆盖 |
| 作业文件夹的 `inbox/Q-19.md` | 1 | 检查 67，**逐字**；这是 48 条里**唯一在仓库里找不到任何出处**的一条 |

**四份 QA 测试计划**（`<作业文件夹>/T-01-plan.md`、`T-05-plan.md`、`T-06-plan.md`、
`T-07-plan.md`）在重建时仍然存在，它们用表格逐条写了「这条检查我做什么 / 必须发生什么」。
它们把上面 46 条里的 47 条（含检查 1）写得比用例注释更接近原文，所以下面的正文大量引用它们。
**但它们是一次性文件，按 CRD 0006 会随作业文件夹一起丢。** 这份文件是把它们的内容搬进仓库
的最后机会。凡是只靠计划、`state.json`、`Q-19`、`Q-20` 才知道的事，下面都标了
`（作业文件夹，会被丢弃）`。

## 出处标记怎么读

| 标记 | 意思 |
| --- | --- |
| `【原文】` | 这一条能读出**当时那条验收检查要求什么**，出处在后面 |
| `【重建】` | **没有任何检查原文留下来**。这一条是从提交信息里写的「做了什么」倒推的——它是关于代码现状的事实，**不是**当时 DoD 要求过什么的记录 |
| `已丢失` | 什么都没留下 |

出处写成：提交短哈希（`9094fae`）、`CRD 000N`、`ADR 000N`、用例文件路径、`gaps.md`、
或 `作业文件夹/<文件名>`。

## Verdicts 这一行怎么读（PM 事后补，2026-08-21）

`CRD 0010` 之后新增的一行：每个任务小节的**开头**、紧跟小节标题的一条
`- **Verdicts**：…`——它是一行，不是任务表里的一列，所以它装得下四个值加一句跳过的
理由。**它现在的样子是这次作业的真实记录，不是它应该有的样子。**

`roles/pm.md` 第 10 步一直写着「A task is finished when code review passes, security review
passes or was skipped for a stated reason, and QA says pass」。这条规则**从 T-09 起被连续
违反了二十来个任务**——PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和
`run-all.sh`）顶替了那道关，而每次都过，所以它感觉是冗余的。**没有任何机制反对；是用户
开口问才发现的。**

所以这些行里大量的 `not run` 是照实写的。**这一行存在的意义就是让这种事下一次在当天就看得
见，而不是二十个任务之后。**

**这一行能证明什么、不能证明什么**：PM 写它。评审员按设计写不了文件（`principles.md`
第 12 条），所以行上没有一个值是评审员自己的签名——它是 PM 对评审说了什么的转述。一个检查
能证明这一行被写下来了，**没有任何东西能证明评审真的跑过**。

## 一个必须先说清的坑：任务号在同一段历史里撞车

`6963cc8..8f2339d` 这 43 个提交里，**有 3 个不属于本作业**，但标题也带 `(crew T-NN)`：

| 提交 | 真正的作业 | 那个作业的任务号 |
| --- | --- | --- |
| `91f034c` | `doc-review-0-7-0` | 它自己的 T-06..T-12 |
| `bfdc799` | `engineer-proposes-fixes` | 它自己的 T-01、T-03、T-04 |
| `2ba2e7e` | `engineer-proposes-fixes` | 它自己的 T-03..T-07 |

出处：`~/.claude/crew/jobs/doc-review-0-7-0/state.json`（`"commit": "91f034c"`）、
`~/.claude/crew/jobs/engineer-proposes-fixes/state.json`（每个任务都写了 commit），以及
`CRD 0006` 正文点名 `dsh-crew-09` 在 `bfdc799` 里立的规则。

**所以 `6963cc8..8f2339d` 里带 `(crew T-NN)` 的 27 个提交中，属于本作业的是 24 个。**

**这三个数字原来写的是 39 / 25 / 22，而且原文说「只钉住 22 这个数——它不会再变」。那句话是
错的**：范围的终点写的是 `HEAD`，而本作业后来又提交了，于是 39 变 43、25 变 27、22 变 24。
一个钉在会动的 `HEAD` 上的范围，天生会过期。**教训写在这里不删：要钉数字，就得把两个端点都
写成真实提交。**（`CRD 0010` 写的「36 个提交」同理，是它被提交那一刻的总数。）下面这张表里的
T-NN 只指 `pm-merge-step` 的任务。
读历史时看到 `bfdc799` 的 `T-03`，那是别人的 T-03。

---

# 任务表

## T-01 — PM 的第 17 步「合并与清理」，以及钉住它的断言

- **Verdicts**：code: pass（3 轮）｜ security: pass（3 轮）｜ qa: pass ｜ doc: not run — 这份任务表是事后重建的，PM 找不到这一轮文档评审的记录，按「没有记录就不算发生」写

- **拥有的文件**：`roles/pm.md`、`tools/verify-mount.mjs`（出处：`作业文件夹/state.json`）
- **提交**：`9094fae`（另有 `ca70789` 修它遗留的两处，见 T-19）
- **相关决定**：`ADR 0005`（删分支的窗口只收窄，不用 lease 关死）
- **DoD 原文**：**已恢复**（29 条）

| # | 怎么算做完 | 别人怎么验 | 出处 |
| --- | --- | --- | --- |
| 1 | `npm test` 四项全绿 | 直接跑 `npm test`，把真实输出贴进报告。**故意不写成 QA 用例**——那就是把工程师的测试抄一遍 | 【原文】`gaps.md` 第 9 条 + `作业文件夹/T-01-plan.md` |
| 2、17、27 | 第 17 步的 7 个被钉住的命令串（`git merge --no-ff`、`git branch -d crew/`、`git push origin --delete`、`git branch --merged main`、`--ff-only`、`origin/crew/`、`publishCheck`）都在 `roles/pm.md` 里，且**任意一条单独删掉**都会让 `node tools/verify-mount.mjs` 非 0 退出并点名 `roles/pm.md` | `docs/qa/T-01/case-11-pinned-command-strings.mjs` | 【原文】`T-01-plan.md` 第 11 行 + 用例头部。**这三条各自的分界已丢失**：计划把它们并成一个用例，没有留下 2、17、27 分别要求什么 |
| 3 | `roles/pm.md` 真的有第 17 步「Merge and clean up」标题，并且**六条已定的设计决定逐条写清**：`--no-ff`、不许 `--squash`、不许 `git branch -D`、三次分别的同意、删除前的证明、`trustRootAgent` 被拒时只说一句 | `docs/qa/T-01/case-01-step-17-exists.mjs`（只能钉每条的关键命令/关键词，「一条不漏」要人读——见 `gaps.md` 第 2 条） | 【原文】`T-01-plan.md`、`gaps.md` 第 2 条 |
| 4 | 第 7 步（建工作分支）指向第 17 步，并说明清理只在用户开口时才做 | `docs/qa/T-01/case-02-step-7-note.mjs` | 【原文】`T-01-plan.md` |
| 5 | 状态文件示例里有 `merge` 块，含 `into`、`merged`、`pushed`、`branchDeleted` 四个键；没合并过的作业整个键不写 | `docs/qa/T-01/case-03-state-merge-block.mjs` | 【原文】`T-01-plan.md` |
| 6 | 第 18 步 Finish 不再无条件承诺 `nothing was pushed`，而是报告真的合并了什么、推了什么、删了什么 | `docs/qa/T-01/case-04-step-18-finish-summary.mjs` | 【原文】`T-01-plan.md` |
| 7 | Hard rules 里有一条禁止 PM 自行合并或删分支，并同时点名 `--squash` 和 `git branch -D` | `docs/qa/T-01/case-05-hard-rule-no-self-merge.mjs` | 【原文】`T-01-plan.md` |
| 11 | 每个任务的提交只动这个任务拥有的文件；`package.json` 不在本次改动里 | `docs/qa/T-01/case-26-repo-diff-scope.mjs`（按提交标题里的任务标记搜**整个**历史；浅克隆里它红并逐条打印 `not run`——见 `gaps.md` 第 7、8 条） | 【原文】`T-01-plan.md` + 用例头部 |
| 12 | `roles/pm.md` 全文不含 `{{`（dsh 会尝试插值，整份提示词组装会失败）；第 1 行未被改动 | `docs/qa/T-01/case-06-no-braces-and-title.mjs` | 【原文】`T-01-plan.md` |
| 13 | 删除前有三条证明，其中一条读的是**远端**工作分支；并写明「命令成功执行且无输出」才算证明 | `docs/qa/T-01/case-07-three-delete-proofs.mjs` | 【原文】`T-01-plan.md`；理由见 `ADR 0005` |
| 14 | `--ff-only` 是追平本地 `main` 的方式；force 推 `main` 一律禁止，不管 guard 允许 root 做什么 | `docs/qa/T-01/case-08-ff-only-never-force.mjs` | 【原文】`T-01-plan.md` |
| 15 | `merge` 块示例里有 `publishCheck` 字段——推 `main` 之前读过哪些 CI 文件的记录 | `docs/qa/T-01/case-09-publish-check-field.mjs` | 【原文】`T-01-plan.md` |
| 16 | 一条 Hard rule 把「先读 CI 文件」变成「能开口问推 `main`」的前提，且结论写在同一个问题里 | `docs/qa/T-01/case-10-hard-rule-read-ci.mjs` | 【原文】`T-01-plan.md` |
| 22 | 第 17 步的四项前置检查什么都不改（段里没有 `git switch`、没有 `git merge`）；`--ff-only` 出现在拿到 yes 之后的段里 | `docs/qa/T-01/case-12-precheck-read-only.mjs` | 【原文】`T-01-plan.md` |
| 23 | 有一句兜底的话，覆盖「已经切到 `main` 之后」的每一条停下路径，至少点名快进失败和用户说 no | `docs/qa/T-01/case-13-switch-back-paths.mjs` | 【原文】`T-01-plan.md` |
| 24 | 第三条证明在拿到删除的 yes 之后、真正删之前，**同一轮里再跑一次** | `docs/qa/T-01/case-14-third-proof-rerun.mjs` | 【原文】`T-01-plan.md`；理由见 `ADR 0005` |
| 25 | `publishCheck` 的示例值是占位符（含 `<` `>`），照抄不成答案；不出现 `publish.yml is tag-only`；并有一句明文禁止照抄示例 | `docs/qa/T-01/case-15-publish-check-placeholder.mjs` | 【原文】`T-01-plan.md` |
| 26 | `roles/pm.md` 不指向本包内部：`host/git-guard.js`、`publishingWorkflow()`、`branchPushTriggers()` 出现 0 次（提示词随 npm 包发出去，PM 干活的仓库里没有本包源码） | `docs/qa/T-01/case-16-no-internal-pointers.mjs` | 【原文】`T-01-plan.md` + 用例头部 |
| 35 | non-fast-forward 恢复那一段里有 `git merge --abort` 的出口（否则冲突时 PM 卡在 `main` 上，git 拒绝切走） | `docs/qa/T-01/case-17-merge-abort-exit.mjs` | 【原文】`T-01-plan.md` |
| 36 | 没有远端的仓库里，推 `main` 那次 yes 根本不问，`merge` 里也不写 `pushed` | `docs/qa/T-01/case-18-no-remote-skip-push-yes.mjs` | 【原文】`T-01-plan.md` |
| 37 | 合并那一段和删除段一样：不是明确的 yes 就结束这一步 | `docs/qa/T-01/case-19-merge-clear-yes.mjs` | 【原文】`T-01-plan.md` |
| 38 | `tools/verify-mount.mjs` 断言附近的注释不再声称 `--ff-only` 是唯一能推进 `main` 的方式 | `docs/qa/T-01/case-20-mount-comment-ff-only.mjs` | 【原文】`T-01-plan.md` |
| 39 | 判断 guard 报错用 `contains` 而不是 `starts with`，并写出真实形状 `Error: dsh-crew git guard blocked this command` | `docs/qa/T-01/case-21-guard-error-contains.mjs` | 【原文】`T-01-plan.md` |
| 40 | 会话重启后 `state.json` 里旧的 `publishCheck` 要当成未核实，本次会话重新读 CI 文件 | `docs/qa/T-01/case-22-publish-check-restart.mjs` | 【原文】`T-01-plan.md` |
| 41 | 第 16 步里 tag 推送有它自己的大声警告和它自己的一次同意（第 17 步做出了这个承诺，兑现在第 16 步） | `docs/qa/T-01/case-23-step-16-tag-warning.mjs` | 【原文】`T-01-plan.md` |
| 42 | 远端不叫 `origin` 时，`origin/main` 和 `origin/crew/` 这两个前缀也要换成真实远端名 | `docs/qa/T-01/case-24-remote-name-prefixes.mjs` | 【原文】`T-01-plan.md` |
| 43 | 有一句说明 guard 的拒绝理由可能点名审批文件，而且那不是权限问题 | `docs/qa/T-01/case-25-guard-reason-approval-file.mjs` | 【原文】`T-01-plan.md` |

**注 1**：检查 1 和 11 是**全作业**的检查，不只属于 T-01；它们记在这里，因为 QA 当时把它们
放进了 T-01 的计划。

**注 2（当时就发现、从未修掉的自相矛盾）**：检查 11 的原话是「`host/` 下只允许改
`host/git-guard.js`」，而检查 48-52（T-07）要求改 `host/crew.js`。QA 在
`T-01-plan.md` 和 `case-26-repo-diff-scope.mjs` 的注释里都记下了这条矛盾。DoD 一直没改。
`CRD 0010` 把检查 11 列为「废掉全局平表」的三条证据之一。

## T-02 — 合并步骤、guard 修复、限制变更写进每一份文档

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`docs/principles.md`、`README.md`、`README-zh.md`、`CHANGELOG.md`
  （出处：`作业文件夹/state.json`）
- **提交**：`2b59368`（与 T-08 同一个提交）
- **DoD 原文**：**已丢失**。下面的条目是【重建】，来自 `2b59368` 的提交信息，是「交付了
  什么」，不是当时要求过什么。

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| `docs/principles.md` 新增原则 16「分支只在用户开口、且被证明过时才合并和删除」，带上角色提示词装不下的理由：为什么要三次分别的同意、为什么永不 `--squash`、为什么远端分支才是要紧的证明、为什么空输出不算证明、为什么发布警告很大声但不拒绝、为什么删除窗口只收窄不关死 | 读 `principles.md` 第 16 条。没有可跑的用例 | 【重建】`2b59368` |
| 作业 slug 的形状作为一个 Why 写在原则 16 里面（两条规则同源：PM 自己的会话正是 guard 信任的那个） | 读它 | 【重建】`2b59368` |
| 原则 13 的 `Lives in` 从「第 17 步 Finish」改成新的编号（第 17 步被新功能占用，Finish 变成 18） | 读它。`CRD 0010` 追加二把这件事立成规则：**引用步骤要带名字，不能只带编号** | 【重建】`2b59368` + `CRD 0010` |
| 两份 README 新增第 15 条（合并与清理步骤）；第 6 条改成「PM 会告诉你它选的 slug」 | 读两份 README，逐节对齐 | 【重建】`2b59368` |
| 两份 README 的 git guard 一节改成真话：guard 现在按**整个名字**匹配，所以措辞从「touches」改成「names」，并给出 guard 自己的用例证明能过的三个例子 | 读它 | 【重建】`2b59368` |
| 文件夹形状的 `approvalFile` 会在挂载时抛错——这件事以前每份文档都没写，现在写下来 | 行为由 `docs/qa/T-05/case-05-folder-shaped-approval-file.mjs` 验（检查 31）；**文档措辞**没有用例 | 【重建】`2b59368` |
| 「诚实的限制」补全：只提到审批文件名字的命令也会被拒（连用户自己的会话），shell 拼出来的名字能过去 | 行为由 `docs/qa/T-05/case-06-honest-limits.mjs` 验（检查 34） | 【重建】`2b59368` |
| 两份 README 的配置表删掉 `agentsPerJob` 行，`liveAgents` 显示 20 | 读表；行为由 `docs/qa/T-07/*` 验（检查 48-52） | 【重建】`2b59368` |
| `CHANGELOG.md` 未发布的 0.7.0 一节：合并步骤进 Added，guard 假警报和文件夹形状的设置进新的 Fixed，slug 形状进 Added（不是修复，因为用户写的东西以前没坏），限制变更进 Changed 并说明旧 profile 会怎样。不动版本号 | 读 `CHANGELOG.md` | 【重建】`2b59368` |

**注**：`2b59368` 自己写着，最后一轮文档评审被用户跳过，所以这四个文件的措辞**只有 PM
一个人核过**，T-08 报出的两处折行不齐也照原样留着。`gaps.md` 第 1 条把这件事立成了常备缺口。

## T-03 — **已丢失**

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **知道的**：它在 DoD 版本 4 时存在——`CRD 0001` 的「会动到什么」写着「不动 T-01 正在做的
  两个文件」，并把新任务编成 T-05，说明 T-03、T-04 当时已被占用。
- **不知道的**：它做什么、拥有哪些文件、它的 DoD 一条都没有。`作业文件夹/state.json` 的
  任务列表里**没有 T-03 这一行**（它从 T-02 直接跳到 T-05）。
- **合理的读法（这是推断，不是记录）**：本作业最初把文档拆成三个任务（`principles.md` /
  两份 README / `CHANGELOG.md`），后来合并成 T-02 一个任务——因为 `CRD 0003`（版本 11）说
  这三个文件「现在被 T-02 占着」。**这次合并本身没有留下任何记录。**

## T-04 — **已丢失**（只剩一条线索）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **知道的**：`CRD 0001` 写着「T-04（CHANGELOG）多写一条修复说明」。所以在 DoD 版本 4 时
  **T-04 拥有 `CHANGELOG.md`**，并且它的 DoD 里至少有一条要求：为 guard 的修复多写一条
  变更说明。
- **不知道的**：它的检查原文、编号，以及它其余的条目。
- **和 T-03 同一条矛盾**：`CRD 0003`（版本 11）说 `CHANGELOG.md` 归 T-02，`state.json` 里
  没有 T-04 这一行。

## T-05 — git guard 按「整个文件名」匹配审批文件（`CRD 0001`）

- **Verdicts**：code: pass（2 轮）｜ security: pass（1 轮）｜ qa: pass ｜ doc: not run — 同 T-01：事后重建，找不到记录

- **拥有的文件**：`host/git-guard.js`、`tools/verify-guard.mjs`（出处：`state.json`、`CRD 0001`）
- **提交**：`7c1fbe9`
- **相关决定**：`ADR 0001`（用自己写的边界字符类，不用 `\b`）
- **DoD 原文**：**已恢复**（10 条：18、19、20、28、29、30、31、32、33、34）
- **`CRD 0001` 指着的「验收检查 18-21」**：18、19、20 在这里，**21 见下面的「部分恢复」
  一节**（它是一条文档措辞检查，不是 T-05 的行为检查）。

| # | 怎么算做完 | 别人怎么验 | 出处 |
| --- | --- | --- | --- |
| 18 | `node tools/verify-guard.mjs` 全绿；而且两条最强的老用例**没有被改弱**——「agent 不能自己批准自己」、「连 root 都不能写审批文件」，期望值仍然是「被拒」 | 「全绿」直接跑 `node tools/verify-guard.mjs`（故意不写成用例）；「没被改弱」由 `docs/qa/T-05/case-08-existing-cases-intact.mjs` 读检查脚本并用自己的壳子独立复现 | 【原文】`T-05-plan.md`、`gaps.md` 第 9 条、用例头部 |
| 19 | 只是把审批文件的名字**包在一个更长的名字里面**的命令，不再被审批文件那条规则拒掉。root 会话必须完全放行；子 agent 的拒绝理由里不能再出现审批文件那句话 | `docs/qa/T-05/case-01-allow-names-around-push-ok.mjs`（QA 自己挑的输入：`crew/push-ok-flow` 的推送与建分支、`docs/push-okay.md`、`<全路径>.bak`、`docs/pre-push-ok`、`my-push-ok`） | 【原文】`T-05-plan.md` |
| 20 | 每一种现实中会用到的「点名审批文件」的写法仍然被拒，**子 agent 和 root 都拒**，理由点名审批文件。检查里逐字点名了四种写法：`touch <全路径>`、`touch push-ok`、`rm push-ok`、`echo x >push-ok` | `docs/qa/T-05/case-02-still-blocked-approval-file.mjs` | 【原文】`T-05-plan.md` + 用例头部 |
| 28 | 模式的**左边界**真的在测试之下：从副本的 `host/git-guard.js` 删掉左边界那一半，`node tools/verify-guard.mjs` 必须非 0 退出 | `docs/qa/T-05/case-03-left-boundary-mutation.mjs`（在仓库副本里改，绝不动仓库） | 【原文】`T-05-plan.md` |
| 29 | 边界字符集里的 `-` 写成 `\-`（不靠它排在最后），而且模式**每次挂载只建一次**——坏模式在启动时就失败，不是在之后每条 shell 命令上失败 | `docs/qa/T-05/case-04-escaped-dash-single-build.mjs`。**这是一条静态检查（读源码结构），用例自己说明了这一点**——见 `gaps.md` 第 6 条 | 【原文】`T-05-plan.md` + `gaps.md` |
| 30 | 审批文件的**全路径**走同一条规则，所以它旁边的 `.bak` 不再被拒 | `docs/qa/T-05/case-01-allow-names-around-push-ok.mjs` | 【原文】用例头部 + `T-05-plan.md` |
| 31 | 文件夹形状的 `approvalFile` 在**挂载时**抛错，报错文本说清怎么改（点名这个设置项、说要给一个文件）。以前它让 `basename()` 返回上层目录名，于是每个 `crew/...` 分支推送被拒，而真正的审批文件毫无保护——任何 agent 都能自己批准自己 | `docs/qa/T-05/case-05-folder-shaped-approval-file.mjs`（不读不写任何文件） | 【原文】`T-05-plan.md` + 用例头部 |
| 32 | 「必须放行」和「必须挡住」两半都要有用例，覆盖 `push-ok` 的**六种写法**；并且要有一条用**默认设置**挂载、只送非 push 命令的用例，从不读、建、删真的 `~/.dsh/crew/push-ok` | `docs/qa/T-05/case-01-*` 与 `case-02-*`；默认设置那一条由 `case-08-existing-cases-intact.mjs` 断言工程师的用例还在 | 【原文】`T-05-plan.md`、`gaps.md` 第 3 条、用例头部 |
| 33 | `tools/verify-guard.mjs` 的用例区段包在 `try` / `finally` 里，`rmSync` 一定会跑——**即使某个用例中途抛异常**，它建的临时目录也必须消失 | `docs/qa/T-05/case-07-temp-dir-cleanup.mjs`（在副本里故意让脚本抛异常，然后看临时目录还在不在）。「`try`/`finally` 在」这半是静态检查，行为那半由这个用例关闭——`gaps.md` 第 6 条记着这件事 | 【原文】`T-05-plan.md`、`CRD 0005` 逐字引用、`gaps.md` 第 6 条 |
| 34 | `host/git-guard.js` 的 "Honest limits" 注释里两句实话都在，**而且都对着运行中的 guard 验过**，不只是读注释：只提到这个名字的命令也会被拒（连 root，举了 commit message 的例子）；shell 拼出来的名字仍然能过去 | `docs/qa/T-05/case-06-honest-limits.mjs` | 【原文】`T-05-plan.md` + 用例头部 |

**当时 QA 自己记下的重合**：检查 32 逐字点名了六种写法，所以那部分输入和工程师的用例
必然一样。QA 的做法是把重合写下来，另外加自己挑的边界（改名、软链接、`bash -c`、
全路径删除）。这条已经进了 `gaps.md` 第 3 条。

## T-06 — `<job-slug>` 的形状（`CRD 0002`）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: pass ｜ doc: not run — 同 code，PM 直接跳过了

- **拥有的文件**：`roles/pm.md`（第 6 步）、`tools/verify-mount.mjs`（出处：`state.json`、`CRD 0002`）
- **提交**：`9094fae`（和 T-01 同一个提交）
- **DoD 原文**：**已恢复**（3 条：44、45、46）——`CRD 0002` 指着的「验收检查 44-46」就是这三条

| # | 怎么算做完 | 别人怎么验 | 出处 |
| --- | --- | --- | --- |
| 44 | 第 6 步逐条写清 slug 的形状：只允许小写字母、数字和 `-`；不许以 `-` 开头或结尾；不许 `..`；一个具体的长度上限数字；**以及为什么**（这个值会被拼进文件路径和 shell 命令，而 PM 自己的会话正是 guard 信任的那个）。实际落地的形状是 `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`，上限 40 个字符 | `docs/qa/T-06/case-01-slug-shape-rule.mjs`。「写清为什么」是散文，用例只能钉关键词——`gaps.md` 第 2 条 | 【原文】`T-06-plan.md`、`gaps.md` 第 2 条；落地形状见 `9094fae` |
| 45 | 第 6 步说明用户给的名字不合形状时怎么办：PM **自己**转成合规 slug，并把用哪个 slug 告诉用户；不照原样用 | `docs/qa/T-06/case-02-slug-nonconforming-handling.mjs` | 【原文】`T-06-plan.md` |
| 46 | 这条规则被 `tools/verify-mount.mjs` 钉住：从副本的 `roles/pm.md` 删掉那条 slug 模式串，检查必须非 0 退出并点名 `roles/pm.md`；不改时退出 0 | `docs/qa/T-06/case-03-slug-assertion-pinned.mjs` | 【原文】`T-06-plan.md` |

## T-07 — 删掉 `agentsPerJob`，`liveAgents` 默认 20（`CRD 0003`）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: pass ｜ doc: not run — 同 code，PM 直接跳过了

- **拥有的文件**：`host/crew.js`、`cordis.patch.yml`、`tools/verify-mount.mjs`（出处：`state.json`、`CRD 0003`）
- **提交**：`c6aeabf`
- **DoD 原文**：**已恢复**（5 条：48、49、50、51、52）

| # | 怎么算做完 | 别人怎么验 | 出处 |
| --- | --- | --- | --- |
| 48 | 单作业的 agent 上限没有了：拼给 PM 的提示词里没有 `agentsPerJob`、也没有「一个作业总共多少个 agent」那一行；源码里 `DEFAULT_LIMITS` 没有这个键、也没有对应的 `limitOf` 调用 | `docs/qa/T-07/case-01-no-agents-per-job.mjs` | 【原文】`T-07-plan.md` |
| 49 | `liveAgents` 默认 `20`，`reviewRounds` 不动仍是 `3`；**从 PM 真正拿到的提示词里读**，所以一个到不了提示词的默认值算失败 | `docs/qa/T-07/case-02-default-limits.mjs` | 【原文】`T-07-plan.md` |
| 50 | 旧 profile 里的 `limits.agentsPerJob` 被**静默忽略**：挂载不抛错照常完成，启动日志里**恰好有一行**提到它，并说这个设置项没有了、可以从 profile 里删掉 | `docs/qa/T-07/case-03-legacy-setting-accepted.mjs`。**只能证明「挂载不抛错、提示词里没有它」**；「运行时真的不再有上限」要在真的 dsh 会话里跑一次作业才看得到——`gaps.md` 第 5 条 | 【原文】`T-07-plan.md`、`gaps.md` 第 5 条 |
| 51 | 删掉一个设置项不许把其它设置项的检查放松：写错的值仍然要挡住挂载（`liveAgents: -1`、`liveAgents: "abc"`、`reviewRounds: 0`——QA 自己挑的值，不抄工程师的 `liveAgents: 0`），报错要点名那个设置项 | `docs/qa/T-07/case-04-bad-limit-still-throws.mjs` | 【原文】`T-07-plan.md` |
| 52 | `cordis.patch.yml` 的注释示例里没有 `agentsPerJob`，`liveAgents` 写的是 `20`（注释示例就是这些选项的文档） | `docs/qa/T-07/case-05-cordis-patch-comment.mjs` | 【原文】`T-07-plan.md` |

**注**：`T-07-plan.md` 明确写着「检查 53（两份 README）不是我的，是 doc-reviewer 的」——
这是**检查 53 归 T-08** 的唯一出处。

## T-08 — `CRD 0003` 的文档跟进

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`README.md`、`README-zh.md`、`CHANGELOG.md`；`state.json` 还记着
  `"blocked_by": "T-02 owns the same three files"`
- **提交**：`2b59368`（与 T-02 同一个提交）
- **DoD 原文**：**已丢失**，只剩一个编号——**检查 53**（关于两份 README，见下面「部分恢复」一节）

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 两份 README 的配置表去掉 `agentsPerJob` 行，`liveAgents` 显示 20 | 读两份表 | 【重建】`CRD 0003`「会动到什么」+ `2b59368` |
| `CHANGELOG.md` 多一条限制变更说明，并写明还设着旧设置的 profile 会怎样 | 读 `CHANGELOG.md` 0.7.0 一节 | 【重建】`CRD 0003` + `2b59368` |
| 它还报出了两处折行不齐（`README.md`、`CHANGELOG.md`），当时决定不改 | 读它们 | 【重建】`5b2bded` 的 REPORTED, NOT FIXED 一节 |

## T-09 — crew 的 agent 默认并行（`CRD 0004`）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`roles/pm.md`（出处：`state.json`）
- **提交**：`94fd72f`
- **相关决定**：`ADR 0004`（钉这条规则用哪个锚串）
- **DoD 原文**：**已丢失**。`CRD 0004` 留下了「规则的形状」六点，那是 PM 起草的**要求**，
  是这里最接近 DoD 的东西，所以下面标【原文（CRD）】——它出自 CRD，不出自 DoD。

| 怎么算做完 | 别人怎么验 | 出处 |
| --- | --- | --- |
| **默认并行**：现在能开的任务，一次全开，写在同一条消息里 | `tools/verify-mount.mjs` 钉住第 9 步的锚串 `Parallel by default`（T-15 补的）；`docs/qa/` 里没有用例 | 【原文（CRD）】`CRD 0004` 规则形状第 1 点 |
| 两个任务能同时跑的判据不变：**文件清单不重叠** | 读第 9 步 | 【原文（CRD）】`CRD 0004` 第 2 点 |
| 串行只为真实依赖：共用同一个文件，或后一件必须读前一件写下的东西 | 读第 9 步 | 【原文（CRD）】`CRD 0004` 第 3 点 |
| 一个 agent 要覆盖好几个任务，是「该拆」的信号 | 读第 9 步 | 【原文（CRD）】`CRD 0004` 第 4 点 |
| **不许拿 agent 数量当串行的理由**；撞上限就停下来问用户 | 读第 9 步 | 【原文（CRD）】`CRD 0004` 第 5 点 |
| 第 10 步的三道关默认一起跑（两个评审只读，QA 只往 `docs/qa/` 写）；固定顺序留成**明说的例外**，PM 要在总结里说它选了哪个 | `tools/verify-mount.mjs` 钉住第 10 步的锚串（T-19 补的，见那一行） | 【原文（CRD）】`CRD 0004` 第 6 点 + `ca70789` |

**当时就发现、当时没修的洞**：三个文件不重叠的任务仍然会通过**各自的验证**撞车——每个
工程师都被要求跑整套套件，而套件读所有人的文件。本作业里 `run-all.sh` 三分钟内给出过三个
不同答案。规则原文没有覆盖这一点（出处：`94fd72f`、`c16adf1`）。

## T-10 — 原则 18：agent 默认并行

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`docs/principles.md`（出处：`state.json`）
- **提交**：`c16adf1`
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| `principles.md` 新增原则 18，写下 T-09 那条规则背后的理由，并带上真实代价：四个任务的 QA 塞进一个 agent，墙上时间约为分开跑的四倍，用户直接问了为什么这么慢 | 读原则 18。没有用例 | 【重建】`c16adf1` |
| 固定顺序作为**明说的例外**保留，理由（每道关应该读一份停止移动的代码）仍然成立——错的是让那个理由悄悄当了默认值 | 读原则 18 | 【重建】`c16adf1` |
| 原则 18 还要记下规则没覆盖的那个限制：每个工程师都跑一遍读所有人文件的套件，所以文件不重叠的任务仍会通过自己的验证撞车；今天的答案是最终验证由 PM 在一棵静止的树上做 | 读原则 18 | 【重建】`c16adf1` |
| 写成「ours」、不带 Source 行（规则来自本次作业） | 读它 | 【重建】`c16adf1` |

## T-11 — 启动日志每行只说一次

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`host/crew.js`、`tools/verify-mount.mjs`（出处：`state.json`）
- **提交**：`5c102bf`
- **相关决定**：`ADR 0002`（`bootLog()` 用 `if/else`，不用 `??`）
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 两个调用点都走同一个 `bootLog(ctx, note)` 帮手，用 `if/else`，所以不管 `info()` 返回什么，两条路径不会都跑 | `node tools/verify-mount.mjs`（它**数**行数，不只是找字符串） | 【重建】`5c102bf`、`ADR 0002` |
| 四种 logger 形状都恰好打印一次：没有 `ctx.logger`、`ctx.logger` 不是函数（老写法在这里会抛）、logger 什么都不返回、logger 没有 `info()` | `node tools/verify-mount.mjs` | 【重建】`5c102bf` |
| 有一条检查把 `host/crew.js` 当文本读，如果哪一行在 logger 之后还会掉到 `console.log`，就失败（这个 bug 来自照抄一行聪明写法，所以抄回去也要被抓住） | `node tools/verify-mount.mjs` | 【重建】`5c102bf` |

**由谁发现**：QA 在本作业刚写下的代码里发现的，实测每行打印 2 次；同样的写法在 preset
安装器更早的 `.bak` 提示里也有，所以毛病本来就在，本作业又抄了一份（出处：`5c102bf`）。

## T-12 — `verify-preset-install.mjs` 不再漏临时目录（`CRD 0005`）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`tools/verify-preset-install.mjs`（出处：`state.json`、`CRD 0005`）
- **提交**：`32192d1`
- **相关决定**：`ADR 0003`（清理放在整个用例区段外面的一个 `finally` 里）
- **DoD 原文**：**已丢失**。`CRD 0005` 逐字引用了 T-05 的**检查 33** 作为同一条要求的先例，
  所以 `CRD 0005` 指着的「验收检查 33」**能解**——它在 T-05 那一节。

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 四处 `mkdtempSync` 都走一个 `makeHome()` 帮手，记下确切路径；用例区段包在 `try` / `finally` 里；`finally` **只**删这些确切路径——不用通配、不用拼出来的字符串，所以它伸不到本次运行之外 | `node tools/verify-preset-install.mjs` | 【重建】`32192d1`、`ADR 0003` |
| 两条新用例守着它：一条在运行留下任何东西时失败，一条证明抛异常的用例也把自己的目录删掉了 | `node tools/verify-preset-install.mjs` | 【重建】`32192d1` |
| 「清得太早」这个风险要**测**过、不是假设：把清理挪到断言之前不会变绿，而是 ENOENT 崩掉并非 0 退出 | `32192d1` 的提交信息记着实测结果；今天要重做得自己动手 | 【重建】`32192d1` |
| 修完实测：跑之前 0 个、跑之后 0 个残留目录 | 数一下 `/tmp` 里 `crew-home-*` 的个数（`find /tmp -maxdepth 1 -name 'crew-home-*' -printf '.' \| wc -c`），跑 `npm test` 前后各一次 | 【重建】`32192d1` |

## T-13 — 说清 guard 真正覆盖什么，并停止把配方递给子 agent

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`host/git-guard.js`、`tools/verify-guard.mjs`、`README.md`、`README-zh.md`
  （出处：`state.json`）
- **提交**：`78639ac`
- **相关决定**：`ADR 0006`（改注释，不把中间件扩到写文件的工具上）
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 审批文件规则旁边那句假话改掉：guard 只包 `bash` 和 `pwsh`，所以拿着 `write` / `edit` 的角色（工程师两个都有）能把审批文件当普通文件写出来，这个中间件看不到。注释现在说实话，并点名真正的关口是 dsh 自己对写文件的批准提示 | 读 `host/git-guard.js` 的头部注释；`node tools/verify-guard.mjs` | 【重建】`78639ac`、`ADR 0006` |
| 拒绝消息不再把完整的自我批准步骤递给被拒的人：**子 agent** 只拿到一句「去问用户」，没有可抄的命令；**root 会话**在两条拒绝路径上都仍然拿到步骤 | `node tools/verify-guard.mjs`（4 条用例钉住谁看到什么；把共用的消息放回去，两条子 agent 用例变红） | 【重建】`78639ac` |
| 发布扫描只读 `.github/workflows`，而第 17 步叫 PM 另外读四个 CI 文件——这个**分工**要写下来，而不是把 GitHub 的触发规则半途套到别的 CI 上（假警报比没有警报更坏，它教人不读就说 yes） | 读 `host/git-guard.js` 与两份 README；`ca70789` 后来修了第 17 步那句过度声称的话 | 【重建】`78639ac`、`ca70789` |
| 两份 README 里同一句假话也改掉，两种语言都改：只有**shell**命令点名这个文件才会被拒；限制那一段写上 write/edit 这个洞 | 读两份 README | 【重建】`78639ac` |
| 路上被 QA 用例抓到的两处错误在**本次改动里修掉**，不是靠改弱用例：一次没必要的措辞改动弄坏了 30 项断言；更长的头部把两句必需的话挤出了某条用例只读的前 2000 个字符 | `bash docs/qa/run-all.sh`。那个 2000 字符的窗口是以后任何一次改头部的绊线 | 【重建】`78639ac` |

## T-14 — preset-install 检查也能看见重复的启动日志

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`tools/verify-preset-install.mjs`（出处：`state.json`）
- **提交**：`1221699`
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 这个脚本的假 ctx 现在分开记录 logger 的行和 `console.log` 的兜底行，**形状和 `verify-mount.mjs` 一致**，两边不会漂 | `node tools/verify-preset-install.mjs` | 【重建】`1221699` |
| 四条用例要求安装提示和升级的 `.bak` 提示**恰好各说一次**，有 logger 和没有 logger 两种情况都要 | `node tools/verify-preset-install.mjs` | 【重建】`1221699` |
| 用例要挣得自己的位置：把 `?? console.log` 那个老写法放回 `host/crew.js`，这些用例以计数 2 失败，而本文件原有的六条用例和临时目录用例全绿——这正是要补的那个洞 | `1221699` 的提交信息记着实测；`host/crew.js` 事后用 `diff` 和 `md5sum` 核对过逐字节还原 | 【重建】`1221699` |

## T-15 — 钉住并行规则，并要求远端删除命令的两份副本都在

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`roles/pm.md`、`tools/verify-mount.mjs`（出处：`state.json`）
- **提交**：`159c2a9`
- **相关决定**：`ADR 0004`（锚串选 `Parallel by default`，用证据否掉了 `Parallel is the default`）
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 第 9 步的并行规则被一个锚串钉住：`Parallel by default`，全文只出现一次、只在第 9 步。它是**散文**，所以故意脆——失败信息要明说「合法的改写要在同一个提交里改提示词和这个串」 | `node tools/verify-mount.mjs`；`159c2a9` 记着实测：把第 9 步的规则剪掉，旧断言通过、新断言失败 | 【重建】`159c2a9`、`ADR 0004` |
| `git push origin --delete` 在提示词里出现两次（PM 自己的命令、以及删除被拒时给用户的兜底），存在性检查分不出它们，所以改成**至少两次**的计数，失败信息要说清是整个串没了还是少了一份 | `node tools/verify-mount.mjs` | 【重建】`159c2a9` |
| `roles/pm.md` 一个字不改——两份副本本来就在，规则本来就写着，缺的只是检查 | `git show 159c2a9 --stat` | 【重建】`159c2a9` |

**后来才发现的、仍然存在的弱点**：这种「至少 N 次」的计数钉法有一个看不见的失效——在提示词
里任何地方再写一次那个串，钉子就被解除了。**没有修**（出处：`ADR 0004` 的续写、`f351018`）。

## T-16 — `principles.md` 搬到仓库根目录（`CRD 0007`）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`principles.md`、`CLAUDE.md`、`CHANGELOG.md`，以及两个 CRD 文件
  （`0004` 和 `0006`）——出处：`作业文件夹/inbox/Q-19.md` 引用「DoD 第 713 行」
- **提交**：`9ee9263`
- **DoD 原文**：**部分恢复**——只有**检查 67** 逐字留下来了

| # | 怎么算做完 | 别人怎么验 | 出处 |
| --- | --- | --- | --- |
| 67 | 逐字原话：**「仓库里没有任何地方还写着 `docs/principles.md`」**。后来被**收窄**：排除 `docs/decisions/crd/0007-principles-to-root.md`，因为在那份 CRD 里旧路径**是被记录的事实，不是指向文件的指针**——把左边也换成新路径，「`principles.md` → `principles.md`」就变成了废话 | `grep -rn 'docs/principles.md' . --exclude-dir=node_modules --exclude-dir=.git`，结果应当只剩 CRD 0007 里那三处 | 【原文】`作业文件夹/inbox/Q-19.md`（逐字）；收窄的决定见 `Q-19` 与 `9ee9263` |
| 其余 | **已丢失** | | |

**从提交信息能重建的其余交付物**：纯改名（R100，同一个 blob，一个字节没变，所以
`git log --follow` 还能走到之前九个提交）；4 个文件里 9 处引用改掉；`roles/`、`host/`、
`preset/`、`tools/` 和两份清单里都没有任何地方提到这份文档，所以另一个会话的角色文件从来
没有风险；`npm pack --dry-run` 仍是 21 个文件，不含它。另外两处顺带修正：`CLAUDE.md` 里
「因为 `docs/` 不在 files 列表里」这个理由被改名弄假了，改成「files 列表没有点它」；已发布的
0.6.0 changelog 里一个指向它的指针也更新了（出处：`9ee9263`）。

**`CRD 0006` 指着的「验收检查 67」就在这里，能解。**

## T-17 — 为本作业已经做出的六个「怎么做」决定补写 ADR

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`docs/decisions/adr/0001` 到 `0006`（新建）
- **提交**：`65f1435`
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 六个只活在提交信息里的「怎么做」决定各写成一份 ADR：guard 按整个名字匹配、`bootLog` 用 `if/else` 而不是 `??`、临时目录清理放哪、并行规则钉哪个串、删除窗口收窄而不是取 lease、改 guard 的注释而不是扩中间件 | `ls docs/decisions/adr/`，六个文件都在并能读 | 【重建】`65f1435` |
| 每份都放得下一屏（28-32 行）——格式太重是没人写这类文件的原因 | `wc -l docs/decisions/adr/*.md` | 【重建】`65f1435` |
| 每份都有一节「谁要求的」，这是以后能复核分类的依据（有人要求 → CRD；没人要求、干活时撞上 → ADR） | 读六份 ADR 的那一节 | 【重建】`65f1435` |
| 六份里有两份记的是用户听完权衡之后做的决定，并**照实说**，不假装没人参与 | 读它们 | 【重建】`65f1435` |
| 其中三份点名了「要求修这个 bug」的那个 CRD，因为一个读者看到 CRD 0001 和 ADR 0001 覆盖同一个提交，否则会以为分类用错了 | 读 `ADR 0001`、`0003`、`0006` | 【重建】`65f1435`（这一条是工程师自己加的） |

## T-18 — QA 的用例进 `npm test`，CI 每次推送都跑（`CRD 0009`）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`package.json`（只 `scripts.test`）、新文件 `.github/workflows/test.yml`、
  `principles.md` 第 13 条、`roles/qa.md`、`CLAUDE.md`、`README.md`、`README-zh.md`、
  `CHANGELOG.md`（出处：`CRD 0009`「会动到什么」）
- **提交**：`6dc2b8e`
- **DoD 原文**：**已丢失**。`CRD 0009` 的四条「想要什么」是这里最接近 DoD 的东西。

| 怎么算做完 | 别人怎么验 | 出处 |
| --- | --- | --- |
| `package.json` 的 `test` 脚本末尾加 `bash docs/qa/run-all.sh` | `npm test`，最后一步就是它 | 【原文（CRD）】`CRD 0009` 想要什么第 1 点（原文写的是旧路径 `docs/crew/qa/`，见该文件的编者注） |
| 新增 `.github/workflows/test.yml`，在 **push** 上跑 `npm test` | 读那个 workflow | 【原文（CRD）】`CRD 0009` 第 2 点 |
| `publish.yml` 保持只在 `v*` tag 上触发，并**继续**在发布前自己跑 `npm test`——发布不能相信之前某次推送的绿 | 读 `.github/workflows/publish.yml` | 【原文（CRD）】`CRD 0009` 第 3 点 |
| 规则跟着改：`principles.md` 第 13 条不再把「把用例记成不可跑」当成一种结局（那一行配置加上了）；`roles/qa.md`、`CLAUDE.md`、两份 README 一起改 | 读它们 | 【原文（CRD）】`CRD 0009` 第 4 点 |
| 浅克隆那个坑必须**查过并说明选了哪条**：给 workflow 设 `fetch-depth: 0`，或者让读历史的用例出声地跳过。选了 `fetch-depth: 0`，理由是 skip 会在 CI 里永久删掉这份覆盖，并留下两个强度不同的真相 | 读 `test.yml`；`6dc2b8e` 记着在真的 `git clone --depth 1` 里的实测 | 【原文（CRD）】`CRD 0009`「一个 CI 特有的坑」+ `6dc2b8e` |
| 两条代价写在读者会碰到的地方（原则 13、`CLAUDE.md`、两份 README）：`npm test` 会随用例累积变慢；某个作业的用例总有一天会挡住另一个作业的无关改动。以及 CI 覆盖不到 `verify-mount.mjs` 的角色工具那一半 | 读那四处 | 【原文（CRD）】`CRD 0009`「已知的代价」+ `6dc2b8e`、`gaps.md` 第 4 条 |

## T-19 — 钉住第 10 步的并行规则，并让第 17 步停止过度声称 guard 的覆盖范围

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`roles/pm.md`、`tools/verify-mount.mjs`（出处：`ca70789` 改的文件）
- **提交**：`ca70789`
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 第 10 步那一段（三道关一起开始、固定顺序是要在总结里说明的例外）被钉住：以前把它整段删掉，四项检查照样全绿 | `node tools/verify-mount.mjs`；`ca70789` 记着实测——在剪掉那段的仓库副本里新断言失败、HEAD 的同一个文件通过 | 【重建】`ca70789` |
| 这个钉子和 T-15 的一样是**散文**、故意脆，因为那一段里没有命令可锚 | 读断言旁边的注释 | 【重建】`ca70789`、`ADR 0004` |
| 第 9 步那条注释原来说 `Parallel is the default`「不行」，会和新钉子矛盾；改成「对第 9 步不行」 | 读 `tools/verify-mount.mjs` 的注释 | 【重建】`ca70789` |
| 第 17 步那句「用 git guard 用的同一条规则」后面接着叫 PM 读四个 guard 从来不看的 CI 文件；改成「同一条规则，但适用范围比 guard 更广」。**开头几个字不许动**——有一条 QA 用例断言那个短语，用来证明提示词是按行为指向 guard 而不是点名它的函数 | `docs/qa/T-01/case-10-hard-rule-read-ci.mjs` 与 `case-16-no-internal-pointers.mjs`（检查 16、26） | 【重建】`ca70789` |
| 第 17 步下面每一条判断标准不动，force 的平铺禁令也不动 | `bash docs/qa/T-01/run.sh` | 【重建】`ca70789` |

**这两件事是更早的 crew 成员发现但当时不能修的**（文件当时不属于它们）：T-15 明说它把第
10 步留在了没人看守的状态；T-13 发现了第 17 步那句过度声称。QA 当时也没覆盖到（出处：`ca70789`）。

## T-20 — **完全已丢失**

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

在整个仓库、全部提交信息、当时的九份 CRD、七份 ADR、42 个 QA 用例、`gaps.md`、四份 QA 计划、
`state.json`、两个 `Q-` 文件里，**`T-20` 一次都没有出现**。

- 已核对：`grep -rn "T-20"`（排除 `.git`、`node_modules`）零匹配；`git log --all` 的标题里
  零匹配。
- 所以：它做什么、拥有什么文件、它的 DoD 有几条——**一条都不知道**，连「它存在过」都只能
  从编号是连续的这一点上推测。**这里不填任何东西。**

## T-21 — `docs/crew/` 整个消失，每个目录的名字说清自己是什么（`CRD 0008`）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：24 个文件里 146-175 处引用；两次真实的 `git mv`
  （`docs/crew/crd` → `docs/decisions/crd`，`docs/crew/qa` → `docs/qa`）
- **提交**：`49c513e`
- **DoD 原文**：**已丢失**。`CRD 0008` 的「一起做的顺序」五步是这里最接近 DoD 的东西。

| 怎么算做完 | 别人怎么验 | 出处 |
| --- | --- | --- |
| 真实存在的两个文件夹用 `git mv` 搬，历史跟着走；其余六个位置只存在于提示词里，所以只改文字 | `git log --follow` 走得通；`git show 49c513e --stat` | 【原文（CRD）】`CRD 0008` 顺序第 1 点 |
| 改完之后 `docs/crew` 在仓库里**一次都搜不到**，除了 CRD 里那些「当时的记录」（`Q-19` 立的先例） | `grep -rn 'docs/crew' . --exclude-dir=.git --exclude-dir=node_modules`——实测 175 → 38，剩下的全在 CRD 文件里 | 【原文（CRD）】`CRD 0008` 顺序第 2 点 + `49c513e` |
| `run-all.sh` 和 `lib/qa.mjs` 里的路径也要改，别漏 | `bash docs/qa/run-all.sh` | 【原文（CRD）】`CRD 0008` 顺序第 3 点 |
| 跑 `npm test` 和 `bash docs/qa/run-all.sh`，并确认再也搜不到 `docs/crew` | 两条命令直接跑 | 【原文（CRD）】`CRD 0008` 顺序第 4 点 |
| 同一次里做完 `CRD 0006` 的其余部分 | 实际没有在这一次做完——见 T-23/T-24 | 【原文（CRD）】`CRD 0008` 顺序第 5 点 |

**改名自己逼出一个真红，这是最有价值的部分**：`docs/qa/lib/qa.mjs` 算仓库根目录时往上走
四级，在 `docs/crew/qa/lib` 是对的、在 `docs/qa/lib` 高了一级，于是 42 个用例**同时**死掉。
改一行修好，**没有任何断言被改动**（出处：`49c513e`、`CRD 0008` 的 Applied）。

**两个判断，值得留着**：`CHANGELOG` 里已发布小节的路径也更新了——它随 npm 发出去、告诉读者
该敲哪条命令，一条跑不通的命令比一个读起来稍微超前的路径更坏；四份 QA 计划的头部也改成指向
DoD 今天真正的位置（出处：`49c513e`）。

## T-22 — 一个不会在缺失历史上说谎的 QA 用例

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`docs/qa/T-01/case-26-repo-diff-scope.mjs`
- **提交**：`beb4212`
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 不再只读最后 60 个提交（要找的三个当时排在 56 个里的第 23 位，再过大约 60 个提交就会滑出窗口，然后每次推送都失败、说本任务的验收证据没了）。改成按提交标题里的任务标记搜**整个**历史，不设条数上限 | `bash docs/qa/T-01/run.sh`；读 `case-26` 的注释 | 【重建】`beb4212` |
| **不**用钉死的哈希：`git show <hash>` 对任何还在对象库里的提交都成功，包括 rebase 之后不可达的那些——钉哈希会在被重写过的历史上保持绿，正是它要抓的事。标记搜索还能扛住 amend，而且标记说明它属于哪个任务，哈希什么也不说 | 读 `case-26` 的注释 | 【重建】`beb4212` |
| 浅克隆里不许给空集合打绿灯：先判断这个检出能不能回答这个问题，分清三种情况——不是 git 检出、浅克隆、历史完整但真的缺提交。前两种要失败，并明说什么都没验、怎么修，每条依赖的断言打 `not run` 而不是 `ok` | 在真的 `git clone --depth 1` 里跑：0 个 `ok` 行，退出 1（`beb4212` 记着实测） | 【重建】`beb4212`、`gaps.md` 第 7 条 |
| 顺手修掉一个没人注意的弱点：老代码只取带标记的**最新**那个提交，所以同一个标记下更早的越界提交从来没被检查过。现在全都检查，并用一个种进去的提交证明过 | `bash docs/qa/T-01/run.sh` | 【重建】`beb4212` |

**照实说的损失**：浅克隆里 `npm test` 从绿变红。那个绿是假的。**检查 11 在没有历史时确实
无法验证**，用例说出来而不是假装。CI 用 `fetch-depth: 0`，所以 CI 不受影响
（出处：`beb4212`、`gaps.md` 第 7 条）。

## T-23 / T-24 — 「怎么做」的决定进 ADR，不分活的大小（`CRD 0006`）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34。**这一行同时覆盖标题里的两个任务号**——它们之间的分工已丢失，所以分不开写。）

- **拥有的文件**：`roles/pm.md`、`roles/engineer.md`、`roles/architect.md`、
  `roles/doc-reviewer.md`、`tools/verify-mount.mjs`、`principles.md`、`docs/qa/gaps.md`（新建）
  ——出处：`af386fd` 改的文件
- **提交**：`af386fd`
- **DoD 原文**：**已丢失**。两个任务之间的分工也**已丢失**：提交标题写着 `T-23, T-24`，
  但没有任何地方说哪一半归哪个。

| 怎么算做完 | 别人怎么验 | 出处 |
| --- | --- | --- |
| 分家的判据从「谁在场」改成「这是什么」，测试只有一句话：**有人要求这件事吗？** 有人要求（用户、QA、评审）→ CRD;没人要求、干活时撞上 → `docs/decisions/adr/` 里的一份 ADR。和活的大小无关，小活没有架构师，所以 PM 写 | `node tools/verify-mount.mjs`（5 个**不存在**型钉子——它们不会因为改写变红，只会因为有人把老规则又写了一遍而变红）。「一句话的判据」本身是散文，钉不住 | 【原文（CRD）】`CRD 0006` + `af386fd` |
| 「只有架构师写 ADR」那句话删掉，它和这条规则直接冲突 | `node tools/verify-mount.mjs` | 【原文（CRD）】`CRD 0006` 编者注 + `af386fd` |
| ADR 的「选项」一节**逐字引用**工程师自己的话（问了就引 `Q-` 文件，在自己权限内决定了就引它的报告），PM 只补「决定」和「理由」；而且 ADR 只**引用**、绝不**指向**——`Q-` 文件住在会被丢弃的作业文件夹里，「选项见 Q-03」等于在作业结束那天删掉 ADR 最值钱的一节 | 读 `roles/pm.md`；这条是散文，钉不住（`af386fd` 的报告明说了） | 【原文（CRD）】`CRD 0006` 修订一、修订二、修订三 |
| 收尾的搬运动作：一次性文档丢掉之前，持久的东西先搬出去——规则 → `principles.md`、怎么做 → ADR、范围 → CRD、这次的理由和测试数字 → 提交信息、QA 的「测不到什么」→ `docs/qa/gaps.md`。而且一次性文档在**最终总结之后**才丢，不是检查全绿的时候（本作业自己的 DoD 在全绿后又承载了五轮决定） | T-28 后来给这一步加了钉子（见那一行）；`docs/qa/gaps.md` 存在并有内容 | 【原文（CRD）】`CRD 0006` + 该文件版本 26 的补充 |
| 工程师提示词加上原则 18 只能记录、不能执行的那条规则：一个红来自另一个活着的任务正在写的文件时，那不是关于自己工作的证据——说「the tree was moving」、点名那个文件、不要追、**永不为了变绿而改弱一条用例**。最终验证是 PM 的，在一棵静止的树上 | `node tools/verify-mount.mjs`（`ADR 0007` 后来给这句话加了钉子） | 【原文（CRD）】`af386fd`、`ADR 0007` |
| 四份 QA 计划离开仓库进作业文件夹，它们持久的那一半变成 `docs/qa/gaps.md`——按「是什么东西」分组，不按任务号分组，因为一年后任务号什么也说明不了。**而且写在计划被丢掉之前**，这正是规则要求的顺序 | `docs/qa/gaps.md` 存在；`ls docs/qa/*-plan.md` 应当为空 | 【原文（CRD）】`CRD 0006` + `af386fd` |
| 十次变异证明这些新钉子：每一个都让 `verify-mount` 变红并点名文件 | `af386fd` 的提交信息记着；今天要重做得自己动手 | 【重建】`af386fd` |

**明说钉不住的东西**（`af386fd` 的报告列出）：那句一问的判据、引用而不指向的规则、丢弃的
时机——三条都是散文。

## T-25 / T-26 — 规则的理由补上，并告诉 QA 它的计划写在哪

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34。**这一行同时覆盖标题里的两个任务号**——它们之间的分工已丢失，所以分不开写。）

- **拥有的文件**：`roles/qa.md`、`principles.md`、`CHANGELOG.md`（出处：`eb6e011` 改的文件）
- **提交**：`eb6e011`
- **DoD 原文**：**已丢失**。两个任务的分工同样**已丢失**。

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| `roles/qa.md` 是掉进缝里的那个文件：`CRD 0006` 点了它，而它不在任何任务的清单里。它还叫 QA 把计划写到 `docs/qa/<task-id>-plan.md`——一个已经不存在的路径，照着读会在规则留给持久资产的文件夹里把它再建出来。计划现在写到作业文件夹、和 `state.json` 并排；只有用例进仓库 | `node tools/verify-mount.mjs`（T-27 补的六个钉子：仓库内的计划路径必须**不在**、作业文件夹的路径必须在、`commits your plan` 必须不在、`docs/qa/gaps.md` 必须在、runner 和用例文件夹必须在） | 【重建】`eb6e011`、`79edcf8` |
| 告诉 QA `docs/qa/gaps.md` 存在、而且它是喂这个文件的人，并重复该文件自己的三条规矩：按「是什么」分组不按任务号、已经有的缺口不再加第二份、关掉的缺口要说清并点名是什么关掉的 | 读 `roles/qa.md`；`node tools/verify-mount.mjs` | 【重建】`eb6e011` |
| QA 也拿到「假红」那条规则，而且要更锋利的版本：QA 的整个工作就是报缺陷，真回归和树在动有一秒钟长得一模一样，唯一能区分的是失败点名了哪个文件 | `node tools/verify-mount.mjs`（`ADR 0007` 的钉子 `the tree was moving`） | 【重建】`eb6e011`、`ADR 0007` |
| `principles.md` 新增第 19 条「文档按活多久分家，不按谁在场分家」——本作业真正定下来、却没有任何原则说过的那件事；13、14、17 三条里已经不成立的说法改掉（17 属于另一件作业，所以只改它的目的地）；18 记着的假红缺口现在被提示词覆盖了 | 读 `principles.md` | 【重建】`eb6e011` |
| 三条不在清单上的假话被找出来并说出来，而不是悄悄改掉或悄悄留着：「拒绝的想法」表里一行还写着已经退役的目的地，以及未发布的 0.7.0 自己的两处过期说法 | 读 `CHANGELOG.md` 0.7.0 一节和 `principles.md` 的表 | 【重建】`eb6e011` |
| `README` 第 11 步已经把「不发布的里程碑那段实话」叫作 gap list，所以英文正文里**不给** `docs/qa/gaps.md` 用这个词——两个不同的东西不该同名 | 读两份 README | 【重建】`eb6e011` |

## T-27 — 钉住刚写进 `roles/qa.md` 的那些规则，并把缺口清单摆上台

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`tools/verify-mount.mjs`、`roles/pm.md`（第 11 步、第 18 步）
- **提交**：`79edcf8`
- **相关决定**：`ADR 0007`（第二个散文钉子 `the tree was moving`）
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 六个钉子守住一小时前写进 `roles/qa.md` 的四条规则（在此之前 `qa.md` 只走了长度和 `{{` 的循环）：仓库内的计划路径不在、作业文件夹路径在、`commits your plan` 不在、`docs/qa/gaps.md` 在、runner 和用例文件夹在——后两个是为了让以后一次「顺手整理」不能在修计划路径的同时把用例挪走 | `node tools/verify-mount.mjs` | 【重建】`79edcf8` |
| 另外两个钉子守住 `engineer.md` 和 `qa.md` 共用的那句假红用语 | `node tools/verify-mount.mjs` | 【重建】`79edcf8`、`ADR 0007` |
| 八条断言第一次跑就全绿，报告**照实说**、不制造一次失败：回归钉子不增加行为，它把已经在的行为钉住。八次变异逐个证明它们，并且把两条共用一个条件的断言拆开，让失败能点名到底哪个路径没了 | `node tools/verify-mount.mjs`；`79edcf8` 的提交信息记着八次变异 | 【重建】`79edcf8` |
| `roles/pm.md` 第 11 步现在把 `docs/qa/gaps.md` 也纳入要提交的东西（之前只写「QA 的用例文件，在 `docs/qa/` 下」，而缺口清单在那里但不是用例文件——按提示词该有的读法，QA 现在要喂的那份常备清单会永远不进版本控制） | 读第 11 步；`node tools/verify-mount.mjs` | 【重建】`79edcf8` |
| 第 18 步和它的 Hard rules 摘要点明**一个负责人、一个复核人**：QA 写那一条，PM 在计划被丢掉之前确认它真的发生了 | 读第 18 步 | 【重建】`79edcf8` |
| 改的是注释而不是代码的那一处：`af386fd` 加的钉子声称三个路径只出现在收尾的搬运步骤里、所以那个检查守住了那一步。它从来没有守住（`principles.md` 在 Hard rules 里又出现一次），第 18 步可以被删掉而四项检查全绿。注释现在说这个检查真正证明了什么，洞被点名留给后续 | 读 `tools/verify-mount.mjs` 那处注释；后续就是 T-28 | 【重建】`79edcf8` |

## T-28 — 钉住收尾的搬运步骤

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`tools/verify-mount.mjs`
- **提交**：`8420cb1`
- **DoD 原文**：**已丢失**

| 怎么算做完（重建） | 别人怎么验 | 出处 |
| --- | --- | --- |
| 洞要**先演示**再修，这是唯一能说明一个钉子值得加的办法：在副本里删掉第 18 步的搬运段，未改的检查通过了 | `8420cb1` 的提交信息记着实测 | 【重建】`8420cb1` |
| `docs/qa/gaps.md` 现在必须出现**三次**，而且三份副本确实在三个不同段落做三件不同的事（第 11 步登记这个文件、第 18 步填它、Hard rule 陈述它）。每一份副本都被**单独**变异过，不只是那个预期的 | `node tools/verify-mount.mjs` | 【重建】`8420cb1` |
| 最精确的锚（第 18 步那个只出现一次的加粗标题）**按本仓库自己的标准被否掉**：它是散文，而 `ADR 0007` 说只有当一条规则再也没有命令、路径或字段名可抓时才付这个脆性代价。这一条有五个目的地、其中三个是路径，所以不必付 | 读那处断言的注释、`ADR 0007` | 【重建】`8420cb1`、`ADR 0007` |
| 钉子还要对**反方向的失败**测过：把那一段的散文按一次诚实的改写能改到的程度全改掉（连标题），只留五个目的地不动，检查必须仍然是绿的。一个任何编辑都会触发的钉子，最后会被人删掉 | `8420cb1` 的提交信息记着实测 | 【重建】`8420cb1` |

## T-29 — 把 `CRD 0010` 执行进角色提示词（**执行中，本文件写下时还没有提交**）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **要动的文件**（出处：`CRD 0010`「会动到什么」）：`roles/pm.md`（第 4、6、9、10、18 步和
  bug 流程）、`roles/architect.md`、`roles/engineer.md`、`roles/qa.md`、
  `roles/doc-reviewer.md`、`tools/verify-mount.mjs`，以及 `principles.md`
  （13、14、19 条 + 新原则 20）、`CLAUDE.md`、两份 README、`CHANGELOG.md`
- **DoD**：**这份文件写下时还不存在于任何文档里**。`CRD 0010` 的六条「具体规定」、
  「追加：原则 20 必须装的东西」和「追加二：工作流也进原则」是它的要求来源，但那是 CRD，
  不是一节 DoD。**按 `CRD 0010` 自己的规定，这一节 DoD 应当由 PM 写在这张表里。**
- **DoD（由 PM 事后补写，2026-08-21）**：本文件写下时它确实不存在，重建拒绝发明是对的。
  缺的是 PM 那一步，现在补上。逐条都能跑：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | 全仓库搜不到 `dod.md`，也搜不到把 DoD 说成一份文件的句子 | `grep -rni 'dod\.md\|DoD file' . --exclude-dir=.git --exclude-dir=node_modules` 只剩标了「当时的记录」或明写禁令的行 |
| 2 | 七份角色提示词都指向 `docs/design/prd.md` 和 `docs/design/tasks.md` | `node tools/verify-mount.mjs` 全绿（它按路径钉住了这一条） |
| 3 | 收尾搬运步骤在 `roles/pm.md`、`principles.md`、`CLAUDE.md`、两份 README 里都是**七个**目的地 | 读这五处；`grep -rn 'seven' roles/pm.md principles.md CLAUDE.md` |
| 4 | 原则 20 的对照规则在两个方向上都跑过，结果写在原则里 | 读 `principles.md` 原则 20 的「matching rule」一节 |
| 5 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿 | 两条命令直接跑 |

- **第 3 条在交付时是红的**：搬运目的地进了原则和 `CLAUDE.md`，**没有进 `roles/pm.md`**
  ——唯一会执行它的那份文件。这是迟到的代码评审和文档评审同时抓到的，由 T-33 修。
  **这一条留在这里不删**：它证明了这节 DoD 如果当初存在，交付时就会拦住这个任务。

## T-30 — 重建这份任务表（**本文件**）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`docs/design/tasks.md`（只有它，只新建）
- **提交**：无（写下时未提交；提交由 PM 做）
- **DoD（由 PM 事后补写，2026-08-21）**：任务是通过简报下的，而「简报不是文档」，所以
  当时确实没有一节 DoD。但这份文件自己声明的东西已经是可核对的，只是没挂上「DoD」这个
  名字——现在挂上：（1）三个数字 48 / 7 / 20 与下面两条命令的输出一致；（2）四个 CRD
  指针每一个都说明了「现在能不能解析」；（3）凡是没有来源的条目都标 `已丢失`，全文不含
  任何无出处的检查。原始文字：上面「恢复到了什么程度」那张表的
  三个数字（48 / 7 / 20）可以用下面的命令逐条复核；四个 CRD 指针的可解性见下一节。

```sh
# 42 个用例覆盖了哪些编号（应当是 46 个不同编号）
grep -ho -E 'acceptance checks? [0-9, and]+' docs/qa/*/case-*.mjs | grep -o -E '[0-9]+' | sort -n -u
# gaps.md 提到哪些编号（应当是 15 个）
grep -o -E '检查 [0-9、]+' docs/qa/gaps.md | grep -o -E '[0-9]+' | sort -n -u
```

---

## T-31 — 原则 20：一条规则、一张表、全部理由（**本文件写下时尚未存在，PM 事后补**）

- **Verdicts**：code: not run — PM 用自己的核验（读 diff、在静止的树上跑 `npm test` 和 `run-all.sh`）顶替了这道关 ｜ security: not run — PM 没有判断这些改动是否触发安全评审的条件，直接跳过了 ｜ qa: not run — PM 没有为这个任务开 QA，改动的验证只靠 PM 自己跑测试 ｜ doc: not run — 同 code，PM 直接跳过了（后半段整体由一轮**迟到的**代码评审和文档评审覆盖，两者都是 `changes needed`，修复见 T-32、T-33、T-34）

- **拥有的文件**：`principles.md`、`CLAUDE.md`、`README.md`、`README-zh.md`、`CHANGELOG.md`
- **提交**：`8f2339d`
- **相关决定**：`CRD 0010` 的两条「追加」（流程与理由都要进原则；工作流和文档流是同一张表
  的不同列，不许写成两张）
- **DoD（由 PM 事后补写，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `principles.md` 有新原则 20，格式和现有条目一致，编号用的是下一个空号，没有重编任何现有原则 | `grep -n '^## 2[01]\.' principles.md`；读原则 19 与 20 的相邻处 |
| 2 | 原则 20 同时装三样：用户那条规则、**一张**表（工作流与文档流是列，不是两张表）、以及全部理由 | 读它；表头必须含 `Who does it` 和 `Survives the job?` 两列 |
| 3 | 表里每一步**带名字**，不只带编号 | 读表；`grep -c 'Step [0-9]*, \*\*' principles.md` |
| 4 | 理由用量出来的数字，不用形容词：75 / 48 / 7 / 20、四个失效的 CRD 指针、**22**（不是 25）个提交 | 读那几段；数字要和 `docs/design/tasks.md` 的「恢复到了什么程度」对得上 |
| 5 | 那条「对照规则」自己被跑过一遍，两个方向，结果写进原则 | 读那一节 |
| 6 | `dod.md` 在这五个文件里只以**禁令**或**当时的记录**出现 | `grep -rn 'dod\.md' principles.md CLAUDE.md README.md README-zh.md CHANGELOG.md` |
| 7 | 两份 README 标题逐一对应，语言切换行不动 | 列两份的标题；`sed -n 3p README.md README-zh.md` |
| 8 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿 | 两条命令直接跑 |

- **第 5 条在交付时只做到一半**：它跑了对照规则并记下两处，而迟到的文档评审又跑了一遍，
  **另外找到三处**（`CLAUDE.md` 没有产出它的步骤、研究员的答案没有家、发布差距清单只活在
  一条消息里）。由 T-34 修。**同一条检查、同一张表，第二个人跑就多找出三处——这件事本身
  留在这里。**

## T-32 — 钉住 `CRD 0009` 和收尾门，并把重复的启动日志助手抽成一份

- **Verdicts**：code: changes needed（本轮迟到的代码评审，7 条 blocking，修复见 T-37）｜ security: skipped — 只改检查脚本，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（T-35 证到 42/42） ｜ doc: skipped — `tools/` 不是本轮文档评审的范围，由代码评审覆盖

- **拥有的文件**：`tools/verify-mount.mjs`、`tools/verify-preset-install.mjs`、`tools/lib/boot-log.mjs`（新建）
- **提交**：无（本文件写下时未提交）
- **相关决定**：`CRD 0009`（QA 用例进 `npm test`，CI 每次推送都跑）
- **DoD（由 PM 事后补写，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `package.json` 的 `scripts.test` 会跑 QA 用例这件事有钉子 | 在副本里删掉 `&& bash docs/qa/run-all.sh`，`node tools/verify-mount.mjs` 变红 |
| 2 | `.github/workflows/test.yml` 存在、且设了 `fetch-depth: 0`，两件事都有钉子 | 在副本里删掉该文件，再把 `0` 改成 `1`，两次都变红 |
| 3 | 收尾那道门的句子有钉子 | 在副本里删掉 `A task is finished when code review passes`，变红 |
| 4 | 两份检查里重复的启动日志助手只剩一份 | `grep -c 'function logCapture' tools/*.mjs tools/lib/*.mjs`——只在 `lib` 里命中 |
| 5 | `DSH_HOME` 在 `finally` 里恢复 | 读 `tools/verify-preset-install.mjs`；跑前跑后比对该变量 |
| 6 | 三处 `failures === 0` 改成局部计数，一个 `ok` 不会因为别处的失败而不打印 | 在副本里弄坏一个无关检查，那三行 `ok` 仍要打印 |
| 7 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿 | 两条命令直接跑 |

- **交付时第 2 条只做到一半**：那个钉子**说了它没检查的话**——`ok` 行写着「runs npm test
  on a push」，而它既不查 `on: push` 也不查 `run: npm test`；`fetch-depth: 0` 又是拿整个
  文件当一个字符串匹配，所以一行注释就能满足它。迟到的代码评审 finding 6 抓到，由 T-37 修。
- **第 1、2、3、6 条在交付时没有任何用例会在它们被删掉时变红**：这是代码评审点名的清单，
  也就是说这个任务加的唯一「行为」，它自己被删掉是看不见的。QA 用例待补。
  **留在这里不删：钉子本身也需要被钉。**

## T-33 — 第 18 步 Git 那一格：说真实发生的事

- **Verdicts**：code: changes needed（本轮，findings 1/2/3/8 落在同一个文件的别处，修复见 T-38）｜ security: skipped — 只改提示词文字，不碰命令、密钥或文件路径 ｜ qa: pass（`case-04` 绿，T-35 的 42/42 覆盖） ｜ doc: skipped — `roles/*.md` 不是本轮文档评审的范围

- **拥有的文件**：`roles/pm.md`（第 18 步 **Git** 那一格）
- **提交**：无（本文件写下时未提交）
- **DoD（由 PM 事后补写，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | 第 18 步 Git 那一格要求 PM 说清真实发生的事：合并了什么、推了什么、删了什么；什么都没推就照实说 | 读 `roles/pm.md` 第 18 步 |
| 2 | `docs/qa/T-01/case-04-step-18-finish-summary.mjs` 保持绿 | `node docs/qa/T-01/case-04-step-18-finish-summary.mjs` |
| 3 | 该用例仍然断言那句旧话**缺席**——不许为了让替代文字通过而放宽用例 | 读该用例的断言 |

- **记在这里**：文档评审自己给出的替代文字**会让 `case-04` 回归**——它把用例断言必须缺席的
  那句话放了回去。T-33 抓到了，改的是措辞，不是用例。代码评审复核后确认它判对了（新措辞
  以句号结尾，老句子仍然缺席）。**评审给的替代文字不是免检的。**

## T-34 — 文档侧：三道检查、CRD 触发条件、两个 gap list、原则 20 的三处不齐

- **Verdicts**：code: skipped — 这五份是说明文字，本轮由文档评审覆盖 ｜ security: skipped — 同上 ｜ qa: pass（改前改后两次 `npm test` 数字一致，证明没碰到任何钉子） ｜ doc: changes needed（本轮，修复见 T-39）

- **拥有的文件**：`principles.md`、`CLAUDE.md`、`README.md`、`README-zh.md`、`CHANGELOG.md`
- **提交**：无（本文件写下时未提交）
- **DoD（由 PM 事后补写，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | 两份 README 都说三道检查**同时开始**，不再说「按顺序」 | 读两份 README 的第 8 项 |
| 2 | CRD 的触发条件说「一条 DoD 项」，不说「一条验收检查」 | `grep -n '验收检查\|acceptance check' CHANGELOG.md principles.md` |
| 3 | 两个都叫 gap list 的东西按名字和路径分开 | `grep -rn 'docs/release/.*-gaps\.md\|docs/qa/gaps\.md'` 五份文件都一致 |
| 4 | 原则 20 的「对照规则」两个方向都自己跑过，结果写在原则里 | 读原则 20 那一节 |
| 5 | 两份 README 标题与编号列表逐项对应 | 列两份的标题；逐项比对「一次作业怎么跑」 |
| 6 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿，且改前改后数字一致 | 两条命令跑两次 |

- **它自己更正了评审文字里的两处错，记在这里**：（1）评审写「Yes, both」，但那一行在另一条
  finding 之后已经产出**三**样东西，照抄会造成新的数错；（2）它先写了一条 gap list 改名的
  `CHANGELOG` 条目，查过 `git show v0.6.0:README.md` 之后删掉——0.6.0 根本没有 gap list，
  用户看不到任何改变。**两处都是评审文字本身的问题，不是执行的问题。**

## T-35 — `tempRepo()` 必须复制 `.github`

- **Verdicts**：code: changes needed（本轮代码评审复核并同意了它报的那个洞，修法见 T-37）｜ security: skipped — 只改测试辅助代码的复制清单 ｜ qa: pass（自证 42/42，两个 runner 各跑两次） ｜ doc: skipped — 不是本轮文档评审的范围

- **拥有的文件**：`docs/qa/lib/qa.mjs`
- **提交**：无（本文件写下时未提交）
- **DoD（由 PM 事后补写，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `npm test` 与 `bash docs/qa/run-all.sh` 都 exit 0，42 个用例全过 | 两条命令各跑两次 |
| 2 | 在完整副本里删掉 `.github/workflows/test.yml`，`case-11` 变红 | mutation，红了再恢复 |
| 3 | 把 `fetch-depth: 0` 改成 `1`，`case-11` 变红 | 同上 |
| 4 | 不改任何用例的断言 | `git diff --stat` 只动 `docs/qa/lib/qa.mjs` |
| 5 | 不读不写真实的 `~/.dsh` | 跑前跑后列出全部条目比对 |
| 6 | 跑完 `/tmp` 不留 `crew-qa-repo-*`、`crew-home-*`、`crew-mount-home-*` | 跑后 `ls /tmp` |

- **它拒绝了捷径，记在这里**：本来只要让钉子「在看起来像部分副本时跳过」就能立刻变绿。它
  没做，理由是那会让 `tools/verify-mount.mjs` 依赖 QA 的目录结构，以后 `docs/qa/run-all.sh`
  一搬，钉子就会在**真实仓库里静默跳过**。代码评审复核后同意，并指出那种「宽容」形式只有
  「文件不在就跳过」一种写法，而这正是 `CLAUDE.md` 明令禁止的静默跳过。
  **「让红消失」和「让检查成立」是两件事。**
- **顺带证明**：改之前这两个用例对工作流是**瞎的**——好世界和坏世界里副本都没有那个文件。
  所以这次改动是**加了一道检查**，不只是把红转绿。

## T-36 — 发布差距清单变成文件，Verdicts 变成「行」，文档评审要报 scope

- **Verdicts**：code: changes needed（本轮 findings 2/3/11 恰好落在它刚改过的地方，修复见 T-38）｜ security: skipped — 只改提示词文字 ｜ qa: pass（改前改后数字一致，只有三处字数变化） ｜ doc: skipped — `roles/*.md` 不是本轮文档评审范围；它改的 `docs/design/tasks.md` 那条说明有 finding 3，由 PM 修

- **拥有的文件**：`roles/pm.md`、`roles/doc-reviewer.md`、`docs/design/tasks.md`
- **提交**：无（本文件写下时未提交）
- **DoD（由 PM 事后补写，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | 不发布的里程碑产出的是**文件** `docs/release/<milestone>-gaps.md`，不是评审里的一段话；下一个里程碑改同一个文件 | 读 `roles/pm.md` 第 13 步；`grep -n 'gap list' roles/pm.md` 没有「一段话」的说法 |
| 2 | Verdicts 的形状在 `roles/pm.md` 和 `docs/design/tasks.md` 里一致，且四个值、顺序、用词和 `not run` 规则一字不动 | `grep -niE '\bcolumn\b\|\bcells?\b' roles/pm.md` 为空；比对四个值 |
| 3 | 文档评审的报告必须以一行 `scope:` 开头，说清这一轮到底读了什么 | 读 `roles/doc-reviewer.md` 的报告格式 |
| 4 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿 | 两条命令直接跑 |

- **它判对了一件 PM 没想到的事**：`docs/release/` **不必**进收尾的搬运清单——那七个去处是给
  **单次**文档的持久部分，而发布差距清单是第 13 步直接写进仓库的，没有东西要搬。它 flag 了
  但没有自己改。代码评审复核后同意。**"发现一个洞"和"那是个洞"是两件事，它把判断交回来了。**
- **它还发现 `CRD 0011` 前后矛盾**：三处写「列」，一处写「行」。由 PM 修。

## T-37 / T-38 / T-39 — 修这一轮两份评审的 blocking（已交工，本批评审结果未回）

- **Verdicts**：code: changes needed（本批代码评审：2 条 blocking、10 条 optional，修复见 T-48） ｜ security: not run — PM 判断这一批只改检查脚本、提示词和文档，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（67 个用例全绿，`npm test` exit 0、696 个 ok） ｜ doc: changes needed（本批文档评审：17 条 blocking、12 条 optional，修复见 T-49 和 PM 自己改的 `tasks.md`／CRD／新 ADR 0008）（三个任务都交工了。**原来这一行写的是「本文件写下时三个任务都还在跑」，那已经是假话**——文档评审第 12 条抓到的：门在一个不再成立的理由上通过了，而这正是它存在要抓的那种事。）

- **拥有的文件**：T-37 → `tools/verify-mount.mjs`、`tools/verify-preset-install.mjs`、
  `tools/lib/boot-log.mjs`；T-38 → `roles/pm.md`、`roles/doc-reviewer.md`、`roles/qa.md`；
  T-39 → `principles.md`、`CLAUDE.md`、`README.md`、`README-zh.md`、`CHANGELOG.md`
- **提交**：无
- **要求来源**：本轮代码评审的 7 条 blocking + 5 条 optional，本轮文档评审的 10 条
  blocking + 5 条 optional。逐条的替代文字都在各自的简报里。
- **DoD（PM 写，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | 每一条 blocking 要么被修，要么被明确驳回并写下理由；没有一条被默默跳过 | 逐条对照两份评审报告 |
| 2 | 第 14 步在 `roles/pm.md` 里也产出 `CHANGELOG.md` 和 `CLAUDE.md`，不只 README | 读 `roles/pm.md` 第 14 步 |
| 3 | 工作流那个钉子会在 `on: push` 或 `run: npm test` 被改掉时变红，且一行注释满足不了它 | 四种 mutation 各自变红 |
| 4 | `CRD 0010` 那个钉子覆盖到 `code-reviewer.md` 和 `security-reviewer.md` | 在副本里把旧措辞放回这两个文件，变红 |
| 5 | `CHANGELOG.md` 的 0.7.0 不带发布日期（`git tag --list 'v0.7*'` 为空） | 跑那条命令；读 `CHANGELOG.md` 第 9 行 |
| 6 | 数字都是自己数过的：CRD 十一份、29 个任务小节、42 个用例 | `ls docs/decisions/crd/*.md \| wc -l` 等 |
| 7 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿 | 两条命令直接跑 |

- **这一节是在简报发出**之后**写的，不是之前。** 规则要求 PM 在开工前写 DoD，这三个任务是
  简报里带着验收条件出去的，DoD 一节晚了一步。**同一个毛病又犯了一次，写在这里不删**：它比
  上一次轻（条件确实写下来了，只是没进仓库），但轻不等于没有——「简报不是文档」这条规则
  就是为了这个。

## T-40 — `tools/verify-tasks.mjs`：Verdicts 这道门（`CRD 0011`）

- **Verdicts**：code: changes needed（本批代码评审：2 条 blocking、10 条 optional，修复见 T-48） ｜ security: not run — PM 判断这一批只改检查脚本、提示词和文档，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（67 个用例全绿，`npm test` exit 0、696 个 ok） ｜ doc: changes needed（本批文档评审：17 条 blocking、12 条 optional，修复见 T-49 和 PM 自己改的 `tasks.md`／CRD／新 ADR 0008）（T-37..T-45）的代码评审还没开，PM 不许在开之前写 pass ｜ security: not run — 同上 ｜ qa: not run — 本批的 QA 用例在 T-42 里，还在跑 ｜ doc: not run — 本批的文档评审还没开（门已上线并且是绿的：**交工那天 2026-08-21** 是 41 个小节、136 个 `not run`、10 个 `skipped`；写下这一行之后又加了几个小节，所以这三个数是快照，不是现值。它自己交工时是**红**的，红的正是两条缺失的 Verdicts 行——门上线第一天就抓到了真东西。）

- **拥有的文件**：`tools/verify-tasks.mjs`（新建）、`package.json` 的 `scripts.test`
- **要求来源**：`CRD 0011`。判红规则是用户 2026-08-21 定的（选项 **B**：门管的是「诚实和
  可见」，不是「必须跑」）。
- **DoD（PM 写，2026-08-21，在简报发出之前）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | 只认标题形如 `## T-<数字>` 的小节；`## T-23 / T-24` 这种一个标题两个任务号的算**一个**小节 | 在副本里给附录小节（`## Verdicts 这一行怎么读`）加一条假的 Verdicts 行，检查结果**不变**；再给它加一个 `## T-99` 标题但不给 Verdicts 行，变红 |
| 2 | 任务小节没有 Verdicts 行 → 红，且**打出任务号** | 在副本里删掉一条，变红，且输出里有那个任务号 |
| 3 | 四个值（`code` / `security` / `qa` / `doc`）缺任何一个 → 红 | 在副本里删掉某行的 `security:` 那一段，变红 |
| 4 | 某个值是 `not run` 或 `skipped`，后面没有 ` — ` 加**实际文字** → 红 | 在副本里把一个 `not run — <理由>` 改回裸 `not run`，变红；改成 `not run — `（破折号后空着），也要红 |
| 5 | `changes needed` 后面没有点名 `T-<数字>` → 红 | 在副本里把 `changes needed（本轮，修复见 T-38）` 改成 `changes needed（本轮）`，变红 |
| 6 | 大声打出 `not run` 和 `skipped` 的**总数**——通过不等于干净 | 读真实输出。**PM 在这里写过 120，是错的**：T-40 独立用 grep 数出 **124**（29 行四值全 `not run` = 116，加 T-01 一个、T-05 一个、T-06 三个、T-07 三个）。补上那两条缺失的行之后是 **132**。一个 DoD 里写错的数字，是让执行的人去怀疑自己的正确工具 |
| 7 | 只看 Verdicts 行，不看散文 | 这份文件的散文里有 5 处 `` `not run` `` 和 11 处 `skipped`（规则说明、DoD 表格、引用的收尾门句子）。真实仓库上跑必须**绿** |
| 8 | 挂进 `package.json` 的 `scripts.test`，用 `&&` 追加 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿，跑两次；且 T-37 那个「`\|\| true` 中和」钉子仍然绿——它证明过 `&&` 追加是安全的 |

- **不许做的事**：不许为了让今天变绿而放宽规则。真实文件此刻是干净的（PM 刚给 32 行逐值
  补完理由），所以这个检查**上线第一天就该是绿的**。如果它红了，先怀疑检查，再怀疑文件。
- **它证明什么、不证明什么**（`CRD 0011` 已写，这里再说一次，因为写检查的人最容易忘）：
  它能证明**这一行被写下来了、每次跳过都留了一句话**。它**不能**证明评审真的跑过——PM 直接
  写 `code: pass` 它照样绿。这个洞没有任何自动检查能补。

## T-41 — 钉住 `publish.yml`：发布前必须跑过测试

- **Verdicts**：code: changes needed（本批代码评审：2 条 blocking、10 条 optional，修复见 T-48） ｜ security: not run — PM 判断这一批只改检查脚本、提示词和文档，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（67 个用例全绿，`npm test` exit 0、696 个 ok） ｜ doc: changes needed（本批文档评审：17 条 blocking、12 条 optional，修复见 T-49 和 PM 自己改的 `tasks.md`／CRD／新 ADR 0008）（T-37..T-45）的代码评审还没开，PM 不许在开之前写 pass ｜ security: not run — 同上 ｜ qa: not run — 本批的 QA 用例在 T-42 里，还在跑 ｜ doc: not run — 本批的文档评审还没开（14 个 mutation 全红、7 种合法改写全绿。改之前那 9 个坏文件全部 exit 0，输出里连 `publish.yml` 都没提过。）

- **拥有的文件**：`tools/verify-mount.mjs`
- **要求来源**：T-37 的报告。它发现 `.github/workflows/publish.yml` **一个钉子都没有**——
  没有任何检查确认发布工作流在 `npm publish` 之前还跑 `npm test`。而这个仓库唯一不可撤销的
  动作就是 `v*` tag 触发的那次发布。`CRD 0009` 钉住了推送 CI,漏了发布 CI。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `publish.yml` 缺失时变红 | 在副本里删掉该文件，`node tools/verify-mount.mjs` exit 1 |
| 2 | `npm test` 那一步被删掉时变红 | 在副本里删掉 `run: npm test` 那一行，变红 |
| 3 | `npm test` 排在 `npm publish` **之前**这件事被钉住，不只是「两行都在」 | 在副本里把两步对调，变红 |
| 4 | 一行注释满足不了它（跟 T-37 的 `test.yml` 钉子同一种洞） | 在副本里把真步骤删掉、只留一行注释 `# run: npm test`，变红 |
| 5 | 合法改写不会误红 | `run: \|` 块形式、`npm test --silent`、两步之间多插一步，三种都要保持绿 |
| 6 | tag 触发（`tags: ["v*"]`）被钉住 | 在副本里改成 `on: push` 无 tag 过滤，变红 |
| 7 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿，跑两次 | 两条命令 |

## T-42 — 补上那些「被删掉也看不见」的钉子的用例

- **Verdicts**：code: changes needed（本批代码评审：2 条 blocking、10 条 optional，修复见 T-48） ｜ security: not run — PM 判断这一批只改检查脚本、提示词和文档，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（67 个用例全绿，`npm test` exit 0、696 个 ok） ｜ doc: changes needed（本批文档评审：17 条 blocking、12 条 optional，修复见 T-49 和 PM 自己改的 `tasks.md`／CRD／新 ADR 0008）（25 个用例，42 → 67。它一次没动 `tools/`，靠克隆并在克隆里「卸掉」钉子来证明每个用例都能变红。）

- **拥有的文件**：`docs/qa/T-42/case-01` 到 `case-25`（25 个新用例）、`docs/qa/T-42/run.sh`、
  `docs/qa/lib/qa.mjs`（`tempRepo()` 的复制清单加 `docs/design/tasks.md`）、`docs/qa/gaps.md`
- **要求来源**：本轮代码评审点名的清单——「这轮改动里，哪些一旦被改回去没有任何检查会发现」。
  T-37 已经用 mutation 证明了每个钉子成立，但 **mutation 是一次性的,用例才留下来**。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `scripts.test` 里的 QA 用例那一段被删掉时，有用例变红 | 跑那个新用例 |
| 2 | `.github/workflows/test.yml` 的四种破坏各有用例（缺失、非 push 触发、不跑 `npm test`、`fetch-depth` 非 0） | 跑那些用例 |
| 3 | `publish.yml` 的破坏有用例（T-41 落地之后） | 跑那个用例 |
| 4 | 三处局部计数器有用例：**必须从外面验**——弄坏一个无关检查，断言后面那三行 `ok` 仍然打印 | 跑那个用例。T-37 说清了为什么 `verify-mount.mjs` 自己验不了：它只能钉住自己的源码文本，那证明的是字符串，不是行为 |
| 5 | 收尾那道门的句子、`scope:` 那一行，各有用例 | 跑那些用例 |
| 5b | **T-44 的钉子**有用例（它点名要三条）：把 `publish.yml` 改名 → 仍绿；新增一个 `on: push` + `npm publish` 的工作流 → 红且点名它；只有注释 `# run: npm publish` 的工作流 → 绿 | 跑那三条 |
| 5c | **T-40 那道门**有用例：缺 Verdicts 行、缺值、裸 `not run`、破折号后空着、`changes needed` 不点名任务号，各一条；附录小节里的假 Verdicts 行必须被忽略 | 跑那些用例。T-40 的 `t40-cases.sh` 已经是这个形状，可以直接抬 |
| 5d | 三个洞进 `docs/qa/gaps.md`，写清为什么没有用例能盖：(1) 门认不出的判定词（`code: maybe` 照样绿，因为没有封闭词表）；(2) 钉子只认 `npm publish`，认不出 `pnpm publish`、`semantic-release`、`release-please`、`gh release create`；(3) `workflow_dispatch:` 配 tag-only push，人可以手动从任何分支发布，钉子和 guard 都不响 | 读 `docs/qa/gaps.md` |
| 6 | 每个新用例都自证：先弄坏、看它红、再恢复，输出贴进报告 | 读报告 |
| 7 | 不改任何现有用例的断言；`bash docs/qa/run-all.sh` 全绿 | `git diff` 加上跑命令 |

## T-45 — `npm test` 多了第六道检查，用户看得见

- **Verdicts**：code: changes needed（本批代码评审：2 条 blocking、10 条 optional，修复见 T-48） ｜ security: not run — PM 判断这一批只改检查脚本、提示词和文档，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（67 个用例全绿，`npm test` exit 0、696 个 ok） ｜ doc: changes needed（本批文档评审：17 条 blocking、12 条 optional，修复见 T-49 和 PM 自己改的 `tasks.md`／CRD／新 ADR 0008）（T-37..T-45）的代码评审还没开，PM 不许在开之前写 pass ｜ security: not run — 同上 ｜ qa: not run — 本批的 QA 用例在 T-42 里，还在跑 ｜ doc: not run — 本批的文档评审还没开（它更正了 PM 两处：这是第**六**道检查不是第五道；并删掉自己写的一句会让用户误解成「他自己的 npm test」的话。它还抓到 `scripts.test` 那个钉子没跟着扩——`CRD 0011` 点名过，PM 发简报时丢了。）

- **拥有的文件**：`CLAUDE.md`、`README.md`、`README-zh.md`、`CHANGELOG.md`、`roles/pm.md`
- **要求来源**：`CRD 0011` 的「它动到什么」表；T-40 交工时点名了同一批文件。
- **为什么**：`CLAUDE.md` 现在写着 `npm test` 是「the four checks and then QA's cases」，
  而它已经是**六道**检查。用户跑 `npm test` 会看到一个文档里不存在的东西。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `CLAUDE.md` 的命令表和那句「four checks」都改对，并列出 `node tools/verify-tasks.mjs` | 读那一节；`grep -n 'four checks' CLAUDE.md` 为空 |
| 2 | 两份 README 都说这道门存在、它判什么红、以及**它证明不了什么** | 读两份；逐项对应 |
| 3 | `CHANGELOG.md` 未发布的 0.7.0 段落有一条条目：用户会看到 `npm test` 多一道检查 | 读那一段；不许给它加发布日期（0.7.0 未发布，`git tag --list 'v0.7*'` 为空） |
| 4 | `roles/pm.md` 第 11 步说这道门存在，以及它证明不了什么 | 读第 11 步 |
| 5 | 「它证明不了什么」这句话在四处的说法一致：门能证明**这一行被写下来了、每次跳过都留了一句话**；它**不能**证明评审跑过 | 四处并排读 |
| 6 | 不许声称门检查了它没检查的东西（T-37 的教训 3） | 逐句对照 `node tools/verify-tasks.mjs` 的真实输出 |
| 7 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿，改前改后数字一致 | 两条命令跑两次 |

## T-43 — 补 T-41 自己报的两个洞：`branches:` 与一行式 `- run:`

- **Verdicts**：code: changes needed（本批代码评审：2 条 blocking、10 条 optional，修复见 T-48） ｜ security: not run — PM 判断这一批只改检查脚本、提示词和文档，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（67 个用例全绿，`npm test` exit 0、696 个 ok） ｜ doc: changes needed（本批文档评审：17 条 blocking、12 条 optional，修复见 T-49 和 PM 自己改的 `tasks.md`／CRD／新 ADR 0008）（T-37..T-45）的代码评审还没开，PM 不许在开之前写 pass ｜ security: not run — 同上 ｜ qa: not run — 本批的 QA 用例在 T-42 里，还在跑 ｜ doc: not run — 本批的文档评审还没开（T-37、T-41 的全部 mutation 重跑后行为不变。它自己又找出第三个假绿：旧 tag 检查搜整个文件，一个无关 `with:` 块里的 `tags:` 就能满足它。）

- **拥有的文件**：`tools/verify-mount.mjs`
- **要求来源**：T-41 的报告，「它不证明什么」第 2 和第 5 条。两条都是它自己找出来、并且
  明确说「不在 DoD 里所以我不加」的——判断对，洞要补。
- **为什么第 2 条重要**：`on: push` 同时带 `tags: ["v*"]` 和 `branches: [main]` 时，T-41 的
  钉子保持绿，而**每一次推 `main` 都会发布**。更重要的是 `host/git-guard.js` 的
  `branchPushTriggers()` 就是靠「本仓库的 publish.yml 是 tag-only」这个前提，才敢放行普通
  分支推送。所以这个洞不只是少一道检查——它会让 guard 在一个它以为安全的仓库里放行发布。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `publish.yml` 的触发器里出现 `branches:` 时变红 | 在副本里给 `on: push` 加上 `branches: [main]`（`tags` 保留），`node tools/verify-mount.mjs` exit 1 |
| 2 | 一行注释 `# branches: [main]` 不会误红 | 在副本里加那行注释，保持绿 |
| 3 | `ok` 行的说法跟检查的东西一致——现在可以说 tag-only，不能只说 tag-filtered | 读那一行；它不许声称检查没做的事（T-37 的教训 3） |
| 4 | 一行式 `- run: npm test` 不再误红；两个工作流钉子都改 | 在副本里把 `publish.yml` 和 `test.yml` 的那一步都写成一行式，两个都保持绿 |
| 5 | 改完之后 T-37 和 T-41 的**全部** mutation 仍然红 | 重跑它们报告里的每一个 mutation |
| 6 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿，跑两次 | 两条命令 |

## T-44 — 钉子要扫整个 `.github/workflows/`，不能只认 `publish.yml` 这个名字

- **Verdicts**：code: changes needed（本批代码评审：2 条 blocking、10 条 optional，修复见 T-48） ｜ security: not run — PM 判断这一批只改检查脚本、提示词和文档，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（67 个用例全绿，`npm test` exit 0、696 个 ok） ｜ doc: changes needed（本批文档评审：17 条 blocking、12 条 optional，修复见 T-49 和 PM 自己改的 `tasks.md`／CRD／新 ADR 0008）（T-37..T-45）的代码评审还没开，PM 不许在开之前写 pass ｜ security: not run — 同上 ｜ qa: not run — 本批的 QA 用例在 T-42 里，还在跑 ｜ doc: not run — 本批的文档评审还没开（钉子现在读文件夹不认名字。九个 mutation 里四个证明改之前是假绿或假红。它拒绝扩宽发布词汇表，理由是会在正确文件上误红——需要先做一个决定。）

- **拥有的文件**：`tools/verify-mount.mjs`
- **要求来源**：T-43 的报告，「Noticed, not touched」第 1 条。它自己找出来、并且明确说
  「这是新范围，不在我的 DoD 里」——判断对，洞要补。
- **为什么重要**：`host/git-guard.js` 的 `branchPushTriggers()` 扫的是**每一个**
  `.github/workflows/*.yml`，找会发布的工作流。而 T-41/T-43 的钉子按**名字**读
  `publish.yml`。加一个 `release.yml`，里面 `npm publish` 配 `on: push`——钉子保持绿，而
  仓库真的会在每次分支推送时发布。guard 自己会拦住那次推送（安全方向），所以这是钉子的洞，
  不是 guard 的洞；但钉子的活就是让这种文件根本进不来。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | 钉子扫 `.github/workflows/` 下**每一个** `.yml` / `.yaml`，不按名字认 | 在副本里把 `publish.yml` 改名成 `release.yml`，仍然绿（同一个文件，只是名字变了） |
| 2 | 任何一个会发布的工作流（含 `npm publish`）不是 tag-only 时变红，并**点名那个文件** | 在副本里新增 `release.yml`：`on: push` 无过滤 + `npm publish`，变红，且输出里有 `release.yml` |
| 3 | 一个不发布的工作流不会被误判 | `test.yml` 不含 `npm publish`，必须不被当成发布工作流；再在副本里加一个只跑 lint 的工作流，保持绿 |
| 4 | 注释掉的 `npm publish` 不算发布工作流 | 在副本里加一个只有 `# run: npm publish` 的工作流，保持绿 |
| 5 | 一个仓库里有**两个**合法的 tag-only 发布工作流时不误红 | 在副本里复制 `publish.yml` 成 `publish-2.yml`，保持绿 |
| 6 | T-37、T-41、T-43 的**全部** mutation 行为不变 | 重跑 `t41/` 下的 `m*`、`r*`、`t43-*`（13 个 m、6 个 r、19 个 t43-），每个 `m*`/该红的红，每个 `r*`/该绿的绿 |
| 7 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿，跑两次 | 两条命令 |

- **诚实的边界**：这个任务只管「钉子看不看得见那个文件」。T-43 报的另一条——
  `workflow_dispatch:` 配 tag-only push，人可以手动从任何分支发布，钉子和 guard 都不响——
  **不在这个任务里**。要不要管它是另一个决定，不许顺手改掉。

## T-46 — 两个钉子自己的毛病：失效的 `false` 豁免，和没跟着扩的 `scripts.test`

- **Verdicts**：code: changes needed（本批代码评审：2 条 blocking、10 条 optional，修复见 T-48） ｜ security: not run — PM 判断这一批只改检查脚本、提示词和文档，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（67 个用例全绿，`npm test` exit 0、696 个 ok） ｜ doc: changes needed（本批文档评审：17 条 blocking、12 条 optional，修复见 T-49 和 PM 自己改的 `tasks.md`／CRD／新 ADR 0008）（它拒绝用前瞻修那个前瞻 bug：教训是「否定前瞻放在变长匹配后面不受锚定」。48 次回归重跑退出码全部一致，两份日志的 diff 只有它故意扩写的那一条错误信息。）

- **拥有的文件**：`tools/verify-mount.mjs`
- **要求来源**：T-42 的缺陷报告（`inbox/Q-45.md`）和 T-45 的「需要别人的文件」第 1 条。
- **两件事，都是钉子自己的毛病**：

  1. **失效的豁免**（T-42 找到，`tools/verify-mount.mjs:239`）：
     `/^[ \t]*continue-on-error:[ \t]*(?!false\b)/m` —— `[ \t]*` 会回溯到零宽，于是否定
     前瞻在空格位置被测试，**永远成立**。所以 `continue-on-error: false`（显式写出默认值，
     很多团队要求这么写）被误判成红。那个 `false` 豁免从来没生效过。
  2. **没跟着扩的钉子**（T-45 找到，`tools/verify-mount.mjs:50`）：`scripts.test` 的钉子只
     检查 `bash docs/qa/run-all.sh` 那一段。`node tools/verify-tasks.mjs` 明天被删掉，
     **所有检查照绿**。`CRD 0011` 的「它动到什么」表点名过这件事，PM 发简报时丢了——同一个
     模式第三次（`CRD 0010` → `CRD 0011` → 这里）。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `continue-on-error: false` 保持**绿** | 在副本里给 `publish.yml` 的 `npm test` 那一步加上它，`node tools/verify-mount.mjs` exit 0 |
| 2 | `continue-on-error: true` 仍然**红** | 在副本里改成 `true`，变红 |
| 3 | 空格数量、`"false"` 带引号、`False` 大写这几种写法各自的答案都想清楚并写下来 | 读代码注释；每种都跑一遍并在报告里说结果 |
| 4 | `scripts.test` 里 `node tools/verify-tasks.mjs` 被删掉时**变红** | 在副本里删掉那一段，变红 |
| 5 | 第 4 条的钉子也拦得住中和：`node tools/verify-tasks.mjs \|\| true`、`&` 后台、`;` 后面还有东西 | 三种各自变红；单独的行尾 `;` 和 `&&` 追加要保持绿 |
| 6 | T-37、T-41、T-43、T-44 的**全部** mutation，加上 `docs/qa/T-42/` 的 **25 个用例**，行为不变 | 跑 `bash docs/qa/T-42/run.sh` 全绿；重跑 `t41/` 下的 mutation 集 |
| 7 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿，跑两次 | 两条命令 |
| 8 | 第 1 条落地后，`docs/qa/T-42/case-08` 里那条「这里有 bug」的注释要么由 QA 换成真断言，要么留一条明确的移交说明 | 读那个注释。**注意 `docs/qa/` 不是这个任务的文件**——只报，不改 |

## T-47 — `principles.md` 补上 `CRD 0011` 点名的三件事

- **Verdicts**：code: changes needed（本批代码评审：2 条 blocking、10 条 optional，修复见 T-48） ｜ security: not run — PM 判断这一批只改检查脚本、提示词和文档，不碰命令执行、密钥或项目外的文件 ｜ qa: pass（67 个用例全绿，`npm test` exit 0、696 个 ok） ｜ doc: changes needed（本批文档评审：17 条 blocking、12 条 optional，修复见 T-49 和 PM 自己改的 `tasks.md`／CRD／新 ADR 0008）（它抓到的不齐比之前四个都难看见：Verdicts 那一行**没有任何一步产出它**——不是缺文件，是一个已被认领的文件里缺一行。）

- **拥有的文件**：`principles.md`
- **要求来源**：`CRD 0011` 的「它动到什么」表；T-45 的「需要别人的文件」第 2 条点名了它一件都没做。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | 被否掉的 git `pre-push` 钩子进「看过又否掉的想法」表，带上两条真理由：`pre-push` 看不见 tag 推送带的提交（而 tag 推送是这个仓库唯一不可撤销的动作），钩子不跟着 `clone` 走且 `--no-verify` 一句话绕过 | 读那张表；`grep -n 'pre-push' principles.md` |
| 2 | 这道门进原则 20 的表，产出物和它的家都写清 | 读那张表；`grep -n 'verify-tasks' principles.md` |
| 3 | 第 894 行附近那句「门一落地，这段对照规则要在两个方向上重跑」——**门已落地，重跑它**，两个方向的结果写进原则，并把那句「等它落地」换成结论 | 读那一节；它不许再说「等」 |
| 4 | 10a / 10b 那两行说评审报告「不留下来」，而 Verdicts 行现在留下来了并且是 `npm test` 的一道门——改对 | 读那两行 |
| 5 | 数字都自己数过 | `ls docs/decisions/crd/*.md \| wc -l`；`bash docs/qa/run-all.sh` 的用例数；`grep -cE '^## T-' docs/design/tasks.md` |
| 6 | 不许声称这道门证明了它证明不了的东西——说法要和 `CLAUDE.md`、两份 README、`roles/pm.md` 那四处一致 | 五处并排读 |
| 7 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿，改前改后数字一致（没有检查读 `principles.md`） | 两条命令跑两次 |

## T-48 — `case-08` 的注释现在是假话，换成真断言

- **Verdicts**：code: not run — 它是这一轮评审的修复，本身还没过评审 ｜ security: not run — 同上 ｜ qa: pass（自证：67 个用例全绿） ｜ doc: not run — 同 code

- **拥有的文件**：`docs/qa/T-42/case-08-publish-test-gates-publish.mjs`、`docs/qa/gaps.md`
- **要求来源**：T-46 的报告，「item 8」。`Q-45.md` 的选项 A 的最后一步。
- **为什么这条拦提交**：那条注释写着 `continue-on-error: false`「is reported RED today」并引用了
  旧正则。T-46 修完之后，这两句都是**假的**。留着它就是提交一句教下一个读者一个已经不存在的
  bug 的话——比没有注释更糟。而注释自己的最后一句写的就是「Add the assertion in the commit
  that fixes the line」。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | 那条注释删掉或改成真话，不许再声称 `false` 会变红 | 读那几行；`grep -n 'reported RED today' docs/qa/T-42/case-08*.mjs` 为空 |
| 2 | `continue-on-error: false` 保持绿，有断言 | 跑 `case-08` |
| 3 | `False`、`FALSE` 保持绿，有断言 | 同上 |
| 4 | `"false"`（带引号）**变红**，有断言——这是 T-46 刻意选的「有分歧就往红那边错」，钉住它就是防止以后有人「好心」把接受集放宽到任意大小写或带引号 | 同上 |
| 5 | 邻近一步上的 `continue-on-error: false` **不能**豁免测试那一步，有断言 | 同上 |
| 6 | 断言必须能变红：把 `tools/verify-mount.mjs` 退回 T-46 之前的版本（克隆里，不许改真文件），`case-08` 要红 | 贴出红的输出 |
| 7 | `docs/qa/gaps.md` 加一条 T-46 报的限制：两个 `scripts.test` 钉子要求中和符**紧跟**在那一段后面，所以 `bash docs/qa/run-all.sh --quiet \| tee log` 仍然读作绿。要盖住它得读到下一个 `&&`，比这个任务宽 | 读 `gaps.md` |
| 8 | `bash docs/qa/run-all.sh` 全绿，67 个用例不减 | 那条命令，跑两次 |
| 9 | **`case-01` 覆盖 `scripts.test` 钉子的第二段。** 本轮代码评审 finding 2：`case-01` 写死在一个段上，所以 T-46 的第二个修复（`node tools/verify-tasks.mjs` 那一段）一个用例都没有——删掉钉子里那一行，`npm test` 照绿 | 跑 `case-01`；在克隆里删掉 `tools/verify-mount.mjs` 里那一行表格行，`case-01` 要红 |
| 10 | 单个 `\|` 也算中和，有断言。POSIX `sh` 里 `a \| b` 的退出码是 `b` 的，所以 `run-all.sh \| tee log` 真的把 QA 的退出码扔了 | 跑 `case-01`；`&&` 追加必须保持绿 |
| 11 | 两段用**同一张表**驱动，不是两份拷贝——第三道门在钉子那边是一行，在用例这边也要是一行 | 读 `case-01` |

- **第 9 到 11 条是 PM 事后补的，写在这里不删。** 这三条活是 PM 用**消息**追加给这个任务的,
  没有先写进 DoD。T-48 交工时自己指出来:「一个被打分的改动没有验收项,正是一条检查怎么丢掉
  的」——而「简报不是文档」这条规则就是为了这个,消息也是简报。**同一类失败,这次是 PM 犯的,
  被执行的人抓到。**

## T-49 — 文档评审的 blocking：文档侧

- **Verdicts**：code: not run — 它是这一轮评审的修复，本身还没过评审 ｜ security: not run — 同上 ｜ qa: pass（自证：67 个用例全绿） ｜ doc: not run — 同 code

- **拥有的文件**：`CHANGELOG.md`、`CLAUDE.md`、`principles.md`、`README.md`、`README-zh.md`、
  `roles/pm.md`（只改第 560 行那一句）
- **要求来源**：本轮文档评审的 blocking 1、3、4、9、10、11 和 optional 22–26。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `CHANGELOG.md` 那句「`scripts.test` ends with `bash docs/qa/run-all.sh`」和「42 cases」都改对——两半都已经是假的（`package.json` 现在以 `node tools/verify-tasks.mjs` 结尾，用例是 67 个） | `grep -n 'ends with .bash docs/qa' CHANGELOG.md` 为空；读那一条 |
| 2 | `roles/pm.md:560` 的「at the end of `scripts.test`」改成「inside」——`CLAUDE.md` 早就为同一个理由改过，这个文件漏了 | `grep -n 'at the end of .scripts.test' roles/pm.md` 为空 |
| 3 | `principles.md` 里「43 task sections」全部改成真数 | 自己数：`grep -cE '^## T-[0-9]' docs/design/tasks.md`，然后 `grep -n 'task sections' principles.md` 逐处核对 |
| 4 | `CHANGELOG.md` 那段「等」的两种代价改对：现在两条都挂在「等」上，而 `principles.md` 677-682 把第一条挂在「**不**等」上 | 两处并排读 |
| 5 | `CLAUDE.md` 的「Design rules a change must not break」加第 7 条：发布工作流必须 tag-only 且先跑 `npm test`，而且钉子按**内容**读整个 `.github/workflows/`，不按文件名 | 读那一节；`grep -cE '^7\. \*\*' CLAUDE.md` 为 1 |
| 6 | `CHANGELOG.md` 补上 `CRD 0011` **用户看得见的那一半**：从此每个项目的 `docs/design/tasks.md` 里，每个任务小节顶上都会出现一条 Verdicts 行，没有这一行的任务不提交 | 读那一条 |
| 7 | 第 5、6 条不许声称门证明了它证明不了的东西；说法要和现有那六处一致 | 六处并排读。文档评审已经确认那六处目前完全一致，**不许在这次改动里破坏它** |
| 8 | optional 22–26 逐条判断：要么改，要么写下不改的理由 | 读报告里的判断 |
| 9 | 两份 README 逐项对应 | 列标题；逐项比对编号列表 |
| 10 | `npm test` 与 `bash docs/qa/run-all.sh` 全绿；`roles/pm.md` 的字数行会变，其他不许变 | 两条命令跑两次 |

## T-50 — `publish.yml` 也需要完整历史，而那个钉子只钉了 `test.yml`

- **Verdicts**：code: not run — 交工了，本批评审还没开（它是发布被拦之后的紧急修复） ｜ security: not run — PM 判断它只改一个工作流的 checkout 深度和一个检查脚本 ｜ qa: pass（自己用 `git clone --depth 1` 复现了那次 CI 失败，修完再验；697 个 ok、67 个用例全绿） ｜ doc: not run — 同 code（它更正了 PM 写在这一节里的一处事实错误：读 git 的只有 `case-26`，不是三个）

- **拥有的文件**：`.github/workflows/publish.yml`、`tools/verify-mount.mjs`
- **要求来源**：真实的发布失败。2026-08-21 推 `v0.7.0` 之后，`publish.yml` 的运行
  **失败**（run 32437581309），`crew QA: 5 task(s) run, 4 passed, 1 failed — T-01`。
  同一个 tag 上的 `Tests` 工作流**通过**。
- **根因**：`test.yml` 的 checkout 设了 `fetch-depth: 0`，注释里还写明了为什么——
  `docs/qa/T-01/case-26` 读这个仓库自己的提交历史。（**PM 在这里写的是「三个用例」,错了**——
  T-50 查了:`case-01` 和 `case-07` 匹配的是 `roles/pm.md` 里的文本,检查合并步骤有没有把那些
  git 命令写下来,它们自己从不跑 git,在浅克隆上都通过。`test.yml` 自己的注释只点了 `case-26`,
  是对的。）
  `publish.yml` 的 checkout **一个 `with:` 都没有**，所以是深度 1 的浅克隆，而它也跑 `npm test`。
  T-41/T-43/T-44 把 `fetch-depth: 0` 钉在了 `test.yml` 上；**守着唯一不可撤销动作的那个工作流
  既没有这个设置，也没有这个钉子。**
- **值得记下的一件事**：这次失败是**好**的。`publish.yml` 先跑 `npm test` 再 `npm publish`，
  所以它在发布之前就红了——npm 上仍然是 `0.6.0`，什么都没发出去。这正是 T-41 那个「测试必须
  排在发布之前」的钉子存在的理由，而它第一次真正被用到就救了一次发布。
- **DoD（PM 写，在简报发出之前，2026-08-21）**：

| # | 怎么算做完 | 别人怎么验 |
| --- | --- | --- |
| 1 | `publish.yml` 的 checkout 设 `fetch-depth: 0`，并且注释说清为什么（照 `test.yml` 的写法） | 读那个文件 |
| 2 | 钉子改成：**任何**跑 `npm test` 的工作流都必须设 `fetch-depth: 0`，不再只认 `test.yml` | 在副本里把 `publish.yml` 的那一行删掉，`node tools/verify-mount.mjs` 变红并**点名 `publish.yml`** |
| 3 | 一行注释满足不了它（和 T-37 那个洞同一种） | 在副本里把真设置删掉、只留 `# fetch-depth: 0`，变红 |
| 4 | 不跑 `npm test` 的工作流不被要求设它 | 在副本里加一个只跑 lint 的工作流，保持绿 |
| 5 | T-37、T-41、T-43、T-44、T-46 的**全部** mutation 行为不变 | 重跑 `t41/` 下各套；每个该红的红、该绿的绿 |
| 6 | `docs/qa/T-42/` 的 25 个用例全绿；`bash docs/qa/run-all.sh` 5 个任务 67 个用例 | 两条命令 |
| 7 | `npm test` 全绿，跑两次 | 那条命令 |
| 8 | 报告里说清：这个钉子**证明不了**浅克隆下别的东西会不会坏——它只钉那一个设置 | 读报告 |

# 那四个还活着的指针，现在能不能解

| 指针 | 出现在 | 现在解得开吗 |
| --- | --- | --- |
| 「新增任务 T-05 和**验收检查 18-21**」 | `CRD 0001` | **部分**。18、19、20 在 T-05 一节，**原文可读**。**21 只剩主题**：它是一条文档措辞检查（`gaps.md` 第 1 条把 8、9、10、21、47、53 一起列为文档措辞类），并且 `CRD 0001` 记着 T-04 要为 guard 的修复在 `CHANGELOG.md` 多写一条——但**没有任何地方留下检查 21 的原文**，所以这里不写它要求什么 |
| 「验收检查 **44-46**」 | `CRD 0002` | **能，完整**。三条都在 T-06 一节，原文可读 |
| 「验收检查 **33**」 | `CRD 0005` | **能，完整**。在 T-05 一节；而且 `CRD 0005` 自己就逐字引用了它（「用例区段包在 `try` / `finally` 里，`rmSync` 一定会跑」） |
| 「验收检查 **67**」 | `CRD 0006` 修订二、`9ee9263` | **能，完整、逐字**。在 T-16 一节，连它后来被收窄的理由一起 |

---

# 部分恢复的 7 条：编号和主题在，原文丢了

**这里不补写它们要求什么。** 下面只写留下来的那点事实。

| # | 留下来的事实 | 出处 |
| --- | --- | --- |
| 8 | 一条**文档措辞**检查。QA 的计划把它和 9、10、21、47、53 一起跳过，理由是「文档措辞，由 `crew-doc-reviewer` 判，不是 QA 的活」 | `作业文件夹/T-01-plan.md`、`gaps.md` 第 1 条 |
| 9 | 同上 | 同上 |
| 10 | 同上 | 同上 |
| 21 | 同上。另外：`CRD 0001` 把 18-21 一起归给 guard 的修复，而 18、19、20 都是 T-05 的行为检查，所以 21 很可能是那次修复的**文档**那一条——**这是推断，不是记录** | `T-01-plan.md`、`gaps.md` 第 1 条、`CRD 0001` |
| 47 | 同上（文档措辞类）。归属任务**已丢失** | `T-01-plan.md`、`gaps.md` 第 1 条 |
| 53 | 同上，而且**归属已知**：`T-07-plan.md` 写着「检查 53（两份 README）不是我的，是 doc-reviewer 的」，所以它是关于两份 README 的，属于 T-08 那一批文档跟进 | `作业文件夹/T-07-plan.md`、`gaps.md` 第 1 条 |
| 70 | 只知道一件事：它**指向一个已被删掉的目录**，因此过期。`CRD 0010` 把它和 11、67 一起列为「废掉全局编号平表」的三条证据 | `CRD 0010` |

**这六条文档措辞检查有一个共同的后果，必须记住**：本作业里用户跳过了最后一次文档评审,
所以 8、9、10、21、47、53 **只有 PM 一个人核过——而那个人正是写它们的人**。这件事已经立成
`gaps.md` 第 1 条常备缺口：以后同类检查默认要一个独立的读者。

---

# 完全丢失的 20 条：54-66、68、69、71-75

**这 20 个编号没有任何出处**——不在 42 个用例的注释里、不在 `gaps.md` 里、不在当时的九份 CRD 里、
不在七份 ADR 里、不在 36 条提交信息里、不在四份 QA 计划里、不在 `state.json` 里、不在两个
`Q-` 文件里。**这里一个字都不填。**

**唯一能说的（一条有依据的推断，不是记录）**：编号随 DoD 版本递增，而每份 CRD 的 `Applied`
行留下了版本号——

| 已知锚点 | DoD 版本 |
| --- | --- |
| 检查 18-21 加入（T-05） | 版本 4（`CRD 0001`） |
| 检查 44-46 加入（T-06） | 版本 9（`CRD 0002`） |
| 检查 48-52（T-07）、53（T-08） | 版本 11（`CRD 0003`） |
| （`CRD 0004`，T-09） | 版本 17 |
| （`CRD 0005`，T-12） | 版本 19 |
| 检查 67 存在（T-16） | 版本 23 |
| 最后一版 | 版本 26（`CRD 0006` 编者注） |

按这个顺序，**54-66 大致属于 T-09 到 T-15**，**68-75 大致属于 T-17 到 T-28**。
**这只说明编号大概落在哪一段，不说明任何一条要求什么。**

---

# 在这些出处之间发现的自相矛盾

一条也没有在这份重建里被「修顺」，因为改一份 CRD、ADR、用例或角色文件不是本任务的活。

1. **检查 11 和检查 48-52 自相矛盾。** 11 说「`host/` 下只允许改 `host/git-guard.js`」，
   48-52（T-07）要求改 `host/crew.js`。QA 当时就报了，记在 `T-01-plan.md` 和
   `docs/qa/T-01/case-26-repo-diff-scope.mjs` 的注释里（那个注释还说明 11 的措辞写在版本 4，
   早于 `CRD 0003` 把 `host/crew.js` 交给 T-07）。DoD 从未改过这条。
2. **T-03、T-04 的归属前后不一。** `CRD 0001`（版本 4）说 T-04 拥有 `CHANGELOG.md`；
   `CRD 0003`（版本 11）说 `README.md`、`README-zh.md`、`CHANGELOG.md`「现在被 T-02 占着」；
   `state.json` 的任务列表里**没有 T-03、T-04**。任务被合并过，**合并本身没有任何记录**。
3. **`CRD 0010` 说的「25 个带 `(crew T-NN)` 的已推送提交指向被删的 DoD」把三个别人的提交
   算进来了。** `91f034c` 属于 `doc-review-0-7-0`，`bfdc799` 和 `2ba2e7e` 属于
   `engineer-proposes-fixes`，而这两件作业的记录**都还在各自的作业文件夹里**
   （`engineer-proposes-fixes/dod.md` 甚至完整保留着 10 条检查和 7 行任务表）。
   本作业真正受影响的是 **24** 个提交。（**原来写的是 22**——那是范围终点还钉在会动的 `HEAD` 上时的数，跟本文件开头第 88 行同一个毛病。同一个文件里同一个数字写成两个值，是 T-47 数出来报回来的。）
4. **`2ba2e7e` 的标题写着 `(crew T-05..T-12)`，而 `engineer-proposes-fixes` 从头到尾只有
   T-01..T-07**；它自己的 `state.json` 把这个提交记给 T-03..T-07。标题里的编号范围是错的。
5. **`CRD 0010` 对幸存证据的估计偏悲观。** 它写「`gaps.md` 顺口提了两个编号，一个用例的
   注释里写着 `acceptance check 18`」。实测：`gaps.md` 提到 **15** 个不同编号，**42 个用例
   每一个**都在头部注明它覆盖哪条检查，合计 **46** 个不同编号。这不改变 CRD 0010 的结论
   （平表要废掉），但确实说明能救回来的比它估计的多得多。
6. **`gaps.md` 第 9 条只引了检查 18 的一半。** 它写「检查 18（`node tools/verify-guard.mjs`
   全绿）」，而 `T-05-plan.md` 和 `docs/qa/T-05/case-08-existing-cases-intact.mjs` 说 18 还
   要求「两条最强的老用例没有被改弱」。两半是同一条检查，`gaps.md` 只提了第一半。
7. **最要紧的一条：这份重建里 48 条恢复项的最好出处，正躺在一个按规矩要被销毁的文件夹里。**
   `T-01-plan.md`、`T-05-plan.md`、`T-06-plan.md`、`T-07-plan.md`、`state.json`、
   `inbox/Q-19.md`、`inbox/Q-20.md` 都在 `~/.claude/crew/jobs/pm-merge-step/`，
   按 `CRD 0006` 它们是一次性的。**检查 67 的原文只存在于 `Q-19.md` 里**，仓库里一处都没有。
   本文件把它们的内容搬进了仓库，所以这条断链在此刻被接上了——但它说明搬运步骤第二次漏了
   同一类东西：`CRD 0006` 要求搬走的是「规则、怎么做、范围、理由和数字、测不到的缺口」，
   而**「检查原文」和「谁拥有哪个文件」仍然不在那五个目的地里**。

（那次搜索跑的时候仓库里是九份 CRD。今天是十一份，所以重跑一次会比当时覆盖得更多——
上面这个「没有出处」的结论只对当时那九份成立。）
