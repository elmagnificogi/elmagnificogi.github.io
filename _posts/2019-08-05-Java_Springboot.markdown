---
layout:     post
title:      "Java_Springboot"
subtitle:   "入门"
date:       2019-08-05
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - java
    - spring
---

## Java

java对比c++/python学习

#### package

java中package就类似于c/c++中的namespace 用来区分不同类的的命名空间

#### static

java中的static与C/C++的static有一些不同，有一些相同，其都表达了静态的含义，但是java的不能修饰局部变量，只能用于类。

#### import

import就是导入对应的包，从而可以省略包名类名

在Java程序中，是不允许定义独立的函数和常量的。即什么属性或者方法的使用必须依附于什么东西，例如使用类或接口作为挂靠单位才行（在类里可以挂靠各种成员，而接口里则只能挂靠常量）。
于是J2SE 1.5里引入了“Static Import”机制，借助这一机制，可以用略掉所在的类或接口名的方式，来使用静态成员。static import和import其中一个不一致的地方就是static import导入的是静态成员，而import导入的是类或接口类型。

#### interface

java里不允许多重继承，然后interface可以，但是interface本身就是只用来做接口相关的，实际的具象的类或者更详细的实现某种程度上是从interface上继承下来的，这样就可以自顶向下的进行编程或者思考

类似于下图，实现了最基本的接口，然后再往下设计

