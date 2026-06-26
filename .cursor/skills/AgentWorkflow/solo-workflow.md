# AIO 独自开发（模块）

> 父 Skill：[SKILL.md](SKILL.md) | 模式：`solo`

一人兼任 PM/DEV/QA/Lead。Agent 写技术/测试文档、代码、用例；人定方向、审关键节点。

状态以本地 `docs/task.md` 为准（当前阶段、进度、待反馈项实时维护）；需求变动或内容定稿后再回写 wolai。见 [SKILL.md](SKILL.md)「核心原则 / task.md 维护约定」。

## 主流程

```
- [ ] S0  开工登记 → modules/create-kit.md
- [ ] S1  需求输入（👤 在 wolai 写需求）
- [ ] S2  工程背景（👤 补仓库/模块/约束）
- [ ] S3  需求评审 → modules/requirement-review.md
- [ ] S4  人工纠偏（👤）
- [ ] S5  技术+测试起草（🤖 写回 wolai）
- [ ] S6  审核技术（👤）
- [ ] S7  测试二次补全（🤖）
- [ ] S8  评审闸门（👤 终审，见 SKILL.md Gate）
- [ ] S9  并行构建（🤖 代码 + 自动化用例，含 CI）
- [ ] S10 人工测试（👤）
- [ ] S11 AI 复核 → modules/pre-merge-audit.md
- [ ] S12 使用说明（🔀）
- [ ] S13 合并基线（👤）
```

## 各步要点

### S1 需求输入 👤

AI 可 `search_docs` 辅助查找，**不得代写需求正文**。

### S2 工程背景 👤

补仓库、模块、历史决策、接口约束。此步虚设则技术文档易幻觉。

### S5 技术+测试起草 🤖

在 wolai 需求页撰写/更新技术方案与测试用例（对应需求功能点），不覆盖人已写需求。

### S6 审核技术 👤

有误 → 在页面注明订正意见 → Agent 修订 → 回到 S6。

### S8 评审闸门 👤

[SKILL.md](SKILL.md) 中 S8 Gate 全满足才可进 S9。

### S10 人工测试 👤

| 结果 | 动作 |
|------|------|
| implementation | 改代码 → 必要时补用例 |
| design / requirement | [defect-sync.md](modules/defect-sync.md) → 快速重评审 |

## 独自版 vs 团队版

| 维度 | AIO | FTM |
|------|-----|-----|
| 看板 | 本地 task.md + wolai 定稿 | PM 维护 wolai |
| 终审 | 未来的自己 | Lead |
| 测试 | Agent 起草 + 自己探索 | QA 主导 |
| 变更通知 | checklist 自律 | 显式机制 |

团队模式见 [team-workflow.md](team-workflow.md)。

## 并行需求

不耦合需求：同基线切不同分支，各开独立 Agent 会话。
