---
layout:     post
title:      "Dap error while reading AIRCR/CPUID register"
subtitle:   "STM32、JLink"
date:       2022-12-13
update:     2022-12-14
author:     "elmagnifico"
header-img: "img/docker-head-bg.jpg"
catalog:    true
tags:
    - STM32
---

## Forward

刷写STM32遇到一个问题，第一次正常刷进去，但是第二次就不能刷了，怎么都连接失败



## Dap error while reading AIRCR/CPUID register

![91a32b2a-d2c0-4a1c-919b-2a9f380dcc59.png](https://community.silabs.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=0681M00000EWPBU&operationContext=CHATTER&contentId=05T1M00000qOPGF&page=0)

出现的问题类似这个EFR32、BGM121，报错基本一模一样，只是换了个板子而已

```
% commander device info -d efr32
Invalid header received, out of sync problem?
Try resetting target
No reply.
Invalid header received, out of sync problem?
Try resetting target
Invalid header received, out of sync problem?
Try resetting target
No reply.
JLinkError: DAP error while reading AHB-AP IDR. 
WARNING: Could not connect to target device
ERROR: Could not connect debugger.
JLinkError: DAP error while reading AHB-AP IDR. 
WARNING: Could not connect to target device
ERROR: Could not connect debugger.
DONE
 
 
% commander device -d efr32 recover
Recovering "bricked" device...
JLinkError: Communication timed out: Requested 4 bytes, received 0 bytes ! 
Partial data received, out of sync problem?
Try resetting target
ERROR: Unlock failed with error code -19 (Device recovery failed.)
 
% ./JLinkExe -If SWD -Speed 5000 -Device Cortex-M4 -CommanderScript ../EFR_deBrick.jlink
SEGGER J-Link Commander V6.16f (Compiled Jul  3 2017 15:59:46)
DLL version V6.16f, compiled Jul  3 2017 15:59:33
 
Script file read successfully.
Processing script file...
 
J-Link connection not established yet but required for command.
Connecting to J-Link via USB...O.K.
Firmware: Silicon Labs J-Link Pro OB compiled Feb 15 2017 15:32:25
Hardware version: V4.00
S/N: 440083889
IP-Addr: DHCP (no addr. received yet)
VTref = 3.646V
Selecting SWD as current target interface.
 
Target connection not established yet but required for command.
Device "CORTEX-M4" selected.
 
Connecting to target via SWD
Found SW-DP with ID 0x2BA01477
Scanning APs, stopping at first AHB-AP found.
Found SW-DP with ID 0x2BA01477
Scanning APs, stopping at first AHB-AP found.
 
****** Error: Connect: Communication error when trying to read IDR of AP[0].
Found SW-DP with ID 0x2BA01477
Scanning APs, stopping at first AHB-AP found.
Found SW-DP with ID 0x2BA01477
Scanning APs, stopping at first AHB-AP found.
Cannot connect to target.
Found SW-DP with ID 0x2BA01477
Scanning APs, stopping at first AHB-AP found.
Found SW-DP with ID 0x2BA01477
Scanning APs, stopping at first AHB-AP found.
Reset type UNKNOWN: ???
 
Sleep(10)
Write DP register 2 = 0xFF000000 ***ERROR
Write AP register 3 = 0x00000001
Sleep(1000)
 
Sleep(1000)
Write DP register 2 = 0xFF000000 ***ERROR
Write AP register 1 = 0xCFACC118 ***ERROR
Write DP register 2 = 0xFF000000 ***ERROR
Write AP register 0 = 0x00000001 ***ERROR
Write DP register 2 = 0xFF000000 ***ERROR
Read AP register 2 = ERROR
Read DP register 3 = ERROR
Sleep(1000)
Script processing completed.
 
Type "connect" to establish a target connection, '?' for help
J-Link>
```

查到的这解决的办法，是unlock以后，重新写入了一个不安全的BL，之后就恢复正常了。



## 类似情况



#### JLink版本太老

另外一个是老版本的JLink确实存在问题，升级就可以了。

这个老版本大概是6.16之前的，可以现在出问题的是6.32，虽然也是老版本，但是已经用了很久了。

> https://forum.segger.com/index.php/Thread/4088-DAP-error-while-reading-AHB-AP-IDR/



#### 分析

另外一个分析，是写错了地方，导致芯片lock了，然后后续unlock又导致芯片读保护了，所以要接上reset线以后再去操作，才能解开读保护，恢复正常。总而言之需要先解lock，再解读保护两步操作。

> https://forum.segger.com/index.php/Thread/5953-SOLVED-JLink-not-connecting-to-NXP-K20-DAP-error-reading/



#### NXP解锁脚本

看起来是MKV31F51被lock了，FAE提供了一个JLink解锁脚本，不过好像都没解锁成功

> https://community.nxp.com/t5/Kinetis-Microcontrollers/DAP-error-while-reading-AIRCR-CPUID-register/m-p/708857
>
> https://community.nxp.com/t5/Kinetis-Microcontrollers/MKV31F512-is-locked-in-secure-state/m-p/639134



#### SEGGER

一样无解

> https://forum.segger.com/index.php/Thread/3206-SOLVED-DAP-error-while-reading-aircr-cpuid-register/?page=Thread&threadID=3206



#### 全片删除

有些直接连上以后，全片删除就可以正常工作了，而我现在无法连上，所以也解不了。

> https://devzone.nordicsemi.com/f/nordic-q-a/12532/regarding-recover-pca10028



#### 换用ST-Link

只能说没用，连都连不上

> https://www.stmcu.org.cn/module/forum/forum.php?mod=viewthread&tid=615143&page=1&mobile=no



## 尝试

首先使用`JLinkSTM32.exe`尝试解锁

![image-20221214093811750](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212140938967.png)

会看到他在重置option bytes，等一段时间以后，重置完成，再次重连，一样不行。

这里遇到的情况，比他们的要严重一些。在连接阶段就直接报错了，而不是连上以后操作报错了，所以暂时无解。更别说下一步重新烧写固件了，根本做不到啊。



## Summary

解不了，等以后遇到了再说吧



## Quote

> https://community.silabs.com/s/question/0D51M00007xeMCkSAM/cannot-connect-to-target-device?language=en_US
>
> https://community.silabs.com/s/question/0D51M00007xeLmtSAE/efr32-fail-to-recover-bricked-device
>
> https://devzone.nordicsemi.com/f/nordic-q-a/85422/jlinkarm-dll-reported-an-error-with-jlink-mini



