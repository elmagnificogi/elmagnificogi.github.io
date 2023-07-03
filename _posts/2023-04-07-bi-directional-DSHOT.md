---
layout:     post
title:      "双向DSHOT with RPM feedback全指南"
subtitle:   "Bidirectional DSHOT，单线DSHOT"
date:       2023-04-07
update:     2023-07-03
author:     "elmagnifico"
header-img: "img/x1.jpg"
catalog:    true
tobecontinued: false
tags:
    - DSHOT
    - BLHeli
---

## Foreword

很久之前写过DSHOT，这次捡起来实现双向DSHOT

> https://elmagnifico.tech/2020/06/03/DSHOT-STM32-PWM-HAL/

单线DSHOT由于单线复用，实现起来非常麻烦，要考虑的东西很多。而相关文章又非常少，只能挨个翻看git issues，搜索零星的信息组合在一起。

某种程度上说DSHOT+BLH ESC有点类似现在的FOC驱动器，只不过是比较挫、弱化版、单向版的FOC，任何使用BLH ESC的电机都能使用的。

当然实际的DSHOT，无法精准控制电机的转速，得到的电机转速也是有限制的，不能趋近于0



## Bidirectional DSHOT

> https://github.com/betaflight/betaflight/pull/8554#issuecomment-512507625

总结一下，这是Bidirectional DSHOT初次实现，反转了正常DSHOT协议，并且有些和标准的DSHOT实现是不一样的，其实可以认为是一个变种DSHOT，后续这种DSHOT也被BLH的最新固件支持，变成了DSHOT的基础实现。其实这个PR还有一个点也非强，他希望兼容了BLH_S，以前老的16位单片机也能用上DSHOT，也能使用转速反馈，非常牛逼了。



Bidirectional DSHOT的一些特性

- 单线、双向传输
- Telemetry 只有转速信息，并且传回的内容是eRPM/100以后的值
- Telemetry 返回的数据是GCR格式的，且起始位必然是拉低的
- 校验位计算最后需要翻转BIT
- 最终DSHOT数据帧需要翻转，0和1电平翻转
- DSHOT 600 及以上不太支持，实现困难
- BLH 需要32.7版本以后的 
- BLH_S 需要使用Bluejay版本的固件
- ESC上电以后需要稳定输出一会才能正确回复Telemetry，否则可能单次请求Telemetry不会回复



**根据BLH最新的测试版说明，32.92.2版本扩展了Bidirectional DSHOT的Telemetry信息，包含温度、电压、电流信息了，不再是单独的转速了。**



#### 死区

显然，用单线做收发，不可避免地要遇到死区的问题，PWM的死区比普通GPIO好一点，是相对优化过的，但是普通GPIO，从输出转换到输入，需要一定时间，并且连接的器件也要同时切换，否则有可能出现小短路的情况。



#### 名词解释

- GCR，应该是一种编码方式，他可能扩大了传输的数据内容，提高了传输速率，但是更方便硬件去做检测和识别了
- bit bang/bit-bang 其实就是GPIO，比如软I2C，软SPI，这种用普通GPIO模拟某种协议的方式，就叫bit-bang
- 3x，一般来说如果你想解码一个信号，最低要求你获取信号的频率是原始信号的3倍，你才能得到一个比较好的解码效果
- 5/4，GCR编码从4bits变成了5bits，所以传输速度就提升了
- bidir DSHOT，双向DSHOT，也就是单线DSHOT，实现转速可读
- Run-length limited，其实就是在带宽有限的通信链路上，如何组织数据，从而提高数据传输速度
- eRPM，电调回传的是磁极数，电机上磁极一定是成对出现的，一般电机是14或者12个，对应的数值也就需要/7或者/6得到RPM数
- RPM，转速每分钟
- RPS，转速每秒



#### 实现方式

一般来说DSHOT都是通过PWM+DMA实现的，但是众所周知H7以下的STM32板子DMA通道都是固定的，如果一开始设计的时候没有考虑到这个事情，就很有可能会出现DMA冲突，PWM+DMA实现不了，进而导致DSHOT无法使用，也就没法推进了。



看了一下老的issues，发现他们提出来了一种解决办法，通过普通GPIO+DMA实现DSHOT，这相当于是说就算PWM用不了，他也能直接做GPIO去实现，或者直接利用空闲的GPIO实现DSHOT，而不需要被DMA或者PWM通道绑定给卡住。



### 代码分析



#### 驱动结构

`motor.c`是总体电机控制的驱动

```c
// End point initialization is called from mixerInit before motorDevInit; can't use vtable...
void motorInitEndpoints(const motorConfig_t *motorConfig, float outputLimit, float *outputLow, float *outputHigh, float *disarm, float *deadbandMotor3dHigh, float *deadbandMotor3dLow)
{
    checkMotorProtocol(&motorConfig->dev);

    if (isMotorProtocolEnabled()) {
        if (!isMotorProtocolDshot()) {
            analogInitEndpoints(motorConfig, outputLimit, outputLow, outputHigh, disarm, deadbandMotor3dHigh, deadbandMotor3dLow);
        }
#ifdef USE_DSHOT
        else {
            dshotInitEndpoints(motorConfig, outputLimit, outputLow, outputHigh, disarm, deadbandMotor3dHigh, deadbandMotor3dLow);
        }
#endif
    }
}
```

在这里调用了dshot endpoints的初始化，可以认为只是初始化了一下前期使用的一些变量



```c
void motorDevInit(const motorDevConfig_t *motorDevConfig, uint16_t idlePulse, uint8_t motorCount)
{
    memset(motors, 0, sizeof(motors));

    bool useUnsyncedPwm = motorDevConfig->useUnsyncedPwm;

    if (isMotorProtocolEnabled()) {
        if (!isMotorProtocolDshot()) {
            motorDevice = motorPwmDevInit(motorDevConfig, idlePulse, motorCount, useUnsyncedPwm);
        }
#ifdef USE_DSHOT
        else {
#ifdef USE_DSHOT_BITBANG
            if (isDshotBitbangActive(motorDevConfig)) {
                motorDevice = dshotBitbangDevInit(motorDevConfig, motorCount);
            } else
#endif
            {
                motorDevice = dshotPwmDevInit(motorDevConfig, idlePulse, motorCount, useUnsyncedPwm);
            }
        }
#endif
    }

    if (motorDevice) {
        motorDevice->count = motorCount;
        motorDevice->initialized = true;
        motorDevice->motorEnableTimeMs = 0;
        motorDevice->enabled = false;
    } else {
        motorNullDevice.vTable = motorNullVTable;
        motorDevice = &motorNullDevice;
    }
}
```

