---
layout:     post
title:      "ESP32模拟JoyCon和Pro，兼容Amiibo"
subtitle:   "EasyCon,joycontrol,nxbt"
date:       2022-09-07
update:     2022-09-07
author:     "elmagnifico"
header-img: "img/amiibo.jpg"
catalog:    true
tags:
    - ESP32
    - EasyCon
    - Nintendo Switch
---

## Forward

最早的ESP32模拟Pro Controller，那会问题很多，甚至esp-idf都没有官方支持，靠着路人魔改的库，才勉强实现

> https://github.com/NathanReeves/BlueCubeMod

当时性能实在太差，不稳定，所以弃坑了。

过了2年，esp-idf的classic bluetooth总算相对稳定一些了，也有一些demo可以参考，所以拾起来，继续试试看。

这一试，发现效果还不错，快要接近有线的水平了，于是开始填坑。



## 基本操控

基本操作在BlueCubeMod的仓库中就已经实现了，基本没啥问题。

基本协议都在参考的仓库中，这里主要记录一些在参考仓库中没有说明或者很难找的一些问题



#### HID Descriptor

以前用USB的时候非常纠结报文的内容，和USB相关的一大堆设置。到了蓝牙这里反而不用纠结了，基本上只要是个Descriptor就能正常识别，不用区分Pro或者JC，单JC也可以用Pro的报文。



#### 摇杆校准

需要注意的是摇杆的校准会影响摇杆的归中值，如果消息回复的不正确的话，可能会导致一直触发摇杆的情况。

```c
// 0x10 0x603D
void reply_FactorStickCalAddr()
{
    standard_report reply = {0};
    reply.id = StandInput;
    reply.timer = 0;
    reply.bat_con = cur_con.bat | cur_con.con_info;
    reply.button[0] = 0;
    reply.button[1] = 0;
    reply.button[2] = 0;
    reply.l_stick[0] = 0x00;
    reply.l_stick[1] = 0x08;
    reply.l_stick[2] = 0x80;
    reply.r_stick[0] = 0;
    reply.r_stick[1] = 0x08;
    reply.r_stick[2] = 0x80;
    reply.vibrator = 0x80;

    reply.sub.ack = FLASHACK;
    reply.sub.sub_id = SerialFlashRead;
    reply.sub.read_flash.addr = FactorStickCalAddr;
    reply.sub.read_flash.len = 0x19;
    // min 0x100 mid 0x800 max 0xF00
    reply.sub.read_flash.reserve[0] = 0x00;
    reply.sub.read_flash.reserve[1] = 0x07; // lh max 0x700
    reply.sub.read_flash.reserve[2] = 0x70; // lv max 0x700
    reply.sub.read_flash.reserve[3] = 0x00;
    reply.sub.read_flash.reserve[4] = 0x08; // lh mid 0x800
    reply.sub.read_flash.reserve[5] = 0x80; // lv mid 0x800
    reply.sub.read_flash.reserve[6] = 0x00;
    reply.sub.read_flash.reserve[7] = 0x07;  // lh min 0x700
    reply.sub.read_flash.reserve[8] = 0x70;  // lv min 0x700
    reply.sub.read_flash.reserve[9] = 0x00;  // lh mid 0x800
    reply.sub.read_flash.reserve[10] = 0x08; // lv mid 0x800
    reply.sub.read_flash.reserve[11] = 0x80;
    reply.sub.read_flash.reserve[12] = 0x00;
    reply.sub.read_flash.reserve[13] = 0x07;
    reply.sub.read_flash.reserve[14] = 0x70;
    reply.sub.read_flash.reserve[15] = 0x00;
    reply.sub.read_flash.reserve[16] = 0x07;
    reply.sub.read_flash.reserve[17] = 0x70;
    reply.sub.read_flash.reserve[18] = 0xFF;
    reply.sub.read_flash.reserve[19] = 0xFF;
    reply.sub.read_flash.reserve[20] = 0xFF;
    reply.sub.read_flash.reserve[21] = 0xFF;
    reply.sub.read_flash.reserve[22] = 0xFF;
    reply.sub.read_flash.reserve[23] = 0xFF;
    reply.sub.read_flash.reserve[24] = 0xFF;
    // ESP_LOG_BUFFER_HEX("reply_FactorStickCalAddr",&reply,STDREPORT_HEAD_SIZE + SUBCOMMAND_10_HEAD + reply.sub.read_flash.len);

    esp_bt_hid_device_send_report(ESP_HIDD_REPORT_TYPE_INTRDATA, 0xa1, STDREPORT_HEAD_SIZE + SUBCOMMAND_10_HEAD + reply.sub.read_flash.len, (uint8_t *)&reply);
}
```



