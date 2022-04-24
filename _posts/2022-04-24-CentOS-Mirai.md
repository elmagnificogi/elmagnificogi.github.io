---
layout:     post
title:      "CentOS安装Mirai准备"
subtitle:   "nonebot2，mcl，中文乱码"
date:       2022-04-24
update:     2022-04-24
author:     "elmagnifico"
header-img: "img/line-head-bg.jpg"
catalog:    true
tags:
    - QQ
    - bot
    - Python
---

## Foreword

CentOS下强行安装Mirai，可能会遇到很多麻烦的地方，但是最终是可用的，不至于说安不好。建议先看最后的总结



#### 安装环境

```bash
cat /etc/centos-release
CentOS Linux release 7.9.2009 (Core)
```

这是基于CentOS7.9，版本的安装指南，算是克服重重阻挠，强行装上了



## iTXTech MCL Installer

首先是安装`mcl`

```bash
cd 你想要安装 iTXTech MCL 的目录
curl -LJO https://github.com/iTXTech/mcl-installer/releases/download/v1.0.4/mcl-installer-1.0.4-linux-amd64
chmod +x mcl-installer-1.0.4-linux-amd64
./mcl-installer-1.0.4-linux-amd64
```

这里直接运行，在CentOS上大概率是不行的，因为默认的gcc、make等等都不符合要求需要单独升级。



## GLIBC

如果出现了类似的提示，说明GLIBC版本不太对

```bash
./mcl-installer-1.0.4-linux-amd64: /lib64/libc.so.6: version `GLIBC_2.29' not found (required by ./mcl-installer-1.0.4-linux-amd64)
```

可以查看当前版本信息，太低了

```bash
ldd --version
ldd (GNU libc) 2.17
Copyright (C) 2012 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
Written by Roland McGrath and Ulrich Drepper.
```



想要安装GLIBC_2.29，还需要其他的库支持，比如make和gcc的版本都要够高，才能安装。

make需要大于等于4，gcc需要大于等于5。其实INSTALL中还有更多的需求，还有其他不符合的自行解决吧



当有了符合要求的的make和gcc以后，就可以继续安装了

```bash
wget https://mirrors.tuna.tsinghua.edu.cn/gnu/glibc/glibc-2.29.tar.gz
tar -zxvf  glibc-2.29.tar.gz
cd glibc-2.29 
mkdir build
cd build/
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin

make -j 8

make install
```

重新再查看版本，这个时候libc就ok了

```bash
ldd --version
ldd (GNU libc) 2.29
Copyright (C) 2019 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
Written by Roland McGrath and Ulrich Drepper.
```



## make

```bash
cd /usr/local/src/
wget http://ftp.gnu.org/gnu/make/make-4.2.tar.gz
tar xf make-4.2.tar.gz
cd make-4.2/
./configure
make
make install
# 此时的 make 还是3.82 与环境变量有关系
make -v

# 这是我们刚安装的 make 它的版本是4.2
/usr/local/bin/make -v

# 找一下都有哪些 make
whereis make

cd /usr/bin/
# 把默认的 make 改名
mv make make.bak

# 建立一个软连接
ln -sv /usr/local/bin/make /usr/bin/make

make -v
GNU Make 4.2
Built for x86_64-pc-linux-gnu
Copyright (C) 1988-2016 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
```



## gcc



```bash
yum -y install texinfo
ftp://ftp.gnu.org/gnu/gcc/gcc-8.2.0/gcc-8.2.0.tar.gz
tar -zxvf gcc-8.2.0.tar.gz
cd gcc-8.2.0
./contrib/download_prerequisites
mkdir build
cd build
../configure  --prefix=/usr --enable-multilib --enable-languages=c,c++ -disable-multilib
yum groupinstall "Development Tools"
# 务必开启多线程，我这里编译了大概四五个小时，等了好久
make j8
make install
```



##### 报错

最后make install 可能出错，如果是这个错，可以跳过，实际上已经ok了

```bash
/root/glibc-2.29/build/elf/sln /root/glibc-2.29/build/elf/symlink.list
rm -f /root/glibc-2.29/build/elf/symlink.list
test ! -x /root/glibc-2.29/build/elf/ldconfig || LC_ALL=C \
  /root/glibc-2.29/build/elf/ldconfig  \
			/lib64 /usr/lib64
LD_SO=ld-linux-x86-64.so.2 CC="gcc -B/usr/bin/" /usr/bin/perl scripts/test-installation.pl /root/glibc-2.29/build/
/usr/bin/ld: cannot find -lnss_test2
collect2: error: ld returned 1 exit status
Execution of gcc -B/usr/bin/ failed!
The script has found some problems with your installation!
Please read the FAQ and the README file and check the following:
- Did you change the gcc specs file (necessary after upgrading from
  Linux libc5)?
