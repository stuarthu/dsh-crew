# dsh-crew

在 [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) 里，
用一个小团队（多个角色 agent）来完成工作。

你自己的 dsh 会话会变成**产品经理（PM）**。PM 是唯一直接和你对话的角色。它先写清楚
"什么算做完"，请你确认，然后启动**架构师**做设计、**工程师**写代码、**评审**来把关。
各角色之间不能互相说话——他们通过磁盘上的文件协作，消息由 PM 转达。

> **0.4 版本。** 包含 PM、调研、架构师、工程师、QA、代码评审、安全评审、文档评审；
> 并且能在你许可下推送、监控 CI，中断后还能接着干。

## 两个平面

dsh 把面向模型的工具放在**agent 预设（preset）**里，而不是 profile 里。dsh-crew 遵循
这一点，把自己拆成两半：

| 部分 | 放在哪 | 为什么 |
| --- | --- | --- |
| PM 规则 | 宿主平面（你的 profile） | 它不需要任何工具，所以在任何预设、任何会话里都生效 |
| 角色工具 | `crew` agent 预设 | 角色的白/黑名单会在子 agent 启动时按预设的工具集校验，名字必须和预设定义在同一个地方 |

安装插件后，预设会被写入 `$DSH_HOME/.agent-presets/crew`。想用角色，就把会话切到
**Crew** 预设。在别的预设里，PM 依然是 PM，它会发现自己没有角色工具，并请你选择：
换到 crew 预设，还是由它自己独立完成。

crew 预设就是 dsh 自带的 `standard` 预设，只改了一处：去掉 `subagent`、
`subagent_fork`、`workflow`、`ralph` 和产品化子 agent，换成 crew 角色。所以在这个预设
里，**只有 crew 角色能启动 agent**。

## 为什么团队是"扁平"的

dsh 对 agent 有三条硬规则，本设计完全按它来：

| dsh 规则 | 在这里意味着 |
| --- | --- |
| 消息只能发给**直接子 agent** | 每个角色都是 PM 的直接子 agent，PM 能联系所有人 |
| 子 agent 只能回复**直接父 agent**（`report`） | 所有回答都回到 PM |
| 两个子 agent 之间**完全不能**通信 | 角色之间用文件协作，不用聊天 |

如果由架构师去启动工程师，PM 就完全联系不到工程师了。所以只有 PM 能启动 agent。

## "角色"到底是什么

角色不是 PM 临时粘贴的一段提示词，而是基于 `@deepseek-ai/dsh-tool-subagent` 生成的
真实委派工具：

| 角色 | 工具 | 人设文件 | 可用工具 |
| --- | --- | --- | --- |
| 调研 | `crew_researcher` | `roles/researcher.md` | **只有** `read`、`glob`、`grep`、`write`、`web_search`——没有 shell |
| 架构师 | `crew_architect` | `roles/architect.md` | 除 crew 工具外**都能用** |
| 工程师 | `crew_engineer` | `roles/engineer.md` | 除 crew 工具外**都能用** |
| QA | `crew_qa` | `roles/qa.md` | 除 crew 工具外**都能用**——它必须真的跑起来 |
| 代码评审 | `crew_code_reviewer` | `roles/code-reviewer.md` | **只有** `read`、`glob`、`grep` |
| 安全评审 | `crew_security_reviewer` | `roles/security-reviewer.md` | **只有** `read`、`glob`、`grep` |
| 文档评审 | `crew_doc_reviewer` | `roles/doc-reviewer.md` | **只有** `read`、`glob`、`grep` |

所以评审**无法**修改文件，即使它自己想改也不行。人设会作为那个子 agent 自己的系统
提示词固定下来。

评审改用"白名单"，是两次实测逼出来的：

1. 只禁 `write` 和 `edit` 时，它用 `echo hello > file` 照样建出了文件——shell 本身
   就是写文件的工具。
2. 连 `bash` 也禁掉之后，它自己报出来的工具里仍有 `workflow`、`ralph` 和一整套控制
   桌面的 MCP 工具——每一个都是缺口。

