---

layout:     post
title:      "Nintendo Switch 软破解，变安卓TV"
subtitle:   "hekate，Android TV，SN，注入，串流，moonlight"
date:       2024-04-11
update:     2024-04-16
author:     "elmagnifico"
header-img: "img/x3.jpg"
catalog:    true
tobecontinued: false
tags:
    - Nintendo Switch
    - Crack
---

## Foreword

隔6年，打算把老Switch破解了，软破，既可以当正版完，又能在平时切换成电视主机，方便用来串流或者使用一些不受限的APP。主要受Nvidia Shield Pro 2019影响，这么个老设备都可以在电视领域虐杀一片，Switch作为老大哥，性能解禁，秒杀其他的应该不是问题



## 软破

软破的好处是不需要拆机，很简单就可以操作

达到的效果也很好，可以选择启动正版、大气层（盗版）、安卓系统、ubuntu等等，后续怎么玩就取决于自己了，而且关键是这并不会影响正版的所有内容，正版该怎么玩还是怎么玩



#### 可破区分

Switch有软破硬破，18年6月前的机器基本都可以软破，不需要任何焊接或者拆机就能完成注入破解，而且平常可以双系统，不影响正版使用。

![image-20240410225356544](https://img.elmagnifico.tech/static/upload/elmagnifico/202404102254739.png)

软破常用的识别图，不过不是很准确，可以用下面的地址查询一下



> https://damota.me/ssnc/checker/

输入序列号就行了，我这个1002开头的比较特殊，一部分机器是较晚生产的，所以他们不能破解，一部分是比较早生产的所以可以破解

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202404102254294.png)

safe就是可以破解



### 注入

软破是通过程序注入，修改了启动地址，进而实现了双系统，软破都需要短接手柄右侧的两个针脚，然后按住电源加重启即可进入boot中

