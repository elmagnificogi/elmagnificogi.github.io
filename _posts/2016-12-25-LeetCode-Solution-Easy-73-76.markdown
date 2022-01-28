---
layout:     post
title:      "LeetCode Solution(Easy.73-76)"
subtitle:   "c/c++，python，for work"
date:       2016-12-25
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 73.Island Perimeter

You are given a map in form of a two-dimensional integer grid where 1 represents land and 0 represents water. Grid cells are connected horizontally/vertically (not diagonally). The grid is completely surrounded by water, and there is exactly one island (i.e., one or more connected land cells). The island doesn't have "lakes" (water inside that isn't connected to the water around the island). One cell is a square with side length 1. The grid is rectangular, width and height don't exceed 100. Determine the perimeter of the island.

Example:

	[[0,1,0,0],
	 [1,1,1,0],
	 [0,1,0,0],
	 [1,1,0,0]]

	Answer: 16
	Explanation: The perimeter is the 16 yellow stripes in the image below:

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c00aa4b4ece3.png)

### 73.Island Perimeter-Analysis

给一个二位矩阵,表示的是一个小岛与海,要求求出小岛的周长.

通过查看图像,可以发现1的上下左右出现了出现x个1就表示当前周长是4-x.

一共只有四种情况,只要做一个遍历就可以把所有的算出来了.

### 73.Island Perimeter-Solution-C/C++

	class Solution
	{
	public:
	    int islandPerimeter(vector<vector<int>>& grid)
	    {
	        int edge=0,r=0;
	        for(int i=0;i<grid.size();i++)
	        {
	            for(int j=0;j<grid[i].size();j++)
	            {
	                if(grid[i][j]==1)
	                {
	                    //检查他的上下左右
	                    if((i!=0)&&(grid[i-1][j]==1))
	                    {//上
	                        ;
	                    }
	                    else
	                        edge+=1;
	                    if((i!=grid.size()-1)&&(grid[i+1][j]==1))
	                    {//下
	                        ;
	                    }
	                    else
	                        edge+=1;
	                    if((j!=0)&&(grid[i][j-1]==1))
	                    {//左
	                        ;
	                    }
	                    else
	                        edge+=1;
	                    if((j!=grid[i].size()-1)&&(grid[i][j+1]==1))
	                    {//右
	                        ;
	                    }
	                    else
	                        edge+=1;
	                }
	                r=r+edge;
	                edge=0;
	            }
	        }
	        return r;
	    }
	};

### 73.Island Perimeter-Solution-Python

	class Solution(object):
	    def islandPerimeter(self, grid):
	        """
	        :type grid: List[List[int]]
	        :rtype: int
	        """
	        edge=0
	        r=0
	        for i in range(0,len(grid)):
	            for j in range(0,len(grid[i])):
	                if grid[i][j]==1:
	                    if i!=0 and grid[i-1][j]==1:
	                        d=1
	                    else:
	                        edge=edge+1
	                    if i!=len(grid)-1 and grid[i+1][j]==1:
	                        d=1
	                    else:
	                        edge=edge+1
	                    if j!=0 and grid[i][j-1]==1:
	                        d=1
	                    else:
	                        edge=edge+1
	                    if j!=len(grid[i])-1 and grid[i][j+1]:
	                        d=1
	                    else:
	                        edge=edge+1
	                r=r+edge
	                edge=0
	        return r

## 74.Sum of Two Integers

Calculate the sum of two integers a and b, but you are not allowed to use the operator + and -.

Example:
Given a = 1 and b = 2, return 3.

Credits:
Special thanks to @fujiaozhu for adding this problem and creating all test cases.

### 74.Sum of Two Integers-Analysis

不用加和减计算两个整数的和

那么想到用特殊的运算规则来进行.

首先是异或运算,位的异或可以得到,两个数字进行加法不进位的结果.

然后是与运算,与运算可以直接得到进位的位是哪个.但是得到的进位是在原本位上的.

