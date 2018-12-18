---
layout:     post
title:      "Maya QT MAKE"
subtitle:   ".pro,makefile"
date:       2018-12-18
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
catalog:    true
tags:
    - QT
    - maya
---

## Foreword

maya c++ qt plugin 例程编译过了，还需要看一下具体这个是怎么编译的，链接过程又是怎样的。

## QT编译配置

首先qt一般都是通过make makefile来进行编译的，但是呢一个工程的makefile一般都是通过qmake来生成的，当然也可以自己写一个makefile，不过工程比较大的情况下可能不适合，只是在特定某些情况下，需要手动添加某些内容进makefile

比如之前的例子，从qtconfig->helixQtCmd.pro->Makefile.qt

- helixQtCmd.cpp
- helixQtCmd.h
- helixQtCmd.pro
- Makefile.qt
- qtconfig

#### qtconfig

先看qtconfig，这里面记录的基本都是一些通用性的设置，基本所有qt的程序都要用到的。


    # 如果是app 表示要建立的是一个程序的makefile，这里是lib表示要建立一个库文件的makefile
    TEMPLATE = lib

    # Maya doesn't supply debug versions of the Qt libs so we build plugins
    # in release mode.
    #
    # If you want to build a plugin in debug mode edit the generated
    # .mak.Debug file (e.g. qtForms.mak.Debug), and in the LIBS setting remove
    # the final 'd' from all of the Qt library names. For example you would change
    # 'QtGuid4.lib' to QtGui.lib'. You can then build your plugin by specifying
    # 'debug' on the NMAKE command line. E.g:
    #
    #      NMAKE /f qtForms.mak debug
    #
    # If you get a warning message about a conflict with defaultlib 'MSVCRT', just
    # ignore it.
    #

    # 这里的CONFIG表示增加或者移除某个模块,以release模式进行编译
    # warn_on 是输出警告信息
    # qt 是使用了qt的库
    CONFIG += qt warn_on release plugin

    # 这里的LIBS相当于就是指定附加的库，指定库名称，不需要后缀
    LIBS		+= -L"D:\Autodesk\Maya2017\lib" -lOpenMaya -lFoundation

    # 预编译宏，这些宏可以直接在代码里用，也可以用来区分特殊模块
    DEFINES		+= NDEBUG _WINDOWS NT_PLUGIN

    # 附加头文件包含目录
    INCLUDEPATH	+= . "D:\Autodesk\Maya2017\include"

    # 设置链接器 flag 参数 这里设置了整个库的入口和出口，然后指定了子系统的是windows？
    QMAKE_LFLAGS	= /export:initializePlugin /export:uninitializePlugin /SUBSYSTEM:WINDOWS

    # 这是设置了一个私有变量 FD是生成文件依赖关系，GS是启用安全检查
    _CFLAGS		= /FD /GS

    # 设置c编译器flag参数
    QMAKE_CFLAGS	+= $${_CFLAGS}

    # 设置c++编译器flag参数
    QMAKE_CXXFLAGS	+= $${_CFLAGS}

    # 指定生成的应用程序名的后缀名，也就是应用程序的名字点后面的部分（例如.dll或者.exe）。如果不设置，则默认为.dll或者.exe。
    TARGET_EXT	= .mll

#### helixQtCmd.pro

nmake时操作的文件是.pro文件，再来看一下和这个项目相关的文件是如何定义的

    # 本质上 QT是使用.pro来生成实际的makefile文件的，而makefile是通过qmake来生成的

    # 这里包含了qtconfig的文件内容，其实本质上就是直接把那个文件的所有内容直接和这里加载一起而已。
    include(qtconfig)

    # 使用到的QT定义的类，比如core gui什么的
    QT += widgets

    #生成的程序名
    TARGET = helixQtCmd

    #工程中包含的头文件
    HEADERS += helixQtCmd.h
    #工程中包含的源文件
    SOURCES += helixQtCmd.cpp

pro相对比较简单，而且内容都是和当前项目相关的，而qtconfig则明显看起来是为了通用生成qt项目来用的。

#### debug

默认情况下编译出来的 helixQtCmd 是 release 版本的，如果要生成 debug 版本的，则需要以下步骤：

- CONFIG += debug
- 使用 nmake /f Makefile.qt myPlugin.mak 生成 .mak.Debug,然后将其中的LABS，带有 d 结尾的库，改成不带d的库

    # 原生
    LIBS = /LIBPATH:..\..\lib ..\..\lib\OpenMaya.lib ..\..\lib\Foundation.lib ..\..\lib\OpenMayaUI.lib c:\qt-adsk-5.6.1\lib\QtGuid4.lib c:\qt-adsk-5.6.1\lib\QtCored4.lib`

    # 修改后的
    LIBS = /LIBPATH:..\..\lib ..\..\lib\OpenMaya.lib ..\..\lib\Foundation.lib ..\..\lib\OpenMayaUI.lib c:\qt-adsk-5.6.1\lib\QtGui4.lib c:\qt-adsk-5.6.1\lib\QtCore4.lib`

- 然后使用 nmake /f myPlugin.mak.Debug debug\myPlugin.mll 生成debug的mll

debug 模式，在windows下有一些潜在的bug，如果想要避免这些bug最好别用QT template 类或者是只用release模式。

## Summary

整个编译还是有些复杂的，可能单独一个 qt 还好，但是连着 maya 的时候就会有很多问题了。

## Quote

> https://www.cnblogs.com/findumars/p/6253284.html
>
> https://blog.csdn.net/fanyun_01/article/details/79122558
>
> https://blog.csdn.net/simonforfuture/article/details/78580510
>
> https://blog.csdn.net/liang19890820/article/details/51774724
>
> https://blog.csdn.net/u010384916/article/details/54667627?utm_source=blogxgwz4
>
> http://help.autodesk.com/view/MAYAUL/2017/CHS/?guid=__files_GUID_13434252_F0BF_4AC0_B47B_09BD626B0881_htm
