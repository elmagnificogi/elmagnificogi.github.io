---
layout:     post
title:      "树莓派启动那些事（四）"
subtitle:   "boot，启动，ARM，虚拟文件系统"
date:       2015-11-09
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.jpg"
tags:
    - RaspberryPi
---


## 环境

system：2015-09-24-raspbian-jessie

RaspberryPi：Raspberry Pi 2

## 树莓派启动的相关问题

树莓派启动的相关问题，会从config.txt一直介绍到linux如何启动，启动流程分析，自启动脚本实现。

要想理解树莓派系统的运行机制，得先来看看树莓派是如何启动的

## boot

树莓派的boot及其他github

> https://github.com/raspberrypi

### 树莓派的boot启动过程

	pi@raspberrypi ~ $ ls -a /boot/
	.                       COPYING.linux     LICENSE.oracle
	..                      fixup_cd.dat      overlays
	bcm2708-rpi-b.dtb       fixup.dat         start_cd.elf
	bcm2708-rpi-b-plus.dtb  fixup_db.dat      start_db.elf
	bcm2708-rpi-cm.dtb      fixup_x.dat       start.elf
	bcm2709-rpi-2-b.dtb     issue.txt         start_x.elf
	bootcode.bin            kernel7.img       System Volume Information
	cmdline.txt             kernel.img
	config.txt              LICENCE.broadcom

为了降低成本，树莓派省去了传统计算机用来存储引导加载程序的板载存储器(BIOS), 直接把引导程序放在了SD卡中。

树莓派2具有一款博通的BCM2836系统芯片, 当启动时，ARM Cortex-A7的CPU会处于复位状态,由VideoCore IV GPU核心负责启动系统。（所以大部分boot的启动都是由GPU code来完成，而不是cpu）

- 第一阶段, 从系统芯片中加载第一阶段的启动程序, 这个启动程序负责挂载在SD卡中的FAT32的文件系统，从而让他可以启动第二阶段的boot（bootcode.bin），这部分程序是写死在在芯片中的，所以不能修改。


- 第二阶段bootcode.bin则用来从SD卡上检索GPU固件（start.elf），然后运行它，从而启动GPU


- start.elf启动后，读取存放系统配置的文件config.txt。当config.txt文件被加载解析之后, start.elf会读取cmdline.txt和kernel.img. cmdline.txt包涵内核运行的参数，而kernel.img将会被加载到处理器分配的共享内存中，当内核加载成功，处理器将结束复位状态，内核开始正式运行，系统启动正式开始。


- start.elf除了上面的，也会传递一些额外的参数给内核，比如DMA通道，GPU参数，MAC地址，eMMC时钟速度、内核寻址范围等等



```
 	dma.dmachans=0x7f35
	bcm2708_fb.fbwidth=1280
	bcm2708_fb.fbheight=1024
	bcm2708.boardrev=0xe
	bcm2708.serial=0xd9b35572
	smsc95xx.macaddr=B8:27:EB:B3:55:72
	sdhci-bcm2708.emmc_clock_freq=250000000
	vc_mem.mem_base=0xec00000
	vc_mem.mem_size=0x10000000
	console=ttyAMA0,115200
	kgdboc=ttyAMA0,115200
	console=tty1
	root=/dev/mmcblk0p2
	rootfstype=ext4
	rootwait
```
主流的linux内核可能并没有这些参数

树莓派的官网上也提供引导程程序的精简版本（fixup_cd.dat,start_cd.elf，用于GPU内存只有16MB的时候，会损失部分CPU特性）和测试版本（fixup_x.dat, start_x.elf，这种版本可以使用额外的video codes）

由于这种写死的程序加上从SD卡开始引导，这就让树莓派不会因为软件的原因变成砖头的（除非硬件损坏）

#### GPU bootloaders

目前的GPU软件和固件都是二进制的文件，Raspbian可以通过apt-get来升级，rpi-update也是最简单用来升级的方式，当然最新版本难免少不了一些bug，所以推荐还是使用稳定版本

而目前的树莓派的GPU bootloader是不开源的，所以不是像普通的是由CPU的bootloader来启动

而且由于树莓派的启动核心是VideoCore IV 是属于博通的Broadcom BCM2836 这块芯片是只供树莓派使用的，所以树莓派基本没有假的（想仿冒，但拿不到博通的这块芯片，只好无奈了），也造成了基于树莓派核心显卡的程序是无法移植到其他的芯片上去的。同时由于树莓派的这种启动方式，导致了树莓派不是一个裸机ARM，就会出现了无法像单片机一样直接对树莓派编程，也需要其核心引导之后进入系统才行。

