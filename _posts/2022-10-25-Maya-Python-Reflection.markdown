---
layout:     post
title:      "Maya Python 反射"
subtitle:   "EPT"
date:       2022-10-25
update:     2022-10-95
author:     "elmagnifico"
header-img: "img/python-head-bg.jpg"
catalog:    true
tags:
    - Maya
    - Python
---

## Forward

最近开了一个弟弟，试用期写的代码真的漏洞百出，让人哭笑不得。



**笑话一**，`if`和`elif`条件为真的情况下可以顺序执行每一个情况，如果你刚学写代码我能理解，但是你不是

```python
if xxx:
  ...
elif xx:
  ...
elif x:
  ...
```



**笑话二**，类的成员函数，传递类的成员变量，完全没有面向对象的意识。

```python
self.classMethod(self.classMember1,self.classMember2,self.classMember3...)
```

这就好像你回家吃饭，还要给爸妈钱一样可笑。



**笑话三**，API函数，不知道对方的入参是什么，也不知道怎么获取入参

```
func(*args, **kwargs)
```

把变参称为无名参数，除了复制粘贴真就啥都不会了。



再一问反射，直接没听说过，感觉以后面试必问反射，我都怀疑我是咋招的人。



## 反射



#### 默认参数

获取默认参数非常简单，直接赋值，然后打印一下默认参数就行了

```python
import maya.cmds as cmds

def defaultButtonPush(*args):
  print 'Button 1 was pushed.'
  print args

cmds.window( width=150 )
cmds.columnLayout( adjustableColumn=True )
cmds.button( label='Button 1', command=defaultButtonPush )
cmds.showWindow()
```



但是如果要添加自定义参数，那么必须使用`CallbackWithArgs`然后再附加自己的参数，否则会把默认参数给覆盖了

```python
import maya.cmds as cmds

from pymel.all import CallbackWithArgs
def test(args,s):
    print(args,s)

def select1(*args, **kwargs):
    print args
    print kwargs

window = cmds.window()
cmds.columnLayout()
cmds.floatField(changeCommand = CallbackWithArgs(test,"custom"))
cmds.floatField(changeCommand=select1)
cmds.showWindow( window )
```

从实际的输出可以看出来，自定义参数在前，而默认参数在后，其实默认参数是`*args`，所以必须放在最后调用

```
('custom', 1.0)
```



反射有几种实现方式，一一介绍



#### eval反射

```python
import maya.cmds as cmds

#    Create a simple window containing a single column layout
#    and a button.
#
window = cmds.window(title='Control Example')
column = cmds.columnLayout()
button = cmds.button()
eval("cmds.button()")
cmds.showWindow( window )
```

这里eval其实就是直接执行string的代码，但是这种方式比较危险，相当于是什么都能执行，一般慎用。



#### getattr 反射

这里直接通过获取module中的函数来进行反射，实现的和eval一样效果

```python
print locals()
for a in locals():
    print a
a = getattr(cmds,"button")

window = cmds.window(title='Control Example')
column = cmds.columnLayout()
button = cmds.button()
a()
cmds.showWindow( window )
```



一般使用getattr还会配合下面的函数一起使用，从而比较完善，可以实现修改和查询是否有对应的函数

```python
hasattr
setattr
delattr
```



#### globals反射

```
class TestA(object):
    a=1
    def get_test(self):
        print("我是函数1")

    def instance(self):
        print("我是函数2")

    @staticmethod
    def test3():
        print("我是静态方法")


globals()["TestA"].test3()
```

这种其实是透过现象看本质，globals的返回是一个字典，所以可以通过字典的key访问的对应的函数。其实同理类或者其他对象，也可以通过获取字典，然后访问函数，完成反射

举一反三，只要能拿到字典结构，基本上都能被反射出来



#### methodcaller反射

```
from operator import methodcaller
  
class Circle(object):
    def __init__(self, radius):
        self.radius = radius
   def getArea(self):
        return round(pow(self.radius, 2) * pi, 2)
 
class Rectangle(object):
    def __init__(self, width, height):
         self.width = width
         self.height = height

    def get_area(self):
          return self.width * self.height
  
if __name__ == '__main__':
 c1 = Circle(5.0)
 r1 = Rectangle(4.0, 5.0)
   
 # 第一个参数是函数字符串名字，后面是函数要求传入的参数，执行括号中传入对象
 erea_c1 = methodcaller('getArea')(c1)
 erea_r1 = methodcaller('get_area')(r1)
 print(erea_c1, erea_r1)
```



## Summary

有了反射可以做什么，有了反射以后，有一些不方便面向对象，或者说需要写大量`if elif `或者`switch case`的情况，都可以被反射直接通杀



让这个弟弟写的对齐，一开始就写不出来，后来告诉他思路以后，总算写完了，耗时一周，代码质量只能说拉到底，一个功能写了七个函数，130行代码。

对比我自己写，50分钟，50行代码，一个函数，外加测试，只是随手写的代码，不刻意优化。毕业生和工作6年代码上的差距大概就这么多，其他方面就更不用说了。

招到这样的人真的不值得培养，完全是浪费时间，关键自己还不知道学习。



## Quote

> https://www.cnblogs.com/absoluteli/p/14090117.html
