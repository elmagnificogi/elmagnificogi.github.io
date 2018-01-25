---
layout:     post
title:      "网络流，最小费用最大流"
subtitle:   "增广路，EK"
date:       2018-01-25
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - python
---

## Foreword

之前的二分匹配问题，要做的是一对一的情况下，求得最优匹配的情况。

而从某种角度上来说二分带权匹配可以算是网络流中最大流的一种特殊情况。

网络流一般来说都是有一个源点和一个汇点。源点只负责无限流出流量，而汇点则是无限接收流量，然后会包含一些从源点到汇点的路径，每条路径能承载的流量都有上限，类似于二分带权最优匹配。

网络流图一般来说都是一个有向图，但是在求解的时候有时候需要增加对应的逆向边。

### 基础概念

一些网络流的基础概念参考引用，这里只说一些关键概念。

- 增广路，网络流的核心也是要寻找增广路，寻找增广路也是为了增加流量，但是这里的增广路和二分图中的不同，这里是指从源点到汇点的一条可行路径，即不超过容量限制的一种可行流路径。这里还有一个特殊点，就是存在逆向边。

- 逆向边，因为有时候寻找增广路的时候，如果没有逆向边，那么有时候某条增广路可能由于流量限制等原因，导致无法搜索到，那么就会造成最后得到的最大流不正确，为了解决这个问题引入了逆向边，从而可以让程序反悔之前的选择，重新选择一条路径,进而得到正确的结果。

#### 最大流

要求最大流，首先是寻找增广路，然后求一个d，这个d类似于二分图中的d，只不过在这里他是这条路上最小的可行流。

找到这个d以后，要更新图中的当前最大容量，以便下一次寻找更新。

需要注意的是，如果是正向边，那么当前最大容量应该是减d，如果是负向边，那么当前最大容量是加d

###### 算法

- bfs搜索一条增广路
- 计算d
- 更新当前容量上限
- 重复，直到没有增广路为止

###### code

```c
// 最大点数量
const int MAXN = 300;
// 最大整数
const int MAX_INT = ((1 << 31) - 1);

// 包括s与t的最大点数
int n;
// s - t 中的一个可行流中, 节点 i 的前序节点为 Pre[i]
int pre[MAXN];
// 记录一个点是否被访问过
bool vis[MAXN];
// 图的容量信息 初始化的时候要全部置0
int mp[MAXN][MAXN];

// 广度优先搜索
bool bfs(int s, int t)
{
	queue <int> que;
	memset(vis, 0, sizeof(vis));
	memset(pre, -1, sizeof(pre));
	pre[s] = s;
	vis[s] = true;
	que.push(s);
	while(!que.empty())
	{
		int u = que.front();
		que.pop();
		for(int i = 1; i <= n; i++)
		{
			if(mp[u][i] && !vis[i])
			{
				pre[i] = u;
				vis[i] = true;
				if(i == t)
					return true;
				que.push(i);
			}
		}
	}
	return false;
}

int EK(int s, int t)
{
	int ans = 0;
	while(bfs(s, t))
	{
		int mi = MAX_INT;
		// 计算d 增加流
		for(int i = t; i != s; i = pre[i])
		{
			mi = min(mi, mp[pre[i]][i]);
		}

		// 更新当前流上限
		for(int i = t; i != s; i = pre[i])
		{
			mp[pre[i]][i] -= mi;
			mp[i][pre[i]] += mi;
		}

		// 更新最大流
		ans += mi;
	}
	return ans;
}
```

## Summary

更多详细的网络流算法和问题参考下面的引用吧，有很多都写得非常详细了。

## Quote

> https://www.cnblogs.com/ZJUT-jiangnan/p/3632525.html
>
> http://blog.csdn.net/txl199106/article/details/64441994
>
> http://blog.163.com/jimmy_kudo/blog/static/252742100201588103314637/
>
> http://www.wutianqi.com/?p=3107
>
> http://blog.csdn.net/brodrinkwater/article/details/54999932
>
> http://blog.csdn.net/mystery_guest/article/details/51910913
>
