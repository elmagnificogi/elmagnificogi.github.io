---
layout:     post
title:      "APM中的Schedule Starved"
subtitle:   "嵌入式，驱动，Timeout"
date:       2017-03-15
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
    - APM
---

## 相关代码

```cpp
void Copter::loop()
{
	// wait for an INS sample
	while (ins_sample_time + 2500 > micros())
	{
		if ((ins_sample_time + 2500) - micros() > 1500)
			delay(1);
		else if ((ins_sample_time + 2500) - micros() > 200)
			delay_microseconds(200);
		else if ((ins_sample_time + 2500) - micros() > 20)
			delay_microseconds(20);
		else
			delay_microseconds(1);
	}
	uint32_t timer = micros();
	ins_sample_time = timer;

	// check loop time
	perf_info_check_loop_time(timer - fast_loopTimer);

	// used by PI Loops
	G_Dt = (float)(timer - fast_loopTimer) / 1000000.0f;
	fast_loopTimer = timer;

	// for mainloop failure monitoring
	mainLoop_count++;

	// Execute the fast loop
	// ---------------------
	fast_loop();

	// tell the scheduler one tick has passed
	scheduler.tick();

	// run all the tasks that are due to run. Note that we only
	// have to call this once per loop, as the tasks are scheduled
	// in multiples of the main loop tick. So if they don't run on
	// the first call to the scheduler they won't run on a later
	// call until scheduler.tick() is called again
	uint32_t time_available = (timer + MAIN_LOOP_MICROS) - micros();
	scheduler.run(time_available);
}

void AP_Scheduler::run(uint16_t time_available)
{
	uint32_t run_started_usec = hal.scheduler->micros();
	uint32_t now = run_started_usec;

	for (uint8_t i = 0; i<_num_tasks; i++) {
		uint16_t dt = _tick_counter - _last_run[i];
		uint16_t interval_ticks = pgm_read_word(&_tasks[i].interval_ticks);
		if (dt >= interval_ticks) {
			// this task is due to run. Do we have enough time to run it?
			_task_time_allowed = pgm_read_word(&_tasks[i].max_time_micros);

			if (dt >= interval_ticks * 2) {
				// we've slipped a whole run of this task!
				if (_debug > 1) {
					hal.console->printf_P(PSTR("Scheduler slip task[%u] (%u/%u/%u)\n"),
						(unsigned)i,
						(unsigned)dt,
						(unsigned)interval_ticks,
						(unsigned)_task_time_allowed);
				}
			}

			if (_task_time_allowed <= time_available) {
				// run it
				_task_time_started = now;
				task_fn_t func;
				pgm_read_block(&_tasks[i].function, &func, sizeof(func));
				current_task = i;
				func();
				current_task = -1;

				// record the tick counter when we ran. This drives
				// when we next run the event
				_last_run[i] = _tick_counter;

				// work out how long the event actually took
				now = hal.scheduler->micros();
				uint32_t time_taken = now - _task_time_started;
				//
				g_timetaken[i] = time_taken;
				//
				if (time_taken > _task_time_allowed) {
					// the event overran!
					if (_debug > 2) {
						hal.console->printf_P(PSTR("Scheduler overrun task[%u] (%u/%u)\n"),
							(unsigned)i,
							(unsigned)time_taken,
							(unsigned)_task_time_allowed);
					}
				}
				if (time_taken >= time_available) {
					goto update_spare_ticks;
				}
				time_available -= time_taken;
			}
		}
	}
	// update number of spare microseconds
	_spare_micros += time_available;

update_spare_ticks:
	_spare_ticks++;
	if (_spare_ticks == 32) {
		_spare_ticks /= 2;
		_spare_micros /= 2;
	}
}
```
## 分析

APM中的loop()也是main函数中的主循环函数了。

其中fast_loop()是快速循环，用来做快速积分，解算姿态使用。许多关键的任务都是由这里完成。

他是核心中的核心，通过一系列操作保证其是400Hz运行。

当这个快速循环完成之后，就激活了schedule，调度系统，然后根据调度任务表，开始执行调度任务。

从调度系统的循环来看：

```cpp
for (uint8_t i = 0; i<_num_tasks; i++) {
	uint16_t dt = _tick_counter - _last_run[i];
	uint16_t interval_ticks = pgm_read_word(&_tasks[i].interval_ticks);
```

很明显，这是一个轮询式的调度系统，每次都从第一个任务开始，一直到最后一个任务。

下面是任务列表

	static const AP_Scheduler::Task scheduler_tasks[] PROGMEM = {
	    { rc_loop,               4,     10 },
	    { throttle_loop,         8,     45 },
	    { update_GPS,            8,     90 },
	    { update_notify,         8,     10 },

很明显，任务表中的第一个任务即是优先级最高的任务，只要时间够的情况下必然优先执行。

而越往后的任务就越有可能不被执行。

如果被执行的任务发生异常，造成超时，那么其结果必然是后面的任务无法执行。

如果这个超时成为了固定超时，那么必然有任务永远无法执行。

那么在这种情况下，这个任务就被饿死了。

虽然平常遇不到这种问题，但是这是一种潜在的风险，而且如果任务过多了，总会有可能某个任务不被执行。

## 解决方案

如果要大改，则是把整个调度机制都需要改一下，改成更合理的带优先级和超时防饿死的调度算法。

如果只是小改能用，防止饥饿，那么在调度开始之前如下即可：

1. 遍历一遍上次任务执行时间到现在的差值，检测是否有超时任务，有的话优先执行，更新其上次执行时间
2. 继续以往的遍历。

这样的好处是不会饿死某一个程序，但是也有其缺陷，如果有超时任务产生，为了保证不饿死，那么只好把其他人的饭分给了要饿死的人一点，这样的结果自然是各个任务都有可能达不到预期的频率，对于有频率要求的任务来说就会出现问题.

实际中，如果碰到了饿死超时，其实还需要一个饿死超时的异常处理，因为如果只是单次超时，那还好说，如果是高频率超时，那么说明是有问题的，需要往上层或者是地面站发送异常信息。

## 总结

其实APM里即用了主循环-快速循环，又用了调度系统。

感觉还是有点矛盾的，虽然这里是没有系统的，但是如果有一个优秀的调度系统,其实完全可以完成有频率要的任务和无频率要求的任务，这样就可以不需要弄出来两个循环系统，给人很奇怪的感觉。

## Quote

> http://blog.csdn.net/flyingxty/article/details/48143399
>
> http://blog.csdn.net/guanzhiyuan1994/article/details/51327451
>
> http://blog.csdn.net/bbzz2/article/details/51360341
>
> http://blog.csdn.net/zhangcs_life/article/details/41877091
