---
layout:     post
title:      "GPS 时间中的那些坑"
subtitle:   "u-blox，iTow，utc"
date:       2021-09-17
author:     "elmagnifico"
header-img: "img/bg1.jpg"
catalog:    true
tags:
    - GPS
    - Embedded
---

## Foreword

遇到一个奇怪的问题，GPS 给出来的 UTC 时间竟然出现了跳跃的情况。理论上说这个 UTC 时间应该是非常准确的，这里梳理一下可能遇到的 GPS 的坑



## 问题起源

![](https://img.elmagnifico.tech/static/upload/elmagnifico/y7IoO1GYES3XNbP.png)

时间是通过 PVT 这个包获取到的，由于我需要准确到 ms 时间，一般情况下只提供到 sec 的时间，当时我选择使用 iTOW 时间，它本身定义的是本周的 ms 时间，而我只需要取后3位，作为 ms 时间用就行了，也没啥特别的需求。

于是我忽略了 iTOW 的提示：

![](https://img.elmagnifico.tech/static/upload/elmagnifico/ZvWOgydpXJURswq.png)

简单说就是 iTOW 是比较老的时间标准了，它本身可以算是一个 raw 数据级别，不建议使用。

而我当时也只需要用来做一个 ms 级的校时，从 log 上看 iTOW 一直保持的 ms 时间也没啥问题。（GPS 5Hz，iTOW后三位基本保持000、200、400、600、800这样的输出）

而最终校时的输出是这样的：

```
cur_time = sec * 1000 + iTOW % 1000;
```

看起来没啥问题吧，但是问题就在这里。



## iTOW 与 sec 不同步

发生问题时，发现 sec 已经+1了，而 iTOW 竟然是 999，这就导致算出来的当前时间，直接多了近1秒。

再仔细看一下，发现发生问题时，这一秒内的消息中，iTOW 全都是 99 结尾的数值，而不是正常的 00 结尾。1秒后，iTOW 就恢复了正常，变成了 00 结尾。但是这提前的1秒可能会在某些关键系统里出错。

所以iTOW说的不推荐使用，是真的不推荐使用，多数情况下可能没啥问题，但是有问题的时候，真的坑爹啊。



## nano

正确的获取毫秒的值，应该是从 nano 中读取

![](https://img.elmagnifico.tech/static/upload/elmagnifico/3NpcPKwqJRF54xh.png)

虽然 nano 单位是 ns，但是实际上他的精度只有 10ms。而且这个 nano 本身可以是负数，虽然只有 -5ms，但是它可以负。

而且一旦他是负数，那么对应的 sec 就不对了，sec 需要减1，对应有可能年月日都有可能需要涉及到减一退位的情况。

所以这里建议不要直接使用年月日时分秒，而是把他们转换成 utc 时间以后和 nano 做完加减法，再转成年月日时分秒。



**但是就算用了nano，这个时间依然有可能跳。而要解决跳变的问题，就不能完全信任gps时间，需要对gps给出来的时间进行一次滤波，只有在gps时间连续的情况下，才取信，否则就等待他达到时间连续的稳态。**



## tAcc

可能有人还注意到了这个tAcc，实话说这个具体什么用完全没看明白。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/3GPvWYwfmjX5UH2.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/TDmOlJ9VCUPtnK2.png)

感觉这个 tAcc 应该不是给我们用的，反倒是像是我们设置的。



## 有效性问题

由于之前没有判断这个有效性，所以也没注意是否当前时间可用。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/pScuV3bjWDEgUy5.png)

这个标志位中最好是用 fullyResolved，可以保证到秒都是确定 ok 的

但是不同手册对于这里的说明是不同的，比如：

![](https://img.elmagnifico.tech/static/upload/elmagnifico/3sdZPlbouxH4R5L.png)

可以看到，fullyResolved 这里前一秒说全解析了，后一秒又说不能用来判断是否全解析了，我看不懂，但是我大受震撼。这里描述非常迷惑，time 到底是指什么 time



![](https://img.elmagnifico.tech/static/upload/elmagnifico/DeVRkzBjScoX687.png)

关于时间有效性的说明，无非就是踢皮球，告诉你这个标志位在哪里用了，实际上是什么还是没说。



![](https://img.elmagnifico.tech/static/upload/elmagnifico/LqQ8XmDoMCEvhAc.png)

再看这个标志2，这里的 confirmed 非常有意思，他是用来验证，时间有效标志位被置位是有效的。相当于是我验证你验证的正确性。但是这个 confirm 从上面的解释来说，需要一个额外的时钟源做验证，但是具体怎样的时钟源呢？又没说。而且这个我验证你的验证，也只是保证了高可用性，而不是一定可用。感觉这里弯弯绕，实在是有点坑爹啊。



#### 定位无效

当定位无效的时候，有可能此时时间还是有效的，但是不建议使用。这时有可能时间会跳错，如果此时也信任了这个时间就会出现时间抖动的情况。



#### 软重启

还有一种情况，比如通过命令，让gps软重启了，或者说热重启了一下，这个时候重新给出来的数据包，time也是valid的，和上面的一样，此时是定位无效，所以也不建议使用此时的时间。

实际发生的情况下就是，软重启以后，隔了2个数据的时间，给了一个老数据包，然后就出现了0.4s的时间跳跃，关键这个包是往回跳了。



## 闰秒问题

![](https://img.elmagnifico.tech/static/upload/elmagnifico/kcPqoBhEHJlwKYx.png)

简单说就是全世界多了一秒，但是理论上也有可能全世界同时少一秒。

而这个多一秒还是少一秒，在 GPS 同步的过程中，会自动下载这个闰秒信息。针对过去的闰秒已经修正了。但是针对未来的闰秒，是有可能出现给出来的时间信息中有61秒或者是持续2秒的59秒。

GPS固件中默认会有一个 leap seconds，固件更新这个值也有可能会变，在没同步的情况下时间计算是通过这个默认值来的，但是和卫星同步以后，这个值会被修改，有时候如果没同步到或者同步晚了，会出现时间不正确的情况。

到现在为止已经有27次闰秒了，



## Summary

总体来说要使用gps的时间戳，需要判断2个东西

- 包内数据值是连续的，比如（nano时间连续）
- 包的到达时间连续，防止某个时间戳晚到



ublox的文档中还是有相当多的内容没有详细说明的，如果有人知道欢迎留言。



## Quote

>https://baike.baidu.com/item/%E9%97%B0%E7%A7%92/696742?fr=aladdin

