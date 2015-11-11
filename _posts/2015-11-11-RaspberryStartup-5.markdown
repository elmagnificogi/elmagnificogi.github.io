---
layout:     post
title:      "树莓派启动那些事（五）"
subtitle:   "linux启动，init，systemd，"
date:       2015-11-08
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.png"
tags:
    - 树莓派
    - RaspberrryPi
---


## 环境

system：2015-09-24-raspbian-jessie

RaspberryPi：Raspberry Pi 2

## 树莓派启动的相关问题

树莓派启动的相关问题，会从config.txt一直介绍到linux如何启动，启动流程分析，自启动脚本实现。

linux的启动分析

## linux内核启动

### 前言

由于raspbian是基于debian，那么其系统内核启动流程也是一样的。

一般来说Debian与其它的Linux发行版一样，系统启动主要分三个阶段，第一个阶段是BIOS启动阶段，第二个阶段是kernel启动阶段，第三个阶段是init初始化系统阶段。当电脑加电启动时会首先运行主板flash Memory中的程序，主要任务是检测电脑的基础组件，如主板、内存和硬盘等。当基础组件检测完成后，找到引导设备后，电脑就会进入kernel启动阶段。kernel启动阶段通过MBR中的引导程序（LILO or GRUB）把内核映像装入内存运行。Kernel启动阶段完成后，就开始启动系统的第一个进程init，它完成一系统初始化工作，使Linux系统可以正常使用。init进程是Linux系统所有进程的父进程。

1. 加载 BIOS 的硬件资讯与进行自我测试，并依据配置取得第一个可启动的装置；
2. 读取并运行第一个启动装置内 MBR 的 boot Loader (亦即是 grub, spfdisk 等程序)；
3. 依据 boot loader 的配置加载 Kernel ，Kernel 会开始侦测硬件与加载驱动程序；
4. 在硬件驱动成功后，Kernel 会主动呼叫 init 程序，而 init 会取得 run-level 资讯；
5. init 运行 /etc/rc.d/rc.sysinit 文件来准备软件运行的作业环境 (如网络、时区等)；
6. init 运行 run-level 的各个服务之启动 (script 方式)；
7. init 运行 /etc/rc.d/rc.local 文件；
8. init 运行终端机模拟程序 mingetty 来启动 login 程序，最后就等待使用者登陆啦；

### init启动分析

由于树莓派的特殊性，GPU核心直接帮助完成到了第三步，接下来就是 /sbin/init的启动。

/sbin/init是整个系统第一个运行的程序，所以它具有PID的号是一号

/sbin/init 最主要的功能就是准备软件运行的环境，包括系统的主机名称、网络配置、语系处理、文件系统格式及其他服务的启动等。 

而init程序所执行的依据则是根据他的配置文件来进行的（/etc/inittab），然后init会启动/etc/init.d里指定的默认启动级别的所有服务/脚本。所有服务在这里通过init一个一个被初始化。在这个过程里，init每次只启动一个服务，所有服务/守护进程都在后台执行并由init来管理。关机过程差不多是相反的过程，首先init停止所有服务，最后阶段会卸载文件系统。而 inittab 内还有一个很重要的配置项目，那就是默认的 runlevel (启动运行等级) 啦！

#### 运行级别

Run level：运行级别是什么，干什么？

Linux 就是藉由配置 run level 来规定系统使用不同的服务来启动，让 Linux 的使用环境不同。基本上，依据有无网络与有无 X Window 而将 run level 分为 7 个等级，分别是：

- 0 - halt (系统直接关机)
- 1 - single user mode (单人维护模式，只有root shell，用在系统出问题时的维护)
- 2 - Multi-user, without NFS (类似底下的 runlevel 3，但无 NFS 服务)
- 3 - Full multi-user mode (完整含有网络功能的纯文字模式，debian默认的运行等级)
- 4 - unused (系统保留功能)
- 5 - X11 (与 runlevel 3 类似，但加载使用 X Window)
- 6 - reboot (重新启动)

由於 run level 0, 4, 6 不是关机、重新启动就是系统保留的，所以默认的run level并不能使这三个， 否则系统就会不断的自动关机或自动重新启动。那么我们启动时，是通过/etc/inittab取得系统的 run level,实际上debian没有规定像上面这样规定,debian的2-5都是多用户模式，这个要视系统来说，不一定。

