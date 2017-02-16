---
layout:     post
title:      "LeetCode Solution(Easy.97-100)"
subtitle:   "c/c++，python，for work"
date:       2017-02-09
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - LeetCode
---

## 97.Construct the Rectangle

For a web developer, it is very important to know how to design a web page's size. So, given a specific rectangular web page’s area, your job by now is to design a rectangular web page, whose length L and width W satisfy the following requirements:

1. The area of the rectangular web page you designed must equal to the given target area.

2. The width W should not be larger than the length L, which means L >= W.

3. The difference between length L and width W should be as small as possible.

You need to output the length L and the width W of the web page you designed in sequence.

Example:

	Input: 4
	Output: [2, 2]
	Explanation: The target area is 4
	and all the possible ways to construct it are [1,4], [2,2], [4,1]. 
	But according to requirement 2, [1,4] is illegal; according to requirement 3,  
	[4,1] is not optimal compared to [2,2]. So the length L is 2, and the width W is 2.

Note:

1. The given area won't exceed 10,000,000 and is a positive integer
2. The web page's width and length you designed must be positive integers.

### 97.Construct the Rectangle-Analysis

给定面积,要求输出矩形的长款,矩形的长必须大于宽,并且长款之差越小越好

### 97.Construct the Rectangle-Solution-C/C++

```cpp
class Solution 
{
public:
    vector<int> constructRectangle(int area)
    {
        vector<int> re;
        int w=0,l=0,dif=0x7fffffff;
        for(int i=1;i<=area;i++)
        {
            if(area%i==0 && area/i>=i)
            {
                if((area/i-i)<dif)
                {
                    w=i;
                    l=area/i;
                }
            }
        }
        re.push_back(l);
        re.push_back(w);
        return re;
    }
};
```

### 97.Construct the Rectangle-Solution-Python

```python
class Solution(object):
    def constructRectangle(self, area):
        """
        :type area: int
        :rtype: List[int]
        """
        l=0
        w=0
        re=[]
        dif=0x7fffffff
        for i in range(1,area+1):
            if area%i==0 and (area/i)>=i and ((area/i-i)<dif):
                l=area/i
                w=i
        re.append(l)
        re.append(w)
        return re
```

相同的代码放进python中就会出现Memory Limit Exceeded

如果提示超时还能接受,但是提示内存超限这个就不能接受了

既然这样不行就得想起他办法解决.要最快找到长宽之差又小,又能符合目标,那么开方便是最接近的解

```python
class Solution(object):
    def constructRectangle(self, area):
        """
        :type area: int
        :rtype: List[int]
        """
        l=0
        w=0
        re=[]
        mid=int(math.sqrt(area))
        while mid>0:
            if area%mid==0:
                l=area/mid
                w=mid
                re.append(l)
                re.append(w)
                break;
            mid-=1
        return re
```

从开方得到的最接近的数字开始寻找,如果平方数不符合,那么继续往下找.

只要找到一个符合的,那么这个数必为w,另外一个数必为l,c++也可以这么写.
	
## 98.Relative Ranks

Given scores of N athletes, find their relative ranks and the people with the top three highest scores, who will be awarded medals: "Gold Medal", "Silver Medal" and "Bronze Medal".

Example 1:

	Input: [5, 4, 3, 2, 1]
	Output: ["Gold Medal", "Silver Medal", "Bronze Medal", "4", "5"]
	Explanation: The first three athletes got the top three highest scores
	so they got "Gold Medal", "Silver Medal" and "Bronze Medal". 
	For the left two athletes
	you just need to output their relative ranks according to their scores.

Note:

1. N is a positive integer and won't exceed 10,000.
2. All the scores of athletes are guaranteed to be unique.

### 98.Relative Ranks-Analysis

给一组成绩,给出其对应的名次.

简单说依次取出最大值,之后分别对应各个位上排序就行了.

### 98.Relative Ranks-Solution-C/C++

```cpp
class Solution 
{
public:
    vector<string> findRelativeRanks(vector<int>& nums) 
    {
        int max=-1,maxi=0;
        stringstream ss;
        vector<string> re(nums.size());
        for(int i=0;i<nums.size();i++)
        {
            for(int j=0;j<nums.size();j++)
            {
                if(nums[j]>max)
                {
                    max=nums[j];
                    maxi=j;
                }
            }
            if(i==0)
                re[maxi]="Gold Medal";
            else if(i==1)
                re[maxi]="Silver Medal";
            else if(i==2)
                re[maxi]="Bronze Medal";
            else
            {
                ss<<(i+1);
                ss>>re[maxi];
                ss.str()="";
                ss.clear();
            }
            nums[maxi]=-1;
            max=-1;
        }
        return re;
    }
};
```

