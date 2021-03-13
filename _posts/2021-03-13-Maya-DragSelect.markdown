---
layout:     post
title:      "Maya拖动选择插件"
subtitle:   "maya，draga"
date:       2021-03-13
author:     "elmagnifico"
header-img: "img/blackboard.jpg"
catalog:    true
tags:
    - maya
---

## Foreword

Maya本身有一个拖动选择，长按Tab，然后就可以拖动选择点，线，面，但是如果有大量的对象，就没办法用这个工具了，而C4D里直接就有官方的拖选。



## 思路

简单说，先能拿到maya的鼠标事件，然后根据对应的鼠标事件，处理鼠标滑过的地方，获取对应位置的对象，并且选择。

处理鼠标事件，很简单，用draggerContext，就能响应各种鼠标操作了

```python
import maya.cmds as cmds

# Procedure called on press
def SampleContextPress():
	pressPosition = cmds.draggerContext( 'sampleContext', query=True, anchorPoint=True)
	print ("Press: " + str(pressPosition))

# Procedure called on drag
def SampleContextDrag():
	dragPosition = cmds.draggerContext( 'sampleContext', query=True, dragPoint=True)
	button = cmds.draggerContext( 'sampleContext', query=True, button=True)
	modifier = cmds.draggerContext( 'sampleContext', query=True, modifier=True)
	print ("Drag: " + str(dragPosition) + "  Button is " + str(button) + "  Modifier is " + modifier + "\n")
	message = str(dragPosition[0]) + ", " + str(dragPosition[1])
	cmds.draggerContext( 'sampleContext', edit=True, drawString=message)

# Define draggerContext with press and drag procedures
cmds.draggerContext( 'sampleContext', pressCommand='SampleContextPress()', dragCommand='SampleContextDrag()', cursor='hand' );

# Set the tool to the sample context created
# Results can be observed by dragging mouse around main window
cmds.setToolTo('sampleContext')
```

而获取鼠标位置的对象，一开始不知道有api可以用，想着用相机位置和鼠标位置发射射线看和多少对象有碰撞或者穿插再获取对应的对象，再选择。后来发现有一个API直接可以用

selectFromScreen有两种重载，一个实现点选，一个实现圈选，我们的需求只需要点选就行了。

```c++

MStatus selectFromScreen	(	const short & 	x_pos,
const short & 	y_pos,
MGlobal::ListAdjustment 	listAdjustment = kAddToList,
MGlobal::SelectionMethod 	selectMethod = kWireframeSelectMethod 
)	


MStatus selectFromScreen	(	const short & 	start_x,
const short & 	start_y,
const short & 	end_x,
const short & 	end_y,
MGlobal::ListAdjustment 	listAdjustment = kAddToList,
MGlobal::SelectionMethod 	selectMethod = kWireframeSelectMethod 
)	
```

需要注意的是这里是c++的api，但是实际上python1.0或者2.0的api中都没有列出来，但是实际上是可以用的

同时c++的例子**marqueeTool**，也有对应的使用，比较详细一些。

但是如果直接搜maya python selectFromScreen 可能会得到类似下面的用法，他们是把python的数据通过MScriptUtil转成了对应的c++指针之类的用法，但是实际上在2016后期以后就不这么用了，这样写的都无法通过检测

```python
import maya.OpenMaya as OpenMaya
import maya.OpenMayaUI as OpenMayaUI
 def mySelectFromScreen():
 	myView = OpenMayaUI.M3dView.active3dView();
 	listAdjustment = OpenMaya.MGlobal.kReplaceList
 	myX = OpenMaya.MScriptUtil()
 	myX.createFromInt(0)
 	myY = OpenMaya.MScriptUtil()
 	myY.createFromInt(0)
 	myXend = OpenMaya.MScriptUtil()
 	myXend.createFromInt(myView.portWidth())
 	myYend = OpenMaya.MScriptUtil()
 	myYend.createFromInt(myView.portHeight())
 
 	OpenMaya.MGlobal.selectFromScreen ( myX.asShortPtr() , myY.asShortPtr(), myXend.asShortPtr(), myYend.asShortPtr(), listAdjustment ) 
 
```

> https://forums.cgsociety.org/t/api-python-calling-mglobal-selectfromscreen/1239853

