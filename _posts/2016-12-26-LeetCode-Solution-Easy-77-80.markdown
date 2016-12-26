---
layout:     post
title:      "LeetCode Solution(Easy.77-80)"
subtitle:   "c/c++，python，for work"
date:       2016-12-26
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 77.Ransom Note

Given an arbitrary ransom note string and another string containing letters from all the magazines, write a function that will return true if the ransom note can be constructed from the magazines ; otherwise, it will return false.

Each letter in the magazine string can only be used once in your ransom note.

Note:
You may assume that both strings contain only lowercase letters.

	canConstruct("a", "b") -> false
	canConstruct("aa", "ab") -> false
	canConstruct("aa", "aab") -> true

### 77.Ransom Note-Analysis

刚开始没看懂什么意思,以为是判断是否包含子串,实际上是判断magazine是否含有ransom note中对应的字符,数量也要对应.

或者换句话说能否用magazine来组成ransom note 每个字符只能用一次.

其实就是用杂志里的字来拼成一个赎金条的内容.

简单说我只需要统计出来两个字符串各自含有的各字符数量,然后对比就可以了.

### 77.Ransom Note-Solution-C/C++

	class Solution
	{
	public:
	    bool canConstruct(string ransomNote, string magazine) 
	    {
	        //统计字符数量
	        int c[26]={0};
	        for(int i=0;i<magazine.size();i++)
	            c[magazine[i]-'a']++;
	        for(int i=0;i<ransomNote.size();i++)
	        {
	            c[ransomNote[i]-'a']--;
	            if(c[ransomNote[i]-'a']==-1)
	                return false;
	        }
	        return true;
	    }
	};

有一个小点没注意,int c[26];单独测试就可以通过,但如果全部测试就通过不了,会出现未赋值的变量其值不为0的情况.

### 77.Ransom Note-Solution-Python

	class Solution(object):
	    def canConstruct(self, ransomNote, magazine):
	        """
	        :type ransomNote: str
	        :type magazine: str
	        :rtype: bool
	        """
	        ransomCnt = collections.Counter(ransomNote)
	        magazineCnt = collections.Counter(magazine)
	        return not ransomCnt - magazineCnt

利用collections工具中的Counter，对列表中元素出现频率进行排序。Counter返回值是一个按元素出现频率降序排列的Counter对象，其本质是字典,那么用ransomCnt减去magazineCnt 就可以对应清空ransomCnt.如果ransomCnt清空了,那么就说明是真,而且其为空是是假,取反就可以了.

## 78.Minimum Moves to Equal Array Elements

Given a non-empty integer array of size n, find the minimum number of moves required to make all array elements equal, where a move is incrementing n - 1 elements by 1.

Example:

	Input:
	[1,2,3]
	
	Output:
	3
	
	Explanation:
	Only three moves are needed (remember each move increments two elements):
	
	[1,2,3]  =>  [2,3,3]  =>  [3,4,3]  =>  [4,4,4]

### 78.Minimum Moves to Equal Array Elements-Analysis

简单说给一个n个元素的数组,每次给n-1个元素加一,问多少步后可以让所有元素大小相等.

每次都是给数组中最小的n-1个元素加一,直到最后大小相等.

### 78.Minimum Moves to Equal Array Elements-Solution-C/C++

	class Solution 
	{
	public:
	    int minMoves(vector<int>& nums)
	    {
	        int sum=0,max=0,min=0x7fffffff,cha=0;
	        for(int i=0;i<=0x7fffffff;i)
	        {
	            sort(nums.begin(),nums.end());
	            if(nums[0]==nums[nums.size()-1])
	                return i;
	            cha=nums[nums.size()-1]-nums[0];
	            for(int j=0;j<nums.size()-1;j++)
	                nums[j]+=cha;
	            i=i+cha;
	        }
	        return 1;
	    }
	};

首先这样的方法肯定是能完成目的的,但是会超时,因为这么算太慢了.每次都需要排序,这里注意到最重要的是最小与最大的差,每次得步数都是基于此的.由此我们每次得到最大最小值就可以了完全不用排序. 就可以得到下面的代码.

	class Solution 
	{
	public:
	    int minMoves(vector<int>& nums)
	    {
	        int sum=0,max=0x80000000,min=0x7fffffff,cha=0,maxi=0,mini=0;
	        for(int i=0;i<=0x7fffffff;i)
	        {
	            for(int x=0;x<nums.size();x++)
	            {
	                if(nums[x]>max)
	                {
	                    max=nums[x];
	                    maxi=x;
	                }
	                if(nums[x]<min)
	                {
	                    mini=x;
	                    min=nums[x];
	                }
	            }
	            if(max==min)
	                return i;
	            cha=max-min;
	            for(int j=0;j<nums.size();j++)
	                if(j!=maxi)
	                    nums[j]+=cha;
	            i=i+cha;
	            min=0x7fffffff;
	            max=0x80000000;
	        }
	        return 1;
	    }
	};

