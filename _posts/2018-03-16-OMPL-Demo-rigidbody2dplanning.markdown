---
layout:     post
title:      "OMPL 2D刚体规划Demo"
subtitle:   "RRT,Rigidbody,SE2"
date:       2018-03-16
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - pathfinding
    - OMPL
---

## Foreword

本篇内容基本来自于官网的第一篇教程，但是这里还是有些东西没有解释清楚。
> http://ompl.kavrakilab.org/geometricPlanningSE3.html

比如其中的RealVectorBounds维度边界为什么是（-1，1）?

### source code

```python
try:
    from ompl import base as ob
    from ompl import geometric as og
except:
    # if the ompl module is not in the PYTHONPATH assume it is installed in a
    # subdirectory of the parent directory called "py-bindings."
    from os.path import abspath, dirname, join
    import sys
    sys.path.insert(0, join(dirname(dirname(abspath(__file__))),'py-bindings'))
    from ompl import util as ou
    from ompl import base as ob
    from ompl import geometric as og

def isStateValid(state):
    # 不是很明白为什么这里用0.6来判断
    # Some arbitrary condition on the state (note that thanks to
    # dynamic type checking we can just call getX() and do not need
    # to convert state to an SE2State.)
    return state.getX() < .6

def planWithSimpleSetup():
    # 这里使用的状态空间是 （x,y,yaw） 二维加一个航向角
    # create an SE2 state space
    space = ob.SE2StateSpace()

    # 设置向量是2维，上下边界为（-1，1）
    # set lower and upper bounds
    bounds = ob.RealVectorBounds(2)
    bounds.setLow(-1)
    bounds.setHigh(1)
    space.setBounds(bounds)

    # create a simple setup object
    ss = og.SimpleSetup(space)
    ss.setStateValidityChecker(ob.StateValidityCheckerFn(isStateValid))

    start = ob.State(space)
    # we can pick a random start state...
    start.random()
    # ... or set specific values
    start().setX(.5)

    goal = ob.State(space)
    # we can pick a random goal state...
    goal.random()
    # ... or set specific values
    goal().setX(-.5)

    ss.setStartAndGoalStates(start, goal)

    # 这里的1.0应该是指规划的上限时间
    # this will automatically choose a default planner with
    # default parameters
    solved = ss.solve(1.0)

    if solved:
        # try to shorten the path
        ss.simplifySolution()
        # print the simplified path
        print(ss.getSolutionPath())

def planTheHardWay():
    # create an SE2 state space
    space = ob.SE2StateSpace()
    # set lower and upper bounds
    bounds = ob.RealVectorBounds(2)
    bounds.setLow(-1)
    bounds.setHigh(1)
    space.setBounds(bounds)
    # construct an instance of space information from this state space
    si = ob.SpaceInformation(space)
    # set state validity checking for this space
    si.setStateValidityChecker(ob.StateValidityCheckerFn(isStateValid))
    # create a random start state
    start = ob.State(space)
    start.random()
    # create a random goal state
    goal = ob.State(space)
    goal.random()

    # 使用 ompl::geometric::SimpleSetup 的区别基本就在这一块
    #　不使用的情况下，需要在这里描述问题，就是用使用　ProblemDefinition
    # 这种方式可以指定使用什么来规划
    # create a problem instance
    pdef = ob.ProblemDefinition(si)
    # set the start and goal states
    pdef.setStartAndGoalStates(start, goal)

    # 这里使用RRT进行求解
    # create a planner for the defined space
    planner = og.RRTConnect(si)
    # set the problem we are trying to solve for the planner
    planner.setProblemDefinition(pdef)
    # perform setup steps for the planner
    planner.setup()
    # print the settings for this space
    print(si.settings())
    # print the problem settings
    print(pdef)
    # attempt to solve the problem within one second of planning time
    solved = planner.solve(1.0)

    if solved:
        # get the goal representation from the problem definition (not the same as the goal state)
        # and inquire about the found path
        path = pdef.getSolutionPath()
        print("Found solution:\n%s" % path)
    else:
        print("No solution found")


if __name__ == "__main__":
    # 这个是使用 ompl::geometric::SimpleSetup Class 来完成规划
    planWithSimpleSetup()
    print("")
    # 这个是不使用 ompl::geometric::SimpleSetup Class，总体需要配置的东西会多一些。
    planTheHardWay()
```

这段代码中，planWithSimpleSetup()总是可以得到解，而planTheHardWay()不一定，是因为前者将x的值限定在了0.6的有效范围内，而后者的x值是完全随机的，所以运行demo的时候有时候后一次没有解，其原因也是其开始位置和结束位置并不正确造成的。

### ompl.app

这个除了通过直接运行代码得到几个中间运动路径点，也可以通过app直接看到规划结果。

其中
- 环境选择 cubicles_env.dae
- 模型选择 cubicles_robot.dae
- Robot type 选择 Rigid Body plannning 2D
- Planner 选择 RRT

修改一下Goal pose ，选择一个合理可以到达没有模型穿插的地方.

然后运行解就能看到对应的结果了，当然教程里所用的是3D规划，是一个刚体（x,y,z）以及一个四元数用来表示旋转角度，和这个略有不同。

## Summary

总的来说 ompl::geometric::SimpleSetup Class 是教程中推荐使用的，其bug更少，而且对功能的限制也更少，封装层级也更高一些。

## Quote

> http://ompl.kavrakilab.org/core/
>
> http://ompl.kavrakilab.org/geometricPlanningSE3.html
>
> http://ompl.kavrakilab.org/classompl_1_1base_1_1SE2StateSpace.html
>
