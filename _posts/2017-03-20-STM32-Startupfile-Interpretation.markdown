---
layout:     post
title:      "STM32启动文件分析"
subtitle:   "嵌入式，bootloader，STM32"
date:       2017-03-20
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## STM32启动文件分析

STM32的启动文件相当于就是bootloader，平时虽然对外都是屏蔽的级别，但是有时候还是需要知道一下的。

特别是了解了当前这个板子的bootloader之后，对于其他的板子的启动，其实也是类似的。

一般来说STM32系列的启动文件都是startup_stm32fxxxx.s，当然根据板子的内存大小，外设数量，封装不同可能使用的启动文件并不相同。

但总的来说大同小异。

启动代码的一般流程是：异常向量表的初始化–存储区分配–初始化堆栈–高级语言入口函数调用– main()函数。

#### 环境

编译环境：keil 5.23

固件库：Keil.STM32F7xx_DFP.2.9.0

#### 文件注释

```asm
;******************** (C) COPYRIGHT 2016 STMicroelectronics ********************
;* File Name          : startup_stm32f767xx.s
;* Author             : MCD Application Team
;* Version            : V1.1.1
;* Date               : 01-July-2016
;* Description        : STM32F767xx devices vector table for MDK-ARM toolchain. 
;*                      This module performs:
;*                      - Set the initial SP
;*                      - Set the initial PC == Reset_Handler
;*                      - Set the vector table entries with the exceptions ISR address
;*                      - Branches to __main in the C library (which eventually
;*                        calls main()).
;*                      After Reset the CortexM7 processor is in Thread mode,
;*                      priority is Privileged, and the Stack is set to Main.
;* <<< Use Configuration Wizard in Context Menu >>>   
;*******************************************************************************
; 
;* Redistribution and use in source and binary forms, with or without modification,
;* are permitted provided that the following conditions are met:
;*   1. Redistributions of source code must retain the above copyright notice,
;*      this list of conditions and the following disclaimer.
;*   2. Redistributions in binary form must reproduce the above copyright notice,
;*      this list of conditions and the following disclaimer in the documentation
;*      and/or other materials provided with the distribution.
;*   3. Neither the name of STMicroelectronics nor the names of its contributors
;*      may be used to endorse or promote products derived from this software
;*      without specific prior written permission.
;*
;* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
;* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
;* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
;* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
;* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
;* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
;* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
;* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
;* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
;* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
; 
;*******************************************************************************
```

先看文件注释部分，看看官方是如何写注释和介绍这个启动文件的。

这个是STM32F767系列的设备向量表，这个模块完成了下面的功能

- 初始化SP（堆栈指针）
- 初始化PC（程序指针）
- 初始化中断向量表
- 跳转到main()函数
- 复位以后，处理器是线程模式，优先级是特权级，堆栈设置为MSP（主堆栈指针：复位后缺省使用的堆栈指针，用于操作系统内核以及异常处理例程，包括中断服务例程）

#### 源码

##### 栈设置

```asm
; Amount of memory (in bytes) allocated for Stack
; Tailor this value to your application needs
; <h> Stack Configuration
;   <o> Stack Size (in Bytes) <0x0-0xFFFFFFFF:8>
; </h>

Stack_Size      EQU     0x00000400

                AREA    STACK, NOINIT, READWRITE, ALIGN=3
Stack_Mem       SPACE   Stack_Size
__initial_sp
```
设置栈的大小，这个可以自己根据需要调整。

这里栈的大小为 0x400

> AREA命令，指示汇编程序汇编新的代码节或数据节

- STACK，节名字

- READWRITE，指示可以读写此节。

- NOINIT，指示数据节未初始化，或初始化为零。

- ALIGN=expression_r，缺省情况下，ELF节在四字节边界上对齐。expression_r可以取值0到31之间的任何整数。节在2^expression_r字节边界上对齐。这里就是8字节对齐

> SPACE，申请一片内存空间，其大小为Stack_Size。

这里详细说明的几个命令，后面很常用，就不再介绍了。

__initial_sp，表示的是栈顶指针，其实际地址是SPACE申请的内存空间的结束地址，栈是由高向低生长。

##### 堆设置

```asm
; <h> Heap Configuration
;   <o>  Heap Size (in Bytes) <0x0-0xFFFFFFFF:8>
; </h>

Heap_Size       EQU     0x00000200

                AREA    HEAP, NOINIT, READWRITE, ALIGN=3
__heap_base
Heap_Mem        SPACE   Heap_Size
__heap_limit

```
这里给堆申请了空间，设置了大小=0x200

__heap_base，对应的自然也就是SPACE申请的内存空间的开始地址，也是堆的起始地址。
__heap_limit，也就是堆的结束地址

##### 编译器设置

```asm
                PRESERVE8
                THUMB
```

简单说，就是告诉编译器使用THUMB指令集，并且八字节对齐

