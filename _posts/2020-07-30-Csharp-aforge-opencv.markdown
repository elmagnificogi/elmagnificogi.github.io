---
layout:     post
title:      "C# 高效视频采集"
subtitle:   "Aforge，opencv"
date:       2020-07-30
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
catalog:    true
tags:
    - c#
---

## Foreword

由于要做一些视频采集的工作，然后图像识别一下，所以这里遇到的视频采集到底用什么类库的问题，以及后续的显示处理等

首先视频本身是通过USB传输进来的，然后可以直接通过USB摄像头打开采集，也有可能是通过虚拟摄像头采集（usb摄像头输入，然后用虚拟摄像头分流，从而可以多个程序同时打开一个硬件设备，比如Vcam，SplitCam，CamSplitter，CamSplitter等等都可以直接虚拟摄像头）

#### 环境

- .Net 4.8
- Windows 10
- Visual Studio 2019
- CPU 7700K

## 视频采集库

视频采集的类库太多了,这里列举一些可能常看到的库,以及部分核心代码.

#### AForge.NET

> http://www.aforgenet.com/

以前还是挺有名的，也有很多相关资料，不过库实在太老了，最后维护都是2013年了，后面就再也没有更新了。

有些系统里就直接有兼容性问题，不能用的概率比较大，如果只是简单用一下还可以试试。

最新版本的AForge采样的FPS无法调整，只能调整分辨率，采样1080p,60Hz的时候cpu占用率大概是12%左右,720P大概是8%左右，480P就只有4%左右了吧。

这里有一个问题就是Aforge中关于fps的描述是不可靠的，他只有平均帧数和最大帧数，实际上你拿到的到底是多少帧数，你得自己算而不能指望他给你一个固定的帧数。

好处是Aforge有new frame回调，同时Aforge自带了一个显示控件，这个显示控件的好处是本身延迟足够低，而且和采集同步，使用起来还是非常方便的

```c#
var videoDevices = new FilterInfoCollection(FilterCategory.VideoInputDevice);
VideoSource = new VideoCaptureDevice(videoDevices[0].MonikerString);
// 回调事件
VideoSource.NewFrame += NewFrameHandler;
VideoSource.Start();
// 自带UI,支持高刷新率，低延迟
private AForge.Controls.VideoSourcePlayer videoSourcePlayerMonitor;
videoSourcePlayerMonitor.VideoSource = VideoCapture.VideoSource;
```



#### OBS

> https://github.com/obsproject/obs-studio

OBS用过基本都知道，cpu占用非常低，采样1080p,60Hz,大概只有2%左右的cpu占用，录制的话会需要10-20%左右

但是OBS是基于c++的，效率极高，而其他要调用就要自己封装，下面这两个是别人封装的部分功能，而且也不怎么维护了

> https://github.com/GoaLitiuM/libobs-sharp
>
> https://github.com/ilosvideos/libobs-sharp

关键是这个封装库，没有相关说明，具体怎么用都得看代码，我并没有使用，想要用应该也是可以的



#### OpenCvSharp

作为OpenCV的封装，最新的OpenCvSharp 4，其API更接近c++下的opencv，如果熟悉c++，这个用起来就非常像。

OpenCV同样采集1080p,60Hz,cpu占用率比较低，只有8左右

```c#

capture.Open(0, VideoCaptureAPIs.ANY);
if (!capture.IsOpened())
{
    Close();
    return;
}

capture.Set(VideoCaptureProperties.FrameWidth, 1920);
capture.Set(VideoCaptureProperties.FrameHeight, 1080);
capture.Set(VideoCaptureProperties.Fps, 60);

private static Thread capture_run_handler;
capture_run_handler = new Thread(Capture_Frame);
capture_run_handler.Start();
static void Capture_Frame()
{
    while (true)
    {
        if (Monitor.TryEnter(_lock))
        {
            try
            {
                using (var frameMat = capture.RetrieveMat())
                {
                    if (!frameMat.Empty())
                    {
                        _image?.Dispose();
                        _image = OpenCvSharp.Extensions.BitmapConverter.ToBitmap(frameMat);
                        frameCount++;
						# 刷新显示
                        displayUI.Invalidate();
                    }
                }
            }
            finally
            {
                Monitor.Exit(_lock);
            }
        }
        Thread.Sleep(6);
    }
}
```



