---
layout:     post
title:      "雾锁王国"
subtitle:   "steam、Enshrouded、英灵神殿"
date:       2024-02-05
update:     2024-02-05
author:     "elmagnifico"
header-img: "img/z8.jpg"
catalog:    true
tobecontinued: false
tags:
    - Enshrouded
    - Game
---

## Foreword

雾锁王国，高清版英灵神殿，发售时间好巧不巧遇到了帕鲁，虽然也百万套了，不过被帕鲁抢了太多风头了



## 服务器需求

![image-20240205170546145](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051705457.png)

- CPU，4cores
- RAM，16G，这次直接给32G，防止意外
- Network，Port UDP 15636、15637
- 硬盘，30G，建议给多点，不支持linux

比较麻烦的是雾锁王国没有linux服务器，目前有的linux使用docker，内涵了wine等转译方式运行的steam和游戏，这种如果游戏更新了，docker没更新就跟不上，那就不如自己windows开一个得了



## linux

linux版本建服，可以参考这里

> https://github.com/PR3SIDENT/enshrouded-server



## windows



### 安装

首先安装steamcmd

```
https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip
```

解压后运行

![image-20240205180458265](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051804304.png)

完成以后就有steam的基础环境了

![image-20240205180513206](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051805242.png)



接着上面的命令行，继续执行，匿名登陆

```
login anonymous
```



下载游戏

```
app_update 2278520 validate
```

![image-20240205181139524](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051811560.png)

退出

```
quit
```



服务器启动路径

```
\steamcmd\steamapps\common\EnshroudedServer\enshrouded_server.exe
```

![image-20240205181222803](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051812842.png)

服务器第一次启动以后会生成`enshrouded_server.json`配置文件，就可以修改服务器参数了



### 更新

一样使用这个代码进行更新就行了

```
steamcmd +login anonymous +app_update 2278520 validate +quit
```



## 服务器设置

配置路径

```
\steamcmd\steamapps\common\EnshroudedServer\enshrouded_server.json
```



#### 修改游戏设置

配置比较简单

```
{
	"name": "elmagnifico's游戏屋频道专服（仅限可语音玩家）",
	"password": "1207",
	"saveDirectory": "./savegame",
	"logDirectory": "./logs",
	"ip": "0.0.0.0",
	"gamePort": 15636,
	"queryPort": 15637,
	"slotCount": 16
}
```

存档就对应在

```
\steamcmd\steamapps\common\EnshroudedServer\savegame
```





## 测试

服务器正常启动提示：

```bat
[ecss] TaskQueue:  workerCount:3   taskWorkerCount:2   0000000000000000000000000000000000000000000000000000000000000110
[TerraformingEfficiencyRegistry] Finished loading.
[ecs] Nobuild zones changed
[ecs] Build zones changed
[ecs] Build zones changed
[savexxx] LOAD 0 bases 0 entities
[ecs] readEntitySerializationContext: Templates: 1  Components: 5  Size: 1,344
[guid_registry] VoxelBlueprintRegistry: Finished loading entry e284b901-c3dd-4282-8a4e-0a618e5763f5.
[guid_registry] VoxelBlueprintRegistry: Finished loading entry 27a9e067-4b9f-45cf-b966-208a5ecbd53b.
[guid_registry] VoxelBlueprintRegistry: Finished loading entry 85e3baea-7c93-4d6f-b1be-42f79b036761.
[guid_registry] VoxelBlueprintRegistry: Finished loading entry 28c4b2ca-4a01-4ba9-9e05-49c871df6904.
[guid_registry] VoxelBlueprintRegistry: Finished loading entry ec28c5d5-9d23-413e-b238-781157fb2f65.
[guid_registry] VoxelBlueprintRegistry: Finished loading entry 5d9bd376-5b7f-4db4-8f2e-6a3e564194b1.
[guid_registry] VoxelBlueprintRegistry: Finished loading entry 34aa0c3c-9a88-4f8b-a070-64827a5fdabf.
[online] Server connected to Steam successfully
[online] Server is not VAC Secure!
[online] Server SteamId: 90180418385690629
[online] Public ipv4: 你的ip
[OnlineProviderSteam] 'Initialize' (up)!
[OnlineProviderSteam] 'JoinOrCreateGame' (up)!
[OnlineProviderSteam] 'SetLobbyData' (up)!
[OnlineProviderSteam] 'JoinLocalPlayers' (up)!
[OnlineProviderSteam] 'ConnectToPeers' (up)!
[OnlineProviderSteam] finished transition from 'Uninitialized' to 'InGame' (current='InGame')!
[Session] 'HostOnline' (up)!
[Session] finished transition from 'Lobby' to 'Host_Online' (current='Host_Online')!
[server] Load deserialization took 2.83 s
```



启动成功以后可以在steam的游戏服务器管理列表中看到

![image-20240205182945539](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051829634.png)



游戏内也可以了

![image-20240205183011698](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051830629.png)





正常进入后会有以下提示

```bat
[tracking] Post Request failed with error: request time out
[online] Session accepted with peer ( id 你的steamid ).
[online] Added Peer #0.
[online] Client '你的steamid' authenticated by steam
[session] Unable to find machine for peer 0.
[SessionPlayer] started transition from 'Free' to 'Remote_InSession' (current='<invalid>')!
[session] Remote player added. Player handle: 0(0)
[SessionPlayer] 'Reserve' (up)!
[SessionPlayer] 'WaitForJoin' (up)!
[SessionPlayer] finished transition from 'Free' to 'Remote_InSession' (current='Remote_InSession')!
Received new Character save game
[server] Machine '1': Player '0(0)' logged in
[ecs] readEntitySerializationContext: Templates: 2  Components: 169  Size: 41,064
[ecss] message BuildingZones is big: 3,018
[ecss] Send BuildingZones
[g38_knowledge::handleUnlockEvents] New world knowledge unlocked '9841fa85'
```



## 常见问题

出现加入服务器提示错误，重启一下服务器，有个什么缓存不太正确

![image-20240205183835618](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051838702.png)



进服务端一直转圈黑屏，重新验证一下游戏完整性

![image-20240205184727843](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051847881.png)

还有一个可能显卡驱动会导致这里一直转圈，更新显卡驱动以后再进入就好了



服务器经常启动不了，建议多启动几次，说不定哪次就行了



## Summary

垃圾服务器



## Quote

>  https://www.reddit.com/r/Enshrouded/comments/1af5mcb/linux_dedicated_server_creation_guide/
>
>  https://hub.docker.com/r/sknnr/enshrouded-dedicated-server
>
>  https://github.com/PR3SIDENT/enshrouded-server
>
>  https://www.bilibili.com/opus/890187140990763030
>
>  https://zhuanlan.zhihu.com/p/680928574



