---
layout:     post
title:      "OV系列摄像头对比"
subtitle:   "OV7670，OV7725，OV7690，OV5640"
date:       2021-07-21
update:     2023-01-04
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
mathjax:    false
tags:
    - Camera
    - 嵌入式
---

## Foreword

最近需要折腾一下摄像头，查了一下对比，基本没看到有啥特别详细的对比，自己写一个。



## 摄像头对比

| 参数          | OV7670      | OV7690      | OV7725      | OV5640              | OV7620      |
| ------------- | ----------- | ----------- | ----------- | ------------------- | ----------- |
| 像素          | 640*480     | 640*480     | 640*480     | 2592*1944           | 640*480     |
| YUV           | 422         | 422         | 422         | 422/420             | 422         |
| RGB           | 565/555/444 | 565/555/444 | 565/555/444 | 565/555/444         |             |
| GRB           | 422         | 422         | 422         | 422                 | 422         |
| RAW           | RGB         | RGB         | RGB         | RGB                 | RGB         |
| Lens size     | 1/6‘’       | 1/13‘’      | 1/4‘’       | 1/4‘’               | 1/3‘’       |
| Max FPS       | 30 for VGA  | 30 for VGA  | 60 for VGA  | 90 for VGA(640*480) | 60 for QVGA |
| Lens Angle    | 25°         | 25°         | 25°         | 24°                 | unknown     |
| S/N Ratio     | 46dB        | 38dB        | 50dB        | 36dB                | 48dB        |
| Dynamic Range | 52dB        | 66dB        | 60dB        | 68dB                | 72dB        |
| AEC           | yes         | yes         | yes         | yes                 | yes         |
| AGC           | yes         | yes         | yes         | yes                 | yes         |
| AWB           | yes         | yes         | yes         | yes                 | yes         |
| ABF           | yes         | no          | yes         | yes                 | unknown     |
| ABLC          | yes         | yes         | yes         | yes                 | unknown     |
| ALD           | no          | no          | no          | yes                 | unknown     |
| AFC           | no          | no          | no          | yes                 | unknown     |
| 接口          | SCCB        | SCCB        | SCCB        | SCCB/DVP            | SCCB        |

可以看到30w低像素的镜头中，OV7725算是非常不错的了，高信噪比，动态范围也不小，最大帧率也比较高，同时镜头尺寸也大。当然价格上也比7670贵了20块左右。

OV7690无论是镜头尺寸还是性能上都比7670更差一些，所以就不推荐了，而openmv中带了完整的OV7690的驱动，不过看他们最终也没用7690，想必也是达不到要求吧。

OV7620也不错，可惜没有现成的模组可以买。



- 目前OV7670已经停产了，能买到的基本都是拆机货了，需要加流程保证可用
- OV7725虽然还能买到原厂的，但是价格就更贵了，而拆机货便宜一些，也要加流程去筛选了。



## 视场角

这里还遇到了一个问题，就是视场角的问题，视场角太小，稍微偏移一下目标图案就出了视野，这种情况下就很麻烦。所以有时候可能需要大视场角的镜头。

一般来说我们说的视场角都是单独指镜头的视场角，实际的视场角其实是镜头和感光芯片安装到一起以后的能看到的角度。镜头起主要作用，所以这里也单独只说镜头的视场角。

- 但是视场角也不是越大越好，同样的视场角大了，那么在相同距离下，**目标在图像中呈现的大小就变小了**，这个时候可能视场角变大并不是什么好事。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/3cC5Zx2pPQjJhgG.png)

这种小尺寸封装，常见于笔记本电脑的摄像头或者针孔摄像头之类的，追求小尺寸，但是对应的，这个视场角就只有62°了，不同家的这种封装可能略有不同，但总的来说视场角大概在58°-70°之间。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/Qv2xZDrTtoUB5m4.png)

这种尺寸的比较常见，视场角大概在95°-120°左右，当然也有一种比这个小一些的，视场角只有78°左右了。



![](https://img.elmagnifico.tech/static/upload/elmagnifico/HlzBC4P1YhgoMX9.png)

而要兼顾小巧还要大视场角就得用类似这样的，开口大一些，这种可以达到120°，还是不错的。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/insldwYACUuaKM1.png)

有的可能需要广角，这个配置可以达到160°+广角镜头，十分恐怖。



可能上还有一些其他尺寸的，不过比较难辩别，看着都很像。



## 屏幕尺寸

- VGA，Video Graphics Array：分辨率为640×480，一些小的便携设备在使用这种屏幕
- QVGA，QuarterVGA：标准VGA分辨率的1/4尺寸，亦即320x240，目前主要应用于手机及便携播放器上面

- QQVGA，QuarterQuarterVGA：标准VGA分辨率的1/16尺寸，亦即160x120，目前主要应用于手机及便携播放器上面；QQVGA为QVGA的1/4屏，分辨率为120*160

- SVGA，Super Video Graphics Array：属于VGA屏幕的替代品，最大支持800×600分辨率

- XGA，Extended Graphics Array：它支持最大1024×768分辨率，屏幕大小从 10.4英寸、12.1英寸、13.3英寸到14.1英寸、15.1英寸都有

- SXGA+，Super Extended Graphics Array：作为SXGA的一种扩展SXGA+是一种专门为笔记本设计的屏幕。其显示分辨率为1400×1050

- UVGA，Ultra Video Graphics Array：这种屏幕支持最大1600×1200分辨率

- WXGA，Wide Extended Graphics Array：作为普通XGA屏幕的宽屏版本，WXGA采用16:10的横宽比例来扩大屏幕的尺寸。其最大显示分辨率为1280×800

- WXGA+，Wide Extended Graphics Array：这是一种WXGA的的扩展，其最大显示分辨率为1280×854，横宽比例为15:10而非标准宽屏的16:10

- WSXGA+，Wide Super Extended Graphics Array：其显示分辨率为1680×1050

- WUXGA，Wide Ultra Video Graphics Array：其显示分辨率可以达到1920×1200



其他称呼：

```
CIF=QCIFx4=QQCIFx4x4;
Sub-QCIF近似等于1/8的CIF，近似等于1/2QCIF
VGA＝QVGA*4=QQVGA*4*4;
```



## Summary

quote中是我实际问过或者使用过的淘宝店家



## Quote

>https://shop332357628.taobao.com/index.htm