# QA 测试计划：T-07（删掉 `agentsPerJob`，`liveAgents` 默认 20）

写这份计划的时间点：**读任何代码之前**。只读了 `~/.dsh/crew/jobs/<job-slug>/dod.md`（版本 12）和三份 CRD。

覆盖的验收检查：48、49、50、51、52。

## 通用规则

- 每个用例用自己的临时 `DSH_HOME`。`host/crew.js` 启动时会把 preset 复制进
  `$DSH_HOME/.agent-presets/crew`，所以这一点是硬要求：**绝不能指向真的 `~/.dsh`**。
- 用假的 ctx 挂载，把 logger 的每一行收下来，把拼给 PM 的提示词收下来，然后断言内容。

## 用例

| # | 检查 | 我做什么 | 必须发生什么 | 文件 |
| --- | --- | --- | --- | --- |
| 1 | 48 | 用默认设置挂载 `host/crew.js`，取出拼给 PM 的提示词；同时读源码 | 提示词里没有 `agentsPerJob`、也没有「一个作业总共多少个 agent」这一行；源码里 `DEFAULT_LIMITS` 没有这个键、没有对应的 `limitOf` 调用 | `T-07/case-01-no-agents-per-job.mjs` |
| 2 | 49 | 用默认设置挂载，看提示词里的两个数字（和源码里的 `DEFAULT_LIMITS`） | `liveAgents` 是 `20`，`reviewRounds` 是 `3` | `T-07/case-02-default-limits.mjs` |
| 3 | 50 | 用 `limits: { agentsPerJob: 30 }` 挂载，收下 logger 的所有行 | 不抛错，挂载照常完成；恰好有一行提到 `agentsPerJob`，并说这个设置项没有了、可以从 profile 里删掉 | `T-07/case-03-legacy-setting-accepted.mjs` |
| 4 | 51 | 用写错的值挂载：`liveAgents: -1`、`liveAgents: "abc"`、`reviewRounds: 0`（不抄工程师那条 `liveAgents: 0`） | 每个都抛错，报错点名那个设置项 | `T-07/case-04-bad-limit-still-throws.mjs` |
| 5 | 52 | 读 `cordis.patch.yml` | 注释示例里没有 `agentsPerJob`；`liveAgents` 写的是 `20` | `T-07/case-05-cordis-patch-comment.mjs` |

## 不能在这里跑 / 只能部分验证的

- 检查 50 的「静默忽略」只能证明「挂载不抛错、提示词里没有它」。「运行时真的不再有单作业
  上限」这件事要靠 dsh 真的跑一个作业才能看到，本仓库跑不了（dsh 不在这里跑），照实说。
- 检查 53（两份 README）不是我的，是 doc-reviewer 的。
