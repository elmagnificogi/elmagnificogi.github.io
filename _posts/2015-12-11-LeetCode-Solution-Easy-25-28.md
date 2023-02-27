---
layout:     post
title:      "LeetCode Solution(Easy.25-28)"
subtitle:   "c/c++，python，for work"
date:       2015-12-11
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 25.Remove Element

Given an array and a value, remove all instances of that value in place and return the new length.

The order of elements can be changed. It doesn't matter what you leave beyond the new length.

### 25.Remove Element-Analysis

这个题目要求删除元素，但是呢，你删除后的长度，剩下的内容他是不管的，他只看你剩下长度的空间中内容是否正确

最后参考了这个题目的思路，才明白题目想干嘛

http://blog.csdn.net/beiyetengqing/article/details/8274317

### 25.Remove Element-Solution-C/C++

	int removeElement(int* nums, int numsSize, int val) 
	{
	    int i=0,j=0;
	    for(i=0;i<numsSize;i++)
	    {
	        if(nums[i]!=val)
	        {
	            nums[j]=nums[i];
	            j++;
	        }
	    }
	    return j;
	}
	
### 25.Remove Element-Solution-Python

class Solution(object):
    def removeElement(self, nums, val):
        """
        :type nums: List[int]
        :type val: int
        :rtype: int
        """
        i=0
        j=0
        for i in range(0,len(nums)):
            if nums[i]!=val:
                nums[j]=nums[i]
                j=j+1
        return j
        

## 26.Binary Tree Level Order Traversal II

Given a binary tree, return the bottom-up level order traversal of its nodes' values. (ie, from left to right, level by level from leaf to root).

