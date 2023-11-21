---
layout:     post
title:      "无人机基础知识"
subtitle:   "四轴，定位，控制，科普"
date:       2023-11-21
update:     2023-11-21
author:     "elmagnifico"
header-img: "img/bg8.jpg"
catalog:    true
tobecontinued: false
tags:
    - Drone
---

## Foreword

无人机的一些基础知识，特指四轴相关



## 结构

### 翼型

按照结构或者工作原理来区分

#### 固定翼

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052125132.png)

#### 多旋翼

四轴

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052126860.png)

六轴

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052130781.png)

八轴

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060127161.jpeg)

#### 直升机

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052139515.png)

#### 伞翼、扑翼、飞艇

非常小众的机型

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052146000.png)

#### 复合翼

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052149334.png)

四轴垂起固定翼

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052148951.png)

飞米的Manta，三轴和固定翼的混合机型，三轴垂起，机翼电机可倾转



### 构型

#### X型

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052100879.png)

控制复杂，但速度更快

#### +型

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052059542.png)

控制简单，但是速度慢，基本被淘汰了

#### H型

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052100924.png)

类似X，结构上中部吃力比较多



### 轴距

无人机轴距是指在无人机飞行中,机身前后两个旋翼电机轴之间的距离

-   不包含桨叶的长度

#### 450

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052026724.png)

#### 350/330

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052029229.png)

#### 250

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052030753.png)





## 动力系统

![image-20231122000205959](https://img.elmagnifico.tech/static/upload/elmagnifico/202311220002002.png)

### 螺旋桨

正桨，反桨，主要是为了抵消扭矩，克服自旋。正反是对旋转方向的描述，吹风都是朝下吹的

-   CW,顺时针，正桨
-   CCW逆时针，反桨
-   也有用L和R的，L表示正桨，R表示反桨

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052119785.png)

**没有标记时，主要是看靠近桨叶中心的地方，切割空气的方向，来区分正反的**



### 共轴双桨

共轴反桨

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052131390.png)

-   共轴双桨可以不增加飞行器整体尺寸的前提下，增加总拉力，同时减少对相机视场的遮挡
-   共轴力效下降，大概是1.6个桨



### 桨叶参数

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052330031.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052331035.png)

桨叶型号，比如2480、8045、1045，前两个数字表示的是桨叶直径，后两个数字表示的是螺距大小。

图中的桨叶就是2480，他的直径是2.4英寸，螺距为8.0英寸

桨叶要和电机相配合使用，过大或者过小都不合适

-   桨的直径越长，在相同电机转速下其拉力越大，直径越小拉力越小。
-   动平衡也非常重要，影响整机的振动

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052337401.png)

常见的还有三叶桨、四叶桨、五叶浆。

在直径、螺距、电机转速相同的情况下，桨叶越多其拉力越大，但是其转动惯量与空气阻力也就越大。

电机使三叶桨达到与二叶桨相同转速时，需要的电流就更大，而当电流增加到十几安培乃至几十安培时，电机的内阻和电调的内阻就会消耗掉一定的功率产生热量，而电机对桨产生的动能相对减小了一部分。

具体选择什么样的桨叶、什么样的电机，和飞机本身的重力、负载功耗、电池容量等等都有关系，是需要参考建模软件求取平衡的

比如，eCalc建模计算

### 电机

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060128729.png)

电机一般按照有刷和无刷来区分，有没有电刷是最明显的区别，根据供电线也能很明显区分出来

#### 有刷电机

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052202522.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060128843.gif)

有刷电机是由直流电供电的，所以一般称有刷电机又叫直流电机

有刷电机的主要结构就是定子+转子+电刷，通过旋转磁场获得转动力矩，从而输出动能。电刷与换向器不断接触摩擦，在转动中起到导电和换相作用

#### 无刷电机

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052203298.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060128997.gif)

无刷电机是由电动机本体和驱动器组成的，由于无刷电动机采用自控方式运行，因此不需要采用变频调速方式重载起动电动机在转子上附加起动绕组

无刷电机多用3相电驱动，所以又叫交流电机，**三相交流永磁电动机**