接着就是电机设备的初始，这里就会根据实际使用的协议来初始化了。



```c
motorDevice_t *dshotBitbangDevInit(const motorDevConfig_t *motorConfig, uint8_t count)
{
    dbgPinLo(0);
    dbgPinLo(1);

    motorPwmProtocol = motorConfig->motorPwmProtocol;
    bbDevice.vTable = bbVTable;
    motorCount = count;
    bbStatus = DSHOT_BITBANG_STATUS_OK;

#ifdef USE_DSHOT_TELEMETRY
    useDshotTelemetry = motorConfig->useDshotTelemetry;
#endif

    memset(bbOutputBuffer, 0, sizeof(bbOutputBuffer));

    for (int motorIndex = 0; motorIndex < MAX_SUPPORTED_MOTORS && motorIndex < motorCount; motorIndex++) {
        const unsigned reorderedMotorIndex = motorConfig->motorOutputReordering[motorIndex];
        const timerHardware_t *timerHardware = timerGetConfiguredByTag(motorConfig->ioTags[reorderedMotorIndex]);
        const IO_t io = IOGetByTag(motorConfig->ioTags[reorderedMotorIndex]);

        uint8_t output = motorConfig->motorPwmInversion ?  timerHardware->output ^ TIMER_OUTPUT_INVERTED : timerHardware->output;
        bbPuPdMode = (output & TIMER_OUTPUT_INVERTED) ? BB_GPIO_PULLDOWN : BB_GPIO_PULLUP;

#ifdef USE_DSHOT_TELEMETRY
        if (useDshotTelemetry) {
            output ^= TIMER_OUTPUT_INVERTED;
        }
#endif

        if (!IOIsFreeOrPreinit(io)) {
            /* not enough motors initialised for the mixer or a break in the motors */
            bbDevice.vTable.write = motorWriteNull;
            bbDevice.vTable.updateStart = motorUpdateStartNull;
            bbDevice.vTable.updateComplete = motorUpdateCompleteNull;
            bbStatus = DSHOT_BITBANG_STATUS_MOTOR_PIN_CONFLICT;
            return NULL;
        }

        int pinIndex = IO_GPIOPinIdx(io);

        bbMotors[motorIndex].pinIndex = pinIndex;
        bbMotors[motorIndex].io = io;
        bbMotors[motorIndex].output = output;
#if defined(STM32F4)
        bbMotors[motorIndex].iocfg = IO_CONFIG(GPIO_Mode_OUT, GPIO_Speed_50MHz, GPIO_OType_PP, bbPuPdMode);
#elif defined(STM32F7) || defined(STM32G4) || defined(STM32H7)
        bbMotors[motorIndex].iocfg = IO_CONFIG(GPIO_MODE_OUTPUT_PP, GPIO_SPEED_FREQ_LOW, bbPuPdMode);
#endif

        IOInit(io, OWNER_MOTOR, RESOURCE_INDEX(motorIndex));
        IOConfigGPIO(io, bbMotors[motorIndex].iocfg);
        if (output & TIMER_OUTPUT_INVERTED) {
            IOLo(io);
        } else {
            IOHi(io);
        }

        // Fill in motors structure for 4way access (XXX Should be refactored)
        motors[motorIndex].io = bbMotors[motorIndex].io;
    }

    return &bbDevice;
}
```

dshotBitbang设备初始化，根据实际的电机数量，依次获取对应的IO和Timer专门用于处理Bitbang，之后就是对IO进行初始化。通过代码看到实际使用的Timer就是`Tim1`和`Tim8`，他们的通道数量比较多，适合做电机使用

```c
const timerHardware_t bbTimerHardware[] = {
#if defined(STM32F4) || defined(STM32F7)
#if !defined(STM32F411xE)
    DEF_TIM(TIM8,  CH1, NONE,  TIM_USE_NONE, 0, 1),
    DEF_TIM(TIM8,  CH2, NONE,  TIM_USE_NONE, 0, 1),
    DEF_TIM(TIM8,  CH3, NONE,  TIM_USE_NONE, 0, 1),
    DEF_TIM(TIM8,  CH4, NONE,  TIM_USE_NONE, 0, 0),
#endif
    DEF_TIM(TIM1,  CH1, NONE,  TIM_USE_NONE, 0, 1),
    DEF_TIM(TIM1,  CH1, NONE,  TIM_USE_NONE, 0, 2),
    DEF_TIM(TIM1,  CH2, NONE,  TIM_USE_NONE, 0, 1),
    DEF_TIM(TIM1,  CH3, NONE,  TIM_USE_NONE, 0, 1),
    DEF_TIM(TIM1,  CH4, NONE,  TIM_USE_NONE, 0, 0),

#elif defined(STM32G4) || defined(STM327H)
    // XXX TODO: STM32G4 and STM32H7 can use any timer for pacing

    // DMA request numbers are duplicated for TIM1 and TIM8:
    //   - Any pacer can serve a GPIO port.
    //   - For quads (or less), 4 pacers can cover the worst case scenario of
    //     4 motors scattered across 4 different GPIO ports.
    //   - For hexas (and larger), more channels may become necessary,
    //     in which case the DMA request numbers should be modified.
    DEF_TIM(TIM8,  CH1, NONE,  TIM_USE_NONE, 0, 0, 0),
    DEF_TIM(TIM8,  CH2, NONE,  TIM_USE_NONE, 0, 1, 0),
    DEF_TIM(TIM8,  CH3, NONE,  TIM_USE_NONE, 0, 2, 0),
    DEF_TIM(TIM8,  CH4, NONE,  TIM_USE_NONE, 0, 3, 0),
    DEF_TIM(TIM1,  CH1, NONE,  TIM_USE_NONE, 0, 0, 0),
    DEF_TIM(TIM1,  CH2, NONE,  TIM_USE_NONE, 0, 1, 0),
    DEF_TIM(TIM1,  CH3, NONE,  TIM_USE_NONE, 0, 2, 0),
    DEF_TIM(TIM1,  CH4, NONE,  TIM_USE_NONE, 0, 3, 0),

```

