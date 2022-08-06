---
layout:     post
title:      "小米电视移除广告"
subtitle:   "xiaomi,55,ad,adb"
date:       2022-07-17
update:     2022-07-17
author:     "elmagnifico"
header-img: "img/z0.jpg"
catalog:    true
tags:
    - xiaomi
    - Equip
---

## Forward

最近弄了一个小米电视L55M5-AZ，小米电视4c，2017款，距今已有5年左右了，基本是砍到接近底价了650。这个价格还能要啥自行车，能亮没大问题就不错了，最差当个显示器用也很ok。



至于为什么不买最新的，目前最新的就是小米和红米的电视55寸，价格都在1200-1700左右，这都是最廉价的版本了，可是硬件竟然不支持5G WIFI，不知道为什么会把这个阉割掉了，而2.4GWIFI的干扰严重，就不用说了。反观老版的小米电视，倒是都带了5G，2022开倒车，真有你的。



考虑了一下对应的投影和激光电视，投影1500左右的价格只能做到1080p，而且还是老机器，机体也比较大，同时带来严重的噪音，需要安装位置，可能还需要投影布，效果一般般，反而不如换个电视。小米激光电视最低砍到过3000，还是国外版的，只是一样的问题都是显示效果可能并不如人意。1500完全可以找一个非常新的65寸4k级别的电视了，3000甚至可以上75寸的电视了，显示效果不比激光或者投影强多了吗。



各种屏幕尺寸，60寸是能塞进普通小汽车的最大尺寸了，不过60寸的电视比较少，不好找，再大就不好塞了，最后选了55寸的大小。

​     79.8厘米长，宽约      34.2厘米   34寸-带鱼屏

​     96.5厘米长，宽约         54厘米    43寸-电视

121.76厘米长，宽约    68.49厘米    55寸-电视

​     132厘米长，宽约          74厘米    60寸电视

143.90厘米长，宽约    80.94厘米    65寸-电视

​     181厘米长，宽约        111厘米    80寸-电视

 221.37厘米长，宽约 124.52厘米  100寸-电视



## 参数

![image-20220717142456125](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207171424366.png)

型号：L55M5-AZ

CMIIT ID：2017AP0706

WIFI：2.4G和5.8G全支持，协议支持到n，ac不支持

内存：2G

闪存：8G

五十五寸，4k屏幕，支持红外遥控和蓝牙遥控



## 问题

屏幕没有大问题，只有边角的像素稍微有点抖动，没有坏点，可能是屏幕本身边缘控制就不行



![image-20220717142054560](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207171420596.png)

小米电视的红外通病，时间长了红外接收器基本都挂了，所以刚开始弄了个红外遥控，没想到完全控不了，卖家从一开始就说遥控丢了，实际上是知道红外遥控控不了，不愿意补蓝牙遥控。**建议买的时候只要可以蓝牙的，都建议买个蓝牙遥控**



产品设计问题：没有蓝牙、红外遥控的时候，如果机器不能连到互联网就无法控制，物理按键只能切换源、声音、关机，其他的一概不行，这个设计非常弱智，相当于是说没遥控，这机器就废了一大半。

不知道为什么，不能把手机设备改成BLE控制器，进而可以当作遥控使用，小米的手机基本都是可以魔改成HID BLE控制器的，官方支持一下就可以了，这样非联网的情况下就能直接遥控了，不好嘛。



联网设计问题：通过插网线，可以实现联网，进而通过手机APP`小米电视助手`来网络遥控电视，但是此时进入设置，无法设置WiFi，而断了有线连接，又不能通过手机遥控，这就成了一个死循环。不知道产品是怎么设计的。



WIFI问题：虽然支持5.8G，但是实测网卡只能跑到100Mbps，无法更快，还是有点菜。



## 去广告

小米电视各种去广告大法



#### 路由屏蔽

这种方法是最简单的

```
ad.mi.com
ad.xiaomi.com
```

还有开源的仓库在更新广告的部分，但是这里面有一些不合理，比如直接把米家屏蔽没了，小米的应用商店直接屏蔽没了，完全不能用了。

> https://github.com/liamliu108/miTVhosts/blob/master/hosts



所以我稍微修改了一下，把一些正常会用到的去掉了，用来给路由器的广告屏蔽刚刚好