黑名单永远列不全"以后才装上的工具"，白名单不需要列。diff 由 PM 贴进评审任务里，
需要跑的命令也由 PM 代跑。

名单之下还有两道保险：

- 每个角色工具都设了 **`maxDepth: 1`**——只有根节点的 PM 能启动角色，而且它不依赖
  任何工具名，改预设也削弱不了它。
- crew 预设本身去掉了其他所有启动 agent 的方式，角色无法绕过名单从 `workflow`、
  `ralph` 或裸 `subagent` 走。

### 修改角色

角色人设就是 `roles/` 下的普通 markdown。把文件复制到 `~/.dsh/crew/roles/`，用同名
即可替换自带版本。唯一限制：提示词里不能出现 `{{`——dsh 会把它当变量解析，插件会在
启动时直接报错并告诉你是哪个文件。

角色的工具名单和按角色指定模型，配置在角色所在的位置：
`~/.dsh/.agent-presets/crew/agent.cordis.yml` 里的 `dsh-crew-roles` 那一行。

这个文件在装好的 preset 文件夹里，而 dsh-crew 升级时会整个替换该文件夹。你改过的
文件会以 `agent.cordis.yml.bak` 的名字留在旁边，启动日志也会点名——但里面的设置
**不会**自动回来。升级之后，请把你的改动重新抄进新文件。

## 一次任务怎么跑

1. PM 先给你的需求分档：`ask`（只回答）、`quick`（直接做）、`team`（完整流程）。
   如果规模判断不清，它会问你。
2. 它会问用哪种语言。它绝不猜。
3. 它会盘问你——一轮只问一个问题，每个都带推荐答案；你回答之后它才问下一个，
   绝不会一次丢给你一串问题。它会先在仓库里查清所有能查到的事实。
   凡是"查一下"不够、需要真正挖掘的，它会启动 `crew_researcher`：每条结论都要给出
   来源，所以只有文件回答不了的问题才会问到你。
4. 它决定写哪种文档并写出来：小活写 **DoD**（`docs/crew/dod.md`），真正的产品写
   **PRD**（`docs/crew/prd.md`）。它会说明选了哪种，一个词就能换。**开工前必须你确认。**
5. PRD 类任务会启动 `crew_architect`，产出高层设计、决策记录（ADR）和任务拆分；
   然后必须由 `crew_doc_reviewer` 通过，才允许写第一行代码。
6. 它创建 `crew/<任务名>` 分支，每个任务启动一个 `crew_engineer`。只有当两个任务的
   文件列表不重叠时，工程师才会同时跑。每个工程师都**先写测试**：先写一个单元测试，
   跑一遍，确认它是因为"功能还不存在"而失败，然后才写刚好能让它通过的最少代码。
   它的汇报里必须给你看先失败的那次运行，再看通过的那次运行。如果工程师认为某个任务
   没法先写测试，它必须先问 PM，在得到答复前一行代码都不写。
7. 每个完成的任务按顺序过三道关：**代码评审**（先正确性，再看驱动这次改动的测试，
   然后是复用、能否更简单、可读性，以及是否符合本仓库自己的代码风格——这几项评审员
   也可以判定为"阻塞"，但前提是它必须给出它想要的具体替代写法；给不出就只能记为
   "可选"）→
   **安全评审**（仅当改动涉及网络、登录鉴权、密钥、项目外的文件、shell、用户输入、
   客户数据或新依赖时）→ **QA**（先按文档写测试计划，**之后**才看代码，然后真的跑）。
   任何评审的第二轮都只复查"阻塞项"；超过轮次上限，PM 会把分歧交给你决定。
8. PM 负责提交——工程师完全不碰 git。只暂存该任务拥有的文件，绝不 `git add -A`。
9. PM 会把仓库 README 更新到与成果一致。`README.md` 永远是英文；如果这次任务你选了
   别的语言，它会在旁边再维护一个内容相同的文件，例如 `README.zh.md`、
   `README.ja.md`。如果这次改动读者根本看不到，它就不动 README，并在总结里说明。
