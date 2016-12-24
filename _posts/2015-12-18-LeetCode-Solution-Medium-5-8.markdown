---
layout:     post
title:      "LeetCode Solution(Medium.5-8)"
subtitle:   "c/c++，python，for work"
date:       2015-12-18
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 5.Binary Tree Preorder Traversal

Given a binary tree, return the preorder traversal of its nodes' values.

For example:
Given binary tree {1,#,2,3},

	   1
	    \
	     2
	    /
	   3

return [1,2,3].

Note: Recursive solution is trivial, could you do it iteratively?

### 5.Binary Tree Preorder Traversal-Analysis

返回前序遍历的结果，要求用迭代来解决这个问题。

既然是前序遍历，其实也就需要一个队列来存储一下临时变量而已 

### 5.Binary Tree Preorder Traversal-Solution-C/C++

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
	    vector<int> preorderTraversal(TreeNode* root) 
	    {
	        if(!root)
	            return (vector<int>)0;
	        queue<TreeNode*> store;
	        stack<TreeNode*> storer;
	        vector<int>ret;
	        TreeNode *temp;
	        int i=0;
	        store.push(root);
	        while(!store.empty()||!storer.empty())
	        {
	            if(!store.empty())
	            {
	                temp=store.front();
	                store.pop();
	            }
	            else
	            {
	                temp=storer.top();
	                storer.pop();
	            }
	            if(temp!=NULL)
	            {
	                ret.push_back(temp->val);
	            }
	            if(temp->left)
	                store.push(temp->left);
	            if(temp->right)
	                storer.push(temp->right);
	        }
	        return ret;
	    }
	};

### 5.Binary Tree Preorder Traversal-Solution-Python

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def preorderTraversal(self, root):
	        """
	        :type root: TreeNode
	        :rtype: List[int]
	        """
	        if not root:
	            return []
	        store=[root]
	        ret=[]
	        temp=None
	        while temp or len(store)!=0:
	            if not temp:
	                temp=store[-1]
	                del store[-1]
	            if temp:
	                ret.append(temp.val)
	            if temp.right:
	                store.append(temp.right)
	            if temp.left:
	                temp=temp.left
	            else:
	                temp=None
	        return ret

## 6.Binary Tree Inorder Traversal

Given a binary tree, return the inorder traversal of its nodes' values.

For example:
Given binary tree {1,#,2,3},
   1
    \
     2
    /
   3
return [1,3,2].

Note: Recursive solution is trivial, could you do it iteratively?

### 6.Binary Tree Inorder Traversal-Analysis

这个是中序遍历，一样的 

### 6.Binary Tree Inorder Traversal-Solution-C/C++

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
	    vector<int> inorderTraversal(TreeNode* root) 
	    {
	        vector<int> ret;
	        stack<TreeNode*> store;
	        TreeNode *temp=root;
	        while(temp||!store.empty())
	        {
	            if(temp)
	            {
	                store.push(temp);
	                temp=temp->left;
	                continue;
	            }
	            temp=store.top();
	            store.pop();
	            ret.push_back(temp->val);
	            temp=temp->right;
	        }
	        return ret;
	    }
	};

### 6.Binary Tree Inorder Traversal-Solution-Python

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def inorderTraversal(self, root):
	        """
	        :type root: TreeNode
	        :rtype: List[int]
	        """
	        store=[]
	        ret=[]
	        temp=root
	        while temp or len(store)!=0:
	            if temp:
	                store.append(temp)
	                temp=temp.left
	                continue
	            temp=store[-1]
	            del store[-1]
	            ret.append(temp.val)
	            temp=temp.right
	        return ret


## 7.Missing Number

Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing from the array.

For example,

Given nums = [0, 1, 3] return 2.

Note:

Your algorithm should run in linear runtime complexity. Could you implement it using only constant extra space complexity?

### 7.Missing Number-Analysis

找出连续数中缺失的那一个，但是题目没有说数组是排序过的！！

所以可能出现乱序，这个题比较像是智力题。

既然是连续个数，而且一定缺少了一个数，总个数为nums.size+1

而且一定是从0开始的，那只需要求和 然后相减就可以了。

n+1个数的总和-当前给出的n个数的总和=缺少的那个数

### 7.Missing Number-Solution-C/C++

	class Solution 
	{
	public:
	    int missingNumber(vector<int>& nums)
	    {
	        int i=0,sum=0,sdsum=0;
	        for(i=0;i<nums.size()+1;i++)
	        {
	            sdsum+=i;
	            if(i<nums.size())
	                sum=sum+nums[i];
	        }
	        return sdsum-sum;
	    }
	};

### 7.Missing Number-Solution-Python

	class Solution(object):
	    def missingNumber(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: int
	        """
	        sum=0
	        sdsum=0
	        for i in range(len(nums)+1):
	            sdsum+=i
	            if i<len(nums):
	                sum+=nums[i]
	        return sdsum-sum

## 8.Linked List Cycle

Given a linked list, determine if it has a cycle in it.

Follow up:

Can you solve it without using extra space?

### 8.Linked List Cycle-Analysis

给定一个链表，判断是否存在环，这个也很简单，只要用两个指针同时走，一个指针一次走一个，一个一次走两步，这样如果快的出现了指向空则不成环，否则二者肯定会在某时相等，相等就成环。 

### 8.Linked List Cycle-Solution-C/C++

	/**
	 * Definition for singly-linked list.
	 * struct ListNode {
	 *     int val;
	 *     ListNode *next;
	 *     ListNode(int x) : val(x), next(NULL) {}
	 * };
	 */
	class Solution 
	{
	public:
	    bool hasCycle(ListNode *head) 
	    {
	        ListNode *slow=head;
	        ListNode *fast=head;
	        while(fast&&fast->next&&fast->next->next)
	        {
	            slow=slow->next;
	            fast=fast->next->next;
	            if(fast==slow)
	                return true;
	        }
	        return false;
	    }
	};

### 8.Linked List Cycle-Solution-Python

	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def hasCycle(self, head):
	        """
	        :type head: ListNode
	        :rtype: bool
	        """
	        slow=head;
	        fast=head;
	        while fast and fast.next and fast.next.next:
	            fast=fast.next.next
	            slow=slow.next
	            if slow==fast:
	                return True
	        return False;

## Quote

> http://www.cnblogs.com/shuaiwhu/archive/2012/05/03/2480509.html
> http://blog.csdn.net/cxllyg/article/details/7520037


