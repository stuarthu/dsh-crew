# QA 测试计划：T-01（PM 的第 17 步与断言）

写这份计划的时间点：**读任何代码之前**。只读了 `~/.dsh/crew/jobs/<job-slug>/dod.md`（版本 12）和三份 CRD。

覆盖的验收检查：1、2、3、4、5、6、7、11、12、13、14、15、16、17、22、23、24、25、26、
35、36、37、38、39、40、41、42、43。

跳过：8、9、10、21、47、53（文档措辞，由 `crew-doc-reviewer` 判，不是 QA 的活）。

## 通用规则

- 所有用例是 `.mjs` 脚本，失败时打印原因并以非 0 退出，成功打印一行 `ok`。
- 需要跑 `tools/verify-mount.mjs` 的用例，**先把仓库需要的部分复制到临时目录**
  （`mkdtemp`），在副本里改 `roles/pm.md`，绝不动仓库里的文件。
- 每个用例自己设一个一次性 `DSH_HOME`（临时目录），绝不读写真的 `~/.dsh`。
- 用例之间没有顺序依赖，跑两遍结果一样，结束时删掉自己建的临时目录。
- 共用的小工具放 `docs/qa/lib/qa.mjs`，它不是用例（文件名不以 `case-` 开头）。

## 用例

| # | 检查 | 我做什么 | 必须发生什么 | 文件 |
| --- | --- | --- | --- | --- |
| 1 | 3 | 在 `roles/pm.md` 里找第 17 步的标题，并逐条找六条设计决定的痕迹：`--no-ff`、不许 `--squash`、不许 `git branch -D`、三次分别的同意、删除前的证明、`trustRootAgent` 被拒时只说一句 | 标题存在；六条痕迹全在。任何一条缺失就红，并打印缺哪一条 | `T-01/case-01-step-17-exists.mjs` |
| 2 | 4 | 找第 7 步（建分支）那一段，看是否指向第 17 步、并说明只在用户要求时才做 | 两点都在 | `T-01/case-02-step-7-note.mjs` |
| 3 | 5 | 在状态文件示例里找 `merge` 块和 `into`、`merged`、`pushed`、`branchDeleted` 四个键，以及「没合并过整个键不写」的说明 | 四个键都在，说明也在 | `T-01/case-03-state-merge-block.mjs` |
| 4 | 6 | 找第 18 步 Finish 的总结段 | 不再出现写死的 `nothing was pushed`；出现「合并了什么/推了什么/删了什么」的要求 | `T-01/case-04-step-18-finish-summary.mjs` |
| 5 | 7 | 在 Hard rules 段里找新那一条 | 同时点名 `--squash` 和 `git branch -D`，并说不得自行合并或删分支 | `T-01/case-05-hard-rule-no-self-merge.mjs` |
| 6 | 12 | 读 `roles/pm.md` 全文和第 1 行 | 全文不含 `{{`；第 1 行是原来的标题（含 `product manager (PM)`） | `T-01/case-06-no-braces-and-title.mjs` |
| 7 | 13 | 找三条删除证明 | 三条都在，其中一条是远端分支（`main..<remote>/crew/`）；并写明「命令成功执行且无输出」才算证明 | `T-01/case-07-three-delete-proofs.mjs` |
| 8 | 14 | 找 `--ff-only`，找永不 force 的话 | 两者都在；`--force` / `--force-with-lease` 被明确禁止 | `T-01/case-08-ff-only-never-force.mjs` |
| 9 | 15 | 在 `merge` 块示例里找 `publishCheck` | 在 | `T-01/case-09-publish-check-field.mjs` |
| 10 | 16 | 在 Hard rules 里找「问推 main 之前先读 CI 文件、结论写进同一个问题」 | 在 | `T-01/case-10-hard-rule-read-ci.mjs` |
| 11 | 2、17、27 | 把仓库需要的部分复制到临时目录；对 7 个被钉住的命令字符串（`git merge --no-ff`、`git branch -d crew/`、`git push origin --delete`、`git branch --merged main`、`--ff-only`、`origin/crew/`、`publishCheck`）逐个从副本的 `roles/pm.md` 里改掉，每次跑一遍 `node tools/verify-mount.mjs` | 7 次全部非 0 退出，且输出里点名 `roles/pm.md`；不改时退出 0 | `T-01/case-11-pinned-command-strings.mjs` |
| 12 | 22 | 找前置检查那一段 | 段里没有 `git switch`、没有 `git merge`；`--ff-only` 出现在拿到 yes 之后的合并段里 | `T-01/case-12-precheck-read-only.mjs` |
| 13 | 23 | 找兜底那句切回分支的话 | 覆盖「切到 main 之后」的停下路径，至少点名快进失败和用户说 no | `T-01/case-13-switch-back-paths.mjs` |
| 14 | 24 | 找删除 yes 之后重跑第三条证明的话 | 说明在同一轮里再跑一次、还是要「成功且无输出」 | `T-01/case-14-third-proof-rerun.mjs` |
| 15 | 25 | 看 `publishCheck` 的示例值 | 是占位符（含 `<` `>`），不是现成结论；不出现 `publish.yml is tag-only`；有一句禁止照抄示例、要求列出读过的文件 | `T-01/case-15-publish-check-placeholder.mjs` |
| 16 | 26 | 全文搜三个字符串 | `host/git-guard.js`、`publishingWorkflow()`、`branchPushTriggers()` 都是 0 次 | `T-01/case-16-no-internal-pointers.mjs` |
| 17 | 35 | 找 non-fast-forward 恢复那一段 | 里面有 `git merge --abort` 的出口 | `T-01/case-17-merge-abort-exit.mjs` |
| 18 | 36 | 找「没有远端」的处理 | 说明不问推 main 那次 yes，`merge` 里不写 `pushed` | `T-01/case-18-no-remote-skip-push-yes.mjs` |
| 19 | 37 | 找合并那一段 | 有「不是明确的 yes 就结束这一步」这类话 | `T-01/case-19-merge-clear-yes.mjs` |
| 20 | 38 | 读 `tools/verify-mount.mjs` 里断言附近的注释 | 不再声称 `--ff-only` 是唯一能推进 `main` 的方式 | `T-01/case-20-mount-comment-ff-only.mjs` |
| 21 | 39 | 找判断 guard 报错的那句 | 用 `contains`，不用 `starts with`；写出了 `Error: dsh-crew git guard blocked this command` 的真实形状 | `T-01/case-21-guard-error-contains.mjs` |
| 22 | 40 | 找会话重启后 `publishCheck` 的处理 | 有一句要求把已有的 `publishCheck` 当成未核实、本次会话重新读 CI 文件 | `T-01/case-22-publish-check-restart.mjs` |
| 23 | 41 | 找第 16 步 | 有 tag 推送会发布的大声警告，和它自己的一次同意 | `T-01/case-23-step-16-tag-warning.mjs` |
| 24 | 42 | 找 remote-tracking 前缀那句 | 说明 `origin/main`、`origin/crew/` 这两个前缀也要换成真实远端名 | `T-01/case-24-remote-name-prefixes.mjs` |
| 25 | 43 | 找「guard 的理由点名审批文件」那句 | 在，并说明不是权限问题 | `T-01/case-25-guard-reason-approval-file.mjs` |
| 26 | 11 | 只读地跑 `git diff --stat HEAD` 和 `git status --porcelain` | `package.json` 不在改动里；`host/` 下的改动只在 CRD 允许的文件里 | `T-01/case-26-repo-diff-scope.mjs` |

