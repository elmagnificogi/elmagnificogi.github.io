---
layout:     post
title:      "MT793x编译与框架指南"
subtitle:   "build,env"
date:       2022-10-31
update:     2022-10-31
author:     "elmagnifico"
header-img: "img/pcb-head-bg.jpg"
catalog:    true
tags:
    - C
    - MT793x
---

## Foreword

MT7931和MT7933的资料太少了，而且文档和代码还各种错，这里记录一下



## 编译

通过build.sh 来完成编译

```
customer@ubuntu:/mnt/Share/MT7933_1024$ ./build.sh
0
===============================================================
Build Project
===============================================================
Usage: ./build.sh <board> <project> [bl|clean] <argument>

Example:
       ./build.sh mt7933_hdk iot_sdk_demo
       ./build.sh mt7933_hdk iot_sdk_demo bl      (build with bootloader)
       ./build.sh clean                      (clean folder: out)
       ./build.sh mt7933_hdk clean           (clean folder: out/mt7933_hdk)
       ./build.sh mt7933_hdk iot_sdk_demo clean   (clean folder: out/mt7933_hdk/iot_sdk_demo)

Argument:
       -f=<feature makefile> or --feature=<feature makefile>
           Replace feature.mk with other makefile. For example, 
           the feature_example.mk is under project folder, -f=feature_example.mk
           will replace feature.mk with feature_example.mk.

       -o=<make option> or --option=<make option>
           Assign additional make option. For example, 
           to compile module sequentially, use -o=-j1.
           to turn on specific feature in feature makefile, use -o=<feature_name>=y
           to assign more than one options, use -o=<option_1> -o=<option_2>.

===============================================================
List Available Example Projects
===============================================================
Usage: ./build.sh list
```



```
make: Leaving directory '/mnt/Share/MT7933_1024/project/mt7933_hdk/apps/qfn_sdk_demo/GCC'
./build.sh: line 608: python: command not found
./build.sh: line 610: [[: ./build.sh: line 609: python: command not found: syntax error: operand expected (error token is "./build.sh: line 609: python: command not found")
==============================================================
./build.sh mt7933_hdk qfn_sdk_demo
Start Build: Mon 31 Oct 2022 12:29:43 AM PDT
End Build: Mon 31 Oct 2022 12:36:23 AM PDT
TOTAL BUILD: FAIL
./build.sh: line 620: exit: ./build.sh:: numeric argument required
```

build可能会报错，主要是环境中python的问题，有些地方可能直接用python不行，需要替换成python3，才能正常编译

```shell
    mkdir -p $OUT/obj/$TARGET_PATH
    echo $extra_opt | grep -Eo  "[_[:alnum:]]+=[[:graph:]]*" | sort | uniq > $OUT/obj/$TARGET_PATH/extra_opts.lis
    cp $where_to_find_feature_mk/$feature_mk $OUT/obj/$TARGET_PATH/tmp.mk
    mkdir -p $OUT/autogen
    mkdir -p $OUT/log
    echo "$0 $ori_argv" > $OUT/log/build_time.log
    echo "Start Build: "`date` >> $OUT/log/build_time.log
    copy_fw_from_prebuilt $where_to_find_feature_mk $feature_mk
    if [ ! -z $feature_mk ]; then
        EXTRA_VAR+=" FEATURE=$feature_mk"
    fi
    EXTRA_VAR+="$extra_opt"
    #echo "make -C $TARGET_PATH BUILD_DIR=$OUT/obj OUTPATH=$OUT $EXTRA_VAR"
    make -C $TARGET_PATH BUILD_DIR=$OUT/obj OUTPATH=$OUT $EXTRA_VAR 2>> $OUT/err.log
    BUILD_RESULT=$?
    mkdir -p $OUT/lib
    mv -f $OUT/*.a $OUT/lib/ 2> /dev/null
    mv -f $OUT/*.log $OUT/log/ 2> /dev/null
    echo "End Build: "`date` >> $OUT/log/build_time.log
    cat $OUT/log/build.log | grep "MODULE BUILD" >> $OUT/log/build_time.log
    if [ "$BUILD_RESULT" -eq "0" ]; then 
        python3 $CODING_STYLE $2 $3
        BUILD_RESULT=$(python3 $CODING_STYLE $2 check_build 2>&1)
        if [[ "$BUILD_RESULT" -eq "0" ]]; then
            echo "TOTAL BUILD: PASS" >> $OUT/log/build_time.log
        else
            echo "TOTAL BUILD: FAIL" >> $OUT/log/build_time.log
        fi
    else
        echo "TOTAL BUILD: FAIL" >> $OUT/log/build_time.log
    fi
    echo "=============================================================="
    cat $OUT/log/build_time.log
    exit $BUILD_RESULT
```





