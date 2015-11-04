---
layout:     post
title:      "Python学习第一章（面向过程）"
subtitle:   "Python,变量，函数，数据结构"
date:       2015-11-03
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
tags:
    - python
    - raspberrypi
    - 学习
    - 面向过程
---

## 代码环境

System：Raspberry Pi 

IDE：IDLE3

需要：语言基础

## 变量、值、类型

### 变量定义

Python中的变量不需要声明，随用随定义

    score=0
	print（score）

命名规则和其他语言一样：不能以数字或关键字为开头

好的习惯是：驼峰命名发，首字母大写

或者是用下划线分割单词，全小写 

### 数据类型

Python会自动帮你确定你输入的常数/幻数是什么类型

主要就是 int float string bool 这四种

    type（3）
	<class 'int'>
	type（3.0）
	<class 'float'>
	type（"3.0"）
	<class 'str'>
	type（3.0>2.3）
	<class 'bool'>
#### bool

这里的bool也是0为假 非0为真
	
	Fasle
	True



#### 强制转换运算符 

比较、加减乘除等运算符都是常见的功能，特殊一点的有：

	int（3.25）->3
	float（3） ->3.0
	str(23)    e->"23"



#### string 

string类型可以用单引号也能用双引号也进行创建,不过依我的习惯依然遵守单字符单引号，多字符双引号

	type（"3.0"）
	<class 'str'>
	type（'3.0'）
	<class 'str'>

Python中的string可以直接当成数组来用,非常的方便

由于Python是高级语言不涉及内存相关问题，注意string的len是不计算结尾的'/n'的要注意，该多长就多长

	"123"[0]="1"
	"123"[0：1]="12"
	len（"123"）=3
	"123"+"456"="123456"

### 数据容器

Python有现成的数据结构体可以直接使用：list、tuples、dictionary 
这些数据结构体有一个好处，基本没有数据类型的区分，也就是说什么类型都能容纳，更符合数据容器之称

#### list

顾名思义，就是列表

	list_1=[1,2,3,4] 
	list_1[1]=99

通过方括号进行定义,可以通过引索进行调用修改

#### tuples

中文名叫元组，实际上就是枚举类型，定义之后不能修改


	tuples_1=(1,2,3,4)
	tuples_1[1]=99


无论是元组还是列表都是可以

通过圆括号进行定义，不可以通过引索进行修改，但能调用
 
#### 二维化/多维化

这里的容器都可以二维化/或者是多维化

并且数据类型还可以不一样

	list_1=[[1,2,3,4],'1'] 
	list_1[1]='1'
	list_1[0]=[1,2,3,4]
	list_1[0][0]=1

访问方式还是一样通过引索就可以了

#### dictionary

字典：就是你自定义引索，自定义对应的数据类型，说白了就是你自己创造一本你的规则的字典
	
	dic={
			"hi":"nihao",
			"hello":"nihao",
			"konichiwa""nihao",
		}
	dic[hi]="nihao"；

#### 集合

集合就是set，其意义就是指其包括了没有重复元素的一个列表

	herbs={'1','2','3'}
	'3' in herbs 
	True

in操作则是可以判断某值是否在集合之中

	set1 & set2	求交集
	set1 | set2	求并集 
	set1 - set2	求差集
	set1 ^ set2 全集-交集=非公有集

#### 容器操作

链表的一套操作：增删改查、排序、合并、统计

	list_1.append(2)         把2添加到列表尾部
	list_1.extend(tuples_1)  把tuples_1合并到列表中去，是tuples_1的每个元素分别加入其中
	list.pop(1)				 返回并删除第一个元素
	list_1.insert(3,4) 		 在第3个位置插入4
	list_1.sort()			 自动排序，数字就是排大小，字母就是字典序
	list_1.index(3)			 返回第一次出现3的引索
	list_1.count(1)			 返回1出现的次数
	list_1.remove(1)		 删除列表中第一次出现的1

元组也能有上面的操作，除去对于数据修改的操作

###变量范围

在Python中变量分为局部变量和全局变量

在函数中可以取到全局变量的值，但是如果要修改则必须在函数体内生命

	global xxx 

才能实现对全局变量的修改

## 控制结构

Python的控制结构的特殊地方在于其循环体的判读是以缩进为依据的

