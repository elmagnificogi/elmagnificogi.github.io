---
layout:     post
title:      "LeetCode Solution(Easy.1)"
subtitle:   "c/c++，python，for work"
date:       2015-11-12
author:     "elmagnifico"
header-img: "img/git-head-bg"
tags:
    - LeetCode
    - Work
---


## 前言

第一次做leetcode，先用c或者是c++写一遍解决算法（哪个方便用哪个），再用Python写一遍，正好练习一下Python。（我也是醉了一个在线oj，竟然还有上锁的题目，而且还要交钱了才能看）

## 1.Nim Game

You are playing the following Nim Game with your friend: There is a heap of stones on the table, each time one of you take turns to remove 1 to 3 stones. The one who removes the last stone will be the winner. You will take the first turn to remove the stones.

Both of you are very clever and have optimal strategies for the game. Write a function to determine whether you can win the game given the number of stones in the heap.

For example, if there are 4 stones in the heap, then you will never win the game: no matter 1, 2, or 3 stones you remove, the last stone will always be removed by your friend.

## 1.Nim Game-analysis
 
首先看题，题目看完了，先找找数学上的规律，如果能找到规律那么写起程序来就简单了。

可以发现（两人同等聪明的情况下，总子数为）4、8、12...子后手必赢，5、6、7、9、10
11...子先手必赢.

这里就看到规律了，每四子会出现一个赢或者是输的判读，谁先给对方创造了四的倍数子，那么谁就会赢。

那就很简单了，只需要求余4就可以得到先手是否会赢的结果了

## 1.Nim Game-Solution-C/C++

	bool canWinNim(int n) 
	{
		if(n % 4 == 0 )
			return 0;
		else
			return 1;
	}



## 1.Nim Game-Solution-Python

	class Solution(object):
	    def canWinNim(self, n):
	        if (n % 4 == 0 ):
	            return False
	        else:
	            return True

## 2.Add Digits

Given a non-negative integer num, repeatedly add all its digits until the result has only one digit.

For example:

Given num = 38, the process is like: 3 + 8 = 11, 1 + 1 = 2. Since 2 has only one digit, return it.

Follow up:
Could you do it without any loop/recursion in O(1) runtime?

## 2.Add Digits-analysis
 
开始题目只是加起来所有数字，这个很简单，无脑循环一下就行了。

但是如果要不用循环/递归，要怎么解决这个问题。

如果可以不用循环，那么肯定存在某种位上的规律。

看看位的规律是什么  

36=0x24=0010 0100 其结果等于9 = 0000 1001
37=0x25=0010 0101 其结果等于1 = 0000 0001
38=0x26=0010 0110 其结果等于2 = 0000 0010
39=0x27=0010 0111 其结果等于3 = 0000 0011
40=0x28=0010 1000 其结果等于4 = 0000 0100

好吧，上面这个没看出规律来，可能不够多？从非负整数开始

0=0
1=1
...
9=9

10=1 19=1 28=1 37=1

11=2 20=2 29=2 38=2

12=3 21=3 30=3

13=4 22=4 31=4

14=5 23=5 32=5

15=6 24=6 33=6

16=7 25=7 34=7

17=8 26=8 35=8

18=9 27=9 36=9

这样总算有规律了吧，除了10以下的是有10个数字，剩下的都是9个数字一循环对吧
(看来上面想的跟位有关系还是不对的)


## 2.Add Digits-Solution-C/C++

	int addDigits(int num)
	{
	    return num==0?0:(num%9==0?9:num % 9);
	}

## 2.Add Digits-Solution-Python

	class Solution(object):
	    def addDigits(self, num):
	        if num==0:
	            return 0
	        elif (num % 9 == 0):
	            return 9
	        else:
	            return num%9

## 3.Maximum Depth of Binary Tree

Given a binary tree, find its maximum depth.

The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

## 3.Maximum Depth of Binary Tree-analysis

要求返回最大深度，分别求左右子树的最大深度。

左子树最大深度

右子树最大深度

最大深度=max（左子树最大深度，右子树最大深度）

