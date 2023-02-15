---
layout:     post
title:      "省电模式造成UDP广播大量丢包"
subtitle:   "power save，MT793x，wifi"
date:       2023-02-10
update:     2023-02-13
author:     "elmagnifico"
header-img: "img/bg5.jpg"
catalog:    true
tags:
    - MT793x
---

## Foreword

MT793x遇到一个奇怪的问题，udp广播丢包，同时的其他单播的udp包全都正常。



## 情况

某一个AP下，大部分udp广播的包，都会在对应设备上大量丢失，而同网络中的PC等其他设备完全不会丢失。

更换AP以后，udp广播正常了，其他设备也是正常的。



从两个AP的大部分参数来说，非常相似，二者的信道、带宽等等能设置的全都设置相同，在某AP下依然会丢广播，可以同网络其他设备正常，又不能说这个AP有问题，这就很难搞。



中途发生了一个小插曲：我的笔记本在未接电源的情况下，发生了相同问题，udp广播大量丢失，只能偶尔收到几个包。接上电源的一瞬间，所有包立马正常了。

结合之前遇到过的树莓派网络延迟总是高的爆炸的问题，猜想是硬件上进入了节电模式，进而导致射频休眠。



## 检查

#### lwip

MT793x用的是lwip，先怀疑是否存在lwip配置不正确导致丢wifi，查了半天，没有任何收获，应该是正确的。



#### wifi

查看wifi config，发现power save被设置为2

```c
/**
* @brief This enumeration defines three power saving modes.
*/
typedef enum {
	WIFI_POWER_SAVING_MODE_OFF = 0,
	/**<  WIFI_POWER_SAVING_MODE_OFF is a power saving mode that keeps the
	   radio powered up continuously to ensure there is a minimal lag in
	   response time. This power saving setting consumes the most power but
	   offers the highest throughput. */
	WIFI_POWER_SAVING_MODE_LEGACY,
	/**<  WIFI_POWER_SAVING_MODE_LEGACY: The access point buffers incoming
	   messages for the radio. The radio occasionally 'wakes up' to
	   determine if any buffered messages are waiting and then returns to
	   sleep mode after it has responded to each message. This setting
	   conserves the most power but also provides the lowest throughput. It
	   is recommended for radios in which power consumption is the most
	   important (such as small battery-operated devices). */
	WIFI_POWER_SAVING_MODE_FAST /**<  WIFI_POWER_SAVING_MODE_FAST is a power
				       saving mode that switches between power
				       saving and WIFI_POWER_SAVING_MODE_OFF
				       modes, depending on the network traffic.
				       For example, it switches to
				       WIFI_POWER_SAVING_MODE_OFF mode after
				       receiving a large number of packets and
				       switches back to power saving mode after
				       the packets have been retrieved. Fast is
				       recommended when power consumption and
				       throughput are a concern.  */
} wifi_power_saving_mode_t;
```

通过确认，2其实就是节电了，只不过是有一定策略的节电。

直接修改节电模式为0，然后再测udp包，发现全都正常收到了。



基本可以确定就是节电造成的问题，当然这里还发现demo代码中的省电根本没生效，wifi配置中根本没配，后来发现他为什么不配了。

