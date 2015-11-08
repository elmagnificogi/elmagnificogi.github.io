---
layout:     post
title:      "树莓派启动那些事（二）"
subtitle:   "超频，ondemand，多机配置"
date:       2015-11-07
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

接着上一次的config，这次开始高级内容——超频

### 超频

以前的树莓派如果超频了然后保修的时候会被检测到，而从12年9月以后开始，可以自由超频不受限制，保修依然继续

事实上你可直接在进系统以后使用

	sudo raspi-config

来设置频率

目前最新的内核有一个ondemand机制，如果你超频了的话，那么就是以你超的为基准，如果你没超，那么这个机制就会发生做用，他会在需要高负载的情况下自动提升频率。

	*_min config   这个是设置ondemand超频的最小值
	force_turbo=1  这个是关闭动态超频

如果超频下，芯片温度超过85度，超频会自动失效来降低温度。

|转义字符|说明|
| ---------------|:-------------------------------:| 
| arm_freq | 频率设置，默认700m |
| gpu_freq | 同时设置了下面四个的频率，默认250 | 
| core_freq | GPU频率，因为他和cpu共用二级缓存，所以会对cpu频率造成影响 |
| h264_freq | 视频硬解频率 |
| isp_freq | 图像信号的频率，这里应该是指原配摄像头的 | 
| v3d_freq | 3D频率 | 
| avoid_pwm_pll | 这个是pwm的锁相环开关，貌似会使耳机效果更差 |
| sdram_freq | SDRAM速率，默认400，就是读写SD卡的速度 |
| over_voltage | CPU/GPU的电压调整. [-16,8]对应[0.8V,1.4V]，默认为0->1.2v，只有在自调整超频的时候会提高电压 |
| over_voltage_sdram | 设置下面的三个参数的电压 |
| over_voltage_sdram_c | SDRAM的控制电压调节，[-16,8] 对应 [0.8V,1.4V] . 默认是0 |
| over_voltage_sdram_i | SDRAM I/O 电压调节，[-16,8] 对应 [0.8V,1.4V] . 默认是0 |
| over_voltage_sdram_p | SDRAM phy 电压调节，[-16,8] 对应 [0.8V,1.4V] . 默认是0 |
| force_turbo | 关闭动态频率调节，和最小值设定，开启h246/v3d/isp的超频，默认0 |
| initial_turbo | 如果有SD卡错误，那么修改这个初始化值，可能会让sd卡可读写，默认0 |
| arm_freq_min | 设置最低频率，默认700 |
| core_freq_min | 设置core_freq的最小频率，默认250 |
| sdram_freq_min | 设置SDRAM的最低频率，默认400 |
| over_voltage_min | 设置over_voltage的最低数值，默认0 |
| temp_limit | 设置过热保护温度，默认85 |
| current_limit_override | 置为0x5A000020时会让SMPS限流保护失效，当你超频之后遇到重启失败，那么设置这个通常可以保证不会遇到什么意外情况 |


#### force_turbo模式

	force_turbo=0

开启对ARM核心,GPU核心和SDRAM的动态时序及电压. 在忙的时候ARM频率会提高到"arm_freq"并在闲的时候降低到"arm_freq_min". "core_freq", "sdram_freq"和"over_voltage"的行为都一样. "over_voltage"最高为6 (1.35V). h264/v3d/isp部分的非默认值将被忽略.

	force_turbo=1

关闭动态时序, 因此所有频率和电压会保持高值. h264/v3d/isp GPU部分的超频也会开启, 等同于设置"over_voltage"为8 (1.4V).

#### 时序关系

GPU核心, h264, v3d和isp共享一个锁相环,所以他们是同频率的. ARM, SDRAM和GPU有各自独有的锁相环, 所以可以单独设置.[8]

	频率的计算
	pll_freq = floor(2400 / (2 * core_freq)) * (2 * core_freq)
	gpu_freq = pll_freq / [偶数]

有效的gpu_freq会自动四舍五到到最接近的整型偶数, 所以请求core_freq为500, gpu_freq为300,算一下2000/300 = 6.666 => 6 ,结果就是333.33MHz.

当设了"avoid_pwm_pll=1"，会导致耳机输出的‘hiss’更加严重，但是可以将gpu_freq和core_freq分开来，从而独立设置频率

#### 查看温度和电压

查看温度 把值除1000就是摄氏度

	cat /sys/class/thermal/thermal_zone0/temp

查看频率	把值除1000就是MHz

 	cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq

其他温度你需要用万用表自己测

保证核心温度低于70，供电电压高于4.8，小于5v，有可能再加一个散热片，那超频就没啥问题了

（我自己加了散热片，待机12小时，散热片稍微有一点温度，我自己有风扇，那就根本一点温度都没有）
在这里我自己有点疑问，以散热片来说，紫铜制的，是最好的，同时在散热片和芯片之间加上含银硅脂（液金），散热是最好的，而目前我看到的都是普通铜片，和芯片之间的是3M黏胶（虽然可以保证移动的时候散热片不会掉下来，但是导热效果就差了），当然还有看到用液冷的，太夸张了一个树莓派而已。

#### 超频问题

多数超频问题会直接无法启动，那只用按住shift键，会自动关闭超频进行启动，启动之后调整配置就可以了。

#### 官方推荐，快速超频

官方标配超频设置，完全没有后顾之忧
	
	sudo rasp-config
	然后选择第七项 Overclock
	然后根据你的情况尝试上面的配置（树莓派2直接选最后一个或者倒数第二个）
	
#### 多机适配

如果只有一个树莓派，就设置一个config就ok了，但如果有多个树莓派，多个显示器等等，而且型号也不一样，那交换sd卡的时候就需要每个修改一下，就太麻烦了。那么如何修改config从而使得多个pi也适用呢

	[pi1]  以此开始，是适合pi1使用的
	initramfs initrd.img-3.18.7+ followkernel
	[pi2]  以此开始，是适合pi2使用的
	initramfs initrd.img-3.18.7-v7+ followkernel
	[all] 以此开始，下面的配置是所以pi适用的

通过指定EDID来适配多台显示器

	[EDID=VSC-TD2220] 通过指定EDID来适配多台显示器
	hdmi_group=2
	hdmi_mode=82
	[all]

你也可以指定某一个树莓派什么样的配置，但首先得知道这个树莓派的序列号

	cat /proc/cpuinfo 获取树莓派序列号
	Serial          : 0000000012345678

	指定序列号，序列号下的配置都是针对他的
	[0x12345678]
	# settings here are applied only to the Pi with this serial
	[all]
	# settings here are applied to all hardware

上面的这些配置方式自然也可以组合来使用

	# settings here are applied to all hardware
	[EDID=VSC-TD2220]
	# settings here are applied only if monitor VSC-TD2220 is connected
	[pi2]
	# settings here are applied only if monitor VSC-TD2220 is connected *and* on a Pi2
	[0x12345678]
	# settings here are applied only to the Pi with this serial
	[all]
	# settings here are applied to all hardware

这样就能针对不同系类，不同显示器，特定某个派来配置树莓派了

## The end

到此介绍完了树莓派的config的配置，下次开始，进入系统的常用配置介绍。

## Quote

> http://my.oschina.net/funnky/blog/132885#OSC_h1_1
> 
> https://www.rpicn.org/documentation/configuration/config-txt.md/




