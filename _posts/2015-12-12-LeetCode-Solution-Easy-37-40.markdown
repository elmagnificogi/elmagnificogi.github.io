---
layout:     post
title:      "LeetCode Solution(Easy.37-40)"
subtitle:   "c/c++，python，for work"
date:       2015-12-12
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
    - Work
---


## 37.Minimum Depth of Binary Tree

Given a binary tree, find its minimum depth.

The minimum depth is the number of nodes along the shortest path from the root node down to the nearest leaf node.

### 37.Minimum Depth of Binary Tree-analysis

返回最短路径（根-叶） 

直接用层递归，如果当前结点左右为空的情况下比较一下是否小，小就记录下来，否则就是继续循环。

### 37.Minimum Depth of Binary Tree-Solution-C/C++

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
	    void mindepth(TreeNode* root,int level,int* minlevel) 
	    {
	        if(root==NULL)
	            return;
	        if(root->left==NULL&&root->right==NULL)
	            if(level<=(*minlevel))
	                *minlevel=level;
	        mindepth(root->left,level+1,minlevel);
	        mindepth(root->right,level+1,minlevel);
	    }
	
	    int minDepth(TreeNode* root) 
	    {
	        int min=65535;
	        if(root==NULL)
	            return 0;
	        mindepth(root,1,&min);
	        return min;
	    }
	};

### 37.Minimum Depth of Binary Tree-Solution-Python

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def __init__(self):
	        self.min = 65535
	    def mindepth(self, root,level):
	        """
	        :type root: TreeNode
	        :type level: int
	        :rtype: void
	        """
	        if root==None:
	            return
	        if(root.left==None and root.right==None):
	            if level<self.min:
	                self.min=level
	        self.mindepth(root.left,level+1)
	        self.mindepth(root.right,level+1)
	    def minDepth(self, root):
	        """
	        :type root: TreeNode
	        :rtype: int
	        """
	        if root==None:
	            return 0
	        self.mindepth(root,1)
	        return self.min

## 38.Intersection of Two Linked Lists

Write a program to find the node at which the intersection of two singly linked lists begins.


For example, the following two linked lists:
	
	A:          a1 → a2
	                   ↘
	                     c1 → c2 → c3
	                   ↗            
	B:     b1 → b2 → b3

begin to intersect at node c1.


Notes:

- If the two linked lists have no intersection at all, return null.

- The linked lists must retain their original structure after the function returns.

- You may assume there are no cycles anywhere in the entire linked structure.

- Your code should preferably run in O(n) time and use only O(1) memory.

### 38.Intersection of Two Linked Lists-analysis

查找两个链表的公共部分，既然是公共部分，其实从尾部查找是最快的

所以首先得到链表尾，那么链表尾相等。才有可能有一样的部分，否则就没有一样的。

第一种解法，两个链表分别滑动，直到找到相同的部分为止，但是这样需要的时间为 O(n*m)，m和n分别为两个链表的长度，所以这种太慢了 

第二种

再一个既然是两个有公共部分的链表，假设一个链表长一个链表短，

那么先让长的链表往前走一部分，直到和短链表一样长的时候，同步一起走

直到发现相同的地方，开始记录，如果一直到尾部都相同，那么就能返回公共部分，否则虽然有公共部分，但是并不是所有的就返回NULL了

这样的时间就是O(n+m+m) n是链表中比较长的。

暂时没想到什么其他方法可以做到只遍历一遍就能找到的方法

### 38.Intersection of Two Linked Lists-Solution-C/C++

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
	    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB)
	    {
	        bool find=false;
	        ListNode *com;
	        ListNode *A=headA,*B=headB;
	        int lenA=0,lenB=0;
	        //计算链表长度
	        while(A)
	        {
	            A=A->next;
	            lenA++;
	        }
	        while(B)
	        {
	            B=B->next;
	            lenB++;
	        }
	        A=headA;
	        B=headB;
	        //链表对齐
	        if(lenA>lenB)
	        {
	            while(lenA!=lenB)
	            {
	                A=A->next;
	                lenA--;
	            }
	        }
	        else
	        {
	            while(lenA!=lenB)
	            {
	                B=B->next;
	                lenB--;
	            }
	        }
	        while(lenA--)
	        {
	            if(B==A)
	            {
	                if(!find)
	                {
	                    com=A;
	                    find=true;
	                }
	            }
	            else
	            {
	                if(find)
	                    return NULL;
	                else
	                {
	                    B=B->next;
	                    A=A->next;
	                }
	            }
	        }
	        if(find)
	            return com;
	        
	    }
	};

