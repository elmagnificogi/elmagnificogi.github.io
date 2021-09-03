---
layout:     post
title:      "SEGGER_RTT调试"
subtitle:   "jlink，swd，Tracealyzer"
date:       2021-09-03
author:     "elmagnifico"
header-img: "img/bg4.jpg"
catalog:    true
tags:
    - STM32
    - Embedded
---

## Forward

最近看到有人用jlink直接当串口用，发现还不错的样子。



## SEGGER_RTT

> https://www.segger.com/products/debug-probes/j-link/technology/about-real-time-transfer/

简单说 JLink 连了那么多线，如果不用岂不是浪费。就算用SWD接口也能正常使用。



要使用 RTT 也非常简单，JLink 中自带了需要包含的文件，可能需要解压一下

如图所示，解压以后所有可能需要的文件都在RTT里面

![image-20210903160819254](https://i.loli.net/2021/09/03/h4MoPKEAlmRd2vC.png)

主要就是这么几个文件

```
SEGGER_RTT.c
SEGGER_RTT.h
SEGGER_RTT_ASM_ARMv7M.S,这个平常不需要，如果是汇编里使用RTT可以加上他
SEGGER_RTT_Conf.h
SEGGER_RTT_printf.c，如果要用printf，需要包含，不用的话，完全可以不要
```

将需要的文件加入以后，加上头文件，就可以玩耍了。

```c
#include "SEGGER_RTT.h"
/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
	// 初始化
	SEGGER_RTT_Init();
	// 将hello world 输出到通道0
	SEGGER_RTT_printf(0, "hello world\n");  
}
```

用起来就像printf一样



### config

需要注意默认的RTT的buffer大小和默认是非阻塞模式的

```c
#ifndef   SEGGER_RTT_MAX_NUM_DOWN_BUFFERS
  #define SEGGER_RTT_MAX_NUM_DOWN_BUFFERS           (3)     // Max. number of down-buffers (H->T) available on this target  (Default: 3)
#endif

#ifndef   BUFFER_SIZE_UP
  #define BUFFER_SIZE_UP                            (1024)  // Size of the buffer for terminal output of target, up to host (Default: 1k)
#endif

#ifndef   BUFFER_SIZE_DOWN
  #define BUFFER_SIZE_DOWN                          (16)    // Size of the buffer for terminal input to target from host (Usually keyboard input) (Default: 16)
#endif

#ifndef   SEGGER_RTT_PRINTF_BUFFER_SIZE
  #define SEGGER_RTT_PRINTF_BUFFER_SIZE             (64u)    // Size of buffer for RTT printf to bulk-send chars via RTT     (Default: 64)
#endif

#ifndef   SEGGER_RTT_MODE_DEFAULT
  #define SEGGER_RTT_MODE_DEFAULT                   SEGGER_RTT_MODE_NO_BLOCK_SKIP // Mode for pre-initialized terminal channel (buffer 0)
#endif
```



### 颜log

```c
//
// Control sequences, based on ANSI.
// Can be used to control color, and clear the screen
//
#define RTT_CTRL_RESET                "\x1B[0m"         // Reset to default colors
#define RTT_CTRL_CLEAR                "\x1B[2J"         // Clear screen, reposition cursor to top left

#define RTT_CTRL_TEXT_BLACK           "\x1B[2;30m"
#define RTT_CTRL_TEXT_RED             "\x1B[2;31m"
#define RTT_CTRL_TEXT_GREEN           "\x1B[2;32m"
#define RTT_CTRL_TEXT_YELLOW          "\x1B[2;33m"
#define RTT_CTRL_TEXT_BLUE            "\x1B[2;34m"
#define RTT_CTRL_TEXT_MAGENTA         "\x1B[2;35m"
#define RTT_CTRL_TEXT_CYAN            "\x1B[2;36m"
#define RTT_CTRL_TEXT_WHITE           "\x1B[2;37m"

#define RTT_CTRL_TEXT_BRIGHT_BLACK    "\x1B[1;30m"
#define RTT_CTRL_TEXT_BRIGHT_RED      "\x1B[1;31m"
#define RTT_CTRL_TEXT_BRIGHT_GREEN    "\x1B[1;32m"
#define RTT_CTRL_TEXT_BRIGHT_YELLOW   "\x1B[1;33m"
#define RTT_CTRL_TEXT_BRIGHT_BLUE     "\x1B[1;34m"
#define RTT_CTRL_TEXT_BRIGHT_MAGENTA  "\x1B[1;35m"
#define RTT_CTRL_TEXT_BRIGHT_CYAN     "\x1B[1;36m"
#define RTT_CTRL_TEXT_BRIGHT_WHITE    "\x1B[1;37m"

#define RTT_CTRL_BG_BLACK             "\x1B[24;40m"
#define RTT_CTRL_BG_RED               "\x1B[24;41m"
#define RTT_CTRL_BG_GREEN             "\x1B[24;42m"
#define RTT_CTRL_BG_YELLOW            "\x1B[24;43m"
#define RTT_CTRL_BG_BLUE              "\x1B[24;44m"
#define RTT_CTRL_BG_MAGENTA           "\x1B[24;45m"
#define RTT_CTRL_BG_CYAN              "\x1B[24;46m"
#define RTT_CTRL_BG_WHITE             "\x1B[24;47m"

#define RTT_CTRL_BG_BRIGHT_BLACK      "\x1B[4;40m"
#define RTT_CTRL_BG_BRIGHT_RED        "\x1B[4;41m"
#define RTT_CTRL_BG_BRIGHT_GREEN      "\x1B[4;42m"
#define RTT_CTRL_BG_BRIGHT_YELLOW     "\x1B[4;43m"
#define RTT_CTRL_BG_BRIGHT_BLUE       "\x1B[4;44m"
#define RTT_CTRL_BG_BRIGHT_MAGENTA    "\x1B[4;45m"
#define RTT_CTRL_BG_BRIGHT_CYAN       "\x1B[4;46m"
#define RTT_CTRL_BG_BRIGHT_WHITE      "\x1B[4;47m"
```

如果在类linux的终端中输出，可以支持带颜色的log信息，结合上面的颜色信息，使用下面的头文件即可。

```c
/*
 * Author: Jayant Tang
 * Email: jayant97@foxmail.com
 */

#ifndef _LOG_H_
#define _LOH_H_
#include "SEGGER_RTT.h"

#define LOG_DEBUG 1

#if LOG_DEBUG


#define LOG_PROTO(type,color,format,...)            \
        SEGGER_RTT_printf(0,"  %s%s"format"\r\n%s", \
                          color,                    \
                          type,                     \
                          ##__VA_ARGS__,            \
                          RTT_CTRL_RESET)

/* 清屏*/
#define LOG_CLEAR() SEGGER_RTT_WriteString(0, "  "RTT_CTRL_CLEAR)

/* 无颜色日志输出 */
#define LOG(format,...) LOG_PROTO("","",format,##__VA_ARGS__)

/* 有颜色格式日志输出 */
#define LOGI(format,...) LOG_PROTO("I: ", RTT_CTRL_TEXT_BRIGHT_GREEN , format, ##__VA_ARGS__)
#define LOGW(format,...) LOG_PROTO("W: ", RTT_CTRL_TEXT_BRIGHT_YELLOW, format, ##__VA_ARGS__)
#define LOGE(format,...) LOG_PROTO("E: ", RTT_CTRL_TEXT_BRIGHT_RED   , format, ##__VA_ARGS__)

#else
#define LOG_CLEAR()
#define LOG
#define LOGI
#define LOGW
#define LOGE

#endif

#endif // !_LOG_H_
```

花里胡哨得就玩起来了。



## 上位机

JLinkRTT开头的程序有不少，各有各的作用

- JLinkRTTViewer，独立可视化界面，连接之后会实时显示内容
- JLinkRTTClient，终端中显示，无法直接连接，需要先用JLink连接上板子或者是IDE中开启调试以后，才能正常显示
- JLinkRTTLogger，直接以log文件的形式进行输出



JLinkRTTViewer 看着比较好一点

![image-20210903163325596](https://i.loli.net/2021/09/03/QWf3jwIHYnClU1J.png)



## 局限

基本没啥人说这个有啥局限，我就来说一下。

#### 速度有限

由于我之前用过 Tracealyzer ,而如果有注意的话，其实可以看到 Tracealyzer 中直接就包含了下面的三个文件

```
SEGGER_RTT.c
SEGGER_RTT.h
SEGGER_RTT_Conf.h
```

而 Tracealyzer 就是以RTT的通道作为实时分析的log输出的。

由于我们系统比较大，Tracealyzer 毫无意外的不能直接输出所有进程的信息，只能分段输出。而这个限制本质上就是RTT本身带来的限制，实际带宽大概是1.5mbps左右（我的环境下），提高SWD的速度可以一定程度上提高带宽，具体要看实际的buffer大小，输出频率等等(总的来说带宽和内存只能二选一)

![image-20210903164047823.png](https://i.loli.net/2021/09/03/mWKbIGUt7u6kwEQ.png)

如果以JLinkRTTViewer来显示，基本可以看到速度过快的时候，JLinkRTTViewer也会提示他只有4KB的缓存，不足以支撑输出速度。

不过由于本身就是拿来做debug用的，最好也不要用在一些速度特别快的场合里。



需要注意的是 RTT 本身和 JLink调试占用的是同一根线，也就是说，要边调试边输出debug信息的话，你就不能太快，得留一部分宽度给 JLink 用。

![image-20210903164231487.png](https://i.loli.net/2021/09/03/Qcn5SNkJ3iV4ZHh.png)

#### 支持芯片有限

有的系列是不支持的，所以...

![image-20210903163859954.png](https://i.loli.net/2021/09/03/fI2rMRPXeGOzA6E.png)



#### 内存存储

在开启JLinkRTTViewer 的时候都有让选择过控制块在哪里，其实就是说对应的Buffer存储在了哪里。如果只有一片内存之类的可能问题不大，但是对于内存有多片，而且有一些特殊划分之类的，这里就需要制定以下具体的内存位置。

```
// This can be used to place the RTT control block in the right memory range, if no found automatically.
// This example is for NXP LPC54018, needs to be adapted for each MCU family.
//#define SEGGER_RTT_SECTION ".data.$RAM2"
```

同理，他的优先级设置也是，默认是最高的，所以他能在中断中使用

```
//
// Target is not allowed to perform other RTT operations while string still has not been stored completely.
// Otherwise we would probably end up with a mixed string in the buffer.
// If using  RTT from within interrupts, multiple tasks or multi processors, define the SEGGER_RTT_LOCK() and SEGGER_RTT_UNLOCK() function here.
// 
// SEGGER_RTT_MAX_INTERRUPT_PRIORITY can be used in the sample lock routines on Cortex-M3/4.
// Make sure to mask all interrupts which can send RTT data, i.e. generate SystemView events, or cause task switches.
// When high-priority interrupts must not be masked while sending RTT data, SEGGER_RTT_MAX_INTERRUPT_PRIORITY needs to be adjusted accordingly.
// (Higher priority = lower priority number)
// Default value for embOS: 128u
// Default configuration in FreeRTOS: configMAX_SYSCALL_INTERRUPT_PRIORITY: ( configLIBRARY_MAX_SYSCALL_INTERRUPT_PRIORITY << (8 - configPRIO_BITS) )
// In case of doubt mask all interrupts: 1 << (8 - BASEPRI_PRIO_BITS) i.e. 1 << 5 when 3 bits are implemented in NVIC
// or define SEGGER_RTT_LOCK() to completely disable interrupts.
// 
```



## Summary

总的来说好用还是非常好用的



## Quote

> https://blog.csdn.net/a369000753/article/details/51192707/
>
> https://zhuanlan.zhihu.com/p/163771273
>
> https://www.cnblogs.com/chen0207/p/12641055.html
