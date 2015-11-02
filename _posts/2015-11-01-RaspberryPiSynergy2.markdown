---
layout:     post
title:      "树莓派 & Synergy & 笔记本"
subtitle:   "树莓派，Synergy"
date:       2015-11-01
author:     "elmagnifico"
header-img: "img/post-bg-js-module.jpg"
tags:
    - 树莓派
    - RaspberrryPi
    - Synergy
---
## RaspberryPi & Synergy

1. 从上面的github下源码到树莓派中去

2. 解压源码，解压完了之后一定要解压./ext/下的openssl gtest gmock 三个压缩包，不然一会链接和编译的时候都会找不到各种文件。

3. 进入源码目录，先尝试

		
		./configure
		

   如果没有意外，应该会提示cmake相关的，大概就是cmake没装

		
		./configure
		...
		./configure: line 1: cmake: command not found
		sudo apt-get install cmake
		

   装完cmake，继续缺少X11，继续安，应该还会提示xtst

		
		./configure
		...
		CMake Error at CMakeLists.txt:196 (message):
		Missing header: X11/Xlib.hX11/XKBlib.h
		-- Configuring incomplete, errors occurred!
		sudo apt-get install libx11-dev
		sudo apt-get install libxtst-dev
		
到这里就设置结束了，应该能正常使用Synergy，如果还有后续的话就是如何在windows下编译出来一个Synergy。
总体来说Synergy还是不错的，但是本来双屏幕的被占用了一个屏幕，并且不能随意拖拽东西过去（应该改是不能跨平台吧，同平台应该是可以的），所以最后还是PieTTY|PuTTY会比较好一些，毕竟用linux系的要什么桌面啊。

    ./configure
    sdaf CMake Error at CMakeLists.txt:196 (message):
    CMake Error at CMakeLists.txt:196 (message):
    CMake Error at CMakeLists.txt:196 (message):
    CMake Error at CMakeLists.txt:196 (message):
    CMake Error at CMakeLists.txt:196 (message):





