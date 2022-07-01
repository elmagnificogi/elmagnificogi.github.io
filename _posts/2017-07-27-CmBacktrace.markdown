---
layout:     post
title:      "CmBacktrace"
subtitle:   "STM32"
date:       2017-07-27
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - STM32
    - Embedded
---

## Foreword

> CmBacktrace （Cortex Microcontroller Backtrace）是一款针对 ARM Cortex-M 系列 MCU
 的错误代码自动追踪、定位，错误原因自动分析的开源库。主要特性如下：
>
>支持的错误包括：
断言（assert）
故障（Hard Fault, Memory Management Fault, Bus Fault, Usage Fault, Debug Fault）
故障原因 自动诊断 ：可在故障发生时，自动分析出故障的原因，定位发生故障的代码位置，而无需
再手动分析繁杂的故障寄存器；
输出错误现场的 函数调用栈（需配合 addr2line 工具进行精确定位），还原发生错误时的现场信息
，定位问题代码位置、逻辑更加快捷、精准。也可以在正常状态下使用该库，获取当前的函数调用
栈；
支持 裸机 及以下操作系统平台：
RT-Thread
UCOS
FreeRTOS（需修改源码）
根据错误现场状态，输出对应的 线程栈 或 C 主栈；
故障诊断信息支持多国语言（目前：简体中文、英文）；
适配 Cortex-M0/M3/M4/M7 MCU；
支持 IAR、KEIL、GCC 编译器；
>
> https://github.com/armink/CmBacktrace

从介绍上来说，非常友好，发生断言，Hard Fault 等情况可以帮忙记录故障原因，打印输出寄存器
状态，堆栈等内容，实际使用时配合 Flash 保存这些信息也非常容易，从而在一个复杂系统中可以
找到某些隐藏的BUG，进而提升产品的稳定性，非常不错

详细的介绍在 github 上也有，当然直接看源码更合适。

## Source Code

#### cmb_cfg.h

```c
#ifndef _CMB_CFG_H_
#define _CMB_CFG_H_

/* print line, must config by user */
#define cmb_println(...)     /* e.g., printf(__VA_ARGS__);printf("\r\n") */

    首先 ... 表示给入的参数是一个不定长度的参数， __VA_ARGS__ 则是把这个参数列表给传入
    对应使用的函数中，需要注意的是 ... 只能代替最后面的宏参数

/* enable bare metal(no OS) platform */
/* #define CMB_USING_BARE_METAL_PLATFORM */
/* enable OS platform */
#define CMB_USING_OS_PLATFORM

/* OS platform type, must config when CMB_USING_OS_PLATFORM is enable */
/* #define CMB_OS_PLATFORM_TYPE           CMB_OS_PLATFORM_RTT or CMB_OS_PLATFORM_UCOSII or CMB_OS_PLATFORM_UCOSIII or CMB_OS_PLATFORM_FREERTOS */
#define CMB_OS_PLATFORM_TYPE           CMB_OS_PLATFORM_FREERTOS

/* cpu platform type, must config by user */
/* #define CMB_CPU_PLATFORM_TYPE           CMB_CPU_ARM_CORTEX_M0 or CMB_CPU_ARM_CORTEX_M3 or CMB_CPU_ARM_CORTEX_M4 or CMB_CPU_ARM_CORTEX_M7 */
#define CMB_CPU_PLATFORM_TYPE          CMB_CPU_ARM_CORTEX_M7

/* enable dump stack information */
#define CMB_USING_DUMP_STACK_INFO

/* language of print information */
/* #define CMB_PRINT_LANGUAGE             CMB_PRINT_LANGUAGE_ENGLISH(default) or CMB_PRINT_LANUUAGE_CHINESE */

#endif /* _CMB_CFG_H_ */
```

#### cmb_fault.S

