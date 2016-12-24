---
layout:     post
title:      "树莓派启动那些事（一）"
subtitle:   "树莓派，startup，config"
date:       2015-11-06
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.png"
tags:
    - RaspberryPi
---


## 环境

system：2015-09-24-raspbian-jessie

RaspberryPi：Raspberry Pi 2

## 树莓派启动的相关问题

树莓派启动的相关问题，会从config.txt一直介绍到linux如何启动，启动流程分析，自启动脚本实现。

### config.txt

首先是烧完系统以后，修改一下sd卡中的config.txt文件，这里面记录了boot的时候的启动参数

这文件只有在树莓派没启动的时候才能修改，启动之后只能查看(而然并不是所有的都能看到，所以并没有什么卵用，还是乖乖的在启动前仔细看清吧)

	vcgencmd get_config <config> – displays a specific config value 
	e.g:
		vcgencmd get_config arm_freq.

	vcgencmd get_config int – lists all the integer config options that are set (non-zero).

	vcgencmd get_config str – lists all the string config options that are set (non-null).

config文件中以#开头的都是注释，剩下的就是设置的值

### 内存

比较坑爹的是树莓派一共只有1g的内存，而这1g的内存是cpu和gpu共享的（但不是实时共享，而是开始的时候设定好谁用多少，那就只能用这么多超了也不能借）

因为这种坑爹情况，就有了CMA的动态内存共享机制

	coherent_pool=6M smsc95xx.turbo_mode=N 启动CMA
	cma_lwm gpu内存低于cma_lwm的时候会向cpu借一些
	cma_hwm 这个则是反过来，gpu高于多少的时候会自动分享给cpu一些

### Camera

树莓派目前只有两种摄像头，一个是官方原配的，一个是usb的，config中的摄像头设置则是针对原配的来说的
	disable_camera_led=1 关闭摄像头开启的红灯

### Audio (3.5mm jack)

树莓派的3.5mm的耳机口，真是坑爹啊，声音小的时候电流声特别大，声音大了电流声才消失了（不知道是不是我一个人的问题，虽然官方文档上也写着声音小会有“hiss”的声音）

	disable_audio_dither=1

可以调整输出的PWM脉冲宽度，来调节阻抗？？，从而带起来高电阻的耳机？，不过就这杂音，谁会用耳机啊

	pwm_sample_bits

### Video

视频输出树莓派有两种，一个是通过排线直接接一个小的易驱动的显示屏，一个是直接hdmi输出接到显示器上

首先就是视频制式 常见的就是NTSC和PAL，查了文档竟然还有专门为巴西和日本弄得（这两个国家还真是奇葩）默认都NTSC

	sdtv_mode	result
	0	Normal NTSC
	1	Japanese version of NTSC – no pedestal
	2	Normal PAL
	3	Brazilian version of PAL – 525/60 rather than 625/50, different subcarrier

然后就是屏幕比例 

	sdtv_aspect	result
	1	4:3
	2	14:9
	3	16:9

禁止复合信号输出彩色副载波群. 图片会显示为单色, 但是可能会更清晰（并不懂什么意思）

	sdtv_disable_colourburst=1


### HDMI

如果设置了safe=1 那么下面的这一部分也要设置成这样，就是确保hdmi的兼容性最好，确保能让显示器亮起来

	hdmi_safe=1
	
	hdmi_force_hotplug=1
	hdmi_ignore_edid=0xa5000080
	config_hdmi_boost=4
	hdmi_group=2
	hdmi_mode=4
	disable_overscan=0
	overscan_left=24
	overscan_right=24
	overscan_top=24
	overscan_bottom=24

这些设置基本是基于你显示器的edid是不太正确的（貌似说天朝的显示器太垃圾，这个数据不能看）情况下，忽略你的数据，强行支持xxx功能

	hdmi_ignore_edid
	hdmi_edid_file
	hdmi_force_edid_audio
	hdmi_ignore_edid_audio
	hdmi_force_edid_3d
	avoid_edid_fuzzy_match
	hdmi_ignore_cec_init
	hdmi_ignore_cec

这个是设置颜色的编码模式，只要显示器支持默认不用修改，一般显示器也能切换来匹配他的输出

	hdmi_pixel_encoding	result
	0	default (RGB limited for CEA, RGB full for DMT)
	1	RGB limited (16-235)
	2	RGB full (0-255)
	3	YCbCr limited (16-235)
	4	YCbCr full (0-255)
	
