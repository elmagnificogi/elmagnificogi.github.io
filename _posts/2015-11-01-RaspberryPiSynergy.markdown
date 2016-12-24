---
layout:     post
title:      "树莓派 & Synergy & 笔记本"
subtitle:   "开机启动，Synergy，共用鼠键"
date:       2015-11-01
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.png"
tags:
    - RaspberryPi
---


## Foreword

&emsp;&emsp;最近因为要学python，加上对于linux系并不是非常了解，操作也不熟练，干脆买了块Raspberry Pi来学习，刚好有换下来的老屏也是hdmi接口的当作是树莓派的屏幕好了，于是发现要操作树莓派还得另需一副鼠标键盘，之前也有过用PieTTY|PuTTY的经验，依然还是想试试看有没有共享鼠键的方式（其实老早之前有想尝试通过usb/串口连接两台电脑，加上上位机，当鼠标滑出屏幕之后切换到另外一边的显示器去实现鼠键共享，后来发现驱动部分非常麻烦，就暂时搁置了）.

----------

	1.KVM切换器

&emsp;&emsp;用KVM切换器来解决（就是稍微有点贵，我想的是有一根usb线 一头是母头，两头是公头，带开关切换连接的公头，从而就可以1控2甚至更多，然而并没有这样的线，自己想的话可以DIY一个）

	2.Synergy

&emsp;&emsp;通过 Synergy在局域网内共享一台电脑的键盘/鼠标，就可以控制多台电脑，可以设置通过快捷键切换屏幕（也可设置鼠标在屏幕边缘即可切换），可以共享剪贴板（在任意屏幕的剪贴板操作都可以带到其他屏幕上）。Win 版本有图形界面，Mac 版本只提供命令行，并且需要自行配置文件（我没Mac），Linux 版本有图形的也有命令行的。（其实Synergy的github上是有通过usb连接来共享的code）

&emsp;&emsp;毫无疑问这里我要选择使用Synergy来完成和树莓派的共享鼠键.非常感谢引用中的三位博主，我是借鉴了他们的才弄好的。

---

## Windows & Synergy

&emsp;&emsp;我是Windows 10 能正常使用Synergy，那其他版本Windows应该问题不大。
&emsp;&emsp;这个是Synergy的github，可以直接下到源代码，Windows下我是直接从网上下了一个synergy-1.7.4-stable的目前（2015年11月1日）的最新版本，Synergy的官网需要你购买才能下载，实际上安装的时候跳过注册也能正常使用。

> https://github.com/synergy

&emsp;&emsp;安装完后，按照界面选就可以了（服务端，IP地址高亮的就是你的局域网IP，也是应该填到另一台机器的IP（建议先进路由把两台机器的IP设置为静态的，不然DHCP换IP地址比较麻烦）

&emsp;&emsp;设置服务端，从右上角要把那个电脑拖过来放到你主机的对应上下左右的位置上，起好名字（另一台机器也必须是这个名字，我之前没注意名字打错了，死活连不上）

&emsp;&emsp;剩下还有热键等设置自己琢磨就好了,这里可能还会遇到比如某个按键不好使：shift等，那是版本太低就会有这个问题，之前我是树莓派是最新版，win是个低一些的版本，果断shift怎么都用不了，换成最新版本的就好了

## 环境

Camera：树莓派原装的摄像头

system：2015-09-24-raspbian-jessie

RaspberryPi：Raspberry Pi 2

## RaspberryPi & Synergy

1. 从上面的github下源码到树莓派中去

2. 解压源码，解压完了之后一定要解压./ext/下的openssl gtest gmock 三个压缩包，不然一会链接和编译的时候都会找不到各种文件。

