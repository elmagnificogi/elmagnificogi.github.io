# 缺陷文档回流（子模块）

> 父 Skill：[SKILL.md](../SKILL.md)

只改代码不更新文档 → Agent 下轮仍按旧文档理解。

## 输入

- 缺陷描述、wolai 页面 ID
- 类型：`implementation` | `design` | `requirement`

## 分流

| 类型 | 必须先本模块 |
|------|--------------|
| implementation | 否 → 直改代码 |
| design / requirement | **是** → 人确认后才改代码 |

## 步骤

1. 读 wolai 三份文档
2. 起草变更（requirement→需求+技术；design→技术+查需求）
3. 每条变更至少一条测试用例
4. 写回 wolai 对应章节，不覆盖人已确认内容
5. 输出变更摘要，**等人确认**
6. 写回 wolai → 快速重评审 → 改代码 → [pre-merge-audit.md](pre-merge-audit.md)

## 变更摘要模板

```markdown
## 文档回流摘要
**类型**：**根因**：
| 文档 | 章节 | 变更 |
| 需求 | | |
| 技术 | | |
| 测试 | 新增 T? | |
### 待确认
- [ ] 根因准确  - [ ] 用例已覆盖  - [ ] 可改代码
```

团队版：需求变更通知 DEV/QA；技术变更通知 QA。
