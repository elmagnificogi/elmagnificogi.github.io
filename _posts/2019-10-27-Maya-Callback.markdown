---
layout:     post
title:      "Maya Callback与python partial和lambda"
subtitle:   "CallbackWithArgs，script,exec()，string"
date:       2019-10-27
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.png"
catalog:    true
tags:
    - Maya
    - python
---

## Forward

maya脚本快速开发的时候，大部分都会用MEL或者python来直接验证功能，而这个时候不可避免的就是要用到一些控件，并且给这些控件绑定一个函数，而绑定函数多种多样，到底选哪一种好呢。

## 控件中的script参数类型

> http://help.autodesk.com/view/MAYAUL/2017/ENU/

比如button中的command所需要的参数类型就是script，官方的例子如下

```python
import maya.cmds as cmds

def defaultButtonPush(*args):
  print 'Button 1 was pushed.'

cmds.window( width=150 )
cmds.columnLayout( adjustableColumn=True )
cmds.button( label='Button 1', command=defaultButtonPush )
cmds.button( label='Button 2' )
cmds.button( label='Button 3' )
cmds.button( label='Button 4' )
cmds.showWindow()
```

这种使用方式就比较简单，直接把函数传给了button，但是这样不能直接传递参数给这个函数，虽然这个button会默认传递一个参数进去（我也不知道这个参数是指什么的，官方没有说明）

#### string

```python
import maya.cmds as cmds

def defaultButtonPush(*args):
  print 'Button 1 was pushed.'
  print len(args)
  if len(args) == 0:
      print "None"
      return  
  print args


cmds.window( width=150 )
cmds.columnLayout( adjustableColumn=True )
cmds.button( label='Button 1', command=defaultButtonPush )
cmds.button( label='Button 1', command="defaultButtonPush(1,2)" )
cmds.showWindow()
```

依次按下button，可以看到对应的结果

```
Button 1 was pushed.
1
(False,)
Button 1 was pushed.
2
(1, 2)
```

可以看到，如果只传递这个func进去，那么会默认有一个参数，虽然不知道有啥用。

如果想传递 固定参数进去，那么可以直接将函数名和参数一起变成一个string传递进去，这样从这个函数里就能直接获取到对应的参数。

而如果直接给函数参数然后传递，就会有下面的报错，从这里可以反向判断出来，这个script要么是一个string要么是一个function。如果是一个string的话,其实相当于这里是执行了exec("defaultButtonPush(1,2)"),而且这个string可以写很长也能正常工作，更说明他是一个exec来执行的。

```
cmds.button( label='Button 1', command=defaultButtonPush(1,2))
# 错误: TypeError: file <maya console> line 14: 标志“command”的参数无效。应为 string or function，实际为 NoneType # 
```

#### partial

如果某些时候我不想传递一个固定参数值，而是有可能根据情况变，那要怎么办，partial就能解决你的问题

```python
import maya.cmds as cmds
from functools import partial

def defaultButtonPush(*args):
  print 'Button 1 was pushed.'
  print len(args)
  if len(args) == 0:
      print "None"
      return  
  print args

cmds.window( width=150 )
cmds.columnLayout( adjustableColumn=True )
cmds.button( label='function', command=defaultButtonPush)
cmds.button( label='string', command="defaultButtonPush(1,2)" )
cmds.button(label = "partial", width = 75,height = 20,command = partial(defaultButtonPush,(1,2)))
cmds.showWindow()
```

点击partial，以后可以看到，不但传递了我们自己想要的参数，还把这个button默认有的参数给传递进来了
```
Button 1 was pushed.
2
((1, 2), False)
```

可能你会觉得这有啥用啊，用处就在于maya的控件中除了button还有有许多其他控件，而且可以绑定函数的属性也不止是command，还有dragCallback,dropCallback等等，他们都有自己的默认参数，而这些参数可不是button这种传进来没什么用的False，而是鼠标位置或者按键状态或者是控件名称等等。这种情况下，既需要自己的参数又需要默认参数的时候，partial就是非常好的选择。

#### 动态与静态

partial也有一些小问题，比如partial本身传递的并不是原本的function，也就是说刚才的partial传递的不是全局变量中的defaultButtonPush函数，而是一个partial自己新建的一个function，只不过这个function是具有你自己的参数和这个函数原本的参数的一个新函数。

