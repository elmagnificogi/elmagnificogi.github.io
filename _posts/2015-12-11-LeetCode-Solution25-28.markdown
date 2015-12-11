---
layout:     post
title:      "LeetCode Solution(Easy.21-24)"
subtitle:   "c/c++，python，for work"
date:       2015-12-10
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
    - Work
---


## 21.Climbing Stairs

You are climbing a stair case. It takes n steps to reach to the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

## 21.Climbing Stairs-analysis

一步两步，我的滑板鞋...摩擦摩擦，又摩擦.... 

什么鬼， 走一步两步，一共走n步，求多少种方法

首先 最多走2步， 而走的这2步，可以拆成1+1 但这强行限制了1连着1的情况 

所以最小分析单位应该扩大一些  3步 =1+2=2+1=1+1+1 这样就是最小单位了

那么3步有几种方法呢 3种  那就看n中有多少个3 然后3的x次幂*剩余步数的情况 应该就是最后所有的可能

好吧 事实证明上面的想法不对

那找规律看看吧
	
	步数 1 2 3 4 5 6  7
	方法 1 2 3 5 8 13 21

好吧竟然是个类斐波那契数列

## 21.Climbing Stairs-Solution-C/C++

### 迭代

	int climbStairs(int n)
	{
	    int i=0,temp;
	    int pre=0,cur=1;
	    for(i=0;i<n;i++)
	    {
	        temp=cur;
	        cur=cur+pre;
	        pre=temp;
	    }
	    return cur;
	}

### 递归

虽然递归是正确的，但是莫名其妙在输入42以后都会提示超时的问题 基本就是超过2s才能有答案，所以判定超时吧

	int climbStairs(int n)
	{
	    if(n==1||n==0)
	        return 1;
	    return climbStairs(n-1)+climbStairs(n-2);
	}
	
## 21.Climbing Stairs-Python

### 迭代

	class Solution(object):
	    def climbStairs(self, n):
	        """
	        :type n: int
	        :rtype: int
	        """
	        temp=n
	        cur=1
	        pre=0
	        i=0
	        for i in range(0,n):
	            temp=cur
	            cur=cur+pre
	            pre=temp
	        return cur

### 递归

问题同上，只不过python的运行效率更差在33往后就 直接超时了

	class Solution(object):
	    def climbStairs(self, n):
	        """
	        :type n: int
	        :rtype: int
	        """
	        if(n==1 or n==0):
	            return 1
	        return self.climbStairs(n-1)+self.climbStairs(n-2)


## 22.Power of Two

Given an integer, write a function to determine if it is a power of two.

## 22.Power of Two-analysis

判断一个数是不是2的x次方，这里其实可以取巧，直接看位就可以了。

如果32位中只有一位置1 那么就是2的幂次 否则不是

当然这里用来计算1的个数可以用上一次提到的hammingweight的方法，可以提高一倍的速度

## 22.Power of Two-Solution-C/C++

	bool isPowerOfTwo(int n) 
	{
	    int i=0,temp=0;
	    if(n<=0)
	        return false;
	    for(i=0;i<32;i++)
	    {
	        temp=temp+((n>>i)&1);
	        if(temp==2)
	            return false;
	    }
	    return true;
	}
	
## 22.Power of Two-Python

	class Solution(object):
	    def isPowerOfTwo(self, n):
	        """
	        :type n: int
	        :rtype: bool
	        """
	        if n<=0:
	            return False
	        temp=0
	        i=0
	        for i in range(0,32):
	            temp=temp+((n>>i)&1)
	            if temp==2:
	                return False
	        return True


## 23.Balanced Binary Tree

Given a binary tree, determine if it is height-balanced.

For this problem, a height-balanced binary tree is defined as a binary tree in which the depth of the two subtrees of every node never differ by more than 1.

## 23.Balanced Binary Tree-analysis

判断一个平衡二叉树是否是高度平衡的，左右子树结点数之差不超过1

