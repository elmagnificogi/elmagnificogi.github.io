---
layout:     post
title:      "LeetCode Solution(Easy.69-72)"
subtitle:   "c/c++，python，for work"
date:       2016-12-24
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 69.Hamming Distance

The Hamming distance between two integers is the number of positions at which the corresponding bits are different.

Given two integers x and y, calculate the Hamming distance.

Note:     0 ≤ x, y < 231.

Example:

	Input: x = 1, y = 4
	
	Output: 2
	
	Explanation:
	1   (0 0 0 1)
	4   (0 1 0 0)
	       ↑   ↑
	The above arrows point to positions where the corresponding bits are different.

### 69.Hamming Distance-Analysis

求海明距离,具体就是求两个数二进制位不同的位的个数.

直接二者求异或,然后检测位上1的个数就可以了.

### 69.Hamming Distance-Solution-C/C++

	class Solution 
	{
	public:
	    int hammingDistance(int x, int y) 
	    {
	        int a=x^y,count=0;
	        for(int i=0,j=0;i<32;i++)
	        {
	            j=(a>>i)&1;
	            if(j==1)
	                count++;
	        }
	        return count;
	    }
	};

### 69.Hamming Distance-Solution-Python

	class Solution(object):
	    def hammingDistance(self, x, y):
	        """
	        :type x: int
	        :type y: int
	        :rtype: int
	        """
	        a=x^y
	        count=0
	        for i in range(0,32):
	            j=(a>>i)&1
	            if j==1:
	                count=count+1
	        return count


## 70.Find All Numbers Disappeared in an Array

Given an array of integers where 1 ≤ a[i] ≤ n (n = size of array), some elements appear twice and others appear once.

Find all the elements of [1, n] inclusive that do not appear in this array.

Could you do it without extra space and in O(n) runtime? You may assume the returned list does not count as extra space.

Example:

	Input:
	[4,3,2,7,8,2,3,1]
	
	Output:
	[5,6]


### 70.Find All Numbers Disappeared in an Array-Analysis

给一个长度在1到n的数组,其中数组内元素大小都在数组大小的范围内,其中存在重复的元素,求出其中缺少的元素.

要求是不使用额外的空间.

思路是取一个元素,把这个元素放进数组中和他数值一样的数组位置上.全部排序完成以后再扫描一遍,其内容和数组序号不一样的就是消失的元素.

### 70.Find All Numbers Disappeared in an Array-Solution-C/C++

	class Solution 
	{
	public:
	    vector<int> findDisappearedNumbers(vector<int>& nums) 
	    {
	        int temp=0;
	        for(int i=0;i<nums.size();i++)
	        {
	            if(nums[nums[i]-1]==nums[i])
	            //如果数字相同,直接跳过
	                continue;
	            if(nums[i]!=i+1)
	            {//元素与序号不相等,互换
	                temp=nums[nums[i]-1];
	                nums[nums[i]-1]=nums[i];
	                nums[i]=temp;
	                i=i-1;
	            }
	        }
	        vector<int> a;
	        for(int i=0;i<nums.size();i++)
	        {
	            if(nums[i]!=i+1)
	            {//元素与序号不相等,加到输出容器
	                a.push_back(i+1);
	            }
	        }
	        return a;
	    }
	};

