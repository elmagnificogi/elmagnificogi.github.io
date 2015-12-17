---
layout:     post
title:      "LeetCode Solution(Easy.9-12)"
subtitle:   "c/c++，python，for work"
date:       2015-12-7
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
    - Work
---


## 9.Contains Duplicate

Given an array of integers, find if the array contains any duplicates. Your function should return true if any value appears at least twice in the array, and it should return false if every element is distinct.

### 9.Contains Duplicate-analysis

检查数组中重复的部分。由于是个整数数组用计数的方式不现实。

本方法，python中可以直接统计数字重复出现的次数，就是需要整个数组遍历一遍。而python却有另外一个数据容器，set，也就是集合，而集合不可能出现重复，通过比较转化后的长度，利用这个特性则就能知道是否有重复元素了。

查了一下别人都直接用java的hashset，可以通过插入元素得到结果插入的结果，从而判读重复元素。

### 9.Contains Duplicate-Solution-C/C++

用c完成这个难度有点大，所以用c++来写

如果是java可以直接用hashset，并且可以直接判读insert插入的成功失败，但是，突然发现STL的insert不会返回bool值

查了MSDN以后发现其实有返回值，但是不是bool 返回两个内容，ret.first是插入的元素所在位置，而ret.second是是否插入了新元素。
如果为真，表示插入了新元素，就继续，如果为假就表示没有插入新元素，有重复元素，并且first返回那个元素的指针。


	#include <cliext/set> 
	class Solution {
	public:
	    bool containsDuplicate(vector<int>& nums) 
	    {
	        set<int> s;
	        vector<int>::iterator i;
	        for(i=nums.begin(); i != nums.end(); i++ )
	        {
	            auto ret = s.insert(*i);
	            if(ret.second)
	                continue;
	            else
	                return true;
	        }
	        return false;
	    }
	};

	