后续的motor所有操作就是基于VTable来的了

```c
static motorVTable_t bbVTable = {
    .postInit = bbPostInit,
    .enable = bbEnableMotors,
    .disable = bbDisableMotors,
    .isMotorEnabled = bbIsMotorEnabled,
    .updateStart = bbUpdateStart,
    .write = bbWrite,
    .writeInt = bbWriteInt,
    .updateComplete = bbUpdateComplete,
    .convertExternalToMotor = dshotConvertFromExternal,
    .convertMotorToExternal = dshotConvertToExternal,
    .shutdown = bbShutdown,
};
```

唯一需要注意的地方就是，dshot需要先updateStart，再写值，然后再complete

```c
void motorWriteAll(float *values)
{
#ifdef USE_PWM_OUTPUT
    if (motorDevice->enabled) {
#if defined(USE_DSHOT) && defined(USE_DSHOT_TELEMETRY)
        if (!motorDevice->vTable.updateStart()) {
            return;
        }
#endif
        for (int i = 0; i < motorDevice->count; i++) {
            motorDevice->vTable.write(i, values[i]);
        }
        motorDevice->vTable.updateComplete();
    }
#else
    UNUSED(values);
#endif
}
```



如何开启一次传输

```c
static bool bbUpdateStart(void)
{
#ifdef USE_DSHOT_TELEMETRY
    if (useDshotTelemetry) {
#ifdef USE_DSHOT_TELEMETRY_STATS
        const timeMs_t currentTimeMs = millis();
#endif

        // 首先是等待上一次telemetry的完成
        // Wait for telemetry reception to complete before decode
        bool telemetryPending;
        bool telemetryWait = false;
        const timeUs_t startTimeUs = micros();

        do {
            telemetryPending = false;
            for (int i = 0; i < usedMotorPorts; i++) {
                telemetryPending |= bbPorts[i].telemetryPending;
            }

            telemetryWait |= telemetryPending;
			// 如果超时了，就直接退出了，本次写失败
            if (cmpTimeUs(micros(), startTimeUs) > DSHOT_TELEMETRY_TIMEOUT) {
                return false;
            }
        } while (telemetryPending);

        if (telemetryWait) {
            DEBUG_SET(DEBUG_DSHOT_TELEMETRY_COUNTS, 2, debug[2] + 1);
        } else {
            for (int motorIndex = 0; motorIndex < MAX_SUPPORTED_MOTORS && motorIndex < motorCount; motorIndex++) {
#ifdef USE_DSHOT_CACHE_MGMT
                // 这里是处理ST的cache问题，将DMA缓存区域无效化，防止后续数据出问题
                // Only invalidate the buffer once. If all motors are on a common port they'll share a buffer.
                bool invalidated = false;
                for (int i = 0; i < motorIndex; i++) {
                    if (bbMotors[motorIndex].bbPort->portInputBuffer == bbMotors[i].bbPort->portInputBuffer) {
                        invalidated = true;
                    }
                }
                if (!invalidated) {
                    SCB_InvalidateDCache_by_Addr((uint32_t *)bbMotors[motorIndex].bbPort->portInputBuffer,
                                                 DSHOT_BB_PORT_IP_BUF_CACHE_ALIGN_BYTES);
                }
#endif

#ifdef STM32F4
                uint32_t rawValue = decode_bb_bitband(
                    bbMotors[motorIndex].bbPort->portInputBuffer,
                    bbMotors[motorIndex].bbPort->portInputCount - bbDMA_Count(bbMotors[motorIndex].bbPort),
                    bbMotors[motorIndex].pinIndex);
#else
                // 解析上一次的值
                uint32_t rawValue = decode_bb(
                    bbMotors[motorIndex].bbPort->portInputBuffer,
                    bbMotors[motorIndex].bbPort->portInputCount - bbDMA_Count(bbMotors[motorIndex].bbPort),
                    bbMotors[motorIndex].pinIndex);
#endif
                if (rawValue == DSHOT_TELEMETRY_NOEDGE) {
                    DEBUG_SET(DEBUG_DSHOT_TELEMETRY_COUNTS, 1, debug[1] + 1);
                    continue;
                }
                DEBUG_SET(DEBUG_DSHOT_TELEMETRY_COUNTS, 0, debug[0] + 1);
                dshotTelemetryState.readCount++;
				
                // 简单判断是否正确，更新Telmetry状态
                if (rawValue != DSHOT_TELEMETRY_INVALID) {
                    // Check EDT enable or store raw value
                    if ((rawValue == 0x0E00) && (dshotCommandGetCurrent(motorIndex) == DSHOT_CMD_EXTENDED_TELEMETRY_ENABLE)) {
                        dshotTelemetryState.motorState[motorIndex].telemetryTypes = 1 << DSHOT_TELEMETRY_TYPE_STATE_EVENTS;
                    } else {
                        dshotTelemetryState.motorState[motorIndex].rawValue = rawValue;
                    }
                } else {
                    dshotTelemetryState.invalidPacketCount++;
                }
#ifdef USE_DSHOT_TELEMETRY_STATS
                updateDshotTelemetryQuality(&dshotTelemetryQuality[motorIndex], rawValue != DSHOT_TELEMETRY_INVALID, currentTimeMs);
#endif
            }

            dshotTelemetryState.rawValueState = DSHOT_RAW_VALUE_STATE_NOT_PROCESSED;
        }
#endif
    }

    for (int i = 0; i < usedMotorPorts; i++) {
        bbDMA_Cmd(&bbPorts[i], DISABLE);
        bbOutputDataClear(bbPorts[i].portOutputBuffer);
    }

    return true;
}
```

