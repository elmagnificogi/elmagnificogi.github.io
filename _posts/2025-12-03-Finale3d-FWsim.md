---
layout:     post
title:      "Finale 3D与FWsim 烟花设计软件"
subtitle:   "灯光设计、舞美设计、烟花模拟"
date:       2025-12-04
update:     2025-12-04
author:     "elmagnifico"
header-img: "img/y5.jpg"
catalog:    true
tobecontinued: false
tags:
    - Fireworks
    - SFX
---

## Foreword

体验一下目前烟花领域设计软件：Finale 3D 和 FWsim，他们算是类似 SFX 的软件，以前有体验过一些灯光类的软件，里面多少内置了一点点烟花效果，但是不专业。

现在也来体验一下，看看专业的烟花设计软件发展到什么程度了



## Finale 3D

![image-20251203162643547](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203162643753.png)

> https://finale3d.com/

3D模拟烟花效果，所见即所得

- 支持3D模型导入
- 支持地图导入
- 支持音频时间码，同步时间
- 支持自定义烟花效果模型
- 内置烟花库

![image-20251203163821923](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203163821960.png)

看起来价格也不是很贵



![image-20251203162511847](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203162511886.png)

注册激活以后是不能保存和导出的，但是已经够用了



![image-20251203162719546](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203162719570.png)

导入格式支持的是CSV，只要有一个别人做好的，这种明文就很容易解析适配



烟花显示还是比较细的，比如烟花的升空时间，爆炸点，爆炸以后的持续点亮时间段，都很清晰地在时间轴上显示

![image-20251203163409408](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203163409436.png)



Pro版本支持无人机灯光秀的显示

![image-20251203163940342](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203163940366.png)

VVIZ是Verge无人机的格式



![image-20251203173125895](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203173125927.png)

实际设置的每个烟花，类似关键帧，在编辑器中会一个个显示，可以批量修改或者查看

由于烟花释放的位置基本是固定的，同时端口也是固定，所以一般导出脚本以后燃放位置和分线盒、端口能匹配上，下面的烟花控制台就能识别读取。

但是这样的烟花模拟，不能同时模拟灯光的效果，也不能模拟移动的烟花效果。

虽然可以把移动烟花释放端口的以关键帧的形式导入其中，但还是有点别扭



以前国内也有自己的烟花设计软件，不过没有可视化效果，只能算是个编排软件，看不到实际效果是什么样的

现在基本都是在用Finale 3D，不过网上相关教程什么的比较少



## FWsim

> https://www.FWsim.com/

![image-20251203174042365](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203174042403.png)

FWsim 价格就比较亲民一些，一些想设计来玩的玩家也能买，也能用。基础功能相对而言更多一些。

FWsim 是 .NET 技术的底子

![image-20251203174349593](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203174350200.png)

FWsim 的体验确实更好一些，安装完立马就有一个完整例子给你演示

![image-20251203174447114](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203174447155.png)

进度条上关于每个部分的说明也非常清楚，缩放比例、易用性确实更好一些

模拟场景也是类似游戏，可以直接 WASD 在里面行走，调整角度等等

![image-20251203174636394](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203174636529.png)

烟花库也更明显，悬停也有动态演示效果

不过也有一个比较难用的地方

![image-20251203175152050](https://img.elmagnifico.tech/static/upload/elmagnifico/20251203175152196.png)

FWsim 中烟花的点位，他是需要人工定义的，每个定义以后，可以在 3D 空间中直接拖拽位置，然后通过属性修改他的位置。他不能在 3D 空间中框选，只能点选，批量移动也不行，这个地方比 Finale 3D 难用多了



## Summary

还行，但是要和灯光等软件做融合的时候又咋办呢？

3D 空间内的东西要能融合到一起才能比较好地看出来效果，但是行业内的整合能力似乎还不足以把二者全都合并在一起，特别是灯光设计比烟花更复杂一些，持续时间更长，动态也更强一些。
