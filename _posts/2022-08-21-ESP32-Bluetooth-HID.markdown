---
layout:     post
title:      "ESP32经典蓝牙HID开发"
subtitle:   "Classic Bluetooth Hid"
date:       2022-08-21
update:     2022-08-28
author:     "elmagnifico"
header-img: "img/bg1.jpg"
catalog:    true
tags:
    - ESP32
---

## Foreword

看一下官方的ESP32 经典蓝牙 HID是什么样的架构，以及如何修改HID



#### 硬件

需要注意的是ESP32，必须是不带任何后缀的，才具有双模，S和C系列的都是单BLE蓝牙，无法使用经典蓝牙

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208240118531.png)



## Example

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208212314350.png)

先看官方例程，经典蓝牙还是给了不少例子的，主要看一下`bt_hid_mouse_device`是如何实现的就行了



### app_main



#### 参数初始化

一上来就是各种参数初始化

```c++
    s_local_param.app_param.name = "Mouse";
    s_local_param.app_param.description = "Mouse Example";
    s_local_param.app_param.provider = "ESP32";
    s_local_param.app_param.subclass = ESP_HID_CLASS_MIC;
    s_local_param.app_param.desc_list = hid_descriptor_mouse_boot_mode;
    s_local_param.app_param.desc_list_len = hid_descriptor_mouse_boot_mode_len;
    memset(&s_local_param.both_qos, 0, sizeof(esp_hidd_qos_param_t)); // don't set the qos parameters
    s_local_param.protocol_mode = ESP_HIDD_REPORT_MODE;
```

看一下初始化的结构体是什么，主要是对app参数进行初始化的

```c++
typedef struct
{
    esp_hidd_app_param_t app_param;
    esp_hidd_qos_param_t both_qos;
    uint8_t protocol_mode;
    SemaphoreHandle_t mouse_mutex;
    xTaskHandle mouse_task_hdl;
    uint8_t buffer[4];
    int8_t x_dir;
} local_param_t;

static local_param_t s_local_param = {0};
```

再看一下app对象是怎么定义的

```c++
/**
 * @brief HIDD characteristics for SDP report
 */
typedef struct {
    const char *name;
    const char *description;
    const char *provider;
    uint8_t subclass;
    uint8_t *desc_list;
    int desc_list_len;
} esp_hidd_app_param_t;
```

这里面主要关注一下`subclass`的初始化，他是定义HID设备的类型的，可以看到对应的子类有这么多，对应不同设备

```c
/* sub_class of hid device */
#define ESP_HID_CLASS_UNKNOWN      (0x00<<2)
#define ESP_HID_CLASS_JOS          (0x01<<2)           /* joy stick */
#define ESP_HID_CLASS_GPD          (0x02<<2)           /* game pad */
#define ESP_HID_CLASS_RMC          (0x03<<2)           /* remote control */
#define ESP_HID_CLASS_SED          (0x04<<2)           /* sensing device */
#define ESP_HID_CLASS_DGT          (0x05<<2)           /* Digitizer tablet */
#define ESP_HID_CLASS_CDR          (0x06<<2)           /* card reader */
#define ESP_HID_CLASS_KBD          (0x10<<2)           /* keyboard */
#define ESP_HID_CLASS_MIC          (0x20<<2)           /* pointing device */
#define ESP_HID_CLASS_COM          (0x30<<2)           /* Combo keyboard/pointing */
```

接着就是`desc_list`设备描述符，这里就是普通键鼠HID设备的描述了，后面再详细看这个内容

```c
// a generic mouse descriptor
uint8_t hid_descriptor_mouse_boot_mode[] = {
    0x05, 0x01,                    // USAGE_PAGE (Generic Desktop)
    0x09, 0x02,                    // USAGE (Mouse)
    0xa1, 0x01,                    // COLLECTION (Application)

    0x09, 0x01,                    //   USAGE (Pointer)
    0xa1, 0x00,                    //   COLLECTION (Physical)

    0x05, 0x09,                    //     USAGE_PAGE (Button)
    0x19, 0x01,                    //     USAGE_MINIMUM (Button 1)
    0x29, 0x03,                    //     USAGE_MAXIMUM (Button 3)
    0x15, 0x00,                    //     LOGICAL_MINIMUM (0)
    0x25, 0x01,                    //     LOGICAL_MAXIMUM (1)
    0x95, 0x03,                    //     REPORT_COUNT (3)
    0x75, 0x01,                    //     REPORT_SIZE (1)
    0x81, 0x02,                    //     INPUT (Data,Var,Abs)
    0x95, 0x01,                    //     REPORT_COUNT (1)
    0x75, 0x05,                    //     REPORT_SIZE (5)
    0x81, 0x03,                    //     INPUT (Cnst,Var,Abs)

    0x05, 0x01,                    //     USAGE_PAGE (Generic Desktop)
    0x09, 0x30,                    //     USAGE (X)
    0x09, 0x31,                    //     USAGE (Y)
    0x09, 0x38,                    //     USAGE (Wheel)
    0x15, 0x81,                    //     LOGICAL_MINIMUM (-127)
    0x25, 0x7f,                    //     LOGICAL_MAXIMUM (127)
    0x75, 0x08,                    //     REPORT_SIZE (8)
    0x95, 0x03,                    //     REPORT_COUNT (3)
    0x81, 0x06,                    //     INPUT (Data,Var,Rel)

    0xc0,                          //   END_COLLECTION
    0xc0                           // END_COLLECTION
};
```