```
gvod.aiseejapp.atianqi.com
stat.pandora.xiaomi.com
upgrade.mishop.pandora.xiaomi.com
logonext.tv.kuyun.com
config.kuyun.com
dvb.pandora.xiaomi.com
api.ad.xiaomi.com
de.pandora.xiaomi.com
data.mistat.xiaomi.com
jellyfish.pandora.xiaomi.com
gallery.pandora.xiaomi.com
o2o.api.xiaomi.com
bss.pandora.xiaomi.com
ad.mi.com
ad.xiaomi.com
ad.hpplay.cn
ad.mi.com
ad.xiaomi.com
ad1.xiaomi.com
adc.hpplay.cn
adcdn.hpplay.cn
adeng.hpplay.cn
api.ad.xiaomi.com
api.hpplay.com.cn
appstore.cdn.pandora.xiaomi.com
appstore.pandora.xiaomi.com
b.netcheck.gallery.pandora.xiaomi.com
broker.mqtt.pandora.xiaomi.com
bss.pandora.xiaomi.com
cdn.hpplay.com.cn
cdn1.hpplay.cn
cloud.hpplay.cn
conf.hpplay.cn
config.kuyun.com
data.mistat.xiaomi.com
de.pandora.xiaomi.com
devicemgr.hpplay.cn
dvb.pandora.xiaomi.com
file.xmpush.xiaomi.com
fix.hpplay.cn
ftp.hpplay.com.cn
g.dtv.cn.miaozhan.com
gallery.pandora.xiaomi.com
gslb.hpplay.cn
gvod.aiseejapp.atianqi.com
h5.hpplay.com.cn
hotupgrade.hpplay.cn
hpplay.cdn.cibn.cc
hub5btmain.sandai.net
hub5emu.sandai.net
image.hpplay.cn
imdns.hpplay.cn
jellyfish.pandora.xiaomi.com
leboapi.hpplay.com.cn
logonext.tv.kuyun.com
metok.sys.miui.com
milink.pandora.xiaomi.com
misc.pandora.xiaomi.com
mitv.tracking.miui.com
new.api.ad.xiaomi.com
osfota.cdn.aliyun.com
osupdateservice.yunos.com
pandora.mi.com
pin.hpplay.cn
r.browser.miui.com
redirect.pandora.xiaomi.com
register.xmpush.xiaomi.com
resolver.msg.xiaomi.net
rp.hpplay.cn
rp.hpplay.com.cn
rps.hpplay.cn
sdkauth.hpplay.cn
sdkconfig.ad.xiaomi.com
sl.hpplay.cn
staging.ai.api.xiaomi.com
stat.pandora.xiaomi.com
t7z.cupid.ptqy.gitv.tv
tat.pandora.xiaomi.com
tracking.miui.com
tv.weixin.pandora.xiaomi.com
tvapp.hpplay.cn
tvmanager.pandora.xiaomi.com
tvmgr.pandora.xiaomi.com
upgrade.xl9.xunlei.com
userapi.hpplay.com.cn
v.admaster.com.cn
vipauth.hpplay.cn
vipsdkauth.hpplay.cn
ad.doubleclick.net
admaster.com.cn
adv.sec.miui.com
alert.kuyun.com
alog.umeng.com
api.cupid.ptqy.gitv.tv
assistant.pandora.xiaomi.com
auth.api.gitv.tv
cdn.ad.xiaomi.com
d1.xiaomi.com
e.ad.xiaomi.com
misc.in.duokanbox.com
o2o.api.xiaomi.com
omgmta.play.aiseet.atianqi.com
ota.cdn.pandora.xiaomi.com
package.box.xiaomi.com
package.cdn.pandora.xiaomi.com
secure-chn.imrworldwide.com
ssp.ad.xiaomi.com
starfish.pandora.xiaomi.com
test.ad.xiaomi.com
test.new.api.ad.xiaomi.com
tv.aiseet.atianqi.com
tvapi.kuyun.com
vv.play.aiseet.atianqi.com
```



而如果可以的话，直接给电视设置一个全局过滤，黑名单加上上面的域名，简直完美

![image-20220717132600501](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207171326570.png)



#### adb

