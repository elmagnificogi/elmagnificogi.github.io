---
layout:     post
title:      "使用SEGGER Embedded Studio开发STM32进阶"
subtitle:   "STM32，IDE"
date:       2022-03-18
update:     2022-03-24
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
tags:
    - Embedded
---

## Foreword

主要是有些问题非常隐晦，也没看到啥相关的介绍，大部分文章也都只有一个创建工程的指南，实际使用的时候各种问题比较劝退，所以我自己写一个SES的进阶使用指南。当我进阶越深，越觉得SES问题越多，好想抛弃这玩意啊。



## 参考手册

基本上关于SES的相关内容我都是参考手册或者是论坛的帖子，总结来的

> https://studio.segger.com/index.htm?https://studio.segger.com/home.htm



## 代理

由于SES也是从国外服务器下载，所以最好能开启代理，下载速度会快很多

打开Tools-Options-Environment，可以看到对应的http的代理设置，不需要的话留空就自动不生效了。

![image-20220321102522665](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321102522665.png)



## 目录树

目录树取消大小显示，很多余。打开的文件自动同步展开目录树位置，也有点多余，所以也去掉

![image-20220321155026990](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321155026990.png)



## 配置问题



#### Solution与Project

首先得理解SES一个项目管理的结构，最底层是Solution，然后一个Solution中会有好几个Project。

配置文件的设计，他这里给了Solution若干个配置文件，而Solution本身没有任何实际的工程文件，它相当于是一个父类，Project的配置全都是从Solution中继承来的，在实际操作的时候经常可以看到这个设置会有一个tag提示是inherited的

![image-20220318181250149](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203181812211.png)

从官方的解释来说，Project的所有路径都是相对的，而Solution则是绝对路径，基于继承关系，所以你可以自己弄出来多个Solution的配置，从而可以达到切换路径的效果，进而Project的路径不需要反复修改（当然，具体哪里用得上这种情况，我也不知道）



#### Public与Private

然后对于一个层级中，还有Public和Private的区别

![image-20220318182141212](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203181821240.png)

简单说就是Public 继承 Private Configuration，举个例子，如果一个项目里Private Configuration 就是搞框架的人 第一次配好的，一个相当通用的配置。如果和他的环境相同，基本就可以直接使用Public Configurations继承它，然后直接编译就行了。但是如果你和的环境略有区别，那么就比较适合你自己在Public的配置上略作修改，但是Private的保持原样，同时git也不追踪Public的部分，这样就能兼顾总体和个体。

类似的，比如文件路径就应该在Private里设置，而Public里只是继承一下就行了，有些预定义的宏也应该在Private里定义

同理你可以建立多个编译器的父类，设置好对应的值，然后新建一个public去继承一下，就可以自动将其他编译器的相关设置代入其中了，这样就能快速新建一个独立配置出来。

继承关系可以从Build Configurations中看到

![image-20220323185714648](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220323185714648.png)

比如这里我想让OV3继承到External GNU中的External Build的C Compile Command的配置，我只要修改External GNU就行了，修改以后会自动有一个**modified**标签，然后再切换到OV3 External 中就能看到显示了**inherits**，并且值也保持相同。如果不要继承的话，右键自己修改一下就行了。

- 注意，这个继承经常会出现延迟加载的情况，也就是说你看的时候可能他没加载出来，过一会他又加载上了，稍微有点恶心人



#### Internal和External

![image-20220321145355790](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321145355790.png)

同一个配置之中还有Internal和Extern的区别，其实会造成这个的原样的是导入的问题，如果导入选择了外部GNU，那么就全都是External，同理如果选了内置的，那就是Internal，如果2个都选了，那么就会出现又有内部又有外部的情况，这种就是自动生成的配置，自己改改就行了

![image-20220321111448808](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321111448808.png)



#### 配置显示出错

偶尔会遇到你打开配置，但是看到的配置完全是错的。关闭以后，重新再打开，又是对的情况，这个比较诡异，也没法说，但是确实会发生。



## 编译器问题



#### ARMCC

简单说就是Keil 自带的那一套，就是基于ARMCC的，本身是基于ARM开发的，所以编译后效率和bin大小都要优于其他的方式一点，但是由于之前Keil v5之前的版本实在是太慢了，直接被其他人吊起来打，所以很多人吐槽。

