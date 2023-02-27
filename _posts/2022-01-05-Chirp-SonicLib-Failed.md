---
layout:     post
title:      "Chirp CH201超声波测距从入门到放弃"
subtitle:   "SonicLib,tof"
date:       2022-01-05
update:     2022-01-05
author:     "elmagnifico"
header-img: "img/sensor-head-bg.jpg"
catalog:    true
tags:
    - Embedded
    - Sensor
---

## Foreword

这个是之前调试的 CH201 Long-Range Ultrasonic Time-of-Flight Range Sensor 的记录，最后放弃了。

CH201的好处是他是声波，而其他tof多数都是利用红外的，平常在户外和强光下容易有问题，并且由于他是超声波，所以测量的距离也比一般的红外tof长一些。

其驱动也不能说特别复杂，只是相对其他的驱动来说东西繁杂，而技术支持则是两句话就不理我了，╮(╯▽╰)╭。

其产品页上标注的5M最大距离，实际只有4.4左右，而且还取分了长距离和短距离测量的不同场景，会对精度有影响，只能说没有表面上看起来那么好。



## 名词

- TOF，Time of flight，简单说就是利用光或者声波或者其他类似的波在固定介质中飞行所消耗的时间来计算距离的一种方法。

- SonicLib，主要用来超声波测量的库



## SonicLib

官方有给出来 SmartSonic_HelloChirp_Example_v1_31_0 的驱动例程

- source/application/smartsonic-hellochirp-example
  - main.c中是给出来的例子，调用api进行驱动的初始化、配置、管理等
  - app_config.h 中是一些配置选项和版本选择
- source/drivers/chirpmicro，主要是SonicLib的API和驱动文件，原文中说还有chirpmicro/html的文件，实际上已经没有了
  - inc/chirp_bsp.h，这个文件中主要就是bsp这里要实现的接口，一种三种：REQUIRED，RECOMMENDED，OPTIONAL，具体根据需求是否用到来看是否要实现
- source/board，这里主要就是板子的驱动文件了，需要实现的接口bsp也就在这里
  - board/HAL/src/chbsp_chirp_samg55.c，对应chirp_basp.h中定义的接口实现，都是在这个文件中
  - board/config/chirp_board_config.h，主要是可用I2C引脚的定义



#### 固件

Chirp的超声波需要刷固件，不同固件能提供的性能有所不同。

由于固件不同，所以对应的初始化也不同了，通过app_config.h中的宏定义来选择使用的固件初始化

在app_config.h 文中，有关于传感器实际使用的是什么固件的定义

```c
	/* CH101 GPR - general purpose rangefinding, standard range */
#define	 CHIRP_SENSOR_FW_INIT_FUNC	ch101_gpr_init

	/* CH101 GPR NARROW - general purpose rangefinding, narrow FoV */
// #define	 CHIRP_SENSOR_FW_INIT_FUNC	ch101_gpr_narrow_init
	
	/* CH101 GPR SR - general purpose rangefinding, short range */
// #define	 CHIRP_SENSOR_FW_INIT_FUNC	ch101_gpr_sr_init
 
	/* CH101 GPR SR NARROW - general purpose rangefinding, short range, narrow FoV */ 
//  #define	 CHIRP_SENSOR_FW_INIT_FUNC	ch101_gpr_sr_narrow_init

	/* CH201 GPRMT - general purpose rangefinding / multi threshold */
// #define	 CHIRP_SENSOR_FW_INIT_FUNC	ch201_gprmt_init	
```

对应的每个固件有一个对应的文件的定义，比如ch101_gpr_init对应的就是ch101_gpr.c，里面是对应的固件初始化的内容

在main函数里有ch_init，在ch_init中就会调用这个实际的。

```c
	for (dev_num = 0; dev_num < num_ports; dev_num++) {
		ch_dev_t *dev_ptr = &(chirp_devices[dev_num]);	// init struct in array

		/* Init device descriptor 
		 *   Note that this assumes all sensors will use the same sensor 
		 *   firmware.  The CHIRP_SENSOR_FW_INIT_FUNC symbol is defined in 
		 *   app_config.h and is used for all devices.
		 *
		 *   However, it is possible for different sensors to use different 
		 *   firmware images, by specifying different firmware init routines 
		 *   when ch_init() is called for each.
		 */
		chirp_error |= ch_init(dev_ptr, grp_ptr, dev_num, 
							   CHIRP_SENSOR_FW_INIT_FUNC);
	}
```

不同的固件使用的场景不同，比如近距离测量，在近距离的时候精度是普通的4倍，而远距离精度只有原来的1/4了。



具体的固件可以通过实际的初始化函数中的ch101_gpr_fw.c文件看到。

