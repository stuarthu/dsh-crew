# ADR 0002：启动日志走一个 `if/else` 的 `bootLog()`，不用 `??`

## 背景
QA 在本次作业刚写下的代码里发现：`host/crew.js` 的启动日志写成
`ctx.logger?.("dsh-crew")?.info?.(note) ?? console.log(note)`。真实 logger 的 `info()`
返回 `undefined`，`??` 于是继续往右走，`console.log` 也跑了一遍——每行都打印两次，
QA 实测是 2。同样的写法在 preset 安装器那条更早的 `.bak` 提示里也有，所以是本来就有的
毛病，本次作业又抄了一份。必须选怎么修。

## 选项
- **A** 保留那行漂亮的单行写法，在外面补个判断把它兜住。改动最小，但两个调用点各留一份
  同样的技巧，而且这行的毛病正是「看起来对」——下一个人还会照抄。
- **B** 抽一个 `bootLog(ctx, note)` 帮手，里面用 `if/else`，两个调用点都走它。多一个
  函数，但两条路径不可能同时跑，跟 `info()` 返回什么无关。

## 决定
选 **B**。`bootLog()` 先取 logger，`if (typeof logger?.info === "function")` 就用它，
`else` 才 `console.log`。四种 logger 形状都只打印一次：没有 `ctx.logger`、`ctx.logger`
不是函数（旧写法在这种情况下直接抛错）、logger 什么都不返回、logger 没有 `info()`。

同一个决定还包含**一条读源码文本的用例**：`tools/verify-mount.mjs` 里有一个 case 把
`host/crew.js` 当文本读，只要还有调用点在 logger 之后掉进 `console.log`，它就红。这个
bug 是抄一行聪明写法抄来的，所以把它抄回来这件事也要被抓住。检查也从「找得到这行」改成
「数它出现几次」。

## 谁要求的
没有人。这是干活时撞上的选择，所以按「有人要求过吗」的判据，它是 ADR 而不是 CRD。

## 出处
`5c102bf`（`git log` 里那条提交信息记的就是这件事），代码在 `host/crew.js` 的
`bootLog()`。
