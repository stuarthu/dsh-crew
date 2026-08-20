# DoD：PM 的合并与清理步骤

版本：13
语言：中文（本文件和评审报告用中文；被改的仓库文件仍然写英文）
仓库：/home/stuart/workspace/dsh-crew
分支：main（用户决定直接在 main 上做，和前两次作业一样）

## 目标

给 crew 的 PM 加上一个"收尾"步骤：把工作分支合并进 `main`、推 `main`、然后问用户
要不要把 `crew/<job>` 分支在本地和远端都删掉。三件事各要一次用户的明确同意。
永不 `--squash`，永不 `git branch -D`。删除之前必须先证明这些提交真的已经合并、
并且真的已经推到远端。如果推 `main` 会触发发布类 workflow，PM 必须先大声说清楚，
用户仍然说 yes 就照做。做完之后 `npm test` 四项全绿，而且这个新步骤本身被
`tools/verify-mount.mjs` 的一条断言守住。

## 不做的事

- 除了 CRD 0001 点名的那一处，不改 `host/` 下的任何代码。`host/git-guard.js` 的
  信任模型不动（root 会话放行，子 agent 永远不能删远端分支）；只修 CRD 0001 里
  写的 `push-ok` 子串误判。T-01 仍然完全不许碰 `host/`。
- 不改版本号，不发布，不打标签。`0.7.0` 还没发布，所以 CHANGELOG 只在已有的
  `0.7.0` 段里加一条，不新开版本段。
- 不改 `preset/` 下的任何 YAML 设置行。
- 不给 git 保护加"合并"相关的新规则。合并由提示词约束，不由中间件约束。
- 本次不新建工作分支，所以这次作业本身不会走一遍新的第 17 步。新步骤靠验收检查
  2-7 和 QA 用例来证明，不靠"跑一遍给你看"。

## 语言与技术栈（读出来的，不是选的）

- 语言：JavaScript，Node.js。本机 `node --version` = v24.14.0；`package.json` 的
  `engines.node` = `>=18`。纯 ES 模块（`"type": "module"`），没有构建步骤。
- 包管理器：npm，本机 11.9.0。
- 测试框架：没有第三方框架，四个自己写的检查脚本。**测试命令：`npm test`**。
  单跑一个就直接执行它的文件，例如 `node tools/verify-mount.mjs`。
- 和本次任务直接相关：`tools/verify-mount.mjs` 只检查 `roles/*.md` 两件事——长度
  不少于 500 字符、不含 `{{`（第 96-104 行）；另外要求 PM 提示词里出现原字符串
  `product manager (PM)` 和 `crew_engineer`（第 209-210 行），所以 `roles/pm.md`
  第 1 行的标题不能改写。改角色文件后必须重跑 `npm test`。
- 没有 lint 和 format 工具。
- 本机装不上 `@deepseek-ai/dsh-tool-subagent`（它的 peer 没发布到公共 npm），但这个
  工作副本里已经有软链接，所以 `verify-mount.mjs` 能跑完整版。

## 已经定下的设计决定（盘问的结果）

1. PM 自己做合并，不是用户手动合并后再叫 PM 清理。
2. 合并、推 `main`、删分支：三次分别的同意，一次 yes 不覆盖下一件事。
3. 推 `main` 会触发发布类 workflow 时：大声警告，但用户说 yes 就推。不拒绝。
4. 永远 `git merge --no-ff`，永远不 `--squash`——每个任务一个提交、带 test-first
   证据的历史必须留下来。
5. 删除前必须证明：`git branch --merged main` 里有这个分支，且
   `git log --oneline origin/main..main` 为空（本地 main 已经推上去了）。
   任何一条不成立就不问，只说哪条不成立。
6. `trustRootAgent: false` 时远端删除会被保护拒绝。只说一句，给出用户自己执行的
   命令，不重试。

## 验收检查

1. `npm test` 四项全绿。
2. `tools/verify-mount.mjs` 里有一条新断言：`roles/pm.md` 必须包含 `--no-ff` 和
   `git push origin --delete`。把 pm.md 里这两处任意删掉一处，这个检查会失败，
   并且失败信息里点名 `roles/pm.md`。
3. `roles/pm.md` 有新的第 17 步"合并与清理"，并且写清楚上面六条设计决定，一条不漏。
4. `roles/pm.md` 的第 7 步（建分支）多一句：分支在第 17 步合并和清理，且只在用户
   要求时才做。
5. `roles/pm.md` 的状态文件示例里有 `merge` 块，含 `into`、`merged`、`pushed`、
   `branchDeleted`，并说明没合并过的作业整个键都不写。
6. 原第 17 步（现在的第 18 步 Finish）的总结不再写死"nothing was pushed"，而是说清
   真的合并了什么、推了什么、删了什么。
7. `roles/pm.md` 的 Hard rules 里多一条：不得自行合并或删分支，禁止 `--squash` 和
   `git branch -D`。
8. `docs/principles.md` 多第 16 条，格式和现有条目一致（Rule / Why / Lives in），
   并且专门解释"为什么是警告后仍可推"和"为什么删除前要先证明"。
9. `README.md` 多第 15 条，`README-zh.md` 有对应的第 15 条，两份说同一件事，命令和
   文件名一字不差。