qos则是没有设置，这里主要是给SDP服务和I2cap的设置服务质量的

```c
/**
 * @brief HIDD Quality of Service parameters
 */
typedef struct {
    uint8_t service_type;
    uint32_t token_rate;
    uint32_t token_bucket_size;
    uint32_t peak_bandwidth;
    uint32_t access_latency;
    uint32_t delay_variation;
} esp_hidd_qos_param_t;

```



设置HID设备的模式，使用Report的模式，这个地方可能说的不是那么明白，这里其实说这个设备可以在什么时间被加载。如果是boot模式，就是说计算机或者其他设备，在boot阶段就可以完整加载这个设备并且使用了，而report则是表示只有在系统启动以后才能正常使用这个设备。

对应到PC这边就是设置这个设备可以不可以在BIOS中使用，有些设备是不支持BIOS中使用的

```c
/**
 * @brief HID device protocol modes
 */
typedef enum {
    ESP_HIDD_REPORT_MODE = 0x00,
    ESP_HIDD_BOOT_MODE = 0x01,
    ESP_HIDD_UNSUPPORTED_MODE = 0xff
} esp_hidd_protocol_mode_t;
```



#### 常规设备初始化

常规的nvs初始化，简单说就是类似stm32中的flash，esp这边是使用nvs模拟兼容e2prom的操作

```
	ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK( ret );
```



#### 蓝牙初始化

```c
	// 释放ble蓝牙controllor的内存，蓝牙初始化前必须要释放
	ESP_ERROR_CHECK(esp_bt_controller_mem_release(ESP_BT_MODE_BLE));

	// 这里是直接检测是否配置了蓝牙，没有的话会报错提示
	esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    if ((ret = esp_bt_controller_init(&bt_cfg)) != ESP_OK) {
        ESP_LOGE(TAG, "initialize controller failed: %s\n",  esp_err_to_name(ret));
        return;
    }

	// 启用经典蓝牙
    if ((ret = esp_bt_controller_enable(ESP_BT_MODE_CLASSIC_BT)) != ESP_OK) {
        ESP_LOGE(TAG, "enable controller failed: %s\n",  esp_err_to_name(ret));
        return;
    }

	// bluedroid 蓝牙协议栈初始化
    if ((ret = esp_bluedroid_init()) != ESP_OK) {
        ESP_LOGE(TAG, "initialize bluedroid failed: %s\n",  esp_err_to_name(ret));
        return;
    }

	// bluedroid 蓝牙协议栈使能
    if ((ret = esp_bluedroid_enable()) != ESP_OK) {
        ESP_LOGE(TAG, "enable bluedroid failed: %s\n",  esp_err_to_name(ret));
        return;
    }

	// 注册蓝牙回调
    if ((ret = esp_bt_gap_register_callback(esp_bt_gap_cb)) != ESP_OK) {
        ESP_LOGE(TAG, "gap register failed: %s\n", esp_err_to_name(ret));
        return;
    }

```



蓝牙启用的时候，可以看到本身也能支持双模

```c
/**
 * @brief Bluetooth mode for controller enable/disable
 */
typedef enum {
    ESP_BT_MODE_IDLE       = 0x00,   /*!< Bluetooth is not running */
    ESP_BT_MODE_BLE        = 0x01,   /*!< Run BLE mode */
    ESP_BT_MODE_CLASSIC_BT = 0x02,   /*!< Run Classic BT mode */
    ESP_BT_MODE_BTDM       = 0x03,   /*!< Run dual mode */
} esp_bt_mode_t;
```



这个回调已经把状态写死了，是蓝牙使能成功以后，就会回调这个函数

```c
/**
 * @brief           register callback function. This function should be called after esp_bluedroid_enable() completes successfully
 *
 * @return
 *                  - ESP_OK : Succeed
 *                  - ESP_FAIL: others
 */
esp_err_t esp_bt_gap_register_callback(esp_bt_gap_cb_t callback);
```

gap这里负责整个蓝牙配对的过程回调，仔细看一下gap回调的内容