#### 总结

> http://segmentfault.com/a/1190000000465449

文章中作者提到了，树莓派的各种问题，其实总体来说，树莓派在填坑，至少最大的坑屏幕，是在9月份填了的。树莓派不开源，他不是硬件开源，但已经做的非常好了，虽然硬件不开源，但是这维持住了他的生存，而太多的硬件开源往往很快就会被更好更开源的硬件取代了，而树莓派非完全开源则是为它维持了一线生机，让他在硬件开源的竞争中存活到了现在，让他没有仿冒品，没有完全兼容品，保证了社区的人不会因此而有过多的流动，同时也保证了供应商的利益。从树莓派的各种硬件产品来看，树莓派也在搭建一个生态圈，一个只属于树莓派和兼容树莓派硬件/软件的平台，并且由此可以进一步完善教育市场，让树莓派最终能成为一个完善的教育平台，来推广生产。所以总体上来说树莓派是不错的，各项支持都强于其他的开源硬件平台。


### ARM的boot启动流程

对于PC机，其开机后的初始化处理器配置、硬件初始化等操作是由BIOS（Basic Input /Output System）完成的，但对于嵌入式系统来说，出于经济性、价格方面的考虑一般不配置BIOS，启动时用于完成初始化操作的这段代码被称为Bootloader程序，因此整个系统的加载启动任务就完全由Bootloader 来完成。

简单地说，通过这段程序，可以初始化硬件设备、建立内存空间的映射图（有的CPU没有内存映射功能如S3C44B0），从而将系统的软硬件环境设定在一个合适的状态，以便为最终调用操作系统内核、运行用户应用程序准备好正确的环境。

Bootloader依赖于实际的硬件和应用环境，因此要为嵌入式系统建立一个通用、标准的Bootloader是非常困难的。Bootloader也依赖于具体的嵌入式板级设备的配置，这也就是说，对于两块不同的嵌入式主板而言，即使它们是基于同一 CPU 而构建，要想让运行在一块板子上的 Bootloader 程序也能运行在另一块板子上，通常都需要修改 Bootloader 的源程序。

系统加电复位后，几乎所有的 CPU都从由复位地址上取指令。比如，基于 ARM7TDMI内核的CPU在复位时通常都从地址 0x00000000处取它的第一条指令。而以微处理器为核心的嵌入式系统通常都有某种类型的固态存储设备（比如EEPROM、FLASH等）被映射到这个预先设置好的地址上。因此在系统加电复位后，处理器将首先执行存放在复位地址处的程序。通过集成开发环境可以将Bootloader定位在复位地址开始的存储空间内，因此Bootloader是系统加电后、操作系统内核或用户应用程序运行之前，首先必须运行的一段程序代码。对于嵌入式系统来说，有的使用操作系统，也有的不使用操作系统，比如功能简单仅包括应用程序的系统，但在系统启动时都必须执行Bootloader，为系统运行准备好软硬件运行环境。

#### 系统的启动方式

系统的启动通常有两种方式

- 一种是可以直接从Flash启动（Nor Flash）

- 另一种是可以将压缩的内存映像文件从Flash（为节省Flash资源、提高速度）中复制、解压到RAM，再从RAM启动。(Nand Flash)

#### 启动代码

当电源打开时，一般的系统会去执行ROM（应用较多的是Flash）里面的启动代码。这些代码是用汇编语言编写的，其主要作用在于初始化CPU和板上的必备硬件如内存、中断控制器等。有时候用户还必须根据自己板子的硬件资源情况做适当的调整与修改。

系统启动代码完成基本软硬件环境初始化后，对于有操作系统的情况下，启动操作系统、启动内存管理、任务调度、加载驱动程序等，最后执行应用程序或等待用户命令；对于没有操作系统的系统直接执行应用程序或等待用户命令。

启动代码是用来初始化电路以及用来为高级语言写的软件做好运行前准备的一小段汇编语言，在商业实时操作系统中，启动代码部分一般被称为板级支持包，英文缩写为BSP。它的主要功能就是：电路初始化和为高级语言编写的软件运行做准备。

系统启动主要的过程如下：


1. 启动代码的第一步是设置中断和异常向量。


2. 完成系统启动所必须的最小配置，某些处理器芯片包含一个或几个全局寄存器，这些寄存器必须在系统启动的最初进行配置。


3. 设置看门狗，用户设计的部分外围电路如果必须在系统启动时初始化，就可以放在这一步。


