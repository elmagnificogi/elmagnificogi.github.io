---
layout:     post
title:      "树莓派启动那些事（六）"
subtitle:   "linux启动，systemd，unit，target"
date:       2015-11-12
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

### systemd

Systemd的主要目的就是减少系统引导时间和计算开销。Systemd（系统管理守护进程），最开始以GNU GPL协议授权开发，现在已转为使用GNU LGPL协议，它是如今讨论最热烈的引导和服务管理程序。

Systemd引入了并行启动的概念，它会为每个需要启动的守护进程建立一个套接字，这些套接字对于使用它们的进程来说是抽象的，这样它们可以允许不同守护进程之间进行交互。Systemd会创建新进程并为每个进程分配一个控制组（cgroup）。处于不同控制组的进程之间可以通过内核来互相通信。systemd处理开机启动进程的方式非常漂亮，和传统基于init的系统比起来优化了太多。

Systemd的一些核心功能。

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

### systemd启动分析

在内核被加载之后，第一次初始化运行的就是

	/bin/systemd

同时他成为了PID 1 的程序

	systemd-analyze blame 可以看到每个启动项花费的时间

由于Systemd向下兼容，所以正常的init.d中的脚本服务等，依然能够正常使用。

#### 配置文件

所有配置文件存放的目录可以在以下任一目录之中

	/etc/systemd/system
	/etc/systemd/system/
	/usr/lib/systemd/system/
	/lib/systemd/system/

加载的第一个文件为default.target, systemd的启动逻辑顺序默认如下
	
	local-fs-pre.target
	         |
	         v
	(various mounts and   (various swap (various cryptsetup
	 fsck services...)     devices...)      devices...)     (various low-level 
	         |                  |                |           services: udevd,  
	         v                  v                v           tmpfiles, random   
	  local-fs.target      swap.target   cryptsetup.target  seed, sysctl, ...) 
	         |                  |                |                  |
	         \__________________|_______________ | _________________/
	                                            \|/
	                                             v
	                                      sysinit.target
	                                             |
	                             _______________/|\___________________
	                            /                |                    \
	                            |                |                    |
	                            v                |                    v
	                        (various             |              rescue.service
	                       sockets...)           |                    |
	                            |                |                    v
	                            v                |              rescue.target
	                     sockets.target          |
	                            |                |
	                            \_______________ |
	                                            \|
	                                             v
	                                       basic.target
	                                             |
	            ________________________________/|             emergency.service
	           /                |                |                     |
	           |                |                |                     v
	           v                v                v              emergency.target
	       display-      (various system  (various system
	   manager.service       services         services)
	           |           required for          |
	           |          graphical UIs)         v
	           |                |         multi-user.target
	           |                |                |
	           \_______________ | _______________/
	                           \|/
	                            v
	                    graphical.target (如果，我们的启动级别为5, 那么我们可以将 default.target 链接到graphical.target上)



### Systemd 的基本概念

#### 单元的概念

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

####  依赖关系

虽然 systemd 将大量的启动工作解除了依赖，使得它们可以并发启动。但还是存在有些任务，它们之间存在天生的依赖，不能用"套接字激活"(socket activation)、D-Bus activation 和 autofs 三大方法来解除依赖。比如：挂载必须等待挂载点在文件系统中被创建；挂载也必须等待相应的物理设备就绪。为了解决这类依赖问题，systemd 的配置单元之间可以彼此定义依赖关系。

Systemd 用配置单元定义文件中的关键字来描述配置单元之间的依赖关系。比如：unit A 依赖 unit B，可以在 unit B 的定义中用"require A"来表示。这样 systemd 就会保证先启动 A 再启动 B。

#### Systemd 事务

Systemd 能保证事务完整性。Systemd 的事务概念和数据库中的有所不同，主要是为了保证多个依赖的配置单元之间没有环形引用。比如 unit A、B、C，假如它们存在循环依赖，那么 systemd 将无法启动任意一个服务。此时 systemd 将会尝试解决这个问题，因为配置单元之间的依赖关系有两种：required 是强依赖；want 则是弱依赖，systemd 将去掉 wants 关键字指定的依赖看看是否能打破循环。如果无法修复，systemd 会报错。

Systemd 能够自动检测和修复这类配置错误，极大地减轻了管理员的排错负担。

#### Target的概念

Target是Systemd中用于指定服务启动组的方式（相当于SysVinit中的“运行级别”）。每次系统启动的时候都会运行与当前系统相同级别Target关联的所有服务，如果服务不需要跟随系统自动启动，则完全可以忽略这个Target的内容。通常来说我们大多数的Linux用户平时使用的都是“多用户模式”这个级别，对应的Target值为“multi-user.target”。

