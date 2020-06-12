---
layout:     post
title:      "BLHeli-Uart-Usb-Protocol"
subtitle:   "4way-if，ardupilot"
date:       2020-06-03
author:     "elmagnifico"
header-img: "img/drone-head-bg.png"
catalog:    true
tags:
    - BLHeli
---

## Forward

BLHeli自从升级到了32位以后，就闭源了，而要做到ecs自动校准或者说统一设置，就必须要他的协议。

> https://github.com/bitdump/BLHeli

而对应的上位机配置协议也从32位开始闭源了。

> https://github.com/4712/BLHeliSuite

但是呢，上位机的作者在Betaflight的代码里给出来了他的电调透传代码。

> https://github.com/betaflight/betaflight

然后这部分代码又继续被移植到了ardupilot

> https://github.com/ArduPilot/ardupilot

如果只是要16位的BLH电调的协议，其本身是开源的，所以可以直接拿到

> https://github.com/4712/BLHeliSuite/blob/master/Manuals/BLHeliSuite%204w-if%20protocol.pdf

## BLHeliSuite32协议介绍

一般来说BLH有三种interface，可以认为是有三种协议

- 4way-if
- USB-Com
- Betaflight/Cleanflight

但其最核心协议其实是一套或者说十分类似。

#### 4way-if

其实就是至少3根线，GND，MISO，MOSI，如果还有更多电调，就继续接。

但是也存在只有2根线就能完成的情况，就只要GND和SIG就行了，如果更多电调的话那就更多SIG就可以了

#### USB-Com

同理，这里的USB或者Com都是一个转化的小板子，这个板子转换的结果也是GND和SIG，并且都是基于串口协议的

#### Betaflight/Cleanflight

这个其实就是用来passthrough的，虽然接的是飞控的usb口，但是实际上是一个透传，而这个透传协议本身的实现也是基于GND和SIG的



既然所有方式都可以指用GND和SIG，那这个协议我们就认为他是BLH的核心通信协议。

## BLH Protocol

BLH的核心协议，这个本质上其实是一个单线串口，波特率是19200，8，n，1.通过电调的SIG线做一个串口Rx和Tx的复用，从而完成和电调的通信。

BLHeliSuite的作者4712的代码中其实有很多带有一点迷惑性，特别是被移植到ardupilot的部分，有很多奇怪的设定，如果不能直接用ardupilot的调试，直接看来理解协议基本都会跑偏

由于是使用串口通信，并且所有信息都在一根线上，所以通信的时候都有用16位crc校验

具体的校验结果可以从下面的网址看到，选择CRC-16/IBM，发送时先发低8位后发高8位

> http://www.ip33.com/crc.html

具体的校验代码：

```c
uint16_t esc_crc(const uint8_t *buf, uint16_t len)
{
    uint16_t crc = 0;
    while (len--) {
        uint8_t xb = *buf++;
        for (uint8_t i = 0; i < 8; i++) {
            if (((xb & 0x01) ^ (crc & 0x0001)) !=0 ) {
                crc = crc >> 1;
                crc = crc ^ 0xA001;
            } else {
                crc = crc >> 1;
            }
            xb = xb >> 1;
        }
    }
    return crc;
}
```

#### 屏蔽音

如果打开了启动音,上电时,电机在叫的时候,本质上此时电调是不接收任何输入的,并且此后的输入如果没有任何改变,会被屏蔽:比如开启了启动音,然后上电时PWM输出1000,此时由于电调在叫所以无法接收任何输入,1000就被屏蔽了,只有改变1000这个值才能让电调响应对应的输出。所以配置的时候要么本身就关闭启动音，要么就是等待启动音结束以后再进行配置，否则可能配置指令没响应



下面开始介绍具体的协议

#### 连接

点击上位机的connect的时候，通信协议如下

其协议本身全都有16位CRC校验，CRC-16/IBM，其中发送时先发低8位后发高8位

点击connect，上位机发送如下指令

