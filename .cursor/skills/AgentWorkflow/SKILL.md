---
name: agent-workflow
description: >-
  Unified Agent product development workflow (AIO solo + FTM team): wolai docs,
  review gates, code/tests, defect doc sync, pre-merge audit. Use when starting
  features or bugfixes, 按工作流开发, AIO, FTM, 独自开发, 团队协作, 需求评审,
  回流文档, 合并前复核, or wolai Agent workflow.
---

# Agent 产品开发工作流

单一 Skill，内含 AIO 独自版、FTM 团队版与全部子流程。**加载本 Skill 后按「模块路由」读取对应章节执行，无需再 @ 其他 skill。**

## 核心原则

**先文档、后代码；先评审、后构建；缺陷不只改代码，还要反向更新文档。**

- **`docs/task.md` 是每个需求的核心维护文档（本地、单一事实来源）**：当前阶段、进度、待办、需要人反馈/确认的问题、已确认结论摘要、实现摘要、变更记录都实时写在这里。每轮会话**先读它、随时更新它**。
- **wolai 需求/技术/测试页是定稿沉淀**：仅当①需求发生变动，或②某些内容（评审结论、技术方案、用例、设计决策）已明确/经人确认时，由 Agent 把对应内容回写 wolai（追加或更新已有段落，**不注入固定填空模板**、不覆盖人已确认内容）。
- 代码在 workspace。task.md 与 wolai 的关系：task.md 记「正在进行/待定」，wolai 记「已定稿/共享」。

## 会话启动（每轮必做）

1. 读 `docs/task.md` → 确认当前阶段、进度、待反馈项、文档链接（**以 task.md 为状态来源**）
2. 需要已确认的需求/技术/用例细节时，再按 task.md 中链接读对应 wolai 页
3. 若无 `docs/task.md`，或无开工信息（无页面 ID / 无分支）→ 执行 [modules/create-kit.md](modules/create-kit.md)（同时建立 `docs/task.md`）
4. 确认模式：`solo`（AIO）或 `team`（FTM）
5. 声明本步阶段 ID、是否允许写业务代码

## 硬性约束

```
三文档 S8 评审未全通过 → 禁止改 src/ 等业务代码
缺陷类型 design|requirement → 先走 modules/defect-sync.md，人确认后再改代码
需求正文禁止 AI 0-1 生产，仅审查与补充
一个需求 = 一条 Agent 会话
密钥/内网/客户数据禁止进 prompt
```

## 阶段与 Gate

| ID | 名称 | 主导 | 写代码 |
|----|------|------|--------|
| S0 | 开工登记 | 🤖 | ❌ |
| S1 | 需求输入 | 👤 | ❌ |
| S2 | 工程背景 | 👤 | ❌ |
| S3 | AI 需求评审 | 🤖 | ❌ |
| S4 | 人工纠偏 | 👤 | ❌ |
| S5 | 技术+测试起草 | 🤖 | ❌ |
| S6 | 审核技术 | 👤 | ❌ |
| S7 | 测试补全 | 🤖 | ❌ |
| S8 | 评审闸门 | 👤 | ❌ |
| S9 | 并行构建 | 🤖 | ✅ |
| S10 | 人工测试 | 👤 | ✅ 修 bug |
| S11 | AI 复核 | 🤖 | ✅ 修缺口 |
| S12 | 使用说明 | 🔀 | ❌ |
| S13 | 合并基线 | 👤 | ❌ |

**S8 闸门（全满足才可 S9）**：P0 有验收标准；技术含错误码与边界；测试覆盖 P0；开放问题已决议；评审记录已回写。

**Bugfix 快速路径**：人填复现与范围 → 可选 AI 简评 → 人确认 → 直进 S9（至少 1 条测试用例）→ S10–S13 同 feature。

**阶段推进**：关键 Gate 需人回复「确认进入 S{n}」后 Agent 才更新阶段；禁止跳阶段（bugfix 可走 B 路径）。

## 模块路由

| 场景 | 阶段 | 读取 |
|------|------|------|
| 新需求/bug 开工 | S0 / B0 | [modules/create-kit.md](modules/create-kit.md) |
| 独自开发全流程 | S0–S13 | [solo-workflow.md](solo-workflow.md) |
| 团队开发全流程 | S0–S13 | [team-workflow.md](team-workflow.md) |
| 需求评审 | S3 | [modules/requirement-review.md](modules/requirement-review.md) |
| 测试失败/需求变更 | 任意 | [modules/defect-sync.md](modules/defect-sync.md) |
| 合并前复核 | S11 | [modules/pre-merge-audit.md](modules/pre-merge-audit.md) |