10. 最后再由 `crew_doc_reviewer` 通读这次产出的所有文档，README 也在内。它检查文档
    能不能照着开工、是否前后一致（同一个东西只用一个名字、格式统一、多语言版本内容
    一致），以及是否好读——读者设定为大约 14 岁、母语不是英语的人。它靠"数"出来判断：
    句子多长、有没有俚语、有没有没解释就用的术语，而不是凭口味。措辞问题它也可以判为
    "阻塞"，但前提是它必须自己写出替换的句子。
11. **推送与 CI，前提是你许可。** PM 先确认远端、workflow 和可用的 `gh` 都在，然后
    **每一次推送前都问你**——包括修完之后的再次推送。它只推 `crew/*` 分支，盯住这次
    运行，CI 挂了就把真实报错发回给拥有这些文件的工程师。`main`、标签和强制推送始终
    被拦住，谁说都不行。

文档放在仓库里（`docs/crew/`）。任务状态放在仓库外的
`~/.dsh/crew/jobs/<任务名>/state.json`，这样 `git status` 保持干净。

## 中断之后

光有状态文件还不够——下一次会话得**知道**它的存在。所以 dsh-crew 每一轮都会读任务
目录，只要还有没做完的任务，就把一段简短提示摆到 PM 面前：

```
Unfinished crew work: 1 job left in /home/you/.dsh/crew/jobs.

- "add-sso-login" in /home/you/project (branch crew/add-sso-login):
  5 of 9 tasks done, 2 blocked. Last change 2026-08-18 09:12.
```

PM 必须先告诉你，再问一个问题：继续，还是重来。没有你的回答，两件事它都不会做。
属于别的目录的任务会被忽略；读不出来的状态文件会如实报告，而不是当作已完成。
把 `resumeNotice` 设为 `false` 可以整体关掉。

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

然后重启 dsh。启动时会把 `crew` 预设写入 `$DSH_HOME/.agent-presets/crew`（如果那里
已有别人写的 `crew` 文件夹，则原样保留）。要用角色，请把会话切到 **Crew** 预设。

不启动 dsh 也可以自检：

```sh
npm test        # 重放 git 保护规则与插件挂载检查，不需要 dsh
```

## 配置

全部可选，各自放在所属的平面。

**PM 与 git 保护**——你 profile 的 `cordis.patch.yml` 里 `dsh-crew-core` 和
`dsh-crew-git-guard` 两行：

| 配置 | 默认值 | 作用 |
| --- | --- | --- |
| `rolesDir` | `~/.dsh/crew/roles` | 用同名文件替换自带的角色人设 |
| `limits.liveAgents` | `4` | 同时活跃的团队 agent 数 |
| `limits.agentsPerJob` | `20` | 单个任务最多用多少个 agent |
| `limits.reviewRounds` | `3` | 评审轮次上限，超过就交给你决定 |
| `installPreset` | `true` | 是否把 `crew` 预设写入 `$DSH_HOME/.agent-presets` |
| `jobsDir` | `~/.dsh/crew/jobs` | 任务状态存放位置，也是中断提示读取的位置 |
| `resumeNotice` | `true` | 会话开始时把未完成任务摆到 PM 面前 |
| `enabled`（保护） | `true` | 关闭 git 保护——不建议 |
| `approvalFile` | `~/.dsh/crew/push-ok` | 一次性推送审批文件 |

**角色**——`~/.dsh/.agent-presets/crew/agent.cordis.yml` 里的 `dsh-crew-roles` 一行：

| 配置 | 默认值 | 作用 |
| --- | --- | --- |
| `rolesDir` | `~/.dsh/crew/roles` | 同样的人设覆盖目录 |
| `roleAllow` | 评审：`read, glob, grep` | 该角色只能用这些，其余一律关闭 |
| `roleDeny` | 生产角色：crew 工具 | 该角色除这些外都能用 |
| `roleModels` | 会话模型 | 按角色指定 provider 和 model |

## 许可

MIT
