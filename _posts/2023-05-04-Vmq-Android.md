---
layout:     post
title:      "Vmq Android App编译修改"
subtitle:   "V免签、安卓、支付宝、收款"
date:       2023-05-04
update:     2023-05-04
author:     "elmagnifico"
header-img: "img/x9.jpg"
catalog:    true
tobecontinued: false
tags:
    - Vmq
    - Android
---

## Foreword

Vmq的App微信记录的很好，但是支付宝成天出问题，各种幺蛾子，再加上以前支付宝一些历史问题，导致检测收款总是报错，只好自己重新编译一个



目前是基于他的版本进行三次编译

> https://github.com/zwc456baby/vmqApk



## Android

由于之前没接触过Android开发，大概看了下非常像Java开发，Github仓库也是基于gradle的工程，问了一下IDEA就能直接编译。



首先安装Android SDK，新建工程或者配置的地方可以选择，然后依靠IDEA集成的工具进行安装，总体还是比较简单省心的

![image-20230504225237969](https://img.elmagnifico.tech/static/upload/elmagnifico/202305042253082.png)

但是接着就比较操蛋了，安装的SDK 33.0.2版本有问题，编译怎么都过不去，一直报错

```
Installed Build Tools revision 33.0.2 is corrupted. Remove and install again
```

要把这个编译过去，需要先卸载之前的SDK，然后降级，选个30版本的

![image-20230504225748629](https://img.elmagnifico.tech/static/upload/elmagnifico/202305042257702.png)

SDK Tools中也需要取消33.0.2版本

![image-20230504225820119](https://img.elmagnifico.tech/static/upload/elmagnifico/202305042258185.png)

应用重装以后才能编译。



#### local.properties 缺失

由于缺少了local.properties，一开始编译肯定过不去，这个文件又被忽略了，实际要填充什么内容，怎么填充也没见有人说



大致如下，需要给出来sdk的路径以及安卓签名的文件信息

```yaml
## This file must *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For customization when using a Version Control System, please read the
# header note.
#Thu May 04 16:36:06 CST 2023
sdk.dir=D\:\\Android\\android-sdk
STORE_FILE_NAME=E\:\\vmqApk\\out\\keystore.jks
KEY_PASSWORD=password
STORE_ALIAS=别名
```



#### Generate Signed Bundle / APK 无法点击

这里就会遇到，由于编译过不去，IDEA无法生成安卓签名

![image-20230504230627001](https://img.elmagnifico.tech/static/upload/elmagnifico/202305042306041.png)

build选项中，在没完整编译之前，这里是不能点的。

想生成一个签名，先重新建一个Android demo项目，编译过了以后，再生成一个给Vmq用。



## Vmq修改



#### 查看log文件

查看log文件，确定问题所在

![image-20230504233141312](https://img.elmagnifico.tech/static/upload/elmagnifico/202305042331352.png)

看到有一个工具类，专门记录了通知信息的log，主要是看`context.getExternalFilesDir`这个路径在哪里

仔细看了一下Vmq的App信息，发现是`com.vone.qrcode`，找到这个文件夹应该就能看到了

```
内存存储设备/Android/data/com.vone.qrcode/files/log/notifycation_file.txt
```



可以看到，这个里面支付宝的信息都是些啥东西啊...有用的一个没有

![image-20230504233417834](https://img.elmagnifico.tech/static/upload/elmagnifico/202305042334870.png)



找到一条今天的

![image-20230504233630244](https://img.elmagnifico.tech/static/upload/elmagnifico/202305042336267.png)

对应web里的就是这里，可以5元的`完成`是我手动补单的，实际自动成功识别的就是上面的100

![image-20230504233749630](https://img.elmagnifico.tech/static/upload/elmagnifico/202305042337666.png)

这个干扰信息就很恶心



log信息都是从这里记录进去的，时间、包名、通知标题、通知内容、子内容，主要是从标题、通知内容和子内容中筛选出实际的收款信息。

```java
    private void writeNotifyToFile(StatusBarNotification sbn) {
        if (!sbn.isClearable()) {
            return;
        }
        Log.i(TAG, "write notify message to file");
        //            具有写入权限，否则不写入
        CharSequence notificationTitle = null;
        CharSequence notificationText = null;
        CharSequence subText = null;

        Bundle extras = sbn.getNotification().extras;
        if (extras != null) {
            notificationTitle = extras.getCharSequence(Notification.EXTRA_TITLE);
            notificationText = extras.getCharSequence(Notification.EXTRA_TEXT);
            subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT);
        }
        String packageName = sbn.getPackageName();
        String time = Utils.formatTime(Calendar.getInstance().getTime());

        String writText = "\n" + "[" + time + "]" + "[" + packageName + "]" + "\n" +
                "[" + notificationTitle + "]" + "\n" + "[" + notificationText + "]" + "\n" +
                "[" + subText + "]" + "\n";

        // 使用 post 异步的写入
        Utils.putStr(this, writText);
    }
```



#### 收款过滤

通过`writeNotifyToFile`，看到主要的过滤代码都在`onNotificationPosted`

```java
public void onNotificationPosted(StatusBarNotification sbn) {
    Log.d(TAG, "接收到通知消息");
    writeNotifyToFile(sbn);
    // 微信支付部分通知，会调用两次，导致统计不准确
    if ((sbn.getNotification().flags & Notification.FLAG_GROUP_SUMMARY) != 0) {
        Log.d(TAG, "群组摘要通知，忽略");
        return;
    }
    SharedPreferences read = getSharedPreferences("vone", MODE_PRIVATE);
    host = read.getString("host", "");
    key = read.getString("key", "");

    Notification notification = sbn.getNotification();
    String pkg = sbn.getPackageName();
    if (notification != null) {
        Bundle extras = notification.extras;
        if (extras != null) {
            CharSequence _title = extras.getCharSequence(NotificationCompat.EXTRA_TITLE, "");
            CharSequence _content = extras.getCharSequence(NotificationCompat.EXTRA_TEXT, "");
            Log.d(TAG, "**********************");
            Log.d(TAG, "包名:" + pkg);
            Log.d(TAG, "标题:" + _title);
            Log.d(TAG, "内容:" + _content);
            Log.d(TAG, "**********************");
            // to string (企业微信之类的 getString 会出错，换getCharSequence)
            String title = _title.toString();
            String content = _content.toString();
            if ("com.eg.android.AlipayGphone".equals(pkg)) {
                if (!content.equals("")) {
                    if (content.contains("通过扫码向你付款") || content.contains("成功收款")
                        || title.contains("通过扫码向你付款") || title.contains("成功收款")
                        || content.contains("店员通") || title.contains("店员通")) {
                        String money;
                        // 新版支付宝，会显示积分情况下。先匹配标题上的金额
                        //    [2023-05-04 10:13:19][com.eg.android.AlipayGphone]
                        //    [你已成功收款5.00元]
                        //    [已转入余额 100积分兑收钱音箱，去兑换>>]
                        //    [null]
                        //
                        if (content.contains("商家积分")) {
                            money = getMoney(title);
                            if (money == null) {
                                money = getMoney(content);
                            }
                        } else {
                            // 明显上面的这种提示信息、走了这个分支，通过内容获取金额，就出现错误的情况了
                            money = getMoney(content);
                            if (money == null) {
                                money = getMoney(title);
                            }
                        }
                        if (money != null) {
                            Log.d(TAG, "onAccessibilityEvent: 匹配成功： 支付宝 到账 " + money);
                            appPush(2, Double.parseDouble(money));
                        } else {
                            handler.post(new Runnable() {
                                public void run() {
                                    Toast.makeText(getApplicationContext(), "监听到支付宝消息但未匹配到金额！", Toast.LENGTH_SHORT).show();
                                }
                            });
                        }
                    }
                }
            } else if ("com.tencent.mm".equals(pkg)
                       || "com.tencent.wework".equals(pkg)) {
                if (!content.equals("")) {
                    if (title.equals("微信支付") || title.equals("微信收款助手") || title.equals("微信收款商业版")
                        || (title.equals("对外收款") || title.equals("企业微信")) &&
                        (content.contains("成功收款") || content.contains("收款通知"))) {
                        String money = getMoney(content);
                        if (money != null) {
                            Log.d(TAG, "onAccessibilityEvent: 匹配成功： 微信到账 " + money);
                            try {
                                appPush(1, Double.parseDouble(money));
                            } catch (Exception e) {
                                Log.d(TAG, "app push 错误！！！");
                            }
                        } else {
                            handler.post(new Runnable() {
                                public void run() {
                                    Toast.makeText(getApplicationContext(), "监听到微信消息但未匹配到金额！", Toast.LENGTH_SHORT).show();
                                }
                            });
                        }

                    }
                }
            } else if ("com.vone.qrcode".equals(pkg)) {
                if (content.equals("这是一条测试推送信息，如果程序正常，则会提示监听权限正常")) {
                    handler.post(new Runnable() {
                        public void run() {
                            Toast.makeText(getApplicationContext(), "监听正常，如无法正常回调请联系作者反馈！", Toast.LENGTH_SHORT).show();
                        }
                    });
                }
            }
        }
    }
}
```



明显这里判断一定要有商家积分，而实际上这里是没有的，就导致了通过内容获取金额

```java
// 新版支付宝，会显示积分情况下。先匹配标题上的金额
//    [2023-05-04 10:13:19][com.eg.android.AlipayGphone]
//    [你已成功收款5.00元]
//    [已转入余额 100积分兑收钱音箱，去兑换>>]
//    [null]
//
if (content.contains("商家积分")||content.contains("积分")) {
	money = getMoney(title);
	if (money == null) {
		money = getMoney(content);
	}
} else {
	// 明显上面的这种提示信息、走了这个分支，通过内容获取金额，就出现错误的情况了
    money = getMoney(content);
    if (money == null) {
        money = getMoney(title);
    }
}
```

我这里看到的所有`商家积分`在前几个月的时候，还是正确出现在content中的，后来就变成了`xxx积分`



目前已经安装测试了，等等看这几天看看情况如何



## Summary

有一说一，这个通知栏信息监控确实有点危险，我大概翻看了一下，基本上各种支付信息、**验证码**、部分聊天记录都会被记录进去。如果被别人黑了，或者这里简单的偷一下通知信息，确实会导致出现严重的问题

所以如果有需要，最好这个Vmq还是自己编译一下



## Quote

> https://blog.csdn.net/m18860232520/article/details/78851245
>
> https://blog.csdn.net/lplj717/article/details/124819950
>
> https://blog.csdn.net/qq_15945399/article/details/123384716
>
> https://blog.csdn.net/weixin_65468424/article/details/126643746



