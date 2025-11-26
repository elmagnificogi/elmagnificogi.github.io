---
layout:     post
title:      "OpenWrt开启NTP同步"
subtitle:   "时间，Date，RouterOS，SNTP"
date:       2023-06-13
update:     2025-11-26
author:     "elmagnifico"
header-img: "img/y1.jpg"
catalog:    true
tobecontinued: false
tags:
    - OpenWrt
---

## Foreword

局域网内的设备没有RTC时钟，同时也想要正确的时间，只能依赖于时间同步服务了。所以尝试使用局域网内搭建NTP服务器，让客户端访问并更新时间



## NTP



#### Win10开启NTP服务端

修改注册表

```
HKEY_LOCAL_MACHINE-SYSTEM-CurrentControlSet-Services-W32Time-TimeProviders-NtpServer
```


将`NtpServer`项的右侧键值`Enablied`，将默认的0改为1，1为启用NTP服务器



```
HKEY_LOCAL_MACHINE-SYSTEM-CurrentControlSet-Services-W32Time-Config
```

将`Config`项的右侧键值`AnnounceFlags`，将默认的10改为5，将自身设置为可靠时钟源



重启`Windows Time`服务



如果对外访问的话，需要在高级防火墙设置中开放udp端口123



#### OpenWrt开启NTP服务端

```
uci set system.ntp.enable=1 
uci commit system
```

重启ntp或者系统重启

```
/etc/init.d/sysntpd restart
```



#### 测试

```
w32tm /stripchart /computer:127.0.0.1
```

看到如下显示，说明服务已经开启了

```
C:\Users\elmag>w32tm /stripchart /computer:127.0.0.1
正在跟踪 127.0.0.1 [127.0.0.1:123]。
当前时间是 2023/6/13 14:35:03。
14:35:03, d:+00.0003226s o:+00.0000873s  [                           *                           ]
14:35:05, d:+00.0008730s o:+00.0001674s  [                           *                           ]
```

这种情况就说明同步delay很低，并且两边的时间偏差也非常低

