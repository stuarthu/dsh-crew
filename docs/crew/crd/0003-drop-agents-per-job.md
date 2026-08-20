# CRD 0003：删掉 `agentsPerJob`，`liveAgents` 默认改成 20

## 谁提的

用户。PM 在本次作业里报告「快撞到单作业 20 个 agent 的上限」，用户回答：
「drop agentsperjob, I think it should be unlimited. set liveagents to 20」，
之后 PM 问「只改本次作业，还是也改产品默认值」，用户回答：
「change the product default too」。

## 想要什么

- 删掉 `limits.agentsPerJob` 这个设置项。单个作业能用多少 agent 不再有上限。
- `limits.liveAgents` 的默认值从 `4` 改成 `20`。
- `limits.reviewRounds` 不动（用户没提，默认仍是 `3`）。

## 为什么

用户的判断：一个作业总共用几个 agent 不该有上限。本次作业就是活例子——
两个 CRD 加三轮评审之后用掉 16 个，剩下的活正好卡在 20，而卡住的时候要砍掉的
恰恰是 QA 和文档评审的返工余量，也就是最后两道关。同时活跃 4 个太少：本次作业里
文件不重叠的任务经常要排队等，纯粹是浪费时间。

## 会动到什么

- `host/crew.js`：`DEFAULT_LIMITS`（第 44 行）、`apply()` 里的 `limitOf` 调用
  （第 205-207 行）、拼给 PM 的提示词里那三行（第 185-187 行）。
- `cordis.patch.yml`：第 27-30 行的注释示例。
- `tools/verify-mount.mjs`：加断言。
- `README.md`、`README-zh.md` 的配置表，和 `CHANGELOG.md` 的一条——这三个文件现在被
  T-02 占着，所以留给 T-02 之后的一个文档任务（T-08）。
- `roles/pm.md` 不用动：三个词在里面出现 0 次，PM 看到的限制是 `host/crew.js` 拼出来的。

## 兼容性（PM 决定，理由写在这里）

已经在 profile 里写了 `limits.agentsPerJob: 30` 的用户，升级后**静默忽略这个设置，
并在启动日志里说一句**（`ctx.logger?.("dsh-crew")?.info?.()`，和 preset 安装器报
`.bak` 文件用的是同一条路）。

不采用「挂载时抛错」：本仓库对**写错的**配置值是抛错的（`limitOf` 对 0 和负数就
抛），但这里的值本身没写错，是这个设置项被产品删掉了。让别人的 dsh 会话因为一个
曾经合法的设置而起不来，代价和收益不成比例。PM 把这个选择告诉了用户，用户说
「change the product default too」，没有反对这条处理方式。

## 代价

不用重做任何已完成的工作。`host/crew.js` 不在 T-01、T-05、T-06 的文件名单里，
`tools/verify-mount.mjs` 的两个拥有者（T-01、T-06）都已交工，所以没有冲突。

## 决定

accepted。用户决定。

## Applied

`docs/crew/dod.md` 版本 11。
