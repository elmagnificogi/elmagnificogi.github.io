---
layout:     post
title:      "电动升降桌逆向，接入米家"
subtitle:   "STC，90°直角桌，拐角桌"
date:       2024-03-23
update:     2024-04-04
author:     "elmagnifico"
header-img: "img/bg6.jpg"
catalog:    true
tobecontinued: false
tags:
    - Crack
    - Goods
    - Equip
    - DIY
---

## Foreword

升降桌都发展这么久了，可以接入米家的竟然只有2款，一个9H的，还有一个昌捷的，这两个价格都不低，而且也没有我想要的拐角桌类型，既然如此不如自己DIY一个。

![image-20240324003255474](https://img.elmagnifico.tech/static/upload/elmagnifico/202403240032574.png)



## 升降桌架

![image-20240324005057999](https://img.elmagnifico.tech/static/upload/elmagnifico/202403240050041.png)

![image-20240324004737861](https://img.elmagnifico.tech/static/upload/elmagnifico/202403240047901.png)

升降桌升高以后晃动，还是得靠自身底部重量来平衡，不过拐角桌的好处就是多了一个角度支持，就算升高了也比同等水平的升降桌稳太多了。

一个电机大概负载80kg左右，实际上桌腿本身就已经非常重了，再加上桌架、桌面，就算是三腿的桌子，除了桌子本身负重大概只能到150kg

![image-20240324005109352](https://img.elmagnifico.tech/static/upload/elmagnifico/202403240051405.png)

现在也有四腿的桌子，稳定性Max，不过单桌腿价格就在2000以上了，同比三腿可以控制在两千内，两腿一千左右



## 桌板

![image-20240324005854644](https://img.elmagnifico.tech/static/upload/elmagnifico/202403240058797.png)

还有一个榆木，比松木稍微硬一点，桌板如果选松木最好厚一点，松木本身不耐压，有些紧固件会留下很明显的痕迹，用久了就有点坑坑洼洼的。

松木最便宜，榆木价格差不多600-700，所以一般选榆木多一点，但是榆木的颜色都有点老旧，缺少比较亮的颜色。其他木头硬度都比较高，不过价格也基本一样高都接近1000，1m²-2.5cm厚，黑胡桃价格最贵，接近2000了，越贵的木头可以选择的颜色越少，越便宜的反倒颜色越多。

这种图表都比较笼统，实际上同一种树也有不同亚种，也有很多细小分支，属性上还是有很大范围差异的，还是以实际体验为准。

![img](https://img.alicdn.com/imgextra/i4/1618172521/O1CN01oMd0Va1UUfPwPUhSk_!!1618172521-2-ampmedia.png)

注意桌面背面最好也要抛光一下，可以不上漆，但是要抛光，不然全都是木屑渣滓，弄不干净的，抛光这个活个人做不了，最好是工厂做好

如果自己有打磨器也可以自己磨，最好在还没安装前打磨，然后上漆，木漆很便宜，而且很多种颜色可以选



## 控制器

控制器有好几种，能选的话，尽量选物理的



### 电容版

默认是电容按键的，按键是检测电容的方式，接入米家不是很方便

![image-20240323194108732](https://img.elmagnifico.tech/static/upload/elmagnifico/202403231941806.png)

- 这种用料好一些，有独立typec口的充电和USB-A口的充电，但是不带快充



芯片

- 主控，STC 8H1K17
- 触摸芯片，XW09A



电容的按键，万用表或者是导线一接触到就触发了，这也就导致了后面的米家模块的IO控制没办法直接用在这里



### 机械版

![image-20240323194353230](https://img.elmagnifico.tech/static/upload/elmagnifico/202403231943411.png)

可以让店家给物理按键的控制器，两种都是通用的。可以看到这个电路就简单很多了，背面是数码管和按键，控制逻辑也很简单。

- 注意这个是老款，本身不带typec和USB-A口的充电口



芯片

- 主控，STC 8H1K16



#### 逆向

![image-20240323212627806](https://img.elmagnifico.tech/static/upload/elmagnifico/202403232126939.png)

确认两个芯片都不带CAN口，也就是说协议用CAN的可能性很低，用RJ45口连接，又比较长，大概率是个网线串口



确认芯片手册，工作电压是应该是5V，红线给过来的也刚好是5V

![image-20240323215824526](https://img.elmagnifico.tech/static/upload/elmagnifico/202403232158905.png)

LQFP封装，32脚

![image-20240323215849668](https://img.elmagnifico.tech/static/upload/elmagnifico/202403232158698.png)

10和11脚接VCC，12脚GND，13是Rx，14就是Tx，走线方向刚好是右侧的排插位置



对应排线：

红色-VCC

绿色-GND

黄色-Tx

黑色-Rx



一共有7个按键，上升、下降、模式1、2、3，模式设置和定时功能，如果接入米家一般来说可以接入上升、下降、模式1、模式2，刚好4键，或者是~~模式1，2，3+定时功能~~（一定要留一个上升或者是下降的按键）

具体每个触发按键，平时按键输出是5v，按下时按键输出是0v

![image-20240323234426360](https://img.elmagnifico.tech/static/upload/elmagnifico/202403232344906.png)

经过测试，所有按键的引脚如图所示

- 注意焊接的时候用芯片引脚，尽量不要破坏前面板的覆膜，这个覆膜可以有效减缓按键触点老化



### 串口协议

经过测量，具体协议如下：

手上一时没逻辑分析仪，后续再补充吧



## 米家模组

![image-20240323211835236](https://img.elmagnifico.tech/static/upload/elmagnifico/202403232118271.png)

能从咸鱼上直接买到的米家开关模块，MHCB05P-B，内置天线，BLE Mesh，同时卖家也有对应的底板，可以焊接好，价格大概十几块钱就能搞定

这个底板使用的刚好也是5V输入

![image-20240323220203470](https://img.elmagnifico.tech/static/upload/elmagnifico/202403232202626.png)



![image-20240323220238596](https://img.elmagnifico.tech/static/upload/elmagnifico/202403232202629.png)

咸鱼给过来的默认R1=NC，也就是四键模式的开关，刚好够用

![image-20240323222224830](https://img.elmagnifico.tech/static/upload/elmagnifico/202403232222864.png)

可以看到默认的Relay是高电平有效，也就是说米家里开关关闭，Relay输出低，开关打开，Relay输出高，这个逻辑刚好和控制器相反了。

- 米家模块的高电平是3.3v，STC会把3.3v试做高电平

这里需要连接好以后，在米家里修改4个按键的默认上电状态为开启，这样才能防止一启动就误触了升降模式



![image-20240324003540930](https://img.elmagnifico.tech/static/upload/elmagnifico/202403240035036.png)

焊接完成以后，放到斜面拐角里，用纳米双面胶粘牢即可



### 米家设置

首次接入米家是这样的：

![image-20240324002529298](https://img.elmagnifico.tech/static/upload/elmagnifico/202403240025335.png)

设置中修改每个按键默认通电后状态为开启

![image-20240324002619272](https://img.elmagnifico.tech/static/upload/elmagnifico/202403240026311.png)

创建两个手动控制，分别是坐着工作和站着工作

![image-20240324002739966](https://img.elmagnifico.tech/static/upload/elmagnifico/202403240027014.png)

对应操作就是`先关闭按键-延迟-再打开按键`，这样就等同于我们自己按下按键了

剩下就是提前把模式1设置为坐着的高度，模式2设置为站着的高度，就可以随便玩耍了

定时模式类似，可以加几个定时的指令，设定定时时间即可



由于控制板无操作的情况下是1分钟进入休眠状态，而一旦休眠了，就需要按任意一个按键来恢复休眠，所以必须得重复2遍按键的操作才能在休眠状态下升降

![image-20240325140250898](https://img.elmagnifico.tech/static/upload/elmagnifico/202403251402006.png)

而如果此时控制板是激活状态，执行这条命令就会导致运行了一下模式1，然后又停止了。

想要解决这个问题，最好在前面连接的时候，选择连接一个上或者下，去掉定时的控制，每次用上或者下作为唤醒操作，然后再操作对应的模式

![image-20240327001206260](https://img.elmagnifico.tech/static/upload/elmagnifico/202403270012344.png)

- 两个上升/下降按键之间不要加延迟，本身就自带延迟了，未休眠的情况会出现桌子上升/下降了一瞬间，然后停止，再接着走模式指令



还有一个办法是通过米家极客版，新出了变量系统，把休眠还是未休眠作为一个判断的变量带入，根据不同状态来执行不同操作



## 配件

![image-20240327001841746](https://img.elmagnifico.tech/static/upload/elmagnifico/202403270018884.png)

- 图中托架千万别买，非常软，有很大的坠落风险

由于升降的问题，这个会导致如果有东西放在地上，可能会扯到线什么的，所以最好的办法是，附带一个主机托架，固定在桌下，随桌一起动，排插什么的自然也是，最后只有2根线是连接到墙插的，其他都是不受升降影响的。

![image-20240327001758586](https://img.elmagnifico.tech/static/upload/elmagnifico/202403270017639.png)



由于升降桌中段必然会出现支架和桌面有一定缝隙，这个缝隙大概有2mm左右，刚好是各种布带或者魔术带可以穿过的距离

![image-20240404012250541](https://img.elmagnifico.tech/static/upload/elmagnifico/202404040122655.png)

建议直接买4cm宽的魔术带，然后把主机挂起来即可，稳当而且减震，多余的魔术带用来理线再好不过了



理线架

![image-20240330003132502](https://img.elmagnifico.tech/static/upload/elmagnifico/202403300031645.png)

价格极低，长度可以剪裁，沿桌边来一圈刚刚好



## Summary

主要还是米家接入有点麻烦，得要公司认证，而且各种模块也不是想开发什么就可以开发什么的，要走审核，走流程，相比两个正规接入米家的桌子，少了当前距离的显示，稍微差了点吧。

至于升降桌的升降接入米家到底有啥用？除非是要摄影或者某些操作无法直接按，非要语音控制，那有点意义，不然其实没啥用。实际工作的场景，大概率这个控制器是在手边的，能直接按到



## Quote

> https://item.taobao.com/item.htm?id=627812695557

