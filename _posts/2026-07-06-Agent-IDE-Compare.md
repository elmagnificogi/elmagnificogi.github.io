---
layout:     post
title:      "Cursor、Claude、CodeX深度体验、对比"
subtitle:   "AI、Agent、Skill、workflow、产品设计"
date:       2026-07-30
update:     2026-08-06
author:     "elmagnifico"
header-img: "img/cap-head-bg2.jpg"
catalog:    true
mermaid:    false
tobecontinued: true
tags:
    - AI
    - Agent
---

## Foreword

最近把几个比较强的AI工具都试用了一下，对比一下



## Cursor

我用的最多，也是相对比较传统的代码工具，理解和使用门槛都是以程序为基准的

Cursor默认套餐的上下文大小实在是太小了才260多K，别人都1M+，大需求很容易就跑过了，还好内置了压缩上下文和长期记忆等，上下文比较大的时候会自动衔接处理，不需要特别注意。

Cursor相对没有Claude和CodeX那么激进，更偏向为已有工程和程序员协作方向服务，针对已有的工作流改动量比较小，适合循序渐进的切换到Agent工作流。



#### Agent模式

Cursor虽然想主推Agent模式，每次启动默认就是Agent对话窗口，但是这东西还是有点难用，对于现有工程还是用IDE模式更好一些。



#### 用量