可以通过`./build.sh list` 查看当前具有可编译的项目

```
customer@ubuntu:/mnt/Share/MT7933_1024$ ./build.sh list
0
===============================================================
Available Build Projects:
===============================================================
  mt7933_hdk
    audio_ref_design
    bga_sboot_demo
    bga_sdk_at
    bga_sdk_audio
    bga_sdk_demo
    bootloader
    cjson
    lwip_socket_demo
    mbedtls
    mqtt_client
    qfn_sdk_demo
    qfn_tfm_demo
    websocket_client

```



一般来说第一次需要编译一下boot，生产bootload固件，如果带了bl参数会连带编译bootloader

```
./build.sh mt7933_hdk bootloader
```



然后再生产需要的项目的固件

```
./build.sh mt7933_hdk qfn_sdk_demo
```



编译完成以后会有 PASS 提示，失败的话会有对应的原因

```
./build.sh mt7933_hdk qfn_sdk_demo
Start Build: Mon 31 Oct 2022 12:43:58 AM PDT
End Build: Mon 31 Oct 2022 12:47:16 AM PDT
TOTAL BUILD: PASS
```



生成的bin文件在对应的项目的文件夹中

```
./sdk/out/mt7933_hdk/xxxx
```



之后首次烧写，需要把生成的文件复制到一起，放进`burn_files`



## MT793x代码框架

### SDK

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202210311557761.png)

- config，主要是编译用的各种配置文件
- doc，官方文档，看着有很多，其实有很多东西没有说明，比较有用的是官方API的本地web
- driver，主要是底层驱动HAL
- kernel，主要是FreeRTOS相关代码
- middleware，主要是MTK官方的一些组件或者是第三方的组件，可以比较方便的使用，而不用重新造轮子
- out，编译输出
- prebuild，预编译文件，一些编译好的库文件或者不想给你看到的东西，都在这里面
- project，项目文件夹，一些demo也在里面
- tinysys，Tiny System Sensor相关内容
- tools，一些编译相关的工具
- build.sh，编译脚本



#### middleware



**MTK**

- audio，音频相关
- bluetooth，蓝牙相关
- minicli，CM33调试串口的命令行
- nvdm，E2PROM读写相关
- port_service，串口或者USB操作相关，但是实际测试不好用
- fota，在线升级相关
- connectivity，wlan和bt相关
- connectivity\wlan_daemon\ated_ext，AT指令相关
- ...太多了懒得列



**third_party**

- cjson，json库
- lwip，网络库
- mbedtls，tls等加密相关的库
- mqtt，mqtt协议库
- ping，ping的实现库
- websocket，websocket的实现库
- ...等等



### Project

工程结构，比较简单，但是主要内容都在编译选项之中

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202210311619603.png)

- GCC，工程相关的编译设置
- inc，头文件
- src，源文件



ps：源码lwip中的udp客户端并不能正常工作，api接口写错了



#### GCC

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202210311620958.png)

- feature.mk，middleware组件是否使用，全都在feature中配置
- hal_feature.mk，hal层驱动是否使用，在hal_feature中配置
- Makefile，当前工程文件的配置
- mt7933_flash.ld，flash的分散加载文件
- mt7933_ram.ld，ram的分散加载文件
- startup_mt7933.s，启动文件
- syscalls.c，一些系统回调文件



## Summary

烧写和GPIO配置，就看我之前写过的吧。



## Quote

> MT793X IoT SDK for Hands on Training.pdf
>
> MT793X IoT SDK for Open Source Software Guide.pdf