#### inittab

init程序的配置文件是/etc/inittab。内容如下：

	# /etc/inittab: init(8) configuration.
	# $Id: inittab,v 1.91 2002/01/25 13:35:21 miquels Exp $
	
	# The default runlevel.
	id:5:initdefault:    #默认的启动级别为5
	
	# Boot-time system configuration/initialization script.
	# This is run first except when booting in emergency (-b) mode.
	si::sysinit:/etc/init.d/rcS    #第一个执行的初始化脚本
	
	# What to do in single-user mode.
	~:S:wait:/sbin/sulogin
	
	# /etc/init.d executes the S and K scripts upon change
	# of runlevel.
	#
	# Runlevel 0 is halt.
	# Runlevel 1 is single-user.
	# Runlevels 2-5 are multi-user.
	# Runlevel 6 is reboot.
	
	l0:0:wait:/etc/init.d/rc 0
	l1:1:wait:/etc/init.d/rc 1
	l2:2:wait:/etc/init.d/rc 2
	l3:3:wait:/etc/init.d/rc 3
	l4:4:wait:/etc/init.d/rc 4
	l5:5:wait:/etc/init.d/rc 5
	l6:6:wait:/etc/init.d/rc 6
	# Normally not reached, but fallthrough in case of emergency.
	z6:6:respawn:/sbin/sulogin
	
	# What to do when CTRL-ALT-DEL is pressed.
	#ca:12345:ctrlaltdel:/sbin/shutdown -t1 -a -r now
	
	# Action on special keypress (ALT-UpArrow).
	#kb::kbrequest:/bin/echo "Keyboard Request--edit /etc/inittab to let this work."
	
	# What to do when the power fails/returns.
	pf::powerwait:/etc/init.d/powerfail start
	pn::powerfailnow:/etc/init.d/powerfail now
	po::powerokwait:/etc/init.d/powerfail stop
	
	# /sbin/getty invocations for the runlevels.
	#
	# The "id" field MUST be the same as the last
	# characters of the device (after "tty").
	#
	# Format:
	#  <id>:<runlevels>:<action>:<process>
	#
	# Note that on most Debian systems tty7 is used by the X Window System,
	# so if you want to add more getty's go ahead but skip tty7 if you run X.
	#
	1:2345:respawn:/sbin/getty 38400 tty1
	2:23:respawn:/sbin/getty 38400 tty2
	#3:23:respawn:/sbin/getty 38400 tty3
	#4:23:respawn:/sbin/getty 38400 tty4
	#5:23:respawn:/sbin/getty 38400 tty5
	#6:23:respawn:/sbin/getty 38400 tty6
	
	# Example how to put a getty on a serial line (for a terminal)
	#
	#T0:23:respawn:/sbin/getty -L ttyS0 9600 vt100
	#T1:23:respawn:/sbin/getty -L ttyS1 9600 vt100
	
	# Example how to put a getty on a modem line.
	#
	#T3:23:respawn:/sbin/mgetty -x0 -s 57600 ttyS3

#####  /etc/init.d/rcS脚本

在这个配置文件中，第一个执行的脚本是/etc/init.d/rcS， 他会在开始加载各项系统服务之前，先配置好系统环境，要想知道到底 CentOS 启动的过程当中进行了什么动作，就得要仔细的分析 /etc/init.d/rcS。

