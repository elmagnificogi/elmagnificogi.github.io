---
layout:     post
title:      "RGB转换到RGBW"
subtitle:   "HDR,色域"
date:       2021-03-30
update:     2024-08-03
author:     "elmagnifico"
header-img: "img/led.jpg"
catalog:    true
tags:
    - LED
    - Color
---

## Foreword

一直以来各种颜色的专有名词，色域，颜色空间，HDR，RGB,RGBW等等交织在一起，这次要做RGB转换到RGBW，就一次理清楚



## 科普部分

#### 认识颜色

大部分是参考[Lele Feng](https://www.zhihu.com/people/lele-feng-15)的文章，但是对于已知的人来说，我需要更精简一些的推理和结果，详细的可以看原文章。



首先，人能看到的颜色，是一种感觉，而不是真实的光，所以用人来识别或者辨别颜色，是十分具有主观性的（每个人都有颜色感知的差异）。所以对于一个视频也好，图片也好，颜色审核一般都是大家基于一个标准设备，对所显示颜色的妥协的过程。



光，则是真正的物理量，可以被测量的，不因人的差异而偏移的东西。



由于颜色是一种感觉，并且是部分光造成的，为了描述颜色，就有了CIE 1931 RGB Color Matching Functions，等色匹配实验

![](https://img.elmagnifico.tech/static/upload/elmagnifico/aIPE4TpRufdGVWg.png)

相当于是规定了什么样的光谱描述了我们的RGB，这里有点小问题，就是这个负光的问题，负光就简单理解为从相反方向发射过来的一簇光，用来抵消当前的光，从而他就是负光了。

从图里也能看到，其实光或者说颜色，他们不是线性的，颜色之间的过渡，可能多也可能少。这也是为什么直接用线性RGB来输出光的时候，这个颜色经常有色偏。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/6aNx3AVq92zTC7W.jpg)



#### 颜色空间

前面的RGB组成的空间中有负值，但是这样的RGB光是实际可以发出来的，但是计算起来就很麻烦，所以为了解决这个问题，消除负值，CIE 1931 XYZ color space 中就重新规定了xyz轴所对应的发出的光，从而让这个曲面全都在一个象限中了，这样就能很方便计算颜色和亮度了。色度图中光谱轨迹线所围成的区域代表了通过混合各种不同波长单色光我们能感知到的颜色，这算是第一次统一了颜色标准。

但是也有缺点，CIE 1931 xy色度图为了简化，他将三维轴降到了2维，还有一维的亮度信息，可以认为丢失了，所以这样描述的颜色都是没有说明亮度（过亮，你会认为是白色，过暗你会认为是黑色，但是光本身是不会骗人的，只是你识别的灵敏度有限而已）

![](https://img.elmagnifico.tech/static/upload/elmagnifico/z8hHXdmSnOMDQ7I.jpg)

而要表示一个完整的颜色空间，需要有以下3个基础变量：

1. 三原色（三刺激值，xyz，rgb）
2. 白点（平常可能叫色温）
3. 传递函数

而常见的颜色空间，比如sRGB，AdobeRGB，NTSC，P3，rec601和rec709等等，他们相当于上面色度图所表示范围的一个子集，原因很简单大家谁都不能完整描绘整个色度图，而随着科技进步，描述的范围越来越大，相当于我们能看到的颜色越来越丰富了。

- 白点，由于这是二维图，所以白点就是用来描述那个第三维的，当然只是近似而已。白点的x，y相当于对应的RGB的1，1，1的值。而RGB是线性的所以相当于用了归一化，认为大于某个值就是R=1。

- 色温，简单理解为当一个黑体的温度升高时，对应他也会发光，这个光从红一直到紫，相当于一个色谱，但是平常用的色温也就只有一个很小的区间，而白点的选择经常会参考这个色温所在的曲线。白点和色温可能经常混说，但是实际上是取决于规定的。

- 传递函数，上面规定了这么多就是为了让RGB变成线性的，而到了实际发光硬件这边的时候，为了准确又要把这个线性给转换成非线性的值给到硬件去控制，之所以要这么麻烦，是因为非线性的值在编码传递的时候不方便，而且带宽可能也不够，所以要转换这么一下。

到这里基本颜色空间中重要的东西都说了，不过还有一个伽马值，这东西游戏里经常有太黑看不清，调整一下伽马值就看的到了，其实这个伽马就是传递函数的一个参数而已，本身传递是非线性关系，gamma就是这个函数的幂指数，所以调整一点效果就非常大。调整伽马是让黑的地方变灰了，但是同时其他颜色可能也会呈现出过饱和或者变灰的情况。颜色空间实际上更复杂一些，还有一些其他参数这里没提到，他们与环境的关系比较大一些。

- 颜色空间转换，因为硬件非常多，有老的有新的，但是大家能支持显示的颜色范围也不同，为了在不同设备之间显示的时候尽量减少偏差，有时就需要在输出的时候将原本sRGB的输出成P3之类的，这个就是颜色空间的转换。



伽马值，需要伽马值的原因其实很简单，现实中的光强可以是线性的，但是采集或者释放光线的设备并不一定能做到线性，其次人眼对于光线的感受程度本身也不是线性的，而是一条类似这样的曲线

![image-20240803211353693](https://img.elmagnifico.tech/static/upload/elmagnifico/202408032115158.png)

这就导致如果按照真实光强来显示，你会觉得不对劲，所以这里有了伽马值用来修正人眼对光强敏感度



#### 硬件限制

视频，图片，游戏制作时，可能每个像素，每个颜色对应的亮度都不相同，但是以前呢老设备，他们都只有一个亮度条件，相当于亮就全亮，暗就全暗，只能整体调整，而对于实际画面来说，自然是艳丽的地方需要亮，灰暗的地方希望他暗一些。老设备基本都没办法，所以颜色的还原度并不高，而这样的的设备又是大多数人，自然制作的时候大部分都是非HDR的。为了解决这个问题就有了各种OLED设备和HDR显示器，黑色可以不发光，更完美得显示黑，同时他们的亮度区域不再是一整个屏幕，屏幕可能被划分成若干个小块，每部分亮度都不同，这样显色就更加准确了。但是这样的分块还是比较糙的，分块数量还不够高，仔细看还是能看出来。对于这样的支持动态背光的设备，自然也要有对应的制作支持才行，也就有了各种HDR视频或者游戏。



#### Tonemapping

除了背光不同，还有一点，就是动态亮度，因为经常视频输出的时候可能会把亮度输出超过1，而实际上显示器不可能超过1，所以就会缩放，但是粗暴的缩放会导致整体画面偏暗，存在大量偏灰的画面，比如一个阴暗墓地的场景，那理论上这里应该亮度都比较低，而到了一个结婚大教堂，这里亮度都很高，但是如果直接限制死了整个视频的最高和最低亮度，就会导致中间有些本应该亮一些画面无法表现出来（被粗暴截断或者强行压缩了），所以就有了一个动态亮度的设定，这个亮度的最大和最小值一直都在变化，Tonemapping给出了这个亮度映射曲线，虽然各个标准可能给的略有不同，但总而言之这样让原本的一些高亮细节被尽可能的保留了下来。



#### 总结一下流程

首先制作图片，贴图等等内容的时候，大家都是基于RGB的线性颜色来制作的。

然后进入引擎或者渲染的时候，这个时候会将这些线性值转换成实际的物理量带进去，其实就变成了非线性的。这时出现了一些额外的概念，比如亮度，反射率啊等等，这些信息被用来合成视频、图片、游戏等内容。

输出的时候再次将渲染后的结果转换成线性的值存储到硬盘中。

最后播放设备将这部分的信息再根据显示设备的属性做一个映射，再次变成了非线性的数据，显示出来，让我们看到。



## 颜色校准/滤镜

由于我这里存在比较大的色偏问题，所以我需要做颜色校准。

如果只是静态误差，只需要scale+offset可能就可以了。但是现实往往是残酷的，我这里遇到的问题要复杂得多，不但颜色本身有阶跃的情况，还受到温度影响，

同时颜色不纯，单色中混有一定比例其他颜色。基本上最复杂的情况下都给搞过来了。简单的scale+offset根本无法应对。



#### 3D LUT

由于这个校准实在是太复杂了，所以最简单的办法就是查表，我把整个色域给测出来，然后做好映射，直接查表输出就行了。但是256^3的色域大小，测量起来要一个月，只能降低一些分辨率。

- 1D LUT 可以让某个轴的数据变成分段函数，然后插值，但是这样能调整的太小了，并且其他通道和被校准通道要能独立互不影响才行
- 3D LUT 从一维上升到了三维，相当于是变成了一个立方体，每次校准，直接映射到各个轴上，然后插值取值就行了。这样的好处是校准完全靠查表，表做好了，基本没有啥计算量。

平常3D LUT，一般都是用4x4x4的矩阵，相当于是步进64（0-255），这样可以做一个粗校准。也有用17x17x17的，我这里直接用的是64x64x64的，这样得到的更加准确，只是建表时间比较长而已。

3D LUT 除了可以拿来校准，实际上很多相机或者图片，视频编辑软件也会拿来做滤镜或者调色。



## python 画出CIE分布

首先需要安装colour-science 的库

```bash
pip install --user colour-science 
# 走代理
pip --proxy 127.0.0.1:1081 install --user colour-science 
```

然后用个np的数组或者list都可以直接输出，得到对应的颜色分布

```python
import colour
import numpy as np

# RGB = colour.read_image('F://temp//ACES2065-1_ColorChecker2014.exr')
# RGB = colour.read_image(r'ACES2065-1_ColorChecker2014.exr')
# RGB = np.array([[[1, 1, 1], [0.5, 0.5, 0.5], [0.2, 0.2, 0.2], [0.3, 0.3, 0.3]],[[1, 1, 1], [0.5, 0.5, 0.5], [0.2, 0.2, 0.2], [0.3, 0.3, 0.3]],[[1, 1, 1], [0.5, 0.5, 0.5], [0.2, 0.2, 0.2], [0.3, 0.3, 0.3]],[[1, 1, 1], [0.5, 0.5, 0.5], [0.2, 0.2, 0.2], [0.3, 0.3, 0.3]]])
RGB = np.array([[0.36653649, 0.07554075, 0.28952463], [0.69990608,0.53677301,0.61425992],[0.99,0.99,0.99]])
#RGB = np.random.random((2, 1, 3))
print(RGB)
colour.plotting.plot_RGB_chromaticities_in_chromaticity_diagram_CIE1931(
    RGB, colourspace='ACES2065-1', colourspaces=['sRGB'], scatter_kwargs={'c': 'k', 'marker': '+'})
                                                                        
```

更复杂一些的应用可以看我blog对应的代码仓库，一些小工具，小脚本就都直接写在这个里面了。

> https://github.com/elmagnificogi/MyTools



## RGB转换到RGBW

具体怎么转换有各种算法，选哪种都行，看需求吧

这里有一些前提条件，这里的RGB准确说就是指想要表达的RGB颜色



#### 无色温算法

算法：

W =（饱和度max-当前饱和度）/ 饱和度max * （R+G+B）/ 3

饱和度 =（ 最大（R，G，B）- 最小（R，G，B））/ 最大（R，G，B）g

这个是按照HSV的颜色模型计算的

```c++
struct colorRgbw {
  unsigned int   red;
  unsigned int   green;
  unsigned int   blue;
  unsigned int   white;
};
 
// The saturation is the colorfulness of a color relative to its own brightness.
unsigned int saturation(colorRgbw rgbw) {
    // Find the smallest of all three parameters.
    float low = min(rgbw.red, min(rgbw.green, rgbw.blue));
    // Find the highest of all three parameters.
    float high = max(rgbw.red, max(rgbw.green, rgbw.blue));
    // The difference between the last two variables
    // divided by the highest is the saturation.
    return round(100 * ((high - low) / high));
}
 
// Returns the value of White
unsigned int getWhite(colorRgbw rgbw) {
    return (100 - saturation(rgbw)) / 100 * (rgbw.red + rgbw.green + rgbw.blue) / 3;
}
 
// Use this function for too bright emitters. It corrects the highest possible value.
unsigned int getWhite(colorRgbw rgbw, int redMax, int greenMax, int blueMax) {
    // Set the maximum value for all colors.
    rgbw.red = (float)rgbw.red / 255.0 * (float)redMax;
    rgbw.green = (float)rgbw.green / 255.0 * (float)greenMax;
    rgbw.blue = (float)rgbw.blue / 255.0 * (float)blueMax;
    return (100 - saturation(rgbw)) / 100.0 * (rgbw.red + rgbw.green + rgbw.blue) / 3;
}
 
// Example function.
colorRgbw rgbToRgbw(unsigned int red, unsigned int green, unsigned int blue) {
    unsigned int white = 0;
    colorRgbw rgbw = {red, green, blue, white};
    rgbw.white = getWhite(rgbw);
    return rgbw;
}
 
// Example function with color correction.
colorRgbw rgbToRgbw(unsigned int red, unsigned int redMax,
                    unsigned int green, unsigned int greenMax,
                    unsigned int blue, unsigned int blueMax) {
    unsigned int white = 0;
    colorRgbw rgbw = {red, green, blue, white};
    rgbw.white = getWhite(rgbw, redMax, greenMax, blueMax);
    return rgbw;
}
```

或者是这种

```
//Get the maximum between R, G, and B
float tM = Math.Max(Ri, Math.Max(Gi, Bi));

//If the maximum value is 0, immediately return pure black.
if(tM == 0)
   { return new rgbwcolor() { r = 0, g = 0, b = 0, w = 0 }; }

//This section serves to figure out what the color with 100% hue is
float multiplier = 255.0f / tM;
float hR = Ri * multiplier;
float hG = Gi * multiplier;
float hB = Bi * multiplier;  

//This calculates the Whiteness (not strictly speaking Luminance) of the color
float M = Math.Max(hR, Math.Max(hG, hB));
float m = Math.Min(hR, Math.Min(hG, hB));
float Luminance = ((M + m) / 2.0f - 127.5f) * (255.0f/127.5f) / multiplier;

//Calculate the output values
int Wo = Convert.ToInt32(Luminance);
int Bo = Convert.ToInt32(Bi - Luminance);
int Ro = Convert.ToInt32(Ri - Luminance);
int Go = Convert.ToInt32(Gi - Luminance);

//Trim them so that they are all between 0 and 255
if (Wo < 0) Wo = 0;
if (Bo < 0) Bo = 0;
if (Ro < 0) Ro = 0;
if (Go < 0) Go = 0;
if (Wo > 255) Wo = 255;
if (Bo > 255) Bo = 255;
if (Ro > 255) Ro = 255;
if (Go > 255) Go = 255;
return new rgbwcolor() { r = Ro, g = Go, b = Bo, w = Wo };
```



#### 有色温算法

这里w的白光色温是4500，对应RGB 255，219，186.

这种算法可以当作W灯是公共色光，用来做补偿用的，比较特殊。

假设w的白光色温是刚好，255，255，255，而要输出的是，250，150，120，那么这里w就可以直接输出120，然后对应的rgb输出，130，30，0就行了。相当于是拿白光做为一个公共颜色光来用了。这样好处是保证了至少不会有明显色偏，不好的地方是这样w并没有带来明显的亮度提升。

还有一种办法，是基于当前的rgb的比例。如果我给rgb每个通道都增加一点，但是同时让他们的比例失调的比较小，这样就能做到即保证了rgb的色偏又提高了rgb的亮度。

下面的这种算法是前者，简单的用来保证色偏，而不额外提升亮度。

```cs
const uint8_t kWhiteRedChannel = 255;
const uint8_t kWhiteGreenChannel = 219;
const uint8_t kWhiteBlueChannel = 186;

// The transformation has to be normalized to 255
static_assert(kWhiteRedChannel >= 255 || kWhiteGreenChannel >= 255 || kWhiteBlueChannel >= 255);

CRGBW GetRgbwFromRgb2(CRGB rgb) {
  //Get the maximum between R, G, and B
  uint8_t r = rgb.r;
  uint8_t g = rgb.g;
  uint8_t b = rgb.b;

  // These values are what the 'white' value would need to2
  // be to get the corresponding color value.
  double whiteValueForRed = r * 255.0 / kWhiteRedChannel;
  double whiteValueForGreen = g * 255.0 / kWhiteGreenChannel;
  double whiteValueForBlue = b * 255.0 / kWhiteBlueChannel;

  // Set the white value to the highest it can be for the given color
  // (without over saturating any channel - thus the minimum of them).
  double minWhiteValue = min(whiteValueForRed, min(whiteValueForGreen, whiteValueForBlue));
  uint8_t Wo = (minWhiteValue <= 255 ? (uint8_t) minWhiteValue : 255);

  // The rest of the channels will just be the origina value minus the
  // contribution by the white channel.
  uint8_t Ro = (uint8_t)(r - minWhiteValue * kWhiteRedChannel / 255);
  uint8_t Go = (uint8_t)(g - minWhiteValue * kWhiteGreenChannel / 255);
  uint8_t Bo = (uint8_t)(b - minWhiteValue * kWhiteBlueChannel / 255);

  return CRGBW(Ro, Go, Bo, Wo);
}
```



#### 色温参考

色温对应RGB值

```
    1000: (255, 56, 0),
    1100: (255, 71, 0),
    1200: (255, 83, 0),
    1300: (255, 93, 0),
    1400: (255, 101, 0),
    1500: (255, 109, 0),
    1600: (255, 115, 0),
    1700: (255, 121, 0),
    1800: (255, 126, 0),
    1900: (255, 131, 0),
    2000: (255, 138, 18),
    2100: (255, 142, 33),
    2200: (255, 147, 44),
    2300: (255, 152, 54),
    2400: (255, 157, 63),
    2500: (255, 161, 72),
    2600: (255, 165, 79),
    2700: (255, 169, 87),
    2800: (255, 173, 94),
    2900: (255, 177, 101),
    3000: (255, 180, 107),
    3100: (255, 184, 114),
    3200: (255, 187, 120),
    3300: (255, 190, 126),
    3400: (255, 193, 132),
    3500: (255, 196, 137),
    3600: (255, 199, 143),
    3700: (255, 201, 148),
    3800: (255, 204, 153),
    3900: (255, 206, 159),
    4000: (255, 209, 163),
    4100: (255, 211, 168),
    4200: (255, 213, 173),
    4300: (255, 215, 177),
    4400: (255, 217, 182),
    4500: (255, 219, 186),
    4600: (255, 221, 190),
    4700: (255, 223, 194),
    4800: (255, 225, 198),
    4900: (255, 227, 202),
    5000: (255, 228, 206),
    5100: (255, 230, 210),
    5200: (255, 232, 213),
    5300: (255, 233, 217),
    5400: (255, 235, 220),
    5500: (255, 236, 224),
    5600: (255, 238, 227),
    5700: (255, 239, 230),
    5800: (255, 240, 233),
    5900: (255, 242, 236),
    6000: (255, 243, 239),
    6100: (255, 244, 242),
    6200: (255, 245, 245),
    6300: (255, 246, 247),
    6400: (255, 248, 251),
    6500: (255, 249, 253),
    6600: (254, 249, 255),
    6700: (252, 247, 255),
    6800: (249, 246, 255),
    6900: (247, 245, 255),
    7000: (245, 243, 255),
    7100: (243, 242, 255),
    7200: (240, 241, 255),
    7300: (239, 240, 255),
    7400: (237, 239, 255),
    7500: (235, 238, 255),
    7600: (233, 237, 255),
    7700: (231, 236, 255),
    7800: (230, 235, 255),
    7900: (228, 234, 255),
    8000: (227, 233, 255),
    8100: (225, 232, 255),
    8200: (224, 231, 255),
    8300: (222, 230, 255),
    8400: (221, 230, 255),
    8500: (220, 229, 255),
    8600: (218, 229, 255),
    8700: (217, 227, 255),
    8800: (216, 227, 255),
    8900: (215, 226, 255),
    9000: (214, 225, 255),
    9100: (212, 225, 255),
    9200: (211, 224, 255),
    9300: (210, 223, 255),
    9400: (209, 223, 255),
    9500: (208, 222, 255),
    9600: (207, 221, 255),
    9700: (207, 221, 255),
    9800: (206, 220, 255),
    9900: (205, 220, 255),
    10000: (207, 218, 255),
    10100: (207, 218, 255),
    10200: (206, 217, 255),
    10300: (205, 217, 255),
    10400: (204, 216, 255),
    10500: (204, 216, 255),
    10600: (203, 215, 255),
    10700: (202, 215, 255),
    10800: (202, 214, 255),
    10900: (201, 214, 255),
    11000: (200, 213, 255),
    11100: (200, 213, 255),
    11200: (199, 212, 255),
    11300: (198, 212, 255),
    11400: (198, 212, 255),
    11500: (197, 211, 255),
    11600: (197, 211, 255),
    11700: (197, 210, 255),
    11800: (196, 210, 255),
    11900: (195, 210, 255),
    12000: (195, 209, 255),
```



## Summary

嗯，就是这些，显示器上也有对应的RGB转换到RGBW其实就是颜色空间中的传递函数+显示器本身的HDR功能一起实现的，只不过他是着眼于全局和局部，动态改变这个转换。而普通的LED由于只有一个或者几个，所以是直接硬转换了。



## Quote

> https://zhuanlan.zhihu.com/p/129095380
>
> https://andi-siess.de/rgb-to-color-temperature/
>
> https://www.dmurph.com/posts/2021/1/cabinet-light-3.html
>
> http://codewelt.com/rgbw
>
> https://stackoverflow.com/questions/40312216/converting-rgb-to-rgbw
>
> http://www.360doc.com/content/20/0414/20/48998309_906061690.shtml
