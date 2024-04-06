---
layout:     post
title:      "Redmi小爱音响8刷机和安装第三方APP"
subtitle:   "payload_dumper，mtkclient，root权限，adb"
date:       2024-04-06
update:     2024-04-07
author:     "elmagnifico"
header-img: "img/bg9.jpg"
catalog:    true
tobecontinued: false
tags:
    - 米家
---

## Foreword

Redmi小爱音响8原价400多买的，上了大当，APP有限，而且视频软件还是TV版本的，不知道是咋想的，这就做个Pad模式不好吗。还好有很多人魔改，把他变成一个电视系统的，甚至还有拿他打游戏的，这么大的身躯里承担了他本不应该承受的痛啊。



## 准备

主要安装两个驱动

> https://github.com/daynix/UsbDk/releases/download/v1.00-22/UsbDk_1.0.22_x64.msi
>
> https://gsmclassic.com/download/driver/mtk/MediaTek_SP_Driver_v5.2307.zip

本文的所有软件我也一起同步到了我的仓库里，防止丢失

> https://github.com/elmagnificogi/MyTools/tree/master/Redmixiaoaisound8



## Dump固件

固件获取可以通过这个工具，选好型号以后会返回固件信息，包含下载地址

![image-20240406144501628](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061445673.png)

比如这里最新的开发板固件就是1.0.31，而没刷之前的稳定版是1.0.102，升级到了HyperOS

> https://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/x08c/payload_2.17.31_5e8bb.bin

- 老的MicoOTA4.5的升级方式已经全部失效了，软件甚至都找不到了

 

理论上说直接用最新版的去修改，也能开启root和adb，暂时还没掌握方法

> https://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/x08c/payload_2.19.102_09480.bin



目前只有测试固件可以开启adb、安装第三方软件，而测试固件通过这里看到的都是增量更新，要整合比较麻烦，这里直接推荐一个完整测试包

> https://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/x08c/payload_2.10.61_5373b.bin



固件包的解析工具

> https://github.com/vm03/payload_dumper.git

由于上面的项目最高支持到pyton3.8，所以先弄个3.8的版本，然后升级一下pip，最好开一下代理，再安装依赖



进入payload_dumper，先安装一下依赖

```sh
pip3 install -r requirements.txt
```

将刚才得到的最新固件`payload_2.19.102_09480.bin`拖入文件夹中，进行解压

```sh
python payload_dumper.py payload_2.19.102_09480.bin
```

![image-20240406151536435](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061515467.png)

ouput目录中就是我们得到的解开后的固件

![image-20240406151553807](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061515836.png)

这里解出来是img，修改为bin即可



## 刷固件

mtk的刷机工具

> https://github.com/bkerler/mtkclient

这个项目的python最低需要3.9，如果是3.80会无法打开（pyside不支持，但是3.81就可以），所以还得弄个3.9进来，然后再重新安装他的依赖

进入mtkclient，一个系统路径下只有一个python，所以第二个就要带全路径操作了，安装所有依赖

```
D:/Python/Python39/python.exe -m pip install -r requirements.txt
```



修改mtk_gui.bat的启动命令，替换原python，原本默认也是系统里刚安装的3.8，无法启动

```bat
@echo off
title MTKClient Log
D:/Python/Python39/python.exe "%~dp0mtk_gui"
```

然后运行mtk_gui.bat，就能看到界面了

![image-20240406153044302](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061530355.png)



前面的驱动安装完成以后，插入音响的USB，是老安卓的micro-USB接口

![image-20240406140909813](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061409007.png)

拔掉电源，再接入USB，然后按住音量+，再插入电源，系统应该就自动识别到了，松手即可

- 不是按住电源和音量+，会导致反复重启的

可以看右上角已经识别到了

![image-20240406153702267](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061537294.png)

对应的Log窗口也能看到连接的信息

- 注意，有时候关闭软件，这个窗口没关闭会导致下次连不上，一定要记得关闭Log窗口再重连

![image-20240406161426612](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061614653.png)



进入调试界面

![image-20240406161554327](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061615376.png)



![image-20240406163201741](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061632778.png)

这里设备已经检测到了，但是此时还是无法操作的，**需要断电一次，然后再按住音量+，进入Boorom模式**



按住音量+，上电以后系统依次会有3种USB连接，最好在显示第一种模式的时候就松开音量+

![image-20240406175557506](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061756590.png)

![image-20240406175624854](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061756878.png)

![image-20240406163402929](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061634953.png)

在上面的情况下，再次重启，按住音量+，又会切换到这个DA USB，DA不知道是什么模式的USB，我们不需要这种模式



#### 闪退

![image-20240406194542496](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061945624.png)

出现以上跳转以后MTKCLient就闪退了，重试了好多次都是一样的效果，暂时卡住了