```c
/* STA config */
static const group_data_item_t g_sta_data_item_array[] = {
    NVDM_DATA_ITEM("MacAddr",        ""),
    NVDM_DATA_ITEM("Ssid",           "MTK_SOFT_AP"),
    NVDM_DATA_ITEM("SsidLen",        "11"),
    NVDM_DATA_ITEM("Channel",        "1"),
    NVDM_DATA_ITEM("BW",             "0"),
    NVDM_DATA_ITEM("WirelessMode",   "9"),
    NVDM_DATA_ITEM("ListenInterval", "1"),
    NVDM_DATA_ITEM("AuthMode",       "0"),
    NVDM_DATA_ITEM("EncrypType",     "1"),
    NVDM_DATA_ITEM("WpaPsk",         "12345678"),
    NVDM_DATA_ITEM("WpaPskLen",      "8"),
    NVDM_DATA_ITEM("DefaultKeyId",   "0"),
    NVDM_DATA_ITEM("SharedKey",      "12345,12345,12345,12345"),
    NVDM_DATA_ITEM("SharedKeyLen",   "5,5,5,5"),
    NVDM_DATA_ITEM("PSMode",         "0"),
};

void wifi_auto_init_task(void *para)
{

    wifi_cfg_t wifi_config = {0};
    if (0 != wifi_config_init(&wifi_config))
    {
        LOG_E(common, "wifi config init fail");
    }

    wifi_config_t config = {0};
    wifi_config_ext_t config_ext = {0};
    memset(&config, 0, sizeof(config));
    memset(&config_ext, 0, sizeof(config_ext));

    config.opmode = wifi_config.opmode;

    kalMemCopy(config.sta_config.ssid, wifi_config.sta_ssid,
               WIFI_MAX_LENGTH_OF_SSID);
    config.sta_config.ssid_length = wifi_config.sta_ssid_len;
    config.sta_config.bssid_present = 0;
    config.sta_config.channel = wifi_config.sta_channel;
    kalMemCopy(config.sta_config.password, wifi_config.sta_wpa_psk,
               WIFI_LENGTH_PASSPHRASE);
    config.sta_config.password_length = wifi_config.sta_wpa_psk_len;
    if (wifi_config.sta_default_key_id == 255)
        config_ext.sta_wep_key_index_present = 0;
    else
        config_ext.sta_wep_key_index_present = 1;
    config_ext.sta_wep_key_index = wifi_config.sta_default_key_id;

    kalMemCopy(config.ap_config.ssid, wifi_config.ap_ssid,
               WIFI_MAX_LENGTH_OF_SSID);
    config.ap_config.ssid_length = wifi_config.ap_ssid_len;
    kalMemCopy(config.ap_config.password, wifi_config.ap_wpa_psk,
               WIFI_LENGTH_PASSPHRASE);
    config.ap_config.password_length = wifi_config.ap_wpa_psk_len;
    config.ap_config.auth_mode =
        (wifi_auth_mode_t)wifi_config.ap_auth_mode;
    config.ap_config.encrypt_type =
        (wifi_encrypt_type_t)wifi_config.ap_encryp_type;
    config_ext.ap_wep_key_index_present = 1;
    config_ext.ap_wep_key_index = wifi_config.ap_default_key_id;

    config_ext.sta_auto_connect_present = 1;
    config_ext.sta_auto_connect = 1;

    wifi_init(&config, &config_ext);
    wifi_connection_register_event_handler(WIFI_EVENT_IOT_INIT_COMPLETE, (wifi_event_handler_t)wifi_init_done_handler_test);
    wifi_connection_scan_init(g_ap_list, 8);
...
}
```



#### 问题依旧

修改了省电模式以后，发现还是会出现问题。

手动查看节电模式，发现时有时无，一开始上电全都是非省电，过了一会再一看，全都省电了。

```c
/**
* @brief This functions set power save mode,this only support in mt7682/mt7686
*        /mt7933 currently.
*
* @param[in] power_save_mode indicates three power save mode below.
*
* Value | Definition                                                        |
* ------|-------------------------------------------------------------------|
* \b 0  | CAM: CAM (Constantly Awake Mode) is a power save mode that keeps
*              the radio powered up continuously to ensure there is a minimal
*              lag in response time. This power save setting consumes the most
*              power but offers the highest throughput.|
* \b 1  | LEGACY_POWERSAVE: the access point buffers incoming messages for the
*              radio. The radio occasionally 'wakes up' to determine if any
*              buffered messages are waiting and then returns to sleep mode
*              after it requests each message. This setting conserves the most
*              power but also provides the lowest throughput. It is
*              recommended for radios in which power consumption is the most
*              important (such as small battery-operating devices).|
* \b 2  | FAST_POWERSAVE: Fast is a power save mode that switches between
*              power saving and CAM modes, depending on the network traffic.
*              For example, it switches to CAM when receiving a large number
*              of packets and switches back to PS mode after the packets have
*              been retrieved. Fast is recommended when power consumption and
*              throughput are a concern.|
*
* @return  >=0 the operation completed successfully, <0 the operation failed.
*
* @note  Only supported in STA mode.
*/
int32_t wifi_config_set_power_save_mode(uint8_t ps_mode)
{
    struct GLUE_INFO *prGlueInfo;
    enum PARAM_POWER_MODE ePowerMode;
    struct PARAM_POWER_MODE_ rPowerMode;
    uint32_t rStatus = WLAN_STATUS_SUCCESS;
    uint32_t u4BufLen = 0;

    if (ps_mode > 2) {
        LOG_I(WIFI, "mode: 0:CAM, 1:LEGACY, 2:FAST");
        return WIFI_FAIL;
    }

    prGlueInfo = &g_rGlueInfo;
    rPowerMode.ucBssIdx =
        prGlueInfo->prAdapter->prAisBssInfo[0]->ucBssIndex;
    rPowerMode.ePowerMode = Param_PowerModeCAM;

    ePowerMode = ps_mode;
    if (ePowerMode < Param_PowerModeMax)
        rPowerMode.ePowerMode = ePowerMode;

    rStatus = kalIoctl(prGlueInfo,
                       wlanoidSet802dot11PowerSaveProfile,
                       &rPowerMode, sizeof(struct PARAM_POWER_MODE_),
                       FALSE, FALSE, TRUE, &u4BufLen);

    if (rStatus != WLAN_STATUS_SUCCESS)
        return WIFI_FAIL;

    return WIFI_SUCC;
}
```

