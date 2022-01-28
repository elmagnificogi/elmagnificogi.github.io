---
layout:     post
title:      "继SMMS图床要求登陆后，使用sapic自建图床"
subtitle:   "typora，picgo，图床，更新docker"
date:       2022-01-20
update:     2022-01-28
author:     "elmagnifico"
header-img: "img/bg6.jpg"
catalog:    true
tags:
    - Typora
    - Picgo
    - 图床
---

## Forward

这几天写blog，发现图床突然就不能用了，找了半天原因，发现好像是smms必须要登陆了？然后Picgo更新以后，我忘记使用自己token来上传smms的图片了。

随便搜了一下发现一堆嘲讽smms的，讲道理有点离谱，我开始用smms的时候已经免费稳定运行了五六年了吧，到现在smms已经免费了10年？别人用爱发电还要嘲讽有点离谱了，且不说注册一下就能拿到Token了，又可以正常上传了。这个操作其实也挺好的，把这些非目标用户全都过滤出去，多数人都是临时图片或者是有问题的图片，还想占用别人免费的资源，就很离谱。

>https://hostloc.com/thread-959379-1-1.html
>
>https://hostloc.com/thread-960336-2-1.html
>
>https://www.v2ex.com/t/829201



SMMS也有他的问题，为了平衡，他得收费，而这就导致了网站的盈利点可能不够，所以免费存储的图片尺寸基本都是小的预览图，要看清得点进去，跳转以后，会有广告横幅，像牛皮癣一样，给人一种不好的感觉。

再加上最近SMMS的免费服务感觉也不太行了，经常打不开了，我的图又越来越多了，万一哪一天SMMS跑了，我的图就全没了，那也太悲伤了，所以自建图床还是有必要的。



## 腾讯云COS

类似阿里云OSS，或者又是什么*Serverless* 流图床，本质上都差不多，直接买现成的存储服务就行了。这种花钱就能解决问题，多数情况下每个月几块钱就能够完成图片存储的任务了，可靠性还比较高。不过我不是很喜欢，还是想图片啥的都在自己手上。

> https://zhuanlan.zhihu.com/p/119250383



## Chevereto

随便搜一下图床，Chevereto 一大堆，不过我仔细看了一下，它本身功能超级复杂，有免费版和授权版，免费的本身功能就够用了，不过是php开发的，我估计我想改有点麻烦，我就跳过了

> https://www.eula.club/VPS%E6%90%AD%E5%BB%BAChevereto%E7%A7%81%E6%9C%89%E5%9B%BE%E5%BA%8A.html



## sapic

sapic 是python开发的，星数也不多，用的人也不多，不过稍微看了看，需要修改的话，我自己就行了，就决定用这个了（坑了我好几次，果然人少的项目被review的少，不少地方出错了）。还有一个sapic支持视频上传，其实后面我想作为文件分发的话，也完全可以改改就能用了。

> https://github.com/sapicd/sapic
>
> https://sapic.rtfd.vip/zh_CN/latest/index.html#sapic

但总体来说可以一键部署，问题还是不大的。



## 安装

其他方式都不推荐了，直接docker-compose就完事了

```
cd sapic
docker-compose up -d
```

一般情况下直接就能正常启动了（我sb，安全组设置错了，debug了好久，还麻烦作者帮我debug）

要吐槽的就是作者给出来的docker-compose的整体流程是gif的，我还用ps打开一帧帧看的，非常唇笔。还好作者人好，邮件回复很及时。



**如果有安全组、防火墙，记得放行9514端口**，否则后续无法访问到，如果上了nginx，那么自己写一下，转发到9514端口。



如果修改了配置，记得加上build参数，重新编译一下，官方教程里的操作写错了，实际上并不能启动编译流程。

```
cd sapic
docker-compose down
docker-compose up -d -build
```



#### 更新docker

有可能遇到docker没更新，版本太老了,会出现如下提示，会导致docker-compose无法正常build

```
Error parsing reference: "python:3.7-slim AS build" is not a valid repository/tag: invalid reference format”
```

更新docker

```bash
# 删除所有docker 不会删除镜像
yum -y remove docker*
# 更新docker
curl -fsSL https://get.docker.com/ | sh
```

