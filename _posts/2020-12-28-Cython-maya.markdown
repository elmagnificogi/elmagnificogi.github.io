---
layout:     post
title:      "Maya python转Cython"
subtitle:   "pyd，c"
date:       2020-12-28
update:     2021-01-27
author:     "elmagnifico"
header-img: "img/bg7.jpg"
catalog:    true
tags:
    - Maya
    - Cython
    - python
---

## Foreword

最近需要把.py或者.pyc转成pyd，也就是转成cython，如果只是普通的python，直接安装cython，然后就能正常用了。但是我这里是在maya python上搞，就很麻烦，折腾了一大圈，系统都重装了一遍（开发东西多了，重装一遍是真的要命，vs全家桶，pycharm，idea，adobe全家桶，vm全家桶，maya，mysql全家桶，java全家桶，谷歌全家桶....还有好些调试工具暂时没用到没重装）血亏。

先说普通的python 转 cython



## python -> cython

安装cython

```
python -m pip install cython
```

准备2个文件，一个是foo.py，这个是我们的实际要编译成pyd的py文件

```
def foo():
    print('Hello world')
    print('py to pyd')
```

一个是setup.py 这个是编译的编排文件，相当于是makefile

```
from distutils.core import setup
from Cython.Build import cythonize
setup(ext_modules = cythonize('foo.py'))
```

进入到foo.py和setup.py的文件夹下执行编译，得到pyd文件

```
python setup.py build_ext --inplace
```

测试，进入python，然后倒入pyd的库，执行一下，正常就能看到结果了

```
import foo
foo.foo()
```



## maya python -> cython

但是maya python 就没有这么简单了，我先记录一遍正确流程，后面再写踩了哪些坑



#### 环境

首先，maya python 和 cython 对环境的要求非常高，必须搞对，否则有一项出错，就会导致最后无法编译或者导入

我所说的正确流程都是基于下面的环境的，换了环境则一概不适用

- maya 2017/2016
- vs 2012 对应的是 msc v1700 ，vs tools 110，vc 2010和vc2012
- cython 0.26
- python 2.7.11
- win 10，64bit

一旦和我的情况不一样，按照我这样的操作可能会出错，出错只能自己解决。

#### 准备

##### cython

首先下载cython源码，千万不要使用pip install cython，有兼容性问题，同时不要用最新的版本。

就用0.26的版本，其他版本不能保证正确

> https://github.com/cython/cython/releases?after=0.26.1

下完以后解压，先放到一边备用。



##### python

下载python2.7.11版本，并安装，但是不要加入到path中

> https://www.python.org/downloads/release/python-2711/



然后将刚才安装的python目录下的文件拷贝到maya目录中，具体如下

```
新装的Python27/include 文件夹复制到 Maya2017\Python 中
Maya2017/lib/python27.lib 复制到 Maya2017\Python\libs\python27.lib，这里libs文件夹要新建
```

以上操作完成以后就可以开始安装了



#### 安装

进入到cython解压路径下，使用mayapy进行安装

```bat
D:\Autodesk\Maya2017\bin\mayapy.exe setup.py install

正常的话就能看到下面的提示了，全程无报错
Installing cygdb.exe script to D:\Autodesk\Maya2017\Python\Scripts
Installing cythonize-script.py script to D:\Autodesk\Maya2017\Python\Scripts
Installing cythonize.exe script to D:\Autodesk\Maya2017\Python\Scripts

Installed d:\autodesk\maya2017\python\lib\site-packages\cython-0.26-py2.7-win-amd64.egg
Processing dependencies for Cython==0.26
Finished processing dependencies for Cython==0.26
```



#### 测试

直接进入python，输入下面命令，无报错基本就正常了。

```python
D:\Autodesk\Maya2017\bin\mayapy.exe
import cython
from distutils.core import setup
from Cython.Build import cythonize
```
编译，还是上面python编译的文件，这里再用一下
```bat
python setup.py build_ext --inplace
```

然后打开maya，在脚本编辑器中测试，可以看到正常输出了Hello world，cython就可以正常工作了

```python
# 你的编译路径
path = r"F:\temp\cython"

import sys
if path not in sys.path:
	sys.path.append(path)
	
import foo
foo.foo()
```

目前我已经试过，将我原本的整个工程重新编译成pyd并且结合mll一起，整个插件还可以正常运行，没有出现明显的bug或者错误的情况



## 踩坑

首先要注意，maya2016和2017版本非常相近，所以他们可以按照上面流程正常工作，但是有小细节不同，2016还是早了一些，他用msc版本要早一些，python版本也要早一些。



#### maya 安装pip

首先从这里下载 get-pip.py 文件，来快速安装pip

> https://bootstrap.pypa.io/get-pip.py

进入对应目录，执行

```bat
D:\Autodesk\Maya2017\bin\mayapy.exe get-pip.py
```



#### pip 安装 cython

```bat
D:\Autodesk\Maya2017\bin\mayapy.exe -m pip install cython
```

这样确实安装了cython，并且没有报错，也不需要复制任何文件，并且使用下面命令不会报错

```python
import cython
from distutils.core import setup
```

但是，如果继续往下一步走，调用下面的命令就开始报错了。

```python
from Cython.Build import cythonize
```

报错提示

```bat
F:\temp>D:\Autodesk\Maya2017\bin\mayapy.exe
Python 2.7.11 (default, Dec 21 2015, 22:48:54) [MSC v.1700 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>> import cython
>>> import setuptools  # important
>>> from distutils.core import setup
>>> from Cython.Build import cythonize
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "D:\Autodesk\Maya2017\Python\lib\site-packages\Cython\Build\__init__.py", line 1, in <module>
    from .Dependencies import cythonize
  File "D:\Autodesk\Maya2017\Python\lib\site-packages\Cython\Build\Dependencies.py", line 48, in <module>
    from ..Compiler.Main import Context, CompilationOptions, default_options
  File "D:\Autodesk\Maya2017\Python\lib\site-packages\Cython\Compiler\Main.py", line 28, in <module>
    from .Scanning import PyrexScanner, FileSourceDescriptor
ImportError: DLL load failed: 找不到指定的模块。
```