这个选择看你是普通没有音响的电脑显示器还是TV了，第一种模式是hdmi接口只负责输出图像，没有声音的
第二种则是又输出图像又输出声音的hdmi接口 一般接tv的时候就用得到了

	hdmi_drive	result
	1	Normal DVI mode (No sound)
	2	Normal HDMI mode (Sound will be sent if supported and enabled)

输出信号强度，如果有干扰可以增大数值（0-7）来屏蔽干扰吧

	config_hdmi_boost=0


hdmi_group很多人经常傻傻分不清楚该选哪个，看下面的选项介绍的好像都可以啊？

> In case you're wondering what CEA and DMT stand for, I found that CEA simply stands for the "Consumer Electronics Association", though it's referring to a timing-data extension to Extended Display Identification Data (EDID). DMT stands for Display Monitor Timing, and is part of a VESA standard, as listed here. So in short, they're different ways of specifying display timing. I don't know how to help you pick, though. :) – lindes
>
> CEA modes are intended for TV, they include plenty of interlaced and progressive modes, usually with 25/50/100Hz (PAL) or 30/60/120Hz (NTSC) frame rates and TV resolutions of 288/480/576/720/1080 scan lines. DMT modes are intended for computer monitors, therefore there are none of the interlaced modes, the resolutions are 640/720/800/1024/1280 and the frame rates are compatible with the computer monitors, something like 60/70/75/80/85/120Hz.

In your tvservice output I don't see any overlaps between CEA and DMT modes. If your TV natively supports 50Hz, it would be a bit silly to try to make it work with 60Hz DMT modes.

其实不是，这里的CEA就相当于是电视当显示器，DMT就相当于是电脑的显示器，主要区别在于刷新频率

平常人可能都没注意过这个问题，电视的刷新频率其实很低，因为平常看电视的时候根本感觉不出来，毕竟电视又不吃显卡（多数都只有一个显示功能，又不需要gpu计算什么的）不会说卡的一顿一顿的，所以刷新频率对于电视来说不重要，但是对于电脑的显示器来说就很重要了，想想玩游戏你都得要60帧，你显示器要是只有30帧，你就是上泰坦也没用，更别说有的游戏对于显示器要求双倍的刷新率也就是120帧才能保证游戏的运动效果不会出现重影。

既然说到这里顺带再说一下延迟的问题。平常电视就算有1s的延迟，你也不在乎，毕竟视频源是固定的，快或者慢不能影响到什么（1s的延迟很夸张了，好电视是50-60ms，差一点的就是500-600ms）。对于电脑显示器就不一样了，需要注意这个延迟会导致你在游戏中反应的延迟，也就是说敌人1s前出现了，你才发现他（你猜你是死了？还是死了？），这个视觉的延迟比网络更可怕，所以会有这样的区别，想买电视当显示器的还是先查查延迟有多少吧

	hdmi_group	result
	0	Auto-detect from EDID
	1	CEA
	2	DMT

针对不同的显示器，分辨率的选择自然也就不同了
当 hdmi_group=1 (CEA)的时候,hdmi_mode 要根据电视的情况来选

	hdmi_mode	resolution	frequency	notes
	1	VGA (640×480)		
	2	480p	60Hz	
	3	480p	60Hz	16:9 aspect ratio
	4	720p	60Hz	
	5	1080i	60Hz	
	6	480i	60Hz	
	7	480i	60Hz	16:9 aspect ratio
	8	240p	60Hz	
	9	240p	60Hz	16:9 aspect ratio
	10	480i	60Hz	pixel quadrupling
	11	480i	60Hz	pixel quadrupling, 16:9 aspect ratio
	12	240p	60Hz	pixel quadrupling
	13	240p	60Hz	pixel quadrupling, 16:9 aspect ratio
	14	480p	60Hz	pixel doubling
	15	480p	60Hz	pixel doubling, 16:9 aspect ratio
	16	1080p	60Hz	
	17	576p	50Hz	
	18	576p	50Hz	16:9 aspect ratio
	19	720p	50Hz	
	20	1080i	50Hz	
	21	576i	50Hz	
	22	576i	50Hz	16:9 aspect ratio
	23	288p	50Hz	
	24	288p	50Hz	16:9 aspect ratio
	25	576i	50Hz	pixel quadrupling
	26	576i	50Hz	pixel quadrupling, 16:9 aspect ratio
	27	288p	50Hz	pixel quadrupling
	28	288p	50Hz	pixel quadrupling, 16:9 aspect ratio
	29	576p	50Hz	pixel doubling
	30	576p	50Hz	pixel doubling, 16:9 aspect ratio
	31	1080p	50Hz	
	32	1080p	24Hz	
	33	1080p	25Hz	
	34	1080p	30Hz	
	35	480p	60Hz	pixel quadrupling
	36	480p	60Hz	pixel quadrupling, 16:9 aspect ratio
	37	576p	50Hz	pixel quadrupling
	38	576p	50Hz	pixel quadrupling, 16:9 aspect ratio
	39	1080i	50Hz	reduced blanking
	40	1080i	100Hz	
	41	720p	100Hz	
	42	576p	100Hz	
	43	576p	100Hz	16:9 aspect ratio
	44	576i	100Hz	
	45	576i	100Hz	16:9 aspect ratio
	46	1080i	120Hz	
	47	720p	120Hz	
	48	480p	120Hz	
	49	480p	120Hz	16:9 aspect ratio
	50	480i	120Hz	
	51	480i	120Hz	16:9 aspect ratio
	52	576p	200Hz	
	53	576p	200Hz	16:9 aspect ratio
	54	576i	200Hz	
	55	576i	200Hz	16:9 aspect ratio
	56	480p	240Hz	
	57	480p	240Hz	16:9 aspect ratio
	58	480i	240Hz	
	59	480i	240Hz	16:9 aspect ratio