通过adb远程连接，直接删除对应的系统包完成去广告操作。

直接下载我的工具包文件夹

> https://github.com/elmagnificogi/MyTools/tree/master/xiaomiTV



- 电视需要开启开发模式，打开设置-关于-产品型号，对着产品型号连点七次，开发模式就开启了
- 账号与安全开启adb调试和未知应用安装权限（如果需要安装的话）
- 看一下网络设置中，电视IP是多少，用于adb远程连接



手动连接的话就是这样了

```
adb connect 192.168.1.182
```

如果提示这个，说明adb调试权限没打开

```
failed to connect to 192.168.1.182:5555
```

连接的时候，电视会提示对应的adb调试允许，需要手动选择允许

连接上了以后没有任何提示的，直接进行一下步删除或者安装操作即可



看了好几个帖子，要么是太老了，要么是有点夹带私货，说的并不正确，去广告非常简单

```bash
adb shell pm uninstall --user 0 com.xiaomi.mitv.tvpush.tvpushservice

adb shell pm uninstall --user 0 com.xiaomi.mitv.advertise

adb shell pm uninstall --user 0 com.miui.systemAdSolution
```

只需要去掉这3个包即可，如果电视更新了，有可能会装回来，不过都5年的老电视了，系统还更新的概率非常低了，所以基本可以忽略了。

至于说开机的时候系统会自动安装回来，至少现在不会了。



或者使用一键脚本，完成删除广告和没用的APP的操作

```bash
@echo off
cd /d "%~dp0"
echo 温馨提示：若电视执行脚本后异常，恢复方法“关电视，拔电源，等十秒后，然后插电源，同时按住遥控器主页键和菜单键不放，开电视，然后进入recovery，清除数据后重启，就会恢复原厂设置了。
echo 打开设置-关于-产品型号，对着产品型号连点七次，开发模式就开启了，之后返回账号与安全，找到adb调试，并打开，接着进入网络设置，记住自己的IP地址

set /p var=按回车键继续：

echo 请输入电视IP地址，按回车键确认，此时电视会提示是否连接电脑，选择确认即可；
set /p ip=电视IP地址:

echo 正在连接，请稍后
set matchStr=connected
:connect
for /f "tokens=*" %%i in ('%~dp0adb connect %ip%') do @set  result=%%i

echo %result% | findstr %matchStr% >nul && (echo 连接成功) || (echo 连接失败，正在重试
  (goto connect))

echo 正在精简中，耐心等待。。。

adb shell pm uninstall --user 0 com.xiaomi.mitv.tvpush.tvpushservice

adb shell pm uninstall --user 0 com.xiaomi.mitv.advertise

adb shell pm uninstall --user 0 com.miui.systemAdSolution

adb shell pm uninstall --user 0 com.xiaomi.mibox.gamecenter


echo "恭喜您，精简成功，快去重启下电视，看看效果吧！"
@pause
```



基本去掉了开机广告，就能正常用了，其他的资源破解免费之类的就不要求了，没啥需求。

如果卸载出现了类似的错误，只是说明没有这个包了，而无法卸载，不是什么大问题

```bash
Failure - not installed for 0
```



#### 包名称及含义

不确定具体是干啥的，不建议卸载，否则都要重新恢复出厂化设置才能加回来

