---
layout:     post
title:      "LeetCode Solution(Easy.85-88)"
subtitle:   "c/c++，python，for work"
date:       2016-12-28
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---

## 85.Number of Boomerangs

Given n points in the plane that are all pairwise distinct, a "boomerang" is a tuple of points (i, j, k) such that the distance between i and j equals the distance between i and k (the order of the tuple matters).

Find the number of boomerangs. You may assume that n will be at most 500 and coordinates of points are all in the range [-10000, 10000] (inclusive).

Example:

	Input:
	[[0,0],[1,0],[2,0]]
	
	Output:
	2
	
	Explanation:
	The two boomerangs are [[1,0],[0,0],[2,0]] and [[1,0],[2,0],[0,0]]

### 85.Number of Boomerangs-Analysis

给出一个平面上n个点,如果3个点的距离成等差,那么就说明这三个点是来回的,如果有三个点的距离成等差,那么必然可以组成2个不同的等差元组.

刚开始就想,三个循环嵌套,依次穷举三个点,然后距离相等的就可以计数+1,但是想想就知道n^3次得复杂成什么样,应该通过不了.

所以再想其他的

然后参考别人的思路,就想到了这样,计算每个点到其他点的距离,然后搜索相同距离的点有多少个,如果有2个,那么就必然可以组成2*1个元组.

如果有n个,根据排列组合有顺序就可以组成A(n,2)种,那么返回结果加上A(n,2)就行了.

### 85.Number of Boomerangs-Solution-C/C++

	class Solution 
	{
	public:
	    int distance(pair<int, int> &a,pair<int, int> &b)
	    {
	        return (a.first-b.first)*(a.first-b.first)+(a.second-b.second)*(a.second-b.second);
	    }
	    int numberOfBoomerangs(vector<pair<int, int>>& points) 
	    {
	        if(points.size()<3)
	            return 0;
	        int r=0;
	        unordered_map<int,int>hashmap;
	        for(int i=0;i<points.size();i++)
	        {
	            for(int j=0;j<points.size();j++)
	            {
	                if(j==i)
	                    continue;
	                hashmap[distance(points[i],points[j])]++;
	                
	            }
	            for(auto n:hashmap)
	            {
	                if(n.second>=2)
	                    r=r+n.second*(n.second-1);
	            }
	            hashmap.clear();
	        }
	        return r;
	    }
	};

当参考过python的代码后发现,其实上面的代码里有很多多余的地方,有些判断没有必要.虽然表面上看逻辑是需要排除他的,但是实际计算的时候由于特殊性导致这样的判断其实毫无用处.

	class Solution 
	{
	public:
	    int distance(pair<int, int> &a,pair<int, int> &b)
	    {
	        return (a.first-b.first)*(a.first-b.first)+(a.second-b.second)*(a.second-b.second);
	    }
	    int numberOfBoomerangs(vector<pair<int, int>>& points) 
	    {
	        if(points.size()<3)
	            return 0;
	        int r=0;
	        unordered_map<int,int>hashmap;
	        for(int i=0;i<points.size();i++)
	        {
	            for(int j=0;j<points.size();j++)
	                hashmap[distance(points[i],points[j])]++;
	            for(auto n:hashmap)
	                r=r+n.second*(n.second-1);
	            hashmap.clear();
	        }
	        return r;
	    }
	};

比如这里计算哈希距离的时候计算自己也没事,因为算出来也是0不影响其他人.然后就是最后计算A(n,2)的时候,对于距离的判断也是没用的,因为只有2的距离才能计算出来2,1的距离完全计算不出来.所以判断也是没必须要的.

### 85.Number of Boomerangs-Solution-Python

	class Solution(object):
	    def numberOfBoomerangs(self, points):
	        """
	        :type points: List[List[int]]
	        :rtype: int
	        """
	        r=0;
	        for x1,y1 in points:
	            dictmap=collections.defaultdict(int)
	            for x2,y2 in points:
	                dictmap[(x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)]+=1
	            for n in dictmap:
	                r+=dictmap[n]*(dictmap[n]-1)
	        return r

这里使用了一个collections.defaultdict(int) 这个会帮你自动生成字典的默认值0,而不需要你去挨个添加字典赋值.	

## 86.Add Strings

Given two non-negative numbers num1 and num2 represented as string, return the sum of num1 and num2.

Note:
	
1. The length of both num1 and num2 is < 5100.
2. Both num1 and num2 contains only digits 0-9.
3. Both num1 and num2 does not contain any leading zero.
4. You must not use any built-in BigInteger library or convert the inputs to integer directly.

### 86.Add Strings-Analysis

这就是给两个用string表示的大整数,要求你计算其和,返回值也是string类型.

