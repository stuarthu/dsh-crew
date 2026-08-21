# 高层设计：双 engineer 形状（`paired-engineers` 作业）

- **版本**：2（v2 收文档评审的九条 blocking：DoD 的验法改成钉目标文件那门语言里的名词、
  占位记号换成英文并说清它不许有常驻用例、`gaps.md` 的两条要求各有了一个承载点、
  `verify-mount.mjs` 那两份显式清单归 T-51 补、`T-56` 拆成 `T-56` 和 `T-62`。
  **v2 定稿时 PRD 是版本 6**：PM 在同一轮里把 M2 的 DoD 编号改成连续的 1–9，本文件里指向 M2
  的条号都按 v6 写。2026-08-21）
- 版本 1（2026-08-21）
- **日期**：2026-08-21
- **依据**：`docs/design/prd.md`（版本 6）、`docs/decisions/crd/0012-paired-engineers.md`、
  `docs/decisions/crd/0013-two-worktrees-per-task.md`、
  `docs/decisions/crd/0014-pair-mode-needs-an-architect.md`。三份 CRD 用户都已 accept，
  **设计是冻结的**。这份文件不重开任何一条决定，它只说这些决定落到这个仓库的哪些文件上、
  按什么顺序落。
- **本仓库的第一份 HLD。** 在这之前没有作业写过（`CLAUDE.md`「State and documents」一节）。

---

## 一、要建的东西，几句话说完

给 crew 加两个新角色：`crew_test_engineer`（只写测试）和 `crew_code_engineer`（只写代码）。
一个任务可以派这两个人，各自在自己的 git 工作树里同时干活，互相看不见。PM 合并两棵树，
**自己跑一次 A 写的那些单元测试**（项目的测试命令会把它们一起跑时就跑项目的测试命令），
**只跑这一次**，把红灯当信号。

今天的单人 `crew_engineer` 一个字不改，继续可用。双人形状是**加**出来的一条路，不是替换。

除此之外，这次作业把这条新规则的**理由**写进 `principles.md`，把**流程**写进
`roles/pm.md`、`roles/architect.md`、`roles/code-reviewer.md`，把**用户看得见的部分**写进
`CLAUDE.md`、两份 README 和 `CHANGELOG.md`。

---

## 二、模块与边界：这里没有模块边界，这是对的

这个仓库是**一个 dsh 插件**，不是多模块服务。它自己不能跑；dsh 加载 `host/` 下的模块和
`preset/crew/` 里的 agent 预设。没有两个会互相说话的模块，所以：

> **一个模块，没有跨模块边界。** 因此**不写** `docs/design/api/` 下的任何契约文件。
> 没有边界契约是对的，不是漏了。

但有一条**真实的缝**，它不是模块边界，却和模块边界一样会硬失败——**两个平面之间的缝**。
下面第三节讲它，第四节讲为什么它值一个 walking skeleton。

**拆分到什么程度**：一个模块都不新建。理由一句话——这次要加的东西，`host/roles.js` 里那张
`ROLES` 表已经是它的注册点，加两行就够；新开一个模块只会多一个边界，而 crew 的 agent
之间连话都说不上，多一个边界就是多一处只能靠猜的对齐。

---

## 三、两个新角色工具落在两个平面上

`CLAUDE.md`「The two planes」那一节是这次改动的地图。dsh 把**宿主平面**（你的 profile，
永远加载，没有模型能调的工具）和**agent 平面**（agent 预设，模型能调的工具）分开。
一个角色工具要真的存在，必须两边都到位：

| 平面 | 文件 | 这次改什么 | 少了它会怎样 |
| --- | --- | --- | --- |
| **共享（两边都读）** | `host/roles.js` | `ROLE_TOOL_NAMES` 加两个名字；`ROLES` 加两项，每项**只有** `deny`；`crew_qa` 的 `summary` 改一行 | `ROLE_TOOL_NAMES` 是每一条 deny 列表的来源，少一个名字，所有角色的 deny 列表都少拦一个 `crew_*`，flat 规则的第一道守卫就有洞 |
| **agent 平面（挂工具）** | `host/roles-preset.js` | **预计不用改**：它对 `ROLES` 做循环，加两项自动多挂两个工具。列在 T-51 名下，是因为万一要改，只有它能改 | —— |
| **agent 平面（定工具集）** | `preset/crew/agent.cordis.yml` | 它加载 `dsh-crew/host/roles-preset.js`；注释里那张「role key」清单（第 221-223 行）和 `roleDeny` 示例（第 237 行）要补上两个新键、两个新工具名 | 注释是这些配置项**唯一**的文档（`CLAUDE.md`：「add it as a commented example in the config file it belongs to」）。清单过期，用户照抄就写出一条缺名字的 deny 列表 |
| **检查** | `tools/verify-mount.mjs` | 角色表检查自动覆盖新角色（它对 `ROLES` 循环）；**bash 检查要手工扩**（见第五节） | 见第五节 |
| **人设** | `roles/test-engineer.md`、`roles/code-engineer.md`（都是新文件） | M1 先写占位但合规的，M3 写实 | `readRoleText` 在**挂载时**读每一份 persona（`host/roles-preset.js:47`）。文件不存在，dsh 启动就抛错——不是这个角色坏了，是**整个会话起不来** |

