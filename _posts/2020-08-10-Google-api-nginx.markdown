---
layout:     post
title:      "反代谷歌API"
subtitle:   "Nginx，谷歌地图"
date:       2020-08-10
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
tags:
    - VPS
    - google
---

## Foreword

>2020年1月23日，收到谷歌邮件，标题为“[Action Required] Google Maps Platform API calls from google.cn domain will fail”。邮件中提到，自2020年2月3日起，谷歌中国域名google.cn将不再指向谷歌地图api。原使用`http://maps.google.cn/maps/api/js?key=xxx` 方式调用谷歌地图方法，将不再有效。必须统一使用 `https://maps.googleapis.com/maps/api` 方式进行调用。而由于maps.googleapis.com在国内访问不畅，导致国内无法使用。这也就意味着谷歌彻底放弃了在中国的地图接口调用。

由于谷歌中国地图的服务彻底停止了，之前只是通知停止，但是实际上还没有停止，还可以通过 google.cn 一直访问API接口。 但是现在2020-8-8应该是彻底被屏蔽或者取消了这个域名解析。

正在发愁的时候，看到了一篇反代谷歌API的，很有意思，正好用腾讯云轻量试了一下，发现完全可以工作，直接新建一个子域名安排上。

## Nginx

主要还是通过Nginx来进行反代.



安装lnmp

```
wget http://soft.vpser.net/lnmp/lnmp1.6.tar.gz -cO lnmp1.6.tar.gz && tar zxf lnmp1.6.tar.gz && cd lnmp1.6 && ./install.sh nginx
```

安装nginx相关包

```
yum install bison git
git clone https://github.com/agentzh/sregex
cd sregex
make && make install

cd /usr/local/nginx/
mkdir modules && cd modules

git clone https://github.com/agentzh/replace-filter-nginx-module

cd /root/lnmp1.6

vim lnmp.conf
```

修改这一行，添加：

```
Nginx_Modules_Options="--add-module=/usr/local/nginx/modules/replace-filter-nginx-module --with-ld-opt='-Wl,-rpath,/usr/local/lib'"
```

重新编译nginx 1.16.1,会提示编译版本，输入1.16.1即可

```
./upgrade.sh nginx
```

添加主机，带ssl

```
lnmp vhost add
```

会提示输入域名：比如maps.yourdomain.com,其他一堆配置我都直接回车默认跳过了

修改虚拟主机nginx配置文件

```
cd /usr/local/nginx/conf/vhost/
vi {maps.your-domain.com你的域名}.conf
```

#### https

这里开始有分歧了，如果要支持Https就按照下面的来输入，增加一个server,这里需要证书啊什么的都和上面的添加主机有关系。

这里不选用https的原因是因为我还想同时再开一个v2ray ws tls的代理，所以443不能给他反代用，同理如果这里挂了博客或者其他的，那就别用443 https了。

```
server
    {   
        listen 443 ssl http2;
        #listen [::]:443 ssl http2;
        server_name maps.你的域名.com;

        ssl_certificate /usr/local/nginx/conf/ssl/maps.your-domain.com/fullchain.cer;
        ssl_certificate_key /usr/local/nginx/conf/ssl/maps.your-domain.com/maps.your-domain.com.key;
        ssl_session_timeout 5m;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers "TLS13-AES-256-GCM-SHA384:TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256:TLS13-AES-128-CCM-8-SHA256:TLS13-AES-128-CCM-SHA256:EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5";
        ssl_session_cache builtin:1000 shared:SSL:10m;
        # openssl dhparam -out /usr/local/nginx/conf/ssl/dhparam.pem 2048
        ssl_dhparam /usr/local/nginx/conf/ssl/dhparam.pem;

        #error_page   404   /404.html;

        access_log  /home/wwwlogs/maps.your-domain.com.log;

        location /maps/ {

            #MIME TYPE
            default_type text/javascript;

            proxy_set_header Accept-Encoding '';

            proxy_pass https://maps.googleapis.com/maps/;

            replace_filter_max_buffered_size 500k;
            replace_filter_last_modified keep;
            replace_filter_types  text/javascript application/javascript;

            include vhost/replace_cn.txt;
        }

        location /maps-api-v3/ {
            proxy_pass  https://maps.googleapis.com/maps-api-v3/;
        }

        include vhost/location_cn.txt;

    }
```