![SMMS](https://i.loli.net/2019/08/05/NmxlEvafehWX9CQ.png)

其实相当于以前C++中的虽然也有接口也有类似的虚函数或者抽象类的存在，但是这些类都不可避免的有构造函数，析构函数等等，他们都是一个基础类，但是这里interface其实是一个简化的类，或者说已经不是类了，他就是interface，一个描述接口的东西，描述顶级抽象的东西，他就是用来在一开始的时候明确对外的出口是什么内容。

#### final

finnal类似 c/c++中的const，必须显式指定初始值。

finnal方法无法被重载

finnal类不能被继承

#### synchronized

为了保证线程安全的而增加的同步标志，被修饰的方法同时只能一个线程访问

#### transient

当序列化时，transient的对象不会被序列化

#### Annotation

从JDK 1.5开始, Java增加了对元数据(MetaData)的支持，也就是 Annotation(注解)。 

注解其实就是代码里的特殊标记，它用于替代配置文件：传统方式通过配置文件告诉类如何运行，有了注解技术后，开发人员可以通过注解告诉类如何运行。在Java技术里注解的典型应用是：可以通过反射技术去得到类里面的注解，以决定怎么去运行类。 

注解可以标记在包、类、属性、方法，方法参数以及局部变量上，且同一个地方可以同时标记多个注解。 

主要是用在反射机制中

注解的结构模式有点类似于一个类，但是它本身不是类，他就是注解。

相当于有类，有注解，有interface，类有类的成员变量，注解有注解的成员变量

> 注解是一系列元数据，它提供数据用来解释程序代码，但是注解并非是所解释的代码本身的一部分。注解对于代码的运行效果没有直接影响。
> 注解有许多用处，主要如下：
> 提供信息给编译器： 编译器可以利用注解来探测错误和警告信息
> 编译阶段时的处理： 软件工具可以用来利用注解信息来生成代码、Html文档或者做其它相应处理。
> 运行时的处理： 某些注解可以在程序运行的时候接受代码的提取
> 值得注意的是，注解不是代码本身的一部分。

标签本身是不会修改代码的，但是由于java是通过解释器运行的，那么在运行时标签本身信息会影响到编译和运行后的结果，标签只是用来修饰代码的，并且对代码运行时产生了影响。

大部分情况下，有了注解，那么就可以通过注解来完成反射这个机制，那么就可以给原本的代码加上测试，就可以直接对原本的代码加上自动化的注释，那么就可以非常简单快速的建立出一套标准的文档。

同时有了注释以后，还可以一定程度上写根据注释而改变的配置信息等等。

#### java bean

java bean经常被提起，但是刚开始根本不知道这个是什么东西。

其实就是一个特殊的类，只是这个类只用来存储数据，当作数据容器来使用，其只有私有成员变量，并且其私有成员变量有对应的set和get方法，可以直接赋值使用，而c++中就没有这种类型的东西，就必须要写一个方法来做，虽然可以用宏代替但是本质上还是不如这样来的方便。

## Spring

Spring 也比较老了，本身是一个重量级的框架，不适合快速开发，有很东西都需要自己写

![SMMS](https://i.loli.net/2019/08/05/WQD5oByIvu3Jlr8.png)

### Springboot

应对快速开发，应对解耦，应对各种微小的服务要求，就营运而生了Springboot,springboot可以在极简的配置下，快速开发，直接进入生产模式，而不是之前磨磨唧唧的预备生产阶段，说白了就是又加了一层，将很多以前需要考虑的很复杂的东西都封装了起来，从而让开发者只关心业务即可，对于环境的关心尽可能的减少。

一个个springboot就成为了微服务中的一员，各种服务之间就是各自的springboot，相互解耦，并且可以用各自的依赖和数据库等等，不受统一的限制，开发效率显著提高。

springboot在IntelliJ *IDEA*中有一个sprint boot initializr 可以快速构建各种情景

也可以通过网页端来构建

> https://start.spring.io/

#### devtools

经常要调试所以这里可以添加一个devtools，从而就可以热部署了，修改了以后立马就能看到效果，当然也要浏览器配合，每次刷新的时候自动清理缓存

```java
#关闭缓存，即时刷新
spring.freemaker.cashe=false
#spring.thymeleaf.cache=true
```

同时设置一下项目自动编译

```
“File” -> “Settings” -> “Build,Execution,Deplyment” -> “Compiler”，选中打勾 “Build project automatically” 
```

打开调试中的更新后动作设置，将其修改为更新类和资源，这样只要编辑过，就会自动同步修改了

![SMMS](https://i.loli.net/2019/08/09/VuiDpz2dokTPE5a.png)



![SMMS](https://i.loli.net/2019/08/09/9S3f4xrKzNGI7gs.png)

增加依赖

```java
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

### JPA

如果在创建springboot时选择了jpa，那么对应就需要选择对应的数据库，比如mysql

并且在创建完工程以后要在配置文件里配置mysql数据库的地址什么的,类似于下图.

这个里面可能会遇到一个问题，时区不对的情况

```java
The server time zone value '�й���׼ʱ��' is unrecognized or represents more than one time zone
```

由于数据库的时区不对，他获取到的是个异常值，有两种解决办法，一个是修改数据库本身时间，一个是修改JPA连接时使用的时间。

##### 永久设置MySQL时区

同过mysql命令行，可以查看到当前时区情况

```
show variables like '%time_zone%';
```

如果看到的是

![SMMS](https://i.loli.net/2019/08/09/dSDtGXWqLhrUKpj.png)

这样的话，基本就是错误的，这个system使用的大概是CST时间，就会导致连接JPA的时候时区出错，无法同步

然后通过SQL workbench 设置时区，当然也可以通过修改配置文件什么的，修改完成以后重启一下Mysql,让配置生效

![SMMS](https://i.loli.net/2019/08/09/uOGUDioVBTHwex3.png)

如果看到的是下面这样基本就是正确的了

![SMMS](https://i.loli.net/2019/08/08/c9q8CoTNXgVKSB4.png)



##### mysql挂了

修改时间的时候不知道为什么，把mysql改挂了，可以通过MySQL Installer - Community 快速重置mysql的配置，如果遇到卡住什么的，建议把本地的数据库全删了，然后完全重置一下，这样可能会节省很多时间

##### 修改JPA连接

如果不改数据库，也可以改JPA，只不过这样会导致时间戳是跟随数据的，可能会和本地的有不同

```java
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/jpa_test?serverTimezone=UTC
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### Bootstrap

由于需求比较简单，所以前后端我同时都写了，前端就用bootstarp来写，还是遇到了一个坑，看了一些教程，别人都是直接保存网页直接拿来用的，然后发现我保存下来的网页，有很多其他东西，实际上教程里的都是别人拉下来以后手动简化修改过后，所以就导致必须要自己修改一下这些东西才能正常使用。

bootstrap不要进中文官网，有很多东西不全或者有误，直接进官网，然后从Components中找需要格式或者组件

> https://getbootstrap.com/

bootstrap如果要更多更复杂的功能可能需要jQuery或者什么其他的支持，那么对应的就要导入一个jQuery

当然我最后用了startbootstrap下面的一个模板，这个模板自带了jQuery，本身有一些插件，没啥太大问题就用这个了。

> https://startbootstrap.com/

### Thymeleaf

模板引擎最后用了Thymeleaf，虽然感觉也没简单多少，但总的来说能用吧。

th:each 循环体在一个标签里面只能有一个，想要嵌套就要再套一层标签

## 总结

java这一块不懂得东西太多了，日后继续补充吧

总的来说java确实是高级，用惯了c/c++，用python的时候就会发现有些东西在python贼简单，到c/c++就要自己实现一遍就很麻烦，然后到java的时候就发现，我靠这个功能直接一个注解就行了，这个复杂的东西也是一个注解搞定，java里各种反射机制用的很多，封装了很多常用性质的功能，再一回去写c++发现，真麻烦啊。

但是java面对的东西感觉更复杂了，虽然各种高级封装，高级特性，但是更底层一些，更核心一些的东西反而看不到了，就让java更多的变成了面向业务，为了更快速的开发业务而存在的感觉。

## 参考

> https://www.cnblogs.com/dolphin0520/p/3799052.html
>
> https://blog.csdn.net/qq_15037231/article/details/83110717
>
> https://blog.csdn.net/sun_shine56/article/details/86621481
>
> https://www.cnblogs.com/itmsbx/p/9692538.html
>
> https://www.cnblogs.com/itmsbx/p/9704069.html
>
> https://www.jianshu.com/p/39ee4f98575c
>
> https://blog.csdn.net/qq1404510094/article/details/80577555
>
> https://blog.csdn.net/zhouvip666/article/details/83867401
>
> https://www.jianshu.com/p/2b2100560b06
>
