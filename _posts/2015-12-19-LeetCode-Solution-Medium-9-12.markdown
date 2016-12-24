---
layout:     post
title:      "LeetCode Solution(Medium.9-12)"
subtitle:   "c/c++，python，for work"
date:       2015-12-19
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 9.Search Insert Position

Given a sorted array and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You may assume no duplicates in the array.

Here are few examples.

	[1,3,5,6], 5 → 2
	[1,3,5,6], 2 → 1
	[1,3,5,6], 7 → 4
	[1,3,5,6], 0 → 0

### 9.Search Insert Position-Analysis

从一个有序数组中寻找某一值，如果找到了返回其引索，否则返回该值插入引索

首先既然是有序数组，那就可以用二分搜索来寻找这个值，如果没找到，也能直接得到其插入引索的位置

### 9.Search Insert Position-Solution-C/C++

	class Solution 
	{
	public:
	    int searchInsert(vector<int>& nums, int target) 
	    {
	        int low=0,high=nums.size(),mid=low+(high-low)/2;
	        while(low<high)
	        {
	            if(nums[mid]>target)
	            {
	                high=mid;
	            }
	            else
	            {
	                low=mid+1;
	            }
	            mid=low+(high-low)/2;
	        }
	        if(nums[mid-1]==target&&mid-1>=0)
	            return mid-1;
	        else
	            return mid;
	    }
	};

### 9.Search Insert Position-Solution-Python

	class Solution(object):
	    def searchInsert(self, nums, target):
	        """
	        :type nums: List[int]
	        :type target: int
	        :rtype: int
	        """
	        low=0
	        high=len(nums)
	        mid=low+(high-low)/2
	        while low<high:
	            if nums[mid]>target:
	                high=mid
	            else:
	                low=mid+1
	            mid=low+(high-low)/2
	        if nums[mid-1]==target and mid-1>=0:
	            return mid-1
	        else:
	            return mid



## 10. Populating Next Right Pointers in Each Node

Given a binary tree

    struct TreeLinkNode {
      TreeLinkNode *left;
      TreeLinkNode *right;
      TreeLinkNode *next;
    }

Populate each next pointer to point to its next right node. If there is no next right node, the next pointer should be set to NULL.

Initially, all next pointers are set to NULL.

Note:

You may only use constant extra space.

You may assume that it is a perfect binary tree (ie, all leaves are at the same level, and every parent has two children).

For example,

Given the following perfect binary tree,

	         1
	       /  \
	      2    3
	     / \  / \
	    4  5  6  7

After calling your function, the tree should look like:

         1 -> NULL
       /  \
      2 -> 3 -> NULL
     / \  / \
    4->5->6->7 -> NULL

### 10. Populating Next Right Pointers in Each Node-Analysis

给了一个完整树，同时在树节点中增加了一个next

next表示是当前节点在树种右边节点的地址，现在需要对一个没有next节点的树完成所有next节点的初始化。

既然是完整树，那么只要按层遍历就行了，对每层的节点进行next赋值。

同时用degree来记录当前层，count用来记录当前层个数。

如果count==1的时候 表示剩下的是最后一个，那么这个节点就是最右节点，就把他的next设置为NULL

否则的情况下，next=队列中的头节点

### 10. Populating Next Right Pointers in Each Node-Solution-C/C++

	/**
	 * Definition for binary tree with next pointer.
	 * struct TreeLinkNode {
	 *  int val;
	 *  TreeLinkNode *left, *right, *next;
	 *  TreeLinkNode(int x) : val(x), left(NULL), right(NULL), next(NULL) {}
	 * };
	 */
	class Solution 
	{
	public:
	    void connect(TreeLinkNode *root) 
	    {
	        queue<TreeLinkNode*>store;
	        TreeLinkNode*temp=NULL;
	        store.push(root);
	        int degree=1,count=1;
	        while(!store.empty())
	        {
	            temp=store.front();
	            store.pop();
	            if(temp)
	            {
	                if(count==1)
	                {
	                    temp->next=NULL;
	                    count=degree*2;
	                    degree=degree*2;
	                    ;
	                }
	                else
	                {
	                    count--;
	                    temp->next=store.front();
	                }
	                if(temp->left)
	                {
	                    store.push(temp->left);
	                    store.push(temp->right);
	                }
	            }
	
	        }
	    }
	};