```
com.mitv.screensaver	智能屏保
com.droidlogic.tvinput	DroidLogicTvInput
mitv.service	小米电视服务
com.duokan.airkan.tvbox	米联投射服务
com.android.providers.media	媒体存储设备
com.xiaomi.android.TV.audio	Android TV Tools
com.xiaomi.mitv.karaoke.service  大概ktv相关
com.xiaomi.account	小米账户
com.mitv.tvhome	小米桌面
com.xiaomi.mi_connect_service	小米互联通信服务
cleantools.mitv.com.tvcleantools  清理工具

com.xiaomi.tv.gallery	时尚画报
com.mitv.alarmcenter	定时提醒
com.sohu.inputmethod.sogou.tv	搜狗输入法
com.android.externalstorage	外部存储设备
com.xiaomi.gamecenter.sdk.service.mibox	小米服务安全插件

com.android.providers.downloads	内容下载管理器

com.android.providers.tv	TV Storage
com.droidlogic	droidlogic 系统

com.mitv.codec.update	编码器更新
com.xiaomi.mitv.tvplayer	模拟电视
com.xiaomi.tweather	天气
com.miui.systemAdSolution     广告
com.xiaomi.mitv.appstore	应用商店
com.android.defcontainer	软件包权限帮助程序
com.android.pacprocessor	系统 PAC 代理服务
com.xiaomi.mibox.gamecenter	游戏中心
com.miui.daemon              未知
com.android.certinstaller	证书安装程序

com.mi.miplay.mitvupnpsink       未知
com.xiaomi.mitv.settings	电视设置
com.xiaomi.mitv.providers.settings	设置存储
android	                        系统
com.xiaomi.mitv.legal.webview    页面浏览
com.android.statementservice	Intent Filter Verification Service
com.xiaomi.mitv.mediaexplorer	高清播放器
com.xiaomi.mitv.systemui	小米系统界面
com.android.providers.settings	设置储存
com.xiaomi.smarthome.tv	米家
com.xiaomi.mibox.lockscreen	小米锁屏设置
com.mitv.videoplayer	小米 TV 播放器



com.xiaomi.screenrecorder	录屏程序
com.xiaomi.mitv.smartshare	无线投屏
com.xiaomi.voicecontrol	小爱同学
com.xiaomi.mitv.payment	小米支付
com.xiaomi.mimusic2      本地音乐播放器
com.google.android.webview	浏览插件

com.xiaomi.upnp	小米即插即用服务
com.xiaomi.mitv.pay	小米电视支付
com.android.packageinstaller	软件包安装程序
com.android.proxyhandler          系统代理处理程序
com.xiaomi.miplay                  米家链接服务  
com.xiaomi.devicereport	设备报告
com.xiaomi.mitv.upgrade         系统更新
com.mitv.mivideoplayer	小米电视播放器
com.mitv.gallery	相册
com.duokan.videodaily         视频头条
com.miui.tv.analytics	小米信息分析服务

com.xiaomi.mitv.shop	小米商城
com.xiaomi.statistic	小米统计

com.android.vpndialogs	系统代理相关套件
com.android.shell	Shell
com.xiaomi.mitv.remotecontroller.service	遥控器服务
com.android.location.fused	一体化位置信息
com.android.systemui	系统界面
com.xiaomi.mitv.tvpush.tvpushservice	电视推送服务
com.xiaomi.account.auth	小米帐号授权
com.xiaomi.mitv.calendar	日历
com.mipay.wallet.tv	小米钱包
com.xiaomi.smarthome.tv.service	米家
com.android.bluetooth	蓝牙
com.xiaomi.mitv.handbook	用户手册
com.android.captiveportallogin	CaptivePortalLogin
com.miui.core                 未知
com.xiaomi.mitv.tvmanager	电视管家
```



## 恢复出厂化设置

红外遥控，关机10秒后，同时按住遥控器的“主页”和“菜单”键，等待启动进入恢复界面

蓝牙遥控，关机10秒后，同时按住遥控器的“确定”和“返回”键，等待启动进入恢复界面（实测第三方蓝牙遥控无效，无法实现进入恢复界面，有的可能要先取消配对再操作，也无效）



软恢复，进入设置-通用设置-恢复-重启电视即可（还好有软恢复，不然硬恢复进不去可真是尴尬了）



## 第三方

当贝论坛，看起来好像活跃的不行，其实仔细看一下，基本都是机器人在活跃了。

> https://www.znds.com/forum.php?mod=forumdisplay&fid=136&typeid=476

然后论坛里各种adb脚本夹带私货，各种收费桌面，还是有点恶心的，有的直接把小米电视助手的遥控给优化没了，实在是不知道为什么，把米家什么的也优化没了，非常离谱。

有一些过期教程，实际没啥用。



## Summary

目前就是当个NS显示器用用，要求不高，所以去个开机广告就行了。650丢了也不用心疼的那种，比普通显示器都便宜了。



## Quote

> https://www.cnblogs.com/xiaobaibailongma/p/12953588.html
>
> https://www.yweihu.com/post/17.html
>
> https://www.znds.com/tv-1201974-1-1.html
>
> https://www.znds.com/tv-1186528-1-1.html
