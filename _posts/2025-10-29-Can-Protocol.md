---
layout:     post
title:      "CAN协议层对比"
subtitle:   "uavCAN、CANopen、droneCAN"
date:       2025-10-29
update:     2025-10-29
author:     "elmagnifico"
header-img: "img/x13.jpg"
catalog:    true
tobecontinued: false
tags:
    - CAN
---

## Foreword

在工业领域，需要使用可靠性非常强的协议，并且对于延迟要求也很高，如果同时这个协议本身也具有高拓展性，那就更好了，这里主要是从CAN出发，看看相关在CAN之上的协议层有哪些可以选择。



## 类CAN协议层

### CANaerospace

![image-20251029155130798](https://img.elmagnifico.tech/static/upload/elmagnifico/20251029155130834.png)

CANaerospace是专为航空电子系统设计的通信协议，基于CAN总线技术，用于满足机载设备对实时性和可靠性的严苛要求。CANaerospace底层对CAN的payload重新定义了，将整个CAN总线设计成了网状，允许一对一和一对n通信。

设计的思路还是比较简单的的，说白了就是给各个节点约定好的数据类型和数据值，具体这个数据干啥用的靠Service Code和Message Code区分



### DDS

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/20251029160056553.png)

DDS主要是用在自动驾驶方面的技术栈，核心思路也是把传感器之类的东西变成总线式的交互，这样防止系统过于复杂，底层还是靠CAN来实现数据链路层



### CANopen

> https://www.analog.com/cn/lp/001/primer-network-management-CANopen-protocols.html