```c
AREA |.text|, CODE, READONLY, ALIGN=2
THUMB
REQUIRE8
PRESERVE8

; NOTE: If use this file's HardFault_Handler, please comments the HardFault_Handler code on other file.
IMPORT cm_backtrace_fault
EXPORT HardFault_Handler

HardFault_Handler    PROC
MOV     r0, lr                  ; get lr
MOV     r1, sp                  ; get stack pointer (current is MSP)
BL      cm_backtrace_fault

Fault_Loop
BL      Fault_Loop              ;while(1)
ENDP

END

```

这里是重写了 HardFault 的中断处理函数，通过把 lr 和 sp 存入 r0 r1 （他们作为参数）调用
cm_backtrace_fault 进行错误追踪处理 ，处理结束后程序死在这里。

由于这里重构了 HardFault 中断，那么原本的中断函数就需要注释掉了，当然也可以自己重写Hard
Fault ，不用他这里的 HardFault 。

#### cmb_def.h

定义了许多会使用到的寄存器结构体，以及和 OS、编译器、平台相关的宏定义

#### cm_backtrace.h

```c
#ifndef _CORTEXM_BACKTRACE_H_
#define _CORTEXM_BACKTRACE_H_

#include "cmb_def.h"

void cm_backtrace_init(const char *firmware_name, const char *hardware_ver, const char *software_ver);
void cm_backtrace_firmware_info(void);
size_t cm_backtrace_call_stack(uint32_t *buffer, size_t size, uint32_t sp);
void cm_backtrace_assert(uint32_t sp);
void cm_backtrace_fault(uint32_t fault_handler_lr, uint32_t fault_handler_sp);

#endif /* _CORTEXM_BACKTRACE_H_ */
```

这里定义了几个会被调用的函数

其中 cm_backtrace_init 需要在系统启动之后 立马进行初始化，保证可以在出错之前完成

cm_backtrace_fault 就是 HardFault 调用的处理函数

cm_backtrace_assert 是系统断言中必须要加入的函数

cm_backtrace_call_stack 和 cm_backtrace_firmware_info 则是 断言和 HardFault 调用的
子函数

#### cm_backtrace.c

```c
void cm_backtrace_init(const char *firmware_name, const char *hardware_ver, const char *software_ver) {
    strncpy(fw_name, firmware_name, CMB_NAME_MAX);
    strncpy(hw_ver, hardware_ver, CMB_NAME_MAX);
    strncpy(sw_ver, software_ver, CMB_NAME_MAX);
    设定好对应的固件名 硬件版本 软件版本（这里的软件版本其实可以对应git commit号）

#if defined(__CC_ARM)
    main_stack_start_addr = (uint32_t)&CSTACK_BLOCK_START(CMB_CSTACK_BLOCK_NAME);
    main_stack_size = (uint32_t)&CSTACK_BLOCK_END(CMB_CSTACK_BLOCK_NAME) - main_stack_start_addr;
    code_start_addr = (uint32_t)&CODE_SECTION_START(CMB_CODE_SECTION_NAME);
    code_size = (uint32_t)&CODE_SECTION_END(CMB_CODE_SECTION_NAME) - code_start_addr;
#elif defined(__ICCARM__)
    main_stack_start_addr = (uint32_t)__section_begin(CMB_CSTACK_BLOCK_NAME);
    main_stack_size = (uint32_t)__section_end(CMB_CSTACK_BLOCK_NAME) - main_stack_start_addr;
    code_start_addr = (uint32_t)__section_begin(CMB_CODE_SECTION_NAME);
    code_size = (uint32_t)__section_end(CMB_CODE_SECTION_NAME) - code_start_addr;
#elif defined(__GNUC__)
    main_stack_start_addr = (uint32_t)(&CMB_CSTACK_BLOCK_START);
    main_stack_size = (uint32_t)(&CMB_CSTACK_BLOCK_END) - main_stack_start_addr;
    code_start_addr = (uint32_t)(&CMB_CODE_SECTION_START);
    code_size = (uint32_t)(&CMB_CODE_SECTION_END) - code_start_addr;
#else
    #error "not supported compiler"
#endif
    根据编译器决定具体的栈地址 栈大小，代码区地址，代码大小

    init_ok = true;
}
```

