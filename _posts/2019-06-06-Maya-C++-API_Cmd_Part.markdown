---
layout:     post
title:      "maya c++ API CMD部分"
subtitle:   "API 学习"
date:       2019-06-06
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - API
    - maya
---

# Maya-C++ API

#### 常识

###### DAG

DAG：directed acyclic graph,DAG,DAG意思是有向无环图，所谓有向无环图是指任意一条边有方向，且不存在环路的图。

maya中，一个直接非循环图，定义了元素的位置，旋转以及比例。DAG由两类的DAG节点组成，transform(空间位置信息)和shape(模型网格信息)。

Transform节点中的是位置矩阵信息，包括位置、旋转、伸缩比例以及父级节点的对应信息，可以认为描述的就是这个模型在空间中的姿态信息。Shape节点存放的是模型几何数据的引用，shape顾名思义描述的就是这个模型的样子信息，他的顶点什么的应该在哪里，曲面曲线应该是怎样的等等。本质上shape里的位置信息都是相对于transform中的。

在最简单的情形中，DAG描述了一个对象的实例是如何从一块几何物体里构造而来的，比如创建一个球的时候，就同时创建了shape节点和transform节点，shape节点是对应的transform节点的子节点。

稍微复杂一点，这里会加上一个渲染的材质，就变成了，transform-shap-material