递归就要求有一个结束点，那么这个结束点就是当root为空的时候，开始返回。

如果用循环该怎么写呢

就应该用中序遍历，左根右，来遍历，得到最大高度

## 3.Maximum Depth of Binary Tree-So lution-C/C++

递归式

	/**
	 * Definition for a binary tree node.
	 * struct TreeNode {
	 *     int val;
	 *     struct TreeNode *left;
	 *     struct TreeNode *right;
	 * };
	 */
	int maxDepth(struct TreeNode* root)
	{
	    int depth=0; 
	    if(root)
	    {
	        int left_depth=maxDepth(root->left);
	        int right_depth=maxDepth(root->right);  
	        depth=left_depth>=right_depth?left_depth+1:right_depth+1;
	    }
	    return depth;
	}

非递归式

如果要使用非递归式，那么基本就需要按照层遍历，记录下来总的层数就可以了。按照层遍历需要存储每一次的分支，那么就需要有一个结构来存储当前层所有的结点入口，用队列就可以，这样的话C就不方便了，那么就用C++来实现。

总体循环流程就是：                                                                                                                                                                                                                                                

如果队列不为空，那么说明还能往下一层走，那么就依次从队列头取出，判断是否可以往下一层走，可以走的再进入队列，当这一次走完以后，队列中剩下的就是下一层的入口。如此循环往复，计数外层循环了几次，就知道深度是多少了。

	#include<queue>
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
	    int maxDepth(TreeNode* root) 
		{
			int depth=0;
			if(!root)
				return 0;
			queue<TreeNode*> q;
			q.push(root);
			while(!q.empty())
			{
				depth++;
				int i=0,j=q.size();
				while (i<j)
				{
					i++;
					TreeNode* curpoint =q.front();
					q.pop();
					if(curpoint->left)
						q.push(curpoint->left);
					if(curpoint->right)
						q.push(curpoint->right);
				}
			}
			return depth;
	    }
	};

但是感觉这个方法还是有点慢，毕竟需要遍历到每一个元素而且还是双层循环的嵌套。查了一下其他方法，非递归的要么就是再加上一个带标记的栈来记录是左子树还是右子树，依然是双层的

下面这个方法就避免了双层循环，只是多了一个度结点，用来保存深度信息，这样就无脑遍历就可以了。

	#include<queue>
	/**
	 * Definition for a binary tree node.
	 * struct TreeNode {
	 *     int val;
	 *     TreeNode *left;
	 *     TreeNode *right;
	 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
	 * };
	 */
	struct denode  
	{  
	    TreeNode* node;  
	    int degree;  
	};  
	class Solution 
	{
		public:
	    int maxDepth(TreeNode *root) 
		{
	        // Start typing your C/C++ solution below
	        // DO NOT write int main() function
	     
	    if(root==NULL)return 0;  
	    queue<denode> que;  
	      
	    denode dnode;  
	    dnode.degree=1;  
	    dnode.node=root;  
	  
	    que.push(dnode);  
	  
	    int degree=1;  
	    while(!que.empty())  
	    {  
	        denode ptr=que.front();  
	        que.pop();  
	  
	        degree=ptr.degree;  
	  
	        if(ptr.node->left!=NULL)  
	        {  
	            denode p;  
	            p.node=ptr.node->left;  
	            p.degree=ptr.degree+1;  
	            que.push(p);  
	        }  
	  
	        if(ptr.node->right!=NULL)  
	        {  
	            denode p;  
	            p.node=ptr.node->right;  
	            p.degree=ptr.degree+1;  
	            que.push(p);  
	        }  
	    }  
	    return degree;   
	        
	    }
	};

## 3.Maximum Depth of Binary Tree-Solution-Python

python自带列表结构，可以直接构造成带度节点，进行遍历

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def maxDepth(self, root):
	        if(root==None):
	            return 0
	        listq=[[root,1]]    
	        depth=1
	        while(listq!=[]):
	            cTreeNode=listq[0][0]
	            depth=listq[0][1]
	            listq.remove(listq[0])
	            if cTreeNode.left!=None:
	                listq.append([cTreeNode.left,depth+1])
	            if cTreeNode.right!=None:
	                listq.append([cTreeNode.right,depth+1])
	        return depth

