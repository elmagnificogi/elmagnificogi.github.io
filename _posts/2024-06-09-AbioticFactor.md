---

layout:     post
title:      "Abiotic Factor开服指南"
subtitle:   "非生物因子，windows，steamCMD"
date:       2024-06-09
update:     2024-06-09
author:     "elmagnifico"
header-img: "img/x8.jpg"
catalog:    true
tobecontinued: false
tags:
    - Game
---

## Foreword

Abiotic Factor 最近也很火，类似僵尸毁灭工程的一个游戏，但是剧情比僵毁要完整，有一定的解密性，同时配合探索、生存、战斗元素，有点意思



## Abiotic Factor 非生物因子

> https://store.steampowered.com/app/427410/Abiotic_Factor/

服务器要求是windows，通过steamcmd



### 安装

下载安装游戏服务器

```
steamcmd +login anonymous +app_update 2857200 +quit  
```

建议存储成bat脚本，更新也是通过这种方式



###  部署

服务器程序目录

```
steamcmd\steamapps\common\Abiotic Factor Dedicated Server\AbioticFactor\Binaries\Win64
```



![image-20240609191059128](https://img.elmagnifico.tech/static/upload/elmagnifico/202406091911218.png)



新建`start_server.bat`文件，输入以下内容

```
AbioticFactorServer-Win64-Shipping.exe -log -newconsole -useperfthreads -NoAsyncLoadingThread -MaxServerPlayers=6 -PORT=7777 -QueryPort=27015 -ServerPassword=服务器密码 -SteamServerName="服务器名称"

```

默认端口在27015 和7777 UDP和TCP都放开，防火墙和路由需要放行，最大人数MaxServerPlayers，是6个人，可以更多



先启动一次，生成默认配置，方便增加管理员ID

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202406091919731.png)

启动以后会生成对应的存档文件，管理员在这个路径下

```
steamapps\common\Abiotic Factor Dedicated Server\AbioticFactor\Saved\SaveGames\Server\
```

![image-20240609192058846](https://img.elmagnifico.tech/static/upload/elmagnifico/202406091920877.png)

修改管理员ID为你自己的steam id



#### 存档

普通steam 玩家的存档路径

```
(用户文档)\AppData\Local\AbioticFactor\Saved\SaveGames\(你的SteamID)\Worlds\
```

将需要的世界存档复制到服务器的下方位置

```
steamapps\common\Abiotic Factor Dedicated Server\AbioticFactor\Saved\SaveGames\Server\Worlds\
```

服务器默认使用上方路径中的 ***Cascade*** 世界存档。

![image-20240609201036253](https://img.elmagnifico.tech/static/upload/elmagnifico/202406092010285.png)

如果想要更换存档，请在RunServer.bat中添加下方内容

```
-WorldSaveName=xxxxx
```

将改为存档文件夹的名称



#### 服务器参数

```
steamapps\common\Abiotic Factor Dedicated Server\AbioticFactor\Saved\SaveGames\Server\Worlds\(世界名称，默认为Cascade)\SandboxSettings.ini
```

修改即可，没有的话可以自己建一个，在服务器启动参数中添加

```
-SandboxIniPath=你的配置文件.ini
```



```
[SandboxSettings]
; If true, resources will spontaneously respawn around the Facility
LootRespawnEnabled=False

; By default, power in the Facility is shut off at night, including power sockets
PowerSocketsOffAtNight=True

; This setting will allow you to disable the Day Night Cycle
DayNightCycleState=0

; Speed multiplier for the Day and Night cycle
DayNightCycleSpeedMultiplier=1.0

; In the world, sinks will passively refill over time, allowing players to drink from them
SinkRefillRate=1.0

; This value determines how fast food spoils
FoodSpoilSpeedMultiplier=1.0

; This value determines how effective it is to refrigerate items
RefrigerationEffectivenessMultiplier=1.0

; This value determines how frequently enemies respawn
EnemySpawnRate=1.0

; This is a multiplier of enemy health
EnemyHealthMultiplier=1.0

; This value will determine how damaging enemies are, as a multiplier of their damage
EnemyPlayerDamageMultiplier=1.0

; This value will determine how much damage enemies do to deployables, as a multiplier of their damage
EnemyDeployableDamageMultiplier=1.0

; This value will determine how much damage players do to other players, as a proportion of normal damage
DamageToAlliesMultiplier=0.5

; This value is a multiplier and determines how fast Hunger increases
HungerSpeedMultiplier=1.0

; This value is a multiplier and determines how fast Thirst increases
ThirstSpeedMultiplier=1.0

; This value is a multiplier and determines how fast Fatigue increases
FatigueSpeedMultiplier=1.0

; This value is a multiplier and determines how fast Continence drains
ContinenceSpeedMultiplier=1.0

; This multiplier will determine how fast enemies detect players
DetectionSpeedMultiplier=1.0

; This value is a multiplier and determines how fast XP is gained by players
PlayerXPGainMultiplier=1.0

; This is a multiplier of how many times you can stack items in an inventory slot
ItemStackSizeMultiplier=1.0

; This is a multiplier affecting how heavy items are in your inventory
ItemWeightMultiplier=1.0

; This is a multiplier for item durability
ItemDurabilityMultiplier=1.0

; This value will determine how much durability is lost on weapons and items in the player's inventory when respawning
DurabilityLossOnDeathMultiplier=0.1

; If false, players will not be notified when someone is killed by something
ShowDeathMessages=True

; If false, this will disable the ability to share item recipes with other players
AllowRecipeSharing=True

; If false, Pagers will not be useable in inventory or via the emote wheel
AllowPagers=True

; If false, players will be unable to transmogrify their armor to look like other pieces of armor using a certain piece of base equipment
AllowTransmog=True

; If true, this will remove the Research Minigames when unlocking new recipes and simply unlock the recipe right away
DisableResearchMinigame=False

; This will determine what penalties the player receives for respawning after death (or by using the Unstick option
DeathPenalties=1

; When true, all players will share the same recipe list instead of unlocking recipes individually
GlobalRecipeUnlocks=False

; When spawning into the world for the first time, this is the weapon players will receive
FirstTimeStartingWeapon=0
```



### 测试

![image-20240609200316992](https://img.elmagnifico.tech/static/upload/elmagnifico/202406092003052.png)

ok了，可以搜到了



## Summary

可以玩了



## Quote

> https://steamcommunity.com/sharedfiles/filedetails/?id=3245622129
>
> https://github.com/DFJacob/AbioticFactorDedicatedServer/wiki
>
> https://github.com/DFJacob/AbioticFactorDedicatedServer/wiki/Technical-%E2%80%90-Launch-Parameters
>
> https://github.com/DFJacob/AbioticFactorDedicatedServer/wiki/Technical-%E2%80%90-Sandbox-Options
