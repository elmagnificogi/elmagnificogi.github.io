---
layout:     post
title:      "C++中回调函数"
subtitle:   "c/c++，callback"
date:       2017-03-13
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
catalog:    true
tags:
    - C++
---

## 回调函数的定义

网上一搜，回调函数的定义或者说明真的是一大把，看的我自己都稀里糊涂的，没闹明白到底什么是回调函数。

现在先例举三种回调函数的解释：

1. 对普通函数的调用：调用程序发出对普通函数的调用后，程序执行立即转向被调用函数执行，直到被调用函数执行完毕后，再返回调用程序继续执行。从发出调用的程序的角度看，这个过程为“调用-->等待被调用函数执行完毕-->继续执行”
对回调函数调用：调用程序发出对回调函数的调用后，不等函数执行完毕，立即返回并继续执行。这样，调用程序执和被调用函数同时在执行。当被调函数执行完毕后，被调函数会反过来调用某个事先指定函数，以通知调用程序：函数调用结束。这个过程称为回调（Callback），这正是回调函数名称的由来。

2. 回调函数就是一个通过函数指针调用的函数。如果你把函数的指针（地址）作为参数传递给另一个函数，当这个指针被用来调用其所指向的函数时，我们就说这是回调函数。

3. 回调，就是模块A要通过模块B的某个函数b()完成一定的功能，但是函数b()自己无法实现全部功能，需要反过头来调用模块A中的某个函数a()来完成，这个a()就是回调函数。

其实起初一看到这三种解释就一脸蒙蔽，感觉完全说的不是一回事啊。

然后仔细分析他们描述的，发现他们其实有共性，但是各自针对的方面又不同，造成给人回调函数的定义也不同。

#### 共性

可以发现无论是哪种解释，都说了回调函数是某一个程序a()，将函数指针b()作为参数调用函数c()，而这个函数b()是回调函数。

回掉函数的核心，就是函数指针的使用，将某一个函数的指针作为参数给另一个函数调用。

#### 个性

第一种解释是针对回调这个过程来说的，其实如果只是单一的把函数指针作为参数传递给另外一个函数，然后被调用就称作回调，其实这个不是很不能理解吗？这就能叫callback，就有点扯淡了。应该说回调开始的时候就是应用在某个特定机制中，某一个函数A的函数指针被预先给了调用者B（B不负责实现A，A是由使用者或者说调用B的人来实现的），当某一个特定事件发生以后，那么由另外一方C调用这里的A函数，进行对应的处理。这么说可能还是太模糊了，举一个具体点的例子。

比如：在操作系统下，有一个任务，这个任务执行过程中，可能会发生事件a，发生的事件a需要由对应的B来处理，但是这里的B其实只是一个接口（他不是这任务发起人实现的），他没有具体处理事件a的能力，他只能设置a事件发生以后用某函数处理，而任务中设置了这里某函数就是A了，那么当a事件发生以后，负责对这个事件做响应的可能就是C，那么这时C就会调用A函数，进行a事件处理。

所以回调函数不一定说是你执行到了这里，就一定会执行回调函数，有可能他是需要触发的，要晚一点才能执行。

至于第三种解释中的回调，一定要调用A中的某个函数，这个其实不准确，而且也没说明是怎么回事。还是上面的例子，这里面B函数只是一个接口，这个接口不是调用B函数的人R所写的，那么相当于B是一个外人，而回调函数A却是调用人R写的，另一方C也不是R写的，可能也不是B函数的人写的，B与C都是已经固有的机制或者说是模式，那么R只能按照这个模式来玩，那么这种情况下，对于a事件的处理需要R需要自己去实现，那么他实现的就是A，可是他实现了A以后又不能自己去直接调用A，而是要按照游戏规则让C去调用A，而要让C去调用A的话，必须要符合B的接口，要把你的东西给B，让B去转交给C，等到a事件被触发以后，C自然就可以正常调用A去处理。

