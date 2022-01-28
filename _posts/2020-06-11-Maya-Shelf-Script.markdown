---
layout:     post
title:      "Maya 环境自动重配置"
subtitle:   "python"
date:       2020-06-11
author:     "elmagnifico"
header-img: "img/line-head-bg.jpg"
catalog:    true
tags:
    - maya
    - python
---

## Foreword

maya的环境配置文档里没有很多说明，很多都得摸索着来，这里记录一下常用到的配置文件存储和自动配置脚本

## 默认配置目录

首先默认配置目录是：

```
C:\Users\用户名\Documents\maya
```

删了这里的maya所有配置就都没了，而自动重配置也就是基于这个文件夹进行的

## maya\2017

maya\2017这个目录下主要是3个文件

- plug-ins
- zh_CN或者其他语言文件名
- Maya.env

#### plug-ins

plug-ins是默认插件目录，经常可以通过下面的代码获取到具体路径

```python
import maya.mel as mel
plugin_paths = mel.eval("getenv MAYA_PLUG_IN_PATH")
plugin_path = plugin_paths.split(';')[0]
```

#### Maya.env

部分摄影机属性或者场景属性，都存于此文件中，比较常用的就是下面的扩大渲染范围，扩大剪裁平面，防止由于缩放过高时，快速拖动场景中的对象而导致的maya崩溃

```
MAYA_ENABLE_MULTI_DRAW_CONSOLIDATION=0
MAYA_VP2_LOCALE_GRID_SIZE=5000
```

## zh_CN

语言中有四个文件，如果使用了中文或者其他语言，对应的配置文件大部分都存在这个文件夹中

- prefs 设置文件
- presets 预设文件
- scripts 启动脚本
- user.toolclips 不知道干啥用的

#### scripts

这里经常内置一个usersetup.py，用于在maya启动时进行加载或者运行部分插件代码.

比如mayaCharm需要的启动远程代码端口

```python
import maya.cmds as cmds

if not cmds.commandPort(':4434', query=True):

    cmds.commandPort(name=':4434')

print 'set the command port at 4434'
```

#### prefs

这里存着的配置文件就比较多了，很多都是比较常用的

- hotkeys 热键设置
- icons 图标
- mainWindowStates 未知
- markingMenus 菜单设置 
- scripts 脚本
- shelves 所有脚本button的配置
- workspaces/Maya_Classic.json 侧边栏等工作区域的配置信息
- synColorConfig.xml.lock 颜色配置相关
- synColorConfig.xml 颜色配置相关
- synColorFileRules.xml 颜色配置相关
- filePathEditorRegistryPrefs.mel 文件设置
- menuSetPrefs.mel 菜单设置 
- MTKShelf.mel 未知
- pluginPrefs.mel 自动加载的插件信息
- userNamedCommands.mel 自定义脚本命令信息
- userPrefs.mel 整个maya的settings，这个文件每次maya退出时会进行写保存，所以运行中修改并不能改变这个配置文件
- userRunTimeCommands.mel 用户设置的快捷键对应的脚本代码信息
- windowPrefs.mel 主要是窗口设置，窗口大小之类的东西
- MayaInterfaceScalingConfig 未知
- scriptEditorTemp 这里存的就是脚本编辑器中的临时代码，经常maya崩了或者删了maya导致脚本编辑器里刚写的代码没了，都是在这里的





#### hotkeys

maya默认使用的热键是不能修改的，如果复制一份，那么这里的hotkyes就会对应增加这个复制的快捷键配置信息

文件名规则如下

```
userHotkeys_快捷键配置名.mel
```

内容类似下图，就是通过mel设置并绑定上去而已