```c
void esp_bt_gap_cb(esp_bt_gap_cb_event_t event, esp_bt_gap_cb_param_t *param)
{
    const char* TAG = "esp_bt_gap_cb";
    switch (event) {
    // 蓝牙匹配授权成功
    case ESP_BT_GAP_AUTH_CMPL_EVT:{
        if (param->auth_cmpl.stat == ESP_BT_STATUS_SUCCESS) {
            ESP_LOGI(TAG, "authentication success: %s", param->auth_cmpl.device_name);
            esp_log_buffer_hex(TAG, param->auth_cmpl.bda, ESP_BD_ADDR_LEN);
        } else {
            ESP_LOGE(TAG, "authentication failed, status:%d", param->auth_cmpl.stat);
        }
        break;
    }
    // 这里定义的是蓝牙配对请求密码
    case ESP_BT_GAP_PIN_REQ_EVT:{
        ESP_LOGI(TAG, "ESP_BT_GAP_PIN_REQ_EVT min_16_digit:%d", param->pin_req.min_16_digit);
        if (param->pin_req.min_16_digit) {
            ESP_LOGI(TAG, "Input pin code: 0000 0000 0000 0000");
            esp_bt_pin_code_t pin_code = {0};
            esp_bt_gap_pin_reply(param->pin_req.bda, true, 16, pin_code);
        } else {
            ESP_LOGI(TAG, "Input pin code: 1234");
            esp_bt_pin_code_t pin_code;
            pin_code[0] = '1';
            pin_code[1] = '2';
            pin_code[2] = '3';
            pin_code[3] = '4';
            esp_bt_gap_pin_reply(param->pin_req.bda, true, 4, pin_code);
        }
        break;
    }

// 如果使能了Secure Simple Pairing 安全配对模式
#if (CONFIG_BT_SSP_ENABLED == true)
    case ESP_BT_GAP_CFM_REQ_EVT:
        ESP_LOGI(TAG, "ESP_BT_GAP_CFM_REQ_EVT Please compare the numeric value: %d", param->cfm_req.num_val);
        esp_bt_gap_ssp_confirm_reply(param->cfm_req.bda, true);
        break;
    case ESP_BT_GAP_KEY_NOTIF_EVT:
        ESP_LOGI(TAG, "ESP_BT_GAP_KEY_NOTIF_EVT passkey:%d", param->key_notif.passkey);
        break;
    case ESP_BT_GAP_KEY_REQ_EVT:
        ESP_LOGI(TAG, "ESP_BT_GAP_KEY_REQ_EVT Please enter passkey!");
        break;
#endif
    case ESP_BT_GAP_MODE_CHG_EVT:
        ESP_LOGI(TAG, "ESP_BT_GAP_MODE_CHG_EVT mode:%d", param->mode_chg.mode);
        break;
    default:
        ESP_LOGI(TAG, "event: %d", event);
        break;
    }
    return;
}
```



具体GAP响应的事件都在这里，`ESP_BT_GAP_MODE_CHG_EVT`在这里没有任何说明，不是很明白到底是切换了什么模式

```c
/// BT GAP callback events
typedef enum {
    ESP_BT_GAP_DISC_RES_EVT = 0,                    /*!< Device discovery result event */
    ESP_BT_GAP_DISC_STATE_CHANGED_EVT,              /*!< Discovery state changed event */
    ESP_BT_GAP_RMT_SRVCS_EVT,                       /*!< Get remote services event */
    ESP_BT_GAP_RMT_SRVC_REC_EVT,                    /*!< Get remote service record event */
    ESP_BT_GAP_AUTH_CMPL_EVT,                       /*!< Authentication complete event */
    ESP_BT_GAP_PIN_REQ_EVT,                         /*!< Legacy Pairing Pin code request */
    ESP_BT_GAP_CFM_REQ_EVT,                         /*!< Security Simple Pairing User Confirmation request. */
    ESP_BT_GAP_KEY_NOTIF_EVT,                       /*!< Security Simple Pairing Passkey Notification */
    ESP_BT_GAP_KEY_REQ_EVT,                         /*!< Security Simple Pairing Passkey request */
    ESP_BT_GAP_READ_RSSI_DELTA_EVT,                 /*!< Read rssi event */
    ESP_BT_GAP_CONFIG_EIR_DATA_EVT,                 /*!< Config EIR data event */
    ESP_BT_GAP_SET_AFH_CHANNELS_EVT,                /*!< Set AFH channels event */
    ESP_BT_GAP_READ_REMOTE_NAME_EVT,                /*!< Read Remote Name event */
    ESP_BT_GAP_MODE_CHG_EVT,
    ESP_BT_GAP_REMOVE_BOND_DEV_COMPLETE_EVT,         /*!< remove bond device complete event */
    ESP_BT_GAP_QOS_CMPL_EVT,                        /*!< QOS complete event */
    ESP_BT_GAP_EVT_MAX,
} esp_bt_gap_cb_event_t;
```



#### HID初始化

```c
    ESP_LOGI(TAG, "setting device name");
	// 设置蓝牙设备名称
    esp_bt_dev_set_device_name("HID Mouse Example");

    ESP_LOGI(TAG, "setting cod major, peripheral");
    esp_bt_cod_t cod;
    cod.major = ESP_BT_COD_MAJOR_DEV_PERIPHERAL;
	// 设置主设备类型
    esp_bt_gap_set_cod(cod ,ESP_BT_SET_COD_MAJOR_MINOR);

    vTaskDelay(2000 / portTICK_PERIOD_MS);

    ESP_LOGI(TAG, "register hid device callback");
	// hid的回调
    esp_bt_hid_device_register_callback(esp_bt_hidd_cb);

    ESP_LOGI(TAG, "starting hid device");
	esp_bt_hid_device_init();

#if (CONFIG_BT_SSP_ENABLED == true)
    /* Set default parameters for Secure Simple Pairing */
    esp_bt_sp_param_t param_type = ESP_BT_SP_IOCAP_MODE;
    esp_bt_io_cap_t iocap = ESP_BT_IO_CAP_NONE;
    esp_bt_gap_set_security_param(param_type, &iocap, sizeof(uint8_t));
#endif

    /*
     * Set default parameters for Legacy Pairing
     * Use variable pin, input pin code when pairing
     */
    esp_bt_pin_type_t pin_type = ESP_BT_PIN_TYPE_VARIABLE;
    esp_bt_pin_code_t pin_code;
    esp_bt_gap_set_pin(pin_type, 0, pin_code);

    print_bt_address();
	ESP_LOGI(TAG, "exiting");
```



