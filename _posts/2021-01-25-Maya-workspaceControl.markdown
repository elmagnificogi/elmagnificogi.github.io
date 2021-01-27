---
layout:     post
title:      "Maya workspaceControl造成的崩溃"
subtitle:   "崩溃，ui刷新"
date:       2021-01-25
update:     2021-01-26
author:     "elmagnifico"
header-img: "img/bg1.jpg"
catalog:    true
tags:
    - maya
    - python
---

## Foreword

Maya 2017有一个固定流程点击workspaceControl导致maya crash



## 现象

崩溃的现象基于maya 2017 无update的版本，cut id是2017201606150345-997974



- 运行下面的代码1次，点开侧边栏，刷新出来新建的workspace
- 折叠所有workspace，不是关闭！
- 再运行下面的代码一次，同时确保没有打开任意侧边栏（属性编辑器、通道等）
- 点击新建的workspace，必然触发maya崩溃



基于其他update的maya 2017

- 运行下面的代码1次，新建的workspace正常显示出来了
- 点击workspace，正常，折叠所有workspace
- 再次运行下面的代码
- 再点开workspace，触发崩溃



崩溃信息：

```
Stack trace:
  Qt5Core.dll!QMetaObject::cast
  ExtensionLayer.dll!TworkspaceCollapsedTabBar::expandControlAt
  ExtensionLayer.dll!TworkspaceCollapsedTabBar::mouseReleaseEvent
  Qt5Widgets.dll!QWidget::event
  Qt5Widgets.dll!QTabBar::event
  Qt5Widgets.dll!QApplicationPrivate::notify_helper
  Qt5Widgets.dll!QApplication::notify
  ExtensionLayer.dll!TwindowManager::windowPreferencesAreEnabled
  Qt5Core.dll!QCoreApplication::notifyInternal2
  Qt5Widgets.dll!QApplicationPrivate::sendMouseEvent
  Qt5Widgets.dll!QSizePolicy::QSizePolicy
  Qt5Widgets.dll!QSizePolicy::QSizePolicy
  Qt5Widgets.dll!QApplicationPrivate::notify_helper
  Qt5Widgets.dll!QApplication::notify
  ExtensionLayer.dll!TwindowManager::windowPreferencesAreEnabled
  Qt5Core.dll!QCoreApplication::notifyInternal2
  Qt5Gui.dll!QGuiApplicationPrivate::processMouseEvent
  Qt5Gui.dll!QGuiApplicationPrivate::processWindowSystemEvent
  Qt5Gui.dll!QWindowSystemInterface::sendWindowSystemEvents
  Qt5Core.dll!QEventDispatcherWin32::processEvents
  USER32.dll!DispatchMessageW
  USER32.dll!DispatchMessageW
  Qt5Core.dll!QEventDispatcherWin32::processEvents
  qwindows.dll!qt_plugin_query_metadata
  Qt5Core.dll!QEventLoop::exec
  Qt5Core.dll!QCoreApplication::exec
  ExtensionLayer.dll!Tapplication::start
  maya.exe!TiteratorWrapperBidir<TscenePartitions::ConstIteratorDescriptor,TiteratorWrapper<TscenePartitions::ConstIteratorDescriptor> >::operator=
  maya.exe!TiteratorWrapperBidir<TscenePartitions::ConstIteratorDescriptor,TiteratorWrapper<TscenePartitions::ConstIteratorDescriptor> >::operator=
  KERNEL32.DLL!BaseThreadInitThunk
  ntdll.dll!RtlUserThreadStart

```

推测是打开了老的workspace，而这个workspace已经被删了，ui上却没刷新，导致点了以后就崩溃了



## 崩溃代码

剧本编辑器里面，输入下面的代码，运行，得到一个workspace_docktest的侧边栏，这个侧边栏紧贴在属性编辑器下面，第一次运行时maya本身ui不会刷新，也就是看不到新建的workspace_docktest侧边栏，只有点一次其他侧边栏（属性编辑器或者通道之类的），这个侧边栏才会刷新