那么要得到最后的结果就得把与运算结果左移一位

然而这样的到的只是一次进位的结果,如果进位加上异或结果又进位了,就又需要上述操作.

一直到进位结果是0的时候表示,没有进位了,那么这时得到的结果就是a+b的和

### 74.Sum of Two Integers-Solution-C/C++

	class Solution
	{
	public:
	    int getSum(int a, int b)
	    {
	        while(b)
	        {
	            int x=a^b,c=(a&b)<<1;
	            a=x;
	            b=c;
	        }
	        return a;
	    }
	};

### 74.Sum of Two Integers-Solution-Python

	class Solution(object):
	    def getSum(self, a, b):
	        """
	        :type a: int
	        :type b: int
	        :rtype: int
	        """
	        while b!=0:
	            x=a^b
	            c=(a&b)<<1
	            a=x
	            b=c
	        return a

在python中使用这样的方法,如果是正数没问题,但是一旦出现了数据类型从int变到long的时候就会出错了.

负数也是,当遇到了位移操作的时候,32位位移的时候会变成64位类型,从而导致计算错误或者超时,这时就需要手动屏蔽超出的位.

	class Solution(object):
	    def getSum(self, a, b):
	        """
	        :type a: int
	        :type b: int
	        :rtype: int
	        """
	        MAX_INT = 0x7FFFFFFF
	        MIN_INT = 0x80000000
	        MASK = 0x100000000
	        while b:
	            a, b = (a ^ b) % MASK, ((a & b) << 1) % MASK
	        return a if a <= MAX_INT else ~((a % MIN_INT) ^ MAX_INT)

首先对异或和与的结果屏蔽高32位,只留下低32位,可以用与也可以用求余,这样保证了每次操作的数都是32位的

然后还需要考虑一个问题,就是负数的问题.

	当两个负数使用异或和与时会出现下面的结果
	比如-1与-1
	-1 表示为 原码1000...0001 反码是1111....1110
	两个都是-1
	第一次异或和与后结果为:
	(0, 4294967294) 对应的实际是(0,1111 1111 1111 1111 1111 1111 1111 1110)
	第二次的结果为:
	(4294967294, 0) 对应的实际是(1111 1111 1111 1111 1111 1111 1111 1110,0)
	而这时由于b=0,进位是0,所以结束了循环.
	正确结果应该是-2 对应二进制为 11111111111111111111111111111101
	这时将a的结果mod 0x80000000 得到了0x7FFF FFFE(2147483646)
	再将这个结果和MAX_INT求异或,然后取反就得了正确的负数表示?
	这里是为啥可以??
	我自己感觉应该是因为负数在python中使用了原码表示,进行计算的时候也是用的原码,所以产生了这样的问题
	具体还有待讨论


## 75.Find the Difference

Given two strings s and t which consist of only lowercase letters.

String t is generated by random shuffling string s and then add one more letter at a random position.

Find the letter that was added in t.

Example:

	Input:
	s = "abcd"
	t = "abcde"

	Output:
	e

	Explanation:
	'e' is the letter that was added.

### 75.Find the Difference-Analysis

看起来好像是在一个字符串里随机插入一个字符,然后找到这个字符.

而实际上另外一个字符内容也是随机的,需要你找出多余的那个.

所以最好的办法就是求异或和,最后得到的结果就是那个剩下的字符.

### 75.Find the Difference-Solution-C/C++

	class Solution
	{
	public:
	    char findTheDifference(string s, string t)
	    {
	        char r=0;
	        for(int i=0;i<s.size();i++)
	        {
	            r=r^s[i]^t[i];
	        }
	        r=r^t[t.size()-1];
	        return r;
	    }
	};

### 75.Find the Difference-Solution-Python

	class Solution(object):
	    def findTheDifference(self, s, t):
	        """
	        :type s: str
	        :type t: str
	        :rtype: str
	        """
	        l=s+t
	        r=0
	        for i in range(0,len(l)):
	            r=r^ord(l[i])
	        return chr(r)