3. 进入源码目录，先尝试

		
		./configure
		

   如果没有意外，应该会提示cmake相关的，大概就是cmake没装

		
		./configure
		...
		./configure: line 1: cmake: command not found
		sudo apt-get install cmake
		

   装完cmake，继续缺少X11，继续安，应该还会提示xtst

		
		./configure
		...
		CMake Error at CMakeLists.txt:203 (message):
		Missing header: X11/Xlib.hX11/XKBlib.h
		-- Configuring incomplete, errors occurred!
		sudo apt-get install libx11-dev
		sudo apt-get install libxtst-dev
		
   我又出现了Missing library：curl 装了这个之后就能继续了

    	sudo apt-get install libcurl4-openssl-dev

   如果不是以上的错误，那仔细看一下错误提示是哪里的文件，哪行代码，缺少了什么东西
   比如：
	 
		
		CMake Error at CMakeLists.txt:203 (message):
		Missing header: X11/Xlib.hX11/XKBlib.h
		-- Configuring incomplete, errors occurred!
		
	 
   就需要去看一下203行到底写了啥为什么没找到这个头文件
	 
		
		# add include dir for bsd (posix uses /usr/include/)
		set(CMAKE_INCLUDE_PATH "${CMAKE_INCLUDE_PATH}:/usr/local/include")
		set(XKBlib "X11/Xlib.h;X11/XKBlib.h")
		
	 
   发现认为文件在/usr/local/include中实际上是在/usr/include才有x11的头文件，修改一下这里就能继续了。
   中间如果还提示缺少openssl gtest gmock等文件，那肯定是第二步没做，或者是放的文件夹不对，看错误提示修改一下解压的文件夹就没问题了。
   如果没错了就能开始make了

4. make，make时碰到的错误基本和上面一样，是一些头文件找不到，对应找到以后修改一下源码中的位置就奔最后就能ok了，大概要编译10分钟左右，就完成了

   我出现了：

		cannot find -lssl
		sudo apt-get install libssl-dev

   之后恢复正常
   一般出现了：

		/usr/bin/ld: cannot find -lxxx

   是指缺少lab xxx 那么只要对应安装xxx就行了

		sudo apt-get install libxxx-dev

   参考这里

   > http://blog.csdn.net/a936676463/article/details/8480672  


5. 复制到/usr/bin中去
		
		
		sudo cp -a ./bin/. /usr/bin
		

6. 开机自动启动Synergy，不然每次还得插个键盘啥的启动一下多麻烦。在/etc/init.d/中新建synergy然后编辑成下面的内容。

   解释一下这里的参数 
  - --daemon是将synergy作为后台程序
  - --name 是指客户端的名字 填写你自己的到这里
  - --restart 是指断线后重连（不是重启服务，只是重连而已，实际上我遇到的就是直接死了，只有pkill进程以后重新开才能恢复，所以这里就没办法了）
  - --log /home/pi/log 可以把日志输出到这个目录的log文件中，实际上我每次开启以后都会出现dup2的error，但是程序是正常的，并不影响
  - 还有其他-d debug 参数什么的 没有仔细研究


    ```
    	### BEGIN INIT INFO
    	# Provides: py_synergy
    	# Required-Start: $remote_fs $syslog
    	# Required-Stop: $remote_fs $syslog
    	# Default-Start: 2 3 4 5
    	# Default-Stop: 0 1 6
    	# Short-Description: synergy initscript
    	# Description: This service is used to manage the synergy
    	### END INIT INFO
    	#!/bin/sh
    	#/etc/init.d/synergy
   
		case "$1" in
		  start)
		    cd /home/pi/synergy-1.4.10-Source/bin/
		    su pi -c './synergyc --daemon --name Pi --restart 192.168.0.1'
		    echo "Starting synergy client..."
		    ;;
		  stop)
		    pkill synergyc
		    echo "Attempting to kill synergy client"
		    ;;
		  *)
		    echo "Usage: /etc/init.d/synergy (start/stop)"
		    exit 1
		    ;;
		esac
		exit 0
	```

   这里必须用su pi -c 命令 不然会导致使用sudo service start等所有以sudo开头的命令无法使用。
   比如 我直接减去了 cd 和 su 命令 如下

		synergyc --daemon --name pi --restart --log /home/pi/sylog 192.168.1.104

   用这个命令代替，那么结果就是服务无法启动，虽然执行了，但是你会发现synergyc进程根本没启动
   当然，我用这个命令的前提是 我把 synergy编译后的./bin目录下的权限都改为了777 并且复制到了/usr/bin 的目录下，并且这个脚本也改为了777 在确保了所有权限都没错的情况下，如果用sudo/root权限 是完全打不开synergyc的 

		sudo synergyc --daemon --name pi --restart --log /home/pi/sylog 192.168.1.104
		sudo service synergy stop
		sudo service synergy start

   上面的命令你甚至能看到输出，但是实际上程序完全没起来


