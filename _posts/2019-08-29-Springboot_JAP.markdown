---
layout:     post
title:      "Springboot中数据映射到数据库"
subtitle:   "JAP，mySQL"
date:       2019-08-29
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - java
    - spring
---

## Java

## Forward

记录一下之前遇到的一个问题，Springboot中在映射实体到数据库的时候有一个映射方式，之前没注意。

## JAP

#### @Column

Column 注解，可以直接修改存到数据库中的名称，可以直接加到变量前或者是变量的getter方法之前

但是实际上放在哪里并没有明显区别。

有的说法是一个是从getter方法上获取这个字段的值，一个是从反射来获取字段的值。其实并不是，加个sout就能看出来，直接加在getter方法上并没有用。

#### @Access

平常不会用这个Access

但是呢，平常数据库获取一个字段的值默认都是从反射的方式来获取的，而不是通过这个字段的get或者set方法来完成的。

如果我们想给这个字段在get和set的时候将其转换到对应的字段的真实类型有两个办法。

- 转存成json字符串存入数据库，读出的时候也是直接序列化
- 自己写get和set中的内容，自己来手动序列化和反序列化

转json的好处是，直接存储的就是真实的对象，并且可以拿来直接用，序列化和反序列化都比较统一。

不过我还是选了自己手动写的方式。

```
@Access(AccessType.FIELD)
@Access(AccessType.PROPERTY)
```

##### AccessType.FIELD

这种方式就是默认的，通过反射的空间域来获取字段的内容。

##### AccessType.PROPERTY

通过这种方式，则是指定通过属性的方法来获取字段的值。

```java
@Access(AccessType.PROPERTY)
@Column(name = "droneTypes")

private String droneTypesString;

public String getDroneTypesString() {
    //        System.out.println(droneTypes.toString());
    return (droneTypes == null?"":droneTypes.toString());
}

public void setDroneTypesString(String droneTypesString) {
    //System.out.println(droneTypesString);
    if(droneTypesString != null) {
        droneTypesString = droneTypesString.replaceAll(" ","");
        droneTypesString = droneTypesString.replaceAll("\\[","");
        droneTypesString = droneTypesString.replaceAll("]","");
        String[] strArr = droneTypesString.split(",");
        this.droneTypes = new HashSet<>();
        for (String str : strArr) {
            //System.out.println(str);
            if(!str.isEmpty()) {
                this.droneTypes.add(new Drone(str));
            }
        }
    }
}
```

这样每次从数据库拿到数据和存储数据的时候都会通过这样的方式来存储

##### 混合模式

就是有些字段使用get/set有些使用filed来获取

## 总结

不过这种用法本身比较trick，一般不推荐这么用，尽量让和数据库直接接触的实体类型本身和数据的数据类型比较接近，这样的话可能会比较简单一些。

## 参考

> https://blog.csdn.net/jinghua7/article/details/21455727
>
> https://blog.csdn.net/u012493207/article/details/50817971?locationNum=6