这里会发现当有的带p，有的带i，平常经常说1080p，很少听到1080i，这是两个不同级别的分辨率
一般说p是i的两边，p呢是每行都刷新，i是隔行刷新，肉眼是肯定看不出来的，但是总体清晰度上p比i要高，但是i的硬件要求低，成本低，所以以后看到什么宣传1080的时候注意是p还是i，完全是两个级别

当 hdmi_group=2 (DMT):要看你屏幕的最大分辨率是多少来选择
	
	hdmi_mode	resolution	frequency	notes
	1	640×350	85Hz	
	2	640×400	85Hz	
	3	720×400	85Hz	
	4	640×480	60Hz	
	5	640×480	72Hz	
	6	640×480	75Hz	
	7	640×480	85Hz	
	8	800×600	56Hz	
	9	800×600	60Hz	
	10	800×600	72Hz	
	11	800×600	75Hz	
	12	800×600	85Hz	
	13	800×600	120Hz	
	14	848×480	60Hz	
	15	1024×768	43Hz	incompatible with the Raspberry Pi
	16	1024×768	60Hz	
	17	1024×768	70Hz	
	18	1024×768	75Hz	
	19	1024×768	85Hz	
	20	1024×768	120Hz	
	21	1152×864	75Hz	
	22	1280×768		reduced blanking
	23	1280×768	60Hz	
	24	1280×768	75Hz	
	25	1280×768	85Hz	
	26	1280×768	120Hz	reduced blanking
	27	1280×800		reduced blanking
	28	1280×800	60Hz	
	29	1280×800	75Hz	
	30	1280×800	85Hz	
	31	1280×800	120Hz	reduced blanking
	32	1280×960	60Hz	
	33	1280×960	85Hz	
	34	1280×960	120Hz	reduced blanking
	35	1280×1024	60Hz	
	36	1280×1024	75Hz	
	37	1280×1024	85Hz	
	38	1280×1024	120Hz	reduced blanking
	39	1360×768	60Hz	
	40	1360×768	120Hz	reduced blanking
	41	1400×1050		reduced blanking
	42	1400×1050	60Hz	
	43	1400×1050	75Hz	
	44	1400×1050	85Hz	
	45	1400×1050	120Hz	reduced blanking
	46	1440×900		reduced blanking
	47	1440×900	60Hz	
	48	1440×900	75Hz	
	49	1440×900	85Hz	
	50	1440×900	120Hz	reduced blanking
	51	1600×1200	60Hz	
	52	1600×1200	65Hz	
	53	1600×1200	70Hz	
	54	1600×1200	75Hz	
	55	1600×1200	85Hz	
	56	1600×1200	120Hz	reduced blanking
	57	1680×1050		reduced blanking
	58	1680×1050	60Hz	
	59	1680×1050	75Hz	
	60	1680×1050	85Hz	
	61	1680×1050	120Hz	reduced blanking
	62	1792×1344	60Hz	
	63	1792×1344	75Hz	
	64	1792×1344	120Hz	reduced blanking
	65	1856×1392	60Hz	
	66	1856×1392	75Hz	
	67	1856×1392	120Hz	reduced blanking
	68	1920×1200		reduced blanking
	69	1920×1200	60Hz	
	70	1920×1200	75Hz	
	71	1920×1200	85Hz	
	72	1920×1200	120Hz	reduced blanking
	73	1920×1440	60Hz	
	74	1920×1440	75Hz	
	75	1920×1440	120Hz	reduced blanking
	76	2560×1600		reduced blanking
	77	2560×1600	60Hz	
	78	2560×1600	75Hz	
	79	2560×1600	85Hz	
	80	2560×1600	120Hz	reduced blanking
	81	1366×768	60Hz	
	82	1920×1080	60Hz	1080p
	83	1600×900		reduced blanking
	84	2048×1152		reduced blanking
	85	1280×720	60Hz	720p
	86	1366×768		reduced blanking

