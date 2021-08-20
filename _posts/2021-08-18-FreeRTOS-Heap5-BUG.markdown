---
layout:     post
title:      "FreeRTOS Heap5内存申请过大引起的bug"
subtitle:   "FreeRTOS，Heap"
date:       2021-08-18
author:     "elmagnifico"
header-img: "img/bg7.jpg"
catalog:    true
tags:
    - FreeRTOS
    - Embedded
---

## Forward

一直使用的FreeRTOS heap5作为内存分配，最近刚好遇到一个bug，仔细看了一下发现heap5的判断情况漏了，导致这种根本检测不出来



## 现象

我申请了一块150k的内存，但是实际上我分配给heap5的内存块中只有一块大于150k，其他都是小于150k的。而大于150k的又刚好被其他东西占用了，导致当需要分配150k的时候，直接hardfault了。

但是实际上导致hardfault是由于内存分配错误，heap5返回了一个错误的地址，让我误以为他分配到了内存。



## 分析



## End





## Quote

> https://percepio.com/gettingstarted-freertos/




