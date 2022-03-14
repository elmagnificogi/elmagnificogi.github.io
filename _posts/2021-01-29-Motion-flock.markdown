---
layout:     post
title:      "集群运动"
subtitle:   "VO,RVO,Coordinated"
date:       2021-01-29
author:     "elmagnifico"
header-img: "img/bg4.jpg"
catalog:    true
tags:
    - PathFind
---

## Foreword

说完了寻路算法和地图离散化，还剩下轨迹规划，但是这里还需要提一下和寻路和轨迹相关性非常高的一个分支方向，那就是集群运动。

平常说的寻路就自动包含了避障方面的考虑，但是这都是单一个体来考虑的，如果当这里不是单一个体，而是一个群体，群体移动的时候，遇到某些很窄的通道要怎么处理，群体内部该如何不碰撞，不抖动。

一般集群运动都是用一种局域范围内的动态避让算法来缓解群体内部的矛盾。



## VO

- Velocity Obstacle

这种算法非常朴素，简单说如和让两个甚至多个球不发生碰撞，实际操作的时候是让他们保持距离，但这只是宏观的看法，如果我可以让两个球的速度保持平行，并且初始距离合适的情况下，他们一定不会碰撞。基于这样朴素的理论，那么拓展一下，两个球的相对速度方向只要是平行或者远离他们相对位置矢量，那他们必然不可能相撞。

稍微有点我预判了你的方向的意思，我们方向不同，必然可以不碰撞。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/2HL5kxwSVZvm43g.jpg)

同理对于更多的球来说，也一样适用，这个球的下一步运动只需要选择一个和其他所有人都满足这个条件并且距离目标最近的方向进行运动，即可保持距离。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/JEx96IBsvagbRZ7.jpg)

但是VO算法有几个前提条件，这里主要做速度选择的球是主角，其他球的方向默认都是不会发生变化的，就会出现实际运动时球一直在切换方向，整个运动过程非常抖，这个就和我们的实际应用有点偏差。如果基于这样的基础去扩展，让每一个球都成为主角，都应用这一套理论，并且不再需要转向那么多，每个球都是一个智能体，基于此演化出了RVO，用来解决局域范围内避障的问题。



## RVO

- Reciprocal Velocity Obstacle

简单说RVO，就是认定其他运动体在做速度调整的时候也会考虑到对方也会做出相同的判定，那么基于这个互利原则，每次计算速度的时候方向只需要调整50%的幅度即可，所以做偏转时不会偏转得像VO那么大，最后达到的效果看起来就很连续。同时RVO里还加入了视野预判，这就让给出来的路径中抖动非常小，很平滑。

> https://gamma.cs.unc.edu/RVO/

而在复杂情况中，可能会没有合适的速度方向，这个时候会选择一个不符合条件的速度方向，这个时候有一个惩罚计算函数，根据飞机预期碰撞时间，目标距离等等，算出来一个最小惩罚，然后选择这个方式。



## RVO2/ORCA

- Optimal Reciprocal Collision Avoidance

> https://gamma.cs.unc.edu/ORCA/

本质上还是基于RVO做的优化，认定所有参与运动的都是用相同的算法进行判定，从而达成互相协助，最终无碰撞。

一般情况下RVO都被结合进一个寻路或者集群算法中的一部分，主要是用来处理障碍物或者智能体之间的碰撞。



## Flowfield Pathfinding

流场寻路，首先是应用Dijkstra算法得到全图的的距离图，然后每个格子指向邻居节点中距离最小的格子，从而生成一个矢量热度图。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/iTRmfLHA7Wj9O48.png)



类似于形成了一个势场，每个各自都有一个流向趋势，由于是计算了全图的流向，所以当投放多对象寻路的时候，他们只要根据逻辑按照流势走就行了，从而看起来像是一个集群运动，当然他们本身避障等基础功能是要有的。

某种程度上他们像人工势场，基于Djikstra算法做出来的人工势场

> http://leifnode.com/2013/12/flow-field-pathfinding/
>
> https://www.bilibili.com/video/av92278229/
>
> https://gamedevelopment.tutsplus.com/tutorials/understanding-goal-based-vector-field-pathfinding--gamedev-9007



## Boids

这个算法主要定义了集群的三大核心规则，分离，队列和内聚，然后所有鸟都根据规则进行运动，从而形成了一种看起来像是鸟群鱼群的运动

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/VP6nBbdGLwHcUpj.gif)

基于这样的规则再拓展就能创造出一些很有意思的集群运动

> http://www.red3d.com/cwr/boids/



## Summary

集群运动有很多限制，但是从某种程度上说他解决了内部避障，从大流的运动趋势。



## Quote

> https://blog.csdn.net/natsu1211/article/details/37774547
>
> http://blog.sina.com.cn/s/blog_6ad33d350102xqal.html
>
> https://gamma.cs.unc.edu/RVO/
>
> https://www.jianshu.com/p/8fc4e90e3850
>
> https://arongranberg.com/astar/docs/localavoidance.html
>
> https://blog.csdn.net/u012740992/article/details/89397714
>
> https://www.cnblogs.com/zblade/p/7608275.html
>
> https://yimicgh.top/%E7%AC%94%E8%AE%B0/Flow-field-pathfinding-01/
>
> https://blog.csdn.net/zjq2008wd/article/details/51192765
>
> https://blog.csdn.net/zjhysj/article/details/80671703
>
> https://zhuanlan.zhihu.com/p/46361646
>
> https://www.openprocessing.org/sketch/162190