10. `CHANGELOG.md` 的 `0.7.0` → `Added` 里多一条这个功能的说明，没有新版本段。
11. `git diff --stat` 里不出现 `package.json`。`host/` 下的文件只允许出现
    `host/git-guard.js`，且只能是 CRD 0001 那一处改动（T-05 拥有它）。**按任务**核对：
    T-01 的改动只有 `roles/pm.md` 和 `tools/verify-mount.mjs`；T-05 的改动只有
    `host/git-guard.js` 和 `tools/verify-guard.mjs`。两个任务在同一个工作副本里，
    所以整棵树的 `git diff --stat` 会同时显示两边——这不是违规。（这条原来的写法
    在 CRD 0001 之后就自相矛盾了，是 T-01 的工程师报出来的。）
12. `roles/pm.md` 不含 `{{`，第 1 行标题不变。

## 任务

| id | 做什么 | 拥有的文件 | 怎么检查 |
| --- | --- | --- | --- |
| T-01 | 先加断言（跑一次，看它失败），再写 PM 的第 17 步和其余四处改动，让断言变绿 | `tools/verify-mount.mjs`、`roles/pm.md` | 汇报里有断言先失败、后通过的两次真实输出；`npm test` 四项全绿；验收检查 2-7、12 |
| T-02 | 一个工程师写完全部文档：`docs/principles.md` 第 16 条、两份 README 的第 15 条（先英文再对齐中文）、CHANGELOG 三条（第 17 步、CRD 0001 的保护修复、CRD 0002 的 slug 形状） | `docs/principles.md`、`README.md`、`README-zh.md`、`CHANGELOG.md` | 验收检查 8、9、10、21、47 |
| T-05 | 修掉 CRD 0001 的 `push-ok` 子串误判，测试先行 | `host/git-guard.js`、`tools/verify-guard.mjs` | 汇报里有先红后绿的真实输出；验收检查 18-20 |
| T-06 | CRD 0002：给 `<job-slug>` 定形状，并用断言钉住 | `roles/pm.md`、`tools/verify-mount.mjs` | 验收检查 44-46；**必须排在 T-01 的打磨轮之后**，同两个文件 |
| T-07 | CRD 0003：删掉 `agentsPerJob`，`liveAgents` 默认改 20，旧设置静默忽略并记一行启动日志 | `host/crew.js`、`cordis.patch.yml`、`tools/verify-mount.mjs` | 汇报里有先红后绿的真实输出；验收检查 48-52 |
| T-08 | CRD 0003 的文档部分：两份 README 的配置表、CHANGELOG 一条 | `README.md`、`README-zh.md`、`CHANGELOG.md` | 验收检查 53；**必须排在 T-02 之后**，同三个文件 |

T-01 必须先做完并过关，因为 T-02 要照着 pm.md 的最终措辞写。原来的 T-02、T-03、
T-04 合成了一个 T-02：三份都是「照着写完的第 17 步写说明」，是一件连贯的写作活，
文件之间不重叠，一个工程师一次做完，也省下两个 agent 名额（单作业上限 20）。

## 评审安排（说清楚，不偷工）

- T-01：`crew-code-reviewer` + `crew-security-reviewer` + `crew-qa`。
  安全评审要做，因为这一步改的正是"什么时候可以推 `main`、什么时候可以发布"。
- T-02 是纯文档，本来要用一次 `crew-doc-reviewer` 评审——**用户决定跳过**，见下。
- T-05 同样配 `crew-code-reviewer` + `crew-security-reviewer`（它改的就是安全中间件）。
  T-05 第 2 轮只配一个 `crew-code-reviewer`：安全评审第 1 轮已经 verdict pass，
  第 2 轮改的正是它自己提的可选项。
- QA 只跑一次，在 T-01 和 T-05 都过关之后，覆盖除 8-10 之外的每一条验收检查，
  用例落在 `docs/crew/qa/` 下面。检查 8-10 是文档内容，由最后那次
  `crew-doc-reviewer` 判。这样安排是为了留在单作业 20 个 agent 的上限里，
  写在这里而不是悄悄少跑。
- QA 的用例写在 `docs/crew/qa/` 下面，是能真的跑起来的脚本，随任务一起提交。

## 第 1 轮评审的结论（版本 3 追加）

代码评审 verdict: changes needed（4 条 blocking）；安全评审 verdict: changes needed
（5 条 blocking）。去重后是下面 7 条，PM 全部接受，交给一个新的工程师在 T-01 的
同两个文件里改完。这些都是评审发现，不是范围变更，所以没有 CRD。

A. **发布判断不能靠扫关键词。** 按 `host/git-guard.js` 里 `branchPushTriggers()`
   （第 120-149 行）和 `publishingWorkflow()`（第 159-179 行）同样的标准判断：只有
   「分支推送能触发」**且**「会发布或发版」才算。`tags:` 触发不算，要明确说一句
   「推 main 不会发布」。也要看 `run:` 行里的发布脚本，不只看 `npm publish` 字面。
   形状看不清就当成「会发布」。`.gitlab-ci.yml`、`.circleci/config.yml`、
   `Jenkinsfile`、`azure-pipelines.yml` 存在时也要看。
   理由（PM 已亲自核实）：本仓库 `.github/workflows/publish.yml` 第 96 行有
   `npm publish`，但第 22-24 行是 `on: push: tags: ["v*"]`，推 main 绝对安全。
   照字面扫关键词会每次都误报；狼来了喊多了，用户学会闭眼说 yes，这条警告就废了。
