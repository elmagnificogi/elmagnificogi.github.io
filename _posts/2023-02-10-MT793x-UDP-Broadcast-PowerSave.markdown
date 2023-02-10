---
layout:     post
title:      "省电模式造成UDP广播大量丢包"
subtitle:   "power save，MT793x，wifi"
date:       2023-02-10
update:     2023-02-10
author:     "elmagnifico"
header-img: "img/bg5.jpg"
catalog:    true
tags:
    - MT793x
---

## Forward

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



## Summary

未完待续，客户端进入省电模式竟然还和AP有关系，具体的逻辑还需要我查阅。



## Quote

> https://blog.csdn.net/zwl1584671413/article/details/78027215