但是呢这样还是太慢了,依然无法得到我们想要的结果,所以呢,还得想办法精简.关键在于最大与最小值的差这里.想办法从这里优化.

n个元素,每次是n-1个元素加一,可以转化为每次都是1个元素减一.

那么所有元素相等,就等价于所有元素等于最小的元素.

那么步数就等于总和-最小值*数字个数.

	class Solution 
	{
	public:
	    int minMoves(vector<int>& nums)
	    {
	        int sum=0,min=0x7fffffff;
	        for(int i=0;i<nums.size();i++)
	        {
	            sum+=nums[i];
	            min=nums[i]<min?nums[i]:min;
	        }
	        return sum-min*nums.size();
	    }
	};

### 78.Minimum Moves to Equal Array Elements-Solution-Python

	class Solution(object):
	    def minMoves(self, nums):
	        """
	        :type nums: List[int]
	        :rtype: int
	        """
	        return sum(nums) - min(nums) * len(nums)	

## 79.Sum of Left Leaves

Find the sum of all left leaves in a given binary tree.

Example:

	    3
	   / \
	  9  20
	    /  \
	   15   7
	
	There are two left leaves in the binary tree, with values 9 and 15 respectively. Return 24.

### 79.Sum of Left Leaves-Analysis

求二叉树的左叶节点.

二叉遍历,如果是左子树,那么就加一,否则不加.

### 79.Sum of Left Leaves-Solution-C/C++
	
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
	    int bianli(TreeNode* root,vector<int> *r,int flag) 
	    {
	        int cnt=0;
	        if(root)
	        {   
	            if(bianli(root->left,r,1))
	            {   
	                if(flag==1&&(!root->right))
	                    r->push_back(root->val);
	            }
	            bianli(root->right,r,0);
	        }
	        else
	        {
	            return 1;
	        }
	        return 0;
	    }   
	    int sumOfLeftLeaves(TreeNode* root) 
	    {
	        vector<int> r;
	        int sum=0;
	        bianli(root,&r,0);
	        for(int i=0;i<r.size();i++)
	            sum+=r[i];
	        return sum;
	    }
	};

### 79.Sum of Left Leaves-Solution-Python

	# Definition for a binary tree node.
	# class TreeNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.left = None
	#         self.right = None
	
	class Solution(object):
	    def isLeaf(self,root):
	        if root.left==None and root.right==None:
	            return True
	        else:
	            return False
	    def sumOfLeftLeaves(self, root):
	        """
	        :type root: TreeNode
	        :rtype: int
	        """
	        r=0
	        if root==None:
	            return 0
	        if root.left and self.isLeaf(root.left):
	            r+=root.left.val
	        r+=self.sumOfLeftLeaves(root.left)+self.sumOfLeftLeaves(root.right)
	        return r

## 80.Intersection of Two Arrays

Given two arrays, write a function to compute their intersection.

Example:
Given nums1 = [1, 2, 2, 1], nums2 = [2, 2], return [2].

Note:
Each element in the result must be unique.
The result can be in any order.

### 80.Intersection of Two Arrays-Analysis

计算两个数组的交集,也就是计算两个集合共有元素,相同元素只计算一次.

最简单的想法就是直接排序,然后依次移动指针判等,然后相等就加入输出队列,不等就移动指针,直到结束.

但这样需要整个排序一下,很耽误时间.

而有现成的集合可以使用的话,会更加方便.

### 80.Intersection of Two Arrays-Solution-C/C++

	class Solution 
	{
	public:
	    vector<int> intersection(vector<int>& nums1, vector<int>& nums2)
	    {
	        set<int> r;
	        vector<int> re;
	        for (auto n: nums1) 
	        {
	            //r中找不到元素nums1[n]
	            if (r.find(n)==r.end())
	                r.insert(n);
	        }
	        for (auto n: nums2) 
	        {
	            //r中若找到元素nums2[n]
	            if (r.find(n)!=r.end()) 
	            {
	                //输出到返回容器中
	                re.push_back(n);
	                //从r中删除对应元素
	                r.erase(n);
	            }
	        }
	        return re;
	    }
	};

### 80.Intersection of Two Arrays-Solution-Python

	class Solution(object):
	    def intersection(self, nums1, nums2):
	        """
	        :type nums1: List[int]
	        :type nums2: List[int]
	        :rtype: List[int]
	        """
	        return list(set(nums2)&set(nums1))

python较为简单,set是其语言自带的容器,所以做起来非常容易

## Quote

> http://bookshadow.com/weblog/2016/08/11/leetcode-ransom-note/
> http://www.jiuzhang.com/solutions/intersection-of-two-arrays/
> http://bookshadow.com/weblog/2016/11/06/leetcode-minimum-moves-to-equal-array-elements/