#### http

如果只是用http来反代，那就按照下面这个写

```
server
    {
        listen 80;
        #listen [::]:80;
        server_name 你的域名.com;
        index index.html index.htm index.php default.html default.htm default.php;
        root  /home/wwwroot/你的域名.com;

        access_log  /home/wwwlogs/你的域名.log;

        location /maps/ {

            #MIME TYPE
            default_type text/javascript;

            proxy_set_header Accept-Encoding '';
			# 这里注意是 http而不是https
            proxy_pass http://maps.googleapis.com/maps/;

            replace_filter_max_buffered_size 500k;
            replace_filter_last_modified keep;
            replace_filter_types  text/javascript application/javascript;

            include vhost/replace_cn.txt;
        }

        location /maps-api-v3/ {
            proxy_pass  http://maps.googleapis.com/maps-api-v3/;
        }

        include vhost/location_cn.txt;

    }
```

Nginx配置弄好了以后，继续添加配置指定的几个文件

```
vi location_cn.txt
```

这个文件基本不用改，内容如下

```
location /e173754b3b1bbd62a0be9c4afea73fdf/ { proxy_pass https://mts0.google.com/; }
location /ce60bcadc66cea58583ddd700f7d80be/ { proxy_pass https://mts1.google.com/; }
location /e6ff3de47e3134794d4442b83c841f20/ { proxy_pass https://khms0.google.com/; }
location /da42f38f94ce6ac80e2806122a7b1933/ { proxy_pass https://khms1.google.com/; }
location /7abac8c11716f6949e7b23f76e60fcd0/ { proxy_pass https://khms0.googleapis.com/; }
location /444c94a4157de3c06c435132eb2f1ac5/ { proxy_pass https://khms1.googleapis.com/; }
location /c7d52b85d86a06df50621e669557ea05/ { proxy_pass https://mts0.googleapis.com/; }
location /57cf283b871304a296c3bd8acde4cc22/ { proxy_pass https://mts1.googleapis.com/; }
location /3e0ae61058d4e7be83d222fb1f107310/ { proxy_pass https://maps.gstatic.com/; }
location /ae5102db1431e3fd01dc8336085d150f/ { proxy_pass https://csi.gstatic.com/; }
location /946eb25413c43b235b5806e999044125/ { proxy_pass https://maps.google.com/; }
location /dcd331573c0980eab6fe7346468e9974/ { proxy_pass https://gg.google.com/; }
location /0a68229ef53c18f5fc37f4106f09a6c9/ { proxy_pass https://khms.google.com/; }
location /e55bb777699a599b09d3011043439a06/ { proxy_pass https://earthbuilder.googleapis.com/; }
location /471b015572d3907c09789af41061e964/ { proxy_pass https://mts.googleapis.com/; }
location /3a4544842f4e8e90a152257489cb594d/ { proxy_pass https://static.panoramio.com.storage.googleapis.com/; }
location /85471b91952baa51514c7fad7c57b8eb/ { proxy_pass https://lh3.ggpht.com/; }
location /44b3a55364b2f63e51f2c6e911f8506f/ { proxy_pass https://lh4.ggpht.com/; }
location /3cc4fbda8f98767ab275af32669f56d4/ { proxy_pass https://lh5.ggpht.com/; }
location /2815063fda2dd0ccf9c566d1f089d4bc/ { proxy_pass https://lh6.ggpht.com/; }
location /468724d08bce9811e989b526c6222863/ { proxy_pass https://www.google.com/; }
```

然后是反代域名映射，这里需要修改成你的域名

```
vi replace_cn.txt
```

