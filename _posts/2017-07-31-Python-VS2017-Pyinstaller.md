---
layout:     post
title:      "Python in VS2017并且使用Pyinstaller打包成exe"
subtitle:   "Anaconda,VS2017,Pyinstaller"
date:       2017-07-31
author:     "elmagnifico"
header-img: "img/python-head-bg.jpg"
catalog:    true
tags:
    - python
---

## Foreword

Visual Studio 2017 同样也支持 python 。

python 可以使用3.6 或者2.7版本，通过工程环境配置就可以直接切换，十分快捷。

但是今天的主体不是 vs 的 python 多好用，而是解决如何在 win10 && VS2017 的环境下使用和
安装 python 以及各种插件。

### Python Version

python 这语言目前还残留着 2.x 的版本，很多时候很多相关资料也都是 2.x 的版本，直接拿来用
难免会出问题。

而同时呢还有着 3.x 的先进版本，相对资料少一点，但是 ，3.x 版本必然会取代 2.x 版本的，但
其实这都不是关键，关键是 python 支持各种 import ，各种包又有其对应的版本，这就导致实际
使用过程中，可能某一个或者某几个包过老或着过新都会导致出错，各种兼容性又需要手动调整，非
常麻烦，经常参考的程序就报错，报的错还不一定好解决。

#### 遇到的问题

- paramiko 各种安装不上，各种出错
- python 如何生成 .exe 文件
- pyinstaller 要如何在 python3.6 版本下使用
- Anaconda 如何切换工作环境为 python3.5
- 编码问题，gbk 与 utf-8

### Anaconda

> With over 4.5 million users, Anaconda is the world’s most popular and trusted data science ecosystem. We continue to innovate by leading development on open source projects that are the foundation of modern data science. We also offer products and services that help support, govern, scale, assure, customize and secure Anaconda for enterprises.
>
> https://www.continuum.io/downloads/

简单说，就是靠他来集成管理整个 python 语言自身的版本以及与版本相关联的插件版本。

通过 Anaconda 可以轻易的切换 python 版本，安装插件，切换插件版本等等。

原本需要手动管理的内容，全部交给 Anaconda 来完成。

#### 安装

建议默认安装就好，最省心，也最不容易出问题。

当前最新版本的 Anaconda 是 python3.6 ，需要其他版本的需要回退。

#### 切换 python 版本

打开 Anaconda Prompt ，也就是 Anaconda 提供给用户的终端。
所有 Anaconda 相关的命令都需要在这个终端下执行，而不是 cmd 或者什么其他的

    conda install python=3.5

等待整个更新完成，就成功把环境切换到了 python3.5 了

### 插件管理

直接从 Anaconda Navigator 中搜索 paramiko 以及 yaml 等插件，然后等待安装即可。

其中 py2exe 和 pyinstaller 都是不能直接通过 Anaconda 来进行安装的。

> https://anaconda.org/pypi/py2exe

虽然官网上有 py2exe 但是插件安装搜索不到，没法安装。

### pyinstaller

> PyInstaller is a program that freezes (packages) Python programs into stand-alone executables, under Windows, Linux, Mac OS X, FreeBSD, Solaris and AIX. Its main advantages over similar tools are that PyInstaller works with Python 2.7 and 3.3—3.5, it builds smaller executables thanks to transparent compression, it is fully multi-platform, and use the OS support to load the dynamic libraries, thus ensuring full compatibility.
>
> http://www.pyinstaller.org/

pyinstaller 主要是用来帮你把 py 脚本转化为 windows 下，可以直接打开的 .exe 文件，不需
要再安装其他的库即可使用。

目前 pyinstaller 最新版是 PyInstaller-3.2.1，而这个版本只支持到 python 3.5

##### python3.6

在 python3.6 下强行使用 pyinstaller 。

虽然 pyinstaller 写明了目前不支持3.6，但是在其 github 上的 develop 版本，确是支持的。
当然，既然是开发版，那么可能会有一些其他问题。

###### 安装

首先从 git 上下载源码

    git clone https://github.com/pyinstaller/pyinstaller

然后打开 Anaconda Prompt 切换到刚才的目录下，进行安装

    python setup.py install

