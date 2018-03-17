---
layout:     post
title:      "OMPL 路径输出"
subtitle:   "app,visualization"
date:       2018-03-17
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - Algorithm
---

## Foreword

OMPL 本身没有可视化路径的功能,一般都是把数据导出,然后用其他程序来可视化.当然由于有了ompl.app,所以可以使用app来可视化路径.

OMPL主要是这两种方式进行导出:

- ompl::geometric::PathGeometric,只包含路径点
- ompl::control::PathControl,除了路径点,还有控制信息和控制时间

他们都可以调用 printAsMatrix() 来输出路径

#### State Space

这种方式下输出的点是离散的,并且一行是一组点,或者说是一个路径状态,由起点开始,终点结束.

```python
# python
solved = ss.solve(20.0) # ss is a SimpleSetup object
if solved:
    print(ss.getSolutionPath().printAsMatrix())
```
```c++
// c++
bool solved = ss.solve(20.0); // ss is a SimpleSetup object
if (solved)
    ss.getSolutionPath().printAsMatrix(std::cout);
```

#### Control Space

Control Space 比 State Space 维度直接翻倍了,多了每个轴上数据发生改变所需要的控制时间.

如果只想要控制点,而不需要控制时间,那么下面这种方式是是将Control Space的值转化成一个一个控制点来进行输出,会自动进行转换,并且根据预设的步长来插值,得到类似于上面的输出方式.

在源码中的./demo中RigidBodyPlanningWithControls.py就是使用的Control Space的方式进行规划的,输出的结果也是Control Space式的,那么就可以使用下面的方法来输出位置点.

```python
# python
solved = ss.solve(20.0) # ss is a SimpleSetup object
if solved:
    print(ss.getSolutionPath().asGeometric().printAsMatrix())
```

```c++
// c++
bool solved = ss.solve(20.0); // ss is a SimpleSetup object
if (solved)
    ss.getSolutionPath().asGeometric().printAsMatrix(std::cout);
```

#### OMPL.app GUI

使用app比较简单,提前加载好环境和机器人以后,然后加载路径文件,就可以播放了.

#### Other

官方也有介绍一些其他的方法比如Matplotlib Matlab R 等等方式,具体详见下面的引用,由于我用maya比较多,而且接口也比较熟悉,所以我就用maya写一个小脚本就能完成这些了.

## Summary

输出结算结果部分比较简单,一般来说得到的都是一个个离散的点,这里只是path plannning,拿到这些数据以后其实还需要根据具体的模型做一个 trajectory planning,这样才能得到一个完整或者说一个完美的运动规划.

## Quote

> https://ompl.kavrakilab.org/classompl_1_1control_1_1PathControl.html#aef65c5719d57101f7733a631a5cdc61a
>
> http://ompl.kavrakilab.org/pathVisualization.html
>