B. **警告必须进 Hard rules，并在 `state.json` 里留痕**：`merge.publishCheck` 记下
   读了哪些文件、结论是什么。没有这一行就不许问「要不要推 main」。
   理由：第 17 步很长，三次同意天然分散在多轮对话里；上下文被压缩或会话重启之后，
   PM 完全可能从没读过 CI 文件就直接问推送，而 guard 对 root 会话不设防。
C. **删除前加第三条证明**：`git log --oneline main..origin/crew/<job-slug>` 为空，
   即**远端分支**没有 main 里没有的东西。原来两条证明只看本地分支和 main 有没有推
   上去，够不到远端分支上后来多出的提交，而 `git push origin --delete` 没有任何
   保护，那个提交会变成服务器上取不回的对象。「任一不成立」改成「三条任一不成立」。
D. **证明命令报错时输出也是空的。** 证明必须是「命令成功执行**且**没有输出」。没有
   远端、没有 `origin`、默认分支不叫 main 时都会报错，那是证明失败，不是证明通过。
   远端名不叫 `origin` 时用真实的远端名。
E. **`main` 动过了不能只说一句。** 先把本地 main 快进上去
   （`git merge --ff-only origin/main`），快进不了就停下告诉用户。推送被远端以
   non-fast-forward 拒绝时：永远不 force，`git fetch` 后在 main 上
   `git merge origin/main`，告诉用户进来了什么，再重新要一次同意。`--force` 和
   `--force-with-lease` 永远不属于这一步，不管 guard 允不允许。
F. **冲突中止、推送被拒、删除被拒**——三种情况停下之前都要
   `git switch crew/<job-slug>`，否则后面的修复提交会直接落在 main 上。
G. **不许断定被拒的原因。** 读真实报错并照抄：报错里有
   `dsh-crew git guard blocked this command` 才是 `trustRootAgent: false`；分支保护、
   没权限、分支已经不在，都是远端的回答。这一段要同时覆盖**推 main 被拒**和**远端
   删除被拒**两种。不重试、不把命令塞进脚本、不改 remote、永远不自己创建审批文件。

可选项里也一起做（PM 的决定）：

H. 断言收紧成一组**命令**字符串：`git merge --no-ff`、`git branch -d crew/`、
   `git push origin --delete`、`git branch --merged main`。只钉命令，不钉散文句子
   （像 "Never `--squash`"），因为钉散文会让以后改一个字就红。
I. 没有远端也没有 workflow 的纯本地仓库，「CI 绿」这条前提永远不成立，会逼用户绕
   规则。写清楚：没有 CI 就说一句，靠第 18 步的本地测试结果；有 CI 的地方没有绿就
   不许合并。
J. 「as you go」和「没合并过就整个键不写」互相拉扯，改成「每次 yes 之后写，键只在
   真的合并过之后才出现」。
K. 在 main 上直接干活、根本没有 crew 分支的作业（本次就是），第 17 步也要跳过。

不做（PM 决定，并说明理由）：

- 安全评审第 6 条要求断言钉住 "Never `--squash`" 这类散文句子：不做，见 H。
- `host/git-guard.js` 的两个 pre-existing 问题（`push-ok` 子串匹配会连 root 会话一起
  挡掉；`publishingWorkflow()` 只看 `.github/workflows`）：本 DoD 明令不动 `host/`，
  所以本次不做。PM 在最后的总结里报给用户，另外排期。

## 追加的验收检查

13. 第 17 步里有三条删除证明（含远端分支那一条），并写明「命令必须成功执行且无输出」
    才算证明。
14. `roles/pm.md` 里出现 `--ff-only`，并且明确写了永不 force 推 main。
15. `state.json` 示例的 `merge` 块里有 `publishCheck`。
16. Hard rules 里有「问推 main 之前必须先读 CI 文件，并把结论写进同一个问题」。
17. `tools/verify-mount.mjs` 的断言包含 H 里那四个命令字符串，删掉任意一个都会红。

## CRD 0001 追加的验收检查

18. `node tools/verify-guard.mjs` 全绿。原有的用例（第 68-69 行「agent 不能自己批准
    自己」、第 166-168 行「连 root 都不能写审批文件」）一条都没被改弱。
19. 新用例证明「以前误挡、现在放行」：命令文本里出现 `push-ok` 但并不指向审批文件的
    情况（例如 `git push origin crew/push-ok-flow`、`git switch -c crew/push-ok-flow`、
    读一个叫 `push-okay.md` 的文件）不再被审批文件那条规则挡住。
20. 新用例证明「以前挡对、现在继续挡住」：真的指向审批文件的写法仍然被拒，root 会话
    也被拒。至少覆盖 `touch <审批文件全路径>`、`touch push-ok`、`rm push-ok`、
    `echo x >push-ok`（中间没有空格）。
21. `CHANGELOG.md` 的 `0.7.0` → `Fixed` 段里有这条修复（没有 `Fixed` 段就新建一个，
    放在 `Added` 之后），说清楚用户会看到什么：分支名里带 `push-ok` 时，git 命令不再
    被误挡。

## 第 2 轮评审的结论（版本 5 追加）

