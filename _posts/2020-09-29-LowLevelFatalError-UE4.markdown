---
layout:     post
title:      "UE4报错LowLevelFatalError"
subtitle:   "虚幻引擎，epic，Borderlands3，Remnant: From the Ashes"
date:       2020-09-29
author:     "elmagnifico"
header-img: "img/cap-head-bg2.jpg"
catalog:    true
tags:
    - UE4
---

## Forward

最近一直遇到UE4的游戏报错，莫名其妙闪退或者直接报一个LowLevelFatalError的错误，或者类似的一些错误



## 报错

其中某次报错

![image-20200929103045578](https://i.loli.net/2020/09/29/sFOB4eQdpwuASlh.png)

报错多种多样，但是每次提示的都差不多

```
LowLevelFatalError [File:Unknown] [Line: 3406] 
Retry was NOT sucessful.


0x00007ffc4f64a308 KERNELBASE.dll!UnknownFunction []
0x000000014ffe149c Borderlands3.exe!UnknownFunction []
0x000000014ff79ddd Borderlands3.exe!UnknownFunction []
0x0000000142994da8 Borderlands3.exe!UnknownFunction []
0x0000000142995fdb Borderlands3.exe!UnknownFunction []
0x000000014fe3abf7 Borderlands3.exe!UnknownFunction []
0x000000014fe3d38c Borderlands3.exe!UnknownFunction []
0x0000000150086fbb Borderlands3.exe!UnknownFunction []
0x0000000150071d35 Borderlands3.exe!UnknownFunction []
0x00007ffc4f8d4034 KERNEL32.DLL!UnknownFunction []
0x00007ffc524a3691 ntdll.dll!UnknownFunction []

Crash in runnable thread TaskGraphThreadBP 17
```

也有可能提示的是这个错，每次可能造成错误的提示不一样，但是起因都是类似的，只是出错点具体在哪里罢了

```
LowFatalError d3d
```



## 现象

一旦一次报错以后，后面打开游戏基本秒退或者过不了几分钟就二次报错，基本不能玩。要重新正常游戏必须重启电脑，然后游戏就能正常打开了，但是玩大概几小时或者不定时间以后又会再遇到这个错。



## 问题游戏

一开始报错是遗迹：灰烬重生（Remnant: From the Ashes），但是我没在意，后来发现无主之地3（Borderlands3）也会莫名其妙闪退，然后报错，频率还比较高，后来又测了一下其他UE4的游戏（方舟生存进化等），基本全都会出这个错，那这就不是意外了，肯定有什么东西出错了。



## 解决办法

我尝试了基本所有相关报错的解决办法，但是都没效果，由于出这个错的可能都有，所以列一下各种解决办法，有可能你就是其中一个毛病。



#### 缺少运行库

这个情况比较常见，而现在游戏大多数都是基于Visual C++ Redistributable for Visual Studio 2015的运行库来开发的，所以重新安装可能就好了。



#### 游戏文件缺失

右键游戏，验证游戏完整性，我试过，确实会出现文件重新下载的情况，但是并不能解决我的问题



#### GPU驱动

老生常谈了，重新安装显卡驱动或者当前显卡驱动刚好处于一个bug版本，更新一下可能可以，不过对我没用。



#### 机械/固态硬盘问题

无意间注意到我游戏固态基本满了，1.4t/1.5t，可能是固态快满了读写性能极速下降，导致游戏崩溃？

然后我把游戏移动到了另一个空固态里，依然有相同问题，但是这也是有可能造成这个问题的。



#### 游戏文件名问题

有些游戏读写文件不支持带空格的文件夹名，导致打开游戏或者运行中出错，比较弱智吧，写代码的人对目录string没有做路径通配符处理



#### UE4配置问题

有时候可能是UE4本身的配置有问题，一般UE4的配置存在以下目录中

```
C:\Users\用户名\AppData\Local\UnrealEngine
```

把整个文件夹删除，让游戏去重建这个目录。



#### 游戏配置

UE4默认游戏配置存储在这个目录下

```
C:\Users\用户名\My Documents\My Games\游戏名\Saved\Config\WindowsNoEditor
```

有可能配置文件损坏或者其他什么问题，导致这里出错了，删除这里的配置文件或者整个Config目录，让游戏重建一下



#### 文件只读问题

接上面的配置问题，有时候这个配置文件被莫名其妙设置成了只读文件，然后导致游戏里没有权限修改文件，最终导致报错，这里就要把整个配置文件取消只读属性，允许修改，可能可以解决这个问题



#### dx12与dx11问题

dx12和dx11目前基本游戏里都支持，有的人可能dx11就出问题，有的人可能是dx12出问题，那就来回切换一下，我测试了一下并不行，虽然可以让游戏可以启动游玩一会，但是最终还是会报错。

最好是直接重装一下DirectX 



#### 全屏优化/DPI问题

有的可能是windows的全屏优化导致的软件出问题。

对着游戏程序--属性--勾选兼容性--win8、禁用全屏优化、管理员、更改高DPI



#### 同步垂直问题

![image-20200929104625121](https://i.loli.net/2020/09/29/Az8WrkdGvBym5jK.png)

也有人说是显卡设置中没有开启垂直同步造成的，但是垂直同步其实默认是由游戏里选择的，而游戏里无论是开还是关其实都不影响这个东西。



#### 网盘同步冲突

有人可能把document文件夹给OneDrive或者Google Drive, Dropbox或者百度云盘或者坚果云之类的同步了，但是同步的时候可能出现了同步冲突，导致同一个文件夹下有好几个冲突配置文件，最终导致报错，不过我没这个问题，我本身没同步。



#### XPM超频问题

![image-20200929111332096](https://i.loli.net/2020/09/29/RH78DSGfPLtKsQz.png)

超频问题比较多，可能是cpu超频问题，可能是gpu超频问题，也有可能是内存超频问题。

我本身内存是3200的，然后我降到3000，发现这个问题再也没有了，所以我这里出问题是内存超频造成的。

几个国外的帖子里也有提过超频的问题，不过他们都是超cpu或者gpu的没想到内存也会有问题。



## Summary

遇到这个问题的各种各样，有可能上面某个方式就彻底解决了这个问题。

网上能搜到比较有用的解决办法我基本都看过了，引用全都列在了下面

## Quote

> https://www.reddit.com/r/borderlands3/comments/hwwnuq/game_crashing_cant_find_any_info_searching_around/
>
> https://www.reddit.com/r/borderlands3/comments/d3jtia/borderlands_3_crashes_after_few_minutes_pc/
>
> https://www.reddit.com/r/borderlands3/comments/hyq53n/borderlands_3_crashing_on_launch/
>
> https://answers.ea.com/t5/Technical-Issues/Game-won-t-Launch-LowLevelFatalError-File-Unknown-Line-4119/td-p/8445099
>
> https://www.youtube.com/watch?v=6cWX3Ng3HgA
>
> https://forums.gearboxsoftware.com/t/ue4-low-level-fatal-error-crash-on-launch/4543288/14
>
> https://survivetheark.com/index.php?/forums/topic/409125-lowlevelfatalerror-unreal-engine-is-exiting-due-to-d3d-device-being-lost/
>
> https://tieba.baidu.com/p/5081644182?qq-pf-to=pcqq.c2c&red_tag=0651912777
>
> https://blog.csdn.net/sexyluna/article/details/84994100
>
> https://tieba.baidu.com/p/5267088406?red_tag=0692696168
>
> http://www.2000xp.cn/sort064/9823.html

