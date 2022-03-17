---
layout:     post
title:      "使用SEGGER Embedded Studio开发STM32"
subtitle:   "STM32，IDE"
date:       2022-03-16
update:     2022-03-17
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
tags:
    - Embedded
---

## Foreword

简单体验一下SES的嵌入式开发环境



## SEGGER Embedded Studio

> https://www.segger.com/products/development-tools/embedded-studio/

简称：SES



## 安装

> https://www.segger.com/downloads/embedded-studio

直接下载安装，个人免费使用

安装完成之后，秒启动，速度特别快

![image-20220316162738954](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161627049.png)



## 激活

这个对话框只有第一次启动或者重新打开的时候才会显示，软件内找不到启动的按钮

![image-20220316195551438](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161955487.png)

以前版本还需要你去申请一下免费的License，现在版本不需要了，但是呢，你随便创建一个工程就会提示你需要PRO级别的License，

感觉被坑了，虽然说是免费License。

![image-20220316195914330](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161959365.png)

这里直接Continue就行了，不影响后续使用



## 使用

新建项目之前，最好先安装一下对应的板级支持包。

![image-20220317122028277](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203171220384.png)

![image-20220317122121592](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203171221654.png)

最好也能代理一下，不然速度也很慢。

![image-20220316170005780](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161700828.png)



## 创建项目

创建一个新项目

![image-20220316163027936](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161630977.png)

选择ST评估版(**后来发现其实不应该使用评估板的，评估板的工程模板是非常老的，有些东西和最新版已经不同了，仅仅是个能编译能用的级别而已，建议还是使用下面的基于CPU的创建方式**)

![image-20220317123648129](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203171236178.png)

由于是评估板，所以芯片类型是固定的，不用需要选择，只用选文件就行了。

![image-20220317123713170](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203171237209.png)

然后就得到了预设工程

![image-20220317123811783](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203171238875.png)

第一次编译可能会报错，出现这个错误，是因为没有重启，重启一下电脑，环境变量应用上，这里编译就不会报错了

```
Error starting process $(ARMGCCDIR)/arm-none-eabi-gcc
```

![image-20220316164853770](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161648799.png)



紧接着还可能报错，当前**版本V6.20a**，这个是当前的最新版默认工程模板里多了一个文件，需要手动删除

```
__vfprintf.h: No such file or directory
```

将`SEGGER_RTT_Syscalls_SES.c `文件移除出工程，然后重新编译，就正常了

![image-20220317123920345](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203171239377.png)



## 快捷键修改

首先Ctrl+左键跳转定义，这个必须要有

Tools –> Options –> Text Editor，然后将对应的修改

![image-20220317125643581](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203171256638.png)

然后前后跳转的快捷键，是Alt+Left或者Alt+Right，但是本身也支持Back和Forward，但是实际上鼠标的侧键，并不能跳转，这个比较难受。从我测试来看，他本身IDE是不支持捕获鼠标侧键的，所以Back和Forward就基本不可能实现了

这个问题我已经向官方提出来了，只是不知道啥时候能回复解决一下。



## 分析

![image-20220317125643581](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203171344491.png)

可以看到.s文件和Vectors.都存在，启动流程是没隐藏的，但是内存的分配文件竟然找不到了。

点到配置里去看Linker，看到如下结果

![image-20220317134711083](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203171347156.png)

他是存储在`STM32H743ZI_MemoryMap.xml`文件中的，内容如下

```xml
<!DOCTYPE Board_Memory_Definition_File>
<root name="STM32H743ZI">
  <MemorySegment name="FLASH" start="0x08000000" size="0x00200000" access="ReadOnly" />
  <MemorySegment name="RAM2" start="0x20000000" size="0x00020000" access="Read/Write" />
  <MemorySegment name="RAM" start="0x24000000" size="0x00080000" access="Read/Write" />
</root>

```

也就是说他这里通过这种方式来定义，内存块，再看看哪里调用了对应的变量。但是这个xml是怎么联系进去的呢

通过同目录下的`flash_placement.xml`，可以看到他这里的大概含义是什么

