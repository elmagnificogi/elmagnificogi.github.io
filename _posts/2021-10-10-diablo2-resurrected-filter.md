---
layout:     post
title:      "暗黑2重置版物品过滤"
subtitle:   "diablo2 resurrected loot filter"
date:       2021-10-10
update:     2022-05-05
author:     "elmagnifico"
header-img: "img/baidu.jpg"
catalog:    true
tags:
    - Game
    - Diablo
---

## Foreword

暗黑2重置了，还记得上次玩还是小时候，那会啥都不懂，我老爹用个刺客，勉勉强强通过了普通5章，记得通过的时候刺客都40多级了。而实际上现在大家都是20多就去噩梦了。



暗黑2重置，基本上是原汁原味的，任何先进的改动都不给加，然后各种mod也没有，甚至连个物品过滤也没有。后来用了一些别人的，发现都不是很好，于是基于他们的我自己修改了一版，给自己用，也给群里的人用。



## 简易修改教程

首先你需要下一个MPQEditor，用来修改MPQ文件

> http://www.zezula.net/en/mpq/download.html

然后打开任何一个要修改mpq，然后就能看到对应的文件了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/KYWVbecydG3MUFL.png)

里面的json使用任何一种编辑器进行编辑即可，但是这里要注意一下，mpq本身编辑以后，是在本地编辑的，不是里面的打包文件被修改了。

修改的json文件需要放在下面的目录中

```
\Data\local\lng\strings\
```



要完成打包，需要先删除里面的文件，然后再添加刚才修改的文件进去

- MPQ文件在打开的状态下，游戏启动时无法加载，一定要关闭以后再启动



### 自定义颜色

显示字体的颜色，是通过加载一个颜色地址数组来实现的，具体地址就是`ÿc`后面跟0-12表示各种颜色

但是由于是十六进制的所以10，11，12显示出来就是 `: ; <` 了

```
ÿc0 （由于默认是白色，所以这个不会有人用）
ÿc1
ÿc2
ÿc3
ÿc4
ÿc5
ÿc6
ÿc7
ÿc8
ÿc9
ÿc:
ÿc;
ÿc<
```

对应下图种的13种颜色

![](https://img.elmagnifico.tech/static/upload/elmagnifico/XF4oyU7OcuL156R.png)

- 需要注意在文本中`[]`中括号是一个特殊字符，他不能直接用来显示



### 字体

修改字体文件需要放置在以下目录：

```
Data\hd\ui\fonts\
```

但是注意繁体需要原生繁体字库，与我们常用的中文字库带繁体不同。

目前能用的几个繁体字库都放在仓库中的fonts目录中



### 其他

这个是一个英文版本的，不过他也好几天没维护了，还处于最早期的阶段吧，还是那种解包整个游戏的级别

> https://github.com/AlexisEvo/d2r-loot-filter



更多的mod修改可以看这里，讲的非常详细了，除了基础的过滤，甚至修改物品等级合成表、物品属性等等都可以通过mod直接实现，只不过这些部分都是基于离线的，在线模式需要数据验证应该是通不过的。

> https://github.com/HighTechLowIQ/ModdingDiablo2Resurrected



## 我的过滤

我开源了一个我的过滤

> https://github.com/elmagnificogi/diablo2_resurrected_filter



- **先说，风险自负，出任何问题和我无关，认为会被封什么的请勿使用，我只是替换了文本显示，不包含任何非法hook，使用的也是官方接口**

- 其他所有mod都没有正确处理单纯的宝石词缀导致实际纯宝石掉落没有高亮，因此剔除其他mod

  

elmagnifico，可以显示符文编号、装备是扩展还是精英，同时还能显示浮动数值范围、显示一些注释、药品区分颜色显示，并且**精简部分部分词缀**，去掉很多装备的额外英文，方便大量装备显示



### 核心显示原则

1. 尽量缩小每个物品的显示大小
2. 尽量不影响新手游戏
3. 保证在开启物品显示的情况，也能正常走路操作，不影响走位
4. 值得捡的要么高亮，要么有特殊词缀
5. 不需要替换文本的地方，尽量保持原样（重置版的原翻译）

由于可使用颜色一共就13种，为了防止干扰，尽量不使用游戏本身的掉落颜色

- **红1，可以捡**

- **橙黄8，值得捡**
- **紫11，必捡**
- 浅绿12，容易混淆，暂时没用
- 深绿10，容易混淆，暂时没用
- 淡暗金7，容易混淆，暂时没用
- 黑色6，会导致看不清



### 显示效果

![](https://img.elmagnifico.tech/static/upload/elmagnifico/NvDhm48Kz1tEx36.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/WPdwvsZJ8Ux2aHe.png)



### 缩写解释

- 轻、中、重，是指装备重量
- 扩、精，是指扩展级装备、精英级装备，普通装备则不带有该后缀
- 超级法力和生命，瞬回药剂特殊颜色显示
- 所有宝石及以上亮黄色高亮显示，缩短宝石名称
- 所有碎裂宝石红色显示
- 红，生命回复类药水
- 蓝，法力回复类药水
- 紫，生命和法力瞬回类药水
- 掉落金币，移除金币两字，直接显示数字
- 装备的*表示较好底材，值得留意
- 所有护符紫色显示，**会影响到暗金护符掉落颜色**
- 移除原mod自带字体，使用重制版字体
- 各种药剂名称缩短，只保留前两个字符
- 传送卷和鉴定卷名称缩短

还有更多需要私聊我吧，慢慢改进。



### 缺点

这种方式的过滤，能做的太有限了，而且经常修改了某个底子会影响到其他所有物品，这就非常麻烦。如果能知道以前的mod是怎么hook的，获取可以弄出来真的过滤。

有些修改量非常巨大，大部分都是用正则表达式替换修改的，而很多东西都是从老版移动过来的，所以没有之前的数据，就没有现在的mod

颜色可以选择的也非常有限，牵一发动全身，大家总会有你需要这个，我需要那个，这种小需求我就不能满足了。可以的话自己修改吧，不行就凑活用别人的。



## 安装

mod解压到暗黑2重置的目录中

![](https://img.elmagnifico.tech/static/upload/elmagnifico/juTn2VYGIJCgPdq.png)



游戏设置中选择额外命令行，加载mod

![](https://img.elmagnifico.tech/static/upload/elmagnifico/QI1C6jX7ArFZHPE.png)



命令如下：

```
-mod elmagnifico
```



退出游戏重进即可，不需要的话直接去掉命令行就行了，文件删不删无所谓。



## log

2021.10.09，增加*号显示，缩短原版的精扩字符、药剂名称缩短、回城和鉴定卷轴名称缩短

2021.10.10早，修复部分物品依然带有英文，修改碎、裂宝石颜色，修复无情前缀装备变色、取消超蓝颜色显示

2021.10.10晚，补充暗金吐槽，移除部分英文，增加法师铠甲*，删除部分词缀后的英文，区分碎和裂的宝石



## Summary

基本就是这些，但是要做到真的类似poe那样的过滤，基本上一定要hook，否则光靠这个东西没办法实现



看了一下数据，下的人真多，这两天算上我群里的估计破千了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/g6HeDLJ1xOhSv4s.png)

11号再看，1.8已经下载破千了。



15号：猛增一堆人下载

![](https://img.elmagnifico.tech/static/upload/elmagnifico/wTHRV3lNJQ9z2cY.png)

建议后期配合我的MA_Filter一起使用，效果更好

> https://github.com/elmagnificogi/MA_Filter



## Quote

>https://d2mods.info/forum/viewtopic.php?t=57429

