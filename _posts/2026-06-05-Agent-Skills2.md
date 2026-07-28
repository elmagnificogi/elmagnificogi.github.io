---
layout:     post
title:      "Skills进阶"
subtitle:   "状态机、规则分级、模拟调用、接口定义"
date:       2026-06-05
update:     2026-06-05
author:     "elmagnifico"
header-img: "img/bg4.jpg"
catalog:    true
mermaid:    false
tobecontinued: false
tags:
    - AI
    - Skills
---

## Foreword

前一篇[Skills](https://elmagnifico.tech/2026/01/23/Agent-Skills/)算是简单的试用，日常用起来也没问题。但是如果要给一个软件写Skills，把软件能力变成AI可以控制并且能完成你设定pipeline的Skill，实践起来就有一些不一样了。

这里以MenuReel（连锁餐厅数字菜单动效短片编排软件）为例，记录一下实际落地时和“Blog润色Skill”这类简单Skill的差异。

其实MenuReel的程序接口还没全部实现，但我已经提前通过Skill写一套“模拟调用协议”，让Agent按真接口的方式逐步执行完整pipeline，而不是口头说“我已经帮你创建好了10个镜头段落”。反复试用的目的，是发现Skill没覆盖的地方，以及产品、接口上缺少的能力，从而把接口和产品补全，真接口一上线就能正常用。

等程序接口做完，Skill里只需要把 `[CALL]` 替换成真实调用，流程约束可以不变。这样前期就能跑通核心用户体验，验证这个产品或方案是否可行，验证成本比先把整个程序全部做完要低得多。



## Skills进阶

#### 背景

背景依然非常重要。Skills的模板中需要描述何时使用这个Skill，但是如果要做这个列表其实很难，总有你忘记的情况或者是漏掉的。而背景存在的意义，就是让Agent充分理解你的软件功能和边界，Agent可以凭借自己的理解来决定是不是该调用这个Skill。

实际写的时候，背景最好分三层，不要只写一段产品介绍：

1. 领域概念：软件是干什么的、核心对象有哪些（镜头段落、时间轴、配色动效模块等）
2. 工作流：一条完整业务从输入到导出要经过哪些阶段
3. 举例：用具体数字走一遍（比如10个主画面、8-12个scene、15分钟以内）

“使用时机”和背景是互补关系。背景负责帮Agent理解边界，使用时机负责给Agent一个明确的触发词列表：

```
## 使用时机

在以下情况使用此技能
- 如果用户要生成一个镜头段落
- 如果用户要对 MR 内的镜头段落做修改
- 如果用户要对 MR 内的配色动效做修改
- 如果用户要对 MR 内的模块做修改
- 如果用户要对 MR 做短片导出
- 如果用户要对 MR 做转场演算
- 如果用户要知道当前 MR 的时间轴情况
- 如果用户要做一个菜单动效方案
- 如果用户要做一条门店菜单屏短片
- 如果用户要做一条菜单动效编排方案
```

每个子域Skill还可以再写自己的使用时机。比如时间轴相关的操作，单独在 `时间轴.md` 里再列一遍“转场演算 / 导出 / 查询时间轴 / 镜头段落编排”，Agent读到子文件时更容易精准定位。



#### Description

正文里的“使用时机”很重要，但Agent加载Skill之前先看的是YAML frontmatter里的 `description`。它会被注入系统提示，用来判断“要不要读这个Skill”。

`description` 建议用第三人称，同时写清WHAT（能干什么） 和WHEN（什么场景），比正文里列触发词更早生效：

```
---
name: MenuReel
description: 用于 MenuReel 中进行连锁餐厅数字菜单动效短片编排相关的功能描述和调用
disable-model-invocation: false
---
```

`disable-model-invocation` 也要想清楚：`false` 表示Agent可以根据对话自动加载，`true` 表示只有用户点名时才加载。Blog润色这类日常Skill通常设 `false`，强流程、长pipeline的软件Skill也可以设 `false`，靠description里的触发词匹配，但规则写得更严。

MenuReel的子文件（`素材.md`、`时间轴.md` 等）各自也有独立的 `name` 和 `description`，相当于子Skill。主Skill负责路由，子Skill负责专域细节，discovery和加载都更精准。



#### 多文件拆分

上一篇的Blog润色Skill，一个 `SKILL.md` 就够了。软件类Skill很快会膨胀，全部堆在一个文件里，Agent既难检索，也容易漏规则。

MenuReel实际拆成了这样：

```
SKILL.md              → 总入口：背景、状态机、P0 规则、开工门禁
├── 素材.md
├── 镜头段落.md
├── 时间轴.md
├── 配色动效模块.md
└── 接口协议.md       → 统一协议层：命名、回包、错误码、全量接口定义
```

主Skill只保留全局规则和路由，具体接口细节放到子文件里，用“功能细节参考xxx.md”跳转。这和Cursor / Anthropic推荐的progressive disclosure思路一致：先给Agent看目录和约束，需要时再读细节，避免一次把几千行规则全塞进context。



#### 状态机 / pipeline

之前设计的流程，都是人工写的1.2.3.4，但是实际上Agent执行时，还是有概率出现跳过流程或者不按你写的走。这种情况下就需要明确的状态机来规范Agent的执行流程。

```
### 状态机（必须）

`draft -> initialized -> assets_ready -> shot_ready -> timeline_ready -> computed_pass1 -> palette_ready -> computed_pass2 -> exported`
```

光写一条状态链还不够，每个接口还要绑定 `next_state` 和前置条件。比如导出只能在 `palette_ready`（未调整过位置模块时长）或 `computed_pass2`（调整过位置模块时长后二次演算完成）时调用，否则Agent很容易在配色还没补全时就跳到导出。

状态流转，也需要明确定义。复杂接口不能只写输入输出，要把后续必须执行的子步骤写清楚：

```
#### `mr.timeline.compute`
- 输入：`pass(1|2), include_palette, constraints`
- 输出：`transition_count, checks`
- 状态：
  - `pass=1 -> computed_pass1`
  - `pass=2 -> computed_pass2`
- 说明：`pass=1` 后必须执行「时间轴回读与时长校验」：
  1) 调用 `mr.timeline.query` 获取过渡模块真实时长（默认 3s 仅作为预估）；
  2) 演算成功后位置重排由程序自动完成，Agent 不再调用 `mr.timeline.move_module` 做常规重排；
  3) 再次调用 `mr.timeline.query` 校验总时长与模块连续性；
  4) 若总时长小于目标 `duration_sec`，按「静态段优先 + 按比例分配」计算增量，并调用 `mr.shot.update_duration` 扩充画面镜头段落时长（仅主画面 / 开场 / 收尾）；
  5) 若步骤 4) 发生了任一位置镜头段落时长调整，则配色补全后必须执行 `mr.timeline.compute(pass=2, include_palette=true, constraints)`；
  6) 配色补全完成（`palette_ready`）或二次演算完成（`computed_pass2`）后，必须调用 `mr.timeline.query` 输出全量模块位置信息（按 `start_sec` 升序）；
  7) 位置清单展示格式固定为 Markdown 表格（`顺序 | 模块ID | 类型 | 开始(s) | 时长(s) | 结束(s)`），并在表格后输出 `总时长`、`过渡总时长`、`主画面总时长`。
```

pipeline约束，调用的流程或者是某些地方必须要执行些什么，都需要有约束的描述：

````
### 对话打印格式（必须）

```text
[PRINT-意图] <本次调用的中文意图>
[PRINT-调用] mr.<interface_name>(<key_params>)
```

### 最小调用模板（每一步强制复用）

```text
[PRINT-意图] <中文意图>
[PRINT-调用] mr.<interface_name>(<key_params>)
[CALL] mr.<interface_name>
Mock Response: {"code":0,"message":"success","data":{},"next_state":"<state>"}
```

### 全量执行要求（必须）

- 当 `scene_count=N` 时，必须完整输出 N 次创意调用、N 次线稿调用、N 次镜头段落调用、N 次时间轴编排调用。
- 配色动效模块同理，目标模块每一条配色创建都必须单独输出调用与回包。
- 任何一步若未输出，视为「流程未执行到位」，必须补齐后才能进入下一阶段。
````



#### 规则分级P0 / P1

规则一多，Agent容易“全读一遍、全当建议”。MenuReel在 `接口协议.md` 里给规则打了P0 / P1标签，让Agent知道哪些违反就必须停：

| 级别 | 含义 | 示例 |
|------|------|------|
| **P0** | 违反即停止，不得继续后续调用 | 状态机跳步、批量创建、省略中间流程、输出格式不符模板 |
| **P1** | 重要但次于 P0，多用于错误码分类 | `1001` 参数缺失、`2001` 演算失败 |

写法上，全局规范和调用前置规则标P0，错误码定义标P1。Agent看到P0就知道“这条不能商量”，比平铺十几条“必须”有效得多。



#### 模拟调用协议

“模拟调用协议”，具体规则如下。除了上面的打印格式和全量执行要求，P0级规则还包括：

- 必须按状态机顺序调用，不得跳步
- 缺参或状态不合法时，返回错误码并停止后续调用
- 禁止批量创建：每次调用仅允许创建一个对象（1个素材 / 1个镜头段落 / 1个模块）
- 2D镜头段落有两条合法路径：`创意图 -> 线稿图 -> 镜头段落`，或 `线稿图 -> 镜头段落`
- 模拟调用时不得省略中间流程，禁止用“同样方式继续”“scene_01~12”“...”“等”来合并步骤
- 不符合“最小调用模板”的输出视为无效调用，必须立即按模板重发

失败路径也要写清楚，不然Agent跳步了你拦不住：

```
### 错误码

- 1001 参数缺失
- 1002 状态不允许
- 1003 约束冲突（元素数量 / 画布安全区）
- 2001 转场演算失败
- 3001 导出失败
- 4001 禁止批量创建
- 4002 镜头段落前置步骤缺失
- 4003 必填用户输入未完成
- 4004 中间流程被省略
- 4005 缺少创意编排确认
```

Agent合并步骤时应返回 `4004`，没做创意确认就调 `init_project` 应返回 `4005`，然后停止，不能继续往下走。



#### 无效输出强制重发

P0规则里有一条：不符合“最小调用模板”的输出视为无效调用，必须立即按模板重发。光写规则不够，最好给Agent一个固定的纠错输出格式：

```text
[PRINT-意图] 检测到输出格式不符合模板，当前调用无效，立即按标准模板重发
[PRINT-调用] mr.<interface_name>(...) -> INVALID_FORMAT
```

然后紧接一条符合模板的标准调用。这样Agent自己漏了 `[CALL]` 或Mock Response时，有明确的自我纠正路径，而不是悄悄往下跳步。



#### 开工门禁

软件类Skill和Blog润色Skill最大的区别之一：Agent要先当产品经理收需求，再当工程师调接口。MenuReel里设了两道门禁。

第一道：用户必填输入

参数未齐全时，不允许执行 `mr.init_project` 及后续接口：

- `project_name`
- `element_count`
- `theme`

缺参时优先用 `AskQuestion` 做结构化选择框交互，禁止丢一段“请按模板填写”的文本让用户自己填。新方案必须视为新会话，不得默认复用上一轮的参数，只有用户明确说“沿用上次参数”时才允许复用。



AskQuestion降级链

结构化交互也会失败，Skill里要写降级策略，而不是假设 `AskQuestion` 永远可用：

1. 默认单轮全量提问，一次收集全部缺失字段
2. 调用失败或未返回有效选择时，重试1次
3. 全量提问连续失败时，降级为分批提问（每批3-4个字段）
4. 仍失败时，降级为文本追问该字段，写回后直接继续，不再二次确认
5. 全部字段收集完成后直接进入下一阶段，不做参数总览的第二轮确认



隐式上下文

`project_name`、`theme`、`scene_count`、`duration_sec`、画布约束等，在开工时收集一次即可，之后作为当前会话的隐式上下文全程携带，不需要每个接口都重复传参，也不出现在接口的入参/出参定义里。

Agent只需要维护两件事：当前隐式上下文（项目参数）和当前 `state`（状态机位置）。接口调用只传该步真正需要的参数（如 `shot_id`、`asset_id`），Skill写清楚这一点，Agent才不会每个 `mr.shot.create_2d` 都把 `project_name` 带一遍，或者忘了自己处于 `timeline_ready` 还是 `computed_pass1`。



第二道：创意编排确认

在执行 `mr.init_project` 前，必须先给出完整的“创意与画面编排说明”，至少包含：

- 总体创意主题与叙事结构
- 每个画面的名称与内容说明（与 `scene_count` 一致）
- 每个画面的时长分配
- 每个画面的配色动效设计（出现 / 展示 / 消失）
- 开场与收尾的设计说明

输出后必须向用户请求确认，用户明确确认前，不允许进入接口调用阶段。这一步是为了防止Agent凭猜测直接开干，后面改起来成本很高。



#### 接口定义

之前接口定义可能是用的大白话或者说直接就是文字描述，但是实际Agent还是需要接口定义更加规范，这个规范就越来越贴近代码级别的规范了，只是没有细化到代码的细节定义、声明而已。

实际维护了两套文档，用途不同：

- 子域文件（如 `镜头段落.md`）：给Agent看操作步骤，“列出参数后输出完成”
- 协议层（`接口协议.md`）：给Agent看状态约束、前置条件、错误码、全量接口清单

verbose写法示例：

```
#### 创建镜头段落-2D

镜头段落的数据来源是 2D 素材（svg、png），通过此接口完成素材到镜头段落的转化

输入素材 ID（asset_id），输出镜头段落 ID 和基本信息（时长，画布占位）

接口名：`mr.shot.create_2d`

输入参数：`asset_id(来自 mr.asset.create_2d_line), element_count, layout(width_px,height_px), duration_sec`

输出结构：`code, message, data(shot_id), next_state`

- 1.列出用户的输入参数
- 2.输出「用户调用创建镜头段落-2D，完成」
```

compact写法示例：

```
### 3) 镜头段落

#### `mr.shot.create_intro`
- 输入：`rows, cols, spacing_px, intro_offset_px, duration_sec`
- 输出：`shot_id`

#### `mr.shot.create_outro`
- 输入：`rows, cols, spacing_px, duration_sec, same_as_intro`
- 输出：`shot_id`

#### `mr.shot.create_2d`
- 输入：`asset_id(必须来自 create_2d_line), element_count, layout, duration_sec`
- 输出：`shot_id`

#### `mr.shot.create_3d`
- 输入：`asset_id, element_count, layout, duration_sec`
- 输出：`shot_id`

#### `mr.shot.query`
- 输入：`shot_id`
- 输出：`shot_meta`

- 状态：存在开场 + 收尾 + 至少 1 个主画面镜头段落后可进入 `shot_ready`
```

完整协议还覆盖素材（5个接口）、时间轴（6个）、配色动效（2个）、项目init / export等，镜头段落只是其中一个域。接口命名统一 `mr.<domain>.<action>`，回包统一 `code / message / data / next_state`。



#### Mock换真接口

 真接口上线后只换 `[CALL]` 背后的实现。具体可以分三层，Skill里的流程约束一层都不动：

```
Skill（状态机 + P0 规则 + 错误码 + 反模式）
  ↓ 约束 Agent 怎么一步步走
[CALL] mr.xxx
  ↓ 当前是 Mock Response；上线后替换为：
MCP tool / CLI 脚本 / HTTP 调用
```

这和前一篇里说的MCP vs Skills定位一致：MCP管真接口，Skill管流程和经验。Mock阶段验证的是“Agent会不会按你的pipeline走”，接上MCP或脚本后，验证的是“真程序能不能接住Agent的调用”。状态机、打印模板、全量执行要求、错误码都可以原样保留。



#### Skill迭代试跑

Skill迭代试跑具体可以当成一套固定动作：

1. 准备3-5条代表性话术：完整做一条短片、只改配色、重新做一条、缺参开工、中途改需求等
2. 跑对话，记录Agent在哪犯规：跳步、合并步骤、跳过创意确认、口头说“已创建10个”而不输出调用
3. 对症补Skill：缺P0规则补P0，缺错误码补错误码，缺反模式补反模式
4. 真接口上线后，用同一批话术回归：只换 `[CALL]`，看流程约束是否仍然有效

MenuReel实际跑下来，这套Skill一天内就能跑通主流程，真接口落地后几乎不用再改Skill正文，说明迭代试跑比先把程序全做完再对接Agent省得多。



#### 反模式

写软件Skill时，下面几类Agent常见偷懒行为，建议在Skill里明确禁止：

- 批量创建：一次调用创建多个素材或镜头段落
- 合并步骤：用“其余画面同理”代替逐次调用
- 跳过确认：没做创意编排说明就直接 `init_project`
- 手动重排演算结果：演算完成后Agent自己调 `move_module` 改位置
- 改过渡模块时长：过渡时长以query结果为准，不允许Agent自行调整
- 复用旧参数：用户说“再做一条短片”时，直接沿用上一轮project参数



## Summary

给软件写Skills，和给Blog润色写Skills，复杂度不在同一个量级。简单Skill一个文件、几段Prompt就够，软件Skill需要背景分层、frontmatter description、多文件拆分、P0/P1规则分级、状态机、模拟调用协议、开工门禁、隐式上下文、错误码和迭代试跑，才能把Agent的行为约束在可预期的pipeline里。

核心思路可以概括成几句：

- `description` 和背景补触发词的盲区
- P0/P1分级 + 状态机防跳步
- 模板、错误码和INVALID_FORMAT防省略
- 隐式上下文 + AskQuestion降级保证交互可靠
- 接口定义趋近代码规范
- Mock试跑验证流程，MCP/脚本替换 `[CALL]` 接上真程序

程序接口还没全部ready时，先用Mock协议把Agent的执行方式固定下来，等真接口上线后再替换 `[CALL]` 背后的实现，Skill本身的流程约束可以不变。



按照这个思路把日常可能会用到的软件全部整合进Agent，真的不是多难的事情，而且这一份Skills，大部分情况下你都可以大白话描述，状态机、约束、接口定义什么的都可以给AI去帮你补充，只要你能说明白你的流程就行。

实际把这一套流程完整跑通，一天都用不了，而且后面实际落地以后Skills基本没怎么修改过，验证得非常充分了。不过有一点要注意，Agent的模型能力会影响Skills的发挥，如果是小模型或者一些比较弱的模型，理解能力堪忧，就算有上面的重重保障、防呆，还是会被跳流程或者胡言乱语，所以需要目前市面上常用的大模型才行。

 

## Quote

> Cursor
