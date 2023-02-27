---
layout:     post
title:      "LeetCode Solution(Easy.65-68)"
subtitle:   "c/c++，python，for work"
date:       2015-12-16
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 65.Excel Sheet Column Title

Given a positive integer, return its corresponding column title as appear in an Excel sheet.

For example:

    1 -> A
    2 -> B
    3 -> C
    ...
    26 -> Z
    27 -> AA
    28 -> AB 

### 65.Excel Sheet Column Title-Analysis

这个也很简单，就是把数字转换成字母每26个转换列而已

10进制转26进制而已

### 65.Excel Sheet Column Title-Solution-C/C++

	class Solution 
	{
	public:
	    string convertToTitle(int n) 
	    {
	        string ret = "";
	        while(n)
	        {
	            ret = (char)((n-1)%26+'A') + ret;
	            n = (n-1)/26;
	        }
	        return ret;
	    }
	};

### 65.Excel Sheet Column Title-Solution-Python

	class Solution(object):
	    def convertToTitle(self, n):
	        """
	        :type n: int
	        :rtype: str
	        """
	        ret=''
	        while n!=0:
	            ret=chr((n-1)%26+65)+ret
	            n=(n-1)/26
	        return ret


## 66.Rotate Array

Rotate an array of n elements to the right by k steps.

For example

	with n = 7 and k = 3, the array [1,2,3,4,5,6,7] is rotated to [5,6,7,1,2,3,4].

Note:

Try to come up as many solutions as you can, there are at least 3 different ways to solve this problem.

Hint:

Could you do it in-place with O(1) extra space?

Related problem: Reverse Words in a String II

最重要的这个题的k的值还会大于n，大于的情况下k=k-n 题目中并没有明确说明

### 66.Rotate Array-Analysis

这个是旋转数组中的元素，找到其中的目标位置，然后把其后的放到其前，其前的放到其后

如果要不用额外的空间，该如何做呢，从目标位置进行交互处理就行了，虽然有点麻烦，但还是可以得

自己想了一个本方法，先看k前多还是少，一样多最简单，直接互换就可以了，如果k前的多，先把k后面的交换过去，然后把交换过来的用环的方式顺移，顺移n-2k就行了。k前面少的话，也是把少的部分换过去，然后依然是顺移，完成。

这个是最基本的方法，很笨，写起来也麻烦一些，但是思路简单。

当然还有更简单的方法，利用容器的逆置的特性，来部分逆置，从而达到目的。

比如 

	ABCDE k=2 目标DEABC
	逆置后
	EDCBA
	部分逆置
	DECBA
	再部分逆置
	DEABC
	这样就完成了目标，而且没有用额外的空间

其实还有个办法，直到de的指针和abc的，然后修改其容器内存存储位置，应该就可以，但是leetcode要怎么拿内存啊！！

### 66.Rotate Array-Solution-C/C++

这里利用STL标准库函数中的reverse，可以用来把数据逆置，vector竟然自身不带逆置的函数

最重要的这个题的k的值还会大于n，大于的情况下k=k-n 题目中并没有明确说明

	class Solution 
	{
	public:
	    void rotate(vector<int>& nums, int k) 
	    {
	        int i=0,j=0;
	        int len=nums.size();
	        if(k>len)
	            k=k-len;
	        vector <int>::iterator iter=nums.begin();
	        reverse(nums.begin(),nums.end());
	        reverse(nums.begin(),nums.begin()+k);
	        reverse(nums.begin()+k,nums.end());
	    }
	};

### 66.Rotate Array-Solution-Python

python的reverse只能对整体进行逆置，不能部分逆置，所以没办法像上面的C++一样，后来在discuss中看到了下面的解法，十分不错

这里面只有一行代码，十分精简，但是其实暗中复制了空间，首先是获得了nums中倒数的k个元素，然后又获取了nums中len-k个元素 然后拼在了一起，其实复制了整个空间。

	class Solution(object):
	    def rotate(self, nums, k):
	        """
	        :type nums: List[int]
	        :type k: int
	        :rtype: void Do not return anything, modify nums in-place instead.
	        """
	        nums[:] = nums[-k % len(nums):]+nums[:-k % len(nums)]

这个则是没有复制任何空间，只是每次从nums的末尾拿一个元素，然后往nums的头上插入，从而达成了旋转，其实这里就是把nums看成了一个环，通过移动环来达到交换的目的。这种写法其实c++也可以的嘛，只是没想到

	class Solution(object):
	    def rotate(self, nums, k):
	        k %= len(nums)
	        for i in range(k):
	            nums.insert(0, nums.pop(-1))



## 67.Compare Version Numbers

Compare two version numbers version1 and version2.
If version1 > version2 return 1, if version1 < version2 return -1, otherwise return 0.

You may assume that the version strings are non-empty and contain only digits and the . character.
The . character does not represent a decimal point and is used to separate number sequences.
For instance, 2.5 is not "two and a half" or "half way to version three", it is the fifth second-level revision of the second first-level revision.

