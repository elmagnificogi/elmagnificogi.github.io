---
layout:     post
title:      "OMPL 有效状态检测"
subtitle:   "state,CAD,Models"
date:       2018-03-16
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - PathFind
    - OMPL
---

## Foreword

由于给定的环境是自定义的,所以ompl不提供有效状态检查,只是给了对应的接口,让我们自己来完成状态检查.


### 状态检测

ompl中给了两个类定义状态检测

- ompl::base::StateValidityChecker
- ompl::base::MotionValidator

ompl::base::StateValidityChecker 类中 isValid() 则是可以让我们重构的状态检测函数,如果不指定状态检测函数,那么默认会使用所有状态都可行(ompl::base::AllValidStateValidityChecker).

#### StateValidityChecker

```Python
// define this class:
class myStateValidityCheckerClass : public base::StateValidityChecker
{
public:
     myStateValidityCheckerClass(const base::SpaceInformationPtr &si) :
       base::StateValidityChecker(si)
        {
     }
     virtual bool isValid(const base::State *state) const
     {
             return ...;
     }
};

// or this function:
bool myStateValidityCheckerFunction(const base::State *state)
{
     return ...;
}

base::SpaceInformationPtr si(space);

# 指定检测对象
// either this call:
# 这里还是使用了 make_shared 申请动态空间
si->setStateValidityChecker(std::make_shared<myStateValidityCheckerClass>(si));

// or this call:
si->setStateValidityChecker(myStateValidityCheckerFunction);
# 指定有效状态精度,这个只能在 ompl::base::DiscreteMotionValidator 的情况下使用.
si->setStateValidityCheckingResolution(0.03); // 3%
si->setup();
```

#### ompl::base::MotionValidator

MotionValidator 与 StateValidityChecker 检查有所不同,他是用来检查在两个状态之间运动,是否可行.
而 StateValidityChecker 则是检查某个状态是否可行,而其 ompl::base::DiscreteMotionValidator 的实现则是基于 StateValidityChecker 来完成的.由于是离散的检查,所以如果一旦状态空间巨大,离散精度不够的情况下,会出现一些不可行的位置被忽略了,而精度高的情况下,又会出现检查时间过长,从而导致拖慢了整体规划的速率.

ompl::base::StateSpace::validSegmentCount() 则是用来设定离散需要检测的状态数的


```python
// define this class:
class myMotionValidator : public base::MotionValidator
{
public:
    // implement checkMotion()
};
base::SpaceInformationPtr si(space);
si->setMotionValidator(std::make_shared<myMotionValidator>(si));
si->setup();
```

## Summary

官网里对于 MotionValidator的介绍还是有点少,更多的需要查看源码来确认.

其实对于motion plannning 来说,各种算法算法自身的时间其实并不是很多,绝大多数时间都用于 StateValidityChecker 了,就好比各种游戏引擎中,计算碰撞花费的时间非常多,所以大多数都是先算一个粗碰撞,有可能碰撞再算细碰撞.

## Quote

> http://ompl.kavrakilab.org/core/
>
> http://ompl.kavrakilab.org/classompl_1_1base_1_1SpaceInformation.html#a2bcd47fd9b7cf54b086d2122646736bf
>
> http://ompl.kavrakilab.org/stateValidation.html
>