基本可以看到start仅仅是对上一次telemetry的处理，开启一次新的DSHOT传输还不在这里。



实际执行DSHOT写入的地方是在`bbWriteInt`

```c
static void bbWriteInt(uint8_t motorIndex, uint16_t value)
{
    bbMotor_t *const bbmotor = &bbMotors[motorIndex];

    if (!bbmotor->configured) {
        return;
    }

    // fetch requestTelemetry from motors. Needs to be refactored.
    motorDmaOutput_t * const motor = getMotorDmaOutput(motorIndex);
    bbmotor->protocolControl.requestTelemetry = motor->protocolControl.requestTelemetry;
    motor->protocolControl.requestTelemetry = false;

    // If there is a command ready to go overwrite the value and send that instead
    if (dshotCommandIsProcessing()) {
        value = dshotCommandGetCurrent(motorIndex);
        if (value) {
            bbmotor->protocolControl.requestTelemetry = true;
        }
    }

    bbmotor->protocolControl.value = value;
	// 准备数据
    uint16_t packet = prepareDshotPacket(&bbmotor->protocolControl);

    bbPort_t *bbPort = bbmotor->bbPort;

#ifdef USE_DSHOT_TELEMETRY
    if (useDshotTelemetry) {
        bbOutputDataSet(bbPort->portOutputBuffer, bbmotor->pinIndex, packet, DSHOT_BITBANG_INVERTED);
    } else
#endif
    {
        bbOutputDataSet(bbPort->portOutputBuffer, bbmotor->pinIndex, packet, DSHOT_BITBANG_NONINVERTED);
    }
}
```

到这里也只是准备好了DSHOT准备写入的数据，实际发送还在后面



```c
static void bbUpdateComplete(void)
{
    // If there is a dshot command loaded up, time it correctly with motor update

    if (!dshotCommandQueueEmpty()) {
        if (!dshotCommandOutputIsEnabled(bbDevice.count)) {
            return;
        }
    }

#ifdef USE_DSHOT_CACHE_MGMT
    for (int motorIndex = 0; motorIndex < MAX_SUPPORTED_MOTORS && motorIndex < motorCount; motorIndex++) {
        // Only clean each buffer once. If all motors are on a common port they'll share a buffer.
        bool clean = false;
        for (int i = 0; i < motorIndex; i++) {
            if (bbMotors[motorIndex].bbPort->portOutputBuffer == bbMotors[i].bbPort->portOutputBuffer) {
                clean = true;
            }
        }
        if (!clean) {
            SCB_CleanDCache_by_Addr(bbMotors[motorIndex].bbPort->portOutputBuffer, MOTOR_DSHOT_BUF_CACHE_ALIGN_BYTES);
        }
    }
#endif

    for (int i = 0; i < usedMotorPorts; i++) {
        bbPort_t *bbPort = &bbPorts[i];

       // 切换到输出模式
#ifdef USE_DSHOT_TELEMETRY
        if (useDshotTelemetry) {
            if (bbPort->direction == DSHOT_BITBANG_DIRECTION_INPUT) {
                bbPort->inputActive = false;
                bbSwitchToOutput(bbPort);
            }
        } else
#endif
        {
#if defined(STM32G4)
            // Using circular mode resets the counter one short, so explicitly reload
            bbSwitchToOutput(bbPort);
#endif
        }
		// 开启发送DMA
        bbDMA_Cmd(bbPort, ENABLE);
    }

    // 开启TIM DMA
    lastSendUs = micros();
    for (int i = 0; i < usedMotorPacers; i++) {
        bbPacer_t *bbPacer = &bbPacers[i];
        bbTIM_DMACmd(bbPacer->tim, bbPacer->dmaSources, ENABLE);
    }
}
```



#### DSHOT校验和

查看Betaflight中关于DSHOT部分的源码，默认开启了`DSHOT_TELEMETRY`就会使用Bidirectional DSHOT

```c
FAST_CODE uint16_t prepareDshotPacket(dshotProtocolControl_t *pcb)
{
    uint16_t packet;

    ATOMIC_BLOCK(NVIC_PRIO_DSHOT_DMA) {
        packet = (pcb->value << 1) | (pcb->requestTelemetry ? 1 : 0);
        pcb->requestTelemetry = false;    // reset telemetry request to make sure it's triggered only once in a row
    }

    // 这里求解出来普通Dshot的后4位的异或和
    // compute checksum
    unsigned csum = 0;
    unsigned csum_data = packet;
    for (int i = 0; i < 3; i++) {
        csum ^=  csum_data;   // xor data by nibbles
        csum_data >>= 4;
    }
    // append checksum
#ifdef USE_DSHOT_TELEMETRY
    // 一旦使用了Telemetry 就会反转后四位
    if (useDshotTelemetry) {
        csum = ~csum;
    }
#endif
    csum &= 0xf;
    packet = (packet << 4) | csum;

    return packet;
}
```

飞控发送 DSHOT帧，但是最低的4bits=其他4bits做异或和，再取反

如果ESC检测到了这个情况，也就是最低4bits是反的，就会切换模式在同一根线上发送一个Telemetry帧



#### 转速计算

然后这个Telemetry包是这么解析的，Telemeter的原始数据，一共是21bits，其中第一bit一定是0，表示数据开始，而之后紧跟的20bits，其实是每4bits使用GCR转换成的，也就是每5bit解析成一个4bits，然后重新组装

```
0 aaaa bbbbb fffff ddddd 原始21bits
e e e m m m m m m m m m c c c c 解码后原始16bits
```



```
e e e m m m m m m m m m c c c c 解码后原始16bits
e e e m m m m m m m m m 校验成功以后的转速数据 12bits
```

后4个c是异或和的校验码

前间3个e是预周期的位移量，叫做左移位数E

中间9个m是预周期值，这个值需要左移E次，才能得到实际的周期数值



如果仅仅使用12bits来表示转速，还是有点不够，最低转速太高了（主要是这里定义的是两个电极之间的延迟，而不是直接的转速，这样实时性比较高，12bit最大就是4096us，算下来大概最低能检测转速是34（14电极），还是很快的）

