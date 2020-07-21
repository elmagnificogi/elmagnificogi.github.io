---
layout:     post
title:      "maya c++ API Bug"
subtitle:   "API 学习"
date:       2019-08-06
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - API
    - maya
---

# Maya-C++ API

写了两个月的API发现了很多API的坑，关键是并没有任何相关代码或者相关提示告诉你这样是有问题的，仅仅从API的描述里看到的完全正确，但是会遇到很多坑爹的情况。

### 删除节点

MGlobal 中有下面两个方法

- MStatus removeFromModel	(	MObject & 	object	)

- MStatus deleteNode	(	MObject & 	object	)

maya自己的例子中有很多删除节点都是用removeFromModel，但是这个方法实际上并不是真的删除了这个节点，只是从这个场景中移除出去了，而在maya的某个空间中他依然存在，而且这个只能删除DAG节点，其他节点会导致maya崩溃。

deleteNode，可以删除DAG或者DG节点，并且是真的删除，不会在maya中藏着，看起来很美好，但是还是有问题，有啥问题呢，比如在某个时刻，通过插件你建立了一系列节点，并且这些节点会渲染和显示在view中，而这个命令的结束时刻你用deleteNode删除了这个被渲染的节点，多数情况下可能都是正常的，但是某些未知情况（无法判定具体是发生了什么），会导致maya直接崩溃，而崩溃的地方我查看过了，不是在我的代码中，大概是在场景刷新或者帧缓冲，帧填充之类的东西里面，反正就是与view刷新有关系，这谁能想到这个命令会导致出错，出错频率大概是1/10左右。

那么正确的删除应该是怎样的呢

```c++
MDagModifier dag_modifier;
dag_modifier.deleteNode(obj_transform);
dag_modifier.doIt();
```

使用MDagModifier的deleteNode删除节点就不会导致view刷新出错

但是使用DAG的deleteNode依然有概率崩溃，崩溃的原因也同样和view有关。

DAG的deleteNode，其实有一个前置条件，这个条件就是删除的这个节点，最好和其他相关节点已经断开了，然后再使用删除。

如果不断开，直接删除，多数情况下可能不会有问题，但是某些情况下就是会出错，这种时候出错还有一个办法就是用removeFromModel来删除，就没有这么多问题了。



### 数组类型属性

经常会使用connectAttr来连接两个属性

```python
cmds.connectAttr(custom+".outColor", SG+".surfaceShader", force=True)
```

而c++里则是用MDGModifier来连接两个属性。

```c++
MDGModifier dg_modifier;
status = dg_modifier.connect(time.findPlug("outTime"), nucleus.findPlug("currentTime"));
checkErr(status, "Could not t-n connect out-current time");
```

但是如果是下图的属性，要如何连接呢？