这个地方需要注意一下，`vTaskDelay(2000)`和`vTaskDelay(2000 / portTICK_PERIOD_MS)`是不同的时间，前者大概是后者的10倍，前者是基于systick的，而后者是基于物理时间ms的，搞错的话会导致运行时间不正确的。

```
vTaskDelay(2000 / portTICK_PERIOD_MS);
```



设置蓝牙设备类型

```c
/// Class of device
typedef struct {
    uint32_t      reserved_2: 2;                    /*!< undefined */
    uint32_t      minor: 6;                         /*!< minor class */
    uint32_t      major: 5;                         /*!< major class */
    uint32_t      service: 11;                      /*!< service class */
    uint32_t      reserved_8: 8;                    /*!< undefined */
} esp_bt_cod_t;
```



蓝牙设备类字段，这里是鼠标，所以就是外设类型

```c
/// Major device class field of Class of Device
typedef enum {
    ESP_BT_COD_MAJOR_DEV_MISC                = 0,    /*!< Miscellaneous */
    ESP_BT_COD_MAJOR_DEV_COMPUTER            = 1,    /*!< Computer */
    ESP_BT_COD_MAJOR_DEV_PHONE               = 2,    /*!< Phone(cellular, cordless, pay phone, modem */
    ESP_BT_COD_MAJOR_DEV_LAN_NAP             = 3,    /*!< LAN, Network Access Point */
    ESP_BT_COD_MAJOR_DEV_AV                  = 4,    /*!< Audio/Video(headset, speaker, stereo, video display, VCR */
    ESP_BT_COD_MAJOR_DEV_PERIPHERAL          = 5,    /*!< Peripheral(mouse, joystick, keyboard) */
    ESP_BT_COD_MAJOR_DEV_IMAGING             = 6,    /*!< Imaging(printer, scanner, camera, display */
    ESP_BT_COD_MAJOR_DEV_WEARABLE            = 7,    /*!< Wearable */
    ESP_BT_COD_MAJOR_DEV_TOY                 = 8,    /*!< Toy */
    ESP_BT_COD_MAJOR_DEV_HEALTH              = 9,    /*!< Health */
    ESP_BT_COD_MAJOR_DEV_UNCATEGORIZED       = 31,   /*!< Uncategorized: device not specified */
} esp_bt_cod_major_dev_t;

```

cod结构体

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208260047025.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208260048067.png)

Major有以下几种：

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208260054698.png)

Minor的类型比较多，他是根据Major的不同而不同的

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208260050816.png)

第六位和第七位特指了鼠标、键盘或者混合设备或者两者都不是的设备，算是大的设备种类吧，然后在这个种类的情况下，再叠加上第2345位决定这个设备具体是哪种。Minor一般不是很重要，很多地方都会省略他。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208260051546.png)

最后是一点设置配对pin的类型，如果设置成了`ESP_BT_PIN_TYPE_VARIABLE`，那么pin最终是由GAP部分给出来，否则的话就是固定值，不会回调GAP部分的pin request

```
typedef enum{
    ESP_BT_PIN_TYPE_VARIABLE = 0,                       /*!< Refer to BTM_PIN_TYPE_VARIABLE */
    ESP_BT_PIN_TYPE_FIXED    = 1,                       /*!< Refer to BTM_PIN_TYPE_FIXED */
} esp_bt_pin_type_t;

```



HID的回调函数，整个HID的事务处理就看这个里面了

