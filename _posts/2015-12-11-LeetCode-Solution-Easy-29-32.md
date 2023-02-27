---
layout:     post
title:      "LeetCode Solution(Easy.29-32)"
subtitle:   "c/c++，python，for work"
date:       2015-12-11
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 29.Plus One

Given a non-negative number represented as an array of digits, plus one to the number.

The digits are stored such that the most significant digit is at the head of the list.

### 29.Plus One-Analysis

看了半天才看明白，原来是要做一个加法，给最后一个数字+1 然后检查进位标志，如果超了，那就加一个数字来表示

### 29.Plus One-Solution-C/C++


	class Solution 
	{
	public:
	    vector<int> plusOne(vector<int>& digits)
	    {
	        int i=0,c=0;
	        digits[digits.size()-1]+=1;
	        for(i=0;i<digits.size();i++)
	        {
	            digits[digits.size()-1-i]+=c;
	            if(digits[digits.size()-1-i]==10)
	            {
	                digits[digits.size()-1-i]=0;
	                c=1;
	            }
	            else
	                c=0;
	        }
	        if(c==1)
	        {
	            digits.insert(digits.begin(),1);
	            return digits;
	        }
	        else
	        {
	            return digits;
	        }
	    }
	};


### 29.Plus One-Solution-Python

	class Solution(object):
	    def plusOne(self, digits):
	        """
	        :type digits: List[int]
	        :rtype: List[int]
	        """
	        i=0
	        c=0
	        digits[-1]=digits[-1]+1
	        
	        for i in range(0,len(digits)):
	            digits[-1-i]=digits[-1-i]+c
	            if digits[-1-i]==10:
	                c=1
	                digits[-1-i]=0
	            else:
	                c=0
	        if c==1:
	            digits.insert(0,1)
	        return digits









## 30.Pascal's Triangle

Given numRows, generate the first numRows of Pascal's triangle.

For example, given numRows = 5,
Return

	[
	     [1],
	    [1,1],
	   [1,2,1],
	  [1,3,3,1],
	 [1,4,6,4,1]
	]

### 30.Pascal's Triangle-Analysis

这不就是杨辉三角形嘛，每个值等于其左上和右上两个值的和，如果不存在则为0

关键在于需要提交建立好至少两层 才能正确循环下去

然后边界值手动加入，中间的值用循环计算。

### 30.Pascal's Triangle-Solution-C/C++

	class Solution
	{
	public:
	    vector<vector<int>> generate(int numRows)
	    {
	        int i=0,j=0;
	        if(numRows==0)
	            return (vector<vector<int>>)0;
	        vector<vector<int>> ret;
	        vector<int> line;
	        //第一步把左右两边置为1
	        line.push_back(1);
	        ret.push_back(line);
	        line.clear();
	        if(numRows==1)
	            return ret;
	        line.push_back(1);
	        line.push_back(1);
	        ret.push_back(line);
	        line.clear();
	        if(numRows==2)
	            return ret;
	        for(j=2;j<numRows;j++)
	        {
	            line.push_back(1);
	            for(i=1;i<j;i++)
	            {
	                line.push_back(ret[j-1][i-1]+ret[j-1][i]);
	            }
	            line.push_back(1);
	            ret.push_back(line);
	            line.clear();
	        }
	        return ret;
	    }
	};

### 30.Pascal's Triangle-Solution-Python

	class Solution(object):
	    def generate(self, numRows):
	        """
	        :type numRows: int
	        :rtype: List[List[int]]
	        """
	        if numRows==0:
	            return []
	        ret=[[1]]    
	        if numRows==1:
	            return ret
	        ret=[[1],[1,1]]
	        if numRows==2: 
	            return ret
	        for i in range(2,numRows):
	            ret.append([])
	            ret[i].append(1)
	            for j in range(1,i):
	                ret[i].append(ret[i-1][j-1]+ret[i-1][j])
	            ret[i].append(1)
	        return ret


## 31.Factorial Trailing Zeroes

Given an integer n, return the number of trailing zeroes in n!.

Note: Your solution should be in logarithmic time complexity.

### 31.Factorial Trailing Zeroes-Analysis

擦，这个英文完全没看懂，看了别人的分析才明白是什么意思。

原来就是输入n，问你n的阶乘的结果中有多少个0

其实分析一下很简单，出现2和5 必然出0。

	...
	4*3*2*1
	5*4*3*2*1
	6*4*3*2*1

可以看出来 2的倍数关系很多，所以2肯定不缺，那缺的就是5的倍数，只要找到5的倍数的个数就能确定0的个数了

但实际上并不是这样的，因为像是25=5*5 50=5*5*2 75=5*5*3 100=5*5*4 125=5*5*5 都含有不止1个5

所以 如果只是单独得到5的倍数，并不能找到所有的0，还需要继续再看商是否依然还能出现5的倍数，如果还能出现说明，其因子中还含有5


### 31.Factorial Trailing Zeroes-Solution-C/C++

	int trailingZeroes(int n)
	{
	    int i=0;
	    
	    while(1)
	    {
	        n=n/5;
	        i=i+n;
	        if(n<5)
	            return i;
	    }
	}

### 31.Factorial Trailing Zeroes-Solution-Python

	class Solution(object):
	    def trailingZeroes(self, n):
	        """
	        :type n: int
	        :rtype: int
	        """
	        i=0
	        while True:
	            n=n/5
	            i=i+n
	            if n<5:
	                return i





## 32.Pascal's Triangle II

Given an index k, return the kth row of the Pascal's triangle.

For example, given k = 3,
Return [1,3,3,1].

### 32.Pascal's Triangle II-Analysis

依然是杨辉三角形，但是这一次呢 要求只返回对应的行，其他的就不要了

和之前的一样，只是这一次在最后返回的地方做一个修改，如果是最后一次 直接返回line就行了

同时要注意这里的行号和之前的那个不一样了

### 32.Pascal's Triangle II-Solution-C/C++

	class Solution {
	public:
	    vector<int> getRow(int rowIndex)
	    {
	        
	        vector<int> line;
	        vector<vector<int>> ret;
	        line.push_back(1);
	        if(rowIndex==0)
	            return line;
	        ret.push_back(line);
	        line.clear();
	        line.push_back(1);
	        line.push_back(1);
	        if(rowIndex==1)
	            return line;
	        ret.push_back(line);    
	        line.clear();
	        int i=0,j=0;
	        for(i=2;i<rowIndex+1;i++)
	        {
	            line.push_back(1);
	            for(j=1;j<i;j++)
	                line.push_back(ret[i-1][j-1]+ret[i-1][j]);
	            line.push_back(1);
	            if(i!=rowIndex)
	            {
	                ret.push_back(line);
	                line.clear();
	            }
	        }
	        return line;
	        
	    }
	};

### 32.Pascal's Triangle II-Solution-Python

	class Solution(object):
	    def getRow(self, rowIndex):
	        """
	        :type rowIndex: int
	        :rtype: List[int]
	        """
	        line=[1]
	        if rowIndex==0:
	            return line
	        ret=[]
	        ret.append(line)
	        line=[1,1]
	        if rowIndex==1:
	            return line
	        ret.append(line)
	        line=[]
	        for i in range(2,rowIndex+1):
	            line.append(1)
	            for j in range(1,i):
	                line.append(ret[i-1][j-1]+ret[i-1][j])
	            line.append(1)
	            if i==rowIndex:
	                return line
	            ret.append(line)
	            line=[]
                

## Quote

> http://www.2cto.com/kf/201310/253842.html
> 
> http://blog.csdn.net/worldwindjp/article/details/42590537