顺带还学习到，原来listq没有元素的情况下 listq=[]！=None 所以经常判断listq有无元素要根据其长度或者是[]来判断，而不是根据None来判断，None在Python中一般指代没有进行定义初始化的情况

## 4.Delete Node in a Linked List

Write a function to delete a node (except the tail) in a singly linked list, given only access to that node.

Supposed the linked list is 1 -> 2 -> 3 -> 4 and you are given the third node with value 3, the linked list should become 1 -> 2 -> 4 after calling your function.

## 4.Delete Node in a Linked List-analysis

给出某一结点，并进行删除，遍历一下就可以了。

仔细一看给出的函数头，发现竟然没有给头指针，不知道前一个怎么删除下一个呢？？

查了查，才恍然大悟，删除是真的要删，但不一定删的就是当前给的这个节点，可以移花接木

改变当前节点，删除下一个节点，连接下下个节点，这样就做到了没给头节点的情况下删除某一个节点

这个就是需要注意一下，当只有2个节点、1个节点、是尾节点的时候的情况判断

## 4.Delete Node in a Linked List-Solution-C/C++

	/**
	 * Definition for singly-linked list.
	 * struct ListNode {
	 *     int val;
	 *     struct ListNode *next;
	 * };
	 */
	void deleteNode(struct ListNode* node) 
	{
	    struct ListNode* prenode=node;
	    struct ListNode* curnode=prenode->next;
	    if(!curnode)
	    {
	        free(curnode);
	        return ;
	    }
	    struct ListNode* nextnode=curnode->next;
	    if(!nextnode)
	    {
	        prenode->val=curnode->val;
	        prenode->next=0;
	        free(curnode);
	        return ;
	    }
	    prenode->val=curnode->val;
	    prenode->next=nextnode;
	    free(curnode);
	}

## 4.Delete Node in a Linked List-Solution-Python

	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def deleteNode(self, node):
	        pre=node
	        cur=node.next
	        if(cur==None):
	            pre.next=None
	            return
	        next=cur.next
	        if(next==None):
	            pre.val=cur.val
	            pre.next=None
	        pre.val=cur.val
	        pre.next=next


## 3.Maximum Depth of Binary Tree
## 3.Maximum Depth of Binary Tree-analysis
## 3.Maximum Depth of Binary Tree-Solution-C/C++
## 3.Maximum Depth of Binary Tree-Solution-Python


## 3.Maximum Depth of Binary Tree
## 3.Maximum Depth of Binary Tree-analysis
## 3.Maximum Depth of Binary Tree-Solution-C/C++
## 3.Maximum Depth of Binary Tree-Solution-Python


## 3.Maximum Depth of Binary Tree
## 3.Maximum Depth of Binary Tree-analysis
## 3.Maximum Depth of Binary Tree-Solution-C/C++
## 3.Maximum Depth of Binary Tree-Solution-Python


## 3.Maximum Depth of Binary Tree
## 3.Maximum Depth of Binary Tree-analysis
## 3.Maximum Depth of Binary Tree-Solution-C/C++
## 3.Maximum Depth of Binary Tree-Solution-Python


## 3.Maximum Depth of Binary Tree
## 3.Maximum Depth of Binary Tree-analysis
## 3.Maximum Depth of Binary Tree-Solution-C/C++
## 3.Maximum Depth of Binary Tree-Solution-Python


## 3.Maximum Depth of Binary Tree
## 3.Maximum Depth of Binary Tree-analysis
## 3.Maximum Depth of Binary Tree-Solution-C/C++
## 3.Maximum Depth of Binary Tree-Solution-Python


## 3.Maximum Depth of Binary Tree
## 3.Maximum Depth of Binary Tree-analysis
## 3.Maximum Depth of Binary Tree-Solution-C/C++
## 3.Maximum Depth of Binary Tree-Solution-Python


## Quote

> http://blog.csdn.net/zhanglei0107/article/details/11472683
> http://www.linuxidc.com/Linux/2015-01/111637.htm



