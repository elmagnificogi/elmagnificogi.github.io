---
layout:     post
title:      "VPS流媒体解锁测试"
subtitle:   "Netflix，HBO"
date:       2022-04-09
update:     2022-04-09
author:     "elmagnifico"
header-img: "img/drone.jpg"
catalog:    true
tags:
    - VPS
---

## Foreword

一键测试VPS各种流媒体是否解锁了



## StreamUnlockTest

> https://github.com/LovelyHaochi/StreamUnlockTest

用法非常简单，直接输入等他自动安装，自动检测即可

```
bash <(curl -sSL "https://git.io/JswGm")
```



下面是拿Oracle的24g内存的Arm测试的结果
```bash
###############################################################
#  流解锁测试 StreamUnlockTest
#  当前版本: v1.2.2
#  开源地址: https://github.com/LovelyHaochi/StreamUnlockTest
###############################################################
#  国家代码对照表: http://www.loglogo.com/front/countryCode/
#  测试时间: Sat Apr  9 10:15:32 CST 2022
###############################################################

- IPV4 -
 IP:					168.138.xx.xx
 Country:				Japan
 Region:				Tokyo
 City:					Tokyo
 ISP:					Oracle Corporation
 Org:					Oracle Cloud Infrastructure (ap-tokyo-1)

 -- Hong Kong --
 MyTVSuper:				No
 Now E:					No
 ViuTV:					No
 BiliBili Hongkong/Macau/Taiwan:	No

 -- Taiwan --
 4GTV.TV:				No
 KKTV:					No
 Hami Video:				No
 LineTV.TW:				No
 Bahamut Anime:				No
 Bilibili Taiwan Only:			No

 -- Japan --
 Abema.TV:				No
 Niconico:				Yes
 Paravi:				No
 U-NEXT:				Yes
 Hulu Japan:				No
 Fuji TV:				Yes
 Radiko:				Yes(Area: TOKYO)
 DMM:					Yes
 Princess Connect Re:Dive Japan:	No
 Pretty Derby Japan:			No
 Kancolle Japan:			No
 ErogameScape:				Yes

 -- Korea --
 Tving:					No
 KakaoTV:				Yes

 -- United States --
 Hulu United States:			->/dev/fd/63: line 701: warning: command substitution: ignored null byte in input
parse error: Invalid numeric literal at line 1, column 48
 Hulu United States:			Yes
 HBO Now:				No
 HBO Max:				No
 Paramount+:				No
 Peacock TV:				No
 Sling TV:				No
 Pluto TV:				No
 encoreTVB:				No
 ABC:					No

 -- Europe --
 BritBox:				Yes
 ITV Hub:				No
 Channel 4:				No
 BBC iPLAYER:				No
 Molotov:				No

 -- Porn --
 Biguz:					No
 Blacked:				Yes

 -- Global --
 DAZN:					No
 Netflix:				Yes(Region: JP)
 DisneyPlus:				No
 YouTube:				Yes(Region: JP)
 Amazon Prime Video:			Yes(Region: JP)
 Tiktok:				Yes(Region: JP)
 iQiyi Global:				Yes(Region: JP)
 Viu.com:				No
 Steam:					Yes(Currency: JPY)

- IPV6 -
当前主机不支持IPv6,跳过...

测试完成.

```

还是相当方便的



## Summary

MediaUnlock_Test就不用看了，原库已经删除了



## Quote

> https://www.fuwu7.com/jiaocheng/3240.html