明显这种用递归比较简单，迭代也会写

首先就需要求解左右子树的度

## 23.Balanced Binary Tree-Solution-C/C++

### 递归

在C的代码中

代码单独测试[2,1,3]是正确的，但是只要一提交就会说输出错误

单独测试其他的情况也正确，但是就是不能提交，见了鬼。

如果改成C++ 就一点错都没有了。

	/**
	 * Definition for a binary tree node.
	 * struct TreeNode {
	 *     int val;
	 *     struct TreeNode *left;
	 *     struct TreeNode *right;
	 * };
	 */
	int balance=0;
	int BBTdepth (struct TreeNode* root)
	{
	    if(root==NULL||balance==1)
	        return 0;
	    int depthleft=BBTdepth(root->left);
	    int depthright=BBTdepth(root->right);
	    if(depthleft-depthright>1||depthleft-depthright<-1)
	    {
	        balance=1;
	        printf("123");
	        return -1;
	    }
	    return depthleft>=depthright?depthleft+1:depthright+1;
	}
	bool isBalanced(struct TreeNode* root) 
	{
	    BBTdepth(root);
	    if(balance==1)
	        return false;
	    else
	        return true;
	       
	}

要问错误的原因是什么，我终于找到了 leetcode中其他语言都是面向对象的，在函数外定义的对象也是类之中的，所以作为类成员是没问题，用来传递这个balance。但是在唯一的面向过程的C中这就不一样了。在调试的时候这全局变量是被认可的，所以测试的结果都是正确的。但是当去submit的时候，这个全局变量会自动被leetcode后台给释放掉了，就最后结果永远是true 怎么提交都不对，但是单独测又是正确的

经过修改，把balance作为指针传递进去，避免使用全局变量，从而通过submit

	/**
	 * Definition for a binary tree node.
	 * struct TreeNode {
	 *     int val;
	 *     struct TreeNode *left;
	 *     struct TreeNode *right;
	 * };
	 */
	
	int MaxDepth(struct TreeNode* root,bool* balance)
	{
	    if (root == NULL||*balance==false)
	        return 0;
	    int leftdepth = MaxDepth(root->left,balance);
	    int rigtdepth = MaxDepth(root->right,balance);
	    if (abs(leftdepth - rigtdepth) > 1)
        {
	        *balance = false;
	        return -1;
	    }
	    else if (leftdepth < rigtdepth)
	        return rigtdepth + 1;
	    else
	        return leftdepth + 1;   
	}
	bool isBalanced(struct TreeNode *root)
    {
	    bool balance=true;
	    MaxDepth(root,&balance);
	    return balance;
	}

### 迭代

我先尝试把上面的递归改成迭代，发现好麻烦啊，于是想一想有没有其他的简单一些的方法可以用呢

于是我发现如果构造一个带度节点，并且按照层的顺序压入栈中，压栈的时候如果发现了两个不满的层 那就说明是不平衡的了呗
(等我写完下面的程序才发现，我思路错了，这个想法可以用判断是否满，而不能判断是否是平衡二叉树，平衡二叉树只看左右子树，不相邻的就算差了1也是没事的，一个概念理解错了，直接全写错了)

迭代的思路就放弃了，等以后想出来了再来。
	
	/**
	 * Definition for a binary tree node.
	 * struct TreeNode {
	 *     int val;
	 *     struct TreeNode *left;
	 *     struct TreeNode *right;
	 * };
	 */
	 class Solution
	 {
	public:
	struct DTN 
	{
	    int degree;
	    struct TreeNode *root;
	};
	
	bool isBalanced(struct TreeNode *root)
	{
	    int leftdepth=0,rightdepth=0;
	    queue<DTN> store;
	    DTN temp;
	    DTN temp1;
	    if(!root)
	        return true;
	    temp.degree=0;
	    temp.root=root;
	    store.push(temp);
	    int i=0,j=0,count=0;
	    int left=0,right=0;
	    for(i=0;i<100;i++)
	    {
	        while(count<pow(2,i))
	        {
	            
	            temp=store.front();
	            store.pop();
	            printf("%d-",temp.degree);
	            if(temp.degree!=i)
	                return false;
	            if(temp.root->left)
	            {
	                left++;
	                temp1.degree=i+1;
	                temp1.root=temp.root->left;
	                store.push(temp1);
	            }
	            if(temp.root->right)
	            {
	                right++;
	                temp1.degree=i+1;
	                temp1.root=temp.root->right;
	                store.push(temp1);
	            }
	            if(store.empty())
	                break;
	            count++;
	        }
	        count=0;
	        if(store.empty())
	            return true;
	    }
	}
	};

