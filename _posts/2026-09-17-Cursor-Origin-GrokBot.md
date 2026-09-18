---
layout:     post
title:      "Origin、Grok Bot体验与Gantry（Courier）"
subtitle:   "Courier，跑腿送信工具，Cursor，PC，IDE，远程，机器人"
date:       2026-09-19
update:     2026-09-19
author:     "elmagnifico"
header-img: "img/g2.jpg"
catalog:    true
mermaid:    false
tobecontinued: true
tags:
    - Cursor
    - AI
    - QQ
    - Bot
---

## Foreword

Origin和Grok Bot体验，然后让我发现了有意思的东西，Gantry



## Origin

前段时间Cursor也开始弄自己的代码托管平台了，Origin，刚好上线那天就是Github崩溃的时候

登录

>  cursor.com/codebase

第一次同步需要新建一个用户路径，我的常用名竟然还没人用，说明没啥人哦

![image-20260917005313325](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170053414.png)

可以同步Github所有仓库，一口气64个，就是这个同步实在是有点久了，十多分钟才同步完。

![image-20260917005517382](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170055411.png)



再解释一下为什么要同步仓库，因为Cursor的云端Agent，只能用它对应的云端仓库，Cursor没有本地Agent的移动端。举个例子：PC的Cursor Agent在干活，我可能外出了，但是这个时候任务做完了，我要看一下结果或者继续下一个任务或者改进点，此时就得回PC去继续。那有没有可能我可以通过移动端直接指挥Agent干活呢？

可以，就是云端Agent的业务。只是，他不能直接操控你的电脑，不像小龙虾那种集成到你的IM里能直接指挥，对应的生产类型的Agent能被远程指挥的还是比较少的，限制颇多。

![image-20260917011001113](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170110154.png)

同步完成以后，就可以直接在Cursor的云端进行仓库的修改或者内容更新了，对应如果我在旅途中，我的见闻、照片，都可以直接通过这里的Agent让他帮我写到游记中。等我有空了，再用电脑进行仔细校对和修改即可。



Cursor的云端Agent，对于安卓不太友好，目前没有专用APP，要用浏览器的方式打开，走的是PWA应用的方式。IOS就好一些，有专门的APP，可以直接用。



## Grok Bot

![image-20260917010530957](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170105061.png)

同理，Grok Bot业务推出以后，直接送了Cursor Plan一份，而且不消耗Plan的额度。这个Bot至少目前可以认为是类似小龙虾的那种Bot，但是同时他能操作Cursor云端的Agent干活，虽然还没完全打通本地和云端，但是已经非常接近了。



Grok Bot相当于是给了你一个独立的VPS，就是让他干活得要翻墙，这个比较麻烦。但是这个Bot也可以设置为使用本机来干活。这个VPS是共用的，你建多少个Bot都是在同一个机器上的。

![image-20260917011726501](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170117541.png)

同时Bot还能在VPS和你的电脑直接建立隧道，从而转发他的流量，防止被封控，这有点东西。

对比Bot和Cursor本身，这个Bot还是比较慢的



## Gantry

> https://github.com/uhaop/Gantry

Gantry开源，MIT协议，跑在你自己的机器上。前面Origin、Grok Bot都是云端Agent那套，它直接去控家里PC上已经打开的Cursor，也支持Windsurf、VS Code。给IDE开远程调试端口，走Chrome DevTools Protocol去点聊天框、输入命令、把回复再拿回来。Cursor还有一条API后端，可以不走CDP。全程本地，不用VNC，也不用把仓库同步到云端。

官方主推Telegram，功能也最全：发文字、带图、带文件、切Ask/Code/Plan、新建会话、看上下文占用、重启服务。Discord、飞书、邮件、HTTP API也能接，但基本只是把文字转过去，按钮、附件那些都没有。HTTP API做了个OpenAI兼容的接口，给脚本调用。一个IDE对应一个实例，多开就能同时控几套，各用各的Bot。谁能发指令可以配白名单，Telegram ID对不上就进不去。

IDE改版以后，页面选择器可能对不上。它启动时会扫一遍DOM，试着找替代，再从Telegram把诊断发回来。官方自己标的是v0.x预览，匹配是best-effort，提问弹窗、Plan不一定总能抓到。