```c
void esp_bt_hidd_cb(esp_hidd_cb_event_t event, esp_hidd_cb_param_t *param)
{
    static const char* TAG = "esp_bt_hidd_cb";
    switch (event) {
    case ESP_HIDD_INIT_EVT:
        // HID初始化的时候，使用了前面填充的app和qos的设置
        if (param->init.status == ESP_HIDD_SUCCESS) {
            ESP_LOGI(TAG, "setting hid parameters");
            // 当注册成功以后就会触发下面的事件ESP_HIDD_REGISTER_APP_EVT
            esp_bt_hid_device_register_app(&s_local_param.app_param, &s_local_param.both_qos, &s_local_param.both_qos);
        } else {
            ESP_LOGE(TAG, "init hidd failed!");
        }
        break;
    case ESP_HIDD_DEINIT_EVT:
        break;
    case ESP_HIDD_REGISTER_APP_EVT:
        // 当HID初始化成功以后，调用gap，设置为可连接状态并且可以被发现
        if (param->register_app.status == ESP_HIDD_SUCCESS) {
            ESP_LOGI(TAG, "setting hid parameters success!");
            ESP_LOGI(TAG, "setting to connectable, discoverable");
            esp_bt_gap_set_scan_mode(ESP_BT_CONNECTABLE, ESP_BT_GENERAL_DISCOVERABLE);
            if (param->register_app.in_use && param->register_app.bd_addr != NULL) {
                ESP_LOGI(TAG, "start virtual cable plug!");
                // 当连接成功以后，会回调下面的ESP_HIDD_OPEN_EVT
                esp_bt_hid_device_connect(param->register_app.bd_addr);
            }
        } else {
            ESP_LOGE(TAG, "setting hid parameters failed!");
        }
        break;
    case ESP_HIDD_UNREGISTER_APP_EVT:
        if (param->unregister_app.status == ESP_HIDD_SUCCESS) {
            ESP_LOGI(TAG, "unregister app success!");
        } else {
            ESP_LOGE(TAG, "unregister app failed!");
        }
        break;
    case ESP_HIDD_OPEN_EVT:
        if (param->open.status == ESP_HIDD_SUCCESS) {
            if (param->open.conn_status == ESP_HIDD_CONN_STATE_CONNECTING) {
                ESP_LOGI(TAG, "connecting...");
            } else if (param->open.conn_status == ESP_HIDD_CONN_STATE_CONNECTED) {
                ESP_LOGI(TAG, "connected to %02x:%02x:%02x:%02x:%02x:%02x", param->open.bd_addr[0],
                         param->open.bd_addr[1], param->open.bd_addr[2], param->open.bd_addr[3], param->open.bd_addr[4],
                         param->open.bd_addr[5]);
                // 当连接建立以后，启动hid任务，然后设置为不可连接状态并且不可发现
                bt_app_task_start_up();
                ESP_LOGI(TAG, "making self non-discoverable and non-connectable.");
                esp_bt_gap_set_scan_mode(ESP_BT_NON_CONNECTABLE, ESP_BT_NON_DISCOVERABLE);
            } else {
                ESP_LOGE(TAG, "unknown connection status");
            }
        } else {
            ESP_LOGE(TAG, "open failed!");
        }
        break;
    case ESP_HIDD_CLOSE_EVT:
        ESP_LOGI(TAG, "ESP_HIDD_CLOSE_EVT");
        if (param->close.status == ESP_HIDD_SUCCESS) {
            if (param->close.conn_status == ESP_HIDD_CONN_STATE_DISCONNECTING) {
                ESP_LOGI(TAG, "disconnecting...");
            } else if (param->close.conn_status == ESP_HIDD_CONN_STATE_DISCONNECTED) {
                // hid接口关闭以后，停止任务，再次切换为可搜索状态
                ESP_LOGI(TAG, "disconnected!");
                bt_app_task_shut_down();
                ESP_LOGI(TAG, "making self discoverable and connectable again.");
                esp_bt_gap_set_scan_mode(ESP_BT_CONNECTABLE, ESP_BT_GENERAL_DISCOVERABLE);
            } else {
                ESP_LOGE(TAG, "unknown connection status");
            }
        } else {
            ESP_LOGE(TAG, "close failed!");
        }
        break;
    case ESP_HIDD_SEND_REPORT_EVT:
        // report发送完成回调标志
        ESP_LOGI(TAG, "ESP_HIDD_SEND_REPORT_EVT id:0x%02x, type:%d", param->send_report.report_id,
                 param->send_report.report_type);
        break;
    case ESP_HIDD_REPORT_ERR_EVT:
        ESP_LOGI(TAG, "ESP_HIDD_REPORT_ERR_EVT");
        break;
    case ESP_HIDD_GET_REPORT_EVT:
        // 收到report
        ESP_LOGI(TAG, "ESP_HIDD_GET_REPORT_EVT id:0x%02x, type:%d, size:%d", param->get_report.report_id,
                 param->get_report.report_type, param->get_report.buffer_size);
        if (check_report_id_type(param->get_report.report_id, param->get_report.report_type)) {
            // 这里还用信号量锁了一下，防止多线程冲突
            xSemaphoreTake(s_local_param.mouse_mutex, portMAX_DELAY);
            if (s_local_param.protocol_mode == ESP_HIDD_REPORT_MODE) {
                // 不同设备模式，发送的report id不同
                esp_bt_hid_device_send_report(param->get_report.report_type, 0x00, 4, s_local_param.buffer);
            } else if (s_local_param.protocol_mode == ESP_HIDD_BOOT_MODE) {
                esp_bt_hid_device_send_report(param->get_report.report_type, 0x02, 3, s_local_param.buffer);
            }
            xSemaphoreGive(s_local_param.mouse_mutex);
        } else {
            ESP_LOGE(TAG, "check_report_id failed!");
        }
        break;
    case ESP_HIDD_SET_REPORT_EVT:
        ESP_LOGI(TAG, "ESP_HIDD_SET_REPORT_EVT");
        break;
    case ESP_HIDD_SET_PROTOCOL_EVT:
        ESP_LOGI(TAG, "ESP_HIDD_SET_PROTOCOL_EVT");
        // 这里是处理HID切换设备模式
        if (param->set_protocol.protocol_mode == ESP_HIDD_BOOT_MODE) {
            ESP_LOGI(TAG, "  - boot protocol");
            xSemaphoreTake(s_local_param.mouse_mutex, portMAX_DELAY);
            s_local_param.x_dir = -1;
            xSemaphoreGive(s_local_param.mouse_mutex);
        } else if (param->set_protocol.protocol_mode == ESP_HIDD_REPORT_MODE) {
            ESP_LOGI(TAG, "  - report protocol");
        }
        xSemaphoreTake(s_local_param.mouse_mutex, portMAX_DELAY);
        s_local_param.protocol_mode = param->set_protocol.protocol_mode;
        xSemaphoreGive(s_local_param.mouse_mutex);
        break;
    case ESP_HIDD_INTR_DATA_EVT:
        ESP_LOGI(TAG, "ESP_HIDD_INTR_DATA_EVT");
        break;
    case ESP_HIDD_VC_UNPLUG_EVT:
        ESP_LOGI(TAG, "ESP_HIDD_VC_UNPLUG_EVT");
        if (param->vc_unplug.status == ESP_HIDD_SUCCESS) {
            if (param->close.conn_status == ESP_HIDD_CONN_STATE_DISCONNECTED) {
                ESP_LOGI(TAG, "disconnected!");
                // 断开了HID 再次变成可检测状态
                bt_app_task_shut_down();
                ESP_LOGI(TAG, "making self discoverable and connectable again.");
                esp_bt_gap_set_scan_mode(ESP_BT_CONNECTABLE, ESP_BT_GENERAL_DISCOVERABLE);
            } else {
                ESP_LOGE(TAG, "unknown connection status");
            }
        } else {
            ESP_LOGE(TAG, "close failed!");
        }
        break;
    default:
        break;
    }
}
```



