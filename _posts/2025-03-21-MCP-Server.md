---
layout:     post
title:      "MCP下一代软件接口"
subtitle:   "VSCode,Cursor,Manus"
date:       2025-03-24
update:     2025-03-24
author:     "elmagnifico"
header-img: "img/line-head-bg.jpg"
catalog:    true
tobecontinued: false
tags:
    - Cursor
    - AI
    - MCP
---

## Foreword

MCP下一代软件接口，他可能是未来AI或者大模型发展所必须的一个中间件了



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

![image-20250325191432237](https://img.elmagnifico.tech/static/upload/elmagnifico/20250325191432327.png)

> https://www.pulsemcp.com/
>
> https://mcp.so/

这个网站上有别人写好的MCP Server，你只需要调用他们，即可让AI具备对应的功能

![image-20250321183050357](https://img.elmagnifico.tech/static/upload/elmagnifico/20250321183050440.png)

比如这里的Filesystem，就是让AI具备操作文件的能力



### Cursor

![image-20250321184548098](https://img.elmagnifico.tech/static/upload/elmagnifico/20250321184548135.png)

在Cursor的设置中，就可以直接看到MCP的设置，这里可以通过修改`mcp.json`，添加各种服务上去



### Filesystem

这里以Filesystem为例，说明如何安装使用，不同的工具可能实现的方式不一样，所需要的基础环境可能不同，这个具体去看各个的readme就行了

> https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem

可以看到Filesystem MCP Server是建立在node.js基础上的，所以必须要系统里先安装好了node.js

> https://nodejs.org/en/download



#### 安装

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Desktop",
        "/path/to/other/allowed/dir"
      ]
    }
  }
}
```

将这个部分复制到`mcp.json`，然后就能看到设置里的UI已经显示了

![image-20250324143651575](https://img.elmagnifico.tech/static/upload/elmagnifico/20250324143651635.png)

但是这里还是不太正确，服务没正常起来，需要理解这些参数是什么意思

```json
{
    "mcpServers": {
      "filesystem": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-filesystem",
          "C:/Users/elmag/Desktop"
        ]
      }
    }
  }
```

主要是启动npx，然后调用对应的服务，后面是授权路径，比如这里是允许对桌面路径进行读写操作，如果是linux系统可能没啥问题

如果是在windows里使用，可能需要使用cmd的方式，否则npx可能无法直接启动（虽然命令行可以执行成功）

```json
{
    "mcpServers": {
      "filesystem": {
        "command": "cmd",
        "args": [
          "/c",
          "npx",
          "@modelcontextprotocol/server-filesystem",
          "C:/Users/elmag/Desktop"
        ]
      }
    }
  }
```

如果是绿色说明正常启动了，就会显示他对应的接口有什么

![image-20250324144622476](https://img.elmagnifico.tech/static/upload/elmagnifico/20250324144622516.png)



#### 测试

测试需要cursor切换到agent模式，不能使用ask模式，他执行的mcp操作每一次都会要求确认

![image-20250324145106748](https://img.elmagnifico.tech/static/upload/elmagnifico/20250324145106784.png)

可以看到文件已经创建了，并且内容是我们要的

![image-20250324145051386](https://img.elmagnifico.tech/static/upload/elmagnifico/20250324145051424.png)



### Sequential thinking

连续思考，这个挺好的用的

```
cmd /c npx -y @modelcontextprotocol/server-sequential-thinking
```

安装起来也简单，主要是使用外部服务，相当于是一个套在LLM之外的一个prompt，可以让agent多思考几次，思考得更周全



### 问题

当前MCP Server在Windows下比较特殊，必须用cmd启动，其他方式启动的检测不到，这个后续可能会改

windows的cmd命令窗口还是不能关闭的状态，否则就会认为服务断开了



**改进：**使用powershell的方式，加上hidden指令，从而隐藏弹出的面板，就可以不用管命令行了

```json
{
    "mcpServers": {
      "filesystem": {
        "command": "powershell",
        "args": [
          "-WindowStyle", 
          "Hidden", 
          "-Command", 
          "npx -y @modelcontextprotocol/server-filesystem C:/Users/elmag/Desktop"
        ]
      }
    }
}
```



## Summary

MCP的服务各种各样，目前还不是很统一，有python、nodejs的，也有docker、c#，还有一些需要先编译再运行的服务端级别的，这些就很复杂了。



MCP下一步再发展，我估计会把各种服务做的更像现在的软件一些，MCP直接安装对应的应用即可，每个应用里有自己的requirements，自动安装即可。安装docker可能性不大，docker过于浪费性能和空间了，很多封装的服务也比较简单。



再进一步各个大模型可能会直接自己做整合，把MCP嵌入到自己的内部去，从而只对外提供一个统一的对话接口即可。

当然也有可能是以后是类似Cursor这样入口是可以切换各种LLM，然后整合MCP的服务，类似插件直接安装上，后续给人使用即可，这里也有可能出现类似应用商店的东西。



MCP可能是未来软件的第二春，这个入口整合如果做的好的话，可能成为一个独立赛道，类似最初的首页网址

目前看起来这个入口都是专业向的，VSCode、Cursor、Cline等，对于普通人来说配置要求还是太高了，如果有一天这个东西非常简单好用了，那么足以干掉很多乱七八糟的软件，普通人pdf转word不用什么专业工具了，普通人剪辑某一段视频也不用下专业软件了，未来操作电脑可能就不是鼠标、键盘了，而是语音或者文字之类的。

很多专业软件藏得很深的功能，都可以被轻易的调用了，只要你想得到就能被调用，而不再是之前你想到了，但是不知道怎么办，怎么做了。

对于软件的使用，人从使用者转变成为了结果的审核者或者说想法的提出人，这种身份转换可以让人更多的去思考有价值、有创意的内容，而不用在意通过什么样的过程实现这样的效果。

## Quote

> https://www.bilibili.com/opus/1039645916895641607
>
> https://cloud.tencent.com/developer/article/2506223
