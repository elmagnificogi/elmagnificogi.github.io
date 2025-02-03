---
layout:     post
title:      "雾锁王国服务器搭建"
subtitle:   "steam、Enshrouded、英灵神殿"
date:       2024-02-05
update:     2025-02-03
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



新版存档需要设置用户权限，可以这里设置

```json
  // 用户组设置
  "userGroups": [
    {
      "name": "Admin", // 用户组名称：管理员
      "password": "AdminXXXXXXXX", // 用户组密码
      "canKickBan": true, // 是否可以踢人和封禁，这里设置为可以
      "canAccessInventories": true, // 是否可以访问库存，这里设置为可以
      "canEditBase": true, // 是否可以编辑基地，这里设置为可以
      "canExtendBase": true, // 是否可以扩展基地，这里设置为可以
      "reservedSlots": 0 // 保留的插槽数量，这里设置为0
    },
    {
      "name": "Friend", // 用户组名称：朋友
      "password": "FriendXXXXXXXX", // 用户组密码
      "canKickBan": false, // 是否可以踢人和封禁，这里设置为不可以
      "canAccessInventories": true, // 是否可以访问库存，这里设置为可以
      "canEditBase": true, // 是否可以编辑基地，这里设置为可以
      "canExtendBase": false, // 是否可以扩展基地，这里设置为不可以
      "reservedSlots": 0 // 保留的插槽数量，这里设置为0
    },
    {
      "name": "Guest", // 用户组名称：访客
      "password": "GuestXXXXXXXX", // 用户组密码
      "canKickBan": false, // 是否可以踢人和封禁，这里设置为不可以
      "canAccessInventories": false, // 是否可以访问库存，这里设置为不可以
      "canEditBase": false, // 是否可以编辑基地，这里设置为不可以
      "canExtendBase": false, // 是否可以扩展基地，这里设置为不可以
      "reservedSlots": 0 // 保留的插槽数量，这里设置为0
    }
  ]
```



具体的游戏内的配置

```json
  // 自定义的游戏设置
  "gameSettings": {
    "playerHealthFactor": 1, // 玩家健康的影响因子，这里设置为1
    "playerManaFactor": 1, // 玩家魔法的影响因子，这里设置为1
    "playerStaminaFactor": 1, // 玩家耐力的影响因子，这里设置为1
    "playerBodyHeatFactor": 1, // 玩家体温的影响因子，这里设置为1
    "enableDurability": true, // 是否启用耐久度系统，这里设置为启用
    "enableStarvingDebuff": false, // 是否启用饥饿减益，这里设置为不启用
    "foodBuffDurationFactor": 1, // 食物增益持续时间的影响因子，这里设置为1
    "fromHungerToStarving": 600000000000, // 从饥饿到饿死的时间（以纳秒为单位），这里设置为600亿纳秒
    "shroudTimeFactor": 1, // 迷雾时间的影响因子，这里设置为1
    "tombstoneMode": "AddBackpackMaterials", // 墓碑模式，这里设置为在玩家死亡时添加背包材料
    "enableGliderTurbulences": true, // 是否启用滑翔伞湍流，这里设置为启用
    "weatherFrequency": "Normal", // 天气现象频率，这里设置为正常
    "miningDamageFactor": 1, // 采矿伤害的影响因子，这里设置为1
    "plantGrowthSpeedFactor": 1, // 植物生长速度的影响因子，这里设置为1
    "resourceDropStackAmountFactor": 1, // 资源掉落堆叠数量的影响因子，这里设置为1
    "factoryProductionSpeedFactor": 1, // 工厂生产速度的影响因子，这里设置为1
    "perkUpgradeRecyclingFactor": 0.500000, // 技能升级回收的影响因子，这里设置为0.5
    "perkCostFactor": 1, // 技能成本的影响因子，这里设置为1
    "experienceCombatFactor": 1, // 战斗经验的影响因子，这里设置为1
    "experienceMiningFactor": 1, // 采矿经验的影响因子，这里设置为1
    "experienceExplorationQuestsFactor": 1, // 探索任务经验的影响因子，这里设置为1
    "randomSpawnerAmount": "Normal", // 随机生成怪物的数量，这里设置为正常
    "aggroPoolAmount": "Normal", // 敌对生物池的数量，这里设置为正常
    "enemyDamageFactor": 1, // 敌人伤害的影响因子，这里设置为1
    "enemyHealthFactor": 1, // 敌人健康的影响因子，这里设置为1
    "enemyStaminaFactor": 1, // 敌人耐力的影响因子，这里设置为1
    "enemyPerceptionRangeFactor": 1, // 敌人感知范围的影响因子，这里设置为1
    "bossDamageFactor": 1, // 首领伤害的影响因子，这里设置为1
    "bossHealthFactor": 1, // 首领健康的影响因子，这里设置为1
    "threatBonus": 1, // 威胁加成，这里设置为1
    "pacifyAllEnemies": false, // 是否平息所有敌人，这里设置为不启用
    "tamingStartleRepercussion": "LoseSomeProgress", // 驯服惊吓反应，这里设置为失去一些进度
    "dayTimeDuration": 1800000000000, // 白天持续时间（以纳秒为单位），这里设置为1800亿纳秒
    "nightTimeDuration": 720000000000 // 夜晚持续时间（以纳秒为单位），这里设置为720亿纳秒
  },
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

#### 连接服务器

出现加入服务器提示错误，重启一下服务器，有个什么缓存不太正确

![image-20240205183835618](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051838702.png)



进服务端一直转圈黑屏，重新验证一下游戏完整性

![image-20240205184727843](https://img.elmagnifico.tech/static/upload/elmagnifico/202402051847881.png)

还有一个可能显卡驱动会导致这里一直转圈，更新显卡驱动以后再进入就好了



服务器经常启动不了，建议多启动几次，说不定哪次就行了



#### 迁移数据

从本地Host迁移到服务器，搜索`3ad85aea` 找到路径，这里面的就是服务器存档信息，复制到savegame里即可



#### 负载过高

游戏内提示负载过高，似乎没有办法缓解，2个人还可以随便玩，但是三个人就不行了，内存占用不多6G都不到，cpu负载也跑不满，但是看起来大部分时间是一个核心在干活，总体来说应该是官方给的开服工具优化不够，或者说服务器优化不行，性能很差



#### 延迟过高

服务器延迟可能不高，但是游戏内的延迟是通过另一种方式计算得到的，延迟似乎是网络延迟的2倍以上，我十几秒的延迟，到了游戏里都会变成三四十左右，人一多，同时在多个地方同时操作，就更容易让这个延迟爆炸



实际上游戏内置了服务器购买，有足够理由相信是官方为了吃这个回扣给了专门的优化，太多人是买服就不卡，自己服就卡的要死了，发售都过了一年了这个还不优化，属实离谱



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
>
>  https://www.bilibili.com/opus/1000897915952037896
>
>  https://www.reddit.com/r/Enshrouded/comments/1aeeag0/dedicated_server_server_overloaded/
>
>  https://enshrouded.zendesk.com/hc/en-us/sections/16050842957085-Multiplayer-and-Server-Hosting



