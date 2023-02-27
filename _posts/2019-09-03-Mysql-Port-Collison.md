---
layout:     post
title:      "mySql、web的多个docker实例"
subtitle:   "docker-compose"
date:       2019-09-04
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - Java
    - MySql
---

## Foreword

我想通过docker-compose 同时建立两套后台，一套是正常使用的，一套是用来开发测试的。

然后这两套的数据库要求是完全独立的，两个实例

## dockerfile

```java
FROM java:8

MAINTAINER demo demo@xxx.com

VOLUME /tmp

ADD demo-0.0.1-SNAPSHOT.jar demo.jar

RUN bash -c 'touch /demo.jar'

EXPOSE 4396

ENTRYPOINT ["java", "-jar", "demo.jar"]

```

平常看到的dockerfile类似与上面这样的，但是这种dockerfile是用docker直接build或者启动用的，如果用了docker-compose文件，其实这里有些东西就要改一下。

这句是最大的坑，这里的java会让docker自动拉去一个java 8的image，但是这个java8有个小问题，就是它本身是纯净版本，是没有maven的，本机上maven是不能直接拿给docker里的镜像去用的。

```
FROM java:8 
或者
FROM openjdk:8-jdk-alpine
```

平常在一个有maven的机器上build什么的可能没问题，但是如果是结合了docker-compose这里就会报错了。

```yaml
  web:
    container_name: web
    restart: always
    build:
      context: ./src/main/docker
      dockerfile: Dockerfile
    working_dir: /web
    volumes:
      - .:/web
      - ~/.m2:/root/.m2
    networks:
      - dmdnet
    ports:
      - "80:80"
    depends_on:
      - mysql
    command: mvn clean spring-boot:run -Dspring-boot.run.profiles=prod
```

比如这样的配置下，需要docker内build，就会出现下面的找不到mvn的路径

```
starting container process caused "exec: \"mvn\": executable file not found in $PATH"
```

要解决这个问题，要么手动进到镜像里去安装一个maven，要么就是换一个引用。

```
FROM maven:3.6-jdk-8
```

用这方式，就可以让build的时候有maven了，但是如果只是改了这里可能还会出问题。

docker-compose的时候由于自带缓存，改了以后其实并不会拉取对应的maven镜像，会导致错误依旧。

> https://docs.docker.com/compose/reference/build/

docker-compose 官方有一个build参数，在无缓存的情况下进行build，这样的情况下，会重新拉取对应的images，然后maven就会被加进来了，这样的整个服务就能正常build了

```bash
docker-compose build --no-cache
```

之后有大的镜像或者之类的改动的时候最好是用这个命令重新构建一下

## 问题docker-compose

```java
version: '3'
services:
  mysql:
    container_name: docker_mysql
    image: docker.io/mysql
    environment:
      MYSQL_DATABASE: au
      MYSQL_ROOT_PASSWORD: 123456
    networks:
      - dmdnet
    ports:
      - "3306:3306"
    restart: always

  mysql_test:
    container_name: docker_mysql_test
    image: docker.io/mysql
    environment:
      MYSQL_DATABASE: jpa_test
      MYSQL_ROOT_PASSWORD: 123456
    networks:
      - dmdnet_test
    ports:
      - "3307:3306"
    restart: always

  web:
    container_name: web
    restart: always
    build:
      context: ./src/main/docker
      dockerfile: Dockerfile
    working_dir: /web
    volumes:
      - .:/web
      - ~/.m2:/root/.m2
    networks:
      - dmdnet
    ports:
      - "80:80"
    depends_on:
      - mysql
    command: mvn clean spring-boot:run -Dspring-boot.run.profiles=prod

  web_test:
    container_name: web_test
    restart: always
    build:
      context: ./src/main/docker
      dockerfile: Dockerfile
    working_dir: /web_test
    volumes:
      - .:/web_test
      - ~/.m2:/root/.m2
    networks:
      - dmdnet_test
    ports:
      - "4396:4396"
    depends_on:
      - mysql_test
    command: mvn clean spring-boot:run -Dspring-boot.run.profiles=test

networks:
  dmdnet:
  dmdnet_test:

```

