---
layout:     post
title:      "LeetCode Solution(Easy.53-56)"
subtitle:   "c/c++，python，for work"
date:       2015-12-14
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 53.Add Binary

Given two binary strings, return their sum (also a binary string).

For example

	a = "11"
	b = "1"

Return "100".

### 53.Add Binary-analysis

给二进制的string 然后求和 还能更简单吗？

方法一把string的二进制直接转化成数的二进制，然后求和，之后再把int类型转化为string的二进制（但是如果string非常长，超过int范围就有可能出错）

方法二 直接用string来做二进制求和。

### 53.Add Binary-Solution-C/C++

c++用方法二来实现的，除了代码很长以外，没什么难度。

	class Solution 
	{
	public:
	    string addBinary(string a, string b) 
	    {
	        stringstream sum;
	        string s;
	        int i=0,alen=a.length(),blen=b.length();
	        int min=alen>blen?blen:alen;
	        int max=alen>blen?alen:blen;
	        int c=0;
	        for(i=0;i<min;i++)
	        {
	            if(a[alen-1-i]=='1'&&b[blen-1-i]=='1')
	            {
	                if(c==1)
	                {
	                    sum<<'1';
	                    c=1;
	                }
	                else
	                {
	                    sum<<'0';
	                    c=1;
	                }
	            }
	            else if((a[alen-1-i]=='1' && b[blen-1-i]=='0')||(a[alen-1-i]=='0' && b[blen-1-i]=='1'))
	            {
	                if(c==1)
	                {
	                    sum<<'0';
	                    c=1;
	                }
	                else
	                {
	                    sum<<'1';
	                }
	            }
	            else
	            {
	                if(c==1)
	                {
	                    sum<<'1';
	                    c=0;
	                }
	                else
	                {
	                    sum<<'0';
	                }
	            }
	            
	        }
	        s=alen>blen?a:b;
	        int dif=max-min;
	        for(i=0;i<dif;i++)
	        {
	            if(s[dif-1-i]=='1')
	            {
	                if(c==1)
	                {
	                    sum<<'0';
	                    c=1;
	                }
	                else
	                {
	                    sum<<'1';
	                    c=0;
	                }
	            }
	            else
	            {
	                if(c==1)
	                {
	                    sum<<'1';
	                    c=0;
	                }
	                else
	                {
	                    sum<<'0';
	                }
	            }
	        }
	        if(c==1)
	            sum<<'1';
	        string ret=sum.str();
	        string nn(ret.rbegin(),ret.rend());
	        return nn;
	    }
	};

### 53.Add Binary-Solution-Python
	            
python的string不支持list的操作，真是很麻烦的一个问题啊 

还好可以使用 

		sum.reverse()
        ret=''.join(sum)
		或
		''.join(sum[::-1])
		进行list到string，而string到list也只用强制转换就行了

下面是具体的程序

	class Solution(object):
	    def addBinary(self, a, b):
	        """
	        :type a: str
	        :type b: str
	        :rtype: str
	        """
	        c=0
	        aa=list(a)
	        bb=list(b)
	        sum=[]
	        for i in range(min(len(aa),len(bb))):
	            if aa[-1]=='1' and bb[-1]=='1':
	                if c==1:
	                    sum.append('1')
	                    c=1
	                else:
	                    sum.append('0')
	                    c=1
	            elif (aa[-1]=='0' and bb[-1]=='0'):
	                if c==1:
	                    sum.append('1')
	                    c=0
	                else:
	                    sum.append('0')
	                    c=0
	            else:
	                if c==1:
	                    sum.append('0')
	                    c=1
	                else:
	                    sum.append('1')
	                    c=0
	            del aa[-1]
	            del bb[-1]
	        if aa==[]:
	            s=bb
	        else:
	            s=aa
	        for i in range(len(s)):
	            if s[-1]=='1':
	                if c==1:
	                    sum.append('0')
	                    c=1
	                else:
	                    sum.append('1')
	                    c=0
	            else:
	                if c==1:
	                    sum.append('1')
	                    c=0
	                else:
	                    sum.append('0')
	            del s[-1]
	        if c==1:
	            sum.append('1')
	        sum.reverse()
	        ret=''.join(sum)
	        return ret        




## 54.Palindrome Linked List

Given a singly linked list, determine if it is a palindrome.

Follow up:
Could you do it in O(n) time and O(1) space?

### 54.Palindrome Linked List-analysis

判断一个单链表是不是回文？？？要求时间是 O(n) 空间是O(1)