```c
uint8_t ch101_gpr_init(ch_dev_t *dev_ptr, ch_group_t *grp_ptr, uint8_t i2c_addr, uint8_t io_index, uint8_t i2c_bus_index) {
	
	dev_ptr->part_number = CH101_PART_NUMBER;
	dev_ptr->app_i2c_address = i2c_addr;
	dev_ptr->io_index = io_index;
	dev_ptr->i2c_bus_index = i2c_bus_index;

	dev_ptr->freqCounterCycles = CH101_COMMON_FREQCOUNTERCYCLES;
	dev_ptr->freqLockValue     = CH101_COMMON_READY_FREQ_LOCKED;

	/* Init firmware-specific function pointers */
	dev_ptr->firmware 					= ch101_gpr_fw;
```

这个固件大概有2k左右的大小。



#### 配置

同样在app_config.h 文中，有关于传感器使用的工作模式的设定

```c
#define CHIRP_FIRST_SENSOR_MODE		CH_MODE_TRIGGERED_TX_RX
#define CHIRP_OTHER_SENSOR_MODE		CH_MODE_TRIGGERED_RX_ONLY

//! Sensor operating modes.
typedef enum {
	CH_MODE_IDLE 	  			= 0x00,		/*!< Idle mode - low-power sleep, no sensing is enabled. */
	CH_MODE_FREERUN   			= 0x02,		/*!< Free-running mode - sensor uses internal clock to wake 
											     and measure. */
	CH_MODE_TRIGGERED_TX_RX 	= 0x10,		/*!< Triggered transmit/receive mode - transmits and receives 
											     when INT line triggered.*/
	CH_MODE_TRIGGERED_RX_ONLY   = 0x20		/*!< Triggered receive-only mode - for pitch-catch operation 
											     with another sensor. */
} ch_mode_t;
```

第一个传感器必须是CH_MODE_TRIGGERED_TX_RX或者是CH_MODE_FREERUN



传感器的测量距离可以调整，不过这个距离也与所使用的固件和硬件有关系，如果这个设置距离超过了传感器本身的量程，那么会设置成传感器的量程。

```c
#define	CHIRP_SENSOR_MAX_RANGE_MM		(750)	/* maximum range, in mm */
#define	CHIRP_SENSOR_STATIC_RANGE		(0)	/* static target rejection sample 
											   range, in samples (0=disabled) */
#define	MEASUREMENT_INTERVAL_MS (100)
```

MEASUREMENT_INTERVAL_MS可以设置测量的频率。



#### 机制

由于要刷固件，而固件本身有2048字节，有的硬件平台的I2C可能不支持传输这么多的字节，所以需要分包。分包使用了一个宏，来设置每次传输的最大值

```
MAX_PROG_XFER_SIZE
```

刷固件的时候，器件地址是 `CH_I2C_ADDR_PROG (0x45)` ，只有当PROG引脚是高的时候才会有反应。当刷完以后，对应的I2C地址就变了。

可以通过都这来确定是否有一个超声波在初始化前连接着，直接读00地址的内容，然后正常的情况下会回复`CH_SIG_BYTE_0(0x0A) CH_SIG_BYTE_1(0x02)`



#### BSP实现接口

