---
layout:     post
title:      "Vsprintf与Vsnprintf造成的栈越界"
subtitle:   "StackOverflow"
date:       2025-08-25
update:     2025-08-25
author:     "elmagnifico"
header-img: "img/x4.jpg"
catalog:    true
tobecontinued: false
tags:
    - C
---

## Foreword

一个陈年老问题，总算找到根源，由此也发现了很多之前不曾注意的一些细节，这些地方都有可能造成栈越界

之前有发现栈越界，但是实际追查起来还是比较困难的，特别是想知道从哪一刻哪个位置开始栈越界，就更难查了

> https://elmagnifico.tech/2025/04/10/StackOverflow/



## vsprintf

#### vsprintf

vsprintf就是一个根据列表参数进行格式化的函数，转成我们熟悉的printf里输出的内容

```c
int vsprintf(char *str, const char *format, va_list arg)
```



一般都是这样组合在一起

```c
    va_list ap;
    va_start(ap, fmt);
    vsprintf(str, fmt, ap);
    va_end(ap);
```



vsprintf有两个大问题，第一个它本身内存不安全，如果你转换内容过多，而承载的str指针不够的化，那么就会溢出，踩栈。

同时，vsprintf的实现对于栈的消耗非常大，与格式化的内容有关系，浮动可能很大



#### vsnprintf

vsnprintf，是限制了str转换后的字节大小，如果内容过多，就截断了，而不会越界，相对安全一些。



类似的vsprintf_s，也是限制了这个缓冲区大小，和vsnprintf差不多



#### 嵌入式vsprintf

以uboot中的vsprintf为例，标准库的vsprintf本身是支持很多特性的，但是实际我们输出的时候其实并不会用一些花里胡哨的输出方式，所以嵌入式里的vsprintf都会重写vsprintf，尽可能精简其内容，去掉了不常用的特性

```c
int vsprintf(char *buf, const char *fmt, va_list args)
{
	int len;
#ifdef CFG_64BIT_VSPRINTF
	unsigned long long num;
#else
	unsigned long num;
#endif
	int i, base;
	char * str;
	const char *s;

	int flags;		/* flags to number() */

	int field_width;	/* width of output field */
	int precision;		/* min. # of digits for integers; max
				   number of chars for from string */
	int qualifier;		/* 'h', 'l', or 'q' for integer fields */

	for (str=buf ; *fmt ; ++fmt) {
		if (*fmt != '%') {
			*str++ = *fmt;
			continue;
		}

		/* process flags */
		flags = 0;
		repeat:
			++fmt;		/* this also skips first '%' */
			switch (*fmt) {
				case '-': flags |= LEFT; goto repeat;
				case '+': flags |= PLUS; goto repeat;
				case ' ': flags |= SPACE; goto repeat;
				case '#': flags |= SPECIAL; goto repeat;
				case '0': flags |= ZEROPAD; goto repeat;
				}

		/* get field width */
		field_width = -1;
		if (is_digit(*fmt))
			field_width = skip_atoi(&fmt);
		else if (*fmt == '*') {
			++fmt;
			/* it's the next argument */
			field_width = va_arg(args, int);
			if (field_width < 0) {
				field_width = -field_width;
				flags |= LEFT;
			}
		}

		/* get the precision */
		precision = -1;
		if (*fmt == '.') {
			++fmt;
			if (is_digit(*fmt))
				precision = skip_atoi(&fmt);
			else if (*fmt == '*') {
				++fmt;
				/* it's the next argument */
				precision = va_arg(args, int);
			}
			if (precision < 0)
				precision = 0;
		}

		/* get the conversion qualifier */
		qualifier = -1;
		if (*fmt == 'h' || *fmt == 'l' || *fmt == 'q') {
			qualifier = *fmt;
			++fmt;
		}

		/* default base */
		base = 10;

		switch (*fmt) {
		case 'c':
			if (!(flags & LEFT))
				while (--field_width > 0)
					*str++ = ' ';
			*str++ = (unsigned char) va_arg(args, int);
			while (--field_width > 0)
				*str++ = ' ';
			continue;

		case 's':
			s = va_arg(args, char *);
			if (!s)
				s = "<NULL>";

			len = strnlen(s, precision);

			if (!(flags & LEFT))
				while (len < field_width--)
					*str++ = ' ';
			for (i = 0; i < len; ++i)
				*str++ = *s++;
			while (len < field_width--)
				*str++ = ' ';
			continue;

		case 'p':
			if (field_width == -1) {
				field_width = 2*sizeof(void *);
				flags |= ZEROPAD;
			}
			str = number(str,
				(unsigned long) va_arg(args, void *), 16,
				field_width, precision, flags);
			continue;


		case 'n':
			if (qualifier == 'l') {
				long * ip = va_arg(args, long *);
				*ip = (str - buf);
			} else {
				int * ip = va_arg(args, int *);
				*ip = (str - buf);
			}
			continue;

		case '%':
			*str++ = '%';
			continue;

		/* integer number formats - set up the flags and "break" */
		case 'o':
			base = 8;
			break;

		case 'X':
			flags |= LARGE;
		case 'x':
			base = 16;
			break;

		case 'd':
		case 'i':
			flags |= SIGN;
		case 'u':
			break;

		default:
			*str++ = '%';
			if (*fmt)
				*str++ = *fmt;
			else
				--fmt;
			continue;
		}
#ifdef CFG_64BIT_VSPRINTF
		if (qualifier == 'q')  /* "quad" for 64 bit variables */
			num = va_arg(args, unsigned long long);
		else
#endif
		if (qualifier == 'l')
			num = va_arg(args, unsigned long);
		else if (qualifier == 'h') {
			num = (unsigned short) va_arg(args, int);
			if (flags & SIGN)
				num = (short) num;
		} else if (flags & SIGN)
			num = va_arg(args, int);
		else
			num = va_arg(args, unsigned int);
		str = number(str, num, base, field_width, precision, flags);
	}
	*str = '\0';
	return str-buf;
}
```



类似的memcpy等一些标准库函数，都有可能有额外的栈空间消耗，而在内存紧张的嵌入式环境里，这部分可能都需要重写，防止栈越界或者溢出错误导致更严重的后果



## Summary

vsprintf就有点windows里的记事本的意思，看似简单的、不起眼的一个小函数，实际后面的细节非常丰富，业务很复杂。



对于嵌入式栈是否溢出的评估，有时候只看表面的一些局部变量可能看不出来，特别是一些库函数，他的层次可能很深，不能单步进去。

这个时候就要借助操作系统或者外部工具，又或者是直接追栈顶指针，来看是否会出现栈溢出。

一般正常情况下就是上面的判断标准，但是这个栈的评估还需要结合异常情况，结合代码各种可能分支的覆盖情况来看，有可能在异常分支中存在栈过度使用，调用过深，导致实际栈溢出的情况，不做覆盖性测试是无法发现这个问题的



## Quote

> https://www.runoob.com/cprogramming/c-function-vsprintf.html
