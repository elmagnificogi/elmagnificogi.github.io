---
layout:     post
title:      "ESP32经典蓝牙HID开发"
subtitle:   "Classic Bluetooth Hid"
date:       2022-08-21
update:     2022-08-24
author:     "elmagnifico"
header-img: "img/y5.jpg"
catalog:    true
tags:
    - ESP32
---

## Forward

看一下官方的ESP32 经典蓝牙 HID是什么样的架构，以及如何修改HID



#### 硬件

需要注意的是ESP32，必须是不带任何后缀的，才具有双模，S和C系列的都是单BLE蓝牙，无法使用经典蓝牙

![image-20220824011800461](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202208240118531.png)



## Example

![image-20220821231423318](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202208212314350.png)

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

接着就是`desc_list`设备描述符，这里就是普通键鼠HID设备的描述了

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
        // 需要发送report
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



## 测试

看完以后，编译烧写测试了一下，基本ok

![image-20220824014046300](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202208240140345.png)

连接以后，鼠标开始左右平移



## Summary

剩下就可以开始基于这个做修改，直接修改为Joycon了



## Quote

> https://github.com/darthcloud/BlueRetro
>
> https://blog.csdn.net/lum250/article/details/123012522
>
> https://docs.espressif.com/projects/esp-idf/zh_CN/release-v4.0/api-reference/bluetooth/esp_gap_bt.html

