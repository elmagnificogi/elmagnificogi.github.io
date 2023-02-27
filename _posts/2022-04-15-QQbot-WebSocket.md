---
layout:     post
title:      "QQ频道botpy框架解析"
subtitle:   "WebSocket，aiohttp"
date:       2022-04-15
update:     2022-04-20
author:     "elmagnifico"
header-img: "img/drone-head-bg.jpg"
catalog:    true
tags:
    - QQ
    - Bot
    - Python
---

## Foreword

最近想完成一点小功能，之前申请的QQ频道机器人一直没用上，正好看一下bot是怎么写的，顺便解析记录一下QQ频道botpy



## requirements

```
requests
websocket-client
pre-commit
PyYAML
aiohttp>=3.6.0,<3.8.0
```

其实从依赖就能看出来大概用了些啥

requests，http肯定要用

websocket-client，这个不用说，也要用

pre-commit，查了一下，用来规范代码格式，自动检查的

PyYAML，解析YAML的

aiohttp，异步http的框架，他同时具有服务端和客户端两边的功能，同时他也有websocket的功能。



## WebSocket

之前写后端的时候就发现了，HTTP总是单工通信，非常蛋疼，很多时候要用一些看着就很蠢的轮询式的设计，既浪费性能，又消耗流量。有没有啥，可以让服务端主动推送消息的办法的办法呢，那就是WebSocket要完成的事情了。



#### WebSocket与HTTP

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202204140001388.png)

他们俩非常像，在建立连接的时候，都需要握手，但是数据传输的时候，WebSocket就可以实现双向通信了。

HTTP本身的设计是基于无状态的，老HTTP，一般都认为是不持久的，短连接，现在基本上不这么认为了，本身握手的消耗大、延迟高，如果继续短时间就断开，下次重新建立连接就非常浪费，所以现代的HTTP基本都是支持保活、支持长连接了。

WebSocket，看名字，就能看出来，其实是基于Web的Socket，本质上就是使用Socket的接口，然后在Web上进行一次封装后的协议。可以维持长连接、支持全双工通信，本身协议内容就是加密后的，并且可以在握手阶段就能识别两者是否互相兼容。

同时WebSocket在握手的时候其实就是通过HTTP完成的，请求进行了协议升级，之后才是按照WebSocket的流程走。



#### WebSocket底层协议设计

会看底层协议，主要是发现其实他可以替代目前我工作中的一个协议，并且他是一个变最大长协议，而嵌入式底层经常设计协议的时候都是设计成固定最大长度协议，这就导致有些时候可能比较大的包，就传输不了，要单独拆分。而这个包的协议就比较有意思，他根据第二字节的值来决定是否需要扩展长度。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202204140013529.png)

这个部分也比较简单，比如当第二字节Payload长度小于126时，就认为不需要扩展包，而当Payload长度等于126的时候，就认为长度扩展字节是2字节（16bit）。如果是127，那么就是8字节（64bit），从而达成一个动态最大包长度。



## aiohttp

主要特性就是异步了，在机器人这里就是可以解决机器人并发比较多的问题，不至于卡住。



通过下面的方式，简单的实现了异步访问

```python
import aiohttp
import asyncio

async def main():

    async with aiohttp.ClientSession() as session:
        async with session.get('http://python.org') as response:

            print("Status:", response.status)
            print("Content-type:", response.headers['content-type'])

            html = await response.text()
            print("Body:", html[:15], "...")

loop = asyncio.get_event_loop()
loop.run_until_complete(main())
```



要原地起一个服务也比较简单

```python
from aiohttp import web

async def handle(request):
    name = request.match_info.get('name', "Anonymous")
    text = "Hello, " + name
    return web.Response(text=text)

app = web.Application()
app.add_routes([web.get('/', handle),
                web.get('/{name}', handle)])

if __name__ == '__main__':
    web.run_app(app)
```



## botpy框架

> https://bot.q.qq.com/wiki/develop/api/#%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B

官方文档中并没有说明，bot的框架是怎样的，由于我想接入新的内容进来，就不得不看一下他是怎么写的。

通过大致的阅读，总体流程：

```
1.通过解析YAML获取到bot和用户的输入
2.通过token，拿到各种信息，非异步的操作都是直接使用request获取，异步的则是由aiohttp完成

或者
1.通过解析YAML获取到bot和用户的输入
2.注册机器人事件
	2.1 ws建立连接，处理所有连接回流的信息
	2.2 ws定期心跳回传，timeout会自动重连
3.监听事件，处理，所有事件是由ws的信息中判断触发的
	3.1 监听中，对消息进行回复等是通过aiohttp异步完成
```

简单说，就是bot发给服务器的信息，基本上全都是通过传统的http完成的，而服务端主动推送过来的消息，则是通过ws发送的。

至于能否全都使用ws完成，官方没有任何说明，也没给接口，这里姑且认为不行吧。

整体看起来还是比较简单的一个bot，代码也比较清晰，接口添加也比较简单。



剩下的就是基于bot的接口，先把想要实现的功能对象都搞出来，然后抽象出来业务逻辑，做成一个状态机的模式，后续只需要在事件中添加对应的响应，剩下的就是业务状态机去跑，最后再返回一个结果给他去响应一下，就算ok了。



而我这里还要再复杂一点，我需要再额外跑一套ws，获取伊机控的信息，然后交给bot去回复给user，相当于是一个中转、推送类的服务。



bot本身是允许多链接接入的，也就是同时启动多个可以，不过有个上限，后面的逻辑怎么处理是使用者的问题了。如果量大，要负载均衡需要自己设计一下。



# Quote

> https://www.bilibili.com/video/BV1B4411L7PF?p=5
>
> https://blog.csdn.net/sinat_36422236/article/details/85051547
>
> https://datatracker.ietf.org/doc/html/rfc6455
>
> https://security.tencent.com/index.php/blog/msg/119
>
> https://bot.q.qq.com/wiki/develop/api/#%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B
>
> https://blog.csdn.net/qq_50216270/article/details/117875950