打印硬件信息

```c
void cm_backtrace_firmware_info(void) {
    cmb_println(print_info[PRINT_FIRMWARE_INFO], fw_name, hw_ver, sw_ver);
}
```

如果是在用户态发生的问题，也就是 thread 中出现的问题 ，根据 OS 获取对应的线程栈地址和大
小

```c
static void get_cur_thread_stack_info(uint32_t sp, uint32_t *start_addr, size_t *size) {
    CMB_ASSERT(start_addr);
    CMB_ASSERT(size);

#if (CMB_OS_PLATFORM_TYPE == CMB_OS_PLATFORM_RTT)
    *start_addr = (uint32_t) rt_thread_self()->stack_addr;
    *size = rt_thread_self()->stack_size;
#elif (CMB_OS_PLATFORM_TYPE == CMB_OS_PLATFORM_UCOSII)
    extern OS_TCB *OSTCBCur;

    *start_addr = (uint32_t) OSTCBCur->OSTCBStkBottom;
    *size = OSTCBCur->OSTCBStkSize * sizeof(OS_STK);
#elif (CMB_OS_PLATFORM_TYPE == CMB_OS_PLATFORM_UCOSIII)
    #error "not implemented, I hope you can do this"
    //TODO 待实现
#elif (CMB_OS_PLATFORM_TYPE == CMB_OS_PLATFORM_FREERTOS)
    *start_addr = (uint32_t)vTaskStackAddr();
    *size = vTaskStackSize() * sizeof( StackType_t );
#endif
}
```

获取出错任务的任务名

```c
static const char *get_cur_thread_name(void) {
#if (CMB_OS_PLATFORM_TYPE == CMB_OS_PLATFORM_RTT)
    return rt_thread_self()->name;
#elif (CMB_OS_PLATFORM_TYPE == CMB_OS_PLATFORM_UCOSII)
    extern OS_TCB *OSTCBCur;

#if OS_TASK_NAME_SIZE > 0 || OS_TASK_NAME_EN > 0
        return (const char *)OSTCBCur->OSTCBTaskName;
#else
        return NULL;
#endif /* OS_TASK_NAME_SIZE > 0 || OS_TASK_NAME_EN > 0 */

#elif (CMB_OS_PLATFORM_TYPE == CMB_OS_PLATFORM_UCOSIII)
    #error "not implemented, I hope you can do this"
    //TODO 待实现
#elif (CMB_OS_PLATFORM_TYPE == CMB_OS_PLATFORM_FREERTOS)
    return vTaskName();
#endif
}
```

打印出错任务的所有栈内容

```c
static void dump_cur_thread_stack(uint32_t stack_start_addr, size_t stack_size, uint32_t *stack_pointer) {
    cmb_println(print_info[PRINT_THREAD_STACK_INFO]);
    for (; (uint32_t) stack_pointer < stack_start_addr + stack_size; stack_pointer++) {
        cmb_println("  addr: %08x    data: %08x", stack_pointer, *stack_pointer);
    }
    cmb_println("====================================");
}
```

打印当前系统的栈内容

```c
static void dump_main_stack(uint32_t stack_start_addr, size_t stack_size, uint32_t *stack_pointer) {
    cmb_println(print_info[PRINT_MAIN_STACK_INFO]);
    for (; (uint32_t) stack_pointer < stack_start_addr + stack_size; stack_pointer++) {
        cmb_println("  addr: %08x    data: %08x", stack_pointer, *stack_pointer);
    }
    cmb_println("====================================");
}
```
通过这里获取对应的栈中调用的所有函数信息

