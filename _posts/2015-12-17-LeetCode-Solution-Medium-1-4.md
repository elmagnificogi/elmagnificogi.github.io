---
layout:     post
title:      "LeetCode Solution(Medium.1-4)"
subtitle:   "c/c++，python，for work"
date:       2015-12-17
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 前言

从本篇开始，做所有Medium难度的题目

## 1.Single Number

Given an array of integers, every element appears twice except for one. Find that single one.

Note:
Your algorithm should have a linear runtime complexity. Could you implement it without using extra memory?

### 1.Single Number-Analysis
 
这个题好巧啊，碰到过好几次了，就是有一个重复的数组，每个元素都出现了2次或者是多次，但只有一个元素只出现了一次，然你找出来

这个题值遍历一次，就找出来，就是靠位的统计，因为每个元素出现了固定次数，统计所有元素32个位上1的个数，然后%2,偶数个，所以正常应该为0，但是由于多了这么一个数，所以他的位是1，那么%2后 剩下的1 所组成的32位的整数则就是这个数自己了

但是这种方法用了32个位来存储，那么还有什么办法呢？？

异或

由于只重复了两次，所以一个数字和自己异或得到的是全是0 但是有一个元素只有一次 那么其异或结果必然是这个元素

### 1.Single Number-Solution-C/C++

#### 位模算法

	int singleNumber(int* nums, int numsSize)
	{
	    int i=0,ret=0,j=0;
	    int bit[32];
	    for(i=0;i<32;i++)
	        bit[i]=0;
	    for(i=0;i<numsSize;i++)
	    {
	        for(j=0;j<32;j++)
	        {
	            if((nums[i]>>j)&1)
	                bit[j]++;
	        }
	    }
	    for(i=0;i<32;i++)
	    {
	        bit[i]=bit[i]%2;
	        if(bit[i]==1)
	            ret=ret|(1<<i);
	    }
	    return ret;
	    
	}

#### 异或算法

	int singleNumber(int* nums, int numsSize)
	{
	    int i=0,ret=0;
	    for(i=0;i<numsSize;i++)
	    {
	        ret=ret^nums[i];
	    }
	    return ret;
	}