到这里就算明白了回调这个过程是怎么回事，可能会说这么做不是多此一举什么的嘛，但那也有前提的，是封装，是接口，是游戏规则，写出了B与C的制订了，这样的游戏规则，那你要调用B就得按照他的规则来，当然你可以说你就不按照他的来，就自己搞，当然也是可以的，但是那样的话你需要自己造轮子，这个难度还真是不一般的大。

## 回调函数的意义

嵌入式中真的有比较多的回调函数，特别是越高级的驱动，其封装的越多，对于回调的应用也越多。

#### 接口函数封装

比如我现在用的STM32F767的库函数，HALLIB，至少在F4xx之前根本没有HAL层这个概念，或者说封装中接口的思想还是比较少用的。

而到了这个版本的库函数，可以很明显的发现，之前需要自己去写的函数，都被封装了起来，有了基本统一的接口，我们自己实际使用的时候也变成在特定的接口里进行，比如：

```c
void uart_init(u32 bound)
{
    //UART 初始化设置
	UART1_Handler.Instance=USART1;					    //USART1
	UART1_Handler.Init.BaudRate=bound;				    //波特率
	UART1_Handler.Init.WordLength=UART_WORDLENGTH_8B;   //字长为8位数据格式
	UART1_Handler.Init.StopBits=UART_STOPBITS_1;	    //一个停止位
	UART1_Handler.Init.Parity=UART_PARITY_NONE;		    //无奇偶校验位
	UART1_Handler.Init.HwFlowCtl=UART_HWCONTROL_NONE;   //无硬件流控
	UART1_Handler.Init.Mode=UART_MODE_TX_RX;		    //收发模式
	HAL_UART_Init(&UART1_Handler);					    //HAL_UART_Init()会使能UART1
}
void HAL_UART_MspInit(UART_HandleTypeDef *huart)
{
    //GPIO端口设置
	GPIO_InitTypeDef GPIO_Initure;
	if(huart->Instance==USART1)//如果是串口1，进行串口1 MSP初始化
	{
		__HAL_RCC_GPIOA_CLK_ENABLE();			//使能GPIOA时钟
		__HAL_RCC_USART1_CLK_ENABLE();			//使能USART1时钟

		GPIO_Initure.Pin=GPIO_PIN_9;			//PA9
		GPIO_Initure.Mode=GPIO_MODE_AF_PP;		//复用推挽输出
		GPIO_Initure.Pull=GPIO_PULLUP;			//上拉
		GPIO_Initure.Speed=GPIO_SPEED_FAST;		//高速
		GPIO_Initure.Alternate=GPIO_AF7_USART1;	//复用为USART1
		HAL_GPIO_Init(GPIOA,&GPIO_Initure);	   	//初始化PA9

		GPIO_Initure.Pin=GPIO_PIN_10;			//PA10
		HAL_GPIO_Init(GPIOA,&GPIO_Initure);	   	//初始化PA10
	}
}
HAL_StatusTypeDef HAL_UART_Init(UART_HandleTypeDef *huart)
{
  /* Check the UART handle allocation */
  if(huart == NULL)
  {
    return HAL_ERROR;
  }

  if(huart->Init.HwFlowCtl != UART_HWCONTROL_NONE)
  {
    /* Check the parameters */
    assert_param(IS_UART_HWFLOW_INSTANCE(huart->Instance));
  }
  else
  {
    /* Check the parameters */
    assert_param(IS_UART_INSTANCE(huart->Instance));
  }

  if(huart->gState == HAL_UART_STATE_RESET)
  {
    /* Allocate lock resource and initialize it */
    huart->Lock = HAL_UNLOCKED;

    /* Init the low level hardware : GPIO, CLOCK */
    HAL_UART_MspInit(huart);
  }

  huart->gState = HAL_UART_STATE_BUSY;

  /* Disable the Peripheral */
  __HAL_UART_DISABLE(huart);

  /* Set the UART Communication parameters */
  if (UART_SetConfig(huart) == HAL_ERROR)
  {
    return HAL_ERROR;
  }

  if (huart->AdvancedInit.AdvFeatureInit != UART_ADVFEATURE_NO_INIT)
  {
    UART_AdvFeatureConfig(huart);
  }

  /* In asynchronous mode, the following bits must be kept cleared:
  - LINEN and CLKEN bits in the USART_CR2 register,
  - SCEN, HDSEL and IREN  bits in the USART_CR3 register.*/
  CLEAR_BIT(huart->Instance->CR2, (USART_CR2_LINEN | USART_CR2_CLKEN));
  CLEAR_BIT(huart->Instance->CR3, (USART_CR3_SCEN | USART_CR3_HDSEL | USART_CR3_IREN));

  /* Enable the Peripheral */
  __HAL_UART_ENABLE(huart);

  /* TEACK and/or REACK to check before moving huart->gState and huart->RxState to Ready */
  return (UART_CheckIdleState(huart));
}
```
以前串口的初始化需要做两件事，第一先初始化串口用的GPIO，然后初始化串口，如果用到了串口中断，接着初始化串口中断设置。

