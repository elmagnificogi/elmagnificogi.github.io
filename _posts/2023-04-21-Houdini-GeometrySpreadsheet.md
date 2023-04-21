---
layout:     post
title:      "Houdini Geometry Spreadsheet数据导出"
subtitle:   "Sop，Obj"
date:       2023-04-21
update:     2023-04-21
author:     "elmagnifico"
header-img: "img/x5.jpg"
catalog:    true
tobecontinued: false
tags:
    - Houdini
    - Python
---

## Foreword

很久之前写过一次导出，但是代码找不到了，然后新版本的Houdini很多东西都变了，老代码很多地方不兼容了



## Geometry Spreadsheet

```python
node = hou.pwd()
geo = node.geometry()

# CONFIG
filename = "test.csv"
separator = "," 

# Get File
f = file(filename, "w")

# Create Column
for attrib in geo.pointAttribs():
    attrib_count = attrib.size()
    if 1 != attrib_count:
        for i in range(0,attrib_count):
            if i > 2:   # if its a Multi Array
                f.write(attrib.name() + " [" + chr(94 + i) + "]" + separator) # ASCII to Char 
            else:
                f.write(attrib.name() + " [" + chr(88 + i) + "]" + separator) # ASCII to Char 
            
    else:
        f.write(attrib.name())
        f.write(separator)
f.write("\n")

# Insert Points in File
for point in geo.points():
    for attrib in geo.pointAttribs():
        attrib_count = attrib.size()
        if 1 != attrib_count:
            for i in range(0,attrib_count):
                f.write(str(point.attribValue(attrib)[i]) + separator)
        else:
            f.write(str(point.attribValue(attrib)))
            f.write(separator)
    f.write("\n")
    
# Save the CSV File    
f.close()
```







## Summary

先体验一下



## Quote

> https://github.com/kiryha/Houdini/wiki/python-snippets
>
> https://www.sidefx.com/forum/topic/56423/?page=1#post-253054
