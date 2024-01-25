---
layout:     post
title:      "Netch 自建游戏加速器"
subtitle:   "ss，iplc，v2ray"
date:       2022-01-19
update:     2024-01-25
author:     "elmagnifico"
header-img: "img/bg5.jpg"
catalog:    true
tags:
    - Proxy
    - Netch
---

## Foreword

好久之前还一直用的是 SSTap来加速代理游戏，只不过这个东西比较麻烦，他本身启动了一个虚拟网口，然后流量走虚拟网口，再通过ss或者v2ray之类的代理走。而SSTap作者被喝茶了，所以停止开发了，然后源码直接当场丢失，导致后续就再也没了SSTap，不过也有其他人开发的开源加速器比较好用，后来就取代了SSTap。

> https://github.com/FQrabbit/SSTap-Rule

不过我知道的比较晚，毕竟是腾讯加速器会员，平常也不靠自建的，但是之前八九月份的时候，游戏加速器被未成年搞了一波，腾讯加速器直接新游戏一个不加，外网游戏更别想了，我5月份才充的会员，就这么给我黑了。气得要死，那会要玩暗黑2，只好再弄个代理，那会还在用SSTap，然后发现提取规则好像不生效，掉线问题依旧(其实是暗黑服务器太多了，每次连接基本都是不同的ip，而且可能段都不同，根本没代理到)，直到后来发现了Netch，真是好用。



**Netch基本被淘汰了，请别用了，现在大部分代理软件比如V2rayN、Clash等早就把类似Netch的功能做进去了，没有Netch这么多bug**



## Netch

Netch 是一款 Windows 平台的开源游戏加速工具，Netch 可以实现类似 SocksCap64 那样的进程代理，也可以实现 SSTap 那样的全局 TUN/TAP 代理，和 Shadowsocks-Windows 那样的本地 Socks5，HTTP 和系统代理

至于连接至远程服务器的代理协议，目前 Netch 支持以下代理协议

- Socks5
- Shadowsocks
- ShadowsocksR
- Trojan
- VMess
- VLess

与此同时 Netch 避免了 SSTap 的 NAT 问题 ，检查 NAT 类型即可知道是否有 NAT 问题。使用 SSTap 加速部分 P2P 联机，对 NAT 类型有要求的游戏时，可能会因为 NAT 类型严格遇到无法加入联机，或者其他影响游戏体验的情况



简单说Netch有两种模式，一种是进程代理，直接Hook整个进程的所有网络连接到本地Socks5然后再通过本地的ss或者v2ray或者什么其他的方式进行代理。还有一种就是常规的通过路由规则进行代理，将目标的路由转向加速节点，从而实现加速。大部分程序两种方法都可以，各有各的好处。

> https://github.com/netchx/netch

由于Netch的这种简单好用的特性，导致其实他既能作为翻墙工具也能用来加速游戏，具体看用途吧。

(地平线5不行，4可能也不好用。貌似涉及到微软商店类的基本都不好使，走了某些特殊渠道，缺少人分析)



##### 进程代理

通过进程代理，可以代理这个程序的所有连接，就算他的连接是经常变化的也没关系，但是不好的地方就是，一旦代理以后，是直接通过Socks代理了，你如果想查具体是哪里到哪里的连接的就比较麻烦，如果你想要做区分，什么代理，什么连接不代理，使用这个模式就不太适合了。



##### 路由代理

通过路由代理，则可以自己指定什么连接走代理，什么连接不走。但是这个问题也是一样的，有些时候有的程序连接变化太多了，你根本找不全所有需要代理的ip，这种情况通过进程代理就比较方便。



我之前暗黑2，就是想结合进程代理和路由代理，某些ip通过进程完全代理，其他ip呢可以走一个我的过滤，如果是过滤中的ip则xxx处理，从而完成我的需求，这样既能将所有ip屏蔽到看不到，又能实现操作我想要的ip（主要是为kdc服务的，后来换了方案，这一套就不需要了）



##### 魔改版本

有一个大佬之前可能也遇到了类似的问题，所以他加了一个TCP的ip过滤，在进程模式下，匹配的ip进行代理或者不代理，其实我想要的还不仅仅是代理和不代理，还有一个block选项，从而实现让可以自动重连的客户端去选择我给他设定的ip段，而不是直接无响应。