再加上本身这个不开源，而且收费，所以实际看到使用的IDE比较少。

目前最新的Arm Compiler 6，则是切换到了基于LLVM的Clang，整个速度一下子上去了，目前应该是综合最好的。

所以现在说ARMCC一般是指5以前的版本，而现在的6版本基本都叫ARMCLANG了



#### Clang

Clang其实只是一个编译器的前端，只是由于新的编译器前端都是采用Clang，为了和老的分开，经常被通称为Clang



#### LLVM

LLVM则是指编译器的后端，实际上在不同的地方可能指代不同，嵌入式这里某些时候指代的范围类似于Clang，这种基本都属于乱用，把概念搞模糊了。

![Clang LLVM](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/Clang-LLVM.jpg)

随着时代的发展，很多单纯使用GCC的地方都被LLVM替代了，当然嵌入式常常落后一个时代，所以还有很多GCC的使用。



### GCC

本质上用GCC来编译，都是用gcc-arm-none-eabi，然后这个东西版本不同，各自有所修改，标准不够统一，经常遇到各种问题。但是好处是他是开源、免费的，所以很多IDE里可能都有集成他们进来。



#### SES的GCC

先说SES的gcc，可以清楚的看到版本4.2.1

![image-20220323174046580](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220323174046580.png)

实际上文件也就是用的gcc-arm-none-eabi，不但版本非常老，而且还是阉割版的，有很多编外的库文件，直接就没有，或者他内置到其他文件夹去了

![image-20220323171121709](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220323171121709.png)

从SES官方角度来说还是推荐你用SEGGER的编译器，而不是gcc，因为有很多东西没说明白，官方文档没说清楚，而论坛里竟然也搜不到相关的问题。

比如要使用gcc，用C++开发，就会发现怎么弄labc的相关几个库死活都导入不了，如果只是单纯使用C，可能不会遇到这么棘手的问题



#### gcc-arm-none-eabi

官方版本的gcc-arm-none-eabi，外部的库更全一些，而且官方相当于是最标准的那一个，不存在IDE本身遮遮掩掩之类的操作。

如果提前安装了gcc-arm-none-eabi，并且重新启动了SES，那么他会自动识别对应的GNU工具链

> https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads

![image-20220321111448808](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321111448808.png)





## 导入Eclipse工程

SES支持直接导入Eclipse工程或者Keil工程，但是导入Eclipse经常有问题，而且比较难解，这里记录一下常见的问题



#### 排除文件

将目录转换成常规文件夹，只有这样才能使用右键排除编译或者排除文件夹，否则这个目录右键以后没有排除选项

![image-20220321112733672](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321112733672.png)



#### collect2.exe: error: ld returned 1 exit status

出现这个问题，并且前面也没有报错，那么大概率是没有指定ld文件造成的。要么手动指定ld文件，要么就让他使用默认的

```
collect2.exe: error: ld returned 1 exit status
```



#### undefined reference to `_exit'

遇到下面的出错，是因为前面提到的gcc-arm-none-eabi的版本不同，导致ld文件的要求定义的标志缺失了。

```
exit.c:(.text+0x18): undefined reference to `_exit' when using arm-none-eabi-gcc
signalr.c:(.text._kill_r+0xe): undefined reference to `_kill'
```

注意需要在以下编译中都添加

```
--specs=nosys.specs
```

![image-20220323183739883](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220323183739883.png)

添加之后，编译就正常了



## Bug

屮，又遇到了bug，明明使用的是GNU，C和C++混合的，但是没想到他这里的标签直接就出错了

![image-20220321155906054](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321155906054.png)

![image-20220321155938570](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321155938570.png)

> https://forum.segger.com/index.php/Thread/8477-BUG-C-and-C-Language-Standard-upside-down/#post30892

官方目前已经确认了这个bug



## 链接

#### 链接文件

如果是使用SEGGER，那么就是用SEGGER的内置链接文件的格式，也就是icf文件，可以通过生成默认工程查看到对应的配置文件

如果是使用GCC的模式，那么就是用GCC的ld文件，这个ld文件一般在STM32的固件包里就能找到

![image-20220325170947751](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220325170947751.png)