#### Emgu.CV

同样作为OpenCV的封装库，而实际上Emgu包含的更大一些，Emgu的opencv封装的和原来的略有不同，有一些地方是比OpenCvSharp强的。

需要着重说一下的就是他多了一个ImageGrabbed的回调，这样拿到一个新帧就立马可以获知。

其次就是他本身自带的几个控件，效率非常高，特别是PanAndZoomPictureBox，刷新一张图片上去的延迟非常低，快赶上obs了，而且其本身支持高效率缩放，不会因为Picturebox本身的缩放太慢而导致实际渲染延迟很高。

其本身的CPU占用也略高于OpenCV，不显示的情况下小于等于8%，显示16左右。

```c#
_capture = new VideoCapture(0, VideoCapture.API.DShow);
_capture.SetCaptureProperty(CapProp.FrameWidth, 1920);
_capture.SetCaptureProperty(CapProp.FrameHeight, 1080);
_capture.SetCaptureProperty(CapProp.Fps, 60);
_capture.ImageGrabbed += ProcessFrame;
_capture.Start();

private Mat _frame;
_frame = new Mat();
private Emgu.CV.UI.PanAndZoomPictureBox panAndZoomPictureBox1;

private void ProcessFrame(object sender, EventArgs arg)
{
    if (_capture != null && _capture.Ptr != IntPtr.Zero)
    {
        _capture.Retrieve(_frame, 0);
        panAndZoomPictureBox1.Image = _frame.ToBitmap();
    }
}
```



#### DirectShowLib

> https://github.com/luthfiampas/DirectShowLib

DirectShow的库基本就是底层接口库了，由于其本身是c++或者MFC时代用的，所以很原始，而有些为了用这个库又做了二次封装，那就是这个DirectShowLib，其实OpenCV或者是AForge他们本身也对DirectShow做了一次封装。

而DirecShow本身比较复杂，写起来很c++，就不放例程了，其延迟和OpenCv的都差不多，cpu占用也差不多，平常就不推荐使用了.



#### Microsoft.Expression.Encoder

Microsoft.Expression.Encoder 这个库其实是对应Microsoft.Expression.Encoder这个付费软件库的接口，其本身是采集流然后转码用的,而实际的采集预览界面，在原本的UI中，小的可怜，但是这个PreviewWindow，却是同步的，而且低延迟,效率很高

但是这个有点小问题,PreviewWindow后显示出来的画面里只要不规则边缘就存在马赛克情况,显得有点糊,不知道是哪里设置错了还是他本身的问题，然后软件打开直接用软件看的时候可以看到,软件里最多支持到30帧，那么实际上能不能采集到60帧,这就是个问题了。

```c#
var job = new Microsoft.Expression.Encoder.Live.LiveJob();
Collection<EncoderDevice> devices = EncoderDevices.FindDevices(EncoderDeviceType.Audio);
foreach (EncoderDevice device in devices)
{
    try
    {
        Debug.WriteLine(device.Name);
    }
    catch
    {
    }
}

Collection<EncoderDevice> devices1 = EncoderDevices.FindDevices(EncoderDeviceType.Video);
foreach (EncoderDevice device in devices1)
{
    try
    {
        Debug.WriteLine(device.Name);
    }
    catch
    {
    }
}

job.AddDeviceSource(devices1[1], devices[0]);
var w = new Form();
w.Width = 1920;
w.Height = 1080;
w.Show();
var source1 = job.DeviceSources[0];
source1.PreviewWindow = new Microsoft.Expression.Encoder.Live.PreviewWindow(new System.Runtime.InteropServices.HandleRef(w, w.Handle));
```



## 综合对比

上面有了这么多接口，但是实际上用哪个，到底哪个才用的好，还需要实际测试一下，然后下面的测试结果都是只采集，保证到60帧，但是不包含显示出来，因为显示出来占用的CPU与写法-UI-还有其他东西相关，不能代表这个接口本身。

| 库                           | 1080P下CPU占用 | 720P下CPU占用 | 480P下CPU占用 |
| ---------------------------- | -------------- | ------------- | ------------- |
| AForge                       | 12%            | 8%            | 4%            |
| OBS                          | 3%             | 3%            | 3%            |
| OpenCvSharp                  | 8%             | 3%            | 1%            |
| Emgu.CV                      | 12%            | 无            | 无            |
| DirectShowLib                | 无             | 无            | 无            |
| Microsoft.Expression.Encoder | 14%            | 无            | 无            |



