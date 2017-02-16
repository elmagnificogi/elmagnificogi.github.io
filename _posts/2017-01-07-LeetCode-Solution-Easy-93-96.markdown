---
layout:     post
title:      "LeetCode Solution(Easy.93-96)"
subtitle:   "c/c++，python，for work"
date:       2017-01-07
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---

## 93.Number Complement

Given a positive integer, output its complement number. The complement strategy is to flip the bits of its binary representation.

Note:

The given integer is guaranteed to fit within the range of a 32-bit signed integer.
You could assume no leading zero bit in the integer’s binary representation.

Example 1:

	Input: 5
	Output: 2
	
	Explanation: The binary representation of 5 is 101 (no leading zero bits), and its complement is 010. So you need to output 2.

Example 2:

	Input: 1
	Output: 0
	
	Explanation: The binary representation of 1 is 1 (no leading zero bits), and its complement is 0. So you need to output 0.

### 93.Number Complement-Analysis

给出非负数的补码,由于不存在前导0位,所以需要把第一个1之前的0都不动,从第一个1之后才开始翻转.

### 93.Number Complement-Solution-C/C++

```cpp

class Solution 
{
public:
    int findComplement(int num) 
    {
        int flag=0;
        for(int i=31;i>=0;i--)
        {
            if(flag==0)
            {
                if((1<<i)&num)
                {
                    num=(~(1<<i))&num;
                    flag=1;
                    cout<<i;
                }
            }
            else
            {
                if((1<<i)&num)
                {
                    num=(~(1<<i))&num;
                }
                else
                {
                    num=((1<<i))|num;
                }
            }
        }
        return num;
    }
};

```

### 93.Number Complement-Solution-Python

python是参考了一个3行的c++解法,简单说就是从高位往低位查找第一个为1的数字,其恰好形成了一个掩码

然后对输入值取反 然后 掩码取反屏蔽其高位的0即可.

```python

class Solution(object):
    def findComplement(self, num):
        """
        :type num: int
        :rtype: int
        """
        mask=~0
        for i in range(0,32):
            if (num & mask)!=0:
                mask=mask<<1
            else:
                break;
        return ~num & ~mask

```
	
## 94.Keyboard Row

Given a List of words, return the words that can be typed using letters of alphabet on only one row's of American keyboard like the image below.


American keyboard

