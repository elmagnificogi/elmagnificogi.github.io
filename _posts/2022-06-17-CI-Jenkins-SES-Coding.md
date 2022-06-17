---
layout:     post
title:      "Jenkins搭建SES嵌入式CI/CD"
subtitle:   "Diablo,"
date:       2022-06-17
update:     2022-06-17
author:     "elmagnifico"
header-img: "img/z6.jpg"
catalog:    true
tags:
    - Embedded
    - Jenkins
---

## Forward

记录一下我搭建的嵌入式CI/CD流程



## 搭建环境

ubuntu 下安装SES流程



首先下载Linux版本的`64-bit TGZ Archive`，后续直接安装即可，没啥需要操作的

> https://www.segger.com/downloads/embedded-studio/

然后直接启动`SEGGER Embeded Studio For Arm 6.30`，界面和Windows基本一模一样

进到这边就会发现，由于使用了外部编译器编译，所以缺少了必要的编译器，就要安装`GNU Arm Embedded Toolchain`的ubuntu版本



```
sudo apt-get update
sudo apt-get -y install gcc-arm-none-eabi
```

确定是否安装成功了

```bash
arm-none-eabi-gcc -v
Using built-in specs.
COLLECT_GCC=arm-none-eabi-gcc
COLLECT_LTO_WRAPPER=/usr/lib/gcc/arm-none-eabi/10.3.1/lto-wrapper
Target: arm-none-eabi
Configured with: ../configure --build=x86_64-linux-gnu --prefix=/usr --includedir='/usr/lib/include' --mandir='/usr/lib/share/man' --infodir='/usr/lib/share/info' --sysconfdir=/etc --localstatedir=/var --disable-option-checking --disable-silent-rules --libdir='/usr/lib/lib/x86_64-linux-gnu' --libexecdir='/usr/lib/lib/x86_64-linux-gnu' --disable-maintainer-mode --disable-dependency-tracking --mandir=/usr/share/man --enable-languages=c,c++,lto --enable-multilib --disable-decimal-float --disable-libffi --disable-libgomp --disable-libmudflap --disable-libquadmath --disable-libssp --disable-libstdcxx-pch --disable-nls --disable-shared --disable-threads --enable-tls --build=x86_64-linux-gnu --target=arm-none-eabi --with-system-zlib --with-gnu-as --with-gnu-ld --with-pkgversion=15:10.3-2021.07-4 --without-included-gettext --prefix=/usr/lib --infodir=/usr/share/doc/gcc-arm-none-eabi/info --htmldir=/usr/share/doc/gcc-arm-none-eabi/html --pdfdir=/usr/share/doc/gcc-arm-none-eabi/pdf --bindir=/usr/bin --libexecdir=/usr/lib --libdir=/usr/lib --disable-libstdc++-v3 --host=x86_64-linux-gnu --with-headers=no --without-newlib --with-multilib-list=rmprofile,aprofile CFLAGS='-g -O2 -ffile-prefix-map=/build/gcc-arm-none-eabi-hYfgK4/gcc-arm-none-eabi-10.3-2021.07=. -flto=auto -ffat-lto-objects -fstack-protector-strong' CPPFLAGS='-Wdate-time -D_FORTIFY_SOURCE=2' CXXFLAGS='-g -O2 -ffile-prefix-map=/build/gcc-arm-none-eabi-hYfgK4/gcc-arm-none-eabi-10.3-2021.07=. -flto=auto -ffat-lto-objects -fstack-protector-strong' DFLAGS=-frelease FCFLAGS='-g -O2 -ffile-prefix-map=/build/gcc-arm-none-eabi-hYfgK4/gcc-arm-none-eabi-10.3-2021.07=. -flto=auto -ffat-lto-objects -fstack-protector-strong' FFLAGS='-g -O2 -ffile-prefix-map=/build/gcc-arm-none-eabi-hYfgK4/gcc-arm-none-eabi-10.3-2021.07=. -flto=auto -ffat-lto-objects -fstack-protector-strong' GCJFLAGS='-g -O2 -ffile-prefix-map=/build/gcc-arm-none-eabi-hYfgK4/gcc-arm-none-eabi-10.3-2021.07=. -fstack-protector-strong' LDFLAGS='-Wl,-Bsymbolic-functions -flto=auto -Wl,-z,relro' OBJCFLAGS='-g -O2 -ffile-prefix-map=/build/gcc-arm-none-eabi-hYfgK4/gcc-arm-none-eabi-10.3-2021.07=. -flto=auto -ffat-lto-objects -fstack-protector-strong' OBJCXXFLAGS='-g -O2 -ffile-prefix-map=/build/gcc-arm-none-eabi-hYfgK4/gcc-arm-none-eabi-10.3-2021.07=. -flto=auto -ffat-lto-objects -fstack-protector-strong' INHIBIT_LIBC_CFLAGS=-DUSE_TM_CLONE_REGISTRY=0 AR_FOR_TARGET=arm-none-eabi-ar AS_FOR_TARGET=arm-none-eabi-as LD_FOR_TARGET=arm-none-eabi-ld NM_FOR_TARGET=arm-none-eabi-nm OBJDUMP_FOR_TARGET=arm-none-eabi-objdump RANLIB_FOR_TARGET=arm-none-eabi-ranlib READELF_FOR_TARGET=arm-none-eabi-readelf STRIP_FOR_TARGET=arm-none-eabi-strip SED=/bin/sed SHELL=/bin/sh BASH=/bin/bash CONFIG_SHELL=/bin/bash
Thread model: single
Supported LTO compression algorithms: zlib
gcc version 10.3.1 20210621 (release) (15:10.3-2021.07-4) 

```



