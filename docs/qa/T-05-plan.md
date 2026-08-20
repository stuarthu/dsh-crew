# QA 测试计划：T-05（git guard 的 `push-ok` 边界修复）

写这份计划的时间点：**读任何代码之前**。只读了 `~/.dsh/crew/jobs/<job-slug>/dod.md`（版本 12）和三份 CRD。

覆盖的验收检查：18、19、20、28、29、30、31、32、33、34。

## 通用规则

- 不抄 `tools/verify-guard.mjs` 的用例。我自己搭一个小的挂载壳子（fake ctx），送**我自己**
  挑的命令文本，覆盖 CRD 0001 点名的边界，两种身份都测：**子 agent** 和 **root 会话**。
- 每个用例用自己的临时目录当审批文件的位置，`DSH_HOME` 指向临时目录。
  **绝不读、建、删真的 `~/.dsh/crew/push-ok`**；跑完在报告里确认它仍然不存在。
- 「以前误挡、现在放行」不能只看放行/拒绝：子 agent 推分支本来就要审批文件，所以断言
  的是**拒绝的理由里不再出现审批文件那句话**；root 会话则必须完全放行。
- 需要改 `host/git-guard.js` 来证明「删掉就红」的用例，把仓库需要的部分复制到临时目录，
  在副本里改，绝不动仓库。

## 用例

| # | 检查 | 我做什么 | 必须发生什么 | 文件 |
| --- | --- | --- | --- | --- |
| 1 | 19、30、32（放行那半） | 送这些命令：`git push origin crew/push-ok-flow`、`git switch -c crew/push-ok-flow`、`cat docs/push-okay.md`、`ls <审批文件全路径>.bak`、`cat docs/pre-push-ok`、`touch my-push-ok`、`git log --oneline crew/push-ok-flow` | root 全部放行；子 agent 的拒绝理由（如果拒）里不含审批文件那句 | `T-05/case-01-allow-names-around-push-ok.mjs` |
| 2 | 20、32（挡住那半） | 送这些命令：`touch <全路径>`、`touch push-ok`、`rm push-ok`、`echo x >push-ok`、双引号、单引号、`$HOME` 形式、`python3 -c "open('push-ok','w')"`、`echo push-ok \| xargs touch` | 子 agent 和 root **都**被拒，且理由点名审批文件 | `T-05/case-02-still-blocked-approval-file.mjs` |
| 3 | 28 | 把仓库复制到临时目录，从副本的 `host/git-guard.js` 里删掉模式的左边界那一半，跑 `node tools/verify-guard.mjs` | 非 0 退出（工程师的用例真的钉住了左边界） | `T-05/case-03-left-boundary-mutation.mjs` |
| 4 | 29 | 读 `host/git-guard.js`：边界字符集里的 `-` 是否写成 `\-`；模式的构造是否在 `apply()` 里、每次挂载只建一次 | `\-` 在；`new RegExp` 只在挂载路径上出现一次，不在每条命令的路径上 | `T-05/case-04-escaped-dash-single-build.mjs` |
| 5 | 31 | 用文件夹形状的 `approvalFile` 挂载：`~/.dsh/crew/`、`<tmp>/x/`、以及 basename 为空的写法 | 挂载抛错，报错文本里说清怎么改（点名这个设置项、说要给一个文件） | `T-05/case-05-folder-shaped-approval-file.mjs` |
| 6 | 34 | 读 `host/git-guard.js` 的 "Honest limits" 段 | 两句实话都在：命令只要提到这个名字就会被拒（连 root，举了 commit message 的例子）；shell 拼出来的名字仍然能过去 | `T-05/case-06-honest-limits.mjs` |
| 7 | 33 | 把仓库复制到临时目录，故意让 `tools/verify-guard.mjs` 中途抛异常，跑它，然后看它建的临时目录 | 脚本非 0 退出，且它自己建的临时目录被删掉了（`finally` 真的跑了） | `T-05/case-07-temp-dir-cleanup.mjs` |
| 8 | 18 | 读 `tools/verify-guard.mjs`：两条老用例（「agent 不能自己批准自己」、「连 root 都不能写审批文件」）还在，且期望值仍是「被拒」；再用我自己的壳子独立验证这两个行为 | 两条都在、都还是「被拒」；行为独立复现 | `T-05/case-08-existing-cases-intact.mjs` |

## 不能在这里跑 / 只能部分验证的

- **检查 18 的「全绿」**：直接跑 `node tools/verify-guard.mjs`，不写成用例（那是工程师的
  测试）。报告里贴真实输出。
- **检查 29 的「只建一次」**：只能从源码结构判断（构造语句在 `apply()` 里、不在每条命令
  的函数里）。这是一条静态检查，我会在报告里说清它是静态的。
- **检查 33**：`try` / `finally` 的存在是静态检查；「`rmSync` 一定会跑」用「故意让它中途
  失败、然后看临时目录还在不在」来做行为验证。

## 计划与实际的差别（跑完之后补记，计划本身没有改）

- 用例 2 里的四条命令（`touch <全路径>`、`touch push-ok`、`rm push-ok`、`echo x >push-ok`）
  和检查 32 点名的六种写法，和工程师的用例是同样的输入——因为验收检查逐字点名了它们。
  其余输入是 QA 自己挑的（改名、软链接、`bash -c`、全路径删除等），壳子也是自己搭的。
- 检查 32 里「用默认设定挂载」那一条**没有**自己再写一遍：那条用例的全部意义就是「不碰
  真的 `~/.dsh`」，再抄一份只会多一份风险。改成在用例 8 里断言工程师那条用例还在、
  而且仍然只送非 push 命令。