![SMMS](https://i.loli.net/2019/06/06/5cf8bf11e241699738.png)

类似于途中，描述几何信息的shape节点一定是叶结点

DAG节点相当于是maya里已经提前给你建立好的节点，这些节点的属性等都不能修改了，想要修改属性等要使用 MDGModifier 来创建。

###### DG

DG：Dependency Graph，依赖图中的节点是用来负责控制动画和维护网格构建历史的

DG和DAG混淆，依赖图中的节点是用来负责控制动画和维护网格构建历史的，而DAG中的节点则用于定义外形节点以及它的空间位置。

DAG节点之间可以形成父子关系（他们的关系非常稳定，不可以修改），而DG节点直接不可以，DG节点之间只是输入与输出的关系，而输入与输出是可以自定义的。

这么说有点不准确，DG里显示的一系列节点依赖，而DAG则是maya里的组织结构的基本模型，有向无环图。

DG插件的开发实质上是创建一些新的节点，将这些节点添加到依赖图中即可形成新的操作。Maya提供了十二种基本的类，派生自它们可以实现各种所需的功能。DG插件开发就是创建派生自这些基本类的新类，这些类都是以”MPx”开头，从文档Maya插件开发基础中可以知道这些类属于代理类，用于依赖图中构建各种节点。

基本的父类是”MPxNode”，派生自该类可以创建新的依赖节点(Dependency Node)，它是Maya中最基础的DG节点。其他的十一个类均是派生自”MPxNode”。

###### 代理类

maya里基本都是代理类，代理类通过构建一个代理类，将原先的容器多态化，从而可以通过代理类调用各种相似的类对象，并且可以调用其方法，而且将对应的内存管理也封闭在了代理类中，减轻后续的思考负担，但是代理类会引起在复制等操作的时候内存消耗加倍等情况，针对这个情况maya就有了各种句柄，也就是Mobject，用他们来操作，从而平衡了代理类的缺点.

#### 例程详解

所有例程都位于: MAYA201x\devkit\plug-ins中,有些我细看过,有些没有,但是大致功能就是这样的.

前期先看一些简单的,了解一下maya的编程模型是什么样的,各种常用的类,常用的函数什么的.

复杂的就后面再看了,根据例程的命名,基本都是渐进式的,功能一点点变复杂.

大致列出来了所有CMD类型的例程,通过这些例程基本涵盖了大部分之前mel或者python中的一些脚本命令.有些命令试一下就能看出来比mel或者python运行上要快非常多.

- helloWorldCmd 最基础的，教你认识世界
- helixCmd 创建一个螺旋形，教你怎么处理参数，怎么获取当前选择，以及创建曲线和曲线的数据结构
- helix2Cmd 在上一步的基础上，教你MPxCommand的完成结构
- helixQtCmd 教你如何把qt的界面融入进来并且建立一个螺旋线
- polyPrimitiveCmd 教你怎么创建自定义多边形，如何自定义mesh，如何分配shadinggroup，但是使用的是MEL而不是C++ API来做，这就很蠢
- animInfoCmd 将指定范围，帧间隔，相机，额外属性的动画信息导出为一个xml格式文件，同时接收ESC作为打断。这里可以学习一下如何规范化处理参数，读写本地文件，修改全局渲染，如何获取当前场景帧，如何创建一个进度条
- blindShortDataCmd 增加一个短整型的附加属性，如何建立一个属性，并添加到对象
- blindDoubleDataCmd 增加一个自定义数据结构：MPxData，如何建立一个自定义数据结构，这个数据结构在maya里无法直接修改，其本身还是一个数据结构。
- blindComplexDataCmd 增加一个自定义属性，类似于给一个DAG NODE增加了一个一个struct类型的属性
- closestPointCmd 寻找点到平面上最近的点，并在该点上生成一个球，可以学会如何计算矩阵，计算世界坐标，如何获取属性
- closestPointOnNurbsSurfaceCmd 寻找Nurbs表面上最近的点，但是我这里这个插件不能正常工作
- convertBumpCmd 将灰度高度图转化成maya用的高度图，如何做文件过滤，如何使用maya的图片类读取图片，图片类型转换
- convertEdgesToFacesCmd 将当前所选边可以连成的曲面都选择上，如何根据当前边寻找对应连接曲面
- convertVerticesToEdgesCmd 将当前所选点可以连成的边都选择上，如何根据当前点寻找对应连接边
- convertVerticesToFacesCmd 将当前所选点可以连成的曲面都选择上，如何根据当前点寻找对应连接曲面
- createClipCmd 创建一个动画片段 如何使用MFnCharacter，MFnAnimCurve，创建一个动画片段
- cvPosCmd 获取一个顶点的坐标，如何获取 transform 空间 MSpace::Space，
- cvExpandCmd 扩展选择返回对象的形式，如果选择多个CV点 表示是1-20这样的，使用扩展以后显示的就是1，2，3....20. 通过这个可以学会怎么用 MSelectionList
- dagPoseInfoCmd 这个可以输出骨骼的姿态信息到一个文件中，具体没细看.
- dagMessageCmd 增加一个回调函数,返回当前dag节点连接或者断开状态,学习如何建立一个回调函数,寻找父子节点上下游之类的东西.
- deletedMsgCmd 增加三个删除回调函数，在删除当前节点相关内容的时候进行回调
- findFileTexturesCmd 找到一个渲染组中的文件材质节点，教你如何寻找依赖节点，并且使用DG迭代器
- findTexturesPerPolygonCmd 找到每个多边形的材质
- iffInfoCmd 返回maya iff 文件信息，如何操作iff文件类型
- multiPlugInfoCmd 显示当前子插件命令信息
- nodeInfoCmd 返回一个节点的类型以及连接的属性信息，可以学会如何查找对应的一个节点的类型和属性
- particlePathsCmd 使用曲线勾出来所有粒子的运动路径，学会如何使用 ParticleIdHash，如何获取粒子位置信息
- motionPathCmd 实现一个路径动画功能
- nodeMessageCmd 注册一个 MNodeMessage 的回调函数
- intersectCmd 寻找聚光灯与mesh交叉的地方，或者说找到mesh上被聚光灯照亮的部分
- nodeCreatedCBCmd 任何一个节点被创建时调用一个mel
- fileIOMsgCmd 如何使用关于文件导入导出前的回调函数
- exportJointClusterDataCmd 导出骨骼集合信息
- exportSkinClusterDataCmd 导出皮肤集合信息
- flipUVCmd 快速翻转UV 如何使用 MPxPolyTweakUVCommand
- fluidInfoCmd 使用 MFnFluid 来获取到流体信息
- blastCmd 如何使用后台渲染API
- blast2Cmd 如何从VP2中捕获帧
- zoomCameraCmd 获取当前激活窗口，并且修改摄像机信息
- whatis 显示当前选择的对象相关信息
- volumeLightCmd 创建一个体积灯光，并且查询和设置其属性
- viewCaptureCmd 使用OpenGL来捕获3d视窗并且输出到一个ppm文件
- userMsgCmd 如何使用 MUserEventMessage
- undoRedoMsgCmd 如何监听撤销和重做的事件信息，如何使用 MEventMessage
- translateCmd 修改控制点的位置
- threadTestCmd 如何使用 MThreadPool 计算素数，如何使用maya多线程
- threadTestWithLocksCmd 带锁多线程
- testCameraSetCmd 如何使用 MFnCameraSet
- surfaceTwistCmd 扭曲mesh表面
- surfaceCreateCmd 创建表面
- splitUVCmd 拆分UV，并且处理对应poly的变形历史、扭曲等
- spiralAnimCurveCmd 控制对象螺旋运动
- scanDagCmd 扫描整个dag依赖节点
- sampleCmd 简化shadinggroups
- richMoveCmd 交互性工具，用于移动对象
- renderViewRenderCmd 如何使用 MRenderView 来渲染
- renderViewRenderRegionCmd 更新渲染范围
- renderViewInteractiveRenderCmd 交互性
- referenceQueryCmd 查询参考文件
- progressWindowCmd 如何使用 MProgressWindow
- getAttrAffectsCmd 查询节点所有属性影响和被影响的所有相关属性
- iffPixelCmd 返回 iff文件对应位置的rgb
- iffPpmCmd iff文件转成ppm格式文件
- instanceCallbackCmd 如何使用 MDagMessage 以及其回调
- instancerListCmd 如何使用 MFnInstancer 精灵贴片相关
- intersectOnNurbsSurfaceCmd nurbs的交叉面计算
- listLightLinksCmd 如何使用 MLightLinks 来查询灯光连接信息
- listPolyHolesCmd 如何使用 MFnMesh::getPolyHoles() 来获取mesh的hole信息
- listRichSelectionCmd 移动工具
- meshOpCmd mesh的一些高级操作
- motionTraceCmd 显示一个运动对象的运动曲线
- moveCurveCVsCmd 移动控制顶点到原点
- nodeIconCmd 给一个node icon图标
- particleSystemInfoCmd 通过 MFnParticleSystem 获取到粒子相关信息
- peltOverlapCmd 寻找重叠面
- pfxInfoCmd 通过 MFnPfxGeometry 获取 pfx 信息
- pickCmd 选择命令，符合条件的命名都被选中
- polyMessageCmd MPolyMessage 的回调

#### How to

> http://ewertb.mayasound.com/api/api.php

有一些国外的参考可以找到相关API如何调用,什么功能怎么实现

> https://forums.cgsociety.org/c/autodesk/maya-programming

cgsociety 可以提问,看看是否有大佬可以帮忙什么的

> https://stackoverflow.com/questions

stackoverflow 上也有一部分maya相关的提问什么的

> https://forum.highend3d.com/c/maya-help-forums

highend3d 也有maya板块,但是人比较少

## 总结

maya API 相关的资料也好,例程也好,相对来说领域细分的比较小,很多东西不好找,只能自己多看看多琢磨琢磨

## 参考

> https://blog.csdn.net/kfqcome/article/details/9151231
>
> https://www.cnblogs.com/lzm-cn/articles/9094617.html
>
> https://blog.csdn.net/lulongfei172006/article/details/53871133
>
> http://ewertb.mayasound.com/maya.php
>
> https://nccastaff.bournemouth.ac.uk/jmacey/RobTheBloke/www/research/maya/mfnmaterial.htm
>
> https://www.cnblogs.com/bubbler/p/5152228.html
>
> https://blog.csdn.net/efxer/article/details/12371529
>
> https://blog.csdn.net/huangzhipeng/article/details/5892320
>
> http://forums.cgsociety.org/t/create-primitives-with-the-api/1444485
>
> https://forums.cgsociety.org/t/list-environment-variables/1343217