HID的task

```c

void bt_app_task_start_up(void)
{
    s_local_param.mouse_mutex = xSemaphoreCreateMutex();
    memset(s_local_param.buffer, 0, 4);
    xTaskCreate(mouse_move_task, "mouse_move_task", 2 * 1024, NULL, configMAX_PRIORITIES - 3, &s_local_param.mouse_task_hdl);
    return;
}

// move the mouse left and right
void mouse_move_task(void* pvParameters) {
    const char* TAG = "mouse_move_task";

    ESP_LOGI(TAG, "starting");
    for(;;) {
        s_local_param.x_dir = 1;
        int8_t step = 10;
        for (int i = 0; i < 2; i++) {
            xSemaphoreTake(s_local_param.mouse_mutex, portMAX_DELAY);
            s_local_param.x_dir *= -1;
            // 这里主要是反向鼠标移动的方向，还有移动鼠标位置
            xSemaphoreGive(s_local_param.mouse_mutex);
            for (int j = 0; j < 100; j++) {
                send_mouse(0, s_local_param.x_dir * step, 0, 0);
                vTaskDelay(50 / portTICK_PERIOD_MS);
            }
        }
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

// send the buttons, change in x, and change in y
void send_mouse(uint8_t buttons, char dx, char dy, char wheel)
{
    // 比较简单，就是填充report，然后调用发送
    xSemaphoreTake(s_local_param.mouse_mutex, portMAX_DELAY);
    if (s_local_param.protocol_mode ==  ESP_HIDD_REPORT_MODE) {
        s_local_param.buffer[0] = buttons;
        s_local_param.buffer[1] = dx;
        s_local_param.buffer[2] = dy;
        s_local_param.buffer[3] = wheel;
        esp_bt_hid_device_send_report(ESP_HIDD_REPORT_TYPE_INTRDATA, 0x00, 4, s_local_param.buffer);
    } else if (s_local_param.protocol_mode == ESP_HIDD_BOOT_MODE) {
        s_local_param.buffer[0] = buttons;
        s_local_param.buffer[1] = dx;
        s_local_param.buffer[2] = dy;
        esp_bt_hid_device_send_report(ESP_HIDD_REPORT_TYPE_INTRDATA, BOOT_PROTO_MOUSE_RPT_ID, 3, s_local_param.buffer);
    }
    xSemaphoreGive(s_local_param.mouse_mutex);
}

void bt_app_task_shut_down(void)
{
    if (s_local_param.mouse_task_hdl) {
        vTaskDelete(s_local_param.mouse_task_hdl);
        s_local_param.mouse_task_hdl = NULL;
    }

    if (s_local_param.mouse_mutex) {
        vSemaphoreDelete(s_local_param.mouse_mutex);
        s_local_param.mouse_mutex = NULL;
    }
    return;
}
```

这里需要注意两个东西，`send_mouse`是发送了report，而回调中的`ESP_HIDD_SEND_REPORT_EVT`则是对应一个report发送完成的事件，如果收到了这个，说明这个report发送ok了。否则可能这个report就丢了或者怎样了。

```
case ESP_HIDD_SEND_REPORT_EVT:
    // report发送完成回调标志
    ESP_LOGI(TAG, "ESP_HIDD_SEND_REPORT_EVT id:0x%02x, type:%d", param->send_report.report_id,
    param->send_report.report_type);
send_mouse
```

同时，也要注意，其实这个report无法连续发送多个，会出现直接崩溃的情况。正确应该是一个report发完，有了event回调以后，再发下一个。稍微注意一下官方demo中每个report其实等了50ms，实际上如果测试的话，会发现，大概在20ms以内，就能收到event了。



report还有一个特点，鼠标这里可能体现不出来，如果是类似手柄一类的东西，比如这次的report和上次是相同的，对于不同的host，可能处理方式不一样。有的host可能会持续执行之前操作，有的可能会直接不执行任何操作，比如一个button长按，发送一次report和连续发送3次report，没有区别，实际host表现出来的结果是相同的。而有的host则是，如果你发了一个report，没有后续，超过一定时间，则不会继续执行这个report的内容了。



前面还有一个地方，收到report以后，这里对应做了一个解析吧

```c
bool check_report_id_type(uint8_t report_id, uint8_t report_type)
{
    bool ret = false;
    xSemaphoreTake(s_local_param.mouse_mutex, portMAX_DELAY);
    do {
        if (report_type != ESP_HIDD_REPORT_TYPE_INPUT) {
            break;
        }
        if (s_local_param.protocol_mode == ESP_HIDD_BOOT_MODE) {
            if (report_id == BOOT_PROTO_MOUSE_RPT_ID) {
                ret = true;
                break;
            }
        } else {
            if (report_id == 0) {
                ret = true;
                break;
            }
        }
    } while (0);

    if (!ret) {
        if (s_local_param.protocol_mode == ESP_HIDD_BOOT_MODE) {
            esp_bt_hid_device_report_error(ESP_HID_PAR_HANDSHAKE_RSP_ERR_INVALID_REP_ID);
        } else {
            esp_bt_hid_device_report_error(ESP_HID_PAR_HANDSHAKE_RSP_ERR_INVALID_REP_ID);
        }
    }
    xSemaphoreGive(s_local_param.mouse_mutex);
    return ret;
}
```

