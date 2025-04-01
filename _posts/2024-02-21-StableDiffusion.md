---
layout:     post
title:      "AI辅助艺术设计"
subtitle:   "SD、3DFY、Meshy、Genie、Midjounery"
date:       2025-04-02
update:     2025-04-02
author:     "elmagnifico"
header-img: "img/bg1.jpg"
catalog:    true
tobecontinued: true
tags:
    - AI
---

## Foreword

研究一下如何把AI相关的AI设计产品融合到目前的艺术设计的工作流中



## 图片生成

### Stable Diffusion

> https://github.com/AUTOMATIC1111/stable-diffusion-webui

Stable Diffusion是一种图像模型，他背后是Stability AI



### Midjounery

> https://www.midjourney.com/



## 模型生成

提示词，猫和老鼠中的老鼠，拿着一个烤串

```
# Core requirements
Jerry from Tom and Jerry cartoon, holding a barbecue skewer,
# Style details
cartoon style, classic animation, expressive face, cheerful expression,
# Scene elements
detailed food on skewer, grilled meat and vegetables,
# Quality control
high quality, clean lines, vibrant colors, well-lit scene
```



### tripo3d

> https://www.tripo3d.ai/

![image-20250328170839275](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328170839545.png)

明显AI理解错了对象，选择了Tom，但是模型至少是正确的，能看的，他甚至想给这个动物女性化一个胸部出来，有点搞笑。

![image-20250328171044205](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328171044426.png)

生成速度从左到右，最慢的右侧差不多是效果最好的了，先不说语义理解对不对，模型质量非常不错

![image-20250328172246610](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328172246638.png)

tripo 3d 还有后处理流程，可以绑定骨骼，还是不错的



### Spline

> https://app.spline.design/home

Spline更像是一个浏览器级别的3D设计软件，可以做模型、动画、渲染，不过总体上看是比较轻量、低质量的，仅仅适合网页用，本身这种也只有近似的卡通风格才合适，其他的很出戏。

模型生成能力都是需要付费才行，看起来一般，就不深度研究了



### SUDOAI

> https://www.sudo.ai/

支持图生成模型和文字生成模型

![image-20250328165429227](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328165429565.png)

图生模型，好像一张有点困难，生成的也是个平面。

十分简单的模型生成，也会破面或者其他问题，图生模型，需要很好的图，提前扣好图，背景透明，整体模型的样子也比较全面好认

![image-20250328165959400](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328165959515.png)

这个能力也太抽象了，可能中文提示词有问题，切换英文试一下

![image-20250328170338880](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328170338962.png)

英文也不行，连一个基础的模型能看都做不到



### 3DFY

> https://3dfy.ai/
>
> https://3dfy.tools/dashboard

![image-20250328184624547](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328184624594.png)

3DFY的生成速度着实有点慢了，这样的话容错就很低，反复修改成本就很高



### Alpha3D

> https://www.alpha3d.io/

![image-20250328185031548](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328185031694.png)

Alpha3D，就非常抽象了，完全不知道在生成什么

![image-20250328185328482](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328185328585.png)

额 更简单的提示词，也不行，这生成的非常抽象



### Meshy

> https://www.meshy.ai/

![image-20250401152357340](https://img.elmagnifico.tech/static/upload/elmagnifico/20250401152357433.png)

Meshy也是主要支持三种生成，文生模型、图生模型、材质生成

![image-20250401152508879](https://img.elmagnifico.tech/static/upload/elmagnifico/20250401152509058.png)

Meshy的中文提示词是理解的最好的，至少知道我说的是什么了，模型生成以后就可以生成贴图了，他是将这两步拆开进行的

![image-20250401152832904](https://img.elmagnifico.tech/static/upload/elmagnifico/20250401152833169.png)

Meshy的成品，还是有一些奇怪的地方，比如手指头生成畸形，烤串也稍微有点问题

英文提示词达到的效果非常像tripo3D，感觉他们的素材库很接近



### Genie

> https://lumalabs.ai/genie?view=create

![image-20250401154025523](https://img.elmagnifico.tech/static/upload/elmagnifico/20250401154025580.png)

Genie是LumaAI的产品，Genie这个理解能力稍微有点挫，整个模型穿插就不说了，这个形态都不对劲，其次也不支持中文提示词



### 混元3D

> https://3d.hunyuan.tencent.com/

腾讯的混元3D

![image-20250401155019382](https://img.elmagnifico.tech/static/upload/elmagnifico/20250401155019474.png)

出乎意料，腾讯的3D模型生成竟然意外的好，虽然肯定上了一些风格，但是效果算是这里最好的了，速度也很快。

细节上比如手处理的就比Meshy好很多，可以自动骨骼绑定，还可以在生成以后做一定风格上的调整



### Shapen

> https://shapen.com/playground

主要是通过图生模型

![image-20250401161142776](https://img.elmagnifico.tech/static/upload/elmagnifico/20250401161142869.png)

![image-20250401161335560](https://img.elmagnifico.tech/static/upload/elmagnifico/20250401161335700.png)

在生成模型时，对于这种2D画风，生成模型会带着轮廓线，这个轮廓线就造成了破面，这里应该是可以优化一下的



## Summary

图片生成的相对来说很成熟了，各种模型都有图片生成



## Quote

> https://www.ui.cn/detail/586009.html
>
> https://aitools.rdlab.tw/tool-list/21b370197938cf7625e0a5be955ed3ff