```c
00 00 00 00 00 00 00 00 0d 42 4C 48 65 6C 69 F4 7D
解析：
前两个 00 00 是重启boot命令
后面两个 00 00 是crc
重复了2次
    
实际有效内容应该是（4712源码或者上位机存在误导）
42 4C 48 65 6C 69 F4 7D 
F4 7D 是crc校验

回复如下内容：
34 37 31 6A 33 06 07 04 30 
解析：
34 37 31 是字符串471，每次都会以此开头
33，06是电调类型，其中包括了ATM，SIL，ARM等
30 表示接收成功ack
注意这里没有crc校验字符    
    
源码中有详解电调类型的
    uint16_t *devword = (uint16_t *)blheli.deviceInfo[blheli.chan];
    switch (*devword) {
    case 0x9307:
    case 0x930A:
    case 0x930F:
    case 0x940B:
        blheli.interface_mode[blheli.chan] = imATM_BLB;
        debug("Interface type imATM_BLB");
        break;
    case 0xF310:
    case 0xF330:
    case 0xF410:
    case 0xF390:
    case 0xF850:
    case 0xE8B1:
    case 0xE8B2:
        blheli.interface_mode[blheli.chan] = imSIL_BLB;
        debug("Interface type imSIL_BLB");
        break;
    case 0x1F06:
    case 0x3306:
    case 0x3406:
    case 0x3506:
    case 0x2B06:
    case 0x4706:
        blheli.interface_mode[blheli.chan] = imARM_BLB;
        debug("Interface type imARM_BLB");
        break;
    default:
        blheli.ack = ACK_D_GENERAL_ERROR;        
        debug("Unknown interface type 0x%04x", *devword);
        break;
    }
```

有一些关键点需要注意

- 串口的T和R的切换间隔是52us左右，非常短暂，如果切换速度太慢了就会导致IO没有上拉，从而干扰ESC回复信息，就会出现未接收到的情况。
  程序里必须足够快的切换接收和发送状态，否则肯定收不到回复的信息。
- 这条命令的前置0，其实是让电调处于boot解锁的命令，如果在发送之前电调不是处于0解锁状态下，那么会导致后面实际命令无法解析，如果已经将输出切到了全0状态，那么直接发实际命令就可以了
- 如果发送连接,但是却没有断开或者没有任何回复,会导致下次再连接的时候什么都不回,所以连接和断开最好成对使用
- 一直连接无回复,可以试试先发送断开然后等待1s,发送一些0000,再发送连接

ardupilot中基本每个命令都是1秒延迟发送的,通信频率相当低,但是实际上并不需要这样,只有在发生异常或者通信错误的情况下,需要一个1秒延迟来timeout,然后再重发命令就好了.



#### 保持

当成功连接以后，上位机需要每秒发送1个保持连接的指令，如果有其他命令发送的话也可以认为是发送了保持命令

```
FD 00 40 90 
解析：
40 90 是crc
```



#### 断开

断开连接发送的是

```
00 01 C1 C0 
解析：
C1 C0 是crc
```



#### 读取配置信息

先说如何读取配置，首先设置要读取的地址，然后发送读取，最后等待接收对应的信息

读取配置信息一共要读3个地方

第一次读取0x7C00，发送命令，设置地址 

```
FF 00 7C 00 10 D4 
解析：
7c 00 是地址
10 d4 是crc校验
这个命令会收到一个ack，30
```

接着立马发送读取命令，读取量达到256字节

```
03 00 00 F0 
03 00 表示读取256字节
00 F0 是crc
```

回复内容，259字节

```
45 9E 4C 2E B0 AC 1E 10 2D DF 70 77 EE 88 AB C8 07 61 B7 D5 A8 6A D7 B3 D4 41 9A 26 A2 2E A3 EE F2 30 F1 C8 3B 5E 70 B4 11 A2 3D F4 FF 81 B4 7A F4 7B ED BB D2 E3 2C C0 8D A5 31 E1 F0 3C 59 C8 5E 9E 50 78 11 DF 14 42 D4 13 CC E0 B6 9B 52 E1 52 75 A5 78 6E 2E A8 C9 5A 9A CA 48 87 A5 99 C5 20 82 B8 B0 C0 3D B7 E2 CA 31 90 7D 26 CB 1E EE EE 16 D4 12 08 3C 5E 3D B0 82 C7 EB 8E 52 B6 F2 30 46 16 42 B7 65 C1 83 DE 41 B0 13 37 83 A9 DF 51 E3 11 16 19 7F 69 F3 D0 F9 C1 2A EA A9 1D 20 52 A1 CE 4B 00 F0 5F C0 34 33 DB 52 DE 44 0B 9E 17 3B BF 01 1C 8E 09 3E BB 53 E6 41 FB ED A1 F5 14 49 59 70 B9 A7 15 52 CD B7 9A AC 06 A4 E5 94 60 E5 02 E4 FD 4E 6B 8D E6 38 23 49 FC 67 17 06 D7 98 33 64 6E 92 43 3D AD 97 29 5A 53 F2 40 2C B4 39 73 17 AA 14 6E 2B 94 DF BA 03 9A 61 7A 65 50 0C 30 
```

