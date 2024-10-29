---
layout:     post
title:      "部署试用Orangescrum"
subtitle:   "PingCode"
date:       2024-10-28
update:     2024-10-29
author:     "elmagnifico"
header-img: "img/z5.jpg"
catalog:    true
tobecontinued: false
tags:
    - 管理
---

## Foreword

部署试用Orangescrum，还是发现了一些问题



## 部署

> https://hub.docker.com/r/orangescrum/orangescrum-app

docker在github中没有给对应的文档或者安装说明，在dockerhub中倒是有官方镜像，但是镜像已经非常老了，体验了一下跟云端版本相差甚远

```
docker run -d -p 3306:3306 --name=osdb orangescrum/orangescrum-db
docker run -d -p 80:80 --name=osapp --link=osdb orangescrum/orangescrum-app
```

部署老版本倒是不困难，两条命令启动完就能进去了

![image-20241028175606176](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281756230.png)

但是这个老版本任务不支持子任务，不支持看板拖动，可用性很低



### 新版部署

本以为只能通过源码部署，看一下是否接近云端版本，多看了一眼有一个PR就是增加docker，刚好来试一下

> https://github.com/Orangescrum/orangescrum/pull/45
>
> https://github.com/geraldbahati/orangescrum

拉下来小黑的库

```
git clone https://github.com/geraldbahati/orangescrum.git
```



修改一下docker-compose文件

```
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    volumes:
      - .:/var/www/html
    depends_on:
      - db

  db:
    image: mariadb:latest
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: orangescrum
      MYSQL_USER: orangescrum_user
      MYSQL_PASSWORD: password
    volumes:
      - db_data:/var/lib/mysql
      - $PWD/database.sql:/docker-entrypoint-initdb.d/database.sql 
    ports:
      - "3307:3306"

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    environment:
      PMA_HOST: db
      MYSQL_ROOT_PASSWORD: rootpassword
    ports:
      - "8081:80"

  mysql-client:
    image: mysql:latest
    command: sleep infinity
    depends_on:
      - db
    networks:
      - default

volumes:
  db_data:
```



启动

```
docker-compose up -d
```

启动以后需要开启header模块，然后重启apache

```
docker exec -it orangescrum-app-1 bash
a2enmod headers
service apache2 restart
```

后面可以通过下面命令验证是否开启了

```
apache2ctl -M | grep headers
```



然后可以进入服务器:8081端口，验证phpadmin启动了



接着验证app启动了，在这里会出现这个问题，缺少一个error.check

![image-20241028192752708](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281927767.png)

实际进去以后发现确实没有error.check，怀疑权限不正确，手动运行Dockerfile内的命令以后，情况改变

```
chown -R www-data:www-data /var/www/html \
    && chmod -R 0777 /var/www/html/app/Config \
    && chmod -R 0777 /var/www/html/app/tmp \
    && chmod -R 0777 /var/www/html/app/webroot
```

![image-20241028193341441](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281933482.png)

变成了无限循环，F12看到似乎什么报错了，然后重定向死循环了，非常接近正常启动了

- 到这里发现实际无法访问js路径，查了一下apache也没看到原因，单纯就是不行



### 自动安装

> https://github.com/Orangescrum/orangescrum/releases/tag/V2.0.11

官方的release中有自动安装包，但是ubuntu 18实际测试发现不行，会提示一个错误，很奇怪

```
os-scripts is a direct
```



切换到ubuntu 16，总算可以显示安装界面了

![image-20241029162435792](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291624863.png)

![image-20241029164250295](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291642330.png)

![image-20241029165740485](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291657542.png)

继续往下部署就会发现这里报错了，无法继续

![image-20241029170146591](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291701648.png)

看了一下，应该是数据库还是有问题，起不来



## 试用

![image-20241029143930798](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291439856.png)

项目列表中可以看到当前计划完成的情况，实时的



![image-20241029142931375](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291429450.png)

Orangescrum一共14种类型的任务，其中13种都可以在Scrum种体现，只有epic是不能放在scrum中的

![image-20241029143520976](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291435038.png)

规划任务或者是积压的任务都可以快速拖入到一个迭代中

![image-20241029143623566](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291436623.png)

开始迭代以后就可以在看板视角看到具体哪个任务完成了或者没完成，每个任务的状态会在看板视角同步切换

![image-20241029143803351](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291438454.png)

每个迭代结束以后可以在Reports中看到迭代的记录和情况

迭代完成以后，Backlog中就不会再看到对应的迭代了，这个时候创建下一个即可，敏捷开发的循环就正常跑起来了



![image-20241029144148896](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291441984.png)

项目模板中也支持多种模板模式，功能是比较完善的

![image-20241029144243772](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291442815.png)

至于其他的wiki、文件存档、甘特图、工单、发票追踪等等也都支持

![image-20241029144615279](https://img.elmagnifico.tech/static/upload/elmagnifico/202410291446326.png)

整合上还差一点，不支持Gitlab，有点可惜

## Summary

看别人好像都跑的同，甚至官方的自动安装包都可以，但是我这里就不行