**阶段 → 模块自动映射**（用户未明说时按需求页当前阶段）：

| 阶段 | 执行模块 |
|------|----------|
| S0, B0 | create-kit |
| S1–S2, S4, S6, S8, S10, S12–S13 | solo 或 team 工作流（按 MODE） |
| S3 | requirement-review |
| S5, S7, S9 | solo/team 工作流 |
| S11 | pre-merge-audit |
| 测试失败且类型未定 | 先分流 → defect-sync 或直改代码 |

## 模式选择

| 模式 | 文档 | 适用 |
|------|------|------|
| `solo` | [solo-workflow.md](solo-workflow.md) | 一人兼 PM/DEV/QA/Lead |
| `team` | [team-workflow.md](team-workflow.md) | PM、DEV、QA、Lead 分工 |

未说明时默认 `solo`；用户提 FTM/团队/四人团队 → `team`。

## 文档分工（无固定模板）

| 文档 | 人写 | Agent 写 | 人审 |
|------|------|----------|------|
| 需求 | 背景、范围、功能点、验收标准 | 评审意见（S3） | S4、S8 |
| 技术 | 工程背景（S2） | 方案、接口、数据流（S5） | S6、S8 |
| 测试 | 探索性结论（S10） | 用例起草与补全（S5/S7） | S8 |

Agent 写入 wolai 时追加章节或更新已有段落，**不覆盖**人已确认内容；变更已确认内容须走 defect-sync。

## task.md 维护约定（核心）

`docs/task.md` 由 Agent 实时维护，分为**两大部分**：

**一、任务信息（初始化头部，相对稳定）** — 开工/初始化阶段填写：

- **基本信息**：需求 ID、标题、类型、模式、开发分支、基线
- **文档链接**：wolai 需求页 / 技术页 / 测试页
- **关联工程项目**：workspace 下各仓库的用途、是否本次涉及
- **涉及模块**：仓库内子模块/目录
- **架构与规范要求**：语言/框架、DI、MVVM、日志、本地化、注释与格式规范等

**二、进度与共创记录（动态）** — 开发过程中随时更新：

- **当前阶段** + **阶段清单**（S0–S13 勾选）
- **待反馈 / 开放问题**：需要人确认或决策的事项（含选项与建议），人答复后清理或归档
- **已确认结论摘要**：指向 wolai 定稿，避免本地长篇复制
- **变更记录**：需求/技术变更条目（日期、内容、是否已回写 wolai）
- **实现摘要 / 行动记录**：本轮改了哪些文件 / 关键决策

**回写 wolai 的触发**：当待反馈项被人确认、需求发生变动、或技术/测试内容定稿时，把对应内容回写 wolai，并在变更记录中标注「已同步 wolai」。

### 新任务重置

新需求开工时复制本结构：**重填「一、任务信息」、清空「二、进度与共创记录」**（阶段清单回到全未勾、记录区清空）即为初始状态。

### 多任务并行

- 单任务：直接用 `docs/task.md`。
- 多任务并行：每个任务一份 `docs/tasks/<需求ID>.md`（如 `docs/tasks/DGCS-387.md`）。
- 会话开始时若存在多个任务文件，**由用户指定要接续的任务**（如「接续 DGCS-387」）；未指定且仅一个时默认它。

## Agent 行为协议

1. **需求正文**：👤 专属，Agent 只读 + 评审，拒绝代写
2. **技术/测试**：🤖 可起草，人审核后视为定稿
3. **写之后**：更新 `docs/task.md`（当前阶段、进度、待反馈项、实现摘要、行动记录）；内容明确或需求变动时再回写 wolai
4. **人确认**：回复「确认进入 S{n}」后才推进阶段（同步更新 task.md 阶段）
5. **子流程完成**：回到主工作流对应步骤

## 缺陷分流（全局）

```
测试未通过
├── implementation → 改代码 → 必要时补用例 → pre-merge-audit
└── design | requirement → defect-sync → 快速重评审 → 再改代码
```

## 前置条件

- [ ] wolai MCP（`user-wolai`）可用
- [ ] 相关代码仓库在 Cursor workspace 可读
- [ ] `docs/task.md` 存在（无则开工时创建）
- [ ] wolai 需求页 ID、Git 分支（开工时收集，记入 task.md）

## 文件结构

```
docs/task.md            # 每个需求的核心维护文档（状态/进度/待反馈/变更，本地事实来源）

AgentWorkflow/
├── SKILL.md
├── solo-workflow.md
├── team-workflow.md
└── modules/
    ├── create-kit.md
    ├── requirement-review.md
    ├── defect-sync.md
    └── pre-merge-audit.md
```