经过一通反查，发现没有其他地方有可能会设置这个powersave，只能是在最底层里，而这部分代码看不到。



## 临时解决

通过在检测wifi状态的任务中加入了检测省电模式，一旦省电就立刻将wifi切换成非省电模式



## Wifi Client省电流程

Wifi服务集分为两种一个是BSS，一个是IBSS，BSS可以简单理解为是普通的Wifi，1对n的连接模式，1是AP，n是客户端，而IBSS则是指点对点的连接的服务模式，他们中没有AP，是互相保持与对方的连接的，即对等网络，以前常用的AdHoc就是IBSS

![image-20230211162831618](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202302111628754.png)

### BSS

省电流程：

当Client加入BSS以后，他会告知AP，他的电源管理状态是省电还是不省电。Client和AP关联时会获得一个AID

AP收到了客户端目前处于省电状态，那么AP收到所有发往该客户端的数据会短暂缓存住。

由于Client和AP之前已经通过沟通，知道了Beacon发送的频率和时间（TBTT），所以Client每次会在Beacon发送的时间保持清醒，来接收Beacon。

Client收到Beacon以后，会根据AID，检查TIM（流量指示图），看是否有缓存数据。如果有那么Client会持续保持清醒，接收所有数据，然后再次进入休眠。如果没有那就直接休眠，等待下次Beacon。



所以这里就能解释一些术语，他们平常的有什么作用了：

- Beacon Interval，节电是和Beacon有关系，那么Beacon越大，越节电，但是同时对于AP的缓存要求就会更多，同时也会增加延迟

- TIM，每一个Beacon的帧中都有一个TIM 信息元素 ，它主要用来由AP通告它管辖下的哪个STA有信息现在缓存在AP中，而在TIM中包含一个 Bitmap control 字段，它最大是251个字节，每一位映射一个STA，当为1时表示该位对应的STA有信息在AP中。收到与自己关联的TIM就要发送PS-POLL帧来与AP取来联系并取得它的缓存帧了
- TBTT，其实Client并不是每一个Beacon都会醒来，实际上可能是n个Beacon醒来一次，这个时间点就是TBTT

- Listen Interval，对Client来说其实就是n个Beacon时间



这里面有一个特殊情况，

- DTIM，当发送几个TIM之后，就要发送一个DTIM，其除了缓存单播信息，也同时指示AP缓存的**组播**或**广播**信息，一旦AP发送了DTIM, STA就必须处于清醒，因为广播或组播无重发机制，不醒来数据就收不到了。DTIM可能和Listen Interval对不上，这种情况下就有可能会丢包



对于Client来说，省电的时候其实会更多的关闭射频的Tx，Rx是间隔启动



## 问题分析

知道了省电流程，再回顾一下之前的问题，可以确定，AP和MT793x进行沟通的时候肯定出现了错误，导致AP把缓存来的包丢弃了。当MT793x醒来的时候，无法接收到之前缓存的帧。

其他AP的省电模式则是没有错，在省电模式下也能让MT793x正常收到广播包。

那么只要去找一下具体AP关于省电相关的设置看看是否有异常就能解决这个问题了。



AP检查是否多播缓冲已经开启了

![image-20230211172812152](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202302111728196.png)

比较有意思的是下面的`multicast-helper`，它可以在AP层面直接把多播转换成单播，从而解决各种无线环境中的多播问题。



仔细看他提出的无线多播问题，如果多播帧是从AP发出，由于多播在无线传输中没有任何类ack的机制，这就会导致一旦这个帧发出去以后，其实client可能根本没收到，但是不具有重传等机制就会导致这个帧真实丢失了，这样可靠性就很差。同时为了提高多播的可靠性，任何多播的帧都会选择最低速率去传输，以此来提高稳定性。

![image-20230211173254409](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202302111732477.png)

相反如果多播帧是从client发出，那么这个帧是由AP转发的，所以会提供重传机制，并且速率也会在约定速率，而非最低。但是同时，这个转发会走前面AP发出多播的流程，导致这个多播帧依然是不可靠的，并且多播帧被传输了两次，浪费了整个网络的带宽。



