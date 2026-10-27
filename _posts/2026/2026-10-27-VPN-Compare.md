---
layout:     post
title:      "2026翻墙协议对比"
subtitle:   "VLESS、REALITY、Hysteria2、HY2、客户端"
description: "2026翻墙协议对比，vless reality、hysteria2 hy2、翻墙协议、客户端支持。"
date:       2026-10-27
update:     2026-10-27
author:     "elmagnifico"
header-img: "img/head-2026-09-15.jpg"
catalog:    true
mermaid:    false
tobecontinued: false
tags:
    - VPS
    - V2ray
---

## Foreword

26.10.26，昨天刚好切换协议的uuid，测试的时候还全是好的，刚测完就接近全挂了。查了半天还以为是我改的有问题，仔细一看都是端口被封了，看起来和之前遇到封禁的或者阻断非常相似。

没想到用了这么久的xray+vless+reality 也要下线了吗，翻了一下帖子，似乎都遇到了这个情况

> https://v2ex.com/t/1251991

reality还是顶了好久的，距离上一次折腾过了2年，之前无论大小会议，都不会有啥问题，正常使用，没想到这次9个vps，挂了8个，只有一个是我自己的网站，没挂。

 

## 协议对比

### 协议

这里比较的是协议设计和使用条件，不是这次封锁的存活率；目前没有足够的多地区、跨运营商测试，能给这些协议排出一个可靠的抗封锁名次。

| 协议或组合 | 底层传输 | 域名与证书 | 主要特点 | 使用限制 |
| --- | --- | --- | --- | --- |
| Shadowsocks AEAD | TCP / UDP | 不需要域名和证书 | 预共享密钥加密，开销较小，客户端覆盖广 | 裸流量呈随机字节，不能 HTTPS 伪装；不同实现的防探测处理有差异 |
| Shadowsocks 2022 | TCP / UDP | 不需要域名和证书 | 更新密钥派生、强制完整防重放，改进 UDP 会话和防探测细节 | 仍是随机加密流量，不带 TLS 外观；密钥格式与旧 SS 不同 |
| SS2022 + ShadowTLS v3 | 外层 TCP | 不需要自己的证书；需要合适的 TLS 握手目标和 SNI | SS2022 加密载荷，ShadowTLS 提供真实 TLS 握手、记录封装、认证和完整性校验 | 两层参数都要兼容；只包装 TCP，SS 原生 UDP 不会自动获得同样封装 |
| Trojan + TLS | TLS / TCP | 通常使用域名和可验证证书 | 真实 TLS 连接、密码认证，支持将业务 TCP 和 UDP 放进隧道 | TLS 连接不等于浏览器流量，仍受流量分析、SNI 和入口 IP 封锁影响 |
| VMess + WebSocket + TLS | WebSocket / TLS / TCP | 通常使用域名和可验证证书 | VMess 叠加 WebSocket 和 TLS，可接支持 WebSocket 的反向代理或 CDN | 增加封装和配置开销；套 CDN 不等于不会被封 |
| VLESS + Vision + REALITY | 常用组合为 TCP + REALITY | 不需要自己的域名和公有 CA 证书；需要合适的目标站和 SNI | VLESS 负责代理，Vision 处理流控，REALITY 提供安全与伪装能力 | 目标站选择、客户端指纹和版本需要匹配；不能解决入口 IP 已被整体阻断的问题 |
| Hysteria2 / HY2 | QUIC / UDP | 通常使用域名和可验证证书 | 代理 TCP 和 UDP，支持拥塞控制、HTTP/3 伪装，以及可选的 Salamander 等混淆 | 依赖 UDP 可达；基本协议、混淆和端口跳跃的支持范围要分别确认 |
| TUIC v5 | QUIC / UDP | 通常使用域名和可验证证书 | QUIC 多流复用，支持 TCP 代理和多种 UDP 转发方式 | 依赖 UDP 可达；v4/v5 不互通 |
| AnyTLS | TLS / TCP | 通常使用域名和可验证证书 | 填充、分包和连接复用，尝试缓解 TLS in TLS 等流量特征 | 各实现需匹配协议版本；业务 UDP 通过 TCP 隧道传输 |
| NaiveProxy | H2 模式为 TLS / TCP；H3 模式为 QUIC / UDP | 常规部署使用域名和受信任证书 | 原版复用 Chromium 网络栈，配合 HTTP/2 或 HTTP/3 CONNECT、多路复用和填充 | 要区分原版与第三方兼容实现；普通 HTTPS 代理不等于完整 NaiveProxy，H3 底层用 UDP 也不代表自动支持任意业务 UDP |
| Mieru | 可选 TCP 或 UDP | 不使用 TLS，不需要域名和证书 | 自有加密传输、随机填充、重放检测，支持多用户 | 客户端、服务端参数和新功能需要兼容；本地提供 HTTP/HTTPS 代理接口 |

目测这次UDP相关的协议似乎都还活着，HY2这次表演不错，以前没选他是因为支持太少了，而且都是外挂支持，虽然今天也是，但是基本主流软件都支持HY2了



### 客户端

以下针对近期官方版本，按普通用户能否在客户端中配置并使用来标注。