现在呢，虽然过程还是一样，但是都有了对应的接口，不再是自己起名字自己定接口了。比如上面的先对串口对象的结构体进行初始化，在调用初始化函数HAL_UART_Init之后，会先调用HAL_UART_MspInit函数，进行GPIO和时钟的初始化。

串口的中断函数也不是以前那样全部都要自己实现，而是库函数做好了大部分，以前串口是没有缓冲区这个概念的，需要使用串口的人自行处理缓冲区，而现在有了缓冲区，并且库函数都帮你处理好了，只有当缓冲区满的时候会触发串口中断，中断的大部分处理还是库函数帮你做的，而其对应只给出了一个接口函数就是HAL_UART_RxCpltCallback，这个回调函数作为用户处理的接口，一般我们对于中断的处理就写在这里面了。

```c
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
	if(huart->Instance==USART1)//如果是串口1
	{
		if((USART_RX_STA&0x8000)==0)//接收未完成
		{
			if(USART_RX_STA&0x4000)//接收到了0x0d
			{
				if(aRxBuffer[0]!=0x0a)USART_RX_STA=0;//接收错误,重新开始
				else USART_RX_STA|=0x8000;	//接收完成了
			}
			else //还没收到0X0D
			{
				if(aRxBuffer[0]==0x0d)USART_RX_STA|=0x4000;
				else
				{
					USART_RX_BUF[USART_RX_STA&0X3FFF]=aRxBuffer[0] ;
					USART_RX_STA++;
					if(USART_RX_STA>(USART_REC_LEN-1))USART_RX_STA=0;//接收数据错误,重新开始接收	  
				}		 
			}
		}

	}
}
```

上面都是STM32中的回调函数接口，可能还不是很明显，下面的例子更容易理解一些

假设有两种输出设备，同时还有两个程序需要用其输出

```c
void Printer(char a)
{
    使用打印机做输出;
}
void Screen(char b)
{
    使用显示器做输出;
}
void Program1(void)
{
    Printer (“开始输出”);
}
void Program2 (void)
{
    Printer (“开始输出”);
}
```
现在时只用了打印机输出，但是如果有一天需要使用显示器输出了，你是修改program1/2呢，还是再增加几个program3/4，更改调用函数呢？这样都只能维持一时，下次再变怎么办？如果有特别多的设备怎么办？

基于这样的情况，这可能首先想到的是使用#define，但它的局限性是可想而之的，一两个还行，一套程序下来全篇都是#define难于书写和扩展，而且也不professional,而且很重要的一点就是宏不进行编译时的检查，他只是替换，宏多了的情况下，有错误很有可能看不出来。

与#define类似的，C为我们提供了一个更高级的关键字typedef，它可以用来定义我们自己的类型，其实我刚开始学习的时候感觉就是换个名字而已，有什么用呢？刚开始就想着能用这个来做文章的，我感觉很少，但是如果按照下面的这样把一个函数指针重命名了，让函数成为参数，就好像打开了新的大门，刚开始可能还不明白函数做参数有什么意义，继续往下看。