更新后，查看版本

```bash
# 启动docker
systemctl enable docker
systemctl start docker

docker -v
Docker version 20.10.12, build e91ed57
```



#### 创建管理员

虽然已经可以访问了，但是实际上系统默认不允许匿名上传，而且没有默认用户，要新建一个管理员，正确设置以后，会提示注册成功

```
cd sapic
docker-compose exec webapp flask sa create -u 管理员账号 -p 密码 --isAdmin
注册成功！
```



## 访问

非nginx的情况下，直接访问

```
http://xxx.xxx.xx.xx:9514
```

然后就能看到首页了，这个时候直接拖拽上传还不行，因为设置里不允许匿名上传图片。先用刚才的管理身份登陆

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/pGDVyMsQk3qAS5i.png)



#### api 访问

要使能，api访问，需要先建立一个token，进入到用户设置，然后个人资料里，创建token，保存

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/VwrqylinKtfHZhv.png)

再进入到用户设置里，添加LinkToken，都默认即可。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/w8l7XnVtgvpyINx.png)

两种方式可以访问，一种是token，相当于root密码级别，一个是LinkToken，相当于分权后的子用户。随便用哪个都行，但是某些地方支持LinkToken，所以LinkToken是必须的。



#### Picgo

想要配合Picgo，需要先安装插件 web-uploader

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/cjC92dS6YD4zxA1.png)

安装好了以后通过自定义图床接口来用，和以前还不支持SMMS的token一样。



##### token

使用token进行上传，配置如下

```
API地址: http[s]://你的sapic域名/api/upload

POST参数名: picbed

JSON路径: src

自定义请求头：留空即可

自定义Body: {"token": "你的token", "album": "test"}
```

- **注意官方教程里，写了请求头，实际上并没有任何用处，而且存在一点二义性，所以按照我的来写就行了**

- 官方教程里 "album" 漏了一个引号，导致如果你复制了，Picgo就会提示上传失败

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/Gbji5H2MkC7LZ3A.png)



##### LinkToken

使用LinkToken 就必须填请求头

```
API地址: http[s]://你的sapic域名/api/upload

POST参数名: picbed

JSON路径: src

自定义请求头：{"Authorization": "LinkToken 你的LinkToken"}

自定义Body: {"album": "相册名或留空"}
```

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/qmoTsl2Xfhc6OVe.png)



##### PicGo设置

建议修改一下PicGo的设置

把时间戳重命名打开，这样有助于某些图片的名称经常含义特殊字符会导致上传失败（说的就是你QQ截图）

![image-20220128162506114](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202201281625154.png)



#### Typora配合sapicli使用

前面半天折腾不好Picgo，于是转而使用同项目的sapicli来配合Typora使用



把图像上传服务切换成Custom Command ，然后命令如下

```
你的sapicli的存储路径\sapicli.exe -u http://你的服务器/api/upload -t 你的LinkToken -s typora file ${filepath}
```

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/K9aGV5tAJb3UgIY.png)



点击验证图片上传，就能看到类似的提示，说明服务可以用。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/YI5SxdGR9eTMBmZ.png)



## 内存占用

这里看到总体大概不超过200M内存就够了，还是非常不错的。

```
CONTAINER ID        NAME                CPU %               MEM USAGE / LIMIT     MEM %               NET I/O             BLOCK I/O           PIDS
f0ac0b6072c5        sapic_webapp_1      0.05%               193.2MiB / 22.57GiB   0.84%               18.7MB / 13MB       0B / 2.7MB          16
25c13fc42742        sapic_redis_1       0.08%               6.125MiB / 22.57GiB   0.03%               3.55MB / 3.16MB     0B / 2.05MB         6

```



## 替换脚本

由于以前图片都是上传到SMMS的，所以写了一个脚本用来批量查找以前的图片，还有一些非常规插入的图片。由于sapic支持直接上传url，所以blog里的图片都可以直接通过url上传，而不用把文件拉到本地，再上传，节省了一步。

由于sapic不会去区分同名称图片或者说同样的图片，这就导致这个脚本最好不要运行第二次，否则，图片直接重复第二遍就很蠢了。

