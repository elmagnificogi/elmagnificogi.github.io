---
layout:     post
title:      "VPS上使用nginx搭建Jekyll blog（转移github博客）"
subtitle:   "rvm，git pages"
date:       2020-08-06
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - blog
    - VPS
    - Jekyll
---

## Foreword

github的blog还是太慢了，现在这个腾讯云也够，就转移到这边来，同时github这里也留着备份，重新分给他一个子域名好了。现在就要在VPS上搭建jekyll，并且能让他自动更新，像github一样push以后自动更新部署。

## 搭建Jekyll环境

默认安装get，但是这样不行，版本太老了

```bash
yum install ruby
yum install gem

ruby -v
ruby 2.0.0p648 (2015-12-16) [x86_64-linux]
gem -v
2.0.14.1
```

#### RVM

所以这里通过RVM来安装ruby环境

首先安装RVM，然后通过RVM安装ruby

```bash
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
curl -sSL https://get.rvm.io | bash -s stable
source /etc/profile.d/rvm.sh
```

装完以后再看一下版本

```bash
rvm -v
rvm 1.29.10 (latest) by Michal Papis, Piotr Kuczynski, Wayne E. Seguin [https://rvm.io]
```

选择安装ruby版本，可以看到版本号跟上了

```bash
rvm install 2.7
ruby -v
ruby 2.7.0p0 (2019-12-25 revision 647ee6f091) [x86_64-linux]
gem -v
3.1.2
```

更新gem

```bash
gem update --system
```

#### 安装jekyll

尝试安装 jekyll，大概率会出现找不到库

```bash
gem install jekyll bundler
ERROR:  Could not find a valid gem 'jekyll' (>= 0) in any repository
```

修改源

```bash
查看所有源
gem sources -l
删掉所有源
gem rem --remove http://rubygems.org/
只用ruby-china的这个源，就能正常安装，其他好多源都失效了
gem rem --add https://gems.ruby-china.com/
```

再次安装，应该能正常装上了。

```bash
jekyll -v
jekyll 4.1.1
```

如果找不到jeky命令，首先查找ruby/bin的目录,可以看到一堆地址找到对应的bin所在目录

```bash
gem env
从上面的回显中寻找bin目录，添加到path目录
export PATH=${PATH}:/usr/local/rvm/gems/ruby-2.7.0/bin
```

## 编译部署Jekyll

首先找到nginx的配置文件，然后修改查看

```bash
nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
vi /etc/nginx/nginx.conf
```

一般都能看到对应的nginx的index目录是：/usr/share/nginx/html

```bash
server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  xxx.xxx.xxx;
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

```

那么就需要编译部署到这个文件夹或者修改为自己的也行

```bash
jekyll build --source /root/elmagnificogi.github.io --destination /usr/share/nginx/html --incremental
```

这样以后就可以，直接通过ip或者域名访问到对应的主页了

#### 报错

由于好久没有更新blog了，导致以前黄玄的语法存在错误，进而导致编译的时候出现了一些err，类似这样的:

```bash
    Liquid Warning: Liquid syntax error (line 126): Unexpected character { in "tag[1].size > {{site.featured-condition-size}}" in /root/elmagnificogi.github.io/_layouts/post.html
    Liquid Warning: Liquid syntax error (line 87): Unexpected character { in "tag[1].size > {{site.featured-condition-size}}" in /root/elmagnificogi.github.io/_layouts/page.html
    Liquid Warning: Liquid syntax error (line 38): Unexpected character { in "tag[1].size > {{site.featured-condition-size}}" in /root/elmagnificogi.github.io/_layouts/page.html
```

如果无视这个错误会导致主页的文章content显示不出来，点进去正常，只有主页显示不正常。

其实是版本更新了语法变了,需要修改一下语法

{% raw %}
```bash
{% if tag[1].size > {{site.featured-condition-size}} %}
修改为：
{% if tag[1].size > site.featured-condition-size %}
```
{% endraw %}

然后重新编译部署一下，就全都正常了

## 自动化部署

要类似github就得自动检测最新的更新，然后对应部署下来

检测更新可以用crontab配合脚本来完成

```bash
SHELL=/bin/bash
BASH_ENV=/root/.bashrc

*/1 * * * * /root/elmagnificogi.github.io/deploy.sh  >> /root/cronblogpull.log

```

首先前面的这两个必需要有，而且.bashrc里必须是已经添加了rvm环境的，否则脚本中的jekyll永远无法执行成功（因为缺少rvm环境）

具体更新脚本：只有在检测到全部更新才会重编译

```
#! /bin/bash

result=$(cd /root/elmagnificogi.github.io && git pull origin master | grep "Already up-to-date" )
if [[ "$result" != "" ]]
then
  exit 0
else
  echo "`date '+%Y%m%d %H:%M'`: post update,start build"
  result=$(jekyll build --source /root/elmagnificogi.github.io --destination /usr/share/nginx/html)
  echo $result
  echo "`date '+%Y%m%d %H:%M'`: build over"
fi
```

有些人推荐使用使用watch命令让jekyll监控变更，自动更新，类似如下，或者增加一个增量式更新

```
jekyll build --source /root/elmagnificogi.github.io --destination /usr/share/nginx/html --incremental --watch&
```
但是这个东西在我这里有问题，首先增量式更新只更新post，而不更新index等静态页面，这就导致我主页一直不会刷新，而文章增加了，这就导致这个watch完全没用了，我需要的是完全重新编译那种，所以建议用watch的时候不要增量

```
jekyll build --source /root/elmagnificogi.github.io --destination /usr/share/nginx/html --watch&
```

## Summary

自动化部署还有更好的方法，比如用git action，就可以完美更新，而不是靠crontab来轮询，后面研究清楚以后会更新到git action

## Quote

> https://jekyllrb.com/docs/
> https://zhuanlan.zhihu.com/p/141578820
> https://www.cnblogs.com/tonyY/p/12150589.html
>
> http://rvm.io/integration/cron
>
> https://stackoverflow.com/questions/19181789/cron-wont-execute-ruby-script
>
> https://stackoverflow.com/questions/20366718/crontab-not-running-ruby-script
>
> https://www.cnblogs.com/nima/p/11751469.html

