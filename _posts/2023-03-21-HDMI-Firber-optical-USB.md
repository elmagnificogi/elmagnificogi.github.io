---
layout:     post
title:      "无线HDMI还是有线HDMI，亦或是KVM?"
subtitle:   "毫米波，光纤HDMI，4线，8线，有源USB延迟线"
date:       2023-03-21
update:     2023-04-26
author:     "elmagnifico"
header-img: "img/z4.jpg"
catalog:    true
tags:
    - HDMI
---

## Foreword

刚好看到有人讨论怎么解决PC从卧室连到客厅TV的问题，年初刚好实践了一波，可以分享一下经验

> https://www.v2ex.com/t/925767#reply33



## 无线HDMI

无线HDMI目前大概有三种方案，这里就按照无线频段来分，每种应对的情况都不太一样，可能有的地方也叫什么毫米波HDMI，就是个噱头而已，本质上就是WIFI而已，以下例子都是随便搜的，不做任何推荐，具体的要实际测试



### 2.4G 无线HDMI

![image-20230321213700823](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212137923.png)

这种使用2.4G的，最多1080P60HZ，可能有的还是1080i，挺搓的，2.4G由于被占用的非常多，很容易受干扰。这种只推荐在户外使用，或者在网络信道特别干净的地方用。对于这个没啥高要求的，只要求能显示，可以考虑一下。



### 5.8G 无线HDMI

![image-20230321214040463](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212140525.png)

再贵一些，就是这种走5.8G的，这里其实1080P60Hz能达到比较好的效果，至于4K30H，都是勉勉强强的那种。延迟和抗干扰倒是会比2.4G的好一些。这个东西价格和距离有关系，海备思这种就是真的短距离、没遮挡的情况下用一用，稍微远一点可能都需要上价格更贵一些的



### 60G 无线HDMI

![image-20230321214632153](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212146225.png)

到了60GHz，这个频段其实国内没有授权，只有国外部分区域是可以用的，在这个频段的WIFI，那就基本没有，加上频率又高，传输速率可以拉高，但是即便如此，这种方案多数都是4K 30Hz，要想做更高就很难了，带宽干扰都太严重了，要提高，那个价格hold不住了。

这个东西也会带来另一个问题，由于频率高，所以传输距离反而比5G的近了，想要做远就更难了。

- 60G对于无线信号的质量非常敏感，位置相对固定，甚至要发射和接收两端长时间保持无遮挡。



### 总结

再回到实际场景中，如果只是临时开会，给笔记本方便快速投屏，显然方案一和二就足够了。

而回到卧室客厅这种场景中，大部分卧室到客厅都有一堵墙吧，无线的信号也比较杂，那么方案一显然不好用了，方案二勉强够，方案三呢？依然不行，因为这个60GHz 穿墙效果很差，估计穿过去以后，电视能收到的信号就已经接近不行了。而5G的穿墙，会导致信号掉一大格左右，但是距离不是太远的情况下，还是能用的。

说回实际体验，5G穿墙以后，顶多带来4K30Hz，而想让电视显示那就至少要上个60Hz吧，30实在是太卡了，对于我来说完全不能接受。方案三也就因此变成了一个比较鸡肋的方案，上上不行，下下不行。



## 有线HDMI

我主推的是有线HDMI，如果能拉线进墙那就更好了，不能的话想办法让线走头顶也非常不错，再不行让线走地脚线吧。有线就会遇到线到底能多长的问题，这里分别解释一下，**线的长短会影响最终的输出分辨率和频率**，**线的材质同样也会影响**



### 纯铜HDMI

![image-20230321215905633](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212159706.png)

以绿联作为参考

![image-20230321215936978](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212159020.png)

超过3m以后，fps直接砍半了，如果是卧室到客厅，大概率3m是不够的，那么4K60，就做不到了？

这个线我实际买了，15m其实可以4K60，但是，是在卡Bug的情况下下60的，要反复折腾好几次才能有一次60。所以想稳定60，这种线就别考虑了，太折腾，不适合，而且这种线还有一个缺点，就是傻大黑粗，你想走墙可能都扯不动那种。

![image-20230321220517610](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212205651.png)



### 4线光纤HDMI

![image-20230321220433560](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212204682.png)

这条是我实际用的线，可看到线径只有绿联的一半多。这种HDMI，视频数据走的是光纤，所以是4根光纤然后转换成多路数据，从而达到4K60。我自己实测非常稳定

- 这种线有两种，一种是线区分方向，只能一段入另一端出，可能在某些需要回传之类的场景会有问题，还有一种是两端对等，随便插的，不过这种更贵一些。
- 由于是有光纤的，所以这根线不能折的特别过分，实际上就算是纯铜线，你也不可能折的很厉害。



### 8线光纤HDMI

![image-20230321221052571](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212210727.png)

如果要支持HDMI2.1，8K60，或者4K120，4线就有点不够了，需要更多数据线作为光纤传输了，可以选择8线光纤的HDMI，实际价格也就比4线贵一点点，**完全可以无脑选8线的**



## USB



#### 延长线

![image-20230321221713924](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212217979.png)

USB这个比较好解决，绿联的单供电15m我也能正常工作，但是如果连接的设备是比较吃电的，那么还是建议使用终端带有独立供电的线，又或者是终端直接接一个有源USBhub，也能把电压拉起来。只是USB线竟然和HDMI线一个价格，让人无法接受。

如果是USB3.0 或者连接高速设备，那么务必使用供电的线，而且有3.0标注的，否则可能会出现速度异常。



#### RJ45网口转USB

![image-20230426205705769](https://img.elmagnifico.tech/static/upload/elmagnifico/202304262057829.png)

这种依靠网线进行延长，随便跑个50M-100M应该还是可以的。当然这种无源的，带不动大功率的设备。

这种如果只需要USB1.0和2.0，可以买很便宜的，10块以内就能搞定。如果要求比较高，可以买贵一点的，两个转换头大概要50左右，再利用现成的网线，达成延长



## KVM

KVM可以参考前面的无线HDMI和有线HDMI的划分，他也有有线和无线的版本，并且也有那种自带一个远程USB hub的功能。

KVM最大的问题在于，基本找不到4K60Hz的无线带Hub级别的产品

![image-20230321222441055](https://img.elmagnifico.tech/static/upload/elmagnifico/202303212224163.png)

极限就是这种4K30Hz，带音频带USBhub，带个环出我也不知道接给谁好...

其次就是价格，KVM的价格大概是HDMI线+USB线价格的三到四倍左右，功能集成了，就是太贵了。

如果是有线KVM，虽然能解决无线的延迟问题，但是至今没看到一个能做到长距离4K60的有线KVM（有3m内60Hz的）



## Summary

最便宜、稳定的方案就是8KHDMI+USB3.0+USB有源HUB，不超过300就能搞定这一切。

希望能给后来者一点参考



## Quote

> https://detail.tmall.com/item.htm?abbucket=8&id=622019589767
>
> https://detail.tmall.com/item.htm?abbucket=8&id=651098203621
>
> https://detail.tmall.com/item.htm?abbucket=8&id=12782897345
>
> https://detail.tmall.com/item_o.htm?id=669057820184
>
> https://detail.tmall.com/item.htm?abbucket=8&id=579639869078
>
> https://item.taobao.com/item.htm?id=676902032190
>
> https://item.taobao.com/item.htm?id=552887082492
>
> https://detail.tmall.com/item.htm?id=529388031713
