---
layout:     post
title:      "OMPL 创建自己的采样器"
subtitle:   "state,sampler"
date:       2018-03-16
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - pathfinding
    - OMPL
---

## Foreword

由于使用的算法基本都是基于采样来完成,那么采样具体是怎么采的,则和最后得到的结果有很大的关系.

ompl中一般来说有两种采样器,一个是 ompl::base::StateSampler ,另一个是  ompl::base::ValidStateSampler

任何一个采样器都派生自 ompl::base::StateSampler,而 ValidStateSampler 是在 StateSampler 的基础上再进行采样的.

### ompl::base::ValidStateSampler

ValidStateSampler 内置了几种采样器:

- ompl::base::UniformValidStateSampler,默认采样器,均匀采样,返回一个有效样本或者查找到上限
- ompl::base::ObstacleBasedValidStateSampler,通过找到一个有效采样和一个无效采样,然后在这两个状态直接进行插值,返回最接近的无效采样的一个有效采样.通常这种方式是用来处理特殊的的一些情况,比如在规划环境中存在一个非常狭窄可行的路径时,这种方式可以有效找到这条特殊路径.
- ompl::base::GaussianValidStateSampler,高斯采样,他是首先找到一个随机采样样本,然后以这个样本为中心,进行高斯采样,得到第二个样本,至少会返回一个样本.
- ompl::base::MaximizeClearanceValidStateSampler,最大间隙采样,首先会找到一个均匀样本,然后基于此找一个间隙最大的采样样本

#### 使用已有采样方式

我们不可以直接设置采样器,而是要通过 ompl::base::ValidStateSamplerAllocator,来指定所使用的采样器具体是什么样的.

```c++
namespace ob = ompl::base;
namespace og = ompl::geometric;
ob::ValidStateSamplerPtr allocOBValidStateSampler(const ob::SpaceInformation *si)
{
    // we can perform any additional setup / configuration of a sampler here,
    // but there is nothing to tweak in case of the ObstacleBasedValidStateSampler.
    return std::make_shared<ob::ObstacleBasedValidStateSampler>(si);
}
si.setValidStateSamplerAllocator(ob.ValidStateSamplerAllocator(allocOBValidStateSampler))
```

### 自定义采样器

官方给的是一个质点在一个3d立方体空间里运动的示例,由于这是一个有规则的形状,所以用来设定其范围比较容易.

```c++
namespace ob = ompl::base;
namespace og = ompl::geometric;
/// @cond IGNORE

# 简单说如果我能直接手动指定一定范围的采样点,那么执行效率会非常高
// This is a problem-specific sampler that automatically generates valid
// states; it doesn't need to call SpaceInformation::isValid. This is an
// example of constrained sampling. If you can explicitly describe the set valid
// states and can draw samples from it, then this is typically much more
// efficient than generating random samples from the entire state space and
// checking for validity.
class MyValidStateSampler : public ob::ValidStateSampler
{
public:
    MyValidStateSampler(const ob::SpaceInformation *si) : ValidStateSampler(si)
    {
        name_ = "my sampler";
    }

    # 在三维空间中生成一个样本
    // Generate a sample in the valid part of the R^3 state space
    // Valid states satisfy the following constraints:
    // -1<= x,y,z <=1
    // if .25 <= z <= .5, then |x|>.8 and |y|>.8
    # 这里使用overrie 显示重载原基类中的同名同参函数
    # 这里的原注释本意表达的应该是valid states满足的条件,而这里生成states时则是有意不满足valid states,否则所有states都是valid states 就没意义了.想表达的是自己写的state sampler采样的结果比较接近有效state而已,并不是程序写错了
    bool sample(ob::State *state) override
    {
        double* val = static_cast<ob::RealVectorStateSpace::StateType*>(state)->values;
        # 在(-1,1)之间产生随机数
        double z = rng_.uniformReal(-1,1);
        if (z>.25 && z<.5)
        {
            double x = rng_.uniformReal(0,1.8), y = rng_.uniformReal(0,.2);
            switch(rng_.uniformInt(0,3))
            {
                case 0: val[0]=x-1;  val[1]=y-1;
                case 1: val[0]=x-.8; val[1]=y+.8;
                case 2: val[0]=y-1;  val[1]=x-1;
                case 3: val[0]=y+.8; val[1]=x-.8;
            }
        }
        else
        {
            val[0] = rng_.uniformReal(-1,1);
            val[1] = rng_.uniformReal(-1,1);
        }
        val[2] = z;
        assert(si_->isValid(state));
        return true;
    }

    # 就近采样这个用不到
    // We don't need this in the example below.
    bool sampleNear(ob::State* /*state*/, const ob::State* /*near*/, const double /*distance*/) override
    {
        throw ompl::Exception("MyValidStateSampler::sampleNear", "not implemented");
        return false;
    }
protected:
    # 这个函数是用来产生随机数的一个函数,线程安全的,并且每个实例都有自己的随机数种子
    ompl::RNG rng_;
};

# 然后通过重构有效采样器分配函数,让我们的有效采样器可以被使用
ob::ValidStateSamplerPtr allocMyValidStateSampler(const ob::SpaceInformation *si)
{
    return std::make_shared<MyValidStateSampler>(si);
}
ss.getSpaceInformation()->setValidStateSamplerAllocator(allocMyValidStateSampler);
```

