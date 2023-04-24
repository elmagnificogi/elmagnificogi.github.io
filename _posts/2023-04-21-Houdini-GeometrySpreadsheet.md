---
layout:     post
title:      "Houdini python 入门"
subtitle:   "Sop，Obj,Geometry Spreadsheet数据导出"
date:       2023-04-21
update:     2023-04-24
author:     "elmagnifico"
header-img: "img/x5.jpg"
catalog:    true
tobecontinued: false
tags:
    - Houdini
    - Python
---

## Foreword

很久之前写过一次导出，但是代码找不到了，然后新版本的Houdini很多东西都变了，老代码很多地方不兼容了

新版的Houdini我选了19.5 python3.7，很多东西和以前的python2.7 不同了



## Houdini

Houdini有三种脚本语言，python，Vex，C++，类似Maya 有MEL、python、C++等

传统的python，由于单线程，很多地方都有瓶颈

C++，效率级别，但是开发起来比较麻烦

而Vex 有点类似C或者C++的语言设计，是直接编译运行的，并且可以并发多线程，所以效率上比python高很多，同时程序写起来也比较简单，算是既要又要的结合体。

当然这里Vex性能这么高，也是有代价的，Vex能干的事情是有限的，python和C++能够使用的API更加广泛

![image-20230421150628168](https://img.elmagnifico.tech/static/upload/elmagnifico/202304211506225.png)



## 新老版本切换

![image-20230421101223184](https://img.elmagnifico.tech/static/upload/elmagnifico/202304211014646.png)

如果是这种情况，这个是由于老版本Houdini转到新版本，导致节点缺失了，最好是重建一下



## 简单入门

需要注意Houdini官方文档中很多示例和代码都是python2.7的，可能直接在python3运行会报错



#### 名词解释

HOM，Houdini Object Model，其实就是python的API接口，主要是取代之前的老脚本语言HScript，windows里和maya一样，Houdini使用的python是专门定制的。



#### 外部执行python

这里先说外部执行python的方式，这种方式是凌驾在全局中的python，需要每次导入python包，并从场景中获取到信息，然后做一些修改或者数据导入导出，这种方式更像插件的工作方式



显示指定节点下的子节点

```python
import hou
children = hou.node("/obj").children()
for child in children:
    print(child.name())
```



显示节点树

```python
def print_tree(node, indent=0):
    for child in node.children():
        print (" " * indent + child.name())
        print_tree(child, indent + 3)
    # Press Enter to finish the definition
print_tree(hou.node('/'))
```



简单获取当前选中的节点

```python
import hou
nodes =hou.selectedNodes()
sel = hou.selectedNodes()[0]

print(sel)
print(nodes)
```



![image-20230421105902885](https://img.elmagnifico.tech/static/upload/elmagnifico/202304211059954.png)



这种方式仅适用于python SOP

```python
import hou
#获取当前的节点
node = hou.pwd()
 
#获取到当前节点的几何体（上级传入的几何体）
geo = node.geometry()
```

![image-20230421110346071](https://img.elmagnifico.tech/static/upload/elmagnifico/202304211103119.png)

如果直接在obj中使用，现在这个node直接获取到的是`/`路径，不是SOP，所以不能获取geometry



```python
obj.createNode('geo')
mybox = hou.node("/obj/box1")
```

创建节点有两种，一种是通过指定节点名创建，其实是相对路径，一种是指定完全路径进行创建



```python
import hou
nodes =hou.selectedNodes()
sel = hou.selectedNodes()[0]

print(sel)
print(nodes)

for p in sel.parms():
    print(p.name)

for p in sel.parmTuples():
    print(p.name)
```

查看节点拥有的属性有哪些，pram一般是指具有一个值属性，比如`tx、ty、tz`，而parmTuples则是具有一组值的属性，比如`t,r,s,p`

也可以从Parameter Spreadsheet中看到各种参数

![image-20230423145809664](https://img.elmagnifico.tech/static/upload/elmagnifico/202304231458760.png)



```python
import hou
#创建box
mybox = hou.node("/obj/box1")
print(mybox)

#获取box x轴的位置属性
mybox_tx = mybox.parm('tx')
print(mybox_tx)

#box 位置x变为10
mybox_tx.set(10)
print(mybox_tx.eval())
```

houdini的设置属性，一般都是`set`，但是如果想获取到属性值，就必须得用`eval`，他没有对应的`get`函数，这个和平常不太一样。

houdini的属性一般是作为一个独立参数存在的，所以不能直接用`对象.属性.eval()`，必须要`对象.parm('属性').eval()`



![image-20230421113853383](https://img.elmagnifico.tech/static/upload/elmagnifico/202304211138443.png)

从节点属性里也能看到它具有什么属性，以及属性名是什么

也可以直接从官方文档查看具体Geometry的属性具有哪些

> https://www.sidefx.com/docs/houdini/model/attributes.html

![image-20230421114321923](https://img.elmagnifico.tech/static/upload/elmagnifico/202304211143006.png)

不同层级的节点之间，有覆盖关系

![image-20230421114434644](https://img.elmagnifico.tech/static/upload/elmagnifico/202304211144718.png)



只是简单获取通道属性，也可以通过ch获取，就不需要eval了

```python
print(hou.ch("/obj/geo1/tx"))
```



也可以通过evalParm直接获取属性值

```
hou.evalParm('/obj/geo1/tx')
```



连接节点

```python
obj = hou.node("obj")
mygeo = obj.createNode('geo',run_init_scripts=False)
mybox = mygeo.createNode('box')
mysur = mygeo.createNode('subdivide')
#连接节点
mysur.setFirstInput(mybox)
#位置排列，相当按下L
mygeo.layoutChildren()
#设置显示属性
mysur.setDisplayFlag(True)
mysur.setRenderFlag(True)
```

`run_init_scripts`的作用主要是在Geometry中内置一个File SOP，如果设置为了False就不会做这个事情了，除此以外还有一些渲染相关的参数也不会被加到Geometry中



将节点移动到一个不被遮挡的地方

```python
node.moveToGoodPosition()
```



houdini 清空Shell，稍微蠢了点，但是没办法，没给接口

```python
print('\n' * 5000)
```



- 尽量将获取到的节点、参数等等存储起来方便下次使用，这个获取操作的性能消耗是比较多的
- 节点可以直接拖入Shell，可以直接获取到对应节点的路径和变量



Houdini也有类似Maya的启动脚本，可以自定义添加内容，也有事件Hook，可以响应各种操作并执行代码

Houdini有一个后台进程，可以把某些内容移动到后台去执行，然后通过EvenCallback返回进度之类的。



#### 反向代码

有的时候我们创建了一个非常复杂的节点的时候，如果要你把创建这个节点的所有代码写出来，很麻烦。有一些细节很有可能会写错或者遗漏，导致后续产生问题。Houdini有一个方便快捷的办法，可以直接获取到你的整个节点的代码



使用如下方式，可以将实现这个节点所需要python代码全部显示出来，进而就可以参考或者查询某些内容

```python
print(hou.node("/obj/box1").asCode())
```

也可以用来debug，确定是否问题



```python
# Initialize parent node variable.
if locals().get("hou_parent") is None:
    hou_parent = hou.node("/obj")

# Code for /obj/box1
hou_node = hou_parent.createNode("geo", "box1", run_init_scripts=False, load_contents=
True, exact_type_name=True)
hou_node.move(hou.Vector2(-7.57747, 4.00505))
hou_node.setSelectableInViewport(True)
hou_node.showOrigin(False)
hou_node.useXray(False)
hou_node.setDisplayFlag(True)
hou_node.hide(False)
hou_node.setSelected(True)

hou_parm_template_group = hou.ParmTemplateGroup()
# Code for parameter template
hou_parm_template = hou.FolderParmTemplate("stdswitcher4", "Transform", folder_type=ho
u.folderType.Tabs, default_value=0, ends_tab_group=False)
# Code for parameter template
hou_parm_template2 = hou.MenuParmTemplate("xOrd", "Transform Order", menu_items=(["srt
","str","rst","rts","tsr","trs"]), menu_labels=(["Scale Rot Trans","Scale Trans Rot","
Rot Scale Trans","Rot Trans Scale","Trans Scale Rot","Trans Rot Scale"]), default_valu
e=0, icon_names=([]), item_generator_script="", item_generator_script_language=hou.scr
iptLanguage.Python, menu_type=hou.menuType.Normal, menu_use_token=False, is_button_str
ip=False, strip_uses_icons=False)
hou_parm_template2.setJoinWithNext(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.MenuParmTemplate("rOrd", "Rotate Order", menu_items=(["xyz","
xzy","yxz","yzx","zxy","zyx"]), menu_labels=(["Rx Ry Rz","Rx Rz Ry","Ry Rx Rz","Ry Rz 
Rx","Rz Rx Ry","Rz Ry Rx"]), default_value=0, icon_names=([]), item_generator_script="
", item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuType.No
rmal, menu_use_token=False, is_button_strip=False, strip_uses_icons=False)
hou_parm_template2.hideLabel(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("t", "Translate", 3, default_value=([0, 0, 
0]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.parmLook.Regula
r, naming_scheme=hou.parmNamingScheme.XYZW)
hou_parm_template2.setTags({"autoscope": "1111111111111111111111111111111", "script_ac
tion": "import objecttoolutils\nobjecttoolutils.matchTransform(kwargs, 0)", "script_ac
tion_help": "Select an object to match the translation with.", "script_action_icon": "
BUTTONS_match_transform"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("r", "Rotate", 3, default_value=([0, 0, 0])
, min=0, max=360, min_is_strict=False, max_is_strict=False, look=hou.parmLook.Regular,
 naming_scheme=hou.parmNamingScheme.XYZW)
hou_parm_template2.setTags({"autoscope": "1111111111111111111111111111111", "script_ac
tion": "import objecttoolutils\nobjecttoolutils.matchTransform(kwargs, 1)", "script_ac
tion_help": "Select an object to match the rotation with.", "script_action_icon": "BUT
TONS_match_rotation"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("s", "Scale", 3, default_value=([1, 1, 1]),
 min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.parmLook.Regular, n
aming_scheme=hou.parmNamingScheme.XYZW)
hou_parm_template2.setTags({"autoscope": "1111111111111111111111111111111", "script_ac
tion": "import objecttoolutils\nobjecttoolutils.matchTransform(kwargs, 2)", "script_ac
tion_help": "Select an object to match the scale with.", "script_action_icon": "BUTTON
S_match_scale"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("p", "Pivot Translate", 3, default_value=([
0, 0, 0]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.parmLook.
Regular, naming_scheme=hou.parmNamingScheme.XYZW)
hou_parm_template2.setTags({"script_action": "import objecttoolutils\nobjecttoolutils.
matchTransform(kwargs, 3)", "script_action_help": "Select an object to match the pivot
 with.", "script_action_icon": "BUTTONS_match_pivot"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("pr", "Pivot Rotate", 3, default_value=([0,
 0, 0]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.parmLook.Re
gular, naming_scheme=hou.parmNamingScheme.XYZW)
hou_parm_template2.setTags({"script_action": "import objecttoolutils\nobjecttoolutils.
matchTransform(kwargs, 4)", "script_action_help": "Select an object to match the pivot
 rotation with.", "script_action_icon": "BUTTONS_match_pivot_rotation"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("scale", "Uniform Scale", 1, default_value=
([1]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.parmLook.Regu
lar, naming_scheme=hou.parmNamingScheme.Base1)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.MenuParmTemplate("pre_xform", "Modify Pre-Transform", menu_it
ems=(["clean","cleantrans","cleanrot","cleanscales","extract","reset"]), menu_labels=(
["Clean Transform","Clean Translates","Clean Rotates","Clean Scales","Extract Pre-tran
sform","Reset Pre-transform"]), default_value=0, icon_names=([]), item_generator_scrip
t="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuType
.StringReplace, menu_use_token=False, is_button_strip=False, strip_uses_icons=False)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("keeppos", "Keep Position When Parenting",
 default_value=False)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("childcomp", "Child Compensation", default
_value=False)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("constraints_on", "Enable Constraints", de
fault_value=False)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("constraints_path", "Constraints", 1, defa
ult_value=([""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParm
Type.NodeReference, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator
_script="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.me
nuType.Normal)
hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ constraints_on == 0 }"
)
hou_parm_template2.setTags({"opfilter": "!!CHOP", "oprelative": ".", "script_action": 
"import objecttoolutils\nobjecttoolutils.constraintsMenu(kwargs)", "script_action_help
": "", "script_action_icon": "BUTTONS_add_constraints"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("lookatpath", "Look At", 1, default_value=
([""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParmType.NodeR
eference, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator_script=""
, item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuType.Nor
mal)
hou_parm_template2.hide(True)
hou_parm_template2.setTags({"opfilter": "!!OBJ!!", "oprelative": "."})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("lookupobjpath", "Look Up Object", 1, defa
ult_value=([""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParm
Type.NodeReference, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator
_script="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.me
nuType.Normal)
hou_parm_template2.hide(True)
hou_parm_template2.setTags({"opfilter": "!!OBJ!!", "oprelative": "."})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("lookup", "Look At Up Vector", 1, default_
value=(["on"]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParmTy
pe.Regular, menu_items=(["off","on","quat","pos","obj"]), menu_labels=(["Don't Use Up 
Vector","Use Up Vector","Use Quaternions","Use Global Position","Use Up Object"]), ico
n_names=([]), item_generator_script="", item_generator_script_language=hou.scriptLangu
age.Python, menu_type=hou.menuType.Normal)
hou_parm_template2.hide(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("pathobjpath", "Path Object", 1, default_v
alue=([""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParmType.
NodeReference, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator_scri
pt="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuTyp
e.Normal)
hou_parm_template2.hide(True)
hou_parm_template2.setTags({"opfilter": "!!SOP!!", "oprelative": "."})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("roll", "Roll", 1, default_value=([0]), min
=-360, max=360, min_is_strict=False, max_is_strict=False, look=hou.parmLook.Angle, nam
ing_scheme=hou.parmNamingScheme.Base1)
hou_parm_template2.hide(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("pos", "Position", 1, default_value=([0]), 
min=0, max=10, min_is_strict=True, max_is_strict=False, look=hou.parmLook.Regular, nam
ing_scheme=hou.parmNamingScheme.Base1)
hou_parm_template2.hide(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.MenuParmTemplate("uparmtype", "Parameterization", menu_items=
(["uniform","arc"]), menu_labels=(["Uniform","Arc Length"]), default_value=1, icon_nam
es=([]), item_generator_script="", item_generator_script_language=hou.scriptLanguage.P
ython, menu_type=hou.menuType.Normal, menu_use_token=False, is_button_strip=False, str
ip_uses_icons=False)
hou_parm_template2.hide(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.IntParmTemplate("pathorient", "Orient Along Path", 1, default
_value=([1]), min=0, max=1, min_is_strict=False, max_is_strict=False, look=hou.parmLoo
k.Regular, naming_scheme=hou.parmNamingScheme.Base1, menu_items=([]), menu_labels=([])
, icon_names=([]), item_generator_script="", item_generator_script_language=hou.script
Language.Python, menu_type=hou.menuType.Normal, menu_use_token=False)
hou_parm_template2.hide(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("up", "Orient Up Vector", 3, default_value=
([0, 1, 0]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.parmLoo
k.Vector, naming_scheme=hou.parmNamingScheme.XYZW)
hou_parm_template2.hide(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("bank", "Auto-Bank factor", 1, default_valu
e=([0]), min=-1, max=1, min_is_strict=False, max_is_strict=False, look=hou.parmLook.Re
gular, naming_scheme=hou.parmNamingScheme.Base1)
hou_parm_template2.hide(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
hou_parm_template_group.append(hou_parm_template)
# Code for parameter template
hou_parm_template = hou.FolderParmTemplate("stdswitcher4_1", "Render", folder_type=hou
.folderType.Tabs, default_value=0, ends_tab_group=False)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("shop_materialpath", "Material", 1, defaul
t_value=([""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParmTy
pe.NodeReference, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator_s
cript="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menu
Type.Normal)
hou_parm_template2.setTags({"opfilter": "!!CUSTOM/MATERIAL!!", "oprelative": "."})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.MenuParmTemplate("shop_materialopts", "Options", menu_items=(
[]), menu_labels=([]), default_value=0, icon_names=([]), item_generator_script="", ite
m_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuType.Mini, me
nu_use_token=False, is_button_strip=False, strip_uses_icons=False)
hou_parm_template2.hide(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("tdisplay", "Display", default_value=False
)
hou_parm_template2.hideLabel(True)
hou_parm_template2.setJoinWithNext(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.IntParmTemplate("display", "Display", 1, default_value=([1]),
 min=0, max=1, min_is_strict=True, max_is_strict=True, look=hou.parmLook.Regular, nami
ng_scheme=hou.parmNamingScheme.Base1, menu_items=([]), menu_labels=([]), icon_names=([
]), item_generator_script="", item_generator_script_language=hou.scriptLanguage.Python
, menu_type=hou.menuType.Normal, menu_use_token=False)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.MenuParmTemplate("viewportlod", "Display As", menu_items=(["f
ull","points","box","centroid","hidden","subd"]), menu_labels=(["Full Geometry","Point
 Cloud","Bounding Box","Centroid","Hidden","Subdivision Surface / Curves"]), default_v
alue=0, icon_names=([]), item_generator_script="", item_generator_script_language=hou.
scriptLanguage.Python, menu_type=hou.menuType.Normal, menu_use_token=False, is_button_
strip=False, strip_uses_icons=False)
hou_parm_template2.setHelp("Choose how the object's geometry should be rendered in the
 viewport")
hou_parm_template2.setTags({"spare_category": "Render"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("vm_rendervisibility", "Render Visibility"
, 1, default_value=(["*"]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.
stringParmType.Regular, menu_items=(["*","primary","primary|shadow","-primary","-diffu
se","-diffuse&-reflect&-refract",""]), menu_labels=(["Visible to all","Visible only to
 primary rays","Visible only to primary and shadow rays","Invisible to primary rays (P
hantom)","Invisible to diffuse rays","Invisible to secondary rays","Invisible (Unrende
rable)"]), icon_names=([]), item_generator_script="", item_generator_script_language=h
ou.scriptLanguage.Python, menu_type=hou.menuType.StringReplace)
hou_parm_template2.setTags({"mantra_class": "object", "mantra_name": "rendervisibility
", "spare_category": "Render"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("vm_rendersubd", "Render Polygons As Subdi
vision (Mantra)", default_value=False)
hou_parm_template2.setTags({"mantra_class": "object", "mantra_name": "rendersubd", "sp
are_category": "Geometry"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("vm_subdstyle", "Subdivision Style", 1, de
fault_value=(["mantra_catclark"]), naming_scheme=hou.parmNamingScheme.Base1, string_ty
pe=hou.stringParmType.Regular, menu_items=(["mantra_catclark","osd_catclark"]), menu_l
abels=(["Mantra Catmull-Clark","OpenSubdiv Catmull-Clark"]), icon_names=([]), item_gen
erator_script="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=
hou.menuType.Normal)
hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ vm_rendersubd == 0 }")
hou_parm_template2.setTags({"mantra_class": "object", "mantra_name": "subdstyle", "spa
re_category": "Geometry"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("vm_subdgroup", "Subdivision Group", 1, de
fault_value=([""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringPa
rmType.Regular, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator_scr
ipt="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuTy
pe.Normal)
hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ vm_rendersubd == 0 }")
hou_parm_template2.setTags({"mantra_class": "object", "mantra_name": "subdgroup", "spa
re_category": "Geometry"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("vm_osd_quality", "Open Subdiv Quality", 1,
 default_value=([1]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=ho
u.parmLook.Regular, naming_scheme=hou.parmNamingScheme.Base1)
hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ vm_rendersubd == 0 vm_
subdstyle != osd_catclark }")
hou_parm_template2.setTags({"mantra_class": "object", "mantra_name": "osd_quality", "s
pare_category": "Geometry"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.IntParmTemplate("vm_osd_vtxinterp", "OSD Vtx Interp", 1, defa
ult_value=([2]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.par
mLook.Regular, naming_scheme=hou.parmNamingScheme.Base1, menu_items=(["0","1","2"]), m
enu_labels=(["No vertex interpolation","Edges only","Edges and Corners"]), icon_names=
([]), item_generator_script="", item_generator_script_language=hou.scriptLanguage.Pyth
on, menu_type=hou.menuType.Normal, menu_use_token=False)
hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ vm_rendersubd == 0 vm_
subdstyle != osd_catclark }")
hou_parm_template2.setTags({"mantra_class": "object", "mantra_name": "osd_vtxinterp", 
"spare_category": "Geometry"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.IntParmTemplate("vm_osd_fvarinterp", "OSD FVar Interp", 1, de
fault_value=([4]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.p
armLook.Regular, naming_scheme=hou.parmNamingScheme.Base1, menu_items=(["0","1","2","3
","4","5"]), menu_labels=(["Smooth everywhere","Sharpen corners only","Sharpen edges a
nd corners","Sharpen edges and propagated corners","Sharpen all boundaries","Bilinear 
interpolation"]), icon_names=([]), item_generator_script="", item_generator_script_lan
guage=hou.scriptLanguage.Python, menu_type=hou.menuType.Normal, menu_use_token=False)
hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ vm_rendersubd == 0 vm_
subdstyle != osd_catclark }")
hou_parm_template2.setTags({"mantra_class": "object", "mantra_name": "osd_fvarinterp",
 "spare_category": "Geometry"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FolderParmTemplate("folder0", "Shading", folder_type=hou.fold
erType.Tabs, default_value=0, ends_tab_group=False)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("categories", "Categories", 1, default_val
ue=([""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParmType.Re
gular, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator_script="", i
tem_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuType.Normal
)
hou_parm_template3.setHelp("A list of tags which can be used to select the object")
hou_parm_template3.setTags({"spare_category": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("reflectmask", "Reflection Mask", 1, defau
lt_value=(["*"]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParm
Type.NodeReferenceList, menu_items=([]), menu_labels=([]), icon_names=([]), item_gener
ator_script="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=ho
u.menuType.Normal)
hou_parm_template3.setHelp("Objects that will be reflected on this object.")
hou_parm_template3.setTags({"opexpand": "1", "opfilter": "!!OBJ/GEOMETRY!!", "oprelati
ve": "/obj", "spare_category": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("refractmask", "Refraction Mask", 1, defau
lt_value=(["*"]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParm
Type.NodeReferenceList, menu_items=([]), menu_labels=([]), icon_names=([]), item_gener
ator_script="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=ho
u.menuType.Normal)
hou_parm_template3.setHelp("Objects that will be refracted on this object.")
hou_parm_template3.setTags({"opexpand": "1", "opfilter": "!!OBJ/GEOMETRY!!", "oprelati
ve": "/obj", "spare_category": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("lightmask", "Light Mask", 1, default_valu
e=(["*"]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParmType.No
deReferenceList, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator_sc
ript="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuT
ype.Normal)
hou_parm_template3.setHelp("Lights that illuminate this object.")
hou_parm_template3.setTags({"opexpand": "1", "opfilter": "!!OBJ/LIGHT!!", "oprelative"
: "/obj", "spare_category": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("lightcategories", "Light Selection", 1, d
efault_value=(["*"]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.string
ParmType.Regular, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator_s
cript="", item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menu
Type.Normal)
hou_parm_template3.setTags({"spare_category": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("vm_lpetag", "LPE Tag", 1, default_value=(
[""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParmType.Regula
r, menu_items=([]), menu_labels=([]), icon_names=([]), item_generator_script="", item_
generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuType.Normal)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "lpetag", "spare_
category": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("vm_volumefilter", "Volume Filter", 1, def
ault_value=(["box"]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.string
ParmType.Regular, menu_items=(["box","gaussian","bartlett","catrom","hanning","blackma
n","sinc"]), menu_labels=(["Box Filter","Gaussian","Bartlett (triangle)","Catmull-Rom"
,"Hanning","Blackman","Sinc (sharpening)"]), icon_names=([]), item_generator_script=""
, item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuType.Nor
mal)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "filter", "spare_
category": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.FloatParmTemplate("vm_volumefilterwidth", "Volume Filter Widt
h", 1, default_value=([1]), min=0.001, max=5, min_is_strict=False, max_is_strict=False
, look=hou.parmLook.Regular, naming_scheme=hou.parmNamingScheme.Base1)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "filterwidth", "s
pare_category": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_matte", "Matte shading", default_value
=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "matte", "spare_c
ategory": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_rayshade", "Raytrace Shading", default
_value=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "rayshade", "spar
e_category": "Shading"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FolderParmTemplate("folder0_1", "Sampling", folder_type=hou.f
olderType.Tabs, default_value=0, ends_tab_group=False)
# Code for parameter template
hou_parm_template3 = hou.MenuParmTemplate("geo_velocityblur", "Geometry Velocity Blur"
, menu_items=(["off","on","accelblur"]), menu_labels=(["No Velocity Blur","Velocity Bl
ur","Acceleration Blur"]), default_value=0, icon_names=([]), item_generator_script="",
 item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuType.Norm
al, menu_use_token=False, is_button_strip=False, strip_uses_icons=False)
hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ allowmotionblur == 
0 }")
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("geo_accelattribute", "Acceleration Attrib
ute", 1, default_value=(["accel"]), naming_scheme=hou.parmNamingScheme.Base1, string_t
ype=hou.stringParmType.Regular, menu_items=([]), menu_labels=([]), icon_names=([]), it
em_generator_script="", item_generator_script_language=hou.scriptLanguage.Python, menu
_type=hou.menuType.Normal)
hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ geo_velocityblur != ac
celblur }")
hou_parm_template3.setTags({"spare_category": "Sampling"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FolderParmTemplate("folder0_2", "Dicing", folder_type=hou.fol
derType.Tabs, default_value=0, ends_tab_group=False)
# Code for parameter template
hou_parm_template3 = hou.FloatParmTemplate("vm_shadingquality", "Shading Quality", 1, 
default_value=([1]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou
.parmLook.Regular, naming_scheme=hou.parmNamingScheme.Base1)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "shadingquality",
 "spare_category": "Dicing"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.FloatParmTemplate("vm_flatness", "Dicing Flatness", 1, defaul
t_value=([0.05]), min=0, max=1, min_is_strict=False, max_is_strict=False, look=hou.par
mLook.Regular, naming_scheme=hou.parmNamingScheme.Base1)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "flatness", "spar
e_category": "Dicing"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.IntParmTemplate("vm_raypredice", "Ray Predicing", 1, default_
value=([0]), min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.parmLoo
k.Regular, naming_scheme=hou.parmNamingScheme.Base1, menu_items=(["0","1","2"]), menu_
labels=(["Disable Predicing","Full Predicing","Precompute Bounds"]), icon_names=([]), 
item_generator_script="", item_generator_script_language=hou.scriptLanguage.Python, me
nu_type=hou.menuType.Normal, menu_use_token=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "raypredice", "sp
are_category": "Dicing"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_curvesurface", "Shade Curves As Surfac
es", default_value=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "curvesurface", "
spare_category": "Dicing"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FolderParmTemplate("folder0_3", "Geometry", folder_type=hou.f
olderType.Tabs, default_value=0, ends_tab_group=False)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_rmbackface", "Backface Removal", defau
lt_value=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "rmbackface", "sp
are_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("shop_geometrypath", "Procedural Shader", 
1, default_value=([""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.str
ingParmType.NodeReference, menu_items=([]), menu_labels=([]), icon_names=([]), item_ge
nerator_script="", item_generator_script_language=hou.scriptLanguage.Python, menu_type
=hou.menuType.Normal)
hou_parm_template3.setTags({"opfilter": "!!SHOP/GEOMETRY!!", "oprelative": ".", "spare
_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_forcegeometry", "Force Procedural Geom
etry Output", default_value=True)
hou_parm_template3.setTags({"spare_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_rendersubdcurves", "Render Polygon Cur
ves As Subdivision (Mantra)", default_value=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "rendersubdcurves
", "spare_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.IntParmTemplate("vm_renderpoints", "Render As Points (Mantra)
", 1, default_value=([2]), min=0, max=10, min_is_strict=False, max_is_strict=False, lo
ok=hou.parmLook.Regular, naming_scheme=hou.parmNamingScheme.Base1, menu_items=(["0","1
","2"]), menu_labels=(["No Point Rendering","Render Only Points","Render Unconnected P
oints"]), icon_names=([]), item_generator_script="", item_generator_script_language=ho
u.scriptLanguage.Python, menu_type=hou.menuType.Normal, menu_use_token=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "renderpoints", "
spare_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.IntParmTemplate("vm_renderpointsas", "Render Points As (Mantr
a)", 1, default_value=([0]), min=0, max=10, min_is_strict=False, max_is_strict=False, 
look=hou.parmLook.Regular, naming_scheme=hou.parmNamingScheme.Base1, menu_items=(["0",
"1"]), menu_labels=(["Spheres","Circles"]), icon_names=([]), item_generator_script="",
 item_generator_script_language=hou.scriptLanguage.Python, menu_type=hou.menuType.Norm
al, menu_use_token=False)
hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ vm_renderpoints == 
0 }")
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "renderpointsas",
 "spare_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_usenforpoints", "Use N For Point Rende
ring", default_value=False)
hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ vm_renderpoints == 
0 }")
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "usenforpoints", 
"spare_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.FloatParmTemplate("vm_pointscale", "Point Scale", 1, default_
value=([1]), min=0, max=10, min_is_strict=True, max_is_strict=False, look=hou.parmLook
.Regular, naming_scheme=hou.parmNamingScheme.Base1)
hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ vm_renderpoints == 
0 }")
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "pointscale", "sp
are_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_pscalediameter", "Treat Point Scale as
 Diameter Instead of Radius", default_value=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "pscalediameter",
 "spare_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_metavolume", "Metaballs as Volume", de
fault_value=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "metavolume", "sp
are_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.IntParmTemplate("vm_coving", "Coving", 1, default_value=([1])
, min=0, max=10, min_is_strict=False, max_is_strict=False, look=hou.parmLook.Regular, 
naming_scheme=hou.parmNamingScheme.Base1, menu_items=(["0","1","2"]), menu_labels=(["D
isable Coving","Coving for displacement/sub-d","Coving for all primitives"]), icon_nam
es=([]), item_generator_script="", item_generator_script_language=hou.scriptLanguage.P
ython, menu_type=hou.menuType.Normal, menu_use_token=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "coving", "spare_
category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.StringParmTemplate("vm_materialoverride", "Material Override"
, 1, default_value=(["compact"]), naming_scheme=hou.parmNamingScheme.Base1, string_typ
e=hou.stringParmType.Regular, menu_items=(["none","full","compact"]), menu_labels=(["D
isabled","Evaluate for Each Primitve/Point","Evaluate Once"]), icon_names=([]), item_g
enerator_script="", item_generator_script_language=hou.scriptLanguage.Python, menu_typ
e=hou.menuType.Normal)
hou_parm_template3.setTags({"spare_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_overridedetail", "Ignore Geometry Attr
ibute Shaders", default_value=False)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "overridedetail",
 "spare_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
# Code for parameter template
hou_parm_template3 = hou.ToggleParmTemplate("vm_procuseroottransform", "Proc Use Root 
Transform", default_value=True)
hou_parm_template3.setTags({"mantra_class": "object", "mantra_name": "procuseroottrans
form", "spare_category": "Geometry"})
hou_parm_template2.addParmTemplate(hou_parm_template3)
hou_parm_template.addParmTemplate(hou_parm_template2)
hou_parm_template_group.append(hou_parm_template)
# Code for parameter template
hou_parm_template = hou.FolderParmTemplate("stdswitcher4_2", "Misc", folder_type=hou.f
olderType.Tabs, default_value=0, ends_tab_group=False)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("use_dcolor", "Set Wireframe Color", defau
lt_value=False)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.FloatParmTemplate("dcolor", "Wireframe Color", 3, default_val
ue=([1, 1, 1]), min=0, max=1, min_is_strict=True, max_is_strict=True, look=hou.parmLoo
k.ColorSquare, naming_scheme=hou.parmNamingScheme.RGBA)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("picking", "Viewport Selecting Enabled", d
efault_value=True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.StringParmTemplate("pickscript", "Select Script", 1, default_
value=([""]), naming_scheme=hou.parmNamingScheme.Base1, string_type=hou.stringParmType
.FileReference, file_type=hou.fileType.Any, menu_items=([]), menu_labels=([]), icon_na
mes=([]), item_generator_script="", item_generator_script_language=hou.scriptLanguage.
Python, menu_type=hou.menuType.StringReplace)
hou_parm_template2.setTags({"filechooser_mode": "read"})
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("caching", "Cache Object Transform", defau
lt_value=True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("vport_shadeopen", "Shade Open Curves In V
iewport", default_value=False)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.ToggleParmTemplate("vport_displayassubdiv", "Display as Subdi
vision in Viewport", default_value=False)
hou_parm_template2.hide(True)
hou_parm_template.addParmTemplate(hou_parm_template2)
# Code for parameter template
hou_parm_template2 = hou.MenuParmTemplate("vport_onionskin", "Onion Skinning", menu_it
ems=(["off","xform","on"]), menu_labels=(["Off","Transform only","Full Deformation"]),
 default_value=0, icon_names=([]), item_generator_script="", item_generator_script_lan
guage=hou.scriptLanguage.Python, menu_type=hou.menuType.Normal, menu_use_token=False, 
is_button_strip=False, strip_uses_icons=False)
                                            
# add param to template
hou_parm_template.addParmTemplate(hou_parm_template2)
# add template to group
hou_parm_template_group.append(hou_parm_template)
# add group to node  
hou_node.setParmTemplateGroup(hou_parm_template_group)
                                                   
# Code for /obj/box1/stdswitcher1 parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("stdswitcher1")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/xOrd parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("xOrd")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("srt")
hou_parm.setAutoscope(False)


# Code for /obj/box1/rOrd parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("rOrd")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("xyz")
hou_parm.setAutoscope(False)


# Code for /obj/box1/t parm tuple
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm_tuple = hou_node.parmTuple("t")
hou_parm_tuple.lock((False, False, False))
hou_parm_tuple.deleteAllKeyframes()
hou_parm_tuple.set((0, 0, 0))
hou_parm_tuple.setAutoscope((True, True, True))


# Code for /obj/box1/r parm tuple
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm_tuple = hou_node.parmTuple("r")
hou_parm_tuple.lock((False, False, False))
hou_parm_tuple.deleteAllKeyframes()
hou_parm_tuple.set((0, 0, 0))
hou_parm_tuple.setAutoscope((True, True, True))


# Code for /obj/box1/s parm tuple
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm_tuple = hou_node.parmTuple("s")
hou_parm_tuple.lock((False, False, False))
hou_parm_tuple.deleteAllKeyframes()
hou_parm_tuple.set((1, 1, 1))
hou_parm_tuple.setAutoscope((True, True, True))


# Code for /obj/box1/p parm tuple
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm_tuple = hou_node.parmTuple("p")
hou_parm_tuple.lock((False, False, False))
hou_parm_tuple.deleteAllKeyframes()
hou_parm_tuple.set((0, 0, 0))
hou_parm_tuple.setAutoscope((False, False, False))


# Code for /obj/box1/pr parm tuple
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm_tuple = hou_node.parmTuple("pr")
hou_parm_tuple.lock((False, False, False))
hou_parm_tuple.deleteAllKeyframes()
hou_parm_tuple.set((0, 0, 0))
hou_parm_tuple.setAutoscope((False, False, False))


# Code for /obj/box1/scale parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("scale")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/pre_xform parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("pre_xform")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("clean")
hou_parm.setAutoscope(False)


# Code for /obj/box1/keeppos parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("keeppos")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/childcomp parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("childcomp")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/constraints_on parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("constraints_on")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/constraints_path parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("constraints_path")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/lookatpath parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("lookatpath")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/lookupobjpath parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("lookupobjpath")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/lookup parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("lookup")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("on")
hou_parm.setAutoscope(False)


# Code for /obj/box1/pathobjpath parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("pathobjpath")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/roll parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("roll")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/pos parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("pos")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/uparmtype parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("uparmtype")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("arc")
hou_parm.setAutoscope(False)


# Code for /obj/box1/pathorient parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("pathorient")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/up parm tuple
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm_tuple = hou_node.parmTuple("up")
hou_parm_tuple.lock((False, False, False))
hou_parm_tuple.deleteAllKeyframes()
hou_parm_tuple.set((0, 1, 0))
hou_parm_tuple.setAutoscope((False, False, False))


# Code for /obj/box1/bank parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("bank")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/shop_materialpath parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("shop_materialpath")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/shop_materialopts parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("shop_materialopts")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("override")
hou_parm.setAutoscope(False)


# Code for /obj/box1/tdisplay parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("tdisplay")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/display parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("display")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/use_dcolor parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("use_dcolor")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/dcolor parm tuple
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm_tuple = hou_node.parmTuple("dcolor")
hou_parm_tuple.lock((False, False, False))
hou_parm_tuple.deleteAllKeyframes()
hou_parm_tuple.set((1, 1, 1))
hou_parm_tuple.setAutoscope((False, False, False))


# Code for /obj/box1/picking parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("picking")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/pickscript parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("pickscript")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/caching parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("caching")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vport_shadeopen parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vport_shadeopen")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vport_displayassubdiv parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vport_displayassubdiv")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vport_onionskin parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vport_onionskin")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("off")
hou_parm.setAutoscope(False)


# Code for /obj/box1/stdswitcher41 parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("stdswitcher41")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/viewportlod parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("viewportlod")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("full")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_rendervisibility parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_rendervisibility")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("*")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_rendersubd parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_rendersubd")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_subdstyle parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_subdstyle")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("mantra_catclark")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_subdgroup parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_subdgroup")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_osd_quality parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_osd_quality")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_osd_vtxinterp parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_osd_vtxinterp")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(2)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_osd_fvarinterp parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_osd_fvarinterp")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(4)
hou_parm.setAutoscope(False)


# Code for /obj/box1/folder01 parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("folder01")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/categories parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("categories")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/reflectmask parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("reflectmask")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("*")
hou_parm.setAutoscope(False)


# Code for /obj/box1/refractmask parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("refractmask")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("*")
hou_parm.setAutoscope(False)


# Code for /obj/box1/lightmask parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("lightmask")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("*")
hou_parm.setAutoscope(False)


# Code for /obj/box1/lightcategories parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("lightcategories")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("*")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_lpetag parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_lpetag")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_volumefilter parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_volumefilter")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("box")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_volumefilterwidth parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_volumefilterwidth")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_matte parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_matte")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_rayshade parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_rayshade")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/geo_velocityblur parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("geo_velocityblur")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("off")
hou_parm.setAutoscope(False)


# Code for /obj/box1/geo_accelattribute parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("geo_accelattribute")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("accel")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_shadingquality parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_shadingquality")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_flatness parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_flatness")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0.050000000000000003)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_raypredice parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_raypredice")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_curvesurface parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_curvesurface")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_rmbackface parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_rmbackface")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/shop_geometrypath parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("shop_geometrypath")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_forcegeometry parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_forcegeometry")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_rendersubdcurves parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_rendersubdcurves")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_renderpoints parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_renderpoints")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(2)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_renderpointsas parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_renderpointsas")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_usenforpoints parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_usenforpoints")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_pointscale parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_pointscale")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_pscalediameter parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_pscalediameter")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_metavolume parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_metavolume")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_coving parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_coving")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_materialoverride parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_materialoverride")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set("compact")
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_overridedetail parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_overridedetail")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(0)
hou_parm.setAutoscope(False)


# Code for /obj/box1/vm_procuseroottransform parm 
if locals().get("hou_node") is None:
    hou_node = hou.node("/obj/box1")
hou_parm = hou_node.parm("vm_procuseroottransform")
hou_parm.lock(False)
hou_parm.deleteAllKeyframes()
hou_parm.set(1)
hou_parm.setAutoscope(False)


hou_node.setExpressionLanguage(hou.exprLanguage.Hscript)

if hasattr(hou_node, "syncNodeVersionIfNeeded"):
    hou_node.syncNodeVersionIfNeeded("19.5.569")
```

可以看出来就是简单的一个box，就有一千多行代码，大部分都是在设置参数



加载HIP文件

```python
try:
    hou.hipFile.load("myfile.hip")
except hou.LoadWarning, e:
    print(e)
```





导出顶点数据

![image-20230423181637640](https://img.elmagnifico.tech/static/upload/elmagnifico/202304231816702.png)

```python
import hou
_geo = hou.node('/obj/geo1/box1').geometry()
# 获得所有点
_points = _geo.points()
#打印每一个顶点的ID和POS
for p in _points:
    _pos = p.position()
    print("(%d) -> x=%f, y=%f, z=%f" % (p.number(), _pos[0], _pos[1], _pos[2]))
 
#获得序号30-39（不包括39），每隔一个的点的集合
_glob = _geo.globPoints('30-39:2')
for p in _glob:
    _pos = p.position()
    print("(%d) -> x=%f, y=%f, z=%f" % (p.number(), _pos[0], _pos[1], _pos[2]))
 
 
# 获得每一个prim的顶点集合
_prims = _geo.prims()
for p in _prims:
    _verts = p.vertices()
    buff = '('
    for i in range(p.numVertices()):
        buff += str(_verts[i].point().number()) + ' '
    buff += ')'
    print("%d) -> %s" % (p.number(), buff))
 
#将几何信息存成文件
_geo.saveToFile('F:/temp/_geo.beo')
 
 
#获得点的属性
for attr in _geo.pointAttribs():
    print(attr)
```



设置当前帧

```
hou.setFrame(10)
```



设置FPS

```
hou.setFps(24)
```



#### python sop

python sop是通过直接在houdini中增加一个python节点，然后将代码写在节点中，并且执行，这种可以理解为内部python

类似于这样

![image-20230421151559252](https://img.elmagnifico.tech/static/upload/elmagnifico/202304211515318.png)

```python
node = hou.pwd()
geo = node.geometry()
```

很多看到的代码都是以这种方式开头的，那说明他们主要就是通过python节点来完成各种目标的。由于这个是python节点，它本身就具有上下文，是嵌入式的，所以他直接用hou.pwd()就能获取到自身所在位置和此时所拥有的geometry()



#### Geometry Spreadsheet

Geometry Spreadsheet 算是一个特殊的浏览方式，他能显示出来当前集合体的点线面的数据，可能有些时候我们需要将这一部分数据导出

通过直接创建一个类似的结构，作为一个导出节点

![image-20230423181335167](https://img.elmagnifico.tech/static/upload/elmagnifico/202304231813261.png)

```python
node = hou.pwd()
geo = node.geometry()

# CONFIG
filename = "test.csv"
separator = "," 

# Get File
f = open(filename, "w")

# Create Column
for attrib in geo.pointAttribs():
    attrib_count = attrib.size()
    if 1 != attrib_count:
        for i in range(0,attrib_count):
            if i > 2:   # if its a Multi Array
                f.write(attrib.name() + " [" + chr(94 + i) + "]" + separator) # ASCII to Char 
            else:
                f.write(attrib.name() + " [" + chr(88 + i) + "]" + separator) # ASCII to Char 
            
    else:
        f.write(attrib.name())
        f.write(separator)
f.write("\n")

# Insert Points in File
for point in geo.points():
    for attrib in geo.pointAttribs():
        attrib_count = attrib.size()
        if 1 != attrib_count:
            for i in range(0,attrib_count):
                f.write(str(point.attribValue(attrib)[i]) + separator)
        else:
            f.write(str(point.attribValue(attrib)))
            f.write(separator)
    f.write("\n")
    
# Save the CSV File    
f.close()
```



- 由于没有指定路径，所以导出的test.csv 在`houdini安装路径\houdini\help\files`路径下



#### 遗留问题

如果使用外部python，并且操作了场景帧用来获取node数据，那么运行一部分还是正常的，但是稍微运行的长一点就开始报错了

```
循环	
	获取节点
	设置当前帧
	获取数据
```

类似这种结构的代码在外部执行，120帧以内都是正常的，只要超过120帧就报错，手动在120帧跑又没错，甚至节点本身会直接报错，而你只要动一下时间轴又没错了

![image-20230424101103177](https://img.elmagnifico.tech/static/upload/elmagnifico/202304241011307.png)

```python
The attempted operation failed.
Traceback (most recent call last):
  File "hou.session", line 115, in <module>
  File "hou.session", line 32, in export_json
  File "D:/SIDEEF~1/HOUDIN~1.569/houdini/python3.7libs\hou.py", line 36939, in points
    return _hou.Geometry_points(self)
hou.InvalidGeometry: The underlying geometry is not valid. Possibly caused by the source SOP Node failing to cook since the python geometry was assigned..
```

而这种报错单独测试又没有问题，只有连续运行才能报出来（这种问题和上面的节点是和依赖于时间的也有关系，一旦依赖于时间，而脚本又会修改时间）



看了一下有类似的情况，基本都是说切换了场景时间，但是节点等等没有cook，就导致了数据没有更新。目前的解决办法是通过将获取数据的地方变成一个python节点，然后就没问题了

![image-20230424141130610](https://img.elmagnifico.tech/static/upload/elmagnifico/202304241411733.png)

还有一种办法，直接加一个filecache，作为缓冲，将所有内容缓冲进去，这样就可以让程序跑的时候不会出现没有cook的情况了



## UI

Houdini跟maya一样，都是可以用PySide2 QT那一套来建立UI



具体看这里

> https://github.com/kiryha/Houdini/wiki/python-for-artists



简单交互可以通过这种方式进行



输出对话框

```python
hou.ui.displayMessage("hello world")
```



输入对话框

```python
start_frame = int(hou.ui.readInput('start frame')[1])
end_frame = int(hou.ui.readInput('end frame')[1])
```



文件选择对话框

```python
filepath = hou.ui.selectFile(title="Choose to save json", pattern="*.json")
if(filepath==None or len(filepath)==0):
    return
```



选择节点

```python
sel = hou.node(node_path)
if sel==None :
    return
```



## Summary

Houdini 只是写简单的python还是比较容易的



## Quote

> https://github.com/kiryha/Houdini/wiki/python-snippets
>
> https://www.sidefx.com/forum/topic/56423/?page=1#post-253054
>
> https://zhuanlan.zhihu.com/p/492932750
>
> https://www.sidefx.com/forum/topic/65977/
>
> https://blog.csdn.net/peixin_huang/article/details/102652204
>
> https://www.bilibili.com/read/cv17740921
>
> https://www.sidefx.com/docs/houdini/hom/pythonsop.html
>
> https://blog.csdn.net/u013412391/article/details/109209593
>
> https://www.sidefx.com/forum/topic/28173/?page=1#post-129486
>
> https://www.sidefx.com/docs/houdini/hom/index.html
>
> https://www.sidefx.com/docs/houdini/hom/intro.html
>
> https://www.sidefx.com/docs/houdini/hom/expressions.html
>
> https://www.sidefx.com/docs/houdini/hom/locations.html
>
> https://www.sidefx.com/docs/houdini/hom/tool_script.html
>
> https://www.sidefx.com/forum/topic/60500/
>
> https://github.com/kiryha/Houdini/wiki/python-for-artists
