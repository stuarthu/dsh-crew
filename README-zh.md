# dsh-crew

> **版本 0.12.0。**

dsh-crew 是 DeepSeek Harness（dsh）的一个插件。它把你的 dsh 会话变成一个产品经理
（PM），由 PM 调度一组角色代理：架构师、工程师、测试工程师、代码工程师、QA、
代码评审、安全评审、文档评审和研究员。

## 它是什么

你跟 PM 说话。PM 为工作启动角色代理，每个决定都写进留在仓库里的文档。

两条通道：

- `ask` —— 你想要一个答案。PM 回答。什么都不改。
- `team` —— 你想要一个改动。PM 跑整个团队：每个改动一个任务、一轮 QA、每类评审
  一轮，然后一次提交。推送和发布仍然每次都要你自己点头。

## 安装

```sh
dsh plugin --profile tui add dsh-crew     # 或 --profile web
```

重启 dsh。会话选 **Crew** 预设。

## 快速开始

1. 安装插件（见上）。
2. 重启 dsh。
3. 会话选 **Crew** 预设。你的会话变成 PM。
4. 问一个问题，或者要一个改动。

## 配置

全部可选。设置在两个地方：

- 你 profile 的 `cordis.patch.yml` 里的 `dsh-crew-core` 和 `dsh-crew-git-guard` 行：
  角色目录、同时存活的代理数、评审轮数、作业目录和 git 保护。
- `dsh-crew-roles` 行：每个角色的工具和模型。它在哪个文件里取决于你的 dsh。
  dsh 0.1.x 上是插件装好的那份预设：`~/.dsh/.agent-presets/crew/agent.cordis.yml`。
  dsh 0.2.x 不再读那个目录，而是读 `preset-crew` 行——就在插件自己的
  `cordis.patch.yml` 里；你 profile 的 `cordis.patch.yml` 可以用这个行 id 覆盖它。
  角色过滤要写进你的 dsh 真正会读的那个文件。

## 许可

MIT