```c
static uint32_t dshot_decode_eRPM_telemetry_value(uint16_t value)
{
    // eRPM range
    if (value == 0x0fff) {
        return 0;
    }

    // Convert value to 16 bit from the GCR telemetry format (eeem mmmm mmmm)
    value = (value & 0x01ff) << ((value & 0xfe00) >> 9);
    if (!value) {
        return DSHOT_TELEMETRY_INVALID;
    }

    // Convert period to erpm * 100
    return (1000000 * 60 / 100 + value / 2) / value;
}
```

通过次方表示，这样实现了仅仅用12位表示接近16位整数的范围的值，实际能表示大概为1-65408，对应可以测量到的电机最小转速就是`1000000/65408=15.28886` 每秒   对于14电极的电机来说，大概相当于是转了2圈

而平常对转速的描述是分钟，所以还需要`*60`，就变成了eRPM，至于代码里为什么还多了一个`value/2`，就不知道了



传回的内容是eRPM/100以后的值，转换成rpm

```c
// Used with serial esc telem as well as dshot telem
uint32_t erpmToRpm(uint16_t erpm)
{
    //  rpm = (erpm * 100) / (motorConfig()->motorPoleCount / 2)
    return (erpm * 200) / motorConfig()->motorPoleCount;
}
```



#### bit bang实现

这里主要是参考一下bit bang是怎么实现的

```c
#define MOTOR_DSHOT_BIT_PER_SYMBOL         1

#define MOTOR_DSHOT_STATE_PER_SYMBOL       3  // Initial high, 0/1, low
#define MOTOR_DSHOT_BIT_HOLD_STATES        3  // 3 extra states at the end of transmission required to allow ESC to sample the last bit correctly.

#define MOTOR_DSHOT_FRAME_BITS             16

#define MOTOR_DSHOT_FRAME_TIME_NS(rate)    ((MOTOR_DSHOT_FRAME_BITS / MOTOR_DSHOT_BIT_PER_SYMBOL) * MOTOR_DSHOT_SYMBOL_TIME_NS(rate))

#define MOTOR_DSHOT_TELEMETRY_WINDOW_US    (30000 + MOTOR_DSHOT_FRAME_TIME_NS(rate) * (1.1)) / 1000

#define MOTOR_DSHOT_CHANGE_INTERVAL_NS(rate) (MOTOR_DSHOT_SYMBOL_TIME_NS(rate) / MOTOR_DSHOT_STATE_PER_SYMBOL)

#define MOTOR_DSHOT_GCR_CHANGE_INTERVAL_NS(rate) (MOTOR_DSHOT_CHANGE_INTERVAL_NS(rate) * 5 / 4)
```



```c
// DMA buffers
// Note that we are not sharing input and output buffers,
// as output buffer is only modified for middle bits

// DMA output buffer:
// DShot requires 3 [word/bit] * 16 [bit] = 48 [word]
extern uint32_t bbOutputBuffer[MOTOR_DSHOT_BUF_CACHE_ALIGN_LENGTH * MAX_SUPPORTED_MOTOR_PORTS];
```

这里主要理解`bbOutputBuffer`是怎么设计的

首先DSHOT每一帧一共是16位，输出的时候，每一位，用一个`SYMBOL`表示。

一个`SYMBOL`又有3个状态，也就是初始-高状态、数据状态、低状态。 因为是Bidirectional DSHOT的帧，所以初始状态一定是高、数据状态根据传输的情况定（如果是正常DSHOT，初始应该是低）。

每一帧的结尾为了让ESC可以完整采样，又额外加了一个`SYMBOL`，也就是3个状态

- 主要是如果MCU在输出结束以后立马切换到输入模式，可能会造成传输线上的电平立马被拉低，这可能会导致ESC那边还没采样到最后一位，这个数据就被破坏了，为了确保传输质量，多传输了1bit。



这样得到最后`bbOutputBuffer`的长度是51bits，其实这个buffer只是方便控制引脚而已，每3bits的第一bit一定是让引脚设置高，第三bit一定是让引脚设置低，第二bit则是这次要输出的状态。

```c
// DMA input buffer
// (30us + <frame time> + <slack>) / <input sampling clock period>
// <frame time> = <DShot symbol time> * 16
// Temporary size for DS600
// <frame time> = 26us
// <sampling period> = 0.44us
// <slack> = 10%
// (30 + 26 + 3) / 0.44 = 134
// In some cases this was not enough, so we add 6 extra samples
#define DSHOT_BB_PORT_IP_BUF_LENGTH 140
```

这里的注释怀疑过时了，依然不能合理解释21bits的问题。但是大概可以知道，当发完一个DSHOT帧以后，有30us的时间去切换输入->输出。

然后就是等待Telemetry，拿到以后，还要空一点点时间给ESC切回去，等下一个帧。



```c
static uint32_t decode_bb_value(uint32_t value, uint16_t buffer[], uint32_t count, uint32_t bit)
{
#ifndef DEBUG_BBDECODE
    UNUSED(buffer);
    UNUSED(count);
    UNUSED(bit);
#endif
#define iv 0xffffffff
    // First bit is start bit so discard it.
    value &= 0xfffff;
    // 这里是GCR的字典匹配
    static const uint32_t decode[32] = {
        iv, iv, iv, iv, iv, iv, iv, iv, iv, 9, 10, 11, iv, 13, 14, 15,
        iv, iv, 2, 3, iv, 5, 6, 7, iv, 0, 8, 1, iv, 4, 12, iv };
	// 每5位转换成4位的实际值
    uint32_t decodedValue = decode[value & 0x1f];
    decodedValue |= decode[(value >> 5) & 0x1f] << 4;
    decodedValue |= decode[(value >> 10) & 0x1f] << 8;
    decodedValue |= decode[(value >> 15) & 0x1f] << 12;
    
    // 计算校验和
    uint32_t csum = decodedValue;
    csum = csum ^ (csum >> 8); // xor bytes
    csum = csum ^ (csum >> 4); // xor nibbles

    if ((csum & 0xf) != 0xf || decodedValue > 0xffff) {
#ifdef DEBUG_BBDECODE
        memcpy(dshotTelemetryState.inputBuffer, sequence, sizeof(sequence));
        for (unsigned i = 0; i < count; i++) {
            bbBuffer[i] = !!(buffer[i] & (1 << bit));
        }
#endif
        value = DSHOT_TELEMETRY_INVALID;
    } else {
        // 计算正确，移除校验和的部分
        value = decodedValue >> 4;
    }

    return value;
}
```