其实挺简单的,挨个取字符,然后设置一进位标识符,最后加一起就行了.

但是如果是一个一个字符的取,就太慢了,应该利用int的特性,最大一次取2^31(int当成4字节)的大小,保证int自身不会溢出.

2^31=2 147 483 648 发现一共是10位的整数,为了确保不溢出,每次可以取9个字符来计算.每9个字符设置一个进位标志.

经过反复调试以后发现,如果想利用int来达到最大位的计算,需要调试的细节部分非常多,非常容易出错,代码复杂度直线上升.

所以还是使用一位一位的进行计算.

### 86.Add Strings-Solution-C/C++

	class Solution 
	{
	public:
	    string addStrings(string num1, string num2)
	    {
	        int n1=0,n2=0,c=0,sum=0;
	        string r="";
	        for(int i=num1.size()-1,j=num2.size()-1;i>=0||j>=0;i--,j--)
	        {
	            n1=i>=0?num1[i]-'0':0;
	            n2=j>=0?num2[j]-'0':0;
	            sum=n1+n2+c;
	            r.insert(r.begin(),sum%10+'0');
	            c=sum/10;
	        }
	        return c?"1"+r:r;
	    }
	};

### 86.Add Strings-Solution-Python

	class Solution(object):
	    def addStrings(self, num1, num2):
	        """
	        :type num1: str
	        :type num2: str
	        :rtype: str
	        """
	        n1=0
	        n2=0
	        c=0
	        sum=0
	        r=""
	        i=len(num1)-1
	        j=len(num2)-1
	        while (i>=0)or(j>=0):
	            if i>=0:
	                n1=ord(num1[i])-ord('0')
	            else:
	                n1=0
	            if j>=0:
	                n2=ord(num2[j])-ord('0')
	            else:
	                n2=0
	            sum=n1+n2+c
	            r=chr(sum%10+ord('0'))+r
	            c=sum/10;
	            i-=1
	            j-=1
	        if c==1:
	            return "1"+r
	        else:
	            return r

注意使用ord和chr进行ASCII的切换.

## 87.Convert a Number to Hexadecimal

Given an integer, write an algorithm to convert it to hexadecimal. For negative integer, two’s complement method is used.

Note:

1. All letters in hexadecimal (a-f) must be in lowercase.
2. The hexadecimal string must not contain extra leading 0s. If the number is zero, it is represented by a single zero character '0'; otherwise, the first character in the hexadecimal string will not be the zero character.
3. The given number is guaranteed to fit within the range of a 32-bit signed integer.
4. You must not use any method provided by the library which converts/formats the number to hex directly.

Example 1:

	Input:
	26
	
	Output:
	"1a"

Example 2:
	
	Input:
	-1
	
	Output:
	"ffffffff"

### 87.Convert a Number to Hexadecimal-Analysis

把十进制数字转换为十六进制,同时负数使用补码.

### 87.Convert a Number to Hexadecimal-Solution-C/C++

	class Solution 
	{
	public:
	    string toHex(int num) 
	    {
	        string r="";
	        int n=0,i=0,j=16;
	        long s=0;
	        if(num<0)
	            s=0x100000000+num;
	        else
	            s=num;
	        if(s==0)
	            return "0";
	        while(s>0)
	        {
	            i++;
	            n=s%16;
	            s=s/16;
	            if(n<10)
	                r=to_string(n)+r;
	            else if(n==10)
	                r='a'+r;
	            else if(n==11)
	                r='b'+r;
	            else if(n==12)
	                r='c'+r;
	            else if(n==13)
	                r='d'+r;
	            else if(n==14)
	                r='e'+r;
	            else
	                r='f'+r;
	        }
	        return r;
	    }
	};

对一个数字一直mod16就可以得到他的各个位上的16进制数,但是这是针对正数才可以的.

如果是负数,其实这个方法并不能用,这里取巧了使用了更大的数据类型来完成,但这应该是不规范的.

正确的解法,应该是用位操作完成,每4位求一次十六进制,从而可以完美完成正数和负数的问题.

	class Solution
	{
	public:
	    string toHex(int num) 
	    {
	        string hexString = "";
	        string hexChar = "0123456789abcdef";
	        while (num) 
	        {
	            hexString = hexChar[num & 0xF] + hexString;
	            num = (unsigned)num >> 4;
	        }
	        return hexString.empty() ? "0" : hexString;
	    }
	};

这是标准解法,其中对num右移时需要将num转换为无符号数来做,不然正数右移是补0,负数右移是补1,会导致结果出错.