- Are there any symbolic links of the form libXXX.so to old libraries?
  Links like libm.so -> libm.so.5 (where libm.so.5 is an old library) are wrong,
  libm.so should point to the newly installed glibc file - and there should be
  only one such link (check e.g. /lib and /usr/lib)
You should restart this script from your build directory after you've
fixed all problems!
Btw. the script doesn't work if you're installing GNU libc not as your
primary library!
make[1]: *** [Makefile:111: install] Error 1
make[1]: Leaving directory '/root/glibc-2.29'
make: *** [Makefile:12: install] Error 2
```



查看gcc版本

```bash
gcc -v
Using built-in specs.
COLLECT_GCC=gcc
COLLECT_LTO_WRAPPER=/usr/libexec/gcc/x86_64-pc-linux-gnu/8.2.0/lto-wrapper
Target: x86_64-pc-linux-gnu
Configured with: ../configure --prefix=/usr --enable-multilib --enable-languages=c,c++ -disable-multilib
Thread model: posix
gcc version 8.2.0 (GCC) 

```



## Python3.9

python3其实也是GLIBC的要求之一，这里直接升级到较新的版本

```bash
wget https://www.python.org/ftp/python/3.9.10/Python-3.9.10.tgz
tar xvf Python-3.9.10.tgz
cd Python-3.9*/
./configure --enable-optimizations
sudo make altinstall
python3.9 --version
Python 3.9.10
```



### nonebot2

同时python3，在国内的VPS是不能直接安装nonebot2的，会出现某个包怎么都下不到

```bash
python3.9 -m pip install nonebot2

Looking in indexes: http://mirrors.tencentyun.com/pypi/simple
Collecting nonebot2
  Downloading http://mirrors.tencentyun.com/pypi/packages/31/ad/7d94ded073a5bb632f2a44d390037eb1f80830197b841ee451ccb23af667/nonebot2-2.0.0b2-py3-none-any.whl (87 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 87.8/87.8 KB 687.0 kB/s eta 0:00:00
Collecting pygtrie<3.0.0,>=2.4.1
  Downloading http://mirrors.tencentyun.com/pypi/packages/a5/8b/90d0f21a27a354e808a73eb0ffb94db990ab11ad1d8b3db3e5196c882cad/pygtrie-2.4.2.tar.gz (35 kB)
  Preparing metadata (setup.py) ... error
  error: subprocess-exited-with-error
  
  × python setup.py egg_info did not run successfully.
  │ exit code: 1
  ╰─> [1 lines of output]
      ERROR: Can not execute `setup.py` since setuptools is not available in the build environment.
      [end of output]
  
  note: This error originates from a subprocess, and is likely not a problem with pip.
error: metadata-generation-failed

× Encountered error while generating package metadata.
╰─> See above for output.

note: This is an issue with the package mentioned above, not pip.
hint: See above for details.

```

**这里不要使用任何国内的pip源，国内源都屏蔽了这个包**

```
pip install numpy -i https://pypi.tuna.tsinghua.edu.cn/simple
```



```
python3.9 -m pip install --proxy="http://127.0.0.1:1081" nb-cli -i https://pypi.python.org/simple
```

要么pip直接挂个代理，要么用个vps去安装，就不会有包下不下来的问题了



### pip代理

假设本地已经存在代理的v2ray了，并且监听在127.0.0.1，端口1081

```bash
# 设置代理
export http_proxy=127.0.0.1:1081
export https_proxy=127.0.0.1:1081

# 要取消该设置：