```
//Maya Preference 2017 (Release 1)
//
//

//
// The hotkey set
//
hotkeySet -source "Maya_Default" -current dd;
//
// The hotkey contexts and hotkeys
//
hotkey -keyShortcut "6" -ctl -name ("add_group_runtime");
hotkey -keyShortcut "8" -ctl -name ("select_same_color_runtime");
hotkey -keyShortcut "6" -name ("fix_material_color_runtime");
hotkey -keyShortcut "7" -ctl -name ("poll_group_runtime");
hotkey -keyShortcut "2" -ctl -name ("center_locator_runtime");
hotkey -keyShortcut "5" -ctl -name ("start_end_time_runtime");
hotkey -keyShortcut "5" -name ("fix_color_runtime");
hotkey -keyShortcut "2" -name ("select_color_obj_runtime");
hotkey -keyShortcut "3" -ctl -name ("axis_locator_runtime");
hotkey -keyShortcut "4" -ctl -name ("selcet_all_runtime");
hotkeyCtx -type "Editor" -addClient "hyperGraphPanel";
hotkeyCtx -type "Editor" -addClient "profilerPanel";
hotkeyCtx -type "Editor" -addClient "hyperShadePanel";
hotkeyCtx -type "Editor" -addClient "nodeEditorPanel";
hotkeyCtx -type "Editor" -addClient "outlinerPanel";
hotkeyCtx -type "Editor" -addClient "timeEditorPanel";
hotkeyCtx -type "Editor" -addClient "graphEditor";
hotkeyCtx -type "Editor" -addClient "polyTexturePlacementPanel";
hotkeyCtx -type "Editor" -addClient "shapePanel";
hotkeyCtx -type "Editor" -addClient "posePanel";
hotkeyCtx -type "Tool" -addClient "Unfold3DBrush";
hotkeyCtx -type "Tool" -addClient "sculptMeshCache";
hotkeyCtx -type "Tool" -addClient "texCutContext";
hotkeyCtx -type "Tool" -addClient "texSculptCacheContext";
hotkeyCtx -type "Tool" -addClient "SymmetrizeUVBrush";
```

#### shelves 

这里面就是各个面板上的shelf button的配置信息

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/UFfEJncNe4sl3O1.png)

手动加上去的也好，还是原生的也好，都记录在各个对应的文件夹中，并且都是通过mel的方式进行加载记录的

```
global proc shelf_Polygons () {
    global string $gBuffStr;
    global string $gBuffStr0;
    global string $gBuffStr1;


    shelfButton
        -enableCommandRepeat 1
        -enable 1
        -width 35
        -height 35
        -manage 1
        -visible 1
        -preventOverride 0
        -annotation "¶à±ßÐÎÇòÌå: ÔÚÕ¤¸ñÉÏ´´½¨¶à±ßÐÎÇòÌå" 
        -enableBackground 0
        -highlightColor 0.321569 0.521569 0.65098 
        -align "center" 
        -label "¶à±ßÐÎÇòÌå" 
        -labelOffset 0
        -rotation 0
        -flipX 0
        -flipY 0
        -useAlpha 1
        -font "plainLabelFont" 
        -overlayLabelColor 0.8 0.8 0.8 
        -overlayLabelBackColor 0 0 0 0.5 
        -image "polySphere.png" 
        -image1 "polySphere.png" 
        -style "iconOnly" 
        -marginWidth 1
        -marginHeight 1
        -command "CreatePolygonSphere" 
        -sourceType "mel" 
        -doubleClickCommand "CreatePolygonSphereOptions" 
        -commandRepeatable 1
        -flat 1
    ;
```

#### userPrefs.mel

这个里面的信息量极大，很多maya设置都是含在这里面的，很多时候需要修改这里的配置，但是注意有些配置信息是和外部的其他文件绑定的，需要同时修改，否则可能maya加载就报错了

