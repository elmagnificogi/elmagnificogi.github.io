---
layout:     post
title:      "树莓派启动那些事（五）"
subtitle:   "linux启动，init，runlevel，shell"
date:       2015-11-11
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

### inittab

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

####  /etc/init.d/rcS脚本

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

####  /etc/rcS.d脚本

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

#### /etc/inittab的action

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

#### /etc/rc.d/rc.local脚本

使用者自订启动启动程序 (/etc/rc.d/rc.local)
在完成默认 runlevel 指定的各项服务的启动后，如果我还有其他的动作想要完成时，举例来说， 我还想要寄一封 mail 给某个系统管理帐号，通知他，系统刚刚重新启动完毕，那么是否应该要制作一个 shell script 放置在 /etc/init.d/ 里面，然后再以连结方式连结到 /etc/rc5.d/ 当然不需要！我有任何想要在启动时就进行的工作时，直接将他写入 /etc/rc.d/rc.local ， 那么该工作就会在启动的时候自动被加载而不必等我们登陆系统去启动。一般来说，把自己制作的 shell script 完整档名写入 /etc/rc.d/rc.local ，如此一来，启动就会将我的 shell script 运行。

#### 系统启动配置

在 /sbin/init 的运行过程中有谈到许多运行脚本，包括 /etc/rc.d/rc.sysinit 以及 /etc/rc.d/rc 等等， 其实这些脚本都会使用到相当多的系统配置档，这些启动过程会用到的配置档则大多放在 /etc/sysconfig/ 目录下。 同时，由于核心还是需要加载一些驱动程序 (核心模块)，此时系统自定义的配置与模块对应档 (/etc/modprobe.conf) 就显的重要了

##### /etc/modprobe.conf脚本

虽然核心提供的默认模块已经很足够我们使用了，但是，某些条件下还是得对模块进行一些参数的规划， 此时就得要使用到 /etc/modprobe.conf。举例来说，CentOS 主机的 modprobe.conf 像这样：

	[root@www ~]# cat /etc/modprobe.conf
	alias eth0 8139too               <==让 eth0 使用 8139too 的模块
	alias scsi_hostadapter pata_sis
	alias snd-card-0 snd-trident
	options snd-card-0 index=0       <==额外指定 snd-card-0 的参数功能
	options snd-trident index=0

这个文件大多在指定系统内的硬件所使用的模块！这个文件通常系统是可以自行产生的，不过，如果系统使用了错误的驱动程序，或者是你想要使用升级的驱动程序来对应相关的硬件配备时， 你就得要自行手动的处理一下这个文件了。

当我要启动网络卡时，系统会跑到这个文件来查阅一下，然后加载 8139too 驱动程序来驱动网络卡！


#####  /etc/sysconfig/脚本

整个启动的过程当中，读取的一些服务的相关配置档都是记录在 /etc/sysconfig 目录下的，那么该目录底下有些啥：

- authconfig：
- 这个文件主要在规范使用者的身份认证的机制，包括是否使用本机的 /etc/passwd, /etc/shadow 等， 以及 /etc/shadow 口令记录使用何种加密演算法，还有是否使用外部口令服务器提供的帐号验证 (NIS, LDAP) 等。 系统默认使用 MD5 加密演算法，并且不使用外部的身份验证机制；

- clock：
- 此文件在配置 Linux 主机的时区，可以使用格林威治时间(GMT)，也可以使用的本地时间 (local)。基本上，在 clock 文件内的配置项目『 ZONE 』所参考的时区位於 /usr/share/zoneinfo 目录下的相对路径中。而且要修改时区的话，还得将 /usr/share/zoneinfo/Asia/Taipei 这个文件复制成为 /etc/localtime 才行！

- i18n：
- i18n 在配置一些语系的使用方面，例如最麻烦的文字介面下的日期显示问题！ 如果你是以中文安装的，那么默认语系会被选择 zh_SI.UTF8 ，所以在纯文字介面之下， 你的文件日期显示可能就会呈现乱码！这个时候就需要更改一下这里啦！更动这个 i18n 的文件，将里面的 LC_TIME 改成 en 即可！

