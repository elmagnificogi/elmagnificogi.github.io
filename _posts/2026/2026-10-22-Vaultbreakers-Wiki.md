---
layout:     post
title:      "龙窟破坏者Wiki"
subtitle:   "Vaultbreakers，Addressables，UnityFS，IL2CPP，本地化，掉落表"
description: "龙窟破坏者 Demo 资料页提取：从安装目录判断资源位置，读 catalog 与 UnityFS bundle，对照中英文，定位掉落、任务和装备数据。"
date:       2026-10-22
update:     2026-10-27
author:     "elmagnifico"
header-img: "img/head-2026-10-22.jpg"
catalog:    true
mermaid:    false
tobecontinued: false
tags:
    - Game
    - Wiki
    - Unity
---

## Foreword

最近发现一个有意思的游戏，龙窟破坏者，操作方式类似LOL，但是搜打撤，同时又能自定义PVE还是PVP，LOL但凡能早点进入这个游戏类目，也不至于只有LOL，跟不上时代了都。

他又不像梦之形，东西带不出来，每次都要重新成长，重新Build，对局时间又短，短平快，更符合当下大众需求，感觉日后成长起来是一款不错的游戏

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202610221414624.png)

这年头，游戏资料什么的，已经不再是以前从贴吧、Wiki或者什么地方就能直接找到了，越来越难搜了。而且玩家社区不集中，经常需要点什么找不到，信息差反而比以前更大了，于是自己动手写一个Wiki，之前其实已经给一个游戏跑了一次Wiki的流程，这次算是比较熟悉他的套路了。