Sysvinit 运行级别|Systemd 目标|	备注
0	|runlevel0.target, poweroff.target	|关闭系统。
1, s, single|runlevel1.target, rescue.target|	单用户模式。
2, 4|	runlevel2.target, runlevel4.target, multi-user.target|	用户定义/域特定运行级别。默认等同于 3。
3|	runlevel3.target, multi-user.target|	多用户，非图形化。用户可以通过多个控制台或网络登录。
5|	runlevel5.target, graphical.target	|多用户，图形化。通常为所有运行级别 3 的服务外加图形化登录。
6|	runlevel6.target, reboot.target|	重启
emergency|	emergency.target	|紧急 Shell

### Hello World服务的Unit文件

Systemd约定，服务的Unit文件需放置在 /etc/systemd/system 或  /usr/lib/systemd/system 目录中，但由于在CoreOS的后一个目录是只读分区（整个/usr目录挂载的都是只读的系统分区），因此我们通常会将用户定义的Unit服务文件放在在/etc/systemd/system目录中。进入这个目录，新建一个叫“hello.service”的文件，内容入下。

	[Unit] 
	Description=Hello World 
	After=docker.service 
	Requires=docker.service 
	[Service] 
	TimeoutStartSec=0 
	ExecStartPre=-/usr/bin/docker kill busybox1 
	ExecStartPre=-/usr/bin/docker rm busybox1 
	ExecStartPre=/usr/bin/docker pull busybox 
	ExecStart=/usr/bin/docker run --name busybox1 busybox /bin/sh -c "while true; do echo Hello World; sleep 1; done" 
	ExecStop=”/usr/bin/docker kill busybox1” 
	[Install] 
	WantedBy=multi-user.target

在这个Unit文件里，我们首先为这个服务提供了一行简短的描述，然后指明它需要依赖docker的服务，并且要在docker服务运行以后才能运行。整个Unit文件是用的ini文件风格的分组配置格式，最开始的这段配置被放在了Unit组里面。在接下来的Service组中，使用ExecStart和ExecStop属性分别指定了服务运行时和结束时需要执行的命令。最后在Install组的配置中，我们指定了服务所属的Target为multi-user.target。

这里需要注意两个地方，首先ExecStart属性只能包含一条主要命令，而在这个属性的前后可以分别使用ExecStartPre和ExecStartPost指定更多的辅助命令，ExecStop同理。

有些辅助命令会加上一个减号，表示忽略这些命令的出错（因为有些“辅助”命令本来就不一定成功，比如尝试清空一个文件，但文件可能不存在）。

其次TimeoutStartSec=0这行的目的是将Systemd的服务启动超时检查关闭，对于docker应用这样做是必须的，因为docker在运行时可能会需要下载或更新镜像文件，使得服务启动时间变得很长，这样可以防止Systemd认为服务启动失败而将进程误杀。 

#### 启动服务

有了Unit文件，现在就可以启动Hello World服务了，在控制台输入以下命令：

	sudo systemctl start hello.service

这个名字末尾的 .service 后缀是可以省略的，因为systemctl默认的后缀就是 .service。关于Unit文件后缀的含义，会在后续进阶篇的文章里详细说明。

Systemd会自动找到 /usr/lib/systemd/system 目录中的 hello.service 文件，并启动其中定义的服务。如果之前创建的Unit文件是放在其他目录下的，这里需要使用文件的完整路径。首次运行的时候需要等待一段时间，因为docker需要从网络上下载需要的镜像。启动完成后可以通过“systemctl list-units”命令查看服务是否已经在运行（这个命令接受一个可选参数作为服务名的过滤条件，如果不带任何参数则输出所有服务）。
	
	sudo systemctl list-units hello* 
	UNIT  LOAD  ACTIVE  SUB  DESCRIPTION 
	hello.service  loaded  active  running  Hello World

我们还可以通过“systemctl enable”命令来将服务指定为在系统启动时自动启动。

	sudo systemctl enable hello.service

此时就用到了之前定义的Target组，实际上enable操作只是创建了一个连接文件到指定的Target组的目录下面。通过下面命令可以证实。

	ls -l /etc/systemd/system/multi-user.target.wants/hello.service 
	/etc/systemd/system/multi-user.target.wants/hello.service -> /etc/systemd/system/hello.service

系统启动时，会自动运行其所在Target级别相应的目录里所有链接的服务。 

#### 日志管理

至此，我们的第一个服务已经在后台哈皮的玩耍了，可是说好的“echo Hello World”呢？我们从头到尾都没有见到服务的任何输出啊。

其实我们启动的服务已经在后台默默的输出“Hello World”了。

