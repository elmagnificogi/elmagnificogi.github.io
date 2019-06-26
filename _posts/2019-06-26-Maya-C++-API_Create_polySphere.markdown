---
layout:     post
title:      "maya c++ API 创建一个polySphere"
subtitle:   "API 学习"
date:       2019-06-06
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - API
    - maya
---

# Maya-C++ API

如何使用maya写一个polySphere,就像maya自身的创建一个球

或者是类似MEL/python的命令

    maya.cmds.polySphere()

#### 分析

首先maya里的结构是:

    transform -> mesh

    polySphere -> mesh

    mesh -> shadingEngine(shadingGroup)

    material(lambert) -> shadingEngine(shadingGroup)

总的来说就是要如何创建一个transform,然后创建一个mesh,连接二者.

创建一个shadingGroup,然后创建一个材质 lambert,连接二者.

最后再把 mesh 分配到这个 shadingGroup,就ok了.

看起来非常简单,实际上很多细节不注意就错了.

#### 创建 transfrom 与 mesh

```c++
MFnDependencyNode fnPolySp;
MFnDagNode fnPolyTrans;
MFnDagNode fnPolyShape;
MDGModifier	dgMod;

MObject	objPolySp = fnPolySp.create("polySphere");
MObject objPolyTrans = fnPolyTrans.create("transform");
MObject objPolyShp = fnPolyShape.create("mesh", objPolyTrans);

MPlug srcPlug = fnPolySp.findPlug("output");
MPlug destPlug = fnPolyShape.findPlug("inMesh");

dgMod.connect(srcPlug, destPlug);
dgMod.doIt();
```

#### 创建 shadingGroup 和 lambert

##### 如何创建 shadingGroup

这段代码出自 AbcImport/CreateSceneHelper.cpp 和 util.cpp

```c++
// create a shading group
MObject shadingGroup;

const MString& faceSetName(faceSet.getName().c_str());

// check if this SG already exists.
status = getObjectByName(faceSetName, shadingGroup);
if (shadingGroup.isNull())
{
    shadingGroup = createShadingGroup(faceSetName);
}

MStatus getObjectByName(const MString & name, MObject & object)
{
    object = MObject::kNullObj;

    MSelectionList sList;
    MStatus status = sList.add(name);
    if (status == MS::kSuccess)
    {
        status = sList.getDependNode(0, object);
    }

    return status;
}
MObject createShadingGroup(const MString& iName)
{
    MStatus status;

    MFnSet fnSet;
    MSelectionList selList;
    MObject shadingGroup = fnSet.create(selList,
                                        MFnSet::kRenderableOnly,
                                        &status);
    if (status != MS::kSuccess)
    {
        MString theError("Could not create shading engine: ");
        theError += iName;
        MGlobal::displayError(theError);

        return shadingGroup;
    }

    fnSet.setName(iName);

    return shadingGroup;
}

```

##### 完全API写法

```c++
MObject lmmo;
MFnLambertShader lm;
MFnSet fnSet;
MSelectionList selList;
MDGModifier	dgMod1;

lmmo = lm.create();
lm.setName("mylambert");

MObject shadingGroup = fnSet.create(selList,MFnSet::kRenderableOnly);
fnSet.setName("myshadinggroup");

MPlug srcPlug1 = lm.findPlug("outColor", status);
MPlug destPlug1 = fnSet.findPlug("surfaceShader", status);


// check connection
MPlugArray mpa;
destPlug1.connectedTo(mpa, true, false);

// break it
dgMod1.disconnect(mpa[0], destPlug1);

dgMod1.connect(srcPlug1, destPlug1);
dgMod1.doIt();
```

###### 问题

其中遇到最致命的问题就是在把lambert连接到shadingGroup,默认创建的lambert会自动连接到默认的shadinggroup中.
在上面的代码里如果不加入打断,就会在最后的 dgMod1.doIt(); 发现返回了失败.

而maya的脚本提示行里显示的是目标不可写,也就是shadingGroup.surfaceShader属性不可写,而不可写的原因是已有连接存在.

而平常使用python的时候一般都是直接建好以后,直接分配就完事了,根本不会注意到其实创建的时候就是没有输入连接的,或者最后连接的时候用了 force 参数,强制连接,这样就算是有连接也会被打断以后再连接上.

    custom = cmds.shadingNode("lambert", asShader = True, name = name1)
    SG = cmds.sets(renderable=True, noSurfaceShader=True, empty=True, name = name1)
    cmds.connectAttr(custom+".outColor", SG+".surfaceShader", force=True)
    cmds.select(name1, r = True)
    cmds.hyperShade(assign = SG)

#### mesh 分配给 shadingGroup

##### 官方例程

maya 的官方例程里面有很多地方分配材质或者shadingGroup的时候都是直接调MEL,而不是用API来写,导致很多人用的时候也是学官方的这个方法,非性能相关的时候没什么问题,当有性能问题的时候这里就会成为瓶颈.

例程出自 \devkit\plug-ins\polyPrimitiveCmd

```c++
MStatus polyPrimitive::assignShadingGroup(MObject transform, MString groupName)
{
    MStatus st;

    // Get the name of the mesh node.
    //
    // We need to use an MFnDagNode rather than an MFnMesh because the mesh
    // is not fully realized at this point and would be rejected by MFnMesh.
    MFnDagNode  dagFn(transform);
    dagFn.setObject(dagFn.child(0));

    MString     meshName = dagFn.name();

    // Use the DAG modifier to put the mesh into a shading group
    MString     cmd("sets -e -fe ");
    cmd += groupName + " " + meshName;
    st = dagMod.commandToExecute(cmd);
    checkErr(st, "Could not add mesh to shading group");

    // Use the DAG modifier to select the new mesh.
    cmd = MString("select ") + meshName;
    st = dagMod.commandToExecute(cmd);
    checkErr(st, "Could not select new mesh");

    return st;
}
```

##### 完全API写法

```c++
MDagPath dp;
MStatus status;
MDagPath::getAPathTo(objPolyTrans, dp);

dp.extendToShape();
if (fnSet.restriction() != MFnSet::kRenderableOnly)
    return MS::kFailure;

status = fnSet.addMember(dp);
if (status != MS::kSuccess)
{
    cerr << " ! MShadingGroup::assignToShadingGroup could not add Dag/Component to SG ! " << endl;
}
```

## 总结

最后就可以看到生成的一个多边形球体,除了命名和默认的不一样以外,结构上是一样的.

通过这里创建一个球体,大致了解 maya api 的编程模型,后面按照这个思路来基本就可以了.

## 参考

> http://ewertb.mayasound.com/api/api.008.php
>
> https://forums.cgsociety.org/t/create-primitives-with-the-api/1444485/15
>
> https://forums.autodesk.com/t5/maya-programming/mesh-texturing/m-p/4233962/highlight/false#M2608
>
> https://forums.autodesk.com/t5/maya-programming/material-outcolor-gt-surfaceshader-fail-bug-or-something-wrong/m-p/8872435/thread-id/10076/highlight/false#M10077
>
> http://ewertb.mayasound.com/api/api.021.php
>
