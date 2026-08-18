# dsh-crew

在 [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) 里，
用一个小团队（多个角色 agent）来完成工作。

你自己的 dsh 会话会变成**产品经理（PM）**。PM 是唯一直接和你对话的角色。它先写清
楚"什么算做完"，请你确认，然后启动**工程师**写代码、**代码评审**来把关。各角色之
间不能互相说话——他们通过磁盘上的文件协作，消息由 PM 转达。

> **0.1 版本。** 只有 PM、工程师、代码评审。还没有架构师、QA、文档评审、调研、安全
> 评审。没有 PRD，不推送，不监控 CI。

## 为什么团队是"扁平"的

dsh 对 agent 有三条硬规则，本设计完全按它来：

| dsh 规则 | 在这里意味着 |
| --- | --- |
| 消息只能发给**直接子 agent** | 每个角色都是 PM 的直接子 agent，PM 能联系所有人 |
| 子 agent 只能回复**直接父 agent**（`report`） | 所有回答都回到 PM |
| 两个子 agent 之间**完全不能**通信 | 角色之间用文件协作，不用聊天 |

如果由架构师去启动工程师，PM 就完全联系不到工程师了。所以只有 PM 能启动 agent。
两道独立的保护来保证这一点：每个角色都被禁用了委派类工具；并且每个角色工具都设置
了 `maxDepth: 1`，所以团队里的子 agent 无法再启动子 agent。

## "角色"到底是什么

角色不是 PM 临时粘贴的一段提示词，而是基于 `@deepseek-ai/dsh-tool-subagent` 生成
的真实委派工具：

| 角色 | 工具 | 人设文件 | 不能调用 |
| --- | --- | --- | --- |
| 工程师 | `crew_engineer` | `roles/engineer.md` | 所有委派类工具 |
| 代码评审 | `crew_code_reviewer` | `roles/code-reviewer.md` | 所有委派类工具、`write`、`edit`、`str_replace_editor` |

所以代码评审**无法**修改文件，即使它自己想改也不行。人设会作为那个子 agent 自己的
系统提示词固定下来。

### 团队对 agent 预设（preset）的要求

在 dsh 里，面向模型的工具是放在**agent 预设**里的
（`~/.dsh/.agent-presets/<预设>/agent.cordis.yml`），不在 profile 层——自带 profile
把工具行全部关掉了。由此有两点：

- 你的预设必须提供委派工具组（`send_message`、`interrupt_agent`、`list_agents`）。
  否则 PM 能启动角色，却无法通知它，整个流程跑不起来。
- 角色禁用列表里的每个名字，都会在**子 agent 启动时**按该预设实际提供的工具校验。
  预设里没有的名字会让启动失败，报 `tools.restrict() names unknown global tool "x"`。
  所以自带的禁用列表很短；真正的保证是 `maxDepth: 1`——它不依赖任何工具名。

如果你的预设还提供了别的启动 agent 的方式（`workflow`、`ralph`、`subagent_codex`
等），用 `roleDeny` 把它们加进去。如果启动失败并报上面那个错，就把它抱怨的那个名字
从 `roleDeny` 里去掉。

## 一次任务怎么跑

1. PM 先给你的需求分档：`ask`（只回答）、`quick`（直接做）、`team`（完整流程）。
   如果规模判断不清，它会问你。
2. 它会问用哪种语言。它绝不猜。
3. 它会盘问你——一次一个问题，每个都带推荐答案，并且先在仓库里查清所有能查到的事实。
4. 它写 `docs/crew/dod.md`：目标、不做什么、验收检查项，以及任务表，每个任务明确
   拥有哪些文件。**开工前必须你确认。**
5. 它创建 `crew/<任务名>` 分支，每个任务启动一个 `crew_engineer`。只有当两个任务的
   文件列表不重叠时，工程师才会同时跑。
6. 每个完成的任务交给 `crew_code_reviewer`：先看正确性，再看复用，再看能否更简单。
   第二轮只复查"阻塞项"。超过轮次上限，PM 会把分歧交给你决定。
7. PM 负责提交——工程师完全不碰 git。只暂存该任务拥有的文件，绝不 `git add -A`。
8. PM 会把仓库 README 更新到与成果一致。`README.md` 永远是英文；如果这次任务你选了
   别的语言，它会在旁边再维护一个内容相同的文件，例如 `README.zh.md`、
   `README.ja.md`。如果这次改动读者根本看不到，它就不动 README，并在总结里说明。
9. 永远不推送。

文档放在仓库里（`docs/crew/`）。任务状态放在仓库外的
`~/.dsh/crew/jobs/<任务名>/state.json`，这样 `git status` 保持干净，中断后也能续上。

## git 保护

`host/git-guard.js` 会检查每一条 shell 命令（包括 PM 自己发的），并拒绝：

- 推送 `main`、`master`、`trunk`、`develop`、`HEAD`，或没有写明分支的推送；
- 任何标签推送、远端删除、`--mirror`、`--all`、强制推送；
- `npm`/`pnpm`/`yarn`/`bun publish`、`npm dist-tag`、`gh release create`；
- 推送到"CI 在 push 时会发布"的仓库；
- 任何碰到审批文件的命令，所以 agent 无法给自己授权。

其他分支的推送需要**你**创建一次性审批：

```sh
mkdir -p ~/.dsh/crew && touch ~/.dsh/crew/push-ok
```

一次推送用掉后，保护会立刻删除该文件。一次审批，只能推一次。

它是基于命令文本判断的，所以更像安全带，而不是一把锁：藏在脚本文件里的命令仍可能
绕过。真正的关口仍然是 dsh 自己的审批弹窗。

## 安装

```sh
dsh plugin --profile tui add dsh-crew     # 或 --profile web
```

然后重启 dsh。不启动 dsh 也可以自检：

```sh
npm test        # 重放 git 保护规则与插件挂载检查，不需要 dsh
```

## 配置

全部可选，详见 `cordis.patch.yml` 里的注释：

| 配置 | 默认值 | 作用 |
| --- | --- | --- |
| `rolesDir` | `~/.dsh/crew/roles` | 用同名文件替换自带的角色人设 |
| `limits.liveAgents` | `4` | 同时活跃的团队 agent 数 |
| `limits.agentsPerJob` | `20` | 单个任务最多用多少个 agent |
| `limits.reviewRounds` | `3` | 评审轮次上限，超过就交给你决定 |
| `roleModels` | 会话模型 | 按角色指定 provider 和 model |
| `roleDeny` | 见上表 | 角色禁用的工具（会替换自带列表） |
| `approvalFile` | `~/.dsh/crew/push-ok` | 一次性推送审批文件 |

角色文件就是普通 markdown。把 `roles/` 里的文件复制出来改好，用同名放进
`~/.dsh/crew/roles/` 即可。唯一限制：提示词里不能出现 `{{`——dsh 会把它当变量解析，
插件会在启动时直接报错并告诉你是哪个文件。

## 许可

MIT