```c
typedef struct {
	uint32_t sta_wep_key_index_present : 1;
	/**< Set to 1 to mark the presence of the sta_wep_key_index, set to 0,
	 * otherwise. */
	uint32_t sta_auto_connect_present : 1;
	/**< Set to 1 to mark the presence of the sta_auto_connect, set to 0,
	 * otherwise. */
	uint32_t ap_wep_key_index_present : 1;
	/**< Set to 1 to mark the presence of the ap_wep_key_index, set to 0,
	 * otherwise. */
	uint32_t ap_hidden_ssid_enable_present : 1;
	/**< Set to 1 to mark the presence of the ap_hidden_ssid_enable, set to
	 * 0, otherwise. */
	uint32_t country_code_present : 1; /**< Set to 1 to mark the presence of
					      the country_code[4], set to 0,
					      otherwise. */
	uint32_t sta_bandwidth_present : 1; /**< Set to 1 to mark the presence
					       of the sta_bandwidth, set to 0,
					       otherwise. */
	uint32_t sta_wireless_mode_present : 1;
	/**< Set to 1 to mark the presence of the sta_wireless_mode, set to 0,
	 * otherwise. */
	uint32_t sta_listen_interval_present : 1;
	/**< Set to 1 to mark the presence of the sta_listen_interval, set to 0,
	 * otherwise. */
	uint32_t sta_power_save_mode_present : 1;
	/**< Set to 1 to mark the presence of the sta_power_save_mode, set to 0,
	 * otherwise. */
	uint32_t ap_wireless_mode_present : 1;
	/**< Set to 1 to mark the presence of the ap_wireless_mode, set to 0,
	 * otherwise. */
	uint32_t ap_dtim_interval_present : 1;
	/**< Set to 1 to mark the presence of the ap_dtim_interval, set to 0,
	 * otherwise. */
	uint32_t reserved_bit : 21; /**< Reserved. */
	uint32_t reserved_word[3];  /**< Reserved. */

	uint8_t sta_wep_key_index; /**< The WEP key index for STA. It should be
				      set when the STA uses the WEP encryption.
				      */
	uint8_t sta_auto_connect;  /**< Set to 1 to enable the STA to
				      automatically connect to the target AP
				      after the initialization. Set to 0 to force
				      the STA to stay idle after the
				      initialization and to call
				      #wifi_config_reload_setting() to trigger
				      connection. The default is set to 1. */
	uint8_t ap_wep_key_index;  /**< The WEP key index for AP. It should be
				      set when the AP uses WEP encryption. */
	uint8_t ap_hidden_ssid_enable; /**< Set to 1 to enable the hidden SSID
					  in the beacon and probe response
					  packets. The default is set to 0. */
	uint8_t country_code[4];       /**< The country code setting. */
	uint8_t sta_bandwidth; /**< The bandwidth setting for STA. The value is
				  either
				  #WIFI_IOT_COMMAND_CONFIG_BANDWIDTH_20MHZ or
				  #WIFI_IOT_COMMAND_CONFIG_BANDWIDTH_40MHZ, or
				  WIFI_IOT_COMMAND_CONFIG_BANDWIDTH_2040MHZ.*/
	wifi_phy_mode_t sta_wireless_mode; /**< The wireless mode setting for
					      STA. Please refer to the
					      definition of #wifi_phy_mode_t.*/
	uint8_t sta_listen_interval; /**< The listening interval setting for
					STA. The interval range is from 1 to 255
					beacon intervals.*/
	wifi_power_saving_mode_t sta_power_save_mode;
	/**< The power saving mode setting for STA. Please refer to the
	 * definition of #wifi_power_saving_mode_t.*/
	wifi_phy_mode_t
		ap_wireless_mode; /**< The wireless mode setting for AP. Please
				     refer to the definition of
				     #wifi_phy_mode_t.*/
	uint8_t ap_dtim_interval; /**< The DTIM interval setting for AP. The
				     interval range is from 1 to 255 beacon
				     intervals. */

} wifi_config_ext_t;
```

再仔细看下，实际上MT793x这部分代码没有配置listen interval，但是默认是1，所以应该没问题



仔细一查，发现routeros不能设置dtim时间和beacon时间，关于dtim的具体时间是多少也是不确定的

> https://forum.mikrotik.com/viewtopic.php?t=146749



> multicast-buffering (disabled | enabled; Default: enabled)，For a client that has power saving, buffer multicast packets until next beacon time. A client should wake up to receive a beacon, by receiving beacon it sees that there are multicast packets pending, and it should wait for multicast packets to be sent.

多播的缓冲选项，似乎只能缓冲一个beacon？这里的说明也很模糊



那么现在基本可以推测，问题是由于在不同的节电模式下MT793x的唤醒周期和AP的DTIM对不上，导致实际出现丢包。而routeros中关于DTIM和多播缓冲的说明都有点隐晦，所以多少可能是有点问题的。



## Multicast Helper

通过启用`Multicast Helper`，将多播转为单播，原广播包就变得正常可以收到了。



## Summary

客户端进入省电模式竟然还和AP有关系，以前一直以为只是单方的定时唤醒而已。



## Quote

> https://blog.csdn.net/zwl1584671413/article/details/78027215
>
> https://blog.csdn.net/qq_37117595/article/details/127123383
>
> https://forum.mikrotik.com/viewtopic.php?t=146749