```
//Maya Preference 2017 (Release 1)
//
//
keyTangent -global -inTangentType auto -outTangentType auto -weightedTangents true;
animDisplay -refAnimCurvesEditable false;
optionVar -fv gridSpacing 5 -fv gridDivisions 5 -fv gridSize 12 -intValue displayGridAxes 1 -intValue displayGridLines 1 -intValue displayDivisionLines 1 -intValue displayGridPerspLabels 0 -intValue displayGridOrthoLabels 0 -intValue displayGridAxesAccented 1 -stringValue displayGridPerspLabelPosition axis -stringValue displayGridOrthoLabelPosition edge;
nurbsToPolygonsPref -f 1 -ucr 0 -chr 0.9 -uch 0 -cht 1 -d 0.1 -es 0 -ft 0.01 -mel 0.001 -pc 200 -pt 0 -m 0 -mt 0.1 -mrt 0 -un 3 -ut 1 -vn 3 -vt 1 ;
nurbsCurveRebuildPref -fr 0 -rt 6 -d 3 -s 1 -tol 0.01 -end 1 -kr 1 -kep 1 -kt 0 -kcp 0 -scr 0;
constructionHistory -tgl on;

optionVar -version 3;
optionVar
 -iv "AEpopupWhenCreatingShaders" 1
 -sv "ASS ExportOptions" ""
 -sv "ASSOptions" ""
 -sv "Adobe(R) Illustrator(R)Options" "sc=1.0;group=on"
 -sv "AlembicOptions" ""
 -sv "BIFOptions" ""
 -sv "CATIAV4_ATFOptions" "ts=0;en=0;nt=15.0;st=0.0;gar=21.5;mel=11.314646;"
 -sv "CATIAV5_ATFOptions" "ts=0;en=0;nt=15.0;st=0.0;gar=21.5;mel=11.314646;"
 -iv "CB_IgnoreConfirmDelete" 0
 -ca "CameraSetToolNamingTemplate"
 -sva "CameraSetToolNamingTemplate" "['Multi Stereo Rig', 'shot', [['Near', u'StereoCamera', 1], ['Mid', u'StereoCamera', 1], ['Far', u'StereoCamera', 1]], 'cameraSet']"
 -iv "ChannelBox_ClearSelectionOnObjectSelectionChange" 0;
optionVar
 -sv "CreateNurbsCircleCtx" "createNurbsCircleCtx -e -image1 \"circle.png\" -image2 \"vacantCell.png\" -image3 \"vacantCell.png\" -normalType 2\n-normal 0 1 0 -sweep 360\n-degree 3\n-useTolerance 0\n-sections 8\n-toleranceType 1\n-tolerance 0.01\n-radius 1\n-attachToSections 1\n-doDragEdit 0\nCreateNurbsCircleCtx"
 -sv "CreateNurbsConeCtx" "createNurbsConeCtx -e -image1 \"cone.png\" -image2 \"vacantCell.png\" -image3 \"vacantCell.png\" -startSweep 0\n-endSweep 360\n-sections 8\n-spans 1\n-axisType 2\n-axis 0 1 0 -surfaceDegree 3\n-caps 1\n-extraTransformOnCaps 1\n-useTolerance 0\n-toleranceType 1\n-tolerance 0.01\n-radius 1\n-height 2\n-attachToSections 1\n-attachToSpans 1\n-attachToHeightRatio 1\n-doDragEdit 0\nCreateNurbsConeCtx"
 -sv "CreateNurbsCubeCtx" "createNurbsCubeCtx -e -image1 \"cube.png\" -image2 \"vacantCell.png\" -image3 \"vacantCell.png\" -uPatches 1\n-vPatches 1\n-axisType 2\n-axis 0 1 0 -surfaceDegree 3\n-width 1\n-depth 1\n-height 1\n-attachToPatchesU 1\n-attachToPatchesV 1\n-doDragEdit 0\nCreateNurbsCubeCtx"
 -sv "CreateNurbsCylinderCtx" "createNurbsCylinderCtx -e -image1 \"cylinder.png\" -image2 \"vacantCell.png\" -image3 \"vacantCell.png\" -startSweep 0\n-endSweep 360\n-sections 20\n-spans 1\n-axisType 2\n-axis 0 1 0 -surfaceDegree 3\n-caps 3\n-extraTransformOnCaps 1\n-useTolerance 0\n-toleranceType 1\n-tolerance 0.01\n-radius 1\n-height 2\n-attachToSections 1\n-attachToSpans 1\n-attachToHeightRatio 1\n-doDragEdit 0\nCreateNurbsCylinderCtx"
 -sv "CreateNurbsPlaneCtx" "createNurbsPlaneCtx -e -image1 \"plane.png\" -image2 \"vacantCell.png\" -image3 \"vacantCell.png\" -uPatches 1\n-vPatches 1\n-axisType 2\n-axis 0 1 0 -surfaceDegree 3\n-width 1\n-height 1\n-attachToPatchesU 1\n-attachToPatchesV 1\n-doDragEdit 0\nCreateNurbsPlaneCtx"
 -sv "CreateNurbsSphereCtx" "createNurbsSphereCtx -e -image1 \"sphere.png\" -image2 \"vacantCell.png\" -image3 \"vacantCell.png\" -axisType 2\n-axis 0 1 0 -startSweep 0\n-endSweep 360\n-degree 3\n-useTolerance 0\n-sections 8\n-spans 4\n-toleranceType 1\n-tolerance 0.01\n-radius 1\n-attachToSections 1\n-attachToSpans 1\n-attachToHeightRatio 1\n-doDragEdit 0\nCreateNurbsSphereCtx"
 -sv "CreateNurbsSquareCtx" "createNurbsSquareCtx -e -image1 \"square.png\" -image2 \"vacantCell.png\" -image3 \"vacantCell.png\" -spans 1\n-axisType 2\n-axis 0 1 0 -surfaceDegree 3\n-width 1\n-height 1\n-attachToSpans 1\n-doDragEdit 0\nCreateNurbsSquareCtx"
 -sv "CreateNurbsTorusCtx" "createNurbsTorusCtx -e -image1 \"torus.png\" -image2 \"vacantCell.png\" -image3 \"vacantCell.png\" -startSweep 0\n-endSweep 360\n-minorSweep 360\n-minorRadius 0.5\n-sections 8\n-spans 4\n-axisType 2\n-axis 0 1 0 -surfaceDegree 3\n-useTolerance 0\n-toleranceType 1\n-tolerance 0.01\n-radius 1\n-attachToSections 1\n-attachToSpans 1\n-attachToHeightRatio 1\n-doDragEdit 0\nCreateNurbsTorusCtx"

```