```c
size_t cm_backtrace_call_stack(uint32_t *buffer, size_t size, uint32_t sp) {
    uint32_t stack_start_addr = main_stack_start_addr, pc;
    size_t depth = 0, stack_size = main_stack_size;
    bool regs_saved_lr_is_valid = false;

    if (on_fault) {
        /* first depth is PC */
        buffer[depth++] = regs.saved.pc;
        /* second depth is from LR, so need decrease a word to PC */
        pc = regs.saved.lr - sizeof(size_t);
        if ((pc >= code_start_addr) && (pc <= code_start_addr + code_size) && (depth < CMB_CALL_STACK_MAX_DEPTH)
                && (depth < size)) {
            buffer[depth++] = pc;
            regs_saved_lr_is_valid = true;
        }

#ifdef CMB_USING_OS_PLATFORM
        /* program is running on thread before fault */
        if (on_thread_before_fault) {
            get_cur_thread_stack_info(sp, &stack_start_addr, &stack_size);
        }
    } else {
        /* OS environment */
        if (cmb_get_sp() == cmb_get_psp()) {
            get_cur_thread_stack_info(sp, &stack_start_addr, &stack_size);
        }
#endif /* CMB_USING_OS_PLATFORM */

    }

    /* copy called function address */
    for (; sp < stack_start_addr + stack_size; sp += sizeof(size_t)) {
        /* the *sp value may be LR, so need decrease a word to PC */
        pc = *((uint32_t *) sp) - sizeof(size_t);
        if ((pc >= code_start_addr) && (pc <= code_start_addr + code_size) && (depth < CMB_CALL_STACK_MAX_DEPTH)
                && (depth < size)) {
            /* the second depth function may be already saved, so need ignore repeat */
            if ((depth == 2) && regs_saved_lr_is_valid && (pc == buffer[1])) {
                continue;
            }
            buffer[depth++] = pc;
        }
    }

    return depth;
}
```

这里则是通过调用上面的函数，打印出来所有的调用栈信息

```c
static void print_call_stack(uint32_t sp) {
    size_t i, cur_depth = 0;
    uint32_t call_stack_buf[CMB_CALL_STACK_MAX_DEPTH] = {0};

    cur_depth = cm_backtrace_call_stack(call_stack_buf, CMB_CALL_STACK_MAX_DEPTH, sp);

    for (i = 0; i < cur_depth; i++) {
        sprintf(call_stack_info + i * (8 + 1), "%08lx", call_stack_buf[i]);
        call_stack_info[i * (8 + 1) + 8] = ' ';
    }

    if (cur_depth) {
        cmb_println(print_info[PRINT_CALL_STACK_INFO], fw_name, CMB_ELF_FILE_EXTENSION_NAME, cur_depth * (8 + 1),
                call_stack_info);
    } else {
        cmb_println(print_info[PRINT_CALL_STACK_ERR]);
    }
}
```

断言函数

```c
void cm_backtrace_assert(uint32_t sp) {
    CMB_ASSERT(init_ok);

#ifdef CMB_USING_OS_PLATFORM
    uint32_t cur_stack_pointer = cmb_get_sp();
#endif

    cmb_println("");
    cm_backtrace_firmware_info();

#ifdef CMB_USING_OS_PLATFORM
    /* OS environment */
    这里是根据是中断中发生 ASSERT 还是线程中发生 ASSERT 来决定输出内容
    if (cur_stack_pointer == cmb_get_msp()) {
        cmb_println(print_info[PRINT_ASSERT_ON_HANDLER]);

#ifdef CMB_USING_DUMP_STACK_INFO
        dump_main_stack(main_stack_start_addr, main_stack_size, (uint32_t *) sp);
#endif /* CMB_USING_DUMP_STACK_INFO */

    } else if (cur_stack_pointer == cmb_get_psp()) {
        cmb_println(print_info[PRINT_ASSERT_ON_THREAD], get_cur_thread_name());

#ifdef CMB_USING_DUMP_STACK_INFO
        uint32_t stack_start_addr;
        size_t stack_size;
        get_cur_thread_stack_info(sp, &stack_start_addr, &stack_size);
        dump_cur_thread_stack(stack_start_addr, stack_size, (uint32_t *) sp);
#endif /* CMB_USING_DUMP_STACK_INFO */

    }

#else

    /* bare metal(no OS) environment */
#ifdef CMB_USING_DUMP_STACK_INFO
    dump_main_stack(main_stack_start_addr, main_stack_size, (uint32_t *) sp);
#endif /* CMB_USING_DUMP_STACK_INFO */

#endif /* CMB_USING_OS_PLATFORM */

    print_call_stack(sp);
}
```