### 10. Populating Next Right Pointers in Each Node-Solution-Python

	# Definition for binary tree with next pointer.
	# class TreeLinkNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	#         self.next = None
	
	class Solution(object):
	    def connect(self, root):
	        """
	        :type root: TreeLinkNode
	        :rtype: nothing
	        """
	        store=[root]
	        temp=root
	        degree=1
	        count=1
	        while len(store)!=0:
	            temp=store[0]
	            del store[0]
	            if temp:
	                if count==1:
	                    count=degree*2
	                    degree=count
	                    temp.next=None
	                else:
	                    count=count-1
	                    temp.next=store[0]
	                if temp.left:
	                    store.append(temp.left)
	                    store.append(temp.right)
	                

## 11.Single Number II

Given an array of integers, every element appears three times except for one. Find that single one.

Note:

Your algorithm should have a linear runtime complexity. Could you implement it without using extra memory?

### 11.Single Number II-Analysis

给了一个数组，这次每个数出现了三次，有一个只有一次，找到这个数

两个方法：

1. 统计32位的个数，最后模3 剩下的位组成的数，自然就是这个数，需要额外空间

2. 用两个变量来存储当前出现了1次、2次、3次的位，最后输出出现了1次的位的变量，就是这个数。

这次使用方法二来完成，不需要额外空间，而且只需要遍历一次。

难点主要在于怎么用遍历存储当前出现了1次2次3次的位的问题上

首先说三次是怎么得到的：出现了三次的位自然就是one上面出现的位+two上面出现的位，其结果是出现了三次的位，所以有：
	
	three=two&one 二者与运算后留下的位就是出现了三次的位
	在这里发现three这个值会一直变，而没有保存之前出现了三次的位，原因就在于出现了三次的位，是我们题目中所不需要的，本来就是出现了三次之后就置为0
	所以 三次存在的目的，完全是为了去掉二次和一次中出现三次的位而已

再说出现两次的位是怎么得到的,首先当前出现两次的位，肯定是出现了一次的位+当前这个数的位 重合的部分 再加上老两次的位=新两次的位

	tow=two|(one&nums[i]);

最后是一次的位是怎么得到的，出现一次的位就等于当前的数和一次的位取异或，所得到的1表示，二者不相同（只出现了一次），0则是表示二者相同(出现了两次，留给two去解决)
	
	one=one^nums[i];

而然做完了这些还不行，因为只是计算了出现了这么多次数的，但是当计算完三次的时候，并没有把出现两次和出现一次中出现三次的位给置0，所以还需要一个清0的动作

	one=one&(~three)
	two=two&(~three)

再说一下这里的计算顺序的问题，三次的计算顺序和清零的计算肯定都是放在后面的。主要就是先计算一次还是计算两次。可以发现必须要先二次后一次，理由如下

	新二次中使用了一次，如果这个一次是新一次，那么 二次=新一次&当前值 （由于新一次和nums[i]求了异或，这里再用与就会丢失老一次的内容）
	所以新二次先计算，然后再是新一次

也有看到这样计算的：（本质上思路是一样的）

	//一定是出现3次，2次，1次这样的顺序，如果反过来的话，先更新了one的话，会影响到two和three的
	three =  two & A[i];//已经出现了两次，还出现了一次
	two = two | one & A[i];//出现了1次又出现了1次，在加上以前已经出现了2次的，为新的出现了2次的            
	one = one | A[i];//出现了1次
	//将出现3次的其出现1次2次全部抹去
	one = one & ~three;
	two = two & ~three;

