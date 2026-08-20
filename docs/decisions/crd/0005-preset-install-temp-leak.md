# CRD 0005：`verify-preset-install.mjs` 每次运行都漏临时目录

## 谁提的

QA 在本作业的检查里发现（第 4 条缺陷，标为 optional、pre-existing）。PM 复测确认后报给
用户，用户说「let's work on those unresolved」，所以纳入本次作业。

## 想要什么

让 `tools/verify-preset-install.mjs` 跑完之后不留临时目录。

## 为什么

它用 `mkdtempSync` 建了四个临时目录（第 44、84、93、103 行），全程没有 `rmSync`。所以
**每跑一次 `npm test` 就在 `/tmp` 里留下 4 个 `crew-home-*`**。PM 实测本机已经堆了 570 个
（QA 测的时候是 554，之后又跑了几次 `npm test`）。

这正是本次作业对 `tools/verify-guard.mjs` 已经提出的同一条要求（验收检查 33：用例区段
包在 `try` / `finally` 里，`rmSync` 一定会跑）。一个检查脚本要求别人清理、自己不清理，
是双标；而且这些目录是 throwaway `DSH_HOME`，堆多了会让人分不清哪个是真的。

## 会动到什么

`tools/verify-preset-install.mjs`，只有它。不动 `host/`，不动 `package.json`。

## 代价

不用重做任何已完成的工作。这个文件不在本作业其他任何任务的名单里。

风险：清理写错会让检查本身变绿却什么都没测（例如在断言之前就删掉目录）。所以要测试
先行：先让一个用例证明「跑完之后目录不存在」，看它红，再改。

## 决定

accepted。用户决定（「let's work on those unresolved」）。

## Applied

`docs/crew/dod.md` 版本 19。