### 9.Contains Duplicate-Solution-Python

	class Solution(object):
	    def containsDuplicate(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: bool
	        """
	        s=set(nums)
	        if(len(s)==len(nums)):
	            return False
	        return True
	
## 10.Excel Sheet Column Number

Related to question Excel Sheet Column Title

Given a column title as appear in an Excel sheet, return its corresponding column number.

For example:

    A -> 1
    B -> 2
    C -> 3
    ...
    Z -> 26
    AA -> 27
    AB -> 28 

### 10.Excel Sheet Column Number-analysis

就是一个26进制而已，只不过通过ABCD...来实现而已

### 10.Excel Sheet Column Number-Solution-C/C++

	int titleToNumber(char* s) 
	{
	    int sum=0;
	    while(*s)
	    {
	        sum=sum*26+ (*s)-64;
	        s++;
	    }
	    return sum;
	}

### 10.Excel Sheet Column Number-Solution-Python

在这里发现python的string不可以直接相减，并且也不是ascii码。

所以需要把string中的内容通过ord转换为ascii码值，也可以通过chr把码值转化为字符，然后再进行计算

	class Solution(object):
	    def titleToNumber(self, s):
	        """
	        :type s: str
	        :rtype: int
	        """
	        sum=0
	        i=0
	        while(i<len(s)):
	            sum=sum*26+ord(s[i])-64
	            i=i+1
	        return sum


	
## 11.Majority Element

Given an array of size n, find the majority element. The majority element is the element that appears more than ⌊ n/2 ⌋ times.

You may assume that the array is non-empty and the majority element always exist in the array.

### 11.Majority Element-analysis

得到超过数组长度一半的元素。

这个问题就是要找重复元素的最大值，由于题目限制，一定会有主要元素，那么用本办法可以开辟n/2个空间来存储计数，但当n过大的时候很不好

所以找个其他办法，想起来以前有一个类似的智力题，在很多成对出现的数种寻找某个孤独的数，用到了32位的检测方法。

那么这里也是一样把所有数的位的个数全部统计出来，由于这个主要元素肯定存在，就会导致他的位为1的个数超过n/2，那么所有大于n/2的位为1，其他位为0.就能得到最后的结果，而且只需要遍历数组一次，统计一次32位的个数，空间和时间都很少

### 11.Majority Element-Solution-C/C++

	int majorityElement(int* nums, int numsSize) 
	{
	    int bit[32],i=0,j=0;
	    for(i=0;i<32;i++)
	        bit[i]=0;
	    for(i=0;i<numsSize;i++)
	    {
	        for(j=0;j<32;j++)
	            bit[j]+=((nums[i] & (1<<j))?1:0);
	    }
	    i=0;
	    for(j=0;j<32;j++)
	        {
	            i=bit[j]>(int)(numsSize/2)?(i|(1<<j)):i;
	        }
	    return i;
	}	

### 11.Majority Element-Solution-Python

在这里python有一个bug的地方，就是他的数据位数和左移的问题 

[-2147483648]的python二进制是-0b10000000000000000000000000000000

 [2147483648]的python二进制是 0b10000000000000000000000000000000

区别在哪里呢 在-号这里，2147483647是第30位为1 他应该是32位int的最大值 而当在这个数的基础上再加1的时候应该变成最大的负数 
也就是 -2147483648 而python的oj测试的时候偏偏用了-2147483648，按位寻找1的时候最后发现1就在最后一位上也就是，第31位

但是由于python的自身问题，在解释这个数的时候，他解释为64位的数 那么原本的负数这时候就直接变成了正数2147483648

这样的就无法通过leetcode。这个问题主要是python对于负数和正数临界点的判断的问题 

下面的代码就能看到这个问题

	class Solution(object):
	    def majorityElement(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: int
	        """
	        bit=[]
	        i=0
	        j=0
	        for i in range(0,32):
	            bit.append(0)
	        for i in range(0,len(nums)):
	            for j in range(0,32):
	                if(nums[i]&(1<<j)):
	                    bit[j]=bit[j]+1
	        i=0
	        #print(i)
	        for j in range(0,32):
	            #print(bit[j])
	            if bit[j]>(len(nums)/2):
	                i=i|(1<<j)
	        #print(i<<1)
	        return i

最后得到的解决方法来自于讨论区，讨论区中有人在返回值的地方进行了一个小处理从而解决了这个问题

并且给出了很多种解决方法，值得一看

就是在最后的返回值加一个判断，如果返回数字超出了最大的正数范围那么就自动减去其无符号情况下最大的数得到的就是那个负数了。

	return res if res < 2**31 else res - 2**32
	return (res + 2**31) % 2**32 - 2**31
	return res - ((res >= 2**31) << 32)
	return res - (res >> 31 << 32)

> https://leetcode.com/discuss/64173/why-my-python-solution-is-wrong

	class Solution(object):
	    def majorityElement(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: int
	        """
	        bit=[]
	        i=0
	        j=0
	        for i in range(0,32):
	            bit.append(0)
	        for i in range(0,len(nums)):
	            for j in range(0,32):
	                if(nums[i]&(1<<j)):
	                    bit[j]=bit[j]+1
	        i=0
	        for j in range(0,32):
	            if bit[j]>(len(nums)/2):
	                i=i|(1<<j)
	
	        return i - (i >> 31 << 32)
	
## 12.Lowest Common Ancestor of a Binary Search Tree

Given a binary search tree (BST), find the lowest common ancestor (LCA) of two given nodes in the BST.

According to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes v and w as the lowest node in T that has both v and w as descendants (where we allow a node to be a descendant of itself).”

	        _______6______
	       /              \
	    ___2__          ___8__
	   /      \        /      \
	   0      _4       7       9
	         /  \
	         3   5

For example, the lowest common ancestor (LCA) of nodes 2 and 8 is 6. Another example is LCA of nodes 2 and 4 is 2, since a node can be a descendant of itself according to the LCA definition.

### 12.Lowest Common Ancestor of a Binary Search Tree-analysis

二叉搜索树/平衡树寻找祖先节点，说白了就是先找一个数，然后把他的祖先节点存下来，然后再找另外一个数，另一个数遇到的节点都与存下来的节点相对比，然后找到其中最后一个个相同的部分就是其最小公共祖先。这种方法是不考虑这是一个平衡二叉树这种特性的。

如果考虑到平衡二叉树的特性，那么就会发现这里有取巧的地方。

如果两个数同时小于或者是大于根节点，那么这两个数还能继续往左或者右子树继续考虑，再看是否同时大于或者小于

一旦出现了一个数大于另外一个数小于根节点的情况，那么毫无疑问，当前的根节点，就是最小公共根。

如果不是以上的大于小于关系，而是存在等于的关系，那么说明其中有一个数和根节点相等，那只要直接返回就可以了。

当然这是用递归实现的，同样的迭代方法也会实现一次

### 12.Lowest Common Ancestor of a Binary Search Tree-Solution-C/C++

#### 递归

	/**
	 * Definition for a binary tree node.
	 * struct TreeNode {
	 *     int val;
	 *     TreeNode *left;
	 *     TreeNode *right;
	 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
	 * };
	 */
	class Solution {
	public:
	    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) 
	    {
	        if(p->val<root->val&&q->val<root->val)
	        {
	            //同在左侧
	            return lowestCommonAncestor(root->left,p,q); 
	        }
	        if(p->val>root->val&&q->val>root->val)
	        {
	            //同在右侧
	            return lowestCommonAncestor(root->right,p,q); 
	        }
	        if(p->val>root->val&&q->val<root->val)
	        {
	            //q左，p右
	            return root;
	        }
	        if(p->val<root->val&&q->val>root->val)
	        {
	            //q右，p左
	            return root;
	        }
	        return root;
	    }
	};
	
#### 迭代

由于这种平衡二叉树的特殊性，导致迭代的思路异常的简单，只需要改动一点内容就ok了

	/**
	 * Definition for a binary tree node.
	 * struct TreeNode {
	 *     int val;
	 *     TreeNode *left;
	 *     TreeNode *right;
	 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
	 * };
	 */
	class Solution {
	public:
	    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) 
	    {
	        while(1)
	        {
		        if(p->val<root->val&&q->val<root->val)
		        {
		            //同在左侧
		            root=root->left;
		            continue;
		        }
		        if(p->val>root->val&&q->val>root->val)
		        {
		            //同在右侧
		            root=root->right; 
		            continue;
		        }
		        if(p->val>root->val&&q->val<root->val)
		        {
		            //q左，p右
		            return root;
		        }
		        if(p->val<root->val&&q->val>root->val)
		        {
		            //q右，p左
		            return root;
		        }
		        return root;
	        }
	    }
	};


### 12.Lowest Common Ancestor of a Binary Search Tree-Solution-Python

由于算法的特殊性，这里python使用第一种解法，需要使用广度优先搜索，记录路径，递归中找到的第一个共同点就是最小，迭代则是找到的最后一个点是最小。

#### 递归
	
	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def recordpath(self, root, p,l):
	        """
	        :type root: TreeNode
	        :type p: TreeNode
	        :type q: TreeNode
	        :type l: TreeNode list
	        :rtype: bool
	        """
	        if(root==None):
	            return False
	        if(root.val==p.val or self.recordpath(root.left,p,l) or self.recordpath(root.right,p,l)):
	            l.append(root)
	            return True
	            
	    def lowestCommonAncestor(self, root, p, q):
	        """
	        :type root: TreeNode
	        :type p: TreeNode
	        :type q: TreeNode
	        :rtype: TreeNode
	        """
	        lp=[]
	        lq=[]
	        self.recordpath(root,p,lp)
	        self.recordpath(root,q,lq)
	        i=0
	        j=0
	        for i in range(0,len(lp)): 
	            for j in range(0,len(lq)):
	                if lp[i]==lq[j]:
	                    return lp[i]

#### 迭代

迭代的方法貌似非常复杂一时半会想不出来(2015年12月7日23:30:36)

总算想出来了，就是用了一个双层的循环，而且浪费了之前的查找记录

原理：内层循环负责查找目标值的父节点，外层负责更替父节点，并且存储在了path中，最后父节点=root就结束了。

但是问题就在于每次循环都浪费了上次查找的路径和记录，更好的办法应该是一次找两个目标，然后把目标路径存下来，并且边找边检查是否是最近的，这样就能很快解决这个问题了，不过写起来就更复杂了。

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def recordpath(self, root, p,path):
	        """
	        :type root: TreeNode
	        :type p: TreeNode
	        :type q: TreeNode
	        :type paht: TreeNode list path
	        :rtype: bool
	        """
	        l=[] #l用来遍历的时候存储节点
	        target=p;
	        path.append(p)
	        while True:
	            target=path[-1]
	            if target.val==root.val:
	                return True
	            l=[]
	            l.append(root)
	            temproot=root
	            while True:
	                #temproot=l[-1]
	                #l.pop()
	                
	                if temproot==None:
	                    temproot=l.pop()
	                    continue
	                
	                if temproot.val==target.val:
	                    path.append(temproot)
	                    break;
	                elif temproot.left!=None and temproot.left.val==target.val:
	                    path.append(temproot)
	                    break;
	                elif temproot.right!=None and temproot.right.val==target.val:
	                    path.append(temproot)
	                    break;
	                else:
	                    if temproot.right!=None:
	                        l.append(temproot.right)
	                    temproot=temproot.left
	
	            
	    def lowestCommonAncestor(self, root, p, q):
	        """
	        :type root: TreeNode
	        :type p: TreeNode
	        :type q: TreeNode
	        :rtype: TreeNode
	        """
	        lp=[]
	        lq=[]
	        self.recordpath(root,p,lp)
	        self.recordpath(root,q,lq)
	        i=0
	        j=0
	        for i in range(0,len(lp)): 
	            for j in range(0,len(lq)):
	                if lp[i]==lq[j]:
	                    return lp[i]
	        
	        

## Quote

> https://msdn.microsoft.com/zh-cn/library/547ckb56.aspx
> http://my.oschina.net/Tsybius2014/blog/517511?fromerr=cMRMLS2j
> http://www.cnblogs.com/zhengyun_ustc/archive/2009/10/14/shifting.html



