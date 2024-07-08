---

layout:     post
title:      "夜族崛起开服指南"
subtitle:   "V-Rising，windows，steamCMD"
date:       2024-05-19
update:     2024-07-08
author:     "elmagnifico"
header-img: "img/x5.jpg"
catalog:    true
tobecontinued: false
tags:
    - Game
---

## Foreword

听闻夜族崛起还不错，有点类似暗黑的刷子游戏，但是同时又支持自己开服和小伙伴一起玩，可以自己建家等等



## 夜族崛起

> https://store.steampowered.com/app/1604030/_/

还不错，有点类似暗黑的刷子游戏，但是同时又支持自己开服和小伙伴一起玩



服务器要求是windows，通过steamcmd



### 安装



下载安装游戏

```
steamcmd +login anonymous +app_update 1829350 +quit  
```

建议存储成bat脚本，更新也是通过这种方式



###  部署

服务器程序目录

```
steamcmd\steamapps\common\VRisingDedicatedServer
```



运行`start_server_example.bat`，即可开服

```
@echo off
REM Copy this script to your own file and modify to your content. This file can be overwritten when updating.
set SteamAppId=1604030
echo "Starting V Rising Dedicated Server - PRESS CTRL-C to exit"

@echo on
VRisingServer.exe -persistentDataPath .\save-data -serverName "My V Rising Server" -saveName "world1" -logFile ".\logs\VRisingServer.log"

```

建议第一次运行一下，生成一些默认配置，以供后续复制修改



默认端口在9876和9877 UDP，防火墙和路由需要放行



复制一下，修改为自定义服务器

```
@echo off
REM Copy this script to your own file and modify to your content. This file can be overwritten when updating.
set SteamAppId=1604030
echo "Starting V Rising Dedicated Server - PRESS CTRL-C to exit"

@echo on
VRisingServer.exe -persistentDataPath .\save-data -serverName "1207-elmagnifico" -saveName "1207" -logFile ".\logs\VRisingServer.log"
```



服务器的默认配置文件在

```
steamcmd\steamapps\common\VRisingDedicatedServer\VRisingServer_Data\StreamingAssets\Settings
```

