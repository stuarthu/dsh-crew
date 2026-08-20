# CRD 0008：`docs/crew/` 拆成 `docs/decisions/` 和 `docs/qa/`

## 谁提的

用户：「rename docs/crew to a more meaningful name, you think one」——他让 PM 自己选一个。

## 想要什么

不是改名，是**拆**：

```
docs/decisions/crd/   范围与契约的决定
docs/decisions/adr/   设计决定（CRD 0006 之后才会出现）
docs/qa/              能跑的测试用例
principles.md         仓库根目录（CRD 0007）
```

## 为什么不是改一个名字

因为 `docs/crew/` 装着两种不同的东西，任何单一名字都是妥协：

- `docs/decisions/` —— 对 `crd` + `adr` 精准，对 `qa` 是错的：一个测试用例不是一个决定。
- `docs/records/` —— 两样都盖得住，但几乎没说任何东西。
- `docs/crew/` —— 说的是**谁做的**，不是**这是什么**。这正是用户的不满，而且是对的。

`decisions` 说的正是那两样东西是什么，并且经得起 CRD 0006（那条 CRD 的结论就是「两种
决定都留在仓库里」）。把 `qa/` 提到 `docs/` 下自己一层，还有一个额外好处：**用户仍在
考虑的那个问题**（QA 用例该不该放到项目测试命令找得到的地方）以后要动它时，不会牵动
决定那一堆。

## 会动到什么，以及为什么必须等

仓库里写着 `docs/crew` 的地方有 **146 处，分布在 24 个文件**。其中 **22 处在另一个会话
刚交付的三个文件里**：`roles/doc-reviewer.md` 12 处、`roles/architect.md` 6 处、
`roles/engineer.md` 4 处。

**这个改动比 CRD 0006 的 DoD 搬动危险，所以不能只做一半。** DoD 搬走之后，提示词还指着
旧位置只是「不一致」；而这里一个过期的路径会**让角色照错的地方干活**——一个被告知写到
`docs/crew/api/...` 的架构师，会把那个文件夹重新建出来，而且没有任何检查会发现。

所以：**执行挂起**，和 CRD 0006 一起做，等 `engineer-proposes-fixes` 那件作业收尾。
名字现在定下来，是为了不让这个决定丢在对话里。

## 一起做的顺序（给执行那次用）

1. `git mv docs/crew/crd docs/decisions/crd`，`git mv docs/crew/qa docs/qa`。
2. 改掉 146 处引用，`roles/` 下 7 个文件都要改（含对方那三个）。
3. `docs/crew/qa/run-all.sh` 和 `lib/qa.mjs` 里也有路径，别漏。
4. 跑 `npm test` 和 `bash docs/qa/run-all.sh`，并且确认仓库里再也搜不到 `docs/crew`。
5. 同一次里做完 CRD 0006 的其余部分（决定进 ADR、计划进作业文件夹、
   `roles/pm.md:472` 那句「只有架构师写 ADR」要改）。

## 决定

accepted（名字和形状），**执行挂起**。名字由 PM 选，用户授权。

## Applied

尚未执行。作业文件夹里的 `dod.md` 版本 24 记了这条。