根据获取到的状态寄存器等 判断具体是什么出错

```c
static void fault_diagnosis(void) {
    if (regs.hfsr.bits.VECTBL) {
        cmb_println(print_info[PRINT_HFSR_VECTBL]);
    }
    if (regs.hfsr.bits.FORCED) {
        /* Memory Management Fault */
        if (regs.mfsr.value) {
            if (regs.mfsr.bits.IACCVIOL) {
                cmb_println(print_info[PRINT_MFSR_IACCVIOL]);
            }
            if (regs.mfsr.bits.DACCVIOL) {
                cmb_println(print_info[PRINT_MFSR_DACCVIOL]);
            }
            if (regs.mfsr.bits.MUNSTKERR) {
                cmb_println(print_info[PRINT_MFSR_MUNSTKERR]);
            }
            if (regs.mfsr.bits.MSTKERR) {
                cmb_println(print_info[PRINT_MFSR_MSTKERR]);
            }

    ...

    /* Debug Fault */
    if (regs.hfsr.bits.DEBUGEVT) {
        if (regs.dfsr.value) {
            if (regs.dfsr.bits.HALTED) {
                cmb_println(print_info[PRINT_DFSR_HALTED]);
            }
            if (regs.dfsr.bits.BKPT) {
                cmb_println(print_info[PRINT_DFSR_BKPT]);
            }
            if (regs.dfsr.bits.DWTTRAP) {
                cmb_println(print_info[PRINT_DFSR_DWTTRAP]);
            }
            if (regs.dfsr.bits.VCATCH) {
                cmb_println(print_info[PRINT_DFSR_VCATCH]);
            }
            if (regs.dfsr.bits.EXTERNAL) {
                cmb_println(print_info[PRINT_DFSR_EXTERNAL]);
            }
        }
    }
}
```

如果是 M4 或者是 M7 由于自带了 FPU ，出错时 如果开启了 FPU sp 中存的内容有很大一部分是
与 FPU 有关的，所以需要排除这一部分

```c
#if (CMB_CPU_PLATFORM_TYPE == CMB_CPU_ARM_CORTEX_M4) || (CMB_CPU_PLATFORM_TYPE == CMB_CPU_ARM_CORTEX_M7)
static uint32_t statck_del_fpu_regs(uint32_t fault_handler_lr, uint32_t sp) {
    statck_has_fpu_regs = (fault_handler_lr & (1UL << 4)) == 0 ? true : false;

    /* the stack has S0~S15 and FPSCR registers when statck_has_fpu_regs is true, double word align */
    return statck_has_fpu_regs == true ? sp + sizeof(size_t) * 18 : sp;
}
#endif
```

最重要的追踪函数主体