#### 空心杯电机

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052201988.png)

一般小飞机上使用空心杯电机，归属于微电机，用在一些小尺寸的机械结构上

-   一般寿命较短，电刷磨损较快

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052204792.png)

普通说空心杯都是有刷电机，其实也有无刷的空心杯电机

#### 电机参数

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052323018.png)

KV是指每升高1V电压，转速提高多少，但是耗电量也高，电机效率会随之下降

一般来说，浆越大，需要的扭矩越大，转速自然就越低，需要电机的KV也低，力效就相对高一些，也就更省电一点，但是这种情况下不适合高速飞行

### 电调/ESC

电子调速器，简称电调，电调的作用就是将直流电转换成三相电，并根据输入的油门信号，输出给电机

有刷电机其实也有电调，但是一般都叫做驱动板，起的作用其实是相同的

无人机领域的电调基本都是BLHeli的，基本上是一家独大

#### 协议

##### PWM

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052232476.png)

电调和一些驱动器普遍都约定了，1ms-2ms的高电平，对应油门的0-100%

PWM频率一般多在50-490Hz之间，给2ms留够空间

以400Hz为例，每一个循环就是2.5ms，其中油门占用了1-2ms，剩余都是低电平

**占空比**，有些时候也会用占空比这个概念来表示输出的油门值是多少。

**占空比是指在一个脉冲循环内，通电时间相对于总时间所占的比例**

还是以400Hz为例，当输出的0油门，对应1ms，那么占空比就是1/2.5=40%，输出满油门2ms，对应占空比就是2/2.5=80%

占空比是和频率息息相关的，频率不同的情况下，占空比会大幅变化。

##### DSHOT

DSHOT协议不仅仅是输出频率高，并且他是从模拟信号转变成了数字信号，输出的信号是带校验的，抗干扰，更安全

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052225609.png)

其次DSHOT协议还约定了反馈信息，反馈中包含电调的电压、电流、温度、电机转速等信息，可以更好的帮助飞控进行更细的控制

标准DSHOT是双线协议，近年来为了减少硬件的改动，DSHOT也支持单线了

#### 校准

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052252441.png)

一般来说电调都需要校准行程，实际遥控、飞控等输出的PWM信号可能是和电调能识别的信号是有一定误差的，为了保证飞控输出油门的100%也是电调识别到的100%，就需要校准。

校准就需要使用BLHeli的软件，将电调连接到PC上进行校准。目前多数飞控都内置了校准流程，所以大部分都可以直接安装飞控以后进行校准。

#### 四合一电调

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052257629.png)

左侧是单电调，供一个电机使用，右侧是四合一电调，是可以同时供四个电机使用

飞控大多数使用的是四合一电调，同时也只有四合一电调是可以通过飞控直接调整参数的



### 电池

#### 种类

**软包锂电池**

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052310159.png)

**硬包锂电池**

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052316519.png)

18650 动力锂电池

#### 电池接口

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052309859.png)

XT系列：XT30/XT60/XT90 过电流分别是 15A/20A/30A

#### 电池参数

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052319360.png)

标称电压是锂电池的一个常见参数，**是指电池正负极之间的电势差成为电池的标称电压。标称电压由正极材料的电极电位和内部的电解液的浓度决定。** 锂电池放电曲线图，是呈抛物线的，4.2V降到3.7V和3.7V降到3.0V，都是变化比较快的，唯有3.7V左右放电时间是最长的，因此锂电池的标称电压是指维持放电时间最长的那段电压。

根据锂电池正极材料的不同，标称电压会有所不同。

-   钴酸锂电池标称电压为3.7V，满电电压是4.2v；
-   锰酸锂电池标称电压为3.8V，满电电压是4.3v；
-   锂镍钴锰三元材料的锂电池标称电压只有3.5-3.6V，但随着配方的不断改进和结构完善，该材料锂电池标称电压可达3.7V；
-   磷酸铁锂电池标称电压最低，只有3.2V，但是这种材料的锂电池安全性非常好，不会爆炸，循环性能非常优秀可达到2000周。