这里注意一下原文还有一个mapsapis.your-domain.com ig; 和其他的不一样，原作者是区分了map和mapsapis，我这里不区分

```
replace_filter mts0.google.com maps.your-domain.com/e173754b3b1bbd62a0be9c4afea73fdf ig;
replace_filter mts1.google.com maps.your-domain.com/ce60bcadc66cea58583ddd700f7d80be ig;
replace_filter khms0.google.com maps.your-domain.com/e6ff3de47e3134794d4442b83c841f20 ig;
replace_filter khms1.google.com maps.your-domain.com/da42f38f94ce6ac80e2806122a7b1933 ig;
replace_filter khms0.googleapis.com maps.your-domain.com/7abac8c11716f6949e7b23f76e60fcd0 ig;
replace_filter khms1.googleapis.com maps.your-domain.com/444c94a4157de3c06c435132eb2f1ac5 ig;
replace_filter mts0.googleapis.com maps.your-domain.com/c7d52b85d86a06df50621e669557ea05 ig;
replace_filter mts1.googleapis.com maps.your-domain.com/57cf283b871304a296c3bd8acde4cc22 ig;
replace_filter maps.gstatic.com maps.your-domain.com/3e0ae61058d4e7be83d222fb1f107310 ig;
replace_filter csi.gstatic.com maps.your-domain.com/ae5102db1431e3fd01dc8336085d150f ig;
replace_filter maps.googleapis.com maps.your-domain.com ig;
replace_filter maps.google.com maps.your-domain.com/946eb25413c43b235b5806e999044125 ig;
replace_filter gg.google.com maps.your-domain.com/dcd331573c0980eab6fe7346468e9974 ig;
replace_filter www.google.com maps.your-domain.com/468724d08bce9811e989b526c6222863 ig;
replace_filter khms.google.com maps.your-domain.com/0a68229ef53c18f5fc37f4106f09a6c9 ig;
replace_filter earthbuilder.googleapis.com maps.your-domain.com/e55bb777699a599b09d3011043439a06 ig;
replace_filter mts.googleapis.com maps.your-domain.com/471b015572d3907c09789af41061e964 ig;
replace_filter static.panoramio.com.storage.googleapis.com maps.your-domain.com/3a4544842f4e8e90a152257489cb594d ig;
replace_filter lh3.ggpht.com maps.your-domain.com/85471b91952baa51514c7fad7c57b8eb ig;
replace_filter lh4.ggpht.com maps.your-domain.com/44b3a55364b2f63e51f2c6e911f8506f ig;
replace_filter lh5.ggpht.com maps.your-domain.com/3cc4fbda8f98767ab275af32669f56d4 ig;
replace_filter lh6.ggpht.com maps.your-domain.com/2815063fda2dd0ccf9c566d1f089d4bc ig;
```

然后就可以重启Nginx了，不过好像这里直接restart会出错，至少我这里一直报错,解决不了

```
systemctl restart nginx
```

然后直接把系统重启了一下，整个nginx就正常了，不知道是为什么。



然后就可以通过maps.your-domain.com代替原本的google.cn或者www.google.cn来完成对应的反代了。



#### 资源占用

- 1c
- 1g

基本够用了，虽然我是2g，不过实际使用起来内存占用都不够1g



## 其他反代

> https://jszbug.com/7801

以前有一个比较有名的反代，南阳 GDG ，就是ditu.google.cn,不过现在也都用不了了，会被谷歌直接重定向到首页了。



然后这个是一个佬的反代，偷偷发一下，试过了完全可用

```
https://maps.beeyun.cn/maps/api/js?key=YOUR_GOOGLEMAP_API&callback=initMap&sensor=false
```



这里好像有一个一键反代，看着比较简单

>  https://jszbug.com/7801



## Summary

基本就是这些，可能这个反代通过nginx还能再换个端口，不用443也不用80什么的，可能会更方便吧

## Quote

> https://www.aspirantzhang.com/network/googlemapsapi-proxy.html
>
> https://www.coderecord.cn/google-map-proxy.html