## 不能在这里跑 / 只能部分验证的

- **检查 1（`npm test` 四项全绿）**：不写成用例，因为那就是把工程师的测试抄一遍。
  直接跑 `npm test` 并在报告里贴真实输出。
- **检查 3 的「一条不漏」**：六条设计决定是散文，用例只能钉住每条的关键命令或关键词。
  措辞好不好由 doc-reviewer 判。
- **检查 11 的「按任务核对」**：工作副本是脏的，而且 DoD 版本 12 说另一个会话也在改
  `roles/pm.md`，所以「哪一行属于哪个任务」无法从工作树判断。用例只验证
  `package.json` 不在改动里、以及 `host/` 下出现了哪些文件，其余照实报告。
- **检查 11 与 CRD 0003 可能自相矛盾**：检查 11 写「`host/` 下只允许 `host/git-guard.js`」，
  而检查 48-52（T-07）要求改 `host/crew.js`。这是 DoD 自身的矛盾，先记为发现。

## 计划与实际的差别（跑完之后补记，计划本身没有改）

- 用例 26（检查 11）：写计划时工作副本是脏的，跑用例时 PM 已经把三个提交提交上去了，
  工作树变干净。所以用例改成读**提交历史**（按提交标题里的任务标记找），按任务核对文件
  清单——比读工作树更接近检查 11 的原话「按任务核对」。
- 检查 1（`npm test`）按计划没有写成用例，直接跑。