- keyboard & mouse：
- keyboard 与 mouse 就是在配置键盘与鼠标的形式；

- network：
- network 可以配置是否要启动网络，以及配置主机名称还有通讯闸 (GATEWAY) 

- network-scripts/：
- 至於 network-scripts 里面的文件，则是主要用在配置网络卡 


总而言之一句话，这个目录下的文件很重要的啦！启动过程里面常常会读取到的！


#### Run level 的切换

经过上面的步骤，各项服务都已经启动了，那么就进入到系统的用户登录的部分了。但是，该如何切换 run level呢

事实上，与 run level 有关的启动其实是在 /etc/rc.d/rc.sysinit 运行完毕之后。也就是说，其实 run level 的不同仅是 /etc/rc[0-6].d 里面启动的服务不同而已。不过，依据启动是否自动进入不同 run level 的配置，我们可以说：

要每次启动都运行某个默认的 run level ，则需要修改 /etc/inittab 内的配置项目， 即是『 id:5:initdefault: 』里头的数字；

如果仅只是暂时变更系统的 run level 时，则使用 init [0-6] 来进行 run level 的变更。 但下次重新启动时，依旧会是以 /etc/inittab 的配置为准。
假设原本我们是以 run level 5 登陆系统的，但是因为某些因素，想要切换成为 run level 3 时， 该怎么办呢？

很简单啊，运行『 init 3 』即可切换。但是 init 3 这个动作到底做了什么呢？ 不同的 run level 只是加载的服务不同罢了， 亦即是 /etc/rc5.d/ 还有 /etc/rc3.d 内的 Sxxname 与 Kxxname 有差异而已。 所以说，当运行 init 3 时，系统会：

	先比对 /etc/rc3.d/ 及 /etc/rc5.d 内的 K 与 S 开头的文件；
	在新的 runlevel 亦即是 /etc/rc3.d/ 内有多的 K 开头文件，则予以关闭；
	在新的 runlevel 亦即是 /etc/rc3.d/ 内有多的 S 开头文件，则予以启动；

也就是说，两个 run level 都存在的服务就不会被关闭啦！如此一来，就很容易切换 run level 了， 而且还不需要重新启动呢！那我怎么知道目前的 run level 是多少呢？ 直接在 bash 当中输入 runlevel 即可啊！
	
	 [root@www ~]# runlevel
	N 5
	# 左边代表前一个 runlevel ，右边代表目前的 runlevel。
	# 由於之前并没有切换过 runlevel ，因此前一个 runlevel 不存在 (N)
	# 将目前的 runlevel 切换成为 3 (注意， tty7 的数据会消失！)
	
	切换runlevel
	[root@www ~]# init 3
	NIT: Sending processes the TERM signal
	Applying Intel CPU microcode update:        [  OK  ]
	Starting background readahead:              [  OK  ]
	Starting irqbalance:                        [  OK  ]
	Starting httpd:                             [  OK  ]
	Starting anacron:                           [  OK  ]
	# 这代表，新的 runlevel 亦即是 runlevel3 比前一个 runlevel 多出了上述 5 个服务
	
	显示runlevel历史
	[root@www ~]# runlevel
	5 3
	# 看吧！前一个是 runlevel 5 ，目前的是 runlevel 3 啦！
	那么你能不能利用 init 来进行关机与重新启动呢？利用『 init 0 』就能够关机， 而『 init 6 』
	就能够重新启动！往前翻一下 runlevel 的定义即可了解吧！

#### 登陆

开机启动程序加载完毕以后，就要让用户登录了。
一般来说，用户的登录方式有三种：
- 命令行登录
- ssh登录
- 图形界面登录

这三种情况，都有自己的方式对用户进行认证。

- 命令行登录：init进程调用getty程序（意为get teletype），让用户输入用户名和密码。输入完成后，再调用login程序，核对密码（Debian还会再多运行一个身份核对程序/etc/pam.d/login）。如果密码正确，就从文件 /etc/passwd 读取该用户指定的shell，然后启动这个shell。
- ssh登录：这时系统调用sshd程序（Debian还会再运行/etc/pam.d/ssh ），取代getty和login，然后启动shell。
- 图形界面登录：init进程调用显示管理器，Gnome图形界面对应的显示管理器为gdm（GNOME Display Manager），然后用户输入用户名和密码。如果密码正确，就读取/etc/gdm3/Xsession，启动用户的会话。