#### scriptEditorTemp 

由于maya是关闭时才会保存配置，所以如果写代码导致maya崩溃了，那就会导致实际的刚才写的代码并没有被保存下来。

需要注意的是，这里只是临时代码文件而已，实际上maya里是否能显示出来这个代码，取决于配置userPrefs.mel中是否有类似下面的代码

```
 -ca "ScriptEditorExecuterLabelArray"
 -sva "ScriptEditorExecuterLabelArray" "MEL"
 -sva "ScriptEditorExecuterLabelArray" "Python"
 -sva "ScriptEditorExecuterLabelArray" "Python"
 -sva "ScriptEditorExecuterLabelArray" "Python"
 -sva "ScriptEditorExecuterLabelArray" "Python"
 -iv "ScriptEditorExecuterTabIndex" 2
 -ca "ScriptEditorExecuterTypeArray"
 -sva "ScriptEditorExecuterTypeArray" "mel"
 -sva "ScriptEditorExecuterTypeArray" "python"
 -sva "ScriptEditorExecuterTypeArray" "python"
 -sva "ScriptEditorExecuterTypeArray" "python"
 -sva "ScriptEditorExecuterTypeArray" "python"
```

我这里是一个mel，还有4个python窗口，对应上面的代码

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/ckl9wgV7Bh5A6pS.png)

实际修改或者添加时也按照上述规则即可



## 自动配置

分享一下目前我用的自动配置脚本，可以直接运行完成部分基础配置。

主要功能：

- 提示关闭当前运行的maya

- 自动下载指定连接的插件或者插件备份，恢复到plug-ins文件夹中
- 修改userPrefs.mel，配置部分基础设置
- 将指定的插件自动添加shelf button到指定的shelf中
- 增加自启动脚本，用于MayaCharm



