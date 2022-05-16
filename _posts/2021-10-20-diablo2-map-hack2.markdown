---
layout:     post
title:      "我的暗黑2重置版地图插件"
subtitle:   "maphack,hackmap,D2RAssist"
date:       2021-10-20
update:     2022-05-16
author:     "elmagnifico"
header-img: "img/zerotier.jpg"
catalog:    true
tags:
    - Game
---

## Forward

由于时差还有翻译问题，所以我直接独立更新一个D2RAssist，但是同时也实时合并D2RAssist最新的commit。我也能写自己的功能上去。



本篇文章已经过老了，请关注群或者仓库更新

> https://github.com/elmagnificogi/MapAssist



## 视频

<iframe src="//player.bilibili.com/player.html?aid=341498840&bvid=BV1BR4y1A7Uc&cid=715224439&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width=640 height=480> </iframe>



## 使用说明

- **风险自负，慎用，代码我看过了，读内存的，存在风险**



由于之前需要安装暗黑2太麻烦了，所以直接打包了一个所需要的文件，但是就算这样也有1g大小，不算小了。



第一次安装务必下载免安装包，后续更新只需要替换同名文件即可，不需要改动老暗黑客户端（不需要重下1g的客户端）



![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/yQcYJgfIt7POZCq.png)

直接运行，已经打包了需要的暗黑文件，打开以后保持不要关闭命令行就行了

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/O4frTuRZg5xlcGp.png)



然后打开 D2RAssist.exe，再打开游戏即可。



## 配置修改

打开同目录下的D2RAssist.exe.config，用txt打开或者其他的什么都行

能看到类似的内容，下面有具体解释都是什么意思，自己改就行了

```xml
<?xml version="1.0" encoding="utf-8"?>

<configuration>
    <startup>
        <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.7.2" />
    </startup>
    <runtime>
        <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
            <dependentAssembly>
                <assemblyIdentity name="System.Runtime.CompilerServices.Unsafe" publicKeyToken="b03f5f7f11d50a3a"
                                  culture="neutral" />
                <bindingRedirect oldVersion="0.0.0.0-5.0.0.0" newVersion="5.0.0.0" />
            </dependentAssembly>
        </assemblyBinding>
    </runtime>
    <appSettings>
        <add key="ApiEndpoint" value="http://localhost:8080/" />
		<!--地图透明度-->
        <add key="Opacity" value="0.7" />
        <add key="UpdateTime" value="100" />
        <add key="HideInTown" value="true" />
		<!--随游戏内地图显示而显示-->
        <add key="ToggleViaInGameMap" value="true" />
        <add key="AlwaysOnTop" value="true" />
		<!--地图大小-->
        <add key="Size" value="450" />
		<!--地图是否旋转-->
        <add key="Rotate" value="true" />
		<!--地图位置 一共有4种值        
		                        TopLeft
                                TopRight
                                Center
                                Custom
			自己选择合适的即可
		-->
        <add key="MapPosition" value="TopRight" />
		<!--只有当MapPosition是Custom的时候，下面的值才生效-->
		<!--MapPositionCustomX 表示地图左上角距离屏幕左侧的距离  自行调整(调整后需要重启，不要超过你屏幕分辨率)
		    MapPositionCustomY 表示地图左上角距离屏幕上侧的距离  自行调整(调整后需要重启，不要超过你屏幕分辨率)
		-->
		<add key="MapPositionCustomX" value="315" />
		<add key="MapPositionCustomY" value="735" />
		<!--快捷键-->
        <add key="ToggleKey" value="\" />
        <add key="ClearPrefetchedOnAreaChange" value="false" />
        <add key="PrefetchAreas" value="Catacombs Level 2,Durance Of Hate Level 2" />
		<!--下面是各种颜色，含义是R,G,B 范围0-255-->
        <add key="Waypoint.IconColor" value="16, 140, 235" />
        <add key="Waypoint.IconShape" value="Rectangle" />
        <add key="Waypoint.IconSize" value="10" />

        <add key="Player.IconColor" value="255, 255, 0" />
        <add key="Player.IconShape" value="Rectangle" />
        <add key="Player.IconSize" value="5" />

```



## log

2021.10.19.01.16

- 地图居中显示
- 地图放大
- 地图角度修改
- 地图颜色调整
- 地图文字全部繁体显示，可能有部分内部英文没找到，没翻译，等下次更新

2021.10.20.11.00

- 随游戏更新而更新

2021.10.20.23.19

- 新增自动内存偏移扫描（理论上不会因为游戏更新而失效了）
- 增加自定义地图位置的配置
- 增加地图配置说明
- 部分洞穴类入口处存在地图地块可能没显示的问题修复

2021.10.22.02.13

- 修改地图颜色，地图显示更清晰了
- 合并到最新
- 修复关闭地图时总是会报错

2021.10.23.18.34

- 同步更新
- 自动地址偏移探测

2022.4.16.12.55

- 更新到最新版

2022.4.30.02.20

- 更新到天梯，不用手动选择地图了



## 已知问题

- 后续会把地图整合到一起，开关也弄到一起
- 打不开或者没反应的，**用管理员权限启动D2RAssist.exe**

10.23更新到666版本以后，出现了偏移地址不正确的问题，看起来像是被加密了一下，并且偏移每次小退，都会变化。在Discord蹲了半天，就看一大佬来回试偏移，搞了5个偏移出来，最后被人直接用暴力搜索，然后加一点小过滤给解了，感觉白弄了那么久。由于偏移本身是过滤出来的，有可能出错，所有偶尔有时候可能地图会跳或者错误，暂时无解。而D2RAssist的作者直接由于获取偏移的代码抖很奇怪，所以直接不更新了，hhhhhhh。



## ~~游戏更新无法使用~~

~~由于内存自动扫描无法正常工作，所以游戏往往更新的时候没办法正常使用，想要偷用一下也是有方法的，但是**风险比较高，不推荐使用**。~~



~~下载老客户的的exe，直接覆盖暗黑2源文件中的exe~~

> ~~https://github.com/elmagnificogi/D2RAssist/releases/tag/OLD_Client~~

~~地图插件就直接用老的就行了。~~

~~但是这个方法只是临时用一下，不要长期使用，**很容易被检测，被封禁~~**



## 售卖问题

纯免费，不受卖，目前已知有人拿我的东西去暗黑核上卖，那不是我本人，说清楚，我不负责

有傻逼偷了我的东西去卖，也非我本人，我顶多提供收费技术支持一下（看心情），所有东西都是免费的，你自己能弄好就用，弄不好就算了。

> https://www.caimogu.net/post/76977.html?page=1



更新群：941746977



## Summary

不定期更新

建议后期配合我的MA_Filter一起使用，效果更好

> https://github.com/elmagnificogi/MA_Filter



## Quote

>https://github.com/OneXDeveloper/D2RAssist/wiki/Installation
>
>https://discord.com/invite/5b2B7QrVqa
>
>https://github.com/blacha/diablo2/issues/178