> PRESERVE8，指令指定当前文件保持堆栈八字节对齐。 它设置 PRES8 编译属性以通知链接器。
链接器检查要求堆栈八字节对齐的任何代码是否仅由保持堆栈八字节对齐的代码直接或间接地调用。

>THUMB,告诉编译器使用THUMB指令集

##### 向量表和地址映射

```asm
; Vector Table Mapped to Address 0 at Reset
                AREA    RESET, DATA, READONLY
                EXPORT  __Vectors
                EXPORT  __Vectors_End
                EXPORT  __Vectors_Size
```

复位之后，向量表从地址0开始映射。

设置RESET节为只读类型，

- DATA，表示包含数据，不包含指令。
- READONLY，表示只读类型

> EXPORT ，表示其后跟的变量提供给其他模块调用的。

这样__Vectors，__Vectors_End,__Vectors_Size就变成全局性的标号。

```asm
__Vectors       DCD     __initial_sp               ; Top of Stack
                DCD     Reset_Handler              ; Reset Handler
                DCD     NMI_Handler                ; NMI Handler
                DCD     HardFault_Handler          ; Hard Fault Handler
                DCD     MemManage_Handler          ; MPU Fault Handler
                DCD     BusFault_Handler           ; Bus Fault Handler
                DCD     UsageFault_Handler         ; Usage Fault Handler
                DCD     0                          ; Reserved
                DCD     0                          ; Reserved
                DCD     0                          ; Reserved
                DCD     0                          ; Reserved
                DCD     SVC_Handler                ; SVCall Handler
                DCD     DebugMon_Handler           ; Debug Monitor Handler
                DCD     0                          ; Reserved
                DCD     PendSV_Handler             ; PendSV Handler
                DCD     SysTick_Handler            ; SysTick Handler

                ; External Interrupts
                DCD     WWDG_IRQHandler                   ; Window WatchDog                                        
                DCD     PVD_IRQHandler                    ; PVD through EXTI Line detection                        
                DCD     TAMP_STAMP_IRQHandler             ; Tamper and TimeStamps through the EXTI line            
                DCD     RTC_WKUP_IRQHandler               ; RTC Wakeup through the EXTI line                       
                DCD     FLASH_IRQHandler                  ; FLASH                                                     
				...
                DCD     SDMMC2_IRQHandler                 ; SDMMC2
                DCD     CAN3_TX_IRQHandler                ; CAN3 TX
                DCD     CAN3_RX0_IRQHandler               ; CAN3 RX0
                DCD     CAN3_RX1_IRQHandler               ; CAN3 RX1
                DCD     CAN3_SCE_IRQHandler               ; CAN3 SCE
                DCD     JPEG_IRQHandler                   ; JPEG
                DCD     MDIOS_IRQHandler                  ; MDIOS
__Vectors_End

__Vectors_Size  EQU  __Vectors_End - __Vectors

                AREA    |.text|, CODE, READONLY
```

> DCD,DCD申请一个字(32bit)的内存空间,并赋了初值。

可以看到，这里的名字基本都是在程序里用的中断函数名，地址是从0开始的，第一个字就是其SP指针的地址，第二个是复位地址...

通过__Vectors_End - __Vectors获得了中断向量表的大小。

- \|.text\|，表示由 C 编译器生成的代码节，或以某种方式与 C 库关联的代码节。
- CODE，表示包含机器指令。

这里的AREA是对代码段的定义，表示的是代码，只读。

##### 复位程序

```asm
; Reset handler
Reset_Handler    PROC
                 EXPORT  Reset_Handler             [WEAK]
        IMPORT  SystemInit
        IMPORT  __main

                 LDR     R0, =SystemInit
                 BLX     R0
                 LDR     R0, =__main
                 BX      R0
                 ENDP
```
> PROC,子程序的伪指令，表示当前子程序名为Reset_Handler

- WEAK,表示弱定义，如果外部文件优先定义了该标号则首先引用该标号，如果外部文件没有声明也不会出错。

这里表示复位子程序可以由用户在其他文件重新实现，这里并不是唯一的.

> IMPORT,表示该标号来自外部文件，跟C语言中的EXTERN关键字类似。

这里表示SystemInit和__main这两个函数均来自外部的文件。

SystemInit则是系统时钟的配置函数，平常看到的很多分析都说这里的__main是主函数，也就是我们写程序的main()，其实并不是。

__main()是编译系统提供的一个函数，负责完成库函数的初始化和初始化应用程序执行环境，最后自动跳转到main()。所以说，前者是库函数，后者就是我们自己编写的main()主函数；

> LDR，把SystemInit的地址赋值给R0
> BLX，跳转到R0的位置执行，然后返回。
> ENDP，结束子程序
简单说就是调用了SystemInit()函数以及__main()函数然后结束。