**为什么 deny 列表而不是 allow 列表——这是被规则定死的，不是选的。** 两个新角色都要跑代码，
所以都要 `bash`。而 `CLAUDE.md` 设计规则 2 写着：allow 列表里不许出现 `bash`。
`tools/verify-mount.mjs:615` 那一行真的在拦。所以它们只能用 deny 列表，和
`crew_engineer`、`crew_qa` 一样。**没有可选项，因此没有 ADR。**

**PM 的提示词不用改。** `host/crew.js:214` 和 `:238` 从 `ROLES` 表**派生**「你的 crew 工具」
那一节，所以两个新角色会自己出现在 PM 的提示词里，`summary` 就是 PM 看到的那句说明。
这也是为什么第七节要认真对待那三行 `summary`。

---

## 四、为什么 M1 是 walking skeleton

`CLAUDE.md`「Design rules a change must not break」第 3 条：

> **allow 或 deny 列表里的每一个名字，都必须在 crew 预设里存在。** dsh 在子 agent 启动时
> 拒绝一个它不认识的名字，所以一个过期的名字是**那个角色的全面瘫痪，不是一句警告**。

把这句话套到这次改动上：`ROLE_TOOL_NAMES` 一加两个名字，**每一条 deny 列表都自动变宽**
（`host/roles.js:48`，`NO_DELEGATION = [...ROLE_TOOL_NAMES]`）。也就是说，
`crew_architect`、`crew_engineer`、`crew_qa` 的 deny 列表**立刻**开始点名
`crew_test_engineer` 和 `crew_code_engineer`。如果预设那边没有真的挂上这两个工具，
那么**每一个用 deny 列表的角色都起不来**——不是新角色坏了，是老角色全死。

这就是这件活最便宜也最狠的翻车点：改一行数组，炸掉三个现有角色。所以先撞它。

**T-51 是唯一允许同时动两个平面的任务**：`host/roles.js`（共享）＋
`preset/crew/agent.cordis.yml`（agent 平面）＋两份占位 persona ＋把检查扩到位。
一个人做，跑真挂载，`npm test` 六条全绿。**别的任务全部等它。**

**它证明什么**：两个名字端到端接通了——角色表有它、每条 deny 列表拦它、预设挂了它、
真挂载能起来、persona 读得到。**它不证明**双人形状好不好用；那是 M3 到 M5 的事。

**它之后的规矩**：T-51 落地之后，**除了两份 persona 文件**，没有任何后续任务可以碰它拥有的文件。
那两份 persona 的所有权按里程碑顺序交接一次，理由和写法见
`docs/decisions/adr/0013-persona-ownership-handoff.md`。

**T-51 必须一次做完的还有一件事：`tools/verify-mount.mjs` 里那两份显式文件名清单。**
一份是 CRD 0006 那份（今天 `["engineer.md", "architect.md", "doc-reviewer.md"]`，要求
`docs/decisions/adr/` 在、`**Decisions** section` 不在），一份是 CRD 0010 那份（今天六个文件，
要求 `docs/design/tasks.md` 在、`DoD section` 在、`dod.md` 不在）。**两份都是显式清单，
两个新 persona 不在里面，所以今天没有任何检查看着它们**；而这个文件归 T-51，交工之后别的任务
不许再碰。所以两份清单在 T-51 里就补齐，两份**占位** persona 也在 T-51 里就带上那三个串
（占位本来要凑够 500 字符）。M3 的两个任务因此可以真的说「这四件事 `verify-mount.mjs` 会验」
——在 T-51 补齐之前，那句话是假的。

---

## 五、`verify-mount.mjs` 的 bash 检查：从一个角色扩到三个

**今天的样子**（`tools/verify-mount.mjs:651-653`）：

```js
if (ROLES.find(role => role.key === "engineer").deny?.includes("bash")) {
  fail("the engineer must keep bash: it has to run the tests it writes");
}
```