#### 手柄颜色

Pro手柄颜色分为四个，机身、按钮、左手柄、右手柄，而JC的手柄只有机身和按钮颜色。

需要注意一点，实际Pro想要自定义颜色，必须在回复设备信息的时候，回复颜色的使用的情况

```
// 0 no use flash color
// 1 use body and button color
// 2 use custom color
#define SUB0x02_USE_COLOR 0x02
```

如果回复了0，任何颜色都不生效，1的话Pro手柄的手柄颜色无法生效，只有回复2的时候才是完全自定义颜色

```c
// 0x02
void reply_GetDeviceInfo()
{
    standard_report reply;
    reply.id = StandInput;
    reply.timer = 0;
    reply.bat_con = cur_con.bat | cur_con.con_info;
    reply.button[0] = 0;
    reply.button[1] = 0;
    reply.button[2] = 0;
    reply.l_stick[0] = 0x00;
    reply.l_stick[1] = 0x08;
    reply.l_stick[2] = 0x80;
    reply.r_stick[0] = 0;
    reply.r_stick[1] = 0x08;
    reply.r_stick[2] = 0x80;
    reply.vibrator = 0x80;

    reply.sub.ack = ACK | 0x02;
    reply.sub.sub_id = GetDeviceInfo;
    reply.sub.device_info.firmware_version = FIRMWARE_VERSION;
    reply.sub.device_info.firmware_revision = FIRMWARE_REVISION;
    reply.sub.device_info.device_type = cur_con.type;
    reply.sub.device_info.reserve0 = SUB0x02_REVERS0;
    memcpy(reply.sub.device_info.MAC, cur_con.MAC, MAC_LEN);
    reply.sub.device_info.reserve1 = SUB0x02_REVERS1;
    reply.sub.device_info.use_color = SUB0x02_USE_COLOR;

    esp_bt_hid_device_send_report(ESP_HIDD_REPORT_TYPE_INTRDATA, 0xa1, STDREPORT_HEAD_SIZE + SUBCOMMAND_SIZE0, (uint8_t *)&reply);
}

```

Pro手柄有特殊的前导值，如果是特定版本的手柄，只要前面的值符合，那么后面的自定义颜色是不会生效的

```c
uint32_t pro_color[][3] = {
    // body  |button  |leftGrip  |rightGrip
    {0x323232AA, 0xAAAA8282, 0x82828282}, // normal black
    {0x313232FF, 0xFFFFFFFF, 0xFFFFFFFF}, // Splatoon 2
    {0x323132FF, 0xFFFFFFFF, 0xFFFFFFFF}, // Xenoblade 2
    {0x323231FF, 0xFFFFFFFF, 0xFFFFFFFF}, // Super Smash Bros
    {0x323233FF, 0xFFFF4655, 0xF5E6FF00}, // Splatoon 3 fake
    {0xE6E6E632, 0x323200DD, 0xDDDD00DD}  // test
    /*
    pro手柄缺少配色：
    喷射3
    怪猎
    怪猎曙光
     */
};
```

实际上如果使用了joy_toolkit，就会看到一堆issue中提到他们不能自定义pro颜色，或者是颜色不生效。

实际上pro自定义颜色是需要修改pro中601B地址的值，将其改成02才能自定义，其实这个02就是我们这里命令回复的02。

> https://github.com/CTCaer/jc_toolkit/issues/28

这个值文档并没有说明，然后反复检查NS并没有请求601B的地址的值，查了好久都查不到，最后联想到这里有可能，就试了一下，发现果然如此



#### 手柄区分

手柄能不能连上是由手柄的蓝牙名称决定的，每个名称都是固定的，只要叫这个，NS就会主动连接

```
    if (cur_con.type == Joy_Con_L)
        esp_bt_dev_set_device_name("Joy-Con (L)");

    if (cur_con.type == Joy_Con_R)
        esp_bt_dev_set_device_name("Joy-Con (R)");

    if (cur_con.type == Pro)
        esp_bt_dev_set_device_name("Pro Controller");
```

具体NS是识别成Pro还是JC还是通过上面的02 设备信息来区分的，你可以叫Pro，但却是一个JC

![image-20220907172049286](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209071720376.png)

虽然在标准报文中也存在当前的设备信息，但是经过测试，标准报文中的手柄信息并不会生效，不具有识别性。

![image-20220907172129907](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209071721961.png)



#### 重连接或者自动连接

由于参考仓库里存在蓝牙的配对，存储密钥相关内容，导致我一直以为这个配对要手动完成。

![image-20220907172805021](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209071728069.png)