放电倍率：12C，是指锂电池可以稳定放电的最大电流放电倍数。锂电池充放电倍率等于充放电电流除以电池的额定容量

```纯文本
2500mAh=2.5Ah 
30/2.5 = 12c 
C数=最大电流/电池额定容量

```

其他参数，

-   充放电次数，直接影响寿命
-   充电倍率，类比放电倍率，一般充电和放电倍率不同，充电要小很多
-   **电池节数2s/3s/4s**：代表串联锂电池的节数，锂电池1节标准电压为3.7v，那么2s电池，就是代表有2个3.7v电池在里面，电压为7.4v，对应满电电压就是8.4v



## 控制系统

### 方向

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052058510.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311052058906.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060128460.gif)

俯仰角

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060128020.gif)

横滚角

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060129401.gif)

航向/偏航角

-   **pitch，roll，yaw**：指三维空间中飞行器的旋转状态，对应中文分别是俯仰，横滚，航向



### 飞控

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060127577.png)

无人机飞控有很多很多，比较知名的：

APM

> [https://github.com/ArduPilot](https://github.com/ArduPilot "https://github.com/ArduPilot")

PX4

> [https://github.com/PX4](https://github.com/PX4 "https://github.com/PX4")

BetaFlight/CleanFlight

> [https://betaflight.com/](https://betaflight.com/ "https://betaflight.com/")

匿名飞控，国内的比较拉，但是做个比赛够了

> [https://www.anotc.com/](https://www.anotc.com/ "https://www.anotc.com/")

#### 传感器

##### 惯性测量单元/IMU

一般来说IMU是由加速器计+陀螺仪组成的，~~有时候会被简称为六轴~~

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060018594.png)

-   ~~七轴，在IMU基础上加了气压计，等于是多一个高度信息，变成七轴~~
-   ~~九轴，在IMU基础上加了磁罗盘，又多了3轴磁场信息，变成九轴~~
-   ~~十轴，在IMU基础上加了磁罗盘和气压计，变成了十轴~~

不建议以轴来称呼，非常不规范

##### 加速度计/Acc

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060053307.png)

加速度计，三轴，测量加速度值

加速度计用来提供水平及垂直方向的线性加速。其数据可作为计算速率、方向，甚至是无人机高度的变化率。

但是缺点也很明显，如果无人机绕Z轴自旋，仅通过加速度计是无法测量出来的

##### 陀螺仪/Gyo

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060129384.jpeg)

陀螺仪，三轴，测量角速度值

陀螺仪能监测三轴的角速度，因此可计算出俯仰(pitch)、翻滚(roll)和偏航(yaw)时角度的变化率，而角度信息的变化可以用来维持无人机稳定并防止晃动。

##### 磁罗盘/Compass

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060129812.jpeg)

磁罗盘，三轴，测量磁场值，磁场主要是帮助无人机控制机头方向，其实也能测量角速度

##### 气压计/Baro

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060129454.jpeg)

气压计，单轴，测量气压值，主要是帮助无人机控制高度，特别是当缺少GPS或者GPS高度不可靠时

##### 电压ADC

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311060058815.png)

温度或者电压是由ADC测量出来的，测量的就是缩放或者映射的电压值



### 数据融合/姿态解算

无论是加速度计、陀螺仪还是磁罗盘，他们都有一定的局限的，单独只使用某一个是无法准确估计当前飞机的姿态的。它们优缺点互补，结合起来才能有好的效果。现在有了三个传感器，一定程度上都能测量角度，但是究竟相信谁？根据刚才的分析，应该是在短时间内更加相信陀螺仪，隔三差五的问问加速度计和磁传感器，对陀螺仪进行修正。

无论传感器再怎么精准，他都是有输出频率的限制的，他都是一个离散的系统，必然会有误差，而数据融合就是，就是希望可以通过滤波算法（EKF）估计出来当前系统的准确值

有了滤波以后的数据，那么就可以通过积分来计算当前飞机的姿态了

姿态的表示一般有三种

-   欧拉角，前面提到的角度即是欧拉角，比较直观，好理解
-   旋转矩阵
-   四元数