类似于这样的

```
/*
*****************************************************************************
**

**  File        : LinkerScript.ld
**
**  Abstract    : Linker script for STM32F756NGHx Device with
**                1024KByte FLASH, 320KByte RAM
**
**                Set heap size, stack size and stack location according
**                to application requirements.
**
**                Set memory bank area and size if external memory is used.
**
**  Target      : STMicroelectronics STM32
**
**
**  Distribution: The file is distributed as is, without any warranty
**                of any kind.
**
**  (c)Copyright Ac6.
**  You may use this file as-is or modify it according to the needs of your
**  project. Distribution of this file (unmodified or modified) is not
**  permitted. Ac6 permit registered System Workbench for MCU users the
**  rights to distribute the assembled, compiled & linked contents of this
**  file as part of an application binary file, provided that it is built
**  using the System Workbench for MCU toolchain.
**
*****************************************************************************
*/

/* Entry Point */
ENTRY(Reset_Handler)

/* Highest address of the user mode stack */
_estack = 0x20050000;    /* end of RAM */
/* Generate a link error if heap and stack don't fit into RAM */
_Min_Heap_Size = 0x200;      /* required amount of heap  */
_Min_Stack_Size = 0x400; /* required amount of stack */

/* Specify the memory areas */
MEMORY
{
FLASH (rx)      : ORIGIN = 0x08000000, LENGTH = 1024K
RAM (xrw)      : ORIGIN = 0x20000000, LENGTH = 320K
}

/* Define output sections */
SECTIONS
{
  /* The startup code goes first into FLASH */
  .isr_vector :
  {
    . = ALIGN(4);
    KEEP(*(.isr_vector)) /* Startup code */
    . = ALIGN(4);
  } >FLASH

  /* The program code and other data goes into FLASH */
  .text :
  {
    . = ALIGN(4);
    *(.text)           /* .text sections (code) */
    *(.text*)          /* .text* sections (code) */
    *(.glue_7)         /* glue arm to thumb code */
    *(.glue_7t)        /* glue thumb to arm code */
    *(.eh_frame)

    KEEP (*(.init))
    KEEP (*(.fini))

    . = ALIGN(4);
    _etext = .;        /* define a global symbols at end of code */
  } >FLASH

  /* Constant data goes into FLASH */
  .rodata :
  {
    . = ALIGN(4);
    *(.rodata)         /* .rodata sections (constants, strings, etc.) */
    *(.rodata*)        /* .rodata* sections (constants, strings, etc.) */
    . = ALIGN(4);
  } >FLASH

  .ARM.extab   : { *(.ARM.extab* .gnu.linkonce.armextab.*) } >FLASH
  .ARM : {
    __exidx_start = .;
    *(.ARM.exidx*)
    __exidx_end = .;
  } >FLASH

  .preinit_array     :
  {
    PROVIDE_HIDDEN (__preinit_array_start = .);
    KEEP (*(.preinit_array*))
    PROVIDE_HIDDEN (__preinit_array_end = .);
  } >FLASH
  .init_array :
  {
    PROVIDE_HIDDEN (__init_array_start = .);
    KEEP (*(SORT(.init_array.*)))
    KEEP (*(.init_array*))
    PROVIDE_HIDDEN (__init_array_end = .);
  } >FLASH
  .fini_array :
  {
    PROVIDE_HIDDEN (__fini_array_start = .);
    KEEP (*(SORT(.fini_array.*)))
    KEEP (*(.fini_array*))
    PROVIDE_HIDDEN (__fini_array_end = .);
  } >FLASH

  /* used by the startup to initialize data */
  _sidata = LOADADDR(.data);

  /* Initialized data sections goes into RAM, load LMA copy after code */
  .data : 
  {
    . = ALIGN(4);
    _sdata = .;        /* create a global symbol at data start */
    *(.data)           /* .data sections */
    *(.data*)          /* .data* sections */

    . = ALIGN(4);
    _edata = .;        /* define a global symbol at data end */
  } >RAM AT> FLASH

  
  /* Uninitialized data section */
  . = ALIGN(4);
  .bss :
  {
    /* This is used by the startup in order to initialize the .bss secion */
    _sbss = .;         /* define a global symbol at bss start */
    __bss_start__ = _sbss;
    *(.bss)
    *(.bss*)
    *(COMMON)

    . = ALIGN(4);
    _ebss = .;         /* define a global symbol at bss end */
    __bss_end__ = _ebss;
  } >RAM

  /* User_heap_stack section, used to check that there is enough RAM left */
  ._user_heap_stack :
  {
    . = ALIGN(8);
    PROVIDE ( end = . );
    PROVIDE ( _end = . );
    . = . + _Min_Heap_Size;
    . = . + _Min_Stack_Size;
    . = ALIGN(8);
  } >RAM

  

  /* Remove information from the standard libraries */
  /DISCARD/ :
  {
    libc.a ( * )
    libm.a ( * )
    libgcc.a ( * )
  }

  .ARM.attributes 0 : { *(.ARM.attributes) }
}

```

