---

layout:     post
title:      "夜族崛起开服指南"
subtitle:   "V-Rising，windows，steamCMD"
date:       2024-05-19
update:     2024-05-19
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

具体配置

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

可以玩了



## Quote

> https://github.com/StunlockStudios/vrising-dedicated-server-instructions
>
> https://steamcommunity.com/sharedfiles/filedetails/?id=2866093247