## C# 提高采集视频的刷新频率fps

由于本身一个软件的刷新频率，或者采样频率，直接从外部看，没有一个统一标准，有可能觉得卡，觉得延迟高，但是到底多高不好分辨，而且造成高的因素也有很多：

- usb采集卡本身的延迟，这个由于统一一个接口，所以本身是固定的，而且经过测试采集的部分都是达到了60fps
- API调用底层获取帧的延迟，各不相同，看本事了
- UI异步，显示延迟，这个由于每个API的情况不同，可能造成写法不同，问题比较大

由此就引出来了另一个问题 ，在API一致的情况下，这个UI显示延迟怎么解决

#### PictureBox

由于大部分例程都是用PictureBox直接来显示，导致有很多人都在问，到底要怎样降低PictureBox的UI延迟，这里我尝试过一些方法，再加上一些看到的说法，总结一下

#### 双缓冲

首先，PictureBox双缓存，这个其实没必要，因为PictureBox默认就是双缓存的，很多教人去设置这个，其实并没有用。

#### Refresh

异步调用时直接用Refresh还是Invalidate或者Update，这里说一下区别

- Invalidate，使控件整个区域无效，本身可能会因为线程延迟或者事件排队响应而被耽搁

- Update，立即重绘无效区域，相当于插队，并触发重绘
- Refresh ，立即使整个区域无效，并且重绘 = invalidate+update

平常来说要想快速响应也就是用Refresh来做，但是实际测试并不是这样的，大部分可能会在异步线程里如下调用：

```c#
Invoke((Action)delegate
{
	pictureBox1.Refresh();
});
```

实际上如果使用了异步线程调用，由于这个时候Refresh需要与UI渲染的主线程去同步，导致实际上拉慢整体的节奏，进而导致采集fps掉下去了。

正确的方法应该是异步调用Invalidate，然后剩下交给主线程的渲染去做，而不是强行刷新，实测效果区别还是很大的。



后来有人提出PictureBox本身不适合做这个事情，只是用来显示一下图片，做做变换什么的都还行，但是真的用来播视频，这个卡顿掉帧不是盖的，提出了使用panel来做这个渲染的事情，于是尝试如下。

#### Panel

首先继承一个Panel，然后开启他的双缓冲

```
class mypanel:Panel
{
    public mypanel()
    {
        this.SetStyle(ControlStyles.AllPaintingInWmPaint | //不擦除背景 ,减少闪烁
        ControlStyles.OptimizedDoubleBuffer | //双缓冲
        ControlStyles.UserPaint, //使用自定义的重绘事件,减少闪烁
        true);
    }
}
```

替换掉代码里的PictureBox，开启测试。

最后得到的结果基本和picturebox一模一样，他们都只能跑到47.4帧左右就达到稳态了（刷新率受限的情况下），基本没有什么区别，所以Panel可以提升播视频效率，基本是个伪命题，除非完全重写渲染。

#### 自定义缩放

在使用小图片的时候不明显，比如640*480,这种图片或者分辨率下，刷新怎么刷都能60fps，但是只要你一放大窗口或者是放大图片本身，缩放带来的问题立马就显现出来了

PictureBox本身应对缩放太慢了，直接给PictureBox缩放后的图片（与其本身大小相同或者是其SizeMode属性为Normal）这样才能最快的渲染出来。如果其本身是StretchImage或者其他属性都会造成实际的FPS下降（从60fps下降到45左右）。但是缩放不仅仅是一个属性而已，同时就算你手动写了缩放其实也非常慢，特别是使用Graphics在paint中写缩放:

```c#
using (var g = Graphics.FromImage(img))
{
	g.DrawImage(_image, 0, 0, new Rectangle(0,0, _image.Width, _image.Height), GraphicsUnit.Pixel);
}
```

这样的写法使用默认的缩放模式，十分卡。



