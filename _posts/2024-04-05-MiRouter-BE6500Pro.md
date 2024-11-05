---
layout:     post
title:      "BE6500Pro刷机开启SSH"
subtitle:   "1.0.46,固化,ShellClash,ShellCrash"
date:       2024-04-05
update:     2024-11-05
author:     "elmagnifico"
header-img: "img/bg8.jpg"
catalog:    true
tobecontinued: false
tags:
    - 米家
    - BE6500Pro
    - Router
---

## Foreword

小米的BE6500Pro想要安装自定义软件先需要解锁SSH，而要解锁SSH就需要刷一个老版本，解锁以后再升级到新版，然后就可以随便玩耍了

![image-20240405013927832](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050156763.png)

## 刷机

> https://www1.miwifi.com/miwifi_download.html

小米官方下载`小米路由器修复工具`，1.0.46版本的固件我上传到了我的github里`miwifi_rd08_firmware_076b5_1.0.46.bin`

> https://github.com/elmagnificogi/MyTools/tree/master/BE6500Pro



![image-20240405014508523](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050145553.png)

按照操作进入刷机，注意下面说的蓝灯对应6500的白灯，当白灯闪烁的时候就是已经刷好了，重启即可

![image-20240405013740338](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050144157.png)

重启以后又要重新初始化配置了（建议先拔掉WAN口网线）

> http://miwifi.com/init.html#/guide?isJc=1

![image-20240405014159213](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050141267.png)

配置好以后可以看到版本变成了`1.0.46`，注意此时不要升级，完成SSH固化以后再升级

![image-20240405014427729](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050144755.png)

## 打开SSH

![image-20240405015221016](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050152038.png)

打开管理页面，可以看到url中的`stok` ，用这个直替换下面stok的内容，然后命令行执行即可

```powershell
curl -X POST http://192.168.31.1/cgi-bin/luci/;stok=你的stok/api/misystem/arn_switch -d "open=1&model=1&level=%0Anvram%20set%20ssh_en%3D1%0A"
curl -X POST http://192.168.31.1/cgi-bin/luci/;stok=你的stok/api/misystem/arn_switch -d "open=1&model=1&level=%0Anvram%20commit%0A"
curl -X POST http://192.168.31.1/cgi-bin/luci/;stok=你的stok/api/misystem/arn_switch -d "open=1&model=1&level=%0Ased%20-i%20's%2Fchannel%3D.*%2Fchannel%3D%22debug%22%2Fg'%20%2Fetc%2Finit.d%2Fdropbear%0A"
curl -X POST http://192.168.31.1/cgi-bin/luci/;stok=你的stok/api/misystem/arn_switch -d "open=1&model=1&level=%0A%2Fetc%2Finit.d%2Fdropbear%20start%0A"
```

返回0说明开启成功

![image-20240405015424291](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050154325.png)

利用ssh连接，ssh地址是`192.168.31.1`，端口`22`，账号是`root`，密码是根据你的SN计算出来的，计算地址如下：

> https://www.gaicas.com/miwifi-ssh-key.html

输入计算后的密码就能连接了

![image-20240405015502680](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050155708.png)

OK，已经连上了



## 固化SSH

ssh中执行以下命令

```bash
nvram set ssh_en=1
nvram set telnet_en=1
nvram set uart_en=1
nvram set boot_wait=on
nvram commit
sed -i 's/channel=.*/channel="debug"/g' /etc/init.d/dropbear
/etc/init.d/dropbear restart
echo -e 'admin\nadmin' | passwd root
```

最后的admin是修改后的固化ssh密码，可以根据需要自定义



```bash
mkdir /data/auto_ssh && cd /data/auto_ssh
curl -O https://cdn.jsdelivr.net/gh/lemoeo/AX6S@main/auto_ssh.sh
chmod +x auto_ssh.sh
./auto_ssh.sh install
```

加一个自动开始ssh的脚本



```bash
zz=$(dd if=/dev/zero bs=1 count=2 2>/dev/null) ; printf '\xA5\x5A%c%c' $zz $zz | mtd write - crash

reboot
```

正式固化，这一段执行结果

![image-20240405020702325](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050207373.png)

系统重启以后用新密码重新连接ssh，再执行以下命令

```bash
nvram set ssh_en=1
nvram set telnet_en=1
nvram set uart_en=1
nvram set boot_wait=on
nvram commit
bdata set ssh_en=1
bdata set telnet_en=1
bdata set uart_en=1
bdata set boot_wait=on
bdata commit
reboot
```

再次重启，ssh重连，执行以下代码

```shell
mtd erase crash
reboot
```

重启完成以后，就算固化成功了



![image-20240405021603514.png](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20240405021603514.png)