如果是使用 Anaconda 环境，必须要在 Anaconda Prompt 下进行安装。

如果不是 Anaconda ，那么直接在 cmd 下执行就可以了

安装完成以后，切换到 develop版本下,然后把 PyInstaller 文件夹复制到

    x:\Python36-32\Lib\site-packages\PyInstaller

目录 这样就支持python3.6了 不过是开发版，可能还不完善。

这样就能正常使用了，不过我依然遇到了一个新问题，执行打包之后出现

    early pywin32 import was introduced

然后再看 github 上的提交，刚好加上了这条，而这个问题还没人遇到过，自然没有解释。

```python
import subprocess
import sys

from .log import logger

# Distinguish code for different major Python version.
is_py2 = sys.version_info[0] == 2
@@ -869,8 +870,11 @@ def check_requirements():
    if 'win32api' in sys.modules or 'pywintypes' in sys.modules:
    # Users should never see this error; if it occurs, it means someone
    # wasn't careful and added an import where it shouldn't be
        raise SystemExit("Internal error: early pywin32 import was introduced")

        # Unfortunately this error is triggered when running under pytest
        # since all PyInstaller runs are done in the same process
        logger.warning("Internal error: early pywin32 import was introduced")
        return

    try:
        from PyInstaller.utils.win32 import winutils
        try:
```

会出这个错大概就是有人不小心引用了不应该引用的文件，然后导致这样的，而实际上所有文件都是
直接拉下来的，那么也就只能说是版本冲突造成的了，没有啥其他办法，遇到这个就切换 python
版本吧

##### python3.5

在python3.5下，直接安装即可。

    python setup.py install

###### 使用

    pyinstaller [opts] demo.py
    
    　　可选的opts有：
    　　-F, –onefile 打包成一个exe文件。
    　　-D, –onedir 创建一个目录，包含exe文件，但会依赖很多文件（默认选项）。
    　　-c, –console, –nowindowed 使用控制台，无界面(默认)
    　　-w, –windowed, –noconsole 使用窗口，无控制台

指定 .py 文件，进行打包，平常多用于 -F ，只生成一个exe文件。

    pyinstaller -F  demo.py

当然也需要根据你使用的环境选择 cmd 或者 Anaconda Prompt 来执行

需要注意的是生成的 exe 是在同目录下的 dist 文件夹中生成 demo.exe，而不是当前目录下的
demo.exe ，我之前一直以为是当前目录，然后各种测试，发现exe文件执行了和没执行都一样，后
来才发现，原来不是这个 exe

### 编码问题

我需要编译的文件，有文件操作，进而出现了这个问题，之前这部分代码都存在于 python2.x 版本
上，所以之前没出问题。

    UnicodeDecodeError: 'gbk' codec can't decode byte 0x80 in position 34: illegal multibyte sequence

也就是说没有指定打开文件进行读取使用哪种编码方式，这里需要显式的指出来才行。

    open("data.txt",'r',encoding='UTF-8')

也可以通过，这里使用二进制的读取方式，从而跳过编码问题，进行文件操作，也是可以的。

    open('order.log','rb')

## Summary

之前一直装不好 pyinstaller，paramiko 以及 yaml，也跟我的环境有关。我的环境下有 VS 的2
个版本的 python：3.6.2  和 2.7，然后还有 Anaconda 的 3.6.2 的 python，还有一个装在我
用户名下的 3.6.0 的python，还有一个装在system下的 3.6.1 和 2.7 的python。环境太混乱了
，导致安装插件都不知道安装到了哪里，干脆一次性全部卸载了，然后重装一遍，总算是解决了上面
的问题

## Quote

> http://blog.csdn.net/freewind06/article/details/52140921?locationNum=6
>
> http://www.cnblogs.com/duan-qs/p/6548875.html
>
> http://blog.csdn.net/yz271212/article/details/71171824
>
> https://github.com/pyinstaller/pyinstaller/commit/c901c4265c1bd41332396e6e7ec7f5290bd79bb4
>
> http://blog.csdn.net/zhangyunfei_happy/article/details/47169939
>
> http://www.cnblogs.com/mengyu/p/6638975.html
