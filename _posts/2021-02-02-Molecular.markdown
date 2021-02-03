---
layout:     post
title:      "Molecular 处理自碰撞源码解读"
subtitle:   "blender，粒子"
date:       2021-02-02
author:     "elmagnifico"
header-img: "img/bg7.jpg"
catalog:    true
tags:
    - Algorithm
    - blender
---

## Foreword

由于我想自己处理粒子碰撞的问题，刚好看到了Molecular Script可以将blender中不能自碰撞的粒子模拟成自碰撞的效果，简单好用，刚好分析一下他的源码，看一下他是如何处理的



## 介绍

最初的源码来自于这里，不过已经太久不维护了，后来又被其他人捡起来继续维护了。

> https://github.com/Pyroevil/Blender-Molecular-Script

现在的维护，更新到支持最新的Blender

> https://github.com/scorpion81/Blender-Molecular-Script



粒子的效果可以看最初法的帖子，里面有很多

> https://blenderartists.org/t/moleculars-physics/521682

用粒子模拟布料

<iframe width="560" height="315" src="https://www.youtube.com/embed/_Q5dqTHw8SI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

模拟固态被劈开

<iframe width="560" height="315" src="https://www.youtube.com/embed/oHnY0wDFCtU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>



#### 用法

如何使用看这里，先用一次粒子做一次你想要的效果，然后再使能Molecular，选择上自碰撞等效果，用它再进行一次计算，他计算完以后会替换当前的粒子cache数据，并且会锁定当前的粒子属性，也就是你不能改了，除非你解除Molecular的绑定。

> https://www.bilibili.com/video/av78028057/



#### 缺点

- 精度低，调高以后计算时间爆炸
- 需要二次缓存，并且缓存后无法修改粒子，还需要重新计算（复杂效果迭代起来时间成本太高了）



## 原理分析

第一眼看过去，感觉就很熟悉，我也是用类似的方法，二次计算maya生成后的粒子轨迹，然后重新k帧。只不过他是在Blender中直接拿到你要做的粒子效果，然后重新计算后，再替换原始粒子的cache。它本身可以利用多核cpu提高效率，同时他也有重计算的步幅（精度），根据我实际观察，如果只是追求看上去可以，拿用它是够了，但是我追求的是物理上完美不碰撞的，所以我调高了他的精度，发现模拟后的效果并不行，当我把他精度调整到最后，我基本跑不动了。能跑动的程度，我看了一下效果，他确实是在做计算解碰撞的，只是一旦精度高了就非常慢，精度低了实际上碰撞还是经常发生的，跟maya比起来就弱爆了，maya解算快而且基本不可能发生碰撞的情况。



## Blender-Molecular-Script

