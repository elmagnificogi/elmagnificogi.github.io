---
layout:     post
title:      "提取谷歌3D地图中的模型"
subtitle:   "AP,Router"
date:       2022-07-11
update:     2022-07-11
author:     "elmagnifico"
header-img: "img/z1.jpg"
catalog:    true
tags:
    - Map
    - Blender
---

## Forward

之前一直以为，各种地图API可以直接拿到建筑的轮廓和高度等信息，从而可以自己直接利用这些信息来自动生成地图，后来发现根本不行，各家地图都不提供类似的API。目前有两种解决方案，但都比较麻烦，而且整体性不够高。



## CADMAPPER

> https://cadmapper.com/

可以通过这个网站，在1平方千米内获取模型信息免费

![image-20220711095610603](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207110956879.png)

可以转换成AutoCAD或者SketchUp、Rhino 5等格式，然后再通过他们转换成OBJ或者FBX给到Maya等软件。

> https://www.bilibili.com/video/BV1FQ4y1S7Fa/?spm_id_from=333.788.recommend_more_video.1&vd_source=fe2e37e9c6518671631012d39f18a581



![image-20220711100508620](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111007770.png)

这种模式有点问题，有些区域拿到的基本都是平面图了，高度信息是不足的，也有可能是不准确的的，所以实用度不是很高



## Maps Models Importer

> https://github.com/eliemichel/MapsModelsImporter

这是一个开源项目，通过提取Google地图中的模型信息，导出给Blender，然后再由Blender转成其他格式再使用。

大致原理是通过Inject到chrome的gpu进程中，然后直接获取gpu绘制时的输入数据，然后将这些数据导出成特定的格式，再进入blender中进行还原。



### 准备

首先需要4个东西

- chrome
- blender
- RenderDoc
- MapsModelsImporter



MapsModelsImporter每个发布版本会有具体的版本说明

![image-20220711102746712](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111027796.png)



#### RenderDoc

RenderDoc 需要开启注入选项

![image-20220711111417525](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111114638.png)

然后重启一下程序，`Inject into Process`就出现了

![image-20220711111446627](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111114681.png)



#### blender

blender这里需要安装MapsModelsImporter插件

![image-20220711114315101](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111143259.png)

选择刚下载的`MapsModelsImporter-v0.5.0-rc1.zip`

![image-20220711114414590](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111144688.png)

然后使能插件

![image-20220711114459995](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111145065.png)



### 使用

以管理员权限启动RenderDoc，选择注入

![image-20220711112658805](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111126885.png)

进程过滤`chrome`

![image-20220711112735476](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111127610.png)



关闭所有chrome，并且右下角也确保退出了，然后使用管理员权限打开运行下面的命令，以调试模式启动chrome

```
set RENDERDOC_HOOK_EGL=0
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-gpu-sandbox --gpu-startup-dialog
```

或者下面的是x86的chrome启动

```
set RENDERDOC_HOOK_EGL=0
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-gpu-sandbox --gpu-startup-dialog
```

启动以后，会有一个弹窗提示 Chrome GPU使用的进程ID是什么，先别点击确定。

![image-20220711140435594](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111404653.png)



在RenderDoc中先`Refresh`，然后勾选`Google Chrome Gpu`，接着`Inject`

![image-20220711112923850](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111129964.png)

就会自动切换到捕获界面

![image-20220711113245022](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111132131.png)

再回到Chrome，点击确定，chrome左上角会有debug信息，说明启动成功

![image-20220711112528157](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111125270.png)

打开谷歌地图，切换到卫星地图，缩放到合适大小

> https://www.google.com.hk/maps

稍微设置一点采集延迟，然后点击`Capture After Delay`，切到chrome中的地图界面

![image-20220711140634884](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111406943.png)

稍等一下，采集以后会有一个 `1 Captures saved.`提示

![image-20220711120458016](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111204082.png)

在RenderDoc中就能看到采集的数据了，然后右键保存即可。

![image-20220711123553518](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111235661.png)

进入blender，在导入刚才的保存的rdc文件

![image-20220711114749424](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111147538.png)

导入过程可能会卡好一会，稍等即可

![image-20220711141959531](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111419867.png)

就能看到正确的模型了，再转成OBJ或者FBX即可，同时模型的贴图什么的也都是有的

![image-20220711142912879](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111429058.png)



### 测试

##### 建模

可以正确拿到建筑模型的，必须是在google地图中，可以通过旋转看到正确3D模型的，对于无法旋转查看的，基本都是没有建模的地方。

![image-20220711142058046](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111420563.png)

![image-20220711142117714](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111421040.png)



以下位置就是没有3D模式的地图，旋转以后，视角显示都是错误的

![image-20220711142302093](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111423492.png)

![image-20220711142314843](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111423270.png)

和深圳毗邻的香港就有完全的建模显示，而深圳基本就全没有。 	

没有建模的地方，就会显示成这样的平面或者直接显示不出来

![image-20220711141647664](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111416898.png)



##### 精细程度

对于模型的精细程度，不能要求太高，可以看到埃菲尔铁塔附件的很多花花草草，基本上都是一些不规则的多边形。

![image-20220711141942616](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111419925.png)



谷歌地图本身能看的3D地图，也能看到实际的贴图存在各种扭曲、模糊等等情况，质量本身也不是很好。

![image-20220711143248918](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207111432408.png)



## Summary

所以想要一键高清地图，还是必须得有对应的轮廓数据和高度数据，否则这种自动建模，意义不是很大，很多的地方基本都用不了，这种粗模还不如手动拉box呢



## Quote

> https://www.bilibili.com/video/BV1FQ4y1S7Fa/?spm_id_from=333.788.recommend_more_video.1&vd_source=fe2e37e9c6518671631012d39f18a581
>
> https://www.youtube.com/watch?v=L8zuEJ0ADuQ&ab_channel=FreedomArts-3DAnimation%26GameDeveloper
>
> https://www.youtube.com/watch?v=zjoRl1NZkgw&ab_channel=AshishJha
