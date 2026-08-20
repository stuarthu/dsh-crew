# CRD 0002：给 `<job-slug>` 定形状

## 谁提的

用户。两轮安全评审都提了它（第 1 轮列为 pre-existing，第 3 轮说它是第 17 步最大的
单点风险），PM 把它带给用户，用户说加进来。

## 想要什么

用他的话：「add it」。

即：规定 `<job-slug>` 只能用小写字母、数字和 `-`，在第 6 步强制执行，并且用检查脚本
钉住这条规则。

## 为什么

`<job-slug>` 现在没有任何形状要求，而它被拼进两类地方：

- **文件路径**：第 6 步的 `~/.dsh/crew/jobs/<job-slug>/state.json`。带 `..` 的 slug
  能写到作业目录外面。
- **shell 命令**：第 7 步的 `git switch -c crew/<job-slug>`，以及新写的第 17 步里
  几乎每一行 git 命令。带空格或 `;` 的 slug 会变成好几条命令。

关键在于这些命令跑在**谁**的会话里：PM 就是 root agent，`host/git-guard.js:253`
对它直接放行。所以一个形如 `x; git push origin main` 的 slug，在子 agent 那里会被
guard 拦住（`main` 是受保护分支），在 PM 自己的会话里不会。第 17 步每一条新命令都
建立在「这个变量可信」之上，而现在没有任何东西让它可信。

## 会动到什么

- `docs/crew/dod.md`：新增任务 T-06 和验收检查 44-46。
- T-06：`roles/pm.md`（第 6 步）、`tools/verify-mount.mjs`（钉住这条规则）。
- 不动 `host/`。这是提示词层面的规则，不是中间件规则——slug 是 PM 自己取的，不是
  外部传进来的输入。

## 代价

不用重做任何已完成的工作。但**必须排在 T-01 的打磨轮之后**：那一轮拥有的正是
`roles/pm.md` 和 `tools/verify-mount.mjs` 这两个文件，两个工程师不能同时改。

## 决定

accepted。用户决定。

## Applied

`docs/crew/dod.md` 版本 9。