## 23.Balanced Binary Tree-Python

python也用递归的方式来完成

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    balance=True
	    def maxdepth(self, root):
	        """
	        :type root: TreeNode
	        :rtype: int
	        """
	        if(root==None or self.balance==False):
	            return 0
	        leftpath=self.maxdepth(root.left)
	        rightpath=self.maxdepth(root.right)
	        if(leftpath-rightpath<-1 or leftpath-rightpath>1):
	            self.balance=False
	            return 0
	        if leftpath>rightpath:
	            return leftpath+1
	        else: 
	            return rightpath+1
	            
	    def isBalanced(self, root):
	        """
	        :type root: TreeNode
	        :rtype: bool
	        """
	        self.maxdepth(root)
	        return self.balance
        

## 24.Symmetric Tree

Given a binary tree, check whether it is a mirror of itself (ie, symmetric around its center).

For example, this binary tree is symmetric:

	    1
	   / \
	  2   2
	 / \ / \
	3  4 4  3

But the following is not:

	    1
	   / \
	  2   2
	   \   \
	   3    3

Note:
Bonus points if you could solve it both recursively and iteratively.

confused what "{1,#,2,3}" means? > read more on how binary tree is serialized on OJ.

OJ's Binary Tree Serialization:
The serialization of a binary tree follows a level order traversal, where '#' signifies a path terminator where no node exists below.

Here's an example:

	   1
	  / \
	 2   3
	    /
	   4
	    \
	     5

The above binary tree is serialized as "{1,2,3,#,#,4,#,#,5}".

说白了#就等于之前null嘛

## 24.Symmetric Tree-analysis

判断一棵树是不是对称的。

那实际上用之前写过的判读两棵树是不是相等就可以做到了。

还是有一点不同，在于对称的问题，也就是判等的时候要左和右相等而不是左等于左

## 24.Symmetric Tree-Solution-C/C++

### 递归

	/**
	 * Definition for a binary tree node.
	 * struct TreeNode {
	 *     int val;
	 *     struct TreeNode *left;
	 *     struct TreeNode *right;
	 * };
	 */
	 
	bool isSame(struct TreeNode* root1,struct TreeNode* root2)
	{
	    if(root1==NULL&&root2==NULL)
	        return true;    
	    if((root1!=NULL&&root2==NULL)||(root1==NULL&&root2!=NULL)||(root1->val!=root2->val))
	        return false;
	    return isSame(root1->left,root2->right)&&isSame(root1->right,root2->left);
	}
	bool isSymmetric(struct TreeNode* root)
	{
	    if(!root)
	        return true;
	    return isSame(root->left,root->right);
	}

### 迭代

