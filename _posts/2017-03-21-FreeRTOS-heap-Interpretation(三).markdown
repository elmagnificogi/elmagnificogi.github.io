---
layout:     post
title:      "FreeRTOS中heap源文件分析(三)"
subtitle:   "嵌入式，FreeRTOS，heap"
date:       2017-03-21
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## heap源文件分析

我们都知道其实库函数里就有内存分配和释放函数

- 原型

	extern void *malloc(unsigned int num_bytes);
	extern void  free(void *ptr);

- 头文件

	#include <stdlib.h>
	或者
	#include <malloc.h>

- 功能

malloc 分配长度为num_bytes字节的内存块

free 释放ptr指向的存储空间

- 返回值

malloc 如果分配成功则返回指向被分配内存的指针(此存储区中的初始值不确定)，否则返回空指针NULL。
free 被释放的空间通常被送入可用存储区池，以后可在调用malloc、realloc以及calloc函数来再分配。

- 说明

关于该函数的原型，在以前malloc返回的是char型指针，新的ANSIC标准规定，该函数返回为void型指针，因此必要时要进行类型转换。

基于上面的库函数heap_3.c简单的包装了标准库中的malloc()和free()函数，包装后的malloc()和free()函数具备线程保护。

### heap_3功能简介

- 需要链接器设置一个堆栈，并且编译器库提供malloc()和free()函数。
- 不具有确定性
- 可能明显的增大RTOS内核的代码大小

使用heap_3时，FreeRTOSConfig.h文件中的configTOTAL_HEAP_SIZE宏定义没有作用，库函数完全无视内存大小，所以需要使用的时候注意不要超过了硬件上限，同时也需要做未申请到的检测。

#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

## 注释

```c
/*
 * Implementation of pvPortMalloc() and vPortFree() that relies on the
 * compilers own malloc() and free() implementations.
 *
 * This file can only be used if the linker is configured to to generate
 * a heap memory area.
 *
 * See heap_1.c, heap_2.c and heap_4.c for alternative implementations, and the
 * memory management pages of http://www.FreeRTOS.org for more information.
 */
```

老样子，先来看看文件注释说了什么，如何介绍这个文件的。

基于编译器自身的库函数malloc()和free()来完成。基本没说。

#### 内存分配函数

```c
void *pvPortMalloc( size_t xWantedSize )
{
void *pvReturn;

	vTaskSuspendAll();
	{
		pvReturn = malloc( xWantedSize );
		traceMALLOC( pvReturn, xWantedSize );
	}
	( void ) xTaskResumeAll();

	#if( configUSE_MALLOC_FAILED_HOOK == 1 )
	{
		if( pvReturn == NULL )
		{
			extern void vApplicationMallocFailedHook( void );
			vApplicationMallocFailedHook();
		}
	}
	#endif

	return pvReturn;
}
```
挂起调度器

利用malloc申请空间，返回

恢复调度器

如果申请空间失败，并且有Hook的情况下，可以调用Hook处理分配失败的问题。

就是简单的封装了一下而已

#### 内存释放函数

void vPortFree( void *pv )
{
	if( pv )
	{
		vTaskSuspendAll();
		{
			free( pv );
			traceFREE( pv, 0 );
		}
		( void ) xTaskResumeAll();
	}
}

如果传入空间合法，挂起调度器

释放空间

恢复调度器

## 总结

嗯，heap3就是这么简单

而这里malloc使用的空间，就是之前启动文件分析的里设定的空间大小。

## Quote

> heap_3.c
> 
> http://blog.csdn.net/zhzht19861011/article/details/50248421
> 
> http://blog.csdn.net/zhzht19861011/article/details/51606068