4. 配置系统所使用的存储器，包括Flash，SRAM和DRAM等，并为他们分配地址空间。如果系统使用了DRAM或其它外设，就需要设置相关的寄存器，以确定其刷新频率，数据总线宽度等信息，初始化存储器系统。有些芯片可通过寄存器编程初始化存储器系统，而对于较复杂系统通常集成有MMU来管理内存空间。


5. 为处理器的每个工作模式设置栈指针，ARM处理器有多种工作模式，每种工作模式都需要设置单独的栈空间。


6. 变量初始化，这里的变量指的是在软件中定义的已经赋好初值的全局变量，启动过程中需要将这部分变量从只读区域，也就是Flash拷贝到读写区域(SRAM)中，因为这部分变量的值在软件运行时有可能重新赋值。还有一种变量不需要处理，就是已经赋好初值的静态全局变量，这部分变量在软件运行过程中不会改变，因此可以直接固化在只读的Flash或EEPROM中。


7. 数据区准备，对于软件中所有未赋初值的全局变量，启动过程中需要将这部分变量所在区域全部清零。


8. 最后一步是调用高级语言入口函数，比如main函数等。

启动过程中的初始化程序就是初始化CPU内部各个关键的寄存器、配置外围硬件电路相关寄存器、建立中断向量表等，然后跳转到一般由高级语言编写的主函数的应用程序代码去执行，对外围非boot启动的设备进一步初始化，这样就可以利用高级语言来编写完成系统设计所要求的各种功能。

#### 总结

初始化的过程对大多数初学者来说，比较难理解的是中断的处理和一些少见的操作符号，这些符号多是一些宏定义或系统用于在内存空间中对各个段的定位标识符号。

日后如果有机会，会在这里增加一份启动代码的分析。

### x86的boot启动流程

x86构架下一般都会有BIOS与CMOS，CMOS是记录各项硬件参数且嵌入在主板上面的储存器，BIOS则是一个写入到主板上的一个软件程序。这个BIOS就是在启动的时候，计算机系统会主动运行的第一个程序了！

BIOS叫做"基本输入输出系統"（Basic Input/Output System），简称为BIOS（而实际上现在的BIOS并非是固化的，经常可以听到修电脑什么的，会说刷BIOS，其实BIOS在现在的系统中已经是可以读写的，只是一般来说修改BIOS并不能带来什么特别的好处，微星和华硕的高级一些的主板目前都有自动更新BIOS的功能，主要是控制和管理一些额外的接口：比如水冷、风冷、超频、灯光等等的控制接口而已）。

启动后BIOS程序首先检查，计算机硬件能否满足运行的基本条件，这叫做"硬件自检"（Power-On Self-Test），缩写为POST（对于刚配好的机器，第一次需要硬件自检，在稳定后，不变更机器硬件的情况下，是可以关闭硬件自检的，更新硬件的时候再开启自检就可以了）。

之后会去分析计算机里面有哪些储存设备，BIOS会依据使用者的配置去读取得能够启动的硬盘， 并且到该硬盘里面去读取第一个磁区的MBR位置。 MBR这个仅有446 bytes的硬盘容量里面会放置最基本的启动管理程序， 接下来就是MBR内的启动管理程序的工作了。

这个启动管理程序的目的是在加载(load)核心文件， 由于启动管理程序是操作系统在安装的时候所提供的，所以他会认识硬盘内的文件系统格式，因此就能够读取核心文件， 然后接下来就是核心文件的工作。

简单的说，整个启动流程到操作系统之前的动作应该是这样的：

- BIOS：启动主动运行的程序，会认识第一个可启动的装置；


- MBR：第一个可启动装置的第一个磁区内的主要启动记录区块，内含启动管理程序；


- 启动管理程序(boot loader)：一支可读取核心文件来运行的软件；


- 核心文件：开始操作系统的功能...


由上面的说明我们会知道，BIOS与MBR都是硬件本身会支持的功能，至於Bootloader则是操作系统安装在MBR上面的一套软件了。由於MBR仅有446 bytes而已，因此这个启动管理程序是非常小而美的。 这个bootloader的主要任务有底下这些项目：

- 提供菜单：使用者可以选择不同的启动项目，这也是多重启动的重要功能！


- 加载核心文件：直接指向可启动的程序区段来开始操作系统；


- 转交其他loader：将启动管理功能转交给其他loader负责。


第三点表示你的计算机系统里面可能具有两个以上的启动管理程序呢！ 我们的硬盘只有一个MBR，但是启动管理程序除了可以安装在MBR之外， 还可以安装在每个分割槽的启动磁区(boot sector)

