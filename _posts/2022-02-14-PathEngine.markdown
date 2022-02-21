---
layout:     post
title:      "路径规划中间件 PathEngine"
subtitle:   "pathfind，game"
date:       2022-02-14
update:     2022-02-14
author:     "elmagnifico"
header-img: "img/bg8.jpg"
catalog:    true
tags:
    - PathFind
    - Game
---

## Foreword

今天搜索物理引擎相关信息的时候突然发现了一个pathfind的库，一般是作为游戏的中间件，我之前竟然没发现，提供的demo也非常丰富。平常能搜到的相关信息却特别少，感觉错过了一个亿。

看了一下这个库的历史，大概20年前就有这个库了，我竟然一直没搜到，仅仅拿来给2d游戏做寻路方面的功能完全够用了。



## PathEngine

> https://www.pathengine.com/

官方非常不起眼，但是功能确实不错，价格不是特别贵，基础的二进制版本大概需要3w多，源码版本要12w，提供6个月的售后支持。

![image-20220214113325888](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220214113325888.png)

免费版本可以实现部分功能，不能独立运行，具体是咋限制的，没有说明。

> https://www.pathengine.com/downloads

可以直接通过官网下载到，付费版本甚至有对maya、max的支持，只是版本已经非常老了

下载完以后，可以得到这样一个目录：

![image-20220214110617926](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220214110617926.png)

VS下面的都是对应的源码，而可运行的demo都在launchers开头的文件夹中



#### 测试

大部分场景本身都是3d的，可以通过选旋转视角看到立体的效果，不过这种场景理论上都可以视为一个二位平面。

操作说明：

1是视角旋转，配合鼠标移动

2是视角移动，配合鼠标移动

3是视角缩放，配合鼠标移动

4可能是功能按键，类似于放置障碍物，设置目标点，设置起始位置

5可能是功能按键，类似于放置障碍物，设置目标点，设置起始位置

e可能是功能按键，类似于放置障碍物，设置目标点，设置起始位置

s可能是功能按键，类似于放置障碍物，设置目标点，设置起始位置

具体在不同demo里有不同作用。



TestApplication (testbed application)，这是个简单的设置寻路起点和终点，等待结果就ok的场景

![image-20220214152046173](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220214152046173.png)



Swarm (testbed application)，这个类似于红警、星际一类的游戏，群体寻路，但是碰撞稍微有点问题，会出现对象重合后再散开的情况

![image-20220214111600922](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220214111600922.png)



SemiDynamicObstacles (testbed application)，这个可以算是一个多对象寻路或者游荡的例子

![image-20220214111645218](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220214111645218.png)



Benchmark (testbed application)，这个是个寻路基础测试

![image-20220214111657147](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220214111657147.png)



CollapsibleGroup (testbed application)，这个是群体无碰撞路径规划，在路基上布满无碰撞的群体

![image-20220214111456772](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220214111456772.png)



#### 问题

> https://www.pathengine.com/Contents/Overview/FundamentalConcepts/GroundMeshes/page.php

根据说明，可以知道他本质上就是2d的网格寻路，但是由于他是使用投影来计算可用面，所以导致实际这里不可以有面出现翻转朝向

> A mesh may include arbitrary variations in height but PathEngine essentially deals with a 2d projection of that geometry onto the horizontal plane. Overlapping layers are disambiguated by the connectivity of the mesh. But this means that a mesh may not contain faces that are vertical or face downwards.

![a mesh with overhanging geometry](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/avp.gif)

同时通过我代码查看，他的坐标系是`x,y,cell`其中cell则是面的含义，指定了具体坐标是在哪一个面上，所以使用这个就不可避免的需要规定哪些面是可以移动的，哪些面是不行的。



demo里有一个3d的说明，仔细看了一下，他的3d其实就是考虑了对象的高度以及斜坡楼梯之类的参数，某些会产生碰撞的路径会过不去，而实际上应该还是2d的网格寻路。这个3d demo本身没有源码，只有编译好的现成文件，所以看不到细节具体是什么了。和我想要的3d空间路径规划还是有区别的。



## Summary

讲道理有这么好用的寻路引擎，为啥当年好多游戏还自己重开发一个寻路？有点没看懂



## Quote

> https://www.pathengine.com/



