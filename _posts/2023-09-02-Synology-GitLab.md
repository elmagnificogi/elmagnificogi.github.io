---
layout:     post
title:      "群晖6.2.4 安装GitLab"
subtitle:   "DS918+，Git，Docker，DSM6"
date:       2023-09-02
update:     2023-09-02
author:     "elmagnifico"
header-img: "img/y9.jpg"
catalog:    true
tobecontinued: true
tags:
    - GitLab
    - Synology
---

## Foreword

折腾一下群晖，上一次折腾已经是2020年了。



## 硬件升级

#### 硬盘扩容

最初没考虑那么多，使用的是RAID1，两个4T盘，实际可用比4T小一点，一直也没用满。

由于后续有大量视频素材存储，所以这点内容完全不够看了，需要扩容。组了4张8T盘，打算切换成RAID5。

DS918+只有4盘位，所以实际操作是先插入2个8T盘，进行扩容。

![image-20230902160342634](https://img.elmagnifico.tech/static/upload/elmagnifico/202309021603721.png)

群晖本身早就考虑到了扩容和各种替换盘的情况，自带的帮助中都有各种情况的说明，第一步就是插入2个8T，扩容，然后将当前的盘从RAID0转换到RAID5。

这个大概花了一两个小时就完成了。

![image-20230902160410115](https://img.elmagnifico.tech/static/upload/elmagnifico/202309021604190.png)

接着就是抽掉一个4T盘，插入一个新8T，进系统以后会提示修复，修复即可。这个时间非常长，大概要2天的样子，如果数据多估计就要更久了。

最后就是再抽掉一个4T盘，插入最后一个8T，继续修复。

以上每步操作都是在正常关机以后再替换的，防止出现意外

![image-20230902160547131](https://img.elmagnifico.tech/static/upload/elmagnifico/202309021605171.png)

完成以后RAID5的情况下，32T就变成了实际21T可用。



#### 内存扩容

默认情况下DS918+只支持8G内存，最初配置的时候就已经满配了，看了一下如果跑个GitLab就需要4G，如果再跑个Docker什么的，会需要更多内存。

查了一下发现不少人直接扩大到了16G，甚至32G内存，而且也能正常使用，搜了一下目前DDR3的笔记本内存单挑16G很难买，价格也很离谱，能想到的最好就是升级到16G

![image-20230902161116844](https://img.elmagnifico.tech/static/upload/elmagnifico/202309021611876.png)

#### SSD缓存扩容

群晖的SSD缓存需要上两块SSD才能完成读写加速，否则效果非常一般。现在SSD和内存都很便宜，刚好随手升级一下。

![image-20230902161243235](https://img.elmagnifico.tech/static/upload/elmagnifico/202309021612278.png)



## GitLab

#### 默认套件

一般来说NAS上搭建GitLab都是用的Docker，这样可以用到最新版的GitLab，群晖自己的套件中心的GitLab版本有点老，`13.12.2`这个大概是21年的GitLab了

![image-20230902161904676](https://img.elmagnifico.tech/static/upload/elmagnifico/202309021619723.png)

> https://about.gitlab.com/releases/2021/06/01/security-release-gitlab-13-12-2-released/



如果真的安装这个GitLab，实际上还是通过Docker安装的，既然如此那为什么不安装最新的呢

![image-20230902161948496](https://img.elmagnifico.tech/static/upload/elmagnifico/202309021619544.png)



开放端口

![image-20230902162237916](https://img.elmagnifico.tech/static/upload/elmagnifico/202309021622962.png)

安装完成以后打开就是这样了

![image-20230902170721563](https://img.elmagnifico.tech/static/upload/elmagnifico/202309021707602.png)



#### Docker最新版



## Summary

未完待续



## Quote

> https://tieba.baidu.com/p/6321911736
>
> https://post.smzdm.com/p/and2g692/