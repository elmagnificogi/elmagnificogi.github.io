---
layout:     post
title:      "STM32 MCU移植SSH"
subtitle:   "STM32、action、构建"
date:       2024-13-14
update:     2024-13-14
author:     "elmagnifico"
header-img: "img/bg1.jpg"
catalog:    true
tobecontinued: false
tags:
    - SSH
    - STM32
---

## Foreword



## SSH

https://www.st.com.cn/zh/partner-products-and-services/cyclonessh.html

```
/*
 * CycloneTCP Open is licensed under GPL version 2. In particular:
 *
 * - If you link your program to CycloneTCP Open, the result is a derivative
 *   work that can only be distributed under the same GPL license terms.
 *
 * - If additions or changes to CycloneTCP Open are made, the result is a
 *   derivative work that can only be distributed under the same license terms.
 *
 * - The GPL license requires that you make the source code available to
 *   whoever you make the binary available to.
 *
 * - If you sell or distribute a hardware product that runs CycloneTCP Open,
 *   the GPL license requires you to provide public and full access to all
 *   source code on a nondiscriminatory basis.
 *
 * If you fully understand and accept the terms of the GPL license, then edit
 * the os_port_config.h header and add the following directive:
 *
 * #define GPL_LICENSE_TERMS_ACCEPTED
 */

#ifndef GPL_LICENSE_TERMS_ACCEPTED
   #error Before compiling CycloneTCP Open, you must accept the terms of the GPL license
#endif
```

如果不定义`GPL_LICENSE_TERMS_ACCEPTED` 会导致这里报错，编译不下去

![image-20241114160904024](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141609057.png)

![image-20241114160849834](https://img.elmagnifico.tech/static/upload/elmagnifico/202411141608951.png)



## Summary



## Quote

> https://www.stmcu.org.cn/module/forum/forum.php?mod=viewthread&tid=616445
