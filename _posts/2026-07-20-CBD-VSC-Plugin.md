---
layout:     post
title:      "CodeBind Docs插件"
subtitle:   "AI、Agent、CBD"
date:       2026-07-20
update:     2026-07-20
author:     "elmagnifico"
header-img: "img/blackboard.jpg"
catalog:    true
mermaid:    false
tobecontinued: false
tags:
    - AI
    - Agent
---

## Foreword

之前学 VS Code 插件，算是半途而废。最近结合 Agent，把当时没做完的想法做完了，刚好这东西能塞进目前这套 AI 工作流里。

[Agent 工作流](/2026/06/24/Agent-Workflow/)里反复强调一件事：先文档、后代码；文档得是 Agent 能读、人能审的单一事实来源。 wolai 管产品需求没问题，但落到具体模块、具体函数时，设计上下文往往还是散的，注释里有一点、README 里有一点、脑子里有一点。于是就有了 CodeBind Docs。



## 为什么要做

下一代编辑器怎么吹都行，现实里无论哪种 IDE，核心还是代码；文档怎么改，都和代码是两套东西。文档不同步、散落各处，要维护就异常痛苦。

常见几种烂法：

- 往源码里塞大段注释，污染代码，review 时噪音一大堆
- 文档丢到云端 wiki，和仓库版本对不上，Agent 也摸不着
- 靠人记得「这个函数的设计在某某页」，人会忘，Agent 更不会自己猜

既然如此，为什么不把代码和文档绑紧一点？理想态当然是混在同一个文件里：上面文档（图、视频都行），下面代码，按顺序拼接，编译时再拆回去。Jupyter、Colab 某种程度上就是这条路。

但真混排对现有工程改造太狠了，语言服务器、diff、CI、同事的习惯全要跟着改。所以我先做了一版**能立刻用的妥协**：源码零侵入，文档旁路挂在仓库 Markdown 里，打开代码时左右分栏同步看、同步改。这就是 CodeBind Docs（简称 CBD）。



## CodeBind Docs

![image-20260719232659382](https://img.elmagnifico.tech/static/upload/elmagnifico/202607192328855.png)

![image-20260719233917717](https://img.elmagnifico.tech/static/upload/elmagnifico/202607192343632.png)

CodeBind Docs：**旁路绑定的代码文档扩展**，VS Code / Cursor 都能用。

> https://marketplace.visualstudio.com/items?itemName=codebind.codebind-docs

- 文档落在仓库的 `docs/`（可改路径），跟代码一起进 Git
- 绑定写在 Markdown 的 YAML 头里，不改被绑定的源码
- 支持整文件绑定，也支持某个函数/类的行范围绑定
- 打开已绑定的源文件 → 右侧自动打开对应文档；光标进到某个代码块，文档跟着切

绑定后是这样：

```yaml
---
cbd:
  target: src/foo.ts
  kind: file          # 或 range
  startLine: 15       # range 时
  endLine: 44
  symbol: activate    # range 强烈建议填
  contentHash: abc
---
```

没有 `cbd:` 头的 Markdown 不算绑定，普通说明文档该咋放还咋放。CodeBind Docs插件仓库自己也在用：`src/**` 基本都挂了旁路文档，有需要看效果直接打开这个仓库即可



## 优势

对照痛点看就清楚了：

| 痛点 | CBD 怎么搞 |
|------|------------|
| 文档散、和代码对不上 | 绑定写在文档头，跟文件 / 行范围走 |
| 注释污染源码 | **不改源码**，旁路 Markdown |
| 云端文档难版本控制 | 纯本地、可 Git，无强制云端 |
| Agent 不知道读哪 | Initialize 生成 `AGENTS.md` / Cursor rules，文档就在仓库里 |

日常用下来，比较实在的几条：

1. **分栏同步**：写代码时右侧就是设计说明，少来回切窗口、少漏逻辑
2. **漂移治理**：文件/目录改名尽量自动改 `target`；行号乱了可以按 symbol 一键重算；内容哈希变了只软提醒，不逼你，本质上是告诉你文档和代码可能不同步了
3. **人与 Agent 共用同一套上下文**：改代码前先读旁路文档，代码变更尽量同一提交更新文档，这和[工作流](/2026/06/24/Agent-Workflow/)里「缺陷回流文档」是同样规范，只是粒度从需求页下沉到了模块/函数
4. **开源、独立**：不依赖远程服务器，能看到代码就能看到文档，这二者永远同步

对 Agent 工作流来说，CBD 补的是 wolai 够不着的那一层：产品需求可以仍在 wolai；落到「这个文件为啥这么写」时，旁路文档 + `AGENTS.md` 对照表，开新会话也能直接喂进去。



## 五分钟上手

1. 装扩展（[市场页](https://marketplace.visualstudio.com/items?itemName=codebind.codebind-docs)搜 CodeBind Docs，或装 VSIX / 源码目录），打开**文件夹工作区**（单文件模式扫不了绑定）
2. 命令面板跑 **`CBD: Initialize`**，创建 `docs/`、`assets/`、模板、`AGENTS.md`、`.cursor/rules/cbd.mdc` 等
3. 打开一个源文件，跑 **`CBD: Bind Doc to Current File`**，选整文件或代码块（代码块尽量填 symbol）
4. 之后切源文件就会左右分栏；左侧 Activity Bar 有 CodeBind Docs 图标，已绑定 / 待绑定一目了然

常用入口：

| 入口 | 作用 |
|------|------|
| `CBD: Open Docs Index` | 文档主页（树、覆盖率、漂移提醒） |
| 源码顶部 CodeLens / 状态栏 | 打开旁路文档 |
| 侧栏 **已绑定 / 待绑定** | 浏览与补绑 |

文档面板支持类 Typora 的即时渲染，也能切纯文本；粘贴图片会进 `docs/assets/`；同仓库其它文档可以用 `cbd-include` 只读嵌入。



## 竞品

思路并不新鲜。

**Swimm** 有点类似，但偏云端，还叠了 AI、扫描、审查一类能力：

> https://swimm.io/

古人也试过「文档和代码绑在一起」：

> http://www.mark-to-win.com/tutorial/176050.html

**Jupyter** 把代码和 Markdown 写在一起，代码还能跑：

> https://zhuanlan.zhihu.com/p/478098675

**Colab** 更进一步，环境和运行都云上给你备好了：

> https://colab.research.google.com/

CBD 和它们的差别很明确：强调**本地、源码零侵入、旁路 Markdown + 分栏**；不做强制云端，也不做真混排笔记本。工程仓库里的 TypeScript / 嵌入式 / 多端业务，往往更吃这套，你不需要把整个项目改成 notebook，也能让文档跟着代码走。



## Summary

长远看，我仍然觉得为什么代码不可以和文档写在一起，甚至多种代码混在一起？通过文件标识区分语言，顺序唯一确定，查看时又能把各块独立挪动；页面属性决定编译类型，中间过程再生成「普通」代码文件和「普通」文档文件，相当于在编译链路里多做一次编译，让工程不再只是代码堆。CBD的下一步可能会改整个富文本文本前端，实现我的这个想法

现在的 CBD 是先把「绑得住、找得到、Agent 读得到」做到位。真混排、音视频显示、block 合并、跨 IDE、代码块重组，以后再说。



## Quote

> 文档和代码要是老对不上，Agent 再聪明也只能猜；旁路绑住一层，至少猜的时候有据可查。
