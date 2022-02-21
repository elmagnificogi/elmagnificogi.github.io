---
layout:     post
title:      "常见寻路算法介绍"
subtitle:   "pathfinding"
date:       2021-01-21
author:     "elmagnifico"
header-img: "img/maze.jpg"
catalog:    true
tags:
    - PathFind

---

## Foreword

最近打算做寻路方面的一些工作，这里介绍一些常用寻路算法，后面可能会给出一个我的解答



## 寻路与轨迹规划

一般说寻路的时候可能包含了2个概念，一个是寻路，一个是轨迹规划，这里我们区分开二者：

- 寻路单指 path planning，主要是找到一条可行路径，不考虑具体对象是以何种速度或者状态通过的，多数时候都是有路径就可以了，轨迹一般使用的都比较简单。
- 轨迹规划指 trajectory planning，主要描述的是如何通过一条路径，其输出的是每个时刻该对象的各种状态，对于2维小车寻路来说那就只有他的水平xy的速度，加速度，方向而已，对于3维无人机，那输出的除了方向速度以外可能还有无人机本身的姿态要求。

当前的火热的无人车，自动驾驶都需要上面二者的相关技术，只是他们考虑的更多，更复杂了。

而这里主要是介绍 path planning相关的内容，可能会提到一点点轨迹规划。



## 基础算法

目前常用的规划算法，大概只有几类，这里一一介绍



### Dijkstra

Dijkstra算法基本高中的数学课本就有了，算是最基础的算法之一了。

> https://www.cnblogs.com/gaochundong/p/dijkstra_algorithm.html

它本质上是一种 Greedy Algorithm，他的基础框架是这样的，剩下基于这个算法做出的改进或者演变什么的就不提了，总的来说Dijkstra比较慢，适合静态地图，适用范围广，但是实用性比较低。



### Astar

一般来说Dijkstra可以理解为广度优先搜索，而Astar就是深度优先搜索，Dijkstra一般搜索一点到所有点的最短，而Astar比较专注于目标点相关的路径，所以Astart用的比较多。Astar也是Greedy Algorithm，所以在某些情况下可能会找不到目标，从而变成一个不完备的算法。

> https://www.gamedev.net/reference/articles/article2003.asp
>
> https://www.cnblogs.com/iwiniwin/p/10793654.html

这里面Astar经常搭配一个启发函数，然后变成启发式搜索，相当于是给了一个粗略的可以估计目标所在方向的函数，让Astar朝着这个大致方向进行搜索，从而提高了搜索效率，启发式Astar被广泛的使用在游戏行业中。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/U1m3seWGtH82VB4.gif)



### 蚁群算法

某种程度上说蚁群算法都不能叫寻路算法，因为本质上他是一种带正反馈的穷举，不断遍历，然后得到一个最优解，需要大量的算力和时间，某种程度上说可用范围很小。

> https://blog.csdn.net/xyisv/article/details/79184815

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/EGFBR4gno1XfWkO.png)



### 人工势场法

简单说就是人往高处走，水往低处流，通过构造一个势场函数，让地图成为一个有高低落差的图，然后起点成为高势点，目标作为低势点，从而模拟物理中的流动。

> https://zhuanlan.zhihu.com/p/66265861

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/wn1rAlRv2cQhbV8.gif)

但是这种方法往往也有一些问题，环境可能非常复杂，导致构建出来的场景中存在局部最小值，导致没到达目标点就停止移动了。



以上算是基础的寻路算法，当然也能叫他们搜索算法，本质上是找到一种数据集合中最合适的一个或者一串点。



## 在线Pathfinding

> http://qiao.github.io/PathFinding.js/visual/

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/P3lgJmceO5zDdwI.png)



可以通过这里尝试在线寻路，了解一下不同算法的异同。

- A*，正常的Astar

- IDA*，迭代加深的Astar，为了克服Astart在某些情况下不够完备，说白了就是给代价函数给定了上下界，让他有界了
- Breadth-First-Search，广度优先搜索
- Best-First-Search，最佳优先搜索，可以认为是广度优先搜索+启发式
- Dijkstra
- jump point search，简称JPS，经常被做最快的搜索算法，但是他有很多限制，比如他没有权重，也就是认为路径要么是能走，要么是不能走，就2种状态，就让他的适用范围变得比较小了。
- orthogonal jump point search，正交JPS，可以看到和jps的扩展方式不同



## Summary

上面只是最基础的寻路算法，有了寻路算法还需要构建地图，还需要规划运动轨迹，最后将三者结合起来形成一个寻路的解决方案。

寻路算法在这里看起来更像是一个搜索问题，下一篇介绍如何离散化地图，然后应用上面的搜索算法，得到我们要的路径。



## Quote

> https://mp.weixin.qq.com/s?__biz=MzA5MDE2MjQ0OQ==&mid=2652786406&idx=1&sn=f937dd6aa91344fed689baf51dc821ab&scene=21#wechat_redirect
>
> https://zhuanlan.zhihu.com/p/104056027?utm_source=qq

