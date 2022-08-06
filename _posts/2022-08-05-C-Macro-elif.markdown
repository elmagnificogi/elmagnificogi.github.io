---
layout:     post
title:      "Maya病毒清理"
subtitle:   "你的文件贼健康,我就说一声没有别的意思"
date:       2022-07-29
update:     2022-07-29
author:     "elmagnifico"
header-img: "img/y2.jpg"
catalog:    true
tags:
    - Maya
---

## Forward





```
#if (REAL_BOARD == Leonardo)
    #define DEFAULT_BOARD
#elif (REAL_BOARD == TEENSY2pp)
    #define LEDMASK_TX   LEDS_LED1
#elif (REAL_BOARD == Teensy2)
    #define LEDMASK_TX   LEDS_LED1
#elif (REAL_BOARD == Beetle)
    #define LEDMASK_TX   LEDS_LED3
    #define LEDMASK_RX   LEDS_LED3
#elif (REAL_BOARD == UNO)
    #define MEM_SIZE 412
    #define LEDMASK_TX   LEDS_LED2
#endif

```



```
#if (REAL_BOARD == Leonardo)
    #define DEFAULT_BOARD
#endif

#if (REAL_BOARD == TEENSY2pp)
    #define LED_TX   LEDS_LED1
#endif

#if (REAL_BOARD == Teensy2)
    #define LED_TX   LEDS_LED1
#endif

#if (REAL_BOARD == Beetle)
    #define LED_TX   LEDS_LED3
    #define LED_RX   LEDS_LED3
#endif

#if (REAL_BOARD == UNO)
    #define MEM_SIZE 412
    #define LED_TX   LEDS_LED2
#endif
```





## Summary



## Quote

> https://community.arm.com/support-forums/f/keil-forum/15636/problem-with-elif
>
> https://community.st.com/s/question/0D53W00000xqWJsSAM/why-is-my-ifdef-not-working-correctly
