# CRD 0015：两条 DoD 项要不要现在加——allow 列表那个静默的洞，和 `CLAUDE.md` 缺的那一步

## 谁提的

**T-51 的 engineer**，在它的交工报告里（2026-08-21），第八节第 3、4 条。它**没有自己动手**，理由写得对：
两条都超出 `ADR 0010` 定的四条，它不给自己批范围。

## 他们要什么

两条新的 DoD 项：

1. **堵住 `tools/verify-mount.mjs` 里 bash 检查的一个静默洞**（一行代码）。
2. **给 `CLAUDE.md` 的「Adding or changing a role」补一步**，说明加新角色时要同时更新
   `verify-mount.mjs` 里那**三份**显式清单（bash 那份 + 两份文件名清单）。

## 为什么——第一条是一个会打绿的洞，我验过

现在的判断是（`tools/verify-mount.mjs:692`）：

```js
else if (role.deny?.includes("bash")) fail(`${role.toolName} must keep bash: ...`);
```

如果有人把 `engineer` 从 deny 列表改成 allow 列表（这是**合法**的，`verify-mount.mjs` 只要求
「allow 和 deny 恰好有一个」），那么 `role.deny` 是 `undefined`，`?.includes("bash")` 也是
`undefined`——**假值，不 fail**。接着 `failures === shellBefore` 成立，于是它打印：

```
ok    these roles keep the shell they work with: engineer, test_engineer, code_engineer
```

而 `verify-mount.mjs:615` **禁止** allow 列表里出现 `bash`，所以那个角色**确实**没有 shell 了。
**结果：角色悄悄失去了它赖以工作的 shell，而这条专门为此存在的检查打了绿。**

这正是 `ADR 0010` 自己反对的那种失效——它选显式清单而不是按名字模式推，理由就是「按模式推会在一次
改名之后安静地覆盖零个角色还打绿」。同一个病，换了个入口。

## 为什么第二条

`ADR 0010` 明写要给 `CLAUDE.md` 补一步。engineer 查过：**今天没有任何 DoD 承载它**。
`CLAUDE.md` 归 T-60。这和第一轮文档评审第 7 条（两条 `gaps.md` 没人承载）是同一个形状——
只活在 ADR 的散文里，然后丢掉。

## 为什么现在就得决定——这是硬期限

**`tools/verify-mount.mjs` 归 T-51。** 按 `docs/design/tasks.md` 的所有权规则和 `ADR 0013`，
T-51 交工之后，除了两份 persona，别的任务**一律不许再碰它拥有的文件**。

所以第一条只有两种结局：**现在叫醒 T-51 做掉**（它是可续的，上下文原样在），
**或者这个洞在本作业里永远补不上**，要另起一件作业。

第二条没有这个压力，T-60 在 M5，还没开工。

## 它动到什么

| 文件 | 动什么 | 谁 |
| --- | --- | --- |
| `tools/verify-mount.mjs` | 一行：需要 shell 的角色不许用 allow 列表（或者等价地，直接判「这个角色最终有没有 bash」） | **T-51，叫醒它** |
| `docs/design/tasks.md` | T-51 加第 19 条；T-60 加一条 | architect |
| `CLAUDE.md` | 「Adding or changing a role」补一步，点名那三份显式清单 | T-60（M5） |

## 代价

- 第一条：一行代码，加一次变异测试（把 `engineer` 改成 allow 列表，必须变红）。叫醒 T-51 一轮。
- 第二条：T-60 多一条 DoD，几行字。
- **不做的代价**：第一条的洞留在仓库里，而且**本作业之后没人能补**；第二条会像第一轮评审第 7 条
  那样，只活在 `ADR 0010` 的散文里然后丢掉。

## 决定

**rejected。用户决定，2026-08-21，原话「no leave it for now」。** PM 推荐过「两条都做」，用户不采纳。
这份 CRD 不删——它是一条没有走的路的记录。

**后果要写清楚，不许含糊：**

1. **第一条那个洞在本作业里再也补不上了。** `tools/verify-mount.mjs` 归 T-51，交工之后别的任务
   一律不许碰。要补就得另起一件作业。
2. 所以「需要 shell 的角色被改成 allow 列表」这件事，从今天起是一个**已知的、故意留着的洞**：
   角色悄悄没有 shell，而那条专门为此存在的检查打绿。
3. **第二条**（`CLAUDE.md` 补一步）没有承载点，`ADR 0010` 里那句要求因此只活在散文里。

## 知识去哪——这一步不花钱，也不是「做掉它」

被否决不等于被忘记。这两条都进 **`docs/qa/gaps.md`**，那个文件的定义就是「没有任何可跑的用例能
覆盖的东西」的常备清单，由 QA 维护（`roles/qa.md` 第 6 步）。**这不是新的验收检查，是 QA 本来的活**，
所以不需要再动任何 DoD：

- allow 列表那个洞：判断写成 `role.deny?.includes("bash")`，角色改用 allow 列表时它打绿；
  本 CRD 被否决，`tools/verify-mount.mjs` 在 T-51 之后无人可改。
- `ADR 0010` 要求给 `CLAUDE.md` 补的那一步（三份显式清单）今天没有承载点。

第一轮文档评审第 7 条的教训就是：一条只活在 ADR 散文里的要求会丢。**`gaps.md` 是它唯一不会丢的家。**

## Applied

`docs/qa/gaps.md`（QA 写，T-51 的 QA 那一轮），两条。除此之外**没有任何文件因本 CRD 改动**。

## Applied

**还没有。**