7. 设置权限，无论如何确保运行，如果提示缺少LSB tags(上面是有tags的所以应该不会提示)，可以无视
 

		sudo chmod 755 /etc/init.d/synergy
		sudo update-rc.d synergy defaults
		sudo insserv synergy


8. 启动Synergy服务，之后重启一下看看，是不是鼠标可以直接外滑到另一台设备的屏幕上去了，键盘输入也是需要以鼠标激活的屏幕为基础
 
		sudo /etc/init.d/synergy start
		sudo /etc/init.d/synergy stop
		sudo service synergy stop
		sudo service synergy start

## 以上方法无法自动启动的情况（周三/11/6 17:04:29）

配完synergy的那天和第二天都非常好用，开机自启动，长时间开着都没有掉线的情况。

放了几天以后，更新了一下系统，然后开机启动就废了，我重烧过系统，重做了三四遍，都不行。

反复查原因，目前找到的就是：

是开机启动项，服务激活（启动过），但是看不到synergy连接的信息，这时候直接start无效，必须得stop 然后start 才能重新开起来。

只好开机以后，用putty手动启动一下synergy 然后再用 

（我查看了国外友人博客，有近期评论（5月前）中说做完整个流程的基本都成功了，至少我确实是成功好用了两天，如果你能正常使用上面的方式就不用往下看了）

说一下我尝试解决的办法

- 刚好学习了python就用python写了一个脚本，然后开机自动启动python，然后再用python脚本来调用synergy的服务，间接调用，依然是不能开机启动，所以问题应该在脚本/启动流程中
- 修改了用su pi -c的脚本调用的方式，直接用synergyc 来启动 就遇到了上面说的问题，服务根本无法运行
- 在su pi -c 前先pkill一次 然后再开启，失败
- 参考另外一个博客的方法，使用LXDE的启动脚本来启动，失败

```
	sudo mkdir -p ~/.config/lxsession/LXDE
	sudo touch ~/.config/lxsession/LXDE/autostart
	sudo nano ~/.config/lxsession/LXDE/autostart
	编辑下面内容
	~/.startsynergy.sh
	sudo nano ~/.startsynergy.sh
	#!/bin/bash
	killall synergyc
	sleep 1
	synergyc --name pi 192.168.0.16
	exit 0
	sudo chmod 777 ~/.startsynergy.sh
```

- synergy的官方论坛，提到树莓派的只有这一个，有人回答的也刚好是上面的方法并且还是最近10月20号的，说是可以，但我怀疑他应该用的是老版本的树莓派系统，不是最新的，链接在下面

> http://synergy-project.org/forum/viewtopic.php?f=9&t=30&hilit=raspberry&start=10

- 参考了synergy官方所有wiki呀，论坛啊之类的关于linux下autostartup的问题，全都无解
- 单独查找树莓派设置开机启动的方法还有debian开机启动的方法，不外乎上面这种还有一种写在/etc/rc.local调用上面的脚本/直接命令启动，失败
- 查看log，log是正常的，只有一次出了这个错误（忽略时间，我树莓派的时间是错的）

	raspberrypi synergyc[629]: Synergy 1.7.4: [2015-09-26T04:19:32] WARNING: secondary screen unavailable: unable to open screen

- 根据这个warning找到了另外一篇博客，帮我确定了错误,会出现越界的错误

> http://wp.sgrosshome.com/2014/01/31/configure-synergy-client-systemd-service-auto-start-linux-fedora-20/
> https://bugzilla.redhat.com/show_bug.cgi?id=1212860

-从官方wiki来看，synergy是不能从boot启动的（更新不及时），也就是说不登录的情况下是无法启动synergyc的（会出现什么情况不知道，但不能用），但是呢，偏偏有不少博客写着成功从boot启动了，在用户未登录的情况下就能启动，但这基本取决于用的系统和当时的版本，更换了之后立马就都不行了，为此之后会单独写一篇关于树莓派/linux系统启动相关的，梳理一下我对于linux以及树莓派系统的理解


截至到几个小时前，我都没找到自动启动的办法。直到我看到他

> http://www.raspberrypi-spy.co.uk/2014/05/how-to-autostart-apps-in-rasbian-lxde-desktop/

成功通过python脚本启动了synergyc 