`CLAUDE.md` 设计规则 4 自己承认了这个洞：「`verify-mount.mjs` checks the engineer's half
only, so a change that takes `bash` from QA fails no check」。**今天把 `crew_qa` 的 bash
拿掉，一个检查都不会红。** 再加两个靠 bash 活的角色，这个洞变三倍大。

**要变成什么样**：一份**显式的三名清单**——`engineer`、`test_engineer`、`code_engineer`
——每一个都单独判一次，并且**外加一道自检**：清单里的每个名字必须真的能在 `ROLES` 里找到。
少了这道自检，一次改名就让整个检查变成空跑，而它照样打绿——那正是这个仓库反复吃过的那种
失败（`tools/verify-tasks.mjs:75` 的注释：「A green with nothing found is the worst
outcome」）。写成清单而不是从 `ROLES` 里按名字模式推的理由，在
`docs/decisions/adr/0010-bash-check-explicit-list.md` 里。

**注意 `crew_qa` 不在这份清单里**，虽然 QA 也要 bash。理由：本作业**不许改 QA 的任何行为**
（PRD「不在范围内」），而把 QA 加进这份清单是一处新的行为约束，不是这次的范围。
它仍然是 `CLAUDE.md` 规则 4 记着的那个洞，只是范围从「三个里的一个」缩到「QA 一个」。
**这一点必须由 QA 记进 `docs/qa/gaps.md`**，不许悄悄留着。

**「必须记进 `docs/qa/gaps.md`」这句话本身需要一个承载点**，否则它就是 `CRD 0010` 记的那次
事故的同一个形状——检查离它管的工作太远，然后没了。所以它变成**一格 DoD**：T-51 的第 17 条
（这个洞）和 T-52 的第 18 条（没有任何检查能证明一句散文里的用词正确）。
**活由 QA 做**（`docs/qa/` 是 QA 的家，engineer 不碰它），那一格是它的承载点：
没有那一条，任务不算做完。

**怎么证明它真的会红**（M1 的 DoD 第 2 条）：QA 在 `docs/qa/T-51/` 写用例，在临时副本里
分别给三个角色的 deny 列表加上 `bash`，每一次 `node tools/verify-mount.mjs` 都必须变红，
而且失败信息要点名是哪个角色。`docs/qa/lib/qa.mjs` 已经有 `tempRepo` / `edit` /
`expectRed` 这套工具，直接用，不新写。

---

## 六、新开的工作树少一条软链接会安静地变弱

这不是提醒，是 PM 流程里的一步（CRD 0013）。

一棵新的 `git worktree` 里 `node_modules` 是空的。这个仓库便宜到只有一条
`peerDependencies`，而 `node_modules/` 里只有一个东西——一条指向 `~/.dsh` 的软链接。
所以补齐它只要两条命令：

```sh
mkdir -p node_modules/@deepseek-ai
ln -s ~/.dsh/profiles/node_modules/@deepseek-ai/dsh-tool-subagent \
      node_modules/@deepseek-ai/dsh-tool-subagent
```

**少了它不报错，会安静地变弱。** `tools/verify-mount.mjs` 走到 role-tool 那一半时
`import("../host/roles-preset.js")` 失败，它调用 `skip(...)` **出声跳过**，然后继续，
最后打绿。工作树跑的是一套更弱的检查，看起来是绿的。这和 `CLAUDE.md` 说的
「绿色 CI 的意思是公开 runner 能查的都查了，不是全都查了」是同一个坑，只是搬到了本机。

所以：**`roles/pm.md` 的开树步骤里，这两条命令和 `git worktree add` 写在一起，
一棵树一次**（M4 的 DoD 第 3 条，落在 **T-62**）。不是写在「注意事项」里。

---

## 七、三种写测试的角色，必须分清（PRD v2）

`crew_test_engineer` 这个名字容易被读成「测试员」，也就是 QA。**它不是。**

| | `crew_test_engineer` | `crew_code_engineer` | `crew_qa` |
| --- | --- | --- | --- |
| 是什么人 | **程序员** | 程序员 | **QA** |
| 写什么 | **单元测试** | 产品代码 | **QA 用例**（验收、黑盒） |
| 住在哪 | **项目自己的测试套件**，是这个任务拥有的文件，跟代码一起提交 | 产品代码文件 | **`docs/qa/<task-id>/`，别处都不行** |
| 什么时候 | 代码存在**之前** | —— | 代码完成**之后** |
| 管多大范围 | **只管这一个任务** | 只管这一个任务 | 这个任务，**外加把过去每个任务的用例全跑一遍**（回归） |

