---
layout:     post
title:      "Maya-Python"
subtitle:   "pip, setuptools, plugin"
date:       2017-11-09
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
catalog:    true
tags:
    - python
    - maya
---

## Foreword

Maya里的脚本目前有三套，一个是MEL，一个是Python Script，还有一个PyMel。

MEL比较老了，多数maya使用者也比较熟悉，而且maya里表达式的书写也都是按照MEL的格式来的。

python则是近年新加进来的，感觉maya本身是想利用python的高度集成来为脚本开发提供更强大的功能，或者说是为了让写脚本更加简单，有更多高度集成的库可以用。

pymel则是有人不满足于脚本式的开发，面向过程的书写方式，希望能利用一下python的面向对象，所以就有了这种更加面向对象的表达形式。

目前我主要用python在写脚本，其中也遇到了maya python很多奇葩的问题。

## Maya Python

#### setuptools

虽然python自身集成了很多库，但是开发过程中还是会出现需要使用外部库的情况，这种时候就发现了maya的python非常的简陋，要啥没啥，连最基本的setuptools竟然都没有，但是python版本却是2.7.11.

首先下载 setuptools安装包

> https://pypi.python.org/pypi/setuptools#downloads

然后解压进入其目录，执行

    D:\Autodesk\Maya2017\bin\mayapy.exe setup.py install

不可以直接使用python.exe setup.py install,因为这样用的是你大环境中的python，并不是maya的python，必须指定你maya安装目录下的mayapy.exe才行

#### pip

有了setup tools以后总算可以正常安装其他包了，首先安装一下pip，这样很多其他常用的包就比较好装了。（有一个maya大佬说pip在maya2015无法正常使用，待测试）

同样首先下载pip

> https://pypi.python.org/pypi/pip#downloads

然后解压 安装

    D:\Autodesk\Maya2017\bin\mayapy.exe setup.py install

这里要注意使用pip的时候也是需要指定安装目录下的pip，不然就是默认大环境中的pip

比如查看安装的包：

    D:\Autodesk\Maya2017\Python\Scripts\pip.exe list
    
    F:\protobuf\protobuf-3.4.1\python>D:\Autodesk\Maya2017\Python\Scripts\pip.exe list
    DEPRECATION: The default format will switch to columns in the future. You can use --format=(legacy|columns) (or define a format=(legacy|columns) in your pip.conf under the [list] section) to disable this warning.
    Pillow (2.1.0)
    pip (9.0.1)
    protobuf (3.4.1)
    setuptools (36.6.0)
    six (1.11.0)

其实上面的必须指定安装目录也可以修改环境变量中的path以及python对应的路径来让maya的python成为主python，不过不建议这样，并不好。

#### PIL

之前有在maya里使用PIL模块，而为了安装这个PIL就废了好大功夫，最后放弃了。

PIL现在在python里一般都通过安装Pillow库进而导入使用。

> Pillow is a Python image library with several other libraries built-in. Because it is originally built with VC2008, we can't use the wheel package with Maya. We'll need to build it manually.

由于Pillow库本身依赖了好几个其他的库，其他库呢又是依赖于VC2008的，但是maya的python不是，他是vc2011，所以就导致了就算你能正常安装成功，也能import成功，但是其中的任何功能都不能用，只要一用就会提示

    Error: The _imaging C module is not installed

当初以为是我安装的Pillow模块有问题，根据这个搜了好多，尝试了各种解决办法，都没法正常工作，最后发现尼玛是maya的问题。

而你要正常使用这个Pillow库必须要手动重新编译整个python 编译所有Pillow依赖的库，复杂度极高，下面的是开发者给出的教程，但是还是有点简陋，其中会遇到的问题可能非常多。

> http://around-the-corner.typepad.com/adn/2017/05/how-to-build-pillow-on-windows-with-maya-2017.html

所以建议不要自己重新编译，完全得不偿失，而且还不知道其他库编译还有什么样的坑等着我们呢。

所以我建议这里如果用到其他的库，特别是难装的库，都通过PyInstaller来编译成exe或者thrift什么其他手段来完成，不要通过maya python来完成这个事。

#### protobuf

maya里用到了protobuf来转数据格式，所以这里再记录一下如何安装protobuf进maya

首先下载protobuf，其中有两个部分需要下载

> https://github.com/google/protobuf/releases

    protobuf-python-3.4.1.zip
    protoc-3.4.0-win32.zip （一般情况下这两个版本应该相同）

一个是python的安装文件，一个是windows本地的根据proto生成python文件的生成器


下载以后

    将   protobuf-win32\bin\protoc.exe
    放到 protobuf\protobuf-3.4.1\src

然后到 protobuf-3.4.1\python 目录下

    D:\Autodesk\Maya2017\bin\mayapy.exe setup.py build
    D:\Autodesk\Maya2017\bin\mayapy.exe setup.py test
    D:\Autodesk\Maya2017\bin\mayapy.exe setup.py install

如果有报错，根据错误提示去解错就好了

最后测试，使用下面的命令

    cmd
    【protec.exe的路径】-I=【proto文件所在的文件夹！注意是文件夹路径】 --python_out=【输出的文件路径】 【proto文件路径】.proto

比如

    F:\protobuf\protobuf-win32\bin\protoc.exe -I=F:\protobuf --python_out=F:\protobuf F:\protobuf\test.proto
    [libprotobuf WARNING google/protobuf/compiler/parser.cc:546] No syntax specified for the proto file: test.proto. Please use 'syntax = "proto2";' or 'syntax = "proto3";' to specify a syntax version. (Defaulted to proto2 syntax.)

这样就生成好了对应的python文件

## Summary

maya的python，还是有点坑的，如果有可能尽量还是用MEL吧，真的要实现什么大功能还是用c++ api吧，效率上也会高很多的。

## Quote

> http://blog.csdn.net/DongGeGe214/article/details/52199439
>
> https://www.cnblogs.com/yuanzm/p/4089856.html
>
> http://blog.sina.com.cn/s/blog_b2f983a50103058t.html
>
> http://discourse.techart.online/t/pil-python-image-library-maya-error-loading--imaging-module/4203
>
> https://mistermatti.wordpress.com/2014/02/04/maya-2014-with-pythons-pil-module/
>
> http://around-the-corner.typepad.com/adn/2017/05/how-to-build-pillow-on-windows-with-maya-2017.html
>
> http://www.jianshu.com/p/0c563b2c0fdb
>
> https://www.cnblogs.com/pheobe/p/5737725.html
