---
layout:     post
title:      "Caddy平替Nginx，简单入门"
subtitle:   "reverse_proxy"
date:       2023-03-02
update:     2023-03-02
author:     "elmagnifico"
header-img: "img/balance.jpg"
catalog:    true
tags:
    - Caddy
---

## Foreword

Nginx的配置比较复杂，每次都查半天，也不能自动申请https证书，稍微有点不方便，于是使用Caddy平替了Nginx，把图床、blog、ttrss都直接升级到了https了，这样以后省的我的分站是https，而主站还留在http，有些人拉取rss是从分站拉的，会直接报错。



## Caddy

Caddy大部分配置可以从官方直接看到，就是官方的例子给的比较少，需要每次试一下

> https://caddyserver.com/docs/caddyfile



```nginx
v2ray代理域名 {
    # 反代我的github的分站
    reverse_proxy github.elmagnifico.tech {
        header_up Host {upstream_hostport}
        header_up X-Forwarded-Host {host}
    }
    handle_path /代理路径 {
		# 这里是反代v2ray本地端口
        reverse_proxy 127.0.0.1:55304
    }
}

elmagnifico.tech {
    # 使用nginx的路径，但是确是caddy，🐂他
    root * /usr/share/nginx/html
    file_server
    # 如果不处理错误，会导致404页面不生效，还是默认的浏览器404
    handle_errors {
      rewrite * /404.html
      file_server
    }
}

img.elmagnifico.tech {
    # 反代图床
    reverse_proxy 127.0.0.1:9514 {
      # 这里是用来替换传递进去的域名和端口以及协议，好像不写是默认替换的，也没问题
      header_up Host {host}
      header_up X-Real-IP {remote}
      header_up X-Forwarded-For {remote}
      header_up X-Forwarded-Proto {scheme}
    }
    # 图床文件比较大，把响应体设大一点
    request_body {
      max_size 20MB
    }
}

ttrss.elmagnifico.tech {
	# 反代我的ttrss
    reverse_proxy 127.0.0.1:181
}
```



如果某部分需要log，只需要加入对应的log就行了，方便查问题

```nginx
    log {
         output file /var/log/caddy_access.log 
           roll_size 1gb
           roll_uncompressed
        }
    }
```



同比使用nginx要配置一堆东西，写起来也复杂

```nginx
# For more information on configuration, see:
#   * Official English Documentation: http://nginx.org/en/docs/
#   * Official Russian Documentation: http://nginx.org/ru/docs/

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.
include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    # Load modular configuration files from the /etc/nginx/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include
    # for more information.
    include /etc/nginx/conf.d/*.conf;

    server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  v2ray代理域名;
        root         /usr/share/nginx/html;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        location / {
        }

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }

# Settings for a TLS enabled server.
#
    server {
        listen       443 ssl http2 default_server;
        listen       [::]:443 ssl http2 default_server;
        server_name  v2ray.elmagnifico.tech;
        root         /usr/share/nginx/html;

        ssl_certificate "/etc/letsencrypt/live/v2ray代理域名/fullchain.pem";
        ssl_certificate_key "/etc/letsencrypt/live/v2ray代理域名/privkey.pem";
        ssl_session_cache shared:SSL:1m;
        ssl_session_timeout  10m;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        location /v2ray {
        proxy_redirect off;
        proxy_pass http://127.0.0.1:43968;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        }

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }

}
```



## Summary

多数服务可能给的都是Nginx的配置，要转成Caddy可能需要查一下对应的命令是什么，但是总体上大差不差，很相似。

只是轻量使用和不用担心SSL证书，那么用Caddy绝对足够了，省心方便。



## Quote

> https://ma.ttias.be/set-up-custom-404-page-static-sites-caddy/
>
> https://caddyserver.com/docs/caddyfile/directives/handle_errors
>
> https://stackoverflow.com/questions/69265440/how-to-configure-web-server-caddy-to-a-return-404-error
>
> https://stackoverflow.com/questions/72413710/return-custom-404-response-if-caddy-reverse-proxy-returns-404
>
> https://zhuanlan.zhihu.com/p/407133025