### 70.Find All Numbers Disappeared in an Array-Solution-Python

	class Solution(object):
	    def findDisappearedNumbers(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: List[int]
	        """
	        a=[]
	        i=0
	        while i<len(nums):
	            if nums[i]==nums[nums[i]-1]:
	                i=i+1
	                continue
	            if nums[i] != i+1:
	                temp=nums[nums[i]-1]
	                nums[nums[i]-1]=nums[i]
	                nums[i]=temp
	                i=i-1
	        for i in range(0,len(nums)):
	            if nums[i] != i+1:
	                a.append(i+1)
	        return a


## 71.Fizz Buzz

Write a program that outputs the string representation of numbers from 1 to n.

But for multiples of three it should output “Fizz” instead of the number and for the multiples of five output “Buzz”. For numbers which are multiples of both three and five output “FizzBuzz”.

Example:

	n = 15,

	Return:
	[
	    "1",
	    "2",
	    "Fizz",
	    "4",
	    "Buzz",
	    "Fizz",
	    "7",
	    "8",
	    "Fizz",
	    "Buzz",
	    "11",
	    "Fizz",
	    "13",
	    "14",
	    "FizzBuzz"
	]

### 71.Fizz Buzz-Analysis

就是输入一个最大数,其中三的倍数用Fizz 五的倍数用Buzz,三五的倍数用FizzBuzz.

### 71.Fizz Buzz-Solution-C/C++

	class Solution 
	{
	public:
	    vector<string> fizzBuzz(int n) 
	    {
	        vector<string> a;
	        string b;
	        stringstream stream;
	        for(int i=1;i<=n;i++)
	        {
	            if(i%3==0)
	            {
	                b="Fizz";
	            }
	            if(i%5==0)
	            {
	                b=b+"Buzz";
	            }
	            if((i%3!=0)&&(i%5!=0))
	            {
	                stream.str("");
	                stream<<i;
	                b=stream.str();
	            }
	            a.push_back(b);
	            b="";
	        }
	        return a;
	    }
	};

在C++中可以使用stringstream来很方便的进行类型转换，字符串串接，不过注意重复使用同一个stringstream对象时要先继续清空，而清空很容易想到是clear方法，而在stringstream中这个方法实际上是清空stringstream的状态（比如出错等），真正清空内容需要使用.str(“”)方法。很久没用就会出错,用clear方法试了好几次.


### 71.Fizz Buzz-Solution-Python
	
	class Solution(object):
	    def fizzBuzz(self, n):
	        """
	        :type n: int
	        :rtype: List[str]
	        """
	        a=[]
	        for i in range(1,n+1):
	            if i%3==0:
	                b="Fizz"
	            if i%5==0:
	                b=b+"Buzz"
	            if i%3!=0 and i%5!=0:
	                b=str(i)
	            a.append(b)
	            b=''
	        return a

## 72.Reverse String

Write a function that takes a string as input and returns the string reversed.

Example:

Given s = "hello", return "olleh".

### 72.Reverse String-Analysis

就是翻转字符串,有现成函数可以直接用

### 72.Reverse String-Solution-C/C++

	#include <algorithm>
	class Solution 
	{
	public:
	    string reverseString(string s)
	    {
	        reverse(s.begin(),s.end());
	        return s;
	    }
	};

这样写有点赖皮了,直接调用了STL库里面的reverse函数直接翻转了

	class Solution 
	{
	public:
	    string reverseString(string s)
	    {
	        string r="";
	        for(int i=0;i<=s.size();i++)
	        {
	            r=r+(*(s.end()-i-1));
	        }
	        return r;
	    }
	};

这样写需要注意一点 就是s.end是指s的最后一个字符后面的一个地址位,需要减一变成最后一个字符的地址.

但是这个无法通过原因是最后出现了内存溢出,那么更好的办法就是原封不动的对s进行前后字符交换.

	class Solution 
	{
	public:
	    string reverseString(string s)
	    {
	        char temp;
	        int sz=s.size();
	        for(int i=0;i<sz/2;i++)
	        {
	            temp=s[i];
	            s[i]=s[sz-i-1];
	            s[sz-i-1]=temp;
	        }
	        return s;
	    }
	};


### 72.Reverse String-Solution-Python

	class Solution(object):
	    def reverseString(self, s):
	        """
	        :type s: str
	        :rtype: str
	        """
	        sz=len(s)
	        r=""
	        for i in range(0,sz):
	            r=r+s[sz-1-i];
	        return r

直接新建一个字符然后倒序输出,但是问题也是一样的会导致输出超时或者内存溢出.

python有一个问题就是string是不可变类型.也就是说我不能把string的前后字符进行交换.

	class Solution(object):
	    def reverseString(self, s):
	        """
	        :type s: str
	        :rtype: str
	        """
	        return s[::-1]

其中s[::-1]就是直接将s翻转输出了.剩下方法大都需要新建一个数组,这都不符合要求,所以舍去.
        
## Quote

> http://www.myexception.cn/perl-python/1621795.html
> 
> http://www.runoob.com/python/python-strings.html
> 
> http://blog.sina.com.cn/s/blog_9054a03601013d5d.html
> 
> http://bbs.csdn.net/topics/320062997
> 
> http://www.runoob.com/python/python-lists.html
> 
> http://blog.chinaunix.net/uid-26000296-id-3785610.html
> 
> http://bbs.csdn.net/topics/220013347