代码评审 verdict: changes needed（2 条 blocking）；安全评审 verdict: changes needed
（3 条 blocking）。去重后 4 条，全部接受，加 8 条可选项也一起做。仍然是评审发现，
不是范围变更，所以没有新的 CRD。

L. **前置检查不许改状态。**（两份报告的第 1 条，同一个洞）新的
   `git merge --ff-only origin/main` 写在前置检查里，也就是**第一次 yes 之前**就
   `git switch main`。有两条出口不切回来：用户对合并说 no；快进不成立。收尾那句
   只列了「冲突、推送被拒、删除被拒」，读起来像穷举，这两条不在里面。于是 PM 一次
   同意都没拿到就停在 `main` 上，后面每一次提交都落在 `main`——正是 F 要防的事，而
   这次是新加的前置检查自己带上去的。
   改法（采用代码评审的版本，比只补兜底句更干净）：前置检查那一条改成**只读**，
   只说「main 动过了就说一句，快进放到 yes 之后的合并里做」；`**The merge.**` 段
   开头变成「拿到 yes 之后：`git switch main`，`main` 动过就先
   `git merge --ff-only origin/main`，快进不成立就 `git switch crew/<job-slug>`、
   告诉用户、停下，永不 force；否则 `git merge --no-ff crew/<job-slug>`」。
   兜底句改成：「**切到 `main` 之后**在这一步的任何地方停下——快进失败、用户说 no、
   冲突、推送被拒、删除被拒——都先 `git switch crew/<job-slug>` 再说别的。」
M. **前置检查和 I 自相矛盾。** 第一条前置检查明确允许「没有远端也没有 workflow」的
   纯本地仓库继续走，可第三条无条件要求 `git fetch` 和
   `git log --oneline main..origin/main`——这两条在纯本地仓库里必然 fatal，而且没有
   出口。补一句：没有远端时这两条命令会失败，说一句就往下走，没有远端就没有落后。
N. **证明和删除之间有时间窗。** 三条证明跑完，PM 问第三个问题，用户十分钟后（或者
   会话重启后）才回 yes；这期间有人往 `crew/<job-slug>` 推了一个提交。
   `git push origin --delete` 没有 lease 保护，那个提交直接变成服务器上取不回的
   对象，而三条证明「全都通过」。改法：拿到 yes 之后，在**同一轮**里把第三条证明
   再跑一次，还是「成功执行且无输出」才删；这期间远端分支多了东西就不删，说清楚
   进来了什么然后停下。
O. **`publishCheck` 的示例值是一句可以直接抄的结论。** 示例里其他值一眼是占位
   （`add-sso-login`、`/home/you/project`），而
   `"publish.yml is tag-only; a main push does not publish"` 点了一个真实常见的
   文件名，读起来像已经核实过的答案。上下文被压缩或会话重启后，PM 可能照抄它来
   满足「没有这一行不许问推 main」这条硬规则，而 CI 文件从来没被读过。在
   `on: push: branches: [main]` 就发布的仓库里，这就是橡皮章。改法：示例值换成占位
   （`<the CI files you read> -> <publishes | does not publish on a main push>`），
   并加一句：`publishCheck` 必须是你自己这次读出来的，要列出读过的每个文件，
   永远不许照抄示例；字段缺失、或者点了一个本仓库没有的文件，就重做这项检查。

可选项，一起做：

P. **删掉指向本包内部实现的指针。**（PM 的错，在版本 3 的 A 里）提示词是随 npm 包
   发出去的，PM 干活的仓库里没有 `host/git-guard.js`，写成「像
   `publishingWorkflow()` / `branchPushTriggers()` 那样判断」会让 PM 去读一个不存在
   的文件。`roles/` 下只有这一处指向包内部，也不合本仓库的习惯。改成「用 crew 的
   git guard 用的同一条规则」，判断标准本身照原样留着（代码评审已逐条对过真实代码，
   结论一致，且「形状看不清就当会发布」偏安全方向）。
Q. 被拒时那一段的开头条件太窄，而且「报错里有 `dsh-crew git guard blocked this
   command` 就是 `trustRootAgent: false`」不总是真——审批文件那条规则对所有 agent
   生效，root 也一样被同一句开头挡住。改成：先认出这句开头是 crew 自己的 guard，
   再读它给的理由；理由是受保护分支或远端删除时才是 `trustRootAgent: false`。
R. 「形状看不清就当会发布」时，不许把不确定说成确定。要照实说：点名文件，说自己
   看不出分支推送会不会触发它，并说明按「会发布」处理。
S. `tags:`-only 的结论只对**这一次推 main** 有效。同一个仓库里真正发布的是 **tag
   推送**，所以 tag 推送要有它自己的大声警告和它自己的一次同意。
T. `merge.publishCheck` 的写入时机要和硬规则对齐：在问推 `main` **之前**就写进去。
U. 没有远端、或者工作分支从没推上去过的仓库，第 2、3 条证明永远不可能成立，本地
   分支就永远清不掉。这是 D 定下的保守做法，保留，但要让 PM 说明白这不是故障：
   说一句本地分支留在原处，然后不要问。
V. 本地删除已经成功、远端删除被拒时，`git switch crew/<job-slug>` 会从
   `origin/crew/<job-slug>` 把分支重新拉出来，等于把用户刚批准的本地删除撤销掉。
   加一句：本地分支已经删掉了就留在 `main` 上并说明，不要把分支重新建出来。
