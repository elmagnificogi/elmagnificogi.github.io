---
layout:     post
title:      "OMPL Benchmark Planner"
subtitle:   "cfg,log,database"
date:       2018-03-17
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - PathFind
    - OMPL
---

## Foreword

由于存在很多规划的方式,各个参数又不同,如果一遍一遍自己运行很费事费时,所以要对比一下到底何种方式更好的时候,就可以使用OMPL自带的Benchmark来完成这样的工作.

### cfg

所有的benchmark参数全都存在一个以cfg为后缀的配置文件中,其中参数类似于ini文件,都是使用关键字与数值匹配.

配置文件大致如下,此文件存于 ./benchmark/example.cfg

```python
[problem]
# problem specific settings
# 这里设置了一些规划的环境 模型 起点终点 以及一些模型限制
# 简单说这里是对问题的描述
name=example_name
world=../resources/2D/Maze_planar_env.dae
robot=../resources/2D/car1_planar_robot.dae
start.x=0.0
start.y=0.0
start.theta=0.0
goal.x=26.0
goal.y=0.0
goal.theta=0.0
threshold=1e-15
volume.min.x = 0
volume.min.y = 1
volume.max.x = 1
volume.max.y = 2

[benchmark]
# 这里是规划的一些测试限制 比如这里限制最大内存1000 最多规划10s 每个规划器运行三次
time_limit=10.0
mem_limit=1000.0
run_count = 3

[planner]
# 这里是选择使用什么规划器进行规划
# the planners to instantiate
est=
rrt=
sbl=
prm=
kpiece=
bkpiece=
lbkpiece=
stride=

# 针对各个规划器又可以单独设置规划器的参数
# other planner options are possible too. e.g.:
# rrt.range=0.2
```

更详细的描述需要查看官方教程中的内容.

使用 example.cfg 配置开始测试：

    ./build/Release/bin/ompl_benchmark ./benchmark/example.cfg

测试之后会得到一个同名的log文件 example.log

其中包含了本次测试的问题描述，使用的硬件，得到的结果，十分详尽

### code

除了使用cfg文件来配置,其实也可以直接写代码来配置想要的benchmark,只不过比较复杂一些.

在使用benchmark测试之前,要先描述清除问题
```c++
#include "ompl/tools/benchmark/Benchmark.h"
// A function that matches the ompl::base::PlannerAllocator type.
// It will be used later to allocate an instance of EST
ompl::base::PlannerPtr myConfiguredPlanner(const ompl::base::SpaceInformationPtr &si)
{
    geometric::EST *est = new ompl::geometric::EST(si);
    est->setRange(100.0);
    return ompl::base::PlannerPtr(est);
}
// Create a state space for the space we are planning in
ompl::geometric::SimpleSetup ss(space);
// Configure the problem to solve: set start state(s)
// and goal representation
// Everything must be set up to the point ss.solve()
// can be called. Setting up a planner is not needed.
```

然后才是建立一个benchmark配置,将其与之前建立的状态空间联系起来,最后才调用测试,这里就不存在solve函数了。
```c++
// First we create a benchmark class:
ompl::tools::Benchmark b(ss, "my experiment");
// Optionally, specify some benchmark parameters (doesn't change how the benchmark is run)
b.addExperimentParameter("num_dofs", "INTEGER", "6")
b.addExperimentParameter("num_obstacles", "INTEGER", "10")
// We add the planners to evaluate.
b.addPlanner(base::PlannerPtr(new geometric::KPIECE1(ss.getSpaceInformation())));
b.addPlanner(base::PlannerPtr(new geometric::RRT(ss.getSpaceInformation())));
b.addPlanner(base::PlannerPtr(new geometric::SBL(ss.getSpaceInformation())));
b.addPlanner(base::PlannerPtr(new geometric::LBKPIECE1(ss.getSpaceInformation())));
// etc
// For planners that we want to configure in specific ways,
// the ompl::base::PlannerAllocator should be used:
b.addPlannerAllocator(std::bind(&myConfiguredPlanner, std::placeholders::_1));
// etc.
// Now we can benchmark: 5 second time limit for each plan computation,
// 100 MB maximum memory usage per plan computation, 50 runs for each planner
// and true means that a text-mode progress bar should be displayed while
// computation is running.
ompl::tools::Benchmark::Request req;
req.maxTime = 5.0;
req.maxMem = 100.0;
req.runCount = 50;
req.displayProgress = true;
b.benchmark(req);
// This will generate a file of the form ompl_host_time.log
b.saveResultsToFile();
```

这里是运行前和运行后回调函数
```c++
// Assume these functions are defined
void optionalPreRunEvent(const base::PlannerPtr &planner)
{
    // do whatever configuration we want to the planner,
    // including changing of problem definition (input states)
    // via planner->getProblemDefinition()
}
void optionalPostRunEvent(const base::PlannerPtr &planner, tools::Benchmark::RunProperties &run)
{
    // do any cleanup, or set values for upcoming run (or upcoming call to the pre-run event).
    // adding elements to the set of collected run properties is also possible;
    // (the added data will be recorded in the log file)
    run["some extra property name INTEGER"] = "some value";
    // The format of added data is string key, string value pairs,
    // with the convention that the last word in string key is one of
    // REAL, INTEGER, BOOLEAN, STRING. (this will be the type of the field
    // when the log file is processed and saved as a database).
    // The values are always converted to string.
}
// After the Benchmark class is defined, the events can be optionally registered:
b.setPreRunEvent(std::bind(&optionalPreRunEvent, std::placeholders::_1));
b.setPostRunEvent(std::bind(&optionalPostRunEvent, std::placeholders::_1, std::placeholders::_2));
```

### log

无论是code还是cfg最后都会产生log文件，不过其基本就是一个txt文本，如果想有效利用一下可以将其转化为数据库文件或者是pdf图表文件。

无论怎么转换都需要调用到 ./ompl/scripts/ompl_benchmark_statistics.py 文件

将日志文件转换为数据库文件

    ompl/scripts/ompl_benchmark_statistics.py logfile.log -d mydatabase.db

将数据库文件转换为pdf文件,会有大量图表

    ompl/scripts/ompl_benchmark_statistics.py -d mydatabase.db -p boxplot.pdf

生成一个sql数据库文件

    ompl/scripts/ompl_benchmark_statistics.py -d mydatabase.db -m mydump.sql

具体的 log 文件格式，图表含义，数据库排布见引用

## Summary

其实OMPL还可以把测试数据上传到Planner Arena，相当于是有一个天梯，某种common问题可能会有各种人使用的优化后的更好的配置可以参考。Planner Arena 也可以只在本地运行，做为本地对比也可以。

OMPL功能还是十分复杂的，需要比较多的时间去学习。

## Quote

> http://ompl.kavrakilab.org/benchmark.html
>
