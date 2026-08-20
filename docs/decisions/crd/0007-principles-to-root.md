# CRD 0007：`docs/principles.md` 搬到仓库根目录

## 谁提的

用户：「I think the principle.md should not be put in docs/ but in the root dir,
docs seems is for all the crew files, no?」，PM 量过代价并建议搬之后，他说「move it」。

## 想要什么

`docs/principles.md` → `principles.md`（仓库根目录），并改掉所有指向它的引用。

## 为什么

这是 CRD 0006 那条线（**按寿命分家**）的延伸，只是这次分的是目录而不是文件。

`docs/` 现在混着两种寿命完全不同的东西：

- **产品文档，永久维护**：`principles.md`。它是 `CLAUDE.md` 的同辈，两个是一起读的，
  `CLAUDE.md` 本来就指着它。
- **作业产物，只会累积**：`docs/crew/crd/`、`docs/crew/qa/`，以及 CRD 0006 之后会出现的
  `docs/crew/adr/`。这些是「在这个仓库上跑 crew」产生的东西。

把仓库里**最持久**的那份文档放在一堆累积产物旁边，就是让 `docs/` 看起来像「crew 的
文件夹」的原因。搬完之后 `docs/` 只剩 `crew/`，意思就干净了：docs 里的东西是 crew 产出的。

## 会动到什么

- `docs/principles.md` → `principles.md`（用 `git mv`，保住文件历史）。
- 指向它的 9 处引用，分布在 4 个文件：`CLAUDE.md`、`CHANGELOG.md`、
  `docs/crew/crd/0004-parallel-by-default.md`、`docs/crew/crd/0006-split-by-lifetime.md`。
- **没有任何 `roles/*.md` 引用它**，所以不碰另一个会话的文件。
- `principles.md` 自己那 49 处引用（`roles/...`、`docs/crew/...`）是散文里的仓库相对
  路径，搬到根目录仍然正确，不用改。

## 代价

很小。`package.json` 的 `files` 是显式列表，`principles.md` 不在里面，所以它在根目录
也一样**不会进 npm 包**——发布内容一个字节都不变。

反面（记下来）：根目录的 markdown 从 5 个变 6 个，而这是个 600 多行的文件。

## 看过但没做

把 `crew/` 提到根目录、去掉 `docs/` 这一层。要动所有指着 `docs/crew/` 的规则，包括另一个
会话刚交付的三个角色文件，churn 大得多。不做。

## 决定

accepted。用户决定。

## Applied

作业文件夹里的 `dod.md` 版本 23（DoD 已按 CRD 0006 搬出仓库）。
