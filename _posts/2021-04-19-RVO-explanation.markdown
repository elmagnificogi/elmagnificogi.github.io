---
layout:     post
title:      "RVO算法详解"
subtitle:   "RVO2,OV"
date:       2021-04-19
update:     2021-04-28
author:     "elmagnifico"
header-img: "img/zerotier.jpg"
catalog:    true
tags:
    - pathfinding
---

## Foreword

RVO已经实际应用了，但是基于RVO的论理，还是做了进一步修改，将RVO和实际应用结合的更紧密一些。

或者说实际上模拟了一个小型物理系统，来追踪和获取路径点信息。



## 先说一下实际应用的坑

1.RVO2 3D 这里官方给的例子是VS，直接可以上手运行，而git上的例子不是基于vs的，不是很好编译

> https://gamma.cs.unc.edu/RVO2/
>
> https://github.com/snape/RVO2



2.RVO2 3D缺少了一些关键参数，比如加速度，实际控制中没有加速度控制，可能和实际应用多有不同，而2D版本则是都有的。有尝试过使用别人增加加速度控制的，但是实际上效果不好，可能需要重新实现一下。



3.RVO2 3D中速度的限制或者物理量的单位不明确，特别是速度和TimeStep，当时间精度和速度都设置为真实物理量的时候，会发现速度往往是设置值的10倍，而有时候又是正常的，这个可能是实现的内部有bug，导致这个物理量成了一个相对值，而不是绝对值，不能真的当作物理量对待。这就导致获取到了RVO的路径点以后，还需要将这一段路径点重新转化成你的物理环境下的变量，而不能直接拿来用。



4.TimeHorizon，这个东西会严重影响智能体是否能达到最高速度，严重影响最终能否获取到结果，但是实际意义又不明确，导致用起来很难。



5.RVO2 3D 中没有实现障碍物的处理，2D中则是给了一些障碍物模型。需要添加障碍物，要重写。



6.RVO中的算法是相同的，智能体之间不需要交流，这个不能算缺点，不需要交流的好处是，他们可以应用到分布式中，只要他们能拿到相同的信息即可得到相同的结果，从而可以在分布式的环境下独立运行，而不出现干扰。同理这样的情况下会导致可能某些情况下效率不高，需要更高一层的算法帮忙做好局部目标来缓解局部低效的情况（比如很窄的通道，两边都挤满人的情况下，RVO这个时候局部避障可能大概率走不出来）



## 优点

1. 简单，计算量不大。
2. 实时可控，解算速率比较快，中途可以加入新节点也可以移除老节点。
3. 开源，可以根据基础算法二次扩展，适配实际的应用环境。
4. 解耦路径规划，本身只处理局部碰撞即可，全局的路径对他来说并不知道。



## 框架

- 全局寻路算法，给出中间的路径点（roadmap或者a*之类的）

  - 路径点作为输入，给到RVO，作为局部目标点，到达局部目标点后，继续朝下一个局部目标点行进，直到最终目标点
- 转换并且平滑RVO路径点，将其合理化到对应的物理世界中
- 输出路径点，开始执行



## RVO理论基础

要说RVO需要先理解VO的理论基础



### VO

- Velocity Obstacles