(这个文件的档名在各不同的 distributions 当中都不相同， 例如 SuSE server 9 就使用 /etc/init.d/boot 与 /etc/init.d/rc 来进行的。 所以，你最好还是自行到 /etc/inittab 去察看一下系统的工作）
如果你使用 vim 去查阅过 /etc/init.d/rcS 的话，那么可以发现他主要的工作大抵有这几项：

- 取得网络环境与主机类型：
- 读取网络配置档 /etc/sysconfig/network ，取得主机名称与默认通讯闸 (gateway) 等网络环境。
- 测试与挂载内存装置 /proc 及 U盘 装置 /sys：
- 除挂载内存装置 /proc 之外，还会主动侦测系统上是否具有 usb 的装置， 若有则会主动加载 usb 的驱动程序，并且尝试挂载 usb 的文件系统。
- 决定是否启动 SELinux ：
- 我们在第十七章谈到的 SELinux 在此时进行一些检测， 并且检测是否需要帮所有的文件重新编写标准的 SELinux 类型 (auto relabel)。
- 启动系统的乱数产生器
- 乱数产生器可以帮助系统进行一些口令加密演算的功能，在此需要启动两次乱数产生器。
- 配置终端机 (console) 字形：
- 配置显示於启动过程中的欢迎画面 (text banner)；
- 配置系统时间 (clock) 与时区配置：需读入 /etc/sysconfig/clock 配置值
- 周边设备的侦测与 Plug and Play (PnP) 参数的测试：
- 根据核心在启动时侦测的结果 (/proc/sys/kernel/modprobe ) 开始进行 ide / scsi / 网络 / 音效 - 等周边设备的侦测，以及利用以加载的核心模块进行 PnP 装置的参数测试。
- 使用者自订模块的加载
- 使用者可以在 /etc/sysconfig/modules/*.modules 加入自订的模块，则此时会被加载到系统当中
- 加载核心的相关配置：
- 系统会主动去读取 /etc/sysctl.conf 这个文件的配置值，使核心功能成为我们想要的样子。
- 配置主机名称与初始化电源管理模块 (ACPI)
- 初始化软件磁盘阵列：主要是透过 /etc/mdadm.conf 来配置好的。
- 初始化 LVM 的文件系统功能
- 以 fsck 检验磁碟文件系统：会进行 filesystem check
- 进行磁碟配额 quota 的转换 (非必要)：
- 重新以可读写模式挂载系统磁碟：
- 启动 quota 功能：所以我们不需要自订 quotaon 的动作
- 启动系统虚拟乱数产生器 (pseudo-random)：
- 清除启动过程当中的缓存文件：
- 将启动相关资讯加载 /var/log/dmesg 文件中。

#####  /etc/rcS.d脚本

然后它会执行/etc/rcS.d目录下的所有脚本，/etc/rcS.d目录下的脚本名都以大写字母“S”和一个顺序号开头，它们在系统初始化时都要被执行。如果某个脚本你不想执行，则改成以大写字母“K”开头即可。以”K“开头的脚本会先被执行，它调用了脚本的stop参数，用来关闭一些进程，接着再执行以“S”开头的脚本，它调用了脚本的start参数，用以启动进程。其实/etc/rcS.d目录下的所有脚本都是符号链接，真正执行的脚本存放在/etc/init.d目录下。脚本会按从小到大的顺序执行，以S40开头的脚本执行之后，本地文件系统已加载，网络已启动，所有的驱动程序完成初始化。S60的脚本执行之后，系统时钟已设置，NFS文件系统已加载，文件系统已可用。

执行完系统级的初始化脚本后，init程序会继续执行默认运行级别指定的启动脚本。如指定的默认运行级别是5则会执行/etc/rc5.d目录下的脚本，如果是1则会执行/etc/rc1.d目录下的脚本。/etc/rc5.d目录下的脚本名的命名格式和rcS.d目录下的脚本一样，也是一些以“S”或“K”开头的符号链接。以“S”开头表示启动，以“K”开头的表示禁止。Debian系统定义了从0到6共7个运行级别。每个级别代表意义如下：

- Runlevel 0：关机操作，关闭所有程序，如果内核支持APM，还可以自动关闭主机电源。


- Runlevel 1：单用户模式，提供一个root shell和只读的文件系统，该级别用于进行系统恢复。


- Runlevel 2,3,4,5：多用户模式，由用户自由设定。


- Runlevel 6：与级别0类似，但它不关闭电脑，而是重启电脑。

update-rc.d命令用以维护不同级别下的启动脚本，它会自动在rc?.d目录下创建到/etc/init.d目录中脚本的链接。在运行该命令前，请确保你要添加的启动脚本已位于/etc/init.d目录下。下面是一个update-rc.d命令示例：

	debian:/etc# update-rc.d foo start 99 2 3 4 5 . stop 01 0 1 6 .
	 Adding system startup for /etc/init.d/foo ...
	   /etc/rc0.d/K01foo -> ../init.d/foo
	   /etc/rc1.d/K01foo -> ../init.d/foo
	   /etc/rc6.d/K01foo -> ../init.d/foo
	   /etc/rc2.d/S99foo -> ../init.d/foo
	   /etc/rc3.d/S99foo -> ../init.d/foo
	   /etc/rc4.d/S99foo -> ../init.d/foo
	   /etc/rc5.d/S99foo -> ../init.d/foo

实际上这样设定脚本的运行基本后来被LBS代替了，成为了必须写入脚本的固定格式，就像下面的设置

	 # 1995-2002, 2008 SUSE Linux Products GmbH, Nuernberg, Germany.
	 # All rights reserved.
	 #
	 # Author: Stanislav Brabec, feedback to http://www.suse.de/feedback
	 #
	 ### BEGIN INIT INFO
	 # Provides:          esound
	 # Required-Start:    alsasoun 89d $remote_fs
	 # Should-Start:      $network $portmap
	 # Required-Stop:     alsasound $remote_fs
	 # Should-Stop:       $network $portmap
	 # Default-Start:     5
	 # Default-Stop:
	 # Short-Description: Sound daemon with n etwork support
	 # Description:       Starts esound server to allow remote access to sound
	 #       card. To use esound locally, you do not need to start this
	 #       server on boot. You should edit server settings before
	 #       starting it via sysconfig editor: Network/Sound/Esound
	 ### END INIT INFO

##### /etc/inittab的action

/etc/inittab配置文件有专门的指令控制init进程的运行，指令格式如下：

	id:runlevels:action:command
	id是指令标识，runlevels表示运行级别，action表示执行的时机，command表示执行的命令。如：
	
	l5:5:wait:/etc/init.d/rc 5

其中15是指令标识符，5是运行级别，wait表示进入运行级别时就开始执行”/etc/init.d/rc 5“命令，在执行命令期间，init程序会停下来，直到命令执行完成后init才继续往下执行。

action有很多种，下面分别介绍：

- respawn，启动命令并监视命令的执行，当进程退出时，会再次执行该命令。


- wait，进行指定运行级别时，执行指定的命令，并且init进程会暂停，直到命令执行完成再继续。


- once，进行指定运行级别时，执行一次指定命令。


- boot，命令在系统引导时就被执行，不受运行级别约束。


- bootwait，同上，但init进程会停下来等命令执行完才继续往下执行。


- off，禁用所有运行级别下的某个命令。


- initdefault，指定在系统引导时进入哪个运行级别。


- powerwait，在电源不足时需要运行的命令，init进程会暂停，直到指定的命令完成。


- powerfailnow，同上，但init进程不会暂停。


- powerokwork，电源恢复正常后需运行的命令，init进程暂停，直到命令执行完成。


- ctrlaltdel，在捕获到Ctrl+Alt+Del组合键时执行的命令。


- kbdrequest，把特殊的动作映射到特定的按键上。

##### /etc/rc.d/rc.local脚本

使用者自订启动启动程序 (/etc/rc.d/rc.local)
在完成默认 runlevel 指定的各项服务的启动后，如果我还有其他的动作想要完成时，举例来说， 我还想要寄一封 mail 给某个系统管理帐号，通知他，系统刚刚重新启动完毕，那么是否应该要制作一个 shell script 放置在 /etc/init.d/ 里面，然后再以连结方式连结到 /etc/rc5.d/ 当然不需要！我有任何想要在启动时就进行的工作时，直接将他写入 /etc/rc.d/rc.local ， 那么该工作就会在启动的时候自动被加载而不必等我们登陆系统去启动。一般来说，把自己制作的 shell script 完整档名写入 /etc/rc.d/rc.local ，如此一来，启动就会将我的 shell script 运行。

经过上面的步骤，各项服务都已经启动了，那么就进入到系统的用户登录的部分了

#####Sysini总结

总体来说inittab的启动方式是串行的，单线程，按顺序的，那么带来的问题就是启动的时候非常慢，以及配置服务的时候需要注意前后关系，否则有可能因为缺少依赖服务而无法启动或者是启动出错。

### Sysini V与Systemd

#### inux或unix有两种方式的启动模式：System V和BSD 

最大的不同就是：System V能够为不同的运行级别定义启动哪些服务，比如： 

	# 0 - 停机（千万不要把initdefault设置为0 ） 
	# 1 - 单用户模式 
	# 2 - 多用户，但是没有NFS 
	# 3 - 完全多用户模式（无界面的黑框框） 
	# 4 - 没有用到 
	# 5 - X11（图形界面） 
	# 6 - 重新启动（千万不要把initdefault设置为6 ） 

采用System V的启动模式，可以灵活的定义在 3 的运行级别下开机启动 FTP 服务，而在 5 的运行级别下开机不启动 FTP 服务。 

采用BSD没有运行级别的概念。 

启动脚本的不同： 


- BSD启动方式：在/etc/rc.d和/usr/local/etc/rc.d中存放启动服务的脚本，在/etc/rc.conf中设置xxx_enable="YES"或xxx_enable="NO"随系统启动启动或关闭服务，该文件是/etc/defaults/rc.conf的一个子集。BSD启动方式没有运行级别，简单，但缺乏多样性。 

- System V启动方式：也就是linux采用的启动方式，启动服务的脚本放在/etc/rc.d/init.d下面，你能够在/etc/rc.d目录下面看到很多类似 rc0.d或rc2.d这样的目录，这就是为每个不同的运行级别定义启动哪些服务的目录，数字0 1 2就代表运行级别，进入这些目录，能看到很多链接文件，以S或K开头的这样文件分别表示在当前运行级别下是否开启这个服务，这些文件分别链接到/etc/rc.d/init.d/下面的很多可执行文件。 

需要注意的是：在一些System V启动模式的操作系统上（如 RedHat9），除了有/etc/rc.d/init.d/这个目录，还有/etc/init.d/这个目录，其实 ls -l 一下可以看到，/etc/init.d/这个目录 本来就是链接到/etc/rc.d/init.d/的一个链接目录。 

而debian 8之前使用的是System V的系统，有/etc/init.d/和/etc/rc.local(Debian 没有使用 BSD 风格的 rc.local 文件，官方如是说，也就是rc.local虽然有但是并没有用，所以在这里的自启动应该没用)

以上提到的启动过程有一些不足的地方。而用一种更好的方式来替代传统init的需求已经存在很长时间了。也产生了许多替代方案。其中比较著名的有Upstart，Epoch，Muda和Systemd。而Systemd获得最多关注并被认为是目前最佳的方案。

同时debian 8 后开始使用Systemd，其目的是要取代Unix时代以来一直在使用的init系统，兼容SysV和LSB的启动脚本，而且够在进程启动过程中更有效地引导加载服务。而目前来看systemd将会取代所有linux分支的init，将会统一linux江湖

所以init的启动分析就此终结，开始systemd的启动分析

具体的system v 的启动形式下面的链接介绍的非常详细

> http://www.ibm.com/developerworks/cn/linux/1407_liuming_init1/index.html

#### systemd

开发Systemd的主要目的就是减少系统引导时间和计算开销。Systemd（系统管理守护进程），最开始以GNU GPL协议授权开发，现在已转为使用GNU LGPL协议，它是如今讨论最热烈的引导和服务管理程序。如果你的Linux系统配置为使用Systemd引导程序，它取替传统的SysV init，启动过程将交给systemd处理。Systemd的一个核心功能是它同时支持SysV init的后开机启动脚本。

Systemd引入了并行启动的概念，它会为每个需要启动的守护进程建立一个套接字，这些套接字对于使用它们的进程来说是抽象的，这样它们可以允许不同守护进程之间进行交互。Systemd会创建新进程并为每个进程分配一个控制组（cgroup）。处于不同控制组的进程之间可以通过内核来互相通信。systemd处理开机启动进程的方式非常漂亮，和传统基于init的系统比起来优化了太多。让我们看下Systemd的一些核心功能。

- 和init比起来引导过程简化了很多
- Systemd支持并发引导过程从而可以更快启动
- 通过控制组来追踪进程，而不是PID
- 优化了处理引导过程和服务之间依赖的方式
- 支持系统快照和恢复
- 监控已启动的服务；也支持重启已崩溃服务
- 包含了systemd-login模块用于控制用户登录
- 支持加载和卸载组件
- 低内存使用痕迹以及任务调度能力
- 记录事件的Journald模块和记录系统日志的syslogd模块

Systemd同时也清晰地处理了系统关机过程。它在/usr/lib/systemd/目录下有三个脚本，分别叫systemd-halt.service，systemd-poweroff.service，systemd-reboot.service。这几个脚本会在用户选择关机，重启或待机时执行。在接收到关机事件时，systemd首先卸载所有文件系统并停止所有内存交换设备，断开存储设备，之后停止所有剩下的进程。

#### systemd启动分析

在内核被加载之后，第一次初始化运行的就是

	/bin/systemd

同时他成为了PID 1 的程序

	systemd-analyze blame 可以看到每个启动项花费的时间

由于Systemd向下兼容，所以正常的init.d中的脚本服务等，依然能够正常使用。

##### Systemd 的基本概念

单元的概念

系统初始化需要做的事情非常多。需要启动后台服务，比如启动 SSHD 服务；需要做配置工作，比如挂载文件系统。这个过程中的每一步都被 systemd 抽象为一个配置单元，即 unit。可以认为一个服务是一个配置单元；一个挂载点是一个配置单元；一个交换分区的配置是一个配置单元；等等。systemd 将配置单元归纳为以下一些不同的类型。然而，systemd 正在快速发展，新功能不断增加。所以配置单元类型可能在不久的将来继续增加。

- service ：代表一个后台服务进程，比如 mysqld。这是最常用的一类。
- socket ：此类配置单元封装系统和互联网中的一个 套接字 。当下，systemd 支持流式、数据报和连续包的 AF_INET、AF_INET6、AF_UNIX socket 。每一个套接字配置单元都有一个相应的服务配置单元 。相应的服务在第一个"连接"进入套接字时就会启动(例如：nscd.socket 在有新连接后便启动 nscd.service)
- device ：此类配置单元封装一个存在于 Linux 设备树中的设备。每一个使用 udev 规则标记的设备都将会在 systemd 中作为一个设备配置单元出现。
- mount ：此类配置单元封装文件系统结构层次中的一个挂载点。Systemd 将对这个挂载点进行监控和管理。比如可以在启动时自动将其挂载；可以在某些条件下自动卸载。Systemd 会将/etc/fstab 中的条目都转换为挂载点，并在开机时处理。
- automount ：此类配置单元封装系统结构层次中的一个自挂载点。每一个自挂载配置单元对应一个挂载配置单元 ，当该自动挂载点被访问时，systemd 执行挂载点中定义的挂载行为。
- swap: 和挂载配置单元类似，交换配置单元用来管理交换分区。用户可以用交换配置单元来定义系统中的交换分区，可以让这些交换分区在启动时被激活。
- target ：此类配置单元为其他配置单元进行逻辑分组。它们本身实际上并不做什么，只是引用其他配置单元而已。这样便可以对配置单元做一个统一的控制。这样就可以实现大家都已经非常熟悉的运行级别概念。比如想让系统进入图形化模式，需要运行许多服务和配置命令，这些操作都由一个个的配置单元表示，将所有这些配置单元组合为一个目标(target)，就表示需要将这些配置单元全部执行一遍以便进入目标所代表的系统运行状态。 (例如：multi-user.target 相当于在传统使用 SysV 的系统中运行级别 5)
- timer：定时器配置单元用来定时触发用户定义的操作，这类配置单元取代了 atd、crond 等传统的定时服务。
- snapshot ：与 target 配置单元相似，快照是一组配置单元。它保存了系统当前的运行状态。
每个配置单元都有一个对应的配置文件，系统管理员的任务就是编写和维护这些不同的配置文件，比如一个 MySQL 服务对应一个 mysql.service 文件。这种配置文件的语法非常简单，用户不需要再编写和维护复杂的系统脚本了。

##### Systemd总结

Systemd快速，高效，可以并发启动，并且简化了系统脚本，维护系统服务更加简单了，并且统一了接口，那么带来的效果就是不管什么系统，其服务启动方面是一样的，那么就很容易在不同linux的分支上移植服务。但与之带来的问题是一样，因为并发，所以某些情况可能会带来难以解决的bug。

## The end



## Quote

> http://elinux.org/RPi_Software
> http://wiki.beyondlogic.org/index.php?title=Understanding_RaspberryPi_Boot_Process
> https://www.raspberrypi.org/blog/raspberry-pi-compute-module-new-product/
> https://wiki.gentoo.org/wiki/Raspberry_Pi
> http://vbird.dic.ksu.edu.tw/linux_basic/0510osloader_1.php#process_1
> http://m.blog.csdn.net/blog/gongora/4190056