修改IDE的外部编译器的位置

```
/usr/bin
```

![image-20220616155831641](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220616155831641.png)



#### 编译测试

基本没什么问题了，只有几个脚本是之前用bat写的，可能这次需要修改成shell的了



#### 命令行编译测试

ubuntu中安装完ses以后，默认的emBuild是没有添加到环境变量中的，所以需要指定路径运行

首先清空编译残留，然后重新编译

```
/usr/share/segger_embedded_studio_for_arm_6.30/bin/emBuild  -config configName1 ./test.emProject -clean -echo
/usr/share/segger_embedded_studio_for_arm_6.30/bin/emBuild  -config configName2 ./test.emProject -rebuild -echo
```

如果不带echo，很多命令执行了没有返回，不知道具体是什么情况，所以最好带上echo

```
-verbose
```

如果只是看要执行的命令，而不执行可以用show

```
-show
```

基本到这里，剩下就是配合脚本实现自动编译即可



- 这里遗留了一个小问题，编译是否成功没有判断



## Jenkins

由于是从coding过来的，Jenkins的coding插件还过期不能用了。看了一下coding改用通用插件来对接Jenkins了

<img src="http://img.elmagnifico.tech:9514/static/upload/elmagnifico/129824834-bafcebd1-c408-40fa-8f82-b44bdcfc9f65.png" alt="image" style="zoom:50%;" />

唯一的问题是，Hook这里只有这么几种情况可以设置，其他细节可能得靠参数请求头之类的东西去实现了，但是coding给的参数又不是很多，总体不是很好用。

![image-20220617094749030](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220617094749030.png)

<img src="http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220617094223875.png" alt="image-20220617094223875" style="zoom: 80%;" />

Jenkins这边主要是把路径给过去，然后把token两边填一致，再把coding账号信息输入进去，随便commit一下，就可以看到Jenkins这边收到了并且触发了

<img src="http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220617094501615.png" alt="image-20220617094501615" style="zoom:80%;" />

由于是嵌入式项目，所以没有SES可以用的插件，需要靠脚本去实现后续的编译和release



## release



## Summary

还有一些没写完，后续补充



## Quote

> https://forum.segger.com/index.php/Thread/5927-SOLVED-Using-segger-studio-project-in-Jenkins/
>
> https://studio.segger.com/index.htm?https://studio.segger.com/emBuild.htm
>
> https://github.com/josschne/ses
>
> https://installati.one/ubuntu/22.04/gcc-arm-none-eabi/