```c
void cm_backtrace_fault(uint32_t fault_handler_lr, uint32_t fault_handler_sp) {

    获取到栈指针
    uint32_t stack_pointer = fault_handler_sp, saved_regs_addr = stack_pointer;
    const char *regs_name[] = { "R0 ", "R1 ", "R2 ", "R3 ", "R12", "LR ", "PC ", "PSR" };

#ifdef CMB_USING_DUMP_STACK_INFO
    拿到系统堆栈信息
    uint32_t stack_start_addr = main_stack_start_addr;
    size_t stack_size = main_stack_size;
#endif

    确保被初始化过，否则系统堆栈信息等都可能是错的
    CMB_ASSERT(init_ok);
    /* only call once */
    CMB_ASSERT(!on_fault);

    on_fault = true;

    cmb_println("");
    cm_backtrace_firmware_info();

#ifdef CMB_USING_OS_PLATFORM
    有操作系统下，判断出问题点是在中断还是线程部分，打印相关信息
    on_thread_before_fault = fault_handler_lr & (1UL << 2);
    /* check which stack was used before (MSP or PSP) */
    if (on_thread_before_fault) {
        cmb_println(print_info[PRINT_FAULT_ON_THREAD], get_cur_thread_name() != NULL ? get_cur_thread_name() : "NO_NAME");
        saved_regs_addr = stack_pointer = cmb_get_psp();

#ifdef CMB_USING_DUMP_STACK_INFO
        get_cur_thread_stack_info(stack_pointer, &stack_start_addr, &stack_size);
#endif /* CMB_USING_DUMP_STACK_INFO */

    } else {
        cmb_println(print_info[PRINT_FAULT_ON_HANDLER]);
    }
#else
    /* bare metal(no OS) environment */
    cmb_println(print_info[PRINT_FAULT_ON_HANDLER]);
#endif /* CMB_USING_OS_PLATFORM */

    /* delete saved R0~R3, R12, LR,PC,xPSR registers space */
    stack_pointer += sizeof(size_t) * 8;

#if (CMB_CPU_PLATFORM_TYPE == CMB_CPU_ARM_CORTEX_M4) || (CMB_CPU_PLATFORM_TYPE == CMB_CPU_ARM_CORTEX_M7)
    stack_pointer = statck_del_fpu_regs(fault_handler_lr, stack_pointer);
#endif /* (CMB_CPU_PLATFORM_TYPE == CMB_CPU_ARM_CORTEX_M4) || (CMB_CPU_PLATFORM_TYPE == CMB_CPU_ARM_CORTEX_M7) */

    输出栈中所有内容
    /* dump stack information */
#ifdef CMB_USING_DUMP_STACK_INFO
#ifdef CMB_USING_OS_PLATFORM
    if (on_thread_before_fault) {
        dump_cur_thread_stack(stack_start_addr, stack_size, (uint32_t *) stack_pointer);
    } else {
        dump_main_stack(stack_start_addr, stack_size, (uint32_t *) stack_pointer);
    }
#else
    /* bare metal(no OS) environment */
    dump_main_stack(stack_start_addr, stack_size, (uint32_t *) stack_pointer);
#endif /* CMB_USING_OS_PLATFORM */
#endif /* CMB_USING_DUMP_STACK_INFO */

    输出寄存器中的信息
    /* dump register */
    cmb_println(print_info[PRINT_REGS_TITLE]);

    regs.saved.r0        = ((uint32_t *)saved_regs_addr)[0];  // Register R0
    regs.saved.r1        = ((uint32_t *)saved_regs_addr)[1];  // Register R1
    regs.saved.r2        = ((uint32_t *)saved_regs_addr)[2];  // Register R2
    regs.saved.r3        = ((uint32_t *)saved_regs_addr)[3];  // Register R3
    regs.saved.r12       = ((uint32_t *)saved_regs_addr)[4];  // Register R12
    regs.saved.lr        = ((uint32_t *)saved_regs_addr)[5];  // Link register LR
    regs.saved.pc        = ((uint32_t *)saved_regs_addr)[6];  // Program counter PC
    regs.saved.psr.value = ((uint32_t *)saved_regs_addr)[7];  // Program status word PSR


    cmb_println("  %s: %08x  %s: %08x  %s: %08x  %s: %08x", regs_name[0], regs.saved.r0,
                                                            regs_name[1], regs.saved.r1,
                                                            regs_name[2], regs.saved.r2,
                                                            regs_name[3], regs.saved.r3);
    cmb_println("  %s: %08x  %s: %08x  %s: %08x  %s: %08x", regs_name[4], regs.saved.r12,
                                                            regs_name[5], regs.saved.lr,
                                                            regs_name[6], regs.saved.pc,
                                                            regs_name[7], regs.saved.psr.value);
    cmb_println("==============================================================");

    /* the Cortex-M0 is not support fault diagnosis */
#if (CMB_CPU_PLATFORM_TYPE != CMB_CPU_ARM_CORTEX_M0)
    regs.syshndctrl.value = CMB_SYSHND_CTRL;  // System Handler Control and State Register
    regs.mfsr.value       = CMB_NVIC_MFSR;    // Memory Fault Status Register
    regs.mmar             = CMB_NVIC_MMAR;    // Memory Management Fault Address Register
    regs.bfsr.value       = CMB_NVIC_BFSR;    // Bus Fault Status Register
    regs.bfar             = CMB_NVIC_BFAR;    // Bus Fault Manage Address Register
    regs.ufsr.value       = CMB_NVIC_UFSR;    // Usage Fault Status Register
    regs.hfsr.value       = CMB_NVIC_HFSR;    // Hard Fault Status Register
    regs.dfsr.value       = CMB_NVIC_DFSR;    // Debug Fault Status Register
    regs.afsr             = CMB_NVIC_AFSR;    // Auxiliary Fault Status Register

    fault_diagnosis();
#endif

    print_call_stack(stack_pointer);
}
```

