---
layout:     post
title:      "Typora视频无法正常显示与mp4格式"
subtitle:   "mp4，H.264,xdiv,xvid,html5"
date:       2020-09-28
author:     "elmagnifico"
header-img: "img/typora.jpg
catalog:    true
tags:
    - typora
    - markdown
---

## Forward

突然遇到需要在Typora中拆入视频，然后发现有部分视频插入以后Typora显示不正常，但是能播放。

查了半天，找不到解决方法，刚打算提交issue，然后无意看到了html5视频插入不正常的解决办法，这里记录一下，问题是类似的

## Typora插入视频

平常markdown基本不会有插入视频这种操作，所以一般人都略过了，不过之前也记录过如何插入视频

一般情况下都是直接插入一个iframe，然后连接一个外部视频，比如B站之类的

```
<iframe src="//player.bilibili.com/player.html?aid=711626557&bvid=BV1iD4y1U7a1&cid=222140667&page=1" scrolling="no" width="640px" height="480px" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

效果如下：

<iframe src="//player.bilibili.com/player.html?aid=711626557&bvid=BV1iD4y1U7a1&cid=222140667&page=1" scrolling="no" width="640px" height="480px" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>



#### 本地视频

不过本地视频一般都不是用iframe的，太麻烦了，本地视频可以直接拖拽进入，插入的代码如下

```
<video src="C:\Users\elmagnifico\Videos\轨迹优化_1.mp4"></video>
```



而目前Typora中对于视频相关设置基本没有，所以出了问题也找不到为什么

非常巧，所有出问题的视频都是我用qq截图录制工具产生的视频（比较方便，快速生产教程操作视频）



#### 视频无法显示问题

情况描述：

![image-20200928150818368](https://i.loli.net/2020/09/28/CSoAzDyLiTrRK36.png)

可以看到插入的视频，无法显示预览画面，而且播放的时候进度条在走，声音也有，但是就是画面不显示。



## 解决方法

本质上是由于格式不同造成的，mp4只是一类文件的后缀，其本身编码格式是有可能不同的。

而video标签本身可以支持的视频格式有限制,当然对音频格式也有限制,这就导致了这里为什么这个视频无法正常播放

> 目前，<video> 元素支持三种视频格式：MP4、WebM、Ogg。
>
> 有如上这三种格式，他们在使用过程中对浏览器的兼容性稍有不同。
>
> **MP4：**
>
> MPEG 4文件使用 H264 视频编解码器和AAC音频编解码器
>
> **WebM：**
>
> WebM 文件使用 VP8 视频编解码器和 Vorbis 音频编解码器
>
> **Ogg ：**
>
> Ogg 文件使用 Theora 视频编解码器和 Vorbis音频编解码器

经过查看,所有qq录屏得到的视频格式都是mp4v,而正常能播放的这里输入都是avc

![image-20200928151450435](https://i.loli.net/2020/09/28/nIM413GVbuwrS9y.png)

而经过转码后的能播放的文件都是avc

#### 格式工厂转码

主要是把编码改成AVC,但是格式工厂支持的比特率太低了,导致高比特率的视频直接糊了,所以如果是低分辨率小视频可以用格式工厂,高分辨率(大于720P)就不行了

![image-20200928152213201](https://i.loli.net/2020/09/28/bOZ7KRz14AxJaEj.png)



#### Adobe Media Encoder CC 转码

![image-20200928152345924](https://i.loli.net/2020/09/28/oZVlNOTLkfpyXjF.png)

基本直接拖进去就默认转码H.264格式了,直接开始转码就行了,转码后的视频就能正常在Typora中播放了.



## MP4家族

#### 科普

.mp4 只是在windows里这么显示后缀,全名应该是MPEG-4

> 运动图像专家组MPEG 于1999年2月正式公布了MPEG-4（ISO/IEC14496）标准第一版本。同年年底MPEG-4第二版亦告底定，且于2000年年初正式成为国际标准。
>
> MPEG-4与MPEG-1和MPEG-2有很大的不同。MPEG-4不只是具体压缩算法，它是针对数字电视、交互式绘图应用（影音合成内容）、[交互式多媒体](https://baike.baidu.com/item/交互式多媒体/5349314)（WWW、资料撷取与分散）等整合及[压缩技术](https://baike.baidu.com/item/压缩技术/1444262)的需求而制定的国际标准。
>
> MPEG-4标准将众多[多媒体](https://baike.baidu.com/item/多媒体/140486)[应用集成](https://baike.baidu.com/item/应用集成/6754287)于一个完整框架内，旨在为多媒体通信及应用环境提供标准算法及工具，从而建立起一种能被多媒体传输、[存储](https://baike.baidu.com/item/存储/1582924)、检索等应用领域普遍采用的统一数据格式。

简单说MPEG-4是一个大标准,所有符合这个标准的文件在windows下的后缀名都是mp4

就类似于以前说过的字符编码格式一样,同一个内容,可能有不同的编码格式，这些编码格式本质上都是为了优化空间或者提高播放效率而诞生的.

> 第一部分（ISO/IEC 14496-1）：系统：描述视频和音频数据流的控制、同步以及混合方式（即混流Multiplexing，简写为MUX）。
>
> 第二部分（ISO/IEC 14496-2）：视频：定义一个对各种视觉信息（包括自然视频、静止纹理、计算机合成图形等等）的编解码器。（例如XviD编码就属于MPEG-4 Part 2）
>
> 第三部分（ISO/IEC 14496-3）：音频：定义一个对各种音频信号进行编码的编解码器的集合。包括高级音频编码（Advanced Audio Coding，缩写为AAC）的若干变形和其他一些音频/语音编码工具。
>
> ...
>
> 第十部分（ISO/IEC 14496-10）：高级视频编码或称高级视频编码（Advanced Video Coding，缩写为AVC）：定义一个视频编解码器（codec）。AVC和XviD都属于MPEG-4编码，但由于AVC属于MPEG-4 Part 10，在技术特性上比属于MPEG-4 Part2的XviD要先进。另外，它和ITU-TH.264标准是一致的，故又称为H.264。

MPEG-4既然是一个大标准,那么大标准下面就有子标准,而且这个标准还在不断演进中.

可以看到第二部分编码定义了Xvid是一种编码格式,第三部分标志定义了音频编码AAC,第十部分就定义了H.264编码格式或者说AVC编码格式

现在已经演进到了H.266,更高的压缩比,更低的带宽需求,不过同理这么高的压缩比就需要更高的性能要求来解压,所以对于低性能设备或者老设备其实是不友好的,cpu跟不上,看个视频都卡,绝对是会出现的.



- .mp4 = MPEG-4 编码格式:

  - H264
  - Xvid
  - Divx
  - VP6 (被淘汰)

  

#### 为什么叫mp4

MPEG-4其实只是MPEG的4代标准,而现在已经是MPEG-21了,而实际上中间还有一个MPEG-7(他是MPEG-1,MPEG-2,MPEG-3,MPEG-4之和),MPEG表示或者包含的标准更多更大了,mp4自然就是按照当时的MPEG-4标准制定名字,而mp3的音乐文件格式也是来自于MPEG-3.后来标准还在更新,只是视频格式名字就一直沿用mp4了.



#### 浏览器支持

html的中<video>到底支持什么样的格式,其实还是还是浏览器说了算.

如果浏览器不支持,那这个视频格式就不能播放,浏览器支持那就能放,而这东西在浏览器界又不统一,所以就导致很多时候都需要引用一个播放器进来来专门播放视频,从而屏蔽各种浏览器的问题



## Summary

之前v2ex有一个人说B站的播放器对于视频颜色范围识别了错误的flag,然后狂喷一通,最后被大神教育一番,发现是自己播放器识别flag错误,全程强行喷所有纠正党,学了不少知识.

https://www.v2ex.com/t/686099

## Quote

> https://www.cnblogs.com/sweet-sunshine/p/5220151.html
>
> https://baike.baidu.com/item/mp4/9218018?fromtitle=mp4%E6%A0%BC%E5%BC%8F&fromid=6766895&fr=aladdin