可视化转换网站

> [https://quaternions.online/](https://quaternions.online/ "https://quaternions.online/")



### 控制算法

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311141417137.png)

从时间尺度上进行分析，飞机的姿态角变化的频率要大于飞机位置的频率，应当使用内外双环控制，内环控制姿态角，外环控制位置



### 机载

![image-20231121234344538](https://img.elmagnifico.tech/static/upload/elmagnifico/202311212343596.png)

机载，全称机载电脑，一般来说算力比较强，用来做一些拍照、摄像等等应用



### 电源管理

多数飞控BMS几乎等于0，只管个总电压，分电压基本不管的，实际商用的设备里BMS就比较完善一些，能提供很多电池的信息



## 定位系统

### GPS

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120131698.png)

Global Positioning System，广义的GPS，泛指一切通过卫星向全球提供三维位置等信息的定位系统。

狭义的GPS，单独指美国的GPS

比如俄国的格洛纳斯（GLONASS），中国的北斗（BDS），欧盟的伽利略（Galileo）

GNSS，Global Navigation Satellite System，全球导航卫星系统



### RTK

RTK，实时差分定位

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120132370.png)

一般RTK有两种模式，一种是地面基站+电台，一种是网络基站

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120137877.webp)

网络基站模式，千寻、移动CORS，省CORS

### UWB

Ultra Wide Band，超宽带技术

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120156347.png)

类似GPS的定位原理，但是其基站可以架设在室内等GPS覆盖不到的区域，苹果大力推广的，但是目前还没有什么效果



### 摄像头

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120149358.png)

使用摄像头定位，性能要求高，对SOC算力有很大要求，延迟高，实时性差，深度相机可以提供3轴定位信息

### 光流

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120151359.png)

实时性高，精度高，但是视角小，距离短，很容易受地面纹理和反光等影响，一般只能提供2轴定位信息

### TOF

TOF，Time of flight

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120153976.png)

只能提供单轴数据，距离较远，但是有死区，距离较短时无法测量。

TOF只是基础原理，实际上可以利用激光、超声波、毫米波等等方式进行测量，他们都叫TOF，一般泛指单轴的基于TOF原理的定位产品。

### 激光雷达

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120153536.png)

其实就是激光测距+360度的电机

### 毫米波雷达

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120159833.png)

测量距离远、没有机械结构，抗干扰强，有角度限制



## 通信系统

![](https://img.elmagnifico.tech/static/upload/elmagnifico/5c00a78687365.png)

### 频率

```纯文本
频率x波长=光速
```

频率越低，传播距离越长，波长越长那么穿透力就越强（同理音频低频穿透力强，高频穿透力弱）

频率越低，能携带的信息就越少，通信速率也就越低

#### 433MHz

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120256440.png)

430.050～434.790MHz是免申请段发射接收中心频率

#### 915MHz

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120256606.png)

免许可的915 MHz工业频段

868MHz

Lora、zigbee、RFID

#### 1575

GPS使用的频段

1.  L1频段－1.57542GHz
2.  L2频段－1.22760GHz
3.  L3频段－1.38105GHz
4.  L4频段－1.84140GHz
5.  L5频段－1.17645GHz

一般民用的是L1和L2、L5，一般L1和L2是RTK基站使用的，L1和L5是客户端使用的

#### 2.4GHz

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120257637.png)

2.400～2.483GHz，WIFI或者是遥控、无线鼠标、无线键盘、蓝牙等等都是基于这个频段的

#### 5.8GHz

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120305642.png)

5.15～5.25GHz，正常可用

5.25～5.35GHz，正常可用

5.35GHz\~5.725GHz，DSF频段，默认不应该使用

5.725～5.825GHz，正常可用



#### 6.0GHz-6.5GHZ

UWB工作的频段



### WIFI

#### 设备名词解释

AC，Access Controller，无线接入控制器

AP，Wireless Access Point，WAP，无线接入点

Fat AP，胖AP，可以独立控制

Fit AP，瘦AP，不可以独立控制，必须通过AC进行管理

