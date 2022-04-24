---
layout:     post
title:      "QQ机器人Mirai及其相关框架"
subtitle:   "nonebot2，YiriMirai"
date:       2022-04-24
update:     2022-04-24
author:     "elmagnifico"
header-img: "img/led.jpg"
catalog:    true
tags:
    - QQ
    - bot
    - Python
---

## Foreword

一开始没搞清楚现在的qqbot mirai相关的是怎么玩的，先说一下大概的。

mirai-core 提供的是一个qq相关的所有功能的一个核心，但是他只是个类命令行的操作端口，如果直接操作比较麻烦，所以一般会适配各种各样的接口，然后再是其他程序调用这个接口去完成bot功能。

mirai环境可能是多种多样，所以他们出了一个安装程序，用来专门安装mirai的基础环境，这个就是`iTXTech MCL Installer`，安装完成以后就获得了`Mirai Console Loader` 

mirai暴露的接口，则是通过插件来实现的，插件则是可以通过`Mirai Console Loader`来安装，比如`mirai-api-http`，就可以通过建立一个本地http或者ws服务端，来暴露对应的接口。

除了要暴露接口，还需要登陆QQ，由于是模拟移动端QQ登陆，所以就需要处理验证码，于是乎就有了`TxCaptchaHelper`来处理命令行下的滑动验证码

当对应接口服务启动以后、QQ也登陆完成，就可以通过python或者java之类的框架访问，然后来完成各种bot功能了。



## mirai

一般都是通过iTXTech MCL Installer 来安装mirai的

> https://github.com/iTXTech/mcl-installer/releases

下载对应系统的版本，他这个安装包逻辑比较奇怪，安装包在哪里，就安装在哪个文件夹了，所以先把安装包放到你想要安装的目录中，然后再运行

```
./mcl-installer-1.0.4-linux-amd64
```

默认安装即可，如果是windows版本可能需要注意一下，默认安装的java可能不能用，缺少环境变量，需要手动配置一下。已经安装了java的不要重复安装，也会出现java和javac版本不一致报错。



### 启动

安装好以后就可以启动Mirai Console Loader，首次启动会安装一堆

```
./mcl
```



## mirai-api-http

有了mirai core 还不够，还需要他能提供对应的接口

> https://github.com/project-mirai/mirai-api-http



退出前面安装的Mirai Console Loader，再运行

```
./mcl --update-package net.mamoe:mirai-api-http --channel stable-v2 --type plugin
```

安装完成以后再启动

```
./mcl
```



##### 安装失败

有可能会安装失败，比如连不到Github，安装包根本下不下来，这个时候可以手动安装

> https://github.com/project-mirai/mirai-api-http/releases

手动下载`mirai-api-http-v2.5.0.mirai.jar` 然后将jar包放到 Mirai Console Loader 目录下的 `plugins` 文件夹中，然后重启 Mirai Console Loader



再次重新启动`mcl`，就能看到类似下面的内容，说明安装成功

```
2021-08-03 22:02:08 W/net.mamoe.mirai-api-http: USING INITIAL KEY, please edit the key
2021-08-03 22:02:08 I/Mirai HTTP API: ********************************************************
2021-08-03 22:02:08 I/http adapter: >>> [http adapter] is listening at http://localhost:8080
2021-08-03 22:02:08 I/Mirai HTTP API: Http api server is running with verifyKey: INITKEYn7ussdck
2021-08-03 22:02:08 I/Mirai HTTP API: adaptors: [http]
2021-08-03 22:02:08 I/Mirai HTTP API: ********************************************************
```



退出mcl，修改配置文件`config/net.mamoe.mirai-api-http/setting.yml`，修改成如下内容，使用`websocket`，verifykey也换成`yirimirai`，这个可以自定义，然后端口使用`8080`

```
adapters:
  - ws
debug: true
enableVerify: true
verifyKey: yirimirai
singleMode: false
cacheSize: 4096
adapterSettings:
  ws:
    host: localhost
    port: 8080
    reservedSyncId: -1
```

重启`mcl`，就能看到类似下面的内容，这个时候`Mirai HTTP API`接口就正常工作了

```
2021-08-03 22:46:18 I/Mirai HTTP API: ********************************************************
2021-08-03 22:46:18 I/ws adapter: >>> [ws adapter] is listening at ws://localhost:8000
2021-08-03 22:46:18 I/Mirai HTTP API: Http api server is running with verifyKey: yirimirai
2021-08-03 22:46:18 I/Mirai HTTP API: adaptors: [ws]
2021-08-03 22:46:18 I/Mirai HTTP API: ********************************************************
```



