# CRD 0009：QA 的用例进 `npm test`，并且每次推送都在 CI 里跑

## 谁提的

用户。他先问「why qa write docs/crew/qa folder?」，接着说 QA 用例该进项目自己的测试目录；
中间搁置过一次（「I need to consider it first」），最后定：「for 5, qa test in npm and ci,
I agree」，并在 PM 问「只接进 `npm test`，还是再加一个 workflow」之后给了形状：
「how about ci npm test only on push, ci release only on tag」。

## 想要什么

1. **`npm test` 跑 QA 的用例**：`package.json` 的 `test` 脚本末尾加上
   `bash docs/crew/qa/run-all.sh`。
2. **新增 `.github/workflows/test.yml`**，在 **push** 上跑 `npm test`。
3. **`publish.yml` 保持只在 `v*` tag 上触发**，并且**继续**在发布前跑 `npm test`——一个
   发布不能因为「推送时已经跑过」就不再自测。
4. 跟着改规则：`principles.md` 第 13 条那句「a runner that only looks inside configured
   folders will not see `docs/crew/qa/` … the PM either adds the one config line or records
   the cases as not runnable」——现在那一行配置**加上了**，所以「not runnable」这个结局不
   再是默认；`roles/qa.md`、`CLAUDE.md`、两份 README 里相应的说法一起改。

## 为什么

这个仓库现在的状态是：QA 写了 42 个用例、278 项断言，但它们**不在 `npm test` 里，也不在
任何推送的 CI 里**——只有人记得手敲 `bash docs/crew/qa/run-all.sh` 才会跑。而
`.github/workflows/publish.yml` 是唯一的 workflow，只在 `v*` tag 上触发，所以在这个仓库里
**普通推送没有任何 CI**。

一个不在默认测试命令里的套件会烂掉，这是时间问题不是意志问题。而「只接进 `npm test`」还
不够：因为 `publish.yml` 第 84 行跑 `npm test`，所以那等于「只有发布的那一刻才在 CI 里
跑」——那时候发现回归已经太晚。

## 已知的代价，写下来

1. **`npm test` 会变慢，而且会随作业数量增长。** QA 用例是按作业累积的资产，第 N 个作业
   写的用例会挡住第 N+1 个作业的无关改动。这正是它该做的事（回归），但代价是真的：以后
   某天要么分层（快检查 / 全套），要么给 `run-all.sh` 一个只跑最近 K 个任务的模式。
   今天不做，记下来。
2. **CI 里 `verify-mount.mjs` 会跳过角色工具那一半。** `@deepseek-ai/dsh-tool-subagent`
   装不上公共 npm（它的 peer 没发布），所以 CI 上那半个检查会**出声地跳过**。这不是本
   CRD 造成的，`publish.yml` 现在跑 `npm test` 也一样跳。说清楚，别让人以为 CI 全覆盖。

## 一个 CI 特有的坑，执行时必须查

`actions/checkout` 默认 `fetch-depth: 1`，也就是**浅克隆，没有历史**。而 QA 的
`docs/crew/qa/T-01/case-26-repo-diff-scope.mjs` 会去读「本次作业的提交」。在浅克隆里它要么
失败，要么**悄悄通过而什么都没验**——后者更糟。

执行这条 CRD 的人必须：找出所有会读 git 历史的用例，然后二选一并说明理由——给 workflow
设 `fetch-depth: 0`，或者让那个用例在拿不到历史时**出声地跳过**（不是静默通过）。

## 会动到什么

`package.json`（只动 `scripts.test`，不动版本号）、新文件
`.github/workflows/test.yml`、`principles.md` 第 13 条、`roles/qa.md`、`CLAUDE.md`、
`README.md`、`README-zh.md`、`CHANGELOG.md`。不动 `publish.yml` 的触发条件。

## 决定

accepted。用户决定，形状也是他给的（push 上跑测试，tag 上才发布）。

## Applied

作业文件夹里的 `dod.md` 版本 26。
