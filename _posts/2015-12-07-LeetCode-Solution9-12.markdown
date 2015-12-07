---
layout:     post
title:      "LeetCode Solution(Easy.5-8)"
subtitle:   "c/c++，python，for work"
date:       2015-12-5
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
    - Work
---


## 5.Move Zeroes

Given an array nums, write a function to move all 0's to the end of it while maintaining the relative order of the non-zero elements.

For example, given nums = [0, 1, 0, 3, 12], after calling your function, nums should be [1, 3, 12, 0, 0].

Note:
You must do this in-place without making a copy of the array.
Minimize the total number of operations.

## 5.Move Zeroes-analysis

空间压缩，并且要求是0的元素到最后去，而非0的元素的顺序不变。

并且不能开辟新空间，只用交换顺序来完成。

思路，先找0值，如果是0那么就找下一个非0值来交换，并且让空位变成0。

这样交换的次数是最少的

## 5.Move Zeroes-Solution-C/C++

	void moveZeroes(int* nums, int numsSize) 
	{
	    int i=0,j=0;
	    for(i=0;i<numsSize;i++)
	        if(nums[i]==0)
	            //寻找下一个非0值，进行交换，0的个数增加
	            for(j=i+1;j<numsSize;j++)
	                if(nums[j]!=0)
	                    {
	                        nums[i]=nums[j];
	                        nums[j]=0;
	                        break;
	                    }
	}

