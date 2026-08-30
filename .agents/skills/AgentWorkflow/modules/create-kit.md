# 开工登记（子模块）

> 父 Skill：[SKILL.md](../SKILL.md) | 阶段：S0 / B0

登记元信息并关联已有 wolai 需求页。**不向 wolai 注入固定文档模板。**

## 套件类型

| 类型 | 触发词 |
|------|--------|
| feature | 功能、新特性 |
| bugfix | bug、缺陷 |

## 步骤

1. **收集元信息**：标题、类型、MODE(solo/team)、仓库、分支、wolai 需求页（链接或 page_id）
2. **关联 wolai 页**：使用 PM 已有页面；若无则 `create_doc` 仅创建标题页，内容由人后续填写
3. **创建 Git 分支**（从 `dev` 或用户指定基线）
4. **建立任务文档**（核心维护文档，状态来源）：单任务用 `docs/task.md`，多任务并行用 `docs/tasks/<需求ID>.md`。按两段结构填写：
   - **一、任务信息（头部）**：基本信息（需求 ID、标题、类型、模式、开发分支、基线）、wolai 文档链接、关联工程项目（用途/是否涉及）、涉及模块、架构与规范要求
   - **二、进度与共创记录**：当前阶段=S1、阶段清单、待反馈/开放问题（先放 S1/S2 待办）
   - 新任务即「重填一、清空二」；详见 [SKILL.md](../SKILL.md)「task.md 维护约定」。
5. **在需求页追加开工记录**（一段文字即可）：需求 ID（`REQ-YYYYMMDD-001`）、仓库、分支、模式、开工日期、当前阶段 S1
6. **输出待办**：把 S1/S2 需人完成的事项（需求正文、工程背景）写入 task.md 待反馈区块并提示用户
7. 进入 [solo-workflow.md](../solo-workflow.md) 或 [team-workflow.md](../team-workflow.md) 的 S1

## 占位符

- 需求 ID → `REQ-YYYYMMDD-001`
- 分支命名参考仓库 README：`f/xxx`、`fix/xxx`

## 页面已存在时

只读现有内容，不覆盖、不批量追加模板章节。缺什么由人在原页补充，Agent 仅在对应阶段写入评审/技术/测试等产出。

## 完成后

| 类型 | 下一步 |
|------|--------|
| feature | 人填完 S1 必填 → S3 [requirement-review.md](requirement-review.md) |
| bugfix，人填完复现与范围 | 可选 B2 简评 → 人确认 → S9 |