#### 进入 login shell

所谓shell，简单说就是命令行界面，让用户可以直接与操作系统对话。用户登录时打开的shell，就叫做login shell。

Debian默认的shell是Bash，它会读入一系列的配置文件。上一步的三种情况，在这一步的处理，也存在差异。

- 命令行登录：首先读入 /etc/profile，这是对所有用户都有效的配置；然后依次寻找下面三个文件，这是针对当前用户的配置。

	~/.bash_profile
	~/.bash_login
	~/.profile
　　
需要注意的是，这三个文件只要有一个存在，就不再读入后面的文件了。比如，要是 ~/.bash_profile 存在，就不会再读入后面两个文件了。


- ssh登录：与第一种情况完全相同。


- 图形界面登录：只加载 /etc/profile 和 ~/.profile。也就是说，~/.bash_profile 不管有没有，都不会运行。

#### 打开 non-login shell

上一步完成以后，Linux的启动过程就算结束了，用户已经可以看到命令行提示符或者图形界面了。但是，为了内容的完整，必须再介绍一下这一步。

用户进入操作系统以后，常常会再手动开启一个shell。这个shell就叫做 non-login shell，意思是它不同于登录时出现的那个shell，不读取/etc/profile和.profile等配置文件。

non-login shell的重要性，不仅在于它是用户最常接触的那个shell，还在于它会读入用户自己的bash配置文件 ~/.bashrc。大多数时候，我们对于bash的定制，都是写在这个文件里面的。

要是不进入 non-login shell，岂不是.bashrc就不会运行了，因此bash 也就不能完成定制了？事实上，Debian已经考虑到这个问题了，请打开文件 ~/.profile，可以看到下面的代码：

	if [ -n "$BASH_VERSION" ]; then
	　　if [ -f "$HOME/.bashrc" ]; then
	　　　　　　. "$HOME/.bashrc"
	　　fi
	fi
　　
上面代码先判断变量 $BASH_VERSION 是否有值，然后判断主目录下是否存在 .bashrc 文件，如果存在就运行该文件。第三行开头的那个点，是source命令的简写形式，表示运行某个文件，写成"source ~/.bashrc"也是可以的。

因此，只要运行～/.profile文件，～/.bashrc文件就会连带运行。但是上一节的第一种情况提到过，如果存在～/.bash_profile文件，那么有可能不会运行～/.profile文件。解决这个问题很简单，把下面代码写入.bash_profile就行了。

	if [ -f ~/.profile ]; then
	　　. ~/.profile
	fi
　　
这样一来，不管是哪种情况，.bashrc都会执行，用户的设置可以放心地都写入这个文件了。

Bash的设置之所以如此繁琐，是由于历史原因造成的。早期的时候，计算机运行速度很慢，载入配置文件需要很长时间，Bash的作者只好把配置文件分成了几个部分，阶段性载入。

系统的通用设置放在 /etc/profile，用户个人的、需要被所有子进程继承的设置放在.profile，不需要被继承的设置放在.bashrc。

顺便提一下，除了Linux以外， Mac OS X 使用的shell也是Bash。但是，它只加载.bash_profile，然后在.bash_profile里面调用.bashrc。而且，不管是ssh登录，还是在图形界面里启动shell窗口，都是如此。

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


#### Sysini总结

总体来说inittab的启动方式是串行的，单线程，按顺序的，那么带来的问题就是启动的时候非常慢，以及配置服务的时候需要注意前后关系，否则有可能因为缺少依赖服务而无法启动或者是启动出错。

## The end

下次就开始systemd的启动分析

## Quote

> http://vbird.dic.ksu.edu.tw/linux_basic/0510osloader_1.php#process_1
> 
> http://m.blog.csdn.net/blog/gongora/4190056
> 
> http://blog.chinaunix.net/uid-23069658-id-3142047.html
> 
> http://www.ruanyifeng.com/blog/2013/08/linux_boot_process.html