或者这样的

	int singleNumber(int a[], int len){ 
	     int one = 0;
	     int two = 0;
	     int remain;
	     for(int i = 0; i < len; ++i){
	            remain = a[i] & ~two;
	            two &= ~a[i];
	            two |= one & remain;
	            one ^=remain;
	     }
	     return one; 
	} 

这种方法更精炼了一下，之前都是在统计某一位出现了三次的情况，而这个就更简洁

    public int singleNumber(int[] A) {
        int zeros=0, ones=0;
        for (int i=0; i<A.length; i++){  // 00 -> 01 -> 10 -> 00
            zeros = (zeros^A[i]) & ~ones;  // if bit1 is 1 we should put bit0 as 0, otherwise just count
            ones = (ones^A[i]) & ~zeros;  // if bit0 is 1 we should put bit1 as 0, otherwise just count
        }
        return ones|zeros;
    }

假设连续输入三个3(0011) 发现zero和ones最后都清零恢复到了最初的状态，而如果这个值只出现了一次那么zero中的值就是目标值，如果这个值出现了两次，那么ones中的值就是这个值

	zeros  0   0^0011&1111=0011  0011^0011&1111=0  0^0011&1100=0 
	ones   0   0^0011&1100=0     0^0011&1111=0011  0011^0011&1111=0

也就是说这个式子有一个非常巧妙地地方，在于他会把输入的值按照位的规律依次存储在zero和one中，出现了一次就存在zero中，两次就存在one中，出现三次的时候，二者都会清零。

如果要统计有一个数出现了2次或者是出现了1次 都可以用这个来统计返回。而且可以随着数字出现的次数来扩展。 他利用的特性就是一个数异或其自身两次以后就等于其自身的原理（事实上这个原理是在Single Number中出现的原理，把这个看似只能两个数来用的原理扩展到了三个数种，甚至还可以扩展到更多的数种，按照推断，这个解才是真正的leetcode想要我们给出的解，SingleNumber应该就是用来教会你如何使用异或的）

同时还发现了一个特性： A XOR B = (A+B)%进制 这样的话以后计算加法的时候其实可以直接这个来表示，而且可以保证不会越界的问题

### 11.Single Number II-Solution-C/C++

	class Solution 
	{
	public:
	    int singleNumber(vector<int>& nums) 
	    {
	        int i=0,one=0,two=0,three=0;
	        for(i=0;i<nums.size();i++)
	        {
	            two=two|(one&nums[i]);
	            one=one^nums[i];
	            three=two&one;
	            two=two&(~three);
	            one=one&(~three);
	        }
	        return one;
	    }
	};

