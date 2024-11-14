---
layout:     post
title:      "STM32 MCU移植SSH"
subtitle:   "SSL、SFTP、Crypto、Lwip"
date:       2024-13-14
update:     2024-13-14
author:     "elmagnifico"
header-img: "img/bg1.jpg"
catalog:    true
tobecontinued: false
tags:
    - SSH
    - STM32
---

## Foreword

给MCU移植Crypto、SSL、SSH、SFTP等库，真的找不到一个例子，目前看到的库大部分都是商用的。

比如wolfssh、CycloneSSH、libssh2、TinySSH、microSSH、Dropbear，这些库可能linux使用比较多，但是那边安装移植也方便多了，降到MCU一库难求，更别说详细的移植文档了，基本没有



## SSH



## wolfssh

> https://www.wolfssl.com/products/wolfssh/



### wolfssh移植

wolfssh的库整个集成到了CubeMX中，简单的几个操作就可以把ssh集成进去

![image-20241114174448563](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141744662.png)

系统时钟不要用systick，留给FreeRTOS用

![image-20241114174514938](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141745979.png)

随便加一个input IO作为SD卡的输入检测

![image-20241114185644689](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141856718.png)

再随便加一个串口作为SSH的端口

![image-20241114174543271](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141745938.png)

以太网选择RMII模式，地址改到0x24开头

![image-20241114174623401](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141746448.png)

SD卡改到4线模式

![image-20241114174651486](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141746526.png)

FATFS选择SD卡

![image-20241114194722092](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141947150.png)

打开RNG，SSL需要随机数生成

![image-20241114174713351](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141747434.png)

LWIP开启，Driver_PHY选择LAN8742，后面也是

![image-20241114174814132](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141748176.png)

接着wolfSSL和wolfSSH都需要下载，开启

![image-20241114174845054](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141748101.png)

SSH开启以后，IO选择LWIP，SFTP打开，SCP可以关闭

![image-20241114195103602](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141951646.png)

SSL这里需要支持FreeRTOS

![image-20241114195129997](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141951030.png)

关闭wolfCrypt test，这个编译会带进来很多多语言的内容，keil编译会出错

剩下设置就随便改改，就可以生成代码了，生成以后依然编译不了，还需要修改一些点

![image-20241114185407202](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141854305.png)

首先在`wolfSSL.I-CUBE-wolfSSL_conf.h`里需要定义板子，如果不是wolf测试的板子，需要在下面这里定义具体用的是哪种类型的，具体硬件库啊、加密方式啊、库的版本、使用的串口是哪个需要明确一下

```c
    //#warning Please define a hardware platform!
    /* This means there is not a pre-defined platform for your board/CPU */
    /* You need to define a CPU type, HW crypto and debug UART */
    /* CPU Type: WOLFSSL_STM32F1, WOLFSSL_STM32F2, WOLFSSL_STM32F4,
        WOLFSSL_STM32F7, WOLFSSL_STM32H7, WOLFSSL_STM32L4, WOLFSSL_STM32L5,
        WOLFSSL_STM32G0, WOLFSSL_STM32WB and WOLFSSL_STM32U5 */
    #define WOLFSSL_STM32H7

    /* Debug UART used for printf */
    /* The UART interface number varies for each board/CPU */
    /* Typically this is the UART attached to the ST-Link USB CDC UART port */
    #define HAL_CONSOLE_UART huart1

    /* Hardware Crypto - uncomment as available on hardware */
    //#define WOLFSSL_STM32_PKA
    //#define NO_STM32_RNG
    #undef  NO_STM32_HASH
    #undef  NO_STM32_CRYPTO
    //#define WOLFSSL_GENSEED_FORTEST /* if no HW RNG is available use test seed */
    #define STM32_HAL_V2
```



在benchmark中定义一下不要显示多语言，否则keil文件乱码识别不了，编译过不去

```c
#define NO_MULTIBYTE_PRINT
```



会提示缺少`unistd.h`，复制一个空文件放进去即可



## CycloneSSH

> https://www.oryx-embedded.com/products/CycloneSSH.html

CycloneSSH是oryx-embedded下的一个库，他们包含很多相关组件

![image-20241114175150373](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141751404.png)

> https://www.st.com.cn/zh/partner-products-and-services/cyclonessh.html

ST官方也有他们的合作页面，但是CubeMX里不支持生成

虽然Github也开源了，放出来了源码，但是那个源码一个demo都没有，任何文档也没有，接口也没说，只能干看着。

![image-20241114175036051](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141750089.png)

要查看Demo需要下载官方的代码，然后在demo里面有各个公司各个板子的demo工厂，这里以stm32h743i_eval的板子为例，测试了一下SFTP的demo

先修改代码同意协议，否则无法生成

```
/*
 * CycloneTCP Open is licensed under GPL version 2. In particular:
 *
 * - If you link your program to CycloneTCP Open, the result is a derivative
 *   work that can only be distributed under the same GPL license terms.
 *
 * - If additions or changes to CycloneTCP Open are made, the result is a
 *   derivative work that can only be distributed under the same license terms.
 *
 * - The GPL license requires that you make the source code available to
 *   whoever you make the binary available to.
 *
 * - If you sell or distribute a hardware product that runs CycloneTCP Open,
 *   the GPL license requires you to provide public and full access to all
 *   source code on a nondiscriminatory basis.
 *
 * If you fully understand and accept the terms of the GPL license, then edit
 * the os_port_config.h header and add the following directive:
 *
 * #define GPL_LICENSE_TERMS_ACCEPTED
 */

#ifndef GPL_LICENSE_TERMS_ACCEPTED
   #error Before compiling CycloneTCP Open, you must accept the terms of the GPL license
#endif
```

如果不定义`GPL_LICENSE_TERMS_ACCEPTED` 会导致这里报错，编译不下去

![image-20241114160904024](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141609057.png)

![image-20241114160849834](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141608951.png)



CycloneSSH的问题在于虽然他用demo可以直接编译，但是他底层调用的是他自己的TCPIP接口，也就是CycloneTCP，而不是Lwip，这就导致如果你要移植，必须还得搞懂TCP这里的接口具体是什么的，怎么往下对接，Lwip的底层你也得熟悉才能完成这个事情



## Summary



## Quote

> https://www.stmcu.org.cn/module/forum/forum.php?mod=viewthread&tid=616445
