---
layout:     post
title:      "LeetCode Solution(Easy.81-84)"
subtitle:   "c/c++，python，for work"
date:       2016-12-27
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 81.First Unique Character in a String

Given a string, find the first non-repeating character in it and return it's index. If it doesn't exist, return -1.

Examples:

	s = "leetcode"
	return 0.

	s = "loveleetcode",
	return 2.

Note: You may assume the string contain only lowercase letters.

### 81.First Unique Character in a String-Analysis

寻找字符串中第一个未重复的字符.

统计字符出现次数以及对应的第一次出现序列就行了.

### 81.First Unique Character in a String-Solution-C/C++

	class Solution
	{
	public:
	    int firstUniqChar(string s)
	    {
	        int st[2][26]={0};
	        for(int i=0;i<s.size();i++)
	        {
	            if(st[0][s[i]-'a']==0)
	                st[0][s[i]-'a']=i;
	            st[1][s[i]-'a']++;
	        }
	        int min=0x7fffffff;
	        for(int i=0;i<26;i++)
	        {
	            if(st[1][i]==1)
	                min=st[0][i]<min?st[0][i]:min;
	        }
	        if(min==0x7fffffff)
	            return -1;
	        return min;

	    }
	};

### 81.First Unique Character in a String-Solution-Python

	class Solution(object):
    def firstUniqChar(self, s):
        """
        :type s: str
        :rtype: int
        """
        st= [([0] * 26) for i in range(2)]
        for i in range(len(s)):
            if st[0][ord(s[i])-ord('a')]==0:
                st[0][ord(s[i])-ord('a')]=i
            st[1][ord(s[i])-ord('a')]+=1
        min=0x7fffffff
        for i in range(26):
            if st[1][i]==1:
                if min>st[0][i]:
                    min=st[0][i]

        if min==0x7fffffff:
            return -1;
        return min

这里遇到了一个python的二维数组创建问题

	#创建一个宽度为3，高度为4的数组
	#[[0,0,0],
	# [0,0,0],
	# [0,0,0],
	# [0,0,0]]
	myList = [[0] * 3] * 4

然而这样创建的结果就是4行list都是浅拷贝,对一个操作会影响所有的.

[([0] * col) for i in range(rol)] 这样写,也有一个问题就是二维有效,三维依然会出现浅拷贝问题.

所以python中多维需要用for循环一层一层来创建.

## 82. Longest Palindrome

Given a string which consists of lowercase or uppercase letters, find the length of the longest palindromes that can be built with those letters.

This is case sensitive, for example "Aa" is not considered a palindrome here.

Note:
Assume the length of given string will not exceed 1,010.

Example:

	Input:
	"abccccdd"

	Output:
	7

	Explanation:
	One longest palindrome that can be built is "dccaccd", whose length is 7.

### 82. Longest Palindrome-Analysis

构造最大回文序列.给出一个字符串,可以使用里面的字符构造回文序列,但每个字符只能用一次.求出最大回文长度.

思路类似于上一题,直接统计各字符出现个数,所有出现次数是偶数的可以加一起,奇数次-1加一起,然后查看是否有出现奇数次的,有就结果+1,没有就返回了.

### 82. Longest Palindrome-Solution-C/C++

	class Solution
	{
	public:
	    int longestPalindrome(string s)
	    {
	        int st[52]={0},r=0,odd=0;
	        for(int i=0;i<s.size();i++)
	        {
	            if(s[i]<97)
	                st[s[i]-'A'+26]++;
	            else
	                st[s[i]-'a']++;

	        }
	        for(int i=0;i<52;i++)
	        {
	            if(st[i]%2==0)
	                r+=st[i];
	            else
	            {
	                r+=(st[i]-1);
	                odd=1;
	            }
	        }
	        return r+odd;
	    }
	};

### 82. Longest Palindrome-Solution-Python

	class Solution(object):
	    def longestPalindrome(self, s):
	        """
	        :type s: str
	        :rtype: int
	        """
	        st= [0]*52
	        for i in range(len(s)):
	            if ord(s[i])<97:
	                st[ord(s[i])-ord('A')+26]+=1
	            else:
	                st[ord(s[i])-ord('a')]+=1
	        odd=0
	        r=0
	        for i in range(52):
	            if st[i]%2==0:
	                r+=st[i]
	            else:
	                r+=st[i]-1
	                odd=1
	        return r+odd

## 83.Intersection of Two Arrays II

Given two arrays, write a function to compute their intersection.

Example:
Given nums1 = [1, 2, 2, 1], nums2 = [2, 2], return [2, 2].

Note:

- Each element in the result should appear as many times as it shows in both arrays.
- The result can be in any order.

Follow up:

- What if the given array is already sorted? How would you optimize your algorithm?
- What if nums1's size is small compared to nums2's size? Which algorithm is better?
- What if elements of nums2 are stored on disk, and the memory is limited such that you cannot load all elements into the memory at once?

