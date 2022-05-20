---
layout:     post
title:      "Maya QT 可折叠frame"
subtitle:   "Qt-Collapsible-Section,WidgetBox"
date:       2018-12-20
author:     "elmagnifico"
header-img: "img/python-head-bg.jpg"
catalog:    true
tags:
    - QT
    - Maya
---

## Foreword

Qt Designer 中有一些基础控件，但是呢，一个非常常用的控件，他竟然没有。

如下图所示，Widget Box中的可折叠frame竟然不是一个一般控件，而自带的类似效果的Tool Box永远只能显示一个分页的内容，这就很尴尬，查了半天总算找到了两个可以实现这个效果的控件。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c1b4a21413c5.png)

我最终要实现的功能就类似于maya中frame的功能

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c1b4ccf47a14.png)

## Qt-Collapsible-Section

#### solution

这个是从stackoverflow上看到的一个问题中，别人回答的，并且给出了一个demo，可以直接运行看到效果。

> https://github.com/Elypson/qt-collapsible-section

就像下图这样，基本就是我想要的一个效果了。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c1b4bb58bc85.gif)

然后看一下他的代码

#### code

代码中section就是我们想要的可折叠frame，先看一下他通过什么来实现的。

可以看到他折叠区域他是使用QScrollArea，整个控件是用QGridLayout来排布，而折叠的按钮则是QToolButton，并且他还带了动画，由QScrollArea其实就可以想到，他是想用这个滚动区域来折叠动画

###### section.h

```c++
class Section : public QWidget {
    Q_OBJECT
private:

    QGridLayout* mainLayout;
    QToolButton* toggleButton;
    QFrame* headerLine;
    QParallelAnimationGroup* toggleAnimation;
    QScrollArea* contentArea;
    int animationDuration;

public:
    explicit Section(const QString & title = "", const int animationDuration = 100, QWidget* parent = 0);

    void setContentLayout(QLayout & contentLayout);
};
```

###### section.c

这里他主要实现了两个函数，一个是构造，一个是设置折叠区域内容。

```c++
Section::Section(const QString & title, const int animationDuration, QWidget* parent)
    : QWidget(parent), animationDuration(animationDuration)
{
    toggleButton = new QToolButton(this);
    headerLine = new QFrame(this);
    toggleAnimation = new QParallelAnimationGroup(this);
    contentArea = new QScrollArea(this);
    mainLayout = new QGridLayout(this);

    toggleButton->setStyleSheet("QToolButton {border: none;}");
    toggleButton->setToolButtonStyle(Qt::ToolButtonTextBesideIcon);
    toggleButton->setArrowType(Qt::ArrowType::RightArrow);
    toggleButton->setText(title);
    toggleButton->setCheckable(true);
    toggleButton->setChecked(false);

    headerLine->setFrameShape(QFrame::HLine);
    headerLine->setFrameShadow(QFrame::Sunken);
    headerLine->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Maximum);

    contentArea->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);

    // start out collapsed
    contentArea->setMaximumHeight(0);
    contentArea->setMinimumHeight(0);

    // let the entire widget grow and shrink with its content
    // 这里前两个动画是整个控件的最大和最小变化的动画，这两个动画可以没有
    // 第三个才是折叠区域的动画
    toggleAnimation->addAnimation(new QPropertyAnimation(this, "minimumHeight"));
    toggleAnimation->addAnimation(new QPropertyAnimation(this, "maximumHeight"));
    toggleAnimation->addAnimation(new QPropertyAnimation(contentArea, "maximumHeight"));

    mainLayout->setVerticalSpacing(0);
    mainLayout->setContentsMargins(0, 0, 0, 0);

    int row = 0;
    // 这里排了一下按钮，实际上我并不需要这里的headerline，只要让button长一些就行了。
    mainLayout->addWidget(toggleButton, row, 0, 1, 1, Qt::AlignLeft);
    mainLayout->addWidget(headerLine, row++, 2, 1, 1);
    mainLayout->addWidget(contentArea, row, 0, 1, 3);
    setLayout(mainLayout);

    // 折叠与展开就是动画的正播与倒播
    // 好久不用C++ 跟不上了，这里用了一个lambda表达式，返回的是void类型
    QObject::connect(toggleButton, &QToolButton::clicked, [this](const bool checked)
    {
        toggleButton->setArrowType(checked ? Qt::ArrowType::DownArrow : Qt::ArrowType::RightArrow);
        toggleAnimation->setDirection(checked ? QAbstractAnimation::Forward : QAbstractAnimation::Backward);
        toggleAnimation->start();
    });
}

void Section::setContentLayout(QLayout & contentLayout)
{
    // 首先删除了旧布局，添加新布局
    delete contentArea->layout();
    contentArea->setLayout(&contentLayout);
    const auto collapsedHeight = sizeHint().height() - contentArea->maximumHeight();
    auto contentHeight = contentLayout.sizeHint().height();

    // 设置整体大小变化的动画
    for (int i = 0; i < toggleAnimation->animationCount() - 1; ++i)
    {
        QPropertyAnimation* SectionAnimation = static_cast<QPropertyAnimation *>(toggleAnimation->animationAt(i));
        SectionAnimation->setDuration(animationDuration);
        SectionAnimation->setStartValue(collapsedHeight);
        SectionAnimation->setEndValue(collapsedHeight + contentHeight);
    }

    // 设置折叠区域的动画
    QPropertyAnimation* contentAnimation = static_cast<QPropertyAnimation *>(toggleAnimation->animationAt(toggleAnimation->animationCount() - 1));
    contentAnimation->setDuration(animationDuration);
    contentAnimation->setStartValue(0);
    contentAnimation->setEndValue(contentHeight);
}

```