```python
import maya.cmds as cmds

dock_name = "workspace_dock"
dock_label_name = dock_name+"test"

def debug_print(*args):
    for arg in args:
        if type(arg) == unicode:
            print(arg.encode('gbk')),
        else:
            print(arg),
    print '\n'


# make sure just one gropus dock
if cmds.workspaceControl(dock_name, exists=True):
    debug_print("find origin one")
    cmds.deleteUI(dock_name)
debug_print(dock_name)

cmds.workspaceControl(dock_name, retain=False, floating=False,
                      tabToControl=["AttributeEditor", -1],rc="AttributeEditor",
                      initialHeight=800, initialWidth=200,
                      widthProperty="fixed", heightProperty="fixed",li=True,vis=True,
                      checksPlugins=True, label=dock_label_name, cc="print 'close'")

cmds.workspaceControl(dock_name, edit=True, uiScript="print 'open dock-------------'")
```



## 解决

之前一直想办法如何可以强制刷新maya  ui，但是苦于找不到api，只好探寻其他路子了，智伤帝说他update4不会崩溃（实际也会），我就升级试验了一下。然后找到现在的避开的办法。

如果是maya 2017 无update的版本，这个问题基本无解，除非你能保证你不会这样操作，但是只要一不小心有上面的操作顺序就会导致崩溃。

要解决这个问题就得升级maya，目前已知update4 和 update5，在通过增加一个折叠参数以后再也不会出现这个情况了。

代码如下：

```python
import maya.cmds as cmds

dock_name = "workspace_dock"
dock_label_name = dock_name+"test"

def debug_print(*args):
    for arg in args:
        if type(arg) == unicode:
            print(arg.encode('gbk')),
        else:
            print(arg),
    print '\n'


# make sure just one gropus dock
if cmds.workspaceControl(dock_name, exists=True):
    debug_print("find origin one")
    cmds.deleteUI(dock_name)
debug_print(dock_name)

cmds.workspaceControl(dock_name, retain=False, floating=False,clp=True
                      tabToControl=["AttributeEditor", -1],rc="AttributeEditor",
                      initialHeight=800, initialWidth=200,
                      widthProperty="fixed", heightProperty="fixed",li=True,vis=True,
                      checksPlugins=True, label=dock_label_name, cc="print 'close'")

cmds.workspaceControl(dock_name, edit=True, uiScript="print 'open dock-------------'")
```



具体参数：

![image-20210125174301524](https://i.loli.net/2021/01/25/5YrUTd8yZVHSvIe.png)

这个参数在maya 2017无update的版本中无法正常使用，会提示参数不存在。由于maya 2017是初版的qt5，导致workspaceControl里面同时还有其他参数实际上并没有实现，虽然有api解释，实际不可用。

比如：

![image-20210125174443020](https://i.loli.net/2021/01/25/8GMXQOnLHuhcty3.png)



stateString在无update中不可以用，而其他版本中直接返回空内容，很奇怪

![image-20210125174503443](https://i.loli.net/2021/01/25/w3HQ8f7YmDZpk5T.png)



同时无update的版本中，workspaceControl的创建不会刷新mayaUI，导致新建的ui看不到，直到你刚好动了新建的ui那一块区域才会刷新显示出来。



## 其他相关问题

workspaceControl 中的close事件，在创建时会自动触发一次，触发原因未知。



智伤帝推荐用 MayaQWidgetDockableMixin，实际上这个初期也存在挺多坑的，close事件无法执行，然后还有hide和close是同一个事件等等奇怪的问题

> http://discourse.techart.online/t/mayaqwidgetdockablemixin-closeevent-is-not-working/10573



maya 的所有发行版本和update、release note在这里

> https://knowledge.autodesk.com/support/maya/getting-started/caas/simplecontent/content/maya-release-notes.html?st=release%20notes



dockControl 在2017中也不能像低版本中一样随意嵌入已有UI中，代替dockContorl的基本就是workspaceControl 了



## Summary

感谢智伤帝和我一起讨论



## Quote

> https://blog.l0v0.com/