##### 中断向量表的转移
```asm
; Dummy Exception Handlers (infinite loops which can be modified)

NMI_Handler     PROC
                EXPORT  NMI_Handler                [WEAK]
                B       .
                ENDP
HardFault_Handler\
                PROC
                EXPORT  HardFault_Handler          [WEAK]
                B       .
                ENDP
MemManage_Handler\
                PROC
                EXPORT  MemManage_Handler          [WEAK]
                B       .
                ENDP
BusFault_Handler\
                PROC
                EXPORT  BusFault_Handler           [WEAK]
                B       .
                ENDP
UsageFault_Handler\
                PROC
                EXPORT  UsageFault_Handler         [WEAK]
                B       .
                ENDP
SVC_Handler     PROC
                EXPORT  SVC_Handler                [WEAK]
                B       .
                ENDP
DebugMon_Handler\
                PROC
                EXPORT  DebugMon_Handler           [WEAK]
                B       .
                ENDP
PendSV_Handler  PROC
                EXPORT  PendSV_Handler             [WEAK]
                B       .
                ENDP
SysTick_Handler PROC
                EXPORT  SysTick_Handler            [WEAK]
                B       .
                ENDP

Default_Handler PROC

                EXPORT  WWDG_IRQHandler                   [WEAK]                                        
                EXPORT  PVD_IRQHandler                    [WEAK]                      
                EXPORT  TAMP_STAMP_IRQHandler             [WEAK]
				...
                EXPORT  CAN3_RX0_IRQHandler               [WEAK]
                EXPORT  CAN3_RX1_IRQHandler               [WEAK]
                EXPORT  CAN3_SCE_IRQHandler               [WEAK]
                EXPORT  JPEG_IRQHandler                   [WEAK]
                EXPORT  MDIOS_IRQHandler                  [WEAK]
                
WWDG_IRQHandler                                                       
PVD_IRQHandler                                      
TAMP_STAMP_IRQHandler                  
RTC_WKUP_IRQHandler                                
FLASH_IRQHandler                                                       
RCC_IRQHandler                                                     
...
CAN3_RX1_IRQHandler
CAN3_SCE_IRQHandler
JPEG_IRQHandler
MDIOS_IRQHandler
                B       .

                ENDP

                ALIGN
```

> B Label ；程序无条件跳转到标号 Label 处执行

这里B       .表示跳转到当前地址，其等效于while(1)，基本就是死循环在这里。

如果你没有给出对应的中断或者异常处理程序，那么程序就会死循环在这里。

这里只是预先弱定义了处理函数，实际的处理函数需要我们自己定义。

> ALIGN：对指令或者数据存放的地址进行对齐，后面会跟一个立即数。缺省表示4字节对齐。

##### 用户堆栈初始化
```asm
;*******************************************************************************
; User Stack and Heap initialization
;*******************************************************************************
                 IF      :DEF:__MICROLIB
                
                 EXPORT  __initial_sp
                 EXPORT  __heap_base
                 EXPORT  __heap_limit
                
                 ELSE
                
                 IMPORT  __use_two_region_memory
                 EXPORT  __user_initial_stackheap
                 
__user_initial_stackheap

                 LDR     R0, =  Heap_Mem
                 LDR     R1, =(Stack_Mem + Stack_Size)
                 LDR     R2, = (Heap_Mem +  Heap_Size)
                 LDR     R3, = Stack_Mem
                 BX      LR

                 ALIGN

                 ENDIF

                 END
```

如果定义了微函数库，把__initial_sp，__heap_base，__heap_limit设置为全局标号

否则就使用用户定义的__main来完成默认的堆栈初始化，然后调用main()函数进入我们的函数里。一般来说都没有用MicroLIB（可以在工程配置里勾选）

把堆首地址给了R0，栈顶地址给了R1，堆尾地址给了R2，栈底地址给了R3

> BX LR，作用等同于mov  pc,lr。可以使用MOV PC, LR或者BX LR来完成子程序返回。另外，也可以在在子程序入口处使用该指令将LR保存到栈中

> END，文件结束

## 总结

到这里启动文件分析就结束了，但是如果只看了这里其实还是没看明白怎么回事，还需要对STM32的启动过程有一个了解，才能明白这里做了什么事。

想要知道具体main函数之前发生了什么，可以看这里
> http://blog.csdn.net/norains/article/details/6052029

__main函数都干了什么，看这里
> http://blog.csdn.net/wangfoquan/article/details/7650988

修改启动程序，看这里
> http://www.openedv.com/posts/list/2647.htm

## Quote

> http://blog.csdn.net/eleven_yy/article/details/7751995
> 
> http://blog.csdn.net/njuitjf/article/details/8558963
> 
> https://wenku.baidu.com/view/bad36fb577232f60dccca19a.html
> 
> http://www.cnblogs.com/amanlikethis/p/3719529.html
> 
> http://blog.sina.com.cn/s/blog_616619c80100eqkj.html
> 
> http://www.worlduc.com/blog2012.aspx?bid=7329962
