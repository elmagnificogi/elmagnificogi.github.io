---
layout:     post
title:      "Cursor、Claude、Codex对比"
subtitle:   "AI、Agent、Skill、workflow、产品设计"
date:       2027-07-16
update:     2027-07-16
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

最近把几个比较强的AI工具都试用了一下，对比一下



## Cursor

我用的最多，也是相对比较传统的代码工具，理解和使用门槛都是以程序为基准的

Cursor默认套餐的上下文大小实在是太小了才260多K，别人都1M+，大需求很容易就跑过了，还好内置了压缩上下文和长期记忆等，上下文比较大的时候会自动衔接处理，不需要特别注意。

Cursor相对没有Claude和Codex那么激进，更偏向为已有工程和程序员协作方向服务，针对已有的工作流改动量比较小，适合循序渐进的切换到Agent工作流。



## Claude

Claude本身不是一个像 Cursor 那样的独立编辑器，它的核心是 agent 对话式工作方式，但并不是只有纯终端聊天——有几种带图形界面的用法：

**1. IDE 插件（最接近 Cursor 的体验）**
Claude Code 有 VS Code 和 JetBrains（IntelliJ、PyCharm 等）的官方插件。你在自己熟悉的编辑器里写代码，Claude Code 以侧边栏面板的形式运行，它提出的修改会以 **inline diff 的形式直接显示在编辑器里**，你可以逐个审查、接受或拒绝改动。这和 Cursor 的 Agent/Composer 模式体验很像——区别在于你用的是原生 VS Code/JetBrains，而不是一个魔改的编辑器。

**2. 桌面应用（Mac/Windows）**
独立的 Claude Code 桌面应用，以会话为中心，可以并行跑多个任务，改动以 diff 视图呈现供你审查。

**3. 网页版**
claude.ai/code，在云端环境跑任务，同样是对话 + diff 审查的模式。

**4. 终端 CLI**
最原始的形态，纯命令行对话。

**和 Cursor 的主要区别：**

- Claude Code **没有 Tab 自动补全**那种"边打字边补全"的功能，它的定位是把整个任务交给 agent 去完成（读代码、改多个文件、跑测试），而不是辅助你逐行手写。
- Cursor 是"编辑器为主、AI 为辅"，Claude Code 是"agent 为主、你负责审查"。
- 如果你想要"自己写代码 + AI 帮忙"的体验，用 VS Code + Claude Code 插件最合适；如果任务可以整个描述清楚丢给 AI，对话式反而效率更高。

简单说：**不能在 Claude Code 里直接手动编辑代码**（它不是编辑器），但通过 IDE 插件，它可以嵌进你的编辑器，diff 审查体验和 Cursor 的 agent 模式基本一致。



对比Cursor，Claude确实在输入的模态上选择是更多的，语音、图片都给出了很明显的提示，Agent可以处理，虽然现在Cursor也在抄他们的无代码化的Agent，但还是差一些。Claude的体验上感觉确实更慢一些，而且很多小问题都需要你来回答，确认，确认清楚以后给出plan，才开始下达指令，开始做。

他确实符合一般认知或者普通的方法论，但是对比其他AI工具的一句话（他就去猜你意思，直接做完给你看结果），万一做对了，那种惊喜感就没了。

Claude更倾向于和输入的用户进行对话，多次交互以后摸清用户的需求，然后总结给用户，再进行施工。对话的内容或者交互选项也基本都是围绕着Plan-AI工作流来走的。



![image-20260706204050425](https://img.elmagnifico.tech/static/upload/elmagnifico/20260706204057497.png)

Claude的内部plan工作流，基本和我的一致，只是我的可以灵活修改，而Claude是用harness写死的

Claude的上下文比Cursor默认要大很多，对应实际使用时跑偏的概率就小一些，由于Claude上限高，所以也看到了一个小需求，虽然中间走偏了一些，但是上下文就已经380k了，超过Cursor默认大小了



#### 缺点

Claude不太好的地方就是如果你想要看代码或者文档Claude把这部分UI隐藏得有点深，而且显示效果也比较差，给程序员用还是有点别扭，给纯小白或者是非编码类工作人员用是可以的。

Claude的plan是按照周期性恢复token用量的，这就有点问题，工作时间的token不够用，需要开更大的plan，但是闲置时间这个就闲置了，直接浪费了。这个周期性的token量还是比较小的，卡在完成一个小需求的边缘。

Claude有一点不好，安装skill或者mcp等等内容以后需要重启客户端，新对话大概率还是显示没安装，而Cursor这种安装以后都是实时更新上来的

Claude的联网搜索的意向似乎偏弱一些，有些功能或者能力网络上有最新的，但是模型偏向使用记忆内的能力，从而直接给了结论，需要给出搜索提示或者具体的链接，他才会拿最新的内容来进行工作，这个问题Cursor也有，只是Claude更明显一些



## CodeX



## Summary



## Quote

> claude