#### 内存映射

一般内存映射文件都在SEGGER Embedded Studio 的目录下，当然你要安装了对应的固件包

```
C:\Users\你的用户名\AppData\Local\SEGGER\SEGGER Embedded Studio\v3\packages\STM32H7xx\XML
```

一般类似于这样，有了这个以后，编译才能看到对应的内存和flash各使用了多少

```xml
<!DOCTYPE Board_Memory_Definition_File>
<root name="STM32H742AGIx">
  <MemorySegment name="ITCM_RAM1" start="0x00000000" size="0x00010000" access="Read/Write" />
  <MemorySegment name="FLASH1" start="0x08000000" size="0x00080000" access="ReadOnly" />
  <MemorySegment name="FLASH2" start="0x08100000" size="0x00080000" access="ReadOnly" />
  <MemorySegment name="DTCM_RAM1" start="0x20000000" size="0x00020000" access="Read/Write" />
  <MemorySegment name="AXI_RAM1" start="0x24000000" size="0x00060000" access="Read/Write" />
  <MemorySegment name="RAM1" start="0x30000000" size="0x00008000" access="Read/Write" />
  <MemorySegment name="RAM2" start="0x30020000" size="0x00004000" access="Read/Write" />
  <MemorySegment name="RAM3" start="0x38000000" size="0x00010000" access="Read/Write" />
  <MemorySegment name="Backup_RAM1" start="0x38800000" size="0x00001000" access="Read/Write" />
</root>

```

![image-20220325171316135](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220325171316135.png)

但是由于这个是静态的，带操作系统的部分自然就看不到了，需要结合操作系统实时看了。



## 编译生成

### 编译加入git commit 信息

#### makefile.init

先说一下以前的解决方案，以前是通过在`makefile.init`中，加入了git的命令，然后获取到了commit信息，作为一个宏，代入编译。

```
-std=gnu++11 -fabi-version=0 --specs=nosys.specs -Wno-builtin-declaration-mismatch -DGIT_COMMIT_ID="\"v2.6.32-cbc2cd05\"" -MMD -MP -MF
```

这样的好处是什么，是编译以后产生的固件中自动就带有这个`v2.6.32-cbc2cd05`的信息了，编译以后git中不会出现说还有文件修改的记录。commit信息直接生成在bin中，而没有对工程修改。事后找的时候也方便。

但是困难的点就在于SES不支持你使用makefile.init，然后好像也不能自定义全局环境变量，并且变量的值从命令中获取，所以这种方案就无法执行了。下面的帖子里想法和我一样，但是SES做不到啊。

> https://forum.segger.com/index.php/Thread/7288-SOLVED-Automatic-versioning-with-preprocessor-macros/?postID=26756&highlight=git#post26756



#### prebuild sh脚本

还有一种方案，那就是增加一个头文件，在编译前自动生成这个头文件，并且头文件中包含有git commit信息即可。可以参考下面的工程

> https://gitlab.com/Krzyzanowski_Pawel/GIT_dependent_welcome_header/-/tree/master/

主要是通过执行这个sh脚本来生成的头文件信息，不过要注意一下原code的脚本稍微有点问题，我修改了一下（第一条命令无法执行）