到这里基本上整个HID 鼠标就看完了。



#### 双核相关

esp32是双核的，所以创建任务的时候就会出现任务跑在哪个核心的问题。

简单说有两个核心，一个是PRO_CPU，一个是APP_CPU，底层是FreeRTOS，所以当挂起调度器的时候，只会挂起对应的那个核心调度，而不会影响到另一个核心。同时，双核是SystemTick也是独立的，中断也独立，互不影响。

如下就是普通的创建任务和将任务绑定到某个核心上的操作

```
xTaskCreate(startBlink, "blink_task", 1024, NULL, 1, &BlinkHandle);
xTaskCreatePinnedToCore(send_task, "send_task", 2048, NULL, 2, &SendingHandle, 0);
```

最后一个参数至关重要，决定这个任务创建在哪个核上.PRO_CPU 为 0, APP_CPU 为 1,或者 tskNO_AFFINITY 允许任务在两者上运行.

```
  xTaskCreatePinnedToCore(Task1, "Task1", 10000, NULL, 1, NULL,  0);  
  xTaskCreatePinnedToCore(Task2, "Task2", 10000, NULL, 1, NULL,  1);
```

一般来说PRO_CPU，字面含义，WIIF和蓝牙的协议栈都是在这里跑的，可能用户代码进程被中断或者延迟，所以平常用户代码应该写在APP_CPU上，这样就和协议栈的繁忙工作流区分开了，进而可以充分利用资源。



#### HID Report Descriptor

HID的Report Descriptor要怎么写，也记录一下

首先Descriptor必须有`Usage Page`说明这个HID的大类，比如这里指代USB通用设备

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208280216055.png)



具体可以参考这里，usb规范

> https://www.usb.org/sites/default/files/hut1_21_0.pdf#page=16

```
    0x05, 0x01,                    // USAGE_PAGE (Generic Desktop)
    0x09, 0x02,                    // USAGE (Mouse)
    0xA1, 0x01,                    # Collection (Application)    
```

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208280217580.png)

开头的USAGE相当于是USAGE_PAGE的详细描述，说明当前设备是鼠标

但是由于现代鼠标都不是只有一个功能，可能除了基础鼠标功能还有什么额外的功能，所以要分别描述每个部分。

Collection也分类型，一般是Application统领全局，然后再用Physical在其内部做进一步区分，同时每个Collection要有对应的开始和结束

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208280221837.png)

```
    0xA1, 0x01,     # Collection (Application)
    0xXX, 0xXX,     # USAGE
    0xa1, 0x00,                    //   COLLECTION (Physical)
	...  
	0xC0,           # End Collection (Physical)
	...
    0xC0,           # End Collection (Application)
```

针对每个子Collection都需要有一个具体描述，所以还需要用一次USAGE

Collection可以嵌套，Physical Collection 则是指相当于是子Collection，他主要是说明在一个Applicaion中可能会有多个传感器或者多个数据集合，那么就需要再定义一层。

```
0xa1, 0x00,                    //   COLLECTION (Physical)
0xC0,           # End Collection
```



由于有多个Collection，不同的Collection的Report是不同的，所以就要单独设置每一个Report，并且用Report Id 区分。当然也可以只有一个Report，那么这种情况下必须要写Report Id，直接使用Collection 代替即可

```
    # report map for keyboard
    0x05, 0x01,     # Usage Page (Generic Desktop)
    0x09, 0x06,     # Usage (Keyboard)
    0xA1, 0x01,     # Collection (Application)
    0x85, 0x01,     #     Report ID (1)
    ...
    0xC0,           # End Collection
    # report map for Cosumer Control (media keys)
    0x05, 0x0C,       # Usage Page (CONSUMER PAGE)
    0x09, 0x01,       # Usage (Consumer Control)
    0xA1, 0x01,       # Collection (Application)
    0x85, 0x02,       #     here Report ID (2)
    ...
    0xC0,             # End Collection
```

这里就存在两个report，一个是01，一个是02，分别发送各自的内容，每一个Report都需要被Collection包起来。



再接着就是report的内容是如何定义的，Size定义了一个元数据的大小，而Count定义了这个元有几个。

这里则是表示有3个元数据，并且每个元数据的大小是1bit

```
    0x95, 0x03,                    //     REPORT_COUNT (3)
    0x75, 0x01,                    //     REPORT_SIZE (1)
```

除了说明Report的组成，还要说明这几个元数据是用来干嘛的，所以在开头的时候会加上说明，这里就说明是一个按键

```
 0x05, 0x09,                    //     USAGE_PAGE (Button)
```

同时还需要说明，这个元数据最小值和最大值都是多少，由于是Bit，这里表示这个值最小是0，最大是1。如果是字节那就需要自定义了

```
    0x15, 0x00,                    //     LOGICAL_MINIMUM (0)
    0x25, 0x01,                    //     LOGICAL_MAXIMUM (1)
```