四条区别缺一不可：粒度（单元 vs 验收）、时机（之前 vs 之后）、家（项目套件 vs `docs/qa/`）、
范围（本任务 vs 全部回归）。

**这张表落在三个地方**：`principles.md` 原则 21（T-52）、两份 README（T-59）、
`roles/test-engineer.md` 的开头（T-53）。

**它还落在一行代码上**：`host/roles.js` 的 `summary`。那一行是 PM 在自己提示词里看到的
唯一一句角色说明（`host/crew.js:214` 从 `ROLES` 派生），所以三行 `summary` 必须自己就能
把三个角色分开。`crew_qa` 现在那句 `"Test the result against the document"` 没提
`docs/qa/`，三个角色并存之后不够分，**所以它也要改**。

> **只改这一行 summary。QA 的行为一个字不改。** `roles/qa.md` 本作业不动。

**为什么这一行的活在 M1 而不在 M3**：`summary` 和两条新 `ROLES` 项是同一个文件、同一段
代码，而两个任务绝不共有同一个文件。所以 T-51 就把三行 `summary` 写成最终版本，
M3 的 DoD 第 6 条在 M3 评审时核对它——**活在 M1 落地，检查在 M3 收**。这一点已经报给 PM。

---

## 七点五、用词：unit test 对 case，以及一次**有边界的**清理（PRD v3）

三个角色都写「测试」之后，「test / 测试」这个字就开始同时指两样不同的东西。所以本作业加一张
**用词表**，四条，进 `principles.md`（T-52）：

| 词 | 指什么 | 谁写 | 住在哪 |
| --- | --- | --- | --- |
| **单元测试**（unit test） | 一个行为一个测试，代码存在之前写 | `crew_engineer` 或 `crew_test_engineer` | 项目自己的测试套件，是任务拥有的文件 |
| **QA 用例**（case） | 验收、黑盒，代码完成之后写 | `crew_qa` | **只在** `docs/qa/<task-id>/` |
| **项目的测试命令** | `npm test`，把上面两样和所有检查一起跑 | —— | `package.json` 的 `scripts.test` |
| **契约测试**（contract test） | 边界两侧各一个（本仓库没有边界，所以现在为零） | engineer | 项目测试套件 |

**规则**：一句话如果可能指其中两样，必须用精确名词。光写「test / 测试」只允许出现在**故意**指
「上面任意一种」的地方。

**不发明新词。** 特别是**不要写「QA test」**——它把「test」这个字又放回来，等于把刚分开的两样
重新粘在一起。这两个名词仓库里本来就有，而且很干净：`roles/qa.md` 里 case/用例出现 51 次、
「QA test」出现 0 次；「unit test」今天已经在四处用了（`README.md:203`、`roles/pm.md:357`、
`principles.md:322`、`roles/engineer.md:63`）。

**用词表放在 `principles.md` 的哪里**，见 `docs/decisions/adr/0014-glossary-placement.md`。
它的小节标题是**英文** `Words we use`——`principles.md` 全文 0 个中文字符，现有两节不编号的
小节也都是英文（`What we looked at and did not take`、`Keeping this file honest`）。

**同一个道理管住整份任务表的「验法」**：钉子要用**目标文件那门语言**里的串。`roles/*.md` 八份、
`principles.md`、`CLAUDE.md`、`CHANGELOG.md` 今天都是 0 个中文字符，所以拿中文串去 grep 它们
的命令**永远不会命中**——它不是一个弱检查，它是一个假检查。只有 `README-zh.md`（361 行中文）
和 `docs/` 下面这些中文文档可以钉中文串。第二轮把任务表里所有这类命令换成了英文名词或路径。

### 清理的边界是硬的

**只清理本作业本来就要动的那些文件**，而且每一处都由**已经拥有那个文件的那个任务**顺手做，
**不新开任务**：

| 文件 | 谁清 |
| --- | --- |
| `principles.md`（原则 6、原则 21、用词表本身） | T-52 |
| `roles/test-engineer.md` | T-53 |
| `roles/code-engineer.md` | T-54 |
| `roles/engineer.md`（只有开头那一句指路） | T-55 |
| `roles/pm.md`（第 4、5 步新长出来的那一段） | T-56 |
| `roles/pm.md`（执行那一段与小作业那条路） | T-62 |
| `roles/code-reviewer.md` | T-57 |
| 两份 README | T-59 |
| `CLAUDE.md` | T-60 |

**明确不做：把整个仓库每一个 bare「test」都改掉。** `roles/pm.md` 一千两百多行、
`principles.md` 一千多行，全库改字是一次巨大且危险的改动，而且大部分位置今天并不含糊——
只有一个 engineer 的时候，「test first」是清楚的。**含糊是新角色带进来的，所以清理跟着新角色
走。** 本设计**不拆**「全库用词清理」这样的任务。