Here is an example of version numbers ordering:

	0.1 < 1.1 < 1.2 < 13.37

### 67.Compare Version Numbers-Analysis

有一个取巧的办法，就是去除其中的. 同时把string转换成对应的float来比较大小，这样速度更快（第一位为0的情况下变成小数）

仔细看了下ascii码，.的ASCII码值比数字要小，那也就是说 直接用string就能比出来谁大谁小了。

但是当我提交的时候发现 还会出一些特殊情况 比如 01 和1 比较版本， 这也太变态了

擦，真是难写，怪不得正确率那么低，思路不难，但是写起来很复杂，特别是处理各种数据很麻烦。

### 67.Compare Version Numbers-Solution-C/C++

	class Solution {
	public:
	    int compareVersion(string version1, string version2)
	    {
	    	if (version1 == version2)
	    		return 0;
	    	int i = 0, j = 0, k = 3;
	    	int v1 = 0, v2 = 0;
	    	
	    	int netp1 = 0, vp1 = 0;
	    	int netp2 = 0, vp2 = 0;
	    	bool end1=false,end2=false;
	    	//先判断是否存在.的情况
	    	while (1)
	    	{
	    
	    		if (version1.find(".", netp1) != -1)
	    		{
	    			stringstream s;
	    			netp1 = version1.find(".", netp1);
	    			s << version1.substr(vp1, netp1-vp1);
	    			s >> v1;
	    			s.clear();
	    			netp1 = netp1 + 1;
	    			vp1 = netp1;
	    		}
	    		else
	    		{
	    		    if(end1!=true)
	    		    {
	        			//不存在. 直接转成int类型
	        			stringstream s;
	        			s << version1.substr(vp1, version1.length() - vp1);
	        			s >> v1;
	        			end1=true;
	    		    }
	    		    else
	    		        v1=0;
	    		}
	    		if (version2.find(".", netp2) != -1)
	    		{
	    			stringstream s;
	    			netp2 = version2.find(".", netp2);
	    			s << version2.substr(vp2, netp2 - vp2);
	    			s >> v2;
	    			s.clear();
	    			netp2 = netp2 + 1;
	    			vp2 = netp2;
	    		}
	    		else
	    		{
	    		    if(end2!=true)
	    		    {
	        			//不存在. 直接转成int类型
	        			stringstream s;
	        			s << version2.substr(vp2, version2.length()-vp2);
	        			s >> v2;
	        			end2=true;
	    		    }
	    		    else
	    		        v2=0;
	    			
	    		}
	    		if (v1 == v2)
	    		{
	    		    if(end1==true&&end2==true)
	    			    return 0;
	    			//继续找.比较
	    		}
	    		else
	    		{
	    			if (v1>v2)
	    				return 1;
	    			else
	    				return -1;
	    		}
	    		
	    	}
	    	return 1;
	    }
	};

### 67.Compare Version Numbers-Solution-Python

有split函数就简单多了

	class Solution(object):
	    def compareVersion(self, version1, version2):
	        """
	        :type version1: str
	        :type version2: str
	        :rtype: int
	        """
	        vlist1=[]
	        vlist2=[]
	        vlist1=version1.split('.')
	        vlist2=version2.split('.')
	        i=0
	        while True:
	            if i>=len(vlist1):
	                v1=0
	            else:
	                v1=int(vlist1[i])
	            if i>=len(vlist2):
	                v2=0
	            else:
	                v2=int(vlist2[i])
	            i=i+1
	            if v1==v2:
	                if i>=len(vlist2) and i>=len(vlist1):
	                    return 0
	            elif v1>v2:
	                return 1
	            else:
	                return -1

## 68.String to Integer (atoi)

Implement atoi to convert a string to an integer.

Hint: Carefully consider all possible input cases. If you want a challenge, please do not see below and ask yourself what are the possible input cases.

Notes: It is intended for this problem to be specified vaguely (ie, no given input specs). You are responsible to gather all the input requirements up front.

Update (2015-02-10):
The signature of the C++ function had been updated. If you still see your function signature accepts a const char * argument, please click the reload button  to reset your code definition.

spoilers alert... click to show requirements for atoi.

Requirements for atoi:
The function first discards as many whitespace characters as necessary until the first non-whitespace character is found. Then, starting from this character, takes an optional initial plus or minus sign followed by as many numerical digits as possible, and interprets them as a numerical value.

The string can contain additional characters after those that form the integral number, which are ignored and have no effect on the behavior of this function.

If the first sequence of non-whitespace characters in str is not a valid integral number, or if no such sequence exists because either str is empty or it contains only whitespace characters, no conversion is performed.

If no valid conversion could be performed, a zero value is returned. If the correct value is out of the range of representable values, INT_MAX (2147483647) or INT_MIN (-2147483648) is returned.

### 68.String to Integer (atoi)-Analysis

做一个string to interger的函数，题目的原意是不给你任何要求，全凭自己yy 来看什么样的合适

好吧，在克服了重重困难的情况下，我没看requirements的情况下，总是完成了

题目要求大概是这样的