W. 断言再加三个字符串：`--ff-only`、`origin/crew/`、`publishCheck`。这三处是本轮
   修复的全部安全价值，现在任何一次改写都能把它们删掉而 `npm test` 照样四项全绿。
   它们是命令和字段名，不是散文，所以不违反 H。
X. 两处 `git fetch` 都写成带远端名和 `--prune`：`git fetch <remote> --prune`。

不做（PM 决定，理由）：

- 安全评审的 pre-existing 第 1 条：`<job-slug>` 没有形状要求，含 `..` 的 slug 能写到
  作业目录外，含空格或 `;` 的 slug 会在 PM 自己的会话里变成多条命令。真问题，但它在
  第 6 步，不在本 DoD 的范围里，改它要动 PM 提示词里和合并无关的部分。PM 已经报给
  用户，等用户决定要不要单独排期。
- `publishingWorkflow()` 只看 `.github/workflows`：本 DoD 除 CRD 0001 之外不动
  `host/`。

## 第 2 轮追加的验收检查

22. 前置检查里没有任何会改变工作树的命令（没有 `git switch`、没有 `git merge`）；
    `--ff-only` 出现在拿到合并的 yes 之后那一段里。
23. 兜底那句切回分支的话覆盖「切到 main 之后」的每一条停下路径，至少点名快进失败和
    用户说 no。
24. 第三条证明在拿到删除的 yes 之后、真正删除之前，会在同一轮里再跑一次。
25. `state.json` 示例里的 `publishCheck` 是占位符，不是一句现成结论；并且有一句话
    禁止照抄示例、要求列出读过的文件。
26. `roles/pm.md` 里不出现 `host/git-guard.js`、`publishingWorkflow()`、
    `branchPushTriggers()` 这三个字符串。
27. 断言里有 `--ff-only`、`origin/crew/`、`publishCheck`，删掉任意一个都会红。

## T-05 第 1 轮评审的结论（版本 6 追加）

代码评审 verdict: changes needed（1 条 blocking）；安全评审 **verdict: pass**（0 条
blocking，7 条可选）。PM 接受 blocking 那条，加 6 条可选项。

Y. **blocking（代码评审）——模式的「左边界」那一半完全没有测试。** 三条新的
   must-allow 用例都是 `push-ok` 后面接名字字符，只走右半边。把
   `(^|[^${NAME_CHARS}])` 整个删掉，现有 52 条用例一条都不会红——按「删掉代码测试
   会不会红」的标准，一半的修复没被测到。而它挡的正是 CRD 要修的那类误判：一个叫
   `crew/hotfix-push-ok` 的分支（名字以 `push-ok` 结尾）在左半边坏掉时会被整条拒掉。
   加一条用例：`["cat docs/pre-push-ok", false, "a longer name that only ends with
   push-ok"]`。

Z. **`-` 要真的转义，模式每次挂载只建一次。**（安全评审第 1 条）`NAME_CHARS` 被原样
   塞进字符类，`-` 现在只是「刚好在最后一个位置」才是字面量。以后有人把它写成
   `"A-Za-z0-9._-+"`，`_-+` 就是一个反向区间，`new RegExp` 抛 SyntaxError——而且模式
   是**每条命令**才建的，所以不是挂载时大声炸掉，而是在每一条 `bash`/`pwsh` 命令上
   炸掉，报错还和原因无关。这和 `CLAUDE.md` 设计规则 6「坏东西要在挂载时大声失败」
   正好相反。改法：边界写成 `"[^A-Za-z0-9._+\\-]"`（`-` 转义），把模式提到 `apply()`
   里建一次。代码评审的第 3 条（注释里提醒「`-` 放最后」）被这条取代——转义了就不
   需要靠位置。

AA. **全路径那一半还是子串匹配，等于同一个 bug 只杀了一半。**（安全评审第 2 条）
   `command.includes(approvalFile)` 没变，所以 `ls ~/.dsh/crew/push-ok.bak`、或者一个
   叫 `~/.dsh/crew/push-ok-flow/` 的文件夹，仍然会被整条拒掉，报错还是说「你碰了审批
   文件」——正是第 17 步当初踩的那种假警报。改法：全路径和名字走同一个边界判断，
   `(^|边界)(名字|全路径)($|边界)`，两者都先转义。安全上不损失：命令里出现全路径时，
   名字前面必定是路径分隔符，名字那一支本来就会命中。代码评审的第 2 条（要么删掉这条
   保险带、要么给它加用例）由此解决：保留，但收进同一条规则。