For example:
Given binary tree {3,9,20,#,#,15,7},

	    3
	   / \
	  9  20
	    /  \
	   15   7

return its bottom-up level order traversal as:

	[
	  [15,7],
	  [9,20],
	  [3]
	]

### 26.Binary Tree Level Order Traversal II-Analysis

简单说就是要返回每层的元素

用广度搜索，然后把每一层的分别加进去，最后把整个输出的内容逆序就能完成，从后往前输出了

### 26.Binary Tree Level Order Traversal II-Solution-C/C++

#### 迭代

迭代思路：用queue做广度遍历，用NULL来做层分割，遇到NULL以后判断当前层是否为空，不为空则添加NULL分隔，然后把整个一行加入到返回区中，继续遍历

	/**
	 * Definition for binary tree
	 * struct TreeNode {
	 *     int val;
	 *     TreeNode *left;
	 *     TreeNode *right;
	 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
	 * };
	 */
	class Solution {
	public:
	    vector<vector<int> > levelOrderBottom(TreeNode *root) 
		{
	        // Start typing your C/C++ solution below
	        // DO NOT write int main() function
	        	vector<vector<int> > ret;
				ret.clear();
				if(root == NULL)
					return ret;
				queue<TreeNode*> store;
				store.push(root);
				store.push(NULL);
				vector<int> line;
				while(!store.empty())
				{
					//travesal current level
					TreeNode* p = store.front();
					store.pop();
					if(p!=NULL)
					{
						line.push_back(p->val);
						if(p->left) 
							store.push(p->left);
						if(p->right)
							store.push(p->right);
					}
					else
					{
						if(!line.empty())
						{	
							store.push(NULL);
							ret.push_back(line);
							line.clear();
						}			  			
					}
				}
				reverse(ret.begin(),ret.end());  
				return ret;
	    }
	};

#### 递归

递归思路：一样的层递归，当root为空时返回，如果当前层和返回区的层数相等，那么就添加一层进去，然后把当前的值加入到当前层中
然后继续递归 最后对由上到下的层进行翻转。

	/**
	 * Definition for binary tree
	 * struct TreeNode {
	 *     int val;
	 *     TreeNode *left;
	 *     TreeNode *right;
	 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
	 * };
	 */
	class Solution {
	public:
	    vector<vector<int> > ret;
	    void degreeTree(TreeNode *root,int degree)
	    {
	        if(root==NULL)
	            return;
	        if(degree==ret.size())
	        {
	            vector<int>line;
	            ret.push_back(line);
	        }
	        ret[degree].push_back(root->val);
	        degreeTree(root->left,degree+1);
	        degreeTree(root->right,degree+1);
	    }
	    
	    vector<vector<int> > levelOrderBottom(TreeNode *root) 
	    {
	        degreeTree(root,0);
	        return vector<vector<int> >(ret.rbegin(), ret.rend());
	    }
	
	};
        

### 26.Binary Tree Level Order Traversal II-Solution-Python

#### 递归

python这里又出现了之前遇到的bug 单独测试没有错，但是一旦提交就错了

错就错在了[1,2] 这个问题 

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    ret=[]
	    def degreetree(self, root,degree):
	        """
	        :type root: TreeNode
	        :rtype:  0
	        """
	        if root==None:
	            return
	        if degree==len(self.ret):
	            self.ret.append([])
	        self.ret[degree].append(root.val)
	        self.degreetree(root.left,degree+1)
	        self.degreetree(root.right,degree+1)
	    def levelOrderBottom(self, root):
	        """
	        :type root: TreeNode
	        :rtype: List[List[int]]
	        """
	        self.degreetree(root,0)
	        self.ret.reverse()
	        return self.ret

哎 这问题在哪里呢 就在全局变量，不知道为啥python的全局变量还是会出问题，所以把全局变量传进去就没事了

看discuss中发现也有人遇到了这个问题，他没用全局变量，但是用了static，其实就是变相的全局变量，所以也出了这个问题

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def degreetree(self, root,degree,ret):
	        """
	        :type root: TreeNode
	        :rtype:  0
	        """
	        if root==None:
	            return
	        if degree==len(ret):
	            ret.append([])
	        ret[degree].append(root.val)
	        if root.left:
	            self.degreetree(root.left,degree+1,ret)
	        if root.right:
	            self.degreetree(root.right,degree+1,ret)
	    def levelOrderBottom(self, root):
	        """
	        :type root: TreeNode
	        :rtype: List[List[int]]
	        """
	        ret=[]
	        self.degreetree(root,0,ret)   
	        ret.reverse()
	        return ret

#### 迭代

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def levelOrderBottom(self, root):
	        """
	        :type root: TreeNode
	        :rtype: List[List[int]]
	        """
	        ret=[]
	        line=[]
	        store=[]
	        if root==None:
	            return ret
	        store.append(root)
	        store.append(None)
	        while(store!=[]):
	            temp=store[0]
	            store.remove(store[0])
	            if temp!=None:
	                line.append(temp.val)
	                if temp.left:
	                    store.append(temp.left)
	                if temp.right:
	                    store.append(temp.right)
	            else:
	                if line!=[]:
	                    store.append(None)
	                    ret.append(line)
	                    line=[];
	        ret.reverse()
	        return ret

同时在discuss看到了一个非常短的代码，其实展开了一样长

原理上是一样的，先是把当前队列中的值全都加到nodes的当前层中

然后从队列中取值 判断其左右是否存在，存在就存到队列中，这样循环 最后翻转就可以了。

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
		def levelOrderBottom(self, root):
		        if not root: return []
		        queue, nodes = [root], []
		        while queue:
		            nodes.append([q.val for q in queue])
		            queue = [q for node in queue for q in (node.left, node.right) if q]
		        nodes.reverse()
		        return nodes


## 27.Remove Duplicates from Sorted Array

Given a sorted array, remove the duplicates in place such that each element appear only once and return the new length.

Do not allocate extra space for another array, you must do this in place with constant memory.

For example,
Given input array nums = [1,1,2],

Your function should return length = 2, with the first two elements of nums being 1 and 2 respectively. It doesn't matter what you leave beyond the new length.

### 27.Remove Duplicates from Sorted Array-Analysis

这个题和25题是一样的，都是删除元素，而且不计删除后的长度问题

我想到的办法就是每次取一个，和之前的相比较，如果有相同的元素，那么就取下一个，如果全都不同，那么就存起来

### 27.Remove Duplicates from Sorted Array-Solution-C/C++        

单独测试都能通过，但是 Time Limit Exceeded 超时了，就得想办法，主要这个没考虑到题目给的是sorted的，没有利用这个条件优化一下

	int removeDuplicates(int* nums, int numsSize) 
	{
	    int ret=0,i=0,j=0,val=0,n=0;
	    bool same=false;
	    if(nums==NULL)
	        return 0;
	        ret=1;
	        for(i=1;i<numsSize;i++)
	        {
	            for(j=0;j<ret;j++)
	            {
	                if(nums[i]==nums[j])
	                {
	                    same=true;
	                    break;
	                }
	            } 
	            if(same==false)
	            {
	                nums[ret]=nums[i];
	                ret++;
	            }
	            same=false;
	        }
	    return ret;
	}

在这里添加了一个last上一次的值，如果和上次的值相同，那就跳过，不同的情况下才会进去比较，这样就简单了很多了

	int removeDuplicates(int* nums, int numsSize) 
	{
	    int ret=0,i=0,j=0,val=0,n=0,last=0;
	    bool same=false;
	    if(numsSize==0)
	        return 0;
	    last=nums[0];
	    ret=1;
	    for(i=1;i<numsSize;i++)
	    {
	        if(nums[i]==last)
	            continue;
	        for(j=0;j<ret;j++)
	        {
	            if(nums[i]==nums[j])
	            {
	                same=true;
	                break;
	            }
	        } 
	        if(same==false)
	        {
	            nums[ret]=nums[i];
	            last=nums[i];
	            ret++;
	        }
	        same=false;
	    }
	    return ret;
	}

突然发现，如果肯定下一个和之前的不一样的话，那我还比较个什么劲啊.... 直接去掉一堆循环

	int removeDuplicates(int* nums, int numsSize) 
	{
	    int ret=0,i=0,last=0;
	    if(numsSize==0)
	        return 0;
	    last=nums[0];
	    ret=1;
	    for(i=1;i<numsSize;i++)
	    {
	        if(nums[i]==last)
	            continue;
	        else
	        {
	            nums[ret]=nums[i];
	            last=nums[i];
	            ret++;
	        }
	    }
	    return ret;
	}

### 27.Remove Duplicates from Sorted Array-Solution-Python

class Solution(object):
    def removeDuplicates(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        i=1
        ret=1
        if nums==[]:
            return 0
        last=nums[0]
        for i in range(1,len(nums)):
            if last==nums[i]:
                continue
            else:
                nums[ret]=nums[i]
                ret=ret+1
                last=nums[i]
        return ret

## 28.House Robber

You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security system connected and it will automatically contact the police if two adjacent houses were broken into on the same night.

Given a list of non-negative integers representing the amount of money of each house, determine the maximum amount of money you can rob tonight without alerting the police.

### 28.House Robber-Analysis

说白了相邻的房子同一晚上不能进，只能进不相邻的。最后要求最大值

转化过来就是求一个数组中不相邻元素的最大和

这是一个动态规划的问题（dynamic programming）

假设有N家，此时你已经 “处理”了前N-1家，来到了第N家的门前。那么摆在你面前的选择题如下：
 
1. 对第N家不抢，则你的最大化收益就是截止到第N-1家的收益，即

	notRob[N] = rob[N - 1];//第n家不抢的收益就等于第n-1家抢的收益
	rob[N] = rob[N - 1];//第n家的收益就等于第n-1家的收益 

2. 假设你要对第N家动手，那么有一个重要的前提就是：你没有抢劫第N-1家。则收益为 
	
	如果notRob[N - 1] + num(N) > rob[N] 
	那么rob[N]=notRob[N - 1] + num(N) 
	否则rob[N] = rob[N];

按照这个规则你一直抢到最后一家，比较一下notRob[N]和rob[N]哪个比较大就ok了。

### 28.House Robber-Solution-C/C++   

	
	int rob(int* nums, int numsSize) 
	{
	    int i=0;
	    if(numsSize==0)
	        return 0;
	    int *rob;int *notrob;
	    rob=(int*)malloc(numsSize*sizeof(int));
	    notrob=(int*)malloc(numsSize*sizeof(int));
	    
	    rob[0]=nums[0];//假设抢第一家，总和为nums[0]
	    notrob[0]=0;//那么 没抢的总和为0
	
	    for(i=1;i<numsSize;i++)
	    {
	        notrob[i]=rob[i-1];//当前不抢的话，等于上次抢了的值
	        rob[i]=notrob[i-1]+nums[i];//如果这次要抢的话 就是上次没抢的总和+这家的
	        if(rob[i-1]>rob[i])//如果这次抢后的值比抢上家的要少，那就不抢，这次的值就等于上次的值
	        {
	            rob[i]=rob[i-1];
	        }
	    }
	    return (notrob[numsSize - 1]< rob[numsSize- 1])?rob[numsSize- 1]:notrob[numsSize - 1];
	}

     
### 28.House Robber-Solution-Python
	
	class Solution(object):
	    def rob(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: int
	        """
	        if(len(nums)==0):
	            return 0
	        rob=[nums[0]]
	        notrob=[0]
	        for i in range(1,len(nums)):
	            notrob.append(rob[i-1])
	            if ((notrob[i-1]+nums[i])>rob[i-1]):
	                rob.append(notrob[i-1]+nums[i])
	            else:
	                rob.append(rob[i-1])
	                
	        if notrob[-1]>rob[-1]:
	            return notrob[-1]
	        else:
	            return rob[-1]        



## Quote

> http://blog.csdn.net/beiyetengqing/article/details/8274317
> 
> http://blog.csdn.net/xshalk/article/details/8153255
> 
> https://leetcode.com/discuss/68854/simple-iterative-python-o-n-solution
> 
> http://www.meetqun.com/thread-8777-1-1.html
> 
> http://www.cnblogs.com/ganganloveu/p/4417485.html