### 11.Single Number II-Solution-Python

	class Solution(object):
	    def singleNumber(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: int
	        """
	        zero=0
	        one=0
	        for i in range(len(nums)):
	            zero=zero^nums[i]&~one
	            one=one^nums[i]&~zero
	        return zero|one

## 12.Unique Binary Search Trees

Given n, how many structurally unique BST's (binary search trees) that store values 1...n?

For example,

Given n = 3, there are a total of 5 unique BST's.

	   1         3     3      2      1
	    \       /     /      / \      \
	     3     2     1      1   3      2
	    /     /       \                 \
	   2     1         2                 3

### 12.Unique Binary Search Trees-Analysis

给一个n 返回n个节点可以组成多少种不同结构的搜索树（二叉树）。

不论是二叉树还是搜索树其结果都是一样的。

而二叉树的节点和对应的树的种类等于

	C(2*n,n)/(n+1)=2n!/(n!*n!*(n+1))=(2n*(2n-1)*(2n-2)*(2n-3)...n+2)/(1*2*3*4*5*6...n)  

求这个表达式的值，但是当n=10的时候就出现了int类型越界的问题，导致后面答案完全不对，所以得想办法能除的情况下赶紧除了

	class Solution 
	{
	public:
	    int numTrees(int n)
	    {
	        int i=0,p1=1,p2=1;
	        
	        for(i=1;i<=2*n;i++)
	        {
	            if(i>n+1)
	                p1*=i;
	            if(i<n+1)
	                p2*=i;
	        }
	        return p1/p2;                                           
	    }
	};  

能整除的情况下先整除了，然后这个也只能做到n=17的时候就又越界了，经过测试leetcode要求能算到19.达到int的极限位，所以修改为long类型之后，通过了

	class Solution 
	{
	public:
	    int numTrees(int n)
	    {
	        long i=0,p1=1,p2=1;
	        
	        for(i=1;i<=n;i++)
	        {
	            p2*=i;
	            if(i>=2)
	                p1*=n+i;
	            if(p1%p2==0)
	            {
	                p1=p1/p2;
	                p2=1;
	            }
	                
	        }
	        return p1/p2;                                           
	    }
	};

当然其实这么做有一些赖皮的嫌疑，毕竟是以知道表达式直接计算，而不是自己一步一步推导出来的

首先集合为空时，只有一种树，空树 

	f0=1

如果只有一个节点，只有一种树 

	f1=1

如果有两个节点的时候，选择其中一个节点为根节点，另外一个节点就相当于只有一个节点时的情况，一共有两种根节点的选法，所以：

	f2=根0*f1+根1*f1=2

如果有三个节点，就是有三种根节点的选择，同时，每当你选择了一个根节点，那么其对应的就有左右子树，其左右子树，又可以当成下一个根节点来对待 
	
	f3=左子树为0*右子树为2+左子树为1*右子树为1+左子树为2*右子树为0 这样的情况总和就是3个节点的总和情况了
	
	f3=f0*f2+f1*f1+f2*f0=f2+f1*f1+f2=2+1+2=5

推而广之，当有n个节点的时候：

	fn=f0*fn-1 + f1*fn-2 + f2*fn-3...fn-1*f0  

这样得到了递推式，之后计算一下递推式的总和就等于 

	C(2*n,n)/(n+1)=C(n,2n)-C(n-1,2n)
	
	h(n)= h(0)*h(n-1)+h(1)*h(n-2) + ... + h(n-1)h(0) (n>=2)
	
这个是catalan数，满足其递推式，所以节点对应树个数的解为catalan数

最后得到的表达式为

	C(2*n,n)/(n+1)=C(n,2n)-C(n-1,2n)=(2n*(2n-1)*(2n-2)*(2n-3)...n+2)/(1*2*3*4*5*6...n)  

### 12.Unique Binary Search Trees-Solution-C/C++

	class Solution 
	{
	public:
	    int numTrees(int n)
	    {
	        long i=0,p1=1,p2=1;
	        
	        for(i=1;i<=n;i++)
	        {
	            p2*=i;
	            if(i>=2)
	                p1*=n+i;
	            if(p1%p2==0)
	            {
	                p1=p1/p2;
	                p2=1;
	            }
	                
	        }
	        return p1/p2;                                           
	    }
	};

### 12.Unique Binary Search Trees-Solution-Python

	class Solution(object):
	    def numTrees(self, n):
	        """
	        :type n: int
	        :rtype: int
	        """
	        p1=1
	        p2=1
	        for i in range(1,n+1):
	            p2*=i
	            if i>=2:
	                p1*=n+i
	            if p1%p2==0:
	                p1=p1/p2
	                p2=1
	        return p1/p2

## Quote

> http://www.cnblogs.com/zsboy/p/3889499.html
> http://www.tuicool.com/articles/2uUJJbI
> http://www.1point3acres.com/bbs/thread-111563-1-1.html
> http://www.cnblogs.com/ShaneZhang/p/4102581.html
> http://blog.csdn.net/lanxu_yy/article/details/17504837
> http://www.2cto.com/kf/201312/262420.html
