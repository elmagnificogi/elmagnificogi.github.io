---
layout:     post
title:      "Redmi小爱音响8刷机和安装第三方APP"
subtitle:   "payload_dumper，mtkclient，root权限，adb"
date:       2024-04-06
update:     2024-04-06
author:     "elmagnifico"
header-img: "img/bg9.jpg"
catalog:    true
tobecontinued: false
tags:
    - 米家
    - BE6500Pro
    - Router
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



理论上说直接用最新版的去修改，也能开启root和adb，所以这里直接用最新的，而不用什么开发板了

> https://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/x08c/payload_2.19.102_09480.bin



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

这个项目的python最低需要3.9，如果是3.8会无法打开，所以还得弄个3.9进来，然后再重新安装他的依赖

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

这里设备已经检测到了，但是此时还是无法操作的，需要断电一次，然后再按住电源和音量加，进入正式模式



按住音量+，上电以后系统依次会有3种USB连接

![image-20240406175557506](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061756590.png)



![image-20240406175624854](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061756878.png)

PreLoad是MTKClient能识别的

![image-20240406163402929](https://img.elmagnifico.tech/static/upload/elmagnifico/202404061634953.png)

在上面的情况下，再次重启，按住音量+，又会切换到这个DA USB，DA不知道是什么模式的USB



闪退

```
Preloader mode
brom mode


Power off the phone before connecting.
For brom mode, press and hold vol up, vol dwn, or all hw buttons and connect usb.
For preloader mode, don't press any hw button and connect usb.
If it is already connected and on, hold power for 10 seconds to reset.




Jumping to 0x200000: ok.

reconnecting to stage2 with highter speed
```

出现以上跳转以后MTKCLient就闪退了，重试了好多次都是一样的效果，暂时卡住了



正常情况下这里跳转以后就会进入Bootrom模式，然后就可以读取分区信息，重新写入了，想改啥都能行，但是他闪退了...





理论上稳定版也可以通过修改boot分区root并强行开启adb，然后安装第三方安装器安装软件，具体操作：解包boot分区，修改prop文件，persist.service.adb.enable=1 persist.service.debuggable=1 persist.sys.usb.config=mtp,adb .









## Summary

> http://flying1008.top/

之前应该是小爱音响留了一个推送固件的接口，被人发现了，就可以随便推送，这个网站就直接提供了这个功能，不过可惜后续都被封了



现在的线刷模式有点麻烦，而且还不容易成功



## Quote

> https://post.smzdm.com/p/a25dzm9d/
>
> https://www.bilibili.com/video/BV1d94y1s7oq/?vd_source=fe2e37e9c6518671631012d39f18a581
>
> https://www.bilibili.com/read/cv25905108/
