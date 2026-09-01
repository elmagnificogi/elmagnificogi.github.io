---
layout:     post
title:      "CodeBind Docs插件-JetBrains版本"
subtitle:   "IntelliJ Platform、JCEF、跨IDE、CBD"
date:       2026-09-01
update:     2026-09-01
author:     "elmagnifico"
header-img: "img/blackboard.jpg"
catalog:    true
mermaid:    false
tobecontinued: true
tags:
    - AI
    - Agent
    - JetBrains
---

## Foreword

[CodeBind Docs](/2026/07/20/CBD-VSC-Plugin/) 那篇写完时说过：真混排、跨IDE，以后再说。VS Code / Cursor这边用了一阵，绑定格式也稳了，但实际还是有部分代码工程绑在 IntelliJ IDEA、Android Studio 里，既然如此不如把 IntelliJ Platform 这一侧也补上

于是把同一套旁路绑定迁到了 IntelliJ Platform。由于两边代码差的比较多，没办法通用，仓库只能分开

> https://github.com/elmagnificogi/CodeBindDocs-IntelliJ

绑定头和 VS Code 版完全兼容，同一个仓库两边都能开。目前JetBrains Marketplace审核还没过，本地打 zip 来装。



## 为什么要做

CBD 的核心不是编辑器插件，是那份 YAML 头：文档跟代码走，源码零侵入。编辑器只是读这份头、把文档甩到旁边。

现实却是：TypeScript / 前端在 Cursor，Kotlin / Android / 后端在 IntelliJ IDEA。两边各写一套文档，Agent 更懵。VS Code 扩展已经能生成 `AGENTS.md`，但 Junie、JetBrains IDE 里的 Agent 读不到侧栏分栏，人也得来回切。

所以目标很明确：

- 同一套 `cbd:` 头，VS Code 和 JetBrains 这边都能认
- 打开源文件，右侧同样跟文档
- Initialize 除了 Cursor rules，再写一份 Junie guidelines
- 能力对齐，不在 JetBrains 这边另发明一套绑定

产品形态和 VS Code 版一样：左侧 Bindings 树，右侧文档工具窗，状态栏、Inlay、漂移检测都有。命令名前缀仍是 **CBD**。