这个帖子中的第一种方法不知道由于什么原因，我在第一次做的时候，成功启动了终端，从此以后再也没成功过了。
而100%成功的是第二种方法。

## 第二种自启动方法

下面介绍第二种100%成功的方法（基于树莓派2的2015-09-24-raspbian-jessie版本的系统下）
其他的版本请尝试我上面提到过的所有方法

首先，修改LXDE桌面自启动的脚本

	sudo nano ~/.config/lxsession/LXDE-pi/autostart

然后可以看到

	@lxpanel --profile LXDE-pi
	@pcmanfm --desktop --profile LXDE-pi
	@xscreensaver -no-splash
	@/usr/bin/python /home/pi/script/synergy.py
	@lxterminal
	@sh ${HOME}/.config/lxsession/LXDE-pi/autokey.sh

在最后一行代码的前面加入

	@/usr/bin/python /home/pi/script/synergy.py
	@lxterminal

@lxterminal是终端，可以测试重启是否执行了这上面的命令，执行了的话会自动打开终端的

关键脚本就在这里了，首先调用/usr/bin下的python 来 运行/home/pi/script/目录下的synergy.py脚本

synergy.py脚本内容如下

	import subprocess
	import time
	time.sleep(1)
	p=subprocess.Popen("sudo service synergy stop",shell=True,stdout=subprocess.PIP$
	text=p.stdout.read().decode()
	print(text)
	text=p.stderr.read().decode()
	print(text)
	time.sleep(1)
	p=subprocess.Popen("sudo service synergy start",shell=True,stdout=subprocess.PI$
	text=p.stdout.read().decode()
	print(text)
	text=p.stderr.read().decode()
	print(text)

这是通过python的subprocess来启动synergy服务（这是建立在第一种方法建立好服务的基础上的）

你也可以修改这里 选择直接调用这个，就不用做建立服务了

	synergyc --daemon --name pi --restart --log /home/pi/sylog 192.168.1.104

在启动前加了一个停止和延时，确保不会有冗余的进程存在。

做完上面的步骤就可以reboot 重启看效果了，如果你的平台是和我一样的，没有自动启动，那就仔细检查上面的内容，肯定有小疏忽。

## The end

&emsp;&emsp;到这里就设置结束了，应该能正常使用Synergy，如果还有后续的话就是如何在windows下编译出来一个Synergy。
总体来说Synergy还是不错的，我参考的博客中有提到占用cpu太高什么的，其实在我用的最新版本1.74中基本都解决了，没有体会到占用很高的cpu。

&emsp;&emsp;但是本来双屏幕的被占用了一个屏幕，并且不能随意拖拽东西过去（我是指窗口，实际上剪贴板是共享的，文件也可以拖拽），不过有好几秒的延迟，有时候putty和winSCP配合使用还是不错的。

&emsp;&emsp;其实也可以用VNC，虽然我是在一个局域网里，但是延迟感总是要高一些，很不舒服，synergy的鼠标和键盘的延迟很低，感觉就好像直接扩展屏一样。

&emsp;&emsp;类似synergy的软件也有几个（zeroOS，input director，maxVista还有什么winnoborder），但他们都是不是全平台通用的，各自有各自的限制，synergy目前是mac linux windows android等等都可以用，从论坛什么的，也能看到synergy的bug颇多，什么情况都有

&emsp;&emsp;树莓派下也可以用使用带UI的Synergy和QuickSynergy，就是不能自动启动需要你手动，下面的博客有介绍的。

## Quote

> http://www.shumeipai.net/thread-18993-1-1.html?_dsign=4330837c
> http://blog.csdn.net/lonerzf/article/details/13996895
> http://blog.sina.com.cn/s/blog_5922f3300101e20o.html
> https://www.rootusers.com/compiling-synergy-from-source-on-the-raspberry-pi/
> http://synergy-project.org/forum/viewtopic.php?f=9&t=30&hilit=raspberry&start=10
> https://learn.adafruit.com/synergy-on-raspberry-pi/setup-synergy-client-autostart
> http://www.raspberrypi-spy.co.uk/2014/05/how-to-autostart-apps-in-rasbian-lxde-desktop/
> http://wp.sgrosshome.com/2014/01/31/configure-synergy-client-systemd-service-auto-start-linux-fedora-20/



