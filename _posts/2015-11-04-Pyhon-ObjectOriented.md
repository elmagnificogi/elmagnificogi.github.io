---
layout:     post
title:      "Python学习第二章（面向对象）"
subtitle:   "Python,类,import"
date:       2015-11-04
author:     "elmagnifico"
header-img: "img/python-head-bg.jpg"
tags:
    - python
---

## 代码环境

System：Raspberry Pi

IDE：IDLE3

需要：语言基础

## 类

### 类=数据+函数

	class Person():
		def __init__(self,age,name):
			self.age=age
			self.name=name

		def birth(self)
			self.age=self.age+1

Python类中 __init__就是构造函数，默认这么写
self相当于是private 私有变量的声明

### 继承

	class Parent(Person)
		def __init__(self,age,name):
			Person.__init__(self,age,name)
			self.children=[]

其中Person是Parent的父类，Parent是Person的子类

通过父类名可以直接调用父类的函数

## import

import就相当于是include 导入你自己写好的文件或者是系统的模块

	hello.py

	def hello():
		print（"hello world")

	main.py

	import hello.py
	hello.hello()

文件名.函数名 就能直接调用了-

要使其使用起来就像是自己的一样

	from hello import hello

局部导入，用 from xx import xx 可以直接使用xx进行调用，不需要加文件名

全部导入

	from hello import

需要注意一个问题，Python不存在重载，也就是说，同样的名字就会出现覆盖

一般使用import xx 就足以，不然重名可能会导致意外的bug

## 小程序

### 简单的服务与客户端 by socket

服务端

	import socket
	comms_socket=socket.socket()
	comms_socket.bind(('localhost',50000))
	comms_socket.listen(10)
	connection,address=comms_socket.accept()

	while True:
	    print(connection.recv(4096).decode("UTF-8"))
	    send_data=input("Reply?")
	    connection.send(bytes(send_data,"UTF-8"))

客户端

	import socket
	comms_socket=socket.socket()
	comms_socket.connect(('localhost',50000))
	while True:
	    send_data =input("message:")
	    comms_socket.send(bytes(send_data,"UTF-8"))
	    print(comms_socket.recv(4096).decode("UTF-8"))

开两个IDLE 一个运行服务端（先开启），一个运行客户端（后开启）
就能通过命令行对话了。


### 天气预报 by JSON

	import urllib.request,json

	url="http://api.openweathermap.org/data/2.5/forecast/"+"daily?cnt=7&units=meteric&mode=json&q=London"

	url2="http://api.openweathermap.org/data/2.5/forecast/"+"city?id=524901&APPID=882d9218da4e33a23348bddf6d516d4f"

	req=urllib.request.Request(url2)
	forecast_string=urllib.request.urlopen(req).read()
	forecast_dict=json.loads(forecast_string.decode("UTF-8"))
	print(forecast_dict)


如果提示的是401错误，那不是你代码错了，是这个天气服务的API现在需要先发送APPID然后才能获取到

url是老的获取方式，不需要appid，直接就能拿到JSON格式的数据了

url2是新的获取方式+我的APPID，可以看到返回的值 各种地方的天气什么的

### 本机目录服务器 by HTTP

	import http.server,os

	os.chdir("/home/pi")
	http=http.server.HTTPServer(('127.0.0.1',8000),http.server.SimpleHTTPRequestHandler)
	http.serve_forever()

用浏览器打开

> http://localhost:8000

就能看到pi目录中的文件了

## The end

这一章只学习Python的面向对象的部分

面向对象介绍的并不够详细，也不够深入，日后遇到问题后会一点一点完善本章的内容

第一章是Python的面向过程的部分

写了一点书上的小例子，都能正常运行

## Quote

> http://www.jb51.net/article/42623.htm
>
> http://blog.chinaunix.net/uid-20527331-id-95402.html