```c#
private void XXXX_Paint(object sender, PaintEventArgs e)
{

    Graphics g = e.Graphics;
    g.InterpolationMode = InterpolationMode.NearestNeighbor;
    Bitmap newframe = VideoCapture.GetImage();
    g.DrawImage(newframe, new Rectangle(0, 0, VideoSourcePlayerMonitor.Width, VideoSourcePlayerMonitor.Height), new Rectangle(0, 0, curResolution.X, curResolution.Y), GraphicsUnit.Pixel);
    newframe.Dispose();

}
```

这里指定了绘制时的插值方式，可以看到选项还是挺多的，但是这里面只有NearestNeighbor算法是最快，使用了这种插值之后可以在1080p的情况下无论怎么缩放都能达到60fps，从而让缩放不是瓶颈，这里面高质量二次立法插值是质量最高的，但是同时也是最消耗时间的，基本可以让60fps变成10fps

```
namespace System.Drawing.Drawing2D
{
    //
    // 摘要:
    //     System.Drawing.Drawing2D.InterpolationMode 枚举指定的图像是缩放或旋转时使用的算法。
    public enum InterpolationMode
    {
        //
        // 摘要:
        //     等效于 System.Drawing.Drawing2D.QualityMode.Invalid 元素 System.Drawing.Drawing2D.QualityMode
        //     枚举。
        Invalid = -1,
        //
        // 摘要:
        //     指定默认模式。
        Default = 0,
        //
        // 摘要:
        //     指定低质量内插。
        Low = 1,
        //
        // 摘要:
        //     指定高质量内插。
        High = 2,
        //
        // 摘要:
        //     指定双线性内插。 进行任何预筛选。 此模式不适用于图像收缩为其原始大小的 50%以下。
        Bilinear = 3,
        //
        // 摘要:
        //     指定两次立方插值。 进行任何预筛选。 此模式不适用于图像收缩为其原始大小的 25%以下。
        Bicubic = 4,
        //
        // 摘要:
        //     指定最近邻域内插。
        NearestNeighbor = 5,
        //
        // 摘要:
        //     指定高质量、 双线性内插。 执行预筛选功能以确保高质量的收缩。
        HighQualityBilinear = 6,
        //
        // 摘要:
        //     指定高质量、 两次立方插值。 执行预筛选功能以确保高质量的收缩。 此模式可产生最高的质量转换图像。
        HighQualityBicubic = 7
    }
}
```

但是NearestNeighbor也并不都是好处，如下图所示可以明显看到在不规则形状的时候，这种插值会造成边缘模糊了很多，而且自带了一圈较重拖影。这是放大时的样子，如果缩小会得到另外一种结果，别的缩放方法都还能看得清原本大致的样子，而如果使用NearestNeighbor就会造成缩小后很多细节或者本不应该被缩放掉的主体信息都被缩放到没有了，所以平常不建议使用这种方法。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/tYaQH7ChPoLf5VZ.png)

## Summary

总的来说，想要一个高刷新率能做到上面的几点基本就能达到60fps了，如果更高或许要用DX或者OpenGL之类的来做显示了。

## Quote

> https://www.gamedev.net/forums/topic/609503-c-wfa-low-fps-when-drawing-in-picturebox/
>
> https://docs.microsoft.com/en-us/windows/win32/gdi/capturing-an-image
>
> https://stackoverflow.com/questions/11020710/is-graphics-drawimage-too-slow-for-bigger-images
>
> https://social.msdn.microsoft.com/Forums/vstudio/en-US/42d340b4-ee75-483e-8889-acdadb56fc36/better-performance-for-bmp-in-picturbox?forum=winforms
>
> https://social.msdn.microsoft.com/Forums/windowsdesktop/en-US/04a71252-bc81-4378-ac3e-129b46b74788/how-can-i-display-live-video-in-c-without-any-freezing-or-delay?forum=windowsdirectshowdevelopment
>
> https://docs.microsoft.com/en-us/previous-versions/visualstudio/design-tools/expression-studio-4/gg602440(v=expression.40)?redirectedfrom=MSDN
>
> https://www.cnblogs.com/yang-fei/p/4020806.html
>
> https://blog.csdn.net/bornonew/article/details/53302416
>
> https://blog.csdn.net/xpj8888/article/details/87879047
>
> https://blog.csdn.net/zhoubotong2012/article/details/79368648
>
> https://blog.csdn.net/balijinyi/article/details/78364400
>
> https://stackoverflow.com/questions/53589843/high-cpu-usage-when-capture-image-by-opencv-c

