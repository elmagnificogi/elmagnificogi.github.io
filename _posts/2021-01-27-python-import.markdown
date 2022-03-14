---
layout:     post
title:      "python import相关问题"
subtitle:   "maya，同级目录"
date:       2021-01-27
author:     "elmagnifico"
header-img: "img/bg2.jpg"
catalog:    true
tags:
    - Maya
    - python
---

## Foreword

最近想实现一个python同名package的热更新，同时这个package是pyd加密后的，就遇到一系列问题。



## import

python的import简直太恶心了，说难听点，万恶之源。

像是c或者c++，其他语言引入其他库，可能就是加个头文件引用就行了，或者直接声明一下引入的库相关信息，一般对于路径或者同名库之类的问题都有很好的解决办法，但是python这里就非常困难了。



#### 同名module或者package

如果想在不同路径中引入同名module或者package，直接说结论不行。

先构建这个路径，注意a与b都是单纯的路径而不是package，他们本身路径中没有init.py

```
- a
    - test
     - __init__.py
     - test.py
- b
    - test
     - __init__.py
     - test.py
```

测试代码

```python
# 在a目录下
path_a = "a"
if not path_a in sys.path:
    sys.path.append(path_a)
import test
del test
del sys.modules["test"]

# 在b目录下
path_b = "b"
if not path_b in sys.path:
    sys.path.append(path_b)
import test
# 整个test依然是a路径的，b路径根本没导入，可以通过下面代码看到
for a in globals():
	print a,globals()[a]
# 可以看到打印出来的 test路径中是来自于aaa的
```



##### 变通

 既然同名module或者package不可以，那么不同名不就行了？

先构建一个路径,这里让原来的单纯路径a和b都变成了package

```
- a
	- __init__.py
    - test
     - __init__.py
     - test.py
- b
	- __init__.py
    - test
     - __init__.py
     - test.py
```

再次测试，就会发现只要路径加上了以后，test都能正常识别了，只是必须带着前面的package名字a或者b

如果想保持包名一致，并且是纯python的情况下，可以直接用reload来处理更新。

#### 热更新（纯py情况下）

在替换掉了实际路径中的test.py文件或者文件夹后，可以通过reload重新加载test package，从而实现热更新

```python
import test
reload(test)
```



#### 热更新（pyd情况下）

不行，pyd在maya中一旦加载以后，无法替换实际路径中的文件，文件处于被占用状态

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/dy783ilkfvT9R64.png)

之前有说明过

> http://elmagnifico.tech/2020/12/28/Cython-maya/



## pyd的解决方案

那pyd要实现热更新，就必须另起包名

```
- a
	- __init__.py
    - test
     - __init__.py
     - test.py
    - test1
     - __init__.py
     - test1.py     
```

由于我是从下图的结构转换成上图结构，这就导致以前可以直接import的模块找不到，因为a这个文件夹的路径不在sys.path中了（改成a的父文件夹在sys.path中）

```
- a
    - test
     - __init__.py
     - test.py
    - test1
     - __init__.py
     - test1.py     
```



#### 绝对路径与相对路径

这就要修改以前的import方式，从绝对路径改成相对路径import

```
# 以前是这样
print "test1"
import test
print "test1-e"

# 现在是这样
print "test1"
from ..test import test
#import test3
print "test2-e"
```

蛋疼的是这里我要改n多文件，一开始打算的各个package全都变成了子package，就非常蛋疼。



#### maya里的实际流程

修改更新流程

1. 解压新的文件结构到一个新目录下，并且生成一个init.py,让他成为一个package
2. 修改启动文件，如果有新目录那么就从新目录启动（import的就是新目录下的pyd），这时其实是一个临时的更新后的版本
3. 增加usersetup.py，当maya关闭以后，自动识别新目录，并删除老目录，将新目录修改成老目录名（新包替换老包），再次启动以后按照老包名启动

这样就没有什么问题了，用户更新以后既可以直接使用，不用重启maya，也可以在无声无息中把老包替换



## Summary

主要刚开始没考虑到要做到pyd热更新，只是py文件热更新而已。

以后如果要做python的热更新最好一开始就把整个工程或者说更新包都变成package，这样可以避免遇到无法加载的情况。

如果python可以加一个像c++一样的namespace，可能就不会有这么麻烦了

## Quote

> https://stackoverflow.com/questions/20075884/python-import-module-from-another-directory-at-the-same-level-in-project-hierar