![image-20260727150119662](https://img.elmagnifico.tech/static/upload/elmagnifico/20260727150119694.png)

由于Claude被5小时限制，大部分需求是Cursor做的，也只是轻度使用

![image-20260727150218082](https://img.elmagnifico.tech/static/upload/elmagnifico/20260727150218114.png)

满打满算也就700M token就耗尽了plan，如果全力用，估计一周就耗尽了。

![image-20260728161440574](https://img.elmagnifico.tech/static/upload/elmagnifico/20260728161440619.png)

Cursor发现我用尽了，还送了20刀，可以的



## Claude

Claude本身不是一个像Cursor那样的独立编辑器，它的核心是agent对话式工作方式，但并不是只有纯终端聊天，主要有几种带图形界面的用法：

- 桌面应用（Mac/Windows），独立的Claude Code桌面应用，以会话为中心，可以并行跑多个任务，改动以diff视图呈现供你审查。

- IDE插件，Claude Code有VS Code和JetBrains（IntelliJ、PyCharm等）的官方插件。你在自己熟悉的编辑器里写代码，Claude Code以侧边栏面板的形式运行，它提出的修改会以inline diff的形式直接显示在编辑器里，你可以逐个审查、接受或拒绝改动。这和Cursor的Agent/Composer模式体验很像，区别在于你用的是原生VS Code/JetBrains，而不是一个魔改的编辑器。

- 网页版，claude.ai/code，在云端环境跑任务，同样是对话 + diff审查的模式。

- 终端CLI，最原始的形态，纯命令行对话。



### 桌面端

Cursor是“编辑器为主、AI为辅”，Claude Code是“agent为主、你负责审查”。如果你想要“自己写代码 + AI帮忙”的体验，用VS Code + Claude Code插件最合适。如果任务可以整个描述清楚丢给AI，对话式反而效率更高。

简单说，不能在Claude里直接手动编辑代码（它不是编辑器），但通过IDE插件，它可以嵌进你的编辑器，diff审查体验和Cursor的agent模式基本一致。



对比Cursor，Claude确实在输入的模态上选择是更多的，语音、图片都给出了很明显的提示，Agent可以处理，虽然现在Cursor也在抄他们的无代码化的Agent，但还是差一些。Claude的体验上感觉确实更慢一些，而且很多小问题都需要你来回答，确认，确认清楚以后给出plan，才开始下达指令，开始做。

他确实符合一般认知或者普通的方法论，但是对比其他AI工具的一句话（他就去猜你意思，直接做完给你看结果），万一做对了，那种惊喜感就没了。

Claude更倾向于和输入的用户进行对话，多次交互以后摸清用户的需求，然后总结给用户，再进行施工。对话的内容或者交互选项也基本都是围绕着Plan-AI工作流来走的。



![image-20260706204050425](https://img.elmagnifico.tech/static/upload/elmagnifico/20260706204057497.png)

Claude的内部plan工作流，基本和我的一致，只是我的可以灵活修改，而Claude是用harness写死的

Claude的上下文比Cursor默认要大很多，对应实际使用时跑偏的概率就小一些，由于Claude上限高，所以也看到了一个小需求，虽然中间走偏了一些，但是上下文就已经380k了，超过Cursor默认大小了



#### 缺点

Claude Code没有Tab自动补全那种“边打字边补全”的功能，它的定位是把整个任务交给agent去完成（读代码、改多个文件、跑测试），而不是辅助你逐行手写。

Claude不太好的地方就是如果你想要看代码或者文档Claude把这部分UI隐藏得有点深，而且显示效果也比较差，给程序员用还是有点别扭，给纯小白或者是非编码类工作人员用是可以的。

![image-20260720174943729](https://img.elmagnifico.tech/static/upload/elmagnifico/20260720174950814.png)

Claude的plan是按照周期性恢复token用量的，这就有点问题，工作时间的token不够用，需要开更大的plan，但是闲置时间这个就闲置了，直接浪费了。这个周期性的token量还是比较小的，卡在完成一个小需求的边缘。

- 我的感觉是当你上下文特别大的时候，似乎消耗得特别快，上下文小的时候没有后期这么明显

Claude有一点不好，安装skill或者mcp等等内容以后需要重启客户端，新对话大概率还是显示没安装，而Cursor这种安装以后都是实时更新上来的

Claude的联网搜索的意向似乎偏弱一些，有些功能或者能力网络上有最新的，但是模型偏向使用记忆内的能力，从而直接给了结论，需要给出搜索提示或者具体的链接，他才会拿最新的内容来进行工作，这个问题Cursor也有，只是Claude更明显一些



### Claude Code

Claude Code在VSCode或者Cursor插件中，就感觉比桌面APP响应快多了，而且反馈也比较好一些，不像APP端思考超久，感觉没干活的样子。

Claude Code在干活过程中还能直接插话进去，也没有排队这种机制，不知道内部是怎么实现的，可以纠正中间跑偏的地方，这个还挺好的，最后反馈结果是两个事情同时解决

Claude Code和VSC的结合感觉总有一种不兼容的既视感，体验上能明显感觉他是额外的一块，融合的不是很好。

Claude Code也少了很多插件或者交互的支持，明显不如Cursor原生的Agent好用



#### 用量

![image-20260727150107972](https://img.elmagnifico.tech/static/upload/elmagnifico/20260727150108046.png)

Claude，一个月只用了50%多，主要还是这个时限太恶心了，Fable5还送了100刀，三个改动直接耗尽，太不经用了。

![image-20260727150858211](https://img.elmagnifico.tech/static/upload/elmagnifico/20260727150858243.png)

Claude主要是在两个机器上使用的，总用量差不多100M Tokens，可以看到实际和Cursor比，价格差不多，但是用量小太多了，就算全用完，估计也不到300M Tokens



## CodeX

#### 注册

自从上次被封了1000刀以后，再没弄过新的了，现在再弄一个还真麻烦。账号注册还是随便注册，但是需要短信激活验证

![image-20260728164803628](https://img.elmagnifico.tech/static/upload/elmagnifico/20260728164803672.png)

我的GiffGaff目前有点问题，收不到验证码，虽然号还是活着的

- 最新消息：GiffGaff也开始回收国内的账号了，很多人被强制回收了，我还没收到邮件

OpenAI目前看是安哥拉的短信是最容易过的，随便试了一个，确实可以过

目前用的接码平台，短信收到失败，可以退款，最低充值3刀，刚好够用了

> https://hero-sms.com/cn/purchases/numbers

![image-20260728165241805](https://img.elmagnifico.tech/static/upload/elmagnifico/20260728165241838.png)

一些其他路径，利用美区苹果ID，然后使用ApplePay绕过OpenAI的支付，实际上不行，试过了，虽然可以跳过短信验证的步骤，但是无法成功支付，国内的信用卡会被拒绝。

- 同理、谷歌pay、paypal也都不行了，最后是让国外朋友直接信用卡帮我付了



#### 使用

![image-20260728180719202](https://img.elmagnifico.tech/static/upload/elmagnifico/20260728180719242.png)

CodeX还是有点无耻的，直接拿其他Agent工具的内容过来使用。

![image-20260728194040531](https://img.elmagnifico.tech/static/upload/elmagnifico/20260728194040565.png)

CodeX一上来就提示你安装插件，基本就是MCP，但是有很多软件都整合到里面了，对于小白用户来说不要太简单了

总体感觉CodeX确实反馈更快，比Cursor都快很多（基于`5.6 Sol 中`的模型强度），不过中性的情况下，感觉模型还是思考少一些，很容易思考不足或者写的代码是有问题的。拿来工作还是要偏向更智能一些，轻度的情况下，基本判断都有问题，就好像是个傻子，只看你给的东西，多一点点都不会思考。

![image-20260728193129604](https://img.elmagnifico.tech/static/upload/elmagnifico/20260728193136685.png)

比如让他检查我的文章，我给了路径，竟然告诉我没有文章，我服了。切换到极高以后，就具备自主性了，自己找文章，想尽一切办法完成目标。

CodeX的整体UI，你能感觉出来更流畅，绘制得也更精细，对比Claude，那就是个傻大黑，只抄了个皮毛。



#### Site

CodeX的原型能力有点强，纯属意外，我只是提了一下我的想法，半小时内就能搭好前后端的小应用，直接就能公网发布使用。

- 数据库都是serveless的，部署同理

原型风格、图片审美都还可以，结合需求，再打磨打磨，就能拿去演示了，总体下来估计一小时内就做完，很不错，有些小需求或者试错性质的东西拿这个来实验很好。

![image-20260805205233285](https://img.elmagnifico.tech/static/upload/elmagnifico/20260805205233468.png)

![image-20260806191356944](https://img.elmagnifico.tech/static/upload/elmagnifico/20260806191357008.png)

在已经做的任务中间插入一个提示或者改动，流程也很丝滑，也有对应的反馈，对比Claude，插入内容完全没反馈。



#### 缺点

CodeX是基于windows商店的，安装贼慢，然后内置的浏览器还容易崩溃、出问题以后必须重装才行，这么明显的bug竟然没修有点不可思议。

![image-20260729193543943](https://img.elmagnifico.tech/static/upload/elmagnifico/20260729193543993.png)



## Summary

Cursor和Claude基本是一起测试使用的，大概是3周左右，消耗了10亿Tokens。

CodeX是最后用的，刚好是取消了5小时限制，只有周限制了，感觉也有点不耐用，但是每周能恢复，这一点很好

CodeX交互业内领先确实没问题，其他人只够追在后面吃尘。



## Quote

> cursor、claude、CodeX
