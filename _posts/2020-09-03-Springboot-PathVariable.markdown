---
layout:     post
title:      "Springboot @PathVariable注解导致的参数错误bug"
subtitle:   "java，DataRecover"
date:       2020-09-03
author:     "elmagnifico"
header-img: "img/springboot.jpg"
catalog:    true
tags:
    - Java
    - Springboot
---

## Foreword

最近遇到了一个奇葩错误，数据库一直报错，说我新增的实体已经存在了，而实体id不自增，debug半天每次给出来的entity的自增id都是固定值，永远不变

#### 环境

- Springboot 2.2.2
- thymeleaf
- jpa
- mysql 8.0



## 出错代码

{% raw %}

controller中

```java
@PostMapping("/groundStations/{id}/users")
public String add(@PathVariable("id") Long typeId,Map<String, Object> map) {
    logger.debug(groundStationUser.toString());
    ...
        
}

```



entity中

```java
@Table(name = "GroundStationUser")
@Entity
public class GroundStationUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    private String name;
    private String description;
    ...
}
```



html中

```html
<div class="card shadow mb-4">
    <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">添加用户</h6>
    </div>
    <div class="card-body">
        <form th:action="@{/groundStations/}+${typeId}+@{/users}"
              th:object="${temp}" method="post">
            <div class="form-group">
                <label>用户名</label>
                <input th:field="${temp.name}"
                       type="text" class="form-control" placeholder="用户名称">
            </div>
            <div class="form-group">
                <label>备注</label>
                <input th:field="${temp.description}"
                       type="text"
                       class="form-control" placeholder="备注">
            </div>
            ...

        </form>
    </div>
</div>
```

看起来整个代码没什么问题，但是实际上这里会发生一个错乱的情况，这三个部分都有一个共同点，那就是id，而html中看起来并没有使用id这个属性，实际post提交的时候也没有提交temp.id。



而实际调试的时候就会发现，每次post进去的temp的id永远是等于一个固定值的，这个值非常巧，就是 

```
/groundStations/{id}
```

的id值，而本身这个实体用的是mysql的自增id，理论上这个值应该是由mysql自己设置的，而正常提交的时候这个值是不设置，应该为0，进而导致后面在数据库处理的时候直接去检查是否存在这个id，然后发现已经存在，无法添加，报错

{% endraw %}

## 修复

修复这个错，非常简单，只需要把

{% raw %}

```
/groundStations/{id}
替换成：
/groundStations/{typeId}
```

{% endraw %}

就可以正常工作了，而且id也正确了，只要不是id就能正常工作

还有一种办法就是在html中显示temp.id然后hide，虽然没用，而且其值也为0，但是可以让数据库正常工作，并且PathVariable也不会误读变量了。



## Summary

具体造成PathVariable会误读的原因我就不知道了，猜想大概是在做解析的时候，PathVariable或者是tymeleaf在做反射或者映射的时候混淆了id这个字符，导致url参数和对象属性混淆了

这个问题搜也搜不到，也没看到有人遇到过类似的情况

