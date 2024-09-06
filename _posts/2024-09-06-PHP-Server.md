---
layout:     post
title:      "PHP"
subtitle:   "天下第一"
date:       2024-09-06
update:     2024-09-06
author:     "elmagnifico"
header-img: "img/y5.jpg"
catalog:    true
tobecontinued: false
tags:
    - PHP
---

## Foreword

传闻中天下第一的语言，试一下服务器部署，没想到这么困难，老古董还是有点难啊



## PHP



### 部署

先安装PHP，2021 年开始，Ubuntu 官方不再支持 PHP 5.6 版本的维护和更新，因此如果需要在 Ubuntu 上安装 PHP 5.6，则需要使用第三方的 PPA（个人软件包归档）来进行安装

```
sudo add-apt-repository ppa:ondrej/php
sudo apt-get update
sudo apt-get install php5.6
php -v
PHP 5.6.40-78+ubuntu24.04.1+deb.sury.org+1 (cli) 
Copyright (c) 1997-2016 The PHP Group
```



好像fpm不这么装也行，5.3.3以后集成了fpm，本身是用来管理的

```
apt-get install php5.6-fpm
systemctl status php5.6-fpm
```



检查apache服务启动

```
systemctl status apache2.service 
```



内网地址，可以看到页面了

```
http://10.10.2.24/
```



替换一个PHP的index看下

```php
<!DOCTYPE html>
<html>
<body>

<h1>我的第一个 PHP 页面</h1>

<?php
echo "Hello World!";

?>

</body>
</html>

```



到这里已经可以正常显示启动了



### 数据库

```
sudo apt install php5.6-mysql
```



```
docker pull mysql:5.6
docker run --name user_database -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 -d mysql:5.6
```



```php
<?php
// 准备连接参数
$servername = "localhost";
$servername = "127.0.0.1";
$username = "root";
$password = "123456";
$dbname = "user_database";
 
// 创建数据库连接
$connect = mysqli_connect($servername, $username, $password, $dbname);
 
// 检查连接
if (mysqli_connect_error()) {
die("连接失败: " . mysqli_connect_error());
}
 
// 选择数据库
if (mysqli_select_db($connect, $dbname)) {
echo "数据库连接成功";
} else {
echo "数据库连接失败";
}
 
// 关闭连接
mysqli_close($connect);
?>
```

测试是否可以连接到数据库，目前没有问题了



### Apache2

Apache2和之前的不太一样，配置文件都改变了

ports.conf中是apache监听的端口

```shell
# If you just change the port or add more ports here, you will likely also
# have to change the VirtualHost statement in
# /etc/apache2/sites-enabled/000-default.conf

Listen 80

<IfModule ssl_module>
        Listen 443
</IfModule>

<IfModule mod_gnutls.c>
        Listen 443
</IfModule>

```



默认apache的虚拟主机是`/etc/apache2/sites-available/000-default.conf`

```sh
<VirtualHost *:80>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.
        #ServerName www.example.com

        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/html

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        #LogLevel info ssl:warn

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # For most configuration files from conf-available/, which are
        # enabled or disabled at a global level, it is possible to
        # include a line for only one particular virtual host. For example the
        # following line enables the CGI configuration for this host only
        # after it has been globally disabled with "a2disconf".
        #Include conf-available/serve-cgi-bin.conf
</VirtualHost>

```

类似nginx的config文件，设置域名和端口等等相关代理设置



在`apache2.conf`中的是apache的全局设置，比如是否支持SSL，映射目录是什么



## Summary

一个奇怪的问题php里localhost和127.0.0.1竟然不一样，识别不了localhost，查了一下大概是由于php.ini中缺少了默认sock的方式，localhost是一种特殊传递数据的方式，并不会经过socket



## Quote

> https://www.runoob.com/w3cnote/php-basic-summary.html?source=1
>
> https://blog.csdn.net/m0_52985087/article/details/132132219
>
> https://blog.csdn.net/weixin_71993565/article/details/140336762
>
> https://blog.tag.gg/showinfo-13-35867-0.html