###### mainwindow.cpp

简单的一个调用就能看到效果了

```c++
MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    Section* section = new Section("Section", 300, ui->centralWidget);

    ui->centralWidget->layout()->addWidget(section);

    auto* anyLayout = new QVBoxLayout();
    anyLayout->addWidget(new QLabel("Some Text in Section", section));
    anyLayout->addWidget(new QPushButton("Button in Section", section));

    section->setContentLayout(*anyLayout);
}
```

#### maya qt 与qt5.5.1 对比

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c1b4b995b199.png)

通过之前的方法，稍微修改一下 main 以及部分pro文件就能编译后变成插件的模式，使用maya调用得到下图

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c1b4bec932e1.png)


#### 遗留问题

从上面的 setContentLayout 函数，就能发现，这里有一个小问题，整个区域的大小以及折叠动画只有在被设置的时候才会调用一次，而如果是一个嵌套关系，这里就会出问题了。

```c++
MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    Section* section = new Section("Section", 300, ui->centralWidget);
    Section* section1 = new Section("Section", 300, ui->centralWidget);

    ui->centralWidget->layout()->addWidget(section);
    ui->centralWidget->layout()->addWidget(section1);

    auto* anyLayout = new QVBoxLayout();
    anyLayout->addWidget(new QLabel("Some Text in Section", section));
    anyLayout->addWidget(new QPushButton("Button in Section", section));

    section->setContentLayout(*anyLayout);


    auto* anyLayout1 = new QVBoxLayout();
    anyLayout1->addWidget(section);
    section1->setContentLayout(*anyLayout1);
}
```

如图所示，由于先展开了外部的section，导致内部获取大小的时候并没有通知上层的section，从而导致无法看到全貌，由这种嵌套的结构，其实可以想到实现这个还可以用tree来完成。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c1b5cbfda7a0.png)

## WidgetBox

他这把这种折叠的框架叫做了WidgetBox，然后具体详细的就看他代码吧，稍微复杂一些，效果是一样的。

他是通过QTreeWidget来实现的

> https://github.com/akontsevich/WidgetBox

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c1b5da1bff50.png)

他的代码有点问题，编译以后添加到qt designer中会出现只要使用这个控件，就闪退的情况，具体原因未知。

他的代码大概是qt 5.1或者5.2版本的，而我当前的qt版本是5.5，可能是在这里改了什么导致的。

## py版本

还有一个 python 版本使用tree来完成的

```python
import sys
from PyQt5.QtCore import *
from PyQt5.QtGui import *
from PyQt5.QtWidgets import *

class SectionExpandButton(QPushButton):
    def __init__(self, item, text = "", parent = None):
        super().__init__(text, parent)
        self.section = item
        self.clicked.connect(self.on_clicked)

    def on_clicked(self):

        if self.section.isExpanded():
            self.section.setExpanded(False)
        else:
            self.section.setExpanded(True)

class CollapsibleDialog(QDialog):

    def __init__(self):
        super().__init__()
        self.tree = QTreeWidget()
        self.tree.setHeaderHidden(True)
        layout = QVBoxLayout()
        layout.addWidget(self.tree)
        self.setLayout(layout)
        self.tree.setIndentation(0)

        self.sections = []
        self.define_sections()
        self.add_sections()

    def add_sections(self):

        for (title, widget) in self.sections:
            button1 = self.add_button(title)
            section1 = self.add_widget(button1, widget)
            button1.addChild(section1)

    def define_sections(self):

        widget = QFrame(self.tree)
        layout = QHBoxLayout(widget)
        layout.addWidget(QLabel("Bla"))
        layout.addWidget(QLabel("Blubb"))
        title = "Section 1"
        self.sections.append((title, widget))

    def add_button(self, title):

        item = QTreeWidgetItem()
        self.tree.addTopLevelItem(item)
        self.tree.setItemWidget(item, 0, SectionExpandButton(item, text = title))
        return item

    def add_widget(self, button, widget):

        section = QTreeWidgetItem(button)
        section.setDisabled(True)
        self.tree.setItemWidget(section, 0, widget)
        return section

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = CollapsibleDialog()
    window.show()
    sys.exit(app.exec_())
```

## Summary

maya的qt还是非常尴尬的，特别是maya2017使用的是qt5.6.1，然后qt5.6.1对应使用的是msvc2013，并没有2012的版本，如果降低一个版本，qt5.5.1，那么这个时候有了msvc2012，但是呢，这个没有64位的版本，只有32位，而64位第一次出现是在2013的时候出现的，这就非常别扭。

所以要装一个兼容maya的版本还必须得用一个早于qt5.6.1的版本，只好用qt5.5.1

或许可以用maya的qt，然后改IDE的配置，让他去使用maya qt，不过好像也非常麻烦,等有时间再试吧

## Quote

> https://stackoverflow.com/questions/32476006/how-to-make-an-expandable-collapsable-section-widget-in-qt
>
> https://stackoverflow.com/questions/11077793/is-there-a-standard-component-for-collapsible-panel-in-qt
>
> http://www.fancyaddress.com/blog/qt-2/create-something-like-the-widget-box-as-in-the-qt-designer/
>
> http://download.qt.io/archive/qt/
>
> http://www.cnblogs.com/fayevalentine/p/9778472.html
>
> http://blog.sina.com.cn/s/blog_a6fb6cc90102vsj1.html