![image-20240519224134168](https://img.elmagnifico.tech/static/upload/elmagnifico/202405192241249.png)



世界配置文件在

```
save-path\Settings
```

- adminlist.txt，管理员的steam64位id
- banlist.txt，用户封禁列表

- ServerHostSettings.json，服务器配置文件，从上面的默认配置复制一个
- ServerGameSettings，游戏世界配置文件，建议修改一下，从上面的默认配置复制一个

![image-20240519224142662](https://img.elmagnifico.tech/static/upload/elmagnifico/202405192241697.png)

ServerHostSettings具体配置

```json
{
  "Name": "1207-qq频道elmagnifico",
  "Description": "",
  "Port": 9876,
  "QueryPort": 9877,
  "MaxConnectedUsers": 40,
  "MaxConnectedAdmins": 4,
  "ServerFps": 30,
  "SaveName": "1207",
  "Password": "1207",
  "Secure": true,
  "ListOnSteam": true,
  "ListOnEOS": true,
  "AutoSaveCount": 20,
  "AutoSaveInterval": 120,
  "CompressSaveFiles": true,
  "GameSettingsPreset": "",
  "GameDifficultyPreset": "",
  "AdminOnlyDebugEvents": true,
  "DisableDebugEvents": false,
  "API": {
    "Enabled": false
  },
  "Rcon": {
    "Enabled": false,
    "Port": 25575,
    "Password": ""
  }
}
```

ListOnSteam 是可以让你的服务器被搜索到



ServerGameSettings配置，具体就是游戏难度相关内容了

```json
{
  "GameDifficulty": "Normal",
  "GameModeType": "PvE",
  "CastleDamageMode": "Never",
  "SiegeWeaponHealth": "Normal",
  "PlayerDamageMode": "Always",
  "CastleHeartDamageMode": "CanBeDestroyedByPlayers",
  "PvPProtectionMode": "Medium",
  "DeathContainerPermission": "Anyone",
  "RelicSpawnType": "Unique",
  "CanLootEnemyContainers": true,
  "BloodBoundEquipment": true,
  // 允许传送时携带不能传送物品
  "TeleportBoundItems": false,
  "BatBoundItems": false,
  "AllowGlobalChat": true,
  "AllWaypointsUnlocked": false,
  "FreeCastleRaid": false,
  "FreeCastleClaim": false,
  "FreeCastleDestroy": false,
  "InactivityKillEnabled": true,
  "InactivityKillTimeMin": 3600,
  "InactivityKillTimeMax": 604800,
  "InactivityKillSafeTimeAddition": 172800,
  "InactivityKillTimerMaxItemLevel": 84,
  "StartingProgressionLevel": 0,
  "DisableDisconnectedDeadEnabled": true,
  "DisableDisconnectedDeadTimer": 60,
  "DisconnectedSunImmunityTime": 300.0,
  "InventoryStacksModifier": 1.0,
  // 资源掉落倍率
  "DropTableModifier_General": 3.0,
  // 仆从采集掉落倍率
  "DropTableModifier_Missions": 3.0,
  // 资源采集倍率
  "MaterialYieldModifier_Global": 3.0,
  // 血液精华收集倍率
  "BloodEssenceYieldModifier": 3.0,
  "JournalVBloodSourceUnitMaxDistance": 25.0,
  "PvPVampireRespawnModifier": 1.0,
  "CastleMinimumDistanceInFloors": 2,
  "ClanSize": 4,
  "BloodDrainModifier": 1.0,
  "DurabilityDrainModifier": 1.0,
  "GarlicAreaStrengthModifier": 1.0,
  "HolyAreaStrengthModifier": 1.0,
  "SilverStrengthModifier": 1.0,
  "SunDamageModifier": 1.0,
  "CastleDecayRateModifier": 1.0,
  "CastleBloodEssenceDrainModifier": 1.0,
  "CastleSiegeTimer": 420.0,
  "CastleUnderAttackTimer": 60.0,
  "CastleRaidTimer": 600.0,
  "CastleRaidProtectionTime": 1800.0,
  "CastleExposedFreeClaimTimer": 300.0,
  "CastleRelocationCooldown": 10800.0,
  "CastleRelocationEnabled": true,
  "AnnounceSiegeWeaponSpawn": true,
  "ShowSiegeWeaponMapIcon": false,
  "BuildCostModifier": 1.0,
  "RecipeCostModifier": 1.0,
  // 制造速率
  "CraftRateModifier": 3.0,
  "ResearchCostModifier": 1.0,
  "RefinementCostModifier": 1.0,
  "RefinementRateModifier": 3.0,
  "ResearchTimeModifier": 1.0,
  "DismantleResourceModifier": 1.0,
  "ServantConvertRateModifier": 3.0,
  "RepairCostModifier": 1.0,
  "Death_DurabilityFactorLoss": 0.125,
  "Death_DurabilityLossFactorAsResources": 1.0,
  "StarterEquipmentId": 0,
  "StarterResourcesId": 0,
  "VBloodUnitSettings": [],
  "UnlockedAchievements": [],
  "UnlockedResearchs": [],
  "GameTimeModifiers": {
    "DayDurationInSeconds": 1080.0,
    "DayStartHour": 9,
    "DayStartMinute": 0,
    "DayEndHour": 17,
    "DayEndMinute": 0,
    "BloodMoonFrequency_Min": 10,
    "BloodMoonFrequency_Max": 18,
    "BloodMoonBuff": 0.2
  },
  "VampireStatModifiers": {
    "MaxHealthModifier": 1.0,
    "PhysicalPowerModifier": 1.0,
    "SpellPowerModifier": 1.0,
    "ResourcePowerModifier": 1.0,
    "SiegePowerModifier": 1.0,
    "DamageReceivedModifier": 1.0,
    "ReviveCancelDelay": 5.0
  },
  "UnitStatModifiers_Global": {
    "MaxHealthModifier": 1.0,
    "PowerModifier": 1.0,
    "LevelIncrease": 0
  },
  "UnitStatModifiers_VBlood": {
    "MaxHealthModifier": 1.0,
    "PowerModifier": 1.0,
    "LevelIncrease": 0
  },
  "EquipmentStatModifiers_Global": {
    "MaxHealthModifier": 1.0,
    "ResourceYieldModifier": 1.0,
    "PhysicalPowerModifier": 1.0,
    "SpellPowerModifier": 1.0,
    "SiegePowerModifier": 1.0,
    "MovementSpeedModifier": 1.0
  },
  "CastleStatModifiers_Global": {
    "TickPeriod": 5.0,
    "SafetyBoxLimit": 1,
    "EyeStructuresLimit": 1,
    "TombLimit": 12,
    "VerminNestLimit": 4,
    "PrisonCellLimit": 16,
    "HeartLimits": {
      "Level1": {
        "FloorLimit": 50,
        "ServantLimit": 4,
        "BuildLimits": 2,
        "HeightLimit": 3
      },
      "Level2": {
        "FloorLimit": 140,
        "ServantLimit": 5,
        "BuildLimits": 2,
        "HeightLimit": 3
      },
      "Level3": {
        "FloorLimit": 240,
        "ServantLimit": 6,
        "BuildLimits": 2,
        "HeightLimit": 3
      },
      "Level4": {
        "FloorLimit": 360,
        "ServantLimit": 7,
        "BuildLimits": 2,
        "HeightLimit": 3
      },
      "Level5": {
        "FloorLimit": 550,
        "ServantLimit": 8,
        "BuildLimits": 2,
        "HeightLimit": 3
      }
    },
    "CastleLimit": 2,
    "NetherGateLimit": 1,
    "ThroneOfDarknessLimit": 1
  },
  "PlayerInteractionSettings": {
    "TimeZone": "Local",
    "VSPlayerWeekdayTime": {
      "StartHour": 20,
      "StartMinute": 0,
      "EndHour": 22,
      "EndMinute": 0
    },
    "VSPlayerWeekendTime": {
      "StartHour": 20,
      "StartMinute": 0,
      "EndHour": 22,
      "EndMinute": 0
    },
    "VSCastleWeekdayTime": {
      "StartHour": 20,
      "StartMinute": 0,
      "EndHour": 22,
      "EndMinute": 0
    },
    "VSCastleWeekendTime": {
      "StartHour": 20,
      "StartMinute": 0,
      "EndHour": 22,
      "EndMinute": 0
    }
  },
  "TraderModifiers": {
    "StockModifier": 1.0,
    "PriceModifier": 1.0,
    "RestockTimerModifier": 1.0
  },
  "WarEventGameSettings": {
    "Interval": 1,
    "MajorDuration": 1,
    "MinorDuration": 1,
    "WeekdayTime": {
      "StartHour": 0,
      "StartMinute": 0,
      "EndHour": 23,
      "EndMinute": 59
    },
    "WeekendTime": {
      "StartHour": 0,
      "StartMinute": 0,
      "EndHour": 23,
      "EndMinute": 59
    },
    "ScalingPlayers1": {
      "PointsModifier": 1.0,
      "DropModifier": 1.0
    },
    "ScalingPlayers2": {
      "PointsModifier": 0.5,
      "DropModifier": 0.5
    },
    "ScalingPlayers3": {
      "PointsModifier": 0.25,
      "DropModifier": 0.25
    },
    "ScalingPlayers4": {
      "PointsModifier": 0.25,
      "DropModifier": 0.25
    }
  }
}
```



### 测试

![image-20240519232857610](https://img.elmagnifico.tech/static/upload/elmagnifico/202405192328652.png)

没问题，可以正常使用了



### 命令

命令参考这里

> https://github.com/StunlockStudios/vrising-dedicated-server-instructions/blob/master/1.0.x/INSTRUCTIONS.md



## 开服工具

> https://github.com/aghosto/V-Rising-Server-Manager---Chinese?tab=readme-ov-file

第三方开服工具，有UI，是直接一键安装所有东西的



## Summary

总体来说流程比较线性，后期肝度很高，整体难度还行



## Quote

> https://github.com/StunlockStudios/vrising-dedicated-server-instructions
>
> https://steamcommunity.com/sharedfiles/filedetails/?id=2866093247
>
> https://www.bisecthosting.com/clients/index.php?rp=/knowledgebase/1213/How-to-adjust-the-difficulty-settings-on-a-V-Rising-server.html
