---
layout:     post
title:      "SES使用Ozone调试FreeRTOS"
subtitle:   "STM32"
date:       2023-12-07
update:     2023-12-07
author:     "elmagnifico"
header-img: "img/bg9.jpg"
catalog:    true
tobecontinued: false
tags:
    - SES
    - Debug
    - FreeRTOS
---

## Foreword

Debug遇到一个诡异情况，之前没注意过



## 单步失效

简单说系统里有很多地方在read，但是debug的那个read，在进入read内部以后，会出现整个堆栈指针都跳变成另外一个线程中read流程

```c
ssize_t read(struct file *filep, void *buf, size_t nbytes)
{
  struct inode *inode;
  int ret = -EBADF;

  configASSERT(filep);
  inode = filep->f_inode;

  /* Was this file opened for read access? */
  if ((filep->f_oflags & O_RDOK) == 0)
  {
    /* No.. File is not read-able */
    ret = -EACCES;
  }

  /* Is a driver or mountpoint registered? If so, does it support the read
   * method?
   */
  else if (inode != NULL && inode->u.i_ops && inode->u.i_ops->read)
  {
    /* Yes.. then let it perform the read.  NOTE that for the case of the
     * mountpoint, we depend on the read methods being identical in
     * signature and position in the operations vtable.
     */
    ret = (int)inode->u.i_ops->read(filep, (char *)buf, (size_t)nbytes);
  }

  /* If an error occurred, set errno and return -1 (ERROR) */
  if (ret < 0)
  {
    set_errno(-ret);
    return ERR;
  }

  /* Otherwise, return the number of bytes read */
  return ret;
}
```

这种情况基本100%可以复现，单独去这个线程的实际read的接口处断点，完全没有问题，就是这个中间过程断不住。



#### 汇编断点

![image-20231207110951869](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071109921.png)

尝试使用汇编单步执行，中间过程可以比较容易的进入，但是不能用`step over`，用一次就必然跳变。



这种方式依然不够好，如果中间过程很复杂，免不了要跳很多，手动得累死个人。



#### 更换JLink

看了一下当前使用的JLink还是V9的老版本固件，刚好有闲置的新的V11JLink，更换以后依然停不住



## Ozone

尝试使用Ozone进行调试，毕竟SES单独把这个调试工具独立出来，总有些独到之处吧。



![image-20231207111354739](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071113785.png)

新建工程选择芯片，设置内部或者外部Flash即可



![image-20231207111407168](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071114212.png)

设置调试接口，选择调试设备



![image-20231207111417422](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071114462.png)

直接选择工程的`*.elf`文件，会自动关联到对应的代码文件位置各种变量，总体来说还是挺方便的



![image-20231207113026215](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071130261.png)

额外选项，默认就行了



![image-20231207113230428](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071132469.png)

如果使用了FreeRTOS，这里会出现插件提示，应用插件 fix-ups，这样有额外的FreeRTOS的调度栈显示

如果直接continue，那么单步失效的情况依然会复现，但是如果用了插件，那么情况就大为改观



#### FreeRTOS插件

![image-20231207113923582](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071139621.png)

有了插件以后，可以看到每个任务的情况，并且可以看到每个任务的调度栈具体在哪里了。



![image-20231207115217448](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071152503.png)

FreeRTOSPlugin这个目前看只写了CM4的支持，所以可能看到的信息有一些缺漏或者不准确的地方

而这个插件是JS的，官方也给了SDK，需要的话可以自行增加更多的功能

![image-20231207115830440](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071158497.png)

关闭调试以后会提示保存调试工程，存储以后可以看到一个jdebug的文件，打开就能看到这里加载的CM4，搜了一下官方是有CM7的支持的

![image-20231207120001900](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071200950.png)

所以直接改成CM7即可



## 单步问题

单步进不去的问题，实际上我通过关闭一些高级任务的运行或者提高debug任务的级别，是可以让他正常单步进去的，概率提高了很多，虽然偶尔也会出问题，但是这种方式不符合实际使用的情况。

Ozone+FreeRTOS插件实际上也不是完美的，偶尔还是会出现整个调度栈闪变的情况。



而这个单步问题，应该就是JLink断点，但是单步时出现了系统调度出让CPU，进而调度栈整个发生了变更，等到停下来已经在别的线程中了。有了FreeRTOS插件加持以后，等于知道了你当前断点是在这个线程的断点，而非全局的断点，从而可以正确停在此线程的中间过程。

猜想内部实现应该是类似断点加条件判断，识别出来是这个线程才断点的



## SES RTOS Awareness

![image-20231207155653708](https://img.elmagnifico.tech/static/upload/elmagnifico/202312071556751.png)

SES自己也能开启RTOS插件辅助

- 注意Task过多的情况下需要将25的默认值调高，方便调试

![image-20231207155557208](C:\Users\elmag\Pictures\2023120715535281.png)

但是实测了以后，发现某些任务是识别不到的，这里只有27个任务，但是Ozone那边识别到了54个任务，这也是为什么SES挺不住了，任务数两边不对等导致的

![image-20231207160154313](C:\Users\elmag\Pictures\202312071601347.png)

这个问题提交给官方了，看官方怎么处理吧



## Summary

稍微有点蛋疼



## Quote

> https://mcuoneclipse.com/2016/10/15/freertos-kernel-awareness-with-ozone/
