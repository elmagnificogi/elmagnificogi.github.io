---
layout:     post
title:      "LeetCode Solution(Easy.89-92)"
subtitle:   "c/c++，python，for work"
date:       2016-12-29
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---

## 89.Power of Three

Given an integer, write a function to determine if it is a power of three.

Follow up:
Could you do it without using any loop / recursion?

### 89.Power of Three-Analysis

不用循环和递归判断是否这个数是3的幂次.

用循环就很简单了.

由于int是有大小的最大是2^31次,在这其中呢3的次方最大是1162261467.

那么只需要判断这个数是不是在这个范围内而且可以3的最大次方整除就可以了

还有一个方法直接求log, log本身就表示 a^y=x log(a,y)=x 同理如果求3与n的log得到的是整数那么其必然也是3的幂次
 
### 89.Power of Three-Solution-C/C++

```cpp

class Solution 
{
public:
    bool isPowerOfThree(int n) 
    {
        if(n>0 && 1162261467%n==0)
            return true;
        else
            return false;
    }
};

```

### 89.Power of Three-Solution-Python

```python

class Solution(object):
    def isPowerOfThree(self, n):
        """
        :type n: int
        :rtype: bool
        """
        if n>0 and 1162261467%n==0:
            return True
        else:
            return False

```
	
## 90.Best Time to Buy and Sell Stock

Say you have an array for which the ith element is the price of a given stock on day i.

If you were only permitted to complete at most one transaction (ie, buy one and sell one share of the stock), design an algorithm to find the maximum profit.

Example 1:

	Input: [7, 1, 5, 3, 6, 4]
	Output: 5

	max. difference = 6-1 = 5 (not 7-1 = 6, as selling price needs to be larger than buying price)

Example 2:

	Input: [7, 6, 4, 3, 1]
	Output: 0

	In this case, no transaction is done, i.e. max profit = 0.

### 90.Best Time to Buy and Sell Stock-Analysis

给出一个股价数组,求出单次买入卖出所能赚的最大利润

直接想法就是双循环依次往后计算最大利润.

### 90.Best Time to Buy and Sell Stock-Solution-C/C++

```cpp

class Solution
{
public:
    int maxProfit(vector<int>& prices) 
    {
        int max=0;
        for(int i=0;i<prices.size();i++)
        {
            for(int j=i;j<prices.size();j++)
                max=prices[j]-prices[i]>max?prices[j]-prices[i]:max;
        }
        return max;
    }
};

```

然而这样的双层循环嵌套会导致超时.

```cpp

class Solution
{
public:
    int maxProfit(vector<int>& prices) 
    {
        int max=0,min=0x7fffffff;
        for(int i=0;i<prices.size();i++)
        {
            min=min>prices[i]?prices[i]:min;
            max=prices[i]-min>max?prices[i]-min:max;
        }
        return max;
    }
};

```

那么为了化简这个,就可以记录最小值,同时寻找最大值,从而省去了一个循环,时间上也缩短了

### 90.Best Time to Buy and Sell Stock-Solution-Python

```python

class Solution(object):
    def maxProfit(self, prices):
        """
        :type prices: List[int]
        :rtype: int
        """
        min=0x7fffffff
        max=0
        for i in range(len(prices)):
            if min>prices[i]:
                min=prices[i]
            if max<prices[i]-min:
                max=prices[i]-min
        return max

```

## 91.Path Sum III

You are given a binary tree in which each node contains an integer value.

Find the number of paths that sum to a given value.

The path does not need to start or end at the root or a leaf, but it must go downwards (traveling only from parent nodes to child nodes).

The tree has no more than 1,000 nodes and the values are in the range -1,000,000 to 1,000,000.

Example:

	root = [10,5,-3,3,2,null,11,3,-2,null,1], sum = 8
	
	      10
	     /  \
	    5   -3
	   / \    \
	  3   2   11
	 / \   \
	3  -2   1

	Return 3. The paths that sum to 8 are:
	
	1.  5 -> 3
	2.  5 -> 2 -> 1
	3. -3 -> 11

### 91.Path Sum III-Analysis

给一个二叉树,寻找某父节点到某节点的和等于给定的sum

有点难,自己没想出来,参考了别人的解题思路