这份代码优化了很多，比之前写的判断二叉树是否相等，去掉了很多重复的判断，简洁了一些。

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
	    bool isSymmetric(TreeNode* root) 
	    {
	        if(!root)
	            return true;
	        queue<TreeNode*>left;
	        queue<TreeNode*>right;
	        TreeNode*root1=root->left;
	        TreeNode*root2=root->right;
	        if(root1==NULL&&root2==NULL)
		        return true;    
		    if((root1!=NULL&&root2==NULL)||(root1==NULL&&root2!=NULL)||(root1->val!=root2->val))
		        return false;        
	        while(1)
	        {
	            
	            if(root1==NULL&&root2==NULL)
		        {
		            if(left.empty()&&right.empty())
		                return true;
		            else
		            {
		                root1=left.front();
		                root2=right.front();
		                left.pop();
		                right.pop();
		                continue;
		            }    
		        }
		        if((root1!=NULL&&root2==NULL)||(root1==NULL&&root2!=NULL)||(root1->val!=root2->val))
		            return false;
		        
	            //root1和root2不为空的情况下,并且二者相等
	            if(root1->left!=NULL)
		        {
		            if(root1->right!=NULL)
		                left.push(root1->right);
		            root1=root1->left;
	    	        if(root2->right!=NULL)
	    	        {
	    	            if(root2->left!=NULL)
	    	                right.push(root2->left);
	    	            root2=root2->right;
	    	        }
	    	        else
	    	            return false;
		        }
		        else
		        {
		            if(root1->right!=NULL)
		                root1=root1->right;
		            else
		            {
		                root1=NULL;
		            }
		            if(root2->right!=NULL)
	    	            return false;
	    	        else
	    	        {
	    	            if(root2->left!=NULL)
	    	                root2=root2->left;
	    	            else
	    	            {
	    	                root2=NULL;
	    	            }
	    	        }
		            
		        }
	        }
	
	    }
	};
	
## 24.Symmetric Tree-Python

### 递归

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def isSame(self, left,right):
	        """
	        :type root: TreeNode
	        :rtype: bool
	        """
	        if(left==None and right==None):
	            return True
	        if((left!=None and right==None)or(left==None and right!=None)or(left.val != right.val)):
	            return False
	        return self.isSame(left.left,right.right)&self.isSame(left.right,right.left)
	        
	    def isSymmetric(self, root):
	        """
	        :type root: TreeNode
	        :rtype: bool
	        """
	        if(not root):
	            return True
	        return self.isSame(root.left,root.right)

### 迭代

在这里发现了一个问题，python对于数据的空的判断要求高，也就是说空的情况下，如果要求返回值 必然会出错。

也就是说必须在程序里确保其自身有内容的情况下才能取值，而不是像c/c++可能要去不够严格，为空的情况下会取到空值什么的。

除此以外还有一个对齐的问题，之前提交的时候，总是提示IndentationError: unexpected indent python

发现是对齐有问题，找了半天没找到，然后重置代码，重新一个一个弄过去，才没有错了。无意间复制的空格什么的都得注意

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None

	class Solution(object):
	    def isSymmetric(self, root):
	        """
	        :type root: TreeNode
	        :rtype: bool
	        """
	        if(root==None):
	            return True
	        left=[]
	        right=[]
	        root1=root.left
	        root2=root.right
	        if (root1==None and root2==None):
	            return True
	        if((root1!=None and root2==None)or(root1==None and root2!=None)or(root1.val != root2.val)):
	            return False
	        while True:
	            if(root1==None and root2==None):
	                if (left==[] and right==[]):
	                    return True
	                elif ((left!=[] and right==[])or(left==[] and right!=[])):
	                    return False
	                else:
	                    root1=left[0]
	                    left.remove(left[0])
	                    root2=right[0]
	                    right.remove(right[0])
	            if((root1!=None and root2==None)or(root1==None and root2!=None)or(root1.val!=root2.val)):
	                return False
	
	            if root1.left!=None:
	                if root1.right!=None:
	                    left.append(root1.right)
	                root1=root1.left
	                
	                if root2.right!=None:
	                    if root2.left!=None:
	                        right.append(root2.left)
	                    root2=root2.right
	                else:
	                    return False
	            else:
	                if root1.right!=None:
	                    root1=root1.right
	                else:
	                    root1=None;
	                    
	                if root2.right!=None:
	                    return False
	                else:
	                    if root2.left!=None:
	                        root2=root2.left
	                    else:
	                        root2=None
                        
        

## Quote

> http://dikar.iteye.com/blog/308934