unset http_proxy
unset https_proxy
```

可能在运行以后，会出现`SSLError`，这个是由于相关的python库太老了，导致的SSL解析出错了

```bash
python3.9 -m pip install --proxy="http://127.0.0.1:1081" nb-cli -i https://pypi.python.org/simple
Looking in indexes: https://pypi.python.org/simple
WARNING: Retrying (Retry(total=4, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:1129)'))': /simple/nb-cli/
WARNING: Retrying (Retry(total=3, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:1129)'))': /simple/nb-cli/
WARNING: Retrying (Retry(total=2, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:1129)'))': /simple/nb-cli/
WARNING: Retrying (Retry(total=1, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:1129)'))': /simple/nb-cli/
WARNING: Retrying (Retry(total=0, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:1129)'))': /simple/nb-cli/
Could not fetch URL https://pypi.python.org/simple/nb-cli/: There was a problem confirming the ssl certificate: HTTPSConnectionPool(host='pypi.python.org', port=443): Max retries exceeded with url: /simple/nb-cli/ (Caused by SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol (_ssl.c:1129)'))) - skipping
ERROR: Could not find a version that satisfies the requirement nb-cli (from versions: none)
ERROR: No matching distribution found for nb-cli

```

通过更新以下3个包，`SSLError`就消除了

```bash
pip install ndg-httpsclient
pip install pyopenssl
pip install pyasn1
```

还有一种可能是外部已经有代理了，那么内部不能再次代理，所以需要取消外部代理，仅使用内部代理

```
unset http_proxy https_proxy
```



### pygtrie

```
Collecting pygtrie
  Using cached http://mirrors.tencentyun.com/pypi/packages/a5/8b/90d0f21a27a354e808a73eb0ffb94db990ab11ad1d8b3db3e5196c882cad/pygtrie-2.4.2.tar.gz (35 kB)
  Preparing metadata (setup.py) ... error
  error: subprocess-exited-with-error
  
  × python setup.py egg_info did not run successfully.
  │ exit code: 1
  ╰─> [1 lines of output]
      ERROR: Can not execute `setup.py` since setuptools is not available in the build environment.
      [end of output]
  
  note: This error originates from a subprocess, and is likely not a problem with pip.
error: metadata-generation-failed

× Encountered error while generating package metadata.
╰─> See above for output.
```

如果出现上面的错，不管怎么pip安装，都会出现报错的情况，只要在国内（翻墙都不行），除非是完全国外的环境就能正常安装。

这里需要手动下载pygtrie的安装包，然后手动安装

> https://pypi.org/project/pygtrie/#files

```bash
wget https://files.pythonhosted.org/packages/a5/8b/90d0f21a27a354e808a73eb0ffb94db990ab11ad1d8b3db3e5196c882cad/pygtrie-2.4.2.tar.gz
tar xvf pygtrie-2.4.2.tar.gz 
cd pygtrie-2.4.2/
python3.9 setup.py install

running install
running build
running build_py
creating build
creating build/lib
generating pygtrie.py -> build/lib
running install_lib
copying build/lib/pygtrie.py -> /usr/local/lib/python3.9/site-packages
byte-compiling /usr/local/lib/python3.9/site-packages/pygtrie.py to pygtrie.cpython-39.pyc
running install_egg_info
Writing /usr/local/lib/python3.9/site-packages/pygtrie-2.4.2-py3.9.egg-info
```

解决了以上各种问题以后，总算是正常了



## 中文乱码

`mcl`中有很多输出都是中文，而默认CentOS不支持中文。所以`mcl`中很多中文全都成了????

先查看是否有中文的语言包

```bash
locale -a | grep zh
```

修改profile

```bash
vi /etc/profile
```

最后增加以下内容

```bash
export LANG="zh_CN.UTF-8"
export LC_ALL="zh_CN.UTF-8"
```

然后重新加载

```bash
source /etc/profile
```

再次查看语言选项

```
locale
```

有可能会有下面的错误

```bash
warning: setlocale: LC_CTYPE: cannot change locale (zh_CN.UTF-8): No such file or directory 
```

通过下面的方式解决

```bash
localedef -c -f UTF-8 -i zh_CN zh_CN.utf8
```



## Summary

前面在群里说我用CentOS，被群里的小朋友一顿嘲笑，甚至惊为天人。给我莫名其妙了半天，总体来说，原因是CentOS要停止维护了，并且CentOS里有很多依赖库很久都不更新了，这就导致很多程序他们部署都是习惯在ubuntu的设备上，而ubuntu最近版本发的又比较勤，很多相关库都比较新，CentOS的库就很老了。这也就导致他们的工程依赖，在CentOS这里都需要重新编译安装，非常蛋疼。

![image-20220424223654515](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202204242237620.png)

CentOS之前就看到了停止支持的新闻，也没在意，等到被人无情嘲笑，加上我实验了一下，发现CentOS确实不行了。我的VPS基本清一色的CentOS，而V2Ray等很多工具也经常都是优先支持CentOS的，估计日后支持可能会变吧。



**这里还是推荐直接VPS重装一个新一些版本的Ubuntu，可以省很多事**



# Quote

> https://www.cnblogs.com/liuguoyao514257665/p/15816939.html
>
> https://www.cnblogs.com/xzlive/p/12705273.html
>
> https://www.jianshu.com/p/013c8d9cd5e8
>
> https://blog.csdn.net/allway2/article/details/107019412
>
> https://computingforgeeks.com/install-latest-python-on-centos-linux/
>
> https://blog.csdn.net/qq_24909089/article/details/84956328
>
> https://blog.csdn.net/weixin_44022472/article/details/123668527
>
> https://stackoverflow.com/questions/33410577/python-requests-exceptions-sslerror-eof-occurred-in-violation-of-protocol
>
> https://wiki.centos.org/zh/About/Product
>
> https://blog.csdn.net/gsls200808/article/details/113763603