![image-20251029161728083](https://img.elmagnifico.tech/static/upload/elmagnifico/20251029161728122.png)

CANopen，类似的按照节点和对象字典来区分，CANopen把节点ID给固定死了，设备能用的一开始就规定死了

```
┌──────────────┬─────────┬──────────────────┬─────────┐
│ CAN 标识符    │  RTR    │   数据字段        │   CRC   │
│   COB-ID     │         │   0-8 字节        │         │
│   11 bits    │ 1 bit   │                  │         │
└──────────────┴─────────┴──────────────────┴─────────┘
```



### UAVCAN

![image-20251029152221339](https://img.elmagnifico.tech/static/upload/elmagnifico/20251029152221440.png)

> https://legacy.uavCAN.org/

DroneCAN 和 Cyphal 都是早先一个叫做UAVCAN的项目。 在2022年，该项目分为两个部分：原始版本的 UAVCAN (UAVCAN v0) 更名为 DroneCAN，较新的 UAVCAN v1 更名为 Cyphal。 这两项协议之间的差异在[Cyphal vs. DroneCAN](https://forum.opencyphal.org/t/cyphal-vs-droneCAN/1814)中作了概述。

总体来说UAVCAN在当时的0.9版本已经较为广泛使用了，不好再做改动，所以在这里进行了分化。

UAVCAN对于发布订阅模型支持是不太完善的，传输层和应用层的的解耦也没做好，还有一些其他缺点，最后导致了版本分化



### DroneCAN

> https://droneCAN.github.io/Specification/1._Introduction/

![image-20251029164537810](https://img.elmagnifico.tech/static/upload/elmagnifico/20251029164537841.png)

DroneCAN只支持29bits的扩展标识符，老协议不支持。

DroneCAN在无人机领域使用非常广泛，近百万的设备在用，这是他目前的优势，可以接入的设备都比较多，但是缺点也很明显，而且未来发展的趋势基本也都是往Cyphal走了

支持DroneCAN的传感器或者模块也比较多了

> 电调（ESC）: Zubax Orel, CUAV NEO, Holybro
> GNSS: Here3, Zubax GNSS
> 电源模块: CUAV HV PM, Pomegranate Systems
> 气压计、磁力计、激光测距等



### Cyphal

> https://opencyphal.org/
>
> https://forum.opencyphal.org/t/the-cyphal-guide/778
>
> https://github.com/OpenCyphal

```
┌──────────────────────────────────────────┐
│   应用层 (Application Layer)              │
│   - 诊断、配置、物理量定义等                │
├──────────────────────────────────────────┤
│   表示层 (Presentation Layer)             │
│   - DSDL 数据结构描述语言                  │
│   - 序列化/反序列化规则                    │
├──────────────────────────────────────────┤
│   传输层 (Transport Layer)                |
│   - Cyphal/CAN, Cyphal/UDP, Cyphal/Serial│
└──────────────────────────────────────────┘
```

Cyphal核心机制还是发布订阅模型，也支持C/S模式下的请求响应模型，在表示层使用了DSDL去描述数据类型，简化了上层做数据转换的压力

同时Cyphal在协议层就允许不同版本之间进行通信，有足够大的兼容性



## 资源占用对比

####  Flash 占用（代码大小）

| 协议         | 最小配置 | 典型配置 | 完整功能   | 相对大小 |
| :----------- | :------- | :------- | :--------- | :------- |
| DroneCAN     | ~10 KB   | 15-30 KB | 40-60 KB   | ⭐⭐ 小    |
| Cyphal       | ~15 KB   | 30-50 KB | 60-100 KB  | ⭐⭐⭐ 中等 |
| CANopen      | ~20 KB   | 40-80 KB | 100-200 KB | ⭐⭐⭐⭐ 大  |
| CANaerospace | ~15 KB   | 25-40 KB | 50-80 KB   | ⭐⭐⭐ 中等 |

#### RAM 占用（运行时内存）

| 协议         | 静态 RAM | 动态 RAM（每连接） | 栈空间 | 总需求    |
| :----------- | :------- | :----------------- | :----- | :-------- |
| DroneCAN     | 2-5 KB   | 0.5-1 KB           | 1-2 KB | ~4-8 KB   |
| Cyphal       | 4-8 KB   | 1-2 KB             | 2-4 KB | ~8-15 KB  |
| CANopen      | 8-15 KB  | 2-4 KB             | 2-4 KB | ~15-25 KB |
| CANaerospace | 3-6 KB   | 1-2 KB             | 1-2 KB | ~6-10 KB  |

#### CPU 占用（处理开销）

| 协议         | 消息解析 | 协议开销 | 实时性 | CPU 负载         |
| :----------- | :------- | :------- | :----- | :--------------- |
| DroneCAN     | 简单快速 | 低       | 优秀   | ~1-3% @ 500Kbps  |
| Cyphal       | 中等复杂 | 中等     | 良好   | ~3-5% @ 500Kbps  |
| CANopen      | 较复杂   | 较高     | 中等   | ~5-10% @ 500Kbps |
| CANaerospace | 中等     | 低       | 优秀   | ~2-4% @ 500Kbps  |

### 最小硬件要求对比

| 协议         | 最小 Flash | 最小 RAM | 推荐 MCU   | 示例芯片         |
| :----------- | :--------- | :------- | :--------- | :--------------- |
| DroneCAN     | 32 KB      | 8 KB     | Cortex-M0+ | STM32F0, STM32G0 |
| Cyphal       | 64 KB      | 16 KB    | Cortex-M3  | STM32F1, STM32L4 |
| CANopen      | 64 KB      | 16 KB    | Cortex-M3  | STM32F1, STM32F4 |
| CANaerospace | 48 KB      | 12 KB    | Cortex-M0+ | STM32F0, STM32G4 |

占用比我想得还要大，如果只是一些小模块使用，确实有点太过了，特别是成本敏感性的



## Summary

CANopen:            █████████████████████ 1000万+ 设备
DroneCAN:          ████████              50-100万 设备
Cyphal:                 ███                   1-5万 设备
CANaerospace:   ██                    数千-1万 设备



## Quote

> https://docs.px4.io/main/zh/CAN/index