AB. **`approvalFile` 的设定值要在挂载时验证。**（安全评审第 3 条，这条是真的洞）
   用户写成 `approvalFile: "~/.dsh/crew/"`（多一个斜线），`basename` 得到 `crew`。
   于是被保护的名字变成 `crew`：`git push origin crew/my-job` 被当成「你碰了审批
   文件」拒掉，而**真正的审批文件完全没有被保护**——`touch ~/.dsh/crew/push-ok`
   从此放行，任何 agent 都能自我批准。改动前后一样坏（旧的是 `includes("crew")`），
   但这次是唯一该加这道验证的时机。改法：`apply()` 里发现设定值是文件夹形状
   （结尾是 `/` 或 `\`，或 basename 为空）就抛错，让 profile 加载大声失败，报错里
   写清楚怎么改。抛错是对的：静默保护错误的名字是一个看不见的安全失效，而本仓库
   对角色文件本来就是挂载时抛错（`CLAUDE.md` 设计规则 6）。

AC. **用例要钉住规则，不只是钉住例子。**（安全评审第 4、5 条）现在没有一条用例测过
   最现实的自我批准写法。补上：带双引号、带单引号、`$HOME` 形式、由程序写文件
   （`python3 -c "open('push-ok','w')"`）、经管道（`echo push-ok | xargs touch`），
   以及 `my-push-ok`（只以 `push-ok` 结尾的另一个文件，必须放行）。再加一条用
   **默认设定**挂载的用例（`guard.apply(ctx, {})`），只送非 push 命令——名字检查会
   立刻 return，所以真正的 `~/.dsh/crew/push-ok` 从头到尾不会被读、建或删，符合
   「检查不许碰真的 `~/.dsh`」。

AD. **暂存目录要保证清掉。**（安全评审第 6 条）任何一条用例抛异常，`rmSync` 就跑不
   到，`/tmp` 下留垃圾。用例区段包进 `try` / `finally`。

AE. **头注释的「诚实限制」补两句实话。**（代码评审第 4 条 + 安全评审第 7 条）
   一、命令只要**提到**这个名字就会被拒，连 root 也拒：
   `git commit -m "fix(guard): the push-ok substring false alarm"` 会被挡，
   `grep -n push-ok config.yml`、`git log --grep=push-ok` 同理。
   二、由 shell 从碎片拼出来的名字仍然能过去：
   `echo push-ok-flow | sed s/-flow// | xargs touch`（旧的子串检查挡得住这一条，
   新的挡不住；但旧的对 `touch pus''h-ok` 一样无效，所以对「刻意规避」两者都是纸糊
   的）。这两句都写进 `host/git-guard.js:23-25` 已经存在的 "Honest limits" 段。

不做（PM 决定，理由）：

- 代码评审第 5 条（`okFlowChild` 那条用例依赖前面写下、没被消耗的审批文件）：不做。
  它的注释已经把依赖写清楚，而且和这个文件第 127-149 行的既有写法一致。为它多写一次
  `writeFileSync` 会让「审批只能用一次」这条链式证明变松。
- 代码评审第 6、7 条（转义函数重复一次、每条命令都新建 RegExp）：第 6 条不做，
  第 7 条由 Z 顺便解决。
- 安全评审 pre-existing P1、P2 和 `publishingWorkflow()` 只看 `.github/workflows`：
  见下面「报给用户」。

## 报给用户（不在本作业范围，PM 在最后的总结里说）

1. **guard 只包 `bash` 和 `pwsh`。** 一个有 `write` 或 `edit` 工具的角色（engineer
   就有）可以直接把文件写到 `~/.dsh/crew/push-ok`，完全不经过这个中间件。所以
   `host/git-guard.js:223-224` 那句「没有 agent 能写审批文件」严格说只对 shell 成立。
   真正的闸门是 dsh 自己的写文件核准提示。值得单独排一个作业。
2. **`howToApprove()` 把自我批准的现成配方印在报错里**给 agent 看。它当下跑不了
   （guard 会挡），但这是把步骤写在错误消息里。可以考虑只对 root 给全套配方。
3. **`<job-slug>` 没有形状要求**（第 1 轮安全评审的 pre-existing）。含 `..` 的 slug
   能写到作业目录外；含空格或 `;` 的 slug 会在 PM 自己的会话里变成多条命令。
4. **`publishingWorkflow()` 只看 `.github/workflows`。** 新的 pm.md 文字已经要求 PM
   也看 GitLab / CircleCI / Jenkins 的文件，于是提示词比中间件严——在那类仓库里，
   子 agent 的推送不会被这条规则挡住。

## T-05 第 1 轮追加的验收检查

28. 把模式里 `(^|边界)` 这一半删掉，`node tools/verify-guard.mjs` 会红。
29. 边界集合里的 `-` 是转义的（`\-`），不是靠位置；模式在 `apply()` 里只建一次。
30. `ls <审批文件全路径>.bak` 这类命令不再被审批文件那条规则挡住。
31. `approvalFile` 配成文件夹形状（结尾带 `/`，或 basename 为空）时，挂载就抛错，
    报错里说清楚怎么改。有用例证明。
32. 有用例覆盖：双引号、单引号、`$HOME` 形式、程序写文件、管道、`my-push-ok` 放行、
    以及一条用默认设定挂载的（只送非 push 命令，不碰真的 `~/.dsh`）。
33. `tools/verify-guard.mjs` 的用例区段包在 `try` / `finally` 里，`rmSync` 一定会跑。
34. `host/git-guard.js` 的 "Honest limits" 段里有 AE 那两句实话。

## 第 3 轮评审的结论（版本 8 追加）

代码评审 **verdict: pass**，安全评审 **verdict: pass**。两边都是 0 条 blocking，
共 10 条可选项。评审轮次上限是 3，两边都过了，所以没有分歧要交给用户。这 10 条
全部接受，由一个工程师一次改完（都是给出了原句替换的文字改动）。

