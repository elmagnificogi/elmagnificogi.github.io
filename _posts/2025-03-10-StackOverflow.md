---
layout:     post
title:      "嵌入式内存溢出检测"
subtitle:   "Stack Overflow，踩内存"
date:       2025-04-10
update:     2025-04-10
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tobecontinued: false
tags:
    - 嵌入式
---

## Foreword

内存溢出，非常常见的错误，但是对于嵌入式软件而言稍微有点麻烦，因为出问题的时候不一定能被调试，能被追踪到，条件十分严苛。

借鉴前人的经验，做一次实践



## 内存溢出

### 笨方法

这个方法比较笨，但是可以防止程序产生更严重的问题，比如在做内存copy或者调用指针的时候，都做一次内存范围检测，如果发现范围溢出了，那么此时就记录一下具体溢出的位置，触发函数等等。

这种方式可以维持一个长期稳定，但是溯源上还是差一些，同时也会影响效率，特别是一些高频操作或者是时间敏感的操作。



### canary

最简单的思路，在觉得可能会溢出的地方加上一个溢出标志，那么当溢出的时候就可以直接记录溢出点，然后就能追踪了

这样追踪到的是溢出点，但是如果是哪个地方溢出了，写到了别的内存的位置，这种办法就无法直接溯源，只能发现第一次出问题的点



对于堆来说，直接修改内存分配函数就行了，不影响到全局代码，但是对于栈来说就比较麻烦了，他可能是局部内发生的溢出，每个变量都要检测才行



#### 普通办法

```c
#define CANARY_VALUE 0xA5

typedef struct {
    int data;
    uint8_t canary;  // 哨兵字节
} protected_int_t;

// 初始化
#define PROTECTED_VAR_INIT(var, value) do { \
    var.data = value; \
    var.canary = CANARY_VALUE; \
} while(0)

// 检查
#define CHECK_CANARY(var) ((var).canary == CANARY_VALUE)

// 使用示例
protected_int_t my_counter;
PROTECTED_VAR_INIT(my_counter, 0);

// 检测溢出
if (!CHECK_CANARY(my_counter)) {
    // 处理溢出情况
}
```

这种方式还是比较麻烦的，每个变量都要变成结构体，都需要被重新定义，改动量比较大



#### 编译器方法

```
// 在链接器脚本中
.protected_data : {
    _protected_data_start = .;
    *(.protected_data)
    _protected_data_end = .;
    . = ALIGN(4);
    _canaries_start = .;
    . += (_protected_data_end - _protected_data_start) / 4; /* 每4字节一个哨兵 */
    _canaries_end = .;
}

// 在代码中
#define PROTECTED_VAR __attribute__((section(".protected_data")))
PROTECTED_VAR int my_counter = 0;
```

这种通过定义一个新的加载方式，将某些特定变量存储到指定位置

然后扫描代码中对应的字节位置就行了，他需要给每个变量加一个宏，这样改动其实相对比较小。

只需要额外写一个代码扫描文件，然后识别变量，将这个加上去就行了，这样在不需要这个代码的时候就可以没有，需要检测溢出的时候，就可以使用这个特殊版本进行检测。检测完还能恢复到内存使用比较少的状态。



## Summary

暂时没看到还有啥更成熟的办法，日后有了新发现再来补充