页面在 [VaultbreakersWiki](https://github.com/elmagnificogi/VaultbreakersWiki)，解压以后双击 `龙窟破坏者WIKI.html` 就能看。



## 静态资源

装好游戏之后，先看一下游戏文件，有哪些内容，初步判断一下。



### 安装根目录

| 名字 | 大概干什么 | 可能装什么 |
| --- | --- | --- |
| `Vaultbreakers.exe` | 双击启动的程序 | 入口，游戏逻辑不在这里 |
| `UnityPlayer.dll` | Unity 播放器 | 引擎本身；有它基本就能断定这是 Unity 游戏 |
| `UnityCrashHandler64.exe` | 崩溃时的处理程序 | 崩溃报告相关，跟掉落、图标无关 |
| `GameAssembly.dll` | 游戏自己的脚本被编译后的大文件，约 160 MB | 类、方法这些程序逻辑；旁边没有 `Managed` 文件夹，说明不是那种留下很多 C# dll 的打包方式 |
| `baselib.dll` | Unity 自带的基础库 | 引擎底层，不用管 |
| `nvngx_dlss.dll`、`NVUnityPlugin.dll` | NVIDIA 画质相关插件 | DLSS 一类，和资料页无关 |
| `changelog.txt` | 更新说明 | 给玩家看的文字 |

根目录里看不到物品表、怪物表。逻辑在 `GameAssembly.dll` 里，资源在下面的 `Vaultbreakers_Data`。



### Vaultbreakers_Data

| 名字 | 大概干什么 | 可能装什么 |
| --- | --- | --- |
| `app.info` | 记事本就能打开的两行字 | 公司名 `BetaDwarf ApS`，产品名 `Vaultbreakers` |
| `boot.config` | 启动时的引擎开关 | 画面线程、调试之类，没有玩法表 |
| `globalgamemanagers` | Unity 的全局管理文件 | 画质、输入、版本字符串这类整局设置 |
| `globalgamemanagers.assets` + `.resS` | 上面那份设置用到的资源 | 启动就要带上的一小批资源；`.resS` 多半是贴图像素 |
| `level0` | 启动关卡的壳 | 很小，真正的大地图不在这里 |
| `sharedassets0.assets` + `.resS` | 和启动关卡绑在一起的资源 | 体积不大，不是一万多个包那种体量 |
| `resources.assets` + `.resS` | 启动时就加载的大资源包，合计约 580 MB | 引擎和项目早期塞进 Resources 的东西；文件名是固定的，不会写成某一张地图或某一种物品 |
| `ScriptingAssemblies.json` | 编译时用过哪些程序集的名单 | 名字里能看到 Addressables、Localization、FMOD、MessagePack；对应的 dll 文件磁盘上没有，已经编进 `GameAssembly.dll` |
| `RuntimeInitializeOnLoads.json` | 启动时要自动跑哪些初始化 | 引擎内部列表 |
| `Resources/` | 引擎自带资源 | `unity default resources`、`unity_builtin_extra`，名字就写着 default、builtin |
| `Plugins/` | 原生插件 | FMOD、Steam、语音、画质增强这些 dll |
| `il2cpp_data/` | 配合 `GameAssembly.dll` 的元数据 | 见下一小节 |
| `StreamingAssets/` | 运行时按路径直接读的文件 | 声音、以及真正的大资源目录 `aa` |



### il2cpp_data

| 名字 | 大概干什么 | 可能装什么 |
| --- | --- | --- |
| `Metadata/global-metadata.dat` | 给 `GameAssembly.dll` 用的类型名单 | 有哪些类、类上有哪些字段；没有「某一行掉了什么」这种表数据 |
| `Resources/*.dll-resources.dat` | 部分托管库自带的附属数据 | 和掉落、图标无关 |

想知道游戏里有没有叫 DropTable 的类，可以看这里，但是具体掉落没有。



### StreamingAssets

| 名字 | 大概干什么 | 可能装什么 |
| --- | --- | --- |
| `*.bank` | FMOD 的声音库 | `Music`、`Voices`、`Enemies`、`Wolfswood`、`Dragonvault` 这些名字直接写在文件上；做图标和掉落用不上 |
| `UnityServicesProjectConfiguration.json` | Unity 联网服务配置 | 和本地资料页无关 |
| `aa/` | Addressables 的资源根 | 下面才是大头 |



### StreamingAssets/aa

| 名字 | 大概干什么 | 可能装什么 |
| --- | --- | --- |
| `settings.json` | Addressables 的设置，记事本能打开 | 版本 `2.9.1`，目录文件指向 `catalog.bin`，平台是 `StandaloneWindows64` |
| `catalog.bin` | 资源目录，约 6 MB | 程序里用的可读地址，对应磁盘上哈希文件名 |
| `catalog.hash` | 目录的校验 | 很小，用来确认 catalog 有没有换 |
| `StandaloneWindows64/` | 真正的资源包目录 | 大约一万一千个 `.bundle`，合计五个多 GB；最大的单个文件六百多 MB |
| `AddressablesLink/` | Addressables 自己的附属目录 | 不是主要去翻的地方 |

`StandaloneWindows64` 里每个文件名都是一长串十六进制，后缀 `.bundle`。名字上看不出 icon、map、item。原来的路径被做成了哈希，从文件名回不到原来的单词。游戏自己的图、场景、配置几乎都在这里；具体哪一个是图标、哪一个是场景，要靠上面的 `catalog.bin` 去对。



### 初步判断

- 根目录的 exe、dll 是启动和引擎，非资料表。
- `resources.assets` 体积不小，但名字是 Unity 固定写法，更像启动就要带着的那一包。
- `.bank` 是声音，名字能读，和 Wiki 要的掉落、图标无关。
- `global-metadata.dat` 能告诉你有哪些类，但是没有具体信息。
- 真正要挖的是 `StreamingAssets/aa`：用 `catalog.bin` 找到对应的 `.bundle`，再从包里读配置、贴图和场景。



## 解包

静态资源只能告诉你：图和配置在 `aa` 里那一万多个 `.bundle` 里。下一步是解包，先把「哪一个文件装着小地图」找出来。这一节用狼林小地图当例子。



### 类型名单：dump.cs 是什么

游戏逻辑编在 `GameAssembly.dll` 里，旁边有一份 `global-metadata.dat`。它们本身不是给人读的。开源工具 [Il2CppDumper](https://github.com/Perfare/Il2CppDumper) 把这两份文件读一遍，会吐出一份很长的文本，一般叫 `dump.cs`。

`dump.cs` 看起来像很多 C# 的 class 定义：类叫什么、里面有哪些字段、字段大概是什么类型。它不是游戏源码，只是根据元数据还原出来的一份名单。后面读资源时，靠它知道「贴图对象上应该有宽、高、格式这些字段」，不用猜。



### 在目录里搜名字

一万个文件名全是哈希，直接翻文件夹没用。去翻 `catalog.bin`。它是 Addressables 的目录：

- 左边是程序里用的地址，右边指向磁盘上的某个 `.bundle`。

用记事本或者脚本在 `catalog.bin` 里搜 `Minimap`。能看到一串还带英文的名字，例如：

- `Wolfswood_Minimap.psd`
- `Refinery_Minimap.psd`
- `Dragonvault_Minimap.psd`

游戏里狼林那张小地图，对应的就是 `Wolfswood_Minimap.psd`。后缀还是 `.psd`，那是美术源文件的名字；进包之后已经变成 Unity 的贴图

- 不是 Photoshop 文件

把这个地址丢进目录去查。查法是：在 key 列表里找到完全相同的字符串，再看它挂的依赖。依赖里第一个以 `.bundle` 结尾的路径，才是真正的文件。prefab 自己的编号经常只是 GUID，不是磁盘文件名。

狼林小地图查出来是：

`StandaloneWindows64/6dfc96724fd67e223427f4e284491daf.bundle`

精炼厂、龙窟同理，分别是 `3b5fd3da...bundle` 和 `5b340e8f...bundle`。到这一步，已经知道小地图在哪个包里了，不用把一万个包都打开分别看了。



### 打开bundle

这些包用普通解压软件打不开。用十六进制查看器或者脚本看文件开头，能看到明文 `UnityFS`。这是 Unity 自己的归档格式。一个包里可以装好几个小文件，内容通常还压过。

带界面的工具可以先对照一眼。AssetRipper 打开这个包，能看到里面大概有一张很大的贴图。资料页要反复生成，后面的解析写在 Node 脚本里，解压用 `lz4js`。

这批文件的格式版本是 8。头里用大端写下归档有多大、后面那份块信息压完有多大、解开有多大，以及一个 flags。flags 的不同二进制位表示：用什么方式压缩、目录在文件头后面还是在末尾、数据起点要不要对齐到 16 字节。这里压缩走 lz4；目录跟在文件头后面。

把块信息解开之后，前面有一段校验数据，然后是压缩块列表，再后面是节点表。每个节点是包里的一个小文件：解压后从哪开始、有多长、路径叫什么。

狼林这个小地图包打开之后，节点只有两个：

| 路径 | 大小 | 是什么 |
| --- | --- | --- |
| `CAB-9158e574...` | 大约 4 KB | 贴图的说明：宽、高、格式、像素在哪一段 |
| `CAB-9158e574....resS` | 大约 2 MB | 真正的像素数据 |

说明和像素经常分成两个文件。`.resS` 只装字节，不装字段名。字段名在那个没有后缀的 CAB 里。

小包可以把压缩块全部解开再切。场景那种几百 MB 的包，只为读一个对象就把整段拼起来太浪费。

- 那种情况只解目录，算出目标落在哪几个压缩块上，只解那一段。

解开后的长度如果和头里写的不一致，这一步就已经错。



### 小结

到这里，解包思路就明确了：

1. 在 `catalog.bin` 里用 `Minimap` 找到可读地址。
2. 用地址对到哈希名的 `.bundle`。
3. 打开 UnityFS，看到 CAB 和 `.resS`。



## 贴图提取

解包已经拿到狼林那个包，里面两个文件：大约 4 KB 的 CAB，大约 2 MB 的 `.resS`。这一节把它们变成一张能打开的 PNG。



###  CAB

CAB 不是图片本身。它是 Unity 的序列化文件：前面一个头，中间一棵类型树，后面才是对象数据。类型树告诉你每个字段叫什么、占几个字节。对象数据按这棵树往下读。

头要先对上字节顺序。同一个位置按大端读一次、小端读一次，找到落在常见版本号范围里的数，以及一个等于这块缓冲长度的数。这批小地图包里，序列化版本是 22。版本大于等于 22 时，文件大小和正文起点要用头后面那组 32 位、64 位字段；

类型树里找带 `m_TextureFormat` 的类型。这是贴图对象。狼林这个包里对象不多，对上这个类型就能拿到那一张图的说明。读出来的关键字段是：

| 字段 | 狼林小地图读到的值 | 意思 |
| --- | --- | --- |
| `m_Width` | 2048 | 宽，像素 |
| `m_Height` | 2048 | 高，像素 |
| `m_TextureFormat` | 10 | 像素怎么压的；10 是 DXT1 |
| `m_StreamData.offset` | 0 | 像素在 `.resS` 里从第几个字节开始 |
| 流数据长度 | 2097152 | 要从 `.resS` 里读多少字节；这里正好等于整个 `.resS` |

这里有个容易懵的地方。CAB 里的类型树不会把每个字段名都写成完整英文。有的名字直接写在文件里，有的只写一个编号，意思是「去 Unity 自带的一张公共单词表里查」。查得到，就显示成 `m_Width` 这种正常名字。查不到，解析脚本就只能先写成 `#795` 这种占位：井号后面是那个编号。这不是文件坏了，也不是乱码，只是「这个编号在这份公共表里对不上英文单词」。

流数据长度就遇到了这种情况。类型树里它显示成 `#795`，但位置和宽度对得上：它和 `offset` 挨在一起，值是 2097152。对照 `dump.cs` 里 Texture 相关字段，也能确认这里存的就是「像素有多长」。所以读的时候认这个位置上的数字就行，不需要它显示成英文名。

说明在 CAB，像素在 `.resS`。用上面的起点和长度，从 `.resS` 切出那一段。狼林这张图起点是 0，长度等于整个 `.resS`，所以就是把 `.resS` 整段拿去解。



### 转像素

`m_TextureFormat` 决定怎么解。这款客户端里常碰到三种：

| 编号 | 格式 | 怎么解 |
| --- | ---: | --- |
| 4 | RGBA32 | 一个像素四个字节，红、绿、蓝、透明度，直接按顺序读 |
| 10 | DXT1 | 每 4×4 像素压成一小块；狼林小地图是这种 |
| 12 | DXT5 | 也是 4×4 一块，带更细的透明度 |

DXT 解完得到每个像素的 RGBA。再用 `pngjs` 按宽高写成 PNG。



### 上下要翻一次

Unity 存贴图时，第一行像素在图片底部。按解出来的顺序直接写 PNG，图是倒的。写文件前把每一行上下对调一次。狼林这张 2048×2048 的底图，翻完之后，世界坐标 Z 更大的地方才在画面上方。

小地图到这里基本就可以用了，后续找图标icon等资源发现左右不对劲，还要再左右镜像一次。



## 中英文怎么对上

贴图能读了，下一步要的是人能看懂的名字。物品配置里存的不是「铁矿」三个汉字，而是一个本地化引用。中文和英文分开放，中间用同一个编号接上。



### 语言表

还是走 `catalog.bin`。搜 `DefaultStrings`、`QuestStrings`，能看到两类地址：

| 地址大概长什么样 | 装什么 |
| --- | --- |
| `DefaultStrings Shared Data.asset`、`QuestStrings Shared Data.asset` | 共享表：短名字 → 编号 |
| `DefaultStrings_zh`、`QuestStrings_zh` | 简体中文：编号 → 汉字 |
| `DefaultStrings_en`、`QuestStrings_en` | 英文：编号 → 英文句子 |

`DefaultStrings` 管界面、物品、地图名这类通用字；`QuestStrings` 管任务对话和任务标题。两边各有一套 Shared Data，再用 `_zh`、`_en` 分语言。



### 映射表

Shared Data 那一包打开之后，找类型里带 `m_TableCollectionName` 的对象。只收 collection 名叫 `DefaultStrings` 或 `QuestStrings` 的。每一条是：

- key：给程序看的短名字，例如 `MapName_Pinewood`、`Name_IronOre`
- id：一个 64 位整数，存成字符串来比较，不要先转成普通 number

语言包那一包里，对象名字以 `_zh` 结尾的（`DefaultStrings_zh`、`QuestStrings_zh`）才是简体。里面的 `m_TableData` 每一行是：

- `m_Id`：同一个 64 位编号
- `m_Localized`：玩家看到的句子

两边用 `m_Id` 对齐，得到 key → 中文。英文同理，只是读 `_en`。物品配置上常见的字段叫 `NameLocalized`，里面挂的是 `m_KeyId`，不是汉字本身；拿这个 id 去中文表里查，才有标题。

正文里偶尔会写成 `{@DefaultStrings.某个key}`。这是嵌套引用，再用 key 查一次。



## 地图掉落在哪

「地图上掉什么」得拆成两部分：一是掉落表本身，二是箱子在场景里摆在哪。



### 掉落表

在 `catalog.bin` 和配置相关的 Addressables 地址里找，真正装表的是 UnityFS 包里路径以 `.sharedAssets` 结尾的那个节点。对象上带 `DropTableConfigurationValues.Elements` 的，就是一张掉落表。

每一行长度固定，这批数据里是 `0x50`，也就是 80 字节。行里大致有：

| 偏移附近 | 意思 |
| --- | --- |
| 数量上下限 | 这次掉几个 |
| dropMode | 0 按权重，1 按概率 |
| weight | 权重 |
| percent | 64 位整数，**先除以 65536**；除完 25 就是 25% |
| outcome | 0 物品，1 子掉落表，2 配方 |
| item / nested | 物品 id，或者另一张表的 id |
| 稀有度权重 | 抽中这一行之后，各品质各占多少； |

有的对象自己没有嵌这些行，但有一个整数字段，值等于某张 `DropTableType`。



### 坐标

表只回答「开了以后可能出什么」。要在小地图上显示，还得知道场景里那个箱子叫什么、世界坐标在哪。

三张可玩图各自有一个很大的场景包，和小地图贴图包是分开的。场景包里按物体名搜 `Chest`、`Loot`、`Den`、`Mound` 这类子串，名字前面的长度必须对得上，再把物体名映射回已经认识的 `DropTableType`。

物体在文件里写的多半是相对父物体的位置。要沿着 Transform 的父链往上乘，父引用的 pathId 为 0 才算到根节点。

有的刷新点自己坐在原点，真正能交互到的坐标在子物体上。父在原点、模型在子物体上的门也是同一类情况。



## 任务数据

任务不在上面那种 `.sharedAssets` 配置包里。类型树里也找不到任务类。换一条路：在 bundle 字节里搜明文。



### artifact 包

`catalog.bin` 里搜 `Artifacts.artifactpack.bytes`。当前指到 `b5fea3de...bundle`。打开之后，包里某个节点的数据中能搜到四个字母 `HVPK`。

`HVPK` 是另一份目录：头里写自己有多长、有多少条；每一条有名字、起点、长度。每条内容以 `HVAF` 开头，后面才是正文。

任务正文那条的名字是 `NpcQuestConfiguration.bytes`。剥掉 MessagePack 外面那层「原始字节」包装之后，才是任务数组：标题、发放 NPC、目标、奖励、前置节点。标题和对话里的字，经常还是 `{@QuestStrings.某个key}` 或者带 `<ref>` 的引用，最终还是回到上一节的语言表中去查。

任务目标和奖励里出现的物品，用的是和掉落表同一套物品数字编号。要显示中文，再拿编号去对 `ItemType`，再对 `NameLocalized`。



### 别的玩法表

同一个 artifact 包里，还能挖到 `SimulationGameplayConfiguration.bytes` 这类条目。技能、拆解、难度相关的记录也走 HVPK / HVAF，不走 `.sharedAssets`。它们和任务一样，用物品编号互相指。



## 装备道具

装备和道具也是「编号 + 配置 + 文案 + 图标」几块拼起来的。

`ItemType` 枚举给出物品 id ↔ 枚举名。任务要交什么、掉落行指向什么、拆解产物是什么，写的都是这个 id。没有这份枚举，后面几张表对不上。



### sharedAssets

和掉落表同一类配置包里，还有物品自己的 ScriptableObject。catalog 里能看到 `ScriptableObjects/Items`、`Default_ItemConfigurationPrefabSo.asset` 这类地址。单件物品上会挂：

- 枚举或内部类型
- `NameLocalized` 指向语言表的 key id
- 图标名、槽位、稀有度相关字段

具体字段顺序以 `dump.cs` 里对应配置类为准，按类型树往下读。对不上中文就留 `SearchName` 或者枚举拆开的英文。



### 图标

图标不和表塞在同一个小配置包里。当前客户端里，图标大包大约 56 MB，catalog / 脚本里能对上的哈希是 `d690eafe...bundle`。包内同样是 CAB 说明加 `.resS` 像素，解码方式和小地图那节一样；已经落地的 png 如果左右反了，要再镜像一次。怪物头像优先用配置上的 `PortraitSpriteName`。



### 串联

一张 Wiki 页上的「某件装备」通常是这样对上的：

1. 掉落行或任务奖励里写出物品 id。
2. `ItemType` 把 id 变成枚举名。
3. 物品配置用 id / 枚举找到那条记录，取出 `NameLocalized` 的 key id。
4. Shared Data + `_zh` 把 key id 变成中文标题。
5. 图标包按贴图名写出 png。



## Summary

游戏还是蛮好玩的，就是引导还缺了一些，很多东西不是很明确，做个Wiki补充一下。

实际不仅仅是Wiki，游戏内的一些机制或者Bug导致的机制，也是可以利用的一环，刚好在Wiki这里解包的时候可以一起确认。

用AI辅助一下解包流程，做个Wiki非常快，甚至有类似模板或者需求模板，直接给出来Wiki就成立了，只是一些机制需要单独摸索一下



## Quote

> https://github.com/elmagnificogi/VaultbreakersWiki