这里给selectFromScreen也只需要简单输入数值类型就行了，完全不需要转换成指针或者c++类型。



## 实现

```python
select_tools_name = "select_tool"
def select_tools_press():
    import maya.OpenMaya as om
    pressPosition = cmds.draggerContext(select_tools_name, query=True, anchorPoint=True)
    modifier = cmds.draggerContext(select_tools_name, query=True, modifier=True)
    #debug_print("Press: " + str(pressPosition))
    #debug_print(pressPosition[0])
    #debug_print(pressPosition[1])
    list_adjustment = om.MGlobal.kAddToList
    #debug_print(modifier)
    if modifier == "ctrl":
        list_adjustment = om.MGlobal.kRemoveFromList

    om.MGlobal.selectFromScreen(int(pressPosition[0]), int(pressPosition[1]), list_adjustment)


def select_tools_drag():
    import maya.OpenMaya as om
    dragPosition = cmds.draggerContext(select_tools_name, query=True, dragPoint=True)
    modifier = cmds.draggerContext(select_tools_name, query=True, modifier=True)
    #debug_print("drag: " + str(dragPosition))
    #debug_print(dragPosition[0])
    #debug_print(dragPosition[1])
    list_adjustment = om.MGlobal.kAddToList
    #debug_print(modifier)
    if modifier == "ctrl":
        list_adjustment = om.MGlobal.kRemoveFromList

    om.MGlobal.selectFromScreen(int(dragPosition[0]), int(dragPosition[1]), list_adjustment)

cmds.draggerContext(select_tools_name, pressCommand=lambda *args: select_tools_press(),
                                dragCommand=lambda *args: select_tools_drag(), cursor='crossHair',i1="123d.png")

# change to the new tool
cmds.setToolTo(select_tools_name)
```

最后这里最好给一个img图标，否则切换到这个工具是空显示，空高亮。



## maya 图标等资源文件查看

maya的icon或者类似的图标图片文件，都存储到了一个dll中，也就是说是动态加载出来的，实际文件夹里基本没有，要直接查看或者调用官方代码里都是直接输入文件名的，都不带路径，而对应这样的文件到底有什么，就可以通过下面的方式来查看。

```python
import maya.app.general.resourceBrowser  as rb

resource_browser = rb.resourceBrowser()
resource_browser.run()
```



也可以通过这种方式直接预览所有的。

```python
import os
cmds.window()
scrollLayout = cmds.scrollLayout(w=150)
cmds.gridLayout( numberOfColumns=30, cellWidthHeight=(30, 30) )
for a in cmds.resourceManager(nameFilter="*.png"):
    cmds.symbolButton (image = a,c = 'os.popen( "cmd /c echo %s | clip")'%(a) )
cmds.showWindow()
```



## xpm图片文件

经常在maya的历程里看到xpm文件，每次点开都一脸懵逼，奇怪的格式，还不能预览。

> XPM(XPixMap)图形格式是X11中一个标准图形格式，它把图形保存成ASCII文本，一个XPM的定义不仅仅是ASCII形式，它的格式还可以是 C源代码形式的，可以直接将它编辑到自己的应用程序中去。
> XBM作为XPM的一个特例，也可以保存为ASCII和 C源码的形式，通常用作鼠标键盘指针。 GRUB下可支持的背景图片格式！

有两种办法可以直接查看预览xpm文件

Xnview

> https://www.xnview.com/en/

QtXPM预览和转换

> https://www.cnblogs.com/dragonsuc/p/4268234.html

如果要转换就连ps都不支持....CDR倒是可以，maya中有很多地方都使用了xpm文件，但是实际上使用ico或者png之类的图也都可以。



## Summary

这个命令还有一个小问题，不能像tab一样实时显示，一定要松手之后才能显示出来，同时如果撤销的话，是直接全撤销了，而不是只撤销刚才的那一次拖动选择。这两点感觉通过这个api好像不能解决，因为调用这个工具的时候maya本身viewport是锁定不刷新的，想要显示就必须是没触发这个事件的情况，这就和本身矛盾了。而撤销则是因为我本身是通过点选模拟出来的拖选，所以本来就不可能在事件中不断增加撤销栈，会导致其他操作全被冲了。



## Quote

> https://blog.csdn.net/weixin_31570677/article/details/106018746