## 5.Move Zeroes-Python
	
	class Solution(object):
	    def moveZeroes(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: void Do not return anything, modify nums in-place instead.
	        """
	        i=0
	        j=0
	        for i in range(i,len(nums),1):
	            if(nums[i]==0):
	                j=i+1
	                for j in range(j,len(nums),1):
	                    if(nums[j]!=0):
	                        nums[i]=nums[j]
	                        nums[j]=0
	                        break

## 6.Same Tree

Given two binary trees, write a function to check if they are equal or not.

Two binary trees are considered equal if they are structurally identical and the nodes have the same value.

## 6.Same Tree-analysis
 
检测是不是相同的树，要注意如果左右子树对阵的情况下也是一样的。

递归检测二叉树的左右子树是否相同，并且以子叶不相同或者是都为空作为递归结束点

不过leetcode中相同是认为完全相同，不能做对称处理的相同

这种会有递归和迭代的解法的都会写两种方式

## 6.Same Tree-Solution-C/C++

### 递归

	/**
	 * Definition for a binary tree node.
	 * struct TreeNode {
	 *     int val;
	 *     struct TreeNode *left;
	 *     struct TreeNode *right;
	 * };
	 */
	bool isSameTree(struct TreeNode* p, struct TreeNode* q) 
	{
	    //二者不相等的情况，返回false
	    if(!((p&&q&&p->val==q->val)||(p==NULL&&q==NULL)))
	        return false;
	    if(p==NULL&&q==NULL)
	        return true;
	    return isSameTree(p->left,q->left) && isSameTree(p->right,q->right);
		//如果加上下面的判断，就是对称相等也算相同
	    //||isSameTree(p->left,q->right) && isSameTree(p->right,q->left);
	}

### 迭代

用迭代的方法，那么就是简单的左右子树相比较，但是需要一个容器用来存储上一次比较的地方，队列就可以了（堆栈都可以）

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
	    bool isSameTree(TreeNode* p, TreeNode* q) 
	    {
	        queue<TreeNode*> ptemp;
	        queue<TreeNode*> qtemp;
	        while(1)
	        {
	            if(p==NULL && q==NULL)
	            {
	                //从队列中获得上一个分支，再进行比较
	                //如果分支为空，那么直接返回true
	                if(ptemp.empty() && qtemp.empty() )
	                    return true;
	                else
	                {
	                    p=ptemp.front();
	                    ptemp.pop();
	                    q=qtemp.front();
	                    qtemp.pop();
	                }   
	            }
	            if((p==NULL && q!=NULL)||(p!=NULL && q==NULL)||(p->val!=q->val))
	                return false;
	
	            if(p->left!=NULL&&q->left!=NULL)
	            {    
	                if(p->right!=NULL&&q->right!=NULL)
	                {
	                    ptemp.push(p->right);
	                    qtemp.push(q->right);      
	                    //把分支加入队列  
	                }
	                else if((p->right==NULL&&q->right!=NULL)||(p->right!=NULL&&q->right==NULL)) 
	                    return false;
	                p=p->left;
	                q=q->left;
	            }
	            else if((p->left==NULL&&q->left!=NULL)||(p->left!=NULL&&q->left==NULL))
	                return false;
	            else 
	            {
	                if((p->right==NULL&&q->right!=NULL)||(p->right!=NULL&&q->right==NULL)) 
	                    return false;
	                else if(p->right!=NULL&&q->right!=NULL)
	                {    
	                    p=p->right;
	                    q=q->right;
	                    continue;
	                }
	                if(p->right==NULL&&q->right==NULL)
	                {
	                    if(ptemp.empty() && qtemp.empty() )
	                        return true;
	                    else
	                    {
	                        p=ptemp.front();
	                        ptemp.pop();
	                        q=qtemp.front();
	                        qtemp.pop();
	                    }
	
	                }
	            }
	        }      
	    }
	};

## 6.Same Tree-Solution-Python

### 递归

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def isSameTree(self, p, q):
	        """
	        :type p: TreeNode
	        :type q: TreeNode
	        :rtype: bool
	        """
	        if not((p and q and p.val==q.val)or(p==None and q==None)):
	            return False
	        if (p==None and q==None) :
	            return True
	        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)
		//如果加上下面的判断，就是对称相等也算相同
	    //or (self.isSameTree(p->left,q->right) and self.isSameTree(p->right,q->left))

才发现，python的class中递归自身需要前置self，不然就会提示没找到

### 迭代

	class Solution(object):
	    def isSameTree(self, p, q):
	        """
	        :type p: TreeNode
	        :type q: TreeNode
	        :rtype: bool
	        """
	        ptemp=[];
	        qtemp=[];
	        while 1 :
	            if(p==None and q==None):
	                if(ptemp==[] and qtemp==[]):
	                    return True;
	                else:
	                    p=ptemp[0]
	                    ptemp.remove(ptemp[0])
	                    q=qtemp[0]
	                    qtemp.remove(qtemp[0])
	            if(p==None and q!=None)or(p!=None and q==None)or(p.val!=q.val):
	                return False
	            
	            if(p.left!=None and q.left!=None):
	                if(p.right!=None and q.right!=None):
	                    ptemp.append(p.right)
	                    qtemp.append(q.right)
	                elif(p.right==None and q.right!=None)or(p.right!=None and q.right==None):
	                    return False
	                p=p.left
	                q=q.left
	            elif (p.left==None and q.left!=None)or(p.left!=None and q.left==None):
	                return False
	            else:
	                if(p.right!=None and q.right!=None):
	                    p=p.right
	                    q=q.right
	                    continue
	                elif(p.right==None and q.right!=None)or(p.right!=None and q.right==None):
	                    return False
	                else:
	                    if(ptemp==[] and qtemp==[]):
	                        return True;
	                    else:
	                        p=ptemp[0]
	                        ptemp.remove(ptemp[0])
	                        q=qtemp[0]
	                        qtemp.remove(qtemp[0])

## 7.Invert Binary Tree

Invert a binary tree.

	     4
	   /   \
	  2     7
	 / \   / \
	1   3 6   9

to

	     4
	   /   \
	  7     2
	 / \   / \
	9   6 3   1

Trivia:
This problem was inspired by this original tweet by Max Howell:
Google: 90% of our engineers use the software you wrote (Homebrew), but you can’t invert a binary tree on a whiteboard so fuck off.

## 7.Invert Binary Tree-analysis

就是要翻转二叉树，用递归就是遍历到最后一个节点然后开始依次往上翻转，并且是做节点的交换，而不是值得交换（值交换，需要判读空的情况，并且新建节点，而且值交换的情况下，需要左右大子树交换的时候就很麻烦了，必须得用节点交换才比较方便）

## 7.Invert Binary Tree-Solution-C/C++

### 递归

递归思路：首先找到左右子树最下面的叶子节点，然后由叶子节点开始交换位置，并且依次往上进行

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
	    TreeNode* invertTree(TreeNode* root) 
	    {
	        TreeNode* temp;
	        if(root==NULL)
	            return NULL;
	        root->left=invertTree(root->left);
	        root->right=invertTree(root->right);
	        
	        temp=root->left;
	        root->left=root->right;
	        root->right=temp;
	        return root;
	        
	    }
	};

### 迭代

非递归就需要挨个遍历一遍，依次交换.

我是用自上而下的遍历方法：

1.先把第一个根进行左右交换

2.判断根的左是否为空，右是否为空，都不为空，就把右存起来，如果左空，右不空，就用右作为根继续遍历

3.左右都为空的情况下，检查存储区是否有内容，有就拿来做为根，没有就是整个遍历结束了

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
	    TreeNode* invertTree(TreeNode* root) 
	    {
	        TreeNode* temp;
	        TreeNode* tmproot=root;
	        if(root==NULL)
	            return NULL;
	        stack<TreeNode*>store;
	        while(1)
	        {
	            temp=tmproot->left;
	            tmproot->left=tmproot->right;
	            tmproot->right=temp;
	            if(tmproot->left!=NULL)
	            {
	                if(tmproot->right!=NULL)
	                    store.push(tmproot->right);
	                tmproot=tmproot->left;
	            }
	            else
	            {
	         
	                if(tmproot->right!=NULL)
	                {
	                    tmproot=tmproot->right;
	                    continue;
	                }
	                if(store.empty())
	                    return root;
	                tmproot=store.top();
	                store.pop();
	            }
	        }
	    }
	};

## 7.Invert Binary Tree-Solution-Python

### 递归

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def invertTree(self, root):
	        """
	        :type root: TreeNode
	        :rtype: TreeNode
	        """
	        if root==None:
	            return None;
	        root.left=self.invertTree(root.left)
	        root.right=self.invertTree(root.right)
	        
	        temp=root.left
	        root.left=root.right
	        root.right=temp
	        
	        return root 

### 迭代

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None

	class Solution(object):
	    def invertTree(self, root):
	        """
	        :type root: TreeNode
	        :rtype: TreeNode
	        """
	        store=[]
	        if root==None:
	            return None;
	        tmproot=root
	        while 1:
	            temp=tmproot.left
	            tmproot.left=tmproot.right
	            tmproot.right=temp
	            if tmproot.left!=None:
	                if tmproot.right!=None:
	                    store.append(tmproot.right)
	                tmproot=tmproot.left
	            else:
	                if tmproot.right!=None:
	                    tmproot=tmproot.right
	                    continue
	                if store==[]:
	                    return root
	                tmproot=store.pop()

## 8.Valid Anagram

Given two strings s and t, write a function to determine if t is an anagram of s.

For example,
s = "anagram", t = "nagaram", return true.
s = "rat", t = "car", return false.

Note:
You may assume the string contains only lowercase alphabets.

## 8.Valid Anagram-analysis

关键在于anagram这个词，意思是相同字母但是改变了顺序，而不是逆序。

想到两个方法

1. 从s中依次取一个字母，然后去t中查找，找到后删除，如果最后没剩余，则是ok的
2. 提前预备好26个字母，然后便利s和t将其所含字母对应数组内容依此加一/减一，最后检测一次求数组总和，总和为0，则是ok的否则就是错的

想想看那个用的时间更少，第一种方法则是s/t越大，需要消耗时间更多。第二种则是s/t越大，消耗时间相对反而少

百度了一下还看到一种思路，直接字母排序判等，这种貌似也可以，但是考虑时间的消耗当然是计数的方法最好只需要一遍就ok。（字母排序并不够稳定，耗时也很多）

## 8.Valid Anagram-Solution-C/C++

c用计数的方法来完成

	bool isAnagram(char* s, char* t)
	{
	    int num[26],i;
	    for(i=0;i<26;i++)
	        num[i]=0;    
	    if(s==t&&s==NULL)
	        return true;
	    while(*s)
	    {
	        num[(int)(*s-'a')]++;
	        s++;
	    }
	    while(*t)
	    {
	        num[(int)(*t-'a')]--;
	        t++;
	    }
	    for(i=0;i<26;i++)
	        if(num[i]!=0)
	            return false;
	    return true;
	}

## 8.Valid Anagram-Solution-Python

python就用第三种排序的方法来解决这个问题
python的list有自带的排序功能比较好用，而c没有，c++就要用STL库的容器来弄。虽然python也需要转换一下容器。

	class Solution(object):
	    def isAnagram(self, s, t):
	        """
	        :type s: str
	        :type t: str
	        :rtype: bool
	        """
	        lists = list(s)
	        listt = list(t)
	        lists.sort()
	        listt.sort()
	        if(lists==listt):
	            return True
	        else:
	            return False

当然这里也学习了一次如何把list和string相互转换

	>>> import string
	>>> str = 'abcde'
	>>> list = list(str)
	>>> list
	['a', 'b', 'c', 'd', 'e']
	>>> str
	'abcde'
	>>> str_convert = ''.join(list)
	>>> str_convert
	'abcde'
	>>>

## Quote

> http://segmentfault.com/a/1190000003768716
> http://www.linuxidc.com/Linux/2015-01/111637.htm
> http://blog.devtang.com/blog/2015/06/16/talk-about-tech-interview/
> http://piziyin.blog.51cto.com/2391349/568426
> http://www.cnblogs.com/ganganloveu/p/4694703.html