![image-20210420094746255](https://i.loli.net/2021/04/20/miSKpZfb2Unw7he.png)

- 这里所有速度都单纯的指二维平面，矢量速度

- A，B是一个智能体
- PA是A的当前位置，PB是B的当前位置
- VOAB（VB）是指当B以VB的速度运动时，会与A发生碰撞的，所有A速度的集合，其实这个集合就是VA-VB的闵可夫斯基和
-  λ(p,v) 是一个以p为原点，v为方向的射线

![image-20210420111349374](https://i.loli.net/2021/04/20/RLS6MZV2inrKjhk.png)

这样定义出来的就是AB碰撞的速度区域集合，而只要速度不属于这个区间，那么就可以保证不会碰撞。



其他解释

- Minkowski sum，闵可夫斯基和，**官方定义**：两个图形A,BA,B的闵可夫斯基和C={a+b|a∈A,b∈B}C={a+b|a∈A,b∈B}
  **通俗一点**：从原点向图形A内部的每一个点做向量，将图形BB沿每个向量移动，所有的最终位置的并便是闵可夫斯基和（具有交换律），一般都是指凸包
- 部分数学基础，https://www.cnblogs.com/xzyxzy/p/10033130.html



### RVO

![image-20210420112144478](https://i.loli.net/2021/04/20/oYOgEe1KDjIkBbP.png)

RVO在VO的基础上，将可行速度区域按照VO的两侧分成了左可行和右可行。但是在VO中，无论两个对象选同侧通行，还是异侧通行，都会出现速度抖动的情况。而RVO为了缓解这个情况，每次选择速度的时候并不是直接选择无碰撞的速度，而是选取了无碰撞和老速度各50%来作为新速度。

![image-20210420121332097](https://i.loli.net/2021/04/20/ULAZzTMbJS9rleq.png)

在过度拥挤的情况下，无法找到一个合适速度的时候，就会选择一个碰撞内的速度，按照惩罚函数，求得一个轻惩罚的速度。

其中w是一个描述智能体是激进一些还是保守一些的参数，越激进相当于会做出更危险一点的行动，更轻视碰撞时间的影响。



同时为了简化计算，RVO设置了邻近计算距离，最佳距离是通过碰撞时间，距离，模拟精度以及平均速度等计算得来的



#### RVO2

- Optimal Reciprocal Collision Avoidance

简单说就是基于RVO理论的调优，将计算复杂度降低成低维度的线性规划问题。可以把论文作为RVO算法的一次理论实践，对实现细节给出了具体说明和调优等。

由于这里是具体的实践，所以又增加了一部分定义

- rA，A的半径，可以认为A是个球，这是他的安全半径
- VA_pref，A的目标速度或者期望速度矢量
- VA_max，A的最大速度
- 碰撞时间，可以理解为视野，只考虑在碰撞时间内的发生的情况

结合之前的PA和VA，这些量被认为是一个智能的内部具有的状态。

在考虑u的时候，由于所有智能体都算法一致，所以认为每个人都只需要考虑1/2 u即可。

![image-20210420162557239](https://i.loli.net/2021/04/20/ZJiCNhcWbkevztq.png)

![image-20210420162525979](https://i.loli.net/2021/04/20/i4YMlJcn7sKytWL.png)

#### AVO2

- Reciprocal Collision Avoidance with Acceleration-Velocity Obstacles

VO是通过选择速度来避障，AO则是通过选择加速度来避障，但是单纯的选择加速度没法保证不碰撞。而AVO就是结合加速度对速度进行约束，从而让最后给出的路径更加平滑，符合实际。



## 代码详解

整体结构比较简单，每个对象都叫做agent，然后他们有对应的属性，首先给他们初始化然后将其加入到模拟器中即可。

接着就是整体大循环，每次可以更新每个agent的目标位置，然后更加rvo理论，更新agent的属性，最终到达目的地。

这部分代码是基于RVO2D的版本



#### RVOSimulator更新逻辑

RVOSimulator也很简单，首先是创建KDtree，然后每个agent更新自己的邻近点，并且更新自己的速度。

然后就是所有agent根据新速度更新位置，关键主要是在更新速度中

```c++
	void RVOSimulator::doStep()
	{
		kdTree_->buildAgentTree();

#ifdef _OPENMP
#pragma omp parallel for
#endif
		for (int i = 0; i < static_cast<int>(agents_.size()); ++i) {
			agents_[i]->computeNeighbors();
			agents_[i]->computeNewVelocity();
		}

#ifdef _OPENMP
#pragma omp parallel for
#endif
		for (int i = 0; i < static_cast<int>(agents_.size()); ++i) {
			agents_[i]->update();
		}

		globalTime_ += timeStep_;
	}
```



#### computeNewVelocity

agent速度计算逻辑，这部分逻辑比较复杂，比较多，我们先看整体

整体上是先计算邻近的所有静态的障碍物，得到障碍物的边，或者说障碍线。

然后就是统一计算邻近的每个agent的障碍线，最后将这些障碍性和agent的一些属性带进去求线性规划的解

```c++
	/* Search for the best new velocity. */
	void Agent::computeNewVelocity()
	{
		// 这是一个线的集合
		orcaLines_.clear();

		// 将timehorizon倒数
		const float invTimeHorizonObst = 1.0f / timeHorizonObst_;
		
		// 这里主要是处理静态的障碍物
		/* Create obstacle ORCA lines. */
		for (size_t i = 0; i < obstacleNeighbors_.size(); ++i)
		
		const size_t numObstLines = orcaLines_.size();

		// 将timehorizon倒数
		const float invTimeHorizon = 1.0f / timeHorizon_;

		/* Create agent ORCA lines. */
		for (size_t i = 0; i < agentNeighbors_.size(); ++i)
		
		size_t lineFail = linearProgram2(orcaLines_, maxSpeed_, prefVelocity_, false, newVelocity_);

		if (lineFail < orcaLines_.size()) {
			linearProgram3(orcaLines_, numObstLines, lineFail, maxSpeed_, newVelocity_);
		}
	}

```



#### 障碍物



#### 其他agent

这个里面有些地方我也没看明白，希望有人能解答就好了。

```c++
		// timehorizon 是个不明确的含义，具体是什么意思要从代码里探究
		// 我的理解是它是指视野，相当于是观测预判多少范围的含义
		// 将timehorizon倒数
		const float invTimeHorizon = 1.0f / timeHorizon_;

		/* Create agent ORCA lines. */
		for (size_t i = 0; i < agentNeighbors_.size(); ++i) {
			// 拿到其相邻的agent
			const Agent *const other = agentNeighbors_[i].second;

			// 相对位置
			const Vector2 relativePosition = other->position_ - position_;

			// 相对速度
			const Vector2 relativeVelocity = velocity_ - other->velocity_;

			// 当前距离的平方
			const float distSq = absSq(relativePosition);
			
			// 碰撞最小距离
			const float combinedRadius = radius_ + other->radius_;
			// 碰撞最小距离的平方
			const float combinedRadiusSq = sqr(combinedRadius);

			Line line;
			Vector2 u;


			if (distSq > combinedRadiusSq) {
				// 如果二者还未碰撞
				/* No collision. */

				// 相对速度 - 相对位置/视野时间
				// 或者说 相对速度 - 相对位置/最大容忍的碰撞时间 = 就可以直到相对于预期碰撞来说，这个速度是大了还是小了
				/// 感觉这个值应该就是表示当前速度和预期碰撞的速度的差=我们这里简称为碰撞速度差
				const Vector2 w = relativeVelocity - invTimeHorizon * relativePosition;

				/* Vector from cutoff center to relative velocity. */
				// 速度值的平方
				const float wLengthSq = absSq(w);

				// 内积1 = 碰撞速度差*相对位置 其实就可以用来计算角度差
				const float dotProduct1 = w * relativePosition;

				// 内积1小于0 并且 内积的值 > 最小距离*碰撞速度差
				// 其实就是夹角的大小 小于0 表示是钝角 其实也就是不容易碰撞
				if (dotProduct1 < 0.0f && sqr(dotProduct1) > combinedRadiusSq * wLengthSq) {
					/* Project on cut-off circle. */
					const float wLength = std::sqrt(wLengthSq);
					// 归一化
					const Vector2 unitW = w / wLength;

					// 方向，不知道为什么 这里x取了反方向
					line.direction = Vector2(unitW.y(), -unitW.x());
					// 预期碰撞速度 - 碰撞速度差）* 方向向量 = 可选速度？ 或者说这个是不可选速度
					// 应该选择的速度都需要避开这个u，才能让新速度不会往碰撞的方向走
					u = (combinedRadius * invTimeHorizon - wLength) * unitW;
				}
				else {
					// 这里对应的就是锐角，可能碰撞
					/* Project on legs. */
					// 得到距离差
					const float leg = std::sqrt(distSq - combinedRadiusSq);

					// 这里就看不懂了，求了这两个东西的一个行列式
					// 感觉就是区分是在RVO的左侧还是右侧？
					if (det(relativePosition, w) > 0.0f) {
						/* Project on left leg. */
						line.direction = Vector2(relativePosition.x() * leg - relativePosition.y() * combinedRadius, relativePosition.x() * combinedRadius + relativePosition.y() * leg) / distSq;
					}
					else {
						// 在右侧
						/* Project on right leg. */
						line.direction = -Vector2(relativePosition.x() * leg + relativePosition.y() * combinedRadius, -relativePosition.x() * combinedRadius + relativePosition.y() * leg) / distSq;
					}

					// 内积2 = 相对速度  投影 到这条线上的长度
					const float dotProduct2 = relativeVelocity * line.direction;
					// 这个长度*线的方向 - 相对速度 = 不可选速度 类似上面的u
					u = dotProduct2 * line.direction - relativeVelocity;
				}
			}
			else {
				// 二者已经碰撞了 这里比较奇怪，结合之前别人的说明，就是碰撞了，也会计算计算？
				// 直接就无视了碰撞
				/* Collision. Project on cut-off circle of time timeStep. */
				// 这个直接变成了 1 / 模拟步长了 ，相当于是10
				const float invTimeStep = 1.0f / sim_->timeStep_;

				// 得到速度差？
				/* Vector from cutoff center to relative velocity. */
				const Vector2 w = relativeVelocity - invTimeStep * relativePosition;

				const float wLength = abs(w);
				const Vector2 unitW = w / wLength;

				// 反正又得到了一个速度 x 然后 u也得到了
				line.direction = Vector2(unitW.y(), -unitW.x());
				u = (combinedRadius * invTimeStep - wLength) * unitW;
			}

			// 然后这条线的起始点 = 老速度+0.5*新速度
			line.point = velocity_ + 0.5f * u;
			// 加入求解队列
			orcaLines_.push_back(line);
		}

		size_t lineFail = linearProgram2(orcaLines_, maxSpeed_, prefVelocity_, false, newVelocity_);
		// 求解失败了，选择用规划3
		if (lineFail < orcaLines_.size()) {
			linearProgram3(orcaLines_, numObstLines, lineFail, maxSpeed_, newVelocity_);
		}
```



## Summary

大概就这么多



## Quote

> https://gamma.cs.unc.edu/RVO/
>
> https://gamma.cs.unc.edu/ORCA/
>
> https://gamma.cs.unc.edu/RVO2/
>
> Paper:Reciprocal Velocity Obstacles for Real-Time Multi-Agent Navigation
>
> http://www.meltycriss.com/2017/01/13/paper-rvo/
>
> https://zsummer.github.io/2019/06/08/2019-06-08-rvo/
>
> http://www.meltycriss.com/2017/01/14/paper-orca/