```c
这个就不用说了，必须要实现，主要是I2C的接口和PROG的引脚的调用
void chbsp_board_init(ch_group_t *grp_ptr);

这个主要是调试用的，基本可以忽略
void chbsp_debug_toggle(uint8_t dbg_pin_num);
void chbsp_debug_on(uint8_t dbg_pin_num);
void chbsp_debug_off(uint8_t dbg_pin_num);
同理这个是debug的，用来显示的
void chbsp_print_str(char *str);

重启的pin，都需要实现
void chbsp_reset_assert(void);
void chbsp_reset_release(void);

刷固件的pin，需要实现
void chbsp_program_enable(ch_dev_t *dev_ptr);
void chbsp_program_disable(ch_dev_t *dev_ptr);

将所有中断引脚设置为输出模式，需要实现
void chbsp_group_set_io_dir_out(ch_group_t *grp_ptr);

将某个传感器的中断引脚设置为输出模式，推荐
void chbsp_set_io_dir_out(ch_dev_t *dev_ptr);

将所有中断引脚设置为输入模式，需要实现
void chbsp_group_set_io_dir_in(ch_group_t *grp_ptr);

将某个传感器的中断引脚设置为输入模式，推荐
void chbsp_set_io_dir_in(ch_dev_t *dev_ptr);

所有引脚的初始化，同时所有RESET和GROG引脚设置位输出模式，INT引脚设置为输入模式，必须
void chbsp_group_pin_init(ch_group_t *grp_ptr);

将所有或者某个INT引脚拉低或者拉高，必须
void chbsp_group_io_clear(ch_group_t *grp_ptr);
void chbsp_io_clear(ch_dev_t *dev_ptr);
void chbsp_group_io_set(ch_group_t *grp_ptr);
void chbsp_io_set(ch_dev_t *dev_ptr);

所有或者某个INT引脚的中断使能或者失能，对应板子的IO中断使能
void chbsp_group_io_interrupt_enable(ch_group_t *grp_ptr);
void chbsp_io_interrupt_enable(ch_dev_t *dev_ptr);
void chbsp_group_io_interrupt_disable(ch_group_t *grp_ptr);
void chbsp_io_interrupt_disable(ch_dev_t *dev_ptr);

INT引脚的中断触发后的回调
void chbsp_io_callback_set(ch_io_int_callback_t callback_func_ptr);

延时函数，必须的
void chbsp_delay_us(uint32_t us);
这个ms延时比较重要，他要求精度高，否则会影响到实际测量的距离
void chbsp_delay_ms(uint32_t ms);

这个是debug用来显示各个函数执行时间的，实际可能不需要
uint32_t chbsp_timestamp_ms(void);

硬件i2c总线的初始化，必须
int chbsp_i2c_init(void);

反初始化，可要可不要
int chbsp_i2c_deinit(void);

这个是用来返回一些i2c的额外信息的，必须
uint8_t chbsp_i2c_get_info(ch_group_t *grp_ptr, uint8_t dev_num, ch_i2c_info_t *info_ptr);

i2c的写操作，要支持写多字节，这种是master模式的有stop的多次写
int chbsp_i2c_write(ch_dev_t *dev_ptr, uint8_t *data, uint16_t num_bytes);

i2c的写操作，支持多字节，这种就是无stop的连续写模式
int chbsp_i2c_mem_write(ch_dev_t *dev_ptr, uint16_t mem_addr, uint8_t *data, uint16_t num_bytes);

i2c的非阻塞式写，这种方式是可选的
int chbsp_i2c_write_nb(ch_dev_t *dev_ptr, uint8_t *data, uint16_t num_bytes);
int chbsp_i2c_mem_write_nb(ch_dev_t *dev_ptr, uint16_t mem_addr, uint8_t *data, uint16_t num_bytes);

i2c的读模式，类似写，必须
int chbsp_i2c_read(ch_dev_t *dev_ptr, uint8_t *data, uint16_t num_bytes);
int chbsp_i2c_mem_read(ch_dev_t *dev_ptr, uint16_t mem_addr, uint8_t *data, uint16_t num_bytes);

同理非阻塞读，可选
int chbsp_i2c_read_nb(ch_dev_t *dev_ptr, uint8_t *data, uint16_t num_bytes);
int chbsp_i2c_mem_read_nb(ch_dev_t *dev_ptr, uint16_t mem_addr, uint8_t *data, uint16_t num_bytes);

非阻塞式读写i2c的中断处理函数，
void chbsp_external_i2c_irq_handler(chdrv_i2c_transaction_t *trans);

reset i2c，直接用重新初始化i2即可
void chbsp_i2c_reset(ch_dev_t *dev_ptr);

这个虽然是推荐，但是应该是可选的，就是个timer初始化，同时要能回调的，但是正常计算不用的
uint8_t chbsp_periodic_timer_init(uint16_t interval_ms, ch_timer_callback_t callback_func_ptr);
void chbsp_periodic_timer_irq_enable(void);
void chbsp_periodic_timer_irq_disable(void);
uint8_t chbsp_periodic_timer_start(void);
uint8_t chbsp_periodic_timer_stop(void);
void chbsp_periodic_timer_handler(void);
void chbsp_periodic_timer_change_period(uint32_t new_period_us);

这个是用来做休眠的，其实就是上面的timer，所以也是可选项
void chbsp_proc_sleep(void);

这个就是指示哪个LED亮，表示哪个传感器工作而已，实际是可选项
void chbsp_led_on(uint8_t dev_num);
void chbsp_led_off(uint8_t dev_num);
void chbsp_led_toggle(uint8_t dev_num);
```

对应这个bsp的实现就是chbsp_chirp_samg55.c 



#### 结果输出

主要结果是通过这里输出的，看一下具体是怎么处理数据的

