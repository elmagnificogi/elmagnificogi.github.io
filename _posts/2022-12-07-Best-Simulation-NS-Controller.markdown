---
layout:     post
title:      "模拟NS手柄的最佳方案"
subtitle:   "CH9329、CH552G"
date:       2022-12-07
update:     2022-12-07
author:     "elmagnifico"
header-img: "img/drone.jpg"
catalog:    true
tags:
    - Nintendo Switch
    - EasyCon
---

## Forward

做过了好多个NS模拟的手柄的方案，现在找到的应该是目前遇到的最佳方案了，性价比和易用程度基本都达到最好。

模拟方案的要求也比较简单：

- 可以从淘宝或者其他渠道方便的购买到的
- 尽可能的便宜
- 尽可能的不需要额外烧写器
- 尽可能少的对焊接等其他设备的要求
- 尽可能是现代接口（TypeC）

说白了，能到手即用还便宜就是最好的。



## 模拟历史

总结一下之前用过的模拟的方案，按照出现时间来



#### UNO

![image-20221207113333252](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071133338.png)

Atmega16u2最初的模拟方案，芯片性能差，内存小，各种都受限制，板子又大，接口又奇葩，但是当时算是业务玩家能接触的比较多的一种了方案了，后续价格上涨，就变的不适合了。

> https://github.com/progmem/Switch-Fightstick



#### Teensy

![image-20221207113456130](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071134269.png)

Atmega32u4、At90usb1286 由于代码层兼容，只需要改一下编译选项就可以兼容，Teensy的软件一体化做的比较好，挺合适DIY的，只是可惜在国内的传播太少了，国内价格不够美丽。也有其他的Leonardo，Beetle等其他改名同芯片的开发板可以选择，不过用的人依然很少。现在依然可以用，性能各方面都还行。

> https://github.com/EasyConNS/EasyMCU_AVR



#### JoyconDroid

![image-20221207113656617](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071136714.png)

安卓蓝牙直接模拟HID，但是各家的手机蓝牙标准不一样，实现不一样，并不是每个手机都能成功调用HID，这就导致很多国内阉割手机用不了。而实际的安卓的模拟效果很差，丢帧非常容易，后面基本就被淘汰了。这个项目目前并没有死，并且后来还支持了模拟Amiibo，只是不好用而已。

> https://joycon.gitbook.io/joycondroid



#### Raspberry

![image-20221207113736765](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071137895.png)

树莓派模拟手柄，可行，稳定性也凑活比安卓蓝牙强一些，可惜树莓派的价格和上手难度都比其他设备要高一个档次。

> https://github.com/mart1nro/joycontrol
>
> https://github.com/mumumusuc/pi-joystick



#### Ubuntu

![image-20221207113826574](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071138679.png)

虚拟机蓝牙模拟，可行，稳定性比树莓派差一点，比安卓好一点，兼容性上比较好，很多蓝牙都能用。但是有点傻，ubuntu也是门槛，而且弄个ubuntu环境也挺麻烦的。

> https://github.com/Brikwerk/nxbt



#### ESP32

![image-20221207113855904](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071138981.png)

最开始模拟蓝牙，由于ESP官方支持不是很好，bug很多，都是路人魔改，所以开始的时候稳定性和安卓蓝牙差不多。但是经过几年的发展，经典蓝牙支持完备了，虽然基于无线多少还是有点不稳，但是已经是目前无线中稳定性最高、功能最全的方案了。其次ESP32的价格实惠，接口也支持到TypeC，身材小巧，可扩展性非常强。

> https://github.com/EasyConNS/EasyMCU_ESP32



#### CSR8510

![image-20221207114019571](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071140662.png)

蓝牙适配器魔改版本，魔改驱动以后用windows直接控制，来模拟手柄，问题也是一样的，稳定性和安卓蓝牙差不多，功能不全，并不是很完善，这个方案国内和国外基本都被淘汰了。

> https://github.com/elmagnificogi/CSR_Bluetooth_Dongle_Simulate_NS_Pro_Controller



#### STM32

![image-20221207114058883](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071140973.png)

ST的方案算是性价比非常高的了，性能强劲，可扩展性比较高，并且国内各种pin2pin的替代品也在ST价格波动的时候顶上去，这就让ST基本成为有线版本里最稳定的存在了，AVR团灭了，ST都会在。

> https://github.com/EasyConNS/EasyMCU_STM32



#### CH32

CH32F103C8T6，具有双USB的现成开发板，一个是串口，一个是USB Device，用来模拟刚刚好，价格吊打ST，接口TypeC也不错。

![image-20221207105022148](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071050245.png)

唯一的问题就是我还没写支持。



#### CH9329+CH340

![image-20221207104600169](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071046293.png)

如果没有它，CH32就可以称王称霸，但是有了他，CH32也要被秒杀了

![image-20221207104208858](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212071042007.png)

不再需要任何焊接、不再需要单独买串口、杜邦线，不再需要烧固件，一端插PC一端插NS，配合伊机控就能直接使用了。上手即用，关键是价格甚至比ST的板子还便宜，虽然不是最低价，但是已经是次低价了，那还要啥自行车。

一根线就能解决的问题，何必还要连一堆东西呢。

现在还有2个问题，它不能支持离线模式控制，只能在线控制，也就是联机和固件模式都不能使用了，还有一个问题就是我还没写支持。实际这个方案不仅仅是NS手柄，其他的HID控制器也是可以模拟的。



## Summary

模拟方案千千万，目前功能最全的无线就是ESP32，功能最全的有线就是CH32，最傻瓜的方案就是CH9329+CH340，其他方案基本上都可以被淘汰了。后续伊机控就开始对CH32和CH9329+CH340的方案进行支持。