### 1.Single Number-Solution-Python

	class Solution(object):
	    def singleNumber(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: int
	        """
	        ret=0
	        for i in range(len(nums)):
	            ret=ret^nums[i]
	        return ret

## 2.Single Number III

Given an array of numbers nums, in which exactly two elements appear only once and all the other elements appear exactly twice. Find the two elements that appear only once.

For example:

	Given nums = [1, 2, 1, 3, 2, 5], return [3, 5].

Note:

The order of the result is not important. So in the above example, [5, 3] is also correct.

Your algorithm should run in linear runtime complexity. Could you implement it using only constant space complexity?

### 2.Single Number III-Analysis

这次存在两个出现了一次的元素，这样如果只是异或，那么只能找到最后的两个元素的异或和，无法分开二者。

要如何分离出来两个元素呢，首先从异或和中找到一位为1的位（因为二者在这一位上的分别为1/0）

接着由这一位作为线索，再次遍历数组，分两组进行异或，一组是这位为0 一组是这位为1的，然后获得的值自然就是这两个元素了。

这样需要遍历两次时间上是O(2n)

> 扩展二：
> 
> 给定一个包含n个整数的数组，有一个整数x出现b次，一个整数y出现c次，其他所有的数均出现a次，其中b和c均不是a的倍数，找出x和y。使用二进制模拟a进制，累计二进制位1出现的次数，当次数达到a时，对其清零，这样可以得到b mod a次x，c mod a次y的累加。遍历剩余结果（用ones、twos、fours...变量表示）中每一位二进制位1出现的次数，如果次数为b mod a 或者 c mod a，可以说明x和y的当前二进制位不同（一个为0，另一个为1），据此二进制位将原数组分成两组，一组该二进制位为1，另一组该二进制位为0。这样问题变成“除了一个整数出现a1次（a1 = b 或 a1 = c）外所有的整数均出现a次”，使用和上面相同的方式计算就可以得到最终结果，假设模拟a进制计算过程中使用的变量为ones、twos、fours...那么最终结果可以用ones | twos | fours ...表示。

这个是一位博主由此题而引出来的通用方案，基本上和上面说的方法是相同原理，只是他的代码非常精简，而且也只用一次遍历就能得到想要的内容

求异或合很简单，但是要找到某一位为1，这个有一点技巧；

	xorsum &= -xorsum 
	这样得到的结果 就是第一位为1的数的
	比如:     xor=  0110
	首先取负号       1001 +1
				    1010
	然后与运算       0010  
	可以发现这样得到的结果就是 第一位为1的数 

### 2.Single Number III-Solution-C/C++

闹不懂为什么c就会报错，单独测试都是没问题的，我也没用全局变量。

看到返回的错误结果，应该就是弄错了ret的返回地址的问题，程序肯定没错，有错的就只能是leetcode了

	/**
	 * Return an array of size *returnSize.
	 * Note: The returned array must be malloced, assume caller calls free().
	 */
	int* singleNumber(int* nums, int numsSize, int* returnSize) 
	{
	    int i=0,xorsum=0,dif;
	    int *ret;
	    ret=(int*)malloc(sizeof(int)*2);
	    *returnSize=2;
	    //首先获取异或和
	    for(i=0;i<numsSize;i++)
	        xorsum=xorsum^nums[i];
	    //第二步获取二者异位的位置
	    dif=xorsum&-xorsum;
	    for(i=0;i<numsSize;i++)
	        if(dif&nums[i])
	            ret[0]=ret[0]^nums[i];
	        else
	            ret[1]=ret[1]^nums[i];
	            
	    return ret;
	}

C++就没问题全通过了

	class Solution {
	public:
	    vector<int> singleNumber(vector<int>& nums) 
	    {
	        int i=0,xorsum=0,dif=0;
	        vector<int> ret={0,0};
	        for(i=0;i<nums.size();i++)
	            xorsum^=nums[i];
	        dif=xorsum&-xorsum;
	        for(i=0;i<nums.size();i++)
	            if(dif&nums[i])
	                ret[0]^=nums[i];
	            else
	                ret[1]^=nums[i];
	        return ret;
	    }
	};

### 2.Single Number III-Solution-Python

	class Solution(object):
	    def singleNumber(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: List[int]
	        """
	        ret=[0,0]
	        xorsum=0
	        dif=0
	        for i in range(len(nums)):
	            xorsum^=nums[i]
	        dif=xorsum&-xorsum
	        for i in range(len(nums)):
	            if dif&nums[i]==dif:
	                ret[0]^=nums[i]
	            else:
	                ret[1]^=nums[i]
	        return ret



## 3.Best Time to Buy and Sell Stock II

Say you have an array for which the ith element is the price of a given stock on day i.

Design an algorithm to find the maximum profit. You may complete as many transactions as you like (ie, buy one and sell one share of the stock multiple times). However, you may not engage in multiple transactions at the same time (ie, you must sell the stock before you buy again).

### 3.Best Time to Buy and Sell Stock II-Analysis

一个数组中存有股票第index天的股价，你可以尽可能的交易从而获取最大利益。

但是你需要买入之前，得确保之前并没有买他。

这就相当于是一个动态规划，求最大值，和之前抢劫有一点相似。

求最大和，就相当于求所有递增日的递增总和。

由于这个题目描述的特殊性存在

	比如 价格是 1 2 3 2 5 1 6 0 9
	比如1号买1块 2号卖2块 按道理3号不能买，应该从四号买，但这里就会亏了1块，这一块应该是2号不动，3号卖
	但是呢 最大利润本来就是3-1=3-2+2-1 你会发现这是一个长线的利润 也就是不限制交易次数，变相就相当于可以买入的同时卖出了
	这样这个题目就变得比之前的题目都简单了很多。只需要计算所有递增区间的递增总和就知道最后能转到的总利润了 

### 3.Best Time to Buy and Sell Stock II-Solution-C/C++

	int maxProfit(int* prices, int pricesSize)
	{
	    int i=0,ret=0;
	    for(i=1;i<pricesSize;i++)
	    {
	        if(prices[i]>prices[i-1])
	            ret+=prices[i]-prices[i-1];
	    }
	    return ret;
	}

### 3.Best Time to Buy and Sell Stock II-Solution-Python

	class Solution(object):
	    def maxProfit(self, prices):
	        """
	        :type prices: List[int]
	        :rtype: int
	        """
	        ret=0
	        for i in range(1,len(prices)):
	            if prices[i]>prices[i-1]:
	                ret+=prices[i]-prices[i-1]
	        return ret



## 4.Product of Array Except Self

Given an array of n integers where n > 1, nums, return an array output such that output[i] is equal to the product of all the elements of nums except nums[i].

Solve it without division and in O(n).

For example, given [1,2,3,4], return [24,12,8,6].

Follow up:

Could you solve it with constant space complexity? (Note: The output array does not count as extra space for the purpose of space complexity analysis.)

### 4.Product of Array Except Self-Analysis

返回一个数组，这个数组表示输入数组n[i]的第i个元素不存在的情况下，剩余元素的乘积。

要求是能不用线性增长的空间和除法，并且一次遍历就可以完成。 

用除法就很简单了，但是不能用除法，要怎么做呢？？

有一个办法，先有一个值，存储当前index左边的乘积，每计算完一个数，把这个数乘以存储值，这样遍历的时候就不需要额外的空间了。

但是实际上需要遍历的次数 是 n(1+n)/2 不是O(n) 所以想一下还有什么办法（这方法都不需要额外的输出空间，输入空间就足够了）。

看了一个blog还发现了另外一方法，非常机智

第一次遍历 当前元素=左边所有元素的乘积 从左往右遍历

第二次遍历 当前元素=当前元素*右边所有元素的成绩 从右往左遍历  

比如

	[1,2,3,4]
	 1 1 2 6 第一次 左到右
	24 12 4 1 第二次右到左
	24 12 8 6  第二次输出输出内容

这样就得到了最后的值，但是这样的时间是2n 相对来说小了很多。

### 4.Product of Array Except Self-Solution-C/C++

	class Solution 
	{
	public:
	    vector<int> productExceptSelf(vector<int>& nums) 
	    {
	        vector<int> ret(nums.size());
	        ret[0]=1;
	        for (int i=1;i<nums.size();++i) 
	        {
	            ret[i]=ret[i-1]*nums[i-1];
	        }
	        int right=1;
	        for (int i=nums.size()-1;i>=0;i--) 
	        {
	            ret[i]*=right;
	            right*=nums[i];
	        }
	        return ret;
	    }
	};

### 4.Product of Array Except Self-Solution-Python

	class Solution(object):
	    def productExceptSelf(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: List[int]
	        """
	        ret=[1]
	        for i in range(1,len(nums)):
	            ret.append(ret[i-1]*nums[i-1])
	        right=1
	        for i in range(len(nums)-1,-1,-1):
	            ret[i]=ret[i]*right
	            right=right*nums[i]
	        return ret

## Quote

> http://www.cnblogs.com/changchengxiao/p/3413294.html
> 
> http://www.cnblogs.com/aboutblank/p/4741051.html
> 
> http://www.cnblogs.com/daijinqiao/p/3352893.html
> 
> http://www.geekcome.com/content-10-2786-1.html
> 
> http://segmentfault.com/a/1190000002565570
> 
> http://www.tuicool.com/articles/IbUvmeJ
> 
> http://www.cnblogs.com/grandyang/p/4650187.html