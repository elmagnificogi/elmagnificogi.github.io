---
layout:     post
title:      "MCP Server"
subtitle:   "VSCode,Manus"
date:       2025-04-21
update:     2025-04-21
author:     "elmagnifico"
header-img: "img/line-head-bg.jpg"
catalog:    true
tobecontinued: true
tags:
    - VSCode
    - AI
---

## Foreword



## MCP

> https://github.com/modelcontextprotocol
>
> https://modelcontextprotocol.io/introduction

MCP简单说就是一个开发的标准协议，他主要是约定了如何让普通程序把自己的内容或者接口暴露给LLM，从而可以让AI使用这个程序。

简单说之前遇到的Cursor读不了PDF，其实如果他会用转换工具，把PDF转换成网页或者txt之类的内容，他就又能重新读懂了，而MCP干的就是这个标准接口，告诉LLM通过什么方式可以达成什么结果。

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/20250321183030322.png)

有了MCP就可以做什么呢？

- 让AI去数据库帮我修改某个字段的信息，而不是让他给我写这个SQL
- 让AI触发代码编译，部署
- 让AI帮我订餐、预定会议、提前打车、安排行程

只要有了这个部分的MCP接口，那么AI就真的变身成为你的小助理、小管家了，而不是只会输出文本或者图像的工具。



而之前特别火爆的Manus，对应的就是一个高度集成的MCP，实现了各种各样的工具操作接口，对应到AI这边看起来就十分全面

其实就是看你的集成度，集成度越高，就显得这个AI越智能，可能日后每个软件都会有一个MCP，这样通用的接口



## MCP Server

> https://www.pulsemcp.com/
>
> https://mcp.so/

这个网站上有别人写好的MCP Server，你只需要调用他们，即可让AI具备对应的功能

![image-20250321183050357](https://img.elmagnifico.tech/static/upload/elmagnifico/20250321183050440.png)

比如这里的Filesystem，就是让AI具备操作文件的能力



### Cursor

![image-20250321184548098](https://img.elmagnifico.tech/static/upload/elmagnifico/20250321184548135.png)

在Cursor的设置中，就可以直接看到MCP的设置，这里可以通过修改mcp.json，添加各种服务上去





## Summary



## Quote

> https://www.bilibili.com/opus/1039645916895641607
>
> https://cloud.tencent.com/developer/article/2506223
