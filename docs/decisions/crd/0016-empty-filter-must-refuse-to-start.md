# CRD 0016：空的 `roleAllow` / `roleDeny` 必须在挂载期拒绝启动

## 谁提的

**crew 安全评审**，在 T-51 的安全评审报告里（2026-08-21）。它把这一条标成 optional，理由是
`host/roles-preset.js` 这一轮没被改动。PM 复核后判断它比它自己标的分量重，把它带给用户；
**用户决定修（原话「fix it」）。**

## 洞是什么——我复核过，一步都不用猜

`host/roles-preset.js` 第 31-36 行和第 48 行：

```js
const allow = config?.roleAllow?.[role.key] ?? role.allow;
const deny  = config?.roleDeny?.[role.key]  ?? role.deny;
const filter = {
  ...allow?.length > 0 ? { allow } : {},
  ...deny?.length  > 0 ? { deny }  : {},
};
// ...
...Object.keys(filter).length > 0 ? { toolFilter: filter } : {},
```

**空数组不是 nullish，所以 `??` 不会兜住它。**

`roleAllow: { code_reviewer: [] }`
→ `allow = []`
→ `[].length > 0` 为假
→ `filter = {}`
→ `Object.keys({}).length > 0` 为假
→ **`toolFilter` 整个不传**
→ 那个孩子拿到 preset 的**全部**工具集。

`roleDeny: { code_engineer: [] }` 同理。

## 为什么它比 `CRD 0015` 重——方向相反

| | `CRD 0015`（用户已否决） | 本 CRD |
| --- | --- | --- |
| 后果方向 | 角色**少**了 shell——能力减少，检查还打绿 | 只读角色**多**了 `bash`、`write`、`edit`——**能力增加** |
| 被推翻的规则 | `ADR 0010` 之外的第五条 | **`CLAUDE.md` 设计规则 2**——审阅者只读 |
| 那条规则的来头 | 新写的 | 仓库自己记着它是**两次实测**换来的：只 deny `write`/`edit` 时审阅者用 `echo hello > file` 写了文件；再 deny `bash` 之后它的工具报告里还列着 `workflow`、`ralph` 和桌面控制类 MCP 工具。**所以审阅者用 allow 列表，不是偏好，是两次失败换来的。** |
| 用户看得见吗 | 看不见 | **看不见**——启动日志一个字都不说 |

一个空数组能静默推翻一条用两次实测换来的规则，而且没有任何提示。这不是配置的自由，是一个陷阱。

## 定下来的

**空的 `roleAllow` 或 `roleDeny` 列表，在挂载期直接报错，拒绝启动。**

- 不静默回落到出厂列表：那会让用户以为自己的配置生效了，而实际生效的是另一份。
- 不静默去掉 `toolFilter`：那就是今天的洞。
- **报错**，而且信息要说清是哪个角色键、哪个字段，以及正确的做法（要放开就把名字列出来，
  别给空数组）。

**形状照仓库现成的先例**：`readRoleText` 遇到空的 persona 文件就在挂载期抛错——
「a missing or broken role file must break startup with a clear message, not surface halfway
through a job」（`host/roles-preset.js` 第 45-46 行的注释）。同一条道理。

## 为什么现在做——硬期限

`host/roles-preset.js` **在 T-51 的文件清单里**。按 `docs/design/tasks.md` 的所有权规则和
`ADR 0013`，T-51 交工之后除了两份 persona，别的任务一律不许再碰它拥有的文件。
**所以只有现在能做；错过就要另起一件作业。** 这和 `CRD 0015` 是同一个期限，不同的答案。

## 它动到什么

| 文件 | 动什么 | 谁 |
| --- | --- | --- |
| `host/roles-preset.js` | 挂载期校验：空的 `roleAllow` / `roleDeny` 报错 | **T-51**（叫醒它） |
| `docs/design/tasks.md` | T-51 加 **DoD 第 19 条**（任务行里 DoD 一节由 PM 写） | PM |
| `docs/qa/T-51/` | 一条用例：空数组必须拒绝启动，而且信息里点名角色键和字段 | QA |

## 代价

- 一处挂载期校验，一条 DoD，一条 QA 用例。
- **一个行为变更**：今天写了空数组的用户，升级后会启动失败而不是静默拿到全部工具。
  这正是要的——它现在拿到的是一个它没打算开的洞。**这一点要进 `CHANGELOG.md`（T-61）。**
- 不做的代价：`CLAUDE.md` 设计规则 2 可以被一行配置静默关掉，而本作业之后没人能补。

## 决定

**accepted。用户决定，2026-08-21，原话「fix it」。**

## 时序：为什么代码改动要等 QA 跑完

`crew-qa` 正在跑 T-51 的验收。**在它跑的时候改产品代码，会造出这个仓库自己写过的那种失效**——
`roles/engineer.md` 的 "A false red is not evidence" 那一节讲的就是它：别的任务在你旁边动文件，
整套检查会给出三个不同的答案。所以顺序是：**QA 交工 → 叫醒 T-51 做本 CRD → 再起一轮新的 QA
覆盖第 19 条并重跑全部回归。** 最后那一轮 QA 本来就要跑，所以没有多花。

## 追加（2026-08-21，两个第二轮评审之后）：「空」不只是 `[]`

**决定的原文不重写**（CRD 记的是某一刻某一个决定）。这一节说清它的**范围**，因为两个第二轮评审
各自独立发现同一件事：上面那条决定只被实现成「空数组」，而 PM 实测了每种值形状——

| YAML 里写的值 | 校验抓到吗 | 实际后果 |
| --- | --- | --- |
| `[]` | **抓到** | 拒绝启动，正确 |
| `~` / 留空（null） | 跳过 | 回落到出厂列表，**安全** |
| `""` | **跳过** | `toolFilter` 整个不传 → **拿到全部工具** |
| `0` / `false` / `{}` | **跳过** | 同上 |
| `"read"`（字符串不是列表） | 跳过 | 传一个畸形的字符串过滤器，由 tool-subagent 的 schema 拒 |

**PM 判断这不是扩大范围，是把这条决定实现完整。** 理由：一个用户在 YAML 里写
`roleAllow: security_reviewer: ""`，**在他自己看来那就是一个空的 roleAllow**。上面的决定说
「空的 `roleAllow` / `roleDeny` 必须在挂载期拒绝启动」——只堵住五种写法里的一种，那条决定就没有
兑现。用户批准本 CRD 时的原话是「fix it」，指的是那个洞，不是那个值形状。

**因此判据改成**：`undefined` 和 `null` 放过（那是「用出厂列表」的正确写法），**其余任何不是
「非空列表」的值都拒绝启动**，而且信息要说清它是空列表还是根本不是列表。

安全评审对「这算不算提权」的结论仍然成立、也一并记下：**不算**。能写那个配置文件的人本来就能直接
写 `roleAllow: { security_reviewer: ["read","bash"] }`，而挂载期不校验用户给的 allow 列表内容。
这个洞的真实伤害是**陷阱**——用户以为自己写的是「不限制」，拿到的是全部工具。

## Applied

**还没有。** 回填时点名：T-51 的第 19 条、`host/roles-preset.js` 的实际改动、
`docs/qa/T-51/` 那条用例、`CHANGELOG.md`（T-61）那一行。