**这一次不再开新的评审轮。** 改完由 PM 亲自核验（`npm test`、逐条 grep），再由
QA 独立跑一遍最终文字。PM 在最后的总结里对用户说明这一点：这一轮是 PM + QA 验的，
不是新的评审员验的。

代码评审的 5 条：

AF. 推 `main` 被以 non-fast-forward 拒绝后，第 17 步叫 PM 在 `main` 上跑
    `git merge origin/main`，而这条合并可能冲突，段里没写 `git merge --abort`。
    带着未解决的冲突去跑兜底句里的 `git switch`，git 会拒绝切换，PM 卡在 `main` 的
    冲突状态里。（这是第 1 轮 E 留下的。）
AG. 纯本地仓库里 PM 仍然会问第二次 yes（推 `main`），推送必然 fatal，被拒那段还会把
    `git push origin main` 交给用户，而那条命令在没有远端的仓库里同样跑不通。
    改法：没有远端就说一句、跳过这次 yes、`merge` 里不写 `pushed`。
AH. 合并那段缺一句「不是明确的 yes 就结束这一步」，删除那段有。行为不会错，读起来是
    缺口。
AI. `tools/verify-mount.mjs` 注释里「`--ff-only` is the only allowed way to move
    `main` forward」说得比事实大——`--no-ff` 和 `git merge origin/main` 也在往前推
    `main`。改成「catch local `main` up with the remote」。
AJ. 「the key appears only once the merge has really happened」里 `the key` 指哪个键
    不明确，写死成 `the merge key itself`。

安全评审的 5 条：

AK. 「A message that **starts with** `dsh-crew git guard blocked this command`」——
    PM 真正看到的是 `Error: dsh-crew git guard blocked this command: <reason>`，开头
    是 `Error: `。照字面执行「starts with」的 PM 会判定这不是 guard 的话，把
    `trustRootAgent: false` 的拦截报成「远端拒绝了」。改成 `contains`，并写出真实形状。
AL. 会话重启后 `state.json` 里已经有一行看起来合规的 `publishCheck`，硬规则要的痕迹
    就在那里，于是这次会话可以从没读过 CI 文件就问推 `main`——抄的不再是示例，而是
    上一次会话的自己。改法：重启后把已有的 `publishCheck` 当成未核实，本次会话重新读
    CI 文件、重新写这一行。
AM. 第 17 步承诺「tag 推送有它自己的大声警告和它自己的同意」，但真正推 tag 的是第 16
    步，那里只有「每次推送都要问」，没有任何「说清 tag 推送会发布」的要求。「its own
    yes」有人兑现，「loud warning」没有。这是没兑现的承诺：在第 16 步补上。
AN. remote-tracking 名字 `origin/main` 和 `origin/crew/<job-slug>` 读起来像分支名而
    不像「写成 origin 的远端」。远端叫 `upstream` 的仓库里不替换前缀，第三条证明会以
    `unknown revision` 报错——按 D 就是证明失败，只会不删并停下，方向安全，代价是本地
    分支永远清不掉。补一句：这两个前缀也要换成真实远端名。
AO. guard 还有一条对 root 也生效的拒绝理由——「it touches the push approval file」。
    作业 slug 里带 `push-ok` 时（例如 `crew/push-ok-flow`），远端删除会带着这条理由被
    拒，而它既不属于「受保护分支 / 远端删除」，也不属于「远端的回答」，PM 只能猜。
    补一句：guard 的理由点名审批文件时，不是权限问题，是命令里有个词撞上了那个文件名。

两轮都确认、但照实说清的两件事（不改，只是记下来）：

- **N 是把窗口缩小，不是消除。** 重跑第三条证明和 `git push origin --delete` 之间仍有
  几秒。真正消除只能用 `--force-with-lease` 形式的删除，而 E 明令这一步永不用它。
  「同一轮重跑」是这个设计的上限。
- **用户对推 `main` 说 no 时，合并提交已经在本地 `main` 上了**，提示词只要求切回工作
  分支，不要求撤销。撤销要用 `git reset --hard`，比留着更危险。留着是对的。

## 第 3 轮追加的验收检查

35. non-fast-forward 恢复那段里有 `git merge --abort` 的出口。
36. 没有远端时不问推 `main` 那次 yes。
37. 合并那段有「不是明确的 yes 就结束这一步」。
38. `tools/verify-mount.mjs` 的注释不再声称 `--ff-only` 是唯一能推进 `main` 的方式。
39. `roles/pm.md` 里 guard 报错的判断词是 `contains`，不是 `starts with`，并且写出了
    `Error: ` 前缀的真实形状。
40. 有一句话要求重启后把已有的 `publishCheck` 当成未核实。
41. 第 16 步里有 tag 推送的大声警告和它自己的一次同意。
42. 有一句话说 remote-tracking 前缀也要换成真实远端名。
43. 有一句话处理「guard 的理由点名审批文件」这种拒绝。

## CRD 0002 追加的验收检查

44. `roles/pm.md` 第 6 步写清 slug 的形状：只允许小写字母、数字和 `-`；不许以 `-`
    开头或结尾；不许出现 `..`；给出长度上限。并且写清为什么——这个值会被拼进文件
    路径和 shell 命令，而 PM 自己的会话是被 guard 信任的。