其中

```
50 0C 上面256字节的crc
30    对应命令的ack
```

第二次读取0xEB00

```
FF 00 EB 00 7E E4
解析：
EB 00 是地址
7E E4 是crc校验
这个命令会收到一个ack，30
```

发送读取命令

```
03 10 01 3C
解析：
03 10 表示读取16字节
01 3c 是crc校验

回复的内容
00 00 00 01 F5 02 00 00 00 00 00 00 00 00 00 00 46 34 30
01 F5 02 这个内容不明，但是每次这个都会变化，我怀疑这个和上电时间有关系，查配置越早这个值越大，上电以后读取时间越晚越小，后面这个内容读出来就是全0了，但是目前没看到有什么影响，配置也不会设置这个地方（猜想可能和油门校准有关系）
46，34 是对应16字节的crc
30     对应的ack
```

第三次读取0xF7AC

```
FF 00 F7 AC 76 59 
解析：
F7 AC 是地址
76 59 是crc校验
这个命令会收到一个ack，30
```

发送读取命令

```
03 10 01 3C 同上
解析：
03 10 表示读取16字节
01 3c 是crc校验

回复的内容
41 00 4F 00 11 57 42 46 36 36 34 20 DE 06 EC 05 26 BF 30
这条信息的所有内容是固定的，配置怎么变，读取或者设置的这条都是相同的，意义不明
26 BF 是crc
30    对应的ack
```

到这里所有的读取配置操作就结束了，但是还有有些地方要注意

- 第一次的256字节，是真正的配置信息，不排除其他两个地址也有可能存配置，但是我目前并没有发现用到
- 这个256字节本身被加密了，并且相同配置，每次读取的时候，这个256字节都完全不同



#### 写入配置信息

写入配置信息也分三步，第一次是将所有配置信息全读回来，和上面的读取配置一模一样，然后写入配置信息，写入完成以后还会再读取一次配置信息，也是一样的。当然这个是BLHeliSuite的逻辑，实际上如果确定了配置，直接写入配置信息就行了，再读取其实是为了校验是否写对了，而我们没办法解密配置所以不需要再读取一次。

第一步设置地址0x7C00

```
FF 00 7C 00 10 D4 
解析：
7c 00 是地址
10 d4 是crc校验
这个命令会收到一个ack，30
```

第二步写入命令

```
FE 00 01 00 30 78
解析：
30 78 是crc
下面是256字节配置数据
16 F4 F5 A0 3A D2 91 FC 91 73 16 8B D3 4F 6A 93 CD EF D9 82 54 9C AF EA 61 8F DC 89 E6 00 1E 1B 40 14 19 1E 02 F0 0D EA 15 82 29 6D 54 93 BC BC F8 34 21 78 C1 5D A4 C0 30 88 29 C1 D5 DE 93 64 A8 CE E6 6F 40 09 8D E9 0F E7 FB 09 B6 82 BC 60 D2 FA 3F 4A 10 CE 8D 64 B0 AE 2B 4D 2F C0 C4 57 25 A0 67 32 33 EE 19 1C 2F CE DF D7 61 C2 A4 ED C8 33 B7 80 D8 05 D6 3D 51 48 D2 57 7E 04 F9 B0 47 D0 7E A7 9D FF 24 7C D6 F8 0A 04 8A 03 55 CE E7 89 59 1C B3 6F 62 49 00 7C 07 38 F6 2A 48 BB 32 DD 57 EF 2A 24 18 CE 40 B9 43 CB 65 78 23 0D BC E3 22 AB 6C 06 25 64 E6 D3 AE C6 02 65 5E 58 13 91 F3 68 BA 9F D9 28 24 D6 8E 47 68 2C 95 D0 1B 16 48 94 39 D5 3F 0D AE FA BF BB 8B BC 8B 8B 81 2D 3C 35 52 3F A9 E6 11 4E 36 26 96 32 4C B1 EC 73 EC 67 B6 F9 3B 85 5A BC 5F 7B E6 46 0D 23 
50 D9 256字节的crc
30 对应的ack
```

这里要注意一下发送FE 00 01 00 30 78的时候没有ack，然后紧接着发送256字节+2字节的crc，最后会收到30的ack，收到才说明esc接收了配置，否则是没有的。

