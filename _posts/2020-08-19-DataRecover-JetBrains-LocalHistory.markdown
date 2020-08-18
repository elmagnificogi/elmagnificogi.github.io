---
layout:     post
title:      "JetBrains数据恢复"
subtitle:   "git，DataRecover"
date:       2020-08-19
author:     "elmagnifico"
header-img: "img/pen-head-bg.jpg"
catalog:    true
tags:
    - git
---

## Forward

记一次数据恢复，操作失误，误删了本地代码，而且没有备份，半个月的代码差点没了。



## 误删

我本地打包程序稍微改了一下，导致实际做Output文件夹清空操作出错了，然后给删了我上一级的文件夹（代码文件夹），关键是我还没发现执行了两次，才发现.git被删了。

```
del /s/q xxx/*.*
```

命令行中的删除，和平常的删除有所不同，不会进回收站，直接就抹除痕迹了

如果只是本地被删了，还没啥，但是我没push，云端没备份，直接雪崩，赶紧恢复。



## 恢复

- 不要继续删除或者在同目录或者附近目录操作文件
- 不要试图使用任何回收站或者老文件还原覆盖被删文件位置

先是用了数据恢复软件，确实恢复了一部分，但是关键文件.git并没有恢复，感觉是没有识别.git，好像认为这个是文件，实际上是个文件夹，连带其中的文件都没有恢复，而且恢复的数据中有很多重复的文件都是很久之前删除的，刚删的文件恢复的并不全，而且目录混乱了。

找了半天解决方案，并没有看到有啥好方法可以直接恢复del删除的文件



## JetBrains

直到我看到这个帖子，遇到的情况略有不同，但是下面这个老哥的一句话着实有用

> https://www.v2ex.com/t/662493

![image-20200818173205319.png](https://i.loli.net/2020/08/18/9ZLfFlx1Po6InCK.png)

竟然还有IDE缓存这么一说？？感觉没见过，先看看，因为默认的.idea文件也早没了，我根本没抱期望

第一次点开这个Local History，直接是灰色的，而且Show History 根本不能点。

![image-20200818174534503](https://i.loli.net/2020/08/18/92fW5SP8GjXkHlN.png)

由于当时是PyCharm还是处于被删重加载状态，导致这里默认路径有问题，切到工程文件指定文件夹以后，这个ShowHistory就出来了，我猜测是根据路径来缓存的，如果你连路径都删了，可以尝试重建路径，然后用IDE打开（但是这个违反了上面说的不要建立任何文件继续污染磁盘，这个操作可能会导致数据恢复遇到某些其他问题）

然后就能看到历史缓存的修改了，只要双击最近的这次，直接所有文件全部恢复！

![image-20200818175204123](https://i.loli.net/2020/08/18/HZDeqW4cOw89igb.png)



## Local History

JetBrains 设置Local History本意就是用来恢复某些情况下误删或者误操作导致的文件丢失，他本身可以维持30天的缓存，每次提交或者是修改文件，对应的文件记录都会缓存一份。我看到我这里最早是7月23号的代码，误删发生在8月18号，还是非常有用的。



有时候可能会check文件，然后发现好像check错了或者是check多了，这个时候其实可以通过Local History的修改记录来恢复，由于我现在都是用IDE里的Revert来check，所以对应的记录也会单独有一个tag，可以轻易找到，并恢复



当然他是基于本地的缓存，如果直接硬盘坏了，这种是无法抵抗的，还是要多备份，多push。

## 防止误删

这是一个小库，用来删除到回收站，这样还能轻松恢复

> https://pypi.org/project/Send2Trash/

也可以通过额外的cmd命令来完成，删除到回收站的目的，虽然是个20年前的程序，但是依然可以工作

> http://www.maddogsw.com/cmdutils/

这里注意一下要删除带空格的路径，需要转义一下路径，否则Recycle识别不了

```python
def del_file(path_data):
    for i in os.listdir(path_data) :
        file_data = path_data + "\\" + i
        print file_data
        if os.path.isfile(file_data) == True:
            os.system('Recycle.exe "'+ file_data+"\"")
            #os.remove(file_data)
        else:
            os.system('Recycle.exe "'+ file_data+"\"")
            #shutil.rmtree(file_data)
```



移动到$Recycle.Bin目录

由于windows目前是将删除的文件改名，然后索引连接到这个目录中，xp时代还可以直接看到对应的文件，但是现在好像不行了，实际里面的链接和删除的对不上，而且其含义也变了，所以这种操作方式基本不可能了。



## Summary

庆幸我当初选择了pycharm，没有继续使用vs作为python的开发IDE，否则我这次就凉凉了。

VS本身的Local History是基于git或者svn，如果其本身都不存在了，那这个工程立马就没了，恢复都没有地方恢复，那就难受了

所以平常linux下默认的rm等删除命令被重命名不是没道理，误操作害死人

## Quote

> https://www.v2ex.com/t/662493
>
> https://blog.csdn.net/qq892628217/article/details/100085830
>
> https://zhuanlan.zhihu.com/p/82085443
>
> https://stackoverflow.com/questions/3628517/how-can-i-move-file-into-recycle-bin-trash-on-different-platforms-using-pyqt4
>
> https://stackoverflow.com/questions/1646425/cmd-command-to-delete-files-and-put-them-into-recycle-bin

