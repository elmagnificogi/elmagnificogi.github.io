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



下载安装游戏

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

默认端口在27015 和7777 UDP，防火墙和路由需要放行，最大人数MaxServerPlayers，是6个人，可以更多



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
如果想要更换存档，请在RunServer.bat中添加下方内容

```
-WorldSaveName=xxxxx
```

将改为存档文件夹的名称



#### 服务器参数

```
steamapps\common\Abiotic Factor Dedicated Server\AbioticFactor\Saved\SaveGames\Server\Worlds\(世界名称，默认为Cascade)\SandboxSettings.ini
```

修改即可



### 测试



### 命令

命令参考这里

> https://github.com/StunlockStudios/vrising-dedicated-server-instructions/blob/master/1.0.x/INSTRUCTIONS.md



## Summary

可以玩了



## Quote

> https://steamcommunity.com/sharedfiles/filedetails/?id=3245622129