上面有看到一个奇怪的东西 reduced blanking ，这是干嘛的呢？

就是如果你的分辨率太高了（其实是传输带宽太低），一次就要传送的数据量就很大，那如果我每次传输一半，然后显示器自己去脑补一半，那对于我不够用的带宽来说就够用了不是

由于这种方法虽然速度快了，满足了带宽，但是呢由于每次显示器要脑补一半，如果刷新频率太低了,就容易被肉眼看出来（运动过程模糊），所以提高了显示器的刷新频率，这样肉眼就不容易看出来了

这种减半提高刷新率就出现了一些伪120hz的显示器，其实就是硬件配置不够高，带宽跟不上，只好妥协每次传一半了

如果配置的有问题
你也可以通过先勉强进去系统，然后输入下面这些命令来看看到底适合什么样的显示器，也可以提交edid.dat去问别人适合什么选项

	Set the output format to VGA 60Hz (hdmi_group=1 and hdmi_mode=1) and boot up your Raspberry Pi
	Enter the following command to give a list of CEA supported modes: /opt/vc/bin/tvservice -m CEA
	Enter the following command to give a list of DMT supported modes: /opt/vc/bin/tvservice -m DMT
	Enter the following command to show your current state: /opt/vc/bin/tvservice -s
	Enter the following commands to dump more detailed information from your monitor: /opt/vc/bin/tvservice -d edid.dat; /opt/vc/bin/edidparser edid.dat

如果上面没有你能用的配置，那你可以自定义一个

	hdmi_cvt=<width> <height> <framerate> <aspect> <margins> <interlace> <rb>
	Value	Default	Description
	width	(required)	width in pixels
	height	(required)	height in pixels
	framerate	(required)	framerate in Hz
	aspect	3	aspect ratio 1=4:3, 2=14:9, 3=16:9, 4=5:4, 5=16:10, 6=15:9
	margins	0	0=margins disabled, 1=margins enabled
	interlace	0	0=progressive, 1=interlaced
	rb	0	0=normal, 1=reduced blanking

这个用来假装HDMI热插拔信号的，就是在检测不到热插拔信号的情况下也要输出hdmi，有时候黑屏显示没信号/没插入hdmi的时候，可以尝试设置这个
	
	hdmi_force_hotplug
	hdmi_ignore_hotplug

disable_overscan 设为1将禁用超出扫描.其实这个就是调整显示器屏幕的上下左右黑屏的大小的

	disable_overscan 
	overscan_left
	overscan_right
	overscan_top
	overscan_bottom

这里的就是调整屏幕的宽高，平常看到的拉伸处理那种，以及单位像素大小吧，当然是越大越清晰（前提是你得支持）
	
	framebuffer_width
	framebuffer_height
	framebuffer_depth
	framebuffer_depth	result	notes
	8	8bit framebuffer	Default RGB palette makes screen unreadable.
	16	16bit framebuffer	
	24	24bit framebuffer	May result in a corrupted display.
	32	32bit framebuffer	May need to be used in confunction with framebuffer_ignore_alpha=1.
	framebuffer_ignore_alpha

这个可以在开机前，出现一个视频和声音测试的画面，其实没必要

	test_mode

这是旋转屏幕，而旋转屏幕竟然还需要额外的GPU内存，16M的GPU内存太低了，可能不能选择，需要你多分一些

	display_rotate	result
	0	no rotation
	1	rotate 90 degrees clockwise
	2	rotate 180 degrees clockwise
	3	rotate 270 degrees clockwise

### Licence keys/codecs

树莓派还有部分编解码能力被锁定了！如果要解锁需要集齐七颗龙珠（需要去买licence才能具有硬件编解码能力，不然只能软解）

	Licence keys/codecs
	decode_MPG2
	decode_WVC1

### boot

下面的参数都是与boot启动有关系的，应该是移植操作系统的时候会遇到的

disable_commandline_tags 在启动内核前, 通过改写ATAGS (0x100处的内存)来阻止start.elf 

cmdline (string) 命令行参数. 可用来代替cmdline.txt文件

kernel (string) 加载指定名称的内核镜像文件启动内核. 默认为"kernel.img"

kernel_address 加载kernel.img文件地址

ramfsfile (string) 要的加载的ramfs文件