```python
# !/usr/bin/env python
# -*- coding: UTF-8 -*-
# use for first time set maya
import re
import codecs
import sys
import zipfile
import urllib
import os
import maya.cmds as cmds
import traceback

sys.stdout = sys.__stdout__
reload(sys)
# fix cant open file by direct double click
sys.setdefaultencoding('utf-8')


def add_shelf_button(name, cmd_file):
    shelf_file_path = os.environ['USERPROFILE'] + r'/documents/maya/2017/zh_CN/prefs/shelves/shelf_Polygons.mel'
    script_path = cmd_file  # os.environ['USERPROFILE'] + r'/documents/maya/2017/plug-ins/Dmd_launcher.py'
    print shelf_file_path

    newfile = ""
    script_f = codecs.open(script_path, 'r', "utf-8")

    for line in script_f.readlines():
        newfile += (line.rstrip()).replace("\\", "\\\\") + '\\n'
    codes = newfile.replace("\"", "\\\"")
    script_f.close()

    shelf_f = codecs.open(shelf_file_path, 'r')
    lines = shelf_f.readlines()
    shelf_f.close()

    shelf_f = codecs.open(shelf_file_path, 'w')
    newfile = ''
    for line in lines:
        if re.search("}", line):
            line = '\n'
            print line
        newfile += line

    shelfButton_list = [
        "    shelfButton",
        "        -enableCommandRepeat 1",
        "        -enable 1",
        "        -width 35",
        "        -height 35",
        "        -manage 1",
        "        -visible 1",
        "        -preventOverride 0",
        "        -annotation \"" + name + "script\"",
        "        -enableBackground 0",
        "        -highlightColor 0.321569 0.521569 0.65098 ",
        "        -align \"center\"",
        "        -label \"" + name + "\"",
        "        -labelOffset 0",
        "        -rotation 0",
        "        -flipX 0",
        "        -flipY 0",
        "        -useAlpha 1",
        "        -font \"plainLabelFont\"",
        "        -imageOverlayLabel \"" + name + "\"",
        "        -overlayLabelColor 0.8 0.8 0.8 ",
        "        -overlayLabelBackColor 0 0 0 0.5 ",
        "        -image \"pythonFamily.png\"",
        "        -image1 \"pythonFamily.png\"",
        "        -style \"iconOnly\" ",
        "        -marginWidth 1",
        "        -marginHeight 1",
        "        -command \"" + codes.encode('gbk') + "\"\n"
                                                      "        -sourceType \"python\"",
        "        -commandRepeatable 1",
        "        -flat 1",
        "    ;"
    ]

    for line in shelfButton_list:
        newfile += line + "\n"

    newfile += "}\n"
    shelf_f.write(newfile)
    shelf_f.close()


print u"开始设置,确保maya打开过至少一次，并且当前maya已经关闭"

result = os.popen('tasklist')
lst = result.read()

if re.search("maya.exe", lst):
    print u"maya 正在运行，请先关闭"
    cmds.confirmDialog(title='安装', icon='critical', message="maya 正在运行，请先关闭")
    sys.exit(1)

try:
    print u"下载远端插件"

    maya_location = os.environ['MAYA_LOCATION']
    print os.environ['MAYA_LOCATION']

    url = '插件连接'
    urllib.urlretrieve(url, maya_location + "/plugs.zip")

    plugin_path = os.environ['USERPROFILE'] + r'/documents/maya/2017/plug-ins'
    print plugin_path
    # check if we get file
    if not os.path.exists(maya_location + "/plugs.zip"):
        print u"安装文件不存在"
        sys.exit(1)

    zip_file = zipfile.ZipFile(maya_location + "/plugs.zip", 'r')
    for file in zip_file.namelist():
        zip_file.extract(file, plugin_path)

    env_file_path = os.environ['USERPROFILE'] + r'/documents/maya/2017/Maya.env'

    print u"设置防崩溃"

    env_file_path = os.environ['USERPROFILE'] + r'/documents/maya/2017/Maya.env'
    print env_file_path
    if not os.path.exists(env_file_path):
        f = open(env_file_path, 'w')
        f.close()

    env_file = open(env_file_path, 'r+')
    lines = env_file.readlines()
    env_file.close()
    newfile = ''
    find_vp2 = False
    find_mul_draw = False
    for line in lines:
        if re.search("MAYA_VP2_LOCALE_GRID_SIZE=5000", line):
            find_vp2 = True
        if re.search("MAYA_ENABLE_MULTI_DRAW_CONSOLIDATION=0", line):
            find_mul_draw = True
        newfile += line

    if not find_mul_draw:
        newfile += "\nMAYA_ENABLE_MULTI_DRAW_CONSOLIDATION=0\n"
    if not find_vp2:
        newfile += "\nMAYA_VP2_LOCALE_GRID_SIZE=5000\n"

    f = codecs.open(env_file_path, 'w')
    f.write(newfile)
    f.close()
    print u"        防崩溃修改成功        "

    print u"设置maya fps和z轴朝上"
    # set maya fps default to 10fps
    user_prefs_file_path = os.environ['USERPROFILE'] + r'/documents/maya/2017/zh_CN/prefs/userPrefs.mel'
    print user_prefs_file_path

    newfile = ''
    f = open(user_prefs_file_path, 'r+')
    lines = f.readlines()
    f.close()

    for line in lines:
        if re.search(" -sv \"workingUnitTime\"", line):
            line = " -sv \"workingUnitTime\" \"10fps\"" + '\n'
            print line
        if re.search(" -sv \"workingUnitTimeDefault\"", line):
            line = " -sv \"workingUnitTimeDefault\" \"10fps\"" + '\n'
            print line
        if re.search(" -sv \"upAxisDirection\"", line):
            line = " -sv \"upAxisDirection\" \"z\"" + '\n'
            print line

        newfile += line

    f = codecs.open(user_prefs_file_path, 'w')
    f.write(newfile)
    f.close()
    print u"设置maya fps，z轴朝上 成功"

    print u"增加插件按钮"

    curpath = ""
    if getattr(sys, 'frozen', False):
        curpath = os.path.dirname(sys.executable)
    elif __file__:
        curpath = os.path.dirname(__file__)
    print("curpath = %s" % curpath)

    add_shelf_button("插件1",curpath+r"/插件1.py")
    add_shelf_button("插件2", curpath+r"/插件2.py")
    add_shelf_button("插件3", curpath+r"/插件3.py")

    print u"增加插件按钮 成功"

    print u"设置pycharm maya联调"
    # make usersetup file for pythoncharm mayacharm cmd use
    user_script_file_path = os.environ['USERPROFILE'] + r'/documents/maya/2017/zh_CN/scripts/usersetup.py'
    print user_script_file_path
    user_script_file = open(user_script_file_path, 'w')
    user_script_file.write(
        "\r\nimport maya.cmds as cmds\r\nif not cmds.commandPort(':4434', query=True):\r\n    cmds.commandPort(name=':4434')\r\nprint 'set the command port at 4434'\r\n")
    user_script_file.close()
    print u"设置pycharm maya联调 成功"

    print u"安装完成，请重新打开maya"

except Exception, e:
    print u"错误，重试:" + str(e)
    print sys._getframe().f_lineno, 'traceback.format_exc():\n%s' % traceback.format_exc()
    traceback.print_exc()

```