```c
typedef void (*OutputFunc) (char c)
```
这个OutputFunc代表的是void XX (char c)这种形式的一类函数，他是函数指针。

但是只有类型是不够的，就像只有一个int，你依然没法做什么。下面我们要定义一个OutputFunc类型的变量，并且为它赋初值，进而就产生一个函数对象，没错就是函数对象。

```c
OutputFunc Myout = Printer;
```

现在这个变量指向的就是Printer函数了。这样我们就通过OutputFunc这种函数类型统一这一类函数的入口，我们以后再调用
void XX (char c) 这种形式的一类函数，只需要定义一个OutputFunc类型的变量并赋值给它，再调用这个变量就可以了，甚至这个变量还可以被用于参数传递，拥有极大的灵活性。刚才那个示例程序相应的要做一下修改：

```c
void Program1(void)
{
    Myout (“开始输出”);
}
void Program2 (void)
{
    Myout (“开始输出”);
}
```

这样无论有多少地方要改，我们只要把Myout的赋值给改一下，就好了。甚至于它可以被用于参数传递，例如：

```c
OutputFunc Myout = Screen;
void Program3(OutputFunc f)
{
    f (“开始输出”);
}
Program3(Myout);
```

这样的调用简洁明了，极大的降低了耦合性，是程序猿们一直苦苦追求的境界。这就是回调函数的精髓，函数调用与被调用者通过中间变量被分隔开，互不关心。

而这只是初级用法，更高级的用法是写成如下的形式：

```c
typedef  struct
{
    void (*Output) (char c)；
    void (*Parse) (char c)；
    char (*Input) (void);
    void (*Algorithm) (void);
} DeviceFunc;
```
它定义了一个新的结构体类型DeviceFunc，它是一堆函数类型的集合，打包了设备全部的处理功能。那么对应的就可以根据这里的功能来完成对某一个设备的各种情况的处理了。那么这就是一个设备模型了，之后所有用到这个设备模型的，都要按照这里的函数来写。

那么他就成为了设备模型，设备接口，通过这样的方法让调用者之间，调用者和被使用的设备之间都互不关心，从而完成了封装的思想。

那么这就可以了啊，只是利用c语言中的函数指针以及typedef我们就完成了类中的接口封装，以面向过程完成了面向对象的思想。

<img src="http://img.blog.csdn.net/20141201104709218?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbW1oaDMwMDA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center" width="300" height="200" />

## 总结

其实到这里也不能说面向过程的语言不能写面向对象的程序，到底是过程还是对象，终究只是一种思想而已，语言或许有直接或者间接的构造面向对象/过程的能力，但最终还是取决于使用者，使用者想要写出什么，那么语言其实不是障碍不是吗？只是可能会曲折一些？反复一些？但不一定比其他面向对象的语言差不是吗？

其实回调函数就是一种封装，它把功能封闭在一个小圈子里，你只能看到它的两个接口：一个是类型，一个是它所指向的功能，去调用就行了，它会按照所指向的功能函数去执行动作，而用户不用再管具体执行的事。这在大型系统级程序中尤其有用，能够把用户与底层分隔开来，例如程序库的API很多都是这样给出来的，只给出了类和方法名，底层代码是怎么实现的谁都不知道。

## Quote

> http://blog.csdn.net/mmhh3000/article/details/41644257
>
> http://www.cnblogs.com/zhangjing0502/archive/2012/06/19/2555288.html
>
> http://blog.csdn.net/tingsking18/article/details/1509224
>
> http://blog.sina.com.cn/s/blog_9474609d01017cwb.html
>
> https://www.zhihu.com/question/19801131
>
> http://www.cnblogs.com/ioleon13/archive/2010/03/02/1676621.html
>
> http://blog.csdn.net/callmeback/article/details/4242260/