**它可以被检查**（QA 用例，不靠人读）：用词表存在且四条齐全；`roles/qa.md` 里没有
「QA test」这种写法；`roles/test-engineer.md` 说的是单元测试，而且没有任何一句声称自己写
QA 用例。

---

## 八、flat 规则的第四道守卫：`send_message` 查血缘

`CLAUDE.md` 设计规则 1 今天写了**三道**守卫：每条 deny 列表拦所有 `crew_*`；每个角色工具
`maxDepth: 1`；crew 预设删掉 `subagent`、`subagent_fork`、`workflow`、`ralph` 和产品
subagent。**第四道没写，而它比那三道都硬。**

事实链，逐条可查：

| 事实 | 出处 |
| --- | --- |
| `send_message`、`interrupt_agent` 两个控制工具存在，crew 预设真的挂了它们 | `preset/crew/agent.cordis.yml:194-198` |
| crew 的角色工具是**可续的**，所以子 agent 跑完还能被叫醒，上下文原样在 | `host/roles-preset.js:44`，`backgroundMode: "continuable"` |
| `send_message` 把**调用者**当作 `parent` 传进 `ctx.subagents.followup(parent, …)` | `@deepseek-ai/dsh-tool-subagent-control/lib/index.js` |
| dsh 在那里查血缘：`authorizeLineage(parent, childId, parentSession)`，两条都抛 `UNAUTHORIZED` | 函数名 `authorizeLineage`，两条错误串 `delivery requires the exact live parent agent` 和 `belongs to another parent session`。**行号故意不写在这里，也不许写进 `CLAUDE.md`**：那个包是 `peerDependencies`、公开 npm 装不到，行号会随升级烂掉而且没有检查会红；而且 `belongs to another parent session` 在那个文件里出现**两处**（890 和 1338），行号本来就不精确。行号留在 `CRD 0012` 里——CRD 记的是某一刻，烂掉也无害 |

**结论**：一个 crew 子 agent 就算手里有 `send_message`，也发不到自己的兄弟身上——兄弟不是
它的孩子。**这道守卫不依赖任何 deny 列表，也不依赖任何提示词措辞**，所以它是四道里唯一
一道「改配置改不坏」的。

**它对本设计的意义有两面，两面都要写**：

1. **好的一面**：PM 让 A 和 B 各自复查自己那一半（CRD 0012 第 7 条）时，叫醒的是**同一个**
   agent，上下文原样在，不用重写简报。这让第 7 条比原来估的便宜。
2. **它没有重新打开横向通道**：A 发不到 B，B 发不到 A，平台强制，不靠自觉。

**它不管的事**：B 不读测试文件这件事，`send_message` 帮不上也害不着。那件事由两棵工作树
管——写代码阶段 B 的树里根本没有那个文件。

`CLAUDE.md` 从三道改成四道，是 M5 的 DoD 第 1 条（T-60）。

---

## 九、复用了什么，什么是新的

**全部复用，一行新机制都不加。** 这是这次设计最重要的一句话。

| 已经有的东西 | 这次怎么用 |
| --- | --- |
| `ROLES` 表 + `ROLE_TOOL_NAMES`（`host/roles.js`） | 加两项、两个名字。deny 列表自动变宽，这是它设计好的行为 |
| `NO_DELEGATION`（`host/roles.js:48`） | 一个字不改。它从 `ROLE_TOOL_NAMES` 展开，所以新名字自动进每条 deny 列表 |
| `readRoleText`（`host/roles.js:158`） | 一个字不改。它在挂载时读新 persona，长度和 `{{` 检查照旧生效 |
| `roles-preset.js` 对 `ROLES` 的循环 | 一个字不改。两个新工具自动挂上，自动带 `maxDepth: 1` 和 `backgroundMode: "continuable"` |
| `host/crew.js` 从 `ROLES` 派生 PM 提示词 | 一个字不改。新角色自动出现在 PM 眼前 |
| `tools/verify-mount.mjs` 的角色表检查（对 `ROLES` 循环的那几段） | 一个字不改，自动覆盖新角色 |
| `docs/qa/lib/qa.mjs`（`tempRepo` / `edit` / `expectRed` / `runCheck`） | QA 的 mutation 用例直接用，不新写工具 |
| `git worktree`（普通 git） | PM 开两棵树。**不做成插件功能**——CRD 0013 已经更正过：PM 本来就是唯一碰 git 的角色 |
| 「只有 architect 能改契约」这条现成规则 | 原样搬到接口 ADR 上（CRD 0014 第 4 条） |
| `principles.md:589`「每一个怎么做的决定都拿一个 ADR，不论 job 多大」 | 接口 ADR 靠它成立，**不是新流程** |