## 查错

当发生错误以后，使用 addr2line 命令，查看函数调用栈详细信息，并定位错误代码

> Addr2line 工具（它是标准的 GNU Binutils 中的一部分）是一个可以将指令的地址和可执行映像转换成文件名、函数名和源代码行数的工具。这种功能对于将跟踪地址转换成更有意义的内容来说简直是太棒了。

通过上面的函数，会在串口或者什么其他输出地方，输出栈的函数指针的具体地址，进而就可以定位
出来具体是哪行出错了，当然调用 addr2line 命令应该在程序的 bin/mot/elf 文件目录下

如下，只需要到对应的目录下执行下面的代码即可

```
Firmware name: xxxxx, hardware version: xxxxx, software version: xxxxx
Fault on thread God
=================== Registers information ====================
  R0 : 2000ba2c  R1 : 2000903c  R2 : 00140006  R3 : 00140006
  R12: 2000a594  LR : 0807a5ad  PC : 08076ea8  PSR: 01070000
==============================================================
Bus fault is caused by precise data access violation
The bus fault occurred address is 0014000e
Show more call stack info by run: addr2line -e xxxx.elf -a -f 08076ea8 0807a5a9 0807d9dc 080769bf 0807d9d9 0807d517 0807d32b 080563bd 0804c207 0804c357 0804e65b 0804f89d 0804f6c7 080742af 080742c1 08077005 
```

## Summary

总的来说大部分和寄存器以及出错相关的信息基本都来自于

- Cortex M3 Technical Reference Manual
- Cortex M4 Technical Reference Manual
- Cortex M7 Technical Reference Manual

如果只用 trace 还不够完美，需要有一个用来长时间保存出错信息的记录功能。

比如把所有出错信息写到 flash 中去，或者是 log 记录中去。

CmBacktrace 的作者也提供了对应的功能，不过其中用 flash 来做数据库，有点没意义。 flash
烧写次数有限，而且刷写新内容时需要 sector 式的擦除，对于每条数据存储也需要定义严格的格式
不是很推荐吧，会上数据库的应用，也不会差一个 SD 的。

当然你也可以在 CmBacktrace 中增加一些其他信息的代码，比如当发生错误以后，如果能获取到电
池电量的话，尽量获取到，然后输出，因为很有可能是因为低电触发了什么异常情况，而这种情况很
可能并不一定，什么都有，所以用低电排除一些没必要追究的异常，是有意义的

## Quote

> http://blog.csdn.net/jean_bai/article/details/45952247
>
> https://github.com/armink/CmBacktrace
>
> https://github.com/armink/EasyLogger
>
> https://github.com/armink/EasyFlash
>
> http://blog.csdn.net/lhf_tiger/article/details/9088609
>
> https://www.ibm.com/developerworks/cn/linux/l-graphvis/
>
> http://blog.csdn.net/whz_zb/article/details/7604760
