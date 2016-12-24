---
layout:     post
title:      "LeetCode Solution(Medium.13-16)"
subtitle:   "c/c++，python，for work"
date:       2015-12-21
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 13.Integer to Roman

Given an integer, convert it to a roman numeral.

Input is guaranteed to be within the range from 1 to 3999.

### 13.Integer to Roman-Analysis

这个是要求把整数转换成罗马数字。和之前的easy系列中的14题是相反的

罗马数字共有七个，即I(1)，V(5)，X(10)，L(50)，C(100)，D(500)，M(1000)。按照下面的规则可以表示任意正整数。

当小符号在大符合旁边时，左减右加，并且左减时不能跨级别 比如99应该=100-1=IC 但由于跨级别了需要用中间量补齐

那就等于 99=100-10+10-1=XCIX

	  I, 1     II, 2      III, 3     IV, 4      V, 5      VI, 6     VII, 7    VIII,8      IX, 9 
	  X, 10    XI, 11     XII, 12    XIII, 13   XIV, 14   XV, 15    XVI, 16   XVII, 17    XVIII, 18
	  XIX, 19  XX, 20     XXI, 21    XXII, 22   XXIX, 29  XXX, 30   XXXIV, 34 XXXV, 35    XXXIX, 39
	  XL, 40   L, 50      LI, 51     LV, 55     LX, 60    LXV, 65   LXXX, 80  XC, 90      XCIII, 93  
	  XCV, 95  XCVIII, 98 XCIX, 99   C, 100     CC, 200   CCC, 300  CD, 400   D, 500      DC,600 
	  DCC, 700 DCCC, 800  CM, 900    CMXCIX,999 M, 1000   MC, 1100  MCD, 1400 MD, 1500    MDC, 1600
	  MDCLXVI, 1666       MDCCCLXXXVIII, 1888   MDCCCXCIX, 1899     MCM, 1900 MCMLXXVI, 1976      
	  MCMLXXXIV, 1984     MCMXC, 1990           MM, 2000            MMMCMXCIX, 3999      

题目要求转换的数字从1-3999，仔细查看其中规律，可以把未知数字拆分成4个数字进行分别表示，同时呢，由于罗马数字的特殊规律：

- 所有4的表示方式都是5-1 50-10 500-100  IV XL CD
- 小于3的表示是用数字重叠的方式 比如 III XXX CCC MMM
- 对于所有的5 是直接表示，用 V L D 分别表示的
- 对于6到8的数字 用的是几加五的表示，VI VII VIII LX LXX LXXX DC DCC DCCC
- 对于9这个数字 用的是 IX XC CM 
- 由于罗马数字中没有0这个数字，所有0的出现，事实上都是直接表示的方式来做的

基于以上的规律，将其改写成返回函数就可以了

理论上下面的不定参数的函数应该没问题了，但是突然发现leetcode不支持不定参数，只好放弃

    string inttoflag(int n,...)
    {
        string ret="";
        int i=0;
        char j[3]={' ',' ',' '};
        //第一个参数为小数字1的表示，第二个参数为中数字5的表示，第三个数字为大数字10的表示
        va_list arg_ptr;
        va_start(arg_ptr, n);
        while( j[i]!= -1 )
        {
            j[i] = va_arg(arg_ptr, char);
            printf("%d ",j );
        }
        va_end(arg_ptr);
        if(n<4)
        {
            if(n==1)
                ret+=j[0];
            else if(n==2)
            {
                ret+=j[0];
                ret+=j[0];
            }
            else if(n==3)
            {
                ret+=j[0];
                ret+=j[0];
                ret+=j[0];
            }
        }
        else if(n==4)
        {
            ret+=j[0];
            ret+=j[1];
        }
        else if(n==5)
        {
            ret+=j[1];
        }
        else if(n<=8)
        {
            if(n==6)
            {    
                ret+=j[1];
                ret+=j[0];
            }
            else if(n==7)
            {
                ret+=j[1];
                ret+=j[0];
                ret+=j[0];
            }
            else
            {
                ret+=j[1];
                ret+=j[0];
                ret+=j[0];
                ret+=j[0];
            }
        }
        else if(n==9)
        {
            ret+=j[0];
            ret+=j[2];
        }
    }