[](!https://leetcode.com/static/images/problemset/keyboard.png)

Example 1:

	Input: ["Hello", "Alaska", "Dad", "Peace"]
	Output: ["Alaska", "Dad"]

Note:

1. You may use one character in the keyboard more than once.
2. You may assume the input string will only contain letters of alphabet.


### 94.Keyboard Row-Analysis

检测输入的单词是否能被键盘中的一行字母拼写.

建立好每一行的表,对应单词依次查询即可.找不到说明不可以,找到了说明可以.

### 94.Keyboard Row-Solution-C/C++

```cpp

class Solution 
{
public:
    
    int findchar(char t)
    {
        char s[3][10]={
        {'q','w','e','r','t','y','u','i','o','p'},
        {'a','s','d','f','g','h','j','k','l','l'},
        {'z','x','c','v','b','n','m','m','m','m'}
        };
        if(t<97)
            t+=32;
        for(int i=0;i<3;i++)
        {
            for(int j=0;j<10;j++)
            {
                if(t==s[i][j])
                    return i;
            }
        }
        return 0;
        
    }
    vector<string> findWords(vector<string>& words) 
    {
        vector<string> re;
        int line=0,flag=0;
        
        for(int i=0;i<words.size();i++)
        {
            line=findchar(words[i][0]);
            for(int j=1;j<words[i].size();j++)
            {
                if(findchar(words[i][j])!=line)
                {
                    flag=1;
                    break;
                }
            }
            if(flag==1)
            {
                flag=0;
                continue;
            }
            else
                re.push_back(words[i]);
            flag=0;
        }
        return re;
    }
};

```

### 94.Keyboard Row-Solution-Python

```python

class Solution(object):
    def findWords(self, words):
        """
        :type words: List[str]
        :rtype: List[str]
        """
        line1,line2,line3=set('qwertyuiop'),set('asdfghjkl'),set('zxcvbnm')
        re=[]
        for word in words:
            w=set(word.lower())
            if w.issubset(line1) or w.issubset(line2) or w.issubset(line3):
                re.append(word)
        return re

```

这里python相当简单,利用了自带的set,元素集合,直接将对应的word转化为字母集,然后判断是不是第1,2,3行的子集即可

## 95.Next Greater Element I

You are given two arrays (without duplicates) nums1 and nums2 where nums1’s elements are subset of nums2. Find all the next greater numbers for nums1's elements in the corresponding places of nums2.

The Next Greater Number of a number x in nums1 is the first greater number to its right in nums2. If it does not exist, output -1 for this number.

Example 1:

	Input: nums1 = [4,1,2], nums2 = [1,3,4,2].
	Output: [-1,3,-1]
	Explanation:
	    For number 4 in the first array, you cannot find the next greater number for it in the second array, so output -1.
	    For number 1 in the first array, the next greater number for it in the second array is 3.
	    For number 2 in the first array, there is no next greater number for it in the second array, so output -1.

Example 2:

	Input: nums1 = [2,4], nums2 = [1,2,3,4].
	Output: [3,-1]
	Explanation:
	    For number 2 in the first array, the next greater number for it in the second array is 3.
	    For number 4 in the first array, there is no next greater number for it in the second array, so output -1.
Note:

1. All elements in nums1 and nums2 are unique.
2. The length of both nums1 and nums2 would not exceed 1000.

### 95.Next Greater Element I-Analysis

两个集合,其中一个是另外一个的子集,但是全集是有顺序的,求出子集中下一个比他大的数,没有就输出-1,有就输出其数

### 95.Next Greater Element I-Solution-C/C++

```cpp

class Solution 
{
public:
    vector<int> nextGreaterElement(vector<int>& findNums, vector<int>& nums)
    {
        vector<int> re;
        int find=0;
        for(int i=0;i<findNums.size();i++)
        {
            for(int j=0;j<nums.size();j++)
            {
                //find nums
                if(findNums[i]==nums[j])
                {
                    find=1;
                    continue;
                }
                if(find==1&&findNums[i]<nums[j])
                {
                    //cout<<nums[j];
                    re.push_back(nums[j]);
                    find=2;
                    break;
                }
            }
            if(find!=2)
            {
                re.push_back(-1);
            }
            find=0;
        }
        return re;
    }
};

```

### 95.Next Greater Element I-Solution-Python

```python

class Solution(object):
    def nextGreaterElement(self, findNums, nums):
        """
        :type findNums: List[int]
        :type nums: List[int]
        :rtype: List[int]
        """
        find=0
        re=[]
        for i in range(len(findNums)):
            for j in range(len(nums)):
                if findNums[i]==nums[j]:
                    find=1
                    continue
                if find==1 and findNums[i]<nums[j]:
                    find=2
                    re.append(nums[j])
                    break
            if find!=2:
                re.append(-1)
            find=0
        return re

```

## 96.Max Consecutive Ones

Given a binary array, find the maximum number of consecutive 1s in this array.

Example 1:

	Input: [1,1,0,1,1,1]
	Output: 3
	Explanation: The first two digits or the last three digits are consecutive 1s.
	    The maximum number of consecutive 1s is 3.

Note:

1. The input array will only contain 0 and 1.
2. The length of input array is a positive integer and will not exceed 10,000

### 96.Max Consecutive Ones-Analysis

寻找最大连续段落,返回最大连续数

### 96.Max Consecutive Ones-Solution-C/C++

```cpp

class Solution 
{
public:
    int findMaxConsecutiveOnes(vector<int>& nums)
    {
        int max=0,cur=0;
        for(int i=0;i<nums.size();i++)
        {
            if(nums[i]==1)
                cur++;
            else
            {
                if(cur>max)
                    max=cur;
                cur=0;
            }
        }
        return max>cur?max:cur;
    }
};

```

### 96.Max Consecutive Ones-Solution-Python

```python

class Solution(object):
    def findMaxConsecutiveOnes(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        max=0
        cur=0
        for i in range(len(nums)):
            if nums[i]==1:
                cur+=1
            else:
                if cur>max:
                    max=cur
                cur=0
        if cur>max:
            max=cur
        return max

```

## Quote

> https://leetcode.com/problems/keyboard-row/?tab=Solutions