可能用惯了c或者c++，会觉得这个是其实传递的是一个函数指针，但是不是。如果在c或者c++中，这个是函数指针，那么你修改defaultButtonPush之后，再点击这个button，那么执行的是你修改后的defaultButtonPush。但是在python里不是，python里partial可以认为是静态的，或者说一单partial，就算你修改了defaultButtonPush，但是点击按钮得到的结果也是老的函数结果而不是最新的。

某种程度上说partial是按值传递的，是静态的，而函数指针则是动态的，按地址传递的，当然这也跟python本身是解释型语言也有关系。

#### lambda

还有一种办法，可以用来传递自己的参数，那就是用lambda

```python
import maya.cmds as cmds
from functools import partial

def defaultButtonPush(*args):
  print 'Button 1 was pushed.'
  print len(args)
  if len(args) == 0:
      print "None"
      return  
  print args

cmds.window( width=150 )
cmds.columnLayout( adjustableColumn=True )
cmds.button( label='function', command=defaultButtonPush)
cmds.button( label='string', command="defaultButtonPush(1,2)" )
cmds.button(label = "partial", width = 75,height = 20,command = partial(defaultButtonPush,(1,2)))
cmds.button(label = "lambda", width = 75,height = 20,command = lambda *args:defaultButtonPush(1,2))
cmds.showWindow()
```

运行lambda后的结果：

```
Button 1 was pushed.
2
(1, 2)
```

可以看到，正常运行了，并且参数也传递进去了，但是button本身的参数被覆盖掉了。

#### 强行传递参数

lambda最好的一点就是可以强行传递参数，如果原本这个函数是没有源码，不能修改的，那么用lambda就能让你给原本的函数封装一层，这样用来向下兼容。

```
import maya.cmds as cmds
from functools import partial

def defaultButtonPush(*args):
  print args
  return buttonPressed(args[0])

cmds.window( width=150 )
cmds.columnLayout( adjustableColumn=True )
cmds.button(label = "lambda", width = 75,height = 20,command = lambda *args:defaultButtonPush(1,2))
cmds.showWindow()
```

这里的buttonPressed相当于是老的接口，而defaultButtonPush则是封装后的接口

## module

上面的情况都是基于一个简单的python文件或者说直接在脚本编辑器里允许的，但是如果这个类或者这个函数是在一个module里面的时候或者是从其他文件间接调用的时候就比较麻烦了。

首先，string的方式就肯定不能正常工作了，因为defaultButtonPush的全名应该是module.defaultButtonPush,还有可能是package.module.defaultButtonPush,或者类似的，这样直接通过string绑定这个函数就肯定不能正常工作。

#### from xxx import xxxx

但是如果是通过 from xxx import xxxx 这种方式的话，还能正常工作，但是这种方式本身对于编码来说取消了命名空间，小工程还好，大工程的时候会出现各重命名的情况，而且起名字是个很麻烦的事情啊。

```
from xxx.yyy import defaultButtonPush
```

#### 拼串

当然如果defaultButtonPush直接成为了一个类函数，也是无法正常工作。当然也有办法，比如在command=xxxx这里拼字符串，对象名称+函数名+参数，拼串的方式强行让他工作，但是这样太蠢了，而且太复杂了，很容易搞错。再复合上package和module，那就更麻烦了。

```
button( command="myModule.buttonPressed("+str(param1)+str(param2)+")" )
```

#### lambda

lambda可以在module和class中正常工作，一点也不会被影响到，所以是比较好的选择

但是lambda本身有一个bug，在循环中使用lambda的时候会导致这里出现所有button绑定的都是最后一个lambda的结果

```python
import maya.cmds as cmds
def buttonPressed(name):
    print "pressed %s!" % name

win = cmds.window(title="My Window")
layout = cmds.columnLayout()
names = ['chad', 'robert', 'james']
for name in names:
    cmds.button( label=name, command = lambda *args: buttonPressed(name) )

cmds.showWindow()
```

点击所有button后：

```
pressed james!
pressed james!
pressed james!
```

官方说的比较难理解，这里简单说，第一次运行loop的时候，lambda的结果都是一个function，给到了这个command，但是这里传递function的时候是通过地址传递或者叫引用传递的，而后面第二次第三次运行循环体的时候，传递的其实是同一个对象，而这个对象并没有被复制传递或者说深copy，只是一个浅copy，这就导致了，最后一个对象的时候，他将对象的参数修改为了james，那么前面两个的值也同时被修改了。