交换机，仅仅具有交换和部分二层管理功能

路由器，具有路由和交换功能的，三层设备

POE，Power Over Ethernet，网络设备中约定的供电方式

POE交换机，具有POE供电的交换机

POE协议，标准POE供电48V-53V，802.11AF、AT、BT，供电功率从15w、30w、90w不等



#### 网络名词解释

DHCP，由路由器自动分配IP

静态IP，需要手动设置IP

网关，简单理解为当前局域网内的主路由器IP或者是局域网内的主交互机IP，负责帮你沟通其他网络

子网掩码，主要用来划分局域网大小

SSID，接入点名称

信道，SSID工作的频段的别称

频段，工作频率的范围

带宽，频段所占用的大小

速率，bps，位每秒，Bps字节每秒

干扰：

![](https://img.elmagnifico.tech/static/upload/elmagnifico/6YpQidaZxPq5Uo4.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/5ca1c9e41ad0d.png)



网络拓扑

![image-20231121234836270](https://img.elmagnifico.tech/static/upload/elmagnifico/202311212348322.png)



### 遥控

遥控包含两个东西，遥控器和接收机，一般是一对一的

遥控也分不同频段和电台非常类似，后续会介绍说明

#### 接收机

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120231813.png)

接收机和遥控器都需要先对频，再控制

#### 遥控器

不同遥控器有不同的通道数

##### 美国手

![](https://pics6.baidu.com/feed/7aec54e736d12f2e8c53dcef32fb5c6e843568b4.jpeg@f_auto?token=f96ca080265e694c6cb0d002f76610de)

遥控器的左摇杆，负责无人机的上升下降、原地顺时针/逆时针旋转

遥控器的右摇杆，负责无人机在水平位置上的前后左右移动

##### 日本手

![](https://pics2.baidu.com/feed/8b82b9014a90f6034cc16b87422b3a17b151ed47.jpeg@f_auto?token=39054b7ecbc4138372fd2d136f261c34)

遥控器的左摇杆，负责无人机在水平位置上的前后、原地顺时针/逆时针旋转

遥控器的右摇杆，负责无人机的上升下降、左右移动

##### 中国手

![](https://pics4.baidu.com/feed/caef76094b36acafdc7fdc8d00e0041c00e99cee.jpeg@f_auto?token=28bd0f564b7a998fef14f2becb28ec86)

遥控器的左摇杆，负责无人机在水平位置上的前后左右移动

遥控器的右摇杆，负责无人机的上升下降、原地顺时针/逆时针旋转

#### 模拟器

Phoenix R/C Pro Flight Simulator

> [https://www.rc-thoughts.com/phoenix-sim/](https://www.rc-thoughts.com/phoenix-sim/ "https://www.rc-thoughts.com/phoenix-sim/")

大疆模拟器

> [https://www.dji.com/cn/simulator](https://www.dji.com/cn/simulator "https://www.dji.com/cn/simulator")

Uncrashed : FPV Drone Simulator

> [https://store.steampowered.com/app/1682970/Uncrashed\_\_FPV\_Drone\_Simulator/](https://store.steampowered.com/app/1682970/Uncrashed__FPV_Drone_Simulator/ "https://store.steampowered.com/app/1682970/Uncrashed__FPV_Drone_Simulator/")



### 电台

![image-20231122000543471](https://img.elmagnifico.tech/static/upload/elmagnifico/202311220005521.png)

电台本身也是类似遥控的架构，但是电台一般都是一对多的

电台分为：电台基站/转发/发送端，电台接收端



### 2G/4G LTE/5G

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120306845.png)

GPRS，General Packet Radio Service

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120308887.png)

![image-20231122000730315](https://img.elmagnifico.tech/static/upload/elmagnifico/202311220007396.png)

4G LTE模块



## 负载系统

无人机负载实现效果



### 云台、图传、摄像机

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120339332.png)

### 灯板

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120326937.png)

rgb，指红绿蓝三色光，可混合出各种彩光

rgbw，指红绿蓝三色光外，还有暖白光

rgbcw，指红绿蓝三色光外，还有暖白光、冷白光

关于暖白光和冷白光，在这里不得不提另外一个东西，色温值。

在照明领域光的色温是指：在黑体辐射中，随着温度不同，光的颜色各不相同，黑体呈现由红—橙红—黄—黄白—白—蓝白的渐变过程。某个光源所发射的光的颜色，看起来与黑体在某一个温度下所发射的光颜色相同时，黑体的这个温度称为该光源的色温(和被测辐射色度相同的全辐射体的绝对温度)。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120324145.jpeg)

### 烟花

![image-20231122000820618](https://img.elmagnifico.tech/static/upload/elmagnifico/202311220008676.png)

![image-20231122000829485](https://img.elmagnifico.tech/static/upload/elmagnifico/202311220008552.png)



### 激光

![image-20231122000935748](https://img.elmagnifico.tech/static/upload/elmagnifico/202311220009826.png)



### 照明

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120338061.png)



## 其他

### 控制模式

#### 飞行模式

![](https://docs.px4.io/main/assets/img/manual_stabilized_MC.857b681e.png)

S，Stabilize，自稳模式，手动控制飞行器的姿态角度，无需GPS和高度即可控制

A，Altitude，保持高度，简称定高，不需要GPS，仅有高度信息即可

L，Loiter/Position，保持当前高度、位置和航向，需要GPS与高度

G，Guided，其他多种模式的复合模式，需要各种信息参与解算



#### 降落模式

Land，原地降落，从当前位置直接向下降落

RTL，Reutrn to launch，返航模式，飞回起点上空，然后降落



### 充电

#### 充电器

![image-20231121235142075](https://img.elmagnifico.tech/static/upload/elmagnifico/202311212351123.png)

一般航模电池需要平衡充，核心是让多块电芯的电压充满以后差不多，需要这个的原因是大部分航模电池缺少BMS，就不得不使用外置的手段来处理这个问题



#### 测电器/BB响

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120348667.png)

测电器



### 执照

#### 培训学校

慧飞无人机应用技术培训中心，拿到的是UTC的证，大疆的子公司

全球鹰无人机飞行学院，CAAC，民航证

- 目前是以培养CAAC证为主



#### 飞手执照

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120401294.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120351802.png)

AOPA



### 法规

2024新规开始执行

-   120m以下，空域无需申请，需要执照
-   250g以下，50m以下随便玩，不需要执照

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120355907.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202311120356769.png)



## Quote

> [https://baijiahao.baidu.com/s?id=1694684445344738639\&wfr=spider\&for=pc](https://baijiahao.baidu.com/s?id=1694684445344738639\&wfr=spider\&for=pc "https://baijiahao.baidu.com/s?id=1694684445344738639\&wfr=spider\&for=pc")
> [https://zhuanlan.zhihu.com/p/503816407](https://zhuanlan.zhihu.com/p/503816407 "https://zhuanlan.zhihu.com/p/503816407")
> [https://blog.csdn.net/yinxian5224/article/details/102744613](https://blog.csdn.net/yinxian5224/article/details/102744613 "https://blog.csdn.net/yinxian5224/article/details/102744613")
> [https://docs.px4.io/main/zh/](https://docs.px4.io/main/zh/ "https://docs.px4.io/main/zh/")
> [https://zhuanlan.zhihu.com/p/453454499](https://zhuanlan.zhihu.com/p/453454499 "https://zhuanlan.zhihu.com/p/453454499")
> [https://blog.csdn.net/MOU\_IT/article/details/80361331](https://blog.csdn.net/MOU_IT/article/details/80361331 "https://blog.csdn.net/MOU_IT/article/details/80361331")
> [http://www.crazepony.com/book/](http://www.crazepony.com/book/ "http://www.crazepony.com/book/")
> [https://uavcoach.com/drone-flight-simulator/#guide-2](https://uavcoach.com/drone-flight-simulator/#guide-2 "https://uavcoach.com/drone-flight-simulator/#guide-2")
> [http://www.gl-uav.com/index.php?id=879](http://www.gl-uav.com/index.php?id=879 "http://www.gl-uav.com/index.php?id=879")