然后源码里这里经常在FE 00 01 00 30 78之后等一个None ack，其实完全不用等，直接发就行了，反而是有时候等的时间太长了导致命令超时了，后面发的数据全都无效了，最后的ack就收不到了

第三步写入flash或者e2prom中

```
01 01 C0 50 
解析：
C0 50 是crc
这个命令会收到一个ack，30
```

接收到最后的这个ack基本就完成了写配置。

核心协议就是这些了，可能还有刷固件或者校验固件还有一些杂七杂八的命令，但是知道了上面的这些，其他的问题就不大了。要不要实现就取决于实际需不需要了。

## 解密配置信息

先说一下目前我已经测试过的东西

- 首先这个不是非对称加密，二者不存在什么沟通密钥的过程
- 密钥本身是存储在256配置字节中的
- 加密方式不是简单的凯撒密码，这个我用相同值测试过了，找不到对应的特征
- 配置信息每次请求都会发生改变并且完全不同，密钥存储在其中基本是肯定的

暂时不知道还有啥办法可以解密这个具体内容

## 自动dump配置信息

#### 硬件连接

串口19200，R接到电调信号线上，同时电调/串口/电调配置小板共地

（串口主要用来监听，电调配置过程中的数据包）

1. 启动机器，让esc处于没收到任何pwm或者飞控信号的情况下
2. 打开串口助手,勾选hex显示
3. 打开电调配置软件BLHeliSuite32,连接，读取配置
4. 修改配置，然后写入配置，此时串口助手以及记录下来所有发送的命令
5. 将串口助手中所有内容复制粘贴到rawdata.txt
6. 运行get_settings.py
7. 得到配置存储在settings.txt中，直接复制粘贴替换到老的settings即可

#### dump脚本

```python
import sys
import os

f = open(os.path.dirname(__file__) +"/rawdata.txt")
hex_data = f.read()
print hex_data

start = None
end = None

state = 0
for i in range(0, len(hex_data), 3):
    if (hex_data[i] + hex_data[i + 1]) == "FE" and state == 0:
        state = 1
    elif (hex_data[i] + hex_data[i + 1]) == "00" and state == 1:
        state = 2
    elif (hex_data[i] + hex_data[i + 1]) == "01" and state == 2:
        state = 3
    elif (hex_data[i] + hex_data[i + 1]) == "00" and state == 3:
        state = 4
        start = i - 9
        break
    else:
        state = 0

if start == None:
    print "no start,exit"
    sys.exit(0)

state = 0
for i in range(0, len(hex_data), 3):
    if (hex_data[i] + hex_data[i + 1]) == "30" and state == 0:
        state = 1
    elif (hex_data[i] + hex_data[i + 1]) == "01" and state == 1:
        state = 2
    elif (hex_data[i] + hex_data[i + 1]) == "01" and state == 2:
        state = 3
    elif (hex_data[i] + hex_data[i + 1]) == "C0" and state == 3:
        state = 4
        end = i - 9
        break
    else:
        state = 0

if end == None:
    print "no start,exit"
    sys.exit(0)

print(start, end)

print len(hex_data)
output_data = ""

n=4
for i in range(start, end, 3):
    output_data += "0x" + hex_data[i] + hex_data[i + 1] + ','
    n+=1
    if n%24==0:
        output_data+="\n"

f.close()

f = open(os.path.dirname(__file__) +"/settings.txt", 'w')
f.write(output_data[:-1])
print output_data[:-1]

```

## End

最后三种interface可以支持的功能不太一样，4way-if显然可以支持多电调同时配置，同时查看.而usb/com则只能配置一个,betaflight则是可以不直接连接电调的情况下透传协议,但是呢比较复杂,需要实现betaflight本身的MSP协议然后转成4way-if协议然后再到BLH的核心协议,如果不需要的话,没必要弄这么麻烦的协议,写进去还丑的不行.

最主要的还是BLH不给开源协议,不然就不用这么麻烦了

## Quote

> https://ardupilot.org/copter/docs/common-blheli32-passthru.html
>
> https://github.com/bitdump/BLHeli
>
> https://github.com/4712/BLHeliSuite
>
> https://github.com/betaflight/betaflight
>
> https://github.com/ArduPilot/ardupilot
>
> https://github.com/4712/BLHeliSuite/blob/master/Manuals/BLHeliSuite%204w-if%20protocol.pdf
>
> https://www.youtube.com/watch?v=np7xXY_e5sA
