---
layout:     post
title:      "LeetCode Solution(Easy.33-36)"
subtitle:   "c/c++，python，for work"
date:       2015-12-12
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 33.Binary Tree Level Order Traversal

Given a binary tree, return the level order traversal of its nodes' values. (ie, from left to right, level by level).

For example:
Given binary tree {3,9,20,#,#,15,7},

	    3
	   / \
	  9  20
	    /  \
	   15   7

return its level order traversal as:

	[
	  [3],
	  [9,20],
	  [15,7]
	]

### 33.Binary Tree Level Order Traversal-analysis

这就是之前的那道题的基础，按层输出，上次是由底向上，这次由上向下

思路也是一样的 由层遍历，用NULL作为分层，如果NULL了 就把内容存入返回区

以当前层为空，当前指针为空，队列为空作为最终的结束条件

### 33.Binary Tree Level Order Traversal-Solution-C/C++

#### 迭代

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
	    vector<vector<int>> levelOrder(TreeNode* root) 
	    {
	        if(!root)
	            return (vector<vector<int>>)0;
	        vector<int> line;
	        vector<vector<int>>ret;
	        queue<TreeNode*>store;
	        store.push(root);
	        store.push(NULL);
	        TreeNode* temp;
	        while(!store.empty())
	        {
	            temp=store.front();
	            store.pop();
	            if(temp==NULL)
	            {//表示完成了一层的遍历
	                if(!line.empty())
	                {
	                    store.push(NULL);
	                    ret.push_back(line);
	                    line.clear();
	                }
	            }
	            else
	            {
	
	                line.push_back(temp->val);
	                if(temp->left)
	                    store.push(temp->left);
	                if(temp->right)    
	                    store.push(temp->right);
	            }
	        }
	        return ret;
	    }
	};
	
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
	class Solution
	{
	public:
	    vector<vector<int>>ret;
	    void levelsearch(TreeNode* root,int level) 
	    {
	        if(root==NULL)
	            return;
	        if(level==ret.size())
	        {
	            vector<int>line;
	            ret.push_back(line);
	        }
	        ret[level].push_back(root->val);
	        levelsearch(root->left,level+1);
	        levelsearch(root->right,level+1);
	    }
	    
	    vector<vector<int>> levelOrder(TreeNode* root) 
	    {
	        levelsearch(root,0);
	        return ret;
	    }
	};

### 33.Binary Tree Level Order Traversal-Solution-Python

#### 迭代

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def levelOrder(self, root):
	        """
	        :type root: TreeNode
	        :rtype: List[List[int]]
	        """
	        if root==None:
	            return []
	        store=[root,None]
	        ret=[]
	        line=[]
	        temp=root
	        while store!=[]:
	            temp=store[0]
	            store.remove(store[0])
	            if temp==None:
	                if line!=[]:
	                    store.append(None)
	                    ret.append(line)
	                    line=[]
	            else:
	                line.append(temp.val)
	                if temp.left:
	                    store.append(temp.left)
	                if temp.right:
	                    store.append(temp.right)
	        return ret

#### 递归

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def __init__(self):
	        self.ret=[]
	    def levelsearch(self, root,level):
	        """
	        :type root: TreeNode
	        :type level: int
	        :rtype: void
	        """
	        if root==None:
	            return [];
	        if level==len(self.ret):
	            self.ret.append([])
	        self.ret[level].append(root.val)
	        self.levelsearch(root.left,level+1)
	        self.levelsearch(root.right,level+1)
	    def levelOrder(self, root):
	        """
	        :type root: TreeNode
	        :rtype: List[List[int]]
	        """
	        self.levelsearch(root,0)
	        return self.ret

## 34.Implement Stack using Queues

Implement the following operations of a stack using queues.

- push(x) -- Push element x onto stack.
- pop() -- Removes the element on top of the stack.
- top() -- Get the top element.
- empty() -- Return whether the stack is empty.

Notes:

