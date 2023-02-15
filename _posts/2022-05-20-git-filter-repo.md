---
layout:     post
title:      "Git仓库移除关键信息"
subtitle:   "git-filter-repo,BFG Repo-Cleaner"
date:       2022-05-20
update:     2022-05-20
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.jpg"
catalog:    true
tags:
    - Git
    - Embedded
---

## Foreword

经常看到别人git仓库泄露了什么数据库密码，关键Token，服务器密码什么的，但是也没看到具体说明是怎么处理的。

我之前也只是天真的以为`rebase`或者`amend`之类的操作就行了，实际上完全不是。

需要用一下第三方工具来完成批量处理



## git-filter-repo

> https://github.com/newren/git-filter-repo

依赖

```
git >= 2.22.0 at a minimum; some features require git >= 2.24.0
python3 >= 3.5
```

安装

```
git clone https://github.com/newren/git-filter-repo.git
cd git-filter-repo/
sudo cp git-filter-repo /usr/local/bin
```

批量修改例子

```
# 将master分支的最近 2 个提交的邮箱后缀由alibaba-inc.com改为example.com
git-filter-repo --email-callback 'return email.replace(b"alibaba-inc.com", b"example.com")' --force  --refs master~2..master

# 修改当前分支全部commit 的邮箱信息
git-filter-repo --email-callback 'return email.replace(b"alibaba-inc.com", b"example.com")' --force  --refs master

# master 分支最近 1 个 message 中的“3”改为”hi”
git-filter-repo --message-callback 'return message.replace(b"3", b"hi")' --force  --refs master~1..master

# master 分支最近 1 次提交 message 之前加上"bugfix: "
git-filter-repo  --message-callback '
    message=b"bugfix: " + message
    return message
' --refs master~1..master --force


```

可以看到通过`git-filter-repo`可以快速修改一些commit相关信息。需要注意的是一旦commit信息修改了，会导致`commit id`也变了，如果有业务流程与此相关，需要谨慎修改。



## filter-branch

git本身也内置了一个工具`filter-branch `，但是据说效率比较差，用还是能用的

```
# 重写提交时间等于指定时间戳的历史 
git filter-branch -f --commit-filter '
        if [ "$GIT_COMMITTER_DATE" = "@1582736444 +0800" ];
        then
                GIT_COMMITTER_NAME="saber666";
                GIT_AUTHOR_NAME="$GIT_COMMITTER_NAME";
                GIT_COMMITTER_EMAIL="saber@qq.com";
                GIT_AUTHOR_EMAIL="$GIT_COMMITTER_EMAIL"
                git commit-tree "$@";
        else
                git commit-tree "$@";
        fi' HEAD
```



## 拆分仓库

- **注意要使用刚刚clone下来的库做，不要在原始库上操作，容易无法挽回**

一样还是用`git-filter-repo`来完成

有如下的仓库，现在要把server和webapp拆开，并且可以保留原本的历史记录

```
# 在老库O中
server/
   foo.c
   bar.c
webapp/
   app.js
   index.html
```



执行下面的命令拆分仓库

```
# 在新库A中，自动删除了server相关
git-filter-repo --path 'webapp/'
webapp/
   app.js
   index.html

# 通过这里修改根目录
git-filter-repo --subdirectory-filter webapp/


# 在新库B中，自动删除了webapp相关
git-filter-repo --path 'server/'
server/
   foo.c
   bar.c
   
# 通过这里修改根目录
git-filter-repo --subdirectory-filter server/
```



## 删除某个文件的全部历史

某个文件不应该加入git，或者说这个文件应该被重新提交，抹除关键信息

```
git-filter-repo --invert-paths --path 'keyinfo.c' --use-base-name
```

需要注意这里的 `--path`已经是指当前仓库的目录下了，不需要`./`之类的指示相对路径了

- 如果提示不是fresh clone 加上 --force 参数即可

当删除完成以后，就能看到实际上相关被修改了的分支

![image-20220520120218191](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220520120218191.png)

当执行了这个操作以后，会自动抹除当前仓库的远程连接，所以接下来需要重新连接到远程，并且强制推送即可。

（这个执行修改的仓库，永远会显示`replace`的提示，并且基本git功能可能提示不太对，建议修改完以后直接抛弃了这个修改的仓库，gitk看起来非常难受）

然后在新仓库或者新clone的代码中就不会看到`replace`的提示了

![image-20220520121243894](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220520121243894.png)

## BFG Repo-Cleaner

> https://rtyley.github.io/bfg-repo-cleaner/

BFG Repo-Cleaner 也是个类似的工具，用来批量处理仓库commit

```
# 删除关键文件
bfg --delete-files YOUR-FILE-WITH-SENSITIVE-DATA

# 替换关键文件
bfg --replace-text passwords.txt
```



## Summary

简单说删除关键信息的文件，然后再重新加上这个文件就行了。如果想要之前的不受影响，建议回退到非常老的版本，重新修改那个commit，添加回这个文件即可。这样就算回退了，依然可以正常编译。



## Quote

> https://help.aliyun.com/document_detail/206833.html
>
> https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
>
> https://lequ7.com/guan-yu-git-li-yong-gitfilterrepo-wu-feng-qian-yi-git-xiang-mu.html