用python有一个要注意的,就是由于他的string下的字符是不可以单独拿来直接当成int类型计算的.

所以需要先转换为ASCII码之后再用异或,最后再转换成char

## 76.Assign Cookies

Assume you are an awesome parent and want to give your children some cookies. But, you should give each child at most one cookie. Each child i has a greed factor gi, which is the minimum size of a cookie that the child will be content with; and each cookie j has a size sj. If sj >= gi, we can assign the cookie j to the child i, and the child i will be content. Your goal is to maximize the number of your content children and output the maximum number.

Note:
You may assume the greed factor is always positive.
You cannot assign more than one cookie to one child.

Example 1:

	Input: [1,2,3], [1,1]

	Output: 1

	Explanation: You have 3 children and 2 cookies. The greed factors of 3 children are 1, 2, 3.
	And even though you have 2 cookies, since their size is both 1
	you could only make the child whose greed factor is 1 content.
	You need to output 1.

Example 2:

	Input: [1,2], [1,2,3]

	Output: 2

	Explanation: You have 2 children and 3 cookies. The greed factors of 2 children are 1, 2.
	You have 3 cookies and their sizes are big enough to gratify all of the children,
	You need to output 2.

### 76.Assign Cookies-Analysis

简单说就是供需关系,求最大满足人数.

每人只能给一次,所以需要给最符合他的那一个.如果没有就放弃

### 76.Assign Cookies-Solution-C/C++

	class Solution
	{
	public:
	    int findContentChildren(vector<int>& g, vector<int>& s)
	    {
	        int count=0,cur=0,curs=0,find=0;
	        for(int i=0;i<g.size();i++)
	        {
	            cur=0x7fffffff;
	            curs=0x7fffffff;
	            find=0;
	            for(int j=0;j<s.size();j++)
	            {
	                if(s[j]==g[i])
	                {
	                    find=1;
	                    curs=j;
	                    break;
	                }
	                else
	                {
	                    if(s[j]>g[i]&&s[j]!=0)
	                    {
	                        if(s[j]>cur)
	                        {
	                            ;
	                        }
	                        else
	                        {
	                            cur=s[j];
	                            curs=j;
	                            find=1;
	                        }
	                    }
	                }
	            }
	            if(find)
	            {
	                count++;
	                s[curs]=0;
	            }

	        }
	        return count;
	    }
	};

上面的思路就是从供给队列中寻找符合需求队列的最小符合项,找到了就把人数+1,对应位置置0.
但是时间太慢了,需要n^2才能完成.所以考虑其他思路.

还有一种,就是先把供给和需求各自排序,排序完成以后再用一一对应最小满足的方式去计算人数就行了.

	class Solution
	{
	public:
	    int findContentChildren(vector<int>& g, vector<int>& s)
	    {
	        int n=g.size(),m=s.size();
	        sort(g.begin(),g.end());
	        sort(s.begin(),s.end());
	        int i=0,j=0;
	        while(i<n&&j<m)
	        {
	            if(s[j]>=g[i])
	                i++;
	            j++;
	        }
	        return i;
	    }
	};

### 76.Assign Cookies-Solution-Python

	class Solution(object):
	    def findContentChildren(self, g, s):
	        """
	        :type g: List[int]
	        :type s: List[int]
	        :rtype: int
	        """
	        g.sort()
	        s.sort()
	        m,n=len(g),len(s)
	        i,j=0,0
	        while i<m and j<n:
	            if s[j]>=g[i]:
	                i+=1
	            j+=1
	        return i

## Quote

> http://blog.csdn.net/booirror/article/details/51816003
>
> http://bookshadow.com/weblog/2016/06/30/leetcode-sum-of-two-integers/
>
> http://blog.csdn.net/cnmilan/article/details/44777017
>
> http://blog.csdn.net/junchen1992/article/details/53147967