正常情况下这里跳转以后就会进入Bootrom模式，然后就可以读取分区信息，重新写入了，想改啥都能行，但是他闪退了...



通过录屏，截下来了具体输出的信息逐个分析，这句的问题最大

```
reconnecting to stage2 with highter speed
```

还好MTKClient是开源的，这句log也是他自己输出的，找到了3个出处，改了其中2个就正常连接了

![image-20240406200430793](https://img.elmagnifico.tech/static/upload/elmagnifico/202404062004842.png)

![image-20240406200418301](https://img.elmagnifico.tech/static/upload/elmagnifico/202404062004358.png)

修改以下两个代码中的代码，将这里stage2的提速给取消了

> mtkclient\mtkclient\Library\DA\xflash\dalegacy_lib.py
>
> mtkclient\mtkclient\Library\DA\xflash\xflash_lib.py

前面就看到有人出现了类似的问题，直接注释掉了，但是issue已经关闭了，我以为是问题解决了，实际上却没有

大概看了一下，应该是如果是慢速的usb，会在这里进行一次提速，而不巧的是红米这个固件好像不能提速，只能用低速模式传输

- 注意低速模式非常慢，大概每秒只有0.53MB的速度

![image-20240406201057823](https://img.elmagnifico.tech/static/upload/elmagnifico/202404062010872.png)

最好备份一下，防止刷错了，直接变砖头了，就是备份速度感人



这里使用`payload_2.10.61_5373b.bin`解开后的文件，将他们刷到其中

![image-20240406212210281](https://img.elmagnifico.tech/static/upload/elmagnifico/202404062122328.png)

选择好固件以后，进行写入，由于是低速所以写如只有1MB左右的速度，要刷完这5G，得要5个多小时，非常离谱

固件全部写完以后，再从闪存工具里写入对应的`preoloader.bin`，然后就可以断开连接，重启开机了



#### USB 提速

可以确定的是MTKClient新版本对之前的老设备兼容性有问题，换到MTKClient的老版本以后，不再需要连接两次设备，而且也不是低速USB了

![image-20240406221900873](https://img.elmagnifico.tech/static/upload/elmagnifico/202404062219931.png)

由于这个beta版本非常难找，所以也一起放到我的仓库里了（实际上是从搞基猫的安装包里找到的，小孩子还成天不学好，劲搞些有的没的恶心人）

基本网上全都是遇到类似问题的，都是缺少这个特定版本的MTKClient

实际上这个版本来源于这里

> MTK联发科专业工具下载合集（长期更新）：https://xinkid.lanzouv.com/b075nltgh 密:canxin

> https://www.bilibili.com/opus/636328623649849351?spm_id_from=333.999.0.0



## 开启adb、安装第三方软件

 刷完进入系统以后，按住关机和音量+，即可打开安卓系统设置

系统-高级-关于手机-版本号（连点七下），即可开启开发者模式

返回上一级菜单，可以看到开发者选项，打开，找到默认USB设置，选择文件传输

![image-20240407002414993](https://img.elmagnifico.tech/static/upload/elmagnifico/202404070024095.png)

然后就可以通过电脑进入到系统内部存储空间中了，在这里把想要安装的APP，放进去即可



再次回到设置里，打开存储，选择文件，就看到刚才的APP了，安装即可

设置-关于与帮助-开发测试，这里选择第三方软件即可（如果啥都没安装，这里是黑屏）



试了一下blibili HD版本装不上，正常版本装上去卡的要死，建议别装



adb，在此时已经可以使用了

![image-20240407004613713](https://img.elmagnifico.tech/static/upload/elmagnifico/202404070046740.png)



安装bilibili

```
adb install bl2.apk
```

![image-20240407005142575](https://img.elmagnifico.tech/static/upload/elmagnifico/202404070051604.png)



## 稳定版修改boot信息

稳定版也可以通过修改boot分区root并强行开启adb，然后安装第三方安装器安装软件，具体操作：解包boot分区，修改prop文件，persist.service.adb.enable=1 persist.service.debuggable=1 persist.sys.usb.config=mtp,adb .



暂时没找到怎么解包boot，这些参数怎么修改还不知道



## Summary

> http://flying1008.top/

之前应该是小爱音响留了一个推送固件的接口，被人发现了，就可以随便推送，这个网站就直接提供了这个功能，不过可惜后续都被封了



试了一圈，发现非常难用，还是退回了正式版，正式版相对流畅太多了

## Quote

> https://post.smzdm.com/p/a25dzm9d/
>
> https://www.bilibili.com/video/BV1d94y1s7oq
>
> https://www.bilibili.com/read/cv25905108/
>
> https://www.bilibili.com/video/BV1g44y1e7Md
>
> https://blog.csdn.net/weixin_40883833/article/details/132266091
>
> https://blog.csdn.net/weixin_40883833/article/details/131258378
>
> https://blog.csdn.net/weixin_40883833/article/details/131258378