```xml
<!DOCTYPE Linker_Placement_File>
<Root name="Flash Section Placement">
  <MemorySegment name="$(FLASH_NAME:FLASH)">
    <ProgramSection alignment="0x100" load="Yes" name=".vectors" start="$(FLASH_START:)" />
    <ProgramSection alignment="4" load="Yes" name=".init" />
    <ProgramSection alignment="4" load="Yes" name=".init_rodata" />
    <ProgramSection alignment="4" load="Yes" name=".text" />
    <ProgramSection alignment="4" load="Yes" name=".os" />
    <ProgramSection alignment="4" load="Yes" name=".dtors" />
    <ProgramSection alignment="4" load="Yes" name=".ctors" />
    <ProgramSection alignment="4" load="Yes" name=".rodata" />
    <ProgramSection alignment="4" load="Yes" name=".ARM.exidx" address_symbol="__exidx_start" end_symbol="__exidx_end" />
    <ProgramSection alignment="4" load="Yes" runin=".fast_run" name=".fast" />
    <ProgramSection alignment="4" load="Yes" runin=".data_run" name=".data" />
    <ProgramSection alignment="4" load="Yes" runin=".tdata_run" name=".tdata" />
  </MemorySegment>
  <MemorySegment name="$(RAM_NAME:RAM);SRAM">
    <ProgramSection alignment="0x100" load="No" name=".vectors_ram" start="$(RAM_START:$(SRAM_START:))" />
    <ProgramSection alignment="4" load="No" name=".fast_run" />
    <ProgramSection alignment="4" load="No" name=".data_run" />
    <ProgramSection alignment="4" load="No" name=".bss" />
    <ProgramSection alignment="4" load="No" name=".tbss" />
    <ProgramSection alignment="4" load="No" name=".tdata_run" />
    <ProgramSection alignment="4" load="No" name=".non_init" />
    <ProgramSection alignment="4" size="__HEAPSIZE__" load="No" name=".heap" />
    <ProgramSection alignment="8" size="__STACKSIZE__" load="No" place_from_segment_end="Yes" name=".stack" />
    <ProgramSection alignment="8" size="__STACKSIZE_PROCESS__" load="No" name=".stack_process" />
  </MemorySegment>
  <MemorySegment name="$(FLASH2_NAME:FLASH2)">
    <ProgramSection alignment="4" load="Yes" name=".text2" />
    <ProgramSection alignment="4" load="Yes" name=".rodata2" />
    <ProgramSection alignment="4" load="Yes" runin=".data2_run" name=".data2" />
  </MemorySegment>
  <MemorySegment name="$(RAM2_NAME:RAM2)">
    <ProgramSection alignment="4" load="No" name=".data2_run" />
    <ProgramSection alignment="4" load="No" name=".bss2" />
    <ProgramSection alignment="4" load="No" name=".non_init2" />
  </MemorySegment>
</Root>
```

通过这里的说明

> https://studio.segger.com/index.htm?https://studio.segger.com/ide_memory_map_file_format.htm

再结合`STM32H743_Registers.xml`，基本就可以确定，这个应该是平常的svd文件的变体。

由于评估板中缺少了icf文件，这里结合基于cpu创建的工程，看`STM32H7xx_Flash_Variant5.icf`中的定义，就把上面的东西都联系到一起了

```assembly
// Combined regions per memory type
//
define region FLASH = FLASH1 + FLASH2;
define region RAM   = AXI_RAM1 + RAM1 + RAM2;

//
// Block definitions
//
define block vectors                        { section .vectors };                                   // Vector table section
define block vectors_ram                    { section .vectors_ram };                               // Vector table section
define block ctors                          { section .ctors,     section .ctors.*, block with         alphabetical order { init_array } };
define block dtors                          { section .dtors,     section .dtors.*, block with reverse alphabetical order { fini_array } };
define block exidx                          { section .ARM.exidx, section .ARM.exidx.* };
define block tbss                           { section .tbss,      section .tbss.*  };
define block tdata                          { section .tdata,     section .tdata.* };
define block tls                            { block tbss, block tdata };
define block tdata_load                     { copy of block tdata };
define block heap  with size = __HEAPSIZE__,  alignment = 8, /* fill =0x00, */ readwrite access { };
define block stack with size = __STACKSIZE__, alignment = 8, /* fill =0xCD, */ readwrite access { };
```

这里是将xml中定义的RAM和Flash都联系进来了，之后才能将其给到.s文件中去编译



## Summary

SES整体流畅度上远高于Eclipse等方案、编译速度也非常快，同时支持跨平台，感觉上还是很不错的，虽然国内用的人比较少，但是日后发展应该是会越来越好的。



## Quote

> https://blog.csdn.net/weixin_39303424/article/details/88171231
>
> https://devzone.nordicsemi.com/f/nordic-q-a/85405/nrf5-sdk-17-1-0-examples-is-not-compiling-in-latest-ses-6-20a/357516
>
> http://www.sunyouqun.com/2018/03/ses-usage-tips/
>
> https://www.armbbs.cn/forum.php?mod=viewthread&tid=99721&highlight=Embedded%2BStudio
>
> https://www.cnblogs.com/heyxiaotang/p/5728054.html
>
> https://developer.arm.com/documentation/101754/0616/armlink-Reference/Scatter-loading-Features/Root-region-and-the-initial-entry-point/Methods-of-placing-functions-and-data-at-specific-addresses



