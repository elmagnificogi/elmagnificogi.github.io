---
layout:     post
title:      "AI辅助艺术设计"
subtitle:   "Astyle、Artistic Style、Clang-Format、CoolFormat"
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

研究一下如何把Stability AI相关的AI产品融合到目前的艺术设计的工作流中



## 图片生成

### Stable Diffusion

Stable Diffusion是一种图像模型，他背后是Stability AI



### Midjounery





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



### spline

> https://app.spline.design/home

spline更像是一个浏览器级别的3D设计软件，可以做模型、动画、渲染，不过总体上看是比较轻量、低质量的，仅仅适合网页用，本身这种也只有近似的卡通风格才合适，其他的很出戏。

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



### alpha3d

> https://www.alpha3d.io/

![image-20250328185031548](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328185031694.png)

alpha3d，就非常抽象了，完全不知道在生成什么

![image-20250328185328482](https://img.elmagnifico.tech/static/upload/elmagnifico/20250328185328585.png)

额 更简单的提示词，也不行，这生成的非常抽象



## Summary



## Quote

> https://www.ui.cn/detail/586009.html
>
> https://aitools.rdlab.tw/tool-list/21b370197938cf7625e0a5be955ed3ff