由于是3倍采样，所以还有一个函数是`decode_bb_bitband`用来从采样数据里筛选出来目标帧，并将其转换成raw数据

```c
uint32_t decode_bb_bitband( uint16_t buffer[], uint32_t count, uint32_t bit)
{
    uint8_t startMargin;

#ifdef DEBUG_BBDECODE
    memset(sequence, 0, sizeof(sequence));
    sequenceIndex = 0;
#endif
    uint32_t value = 0;

    bitBandWord_t* p = (bitBandWord_t*)BITBAND_SRAM((uint32_t)buffer, bit);
    bitBandWord_t* b = p;
    bitBandWord_t* endP = p + (count - MIN_VALID_BBSAMPLES);

    // Jump forward in the buffer to just before where we anticipate the first zero
    p += preambleSkip;

    // 寻找头 第一bit必然是0，所以找一个下降沿
    // Eliminate leading high signal level by looking for first zero bit in data stream.
    // Manual loop unrolling and branch hinting to produce faster code.
    while (p < endP) {
        if (__builtin_expect((!(p++)->value), 0) ||
            __builtin_expect((!(p++)->value), 0) ||
            __builtin_expect((!(p++)->value), 0) ||
            __builtin_expect((!(p++)->value), 0)) {
            break;
        }
    }

    startMargin = p - b;
    DEBUG_SET(DEBUG_DSHOT_TELEMETRY_COUNTS, 3, startMargin);

    if (p >= endP) {
        // not returning telemetry is ok if the esc cpu is
        // overburdened.  in that case no edge will be found and
        // BB_NOEDGE indicates the condition to caller
        return DSHOT_TELEMETRY_NOEDGE;
    }

    int remaining = MIN(count - (p - b), (unsigned int)MAX_VALID_BBSAMPLES);

    bitBandWord_t* oldP = p;
    uint32_t bits = 0;
    // 重新标定结尾
    endP = p + remaining;

#ifdef DEBUG_BBDECODE
    sequence[sequenceIndex++] = p - b;
#endif

    while (endP > p) {
        // 寻找上升沿
        do {
            // Look for next positive edge. Manual loop unrolling and branch hinting to produce faster code.
            if(__builtin_expect((p++)->value, 0) ||
               __builtin_expect((p++)->value, 0) ||
               __builtin_expect((p++)->value, 0) ||
               __builtin_expect((p++)->value, 0)) {
                break;
            }
        } while (endP > p);

        if (endP > p) {

#ifdef DEBUG_BBDECODE
            sequence[sequenceIndex++] = p - b;
#endif
            // 找到一个上升沿
            // A level of length n gets decoded to a sequence of bits of
            // the form 1000 with a length of (n+1) / 3 to account for 3x
            // oversampling.
            const int len = MAX((p - oldP + 1) / 3, 1);
            bits += len;
            value <<= len;
            value |= 1 << (len - 1);
            oldP = p;
            // 上升沿记录一下
			
            // 找下降沿
            // Look for next zero edge. Manual loop unrolling and branch hinting to produce faster code.
            do {
                if (__builtin_expect(!(p++)->value, 0) ||
                    __builtin_expect(!(p++)->value, 0) ||
                    __builtin_expect(!(p++)->value, 0) ||
                    __builtin_expect(!(p++)->value, 0)) {
                    break;
                }
            } while (endP > p);

            if (endP > p) {

#ifdef DEBUG_BBDECODE
                sequence[sequenceIndex++] = p - b;
#endif
                // 找到下降沿 记录一下
                // A level of length n gets decoded to a sequence of bits of
                // the form 1000 with a length of (n+1) / 3 to account for 3x
                // oversampling.
                const int len = MAX((p - oldP + 1) / 3, 1);
                bits += len;
                value <<= len;
                value |= 1 << (len - 1);
                oldP = p;
            }
        }
    }

    // 如果找到的bits 少于18，说明不正确
    if (bits < 18) {
        return DSHOT_TELEMETRY_NOEDGE;
    }

    // 由于最后一bit可能是高，所以会有一个额外的上升沿，就变成了21bits
    // length of last sequence has to be inferred since the last bit with inverted dshot is high
    const int nlen = 21 - bits;
    if (nlen < 0) {
        return DSHOT_TELEMETRY_NOEDGE;
    }

#ifdef DEBUG_BBDECODE
    sequence[sequenceIndex] = sequence[sequenceIndex] + (nlen) * 3;
    sequenceIndex++;
#endif

    // The anticipated edges were observed
    preambleSkip = startMargin - DSHOT_TELEMETRY_START_MARGIN;

    if (nlen > 0) {
        value <<= nlen;
        value |= 1 << (nlen - 1);
    }

    return decode_bb_value(value, buffer, count, bit);
}
```



#### bit bang 驱动



```c
void bbGpioSetup(bbMotor_t *bbMotor);
void bbTimerChannelInit(bbPort_t *bbPort);
void bbDMAPreconfigure(bbPort_t *bbPort, uint8_t direction);
void bbDMAIrqHandler(dmaChannelDescriptor_t *descriptor);
void bbSwitchToOutput(bbPort_t * bbPort);
void bbSwitchToInput(bbPort_t * bbPort);

void bbTIM_TimeBaseInit(bbPort_t *bbPort, uint16_t period);
void bbTIM_DMACmd(TIM_TypeDef* TIMx, uint16_t TIM_DMASource, FunctionalState NewState);
void bbDMA_ITConfig(bbPort_t *bbPort);
void bbDMA_Cmd(bbPort_t *bbPort, FunctionalState NewState);
int  bbDMA_Count(bbPort_t *bbPort);

```