### 13.Integer to Roman-Solution-C/C++

	class Solution {
	public:
	    string inttoflag(int n,char a, char b, char c)
	    {
	        string ret="";
	        int i=0;
	        char j[3];//={' ',' ',' '};
	        //第一个参数为小数字1的表示，第二个参数为中数字5的表示，第三个数字为大数字10的表示
	        j[0]=a;
	        j[1]=b;
	        j[2]=c;
	        if(n<4)
	        {
	            if(n==1)
	                ret+=j[0];
	            else if(n==2)
	            {
	                ret+=j[0];
	                ret+=j[0];
	            }
	            else if(n==3)
	            {
	                ret+=j[0];
	                ret+=j[0];
	                ret+=j[0];
	            }
	        }
	        else if(n==4)
	        {
	            ret+=j[0];
	            ret+=j[1];
	        }
	        else if(n==5)
	        {
	            ret+=j[1];
	        }
	        else if(n<=8)
	        {
	            if(n==6)
	            {    
	                ret+=j[1];
	                ret+=j[0];
	            }
	            else if(n==7)
	            {
	                ret+=j[1];
	                ret+=j[0];
	                ret+=j[0];
	            }
	            else
	            {
	                ret+=j[1];
	                ret+=j[0];
	                ret+=j[0];
	                ret+=j[0];
	            }
	        }
	        else if(n==9)
	        {
	            ret+=j[0];
	            ret+=j[2];
	        }
	        return ret;
	    }
	    string intToRoman(int num)
	    {
	        string ret="";
	        int g=num%10,s=num/10%10,b=num/100%10,q=num/1000;
	        ret+=inttoflag(q,'M',' ',' ');
	        ret+=inttoflag(b,'C','D','M');
	        ret+=inttoflag(s,'X','L','C');
	        ret+=inttoflag(g,'I','V','X');
	        return ret;
	    }
	};

### 13.Integer to Roman-Solution-Python

	class Solution(object):
	    def inttoflag(self,n,a,b,c):
	        ret=""
	        if n==1:
	            ret+=a
	        elif n==2:
	            ret+=a
	            ret+=a
	        elif n==3:
	            ret+=a
	            ret+=a
	            ret+=a
	        elif n==4:
	            ret+=a
	            ret+=b
	        elif n==5:
	            ret+=b
	        elif n==6:
	            ret+=b
	            ret+=a
	        elif n==7:
	            ret+=b
	            ret+=a
	            ret+=a
	        elif n==8:
	            ret+=b
	            ret+=a
	            ret+=a
	            ret+=a
	        elif n==9:
	            ret+=a
	            ret+=c
	        return ret
	    def intToRoman(self, num):
	        """
	        :type num: int
	        :rtype: str
	        """
	        ret=""
	        ret+=self.inttoflag(num/1000,'M'," "," ")
	        ret+=self.inttoflag(num/100%10,'C','D','M')
	        ret+=self.inttoflag(num/10%10,'X','L','C')
	        ret+=self.inttoflag(num%10,'I','V','X')
	        return ret
        
   

## 14.Convert Sorted Array to Binary Search Tree

Given an array where elements are sorted in ascending order, convert it to a height balanced BST.

### 14.Convert Sorted Array to Binary Search Tree-Analysis

给了一个升序的数组，然后把他转化成一个平衡二叉树。

关键点在于要平衡，左小右大，中间节点自然就是中间值，有序的数组，自然从数组中取到最中间的数字做为根节点，然后左右节点分别作为根节点，再从被一份为二的数组中再取中点作为根节点，以此循环下去，直到数组为空，那么就完成了BST的转换，同时高度也是正确的。

建立新节点，然后给左右子树调用自身，建立新的节点，当数组被分割到了无发分割的程度的时候进行返回，返回之前的节点子树，从而穿起来整个BST

### 14.Convert Sorted Array to Binary Search Tree-Solution-C/C++

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
	    TreeNode* sortedarraytovst(vector<int>& nums,int begin,int end) 
	    {
	        if(begin>end)
	            return NULL;
	        int mid=begin+(end-begin)/2;
	        TreeNode* temp=new TreeNode(nums[mid]);
	        temp->left=sortedarraytovst(nums,begin,mid-1);
	        temp->right=sortedarraytovst(nums,mid+1,end);
	        return temp;
	        
	    }
	
	    TreeNode* sortedArrayToBST(vector<int>& nums) 
	    {
	        return sortedarraytovst(nums,0,nums.size()-1);
	    }
	};