Systemd通过其标准日志服务Journald将其管理的所有后台进程重定向到stdout（即控制台）的输出重定向到了日志文件。日志文件是二进制格式的，因此必须使用特定的工具才能查看。Journald提供了配套的程序Journalctl用于处理日志内容。Journalctl的使用非常简单，默认不带任何参数的时候会输出系统和所有后台进程的混合日志，常用的参数有--dmesg用于查看内核输出的日志，--system用于查看系统输出的日志，--unit加上Unit的名字来指定输出特定Unit的日志，例如以下命令。

	journalctl --unit hello.service

其他还有一些比较实用的参数，比如使用 --follow 实时跟踪日志输出，使用 --since 和 --until 指定显示的日志时间区间等，可以通过 journalctl --help 命令获得完整的参数说明。

#### 服务的生命周期

前面使用了 systemctl 的 start 和 enable 两个命令将 Hello World 服务在系统后台启动并设置为了开机自动运行。实际会遇到的情况远不止这些，下面将一个服务进程在Systemd的生命周期补充完整。 

##### 服务的激活

当一个新的Unit文件被放入 /etc/systemd/system/ 或 /usr/lib/systemd/system/ 目录时，它是不会自动被Systemd识别到的。例如在 hello.service 文件刚刚创建好时，如果我们让Systemd列出所有的Unit。

	sudo systemctl list-units

此时在输出的内容中是找不到hello.service这个Unit的。直到我们通过 systemctl 的 start 或 enable 命令将这个Unit登记到Systemd的服务列表中，这个过程就是Unit的激活。

在服务被激活前，Unit仅仅是以Unit 文件的形式存在，Systemd提供 list-unit-files 命令查看所有的Unit 文件。

	sudo systemctl list-unit-files

这个命令同样接受一个可选的参数作为Unit名称的匹配条件，不带任何参数时会输出所有Systemd找到的（也就是在那两个目录）Unit文件。

PS：顺便回答一个经常被问到的问题，这个命令的输出的第一列是Unit文件名，第二列是相应的Unit是否开机启动，它的值可以是enable、disable或static，这里的static是神马意思呢？其实它是指对应的 Unit 文件中没有定义[Install]区域，因此无法配置为开机启动服务。 

##### 服务的启动、结束、强制终止和重新启动

启动、结束、强制终止和重新启动，没啥可说的，分别对应以下几个命令。

	sudo systemctl start <Unit名称> 
	sudo systemctl stop <Unit名称> 
	sudo systemctl kill <Unit名称> 
	sudo systemctl restart <Unit名称>

服务的开机自动启动的启用和取消，分别对应下面两个。

	sudo systemctl enable <Unit名称> 
	sudo systemctl disable <Unit名称>

##### 服务的修改和移除

这两部分是 Systemd 当中比较Tricky的地方。

首先，如果我们修改了一个放在 /etc/systemd/system/ 的文件，比如将输出的“Hello World”改成了“Bye World”，当执行 systemctl restart 以后，重新启动的服务输出的将依然是“Hello World”。这是因为当Unit文件被激活时，Systemd会将其中的内容记入到自己的缓存当中，因此为了得到更新后的内容，我们需要告诉Systemd重新读取所有的Unit文件。

	sudo systemctl daemon-reload

再次重启Unit，可以看到更新就会生效了。

其次是Unit文件的移除，直接删除Unit文件后由于缓存的作用，Systemd仍然可以继续使用这个Unit，即使通过daemon-reload更新缓存，在list-units中会看见这个Unit只是被标为了not-found，依旧阴魂不散。
	
	sudo systemctl list-units hello* 
	UNIT  LOAD  ACTIVE  SUB  DESCRIPTION 
	hello.service  not-found  failed  failed  hello.service

此时，我们需要明确的告诉Systemd，移除这些已经被标记为丢失的Unit文件。

	sudo systemctl reset-failed

## The end

Systemd快速，高效，可以并发启动，并且简化了系统脚本，维护系统服务更加简单了，并且统一了接口，那么带来的效果就是不管什么系统，其服务启动方面是一样的，那么就很容易在不同linux的分支上移植服务。但与之带来的问题是一样，因为并发，所以某些情况可能会带来难以解决的bug。

## Quote

> http://www.cnblogs.com/cfox/archive/2013/02/01/2888759.html
> 
> http://www.freedesktop.org/software/systemd/man/systemd.service.html
> 
> https://blog.linuxeye.com/400.html
> 
> http://www.lxway.com/88080114.htm
> 
> http://vbird.dic.ksu.edu.tw/linux_basic/0510osloader_1.php#process_1
> 
> http://www.ibm.com/developerworks/cn/linux/1407_liuming_init3/