但是Gantry本身不支持QQ、微信、企业微信等国内的IM软件，我这里二次开发了一下，把体验弄到了和他原本的telegram一个级别，甚至更符合国人体质。

> https://github.com/elmagnificogi/Courier

我把项目名字改成Courier，意为Agent的跑腿送信工具




#### 注册QQ机器人

以前有弄过伊机控的注册，没想到之前做的都还有效，直接就能用，太好了

![image-20260919010145044](https://img.elmagnifico.tech/static/upload/elmagnifico/202609190101124.png)

QQ机器人创建简直太简单了，创建以后，立马机器人就从QQ上私聊过来了，体验非常丝滑，当年机器人团队跟开发者走那么近，天天被提意见，看来真的是有效，流程非常简单。

- 机器人直接就支持webhook和websocket接口，前者需要公网比较麻烦，但是后者作为私人助理不需要，弄起来也简单。

拿到机器人的ID和Secret，回填到Courier的env中



#### 创建Cursor的调试启动

这个最简单，创建一个Cursor的快捷方式，然后指定好端口即可

![image-20260919010536203](https://img.elmagnifico.tech/static/upload/elmagnifico/202609190105239.png)

```
D:\cursor\Cursor.exe --remote-debugging-port=9222
```

其他基本默认就行了



#### 部署

Courier 部署很简单

```
npm install
npm run dev
```

没问题，就直接启动了



#### 测试

![image-20260919011624736](https://img.elmagnifico.tech/static/upload/elmagnifico/202609190116801.png)

可以看到，你输入什么，就直接转发到了Cursor，那就可以远程用手机直接操作家里的PC了，体验真的不比小龙虾差。

如果开了多个IDE，也可以用命令先列出有哪些，再选一个操作

![image-20260919012146556](https://img.elmagnifico.tech/static/upload/elmagnifico/202609190121587.png)

#### 指令

| 命令 | 说明 | 示例 |
|---|---|---|
| `/newchat` | 开一个新的 IDE 对话 | `/newchat` |
| `/mode <mode>` | 切换模式：`ask`、`code`、`plan`、`debug` | `/mode code` |
| `/model [name]` | 探测当前模型，或按模糊匹配切换（不带参数则读当前标签） | `/model claude sonnet` |
| `/last` | 取最新一条助手回复 | `/last` |
| `/resume [text]` | 继续上一件事 | `/resume fix the tests` |
| `/choose <option>` | 回答助手提问 | `/choose A` |
| `/diag` | 完整 CDP + 选择器诊断 | `/diag` |
| `/restart` | 重启桥接（走对应平台启动脚本） | `/restart` |

**状态与会话**

| 命令 | 说明 |
|---|---|
| `/context` | Context 窗口用量 |
| `/usage` | 用量/账单状态 |
| `/progress` | 当前请求状态 + 已用时间 |
| `/targets` 或 `/chats` | 列出可用 IDE 目标 |
| `/target <n>` 或 `/target auto` | 选指定目标，或自动选择 |
| `/history [n\|clear]` | 最近回复，或清空历史 |
| `/cancel [all]` | 停止后续轮询 |

**附件**

| 命令 | 说明 |
|---|---|
| 发送图片 | 附加到 IDE 输入框（先发图，再发提示词） |
| 发送文件 | 附加到 IDE 输入框（先发文件，再发提示词） |
| `/attach <path>` | 按绝对路径注入本机文件 |
| `/attach <path> \| prompt` | 附加并自动提交提示词 |
| `/photomode auto\|manual` | 切换附件是否自动提交 |
| `/queue` | 查看待处理附件队列 |
| `/clearqueue` | 清空附件队列 |



#### OpenID

QQ 后台不会显示这个值，也不是 QQ 号。用你的 QQ 私聊机器人，发送 /whoami（/id、/openid 也可以）。机器人会把 user_openid 回给你

![image-20260919013121456](https://img.elmagnifico.tech/static/upload/elmagnifico/202609190131100.png)

群里发 /whoami 得到的是 group_openid



## Summary

爽到了，后面拉萨游记中途遇到的内容、图片、文字感想我就直接发给Courier，让他帮我记录，后续我再去审阅重排文章。



## Quote

> https://github.com/uhaop/Gantry