实际上这个流程完全可以忽略，ESP32或者是其他的现成的蓝牙模块，基本上都会自动完成这个配对存储的过程。其中关键的LTK也会自动生成并存储，所以完全不用开发者担心（当然一些非常原始的蓝牙栈或者是没实现这个部分的，可能需要手动完成）

而要触发重连接也非常简单，只要连接指定MAC地址，即可自动完成重新连接（甚至可以直接唤醒NS）

```c
    if (cur_con.auto_pair)
    {
        ESP_LOGI(TAG, "reconnect");
        // Connect to paired host device if we haven't connected already
        if (esp_bt_hid_device_connect(cur_con.NS_MAC) != ESP_OK)
        {
            ESP_LOGI(TAG, "Failed to connect to paired switch. Setting scannable and discoverable.");
            esp_bt_gap_set_scan_mode(ESP_BT_CONNECTABLE, ESP_BT_GENERAL_DISCOVERABLE);
            cur_con.paired = false;
            notify = NOPAIRING;
        }
    }
```



#### 配对长按时间

这里的准确理解应该是在弹出配对界面时，你需要长按下面的按钮多久，对应NS那边才会显示你的手柄

![image-20220907173350305](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209071733344.png)

而实际上全设置成0了，也就是随便按一下手柄，就会触发显示配对，再A一下，就成功配对了。



#### 标准报文的按键

刚开始回复命令时，标准报文中的button并不会赋值，后来发现这个东西会造成各自离谱bug，特别是在后续的Amiibo的流程中会影响一些操作。所以最好是设置成默认没有按，并且摇杆等都归中的状态。

```c
// 0x22
void reply_McuResume(uint8_t param)
{
    standard_report reply = {0};
    reply.id = StandInput;
    reply.timer = 0;
    reply.bat_con = cur_con.bat | cur_con.con_info;
    reply.button[0] = 0;
    reply.button[1] = 0;
    reply.button[2] = 0;
    reply.l_stick[0] = 0x00;
    reply.l_stick[1] = 0x08;
    reply.l_stick[2] = 0x80;
    reply.r_stick[0] = 0;
    reply.r_stick[1] = 0x08;
    reply.r_stick[2] = 0x80;
    reply.vibrator = 0x80;

```



## Amiibo

到Amiibo这里就更复杂了，可以参考的信息就更少了。简单说Pro和JC上用的都是ST量产的一块读写NFC的芯片，同时还有一个主控STM32F4用来沟通NFC、IR、IMU还有博通的蓝牙。

平常想要读取或者设置NFC、IR和IMU都需要通过操控主控来完成，这就导致了实际蓝牙通信的时候有一部分信息是用来间接操控NFC等东西的。但是这部分的逆向信息又不够多，所以模拟Amiibo的例子也只有几个。

主要是借助Poohl的仓库来理解Amiibo读取和写入流程的

> https://github.com/Poohl/joycontrol

由于一开始根本没太看懂他写的到底是啥，加上他注释里疯狂吐槽这个协议，弄得我一头雾水。

于是又看了jc_toolkit，直接从NS的角度来看他们到底是怎么沟通的，看完以后发现流程还是比较顺的

> https://github.com/CTCaer/jc_toolkit

我简单总结了一下



#### NS视角看读取Amiibo流程

前置准备环节，手柄报文切换到NFC报文

1. 手柄的NFC相关的MCU进入运行状态
2. 查询MCU是否正常启动了
3. 设置NFC启动工作
4. 查询NFC是否启动
5. 请求NFC mode status，这里准确的说应该是让NFC切换到等待接收tag的状态
6. 读取amiibo的uid
7. 读取amiibo的具体内容
8. 其实已经读完了，回到5或者是直接退出了

结束，手柄报文切换到标准报文



这么看就非常简单，前面的1，3，都有专门的回复，相当于是在握手，但是到4以后，所有的回复都是通过同一个命令回复的（实际上是NS一直重复发状态询问的命令），所以4以后的状态都需要自己存储一下，并根据情况回复。

有了上面的NS会干啥的基础以后，再看joycontrol，就能理解他在干啥了。



#### MCU运行和NFC配置

一般来说是要先设置MCU运行，然后再设置NFC配置的，但是实际上你回复的时候，可以直接回复NFC，就能进入下一步了。这样就少了一步。



#### Poll两次

需要注意一下，当启动NFC开始读取以后，还会需要你二次启动，也就是Poll这个状态会出现Poll_Again，而这个二次完全只用自己直接切换就行了。

所以可以直接优化掉Poll，直接回复Poll_Again 就能进入下一步，而不需要进行状态切换。



#### 退出

