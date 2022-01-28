---
layout:     post
title:      "暗黑2重置版地图显示插件"
subtitle:   "maphack,hackmap,D2RAssist"
date:       2021-10-18
update:     2021-10-19
author:     "elmagnifico"
header-img: "img/2020.jpg"
catalog:    true
tags:
    - Game
---

## Forward

没想到短短几天，就有人弄出来了重制版地图显示，不得不说牛皮啊。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/2Un4NxlSDjTABsz.png)



## D2RAssist

简单说项目这个D2RAssist，这个项目完成了地图的整体显示。大致原理是首先你得有老版暗黑的客户端，然后运行以前的老版地图解析的一个程序，也就是d2mapapi.exe，它主要用来解析地图，返回数据给显示这边。显示这边具体通过啥手段拿到了当前客户端所在地图和seed，我还没看代码，具体还不知道。

> https://github.com/misterokaygo/D2RAssist

 原作者好像不维护了，所以项目换人了

> https://github.com/OneXDeveloper/MapAssist



## 安装

- **风险自负，具体如何实现的肯定有违规的地方，被ban或者怎样都别找我**

```
Q. Will I get banned? 
A. No guarantees to anything in life. Especially with stuff like this. Use it at your own discretion 
Q. Is it safe? 
A. How this thing works in layman terms, is that it is giving you an overlay map(imagine the program sticking a live hand drawn transparency on your monitor right corner every 50ms) by reading your CLASSIC D2/LOD game file and matching it with your D2R game file. Nothing is written or injected to your actual D2R game.
```

上面是作者原话，**无论作者怎么说，源代码我看过了，他读内存了，仅靠读文件是不可能实现的**

之前已经解释了需要什么，所以安装必须要按照这个流程来，否则可能出的问题，我也解决不了。



### 安装老版暗黑3件套

推荐从这里下载，一定是可以用的，他里面缺少cd-keys

> https://drive.google.com/u/0/uc?id=1r63wchtnWmuRbRBBIdeDvW5NMoa-lxle&export=download

- 下不了的去群里下，我加上了key

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/i6F1t7uXVgQ34oJ.png)

解压以后可以看到如图所示内容。

首先打开Original，安装原版暗黑2

然后，打开Expansion，安装DLC

最后使用LODPatch_113c.exe，打补丁

这个是正版安装，所以会需要key，在cd-keys.txt中

```
原版的KEY：
79N6REJKVKK69B49X8J88EWER4

DLC的KEY：
XM98CC7FTFD6PPB62RHNM726KD
```



### 第二步启动d2mapapi

> https://github.com/OneXDeveloper/D2RAssist/releases/download/release%2F1.0.2/D2RAssist.1.0.2.zip

- 下不了的去群里下，我编译的版本

下载然后解压，看到下面的文件夹

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/YaKR24mBJTcxuew.png)

这里需要先修改一下mapapi启动的暗黑位置，这里编译bat，将其中的暗黑路径修改为刚才安装的位置

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/j97uWeaPNlSFqcr.png)

修改完了以后，通过Run.bat 启动，如果正常启动，就会像下图一样

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/zvQt1TgsfpCiZMc.png)

- **这个命令行不能关闭**



### 第三步启动D2RAssist

D2RAssist.exe打开以后没有任何显示的，进游戏，然后切换地图 ，就能看到对应的提示了

- **在安全区不会显示地图**

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/BFNJTv7jIgXwDcf.png)

比如我这里是乱石旷野，红圈处的牛腿位置，一模一样



### 使用

以后使用只需要重复第二步和第三步，就能正常使用了。



D2RAssist的作者有数字货币收款，对于赞助者有特殊服务，目前他自己的说法是大箱子、掉落等等类似以前的maphack的功能会有，赞助者有安装使用客服、版本也会新一点吧。不过我既然看到了，那估计赚钱的路子就要没了。



## 我的地图显示

先上我的仓库，是基于他的这个版本，不过优化了一部分内容，后续还会调整

> https://github.com/elmagnificogi/D2RAssist

上面失效了，下面才是新的

> https://github.com/elmagnificogi/MapAssist



首先需要群内下载免安装的打包

### 免安装版使用说明

- **风险自负，慎用，代码我看过了，读内存的，存在风险**



![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/yQcYJgfIt7POZCq.png)

直接运行，已经打包了需要的暗黑文件，打开以后保持不要关闭命令行就行了

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/O4frTuRZg5xlcGp.png)



然后打开 D2RAssist.exe，再打开游戏即可。

### log

2021.10.19.01.16

- 地图居中显示
- 地图放大
- 地图角度修改
- 地图颜色调整
- 地图文字全部繁体显示，可能有部分内部英文没找到，没翻译，等下次更新

2021.10.20.11.00

- 随游戏更新而更新

2021.10.20.23.19

- 新增自动内存偏移扫描（理论上不会因为游戏更新而失效了）
- 增加自定义地图位置的配置
- 增加地图配置说明



### 已知问题

- 部分洞穴类入口处存在地图地块可能没显示的问题，下次修复
- 地图显示位置是和桌面大小相关的，而不是和游戏当前分辨率相关的，导致窗口化的时候地图显示位置不对



### 未来更新

- 分离与游戏内地图显示绑定的问题（暂时，长期可能融合到游戏本身地图？）
- 地图默认位置调整，获取游戏宽高
- 地图重绘，提高锐利程度
- 地图可以放大缩小、移动等
- 增加怪物显示
- 掉落显示



## 其他相关地图显示插件的信息

### diablo2

这个仓库有实现linux下地图显示的接口，但是windows这边不太行，还需要等人开发

> https://github.com/blacha/diablo2

下图是别人放出来的，具体哪来的不知道

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/bcXS1yPsMBWqpak.gif)

### ReaperMH

> https://www.youtube.com/watch?v=72lKLPs0PR4&ab_channel=ReaperMH

这个视频下的程序叫ReaperMH，但是目前看没人可以正常运行，没有源码，基本算三无产品，还要你关闭杀毒等等操作，建议不要做。



## Summary

暂时只有这么多信息，剩下的自行挖掘吧

后续我可能会沿着他的这个底子改一下，到时候再分享我的吧



我的暗黑交流群941746977

## Quote

>https://github.com/OneXDeveloper/D2RAssist/wiki/Installation
>
>https://discord.com/invite/5b2B7QrVqa
>
>https://github.com/blacha/diablo2/issues/178