### 38.Intersection of Two Linked Lists-Solution-Python

	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def getIntersectionNode(self, headA, headB):
	        """
	        :type head1, head1: ListNode
	        :rtype: ListNode
	        """
	        A=headA
	        B=headB
	        lenA=0
	        lenB=0
	        com=headA
	        find=False
	        #获取链表长度
	        while A:
	            A=A.next
	            lenA=lenA+1
	        while B:
	            B=B.next
	            lenB=lenB+1
	        A=headA
	        B=headB
	        if lenA>lenB:
	            while lenA!=lenB:
	                A=A.next
	                lenA=lenA-1
	        else:
	            while lenA!=lenB:
	                B=B.next
	                lenB=lenB-1
	        while lenA:
	            lenA=lenA-1
	            if A==B:
	                if not find:
	                    com=A
	                    find=True
	            else:
	                if find:
	                    return None
	                A=A.next
	                B=B.next
	        if find:
	            return com
	            
	            
	            

## 39.Merge Sorted Array

Given two sorted integer arrays nums1 and nums2, merge nums2 into nums1 as one sorted array.

Note:

You may assume that nums1 has enough space (size that is greater or equal to m + n) to hold additional elements from nums2. The number of elements initialized in nums1 and nums2 are m and n respectively.

### 39.Merge Sorted Array-analysis

正常的想法就是一个一个比较，但是由于给的数组，所以插入新的数据进去非常的困难，所以换一个想法，那就是从尾部插入重新排序，这样就不会影响到前面的数据了，而当插到前面的数据的时候，由于后排的数据够多，并不会出现覆盖的问题，所以尾部插入非常适合

### 39.Merge Sorted Array-Solution-C/C++

思路：

首先 得到总长度，然后把两个数组中大的那个数，存到第一个数组中的最后一个位置上，然后指针移动，继续比较存到下一个位置

当其中某个数组的index完了之后，检测一次两个数组的index是否遍历完成，如果有没有完成的，那将其内容继续往数组一中未完成的index里添加，直到结束

	void merge(int* nums1, int m, int* nums2, int n) 
	{
	    int i=m-1,j=n-1,index=m+n-1;
	    while(i>=0&&j>=0)
	    {
	        if(nums1[i]>nums2[j])
	        {
	            nums1[index]=nums1[i];
	            i--;
	            index--;
	        }
	        else
	        {
	            nums1[index]=nums2[j];
	            j--;
	            index--;
	        }
	    }
	    while(i>=0)
	    {
	        nums1[index]=nums1[i];
	        i--;
	        index--;
	    }
	    while(j>=0)
	    {
	        nums1[index]=nums2[j];
	        j--;
	        index--;
	    }    
	}

### 39.Merge Sorted Array-Solution-Python

	class Solution(object):
	    def merge(self, nums1, m, nums2, n):
	        """
	        :type nums1: List[int]
	        :type m: int
	        :type nums2: List[int]
	        :type n: int
	        :rtype: void Do not return anything, modify nums1 in-place instead.
	        """
	        i=m-1
	        j=n-1
	        index=n+m-1
	        while(i>=0 and j>=0):
	            if nums1[i]>nums2[j]:
	                nums1[index]=nums1[i]
	                index=index-1
	                i=i-1
	            else:
	                nums1[index]=nums2[j]
	                index=index-1
	                j=j-1
	        while i>=0:
	            nums1[index]=nums1[i]
	            index=index-1
	            i=i-1
	        while j>=0:
	            nums1[index]=nums2[j]
	            index=index-1
	            j=j-1            

## 40.Reverse Bits

Reverse bits of a given 32 bits unsigned integer.

For example, given input 

43261596 

(represented in binary as 00000010100101000001111010011100), 

return

964176192 

(represented in binary as 00111001011110000010100101000000).

Follow up:
If this function is called many times, how would you optimize it?

Related problem: Reverse Integer

### 40.Reverse Bits-analysis

简单说就是翻转位，这个也比较简单

首先取到最低位，然后把最低位左移31，或上返回值

然后次低位，左移30，或上返回值

...

直到最后一位 返回 ok

### 40.Reverse Bits-Solution-C/C++

	uint32_t reverseBits(uint32_t n) 
	{
	    int ret=0,i=0;
	    for(i=31;i>=0;i--)
	    {
	        ret=ret|(((n>>(31-i))&1)<<i);
	        printf("%d ",ret);
	        //ret=ret<<1;
	    }
	    return ret;
	}

### 40.Reverse Bits-Solution-Python

	class Solution(object):
	    def reverseBits(self, n):
	        """
	        :type n: int
	        :rtype: int
	        """
	        ret=0
	        for i in range(0,32):
	            ret=ret|(((n>>i)&1)<<(31-i))
	        return ret
        

	
## Quote

> http://blog.csdn.net/wcyoot/article/details/6426436
> 