![image-20251126175310525](https://img.elmagnifico.tech/static/upload/elmagnifico/20251126175310691.png)

但是如果是上图这种，只能说明同步delay很低，但是两个时间有偏差，偏差时0.5s，这个已经有些大了

在这种情况下，要等NTP自动修正，需要很久，他每次只修正一点点。

想要快速同步，可以手动修改系统时间，故意把偏差拉大，比如直接拉大一小时，那么此时就会直接强制同步到相同时间。

- 命令里的强制同步遇到小时间差是不工作的，还得是手动拉到才能立马同步



#### NTP服务端同步

使用ntpd指定地址进行时间同步

```
ntpd -n -d -p 172.16.200.1
```



如果开启后台自动同步，需要这样或者默认开启系统的同步服务

```
ntpd -p 172.16.200.1
```



修改系统配置

```
vi /etc/config/system 
```

ntp同步服务器中加入自定义的windows服务器

```bash
config system
        option hostname 'OMEGA'
        option timezone 'CST'
        option ttylogin '1'
        option log_size '64'
        option urandom_seed '0'

config timeserver 'ntp'
        option enabled '1'
        option enable_server '0'
        list server '172.16.200.1'
        list server '0.openwrt.pool.ntp.org'
        list server '1.openwrt.pool.ntp.org'
        list server '2.openwrt.pool.ntp.org'
```



启动ntp服务

```bash
/etc/init.d/sysntpd start
/etc/init.d/sysntpd enable

/etc/init.d/ntpd start
/etc/init.d/ntpd enable
```



查看ntp服务

```bash
ps | grep ntp
ntpd -n -d -p 172.16.200.1
1830 root      1216 S<   /usr/sbin/ntpd -n -N -S /usr/sbin/ntpd-hotplug -p 172.16.200.1 -p 1.lede.pool.ntp.org -p 2.lede.pool.ntp.org -p 3.lede.p
```



仅查询，不设置时间

```
ntpd -w -p 172.16.200.1
```



显示当前ntp设置

```
uci show system.ntp
```



通过uci接口配置

```bash
#先修改时区
uci set system.@system[0].timezone='CST-8'
uci set system.@system[0].zonename='Asia/Shanghai'
#启用ntp
uci set system.ntp='timeserver'
uci set system.ntp.enabled='1'

# delete existing list of servers
uci set system.ntp.server=

#将以下地址修改为局域网中的NTP SERVER地址
uci add_list system.ntp.server='172.16.200.1'

# add one or more servers
uci add_list system.ntp.server='my-ntp-server.org'
uci add_list system.ntp.server='my-other-ntp-server.org'
# commit the changes
uci commit
# have (sys)ntpd reload its own config
/etc/init.d/sysntpd reload
reload_config
```



#### RouterOS客户端同步

![image-20230613151247336](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230613151247336.png)

可以看到开启的一瞬间，时间就自动同步上去了



## OpenWrt同步问题

```bash
root@123-:/# ntpd -n -d -p 172.16.200.1
ntpd: sending query to 172.16.200.1
ntpd: reply from 172.16.200.1: offset:+5890157.341717 delay:0.004247 status:0x1c strat:1 refid:0x4c434f4c rootdelay:0.000000 reach:0x01
ntpd: sending query to 172.16.200.1
ntpd: reply from 172.16.200.1: offset:+5890157.340812 delay:0.005813 status:0x1c strat:1 refid:0x4c434f4c rootdelay:0.000000 reach:0x03
ntpd: sending query to 172.16.200.1
ntpd: reply from 172.16.200.1: offset:+5890157.341056 delay:0.006732 status:0x1c strat:1 refid:0x4c434f4c rootdelay:0.000000 reach:0x07
ntpd: sending query to 172.16.200.1
ntpd: reply from 172.16.200.1: offset:+5890157.341651 delay:0.004168 status:0x1c strat:1 refid:0x4c434f4c rootdelay:0.000000 reach:0x0f
ntpd: sending query to 172.16.200.1

root@123-:/# date
Wed Apr  5 20:03:42 CST 2023
```

现在问题就出现了，已经看到ntpd同步了，但是系统的date时间依然是错误的

有一种说法是系统时区不正确，导致的不能同步，但是这里是正确的，都切换到了`CST`

还有一说要5分钟才能同步，实际半小时都没同步，也有看到说明ntpd在时间差距过大时不会工作，必须要先用ntpdate做一个时间跳跃修改到差不多以后，ntpd才能工作



仔细看了一下系统自带的sysntpd似乎和dhcp有关系

```bash
#!/bin/sh /etc/rc.common                                                                                                   
# Copyright (C) 2011 OpenWrt.org                                                                                           
                                                                                                                           
START=98                                                                                                                   
                                                                                                                           
USE_PROCD=1                                                                                                                
PROG=/usr/sbin/ntpd                                                                                                        
HOTPLUG_SCRIPT=/usr/sbin/ntpd-hotplug                                                                                      
                                                                                                                           
get_dhcp_ntp_servers() {                                                                                                   
        local interfaces="$1"                                                                                              
        local filter="*"                                                                                                   
        local interface ntpservers ntpserver                                                                               
                                                                                                                           
        for interface in $interfaces; do                                                                                   
                [ "$filter" = "*" ] && filter="@.interface='$interface'" || filter="$filter,@.interface='$interface'"      
        done                                                                                                               
                                                                                                                           
        ntpservers=$(ubus call network.interface dump | jsonfilter -e "@.interface[$filter]['data']['ntpserver']")         
                                                                                                                           
        for ntpserver in $ntpservers; do                                                                                   
                local duplicate=0                                                                                          
                local entry                                                                                                
                for entry in $server; do                                                                                   
                        [ "$ntpserver" = "$entry" ] && duplicate=1                                                         
                done                                                                                                       
                [ "$duplicate" = 0 ] && server="$server $ntpserver"                                                        
        done                                                                                                               
}                                                                                                                          
                                                                                                                           
validate_ntp_section() {                                                                                                   
        uci_validate_section system timeserver "${1}" \                                                                    
                'server:list(host)' 'enabled:bool:1' 'enable_server:bool:0' 'use_dhcp:bool:1' 'dhcp_interface:list(string)'
} 

start_service() {                                                                                                          
        local server enabled enable_server use_dhcp dhcp_interface peer                                                    
                                                                                                                           
        validate_ntp_section ntp || {                                                                                      
                echo "validation failed"                                                                                   
                return 1                                                                                                   
        }                                                                                                                  
                                                                                                                           
        [ $enabled = 0 ] && return                                                                                         
                                                                                                                           
        [ $use_dhcp = 1 ] && get_dhcp_ntp_servers "$dhcp_interface"                                                        
                                                                                                                           
        [ -z "$server" -a "$enable_server" = "0" ] && return                                                               
                                                                                                                           
        procd_open_instance                                                                                                
        procd_set_param command "$PROG" -n -N                                                                              
        [ "$enable_server" = "1" ] && procd_append_param command -l                                                        
        [ -x "$HOTPLUG_SCRIPT" ] && procd_append_param command -S "$HOTPLUG_SCRIPT"                                        
        for peer in $server; do                                                                                            
                procd_append_param command -p $peer                                                                        
        done                                                                                                               
        procd_set_param respawn                                                                                            
        procd_close_instance                                                                                               
}

service_triggers() {                                                                                                       
        local script name use_dhcp                                                                                         
                                                                                                                           
        script=$(readlink -f "$initscript")                                                                                
        name=$(basename ${script:-$initscript})                                                                            
                                                                                                                           
        procd_add_config_trigger "config.change" "system" /etc/init.d/$name reload                                         
                                                                                                                           
        config_load system                                                                                                 
        config_get use_dhcp ntp use_dhcp 1                                                                                 
                                                                                   
        [ $use_dhcp = 1 ] && {                                                     
                local dhcp_interface                                               
                config_get dhcp_interface ntp dhcp_interface                       
                                                                                   
                if [ -n "$dhcp_interface" ]; then                                  
                        for n in $dhcp_interface; do                               
                                procd_add_interface_trigger "interface.*" $n /etc/init.d/$name reload
                        done                                                                         
                else                                                                                 
                        procd_add_raw_trigger "interface.*" 1000 /etc/init.d/$name reload            
                fi                                                                                   
        }                                                                                            
                                                                                                     
        procd_add_validation validate_ntp_section                                                    
}                                        
```



实际手动跳跃一下时间就能强制同步了



## Summary

NTP服务踩坑就到这里了



## Quote

> https://www.cnblogs.com/pipci/p/14672772.html
>
> https://blog.csdn.net/hzlarm/article/details/109765246
>
> https://forum.openwrt.org/t/solved-ntp-not-working/132671/6
>
> https://serverfault.com/questions/845814/is-it-possible-to-check-ntpd-status-on-a-busybox-system#:~:text=BusyBox%20does%20not%20provide%20the,to%20talk%20to%20BusyBox%20ntpd%20.
>
> https://blog.csdn.net/weixin_40752030/article/details/107827595
>
> https://blog.51cto.com/024mj/1666274?b=totalstatistic
>
> https://community.cisco.com/t5/switching/ntp-not-synching/td-p/1515137