需要注意的几个地方

- 文件编码，maya中文这里基本都是用的gbk，而不是utf8，文件中存储的都是gbk的编码，如果是其他语言也会有对应的语言编码
- 我自己导入的默认的code或者说脚本文件都是utf8编码的，所以存到maya配置中的时候需要转换成gbk的
- 插件备份地址链接是暴露出来的，相当于任何人都可以获取



有了上面的脚本只要在我自己的环境下就能正常运行了，但是如果是给小白使用，那还需要一点东西

下面是个bat脚本，主要就是调用mayapy来运行这个python，因为mayapython不会自动加到windows的运行环境之中，所以需要指定路径运行

```bat
set ENV_PATH=%MAYA_LOCATION%
set EXE_PATH=\bin\mayapy.exe
set "MAYA_PATH=%ENV_PATH%%EXE_PATH%"
@echo %MAYA_PATH% 

%MAYA_PATH% ./setup.py

pause
```

#### 自动打开maya

也有说法是直接自动打开maya，然后通过socket远程代码让maya执行部分初始化设置的代码。但是这里有两个问题

1. maya设置本身是退出后才保存的，实际上在maya打开的时候修改并没有用
2. 自动打开maya存在问题，maya处于非正常加载状态

常用的打开一个exe的代码如下

```python
os.system("maya.exe") 阻塞式打开
subprocess.Popen("maya.exe") 非阻塞式打开
```

但是他们都有一个问题，就是这样打开的maya和双击打开的不一样，具体哪里不一样，看一下加载时的log就知道了，这会导致很多插件无法加载并且报错

而且这样打开的maya，socket远程调用是不工作的，手动maya里打开端口都是无效的，具体原因未知，但是猜测是由于maya启动参数不同了，导致很多事情没做，而实际双击时maya的启动参数是什么，这个就不知道了

## Summary

大概就这些

## Quote

> https://blog.csdn.net/quantum7/article/details/88598500
>
> https://forums.cgsociety.org/t/running-maya-python-commands-from-external-editor/1503410/8
>
> http://discourse.techart.online/t/python-maya-open-commandport-for-mayapy/4363/2
>
> https://stackoverflow.com/questions/6485059/sending-multiline-commands-to-maya-through-python-socket
>
> https://stackoverflow.com/questions/28264406/opening-a-commandport-in-standalone-maya-for-unit-testing

