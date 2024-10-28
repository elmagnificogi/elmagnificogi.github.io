---
layout:     post
title:      "部署试用Orangescrum"
subtitle:   "PingCode"
date:       2024-10-28
update:     2024-10-28
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
    && chmod -R 775 /var/www/html/app/Config \
    && chmod -R 775 /var/www/html/app/tmp \
    && chmod -R 775 /var/www/html/app/webroot
```

![image-20241028193341441](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281933482.png)

变成了无限循环，F12看到似乎什么报错了，然后重定向死循环了，非常接近正常启动了



## Summary

暂时跑不通