### 87.Convert a Number to Hexadecimal-Solution-Python

	class Solution(object):
	    def toHex(self, num):
	        """
	        :type num: int
	        :rtype: str
	        """
	        r=[]
	        hexs = '0123456789abcdef'
	        if num < 0: num += 0x100000000
	        while num:
	            r.append(hexs[num % 16])
	            num /= 16
	        return ''.join(r[::-1]) if r else '0'

这里python也是利用int自动扩大范围,取巧完成了负数的部分,r[::-1]是逆序输出r,然后利用join的连接特性,连接起了字符.

题目里又要求了不能用转换函数,python的负数又非常特殊.

	print(-1)
    print(bin(-1))
    print(hex(-1))
	
	可以看到 -1在python中的二进制是 -1 十六进制也是-0x1 非常的特殊
	所以就不强用python来做这个题里.
	
	-1
	-0b1
	-0x1

仔细看了一下TOP的答案感觉python虽然有上面的特殊性,但是实际上做起来好像没问题?下面是我自己写的

	class Solution(object):
	    def toHex(self, num):
	        """
	        :type num: int
	        :rtype: str
	        """
	        hexs="0123456789abcdef"
	        r=""
	        if(num<0):
	            for i in range(8):
	                r=hexs[num&0xf]+r
	                num=num>>4
	            num=0;
	        while num!=0:
	            r=hexs[num&0xf]+r
	            num=num>>4
	        if r!="":
	            return r
	        else:
	            return "0"

唯一需要注意的就是由于负数的特殊性,需要限制循环的次数,不然会成为死循环.

之所以没有让正数也只做4次循环是因为正数会导致多余的0出现.而多余的0可以用一个特殊函数来消除.

参考的一个一行解决这个问题的答案使用了strip函数,这个函数可以去除字符串首尾指定的字符.其中lstrip则是去除首部的指定字符,rstrip则是去除尾部的字符.这样就不会出现返回的正数中有前置0的问题了.

	class Solution(object):
	    def toHex(self, num):
	        """
	        :type num: int
	        :rtype: str
	        """
	        hexs="0123456789abcdef"
	        r=""
	        if num==0:
	            return "0"
	        for i in range(8):
	            r=hexs[num&0xf]+r
	            num=num>>4
	        return r.lstrip('0')


## 88.Repeated Substring Pattern

Given a non-empty string check if it can be constructed by taking a substring of it and appending multiple copies of the substring together. You may assume the given string consists of lowercase English letters only and its length will not exceed 10000.

Example 1:

	Input: "abab"
	
	Output: True

	Explanation: It's the substring "ab" twice.

Example 2:

	Input: "aba"

	Output: False

Example 3:

	Input: "abcabcabcabc"
	
	Output: True
	
	Explanation: It's the substring "abc" four times. (And the substring "abcabc" twice.)

### 88.Repeated Substring Pattern-Analysis

检测一个字符串是否可以被其子串重复若干次形成.

我的思路,首先获取字符串长度,然后根据长度,进行遍历,长度的公约数,然后用公约数长度的子串构造一个和目标字符串一样长度的串

然后对比两个字符串是否相同,如果相同就返回true,不同就下一个公约数,一直到用完所有公约数.

当然也可以无脑直接从1开始穷举匹配,一直到二分之一长度,但是这样太慢了,所以找公约数更好一些.

### 88.Repeated Substring Pattern-Solution-C/C++

	class Solution
	{
	public:
	    bool repeatedSubstringPattern(string str) 
	    {
	        int n=str.size();
	        for(int i=1;i<=n/2;i++)
	        {
	            if(n%i==0)
	            {//i是其长度的公约数
	                string rsub="";
	                for(int j=0;j<n/i;j++)
	                    rsub+=str.substr(0,i);
	                if(rsub==str)
	                    return true;
	            }
	        }
	        return false;
	    }
	};

### 88.Repeated Substring Pattern-Solution-Python

	class Solution(object):
	    def repeatedSubstringPattern(self, str):
	        """
	        :type str: str
	        :rtype: bool
	        """
	        n=len(str)
	        rsub=""
	        for i in range(1,n/2+1):
	            if n%i==0:
	                rsub=str[0:i]*(n/i)
	                if rsub==str:
	                    return True
	        return False

python做起来较为简单,其string可以直接用n个字符串赋值,很容易.

## Quote

> http://blog.csdn.net/u014376961/article/details/53054941
> 
> http://bookshadow.com/weblog/2016/11/06/leetcode-number-of-boomerangs/
> 
> http://www.tuicool.com/articles/YbmYbyf
> 
> http://www.cnblogs.com/grandyang/p/5944311.html
> 
> http://blog.csdn.net/camellhf/article/details/52680097
> 
> http://www.cnblogs.com/BeginMan/archive/2013/03/14/2958985.html
> 
> http://www.runoob.com/python/python-strings.html