45. 用户给的作业名不符合形状时，第 6 步说明 PM 怎么办：自己转成合规的 slug，把转换
    结果告诉用户，而不是照原样用。
46. `tools/verify-mount.mjs` 的断言钉住这条规则，删掉它会红，失败信息点名
    `roles/pm.md`。

## 用户改了 agent 上限（版本 10 追加）

用户的话：「drop agentsperjob, I think it should be unlimited. set liveagents to 20」。

**本次作业立即照此执行**：不再有「单作业 agent 总数」上限；同时活跃上限从 4 改成 20，
所以剩下的任务并行铺开。评审轮次上限 3 不变（用户没提）。

这个决定**只**改本次作业怎么跑。要不要把它变成产品的默认值（`host/crew.js:44` 的
`DEFAULT_LIMITS`、`cordis.patch.yml` 的注释、两份 README 的配置表、PM 提示词里那三行），
PM 已经把问题交给用户，等他回答后再决定要不要开 CRD 0003 和新任务。

## CRD 0002 之后追加的验收检查

47. `CHANGELOG.md` 的 `0.7.0` 段里有三条，一条都不少：新的第 17 步（Added）、
    CRD 0001 的 `push-ok` 误挡修复（Fixed）、CRD 0002 的 slug 形状（Added 或 Fixed，
    工程师自己判断，但要说清用户会看到什么）。

## CRD 0003 追加的验收检查

48. `host/crew.js` 里没有 `agentsPerJob` 这个设置项：`DEFAULT_LIMITS` 里没有它，
    `apply()` 里没有对应的 `limitOf` 调用，拼给 PM 的提示词里没有「一个作业总共多少
    个 agent」这一行。
49. `DEFAULT_LIMITS.liveAgents` 是 `20`，`reviewRounds` 仍是 `3`。
50. 配置里写了 `limits.agentsPerJob` 时：**不抛错**，照常挂载，并且在启动日志里说
    一句（这个设置项已经没有了、可以从 profile 里删掉）。有用例证明「不抛错」和
    「日志里说了一句」两件事。
51. `limitOf` 对写错的值仍然抛错（`liveAgents: 0` 的既有用例必须继续绿）。
52. `cordis.patch.yml` 的注释示例里没有 `agentsPerJob`，`liveAgents` 写的是 `20`。
53. 两份 README 的配置表里没有 `agentsPerJob`，`liveAgents` 默认值写 `20`，两份说的
    一样；`CHANGELOG.md` 的 `0.7.0` 段里有一条说明这个变化，并说清已经写了这个设置
    的用户会看到什么。

## 另一个会话在同一个工作树上（版本 12 追加）

有第二个 Claude Code 会话（`dsh-crew-09`）在同一个仓库、同一个 `main` 上跑另一个 crew
作业 `engineer-proposes-fixes`。它主动来协调，说的和仓库现状一致。记下四件事：

1. **它已经提交 `bfdc799`**，只动 `roles/engineer.md`、`roles/architect.md`、
   `roles/doc-reviewer.md`，`git add` 逐个指名。它不碰本 DoD 名下的任何文件，那边四个
   任务全部 blocked，等本作业提交完。
2. **`docs/principles.md` 第 16 条归本作业**，它改用 17。所以 T-02 **只能写第 16 条**：
   slug 规则（CRD 0002）作为第 16 条里的一条 **Why** 写进去，不许单独占 17。理由是号
   已经被另一个作业占了，而两条规则的根都一样——PM 自己那个会话是 guard 信任的，所以
   它拼进命令里的东西必须是安全的。T-02 如果已经写成 17，由一个后续任务改回 16。
3. **`main` 比 `origin/main` 领先 2 个提交，都没推**：`91f034c`（0.7.0 文档评审修正）和
   `bfdc799`。**任何一次推 `main` 都会把这两个一起推上去。** PM 已经告诉用户；第 16 步
   问推送许可时必须再说一次。
4. **`roles/pm.md` 混着两边的文字。** 用户的决定（原话「keep it」）：**保留**对方那部分
   一起提交，不剥离。所以提交这个文件时，提交信息的正文里要写明白：这次提交包含另一个
   会话的改动，未经本作业评审，点名是哪个会话、哪件作业。提交只用 `git add <文件名>`
   逐个指名，**永远不用 `git add -A` 或 `git commit -a`**——对方那边还有没做完的东西。

## 用户决定跳过最后的文档评审（版本 13 追加）

用户的话：「don't do doc review, just wait qa」。

所以本作业**不跑** `crew-doc-reviewer`。受影响的是这些：

- 验收检查 **8、9、10、21、47、53** 本来由文档评审判（`docs/principles.md` 第 16 条、
  两份 README 的第 15 条与配置表、`CHANGELOG.md` 的三条加 CRD 0003 那一条）。现在由
  PM 自己核验：PM 已经逐条 grep 过并看过原文，结果写在最后的总结里。
- T-08 报出的两处折行不齐（`README.md:150`、`CHANGELOG.md` 的 `Fixed` 里一处）没有人
  再看一遍，保持原样。
- 另一个会话写进 `roles/pm.md` 的那部分文字（用户决定保留）没有经过本作业任何评审，
  这一点在提交信息里点名。

PM 在最后的总结里必须说清楚：文档评审是**按用户要求跳过的**，不是跑过、也不是漏掉。
