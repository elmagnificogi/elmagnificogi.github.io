---
layout:     post
title:      "地图离散化"
subtitle:   "navmesh，navgrid"
date:       2021-01-22
author:     "elmagnifico"
header-img: "img/mqtt.jpg"
catalog:    true
tags:
    - PathFind

---

## Foreword

要实现一个寻路，地图要如何描述或者结构化，这个非常重要，当然也和我们选择的寻路算法有关系，主要是为了寻路算法服务的。



## 地图离散化

寻路算法是基于地图进行搜索的，而往往地图的信息过于复杂的时候，之前说过的算法实际应用非常慢，而基于这样的情况，自然就可以用我们的离散数学了。

首先就要考虑如何降低地图中的信息量，比如我地图是10000*10000的二维，而要基于这个进行搜索就要非常久了，消耗的内存也不少，如果维度变高，就是指数级增长了，要解决这个问题，就要先把地图离散化，然后想办法排除掉无用信息，尽可能的少而快。



### Grid

简单说就是将地图栅格化，有些栅格是有障碍的，有的是没有的，从而让地图包含他们，将原本连续的地图变成离散的模式，一个二维数组就能装得下这个地图的数据，然后再用寻路算法根据这个来搜索。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/Qu4zwPvBlNGirey.png)

但是对于游戏或者某些实际应用场景来说这样的栅格化还是不够，一方面是精度不够用，一方面是栅格后可能依然搜索范围太大了，导致实际无法完成。



### Chunk

如果地图非常大，并且无缝连接，要怎么办，可以通过分片来完成，简单说就是分治思想，地图分片处理，然后将分片后的结果再进行一下寻路，这样通过提高维度下降了寻路的范围，缩短了寻路时间



### Road Maps

路图法，是基于Grid的，本身是在Grid后的地图上选择一些点，作为路径的途径点，然后再通过算法将途径点连接起来，从而形成寻路的。以前的老游戏甚至需要人工标注地图中的途径点，然后才能被配置到寻路中。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/8gv6F5spY91XxaU.gif)



这其中也出现了一些比较有名的算法，他们使用Road Maps地图策略，然后再结合搜索算法，进行寻路。



#### PRM

随机选取途径点，然后连起来，排除跨过障碍物的边，这里看起来就非常离散化了，并且和图论中的点很像了，

然后基于随机选取的路径点寻找一条线路 。但是这样得到的路径可能很好，也可能很差，随机性太高了。



#### RRT

基于PRM的基础上，将整个图的结构变成树形的，然后基于树形进行扩展，最后得到一条路径，这种方法速率非常快，得到的线路也比PRM更合理一些

![](https://img.elmagnifico.tech/static/upload/elmagnifico/HMosyEAgpaf3NJI.gif)

Road Maps还有一个问题就是得到的路径可能非常扭曲，不平滑，实际执行的时候需要再次进行平滑。



#### Visibility Graph

可视图法

> https://blog.csdn.net/qq_36549512/article/details/80457777

![](https://img.elmagnifico.tech/static/upload/elmagnifico/DGBwe5ai4QRSPc8.png)

可视图法比较特殊，它相当于是从上帝视角俯瞰整个地图，然后将地图中所有障碍物的边角连接起来，最终他们中不和障碍物穿插的边被留下了。再以这些边和顶点构建图，进行图搜索，从而得到最终的路径。同理于PRM，他得到的比较稳定一些，但是可能多数情况下都不是最优，还有一个问题就是凹多边形会出现问题。



### Navmesh

某种程度上说Navmesh其实就是Visibility Graph，只是他多用在游戏领域，适合2d的地图离散化，并且只要没有凹多边形，基本上可以完美胜任，路径点少，搜索效率极高，他与Visibility Graph不同的地方在于只要是地图中内覆盖的任何一点，都是可行点，可以到达的，适合动态实时切换目标点

> https://www.zhihu.com/question/20298134



## 算法完备性

这里再总结一下算法的完备性和最优性，类似或者拓展的算法就不单独标注了

- 完备，总能找到解
- 最优，能找到最优路径



| 算法             | 完备               | 最优 |
| ---------------- | ------------------ | ---- |
| Dijkstra         | 是                 | 是   |
| Astar            | 是                 | 是   |
| 蚁群算法         | 是                 | 是   |
| 人工势场法       | 否，存在局部极小值 | 否   |
| PRM              | 概率               | 否   |
| RRT              | 概率               | 否   |
| Visibility Graph | 是                 | 是   |
| Navmesh          | 是                 | 否   |

当然实际的使用中，完备与否，最优与否都与应用有关系。游戏里多数情况下只要完备即可，最优不一定。而在工业或者其他行业里可能最优是最重要的，只是不一定能找到而已。大家都在完备的路上，追求最优的结果而已



## Summary

最后总结一下，对地图进行离散化，大概就是上面的几种方法，傻瓜一点就Grid，复杂一些就用Road Maps。

同时Grid只适合低维度，小地图，而Road Maps适合高维度比如6维机械臂之类的进行规划，低维度当然也可以，只是有点杀鸡用牛刀的感觉。

到这里基本上可能会遇到的搜索或者路径算法就这些了，剩下都是在他们的基础上，添加限制之后，进行扩展或者优化，从而达到更好的效果，具体就去翻论文吧。

完成了地图离散以后，基本就能得到一条可行路径了，但是这个时候还需要目标沿着可行路径运动，那就是轨迹规划了。

## Quote

> https://mp.weixin.qq.com/s?__biz=MzA5MDE2MjQ0OQ==&mid=2652786406&idx=1&sn=f937dd6aa91344fed689baf51dc821ab&scene=21#wechat_redirect
>
> https://zhuanlan.zhihu.com/p/104056027?utm_source=qq
>
> https://zhuanlan.zhihu.com/p/54510444
>
> https://blog.csdn.net/songyunli1111/article/details/78384096