1.在遇到数字前的所有空格都可以无视，遇到数字后的任何符合都要求返回
2.未遇到数字前，遇到非数字以外符号两个及以上情况下，要求返回0
3.超过最大整数和最小负数的情况下返回最大整数/最小负数

最后用时8ms，小于绝大多数的方法的时间吧

在这个里面只有一个问题困扰了我半天，就是越界的问题，越界了要如何判断

方法一：转化为long类型，然后看是否越界（其实治标不治本，如果是str转long的时候，要转化什么类型？又或者是不存在long类型的时候怎么办？）

方法二：转化为无符号整形，直接比较大小判断，越界，越界值为 0x7FFFFFFF（这种比较ok，没有不存在的情况，但是受限于越界时对于内存二进制的解读，一般情况下都是ok的）

方法三：存储上一个值，判断当前值在x10+n之后再/10的值 是否与上次的值相同，相同说明没有越界，不同说明越界了（我自己想的，这种不存在越界之后再越界然后和上次的值相等的情况，两次越界就注定了其值相差2147483647，所以无论怎么越界都不可能出现相同情况，只是有一个小问题，这里做除法了，除法比较慢，但是理论上说不受语言内存的限制，应该没有什么问题,但是python不行，这种自动进行数据扩容的这种办法根本没用，它会自动扩展成64位int，然后得到的值是一样的）


### 68.String to Integer (atoi)-Solution-C/C++

	class Solution {
	public:
	    int myAtoi(string str)
	    {
	        int i=0;
	        int ret=0,last;
	        bool neg=false,spa=false,pos=false;
	        for(i=0;i<str.length();i++)
	        {
	            if(ret==0&&spa&&str[i]==32)
	            {
	                if(str[i-1]==32)//空格连续忽略
	                    continue;
	                else//空格不连续返回
	                    return neg?-ret:ret;
	            }
	            if(ret==0&&!spa&&str[i]==32)
	            {   
	                spa=true;
	                continue;
	            }
	            if(str[i]>47&&str[i]<58)//如果是数字 记录
	            {
	                last=ret;
	                if(last!=((ret*10+int(str[i]-48))/10))//越界后的值缩小10倍与原值不相等
	                    return neg?-2147483648:2147483647;
	                ret=ret*10+int(str[i]-48);
	            }
	            else//非数字情况下
	            {
	                if(pos==false&&neg==false&&str[i]=='-')//发现第一个负号
	                {
	                    neg=true;
	                    continue;
	                }
	                else if(str[i]=='+'&&pos==false&&neg==false)
	                {
	                    pos=true;
	                    continue;
	                }
	                else
	                {
	                    //其他符合 返回
	                    return neg?-ret:ret;
	                }
	            }
	        }
	        return neg?-ret:ret;
	    
	    }
	};

### 68.String to Integer (atoi)-Solution-Python

python 是72ms 比c++慢多了

	class Solution(object):
	    def myAtoi(self, str):
	        """
	        :type str: str
	        :rtype: int
	        """
	        ret=0
	        neg=False
	        spa=False
	        pos=False
	        for i in range(len(str)):
	            if ret==0 and spa and ord(str[i])==32:
	                if ord(str[i-1])==32:
	                    continue
	                else:
	                    break;
	            if ret==0 and (not spa) and ord(str[i])==32:
	                spa=True
	                continue
	            if ord(str[i])>47 and ord(str[i])<58:
	                ret=ret*10+int(ord(str[i])-48);
	                if ret>2147483647:
	                    if neg:
	                        return -2147483648
	                    else:
	                        return 2147483647
	            else:
	                if pos==False and neg==False and str[i]=='-':
	                    neg=True
	                    continue
	                elif str[i]=='+' and pos==False and neg==False:
	                    pos=True
	                    continue
	                else:
	                    break
	        if neg:
	            return -ret
	        else:
	            return ret

## The end

到这里刚好完成了所有Easy标记的题目，正好68道题，算起来一共写了11天之久（不是全天写这个），收获颇多。

如果leetcode日后再增加题目，也会相应的再开新篇。

通过查看我的progress（68 / 318）

- 1242
- total submissions

- 247
- accepted submissions

- 19.9 %
- acceptance rate

- Wrong Answer
- 36%

- Runtime Error
- 24%

- Others
- 12%

- Time Limit Exceed
- 8%


总体来说，编写时的错误还是很多的，而且且20%的通过率，真是拉低了整个easy的水平，提高了easy的难度...

接下来就是中等难度的篇章
        
## Quote

> http://blog.csdn.net/xudli/article/details/48286081
> 
> http://my.oschina.net/Tsybius2014/blog/505462
> 
> http://m.shangxueba.com/jingyan/2926615.html
> 
> http://www.cnblogs.com/x1957/p/4086448.html
> 
> https://leetcode.com/discuss/66324/python-1-line-solution-without-loop
> 
> https://msdn.microsoft.com/zh-cn/library/7w2119c6.aspx
> 
> https://msdn.microsoft.com/zh-cn/library/efzty53k.aspx