并且再也没有了do-until结构。

break和continue依然是可以使用的

同时没有了select结构，整个语言更加精简了 

###While

	While Ture：
		print("缩进是必须的，其循环体的判断以缩进为依据")

###for

range(x,y,step)函数用于i的遍历范围，步长为step，从x到y(不包括y)

	for i in range(1,13)：
		print("缩进是必须的，其函数体的判断以缩进为依据")

集合set也能用来循环，但是会自动排序

	for i in {1，2，4，3}
		print（i）

输出的是 1234 而不是1243，要注意下，这种无序结构的循环特殊

字典也能用来循环，只是用key，value来循环

	for key，value in dic.item()


###if

if没什么太大变化，只是都是以冒号开始



	if True :
		True
	elif True:
		...
	else:x
		...



## 异常捕获

虽然python比较精简，不过异常捕获竟然还存在

同时 可以使用 pass来直接跳过某些情况

	try：
		...
	except type_of error:
		...

	except Exception,e
		print(e)

例：

	is_number=False
	num=0
	while not is_number:
		is_number=True
		try:
			num=int(input("input number:"))
		except ValueError:
			print("not number")
			is_number=False

## 函数

Python的普通函数（参数为四大类型），是用值传递的

如果是其他的数据结构，用的是地址传递

	def add_one(num):
		num=num+1
		return num
	number1=1
	number2=add_one(number1)
	print(number1,number2)

输出的 number1=1 number2=2 可见是值传递


	def add_one(num):
		num[0]=num[0]+1
		return num
	number1=[1,2]
	number2=add_one(number1)
	print(number1,number2)

输出的 number1=[2,2] number2=[2,2] 可见是值传递

###深拷贝

使用copy.deepcopy 也是深拷贝就能避免地址传递的问题

import就是用来导入copy模块
	
	import copy
	def add_one(num):
		num[0]=num[0]+1
		return num
	number1=[1,2]
	number2=add_one(copy.deepcopy(number1))
	print(number1,number2)

输出的 number1=1 number2=2 可见是值传递,其实是传递了一个副本进去而已

###默认值，可变参数

函数还可以有默认值，可变参数

	def add_one(num，n=1):
		num=num+n
		return num

这其中n的默认值为1，有默认参数的应该放在参数表的右侧，无默认值的在左侧

这个与函数参数入栈的方式有关系，windows下默认是从右到左入栈的（地址是从低到高往上生长）

	def add_one(num，*n):
		num=num+1
		return num

这其中参数前面加*就是可变参数了，其实际上是一个tuple，所有数据依次存在其中而已

	def funcD(a, b, *c):
	  print a
	  print b
	  print "length of c is: %d " % len(c)
	  print c

调用funcD(1, 2, 3, 4, 5, 6)结果是

	1
	2
	length of c is: 4
	(3, 4, 5, 6)

可以看到，前面两个参数被a、b接受了，剩下的4个参数，全部被c接受了，c在这里是一个tuple。

在调用funcD的时候，至少要传递2个参数，2个以上的参数，都放到c里了

如果只有两个参数，那么c就是一个empty tuple

函数调用时，标记参数位置

	def funcE(a, b, c):
	  print a
	  print b
	  print c
	funcE(100, 99, 98)
	funcE(100, c=98, b=99)

两个函数的运行结果是一样的，就是指定了具体的参数

而如果要一个字典类型的作为参数/指定参数的多个可选参数传入的时候就需要用**来标记

如果一个函数定义中的最后一个形参有 ** （双星号）前缀,

所有正常形参之外的其他的关键字参数都将被放置在一个字典中传递给函数，比如：
	
	def funcF(a, **b):
	  print a
	  for x in b:
	    print x + ": " + str(b[x])

调用funcF(100, c='你好', b=200)，执行结果
	
	100
	c: 你好
	b: 200

可以看到，b是一个dict对象实例，它接受了关键字参数b和c。

####这个主要解决什么问题呢？

就是用来解决当参数个数未知的时候，后面的参数到底是谁对谁的问题。

那么传入的参数中的 c、b 这种就相当于是指定的key

而 '你好' 200 就是对应的value 

这样就能完成函数中多参数的解析了。

## 注释

