---
layout:     post
title:      "Windows系统异常失焦"
subtitle:   "windows，chrome_widgetwin_0，Chrome，Autodesk"
date:       2024-07-29
update:     2024-08-01
author:     "elmagnifico"
header-img: "img/x14.jpg"
catalog:    true
tobecontinued: false
tags:
    - windows
---

## Foreword

遇到一个奇怪的现象，有时候开机以后，会出现失焦的情况，打字经常被中断，各种按键操作突然就失去焦点了



## 现象

打开任何程序，最明显的就是打开一个记事本，然后按住一个键，默认会一直输入，如果存在失焦，就会被中断，这里只是单纯的失去焦点，并不会切换回桌面或者某个很明显的程序

- 我大概10s左右就会有一次失焦，再次重复，依然可以复现

比较奇怪的是好像都是每天第一次开机会出现，重启一下必然会好。

前面以为是我的键盘、HUB、鼠标等等存在掉驱动和重连接，而就算我全关闭或者全断开这个情况依然会出现



## 失焦分析

找了半天看到有一个失焦分析的小软件，刚好拿来试试

![image-20240729201906432](https://img.elmagnifico.tech/static/upload/elmagnifico/202407292019534.png)

失焦监控工具放到这里了，防止有一天找不到

> https://github.com/elmagnificogi/MyTools/tree/master/LoseFocus



打开以后，如果有程序主动切换焦点，就会被hook到，然后显示具体的句柄和窗体名称，这样就能抓到具体是哪个程序了。

![image-20240801214008949](https://img.elmagnifico.tech/static/upload/elmagnifico/202408012140044.png)

![image-20240729203252037](https://img.elmagnifico.tech/static/upload/elmagnifico/202407292032061.png)

不幸的发现，我抓到的竟然是Chrome，就算完全关闭Chrome也不行。并且这个程序的句柄值一直在变动，相当于是他启动，然后关闭，过一会又再次启动，发现问题，又关闭，如此往复。

Chrome_WidgetWin_0，这个东西基本上是所有用了Electron架构的应用都会产生的窗体，类似网易云音乐、QQNT、VScode等等，这就有点麻烦了



~~怀疑是最近的chrome升级可能出现了问题，再加上深信服的VPN之前卸载可能没弄干净，重新卸载一下，发现chrome的google账号有需要重新登陆了，重登以后似乎没有问题了~~

![image-20240801214715515](https://img.elmagnifico.tech/static/upload/elmagnifico/202408012147540.png)

逐一退出右下角程序，发现Autodesk的启动项竟然影响到了这个，这是万万没想到的，这程序已经放了好几年了，第一次遇到。估计可能和哪个程序产生冲突了，才引起来的



## 其他失焦原因

刚开始大部分看到的都是svchost.exe导致的，这种多数是中病毒了或者是被某些莫名其妙的程序优化修改了注册表，可以通过以下办法恢复

```
开始-运行-regedit进入注册表,找到HKEY_CURRENT_USER\Control Panel\Desktop下的ForegroundLockTimeout项,把这个值改成10进制的任何6位数以上(系统默认200000毫秒/十六进制30d40)
```



还有一种比较常见的失焦，是WPS的广告程序，不知道是什么原因导致他无法正常显示了，所以在后台来回切广告页面，导致的失焦。这种卸载WPS或者在设置中取消相关广告权限即可

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202407292032308.png)



## Summary

万万没想到自动桌，你个浓眉大眼的竟然搞小手段



## Quote

> https://blog.csdn.net/wuruiaoxue/article/details/46774229
>
> https://www.bilibili.com/read/cv4626259/
>
> https://www.zhihu.com/question/33537889