> https://github.com/AmazingDM/Netch-ForOwnUse

但是block的这个想法，貌似基于Netch使用的网络Hook工具好像实现不了，或者说实现的和预期有些不同。比如如果是windows防火墙直接block，那么D2R会自动切换到可行的服务器去，如果是Netch block的，D2R就不会切换，而是直接连不上或者卡建房。两种block应该是在实现上有些区别，所以最终效果不同。

- 我写了一个版本的Netch block，但是不太好使，还是得配置防火墙使用。



##### 多语言

Netch 支持多种语言，在启动时会根据系统语言选择自身语言。如果需要手动切换语言，可以在启动时加入命令行参数，命令行参数为目前支持的语言代码，可以去 [NetchTranslation/i18n](https://github.com/NetchX/NetchTranslation/tree/master/i18n) 文件夹下查看外部支持的语言代码文件。Netch 目前内置 en-US，zh-CN，外置 zh-TW，ja-JP。



## 使用

Netch本身没有详细的教程，也没啥具体的说明，但是魔改大佬加了一个，不过可能忘记外链出来了。这里引用一下。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202210251413587.png)

在设置界面填写完快捷配置数量后即可在主界面进行配置，填入配置名，选择相应的服务器和游戏模式，按下 `Ctrl` 与`鼠标左键`，即可保存当前配置。下次使用时，点击配置名即可快速启用。



#### 设置

现在分页比较多，可能有所不同了，不懂的话保持默认就好了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/ev9z3Nid4WBuZhO.png)

每个分页负责一个模式，以及DNS相关的设置



#### 添加服务器

> Netch 目前仅支持以下代理协议：Shadowsocks，VMess，Socks5，ShadowsockR，Trojan。

首先，点击`服务器`增加所需服务器

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202210251409700.png)

可手动添加单个服务器，或者通过剪切板链接添加单个服务器。也可通过订阅链接批量添加。



#### 订阅

点击 `订阅` -` 管理订阅链接` 进入以下界面。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/Y2ABlwQPvOfWpUz.png)



填写备注与链接，然后保存即可。保存后在主界面点击 `订阅`- ` 从订阅链接更新服务器`。完成服务器添加。添加完服务器后可对服务器进行修改，删除和测速。



#### 创建进程模式

如果你的游戏的模式已经被收录，也可以考虑在模式菜单中，选择使用已收录的模式。所有模式的文件，都在 `./mode/` 文件夹下，如果你需要多个模式的合并文件，可以使用记事本将其打开，将多个文件合并ping 的值未必准确，因为这只是你本地到代理服务器而非游戏服务器的延迟

接着点击菜单栏上的`模式 - 创建进程模式`

