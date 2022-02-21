---
layout:     post
title:      "docker-compose部署springboot项目"
subtitle:   "mysql,oauth,java"
date:       2020-11-04
author:     "elmagnifico"
header-img: "img/docker-head-bg.jpg"
catalog:    true
tags:
    - Springboot
    - docker
---

## Foreword

使用docker来部署springboot项目网上已经有很多了，但是他们有些细节问题没给说怎么弄，不过springboot本身的教程里就有对docker的详细教学，就不再说了，我这里是用docker-compose来组织多个service的，所以记录一下相关的问题。

最后的引用中2篇文章都写的非常清楚了，这里主要是说一下他们没注意或者同项目重复部署的时候遇到的坑。

## Dockfile

我的dockfile做的比较简单，基本只要基础的能编译就行了，剩下的执行什么的都交给docker-compose来做了

```
FROM maven:3.6-jdk-8

#MAINTAINER demo demo@xxx.com
#VOLUME /tmp
#ADD demo-0.0.1-SNAPSHOT.jar demo.jar
#RUN bash -c 'touch /demo.jar'
#EXPOSE 4396
#ENTRYPOINT ["java", "-jar", "demo.jar"]
```



## pom.xml

当然由于本身使用maven插件来编译的所以pox里也要导入对应依赖

```
            <plugin>
                <groupId>com.spotify</groupId>
                <artifactId>docker-maven-plugin</artifactId>
                <version>1.0.0</version>
                <configuration>
                    <imageName>demo:1.0.0</imageName>
                    <dockerDirectory>${project.basedir}/src/main/docker</dockerDirectory>
                    <resources>
                        <resource>
                            <targetPath>/</targetPath>
                            <directory>${project.build.directory}</directory>
                            <include>${project.build.finalName}.jar</include>
                        </resource>
                    </resources>
                </configuration>
            </plugin>
```



## docker-compose.yml

平常看教程也好，什么其他的也好，都是类似这么写的配置文件，如果只启动单个应用完全没问题，但是启动多个就会出错了。

同时mysql同步到本地，web的一部分内容也同步到本地保存

```
version: '3'
services:
  mysql:
    container_name: docker_mysql
    image: docker.io/mysql
    environment:
      MYSQL_DATABASE: elmagnifico__au
      MYSQL_ROOT_PASSWORD: 123
    volumes:
      - /root/mysql/data:/var/lib/mysql
      - /root/mysql/config/my.cnf:/etc/my.cnf
      - /root/mysql/init:/docker-entrypoint-initdb.d
    networks:
      - elmagnifico_net
    ports:
      - "3306:3306"
    command: [
      '--default-time-zone=+8:00'
    ]
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
      - /root/log/web:/web/log
    networks:
      - elmagnifico_net
    ports:
      - "80:80"
      - "443:443"
    environment:
      - TZ=Asia/Shanghai
    depends_on:
      - mysql
    command: mvn clean spring-boot:run -Dspring-boot.run.profiles=prod

networks:
  elmagnifico_net:
```



## 问题

上面的看起来没问题，当时是写了一个脚本来同时启动两个服务器，但是就会出现都起不来的情况

> http://elmagnifico.tech/2019/09/04/Mysql-Port-Collison/

之前在这里说过，同时将两个服务写道一个配置文件里会出错，因为二者先后build，会导致前一个刚启动的情况下，后一个立马重build，然后文件就出错了，就会出现二者反复启动，直到一方启动后无错，然后另一方才能正常启动。后来是通过分开两个服务，然后中间等待一段时间再启动另一个服务就正确了。

其实我之前只解了一半的问题，还有一个问题没有彻底解决。

就是我启动两个项目都是在同一个项目文件夹中的，没有给test和prod区分项目，这就导致了docker中

```
    volumes:
      - .:/web
```

这个将本地和docker中的内容，一直保持同步，从而导致二者启动时各种问题。

而要解决这个问题，就是部署的时候，分别建立两个工程文件夹，分别从各自的文件夹中进行build，独立二者。



## deploy.sh

写了个自动部署，比较简单，用来启动正式服务和测试服务

```
#!/usr/bin/env bash
echo "start deploy"
echo "close exist service"
docker-compose -f ../web_test/test.yaml down
docker-compose -f ../web/docker-compose.yaml down
echo "deploy the prod"
docker-compose -f ../web/docker-compose.yaml up -d
echo "deploy the test"
docker-compose -f ../web_test/test.yaml up -d
echo "deploy end"
```



## undeploy.sh

关闭所有服务

```
#!/usr/bin/env bash
echo "start undeploy"
echo "close test image"
docker-compose -f ../web_test/test.yaml down
echo "undeploy the prod"
docker-compose -f ../web/docker-compose.yaml down
echo "undeploy end"
```



## Summary

这样以后，再也不会有什么启动的时候各种异常情况了。

不过这种方法还是傻了点，springboot本身也带了docker，其实也可以用spring本身的docker，生成镜像以后再启动，这样的话其实可以把不同service都写在同一个配置文件中。

## Quote

> http://www.ityouknow.com/springboot/2018/03/28/dockercompose-springboot-mysql-nginx.html
>
> https://spring.io/guides/topicals/spring-boot-docker