现在就可以升级到最新版了，如果不小心出厂化了ssh密码会变回去，需要继续用sn计算，至于改密码就很简单了



## ShellClash/ShellCrash

现在开始安装一些额外的软件，由于Clash被墙，所以改名叫Crash了



```bash
sh -c "$(curl -kfsSl https://cdn.jsdelivr.net/gh/juewuy/ShellClash@master/install.sh)" && source /etc/profile &> /dev/nul
```

![image-20240405035536759](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050355791.png)

安装clash，选择data目录下安装

![image-20240405035946930](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050359969.png)

这里要注意他默认识别到的软固化功能选否0，不需要

![image-20240405040003018](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050400052.png)

由于小米这里文件上传有问题，所以使用vi 在tmp下自建一个config.yaml

订阅转换或者导入yml文件了，可以用我的转换来做，弄完以后导入进去

> https://sub.elmagnifico.tech/



这里有一个问题，yaml文件他这里不支持unicode，也就是说各种中文和表情符号什么的是不能用的，否则无法启动，会有类似的报错

- 提前在规则生成中去掉emoj和中文符号

![image-20240405040232154](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050402183.png)

最好不要用这种内置的转换或者来路不明的在线转换，鬼知道他把链接弄哪里去了，他还不支持订阅模式，后面的面板也不能修改，很难用。



安装Dashboard，~~选Yard面板~~，建议选Yacd-Meta魔改面板

- Yacd面板打开规则会崩溃

![image-20240405040041301](https://img.elmagnifico.tech/static/upload/elmagnifico/202404050400333.png)

Clash启动，面板地址

```
http://192.168.31.1:9999/ui
```



#### Fake-ip

由于路由里开启了fake-ip，可能会导致某些域名无法解析，这个时候需要手动加上这个部分ip

```bash
欢迎使用ShellCrash！		版本：1.9.1rc7
Clash服务正在运行（Redir模式），已设置开机启动！
当前内存占用：39.87 MB，已运行：1天01小时35分33秒
TG频道：https://t.me/ShellClash
-----------------------------------------------
 1 启动/重启服务
 2 内核功能设置
 3 停止内核服务
 4 内核启动设置
 5 配置自动任务
 6 导入配置文件
 7 内核进阶设置
 8 其他工具
 9 更新/卸载
-----------------------------------------------
 0 退出脚本
请输入对应数字 > 2
-----------------------------------------------
欢迎使用功能设置菜单：
-----------------------------------------------
 1 切换防火墙运行模式: 	Redir模式
 2 切换DNS运行模式：	fake-ip
 3 跳过本地证书验证：	未开启   ————解决节点证书验证错误
 4 只代理常用端口： 	已开启   ————用于过滤P2P流量
 5 过滤局域网设备：	未开启   ————使用黑/白名单进行过滤
 7 屏蔽QUIC流量:	未开启   ————优化视频性能
 9 管理Fake-ip过滤列表
-----------------------------------------------
 0 返回上级菜单 
-----------------------------------------------
请输入对应数字 > 9
-----------------------------------------------
用于解决Fake-ip模式下部分地址或应用无法连接的问题
脚本已经内置了大量地址，你只需要添加出现问题的地址！
示例：a.b.com
示例：*.b.com
示例：*.*.b.com
-----------------------------------------------
你还未添加Fake-ip过滤地址
-----------------------------------------------
输入数字直接移除对应地址，输入地址直接添加！
请输入数字或地址 > cp.elmagnifico.tech
你输入的地址是：cp.elmagnifico.tech
确认添加？(1/0) > 1
用于解决Fake-ip模式下部分地址或应用无法连接的问题
脚本已经内置了大量地址，你只需要添加出现问题的地址！
示例：a.b.com
示例：*.b.com
示例：*.*.b.com
-----------------------------------------------
已添加Fake-ip过滤地址：
1 cp.elmagnifico.tech
-----------------------------------------------
输入数字直接移除对应地址，输入地址直接添加！
请输入数字或地址 > cs.elmagnifico.tech
你输入的地址是：cs.elmagnifico.tech
确认添加？(1/0) > 1
用于解决Fake-ip模式下部分地址或应用无法连接的问题
脚本已经内置了大量地址，你只需要添加出现问题的地址！
示例：a.b.com
示例：*.b.com
示例：*.*.b.com
-----------------------------------------------
已添加Fake-ip过滤地址：
1 cp.elmagnifico.tech
2 cs.elmagnifico.tech
```

这样就能解决一些ip无法ping通，比如节点的ip在开了fake-ip以后完全不能ping通



## Summary

教程主要参考草东的，草东的这个Blog是真的好，各种小链接可以直接弹起来，不需要额外跳转



## Quote

> https://www.gaicas.com/xiaomi-be6500-pro.html