除了说明了元数据的值，还需要说明你给的这个值对应到Host的时候，他们表示什么

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208280240998.png)

根据键盘的Keyboard Page的定义，这里说明这三个元数据对应键盘的1-3，指代没啥用的按键

```
    0x19, 0x01,                    //     USAGE_MINIMUM (Button 1)
    0x29, 0x03,                    //     USAGE_MAXIMUM (Button 3)
```

上面还缺少一个描述，就是Logical元数据和Usage的按键，他们是怎么对应的，这个值是不是会变的，还是固定的，是一个bit来表示还是2个bit又或者是1个字节来表示的，这些都需要描述，Input就是描述这个东西的

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208280245458.png)

实际描述这个元数据只需要1个report size（1bit），所以是`0x81`

首先按键肯定是会变的，所以是Variable，其次这里的按键时绝对，而不是相对值，所以是Absolute，其他位用不到，所以都是0，那么其实就是0x02了

```
010
```

结合在一起，就是这样了

```
0x81, 0x02,                    //     INPUT (Cnst,Var,Abs)
```

由于这个元数据是使用Bit来表示的，所以他们实际只用了3bit，但是最小长度是字节，则要用1字节大小存储。那么还有5个bit没有定义，如果没用到的话，也需要写上对应的说明，所以后续会有定义一个元数据，他的大小是5，数量是1，实际映射时，是使用1个report size（5bits），然后是Const类型的变量，不会变的

```
    0x95, 0x01,                    //     REPORT_COUNT (1)
    0x75, 0x05,                    //     REPORT_SIZE (5)
    0x81, 0x03,                    //     INPUT (Cnst,Var,Abs)
```

这样就把一个report完整定义好了。

继续定义鼠标的X、Y和滚轮值

```
    0x05, 0x01,                    //     USAGE_PAGE (Generic Desktop)
    0x09, 0x30,                    //     USAGE (X)
    0x09, 0x31,                    //     USAGE (Y)
    0x09, 0x38,                    //     USAGE (Wheel)
    0x15, 0x81,                    //     LOGICAL_MINIMUM (-127)
    0x25, 0x7f,                    //     LOGICAL_MAXIMUM (127)
    0x75, 0x08,                    //     REPORT_SIZE (8)
    0x95, 0x03,                    //     REPORT_COUNT (3)
    0x81, 0x06,                    //     INPUT (Data,Var,Rel)
```

按照上面的说明，X、Y、Wheel最大时127最小时-127，同时一个数据使用8bit，一共3个数据，并且这个数据是可变的、相对值，而不是绝对值。



将上面的结合在一起，就得到了最终的mouse descriptor

```
// a generic mouse descriptor
uint8_t hid_descriptor_mouse_boot_mode[] = {
    0x05, 0x01,                    // USAGE_PAGE (Generic Desktop)
    0x09, 0x02,                    // USAGE (Mouse)
    0xa1, 0x01,                    // COLLECTION (Application)

    0x09, 0x01,                    //   USAGE (Pointer)
    0xa1, 0x00,                    //   COLLECTION (Physical)

    0x05, 0x09,                    //     USAGE_PAGE (Button)
    0x19, 0x01,                    //     USAGE_MINIMUM (Button 1)
    0x29, 0x03,                    //     USAGE_MAXIMUM (Button 3)
    0x15, 0x00,                    //     LOGICAL_MINIMUM (0)
    0x25, 0x01,                    //     LOGICAL_MAXIMUM (1)
    0x95, 0x03,                    //     REPORT_COUNT (3)
    0x75, 0x01,                    //     REPORT_SIZE (1)
    0x81, 0x02,                    //     INPUT (Data,Var,Abs)
    0x95, 0x01,                    //     REPORT_COUNT (1)
    0x75, 0x05,                    //     REPORT_SIZE (5)
    0x81, 0x03,                    //     INPUT (Cnst,Var,Abs)

    0x05, 0x01,                    //     USAGE_PAGE (Generic Desktop)
    0x09, 0x30,                    //     USAGE (X)
    0x09, 0x31,                    //     USAGE (Y)
    0x09, 0x38,                    //     USAGE (Wheel)
    0x15, 0x81,                    //     LOGICAL_MINIMUM (-127)
    0x25, 0x7f,                    //     LOGICAL_MAXIMUM (127)
    0x75, 0x08,                    //     REPORT_SIZE (8)
    0x95, 0x03,                    //     REPORT_COUNT (3)
    0x81, 0x06,                    //     INPUT (Data,Var,Rel)

    0xc0,                          //   END_COLLECTION
    0xc0                           // END_COLLECTION
};
```



## 测试

看完以后，编译烧写测试了一下，基本ok

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208240140345.png)

连接以后，鼠标开始左右平移



## Summary

剩下就可以开始基于这个做修改，直接修改为Joycon了



## Quote

> https://github.com/darthcloud/BlueRetro
>
> https://blog.csdn.net/lum250/article/details/123012522
>
> https://docs.espressif.com/projects/esp-idf/zh_CN/release-v4.0/api-reference/bluetooth/esp_gap_bt.html
>
> https://blog.csdn.net/XiaoXiaoPengBo/article/details/108366776
>
> https://blog.csdn.net/ailta/article/details/106465015
>
> https://hackmd.io/@meebox/By9V9AJPd
>
> https://www.cnblogs.com/AlwaysOnLines/p/4552840.html