这部分代码 来自于源码路径中StateSampling.py,比官方给的更加全,也更加详细
```python
# 有效性的检查是必须的,这里让有效性检查花费的时间比较多 1ms,从而验证之前所说的给出较为准确的采样点可以有效提高程序效率.
# This function is needed, even when we can write a sampler like the one
# above, because we need to check path segments for validity
def isStateValid(state):
    # Let's pretend that the validity check is computationally relatively
    # expensive to emphasize the benefit of explicitly generating valid
    # samples
    sleep(.001)
    # Valid states satisfy the following constraints:
    # -1<= x,y,z <=1
    # if .25 <= z <= .5, then |x|>.8 and |y|>.8
    return not (fabs(state[0]<.8) and fabs(state[1]<.8) and
        state[2]>.25 and state[2]<.5)

# return an obstacle-based sampler
def allocOBValidStateSampler(si):
    # we can perform any additional setup / configuration of a sampler here,
    # but there is nothing to tweak in case of the ObstacleBasedValidStateSampler.
    return ob.ObstacleBasedValidStateSampler(si)

# return an instance of my sampler
def allocMyValidStateSampler(si):
    return MyValidStateSampler(si)

def plan(samplerIndex):
    # construct the state space we are planning in
    space = ob.RealVectorStateSpace(3)

    # set the bounds
    bounds = ob.RealVectorBounds(3)
    bounds.setLow(-1)
    bounds.setHigh(1)
    space.setBounds(bounds)

    # define a simple setup class
    ss = og.SimpleSetup(space)

    # set state validity checking for this space
    ss.setStateValidityChecker(ob.StateValidityCheckerFn(isStateValid))

    # create a start state
    start = ob.State(space)
    start[0] = 0
    start[1] = 0
    start[2] = 0

    # create a goal state
    goal = ob.State(space)
    goal[0] = 0
    goal[1] = 0
    goal[2] = 1

    # set the start and goal states;
    ss.setStartAndGoalStates(start, goal)

    # 这里分别适配三种采样器,进行对比
    # set sampler (optional; the default is uniform sampling)
    si = ss.getSpaceInformation()
    if samplerIndex==1:
        # use obstacle-based sampling
        si.setValidStateSamplerAllocator(ob.ValidStateSamplerAllocator(allocOBValidStateSampler))
    elif samplerIndex==2:
        # use my sampler
        si.setValidStateSamplerAllocator(ob.ValidStateSamplerAllocator(allocMyValidStateSampler))

    # create a planner for the defined space
    planner = og.PRM(si)
    ss.setPlanner(planner)

    # attempt to solve the problem within ten seconds of planning time
    solved = ss.solve(10.0)
    if (solved):
        print("Found solution:")
        # print the path to screen
        print(ss.getSolutionPath())
    else:
        print("No solution found")


if __name__ == '__main__':
    print("Using default uniform sampler:")
    plan(0)
    print("\nUsing obstacle-based sampler:")
    plan(1)
    print("\nUsing my sampler:")
    plan(2)
```

#### 结果验证

```python
Using default uniform sampler:
Info:    Starting with 2 states
Info:    Created 35 states
Info:    Solution found in 4.367951 seconds
Found solution:
Geometric path with 8 states
RealVectorState [0 0 0]
RealVectorState [-0.0678487 0.103868 -0.634922]
RealVectorState [-0.42631 0.516178 0.225885]
RealVectorState [-0.118715 0.120511 -0.668154]
RealVectorState [0.272618 0.809821 -0.224768]
RealVectorState [0.185733 0.979894 0.848665]
RealVectorState [-0.799033 -0.530108 0.503029]
RealVectorState [0 0 1]



Using obstacle-based sampler:
Info:    Starting with 2 states
Info:    Created 18 states
Info:    Solution found in 1.659252 seconds
Found solution:
Geometric path with 5 states
RealVectorState [0 0 0]
RealVectorState [0.44635 -0.0401987 0.24401]
RealVectorState [0.921112 0.215792 -0.0990703]
RealVectorState [0.899279 0.40633 0.554191]
RealVectorState [0 0 1]



Using my sampler:
Info:    Starting with 2 states
Info:    Created 8 states
Info:    Solution found in 0.584767 seconds
Found solution:
Geometric path with 6 states
RealVectorState [0 0 0]
RealVectorState [0.0800613 0.462946 0.178039]
RealVectorState [0.719423 -0.526502 -0.0714563]
RealVectorState [0.808443 0.468046 -0.890075]
RealVectorState [0.90041 -0.871348 0.82618]
RealVectorState [0 0 1]
```

从结果看到均匀采样最慢,障碍物采样其次,自定义的采样方式最快.

也可以看到均匀采样和障碍物采样,其中得到的有效采样比例都是比自定义采样更低的.

## Summary

OMPL内置的采样都是比较基础的,普适性比较高,但是针对各个问题,都有各种问题对应的更优的采样器,所以并不能一概而论.能写一个自己的采样器,针对某个问题,得到的解更优,效果也更好.

## Quote

> http://ompl.kavrakilab.org/samplers.html
>
> http://ompl.kavrakilab.org/classompl_1_1RNG.html
