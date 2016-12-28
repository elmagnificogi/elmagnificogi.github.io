---
layout:     post
title:      "LeetCode Solution(Medium.17-20)"
subtitle:   "c/c++，python，for work"
date:       2015-12-22
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 17.Unique Paths

A robot is located at the top-left corner of a m x n grid (marked 'Start' in the diagram below).

The robot can only move either down or right at any point in time. The robot is trying to reach the bottom-right corner of the grid (marked 'Finish' in the diagram below).

How many possible unique paths are there?

![](http://articles.leetcode.com/wp-content/uploads/2014/12/robot_maze.png)

Above is a 3 x 7 grid. How many possible unique paths are there?

Note: m and n will be at most 100.

### 17.Unique Paths-Analysis

就问从左上到右下一次只能选一个方向走一步问有多少种走法而已。

首先从左上到右下的总步数是一定的（n-1+m-1）

向下的选择次数是一定的 m-1

向右的次数也是一定的 n-1 

从排列组合的角度来说，所有走法就等于C（m-1，n+m-2）=C（n-1，n+m-2）

排列组合来说就是一共走m+n-2步，其中有m-1步是往下走的，也就是从m+n-2步中挑出m-1步，求有多少种不同的方法。

所以这个题用数学方法的话就是求解C（m-1，n+m-2）的值就等于(m+n-2)!/(m-1)!*(n-1)!主要就是求解这个的问题。

结合之前遇到的题，求解排列组合非常容易越界，比如下面这个不到20就已经越界了。

	class Solution 
	{
	public:
	    int uniquePaths(int m, int n)
	    {
	        int i=0;
	        long p1=1,p2=1,p3=1;
	        for(i=1;i<m+n-1;i++)
	        {
	            if(i<=(m-1))
	                p2*=i;
	            if(i<=(n-1))    
	                p3*=i;
	            p1*=i;
	            if(p1%p2==0)
	            {
	                p1=p1/p2;
	                p2=1;
	            }
	            if(p1%p3==0)
	            {
	                p1=p1/p3;
	                p3=1;
	            }
	        }
	        return (int)p1/p2/p3;
	    }
	};

当然还有办法优化一下强行求解，并且通过，比如优化一下排列组合计算时约去最大的分母的阶乘，留下相对较小的值，同时再扩大数据类型

还有一种求解的方法就是用动态规划

动态规划的思路是：到当前点的路等于其上面的路和左面的路的和，那么要求最后一个点的路的总和就等于其上面和左面的路的和，就得到了其内容的循环体：

	A[I][J]=A[I-1][J]+A[I][J-1]

同时由于最上方路径和最左侧路径的特殊性，导致他们中每个点都只有一条路可以到大，所以其内容应该被提前置为1

但是呢这样需要额外的m*n的空间和时间。

因为其最左和最上都是1，所以还可以只用n的空间来完成，每次都是基础n的空间不断刷新计算就可以了,每次的值都等于当前值加上前一个值得内容。

    新值 =上方的值+左边的值 进行行循环的时候计算的是上方的值，进行列循环的时候计算的是左面的值
	A[I]=A[I]+A[I-1]

这个n的空间可以取到最小值（m，n）

### 17.Unique Paths-Solution-C/C++

#### 排列组合

	class Solution 
	{
	public:
	    int uniquePaths(int m, int n)
	    {
	        int i=0;
	        long long p1=1,p2=1;
	        int max=m>n?m:n,min=m>n?n:m;
	        for(i=1;i<m+n-1;i++)
	        {
	            if(i<=min-1)
	                p2*=i;
	            if(i>max-1)     
	                p1*=i;
	            if(p1%p2==0)
	            {
	                p1=p1/p2;
	                p2=1;
	            }
	        }
	        return (long long)(p1/p2);
	    }
	};

#### 动态规划

时间空间都为O(mn)

	class Solution 
	{
	public:
	    int uniquePaths(int m, int n)
	    {
	        vector<vector<int>> v(m, vector<int>(n, 1));  
	        for(int i=1; i<m; ++i)
	        {  
	            for(int j=1; j<n; ++j)
	            {  
	                v[i][j]=v[i-1][j]+v[i][j-1];  
	            }  
	        }  
	        return v[m-1][n-1];  
	    }
	};

时间为O(mn) 空间为O(n)

	class Solution 
	{  
	public:  
	    int uniquePaths(int m, int n) 
	    { 
	        int max=m>n?m:n,min=m>n?n:m;
	        vector<int> v(min, 1);  
	        for(int i=1; i<max; ++i)
	        {  
	            for(int j=1; j<min; ++j)
	            {  
	                v[j]+=v[j-1];  
	            }  
	        }  
	        return v[min-1];  
	    }  
	};  

### 17.Unique Paths-Solution-Python

时间为O(mn) 空间为O(n)

	class Solution(object):
	    def uniquePaths(self, m, n):
	        """
	        :type m: int
	        :type n: int
	        :rtype: int
	        """
	        mnmax=max(m,n)
	        mnmin=min(m,n)
	        initial_value=1  
	        list_length=mnmin  
	        v=[initial_value]*list_length
	        for i in range(1,mnmax):
	            for j in range(1,mnmin):
	                v[j]+=v[j-1]
	        return v[mnmin-1]

这里也学习了一下如何给python的list初始化同一个值

	initial_value = 0  
	list_length = 5  
	方法一，直接用循环遍历赋值
	sample_list = [ initial_value for i in range(list_length)]
  	方法二，用这样的格式也可以
	sample_list = [initial_value]*list_length  
	# sample_list ==[0,0,0,0,0]


## Quote

> http://www.cnblogs.com/qianye/archive/2013/09/06/3305680.html
> 
> http://blog.csdn.net/jiadebin890724/article/details/23302123