**新的东西，以及每一样为什么必须是新的**：

| 新的 | 为什么必须新 |
| --- | --- |
| `roles/test-engineer.md`、`roles/code-engineer.md` | dsh 一个角色一份 persona，一个文件。没有 include 机制，两份必须各自写全，理由见 `ADR 0009` |
| `ROLES` 里两条新项 | 一个角色工具就是一条项。没有别的注册点 |
| `verify-mount.mjs` 的三名 bash 清单 | 今天只查一个（`:651`）。不扩，新角色的 bash 被拿掉不会红 |
| `principles.md` 原则 21 | 新规则要有它自己的理由和外部证据。原则 6 装不下（`ADR 0011`） |
| `principles.md` 的用词表 | 仓库里今天**一处用词表都没有**（搜过 glossary、术语、terms）。三个角色都写「测试」之后，没有它就没有一个可以指的地方（`ADR 0014`） |
| `roles/pm.md` 里的双人分支 | PM 是唯一跑流程的人。分支写在**现有步骤里面**，不新开一套平行流程（PRD 风险表） |
| `roles/architect.md` 的两件新活 | CRD 0014：标形状、写接口 ADR。architect 本来不做这两件事 |

---

## 十、数据怎么流

**挂载时（每次 dsh 起来）**：

```
cordis.patch.yml (profile)   →  host/crew.js       →  PM 提示词（从 ROLES 派生角色清单）
                                host/git-guard.js  →  包住 tools/execute，管住每个 agent 的 git
preset/crew/agent.cordis.yml →  host/roles-preset.js
                                  ↓ 对 ROLES 循环
                                  每个角色一个 dsh-tool-subagent 实例
                                  ├─ persona   = readRoleText(role.personaFile)   ← 读盘，读不到就抛
                                  ├─ toolFilter= role.allow 或 role.deny
                                  └─ maxDepth  = 1
```

**跑一个双人任务时（M4 之后 PM 的动作顺序）**：

```
PM ── git worktree add ──→ 树 A（分支 A）── 补软链接
  └─ git worktree add ──→ 树 B（分支 B）── 补软链接
        （两棵树从同一个基点长出）

PM ─┬─ crew_test_engineer ──→ 树 A：只写测试文件，跑一次拿红灯，报告红灯
    └─ crew_code_engineer ──→ 树 B：只写产品代码，**树里没有测试文件**
                                    跑 lint / 类型检查 / 现有整套测试 / 编译
                                    **不跑新行为的测试**（它跑不到）
        两人同时开工。两人之间没有任何通道——deny 列表 + maxDepth + 预设 + 血缘检查，四道。

PM ── 合并两棵树 ──→ **PM 自己跑一次 A 写的那些单元测试，只跑这一次**
        （项目的测试命令会把它们一起跑时，就跑项目的测试命令；不许改了再跑、不许反复跑到绿）
        绿 → 只报「两份理解对上了」，不许报「文档是清楚的」
        红 → send_message 叫醒同一个 A 和同一个 B，各查自己那一半一次
              仍不一致 → 分歧写下来 → PM 定 → 定不了 → 交用户
              A 不许为消除冲突弱化断言（只有 PM 能批，改动要追回 DoD 原话）
              要改代码 → B 回到**合并后的树**里修（独立性到此结束，明知故犯）

PM ── 清理：两棵工作树 + 两个分支
PM ── 把 A 的红灯 + B 的一次性结果 + 分歧记录交给 code reviewer
```

**engineer 一律不碰 git。** 开树、合并、清理全是 PM 的活，这是 crew 的硬规则，本设计不动它。

---

## 十一、本作业自己的任务，全部单人形状

**本作业不吃自己的狗粮。** 十二个任务全部 `solo`。三条理由：

1. 两个新角色在 M1（工具接通）和 M3（persona 写实）之前**根本不存在**，M1、M2、M3 里没有
   它们可用的时刻；
2. M4、M5 理论上可以用，但让新角色第一次上场就去改 `roles/pm.md`（一千两百多行）风险太高；
3. PRD「还开着的问题」第 1 条把这件事留给用户在 M3 的里程碑评审时决定。

所以：**本作业不写任何接口 ADR。** CRD 0014 说的「接口 ADR」是**本次要建的功能**——要写进
`roles/architect.md` 的规则——不是本作业自己的任务需要的东西。全单人，没有 A/B 分工，
就没有接口要钉。