为什么会出现这个问题呢，其实还和循环有关系，循环的时候本质上循环的并不是names，而是names的迭代器，也就是说lambda每次拿到的对象其实是这个for循环的迭代器，既然是迭代器，那就很好理解的，迭代器就是c中的指针，每次给lambda的是指针对象，那么lambda的最后结果必然是最后一个指针对象的结果。（多数人对于lambda这里出错的结论是lambda最后运行，所以lambda拿到的是最后一个变量，这句话就根本解释不通）

```
def buttonPressed(name):
    print "pressed %s!" % name

win = cmds.window(title="My Window")
layout = cmds.columnLayout()
name = ['chad', 'robert', 'james']
cmds.button( label=name[0], command = lambda *args: buttonPressed(name[0]) )
cmds.button( label=name[1], command = lambda *args: buttonPressed(name[1]) )
cmds.button( label=name[2], command = lambda *args: buttonPressed(name[2]) )

cmds.showWindow()

# 点击结果
pressed chad!
pressed robert!
pressed james!
```

当分开时，则不会出这个问题。

##### 解

```
import maya.cmds as cmds
import copy
def buttonPressed(name):
    print "pressed %s!" % name

win = cmds.window(title="My Window")
layout = cmds.columnLayout()
names = ['chad', 'robert', 'james']
def lf(func,par):
    return lambda fun,p=par:fun(p)
for name in names:
    cmds.button( label=name, command = lambda f,p=name:buttonPressed(p))
    cmds.button( label=name, command = lambda f,p:buttonPressed(p))

cmds.showWindow()
```

正确结果：

```
pressed chad!
pressed robert!
pressed james!
```

其实解lambda这个问题很简单，而且经常有人遇到lambda在for循环里工作异常的情况，简单说就是在这里重新给lambda的循环对象显示的指定值，而不是隐式的使用*args，这里的f完全充当一个占位符，没有任何其他用处。

## Callback or CallbackWithArgs

> http://help.autodesk.com/cloudhelp/2017/ENU/Maya-Tech-Docs/PyMel/ui.html#function-name-as-string

针对lambda的循环体无法正常工作，PyMEL给了他们自己的解，也就是 Callback or CallbackWithArgs，其实我已经解了这个问题不是吗？

#### 无视UI参数

Callback有一大特点，那就是无视了UI本身传递进来的参数，完全取决于用户自定义的参数。

```
from pymel.core import *

def buttonPressed(name):
    print "pressed %s!" % name

win = window(title="My Window")
layout = columnLayout()
names = ['chad', 'robert', 'james']
for name in names:
    button( label=name, command = Callback( buttonPressed, name ) )

showWindow()
```

#### 考虑UI参数

如果又需要UI参数又需要自定义参数，那要怎么办呢？用CallbackWithArgs就可以把UI自身的参数涵盖进来了。

```
import sys
# save the default console interface -- maya script editor
#__console__=sys.stdout
reload(sys)
# set gbk encode for Chinese
sys.setdefaultencoding('gbk')
import maya.cmds as cmds
import copy
from pymel.core import CallbackWithArgs
def buttonPressed(name,b):
    print "pressed %s!" % name,b

win = cmds.window(title="My Window")
layout = cmds.columnLayout()
names = ['chad', 'robert', 'james']
for name in names:
    cmds.button( label=name, command = CallbackWithArgs(buttonPressed,name))
cmds.showWindow()
```

结果：

```
pressed chad! False
pressed robert! False
pressed james! False
```

可以看到这样就能两面兼容。

## The end

maya本身的教程里很少说绑定函数要怎么绑，能搜到的解决方法大致也就是这么几个，其中以Callback和CallbackWithArgs最为方便好用，但是也比较难看到有人提及，主要是他们本身属于PyMEL,而PyMEL已经没落了，基本没人用了。

平常的话用lambda也就够了，偶尔用一用CallbackWithArgs

## Quote

> http://help.autodesk.com/cloudhelp/2017/ENU/Maya-Tech-Docs/PyMel/ui.html#callback-objects
>
> https://blog.csdn.net/qq_43218657/article/details/102492599
>
> https://blog.csdn.net/sheldon178/article/details/79364277
>
> https://www.cnblogs.com/liuq/p/6073855.html