You must use only standard operations of a queue -- which means only push to back, peek/pop from front, size, and is empty operations are valid.

Depending on your language, queue may not be supported natively. You may simulate a queue by using a list or deque (double-ended queue), as long as you use only standard operations of a queue.

You may assume that all operations are valid (for example, no pop or top operations will be called on an empty stack).

### 34.Implement Stack using Queues-analysis

这里要用队列来做栈的功能，和上次刚好反过来了。要求和上次也是一样的

栈要先进后出，一样的用两个队列来实现一个栈，一个用来存储，一个用来输出

但是我下面用的方法很麻烦每次都需要把队列移动两次 非常麻烦，浪费了很多

python的代码就用不限制谁是存储或者是输出，减少移动次数。

### 34.Implement Stack using Queues-Solution-C/C++
	
	class Stack 
	{
	public:
	    // Push element x onto stack.
	queue<int> in;
	queue<int> out;
	    void move(void)
	    {
	        while(!out.empty())
	        {
	            in.push(out.front());
	            out.pop();
	        }
	    }
	    void push(int x)
	    {
	        in.push(x);
	    }
	    // Removes the element on top of the stack.
	    void pop() 
	    {
	        if(in.empty()&&out.empty())
	            return ;
	        else
	        {
	            if(in.empty())
	            {
	                move();
	            }
	            if(in.size()==1)
	                ;
	            else
	            {
	                //把in的内容先移动到只剩下一个 然后再pop
	                while(in.size()!=1)
	                {
	                    out.push(in.front());
	                    in.pop();
	                }
	            }
	            in.pop();
	        }
	    }
	
	    // Get the top element.
	    int top() 
	    {
	        if(in.empty()&&out.empty())
	            return 0;
	        else
	        {
	            if(in.empty())
	            {
	                move();
	            }
	            if(in.size()==1)
	                ;
	            else
	            {
	                //把in的内容先移动到只剩下一个 然后再pop
	                while(in.size()!=1)
	                {
	                    out.push(in.front());
	                    in.pop();
	                }
	            }
	            return in.front();
	        }
	    }
	
	    // Return whether the stack is empty.
	    bool empty() 
	    {
	        if(in.empty()&&out.empty())
	            return true;
			else
				return false;
	    }
	};

### 34.Implement Stack using Queues-Solution-Python

我终于发现了为什么之前用全局变量会出错了

因为那些全局变量没有初始化，就算写在class中赋值了也不能正确初始化

必须用def __init__(self)函数来定义和初始化，才能正确使用，估计之前的C++等问题也都是这样的

一定要用构造函数来构造才行，不然成员变量的内容不可靠

	class Stack(object):
	    def __init__(self):
	        """
	        initialize your data structure here.
	        """
	        self.q1=[]
	        self.q2=[]
	        self.cur=1
	        
	
	    def push(self, x):
	        """
	        :type x: int
	        :rtype: nothing
	        """
	        if self.cur==1:
	            self.q1.append(x)
	        else:
	            self.q2.append(x)
	
	    def pop(self):
	        """
	        :rtype: nothing
	        """
	        if self.cur==1:
	            while len(self.q1)>1:
	                self.q2.append(self.q1[0])
	                self.q1.remove(self.q1[0])
	            if(len(self.q1)==1):    
	                self.q1.remove(self.q1[0])
	            self.cur=2
	        else:
	            while len(self.q2)>1:
	                self.q1.append(self.q2[0])
	                self.q2.remove(self.q2[0])
	            if(len(self.q2)==1):    
	                self.q2.remove(self.q2[0])
	            self.cur=1
	        
	
	    def top(self):
	        """
	        :rtype: int
	        """
	        if self.cur==1:
	            if(len(self.q1)==1): 
	                return self.q1[0]
	            while len(self.q1)>1:
	                self.q2.append(self.q1[0])
	                self.q1.remove(self.q1[0])
	            return self.q1[0]
	        else:
	            if(len(self.q2)==1): 
	                return self.q2[0]
	            while len(self.q2)>1:
	                self.q1.append(self.q2[0])
	                self.q2.remove(self.q2[0])
	            return self.q2[0]
	
	    def empty(self):
	        """
	        :rtype: bool
	        """
	        if(self.q1==[] and self.q2==[]):
	            return True
	        else:
	            return False
            