```python
import os
import re
import requests

# use for find all pic in markdown doc and download or upload it

# first get all file
dir = r"E:\Github\elmagnificogi.github.io\_posts"
dir = r"E:\elmagnificogi.github.io\_posts"

# token
token = "xxxxxxxxx"

# sapic address
sapic_url = "img.xxx.xxx:9514"

def download(url):
    print ("download:"+url)
    header = {}
    r = requests.get(url, headers=header, stream=True)
    print(r.status_code)
    file_name = url.split("/")[-1]
    print("file:"+file_name)
    if r.status_code == 200:
        open('.\img\\'+file_name, 'wb').write(r.content)
        print("done")
    del r

def uploadByUrl(url):
    print ("upload:"+url)
    headers = {"Authorization": "LinkToken "+token}
    requests.post(
        "http://"+sapic_url+"/api/upload",
        data=dict(
            picbed=url
        ),
        headers=headers,
    ).json()

all_img_url = []

for file in os.listdir(dir):
    # show file name
    print(file)
    file_path = dir + "\\" + file
    f = open(file_path, encoding='utf-8')
    content = f.readlines()
    f.close()
    for line in content:
        new_line = line
        # print(line)
        if re.search(r'!\[(.*)\]\((.*)\)',line) != None:
            # # check some not in SM.MS pic
            # if "loli" in line:
            #     continue
            # else:
            #     print(line)
            # split imgs in one line
            line = line.strip()
            img_url = line.split("![")
            #print(line)
            for url in img_url:
                if url != "":
                    #print("!["+url)
                    #print(url)
                    #print(url.split("("))
                    real_url = (url.split("("))[1]
                    #print(real_url)
                    real_url = real_url.split(")")[0]
                    all_img_url.append(real_url)
                    print(real_url)
                    ##download(real_url)
                    uploadByUrl(real_url)
            continue
        elif re.search(r'<img src',line) != None:
            # check old img link
            print(line)
```

接着就是保留原格式不动的情况下，替换所有SMMS的链接。

```python
import os
import re
import requests

# use for replace old url

# first get all file
dir = r"E:\Github\elmagnificogi.github.io\_posts"
dir = r"E:\elmagnificogi.github.io\_posts"

# replace url
replace_url = "http://img.xxx.xxx:9514/static/upload/elmagnifico/"

all_img_url = []

for file in os.listdir(dir):
    # show file name
    print(file)
    file_path = dir + "\\" + file
    f = open(file_path, 'r', encoding='utf-8')
    content = f.readlines()
    f.close()

    lines = ""
    for line in content:
        new_line = ""
        # print(line)
        if re.search(r'!\[(.*)\]\((.*)\)',line) != None:
            print(line)
            pre = line.find("![")
            #print(line[0:pre])
            new_line += line[0:pre]

            line = line.strip()
            img_url = line.split("![")
            #print(img_url)
            find = False
            for url in img_url:
                if url != "":
                    #print("!["+url)
                    #print(url)
                    #print(url.split("("))
                    prefix = "![]("
                    real_url = (url.split("("))[1]
                    #print(real_url)
                    real_url = real_url.split(")")[0]
                    all_img_url.append(real_url)
                    #print(real_url)
                    file_name = real_url.split("/")[-1]
                    file_name_index = url.find(file_name)
                    new_line += prefix+replace_url+file_name+")"
                    print(new_line)
                    find = True
                else:
                    new_line+=url
            if find:
                new_line+="\n"
        elif re.search(r'<img src',line) != None:
            # check old img link
            new_line = line
            print(line)
        else:
            new_line = line

        lines+=new_line

    f = open(file_path, 'w', encoding='utf-8')
    f.write(lines)
    f.close()
```

两个脚本都运行完以后，我的blog所有图片就都替换完成了。



## Summary

剩下就是我把整个blog的图片全都dump下来，然后转存到了我自己的服务器上，以后就不依赖SMMS了。

现在看到的图片就都是在我自己图床上的图片了。



## Quote

> https://sapic.rtfd.vip/zh_CN/latest/usage.html