![image-20210202150907020](https://i.loli.net/2021/02/02/SKl9WBg7sdDzh1n.png)

- molecular，是blender插件的部分
- sources，这个部分比较关键，主要用来模拟重计算都靠这里，他是用cython来写的，为了提高效率，最后导出成pyd来给molecular调用



core.pyx则是其中关键，主要是五个函数init，update，simulate，collide，solve_link



#### init

还有一些前置条件需要注意一下

首先是数据类型是在下面定义好的，然后对应的kdtree的创建和查询也是写好的，其中kdtree有个问题就是他使用的是最朴素的创建方式，既三维的数据只看某一个轴，来进行建树的，这样的得到的数据不够平衡，好处是由于只处理了一维数据，所以快。然后其中拿数据中位的时候直接用了一个快排，其实这样的话创建的时候就消耗了大量时间了。



```cython
cpdef init(importdata):
    # 前面主要是处理输入的参数
    global fps
    global substep
    global deltatime
    global parnum
    global parlist
    global parlistcopy
    global kdtree
    global psysnum
    global psys
    global cpunum
    # 这个links对应的就是role类型模拟，只是模拟粒子可以不用管
    global newlinks
    global totallinks
    global totaldeadlinks
    global deadlinks
    cdef int i = 0
    cdef int ii = 0
    cdef int profiling = 0
    newlinks = 0
    totallinks = 0
    totaldeadlinks = 0
    fps = float(importdata[0][0])
    substep = int(importdata[0][1])
    deltatime = (fps * (substep + 1))
    psysnum = importdata[0][2]
    parnum = importdata[0][3]
    cpunum = importdata[0][4]
    deadlinks = <int *>malloc(cpunum * cython.sizeof(int))
    print("  Number of cpu's used:", cpunum)
    # 粒子系统
    psys = <ParSys *>malloc(psysnum * cython.sizeof(ParSys))
    # 粒子表，包含所有粒子系统内的粒子
    parlist = <Particle *>malloc(parnum * cython.sizeof(Particle))
    # 这应该是个精简粒子的数据结构
    parlistcopy = <SParticle *>malloc(parnum * cython.sizeof(SParticle))
    cdef int jj = 0
    # 给每个粒子系统初始化
    for i in xrange(psysnum):
        psys[i].id = i
        psys[i].parnum = importdata[i + 1][0]
        psys[i].particles = <Particle *>malloc(psys[i].parnum * \
            cython.sizeof(Particle))
        psys[i].particles = &parlist[jj]
        # 把数据解析到粒子对象中
        for ii in xrange(psys[i].parnum):
            parlist[jj].id = jj
            parlist[jj].loc[0] = importdata[i + 1][1][(ii * 3)]
            parlist[jj].loc[1] = importdata[i + 1][1][(ii * 3) + 1]
            parlist[jj].loc[2] = importdata[i + 1][1][(ii * 3) + 2]
            parlist[jj].vel[0] = importdata[i + 1][2][(ii * 3)]
            parlist[jj].vel[1] = importdata[i + 1][2][(ii * 3) + 1]
            parlist[jj].vel[2] = importdata[i + 1][2][(ii * 3) + 2]
            parlist[jj].size = importdata[i + 1][3][ii]
            parlist[jj].mass = importdata[i + 1][4][ii]
            parlist[jj].state = importdata[i + 1][5][ii]
            psys[i].selfcollision_active = importdata[i + 1][6][0]
            psys[i].othercollision_active = importdata[i + 1][6][1]
            psys[i].collision_group = importdata[i + 1][6][2]
            psys[i].friction = importdata[i + 1][6][3]
            psys[i].collision_damp = importdata[i + 1][6][4]
            psys[i].links_active = importdata[i + 1][6][5]
            psys[i].link_length = importdata[i + 1][6][6]
            psys[i].link_max = importdata[i + 1][6][7]
            psys[i].link_tension = importdata[i + 1][6][8]
            psys[i].link_tensionrand = importdata[i + 1][6][9]
            psys[i].link_stiff = importdata[i + 1][6][10] * 0.5
            psys[i].link_stiffrand = importdata[i + 1][6][11]
            psys[i].link_stiffexp = importdata[i + 1][6][12]
            psys[i].link_damp = importdata[i + 1][6][13]
            psys[i].link_damprand = importdata[i + 1][6][14]
            psys[i].link_broken = importdata[i + 1][6][15]
            psys[i].link_brokenrand = importdata[i + 1][6][16]
            psys[i].link_estiff = importdata[i + 1][6][17] * 0.5
            psys[i].link_estiffrand = importdata[i + 1][6][18]
            psys[i].link_estiffexp = importdata[i + 1][6][19]
            psys[i].link_edamp = importdata[i + 1][6][20]
            psys[i].link_edamprand = importdata[i + 1][6][21]
            psys[i].link_ebroken = importdata[i + 1][6][22]
            psys[i].link_ebrokenrand = importdata[i + 1][6][23]
            psys[i].relink_group = importdata[i + 1][6][24]
            psys[i].relink_chance = importdata[i + 1][6][25]
            psys[i].relink_chancerand = importdata[i + 1][6][26]
            psys[i].relink_max = importdata[i + 1][6][27]
            psys[i].relink_tension = importdata[i + 1][6][28]
            psys[i].relink_tensionrand = importdata[i + 1][6][29]
            psys[i].relink_stiff = importdata[i + 1][6][30] * 0.5
            psys[i].relink_stiffexp = importdata[i + 1][6][31]
            psys[i].relink_stiffrand = importdata[i + 1][6][32]
            psys[i].relink_damp = importdata[i + 1][6][33]
            psys[i].relink_damprand = importdata[i + 1][6][34]
            psys[i].relink_broken = importdata[i + 1][6][35]
            psys[i].relink_brokenrand = importdata[i + 1][6][36]
            psys[i].relink_estiff = importdata[i + 1][6][37] * 0.5
            psys[i].relink_estiffexp = importdata[i + 1][6][38]
            psys[i].relink_estiffrand = importdata[i + 1][6][39]
            psys[i].relink_edamp = importdata[i + 1][6][40]
            psys[i].relink_edamprand = importdata[i + 1][6][41]
            psys[i].relink_ebroken = importdata[i + 1][6][42]
            psys[i].relink_ebrokenrand = importdata[i + 1][6][43]
            psys[i].link_friction = importdata[i + 1][6][44]
            psys[i].link_group = importdata[i + 1][6][45]
            psys[i].other_link_active = importdata[i + 1][6][46]

            # 初始化每个粒子的碰撞，链接情况
            parlist[jj].sys = &psys[i]
            parlist[jj].collided_with = <int *>malloc(1 * cython.sizeof(int))
            parlist[jj].collided_num = 0
            parlist[jj].links = <Links *>malloc(1 * cython.sizeof(Links))
            parlist[jj].links_num = 0
            parlist[jj].links_activnum = 0
            parlist[jj].link_with = <int *>malloc(1 * cython.sizeof(int))
            parlist[jj].link_withnum = 0
            # 这里强制写死了粒子的邻居最多就10个，也就是你很多很小的粒子可能会出现碰撞的情况
            parlist[jj].neighboursmax = 10
            parlist[jj].neighbours = <int *>malloc(parlist[jj].neighboursmax * \
                cython.sizeof(int))
            parlist[jj].neighboursnum = 0
            jj += 1

    jj = 0
    # 初始化KD树
    kdtree = <KDTree *>malloc(1 * cython.sizeof(KDTree))
    KDTree_create_nodes(kdtree, parnum)

    # 这里使用无GIL管理模式，然后切到多核进行赋值
    with nogil:
        for i in prange(
                        parnum,
                        schedule='dynamic',
                        chunksize=10,
                        num_threads=cpunum
                        ):
            parlistcopy[i].id = parlist[i].id
            parlistcopy[i].loc[0] = parlist[i].loc[0]
            parlistcopy[i].loc[1] = parlist[i].loc[1]
            parlistcopy[i].loc[2] = parlist[i].loc[2]

    KDTree_create_tree(kdtree, parlistcopy, 0, parnum - 1, 0, -1, 0, 1)

    # 快速创建KDT,存储粒子
    with nogil:
        for i in prange(
                        kdtree.thread_index,
                        schedule='dynamic',
                        chunksize=10,
                        num_threads=cpunum
                        ):
            KDTree_create_tree(
                kdtree,
                parlistcopy,
                kdtree.thread_start[i],
                kdtree.thread_end[i],
                kdtree.thread_name[i],
                kdtree.thread_parent[i],
                kdtree.thread_depth[i],
                0
            )

    # 这里主要是处理link类型粒子的关系，这里就需要用分类粒子形成链接
    with nogil:
        for i in prange(
                        parnum,
                        schedule='dynamic',
                        chunksize=10,
                        num_threads=cpunum
                        ):
            if parlist[i].sys.links_active == 1:
                KDTree_rnn_query(
                    kdtree,
                    &parlist[i],
                    parlist[i].loc,
                    parlist[i].sys.link_length
                )

    for i in xrange(parnum):
        create_link(parlist[i].id, parlist[i].sys.link_max)
        if parlist[i].neighboursnum > 1:
            # free(parlist[i].neighbours)
            parlist[i].neighboursnum = 0
    totallinks += newlinks
    print("  New links created: ", newlinks)
    return parnum
```



#### simulate

```cython
cpdef simulate(importdata):
    global kdtree
    global parlist
    global parlistcopy
    global parnum
    global psysnum
    global psys
    global cpunum
    global deltatime
    global newlinks
    global totallinks
    global totaldeadlinks
    global deadlinks

    cdef int i = 0
    cdef int ii = 0
    cdef int profiling = 0

    cdef float minX = INT_MAX
    cdef float minY = INT_MAX
    cdef float minZ = INT_MAX
    cdef float maxX = -INT_MAX
    cdef float maxY = -INT_MAX
    cdef float maxZ = -INT_MAX
    cdef float maxSize = -INT_MAX
    # 这是一个堆
    cdef Pool *parPool = <Pool *>malloc(1 * cython.sizeof(Pool))
    parPool.parity = <Parity *>malloc(2 * cython.sizeof(Parity))
    parPool[0].axis = -1
    parPool[0].offset = 0
    parPool[0].max = 0

    # cdef float *zeropoint = [0,0,0]
    newlinks = 0
    for i in xrange(cpunum):
        deadlinks[i] = 0
    if profiling == 1:
        print("-->start simulate")
        stime2 = clock()
        stime = clock()

    # 更新粒子数据
    update(importdata)

    if profiling == 1:
        print("-->update time", clock() - stime, "sec")
        stime = clock()

    # 更新粒子位置边界
    for i in xrange(parnum):
        parlistcopy[i].id = parlist[i].id
        parlistcopy[i].loc[0] = parlist[i].loc[0]
        # if parlist[i].loc[0] >= FLT_MAX or parlist[i].loc[0] <= -FLT_MAX :
            # print('ALERT! INF value in X')
        if parlist[i].loc[0] < minX:
            minX = parlist[i].loc[0]
        if parlist[i].loc[0] > maxX:
            maxX = parlist[i].loc[0]
        parlistcopy[i].loc[1] = parlist[i].loc[1]
        if parlist[i].loc[1] < minY:
            minY = parlist[i].loc[1]
        if parlist[i].loc[1] > maxY:
            maxY = parlist[i].loc[1]
        parlistcopy[i].loc[2] = parlist[i].loc[2]
        if parlist[i].loc[2] < minZ:
            minZ = parlist[i].loc[2]
        if parlist[i].loc[2] > maxZ:
            maxZ = parlist[i].loc[2]
        if parlist[i].sys.links_active == 1:
            if parlist[i].links_num > 0:
                for ii in xrange(parlist[i].links_num):
                    if parlist[i].links[ii].lenght > maxSize:
                        maxSize = parlist[i].links[ii].lenght
        if (parlist[i].size * 2) > maxSize:
            maxSize = (parlist[i].size * 2)

    # 看哪一个轴方向上的偏差最大
    if (maxX - minX) >= (maxY - minY) and (maxX - minX) >= (maxZ - minZ):
        parPool[0].axis = 0
        parPool[0].offset = 0 - minX
        parPool[0].max = maxX + parPool[0].offset

    if (maxY - minY) > (maxX - minX) and (maxY - minY) > (maxZ - minZ):
        parPool[0].axis = 1
        parPool[0].offset = 0 - minY
        parPool[0].max = maxY + parPool[0].offset

    if (maxZ - minZ) > (maxY - minY) and (maxZ - minZ) > (maxX - minX):
        parPool[0].axis = 2
        parPool[0].offset = 0 - minZ
        parPool[0].max = maxZ + parPool[0].offset       

    # 不知道这里限制的是什么数值，反正是个动态限制
    # 反正是个堆大小
    if (parPool[0].max / ( cpunum * 10 )) > maxSize:
        maxSize = (parPool[0].max / ( cpunum * 10 ))

    cdef int pair
    cdef int heaps
    # 这里是精度，和这个堆大小也有关系
    cdef float scale = 1 / ( maxSize * 2.1 )

    for pair in xrange(2):

        # 堆的初始化
        parPool[0].parity[pair].heap = \
            <Heap *>malloc((<int>(parPool[0].max * scale) + 1) * \
            cython.sizeof(Heap))

        for heaps in range(<int>(parPool[0].max * scale) + 1):
            parPool[0].parity[pair].heap[heaps].parnum = 0
            parPool[0].parity[pair].heap[heaps].maxalloc = 50

            parPool[0].parity[pair].heap[heaps].par = \
                <int *>malloc(parPool[0].parity[pair].heap[heaps].maxalloc * \
                cython.sizeof(int))

    for i in xrange(parnum):
        # 根据每个粒子的位置得到了他们所属的堆，并计数
        pair = <int>(((
            parlist[i].loc[parPool[0].axis] + parPool[0].offset) * scale) % 2
        )
        heaps = <int>((
            parlist[i].loc[parPool[0].axis] + parPool[0].offset) * scale
        )
        parPool[0].parity[pair].heap[heaps].parnum += 1

        # 堆满的处理
        if parPool[0].parity[pair].heap[heaps].parnum > \
                parPool[0].parity[pair].heap[heaps].maxalloc:

            # 扩大堆
            parPool[0].parity[pair].heap[heaps].maxalloc = \
                <int>(parPool[0].parity[pair].heap[heaps].maxalloc * 1.25)

            # 重新分配内存
            parPool[0].parity[pair].heap[heaps].par = \
                <int *>realloc(
                    parPool[0].parity[pair].heap[heaps].par,
                    (parPool[0].parity[pair].heap[heaps].maxalloc + 2 ) * \
                    cython.sizeof(int)
                )

        parPool[0].parity[pair].heap[heaps].par[
            (parPool[0].parity[pair].heap[heaps].parnum - 1)] = parlist[i].id

    if profiling == 1:
        print("-->copy data time", clock() - stime, "sec")
        stime = clock()

    # 初始化kd树
    KDTree_create_tree(kdtree, parlistcopy, 0, parnum - 1, 0, -1, 0, 1)

    # 重新构建KD树
    with nogil:
        for i in prange(
                        kdtree.thread_index,
                        schedule='dynamic',
                        chunksize=10,
                        num_threads=cpunum
                        ):
            KDTree_create_tree(
                kdtree,
                parlistcopy,
                kdtree.thread_start[i],
                kdtree.thread_end[i],
                kdtree.thread_name[i],
                kdtree.thread_parent[i],
                kdtree.thread_depth[i],
                0
            )

    if profiling == 1:
        print("-->create tree time", clock() - stime,"sec")
        stime = clock()

    with nogil:
        for i in prange(
                        parnum,
                        schedule='dynamic',
                        chunksize=10,
                        num_threads=cpunum
                        ):
            KDTree_rnn_query(
                kdtree,
                &parlist[i],
                parlist[i].loc,
                parlist[i].size * 2
            )

    if profiling == 1:
        print("-->neighbours time", clock() - stime, "sec")
        stime = clock()

    with nogil:
        for pair in xrange(2):
            for heaps in prange(
                                <int>(parPool[0].max * scale) + 1,
                                schedule='dynamic',
                                chunksize=1,
                                num_threads=cpunum
                                ):
                for i in xrange(parPool[0].parity[pair].heap[heaps].parnum):

                    # 计算碰撞
                    collide(
                        &parlist[parPool[0].parity[pair].heap[heaps].par[i]]
                    )

                    # 求解链接
                    solve_link(
                        &parlist[parPool[0].parity[pair].heap[heaps].par[i]]
                    )

                    if parlist[
                        parPool[0].parity[pair].heap[heaps].par[i]
                    ].neighboursnum > 1:

                        # free(parlist[i].neighbours)

                        parlist[
                            parPool[0].parity[pair].heap[heaps].par[i]
                        ].neighboursnum = 0


    if profiling == 1:
        print("-->collide/solve link time", clock() - stime, "sec")
        stime = clock()

    exportdata = []
    parloc = []
    parvel = []
    parloctmp = []
    parveltmp = []

    for i in xrange(psysnum):
        for ii in xrange(psys[i].parnum):
            parloctmp.append(psys[i].particles[ii].loc[0])
            parloctmp.append(psys[i].particles[ii].loc[1])
            parloctmp.append(psys[i].particles[ii].loc[2])
            parveltmp.append(psys[i].particles[ii].vel[0])
            parveltmp.append(psys[i].particles[ii].vel[1])
            parveltmp.append(psys[i].particles[ii].vel[2])
        parloc.append(parloctmp)
        parvel.append(parveltmp)
        parloctmp = []
        parveltmp = [] 

    totallinks += newlinks
    pydeadlinks = 0
    for i in xrange(cpunum):
        pydeadlinks += deadlinks[i]
    totaldeadlinks += pydeadlinks

    # 编排给出的数据
    exportdata = [
        parloc,
        parvel,
        newlinks,
        pydeadlinks,
        totallinks,
        totaldeadlinks
    ]

    # 模拟完一帧，释放所有内存
    for pair in xrange(2):
        for heaps in range(<int>(parPool[0].max * scale) + 1):
            parPool[0].parity[pair].heap[heaps].parnum = 0
            free(parPool[0].parity[pair].heap[heaps].par)
        free(parPool[0].parity[pair].heap)
    free(parPool[0].parity)
    free(parPool)

    if profiling == 1:
        print("-->export time", clock() - stime, "sec")
        print("-->all process time", clock() - stime2, "sec")
    return exportdata
```

输入的是当前粒子所在位置等信息，输出的这一时间单位结束以后重新计算得到的位置信息。



#### update

跳过，主要是更新数据



#### collide

碰撞这里比较关键，主要是靠这里来解决碰撞的

```cython
cdef void collide(Particle *par)nogil:
    global kdtree
    global deltatime
    global deadlinks
    cdef int *neighbours = NULL
    cdef Particle *par2 = NULL
    cdef float stiff = 0
    cdef float target = 0
    cdef float sqtarget = 0
    cdef float lenghtx = 0
    cdef float lenghty = 0
    cdef float lenghtz = 0
    cdef float sqlenght = 0
    cdef float lenght = 0
    cdef float invlenght = 0
    cdef float factor = 0
    cdef float ratio1 = 0
    cdef float ratio2 = 0
    cdef float factor1 = 0
    cdef float factor2 = 0
    cdef float *col_normal1 = [0, 0, 0]
    cdef float *col_normal2 = [0, 0, 0]
    cdef float *ypar_vel = [0, 0, 0]
    cdef float *xpar_vel = [0, 0, 0]
    cdef float *yi_vel = [0, 0, 0]
    cdef float *xi_vel = [0, 0, 0]
    cdef float friction1 = 0
    cdef float friction2 = 0
    cdef float damping1 = 0
    cdef float damping2 = 0
    cdef int i = 0
    cdef int check = 0
    cdef float Ua = 0 
    cdef float Ub = 0
    cdef float Cr = 0
    cdef float Ma = 0
    cdef float Mb = 0
    cdef float Va = 0
    cdef float Vb = 0
    cdef float force1 = 0
    cdef float force2 = 0
    cdef float mathtmp = 0

    if  par.state >= 2:
        return
    if par.sys.selfcollision_active == False \
            and par.sys.othercollision_active == False:
        return

    # neighbours = KDTree_rnn_query(kdtree, par.loc, par.size * 2)
    neighbours = par.neighbours

    # 只从近邻对象中寻找碰撞体
    # for i in xrange(kdtree.num_result):
    for i in xrange(par.neighboursnum):
        check = 0
        if parlist[i].id == -1:
            check += 1
        par2 = &parlist[neighbours[i]]
        if par.id == par2.id:
            check += 10
        if arraysearch(par2.id, par.collided_with, par.collided_num) == -1:
            # 判定是否允许与其他粒子系统进行碰撞
        # if par2 not in par.collided_with:
            if par2.sys.id != par.sys.id :
                if par2.sys.othercollision_active == False or \
                        par.sys.othercollision_active == False:
                    check += 100

            if par2.sys.collision_group != par.sys.collision_group:
                check += 1000

            if par2.sys.id == par.sys.id and \
                    par.sys.selfcollision_active == False:
                check += 10000

            stiff = deltatime
            target = (par.size + par2.size) * 0.999
            # 这里其实是直接求出来饿了两个球挨着的时候的距离平方，为了计算取小一点
            sqtarget = target * target

            if check == 0 and par2.state <= 1 and \
                    arraysearch(
                        par2.id, par.link_with, par.link_withnum
                    ) == -1 and \
                    arraysearch(
                        par.id, par2.link_with, par2.link_withnum
                    ) == -1:

            # if par.state <= 1 and par2.state <= 1 and \
            #       par2 not in par.link_with and par not in par2.link_with:
                lenghtx = par.loc[0] - par2.loc[0]
                lenghty = par.loc[1] - par2.loc[1]
                lenghtz = par.loc[2] - par2.loc[2]
                sqlenght  = square_dist(par.loc, par2.loc, 3)
                # sqlenght 这还拼错了
                # 这里是算出来是否两个粒子碰撞了
                if sqlenght != 0 and sqlenght < sqtarget:
                    # 距离的平方取反
                    lenght = sqlenght ** 0.5
                    invlenght = 1 / lenght
                    # 距离差*距离的平方取反
                    factor = (lenght - target) * invlenght
                    # 质量比
                    ratio1 = (par2.mass / (par.mass + par2.mass))
                    ratio2 = 1 - ratio1
                    
                    mathtmp = factor * stiff
                    # 不知道怎么就算出来两个力
                    force1 = ratio1 * mathtmp
                    force2 = ratio2 * mathtmp
                    # 然后把这个力分别对两个粒子作用，一个是反向，一个是正向，加速二者错开
                    par.vel[0] -= lenghtx * force1
                    par.vel[1] -= lenghty * force1
                    par.vel[2] -= lenghtz * force1
                    par2.vel[0] += lenghtx * force2
                    par2.vel[1] += lenghty * force2
                    par2.vel[2] += lenghtz * force2

                    # 这里是把碰撞分量进行归一化？
                    col_normal1[0] = (par2.loc[0] - par.loc[0]) * invlenght
                    col_normal1[1] = (par2.loc[1] - par.loc[1]) * invlenght
                    col_normal1[2] = (par2.loc[2] - par.loc[2]) * invlenght
                    col_normal2[0] = col_normal1[0] * -1
                    col_normal2[1] = col_normal1[1] * -1
                    col_normal2[2] = col_normal1[2] * -1

                    factor1 = dot_product(par.vel,col_normal1)

                    ypar_vel[0] = factor1 * col_normal1[0]
                    ypar_vel[1] = factor1 * col_normal1[1]
                    ypar_vel[2] = factor1 * col_normal1[2]
                    xpar_vel[0] = par.vel[0] - ypar_vel[0]
                    xpar_vel[1] = par.vel[1] - ypar_vel[1]
                    xpar_vel[2] = par.vel[2] - ypar_vel[2]

                    factor2 = dot_product(par2.vel, col_normal2)

                    yi_vel[0] = factor2 * col_normal2[0]
                    yi_vel[1] = factor2 * col_normal2[1]
                    yi_vel[2] = factor2 * col_normal2[2]
                    xi_vel[0] = par2.vel[0] - yi_vel[0]
                    xi_vel[1] = par2.vel[1] - yi_vel[1]
                    xi_vel[2] = par2.vel[2] - yi_vel[2]

                    friction1 = 1 - (((
                        par.sys.friction + par2.sys.friction) * 0.5) * ratio1
                    )

                    friction2 = 1 - (((
                        par.sys.friction + par2.sys.friction) * 0.5) * ratio2
                    )

                    damping1 = 1 - (((
                        par.sys.collision_damp + par2.sys.collision_damp
                    ) * 0.5) * ratio1)

                    damping2 = 1 - (((
                        par.sys.collision_damp + par2.sys.collision_damp
                    ) * 0.5) * ratio2)

                    par.vel[0] = ((ypar_vel[0] * damping1) + (yi_vel[0] * \
                        (1 - damping1))) + ((xpar_vel[0] * friction1) + \
                        ( xi_vel[0] * ( 1 - friction1)))

                    par.vel[1] = ((ypar_vel[1] * damping1) + (yi_vel[1] * \
                        (1 - damping1))) + ((xpar_vel[1] * friction1) + \
                        ( xi_vel[1] * ( 1 - friction1)))

                    par.vel[2] = ((ypar_vel[2] * damping1) + (yi_vel[2] * \
                        (1 - damping1))) + ((xpar_vel[2] * friction1) + \
                        ( xi_vel[2] * ( 1 - friction1)))

                    par2.vel[0] = ((yi_vel[0] * damping2) + (ypar_vel[0] * \
                        (1 - damping2))) + ((xi_vel[0] * friction2) + \
                        ( xpar_vel[0] * ( 1 - friction2)))

                    par2.vel[1] = ((yi_vel[1] * damping2) + (ypar_vel[1] * \
                        (1 - damping2))) + ((xi_vel[1] * friction2) + \
                        ( xpar_vel[1] * ( 1 - friction2)))

                    par2.vel[2] = ((yi_vel[2] * damping2) + (ypar_vel[2] * \
                        (1 - damping2))) + ((xi_vel[2] * friction2) + \
                        ( xpar_vel[2] * ( 1 - friction2)))

                    par2.collided_with[par2.collided_num] = par.id
                    par2.collided_num += 1
                    par2.collided_with = <int *>realloc(
                        par2.collided_with,
                        (par2.collided_num + 1) * cython.sizeof(int)
                    )

                    if ((par.sys.relink_chance + par2.sys.relink_chance) / 2) \
                            > 0:

                        create_link(par.id,par.sys.link_max * 2, par2.id)
```

这里比较复杂，实际上没看明白，总体来说就是重新解算粒子，然后对于已经发生碰撞的粒子进行修改，偏移他们的速度矢量，来规避碰撞，但是实际上粒子一多碰撞就十分复杂了，并不能完全做到刚体不碰撞。



#### solve_link

这个结算用来处理绳模型

```cython
cdef void solve_link(Particle *par)nogil:
    global parlist
    global deltatime
    global deadlinks
    cdef int i = 0
    cdef float stiff = 0
    cdef float damping = 0
    cdef float timestep = 0
    cdef float exp = 0
    cdef Particle *par1 = NULL
    cdef Particle *par2 = NULL
    cdef float *Loc1 = [0, 0, 0]
    cdef float *Loc2 = [0, 0, 0]
    cdef float *V1 = [0, 0, 0]
    cdef float *V2 = [0, 0, 0]
    cdef float LengthX = 0
    cdef float LengthY = 0
    cdef float LengthZ = 0
    cdef float Length = 0
    cdef float Vx = 0
    cdef float Vy = 0
    cdef float Vz = 0
    cdef float V = 0
    cdef float ForceSpring = 0
    cdef float ForceDamper = 0
    cdef float ForceX = 0
    cdef float ForceY = 0
    cdef float ForceZ = 0
    cdef float *Force1 = [0, 0, 0]
    cdef float *Force2 = [0, 0, 0]
    cdef float ratio1 = 0
    cdef float ratio2 = 0
    cdef int parsearch = 0
    cdef int par2search = 0
    cdef float *normal1 = [0, 0, 0]
    cdef float *normal2 = [0, 0, 0]
    cdef float factor1 = 0
    cdef float factor2 = 0
    cdef float friction1 = 0
    cdef float friction2 = 0
    cdef float *ypar1_vel = [0, 0, 0]
    cdef float *xpar1_vel = [0, 0, 0]
    cdef float *ypar2_vel = [0, 0, 0]
    cdef float *xpar2_vel = [0, 0, 0]
    # broken_links = []
    if  par.state >= 2:
        return
    for i in xrange(par.links_num):
        if par.links[i].start != -1:
            par1 = &parlist[par.links[i].start]
            par2 = &parlist[par.links[i].end]
            Loc1[0] = par1.loc[0]
            Loc1[1] = par1.loc[1]
            Loc1[2] = par1.loc[2]
            Loc2[0] = par2.loc[0]
            Loc2[1] = par2.loc[1]
            Loc2[2] = par2.loc[2]
            V1[0] = par1.vel[0]
            V1[1] = par1.vel[1]
            V1[2] = par1.vel[2]
            V2[0] = par2.vel[0]
            V2[1] = par2.vel[1]
            V2[2] = par2.vel[2]
            LengthX = Loc2[0] - Loc1[0]
            LengthY = Loc2[1] - Loc1[1]
            LengthZ = Loc2[2] - Loc1[2]
            Length = (LengthX ** 2 + LengthY ** 2 + LengthZ ** 2) ** (0.5)
            if par.links[i].lenght != Length and Length != 0:
                if par.links[i].lenght > Length:
                    stiff = par.links[i].stiffness * deltatime
                    damping = par.links[i].damping
                    exp = par.links[i].exponent
                if par.links[i].lenght < Length:
                    stiff = par.links[i].estiffness * deltatime
                    damping = par.links[i].edamping
                    exp = par.links[i].eexponent
                Vx = V2[0] - V1[0]
                Vy = V2[1] - V1[1]
                Vz = V2[2] - V1[2]
                V = (Vx * LengthX + Vy * LengthY + Vz * LengthZ) / Length
                ForceSpring = ((Length - par.links[i].lenght) ** (exp)) * stiff
                ForceDamper = damping * V
                ForceX = (ForceSpring + ForceDamper) * LengthX / Length
                ForceY = (ForceSpring + ForceDamper) * LengthY / Length
                ForceZ = (ForceSpring + ForceDamper) * LengthZ / Length
                Force1[0] = ForceX
                Force1[1] = ForceY
                Force1[2] = ForceZ
                Force2[0] = -ForceX
                Force2[1] = -ForceY
                Force2[2] = -ForceZ
                ratio1 = (par2.mass/(par1.mass + par2.mass))
                ratio2 = (par1.mass/(par1.mass + par2.mass))

                if par1.state == 3: #dead particle, correct velocity ratio of alive partner
                    ratio1 = 0
                    ratio2 = 1
                elif par2.state == 3:
                    ratio1 = 1
                    ratio2 = 0

                par1.vel[0] += Force1[0] * ratio1
                par1.vel[1] += Force1[1] * ratio1
                par1.vel[2] += Force1[2] * ratio1
                par2.vel[0] += Force2[0] * ratio2
                par2.vel[1] += Force2[1] * ratio2
                par2.vel[2] += Force2[2] * ratio2

                normal1[0] = LengthX / Length
                normal1[1] = LengthY / Length
                normal1[2] = LengthZ / Length
                normal2[0] = normal1[0] * -1
                normal2[1] = normal1[1] * -1
                normal2[2] = normal1[2] * -1

                factor1 = dot_product(par1.vel, normal1)

                ypar1_vel[0] = factor1 * normal1[0]
                ypar1_vel[1] = factor1 * normal1[1]
                ypar1_vel[2] = factor1 * normal1[2]
                xpar1_vel[0] = par1.vel[0] - ypar1_vel[0]
                xpar1_vel[1] = par1.vel[1] - ypar1_vel[1]
                xpar1_vel[2] = par1.vel[2] - ypar1_vel[2]

                factor2 = dot_product(par2.vel, normal2)

                ypar2_vel[0] = factor2 * normal2[0]
                ypar2_vel[1] = factor2 * normal2[1]
                ypar2_vel[2] = factor2 * normal2[2]
                xpar2_vel[0] = par2.vel[0] - ypar2_vel[0]
                xpar2_vel[1] = par2.vel[1] - ypar2_vel[1]
                xpar2_vel[2] = par2.vel[2] - ypar2_vel[2]

                friction1 = 1 - ((par.links[i].friction) * ratio1)
                friction2 = 1 - ((par.links[i].friction) * ratio2)

                par1.vel[0] = ypar1_vel[0] + ((xpar1_vel[0] * friction1) + \
                    (xpar2_vel[0] * ( 1 - friction1)))

                par1.vel[1] = ypar1_vel[1] + ((xpar1_vel[1] * friction1) + \
                    (xpar2_vel[1] * ( 1 - friction1)))

                par1.vel[2] = ypar1_vel[2] + ((xpar1_vel[2] * friction1) + \
                    (xpar2_vel[2] * ( 1 - friction1)))

                par2.vel[0] = ypar2_vel[0] + ((xpar2_vel[0] * friction2) + \
                    (xpar1_vel[0] * ( 1 - friction2)))

                par2.vel[1] = ypar2_vel[1] + ((xpar2_vel[1] * friction2) + \
                    (xpar1_vel[1] * ( 1 - friction2)))

                par2.vel[2] = ypar2_vel[2] + ((xpar2_vel[2] * friction2) + \
                    (xpar1_vel[2] * ( 1 - friction2)))

                if Length > (par.links[i].lenght * (1 + par.links[i].ebroken)) \
                or Length < (par.links[i].lenght  * (1 - par.links[i].broken)):

                    par.links[i].start = -1
                    par.links_activnum -= 1
                    deadlinks[threadid()] += 1

                    parsearch = arraysearch(
                        par2.id,
                        par.link_with,
                        par.link_withnum
                    )

                    if parsearch != -1:
                        par.link_with[parsearch] = -1

                    par2search = arraysearch(
                        par.id,
                        par2.link_with,
                        par2.link_withnum
                    )

                    if par2search != -1:
                        par2.link_with[par2search] = -1
```



## GIL

- C-Python或者CPython，指C实现的Python虚拟机的基础API。最通用的Python就是是基于C实现的，它的底层API称为C-Python API，所有Python代码的最终变成这些API以及数据结构的调用，才有了Python世界的精彩；

- Cython，专门用来写在Python里面import用的扩展库。实际上Cython的语法基本上跟Python一致，而Cython有专门的“编译器”先将 Cython代码转变成C（自动加入了一大堆的C-Python API），然后使用C编译器编译出最终的Python可调用的模块。

- GIL：Global Interpreter Lock，是Python虚拟机的多线程机制的核心机制，翻译为：全局解释器锁。其实Python线程是操作系统级别的线程，在不同平台有不同的底层实现（如win下就用win32_thread, posix下就用pthread等），Python解释器为了使所有对象的操作是线程安全的，使用了一个全局锁（GIL）来同步所有的线程，所以造成“一个时刻只有一个Python线程运行”的伪线程假象。GIL是个颗粒度很大的锁，它的实现跟性能问题多年来也引起过争议，但到今天它还是经受起了考验，即使它让Python在多核平台下不能发挥CPU的全部性能

GIL的作用很简单，任何一个线程除非获得锁，否则都在睡眠，而如果获得锁的线程一刻不释放锁，别的线程就永远睡眠下去。对于纯Python线程，这个问题不大，Python代码会通过解释器实时转换成微指令，而解释器给他们算着，每个线程执行了一定的指令数后就要把机会让给别的线程。这个过程中操作系统的调度作用比较微妙，不管操作系统怎么调度，即使把有锁线程挂起到后台，尝试唤醒没锁的，解释器也不给他任何执行机会，所以Python对象很安全。

一般来说，做纯Python的编程不需要考虑到GIL，它们是不同层面的东西，但是模块级别的C-Python、Cython等C层面的代码，跟Python虚拟机是平起平坐的，所以GIL很可能需要考虑，特别那些代码涉及IO阻塞、长时间运算、休眠等情况的时候（否则整个Python都在等这个耗时操作的返回，因为他们没获得锁，急也没办法）

```
简单说就是非阻塞运行，这种状态下是脱离python解释器控制的，是无锁化的
with nogil:

这种方式就是有锁运行，无锁的情况下只能等
with gil:
```



## Summary

Molecular的代码没有注释，也没解释用了什么算法，但是呢总体上说还是不行，这也是大概为什么7年前就放弃了这个项目，后来有人接手也只是维护接口而已了



## Quote

> https://github.com/scorpion81/Blender-Molecular-Script
>
> https://www.bilibili.com/video/av78028057/
>
> https://www.oschina.net/question/54100_39044
>
> https://zhuanlan.zhihu.com/p/67013657
