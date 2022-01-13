---
layout:     post
title:      "暗黑2重置版相关软件与源码仓库"
subtitle:   "Diablo 2 Resurrected,Github"
date:       2022-01-10
update:     2022-01-10
author:     "elmagnifico"
header-img: "img/bg1.jpg"
catalog:    true
tags:
    - Game
    - D2R
---

## Forward

记录一些我看到非常有意思的仓库，可能星很少，可能无人问津，但是很有意思



## MOD

#### CascLib

> https://github.com/ladislav-zezula/CascLib
>
> http://www.zezula.net/en/casc/main.html

可能看名字不知道这是干啥的，其实游戏的解包软件核心就是这个CascLib，所以一些提取游戏文件或者是mod修改，都是可以通过这个仓库完成的。



#### d2r-loot-filter

> https://github.com/AlexisEvo/d2r-loot-filter

这就是我最初看到的D2R物品过滤的仓库了，现在发展的比这个强大多了。



#### ModdingDiablo2Resurrected

> https://github.com/HighTechLowIQ/ModdingDiablo2Resurrected

这里是教你如何修改mpq内的游戏文件来做mod，教程又更新了许多



#### D2RModding-StrEdit

> https://github.com/eezstreet/D2RModding-StrEdit

其实就是json文件修改器，只是专门给小白用的而已



#### D2RModMaker

> https://github.com/dschu012/D2RModMaker

其实应该不叫ModMaker，而是D2RLikeMaker，本质上就是修改D2R变成另外一个游戏，而他的前身则是老版D2，你完全可以创建一个自己喜欢的风格的游戏。当然由于参与人比较少，所以还处于很前期的阶段

> https://github.com/tlentz/d2modmaker





## Map

#### MapAssist

> https://github.com/OneXDeveloper/MapAssist

大名鼎鼎的MH了，目前应该算是更新最快，参与人数最多的仓库，一直走在最前面。



#### d2mapapi

> https://github.com/jcageman/d2mapapi

这个主要是用来支持上面的地图实现的，不过好像现在有人提供了web地图服务，所以不需要老版客户端也行了。



#### D2RMH

> https://github.com/soarqin/D2RMH

核心全部来自于上面的MapAssist，但是在交互等方面走的快一点，也更符合中国人的游戏习惯。



#### d2r-drop-checker

> https://github.com/erohindev/d2r-drop-checker

本质上还是用的MapAssist那一套东西，但是呢，他把地图取消了，只保留物品掉过的过滤。安全程度上其实和地图一样的，只是很多人很介意开图，所以单独的物品过滤可能更适合他们吧。但是总感觉有点自欺欺人或者50步笑百步的感觉。



## 多开

#### D2RMIM

> https://github.com/Farmith/D2RMIM

游戏多开工具，简单好用，功能非常强大，甚至还有部分自动化的功能。比某些垃圾不开源的多开工具强多了。推荐使用



#### d2rmcs

> https://github.com/moonchant12/d2rmcs

这个仓库是拿来同账号多开的，上面的是多账号多开，其实他可能傻了，完全可以通过复制一个exe完成，没必要多copy一整个游戏文件。



#### D2RML

> https://github.com/Sunblood/D2RML

这个多开流传比较广，但是它本身不支持带地图多开，所以会导致地图无法使用。

同时他使用的是AutoIt，生成的exe是已经编译后的，而广为流程的还是被人改过的，所以有点危险，不推荐使用。



## BOT



#### botty

> https://github.com/aeon0/botty

简单说就是一个机器人，不过他要靠识图、取色等操作来完成一些关键操作，所以还是有点傻。大部分操作还是依赖于模拟鼠键和ocr，还没上升到内存挂那种级别。

不过由于参与的人非常多，所以也有一些现成的脚本可以用了。



#### d2bs

> https://github.com/noah-/d2bs

这个bot非常有名了，给出了很多数据接口的定义。其实我后来发现MapAssit的一些类型定义可能也是从这些地方出找出来，然后去新版客户端里验证的，所以他们的数据结构很像。



#### diablo2

> https://github.com/blacha/diablo2

这个仓库原本也是D2的，后来D2R来了以后就可以生成D2R地图了，不过本质上还是个D2的包探嗅器，而且是基于linux，windows这边不是很好用



#### Diablo II Reverse(d) Engine

> https://github.com/dorianprill/d2re

这个其实不算D2R的，他是D2的，他是想实现一个脱机bot，现在只是一个D2的包探嗅器



## 其他

#### D2RChar

> https://github.com/IceFox99/D2RChar

hhhh，冰狐（冰蛙是你什么人）的角色培养表，其实我也有一个。



#### d2r-chicken-bot

> https://github.com/GitMyCode/d2r-chicken-bot

虽然叫小鸡机器人，但是实际上是生命守护机器人，他会预估下一次受到攻击是否有可能突破血线，如果有可能的话，就会自动断开连接，退出游戏。不过本质上还是模拟鼠键、外加断开游戏的连接，确保人物不会死亡。HC可能比较喜欢



#### Inventory Viewer

> https://github.com/poparazvandragos/D2R

简单说他通过图像采集，记录了整个人物装备、佣兵装备以及仓库内容，并且会自动生成一个web页面，同时页面里面可以点选查看各个物品的属性和位置，非常有意思。当然实现就有点蠢了，其实是好多张图片替换而已。

我接下来就想做一个库存记录的软件，这个软件实现的稍微有点傻，但是有意思。

![image-20220110160803857.png](https://s2.loli.net/2022/01/10/ZSicarQYKJn3yX9.png)



#### d2r-api-GraphQL

> https://github.com/micheljung/d2r-api

额，竟然有人把游戏的物品等等查询接口转成了GraphQL，一般人用不上，而且这些信息本身也能直接通过解包以后json实例化拿到。



#### D2RTools

> https://github.com/VideoGameRoulette/D2RTools

kdc的国外常用工具，平时也能用，不过有点落伍了。之前很多人修改他的这个开车。当然还有一些其他人的仓库实现类似功能，就不一一举例了，都差不多，而且也不太完备。



#### gomule-d2r

> https://github.com/pairofdocs/gomule-d2r

简单说是给单机用的仓库转移或者说词缀修改器，还有一些其他功能，什么掉落概率啊，统计啊，甚至可以作为一个Build的展示用的，本身是D2的一个软件，现在也支持D2R了



## Summary

翻了一次github，记录一下。



## Quote

> https://www.ericcarmichael.com/my-diablo-2-botting-phase.html
>
> http://www.360doc.com/content/21/0920/16/76976141_996391312.shtml
>
> https://www.ppxclub.com/home.php?mod=space&uid=648181&do=blog&id=39010
