---
layout:     post
title:      "二分图带权最大匹配"
subtitle:   "KM，完备匹配"
date:       2018-01-24
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - Graph Theory
---

## Foreword

前面的二分图，都是基于每条边都是可行的，最大匹配也是只要可行就行，完全不考虑，选择这条边带来的代价，认为所有的边都是代价平等的，然而实际上很多问题不同的选择需要付出的代价并不相同。

那么为了解决这种问题，从而有了二分图带权匹配，其实还有一种方法，就是通过网络流求最小费用最大流，从而获得最佳匹配。

### KM算法

KM算法的基础也一样是匈牙利算法，但是在它的基础上融合了贪心算法和引入了可行顶标这一概念，从而解决了这一问题。

- 可行的顶标，首先我们知道匈牙利算法中边都是可选择的，不存在权值这么一说，而在带权图中，边就有了权值，可行顶标则就是为了处理边的权值的，首先他将边的权值分配给了顶点，也就是说边不再有权值，权值仅属于顶点。

同时所有的可行顶标都满足：

![](https://img.elmagnifico.tech/static/upload/elmagnifico/5bffc86c14989.png)

lx表示左点集，ly表示右点集，lx(x)表示左点集中的x顶点的顶标值，该式表示的自然也就是任意两点的顶标和是大于等于其边权值的

- 相等子图，从原图生成的具有相同顶点的图，不一定包含其所有边，这样的子图中的边与顶点满足下式：

![](https://img.elmagnifico.tech/static/upload/elmagnifico/5bffc89fd12dd.png)

相等子图中包含的原理：如果原图的一个相等子图中包含完备匹配，那么这个的匹配同时也是原图的最佳二分匹配.KM算法保证了顶标的基本式,从而得到的匹配权值之和肯定是小于等于所有顶标之和的,进而图中的完备匹配是最优的.

###### 算法

- 第一步将左顶点赋值为其所形成的最大边权值,右顶点统一设置为0.
- 第二步匈牙利算法寻找相等子图的完备匹配
  - 未找到增广路则修改可行顶标
- 重复直到找到完备匹配

关键在于如何修改可行顶标

引入d，d=min{Cx[i]+Cy[j]-w[i][j]},Cx表示当前的左i顶点标值,Cy表示除了右j顶点外其他顶点的标志,w表示边权.

其含义就是当遇到需要修改时,让其中某一个顶点去连接另外一个顶点,并且让总权值比之前降低的最小,即总权值保证了修改后是最大的,这个d就是没找到的情况下,需要减少的顶标值来增加匹配数,最少减少的权值,而由于是左顶点减少了d,那么与该点相关的右顶点则需要增加d,来维持全过程中可行顶标的基础式.

###### code

```c++
const int MAX = 1024;
int n;
// 左顶点个数
int weight[MAX][MAX];
// 邻接矩阵存储 X 到 Y 的权重
int lx[MAX], ly[MAX];
// 各顶点的标号值
bool sx[MAX], sy[MAX];
// 是否被搜索过
int match[MAX];
// Y(i) 与 X(match [i]) 匹配

// 从 X(u) 寻找增广道路，找到则返回 true
bool path(int u);

// 参数 maxsum 为 true ，返回最大权，否则最小权
int bestmatch(bool maxsum = true);

// DFS
bool path(int u)
{
	sx[u] = true;
	for(int v = 0; v < n; v++)
		if(!sy[v] && lx[u] + ly[v] == weight[u][v])
		{
			sy[v] = true;
			if(match[v] == -1 || path(match[v]))
			{
				match[v] = u;
				return true;
			}
		}
	return false;
}

int bestmatch(bool maxsum)
{
	int i, j;
	if(!maxsum)
	{
		for(i = 0; i < n; i++)
			for(j = 0; j < n; j++)
				weight[i][j] = -weight[i][j];
	}

	// 初始化标号
	for(i = 0; i < n; i++)
	{
		lx[i] = -0x1FFFFFFF;
		ly[i] = 0;
		for(j = 0; j < n; j++)
			if(lx[i] < weight[i][j])
				lx[i] = weight[i][j];
	}

    // 初始化匹配
	memset(match, -1, sizeof(match));

    // 遍历所有左顶点,寻找最大匹配
	for(int u = 0; u < n; u++)
		while (1)
		{
            // 初始化搜索记录 开始DFS
			memset(sx, 0, sizeof(sx));
			memset(sy, 0, sizeof(sy));
			if(path(u))
                // 如果找到了,顶标不修改,从下一个顶点继续找
				break;

			// 初始化dx = 正无穷,计算顶标最小值
			int dx = 0x7FFFFFFF;
			for(i = 0; i < n; i++)
				if(sx[i])
					for(j = 0; j < n; j++)
						if(!sy[j])
							dx = min(lx[i] + ly[j] - weight[i][j], dx);

            // 更新所有顶标
			for(i = 0; i < n; i++)
			{
				if(sx[i])
					lx[i] -= dx;
				if(sy[i])
					ly[i] += dx;
			}
		}

    // 求最大权值和
	int sum = 0;
	for(i = 0; i < n; i++)
		sum += weight[match[i]][i];

	if(!maxsum)
	{
		sum = -sum;
        // 还原权值
		for (i = 0; i < n; i++)
			for (j = 0; j < n; j++)
				weight[i][j] = -weight[i][j];
	}
	return sum;
}
```

## Summary

更多详细的KM算法和问题参考下面的引用吧，有很多都写得非常详细了。

## Quote

> http://blog.csdn.net/sixdaycoder/article/details/47720471
>
> http://www.cnblogs.com/Lanly/p/6291214.html
>
> https://www.cnblogs.com/SYCstudio/p/7140568.html
>
> https://www.cnblogs.com/wenruo/p/5264235.html