![SMMS](https://i.loli.net/2019/08/06/BhcEeHWO4RGZyo1.png)

如果是python直接无视属性名就是xxx[0]或者xxx[1]，以此类推就可以了。

但是c++ api里面这里就不行了。

如果直接用findPlug("xxx[0]"),那是绝对找不到的，而用findPlug("xxx")只能找到xxx。

xxx[0]是xxx属性的一个元素，所以要通过找元素的方式去找。

```c++
/*
get the array attr by index,the normal method couldnt get the array attr
*/
MStatus get_array_attr(MFnDependencyNode & node, MString name, unsigned int index, double & value)
{
	MStatus status;
	MPlug attr = node.findPlug(name, true, &status);
	checkErr(status, "cant find the attr");

	if (!attr.isArray())
		return MS::kInvalidParameter;

	if(index>attr.numElements())
		return MS::kInvalidParameter;

	MPlug find_attr = attr.elementByPhysicalIndex(index);
	find_attr.getValue(value);
	return MStatus();
}

/*
set the array attr by index,the normal method couldnt set the array attr
*/
MStatus set_array_attr(MFnDependencyNode & node, MString name, unsigned int index, double value)
{
	MStatus status;
	MPlug attr = node.findPlug(name, true, &status);
	checkErr(status, "cant find the attr");

	if (!attr.isArray())
		return MS::kInvalidParameter;

	if(index>attr.numElements())
		return MS::kInvalidParameter;

	MPlug find_attr = attr.elementByPhysicalIndex(index);
	find_attr.setValue(value);
	return MStatus();
}
```

这里的两个方法用来设置/返回数组属性的某个index的double值。

最后的获取属性是通过elementByPhysicalIndex来完成的。

但是如果你是想增加一个属性怎么办，用elementByLogicalIndex，如果你访问的index不存在，那么他会自动帮你创建一个，这样
就很方便。

### 关键帧顶替

maya中帧都是存在动画曲线这个对象中的,但是要删除某个范围的关键帧,maya里就没有这种操作,必须要自己写。

而关键帧有两个唯一可对应查找的值，一个是time，一个是index。

但是这里有一个坑的地方，time是绝对不会重复的，但是index竟然会重复。

你可以通过任何方法找到你要找的帧的index，然后你确定你要删除的index范围是从1-200

删除的时候呢，你只能一直删index是1的关键帧，然后删200次，就能完你的目的了。

动画曲线的index会受到你的每一次操作的影响，并且是实时影响，你把第一帧删除了，那么原来的第二帧会替补到第一帧的位置上让你继续操作，这就很奇怪。

```c++
/*
delete the objs keyframes at specific time from the animation curve
*/
MStatus delete_objs_keyframes(MTime start_frame, MTime end_frame, MObjectArray &objs_transform ,MString attr_name)
{
	MStatus status;

	for (unsigned int index = 0; index<objs_transform.length(); index++)
	{
		MFnDagNode transform(objs_transform[index]);

		MFnAnimCurve ac(transform.findPlug(attr_name), &status);
		if (status != MS::kSuccess)
		{
			return MS::kFailure;
		}

		unsigned int kf_index_start=0;
		unsigned int kf_index_end=0;

		kf_index_start = ac.findClosest(start_frame,&status);
		if (status != MS::kSuccess)
		{
			return MS::kFailure;
		}

		kf_index_end = ac.findClosest(end_frame,&status);
		if (status != MS::kSuccess)
		{
			return MS::kFailure;
		}

		// it's a very bug index,when u delete one ,the next one will replace it
		// so u always need delete the same index
		for (unsigned int index = kf_index_start+1; index < kf_index_end; index++)
		{
			ac.remove(kf_index_start+1);
		}

	}

	return MS::kSuccess;
}
```

### 寻找关键帧

接着上面的代码，其实还有一个坑。

MFnAnimCurve 中有一个用来寻找关键帧的方法

- bool find	(	const MTime & 	time,
unsigned int & 	index,
MStatus * 	ReturnStatus = NULL
)

![SMMS](https://i.loli.net/2019/08/06/hAejJd4wRLrCXc1.png)

咋一看觉得这个index是一个返回值对吧，而且说了隐式返回，虽然他的标记是个in而不是out

但是实际上这个api有问题，给了对应准确的time，但是实际上返回的status是true，但是index是0

这就导致后面所有基于这个api来做的帧操作都是错的。

![SMMS](https://i.loli.net/2019/08/06/QespdGIBmFZuzVP.png)

在这种情况下只有用findClosest才能找到真正的值

### 不重复重命名

有的时候直接命名一个节点，然后下次直接拿这个节点名去搜索或者访问，就很有可能会出问题.

maya里出现重名节点会自动帮你增加数字后缀,如果想要自己增加数字后缀就很麻烦,相当于要统计场景中所有东西的名称

然后去解每个东西名称的后缀,这一串字符串操作就很麻烦,针对这个情况maya里可以在命名时使用#来代替后缀数字,maya
会自动帮你完成名称搜索排重,就很方便.

```c++
/*
rename the node
*/
MStatus rename_nodes(MObject transform, MString baseName)
{
	MStatus st;
	MDagModifier dag_modifier;

	//  Rename the transform to something we know no node will be using.
	st = dag_modifier.renameNode(transform, "polyPrimitiveCmdTemp");
	checkErr(st, "Could not rename transform node to temp name");

	//  Rename the mesh to the same thing but with 'Shape' on the end.
	MFnDagNode    dagFn(transform);

	st = dag_modifier.renameNode(dagFn.child(0), "polyPrimitiveCmdTempShape");
	checkErr(st, "Could not rename mesh node to temp name");

	//  Now that they are in the 'something/somethingShape' format, any
	//  changes we make to the name of the transform will automatically be
	//  propagated to the shape as well.
	//
	//  Maya will replace the '#' in the string below with a number which
	//  ensures uniqueness.
	MString  transformName = baseName + "#";
	st = dag_modifier.renameNode(transform, transformName);
	checkErr(st, "Could not rename transform node to final name");

	st = dag_modifier.doIt();
	checkErr(st, "Could not commit renaming of nodes");

	return st;
}
```

## 总结

还有一个非常难用的东西就是Mstring还有executePythonCommand(),返回值是用char组成的unicode编码的中文或者什么其他的东西，还要单独写一个转换函数，把其中非unicode和uncidoe的东西分离然后都转成string才能正常使用。

## 参考

> maya例程
>
> http://help.autodesk.com/view/MAYAUL/2017/CHS/