这里面有两个地方要十分注意，建立多个mysql的时候，由于是直接建立的，没有修改mysql的conf文件，所以mysql的默认端口都是3306.

在docker中虽然我建立了两个不同的网络，并且mysql也分别隶属于不同的网络中，但是端口冲突并不会被这个网络隔离（其实是因为这里的networks本质上都是bridge模式，所以没有区别），所以这里第二个mysql的端口一定要和第一个不同才能正常工作。

但是问题还没有这么简单，虽然这里这么写了，好像没问题了，但是还有一个地方要注意，否则依然会报连不到数据库的错误

## application配置

#### 双配置

prod配置文件

```
spring:
  mvc:
    date-format: yyyy/MM/dd
  datasource:
    url: jdbc:mysql://docker_mysql:3306/au
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
```

test配置文件

```
spring:
  mvc:
    date-format: yyyy/MM/dd
  datasource:
    url: jdbc:mysql://docker_mysql_test:3307/jpa_test
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
```

如果配置文件这么写，那么必然会报错，而且报的是连不上数据库，而实际上，这里完全没有必要指定端口，指定了反而会出错

在compose中配置的container_name就已经可以拿来作为一个域名使用了，并且compose配置的端口信息其实也会绑定到container_name中，这就导致如果你重写了这个port会出现冲突的情况。所以正确的写法就是：

```
url: jdbc:mysql://docker_mysql_test/jpa_test

url: jdbc:mysql://docker_mysql/au
```

这样完全不指定端口，更适合

同时还有一个问题，网络，如果没有特殊必要，他们应该在一个网络里，这里分开建两个网络本身就有点问题。

#### 启动太慢

这里会发现在这个compose的情况下，启动超级慢，两个web服务来回启动，折腾很久才能结束，其实是这里有一个错误的地方，就是每个web服务都是重新build然后启动，然后这个就会影响到另外一个已经启动的web导致另一个人也重新启动，然后两个服务来回启动，直到某一方先正常启动了，然后紧接着另一方也正常启动了，都不重新build，就能正常了，但是这太慢了，而且太弱智了。

所以最好的方法还是将两个服务分开处理，而不是合在一起。

同时呢，其实mysql也没有必要开启两个独立的mysql，一个mysql配多个database或者说schema就完全可以了，基于这样分成两个配置。

正常配置

```
version: '3'
services:
  mysql:
    container_name: docker_mysql
    image: docker.io/mysql
    environment:
      MYSQL_DATABASE: db
      MYSQL_ROOT_PASSWORD: 123
    volumes:
      - /root/mysql/data:/var/lib/mysql
      - /root/mysql/config/my.cnf:/etc/my.cnf
      - /root/mysql/init:/docker-entrypoint-initdb.d/
    networks:
      - dmdnet
    ports:
      - "3306:3306"
    restart: always

  web:
    container_name: web
    restart: always
    build:
      context: ./src/main/docker
      dockerfile: Dockerfile
    working_dir: /web
    volumes:
      - .:/web
      - ~/.m2:/root/.m2
    networks:
      - dmdnet
    ports:
      - "80:80"
    depends_on:
      - mysql
    command: mvn clean spring-boot:run -Dspring-boot.run.profiles=prod

networks:
  dmdnet:
  
```

测试配置

```
version: '3'
services:
  web_test:
    container_name: web_test
    restart: always
    build:
      context: ./src/main/docker
      dockerfile: Dockerfile
    working_dir: /web_test
    volumes:
      - .:/web_test
      - ~/.m2:/root/.m2
    networks:
      - default
    ports:
      - "4396:4396"
    command: mvn clean spring-boot:run -Dspring-boot.run.profiles=test

networks:
  default:
    external:
      name: test_dmdnet
```

这里要注意的是，由于docker-compose，在启动的时候使用当前文件夹作为工程名，所以对应创建的服务也好，网络也好，都是带有当前文件夹作为前缀的。

所以实际的网络名称是 test_dmdnet,而不是dmdnet

