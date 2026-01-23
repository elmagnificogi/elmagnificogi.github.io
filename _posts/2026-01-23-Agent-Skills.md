---
layout:     post
title:      "Agent Skills实践"
subtitle:   "Cursor、MCP、AI"
date:       2026-01-23
update:     2026-01-23
author:     "elmagnifico"
header-img: "img/z2.jpg"
catalog:    true
tobecontinued: false
tags:
    - AI
    - Cursor
    - Skills
---

## Foreword

最近 Skills 稍微有点火，哪哪都是在讨论。这里我也结合一下日常工作的实际场景来实践一下，看看 Agent Skills 能干些啥，以及它和之前说过的 MCP 有什么区别。



## Skills

> https://github.com/anthropics/skills

Skills是由Anthropic提出的，官方给了开源的skills的模板，很快就接入了其他各大模型



#### 核心概念

Agent Skills 是一个用于为 AI 智能体扩展专门能力的开放标准。Skills 会把特定领域的知识和工作流封装起来，智能体可以调用这些 Skills 来执行对应的任务。



大白话解说：Skills 就是把平常我们命令 AI 去做的一些「复合模板 + Prompt + 规则」的事情，收敛成一个技能。这件事本身可能很复杂（需要若干步骤才能做完），也可能比较简单，一个命令就能搞定。

再说一下就是套路或者方法论，只要是有迹可循，可以模仿完成，并且有条理清晰的步骤的事情，它就可以变成一个Skill。

举个例子，我平常写 Blog 文章，经常需要 AI 帮我找一下错别字，拼音很容易打错了，自己又不一定能发现。我自己常用的 Prompt 就是下面这样，其实挺简单的：

```
帮我检查一下当前文档中是否存在的书写错误的情况，并修改，忽略标点符号、中英混排的问题
```

平常这种 Prompt，要么就单纯存一份 Prompt，要么弄成一条规则，但每次还是得手动提醒 Agent 去触发这个流程。

那如果这个 Prompt 再复杂一点，比如还想让 Agent 帮我再润色一下文章，那我就还得再提一个 Prompt：

```
阅读当前文档，并模仿文档中书写的风格和语气，对全文进行润色，忽略标点符号、中英混排的问题
```

你可能会说，直接把这两个 Prompt 合并不就完了？确实可以，但有些时候，你可能并不想让它帮你润色。

也可能有些时候，你只是想让它顺手帮你改一下标点符号。这种情况下，这个 Prompt 每次都不太一样，但来来回回核心就那两句。

这个时候，按照 Skills 的思路，我们就可以把这几个 Prompt 抽出来，转化成一个 Skill。以后要用的时候只需要一句话就能触发，不用再反复粘贴那几段文字。



#### Cursor实践

按照上面的例子，我就用 Cursor 实践一下。其他 Agent 的使用方式大同小异，这里就不逐个展开了。