```sh
#!/bin/bash
git rev-parse HEAD | awk ' BEGIN {print "#include \"version.h\"\n//File generated by automatically. Any manual change will be rewritten\n"} {print "const char * build_git_sha = \""$0"\";\n"} END {}' > ../../../version.c
git log -1 | grep Author | awk 'BEGIN {} {print "const char * build_git_author= \""$0"\";\n"} END {} ' >> ../../../version.c

```

实际产生的头文件

```c
#include "version.h"

//File generated by automatically. Any manual change will be rewritten
const char * build_git_sha = "c01b8d877bbdd06b057e15414d4edb8d9104d1b1";
const char * build_git_author= "Author: Pawel Krzyzanowski <pl.krzyzanowski@gmail.com>";
```

这种方式的问题在于，首先你能执行sh，如果windows这边相当于是说你得有shell环境，至少你得装个git，并且加入了全局环境路径中，可以调用。

其次，你每次编译完以后，还会出现一个文件变更，就是`version.h`，而你要么直接无视这个文件，要么就得再commit一次，就有点多余，没有前面通过makefile的方式优雅。

以上是基于可以直接调用sh的方式，还有一种是bat的方式，这种就不需要修改什么环境变量，是个人都能用，我也放在下面，类似的调用生成version.c

```bat
for /F %%i in ('git describe --tags --always --abbrev^=0 HEAD') do (set tagid=%%i)
echo %tagid%
set num=%tagid:~-3%
echo #include "version.h" > ./version.c
echo.>> ./version.c
echo //File generated by automatically. Any manual change will be rewritten >> ./version.c
echo.>> ./version.c
echo const char * g_firmware_id = "test.x.%num%"; >> ./version.c
echo.>> ./version.c
```



### 生成bin

默认是生成hex的，不过我这边一直用bin，所以修改一下生成bin文件，然后将这个bin文件对应重命名，这里结合了上面的commit进行重命名

```sh
"$(ToolChainDir)/arm-none-eabi-objcopy" -O binary "$(ProjectDir)/$(RelTargetPath)" "$(ProjectDir)/test.bin" && $(ProjectDir)/rename.bat $(ProjectDir)
```



下面是`rename.bat`，直接重命名为与tag相关的名称

```bat
@echo off
:: echo %1%
for /F %%i in ('git describe --tags --always --abbrev^=0 HEAD') do (set tagid=%%i)
:: echo %tagid%
set "path=%1%
set "path=%path:/=\%"
:: echo %path%
@echo on
del %path%\test(%tagid%).bin /q
ren %path%\test.bin test(%tagid%).bin
```



## 宏

SES支持一些宏定义，可能有的项目需要，可以直接用

> https://studio.segger.com/index.htm?https://studio.segger.com/ide_build_macros_help.htm

![image-20220324155607174](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203241556262.png)

一种是system一种是build，都可以直接利用。

还有一种是自定义的，但是这个值都是相当于是个text，没办法给你执行脚本之类的东西。



## debug

#### Restricted memory range

debug的时候，有可能你看变量显示的是 `Restricted memory range` 看不到具体值是多少，因为这部分变量要么是动态申请的，要么是某些内部寄存器的值，直接不给你看，工程的默认选项是只显示默认的本地变量或者是在已知内存范围内的变量。但是可以通过打开`Restricted memory range`来强行看到。

> https://forum.segger.com/index.php/Thread/5797-SOLVED-Restricted-memory-range-in-watch-window/

![image-20220325160814900](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220325160814900.png)



## Summary

差不多把可能遇到的问题都解决了，整个自动化的流程总算是好了点。



## Quote

> https://studio.segger.com/index.htm?https://studio.segger.com/home.htm
>
> https://www.armbbs.cn/forum.php?mod=forumdisplay&fid=28
>
> https://blog.csdn.net/zhengyangliu123/article/details/54783443
>
> https://blog.csdn.net/ZCShouCSDN/article/details/89553323
>
> https://www.armbbs.cn/forum.php?mod=viewthread&tid=93102&highlight=%B1%C8%BD%CF
>
> https://blog.csdn.net/xhhjin/article/details/81164076
>
> https://www.cnblogs.com/god-of-death/p/14717055.html
>
> https://www.cnblogs.com/dylancao/p/10329407.html
>
> https://devzone.nordicsemi.com/f/nordic-q-a/36692/segger-embedded-studio---makefile-alternatives-git-into-a-code-integration

