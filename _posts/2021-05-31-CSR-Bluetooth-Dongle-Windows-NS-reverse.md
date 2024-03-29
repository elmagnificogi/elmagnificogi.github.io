---
layout:     post
title:      "CSR蓝牙适配器在windows上模拟NS手柄之逆向工程"
subtitle:   "crack,bluetooth dongle"
date:       2021-05-31
update:     2021-06-02
author:     "elmagnifico"
header-img: "img/mqtt.jpg"
catalog:    true
mathjax:    false
tags:
    - Nintendo Switch
    - Crack
---

## Foreword

继续上篇，逆向AutoTalismanMelding，看一下他蓝牙控制具体是怎么实现的。实际上AutoTalismanMelding可以看作是NX Macro Controller分化出来的一个子集，所以直接看AutoTalismanMelding就能找到所有蓝牙的功能。



## 表象

首先观察CSR8510 A10的驱动，可以看到驱动提供商是libwdi

![](https://img.elmagnifico.tech/static/upload/elmagnifico/TvldUDxVf9NRgE8.png)

> https://github.com/pbatard/libwdi
>
> A Windows Driver Installation library for USB devices
>
> - Automated inf creation, using reported USB device name
> - Automated catalog file creation and signing, using autogenerated certificate
> - Automated driver files extraction, for both 32 and 64 bit platforms
> - Automated driver installation, including UAC elevation where necessary
> - Single library embedding all the required files
> - Supports Windows platform from Windows 7 to Windows 10
> - Embedding of WinUSB, libusb0.sys or libusbK.sys, USB Serial (CDC) or your own USB drivers (eg. WHQL)
> - Full locale support with UTF-8 API strings and UTF-16 autogenerated inf files
> - Resolution of USB Vendor IDs, based on the data maintained by Stephen J. Gowdy at http://www.linux-usb.org/usb.ids
> - Fully Open Source (LGPL v3), with multiple sample applications
> - Supports MinGW32, MinGW-w64, Visual Studio, WDK

看起来很牛逼的usb安装库，通过描述大概是用来安装对应的驱动的库，类似于打包程序？由于不是很了解windows这边的机制，不太清楚具体到底是怎么做的。

CSR8510 A10的驱动本质上是把蓝牙适配器变成了一个串口设备，然后通过串口控制CSR8510 A10，进而完成HID设备的模拟？如果是这样的话那也得CSR8510本身固件里就支持这样的操作才能做到。



## 逆向



## 逆向工具

- dnSpy 



首先用dnSpy 拖入AutoTalismanMelding，看看结构

```c#
// AutoTalismanMelding
// 
// 类型:
// 
// BitmapAccessor
// Bluetooth制御セットアップ
// GamePadInput
// GlobalVar
// MainForm
// MessageBoxCheckFlags
// MyNumericUpDown
// NMC
// Program
// ResourcesImage
// SerialConnecter
// SkillData
// SkillSearchData
// SlotSearchData
// TalismanData
// TalismanSearchData
// Util
```

从名字上看，蓝牙相关的主要就是这个`Bluetooth制御セットアップ`，这个类英文的话应该叫BluetoothConfigSetup。



#### 调试运行

![](https://img.elmagnifico.tech/static/upload/elmagnifico/w1VeMqUyp2IQXRv.png)

从入口点开始调试，看看有啥关键点，~~发现form的load并不能断点，只好跳过这一步~~，用管理员权限打开，并且dnSpy是64位的，否则会出现无法断点或者是无法附加到进程的问题。



#### Bluetooth制御セットアップ

```
private List<Bluetooth制御セットアップ.USBDeviceInfo> usbDevices = new List<Bluetooth制御セットアップ.USBDeviceInfo>();
```

看一下Bluetooth制御セットアップ类，发现他是个form，也就是对应的第一次安装蓝牙驱动设备的面板

![](https://img.elmagnifico.tech/static/upload/elmagnifico/fiK5keFQTwz6ME2.png)

这里就是加载各种usb设备

```c#
// Token: 0x0400001D RID: 29
		private List<Bluetooth制御セットアップ.USBDeviceInfo> usbDevices = new List<Bluetooth制御セットアップ.USBDeviceInfo>();

		// Token: 0x06000023 RID: 35 RVA: 0x00002BF0 File Offset: 0x00000DF0
		private void Bluetooth制御セットアップ_Load(object sender, EventArgs e)
		{
			this.usbDevices = Bluetooth制御セットアップ.GetUSBDevices();
			foreach (Bluetooth制御セットアップ.USBDeviceInfo usbdeviceInfo in this.usbDevices)
			{
				Console.WriteLine(usbdeviceInfo.DeviceID);
				Console.WriteLine(usbdeviceInfo.PnpDeviceID);
				Console.WriteLine(usbdeviceInfo.Description);
				this.listBox1.Items.Add(usbdeviceInfo.Description);
			}
		}
```

这个USBDeviceInfo的类如下

```c#
		private class USBDeviceInfo
		{
			// Token: 0x0600002C RID: 44 RVA: 0x0000365B File Offset: 0x0000185B
			public USBDeviceInfo(string deviceID, string pnpDeviceID, string description)
			{
				this.DeviceID = deviceID;
				this.PnpDeviceID = pnpDeviceID;
				this.Description = description;
			}

			// Token: 0x17000007 RID: 7
			// (get) Token: 0x0600002D RID: 45 RVA: 0x00003678 File Offset: 0x00001878
			// (set) Token: 0x0600002E RID: 46 RVA: 0x00003680 File Offset: 0x00001880
			public string DeviceID { get; private set; }

			// Token: 0x17000008 RID: 8
			// (get) Token: 0x0600002F RID: 47 RVA: 0x00003689 File Offset: 0x00001889
			// (set) Token: 0x06000030 RID: 48 RVA: 0x00003691 File Offset: 0x00001891
			public string PnpDeviceID { get; private set; }

			// Token: 0x17000009 RID: 9
			// (get) Token: 0x06000031 RID: 49 RVA: 0x0000369A File Offset: 0x0000189A
			// (set) Token: 0x06000032 RID: 50 RVA: 0x000036A2 File Offset: 0x000018A2
			public string Description { get; private set; }
		}
```

关键是GetUSBDevices，通过managementObjectCollection，然后筛选出了Win32_PnPEntity的设备。

如果是符合以下描述的都被选中

```
.*Bluetooth.*Adapter.*
.*Bluetooth.*Radio.*
.*Bluetooth.*ラジオ.*
.*Bluetooth.*アダプタ.*
.*CSR.*Bluetooth.*
.*TOSHIBA.*Bluetooth.*
.*CSR.*Bluetooth.*
.*Intel.*Wireless.*Bluetooth.*
.*インテル.*ワイヤレス.*Bluetooth.*
```

源码如下：

```c#
		private static List<Bluetooth制御セットアップ.USBDeviceInfo> GetUSBDevices()
		{
			List<Bluetooth制御セットアップ.USBDeviceInfo> list = new List<Bluetooth制御セットアップ.USBDeviceInfo>();
			ManagementObjectCollection managementObjectCollection;
			using (ManagementObjectSearcher managementObjectSearcher = new ManagementObjectSearcher("Select * From Win32_PnPEntity"))
			{
				managementObjectCollection = managementObjectSearcher.Get();
			}
			foreach (ManagementBaseObject managementBaseObject in managementObjectCollection)
			{
				string text = (string)managementBaseObject.GetPropertyValue("Description");
				if (!string.IsNullOrEmpty(text) && (Regex.IsMatch(text, ".*Bluetooth.*Adapter.*") || Regex.IsMatch(text, ".*Bluetooth.*Radio.*") || Regex.IsMatch(text, ".*Bluetooth.*ラジオ.*") || Regex.IsMatch(text, ".*Bluetooth.*アダプタ.*") || Regex.IsMatch(text, ".*CSR.*Bluetooth.*") || Regex.IsMatch(text, ".*TOSHIBA.*Bluetooth.*") || Regex.IsMatch(text, ".*CSR.*Bluetooth.*") || Regex.IsMatch(text, ".*Intel.*Wireless.*Bluetooth.*") || Regex.IsMatch(text, ".*インテル.*ワイヤレス.*Bluetooth.*")))
				{
					Console.WriteLine("--------------------------");
					Console.WriteLine(managementBaseObject.ClassPath.ClassName);
					Console.WriteLine("--------------------------");
					foreach (PropertyData propertyData in managementBaseObject.Properties)
					{
						string name = propertyData.Name;
						string str = "=";
						object value = propertyData.Value;
						Console.WriteLine(name + str + ((value != null) ? value.ToString() : null));
					}
					Console.WriteLine("--------------------------");
					foreach (QualifierData qualifierData in managementBaseObject.Qualifiers)
					{
						string name2 = qualifierData.Name;
						string str2 = "=";
						object value2 = qualifierData.Value;
						Console.WriteLine(name2 + str2 + ((value2 != null) ? value2.ToString() : null));
					}
					Console.WriteLine("--------------------------");
					foreach (PropertyData propertyData2 in managementBaseObject.SystemProperties)
					{
						string name3 = propertyData2.Name;
						string str3 = "=";
						object value3 = propertyData2.Value;
						Console.WriteLine(name3 + str3 + ((value3 != null) ? value3.ToString() : null));
					}
					if (managementBaseObject.GetPropertyValue("Name") != null)
					{
						list.Add(new Bluetooth制御セットアップ.USBDeviceInfo((string)managementBaseObject.GetPropertyValue("DeviceID"), (string)managementBaseObject.GetPropertyValue("ClassGuid"), (string)managementBaseObject.GetPropertyValue("Name")));
					}
				}
			}
			managementObjectCollection.Dispose();
			return list;
		}
```



接着就是选择了对应的蓝牙设备，然后替换驱动，看一下他是怎么做的

```c#
private void button1_Click(object sender, EventArgs e)
		{
			if (MessageBox.Show("注意！\r\n制御用のドライバをインストールすることにより、本来の用途での使用が行えなくなる可能性があります。\r\n本当にインストールを続行してもよろしいですか？", "警告", MessageBoxButtons.YesNo, MessageBoxIcon.Exclamation) == DialogResult.Yes)
			{
				try
				{
					string deviceID = this.usbDevices[this.listBox1.SelectedIndex].DeviceID;
					int VID = int.Parse(deviceID.Substring(deviceID.IndexOf("VID_") + 4, 4), NumberStyles.HexNumber);
					int PID = int.Parse(deviceID.Substring(deviceID.IndexOf("PID_") + 4, 4), NumberStyles.HexNumber);
					Task.Factory.StartNew(delegate()
					{
						SerialConnecter.DriverReplace(VID, PID);
					});
					base.Close();
				}
				catch
				{
					MessageBox.Show("ドライバの置換に失敗しました。", "エラー", MessageBoxButtons.OK, MessageBoxIcon.Hand);
				}
			}
		}
```

核心是`SerialConnecter.DriverReplace(VID, PID);`

通过下面的源码可以看到，实际上他是btkeyLib.dll的接口封装

```c#
	public static class SerialConnecter
	{
		// Token: 0x060000A3 RID: 163
		[DllImport("btkeyLib.dll")]
		public static extern void send_button(uint key, uint waittime);

		// Token: 0x060000A4 RID: 164
		[DllImport("btkeyLib.dll")]
		public static extern void send_stick_r(uint h, uint v, uint waittime);

		// Token: 0x060000A5 RID: 165
		[DllImport("btkeyLib.dll")]
		public static extern void send_stick_l(uint h, uint v, uint waittime);

		// Token: 0x060000A6 RID: 166
		[DllImport("btkeyLib.dll", EntryPoint = "shutdown_gamepad")]
		private static extern void ___shutdown_gamepad();

		// Token: 0x060000A7 RID: 167 RVA: 0x0000CCA4 File Offset: 0x0000AEA4
		[HandleProcessCorruptedStateExceptions]
		public static void shutdown_gamepad()
		{
			try
			{
				SerialConnecter.___shutdown_gamepad();
			}
			catch (Exception)
			{
			}
		}

		// Token: 0x060000A8 RID: 168
		[DllImport("btkeyLib.dll")]
		public static extern void start_gamepad();

		// Token: 0x060000A9 RID: 169
		[DllImport("btkeyLib.dll", EntryPoint = "send_padcolor")]
		private static extern void __send_padcolor(uint pad_color, uint button_color, uint leftgrip_color, uint rightgrip_color);

		// Token: 0x060000AA RID: 170 RVA: 0x0000CCCC File Offset: 0x0000AECC
		public static void send_padcolor(Color pad_color, Color button_color, Color leftgrip_color, Color rightgrip_color)
		{
			uint pad_color2 = (uint)((int)pad_color.R | (int)pad_color.G << 8 | (int)pad_color.B << 16);
			uint button_color2 = (uint)((int)button_color.R | (int)button_color.G << 8 | (int)button_color.B << 16);
			uint leftgrip_color2 = (uint)((int)leftgrip_color.R | (int)leftgrip_color.G << 8 | (int)leftgrip_color.B << 16);
			uint rightgrip_color2 = (uint)((int)rightgrip_color.R | (int)rightgrip_color.G << 8 | (int)rightgrip_color.B << 16);
			SerialConnecter.__send_padcolor(pad_color2, button_color2, leftgrip_color2, rightgrip_color2);
		}

		// Token: 0x060000AB RID: 171
		[DllImport("libwdi.dll")]
		public static extern void DriverReplace(int vid, int pid);
	}
```

核心操作手柄的按键遥感，开关都封装在了btkeyLib.dll中，同时可以通过`send_padcolor`来设置显示在ns中手柄的颜色，也就说这个btkeyLib.dll中其实封装了整个ns手柄的api。

同时还看到了libwdi.dll，和逆向前看到的一样，他提供的是DriverReplace接口，也就是打包程序。



##### 总结一下

如果我要实现相同功能，我要用他的以下几个api，首先替换驱动，然后打开驱动，~~发送颜色（实质上应该是搜索ns，对频，连接）~~，发送按键....最后关闭驱动。

发送颜色这个API，搜索后发现，没被掉用。

```c#
		[DllImport("btkeyLib.dll")]
		public static extern void send_button(uint key, uint waittime);
		[DllImport("btkeyLib.dll")]
		public static extern void send_stick_r(uint h, uint v, uint waittime);
		[DllImport("btkeyLib.dll")]
		public static extern void send_stick_l(uint h, uint v, uint waittime);
		[DllImport("btkeyLib.dll", EntryPoint = "shutdown_gamepad")]
		private static extern void ___shutdown_gamepad();
		[HandleProcessCorruptedStateExceptions]
		public static void shutdown_gamepad()
		[DllImport("btkeyLib.dll")]
		public static extern void start_gamepad();
		[DllImport("btkeyLib.dll", EntryPoint = "send_padcolor")]
		private static extern void __send_padcolor(uint pad_color, uint button_color, uint leftgrip_color, uint rightgrip_color);
		[DllImport("libwdi.dll")]
		public static extern void DriverReplace(int vid, int pid);
```



## 正向流程追踪

正向走一遍流程，看看是否还有遗漏的东西。通过MainForm中的InitializeComponent()，找到对应名称按钮的函数。

首先是无线连接setup，实际上就是弹出Bluetooth制御セットアップ的Form，没啥好说的。



#### 连接蓝牙

他是直接调用了上面的start_gamepad（）就进行了连接，只是这个地方他好像设置的不会超时，调用api以后，实际上没有任何返回

```c#
			Task.Factory.StartNew(delegate()
			{
				GlobalVar.BTSTARTED = true;
				SerialConnecter.start_gamepad();
				GlobalVar.BTSTARTED = false;
			});
```

由于它还支持单片机，所以多余的代码都是串口方面的操作。



#### 按钮：按下A

看一下按下A实际上他做了什么

```c#
		private void button4_Click_1(object sender, EventArgs e)
		{
			Task.Factory.StartNew(delegate()
			{
				this.nmc.KeyBoardKeyFlag = 8U;
				Thread.Sleep(2000);
				this.nmc.KeyBoardKeyFlag = 0U;
			});
		}
```

他是直接设置了nmc的KeyBoardKeyFlag的值，8对应的是A按键，0对应就是不按任何按键，相当于释放A按键



#### NMC

NMC这个缩写太短了，猜测是Nintendo Switch Monsters Hunter Rise Controller

蓝牙按键发送都包含在`BtKeySendStart`中，但是这个函数没办法调试，一调试，dnSpy就卡住了，cpu占用下不来

```c#
// AutoTalismanMelding.NMC
// Token: 0x06000080 RID: 128 RVA: 0x000086F7 File Offset: 0x000068F7
public void BtKeySendStart()
{
	Task.Factory.StartNew(delegate()
	{
		for (;;)
		{
			if (!GlobalVar.BTSTARTED)
			{
				Thread.Sleep(16);
			}
			else
			{
				try
				{
					uint num = this.PadKeyFlag | this.NmcKeyFlag | this.KeyBoardKeyFlag;
					SerialConnecter.send_button(num & 16777215U, 16U);
					uint v = 2048U;
					if ((num & 16777216U) != 0U)
					{
						v = 4095U;
					}
					if ((num & 33554432U) != 0U)
					{
						v = 0U;
					}
					uint h = 2048U;
					if ((num & 67108864U) != 0U)
					{
						h = 4095U;
					}
					if ((num & 134217728U) != 0U)
					{
						h = 0U;
					}
					uint v2 = 2048U;
					if ((num & 268435456U) != 0U)
					{
						v2 = 4095U;
					}
					if ((num & 536870912U) != 0U)
					{
						v2 = 0U;
					}
					uint h2 = 2048U;
					if ((num & 1073741824U) != 0U)
					{
						h2 = 4095U;
					}
					if ((num & 2147483648U) != 0U)
					{
						h2 = 0U;
					}
					SerialConnecter.send_stick_l(h, v, 16U);
					SerialConnecter.send_stick_r(h2, v2, 16U);
					Thread.Sleep(1);
				}
				catch
				{
				}
			}
		}
	});
}
```

仔细看一下他的内容，和他启动的时机，基本上MainForm启动以后他就启动了，并且一直在跑，而主程序那边只是不断的把要发送的命令扔给`this.PadKeyFlag | this.NmcKeyFlag | this.KeyBoardKeyFlag`这个三个变量，然后通过这里不断的往下发送，从而控制NS。然后他下面是关于摇杆的控制，摇杆和button是同时控制的。

```
num == 0x0100 0000 时 v=4095
num == 0x0200 0000 时 v=0
num == 0x0400 0000 时 h=4095
num == 0x0800 0000 时 h=0
num == 0x1000 0000 时 v2=4095
num == 0x2000 0000 时 v2=0
num == 0x4000 0000 时 h2=4095
num == 0x8000 0000 时 h2=0
```

num是特定值的时候，表示此时需要控制摇杆，左右摇杆可以同时控制，不过他控制摇杆是直接控制到极值，只是每次控制只给了16ms，算下来也就是60hz的控制频率。

还有问题就是按键和摇杆api中，对应的参数值应该给多少的问题，比如什么值是按A，什么是按B，这个暂时还看不出来。



## 提取文件

#### dll

由于他是一个exe，单文件，猜一下他用了Costura.[Fody](https://github.com/Fody/Home/)来打包（之前他的sw用了Fody）

![](https://img.elmagnifico.tech/static/upload/elmagnifico/uzMTRUDOxXSCwGf.png)

通过搜索Fody关键字，也确实验证了我的猜测。

然后将我们需要的btkeylib.dll和libwdi.dll单独保存

![](https://img.elmagnifico.tech/static/upload/elmagnifico/4gBY39sjXOvJNFH.png)



#### 脚本

由于之前看到几个按钮都是直接读文件然后运行，类似于这样，很明显这几个文件也一起打包在了一起。

```c#
private void button4_Click(object sender, EventArgs e)
{
	this.RISEMARA.Enabled = false;
	this.OMAMORISHEET.Enabled = false;
	this.RISEMARA_STOP.Enabled = false;
	this.OMAMORITABLE.Enabled = false;
	this.MACROSTOP.Enabled = true;
	byte[] rise_r = Resources.RISE_r;
	this.nmc.NMCRead(rise_r);
	this.nmc.NmcExecution();
}
```

![](https://img.elmagnifico.tech/static/upload/elmagnifico/hPkeJO8Up3Nfdlo.png)

资源文件中，看到这种01的文件，名字又很像，那就都单独提取出来吧。

光是有了文件还不够，这个文件内容到底是啥，看代码似乎有解析流程，而我这里直接看二进制翻译看到了.png，大胆猜测一下这其实就是怪猎融珠子的脚本。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/MQx1A6faHINv4yo.png)

而AutoTalismanMelding是NX Macro Controller的儿子，那么这个脚本必然NX Macro Controller也能正常加载。

试验一下，把保存的文件都改名成`.nxc`，然后用NX Macro Controller加载一下看看。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/WL4wdpDf68bHNnJ.png)

直接正确了，看到的png图片也在这里加载出来了，这个是他用opencv搜图的目标。

这样的话我大概就能确定了NMCRead主要是用来解析这个nxc的脚本，从中拿出来命令、参数、搜图目标

```c#
public void NMCRead(byte[] data)
{
	this.Code = "";
	this.ResourcesImages.Clear();
```

然后这个NmcExecution负责将命令转换成对应的操作元数据

```c#
// AutoTalismanMelding.NMC
// Token: 0x06000084 RID: 132 RVA: 0x0000A910 File Offset: 0x00008B10
public void NmcExecution()
{
	string text = Regex.Replace(this.Code, "//.*", "").Replace("\n", "\r\n").Replace("\r\r", "\r");
	Match match = Regex.Match(text, "/\\*(?s:.*?)\\*/");
	while (match.Success)
	{
		string text2 = match.Value;
		Console.WriteLine(text2);
		text2 = Regex.Replace(text2, "[^\r\n]", "");
		Console.WriteLine(text2);
		text = text.Substring(0, match.Index) + text2 + text.Substring(match.Index + match.Length);
		match = Regex.Match(text, "/\\*(?s:.*?)\\*/");
	}
```

NmcExecution同时还是他的语法解释器，不过比其伊机控的这个语法解释器有点菜，基本上就是靠字符串解析和写好的解析流程来用的，比起利用编译原理，通过前缀、中缀、后缀表达式这种解析原始多了。



## 重制

![](https://img.elmagnifico.tech/static/upload/elmagnifico/gUuaH4vyfxVJTqn.png)

将提取到的两个dll连同部分类代码一起重构了一下，然后简单做了一个窗口实验了一下是否可行。

这里有几个小问题

- 两个dll都是64位的，所以32位程序是不支持的，他也没给32位的



#### 按键映射

还是NMC中，有按键映射，之前我漏掉了这里。

```c#
// AutoTalismanMelding.NMC
// Token: 0x0600008B RID: 139 RVA: 0x0000B448 File Offset: 0x00009648
public void ScrPress(string[] args)
{
	if (this.scrTimer.IsRunning)
	{
		this.scrTimer.Reset();
	}
	this.scrTimer.Start();
	int num = (int)(1000m * decimal.Parse(decimal.Parse(args[args.Length - 1]).ToString("F2")));
	uint num2 = 0U;
	for (int i = 1; i < args.Length - 1; i++)
	{
		if (args[i] == "A")
		{
			num2 |= 8U;
		}
        ...
		else if (args[i] == "DOWNRIGHT_R")
		{
			num2 |= 1610612736U;
		}
		this.NmcKeyFlag = num2;
	}
	while (this.scrTimer.ElapsedMilliseconds < (long)num && !this.Cancel)
	{
		Thread.Sleep(1);
	}
}
```



简单总结一下就是这样

| 数值        | 含义                   |
| ----------- | ---------------------- |
| 0x8         | A                      |
| 0x4         | B                      |
| 0x2         | X                      |
| 0x1         | Y                      |
| 0x80 0000   | ZL                     |
| 0x80        | ZR                     |
| 0x40 0000   | L                      |
| 0x40        | R                      |
| 0x1 0000    | Hat down               |
| 0x2 0000    | Hat up                 |
| 0x4 0000    | Hat right              |
| 0x5 0000    | Hat down right         |
| 0x6 0000    | Hat up right           |
| 0x8 0000    | Hat left               |
| 0x9 0000    | Hat down left          |
| 0xA 0000    | Hat up left            |
| 0x200       | +                      |
| 0x100       | -                      |
| 0x1000      | home                   |
| 0x2000      | capture                |
| 0x800       | left stick click       |
| 0x400       | right stick click      |
| 0x100 0000  | left stick up          |
| 0x200 0000  | left stick down        |
| 0x800 0000  | left stick left        |
| 0x900 0000  | left stick up left     |
| 0xA00 0000  | left stick down left   |
| 0x1000 0000 | left stick right       |
| 0x500 0000  | left stick up right    |
| 0x600 0000  | right stick down right |
| 0x1000 0000 | right stick up         |
| 0x2000 0000 | right stick down       |
| 0x8000 0000 | right stick left       |
| 0x9000 0000 | right stick up left    |
| 0xA000 0000 | right stick down left  |
| 0x4000 0000 | right stick right      |
| 0x5000 0000 | right stick up right   |
| 0x6000 0000 | right stick down right |



到这里基本就结束了，我的demo也放在我的仓库里，可以直接使用

![](https://img.elmagnifico.tech/static/upload/elmagnifico/JBWLrzdj9RYk4FU.png)

> https://github.com/elmagnificogi/CSR_Bluetooth_Dongle_Simulate_NS_Pro_Controller



## Summary

下一步就是直接集成进伊机控了，如果作者能透露更多api，而且能支持joycon就更好了，可惜作者直接不理人，就很烦。



## Quote

> https://www.cnblogs.com/Bruce_H21/p/12307182.html