**最危险的地方是哪里、T-51 证明什么**，见第四节。

---

## 十二、明确不做的事

- **不做 worktree 平台功能。** PM 用普通 `git worktree add`。`host/` 里不加一行 worktree 代码。
- **不配 `roleModels`。** 两边同模型（CRD 0012 第 16 条：换模型不消除完全相关的失败，
  而且强弱不同会造出大量假分歧）。
- **不开两个 engineer 之间的横向通道。** 文件邮箱、PM 转发，都否掉了。
- **不改 QA 的任何行为。** `roles/qa.md` 本作业不动一个字。只改它在 `host/roles.js` 里的
  那一行 `summary`。QA 是相关性误读唯一的出口，动它就等于把最后一张网拆了。
- **不改 `roles/engineer.md` 的行为。** 只在开头加一句指路。
- **不写 `docs/design/api/`。** 一个模块，没有跨模块边界。
- **不发版。** 不 push，不打 tag，不发 npm。版本号是否要动，作业结束时另外问。
- **不把这套东西叫「结对编程」。** CRD 0012 明令禁止。今天仓库里所有
  「pair programming / 结对编程」的命中都在**对比**语境里（CRD 0012 和 PRD），
  这次新写的每一段都必须保持这样。

---

## 十二点五、这份设计撞上的六个「怎么做」的选择，各一份 ADR

`principles.md:589`：每一个「怎么做」的决定都拿一份 ADR，**不论 job 多大**。判据是
「有人要求过吗」——有人要求过是 CRD，没人要求、crew 干活时撞上的是 ADR。下面六个都是后者。

| ADR | 决定 | 推荐 |
| --- | --- | --- |
| `0009-two-standalone-personas.md` | 两份新 persona 的结构 | **三份文件各自写全**，不共享、不指向 `roles/engineer.md`（提示词随 npm 包发出去，指不到） |
| `0010-bash-check-explicit-list.md` | bash 检查写成清单还是循环 | **显式三名清单，外加「名字必须在 `ROLES` 里存在」的自检**；按名字模式推会安静地覆盖零个角色 |
| `0011-principle-6-rewritten-in-place.md` | 原则 6 是改写还是拆成两条 | **原地改写，编号不变**；重排编号会让所有按号的引用同时变错，而没有检查会红 |
| `0012-shape-line-position.md` | 「形状」写在任务小节的哪一行 | **一条 bullet，紧跟「里程碑」，在「拥有的文件」之前**——形状决定文件清单长什么样 |
| `0013-persona-ownership-handoff.md` | 同一个文件被两个任务先后拥有怎么办（两份 persona，加上 `roles/pm.md`） | **先后拥有，不许同时**：persona 的护栏是那行 `M1-PLACEHOLDER` 记号；`roles/pm.md` 的护栏是**交工时报告的行数**加「不动对方那几段」 |
| `0014-glossary-placement.md` | 用词表在 `principles.md` 里放在哪一层 | **一节不编号的独立小节**，标题英文 `Words we use`；给它一个号等于承诺一个它没有的外部来源 |

**本作业不写任何接口 ADR。** CRD 0014 说的「接口 ADR」是本次要**建的功能**（要写进
`roles/architect.md` 的规则），不是本作业自己的任务需要的东西——本作业十二个任务全部单人
形状，没有 A/B 分工，就没有接口要钉。

---

## 十三、这份设计里我不确定、或者我认为文档还弱的地方

**都已经写进给 PM 的报告，这里留一份在仓库里，不藏。**

1. **M3 的 DoD 第 6 条（三行 `summary`）的活落在 M1。** 因为 `host/roles.js` 只能归一个
   任务，而 M1 必须动它。检查照旧在 M3 评审时收（QA 用例在 `docs/qa/T-51/`）。
2. **M5 的 DoD 第 5 条（三角色表进 `principles.md`）的活落在 M2。** 同一个理由：
   `principles.md` 只能归一个任务，M2 必须动它。M5 的 T-59 只负责两份 README 那一半。
3. **同一个文件被两个任务先后拥有的地方一共三处**：两份 persona（T-51 → T-53 / T-54）和
   `roles/pm.md`（T-56 → T-62）。前两处跨里程碑，后一处在 M4 里面，所以它多一条硬要求：
   **T-56 和 T-62 必须串行。** 理由和护栏都在 `ADR 0013`，护栏写在两个任务行里。