| 协议或组合 | OpenClash / mihomo | v2rayN | v2rayNG | Surge | Shadowrocket |
| --- | --- | --- | --- | --- | --- |
| Shadowsocks AEAD | 支持 | 支持 | 支持 | 支持 | 支持 |
| Shadowsocks 2022 | 支持 | 支持 | 支持 | 支持，限 AES 两种 | 支持 |
| SS2022 + ShadowTLS v3 | 支持 | 自定义，sing-box | — | 支持，限 AES 两种 | 支持 |
| Trojan + TLS | 支持 | 支持 | 支持 | 支持 | 支持 |
| VMess + WebSocket + TLS | 支持 | 支持 | 支持 | 支持 | 支持 |
| VLESS + Vision + REALITY | 支持 | 支持 | 支持 | — | 支持 |
| Hysteria2 / HY2 | 支持 | 支持 | 支持 | 支持，注意版本 | 支持 |
| TUIC v5 | 支持 | sing-box | — | 支持，选择 v5 | 支持 |
| AnyTLS | 支持 | sing-box | — | 支持，注意版本 | 支持 |
| NaiveProxy | — | sing-box；原版可自定义 | — | 外接（Mac） | 内置兼容实现 |
| Mieru | 支持 | 自定义，独立内核 | — | 外接（Mac） | 支持，注意版本 |

- **支持**：有常规配置或内置兼容实现，不代表所有旧版本和高级参数都支持。
- **sing-box**：v2rayN 有普通节点配置，但需要对应的 sing-box 内核及构建。
- **自定义**：需要手工导入完整配置或指定独立内核，不等于普通订阅链接直接可用。
- **外接（Mac）**：Surge Mac 可调用外部程序，不属于原生支持，也不覆盖 Surge iOS。
- **—**：当前没有列入原生或常规节点支持；不能靠订阅转换器补出内核没有的协议。



### 版本和组合

简单说可能兼容，但是细节不一定，而且最好都用到最新版本，老版本多少都存在兼容性问题



**HY2 的兼容面比较齐，但是参数细节不一定** 

v2rayNG 从 [1.9.4](https://github.com/2dust/v2rayNG/releases/tag/1.9.4) 加入 HY2，从 [2.0.1](https://github.com/2dust/v2rayNG/releases/tag/2.0.1) 开始改用 Xray 并移除早期插件版本。

Surge 基本 HY2 支持从 iOS 5.8.0、Mac 5.4.0 开始；Salamander 混淆要求 iOS 5.17.0、Mac 6.4.3 及以上。

Gecko、Realm、端口跳跃等要按具体版本和导入器逐项核对。

支持 HY2 不等于它的全部扩展都能互通。给不同客户端统一分发时，先使用常规 HY2 参数，再逐项增加功能更容易排错。



**v2rayN 与 v2rayNG 的支持范围不同** 

v2rayN 当前把 TUIC、AnyTLS、Naive 的常规配置交给 sing-box；HY2 则可以由支持它的 Xray 或 sing-box 执行。

v2rayNG 当前有 HY2，但 TUIC 仍未启用，AnyTLS、Naive、Mieru 也不在其常规节点类型中。



**Surge 的 SS2022 只列出 AES-128 和 AES-256 两种** 

如果需要覆盖 Surge，可以从 `2022-blake3-aes-128-gcm`、`2022-blake3-aes-256-gcm` 中选择。ShadowTLS v3 从 Surge iOS 5.5.0、Mac 5.0.3 开始支持，需要明确使用 v3 并配置对应 SNI；只填了旧版 ShadowTLS 参数，不一定能连接 v3 服务端。



**AnyTLS 在 Surge 与 Shadowrocket 中都有支持** 

Surge 要求 iOS 5.17.0、Mac 6.4.3 及以上，支持 AnyTLS v2；Shadowrocket 2.2.65 及以上有官方确认。Mieru 也已经加入 Shadowrocket，2.2.81 的更新记录明确列出该协议。



**NaiveProxy 要区分实现** 

v2rayN 普通 Naive 节点使用 sing-box；调用原版 naiveproxy 可执行文件则需要自定义配置。sing-box 1.13.0 起支持 Naive outbound，但有平台和 Cronet 库要求。Shadowrocket 有 Naive 兼容实现



**Mieru 在 v2rayN 中走自定义配置** 

它有独立内核启动支持。Surge 的 Naive、Mieru 外接方式也仅适用于 Mac：官方说明 iOS 的 `external` 会按 REJECT 处理。



### 订阅转换

协议相同，不代表所有客户端读取相同的配置格式。同一台 HY2 服务端可以供这些客户端使用，但分发时可以分别输出 mihomo YAML、Surge 配置，以及标准 `hy2://` / `hysteria2://` 节点链接。订阅转换器还要保留认证、SNI、混淆和证书验证参数，经常被订阅转换卡掉一部分参数，我的订阅转换已经太老了，都不一定支持这些新协议了。



## Summary

目前感觉合适切换的只有HY2了，稍晚一些时候搭建两个试一下。



## Quote

> https://v2ex.com/t/1251991
>
> https://github.com/XTLS/REALITY
>
> https://v2.hysteria.network/docs/developers/Protocol/
>
> https://github.com/2dust/v2rayNG/releases/tag/1.9.4
>
> https://github.com/2dust/v2rayNG/releases/tag/2.0.1
>
> https://manual.nssurge.com/policies/shadowsocks.html
>
> https://manual.nssurge.com/policies/tls.html
>
> https://manual.nssurge.com/policies/hysteria2.html
>
> https://manual.nssurge.com/policies/anytls.html
>
> https://manual.nssurge.com/policies/external.html
>
> https://sing-box.sagernet.org/configuration/outbound/naive/