ImportError: DLL load failed: 找不到指定的模块。 就这一句，找了半天，找不到对应的解决办法，现有的几个情况都是vs版本不正确，重新安装以后就正常了。（他们问题发生的比较早，当时的cython pip安装的就是老版本，可以兼容的，所以他们是其他地方出错而不是cython出错）现在直接安装cython自然就不兼容了，所以他们的解决办法失效了。这里报这个错以后就无法编译了，那就只能找解决办法了。

> https://stackoverflow.com/questions/53683874/how-to-import-pyd-files-into-maya



如果你没有这样一步步导入，而是直接编译，看到的是类似下面的错误，直接提示你找不到模块，而实际上import cython又是正确的，并且也安装了，让人费解

```bat
F:\temp\cython>"D:\Autodesk\Maya2017\bin\mayapy.exe" setup.py build_ext --inplace
running build_ext
failed to import Cython: DLL load failed: 找不到指定的模块。
error: Cython does not appear to be installed
```



还有一种可能报错

```
ImportError: DLL load failed 动态链接库(DLL)初始化例程失败
```

就是下面这帖子的做法，不建议这么做，这是用非常老的库，新版本或者新机器根本无法正常用这个方法

类似报vcarsall.bat错误，找不到之类的帖子都不建议看，太老了，早就过期了，而且好多库都不兼容这几个。

> https://blog.csdn.net/weixin_42825585/article/details/106851576
>
> https://blog.csdn.net/weixin_42825585/article/details/106803269
>
> https://www.cnblogs.com/gavinsimons/p/8359284.html



#### VC版本不正确

- Microsoft Visual C++ 2010 x64 Redistributable - 10.0.40219
- Microsoft Visual C++ 2010 x86 Redistributable - 10.0.40219

这里平常还会遇到一个问题，就是有时候可能你的vc版本太新了，而maya想要的比较老，就会导致各种vc版本不正确，不兼容的情况，这就只能卸了vc然后重装了



## 其他版本编译cython

基本所有有关 maya cython的帖子我都看过了，稍微有用一点的就这么几个，方法各不相同，有的没有做到位，只是表面能用而已，实际编译会出错



maya 2018/2019 版本，看起来比较简单，直接安装就行了，2017按照这个方法，最后编译的时候也会报错

> https://medium.com/@1null4null/cython-maya2018-2019-python2-7-17-921c548337b9

maya 2018

> https://vaishakp.com/2018/11/21/cython-in-maya-2018-windows/
>
> https://blog.csdn.net/qq_36338099/article/details/88760867
>
> https://www.jianshu.com/p/cdb5db0f2ebe



maya 2017 的相关讨论，说明了几个关键点，但是用处不大

> https://www.mail-archive.com/python_inside_maya@googlegroups.com/msg16944.html
>
> https://blog.csdn.net/newMiao001/article/details/108345263



maya 2016 的博文，2017主要是参考这里来做的

>  https://blog.csdn.net/lulongfei172006/article/details/87436906



maya 2014 cython 的帖子，他是反向操作，把maya python给拷进了正常python里，然后用正常python 来编译pyd，这样做要求非常高，必须maya python和正常python其原生编译的版本要一样才行，而其他版本的maya根本做不到，所以不推荐这种做法，还有很多其他问题

> https://www.cnblogs.com/ibingshan/p/10346354.html
>
> http://blog.sina.com.cn/s/blog_137fc1d750102wvm6.html



#### MSC VS 版本对应

> https://www.cnblogs.com/ibingshan/p/10343037.html



## maya不支持动态卸载

如果只是python程序本身可能可以动态加载pyd之类的扩展库，但是在maya这里当你引用了pyd之后，在windows系统这里pyd文件就直接被占用了，是无法直接删除替换的，一般想做到热更新或者不关闭maya的情况下替换已经import的pyd，基本是不可能的



#### 尝试如下

首先foo是pyd的模块，先加了路径 ，然后导入模块测试。

删除foo，尝试删除foo.pyd，占用

查看sys.modules.keys，可以看到foo依然还在

再次删除sys.modules中的foo，再次查看，foo不见了，尝试删除foo.pyd，占用

再次怀疑可能内存没有回收，先把内存回收gc.collect，尝试删除foo.pyd，占用

```
#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import sys
import maya.cmds as cmds
import maya.mel as mel

plugin_paths = mel.eval("getenv MAYA_PLUG_IN_PATH")
plugin_path = plugin_paths.split(';')[0]
path = plugin_path + '/Dmd_drama_editor_py'
if not path in sys.path:
    sys.path.append(path)

import foo
foo.foo()

del foo

sys.modules.keys()

if 'foo' in sys.modules:  
    del sys.modules["foo"]
sys.modules.keys()

import gc
gc.collect()
```

这样基本不可能实现当时的动态加载了，也就必须要重启maya，释放文件。

当然也可以通过建立多个文件夹来规避文件不能替换删除的问题，然后重新加载新目录下的文件



## Summary

看似简单的一个cython，到了maya这里就搞得很麻烦，重装一次电脑，简直血亏，希望后来者不会在这里被坑



## Quote

> https://blog.csdn.net/weixin_41363156/article/details/103932059
>
> https://blog.csdn.net/lulongfei172006/article/details/87436906