ramfsaddr 要加载的ramfs文件地址

initramfs (string address) 要加载的ramfs文件及其地址 (就是把ramfsfile+ramfsaddr合并为一项). 

	initramfs initramf.gz 0x00800000

device_tree_address 加载device_tree的地址

init_uart_baud 初始化uart波特率. 默认为115200 如果要接串口登陆，一定要注意这个属性

init_uart_clock 初始化uart时序. 默认为3000000 (3Mhz) 

init_emmc_clock 初始化emmc时序. 默认为100000000 (100MHz) 

bootcode_delay 这个是在boot启动前等一下，给足时间读取显示器的EDID数据，有可能启动太快了来不及读从而显示出问题

boot_delay 在加载内核前在start.elf等待指定秒. 总延迟=1000 * boot_delay + boot_delay_ms. 默认为1 这个是为sd卡延迟的

boot_delay_ms 在加载内核前在start.elf等待指定毫秒. 默认为0 

avoid_safe_mode 如果设为1, 将不以安全模式启动. 默认为0

### disable_splash 彩虹方块

不会显示一个彩虹画面？这个难道指的是每隔一段时间会在右上角出现一个彩色的方块？？

	disable_splash
	
	If set to 1, don’t show the rainbow splash screen on boot. The default value is 0.

如果你出现了彩虹方块：那是什么意思呢？？

官方解释说当你的电源出现问题的时候就会出现彩虹方块（看到彩虹方块的上辈子都是折翼的天使，我之所以知道是因为我看到了...）

电源问题总体分两种情况：

一个就是供电的电源有问题，自然包括usb输入电流不达标，电压不达标，接触不良，导线太细，负载太高（usb外设接的太多，太耗电）等等情况

这种情况只要你更换电源就行了，推荐使用UPS电源（就是贵）

还有一种，那就是你超频了，并且设置了对应的核心电压，出现了核心电压供电不足，就会时不时的出现彩虹方块，这种情况就是提醒你超频设置是有问题的，虽然用起来好像是正常的，但是还是尽量不要让彩虹方块出现才是对硬件最好的。


### Device Tree 设备树

> *ARM Device Tree起源于OpenFirmware (OF)，在过去的Linux中，arch/arm/plat-xxx和arch/arm/mach-xxx中充斥着大量的垃圾代码，相当多数的代码只是在描述板级细节，而这些板级细节对于内核来讲，不过是垃圾，如板上的platform设备、resource、i2c_board_info、spi_board_info以及各种硬件的platform_data。为了改变这种局面，Linux社区的大牛们参考了PowerPC等体系架构中使用的Flattened Device Tree（FDT），也采用了Device Tree结构，许多硬件的细节可以直接透过它传递给Linux，而不再需要在kernel中进行大量的冗余编码。*
> 
> *Device Tree是一种描述硬件的数据结构，由一系列被命名的结点（node）和属性（property）组成，而结点本身可包含子结点。所谓属性，其实就是成对出现的name和value。在Device Tree中，可描述的信息包括（原先这些信息大多被hard code到kernel中）：CPU的数量和类别，内存基地址和大小，总线和桥，外设连接，中断控制器和中断使用情况，GPIO控制器和GPIO使用情况，Clock控制器和Clock使用情况。*
> 
> *通常由.dts文件以文本方式对系统设备树进行描述，经过Device Tree Compiler(dtc)将dts文件转换成二进制文件binary device tree blob(dtb)，.dtb文件可由Linux内核解析，有了device tree就可以在不改动Linux内核的情况下，对不同的平台实现无差异的支持，只需更换相应的dts文件，即可满足。*
> 
> *http://www.wowotech.net/linux_kenrel/why-dt.html*

简单说就是移植linux的时候，由于平台众多，各种硬件还都不一样，大家对于设备的描述也不一样，非常麻烦，那简单起见，不如规定一个标准的形式，那么就是设备树了，全都按照这种方式来表述硬件平台上有些啥，描述好了之后直接启动linux就ok了，从而使linux支持各种平台

## The end

这才介绍了一半的config，下次开始高级的config内容：超频相关

(写的时候还发现了一个bug，当开着有道的划词翻译+MarkdownPad2的时候，由于划词的原因，在按Tab缩进的时候就会出现，MarkdownPad的cpu占用率飙升，然后Tab键无效，程序半卡死状态，刚开始我还以为是我写太长了呢，就分开写了，突然想到关了有道试试，没想到就好了。)

## Quote

> http://my.oschina.net/funnky/blog/132885#OSC_h1_1
> http://www.wowotech.net/linux_kenrel/why-dt.html