![image-20240410234630231](https://img.elmagnifico.tech/static/upload/elmagnifico/202404102346480.png)

主要是短接第1和第10引脚即可



![image-20240412235638626](https://img.elmagnifico.tech/static/upload/elmagnifico/202404122356673.png)

淘宝/咸鱼有专门的注入器，大概30多就能买到了



#### 注入流程

1. 主机关机
2. 插入注入器，短接器接入右侧手柄，ON朝下
3. 按住音量+，按一下开机键，开机，注入器会亮蓝灯
4. 屏幕出现`press any key` 然后再按一下音量键即可

接着就可以用音量键来操作菜单了，电源键是确认键，新版本进入以后直接就可以触屏操作了



#### 更新RCMloader

RCMloader说明网址在这里

> https://www.gamebrew.org/wiki/RCMloader_ONE_Plus_Switch

- 这是老版本的说明了，也就是V5之前的RCMloader，后来的RCMloader都不需要通过这种方式升级固件了

最新的hekate 6.1.1已经有很完善的UI界面了，使用起来很简单了

![image-20240416122237052](https://img.elmagnifico.tech/static/upload/elmagnifico/202404161222134.png)

后续RCMloader升级是通过直接读取switch的sd卡来加载他的固件的，所以只要把RCMloader的升级包放到sd卡中即可

- sd卡需要是FAT32格式

RCMloader升级包在这里

> https://github.com/CTCaer/hekate/releases



游戏下载可以从这里获取

> https://nxbrew.com/



## Android TV 盒子

先打算作为盒子来替代电视自己的系统



#### 准备

> https://switchroot.org

系统从上面的网址下载，可以看到里面各种其他系统

![image-20240413004840085](https://img.elmagnifico.tech/static/upload/elmagnifico/202404130048114.png)

这里面atv就是电视用的，tab就是当成平板用的系统，这里下载atv版本



插入有hekate的sd卡，注入器插入启动以后，先进入`Nyx Settings`将joy-con的信息存储到sd卡中`Dump Joy-Con BT`



#### 安装

选择`Tools-Partition SD Card`，SD卡进行一次分区，建议使用大一些的SD卡，这样可以同时存储好几个系统，切换也方便

修改`Android(USER):`的分区大小，最小16G，然后`Next Step`，会提示安装的系统是哪种，选择`Android 10-11`，提示开始分区`Start`，倒计时后点击电源按钮，就可以开始了。

如果SD卡中内容不多，这个备份和分区非常快，接下来就可以把RCMloader拔下来，连接Switch到PC上，选`SD UMS`，准备copy系统上去了，系统会自动弹出Switch SD的U盘内容

![image-20240413010518927](https://img.elmagnifico.tech/static/upload/elmagnifico/202404130105968.png)

将压缩包的内容全都传输到SD卡中，直接覆盖即可



传输完成后，就可以断开Switch和PC的连接，回到屏幕上继续操作`Flash Android`，提示`Continue`，`Continue`安装安卓系统



正常的话，就可以看到安卓的Recover界面了，选择`Factory reset`，先三清，操作完了以后`Apply update`，`Choose from SWITCH SD`选择从sd卡安装，选择刚才解压进去的包`lineage-18.1-20230705-UNOFFICIAL-nx.zip`，后续就等待安装完成，可能会提示签名验证失败`failed to verify whole-file signature`，无视继续安装



安装完成以后，返回`<-`，重启系统`Reboot`



进入安装系统，选择`More Configs`，就能看到刚才安装的`LineageOS 18.1`，点击启动，剩下的就是安卓的初始化配置，配置完成以后就可以用了

- 这里最好是有透明代理在路由器上，否则一堆谷歌验证可能过不去
- 输入wifi密码时可能无法触屏，其他过程都可以触屏，此时手柄可以操作（之前保存手柄信息非常重要）
- 已经透明代理的情况下，连接wifi可能会提示找不到，多连几次就好了



安装应用，如果谷歌登录了，直接用手机搜应用，然后安装到switch就行了，很方便

但是有些应用谷歌商店没有，switch的usb调试模式里竟然没有文件传输，所以只好通过adb安装了

设置-开发者选项-ADB over network 开启，就能看到ip和端口了

```
adb connect 你的ip
```

![image-20240413020702628](https://img.elmagnifico.tech/static/upload/elmagnifico/202404130207718.png)

```
adb install BLBL.apk
adb install blhd.apk
```





## 测试

YouTube没啥问题，谷歌商店可以，先弄个moonlight，这样就可以高性能串流了

- 测试了一下，switch作为安卓，joy-con、pro手柄、键盘都可以接上直接用



BLBL作为B站第三方客户端，真不错

> https://github.com/xiaye13579/BBLL



geforce now 失去了shield 本地串流，只能云游戏，很鸡肋

> https://static-login.nvidia.com/service/gfn/pin
>
> geforcenow.com/connect



Steam Link 

![image-20240413033334524](https://img.elmagnifico.tech/static/upload/elmagnifico/202404130333572.png)

Steam Link总体来说比Moon Light难用一些，画面感觉也更卡一些，手柄支持上也怪怪的，除非是手柄是直连的PC而不是安卓，如果是连的安卓转一道，控制就很奇怪，映射总是不对劲



同比Moon Light 直接调用SHIELD，手柄兼容性好，总体来说也比较流畅

- 唯一不好的地方就是带鱼屏的时候要手动设置分辨率，不然自动同步的就是带鱼屏的比例，很奇怪

![image-20240413040915531](https://img.elmagnifico.tech/static/upload/elmagnifico/202404130409608.png)

虽然Moon Light的延迟很低，但是游玩过程中偶尔还是会出现卡顿的情况，不知道是NS过热导致网络有问题，还是我路由上有点问题，不够完美



只要不使用系统的关机，只用安卓本身的重启，每次启动也进入的都是安卓系统，只有用电源关机以后重启的系统才会回到正版系统里



## 更换大容量SD卡

首先我是未破解的SD卡，128G更换到软破的512G，游戏存档默认都是存储在机身内置存储上的，而游戏本体可以在内置和SD卡之前迁移，所以换卡理论上不会丢失存档数据，最多只是重新下游戏而已

先把128G完全克隆到512G有两种办法

1. 先把512插到系统里，然后初始化一下SD卡，然后直接把128G卡的全部内容复制粘贴到512即可
2. 128G直接利用磁盘工具直接克隆到PC，然后对512G进行还原即可

两种操作格式都是exFAT



软破所用到的hekate和安卓安装包什么的，都直接复制粘贴进去即可，然后走上面的流程安装

第一次软破后必然会导致SD卡内容被清空，装完以后，重新进正版系统下载，以后再更换SD卡就直接复制粘贴就行了，不再需要初始了



## Summary

勉强能用，就是还不够好



## Quote

> https://github.com/gzzhengbingyi/switch-crack
>
> https://www.bilibili.com/video/BV1PK4y1e7t3
>
> https://www.bilibili.com/video/BV1qm411z72e
>
> https://www.cnblogs.com/backuper/p/17784515.html
>
> https://vincentko.top/archives/switch-update