```c
static uint8_t handle_data_ready(ch_group_t *grp_ptr) {
	uint8_t 	dev_num;
	int 		num_samples = 0;
	uint8_t 	ret_val = 0;

	/* Read and display data from each connected sensor 
	 *   This loop will write the sensor data to this application's "chirp_data"
	 *   array.  Each sensor has a separate chirp_data_t structure in that 
	 *   array, so the device number is used as an index.
	 */
	拿到对应的设备struct
	for (dev_num = 0; dev_num < ch_get_num_ports(grp_ptr); dev_num++) {
		ch_dev_t *dev_ptr = ch_get_dev_ptr(grp_ptr, dev_num);
		判定设备是否连接
		if (ch_sensor_is_connected(dev_ptr)) {

			/* Get measurement results from each connected sensor 
			 *   For sensor in transmit/receive mode, report one-way echo 
			 *   distance,  For sensor(s) in receive-only mode, report direct 
			 *   one-way distance from transmitting sensor 
			 */
			根据模式不同，获取到的距离也不同，direct的距离是直接拿到的，oneway是/2以后的
			if (ch_get_mode(dev_ptr) == CH_MODE_TRIGGERED_RX_ONLY) {
				chirp_data[dev_num].range = ch_get_range(dev_ptr, 
														CH_RANGE_DIRECT);
			} else {
				chirp_data[dev_num].range = ch_get_range(dev_ptr, 
														CH_RANGE_ECHO_ONE_WAY);
			}
            这种就是没有目标，相当于无限远
			if (chirp_data[dev_num].range == CH_NO_TARGET) {
				/* No target object was detected - no range value */

				chirp_data[dev_num].amplitude = 0;  /* no updated amplitude */

				printf("Port %d:          no target found        ", dev_num);

			} else {
				/* Target object was successfully detected (range available) */

				 /* Get the new amplitude value - it's only updated if range 
				  * was successfully measured.  */
                这里就是有效距离，获取振幅
				chirp_data[dev_num].amplitude = ch_get_amplitude(dev_ptr);
				这里除了32，估计是单位换算了
				printf("Port %d:  Range: %0.1f mm  Amp: %u  ", dev_num, 
						(float) chirp_data[dev_num].range/32.0f,
					   	chirp_data[dev_num].amplitude);
			}

			/* Store number of active samples in this measurement */
			num_samples = ch_get_num_samples(dev_ptr);
			chirp_data[dev_num].num_samples = num_samples;

			/* Optionally read amplitude values for all samples */
#ifdef READ_AMPLITUDE_DATA
			uint16_t 	start_sample = 0;
			ch_get_amplitude_data(dev_ptr, chirp_data[dev_num].amp_data, 
								  start_sample, num_samples, CH_IO_MODE_BLOCK);

#ifdef OUTPUT_AMPLITUDE_DATA
			printf("\n");
			for (uint8_t count = 0; count < num_samples; count++) {

				printf("%d\n",  chirp_data[dev_num].amp_data[count]);
			}
#endif
#endif

			/* Optionally read raw I/Q values for all samples */
#ifdef READ_IQ_DATA
			display_iq_data(dev_ptr);
#endif
			/* If more than 2 sensors, put each on its own line */
			if (num_connected_sensors > 2) {
				printf("\n");
			}
		}
	}
	printf("\n");
	
	return ret_val;
}
```



## 移植

移植主要就是重新实现一下BSP就行了，然后把整个驱动加进去，一些用不到的驱动或者固件可以删一下。

从官方文档里看，数据还是挺好的

![](https://img.elmagnifico.tech/static/upload/elmagnifico/Ttu8RWyzLE6wdKM.png)

然而我这边一开始就出现问题，官方的BSP里仔细看他的I2C的Mem模式和Master模式，基本是混用的。我被这个卡了老半天，一直传感器的频率不正常，好不容易调好了，通信正常了。可是数据又死活不对。

写驱动的留下了邮箱，说是想问就问，然后我发了八封邮件，就回了我两次，然后就永远不回了。

反复验证了很多次，确定通信没问题，但是传感器回的数据就是非常离谱，忽大忽小的那种，说有反应却又有点奇怪。

想找找其他人使用的例子，然后发现根本没人用，我直接凉凉。



## 遮罩

![](https://img.elmagnifico.tech/static/upload/elmagnifico/x8LcQVXPHhR9afI.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/JpP1RgSohBn9s58.png)

由于是超声波，所以为了能收到回波，直接使用裸片肯定效果不行，所以他要加遮罩。首先是选择有扩散的遮罩，提升接收的强度和角度，同时还要附加一层金属网最好，可以有效防止尘土等小颗粒对于效果的影响。

但是这个遮罩同时也会扩大干扰，如果有多个超声波传感器使用，那么必然会造成接收到对方的声波，而且这个角度还不小

![](https://img.elmagnifico.tech/static/upload/elmagnifico/HAfSeNlCWjzwiuF.png)

同时官方还要求最好将其安装在一个较大的平面上，反射面也比较大，才能达到比较好的测距效果。



## Summary

反正这玩意我感觉是坑，别踩了，除非技术支持特别给力。或者先买个他们的Example的板子试试看效果，我们就是没买直接上了，然后发现不行，又换了器件，最后换成了 VL53L1X ，虽然也不满意，但是凑活吧



## Quote

> AN-000154-SmartSonic-HelloChirp-Hands-on-v1.2