## 35.Path Sum

Given a binary tree and a sum, determine if the tree has a root-to-leaf path such that adding up all the values along the path equals the given sum.

For example:
Given the below binary tree and sum = 22,

              5
             / \
            4   8
           /   / \
          11  13  4
         /  \      \
        7    2      1

return true, as there exist a root-to-leaf path 5->4->11->2 which sum is 22.

### 35.Path Sum-analysis

给定某一个值，确定给出的树中是否有一条路的和是它相等的

简单说就是要做一个深度搜索，然后返回每次的路径和做对比，一样就返回true

否则就继续寻找，直到深度搜索结束还没找到就返回false

### 35.Path Sum-Solution-C/C++


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
	    //深度遍历
	    bool PathSum(TreeNode* root,int target,int sum) 
	    {
	        if(root==NULL)
	            return false;
	        if(root->left==NULL&&root->right==NULL)
	            return sum+root->val==target;
	        return PathSum(root->left,target,sum+root->val)||PathSum(root->right,target,sum+root->val);
	    }
	    bool hasPathSum(TreeNode* root, int sum) 
	    {
	        return PathSum(root,sum,0);
	    }
	};

### 35.Path Sum-Solution-Python

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    
	    def PathSum(self,root,target,sum):
	        """
	        :type root: TreeNode
	        :type target:int
	        :type sum: int
	        :rtype: bool
	        """
	        if root==None:
	            return False
	        if(root.left==None and root.right==None):
	            return sum+root.val==target
	        return self.PathSum(root.left,target,sum+root.val) or self.PathSum(root.right,target,sum+root.val)
	    def hasPathSum(self, root, sum):
	        """
	        :type root: TreeNode
	        :type sum: int
	        :rtype: bool
	        """
	        return self.PathSum(root,sum,0)
        



## 36.Palindrome Number

Determine whether an integer is a palindrome. Do this without extra space.

click to show spoilers.

Some hints:
Could negative integers be palindromes? (ie, -1)

If you are thinking of converting the integer to string, note the restriction of using extra space.

You could also try reversing an integer. However, if you have solved the problem "Reverse Integer", you know that the reversed integer might overflow. How would you handle such case?

There is a more generic way of solving this problem.

### 36.Palindrome Number-analysis

判读是否是一个回文的数字串，说白了就是首尾相等

如果是字符串，简单的循环就可以了

但这个是数字串，首先就需要把他分成数字然后判断

但是呢，既然是数字，如果是回文的数字的话 那么他的回文肯定和原数字相同

那么就简单了，构造数字的回文数字就可以了，然后比较一下是否相等。

### 36.Palindrome Number-Solution-C/C++

有一个小问题，就是leetcode认为负数不是回文串，所以其实可以直接判定负数就是错的
	
	bool isPalindrome(int x)
	{
	    int n=0,temp=x;
	    if(x<0)
	        return false;
	    while(1)
	    {
	        n=n*10+temp%10;
	        printf("%d-",n);
	        temp=temp/10;
	        if(temp==0)
	            return n==x;
	    }
	}

如果负数无视符合也能成回文的话，只需要这么修改就可以了

	if(x<0)
	{
	    temp=-x;
	    x=-x;
	}

### 36.Palindrome Number-Solution-Python   

	class Solution(object):
	    def isPalindrome(self, x):
	        """
	        :type x: int
	        :rtype: bool
	        """
	        if x<0 :
	            return False;
	        temp=x
	        n=0
	        while True:
	            n=n*10+temp%10
	            temp=temp/10
	            if temp==0:
	                return n==x
                             

## Quote

> http://www.cnblogs.com/remlostime/archive/2012/11/13/2767746.html