### 83.Intersection of Two Arrays II-Analysis

一样是寻找数组交集,但是这次是返回完整交集,而不再是只是重复元素(只出现一次)

同时也引申了三个情况

1.如果给的是排序的数组,用什么算法合适

	直接用双指针一个循环依次移动,重复的就加入到输出队列,这个很简单

2.如果明确其中一个数组比另外一个小,用什么算法

	如果知道了某一个比较小,那么就可以两个循环嵌套,直接搜索结果.
	或者说已经建立了一个字典/hash表等情况下进行搜索就行了

3.如果其中一个数组太大了,不能一次性读取,要用什么算法

	如果太大了不能一次读取,那就部分搜索,同时对字典中对应的重复元素进行减少.

### 83.Intersection of Two Arrays II-Solution-C/C++

	class Solution
	{
	public:
	    vector<int> intersect(vector<int>& nums1, vector<int>& nums2)
	    {
	        unordered_map<int, int> r;
	        vector<int>re;
	        for(auto n:nums2)
	            //建立nums2的hash表
	            r[n]++;
	        for(auto n:nums1)
	        {
				//查找nums1
	            if(r[n]!=0)
	            {
	                re.push_back(n);
	                r[n]--;
	            }
	        }
	        return re;
	    }
	};

### 83.Intersection of Two Arrays II-Solution-Python

之前做过的77.Ransom Note中使用了collection下的Counter来统计字符出现的次数,这次也是可以利用这个类来完成.

	class Solution(object):
	    def intersect(self, nums1, nums2):
	        """
	        :type nums1: List[int]
	        :type nums2: List[int]
	        :rtype: List[int]
	        """
	        #首先确保了nums1是最短的
	        if len(nums1)>len(nums2):
	            nums1,nums2=nums2,nums1
	        #对最短的建立字典
	        r=collections.Counter(nums1)
	        re=[]
	        for n in nums2:
	            if r[n]>0:
	                re.append(n)
	                r[n]-=1
	        return re

## 84.Binary Watch

A binary watch has 4 LEDs on the top which represent the hours (0-11), and the 6 LEDs on the bottom represent the minutes (0-59).

Each LED represents a zero or one, with the least significant bit on the right.

![SMMS](https://i.loli.net/2018/11/30/5c00aa2d50d97.jpg)

For example, the above binary watch reads "3:25".

Given a non-negative integer n which represents the number of LEDs that are currently on, return all possible times the watch could represent.

Example:

	Input: n = 1
	Return: ["1:00", "2:00", "4:00", "8:00", "0:01", "0:02", "0:04", "0:08", "0:16", "0:32"]

Note:

- The order of output does not matter.
- The hour must not contain a leading zero, for example "01:00" is not valid, it should be "1:00".
- The minute must be consist of two digits and may contain a leading zero, for example "10:2" is not valid, it should be "10:02".

### 84.Binary Watch-Analysis

就是一个二进制表,给你灯亮的个数,你需要返回对应可能的时间.一共有10个灯,4个表示小时,6个表示分钟

10位,那么其实最多就是1023,那么只需要分析对应的0-1023中符合所给n的1的个数就可以了.

### 84.Binary Watch-Solution-C/C++

	class Solution
	{
	public:
	    vector<string> readBinaryWatch(int num)
	    {
	        int h=0,m=0,n=0;
	        vector<string> r;
	        for(int i=0;i<=1024;i++)
	        {
	            for(int j=0;j<10;j++)
	                n+=(i>>j)&1;
	            if(n==num)
	            {
	                h=i>>6;
	                m=i&0x3F;
	                if(h<12&&m<60)
	                {
	                    if(m<10)
	                        r.push_back(to_string(h)+":0"+to_string(m));
	                    else
	                        r.push_back(to_string(h)+':'+to_string(m));
	                }
	            }
	            n=0;
	        }
	        return r;
	    }
	};

### 84.Binary Watch-Solution-Python

	class Solution(object):
	    def readBinaryWatch(self, num):
	        """
	        :type num: int
	        :rtype: List[str]
	        """
	        r=[]
	        for i in range(1024):
	            if bin(i).count('1')==num:
	                h,m=i>>6,i&0x3F
	                if h<12 and m<60:
	                    r.append('%d:%02d' % (h, m))
	        return r

python中使用了一些较为方便的函数,bin是将对应int转换为二进制,count是用于计算其中含有1的个数

最后使用了'%d:%02d'的格式化输出

## Quote

> http://www.cnblogs.com/btchenguang/archive/2012/01/30/2332479.html
>
> http://www.jb51.net/article/15716.htm
>
> http://www.cnblogs.com/grandyang/p/5533305.html
>
> http://bookshadow.com/weblog/2016/05/21/leetcode-intersection-of-two-arrays-ii/
>
> http://bookshadow.com/weblog/2016/09/18/leetcode-binary-watch/