首先用深度遍历,每次选取一个节点做为根节点,然后从这里开始往下遍历,计算sum是否等于target

如果相等,那么计数+1,继续往下走(有可能下面出现一正一负刚好抵消,再次出现符合的情况)

如果不相等,也继续往下进行,直到整个遍历结束.

然后再选取新的一个节点做为根节点,继续遍历.

直到将整个二叉树全部节点做为根节点遍历一遍

最后得到的就是与sum相同的路径个数

### 91.Path Sum III-Solution-C/C++

```cpp

/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution 
{
public:
    int pathSum(TreeNode* root, int sum) 
    {
        if(root==NULL)
            return 0;
        int cnt=0;
        cnt=preOrder(root,0,0,sum);
        return cnt;
    }
private:
    int preOrder(TreeNode* root,int cnt,int sum,int target)
    {//先序遍历,每次选择一个节点做为路径起点
        if(root!=NULL)
        {
            cnt=pathCnt(root,cnt,0,target);
            cnt=preOrder(root->left,cnt,0,target);
            cnt=preOrder(root->right,cnt,0,target);
        }
        return cnt;
    }
    int pathCnt(TreeNode* root,int cnt,int sum,int target)
    {//路径和计算.
        sum+=root->val;
        if(sum==target)
        //判断路径和
            ++cnt;
        if(root->left)
            cnt=pathCnt(root->left,cnt,sum,target);
        if(root->right)
            cnt=pathCnt(root->right,cnt,sum,target);
        return cnt;
    }
};

```

### 91.Path Sum III-Solution-Python

```python

# Definition for a binary tree node.
# class TreeNode(object):
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class Solution(object):
    def CalculateSum(self, root,r,cursum,sum):
        cursum+=root.val
        if sum==cursum:
            r+=1
        if root.left!=None:
            r=self.CalculateSum(root.left,r,cursum,sum)
        if root.right!=None:
            r=self.CalculateSum(root.right,r,cursum,sum)
        return r
    
    def pathSelect(self, root,r,cursum,sum):
        if root!=None:
            r=self.CalculateSum(root,r,0,sum)
            r=self.pathSelect(root.left,r,0,sum)
            r=self.pathSelect(root.right,r,0,sum)
        return r
        
    def pathSum(self, root, sum):
        """
        :type root: TreeNode
        :type sum: int
        :rtype: int
        """
        if root==None:
            return 0;
        r=0
        target=sum
        r=self.pathSelect(root,0,0,sum)
        return r

```

## 92.Number of Segments in a String

Count the number of segments in a string, where a segment is defined to be a contiguous sequence of non-space characters.

Please note that the string does not contain any non-printable characters.

Example:

	Input: "Hello, my name is John"
	Output: 5

### 92.Number of Segments in a String-Analysis

统计字符串中单词或者是段落的个数

很简单,标记单词的开始和结束,以及细节部分就可以了.

当前其实有一些库函数可以直接用空格分隔这个string然后输出成列表或者什么其他的形式,到时候只用size就能得到了.

### 92.Number of Segments in a String-Solution-C/C++

```cpp

class Solution
{
public:
    int countSegments(string s) 
    {
        int r=0,flag=0;
        if(s=="")
            return 0;
        for(int i=0;i<s.size();i++)
        {
            if(s[i]!=' ')
                flag=1;//表示一个单词的开始
            else if(s[i]==' '&&flag==1)
            {
                r++;
                flag=0;
            }
        }
        if(flag==1)
            return r+1;
        else
            return r;
    }
};

```

### 92.Number of Segments in a String-Solution-Python

```python

class Solution(object):
    def countSegments(self, s):
        """
        :type s: str
        :rtype: int
        """
        if len(s)==0:
            return 0
        r=0
        flag=0
        for i in range(len(s)):
            if s[i]!=' ':
                flag=1
            elif s[i]==' ' and flag==1:
                r+=1
                flag=0
        if flag==1:
            return r+1
        else:
            return r

```

## Quote

> http://www.cnblogs.com/grandyang/p/5138212.html 
> 
> http://blog.csdn.net/bingtangkafei/article/details/52946903
> 
> http://blog.csdn.net/u011567017/article/details/52948583 
> 
> http://www.cnblogs.com/grandyang/p/6007336.html