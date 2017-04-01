---
layout:     post
title:      "STM32 _main 里做了什么"
subtitle:   "嵌入式，bootloader，_main"
date:       2017-04-01
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## STM32 _main 里做了什么

这里是对STM32f767的分析

#### Simulator

要分析_main中做了什么需要我们先使用调试模式进行调试。

这里直接使用keil的Simulator软模拟模式

- 勾选LoadApplication at Starup
- 不勾选 Run to main()

这样就可以直接运行到Reset Handle的地方，然后进入_main

开启调试就能看到下面的地方了，首先要进行SystemInit的初始化动作

```c
 216:                  LDR     R0, =SystemInit
>0x08000298 4809      LDR           r0,[pc,#36]  ; @0x080002C0
 217:                  BLX     R0
 0x0800029A 4780      BLX           r0
 218:                  LDR     R0, =__main
 0x0800029C 4809      LDR           r0,[pc,#36]  ; @0x080002C4
 219:                  BX      R0
 220:                  ENDP
```
然后开始__scatterload()，负责把RW/RO输出段从装载域地址复制到运行域地址，并完成了ZI运行域的初始化工作。

#### __scatterload

```c
0x080001F8 F000F802  BL.W          __scatterload (0x08000200)
0x080001FC F000F83C  BL.W          __rt_entry (0x08000278)
0x08000200 A00A      ADR           r0,{pc}+0x2C  ; @0x0800022C
0x08000202 E8900C00  LDM           r0,{r10-r11}
0x08000206 4482      ADD           r10,r10,r0
0x08000208 4483      ADD           r11,r11,r0
0x0800020A F1AA0701  SUB           r7,r10,#0x01
0x0800020E 45DA      CMP           r10,r11
0x08000210 D101      BNE           0x08000216
```

可以看到首先是跳转到了__scatterload (0x08000200)

> ADR,adr是小范围的地址读取伪指令,实际上adr是将基于PC相对偏移的地址值或基于寄存器相对地址值读取的为指令

> LDM,Load from memory into register，批量加载内存到寄存器，指令运行的方向和LDR是不一样的，是从左到右运行的。该指令是将内存中堆栈内的数据，批量的赋值给寄存器，即是出栈操作；其中堆栈指针一般对应于SP。

在这里则是把r0的内容内容给了r10和r11

r10+=r0
r11+=r0
r7=r10-1
r10-r11

> BNE 是不相等跳转

所以如果r10和r11不相等就跳转到0x08000216

这里是不相等的，所以跳到了0x08000216

```c
0x08000212 F000F831  BL.W          __rt_entry (0x08000278)
0x08000216 F2AF0E09  ADR.W         lr,{pc}-0x07  ; @0x0800020F
0x0800021A E8BA000F  LDM           r10!,{r0-r3}
0x0800021E F0130F01  TST           r3,#0x01
0x08000222 BF18      IT            NE
0x08000224 1AFB      SUBNE         r3,r7,r3
0x08000226 F0430301  ORR           r3,r3,#0x01
0x0800022A 4718      BX            r3
```

首先是把0x0800020F存到了lr中，后面需要回到上面的cmp时候进行跳转。

r10！ 这个！表示写回到r10中

> TST，测试某一个位是否为0

这里是测试r3的第一位是否为0

> IT,用于根据特定条件来执行紧随其后的1~4条指令,NE表示不等于

TST与IT连用也就是检测r3第一位是否为0 为0则执行接下来的1条指令

> SUBNE，条件执行减法运算(NE),就是不等于0的情况下执行

> ORR，或指令

r3|=0x01，然后跳转到r3地址

#### __scatterload_copy

```c
0x08000234 3A10      SUBS          r2,r2,#0x10
0x08000236 BF24      ITT           CS
0x08000238 C878      LDMCS         r0!,{r3-r6}
0x0800023A C178      STMCS         r1!,{r3-r6}
0x0800023C D8FA      BHI           __scatterload_copy (0x08000234)
0x0800023E 0752      LSLS          r2,r2,#29
0x08000240 BF24      ITT           CS
0x08000242 C830      LDMCS         r0!,{r4-r5}
0x08000244 C130      STMCS         r1!,{r4-r5}
0x08000246 BF44      ITT           MI
0x08000248 6804      LDRMI         r4,[r0,#0x00]
0x0800024A 600C      STRMI         r4,[r1,#0x00]
0x0800024C 4770      BX            lr
```
r2-=0x10

ITT则是根据C位的情况来执行下面的两条指令

其实就开始了循环

> BHI,是无符号数大于跳转到后面的地址

这里不大于所以没有跳转

一直执行就会跳回到前面的lr，然后继续走到下面这个位置