由于有空间的要求，所以要应用之前使用的一个办法，逆序。

只是这次也需要先找到链表的中间部分，然后从中间部分开始逆序

把后半截逆序之后，再跟前半截相比较，得到最后的结果。

但其实这样的话时间不是完美的 O(n) 而是 O(n/2+n/2+n/2)

还有一个递归的方式，直接递归到尾部，然后有一个全局变量记录头，

尾部和头部相比较，如果二者相等，返回，如果不等，返回false 

但是如果用递归其实有一个隐藏空间的存在，就是函数保存时用的stack。

两种方法都会写一次

### 54.Palindrome Linked List-Solution-C/C++

#### 迭代

	/**
	 * Definition for singly-linked list.
	 * struct ListNode {
	 *     int val;
	 *     struct ListNode *next;
	 * };
	 */
	bool isPalindrome(struct ListNode* head) 
	{
	    //找到链表的中间位置
	    if(!head||!head->next)
	        return true;
	    struct ListNode* mid=head;
	    struct ListNode* temp=head;
	    while(mid->next&&mid->next->next)
	    {
	        temp=temp->next;
	        mid=mid->next->next;
	    }
	    mid=temp->next;//成为另一半节点的头节点
	    temp->next=NULL;
	    //开始翻转节点
	    struct ListNode* pre=NULL;
	    struct ListNode* cur=mid;
	    struct ListNode* next=cur->next;
	    while(next)
	    {
	            cur->next=pre;
	            pre=cur;
	            cur=next;
	            next=next->next;
	    }
	    cur->next=pre;
	    mid=cur;
	    //开始对比
	    while(mid->val==head->val)
	    {
	        if(head->next==NULL||mid->next==NULL||mid==head)
	            return true;
	        mid=mid->next;
	        head=head->next;
	    }
	    return false;
	}


#### 递归

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
	    ListNode* temp;
	    bool ispalindrome(ListNode* head) 
	    {
	        if(head==NULL)
	            return true;
	        if(ispalindrome(head->next)==false)
	            return false;
	        else
	        {
	            if(head->val==temp->val)
	            {
	                temp=temp->next;
	                return true;
	            }
	            else
	                return false;
	        }
	        
	    }
	    bool isPalindrome(ListNode* head) 
	    {
	        temp=head;
	        return ispalindrome(head);
	    }
	};

### 54.Palindrome Linked List-Solution-Python

#### 递归

不出所料，python的递归通不过，Memory Limit Exceeded ，也就是递归超界了

所以递归的办法应该不是leetcode想要的

	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def __init__(self):
	        self.temp=None 
	    def ispalindrome(self, head):
	        """
	        :type head: ListNode
	        :rtype: bool
	        """
	        if head==None:
	            return True
	        if self.ispalindrome(head.next)==False:
	            return False
	        else:
	            if head.val==self.temp.val:
	                self.temp=self.temp.next
	                return True
	            else:
	                return False
	        
	    def isPalindrome(self, head):
	        """
	        :type head: ListNode
	        :rtype: bool
	        """
	        self.temp=head
	        return self.ispalindrome(head)

#### 迭代
	
	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def __init__(self):
	        self.temp=None 
	    def isPalindrome(self, head):
	        """
	        :type head: ListNode
	        :rtype: bool
	        """
	        if(not head) or (not head.next):
	            return True
	        mid=head
	        temp=head
	        #//查找中间节点
	        while mid.next and mid.next.next:
	            temp=temp.next
	            mid=mid.next.next;
	        mid=temp.next
	        #//链表逆序
	        temp.next=None
	        pre=None
	        cur=mid
	        next=mid.next
	        while next:
	            cur.next=pre
	            pre=cur
	            cur=next
	            next=next.next
	        cur.next=pre
	        mid=cur
	        #//两个链表对比
	        while mid.val==head.val:
	            if mid==head or mid.next==None or head.next==None:
	                return True
	            mid=mid.next
	            head=head.next
	        return False

## 55.Binary Tree Paths

Given a binary tree, return all root-to-leaf paths.

For example, given the following binary tree:

	   1
	 /   \
	2     3
	 \
	  5

All root-to-leaf paths are:

	["1->2->5", "1->3"]

### 55.Binary Tree Paths-analysis

返回根到子叶的路径，这不是前天做过的那个类似吗，返回根到节点的总和。

一样是使用深度遍历，然后挨个存储把左子树和右子树的内容分开存储

