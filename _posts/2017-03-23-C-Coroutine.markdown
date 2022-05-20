---
layout:     post
title:      "协程到底是怎么一回事"
subtitle:   "嵌入式，FreeRTOS，croutine"
date:       2017-03-23
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.jpg"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS    
---


## 线程

线程，有时被称为轻量级进程(Lightweight Process，LWP），是程序执行流的最小单元。

另外，线程是进程中的一个实体，是被系统独立调度和分派的基本单位，线程自己不拥有系统资源，只拥有一点儿在运行中必不可少的资源，但它可与同属一个进程的其它线程共享进程所拥有的全部资源。一个线程可以创建和撤消另一个线程，同一进程中的多个线程之间可以并发执行。由于线程之间的相互制约，致使线程在运行中呈现出间断性。线程也有就绪、阻塞和运行三种基本状态。每一个程序都至少有一个线程，若程序只有一个线程，那就是程序本身。

线程是程序中一个单一的顺序控制流程。进程内一个相对独立的、可调度的执行单元，是系统独立调度和分派CPU的基本单位指运行中的程序的调度单位。在单个程序中同时运行多个线程完成不同的工作，称为多线程。

其实上面的说法基本都是基于操作系统来说的，是操作系统给了线程的定义，是操作系统生出了线程、进程、调度等待概念。

#### 硬件线程

其实最开始的CPU只有单核，单核本质上说，每次只能执行一个指令，这个是没办法同时执行多个指令的。

当然后来为了提高CPU的处理能力，出现了流水线概念，指令不再是同一个时间只能执行一个，而是把一个指令分成了多个阶段。

不同阶段是有并行的可能的，进而提高了处理能力。这个时候已经不能明确的区分指令是不是并行的了，有可能并行，也有可能不并行。

再后来单核的频率基本到了极限，再提升的代价太高了，所以为了继续提高CPU的处理能力，最好的办法自然就是多个核，同时执行指令。

其实这个也是很复杂的问题，因为指令有先后之后，后面的先行了，不代表就能执行正确，所以其实多核也有很复杂的调度算法。

而与核一起发展的自然也有操作系统，操作系统从开始的单线程，也就是一次只能执行一个任务，除非执行完了，才能进入到下一个任务的形式，进化到了进程阶段，这个时候本质上说CPU一次也只能执行一个任务，但是可能是在任务还没执行完的时候就切换到了下一个任务，就这么切换执行，切换执行得完成了好几个任务，看起来好像是并行的，其实也只是宏观的并行，微观里都是单步的，但是就这样已经足够了。

而多核的出现，则是出现了真的并行，这个时候自然也需要操作系统的支持，操作系统总算可以把不同的任务分配给不同的核去做，进而出现了微观上真并行。

## 协程

协程，coroutine，操作系统，任务调度，并不是一下就出来的，而且其对于硬件性能上的过高要求，在开始的时候其实并不可行，对于多数嵌入式来说内存都是十分吃紧的资源，而操作系统中的任务调度大多数都是基于中断和堆栈的。

依靠中断切换任务，切换任务时利用堆栈来保持上一个任务执行的位置，进而下次调用的时候继续上次的位置继续执行。

可以想象每个任务函数都有他自己的局部变量，每一次切换都要保存好该任务执行的状态，各个局部变量的内容，当任务数量非常高的时候，所使用的堆栈空间会越来越多，所以对于内存有限的嵌入式系统来说，这其实很不友好，除了要保存内容，每次恢复任务的时候CPU还需要把这些变量都恢复回去，这无形中增加了很多CPU的负担，对于实时性要求高的，自然延迟就高了，更加不适用了。

那么为了解决这个问题，自然生出了有什么可以不利用或者说少利用堆栈来保存变量的方法。这个方法自然就是协程。

#### 协程的本质
```c
int function(void)
{   
    static int i, state = 0;
    switch (state)
    {    
        case 0:
        for (i = 0; i < 10; i++)
        {      
            state = 1;
            return i;             
            case 1:;
        }   
    }
}
```

这段代码基本就能解释为什么协程可以不用或者少用堆栈，因为对于不同的任务来说他们都是共享了一个堆栈.

这段代码有一点难理解，先看 i 和 state 是静态变量。

第一次进入的时候，switch进入了 case 0 ，然后for循环执行了一次之后就返回了，state被改变了。

下次再进入这个函数的时候，进入了 case 1 ，由于case 1还在for循环之内，所以还会执行一次for循环，返回 i=2

这个函数每次进行切换的时候都可以保存上下文，而开销是两个静态变量，这就是协程，协程的上下文切换，不需要堆栈参与。

而这只是一个小例子，下面的就开始利用宏来完成一定程度封装。

```c
#define Begin() static int state=0; switch(state) { case 0:
#define Yield(x)
do { state=__LINE__; return x; case __LINE__:; } while (0)
#define End() }
int function(void)
{   
    static int i;   
    Begin();   
    for (i = 0; i < 10; i++)     
    Yield(i);   
    End();
}
```
这里的代码展开以后基本就是上面的代码了。

协程只是利用了语言其自身的语法就完成了调度。

实际上我们利用了 switch-case 的分支跳转特性，以及预编译的 __LINE__ 宏，实现了一种隐式状态机，最终实现了“yield 语义”。

但是, 这就使得代码不具备可重入性和多线程应用,因为static是不可重入的,所以使用协程和多线程要注意,不能再两个任务中同时使用一个协程

其实之前对于FreeRTOS中的协程分析其实漏掉了最关键的部分，就是这个switch结构，他们都在 croutine.h 中

#### FreeRTOS 中的协程结构

```c
#define crSTART( pxCRCB ) switch( ( ( CRCB_t * )( pxCRCB ) )->uxState ) { case 0:

#define crSET_STATE0( xHandle ) ( ( CRCB_t * )( xHandle ) )->uxState = (__LINE__ * 2); return; case (__LINE__ * 2):

#define crSET_STATE1( xHandle ) ( ( CRCB_t * )( xHandle ) )->uxState = ((__LINE__ * 2)+1); return; case ((__LINE__ * 2)+1):

#define crDELAY( xHandle, xTicksToDelay )												\
    if( ( xTicksToDelay ) > 0 )															\
    {																					\
    	vCoRoutineAddToDelayedList( ( xTicksToDelay ), NULL );							\
    }																					\
    crSET_STATE0( ( xHandle ) );
#define crEND() }

void vFlashCoRoutine( CoRoutineHandle_t xHandle, UBaseType_t uxIndex )
{
// Variables in co-routines must be declared static if they must maintain value across a blocking call.
// This may not be necessary for const variables.
static const char cLedToFlash[ 2 ] = { 5, 6 };
static const TickType_t uxFlashRates[ 2 ] = { 200, 400 };

    // Must start every co-routine with a call to crSTART();
    crSTART( xHandle );

    for( ;; )
    {
        // This co-routine just delays for a fixed period, then toggles
        // an LED.  Two co-routines are created using this function, so
        // the uxIndex parameter is used to tell the co-routine which
        // LED to flash and how int32_t to delay.  This assumes xQueue has
        // already been created.
        vParTestToggleLED( cLedToFlash[ uxIndex ] );
        crDELAY( xHandle, uxFlashRates[ uxIndex ] );
    }

    // Must end every co-routine with a call to crEND();
    crEND();
}
```
其基础和上面介绍的协程本质很类似，当然也有很多细节地方不同。

croutine 进行多任务切换的唯一的方法就是调用 crDELAY ，这里宏展开后
是 switch 的一个 case ，并且会把 xHandle 的状态更新，这样当该任务重新调度后，
可以通过 case 跳转到这里，这就是 croutine 能模拟多任务切换的核心，本质上是
任务函数的重新调用，这也是为什么参数不能用局部变量保存的原因。


## Quote

> http://www.cnblogs.com/dengxiaojun/p/4385357.html
>
> https://www.zhihu.com/question/20511233
>
> http://blog.csdn.net/zhzht19861011/article/details/50312443
>
> http://www.cnblogs.com/adinosaur/p/5889014.html
>
> http://www.chiark.greenend.org.uk/~sgtatham/coroutines.html