## 登陆QQ

继续接着上面的`mcl`，在控制台输入

```
login 你的qq qq密码
```

登陆本质上是模拟安卓端的登陆，所以很多操作可能需要这个qq已经登陆的移动端来处理。

登陆可能会有2个问题要处理，一个是异地登陆或者说异设备登陆造成的，需要手动解锁，一个是登陆时弹出的验证码需要解决



### 设备锁

![device-verify](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/device-verify-51685adea6b4490bb6bdcb91f338b849.png)

这种情况下，把对应的url发给手机端去打开，然后在页面中选择登陆即可



### 滑动验证

首先需要下载一个app，TxCaptchaHelper，主要就是显示手机登陆的时候弹出的滑动验证。

> https://github.com/mzdluo123/TxCaptchaHelper/releases

然后Mirai中会提示你对应的请求码，输入之后会弹出滑动验证，验证ok即可。



完成以上2项，一般来说就可以看到`mcl`提示登陆成功了

`bot/qq号/device.json`就是刚才登陆的设备锁的信息，以后只要使用相同文件，就不需要每次都处理设备锁的问题了。滑动验证的问题是无法避免的。

到这里，算是mirai相关需要做的事情就都搞定了，剩下就是怎么使用他暴露出来的接口了。



## 框架选择

基于mirai的各种语言bot开发项目，看下面

> https://github.com/project-mirai/awesome-mirai/blob/master/README.md

有的项目比较老了，可能也不怎么维护了，最好看看更新时间和对应的文档是否齐全。



### nonebot2

> https://github.com/nonebot/nonebot2

nonebot2，这个其实算是个大框架了，本质上他是个机器人框架，可以支持QQ、QQ频道、Telegram、钉钉、飞书、开黑啦，不知道为啥竟然没有Discord，很奇怪。

他也是类似mirai的玩法，接口各种各样，然后可以适配各种协议，也有插件，也有一个console loader用来安装插件，启动等等。

一般来说用来做qq机器人的都是使用onebot协议的，不过他也只是个民间协议标准而已

> https://onebot.dev/

nonebot2相关主要是文档里对于mirai的相关内容提及的太少了，等你弄好了nonebot和其适配器等内容以后，发现这只是个后端处理，实际上前一级的东西，一点都没提，也没说明白，看得新手稀里糊涂得。

nonebot2的好处是他的qq群异常活跃，而且有问题必答，不得不说相当不错。



### YiriMirai

> https://github.com/YiriMiraiProject/YiriMirai

YiriMirai 的人气不高，但是好在文档全，虽然稍微隐蔽了一点，但总还是有的，搞定了mirai的基础环境，后续适配就简单了

> https://yiri-mirai.wybxc.cc/

安装

```
pip install yiri-mirai
```

在前面QQ登陆以后，可以尝试Demo，私聊机器人时发送你好，会得到对应的回复。

```
from mirai import Mirai, WebSocketAdapter, FriendMessage, Plain

if __name__ == '__main__':
    bot = Mirai(
        qq=12345678, # 改成你的机器人的 QQ 号
        adapter=WebSocketAdapter(
            verify_key='your_verify_key', host='localhost', port=8080
        )
    )

    @bot.on(FriendMessage)
    async def on_friend_message(event: FriendMessage):
        if str(event.message_chain) == '你好':
            await bot.send_friend_message(event.sender.id, [Plain('欢迎使用 YiriMirai。')])
            return bot.send(event, 'Hello, World!')

    bot.run()
```

我要求不高，能用就行了，YiriMirai就能够完成需求了



## Summary

Mirai这种类型机器人比QQ频道机器人还是要好一些，他基本相当于是真人操作，而不是官方机器人。少了很多限制，虽然可能会遇到登陆、异常等情况，但是总体上自由度还是比较高的，只要不是灰产，正常使用是不错的。



QQbot的二次元浓度实在是太高了，相关项目也是，起名字都是各种二次元名字，看得我实在是难受。nonebot2的q群里二次元浓度更是爆炸，基本人均二次元，年纪都偏小。与之相对比的其他社区的就更严肃一些，也更冷清一些，算是挺不一样的体验吧。

nonebot群中讨论的内容也不限于nonebot，很多语言基础问题也有人问，也有人仔细查了以后回答，虽然不能直指问题的核心，但是总体上还是不错的。这种异常活跃，大家年纪都偏小，不重利益，这样的社区朝气蓬勃，这几个项目日后也会越走越好吧。



# Quote

> https://yiri-mirai.wybxc.cc/docs/quickstart
>
> https://v2.nonebot.dev/docs/#