![image-20260901205623228](https://img.elmagnifico.tech/static/upload/elmagnifico/20260901205623291.png)

JetBrains家的IDE比较好的是他们有侧边栏，VSC系列都没有，这个侧边栏就能取代VSC里自动打开文档和有时候不需要自动打开的矛盾点



## 迁移

原来VSC插件是 TypeScript ，JB家的不支持， Kotlin 重写。IntelliJ Platform 插件跑在 IDE 进程里，API、线程模型、UI 和 VS Code 是完全两套东西。

```text
src/main/kotlin/com/codebinddocs/core      纯逻辑，不碰 IDE API，可单测
src/main/kotlin/com/codebinddocs/intellij  工具窗、Action、分栏、Inlay、JCEF
src/main/resources/webview                 Vditor + pane.html/js，跟 VS Code 共用前端
```

`core` 里是 YAML 解析、行范围、哈希、脚手架文本、路径规划。这些在 VS Code 仓库已经打磨过，迁过来只换语言，行为要对齐。IDE 相关的全扔 `intellij` 包：`plugin.xml` 注册工具窗、Settings、状态栏、`ProjectActivity`。

脚手架是 IntelliJ Platform Gradle Plugin 2.x：

- 构建目标 **JDK 21**（本机若只有 11，Gradle 插件直接起不来）
- `sinceBuild=241`，覆盖 2024.1+（IntelliJ IDEA / Android Studio / PyCharm / WebStorm / GoLand / CLion）
- `gradlew runIde` 起一个带本插件的 Community 沙箱，改完重载

文档面板没走 Swing Markdown，直接把 VS Code 那套 Vditor 塞进 JCEF。即时渲染、源码模式、粘贴图片、`cbd-include`，前端逻辑能复用就复用，少维护两套编辑器。

JB版本的仓库也在用 CBD：`src/main/kotlin/**` 基本都挂了旁路文档。改插件前先读对应 Markdown，和 [Agent工作流](/2026/06/24/Agent-Workflow/) 是同一套。



## 市场发布

1. 用 JetBrains 账号登录 [plugins.jetbrains.com](https://plugins.jetbrains.com/)。
2. 账号菜单 Upload plugin。若是第一次发插件，要同意 [Developer Agreement](https://plugins.jetbrains.com/legal/developer-agreement) 并创建 Vendor（例如 `codebinddocs`）。
3. 上传 `CodeBindDocs-IntelliJ-0.1.12.zip`（单个 zip 不超过 400MB）。
4. 填表：
   - License：MIT，链接到仓库 `LICENSE`
   - Tags：Documentation、Markdown 等（影响搜索）
   - Source code：`https://github.com/elmagnificogi/CodeBindDocs-IntelliJ`
   - 渠道选默认（公开），不要勾 Hidden
5. 提交后进入人工审核，通常几天。过审后页面类似：
   `https://plugins.jetbrains.com/plugin/xxxxx-codebind-docs`

![image-20260901210308399](https://img.elmagnifico.tech/static/upload/elmagnifico/20260901210308423.png)

总体来说JB发布插件还是比较简单的，申请也容易，不像Cursor那边那么麻烦



![image-20260901210048989](https://img.elmagnifico.tech/static/upload/elmagnifico/20260901210049013.png)

上架前自动校验先打回来一圈，和 [Open VSX 那次](/2026/07/21/CBD-Publisher-OpenVSX/) 一个味：身份和命名比代码先卡死。

- 插件 ID 不能含 `intellij`。仓库包名是 `com.codebinddocs.intellij`，ID 必须改成 `com.codebinddocs.plugin`。ID 上架后基本改不了，幸好还没发出去
- 简介必须以英文开头，中文可以跟在后面。市场审核按英文描述走
- 名字里也不能出现 Plugin / IntelliJ / JetBrains 产品名。显示名继续叫 CodeBind Docs，没问题
- JCEF 做成 optional 时，必须带 `config-file`，空依赖校验不过

目前仍是 `gradlew buildPlugin` 出 zip，Settings → Plugins → 齿轮 → Install Plugin from Disk。市场页上线以后再补。



## 审核

![image-20260901211017557](https://img.elmagnifico.tech/static/upload/elmagnifico/20260901211017586.png)

审核以后还是能看到很多有问题的点，我只在26版本测了，之前的版本确实没验证。

官方有这样的自动化的验证倒是挺好的，比VSC完善多了




## 和 VS Code 版差在哪

绑定数据基本一模一样，只是实现不一样

| | VS Code / Cursor | IntelliJ Platform |
|--|------------------|-------------------|
| 语言 | TypeScript | Kotlin |
| 文档面板 | Webview + Vditor | JCEF + 同一套 Vditor |
| 侧栏 | Activity Bar | 左侧工具窗 **CBD Bindings** |
| 行内入口 | CodeLens | Editor Inlay |
| 分栏 | 编辑器组 | 右侧工具窗，`Ctrl+Alt+Shift+D` 开关 |
| 打开文档 | `Ctrl+Alt+D` | 同样 `Ctrl+Alt+D` |
| Agent 脚手架 | `AGENTS.md` / Cursor rules | `.junie/guidelines.md` |
| 安装 | Marketplace / Open VSX | 暂时本地 zip |

目录绑定（`kind: directory`）、漂移、路径迁移、模板、资源目录，两边都有。打开已绑定仓库，换 IDE 不用改文档。



VSC可以直接打开JB的工程，反过来也可以。



## 五分钟上手

1. JDK 21 下 `gradlew.bat buildPlugin`，把 `build/distributions/CodeBindDocs-IntelliJ-*.zip` 从磁盘装进 IDE，重启
2. 打开一个**项目文件夹**（单文件模式扫不了绑定）
3. **Tools → CodeBind Docs → CBD: Initialize**，创建 `docs/cbd/`、`AGENTS.md`、Cursor rules、Junie guidelines
4. 打开源文件，跑 **CBD: Bind Doc to Current File**（整文件或代码块）；或在项目树对文件夹 **CBD: Bind Doc to Folder**
5. 自动分栏开着时，切源文件右侧就跟；随时 `Ctrl+Alt+D` 打开对应文档

常用入口：

| 入口 | 作用 |
|------|------|
| `CBD: Open Docs Index` | 文档主页（树、覆盖率、漂移） |
| `Ctrl+Alt+D` / Inlay / 状态栏 | 打开当前源文件的旁路文档 |
| `Ctrl+Alt+Shift+D` | 开关自动分栏 |
| 侧栏 **已绑定 / 待绑定** | 浏览与补绑 |
| 代码块 | 编辑器里拖选，点顶部横幅 **确认选区** |

2026.2 若右侧面板空白，先启用 **Web Browser (JCEF)**。没启用时仍可以从左侧 Bindings 用 IDE 自带 Markdown 打开文档，只是没有即时渲染。



## Summary

先这样有问题再改改。