![](https://img.elmagnifico.tech/static/upload/elmagnifico/EDVbp84Z3LJhPga.png)

如果你的游戏的模式没被收录，可以看接下来的扫描步骤来手动创建模式



##### 扫描

在弹出的窗口中点击`扫描`

![](https://img.elmagnifico.tech/static/upload/elmagnifico/7zvefkiDP354Q2L.png)

选择你要加速的游戏的安装路径，根据游戏不同，可能需要选择多个不同的目录进行扫描，参见[萌鹰的 Netch 教程](https://www.eaglemoe.com/archives/142)（包括 GTAOL 和 R6S 的配置方法）

>4. 选定 GTA5 游戏目录，点击确定，软件会自动扫描目录下的 exe 程式并填写进去
>5. 再次点击扫描，选择 SocialClub 的安装地址（一般为 C:\Program Files\Rockstar Games\Social Club），点击确定，点击保存
>
>注意：加入游戏时请不要忘记加入社交组件，比如说 GTA 不要忘记 SocialClub ，彩虹六号不要忘记 Uplay，如果游戏进程名与其他进程名重复，则可手动修改已创建好的模式文件，在进程名前加上绝对路径即可。csgo.exe -> C:\steam\game\Counter-Strike Global Offensive\csgo.exe

这里以CSGO为例，只需添加CSGO游戏根目录即可

![](https://img.elmagnifico.tech/static/upload/elmagnifico/2pLnyGdVRFrTOHW.png)

扫描时可能需要稍等片刻，扫描后记得填写备注

如果需要添加单个程序，也可以在添加按钮左侧的编辑栏中手动输入并添加

之后点保存进行`保存`，即可

![](https://img.elmagnifico.tech/static/upload/elmagnifico/2eDbpToWQhzEHlt.png)

##### 启动

最后确认服务器一栏和模式一栏均为之前自己添加并需要使用的，没问题后点击`启动`即可

![](https://img.elmagnifico.tech/static/upload/elmagnifico/uCP7EarBAWfvidh.png)

启动后，你再去游戏根目录或者别的启动器如 Steam，Uplay 启动游戏。此时游戏就已经被代理了

如果在 Netch 启动前就启动了游戏，建议重启游戏，已经存在的进程并不能被捕捉代理到。

如果需要 Steam，Uplay 等启动器也需要被代理，参照前面的方式对 Steam，Uplay 根目录也进行扫描即可



#### 路由模式

点击创建路由表规则，选择代理规则IP

![](https://img.elmagnifico.tech/static/upload/elmagnifico/wSlJHBdb2GkaNIs.png)

规则这里得用这种子网和掩码长度的模式

```
错误：
117.52.3.2/24

正确：
117.52.3.0/24
```

一般来说是以掩码长度为准的，这里应该是Netch本身有bug，理论上掩码应该是大于IP的，如果**你后续掩码位置填写的不是0，会导致这条规则根本不生效。**



## 进阶教程

进阶教程可能也有点老，但是总体意思差不多

**模式介绍**

目前 Netch 所有模式文件都在 `mode` 文件夹下。模式号即模式菜单中最左边中括号内数字

内置的模式中，如果模式名中有 Bypass China 的部分，即该模式会绕过中国 IP 段

模式 1 和模式 2 里面除了第一行格式不同，其他内容和 [SSTap-Rule](https://github.com/FQrabbit/SSTap-Rule) 相同。是否绕过中国的功能依赖于 CNIP 文件

模式 3 到模式 5 的是否绕过中国的功能依赖于 acl 文件

第一行格式均为如下样式，不同模式之间第一行的具体区别可以参照后面的内容

```Python
# 备注, 类型（模式类型的值减一）, 是否绕过中国（1 为是, 0 为否）
```



#### 模式 1 进程代理模式

- 根据进程名进行代理
- 底层依赖于 [NetFilter SDK](https://netfiltersdk.com)
- 对于第一次使用 Netch 的用户而言，不需要做多余的事情
  - 若 [NetFilter SDK](https://netfiltersdk.com) 的驱动不存在，会自动安装
  - 若驱动版本过低，会自动更新

范例文件

在这个模式里，第一行只有备注是有用的，规则内容支持C++正则表达式

```
# 备注
进程名 1（会被代理）
!进程名 2（不会被代理）
csgo.exe
\\steam\\（代理运行路径包含steam的所有程序）
...
```



#### 模式 2 路由模式

- 黑名单代理指的是，除了名单内的 IP 走代理，其他连接都不走代理
- 需要自己新建模式文件，第一行写法同模式 3，只是需要把 2 改成 1
- 后续内容的格式同 [SSTap-rules](https://github.com/FQrabbit/SSTap-Rule)
- 可以通过左下角的`设置`来配置 IP 地址，子网掩码，网关，DNS
- 该模式下直连 IP 段无效，暂时没有代码实现
- 底层依赖于 [Tap-Windows](https://github.com/OpenVPN/tap-windows) 适配器等
- 如果 Netch 提示没有该适配器，可以直接安装 [Tap-Windows](https://build.openvpn.net/downloads/releases/latest/tap-windows-latest-stable.exe) 或者通过安装 [OpenVPN](https://openvpn.net/community-downloads/)，[SSTap](https://github.com/mayunbaba2/SSTap-beta-setup) 的方式获得该适配器

范例文件

在这个模式里，是否绕过中国的值是无效的

```
# 备注, 1
无类别域间路由写法 1（目的 IP 在这个子网内的网络请求都会被代理）
无类别域间路由写法 2
...
```



#### 模式 3 IP 白名单模式

- 白名单代理指的是，除了名单内的 IP 不走代理，其他连接都走代理
- 可以通过左下角的`设置`来配置 IP 地址，子网掩码，网关，DNS，直连 IP 段
- 底层依赖于 [Tap-Windows](https://github.com/OpenVPN/tap-windows) 适配器，tun2socks 等
- 如果 Netch 提示没有该适配器，可以直接安装 [Tap-Windows](https://build.openvpn.net/downloads/releases/latest/tap-windows-latest-stable.exe) 或者通过安装 [OpenVPN](https://openvpn.net/community-downloads/)，[SSTap](https://github.com/mayunbaba2/SSTap-beta-setup) 的方式获得该适配器

范例文件

```
# 备注, 2, 是否绕过中国（1 为是, 0 为否）
无类别域间路由写法 1（目的 IP 只有在这个子网内的网络请求不会被代理，其他的都会被代理）
无类别域间路由写法 2
...
```



#### 模式 4 HTTP 系统代理

- 默认地址和端口为 127.0.0.1:2802
- 端口可以在左下角设置里面更改
- 会被设置为系统代理

范例文件

```
# 备注, 3, 是否绕过中国（1 为是, 0 为否）
（目前只有第一行是有效的）
```



#### 模式 5 本地 Socks5 代理

- 默认地址和端口为 127.0.0.1:2801
- 端口可以在左下角设置里面更改
- 不会被设置为系统代理，对于 Chrome 之类使用系统代理的浏览器需要设置使用插件 SwitchyOmega 之后才能被正常代理
- 注意如果是使用 Firefox 的网络设置，请仅设置 Socks5 代理，清除其他代理配置，并取消勾选`为所有协议使用相同的代理服务器`
- 其他模式均含 Socks5 代理，本模式可以理解为仅 Socks5 代理\

范例文件

```
# 备注, 4, 是否绕过中国（1 为是, 0 为否）
（目前只有第一行是有效的）
```



#### 模式 6 本地 Socks5 和 HTTP 代理

- Socks5 代理的默认地址和端口为 127.0.0.1:2801
- HTTP 代理的默认地址和端口为 127.0.0.1:2802
- 端口可以在左下角设置里面更改
- 不会被设置为系统代理

范例文件

```
# 备注, 5, 是否绕过中国（1 为是, 0 为否）
（目前只有第一行是有效的）
```



## 小插曲

之前的公告截图不是这样的，之前是直接说停止开发，然后整个Github都变成只读了，tg的群也直接全体禁言了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/qzuEisIMCPfweXx.png)

由于当时发的最新版1.9.2和1.9.3有严重问题，后来又解开了禁言，然后版本又迭代了一下。



**当前建议使用1.9.1版本，之后的版本多少都有点毛病**

> https://github.com/netchx/netch/releases/tag/1.9.1



2022.10.25 Netch已经在准备2.0版本了，1.0的版本最好先自己留存一份，防止以后有问题找不到了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202210251417228.png)



## 源码仓库说明

源码是基于我当时fork的为基础来说的

> https://github.com/netchx/netch

首先master是当前的1.x.x版本的代码，main中是2.0的代码，且尚未完工。但是master中需要的一些bin文件，其实是来自于main中的。

一部分组件也是main中的工程生成以后，反向给回到master里去release的，所以这也是为啥有些组件是直接用的bin文件或者是生成好的。

小插曲过后，netch中的master直接消失了，所以现在应该是无法再编译出来1.x.x的版本了。



#### redirector

redirector.bin 实际的仓库已经不存在了，但是这部分代码被加到了main之中,就叫Redirector

> https://github.com/aiocloud/redirector

redirector则是整个进程重定向，加速的核心模块，netch本身只是一个壳子，负责把用户输入转换到每个独立的bin或者exe中去配置执行而已。而要实现在重定向的过程中进行IP的识别和阻塞，就必须要在redirector里再加一层过滤，对匹配的ip进行处理。

主要通过 redirector/tcpConnectRequest 来处理整个TCP连接，可以在这里加个筛选来过滤IP，但是我感觉在这个位置处理已经有点晚了，后来的代码验证，可以过滤，但是同样也会导致游戏认为连接失败了，所以要么是这个hook我没用对，要么就是过滤的地方不对。



## Summary

期待2.0吧



## Quote

> https://github.com/AmazingDM/Netch-ForOwnUse
>
> https://help.loliloli.live/mac-shi-yong-jiao-cheng/vitrual-acess