主要接口都在这里，Betaflight底层实现了一个bitbang的标准库还有一个lowlevel的库

![image-20230412153201606](https://img.elmagnifico.tech/static/upload/elmagnifico/202304121532681.png)

这里就是一些基本的硬件配置，主要就是通过DMA设置GPIO或者读取GPIO

TIM也有DMA，实际上前面的大部分配置和TIM DMA用作PWM是一样的，唯一不同的点在于，TIM DMA触发的不再是CCR寄存器，而是GPIO的寄存器



在`bbWriteInt`中可以看到，给过来的DSHOT数据帧还需要再次被处理，会将整个DSHOT数据翻转

```c
static void bbOutputDataSet(uint32_t *buffer, int pinNumber, uint16_t value, bool inverted)
{
    uint32_t middleBit;
	
    // 使用telemetery 就需要翻转中间bit
    if (inverted) {
        // 是写入GPIO BSRR 所以低位写1置位
        middleBit = (1 << (pinNumber + 0));
    } else {
        // 高位写1 复位
        middleBit = (1 << (pinNumber + 16));
    }

    for (int pos = 0; pos < 16; pos++) {
        // 这里则是翻转BIT
        if (!(value & 0x8000)) {
            buffer[pos * 3 + 1] |= middleBit;
        }
        value <<= 1;
    }
}
```



DMA中断处理程序，可以看到如果开启了Telemetry那么会在DMA完成以后切换到输入模式。

```c
FAST_IRQ_HANDLER void bbDMAIrqHandler(dmaChannelDescriptor_t *descriptor)
{
    dbgPinHi(0);

    bbPort_t *bbPort = (bbPort_t *)descriptor->userParam;

    bbDMA_Cmd(bbPort, DISABLE);

    bbTIM_DMACmd(bbPort->timhw->tim, bbPort->dmaSource, DISABLE);

    if (DMA_GET_FLAG_STATUS(descriptor, DMA_IT_TEIF)) {
        while (1) {};
    }

    DMA_CLEAR_FLAG(descriptor, DMA_IT_TCIF);

#ifdef USE_DSHOT_TELEMETRY
    if (useDshotTelemetry) {
        if (bbPort->direction == DSHOT_BITBANG_DIRECTION_INPUT) {
            bbPort->telemetryPending = false;
#ifdef DEBUG_COUNT_INTERRUPT
            bbPort->inputIrq++;
#endif
        } else {
#ifdef DEBUG_COUNT_INTERRUPT
            bbPort->outputIrq++;
#endif

            // Switch to input

            bbSwitchToInput(bbPort);
            bbPort->telemetryPending = true;

            bbTIM_DMACmd(bbPort->timhw->tim, bbPort->dmaSource, ENABLE);
        }
    }
#endif
    dbgPinLo(0);
}
```



## Run-length limited

Run-length limited 这个概念国内搜起来很容易和游程搞混，其实是不一样的东西，游程在这里其实和Dshot GCR没啥关系



### 游程

游程，一个序列中取值相同，连在一起的元素合起来叫做一个游程，连续元素的个数，叫做这个游程的长度

```
0 0 0 1 1 1 1 0 1 0 1 1 0 0 1
  0      1    0 1 0  1   0  1
```

比如上述，一共15个bit，也就游程长度是8

```
其中长度为4的是：1111
其中长度为3的是：000
其中长度为2的是：11，00
其中长度为1的是：0，1，0，1
```



#### 游程长度编码（RLC，Run-length Code）

现在使用游程多半是用来压缩数据的，以前使用游程可能是为了兼容硬件上的某些情况而不得不用。游程长度编码是十分简单的压缩方式，编码速度也非常快，核心就是通过去除冗余字符，来减少数据文件所占存储空间的目的

简单来说，游程长度编码的主要任务是统计连续相同字符的个数，解码时要根据字符及连续相同字符的个数，恢复原来的数据

一般来说使用`(n,m)`来表示,就是说有m个形式为n的字符，对于比特流之类的东西，就可以用这种方式编码，来减少传输量



### RLL

RLL(n,m)，指定两个连续1之间，最少有n个0，最多有m个0。其实RLL还有2个参数，剩下这个两个其实就是编码前的bit数量，一般用来说明传输速度的改变

RLL还有一个特性，**在调制解调中，只有电平变化，才表示bit发生了改变，否则认为是0**，如果没有这个前提，下面的图示根本看不懂

![image-20230411120038480](https://img.elmagnifico.tech/static/upload/elmagnifico/202304111200542.png)



#### 常见的编码方式



#### FM:(0,1) RLL

**FM:(0,1) RLL**，这种方式看起来只是多了一个`1`，实际上这个1可以作为时钟的`1`，从而可以形成差分编码的方式，这种方式让编码变长了。

其实是当年FM调配的物理实现有些不同，物理上写1的频率是写0的两倍，所以这里增加`1`刚好满足了写1的速度，让两边可以同步控制

```
0 -> 10
1 -> 11
```

通过RLL(0,1)编码后，两个连续1之间最少是0个0 `11 11`，最多是1个0 `11 10 11`

`10110010 -> 1110111110101110`

![image-20230411111133673](https://img.elmagnifico.tech/static/upload/elmagnifico/202304111111728.png)

图中下面的尖峰是表示电平翻转，而平表示没产生变化，红点则是每个数据之间的分割点，刚好是编码后的样子，同时符合RLL特性的



#### GCR:(0,2) RLL

**GCR:(0,2) RLL**，这个是IBM提出来的一种编码方式，主要是用来提高传输的速率，通过这种编码方式，将最多相邻的0，控制在了2个以内，从而提高了传输速度

```
0000 -> 11001
0001 -> 11011
0010 -> 10010
0011 -> 10011
0100 -> 11101
0101 -> 10101
0110 -> 10110
0111 -> 10111
1000 -> 11010
1001 -> 01001
1010 -> 01010
1011 -> 01011
1100 -> 11110
1101 -> 01101
1110 -> 01110
1111 -> 01111
```



比如传输下面的数据

```
1011 0010 -> 01011 10010
```

![image-20230411112019756](https://img.elmagnifico.tech/static/upload/elmagnifico/202304111120811.png)

就变成了图中所示情况



这种编码方式，如果要进行检测，那么只需要在每个沿时间进行检测即可，比如下图中的绿色箭头所在即是`沿`检测

![image-20230411114300590](https://img.elmagnifico.tech/static/upload/elmagnifico/202304111143652.png)

红点是每一段的分割点，这个`沿`不进行检测。可以看到`沿`刚好是编码中隐藏的原始数据，电平发生翻转表示1，电平不动表示0

有了这里的想法，用GPIO的跳变检测就更加简单了



## 其他相关问题

如果ESC种设置了，`Auto Telemetry`，那么如果不使用Dshot协议，这个Telemetry也会自动返回相关信息，所以对其他协议更友好了。

![image-20230407182415582](https://img.elmagnifico.tech/static/upload/elmagnifico/202304071829272.png)

> https://github.com/iNavFlight/inav/issues/5165



单线Dshot 由于检测时间比较少，Dshot 600 出现了大量报错，导致Betaflight直接不再支持Dshot 600

> https://github.com/bitdump/BLHeli/issues/464
>
> https://github.com/betaflight/betaflight/issues/9886#issuecomment-655085419



## 实测图像

网上想找个DSHOT各种图像还是挺困难的，要么看不清，要么也没说明具体数值是多少，看的一脸懵逼，我给出一些实例，方便参考对比

- 注意需要连续给Bidirectional DSHOT帧，并且让出传输线，ESC开始阶段是不能回复Telemetry的，需要正确输出一段时间电调解锁以后才能得到回复，电调音乐会阻止Telemetry的输出，所以实际输出是电调解锁音乐之后，刚开始只用一次帧来触发回复怎么都得不到，后来连续给就正常了。



#### DSHOT 300

![image-20230417184900614](https://img.elmagnifico.tech/static/upload/elmagnifico/202304171849696.png)

这是正常的DSHOT 300，没有反转校验位、没有请求Telemetry的`48`油门输出



#### Bidirectional DSHOT 300

![image-20230418190834806](https://img.elmagnifico.tech/static/upload/elmagnifico/202304181908889.png)

这是反转后、没有请求Telemetry的图像，油门值还是`48`



#### Bidirectional DSHOT 300 with Telemetry

![image-20230419145052982](https://img.elmagnifico.tech/static/upload/elmagnifico/202304191450067.png)

这是反转后并且请求Telemetry的，并且ESC回复了Telemetry，油门值还是`48`



#### 解析Telemetry图像



![image-20230419164812468](https://img.elmagnifico.tech/static/upload/elmagnifico/202304191648549.png)

发送完Bidirectional DSHOT帧以后，大概就是30us的时间，留给IO切换到输入模式，并等待Telemetry返回

整个Telemetry信号时间大概是47us，实际情况可能话要多一点



![image-20230419170345087](https://img.elmagnifico.tech/static/upload/elmagnifico/202304191704619.png)

第一bit必然是0，表示开始传输，所以跳过，然后根据GCR的编码方式，每次电平跳变就是数据1，否则是数据0。

此时是在0速度的情况下，获取的Telemetry，所以最后解码得到的数值是`1111 1111 1111 0000` 后4位都是0，校验结果是`F`符合要求。

换算以后是`0x0FFF`，在转换成转速的时候，这个特殊值，直接转换成了`0`，符合当前的实际情况



## ~~新驱动设计~~

bit bang是通过三倍采样，来读取下面的每一个电变化的（红圈部分）

![image-20230418192723771](https://img.elmagnifico.tech/static/upload/elmagnifico/202304181927844.png)



~~但是其实我可以通过绿色箭头标明的沿来判断，当前数值，直接就能读取到原始bit中的所有1，其余位就自动是0了。~~

~~黄色箭头虽然也是沿，但是由于是4bit的分割点，所以不纳入计算。~~

~~这样的话，完全不需要3倍的采样timer，不会受到DSHOT频率的影响，无论多快的频率都能处理。~~

~~**核心想法：**~~

~~通过GPIO的上升沿、下降沿中断，记录所有1，并记录1产生的时间，通过5bits时间，可以排除掉黄色的下降沿或者上升沿，只需要一个100ns定时器即可。~~

~~如果定时器超时了，那么就认为本次失败了，直接关闭中断，切换回输出模式。只需要将每个1之间的时间除以固定的区间，就能得到1的位置了。~~

这个想法有点问题，IO中断非常频繁，会影响到其他地方，所以还是DMA来干这个事情更好点



## Summary

到这里差不多整个Bidirectional DSHOT基本就解析完了，日后如果要移植双向DSHOT，可以参考



有了Bidirectional DSHOT的基础协议，由于飞控方面的应用对于电机的控制必然是同时的，而非分时的，所以使用一个高性能TIM，3倍于DSHOT的频率进行采样，并将数据存储到DMA buffer之中，之后再对buffer滤波采样后，拿到实际的GCR编码，将其转换成真实的Telemetry，解析出转速即可。



## Quote

> https://github.com/betaflight/betaflight/pull/8554
>
> https://zhuanlan.zhihu.com/p/520878086
>
> https://en.wikipedia.org/wiki/Run-length_limited#GCR:_(0,2)_RLL
>
> https://github.com/iNavFlight/inav/issues/2710
>
> https://github.com/iNavFlight/inav/issues/5165
>
> https://github.com/iNavFlight/inav/pull/5674
>
> https://youtu.be/sPktdBh2Gcw
>
> https://github.com/mathiasvr/bluejay/issues/1
>
> https://github.com/bitdump/BLHeli/issues/513
>
> https://betaflight.com/docs/wiki/archive/DSHOT-ESC-Protocol
>
> https://betaflight.com/docs/development/Dshot
>
> https://betaflight.com/docs/tuning/4.2-Tuning-Notes#dshot-settings
>
> https://github.com/bitdump/BLHeli/issues/685
>
> https://brushlesswhoop.com/dshot-and-bidirectional-dshot/