#### 多系统启动

我们举一个例子来说，假设你的个人计算机只有一个硬盘，里面切成四个分割槽，其中第一、二分割槽分别安装了Windows及Linux， 你要如何在启动的时候选择用Windows还是Linux启动呢？假设MBR内安装的是可同时认识Windows/Linux操作系统的启动管理程序

- 每个分割槽都拥有自己的启动磁区(boot sector)


- 系统槽为第一及第二分割槽，


- 实际可启动的核心文件是放置到各分割槽内的！


- loader只会认识自己的系统槽内的可启动核心文件，以及其他loader而已；


- loader可直接指向或者是间接将管理权转交给另一个管理程序。

MBR的启动管理程序提供两个菜单，菜单一(M1)可以直接加载Windows的核心文件来启动； 菜单二(M2)则是将启动管理工作交给第二个分割槽的启动磁区(boot sector)。当使用者在启动的时候选择菜单二时， 那么整个启动管理工作就会交给第二分割槽的启动管理程序了。 当第二个启动管理程序启动后，该启动管理程序内仅有一个启动菜单，因此就能够使用Linux的核心文件来启动。

## linux初启动

当bootloader开始读取核心文件后，接下来， Linux 就会将核心解压缩到主内存当中， 并且利用核心的功能，开始测试与驱动各个周边装置，包括储存装置、CPU、网络卡、声卡等等。 此时 Linux 核心会以自己的功能重新侦测一次硬件，而不一定会使用 BIOS 检测到的硬件信息！核心此时才开始接管 BIOS 后的工作，核心文件会被放置到 /boot 里面，并且取名为 /boot/vmlinuz。

	[root@www ~]# ls --format=single-column -F /boot
	config-2.6.18-92.el5      <==此版本核心被编译时选择的功能与模块配置档
	grub/                     <==就是启动管理程序 grub 相关数据目录
	initrd-2.6.18-92.el5.img  <==虚拟文件系统档！
	System.map-2.6.18-92.el5  <==核心功能放置到内存位址的对应表
	vmlinuz-2.6.18-92.el5     <==就是核心文件啦！最重要者！


此版本的 Linux 核心为 2.6.18-92.el5版本。为了硬件开发商与其他核心功能开发者的便利， 因此 Linux 核心是可以透过动态加载核心模块的，这些核心模块就放置在 /lib/modules/ 目录内。 由于模块在根目录内 (要记得 /lib 不可以与 / 分别放在不同的 partition ！)， 因此在启动的过程中核心必须要挂载根目录，这样才能够读取核心模块提供加载驱动程序的功能。 而且为了担心影响到磁碟内的文件系统，因此启动过程中根目录是以只读的方式来挂载的。

### 虚拟文件系统

一般来说，有些硬件的驱动会被编译成模块，某特通用的会被编译进linux中，成为核心的一部分。 因此 U盘, SATA, SCSI... 等硬盘装置的驱动程序通常都是以模块的方式来存在的。 现在来思考一种情况，假设你的 linux 是安装在 SATA 磁碟上面的，你可以透过 BIOS 的 INT 13 取得 boot loader 与 kernel 文件来启动，然后 kernel 会开始接管系统并且检测硬件及尝试挂载根目录来取得其他的驱动程序。

问题是，核心根本不认识 SATA 硬盘，所以需要加载 SATA 硬盘的驱动程序， 否则根本就无法挂载根目录。但是 SATA 的驱动程序在 /lib/modules 内，无法挂载根目录又怎么读取到 /lib/modules/ 内的驱动程序？在这个情况之下，可以透过虚拟文件系统来处理这个问题。

虚拟文件系统 (Initial RAM Disk) 一般使用的档名为 /boot/initrd ，这个文件的功能是，他也能够透过 bootloader 来加载到内存中， 然后这个文件会被解压缩并且在内存当中模拟成一个根目录， 且此模拟在内存当中的文件系统能够提供一个可运行的程序，透过该程序来加载启动过程中所最需要的核心模块， 通常这些模块就是 U盘, RAID, LVM, SCSI 等文件系统与磁碟介面的驱动程序，等加载完成后， /sbin/init 来开始后续的正常启动流程。

bootloader 可以加载 kernel 与 initrd ，然后在内存中让 initrd 解压缩成为根目录， kernel 就能够藉此加载适当的驱动程序，最终释放虚拟文件系统，并挂载实际的根目录文件系统， 就能够开始后续的正常启动流程。

