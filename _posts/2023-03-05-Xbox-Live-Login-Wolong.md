---
layout:     post
title:      "您无法登录Xbox Live解决方案"
subtitle:   "Xbox，卧龙苍天陨落，Xtcui"
date:       2023-03-05
update:     2023-03-05
author:     "elmagnifico"
header-img: "img/baidu.jpg"
catalog:    true
tags:
    - Game
---

## Foreword

帮朋友搞XGP白嫖卧龙，然后遇到Xbox无法登录，折腾一圈，回来一看解决办法简直搞笑



## 问题

简单说就是PC的Xbox登录就会提示这个，而且是秒弹

![image-20230305120036514](https://img.elmagnifico.tech/static/upload/elmagnifico/202303051200602.png)



## 解决方案

### 地区不对

一般来说地区不对是不提供游戏服务的，所以要把Windows地区修改到香港或者台湾，然后重启Xbox

![image-20230305122450877](https://img.elmagnifico.tech/static/upload/elmagnifico/202303051224950.png)



### 服务没启动

![image-20230305120606510](https://img.elmagnifico.tech/static/upload/elmagnifico/202303051206544.png)

这种情况比较多，不确定的话就全都启动一下



### 重装Xbox

大部分人不怎么用Xbox，所以很多Xbox特别老，某个服务已经无法用了，最好卸载重新装一下



### 缺少认证程序

Xbox Identity Provider 这个程序很多人都没有，也会造成无法登陆，重新安装即可

> https://www.microsoft.com/store/apps/9wzdncrd1hkw



### 认证服务可能被运营商短暂屏蔽

刷新DNS

```
ipconfig /flushdns
```



### 开了代理

取消系统内的代理，其实应该不走这里的，Xbox是UWP，需要专门工具处理

![image-20230305120811513](https://img.elmagnifico.tech/static/upload/elmagnifico/202303051208546.png)



### Windows回环代理取消

![image-20230305120927003](https://img.elmagnifico.tech/static/upload/elmagnifico/202303051209039.png)

确保取消，如果网络特别差，可以尝试使用回环代理，但是最好别用，会和其他加速器之类的东西冲突



### Xbox自带修复

![image-20230305122808631](https://img.elmagnifico.tech/static/upload/elmagnifico/202303051230207.png)

设置中有Xbox网络，等他加载完，使用修复



### Xbox网络修复

![image-20230305121023516](https://img.elmagnifico.tech/static/upload/elmagnifico/202303051210545.png)

UU等一众加速工具，Xbox网络修复，然后加速Xbox App，再尝试



### 网络重置

![image-20230305121117372](https://img.elmagnifico.tech/static/upload/elmagnifico/202303051211410.png)

确保网络没有乱设过任何其他东西，网络重置



下面的基本也是同理，不过上面重置更简单

```
然后鼠标右键点击开始菜单---- “Windows PowerShell (管理员)”，输入：
netsh winsock reset
回车
netsh int ip reset
回车
ipconfig /release
回车
ipconfig /renew
回车
ipconfig /flushdns
回车
ipconfig /registerdns
回车
然后鼠标右键点击开始菜单---运行，输入
inetcpl.cpl
回车
```



### Xbox提示需要修复

这个是微软的Game services，可能需要安装

> https://www.microsoft.com/store/productId/9MWPM2CQNLHN



这个是Xbox Live in-game experience，或者说是Xbox Tcui，可能他卡住了，但是如果装不上也没关系

> https://www.microsoft.com/store/productId/9NKNC0LD5NN6



### 切账户重新输入账号密码

![image-20230305121723516](https://img.elmagnifico.tech/static/upload/elmagnifico/202303051217560.png)

在这里通过不是本人，切账号进行登录，最好是重新输入账号密码，而不是使用已经登陆的账号



### 海外数据协议条款未勾选

大部分被卡住其实就是因为这个，Xbox由于不对中国提供服务，涉及到数据的问题，需要单独同意一个协议。而老一点的用户，肯定都没有单独勾选过或者说遇到这个协议，自然不存在同意了。Xbox登录的时候直接会判断此协议，而默认认为这个协议是拒绝的，这就造成Xbox登录秒失败了。

而要想把这个协议弹出来，就需要如下操作

> 先把微软商店账号注销，重启电脑，再登录微软商店，这时要重新输入账号密码，登上再打开Xbox就会弹出海外数据协议

其实前一个方法，切账号就会提示这个海外协议了，切账号发现能登录，但是原账号就是不行，查了老半天发现是这个协议没同意



### 其他

可能Windows有问题，缺少什么核心组件，最终大招，检测核心组件缺失，并进行修复

```
建议鼠标右键单击开始按钮（微软图标的按钮）→"Windows PowerShell(I)（管理员)(A ）”→输入：
（WIndows11中可能显示Windows 终端（管理员））
sfc /SCANNOW
（按下Enter键）
Dism /Online /Cleanup-Image /ScanHealth
（按下Enter键）
Dism /Online /Cleanup-Image /CheckHealth
（按下Enter键）
DISM /Online /Cleanup-image /RestoreHealth
（按下Enter键）
完成后重启电脑，再次输入：
Get-AppXPackage | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register “$($_.InstallLocation)\AppXManifest.xml”}
（按下Enter键）
（因为程序被占用无法执行的错误，是正常的，请忽略）
sfc /SCANNOW
（按下Enter键）
```



## Summary

基本所有Xbox可能遇到的情况都尝试了，折腾了两三个小时，发现就是简单的协议没同意，Xbox这登录判定也太蠢了，先判断协议再给登录，也真的坑。



## Quote

> https://blog.csdn.net/iningwei/article/details/107462255
>
> https://answers.microsoft.com/zh-hans/windows/forum/all/microsoft/525d2d23-4a53-4f45-8677-ee5448b60053
>
> https://www.bilibili.com/video/BV1oY411s7rh/?spm_id_from=333.788.recommend_more_video.-1&vd_source=fe2e37e9c6518671631012d39f18a581
>
> https://www.bilibili.com/video/BV1SL411Z7DN/?vd_source=fe2e37e9c6518671631012d39f18a581