```c
0x08000250 2300      MOVS          r3,#0x00
0x08000252 2400      MOVS          r4,#0x00
0x08000254 2500      MOVS          r5,#0x00
0x08000256 2600      MOVS          r6,#0x00
0x08000258 3A10      SUBS          r2,r2,#0x10
0x0800025A BF28      IT            CS
0x0800025C C178      STMCS         r1!,{r3-r6}
0x0800025E D8FB      BHI           0x08000258
0x08000260 0752      LSLS          r2,r2,#29
0x08000262 BF28      IT            CS
0x08000264 C130      STMCS         r1!,{r4-r5}
0x08000266 BF48      IT            MI
0x08000268 600B      STRMI         r3,[r1,#0x00]
0x0800026A 4770      BX            lr
```
清空了r3,r4,r5,r6，然后r2此时等于0x798 r1=0x20020010,这个和我当前工程有关

r2-=16

接着就是循环递减r2，把就是每次16字节的把r1的内存地址全部置为0

这里其实是ZI段清零的操作

清零完成以后，跳回到之前保存的lr cmp的位置上

#### __rt_entry()

然后就进入了__rt_entry

```c
0x0800020E 45DA      CMP           r10,r11
0x08000210 D101      BNE           0x08000216
0x08000212 F000F831  BL.W          __rt_entry (0x08000278)
```

###### __user_setup_stackheap

```c
0x08000278 F000F833  BL.W          __user_setup_stackheap (0x080002E2)
0x0800027C 4611      MOV           r1,r2
```

跳转到0x080002E2 设置用户堆栈

```c
0x080002E2 4675      MOV           r5,lr
0x080002E4 F000F82C  BL.W          __user_libspace (0x08000340)

0x08000340 4800      LDR           r0,[pc,#0]  ; @0x08000344
0x08000342 4770      BX            lr
```

继续运行，然后初始化堆栈

```c
0x080002E8 46AE      MOV           lr,r5
0x080002EA 0005      MOVS          r5,r0
0x080002EC 4669      MOV           r1,sp
0x080002EE 4653      MOV           r3,r10
0x080002F0 F0200007  BIC           r0,r0,#0x07
0x080002F4 4685      MOV           sp,r0
0x080002F6 B018      ADD           sp,sp,#0x60
0x080002F8 B520      PUSH          {r5,lr}
0x080002FA F7FFFFDB  BL.W          __user_initial_stackheap (0x080002B4)
```
###### __user_initial_stackheap

```c
__user_initial_stackheap:
0x080002B4 4804      LDR           r0,[pc,#16]  ; @0x080002C8
0x080002B6 4905      LDR           r1,[pc,#20]  ; @0x080002CC
0x080002B8 4A05      LDR           r2,[pc,#20]  ; @0x080002D0
0x080002BA 4B06      LDR           r3,[pc,#24]  ; @0x080002D4
0x080002BC 4770      BX            lr
```

完成以后跳回之前的位置继续执行。

```c
0x080002FE E8BD4020  POP           {r5,lr}
0x08000302 F04F0600  MOV           r6,#0x00
0x08000306 F04F0700  MOV           r7,#0x00
0x0800030A F04F0800  MOV           r8,#0x00
0x0800030E F04F0B00  MOV           r11,#0x00
0x08000312 F0210107  BIC           r1,r1,#0x07
0x08000316 46AC      MOV           r12,r5
0x08000318 E8AC09C0  STM           r12!,{r6-r8,r11}
0x0800031C E8AC09C0  STM           r12!,{r6-r8,r11}
0x08000320 E8AC09C0  STM           r12!,{r6-r8,r11}
0x08000324 E8AC09C0  STM           r12!,{r6-r8,r11}
0x08000328 468D      MOV           sp,r1
0x0800032A 4770      BX            lr
```

回到入口位置

###### __rt_lib_init

```c
0x0800027C 4611      MOV           r1,r2
                 exit:
0x0800027E F7FFFFF5  BL.W          __rt_lib_init (0x0800026C)
```

__rt_lib_init 初始化

```c
                __rt_lib_init:
0x0800026C B51F      PUSH          {r0-r4,lr}
                __rt_lib_init_fp_1:
0x0800026E F001F9E1  BL.W          _fp_init (0x08001634)
...
    0x08001634 F04F7040  MOV           r0,#0x3000000
    0x08001638 EEE10A10  VMSR           FPSCR, r0
    0x0800163C 4770      BX            lr
...
                __rt_lib_init_alloca_1:
0x08000272 BD1F      POP           {r0-r4,pc}
```

#### 进入main函数

```c
                __re_entry_main:
0x08000282 F001F98F  BL.W          main (0x080015A4)
...
0x080015A4 B086      SUB           sp,sp,#0x18ial_stackheap
...
```
从这里往后就全是main函数了

## 总结

启动文件的整个过程，分为如下：

1. 系统初始化，包括对中断向量表的
2. 加载 RW 段
3. ZI 段清零
4. 初始化用户堆
5. 初始化微库
6. 调用 main 函数。

感觉有的地方还不是很明白，不是很懂他做了什么，需要配合.map的映射文件才能知道他这么做有什么意义。

下次再配合.map 分析一下整个链接 编译过程，看看到底有什么。

## Quote

> http://blog.csdn.net/wangfoquan/article/details/7650988
>
> http://www.openedv.com/posts/list/20164.htm
>
> http://blog.csdn.net/ropai/article/details/7493168