4. **两处编号笔误都已经不在了，这里只留一句话，免得读者去找不存在的洞**：v1 报的
   「M5 的 DoD 有两个 5」PM 在 **v4** 修好了；architect 第二轮报的「M2 的 DoD 跳过 8」
   PM 在 **v6** 修好了（M2 现在是连续的 1–9）。本设计里所有指向 M2 的条号都按 v6 写。
5. **M2 的 DoD 第 9 条（全仓库不许叫结对编程）在 M2 时点验不完**（v6 的编号；这一条在 v4
   及更早是第 8 条，v5 里短暂变成第 10 条）。会破坏它的文件
   （两份 README、`CLAUDE.md`、`CHANGELOG.md`）在 M4、M5 才写。所以这一条在每个写文档的
   任务里各带一条自己的 DoD 项，并在 M5 再整体跑一次。已报 PM。
6. **PRD v3 的用词清理不需要新任务，也不和任何里程碑的 DoD 打架。** 它点名的每一个文件，
   本作业本来就有一个任务拥有它（见第七点五节那张表），所以清理跟着那个任务走。
   唯一的例外是 `roles/qa.md`——v3 要检查它里面没有「QA test」，而它今天就是 0 处命中，
   **一个字都不用改**，所以它不进任何任务的拥有清单，只由 QA 用例守住。
7. **T-56 被拆了。** v1 写的是「拆不开」，理由是「两个任务绝不共有同一个文件」。
   文档评审不同意，而它的论据来自这个作业自己的 `ADR 0013`：上一件作业里
   `tools/verify-mount.mjs` 被 15 个任务先后拥有过，所以这类交接在这个仓库是走得通的。
   **用户看过论据，决定拆。** 拆法：
   - **T-56（M4）** 拿第 4、5 步那一段（形状怎么写、怎么盖章、默认值加例外清单、
     4 类推荐依据、那条分开写的硬约束、成本写成估计）；
   - **T-62（M4）** 拿执行那一段和小作业那条路（两棵树、软链接、同时开工、合并、
     **PM 跑一次 A 的单元测试且只跑一次**、各查自己那一半、分歧上交、清理、DoD 措辞两档、
     小作业没有双人形状）。
   - **两个任务共有 `roles/pm.md`，所以必须串行**，而 `principles.md` 18 是「默认并行」——
     串行的理由（同一个文件，两个 engineer 之间没有任何通道）写在两个任务行里。
   - **护栏不是一行会消失的记号**（那种只对 persona 占位有效）：T-56 交工时在报告里写下
     `roles/pm.md` 的行数，T-62 从那个数接着，并且不动 T-56 改过的那几段。
   - **编号不用 `T-56a` / `T-56b`**：`tools/verify-tasks.mjs` 的正则只认 `## T-<数字>`，
     `## T-56a` 那一节不会被认成任务小节，Verdicts 那道门会**静静地**跳过它。
8. **两条「占位」断言在时间上互相打架，而 QA 没有被警告过。** 「占位必须在」（M1）和
   「占位必须没了」（M3）不能都做成常驻用例：`docs/qa/run-all.sh` 每次把过去所有作业的用例
   全跑一遍，所以前者在 M3 之后会**永久变红**，而 T-53、T-54 的 DoD 又要求 `npm test` 全绿。
   规矩写在 T-51 的第 10 条里：**「占位必须在」只在 M1 评审时由人跑一次，不许写常驻用例**；
   常驻用例只写在 `docs/qa/T-53/`、`docs/qa/T-54/`，断言那行记号**已经消失**。
9. **本作业新加的那三个「故意脆」的散文钉**——`the two readings matched`、
   `may not use the pair shape`、`exactly once`——和 `ADR 0004` 是同一个交易：正当的改措辞会
   让它们变红。这是选出来的，不是疏忽（这三件事都没有命令、路径或字段名可以钉）。
   代价要说清：以后一次正当的改写必须**同时**改任务表里那一格，而任务表是 PM 的文件，
   engineer 改不了——它只能报 PM。
10. **「不新开一级小节」这条护栏只是一个近似。** `grep -c '^## ' roles/pm.md` 拦得住「多开一节」，
   拦不住「在某个步骤里塞进本来不该在那儿的东西」。它是这个文件上能查到的最好的近似，
   不是证明；真正判可读性的是 doc reviewer。
11. **`docs/qa/gaps.md` 那两条的活由 QA 做，而承载它的 DoD 格子写在 engineer 的任务里。**
   这是故意的（`docs/qa/` 是 QA 的家，engineer 不碰），但它意味着 T-51、T-52 的那一格
   **不是 engineer 一个人能关掉的**：PM 要在收工前确认 QA 真写了那一条。这一点写在格子里，
   但它比别的格子多一个人的配合。