### 55.Binary Tree Paths-Solution-C/C++

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
	    vector<string> ret;
	    void depthsearch(TreeNode* root,string path)
	    {
	        //cout<<path;
	        if(root==NULL)
	            return;
	        if(root->left==NULL&&root->right==NULL)
	        {
	            
	            //当前节点为叶节点,路径加入返回区
	            stringstream sum;
	            sum<<path<<root->val;
	            path=sum.str();
	            ret.push_back(path);
	        }        
	        if(root->left!=NULL)
	        {
	            stringstream sum;
	            string p;
	            sum<<path<<root->val;
	            p=sum.str();
	            depthsearch(root->left,p+"->");
	        }  
	        if(root->right!=NULL)
	        {
	            stringstream sum;
	            string p;
	            sum<<path<<root->val;
	            p=sum.str();            
	            depthsearch(root->right,p+"->");
	        }
	    }
	    vector<string> binaryTreePaths(TreeNode* root) 
	    {
	        if(root==NULL)
	            return (vector<string>)0;
	        stringstream sum;    
	        sum<<root->val;
	        string s="";//=sum.str();
	        depthsearch(root,s);
	        return ret;
	    }
	};

### 55.Binary Tree Paths-Solution-Python

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def __init__(self):
	        self.ret =[]  
	    def depthsearch(self, root,path):
	        if root==None:
	            return
	        path=path+str(root.val)
	        if root.left==None and root.right==None:
	            self.ret.append(path)
	        if root.left!=None:
	            self.depthsearch(root.left,path+"->")
	        if root.right!=None:
	            self.depthsearch(root.right,path+"->")
	    
	    def binaryTreePaths(self, root):
	        """
	        :type root: TreeNode
	        :rtype: List[str]
	        """
	        s=""
	        self.depthsearch(root,s)
	        return self.ret

## 56.Range Sum Query - Immutable

Given an integer array nums, find the sum of the elements between indices i and j (i ≤ j), inclusive.

Example:
	
	Given nums = [-2, 0, 3, -5, 2, -1]
	
	sumRange(0, 2) -> 1
	sumRange(2, 5) -> -1
	sumRange(0, 5) -> -3

Note:

You may assume that the array does not change.

There are many calls to sumRange function.

### 56.Range Sum Query - Immutable-analysis

给定一组数，返回对应下标范围内的数字的总和

但是这个题并不仅仅是到这里而已，他需要你自己写一个类对象，并且完成上面的操作

也就是要自己写一个构造函数，和sumRange的成员函数，感觉很简单啊？

实际上第一次写完以后就不通过，百度了一下，发现题目想要的是什么。

### 56.Range Sum Query - Immutable-Solution-C/C++

下面的代码，功能上没有问题，但是没通过，Time Limit Exceeded，竟然超时了，也就是说这里需要优化一下。

	class NumArray 
	{
	public:
	    vector<int> data;
	    NumArray(vector<int> &nums)
	    {
	        data=nums;
	    }
	
	    int sumRange(int i, int j)
	    {
	        int sum=0;
	        for(i;i<=j;i++)
	            sum=sum+data[i];
	        return sum;
	    }
	};

所以此题的解决办法就是提前计算好所有数字的和，存到vector中，在最后调用的时候用sum(j)-sum(i-1)就能得到i到j的总和了

	class NumArray 
	{
	public:
	    vector<int> data;
	    NumArray(vector<int> &nums)
	    {
	        int sum=0,i=0;
	        for(i=0;i<nums.size();i++)
	        {
	            sum=sum+nums[i];
	            data.push_back(sum);
	        }
	    }
	
	    int sumRange(int i, int j)
	    {
	        if(i==0)
	            return data[j];
	        return data[j]-data[i-1];
	    }
	};

### 56.Range Sum Query - Immutable-Solution-Python
	
	class NumArray(object):
	    def __init__(self, nums):
	        """
	        initialize your data structure here.
	        :type nums: List[int]
	        """
	        data=0
	        self.sum=[]
	        for i in range(len(nums)):
	            data=data+nums[i]
	            self.sum.append(data)
	        
	
	    def sumRange(self, i, j):
	        """
	        sum of elements nums[i..j], inclusive.
	        :type i: int
	        :type j: int
	        :rtype: int
	        """
	        if i==0:
	            return self.sum[j]
	        return self.sum[j]-self.sum[i-1]
        
## Quote

> http://blog.csdn.net/sunao2002002/article/details/46918645
> http://www.bkjia.com/ASPjc/1031678.html
> http://www.cnblogs.com/ganganloveu/p/4635328.html
> http://my.oschina.net/Tsybius2014/blog/528708