用井号来单行注释，三个单引号来多行注释

	#单行注释
	
	'''
	多行注释
	多行注释
	多行注释
	''' 


##练习小程序

1.找出1到30之间所有素数 

	print(2)
	for i in range(2,30):
		prime=True
		for k in range (2,i):
			if(i%k==0):
				prime=False
		if prime:
			print(i)

2.上题优化加速

	print(2)
	for i in range(3,30,2):
	    prime=True
	    for k in range (2,i):
	        if(i%k==0）:
	            prime=False
	            break
	    if prime:
	        print(i)               

3.简单的学生成绩数据库程序（只是敲一遍熟悉Python的语法）

	#一个列表复合了一个string+字典
	students=[
	    ["ben",{"maths":67,"english":78,"science":72}],
	    ["mark",{"maths":67,"art":64,"history":72,"geography":44}],
	    ["paul",{"history":67,"english":78}]
	]
	
	#一个元组，实际上就是个枚举结构，二维
	grades=(
	    (0,"fail"),
	    (50,"D"),
	    (60,"c"),
	    (70,"b"),
	    (80,"A"),
	    (101,"cheat")
	)  
	
	#轮询输出学生成绩
	def print_report_card(report_student=None):
	    for student in students:
	        if (student[0]==report_student) or (report_student==None):
	            print("report card for student ",student[0])
	            for subject,mark in student[1].items():
	                for grade in grades:
	                    if mark <grade[0]:   
	                        print(subject,":",prev_grade)
	                        break
	                    prev_grade=grade[1]
	#轮询添加学生
	def add_student(student_name):
	    global students
	    for student in students:
	        if student[0]==student_name:
	            return "student already in database"
	    students.append([student_name,{}])
	    return "student added successfully"
	#给某一学生增加某课程成绩
	def add_mark(student_name,subject,mark):
	    global students
	    for student in students:
	        if student[0]==student_name:
	            if subject in student[1].keys():
	                print(student_name,"already has a mark of ",subject)
	                user_input=input("overwrite y/n?")
	                if user_input =="y" or "Y":
	                    student[1][subject]=mark
	                    return "student's mark update"
	                else:
	                    return "student's mark no update"  
	            else:
	                student[1][subject]=mark
	                return "student's mark added"
	    return "studen not found"
	#主函数 完成命令选择和参数输入
	while True:
	    print("welcome to the raspberry pi student database")
	    print("what can i help you whti ?")
	    print("enter 1 to view all report cards")
	    print("enter 2 to view the report card for a student")
	    print("enter 3 to add a stuent")
	    print("enter 4 to add a mark to a student")
	    print("enter 5 to exit")
	
	    try:
	        user_choice=int(input("choice:"))
	    except ValueError:
	        print("that's not a number recognized")
	        user_choice=0
	    if user_choice==1:
	        print_report_card()
	    elif user_choice==2:
	        enter_student=input("which studen?")
	        print_report_card(enter_student)
	    elif user_choice==3:
	        enter_student =input("student name")
	        print(add_student(enter_student))
	    elif user_choice==4:
	        enter_stuent=input("student name")
	        enter_subject=input("subject name")
	        num_error=True
	        while num_error:
	            num_error =False
	            try:
	                enter_mark=int(input("mark?"))
	            except ValueError:
	                print("i don't recognize that as a number")
	                num_error=True
	        print(add_mark(enter_student,enter_subject,enter_mark))
	    elif user_choice==5:
	        break
	    else:
	        print("unknow choice")
	    input("press enter to continue")
	print("goodbye and thank you for using the raspberry pi ","student database") 
	#不敲不知道，敲完就知道你错了多少           

## The end

这一章只学习Python的基础语法（面向过程的部分）

基础部分介绍的并不够详细，也不够深入，日后遇到问题后会一点一点完善本章的内容

最后能达到触及Python基础的全部问题再好不过。

第二章会单独学习Python的面向对象的部分

总体来说Python是一个比较精简的语言，数据结构把一些常用的操作等都封装好了，使用方便，写起一些算法来比较简单，关键字比较少，属于解释性语言

要说不好就是用缩进来进行程序分块这一点可能不够好

如果嵌套层数过多的话，代码就跟楼梯一样一直往下空下去了