```
[root@iZwz9grkell15awt1thx8dZ test]# docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
cb56e2b19e5c        bridge              bridge              local
d20a876dd85e        host                host                local
bfe143b4c20e        none                null                local
27884da0cb23        test_dmdnet         bridge              local
```

Compose中要引用已经存在的名称要使用external标签来指定具体用的是哪个

#### -f -p

平时都是文件名叫 docker-compose.yml 或者 docker-compose.yaml

其实是 docker-compose -f 参数默认是两个文件名

如果要用个不同文件名，就要带f指定文件 

```bash
docker-compose -f test.yml up
```

前面提供到的默认工程名也可以修改，通过-p参数，其默认是当前yml文件所在文件夹的名称

```bash
 docker-compose -f test.yml -p web up
```

这样就能通过指定文件指定工程名进行启动了。修改工程名后，本质上就可以把同一个docker-compose启动多次，所以如果想要启动完全不相干的两套系统也是可以通过这个办法来的。

## mysql 初始化

由于数据其实已经存在了，想要每次启动的时候要么用外部的数据要么用其内部的数据，为了后面转移数据方便，而且也好备份，我用了外部数据。

```
services:
  mysql:
    container_name: docker_mysql
    image: docker.io/mysql
    environment:
      MYSQL_DATABASE: db
      MYSQL_ROOT_PASSWORD: 123
    volumes:
      - /root/mysql/data:/var/lib/mysql
      - /root/mysql/config/my.cnf:/etc/my.cnf
      - /root/mysql/init:/docker-entrypoint-initdb.d
```

所以可以看到，这里通过volumes制定了几个文件映射

- /var/lib/mysql 中存放的就是mysql的数据文件
- /etc/my.cnf mysql的配置文件
- /docker-entrypoint-initdb.d/ mysql的初始化文件

有了这些以后数据库就比较好配置，好备份了。

然后有一点要注意，每次启动的时候如果data内不是完全空的情况下，会导致mysql并不会初始化，也就是不会自动调用init中的sql文件来初始化数据库。如果想要完全重新初始化数据，那么就要手动删除data目录下所有内容。

#### 导出数据带数据库

![](https://img.elmagnifico.tech/static/upload/elmagnifico/sC46Qi5uF3fjboH.png)

之前发现我导出的sql不带数据库自身，这就有一些问题，初始化的时候相当于没有指定数据库。如果只有一个数据库还好，如果有两个就有问题了。

这里可以通过workbench中的导出功能，在导出的时候勾选上 Include Create Schema,那么每次重新初始化数据库的时候都会自动调用这个sql，并且会自动创建对应的Schema

有了这个以后，compose文件中的MYSQL_DATABASE甚至可以不用指定了，直接就自动创建了。

```
    environment:
      MYSQL_DATABASE: dmd_au
```

我之前为了解这个问题还研究了一下是否可以在compose里MYSQL_DATABASE参数直接配置成两个或者多个数据库的模式，然而并不可以，多数都是要么自己写个脚本后面再创建一下多余的数据库要么是直接手动进到容器里面然后进入mysql去配置数据库。

## 总结

总的来说经过这样的使用以后大概明白了docker-compose的工作机理，数据的内置外置，mysql等等相关的一些细节问题。

但是目前还是有一个问题，不是很清楚是什么原因造成的。建立两个web以后，有些时候会出现明显的超长延迟，get或者post请求要很久很久才响应，但是只要卡这一次以后后面就都正常了，但是不知道为什么会这样。

同时Xshell连阿里云也是某些情况下会出现延迟，消息迟迟没有响应，等很久才返回。难道是试用期的阿里云就是这样的？？

## 参考

> https://blog.csdn.net/Kiloveyousmile/article/details/79830810
>
> https://blog.51cto.com/ityouknow/2091874
>
> https://blog.csdn.net/liu11yutao/article/details/85006430
>
> https://www.cnblogs.com/wt88/p/10470536.html
>
> https://www.cnblogs.com/ityouknow/p/8599093.html
>
> https://www.cnblogs.com/mmry/p/8812599.html
>
> https://www.cnblogs.com/lori/archive/2018/10/24/9843190.html