### 14.Convert Sorted Array to Binary Search Tree-Solution-Python

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def sortedarraytobst(self,nums,begin,end):
	        if begin>end:
	            return None
	        mid=begin+(end-begin)/2
	        temp=TreeNode(nums[mid])
	        temp.left=self.sortedarraytobst(nums,begin,mid-1)
	        temp.right=self.sortedarraytobst(nums,mid+1,end)
	        return temp
	    def sortedArrayToBST(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: TreeNode
	        """
	        return self.sortedarraytobst(nums,0,len(nums)-1)
	        

## 15.Maximum Subarray

Find the contiguous subarray within an array (containing at least one number) which has the largest sum.

For example, given the array [−2,1,−3,4,−1,2,1,−5,4],

the contiguous subarray [4,−1,2,1] has the largest sum = 6.

More practice:

If you have figured out the O(n) solution, try coding another solution using the divide and conquer approach, which is more subtle.

### 15.Maximum Subarray-Analysis

给定一个数组，返回其部分最大值。

首先这个是一个动态规划的问题，每加一个值都需要考虑之前和之后的值。

观察这个题目是否有什么技巧和突破口。

首先如果当前的总和为负，毫无疑问，他会让后面的总和更小，所以就抛弃当前的总和，重新计算，总和为0；

如果当前的总和为正，那么和取得过的最大总和相比较一下，如果大于最大总和就记录下来，否则总和继续添加下一个数，再去观察。

这样的是O(n)的解法，还有题目中提到的分治思想

这里的分治思想是怎么做呢？

其实也是用二分法，把数组分成左右两部分，分别计算得到左右两部分的最大值，然后将二者相加，从而得到最后的子串最大


### 15.Maximum Subarray-Solution-C/C++
	
	class Solution 
	{
	public:
	    int maxSubArray(vector<int>& nums) 
	    {
	        int sum=nums[0],max=nums[0];
	        for(int i=1;i<nums.size();i++)
	        {
	            if(sum<0)
	                sum=0;
	            sum+=nums[i];
	            max=sum>max?sum:max;
	        }
	        return max;
	    }
	};

### 15.Maximum Subarray-Solution-Python

python是模仿别人的分治思想来写的，但其实这里的分治思想也就是通过二分法，把整个数组不断二分，直到分成一个个为止，然后返回最大值，返回的值会在之后进行一次左右值求最大，然后把最大内容求和之后再次返回，返回前会对比当前的最大值和上次的返回值谁更大，最后返回最大的那一个。（但感觉重复的动作很多，许多都白计算的，而且时间上用时也超过了太多了）

	class Solution(object):
	    def maxsubarray(self, nums,begin,end):
	        if begin==end:
	            return nums[begin]
	        mid=begin+(end-begin)/2
	        maxpre=self.maxsubarray(nums,begin,mid)
	        maxend=self.maxsubarray(nums,mid+1,end)
	        leftmax=-2147483648
	        rightmax=-2147483648
	        sum=0
	        for i in range(mid,begin-1,-1):
	            sum+=nums[i]
	            if sum>leftmax:
	                leftmax=sum
	        sum=0
	        for i in range(mid+1,end+1,1):
	            sum+=nums[i]
	            if sum>rightmax:
	                rightmax=sum
	        sum=leftmax+rightmax
	        return max(sum,max(maxpre,maxend))
	    def maxSubArray(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: int
	        """
	        if len(nums)==0:
	            return 0
	        return self.maxsubarray(nums,0,len(nums)-1)



## 16.Find Minimum in Rotated Sorted Array
        
Suppose a sorted array is rotated at some pivot unknown to you beforehand.

(i.e., 0 1 2 4 5 6 7 might become 4 5 6 7 0 1 2).

Find the minimum element.

You may assume no duplicate exists in the array.

### 16.Find Minimum in Rotated Sorted Array-Analysis

给定一个数组，但是这个数组内容是有序的，但是数组是以环的形式存在的，要求你找到最小的元素，或者说是找到这个环的头。

思路有两个

第一种就是比较找到那个凹点，那么这个点左右都比他大，那么这个点必然是最小的，如果凹点只有左边或者是右边比他大那也是有可能的，这种方法，也只需要遍历一遍就能确定了

第二种方法用二分法来找其中最小值，这里有一个突破口可以利用，首先发现这个数组内容有一定的旋转（旋转一次的情况下，并且保持成环，就能发现，最小值一定是要小于等于数组的末尾的那个数，或者也能说小于等于数组的头，这两个条件利用一个就可以了），以此作为二分搜索的左右移动的标准。

如果mid值小于尾值，说明当前mid在从小到达的有序数列上，所以这时候min只能是这个数或者是往左的数。

如果mid值大于尾值，说明当前的mid是在被旋转的序列上，所以这个时候mid需要往右走，找到正确序列的部分再去找最小值。
（如果用头值判断，也是一样的思路）

### 16.Find Minimum in Rotated Sorted Array-Solution-C/C++

	class Solution 
	{
	public:
	    int findMin(vector<int>& nums) 
	    {
	        int low=0,high=nums.size()-1,mid=low+(high-low)/2;
	        while(low<high)
	        {
	            if(nums[mid]>nums[nums.size()-1])
	            {
	                low=mid+1;
	            }
	            else
	            {
	                high=mid;
	            }
	            mid=low+(high-low)/2;
	        }
	        return nums[mid];
	    }
	};

### 16.Find Minimum in Rotated Sorted Array-Solution-Python

	class Solution(object):
	    def findMin(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: int
	        """
	        low=0
	        high=len(nums)-1
	        mid=low+(high-low)/2
	        while low<high:
	            if nums[mid]<nums[len(nums)-1]:
	                high=mid
	            else:
	                low=mid+1
	            mid=low+(high-low)/2
	        return nums[mid]

### 小总结

进入Medium之后竟然这么多题都用二分法的思想，超乎想象的多，而且二分法也能用在分治的思想之中。

## Quote

> http://www.cnblogs.com/easonliu/p/3654182.html
> http://blog.csdn.net/ljiabin/article/details/39968583
> http://blog.csdn.net/zhuichao001/article/details/7843888
> http://blog.csdn.net/sunbaigui/article/details/8980754
> http://www.tuicool.com/articles/IbiMjaI
> http://www.acmerblog.com/leetcode-solution-maximum-subarray-6334.html