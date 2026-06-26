# FTM 团队协作（模块）

> 父 Skill：[SKILL.md](SKILL.md) | 模式：`team`

四人角色 + Agent。流程骨架同 AIO，角色拆回 PM/DEV/QA/Lead。

Agent 侧仍以本地 `docs/task.md` 作为当前需求的工作底稿（阶段、进度、待反馈）；团队共享事实源为 wolai，内容定稿/需求变动后由 Agent 回写 wolai。见 [SKILL.md](SKILL.md)「核心原则 / task.md 维护约定」。

## 角色分工

| 角色 | 职责 | Agent 关系 |
|------|------|------------|
| PM | 需求文档、看板；**需求人写，AI 只审** | 提供 wolai 页 |
| DEV | 工程背景、结对代码、Code Review | 🔀 |
| QA | 审测试文档、探索性用例、跑验证 | 🔀 |
| Lead | 三文档终审、合并拍板 | 👤 闸门 |

图例：👤 人工 | 🤖 Agent | 🔀 协作

## 主流程

```
- [ ] S0  PM 发起开工登记（MODE=team）
- [ ] S1  PM：需求文档（👤）
- [ ] S2  DEV：工程背景（👤）
- [ ] S3  Agent 需求评审 → modules/requirement-review.md
- [ ] S4  PM 纠偏（👤）
- [ ] S5  Agent：工程+测试文档起草（🤖）→ 回写 wolai
- [ ] S6  DEV 审核技术（👤）
- [ ] S7  QA 二次补全测试（🔀）
- [ ] S8  Lead 三文档评审闸门（👤）
- [ ] S9  DEV ⇄ Agent 代码构建（🔀）
- [ ] S10 QA ⇄ Agent 验证（🔀）
- [ ] S11 Agent 复核 → modules/pre-merge-audit.md
- [ ] S12 使用说明（🔀）
- [ ] S13 Lead 合并基线（👤）
```

## 角色行为约束

1. 对话开头确认角色（PM/DEV/QA/Lead），只执行该角色授权操作
2. PM 会话：仅审查需求，不写代码
3. DEV 会话：S8 前仅文档；通过后写代码
4. QA 会话：测试为主；缺陷先分类再路由
5. 角色未知时询问：「本次以哪个角色进行？」

## 变更通知（必补）

| 变更 | 通知 | 动作 |
|------|------|------|
| 需求 | DEV、QA | 同步技术/测试，快速重评审 |
| 技术 | QA | 补用例，快速重评审 |

机制：人工拉群，或监控 Agent 盯 wolai 版本差异。

## 缺陷分流

```
├── implementation → DEV 改代码
└── design/requirement → PM/DEV 文档
    → modules/defect-sync.md → Lead 快速重评审 → 再动代码
```

## 多方联调

各软件独立 Agent，以 wolai **协议文档**为共享边界联调。

独自模式见 [solo-workflow.md](solo-workflow.md).
