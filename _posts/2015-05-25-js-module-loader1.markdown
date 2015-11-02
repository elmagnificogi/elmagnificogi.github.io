---
layout:     post
title:      "JavaScript Module Loader"
subtitle:   "CommonJS，RequireJS，SeaJS 归纳笔记"
date:       2015-05-25
author:     "Hux"
header-img: "img/post-bg-js-module.jpg"
tags:
    - 前端开发
    - JavaScript
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

## RaspberryPi & Synergy

 1. 从上面的github下源码到树莓派中去
 2. 解压源码，解压完了之后一定要解压./ext/下的openssl gtest gmock 三个压缩包，不然一会链接和编译的时候都会找不到各种文件。
 3. 进入源码目录，先尝试

 ```
./configure
 ```
 
 如果没有意外，应该会提示cmake相关的，大概就是cmake没装
 
 ```
./configure
...
./configure: line 1: cmake: command not found
sudo apt-get install cmake
 ```
 
 装完cmake，继续缺少X11，继续安，应该还会提示xtst
 
 ```
./configure
...
CMake Error at CMakeLists.txt:196 (message):
  Missing header: X11/Xlib.hX11/XKBlib.h
-- Configuring incomplete, errors occurred!
sudo apt-get install libx11-dev
sudo apt-get install libxtst-dev
 ```
 
 如果不是以上的错误，那仔细看一下错误提示是哪里的文件，哪行代码，缺少了什么东西
 比如：
 
 ```
CMake Error at CMakeLists.txt:196 (message):
  Missing header: X11/Xlib.hX11/XKBlib.h
-- Configuring incomplete, errors occurred!
 ```
 
 就需要去看一下196行到底写了啥为什么没找到这个头文件
 
 ```
 # add include dir for bsd (posix uses /usr/include/)
set(CMAKE_INCLUDE_PATH "${CMAKE_INCLUDE_PATH}:/usr/local/include")
set(XKBlib "X11/Xlib.h;X11/XKBlib.h")
 ```
 
  发现认为文件在/usr/local/include中实际上是在/usr/include才有x11的头文件，修改一下这里
就能继续了。
中间如果还提示缺少openssl gtest gmock等文件，那肯定是第二步没做，或者是放的文件夹不对，看错误提示修改一下解压的文件夹就没问题了。
如果没错了就能开始make了
 4. make，make时碰到的错误基本和上面一样，是一些头文件找不到，对应找到以后修改一下源码中的位置就奔最后就能ok了，大概要编译10分钟左右，就完成了
 5. 复制到/usr/bin中去

 ```
sudo cp -a ./bin/. /usr/bin
 ```
 

 6. 开机自动启动Synergy，不然每次还得插个键盘啥的启动一下多麻烦。在/etc/init.d/中新建synergy然后编辑成下面的内容，这里要注意！--name 后面接你在服务端设置的名字 restart后面接你服务端的静态ip地址，不然会连接不上
 
 ```
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

 7. 设置权限，无论如何确保运行，会提示缺少LSB tags，可以无视
 
 ```
sudo chmod 755 /etc/init.d/synergy
update-rc.d synergy defaults
insserv synergy
 ```

 8. 停止|启动Synergy，之后重启一下看看，是不是鼠标可以直接外滑到另一台设备的屏幕上去了，键盘输入也是需要以鼠标激活的屏幕为基础
 
 ```
/etc/init.d/synergy start
/etc/init.d/synergy stop
service synergy stop
service synergy start
 ```
## The end
&emsp;&emsp;到这里就设置结束了，应该能正常使用Synergy，如果还有后续的话就是如何在windows下编译出来一个Synergy。
&emsp;&emsp;总体来说Synergy还是不错的，但是本来双屏幕的被占用了一个屏幕，并且不能随意拖拽东西过去（应该改是不能跨平台吧，同平台应该是可以的），所以最后还是PieTTY|PuTTY会比较好一些，毕竟用linux系的要什么桌面啊。
&emsp;&emsp;树莓派下也可以用使用带UI的Synergy和QuickSynergy，就是不能自动启动需要你手动，下面的博客有介绍的。
## Quote

> http://www.shumeipai.net/thread-18993-1-1.html?_dsign=4330837c
> http://blog.csdn.net/lonerzf/article/details/13996895
> http://blog.sina.com.cn/s/blog_5922f3300101e20o.html
> https://www.rootusers.com/compiling-synergy-from-source-on-the-raspberry-pi/



