# CRD 0026：`principles.md` 就是那份 WHY 文档，而且随 npm 包发布

- **状态**：**accepted**（用户，2026-08-22）
- **谁提的**：**用户**
- **谁写的**：PM

## 用户要的是什么（逐字，四句，按他说的顺序）

> ok, but move the WHY to a ref doc, pm.md only has WHAT and HOW

> let's just not do any restrict for now

> why doc should go with npm

> actually I think principle is the why doc / and it should go with npm

**所以三件事**：

1. **`roles/pm.md` 只留 WHAT 和 HOW**，理由搬去一份参考文档。
2. **那份参考文档就是已有的 `principles.md`**——不新开一份。
3. **`principles.md` 随 npm 包发布。**
4. **`roles/pm.md` 的行数暂时不设任何限制**（既不设整文件上限，也不设按节／按步骤的上限）。

## 为什么这个选择比新开一份好

**它给「理由」一个家，而不是两个。** 本作业刚为「一份东西两个真相」写了
`docs/qa/gaps.md` 第 39 条；新开一份 WHY 文档会立刻造出第二个真相，
而两份说同一件事、说法不一样，正是本作业花整轮消灭的形状（Part B 那 12 条）。

## PM 量出来的事实（决定这件事怎么做）

**一、`roles/pm.md` 里理由只占 8% 的词。**
带理由标记的句子 49 / 855，词数占 8%。**所以搬走 WHY 不会让那个文件变短到能读**
（1900 → 约 1750）。**真正吃体积的是 WHAT 和 HOW 本身**：
一节「Team lane, step by step」1354 行（**71%**），四个步骤（第 9、10、4、17）785 行（**41%**）。
**搬 WHY 买到的是边界干净，不是短。** 「怎么让这个文件能读」是另一件事，本作业不做。

**二、真重复只有 29 处（≥12 词、不重叠），而且大部分是正当的。**
合并能省 30–50 行，**约 2%**。所以合并不是出路。

**三、句长可以读**：853 句，中位数 **19 词**，平均 23 词；超 25 词的 33%，超 50 词的 5%。
最长的连续散文块 27 行，超过 8 行的块 16 个——那 16 个是读起来最累的地方。

**四、一个避开了的陷阱**：`roles/` 已经在 `files` 里，所以「把 WHY 放进 `roles/why.md`」
看起来是零打包改动——**但那会撞坏十几处检查**，它们把 `roles/` 下每一个 `.md` 都当成
角色提示词（要求以 `# Crew role: ` 开头、≥500 字节、点名 `docs/design/tasks.md`……）。
`principles.md` 在顶层，避开了它。

**五、随包发布之后指空的路径是 17 处，不是 103 处。**
**PM 第一次报的 103 是错的**——那是一条没分类的粗 grep。真实分布：

| | 处数 | 怎么处理 |
| --- | --- | --- |
| **具体文件**（本仓库独有，发出去指空） | **17** | **清掉**（用户选的） |
| **通用目的地**（任何仓库里都成立） | **96** | **一处不动** |

那 96 处是 `docs/design/tasks.md`（20）、`docs/qa/gaps.md`（9）、`docs/qa/`（8）、
`docs/design/`（8）、`docs/qa/<task-id>/`（6）、`docs/decisions/adr/`（5）这类
——**crew 在任何仓库里都真的往那里写东西**，动它们是错的。
这条分辨就是 `gaps.md` 第 26 条的**目的地 vs 指针**。

那 17 处落在 10 个文件上：`crd/0006`、`crd/0010`、`crd/0011`、`crd/0012`、`crd/0013`、
`crd/0014`、`crd/0019`、`crd/0021`、`crd/0023`、`docs/research/document-types.md`。

**六、三件随包发布会变、但可以留的东西**：「被否掉的想法」那张表、3 处 `T-<数字>`、
以及「这个仓库丢过 75 条检查」这类**故事**。它们**不指向任何地方**，
而它们恰恰是 WHY 最有价值的部分。

## 这一条退掉了 B9 的一半理由，写下来

**B9（本作业的一项）禁「角色提示词按编号指 `principles.md`」，理由就是那个文件不发布。**
一旦它发布，那种指针**不再是错的**。

- T-84 删掉 `roles/pm.md` 第 2 步那个「原则 22」指针——**它做的事不算错，但它的依据消失了。**
- `docs/qa/T-67/case-03-no-principles-by-number.mjs` 和 T-84 在
  `tools/verify-mount.mjs` 加的那道钉子，现在守着一条**理由已经不成立**的规则。

**PM 不在这一份里决定要不要退掉那条禁令**——那是另一个决定，而且它会让两条 QA 用例
和一道钉子变成「守着一条没有理由的规则」。**在里程碑评审上问用户。**

## 代价

1. **包变大**：`principles.md` 今天 1937 行 / 约 100 KB。
2. **`CLAUDE.md` 里有一句话变成假的**：「it is for contributors and is not published to npm
   (the `files` list does not name it)」。要改。
3. **多一份要跟着改的发布物**：以后改 `principles.md` 就是改用户看得到的东西。
4. **B9 的依据退掉了一半**（上一节），而它的两道钉子还在。

## 决定

**accepted。** 用户 2026-08-22。

## Applied

- `docs/decisions/crd/0026-*.md`（本文件）→ 新增
- **等 T-97 做完**再在这里写下 `package.json`、`principles.md`、`CLAUDE.md` 的新版本