CentOS 5.x 的 initrd 文件内容

	# 1. 先将 /boot/initrd 复制到 /tmp/initrd 目录中，等待解压缩：
	[root@www ~]# mkdir /tmp/initrd
	[root@www ~]# cp /boot/initrd-2.6.18-92.el5.img /tmp/initrd/
	[root@www ~]# cd /tmp/initrd
	[root@www initrd]# file initrd-2.6.18-92.el5.img
	initrd-2.6.18-92.el5.img: gzip compressed data, ...
	# 原来是 gzip 的压缩档！因为是 gzip ，所以扩展名给他改成 .gz 吧！

	# 2. 将上述的文件解压缩：
	[root@www initrd]# mv initrd-2.6.18-92.el5.img initrd-2.6.18-92.el5.gz
	[root@www initrd]# gzip -d initrd-2.6.18-92.el5.gz
	[root@www initrd]# file initrd-2.6.18-92.el5
	initrd-2.6.18-92.el5: ASCII cpio archive (SVR4 with no CRC)
	#  cpio 的命令压缩成的文件，解压缩看看！

	# 3. 用 cpio 解压缩
	[root@www initrd]# cpio -ivcdu < initrd-2.6.18-92.el5
	[root@www initrd]# ll
	drwx------ 2 root root    4096 Apr 10 02:05 bin
	drwx------ 3 root root    4096 Apr 10 02:05 dev
	drwx------ 2 root root    4096 Apr 10 02:05 etc
	-rwx------ 1 root root    1888 Apr 10 02:05 init
	-rw------- 1 root root 5408768 Apr 10 02:00 initrd-2.6.18-92.el5
	drwx------ 3 root root    4096 Apr 10 02:05 lib
	drwx------ 2 root root    4096 Apr 10 02:05 proc
	lrwxrwxrwx 1 root root       3 Apr 10 02:05 sbin -> bin
	drwx------ 2 root root    4096 Apr 10 02:05 sys
	drwx------ 2 root root    4096 Apr 10 02:05 sysroot
	# 看！是否很像根目录！尤其也是有 init 这个运行档！务必看一下权限！
	# 接下来看看 init 这个文件内有啥咚咚？

	# 4. 观察 init 文件内较重要的运行项目
	[root@www initrd]# cat init
	#!/bin/nash                  <==使用类似 bash 的 shell 来运行
	mount -t proc /proc /proc    <==挂载内存的虚拟文件系统
	....(中间省略)....
	echo Creating initial device nodes
	mknod /dev/null c 1 3        <==创建系统所需要的各项装置！
	....(中间省略)....
	echo "Loading ehci-hcd.ko module"
	insmod /lib/ehci-hcd.ko      <==加载各项核心模块，就是驱动程序！
	....(中间省略)....
	echo Creating root device.
	mkrootdev -t ext3 -o defaults,ro hdc2 <==尝试挂载根目录啦！
	....(底下省略)....

透过上述运行档的内容，我们可以知道 initrd 有加载模块并且尝试挂载了虚拟文件系统。 接下来就能够顺利的运行啦！那么是否一定需要 initrd 呢？

不一定！需要 initrd 最重要的原因是，当启动时无法挂载根目录的情况下， 此时就一定需要 initrd ，例如你的根目录在特殊的磁碟介面 (U盘, SATA, SCSI) ， 或者是你的文件系统较为特殊 (LVM, RAID) 等等，才会需要 initrd。

如果你的 Linux 是安装在 IDE 介面的磁碟上，并且使用默认的 ext2/ext3 文件系统， 那么不需要 initrd 也能够顺利的启动进入 Linux 的！（实际上是指如果其驱动在核心之中，则不需要initrd可以直接加载驱动进行启动）

在核心完整的加载后，接下来，就是要开始运行系统的第一个程序： /sbin/init。

## The end

大致介绍了一下树莓派，普通ARM结构、以及x86结构的系统启动大致流程，下次将详细介绍linux的启动过程

## Quote

> http://elinux.org/RPi_Software
>
> http://wiki.beyondlogic.org/index.php?title=Understanding_RaspberryPi_Boot_Process
>
> https://www.raspberrypi.org/blog/raspberry-pi-compute-module-new-product/
>
> https://wiki.gentoo.org/wiki/Raspberry_Pi
>
> http://vbird.dic.ksu.edu.tw/linux_basic/0510osloader_1.php#process_1
>
> http://linux.cn/article-3994-1.html
>
> http://www.ruanyifeng.com/blog/2013/08/linux_boot_process.html
>
> http://www.ruanyifeng.com/blog/2013/02/booting.html