![image-20260123152037745](https://img.elmagnifico.tech/static/upload/elmagnifico/20260123152037796.png)

Cursor Settings中新建一个Skills，其实只是问了一下Agent，用处不大

> 需要先了解一些信息，以便创建合适的技能。
>
> 请提供：
>
> 1.技能名称和用途：这个技能要做什么？解决什么问题？
>
> 2.存储位置：
>
> - 个人技能（~/.cursor/skills/）：所有项目可用
>
> - 项目技能（.cursor/skills/）：仅当前项目
>
> 3.触发场景：什么情况下应自动使用这个技能？
>
> 4.具体需求：需要哪些特殊知识、工具或流程？
>
> 5.输出格式：是否有特定模板、格式或风格要求？

直接访问Cursor官方说明

> https://cursor.com/cn/docs/context/skills

先在当前项目路径下新建一个 skills 的存储路径：

```
.cursor/skills/
```

一个完整一点的 skills 目录结构大概是下面这样，这里先看个概念：

```
.cursor/
└── skills/
    └── ArticleReview/
        ├── SKILL.md
```



`SKILL.md` 按照下面的内容来写，格式和我这篇文章类似，也是用 YAML 在开头做一些基础说明：

- disable-model-invocation 关闭自动调用，这里不关闭，允许

```
---
name: ArticleReview
description: 文章内容审查
disable-model-invocation: false
---

# 文章内容审查

为 Agent 提供的详细指令。

## 使用时机

- 在以下情况使用此技能
- 如果文档名称符合“年-月-日-文章标题”的规则,类似:2015-11-11-RaspberryStartup-5
- 如果只是要审查文章，那么只用执行指令的1、2、3步骤即可
- 如果要审查润色文章，那么执行所有步骤

## 指令

- 1.帮我检查一下当前文档中是否存在的书写错误的情况
- 2.忽略标点符号、中英混排的问题
- 3.完成上述检查和修改后，先向我简要汇报修改点，等待我确认
- 4.阅读当前文档，并模仿文档中书写的风格和语气，对全文进行润色
```

不小心手误打错了，Cursor 也会直接帮你检查并给出优化建议。

![image-20260123162144404](https://img.elmagnifico.tech/static/upload/elmagnifico/20260123162144437.png)

正确识别以后，就可以在这里看到我们刚才创建的 Skills 了：

![image-20260123171105353](https://img.elmagnifico.tech/static/upload/elmagnifico/20260123171105386.png)

接着试一下，看能否正常触发我们刚刚配置好的「审查流程」：

![image-20260123171153095](https://img.elmagnifico.tech/static/upload/elmagnifico/20260123171153124.png)

确认没问题之后，一个简单的 Skill 就算搭建完成了。如果后面还有类似的工作流，就可以直接在这个模板的基础上继续拓展。



#### 进阶

```
.cursor/
└── skills/
    └── ArticleReview/
        ├── SKILL.md
        ├── scripts/
        │   ├── deploy.sh
        │   └── validate.py
        ├── references/
        │   └── REFERENCE.md
        └── assets/
            └── config-template.json
```

上面的例子还是比较简单的。如果我们希望把技能做得更复杂、更模块化，可以使用类似上面这样的目录结构：

同样的所有说明都是在SKILL.md中，在这里对内部的脚本、工具、参考元、素材等内容进行引用或者说明，这部分内容就会作为Prompt喂给Agent，说明中可以直接使用相对路径来调用其他内容

其次，SKILL中也可以调用MCP指令等内容

不仅如此，还可以再进一步，这是一个SKILL，但是如果是多个呢？

```
.cursor/
└── skills/
    └── ArticleReview1/
        ├── SKILL.md
        ├── S1.md
        ├── S2.md
        ├── S3.md
```

如果你把一整个步骤写得特别细、特别多，这会导致 Token 消耗一下就特别多，而实际上只需要执行其中某一条或者某几条的时候，SKILL 就会显得有点过于臃肿了。

SKILL.md就提供了类似目录的方式，你可以把一个方式方法拆解成N个步骤，然后每个步骤给他一个单独的md文档，具体执行的时候，只有被选中的这个步骤细节才会被作为Prompt喂给AI，这样Token消耗量就下去了

他就有点类似于经验书了，可以按照门类或者方法细节，逐步进行归类说明，相当于是把你的人类经验提供给了Agent，这样他就能帮你按照你的方法去实现任务目标了。



更复杂的功能，参考官方模板和示例，已经给的比较全了，干各种事情都有

![image-20260123214937144](https://img.elmagnifico.tech/static/upload/elmagnifico/20260123214937177.png)



#### 与MCP区别

感觉之前对于MCP的预判说大了，MCP对比Skills有点更底层了，它更像是把不同软件或者接口串联起来的工具，更接近开发层面，而Skills则是更接近用户侧的东西，把AI玩出花来。

MCP为Skills提供了底层技术支持，Skills则是把底层接口的各种玩法进行总结，这样用户侧就可以非常简单的让AI介入到自己的工作或者生活中，真正的实现提效



## Summary

Agent Skills 确实挺不错，其实有点像是各种AI综合赋能的平台，通过无码化或者低代码化快速将一些常用的功能进行综合。他们的实现思路都是比较类似的，只是Agent Skills更文本化，门槛更低一些，不需要你真的懂底下的技术层面的内容，你只要把你能套路化、模板化的经验公式说清楚，AI就能帮你完成。



## Quote

v2ex里这个帖子讲的也太抽象了，明明是个很简单的概念

> https://www.v2ex.com/t/1187373
