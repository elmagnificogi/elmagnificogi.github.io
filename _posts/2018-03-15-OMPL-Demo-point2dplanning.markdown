---
layout:     post
title:      "OMPL 2D规划Demo"
subtitle:   "motion planning"
date:       2018-03-15
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
header-mask:  0.3
catalog:    true
multilingual: true
tags:
    - Algorithm
---

## Foreword

学习ompl 首先从最简单呢2D规划demo开始。

> Setting up geometric planning for a rigid body in 3D requires the following steps:

> identify the space we are planning in: SE(3)
select a corresponding state space from the available ones, or implement one. For SE(3), the ompl::base::SE3StateSpace is appropriate.
since SE(3) contains an R3 component, we need to define bounds.
define the notion of state validity.
define start states and a goal representation.
Once these steps are complete, the specification of the problem is conceptually done. The set of classes that allow the instantiation of this specification is shown below.

结合OMPL官方的教程，先有一个整体概念：

1. 定义对象的运动空间
2. 设置符合对象运动的状态空间
3. 定义空间边界
4. 定义可行状态
5. 定义规划起点和终点

通俗一点说，第一步要设定对象到底是在什么样的地方运动的，是二维还是三维的，第二步是要结合对象自身给出对象在空间中的状态应该是什么样的，如果只是一个质点，那么他就只有（x,y,z）这么一个信息而已。

但是如果是一个无人机，那么除了（x,y,z）还有（roll,yaw,pitch）三个角度信息，如果是一个机械臂，那么他也会有若干个维度的角度信息。给定了状态信息，其实还需要给出环境的边界信息，毕竟不是无限边界的，更细化一些可能还需要给出对象自身的一个模型边界信息（非质点情况下）。

环境可能会很复杂，什么地方可以走什么地方不能走，还需要给定一个用来判断空间可行的函数，最后给出规划起点和终点，就可以开始planning了。

### source code

```python
# 导入ompl需要使用的库
try:
    from ompl import util as ou
    from ompl import base as ob
    from ompl import geometric as og
except:
    # 如果ompl的 python依赖库自定义路径的话，从这里添加自定义的python库地址
    # if the ompl module is not in the PYTHONPATH assume it is installed in a
    # subdirectory of the parent directory called "py-bindings."
    sys.path.insert(0, join(dirname(dirname(abspath(__file__))),'py-bindings'))
    from ompl import util as ou
    from ompl import base as ob
    from ompl import geometric as og
from os.path import abspath, dirname, join
import sys
from functools import partial

# 2D空间类
class Plane2DEnvironment:
    def __init__(self, ppm_file):

        # 创建图像对象
        self.ppm_ = ou.PPM()
        self.ppm_.loadFile(ppm_file)

        # 初始化状态空间
        space = ob.RealVectorStateSpace()
        space.addDimension(0.0, self.ppm_.getWidth())
        space.addDimension(0.0, self.ppm_.getHeight())

        # 设定最大宽高，为什么要减一？？？
        self.maxWidth_ = self.ppm_.getWidth() - 1
        self.maxHeight_ = self.ppm_.getHeight() - 1
        self.ss_ = og.SimpleSetup(space)

        # 设置可行状态空间检测函数
        # set state validity checking for this space
        self.ss_.setStateValidityChecker(ob.StateValidityCheckerFn(
            partial(Plane2DEnvironment.isStateValid, self)))
        space.setup()
        # 设置检测精度
        self.ss_.getSpaceInformation().setStateValidityCheckingResolution(1.0 / space.getMaximumExtent())
        #      self.ss_.setPlanner(og.RRTConnect(self.ss_.getSpaceInformation()))

    def plan(self, start_row, start_col, goal_row, goal_col):
        # 如果状态空间不存在直接退出规划
        if not self.ss_:
            return false

        # 设置规划起点和终点状态
        start = ob.State(self.ss_.getStateSpace())
        start()[0] = start_row
        start()[1] = start_col
        goal = ob.State(self.ss_.getStateSpace())
        goal()[0] = goal_row
        goal()[1] = goal_col
        self.ss_.setStartAndGoalStates(start, goal)

        # 尝试获取规划结果，但是这个clear是干什么？
        # generate a few solutions; all will be added to the goal
        for i in range(10):
            if self.ss_.getPlanner():
                self.ss_.getPlanner().clear()
            self.ss_.solve()

        ns = self.ss_.getProblemDefinition().getSolutionCount()
        print("Found %d solutions" % ns)

        # 如果有解路径
        if self.ss_.haveSolutionPath():
            self.ss_.simplifySolution()
            p = self.ss_.getSolutionPath()
            # 平滑路径？
            ps = og.PathSimplifier(self.ss_.getSpaceInformation())
            ps.simplifyMax(p)
            #　使用B样条曲线进行平滑
            ps.smoothBSpline(p)
            return True
        else:
            return False

    def recordSolution(self):
        if not self.ss_ or not self.ss_.haveSolutionPath():
            return
        p = self.ss_.getSolutionPath()
        # 对路径进行插值
        p.interpolate()
        for i in range(p.getStateCount()):
            # 这里是取出状态空间中的路径点，进行标色，而之前的记录宽高则是用来防止数组越界的
            # 这里的坐标是从0开始的，而实际地图下标最大是maxWidth_-1，maxHeight_-1
            w = min(self.maxWidth_, int(p.getState(i)[0]))
            h = min(self.maxHeight_, int(p.getState(i)[1]))
            c = self.ppm_.getPixel(h, w)
            c.red = 255
            c.green = 0
            c.blue = 0

    def save(self, filename):
        if not self.ss_:
            return

        # 保存图片
        self.ppm_.saveFile(filename)

    def isStateValid(self, state):
        # 检测是否越界
        w = min(int(state[0]), self.maxWidth_)
        h = min(int(state[1]), self.maxHeight_)

        # 检测当前点是白色还是黑色，接近白色认为可行，接近黑色认为不可行
        c = self.ppm_.getPixel(h, w)
        return c.red > 127 and c.green > 127 and c.blue > 127

if __name__ == "__main__":
    # 指定到ompl-1.3.2-Source/tests/resources/ppm/floor.ppm 文件，实际是一个地图图片
    fname = join(join(join(join(dirname(dirname(abspath(__file__))),
        'tests'), 'resources'), 'ppm'), 'floor.ppm')

    # 根据图片信息创建一个2D的环境
    env = Plane2DEnvironment(fname)

    # 从（0，0）点到（777，1265）点，实际指像素点，如果存在规划解
    if env.plan(0, 0, 777, 1265):
        # 记录下来规划路径
        env.recordSolution()
        #将解保存到当前目录下
        env.save("result_demo.ppm")
```

## Summary

OMPL，只是帮你搭建好了整个运动规划的大框架，这就是直接利用现成的规划算法，直接进行规划.实际上遇到实际问题的时候,状态可行的判断函数可能非常复杂,空间边界也不是随便几个点就能描述清楚的,对象自身边界信息也会很复杂,当他们变复杂的时候,内置的规划算法可能就不合适了,这就需要我们自己重新构建规划函数了.

## Quote

> http://ompl.kavrakilab.org/core/
>
> http://ompl.kavrakilab.org/geometricPlanningSE3.html
>
>
>
>
>
>
>
>
>