退出流程，其实都没有人给出来，所以目前的退出是借助上面的Poll_Again，回复一个无效Amiibo来退出的。或者通过Home按键，强行退出，不过这种会导致状态没有正确切出来。

经过测试发现，实际上直接回复00的Amiibo uid即可自动退出了，不用清空整个Amiibo。



#### 写入命令

![image-20220907182548495](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209071825529.png)

由jc_toolkit这里可以知道，其实joycontrol中的写入结束，其实是刚好param[2]==0x08了

| 参数index | 含义                                 |
| --------- | ------------------------------------ |
| 0         | seq，命令序列                        |
| 1         | 好像没啥用？                         |
| 2         | 0表示命令未结束，8表示连续的命令结束 |
| 3         | 后续的payload长度                    |



#### 简化流程

通过我上面的精简和总结，流程就变成下面的

读取退出流程

```
1.NS请求切换报文为NFC
2.Pro回复切换报文
3.NS请求切换MCU状态为启动
4.Pro回复启动
5.NS请求切换NFC状态为启动
6.Pro回复启动
7.NS请求NFC启动状态
8.Pro回复NFC 配置ok
9.NS请求开始读取uid
10.Pro回复Poll_Again 并且带上uid
11.NS请求读取整个amiibo
12.Pro回复3个包，每个包分别包含了一部分信息
13.NS请求停止读取
14.Pro回复停止读取，并且清空uid
15.NS请求切换MCU状态为启动
16.Pro回复启动
17.NS请求切换报文为标准
18.Pro回复切换报文
```

读取写入流程

```
1.NS请求切换报文为NFC
2.Pro回复切换报文
3.NS请求切换MCU状态为启动
4.Pro回复启动
5.NS请求切换NFC状态为启动
6.Pro回复启动
7.NS请求NFC启动状态
8.Pro回复NFC 配置ok
9.NS请求开始读取uid
10.Pro回复Poll_Again 并且带上uid
11.NS请求读取整个amiibo
12.Pro回复3个包，每个包分别包含了一部分信息

13.NS请求准备写入
14.Pro回复准备写入
15.NS请求写入,一共会写15次，如果出现漏包，会自动重传
16.Pro每次回复对应写入的seq
17.NS请求写入结束
18.Pro回复写入结束
19.NS请求停止读取
20.Pro回复停止读取，并且清空uid

21.NS请求开始读取uid
22.Pro回复启动，空uid
23.NS请求停止读取
24.Pro回复停止读取，并且清空uid

25.NS请求切换MCU状态为启动
26.Pro回复启动
27.NS请求切换报文为标准
28.Pro回复切换报文
```

（以上过程中，NS的查询状态发了非常多遍，由于他们主要是读取状态，所以没有记录）

joycontrol的流程中状态切换都靠每个响应的命令，而状态恢复统一靠NS查询状态的命令去回复，相当于是有点异步的意思，这就导致看代码麻烦，写代码也麻烦，debug就更难受了。

所以我重写以后，每个命令响应后，立马就会回复它对应的回复，而不是依赖NS查询状态，NS的查询状态变成了，类似我漏发了，帮我补发的操作，相当于是冗余。



## 遗留问题

1. Amiibo退出不够优雅
2. ESP32的蓝牙栈只能模拟一个APP，而不能同时模拟2个，JonCon的左右手柄只能存在一个
3. Amiibo目前是存储在内存的，理论上可以直接根据key和uid生成对应的Amiibo，而不需要全量存储。



## Summary

刚开始没有任何数据的情况下，直接调试，非常困难，Amiibo卡了三天没啥进展，多亏群里的白影协助帮我dump了一份完整数据，对照着修bug，总算把流程梳理顺当了，非常感谢。

至此就可以使用十几块钱的板子模拟出三四百块的Pro的效果了，虽然性能还是差一点，不过配合EasyCon使用已经非常ok了。



## Quote

以下仓库非常值得参考，每个流程都借助他们的说明，否则无法实现，非常感谢

> https://github.com/Poohl/joycontrol
>
> https://github.com/mart1nro/joycontrol
>
> https://github.com/NathanReeves/BlueCubeMod
>
> https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering
>
> https://github.com/CTCaer/Nintendo_Switch_Reverse_Engineering/tree/master
>
> https://github.com/mumumusuc/Nintendo_Switch_Reverse_Engineering
>
> https://github.com/mumumusuc/libjoycon
>
> https://github.com/CTCaer/jc_toolkit
>
> https://github.com/Brikwerk/nxbt
>
> https://switchbrew.org/wiki/Joy-Con
>
> https://wiki.gbatemp.net/wiki/Amiibo
>
> https://github.com/HandHeldLegend/RetroBlue-ESP32