c++这里可以直接使用priority_queue 优先级队列,自动排序,然后用排好序的直接输出名次即可

### 98.Relative Ranks-Solution-Python

```python
class Solution(object):
    def findRelativeRanks(self, nums):
        """
        :type nums: List[int]
        :rtype: List[str]
        """
        sort=sorted(nums)[::-1]
        rank=["Gold Medal", "Silver Medal", "Bronze Medal"] + map(str, range(4, len(nums) + 1))
        return map(dict(zip(sort, rank)).get, nums)
```

这里的python就用了排序之后进行输出的方法

首先使用sorted新建排序list

之后建立好排好名次的list

然后使用zip将排序好的list和名次list,一一对应起来

然后转换为字典类型,利用字典[nums]查找到对应的名次

将查找结果再转化为map 进行输出即可.

思路上简单,但实际写出来上面的代码,需要对语言特性,以及函数非常熟悉才可以.这个是leetcode的参考答案.

## 99.Two Sum II - Input array is sorted

Given an array of integers that is already sorted in ascending order, find two numbers such that they add up to a specific target number.

The function twoSum should return indices of the two numbers such that they add up to the target, where index1 must be less than index2. Please note that your returned answers (both index1 and index2) are not zero-based.

You may assume that each input would have exactly one solution and you may not use the same element twice.

	Input: numbers={2, 7, 11, 15}, target=9
	Output: index1=1, index2=2

### 99.Two Sum II - Input array is sorted-Analysis

给定一个排序数组,给一个目标值,要求用排序好的数组中的两个数相加等于目标值

### 99.Two Sum II - Input array is sorted-Solution-C/C++

```cpp
class Solution 
{
public:
    vector<int> twoSum(vector<int>& numbers, int target)
    {
        vector<int> re;
        for(int i=0;i<numbers.size()-1;i++)
        {
            for(int j=i+1;j<numbers.size();j++)
            {
                if(numbers[i]+numbers[j]==target)
                {
                    re.push_back(i+1);
                    re.push_back(j+1);
                    return re;
                }
            }
        }
    }
};

```
理论上说上面的就可以完成目标值了,但实际上会超时.

所以要想办法优化一下.

先排除情况,什么情况下可以不需要遍历那么多次.

第一个数+第二个数>目标值,那么后面的第二个数都不需要考虑了,必然不符合要求.

	if(numbers[i]+numbers[j]>target)
		break;

那么增加一个跳出循环的过滤,实验了一下直接通过了.

```cpp
class Solution 
{
public:
    vector<int> twoSum(vector<int>& numbers, int target)
    {
        vector<int> re;
        for(int i=0;i<numbers.size()-1;i++)
        {
            for(int j=i+1;j<numbers.size();j++)
            {
                if(numbers[i]+numbers[j]>target)
                    break;
                if(numbers[i]+numbers[j]==target)
                {
                    re.push_back(i+1);
                    re.push_back(j+1);
                    return re;
                }
            }
        }
    }
};
```

### 99.Two Sum II - Input array is sorted-Solution-Python

```python
class Solution(object):
    def twoSum(self, numbers, target):
        """
        :type numbers: List[int]
        :type target: int
        :rtype: List[int]
        """
        for i in range(0,len(numbers)-1):
            for j in range(i+1,len(numbers)):
                if(numbers[i]+numbers[j]>target):
                    break;
                if(numbers[i]+numbers[j]==target):
                    return [i+1,j+1]

```

用python又使用了上面的方法,然而又超时了,一次过滤并不够,python比c++效率要低多了.

还需要想办法再过滤一次.

再想到目标值是两个数的和,那么这两个数必然小于等于目标值.

先找到这两个数的最大可能的位置,然后从这个位置再往下求.

实际测试中发现如果出现负数,那么上面的过滤就不成立了,所以这样不行.

参考了别人的指针思路,发现原来这么简单.

一个指针指向头节点,一个指向尾节点,若大于目标值,说明尾部太大了,尾部左移一个.

若小于目标值,说明头部太小了,右移一个.

```python
class Solution(object):
    def twoSum(self, numbers, target):
        """
        :type numbers: List[int]
        :type target: int
        :rtype: List[int]
        """
        i=0
        j=len(numbers)-1
        while i<len(numbers):
            if numbers[i]+numbers[j]<target:
                i+=1
            elif numbers[i]+numbers[j]>target:
                j-=1
            else:
                return[i+1,j+1]
```

## 100.Find Mode in Binary Search Tree

Given a binary search tree (BST) with duplicates, find all the mode(s) (the most frequently occurred element) in the given BST.

Assume a BST is defined as follows:

The left subtree of a node contains only nodes with keys less than or equal to the node's key.
The right subtree of a node contains only nodes with keys greater than or equal to the node's key.
Both the left and right subtrees must also be binary search trees.

For example:

	Given BST [1,null,2,2],
	   1
	    \
	     2
	    /
	   2
	return [2].

Note: If a tree has more than one mode, you can return them in any order.

Follow up: Could you do that without using any extra space? (Assume that the implicit stack space incurred due to recursion does not count).

### 100.Find Mode in Binary Search Tree-Analysis

给一个有重复元素的二叉搜索树,找到最常出现的节点,可能有多个,不用额外空间完成

如果有额外空间,那么把二叉树转换为对应的排序栈或者是队列,然后依次输出统计一下相同元素个数即可.

没有额外空间就需要用深度/中根优先遍历.

那怎么不用额外空间就统计呢?

要用两次遍历,第一次统计出现频率最高的元素的个数.

第二次统计出现频率最高的元素

第一次:

1. 如果当前元素和上一元素不同,那么开始记录这一元素,当前元素个数+1
2.  如果当前元素和上一元素相同,当前元素个数+1


3. 如果当前元素个数大于最大元素个数,最大元素出现次数修改,最大元素出现次数为1
4.  如果当前元素个数等于最大元素个数,最大元素出现次数+1;

这样最终得到了出现次数最多的元素的个数

元素个数清0,当前元素个数清0

第二次:

1. 如果当前元素和上一元素不同,那么开始记录这一元素,当前元素个数+1

2. 如果当前元素和上一元素相同,当前元素个数+1

3. 如果当前元素个数大于最大元素个数(这不可能了,第一次已经得到了最大值,所以只会出现相等情况了)

4. 如果当前元素个数等于最大元素个数,说明他就是要找的目标值,将目标值加入到返回值中,最高频率元素序号++

继续循环,找下一个出现次数最多的元素.

最终找齐了所有元素,返回

### 100.Find Mode in Binary Search Tree-Solution-C/C++

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
    vector<int> findMode(TreeNode* root) 
    {
        inorder(root);//首先中序遍历 第一次统计不同元素
        modes.resize(modeCount);
        modeCount = 0;
        currCount = 0;
        inorder(root);//第二次中序遍历,统计不同元素出现的次数
        return modes;
    }
private:    
    int currVal;
    int currCount = 0;
    int maxCount = 0;
    int modeCount = 0;    
    vector<int> modes;
    void handleValue(int val) 
    {
        if (val != currVal)//重复元素开始计数
        {
            currVal = val;
            currCount = 0;
        }
        currCount++;//重复元素+1
        
        if (currCount > maxCount) //当前重复元素个数大于最大元素个数
        {
            maxCount = currCount;
            modeCount = 1;
        } 
        else if (currCount == maxCount) //当前重复元素个数等于最大元素个数
        {
            if(!modes.empty())
                modes[modeCount] = currVal;
            modeCount++;
        }
    }
    void inorder(TreeNode* root) 
    {
        if (root == NULL) return;
        inorder(root->left);//左
        handleValue(root->val);//中
        inorder(root->right);//右
    }
};

```

### 100.Find Mode in Binary Search Tree-Solution-Python

```python
# Definition for a binary tree node.
# class TreeNode(object):
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class Solution(object):
    
    maxmodescount=0
    modescount=0
    curcount=0
    curval=None
    re=None
    def handleval(self,val):
        if val!=self.curval:
            self.curval=val
            self.curcount=0
        self.curcount+=1
        if self.curcount>self.maxmodescount:
            self.maxmodescount=self.curcount
            self.modescount=1;
        elif self.curcount==self.maxmodescount:
            if self.re!=None:
                self.re[self.modescount]=self.curval
            self.modescount+=1
        
    def inoder(self, root):
        if root==None:
            return
        self.inoder(root.left)
        self.handleval(root.val)
        self.inoder(root.right)
    def findMode(self, root):
        """
        :type root: TreeNode
        :rtype: List[int]
        """
        self.inoder(root)
        self.re=[0]*(self.modescount)
        self.modescount=0
        self.curcount=0
        self.inoder(root)
        return self.re
```

## Quote

> http://www.cnblogs.com/void/archive/2012/02/01/2335224.html
> 
> http://www.cnblogs.com/65702708/archive/2010/09/14/1826362.html
> 
> https://my.oschina.net/zyzzy/blog/115096
> 
> http://www.cnblogs.com/frydsh/archive/2012/07/10/2585370.html
> 
> http://www.cnblogs.com/yangyongzhi/archive/2012/09/17/2688326.html
> 
> http://www.cnblogs.com/ganganloveu/p/4198968.html