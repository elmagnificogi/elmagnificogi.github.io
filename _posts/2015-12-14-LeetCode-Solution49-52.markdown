---
layout:     post
title:      "LeetCode Solution(Easy.49-52)"
subtitle:   "c/c++，python，for work"
date:       2015-12-14
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
    - Work
---


## 49.Count and Say

The count-and-say sequence is the sequence of integers beginning as follows:

	1, 11, 21, 1211, 111221, ...
	
	1 is read off as "one 1" or 11.
	11 is read off as "two 1s" or 21.
	21 is read off as "one 2, then one 1" or 1211.

Given an integer n, generate the nth sequence.

Note: The sequence of integers will be represented as a string.

### 49.Count and Say-analysis

题意是n=1时输出字符串1；

n=2时，数一下上次字符串中的数值个数，因为上次字符串有1个1，所以输出11；

n=3时，由于上次字符是11，有2个1，所以输出21；

n=4时，由于上次字符串是21，有1个2和1个1，所以输出1211。

n=5时，由于上次字符串是1211，有1个1，1个2和2个1，所以输出111221。

依次类推，写个countAndSay(n)函数返回字符串。

思路：首先给定n=1的时候字符串为1的情况

遍历当前的字符串，然后用一个num记录当前的的数字，一个count记录该数字出现的次数

如果num和当前字符不一样的时候，把num和count转换为string输出到返回值中，继续遍历，直到当前的字符串为空

根据输入的n决定遍历字符串的次数，遍历次数不够就把返回值作为当前的字符串再进行遍历，直到次数够了为止。

### 49.Count and Say-Solution-C/C++

	class Solution 
	{
	public:
	    string countAndSay(int n) 
	    {
	        stringstream ss;
	        string pre="1";
	        string cur="";
	        if(n==1)
	            return pre;
	        int count=0,num=1;
	        string sc="",sn="";
	        int i=0,j=0;
	        for(i=0;i<n-1;i++)
	        {
	            cur="";
	            while(pre[j])
	            {
	                if(num!=pre[j]-48)
	                {
	                    //输出到要输出的地方去
	                    ss<<count<<num;
	                    ss>>sc;
	                    ss>>sn;
	                    cur=cur+sc+sn;
	                    ss.clear();
	                    num=pre[j]-48;
	                    count=1;
	                }
	                else
	                    count++;
	                j++;
	            }
	            j=0;
	            ss<<count<<num;
	            ss>>sc;
	            ss>>sn;
	            cur=cur+sc+sn;
	            pre=cur;
	            num=pre[j++]-48;
	            count=1;
	            ss.clear();
	        }
	        return cur;
	    }
	};

### 49.Count and Say-Solution-Python

	class Solution(object):
	    def countAndSay(self, n):
	        """
	        :type n: int
	        :rtype: str
	        """
	        pre='1'
	        cur=''
	        if n==1:
	            return pre
	        count=0
	        num='1'
	        for i in range(n-1):
	            cur=''
	            for j in range(len(pre)):
	                if pre[j]!=num:
	                    #输出当前num和count到cur
	                    cur=cur+str(count)+num
	                    num=pre[j]
	                    count=1
	                else:
	                    count=count+1
	            cur=cur+str(count)+num
	            pre=cur
	            num=pre[0]
	            count=0
	        return cur
                    
## 50.Remove Linked List Elements

Remove all elements from a linked list of integers that have value val.

Example
	
	Given: 1 --> 2 --> 6 --> 3 --> 4 --> 5 --> 6, val = 6
	Return: 1 --> 2 --> 3 --> 4 --> 5

Credits:

### 50.Remove Linked List Elements-analysis

只是简单的删除其中的目标元素而已

### 50.Remove Linked List Elements-Solution-C/C++

	/**
	 * Definition for singly-linked list.
	 * struct ListNode {
	 *     int val;
	 *     struct ListNode *next;
	 * };
	 */
	struct ListNode* removeElements(struct ListNode* head, int val) 
	{
	    struct ListNode*pre=NULL,*cur=head;
	    if(!head)
	        return head;
	    while(cur)
	    {
	        if(cur->val==val)
	        {
	            if(cur->next)
	            {
	                if(pre==NULL)
	                {
	                    cur=cur->next;
	                    head=cur;
	                }
	                else
	                {
	                    pre->next=cur->next;
	                    cur=cur->next;
	                }
	            }
	            else//cur.next不存在的情况下
	            {
	                if(pre==NULL)
	                {
	                    return NULL;
	                }
	                else//pre却存在
	                {
	                    pre->next=NULL;
	                    return head;
	                }
	            }
	        }
	        else
	        {
	            pre=cur;
	            cur=cur->next;
	        }
	    }
	    return head;
	}

### 50.Remove Linked List Elements-Solution-Python

	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def removeElements(self, head, val):
	        """
	        :type head: ListNode
	        :type val: int
	        :rtype: ListNode
	        """
	        if head==None:
	            return None
	        cur=head
	        pre=None
	        while cur:
	            if cur.val==val:
	                if cur.next==None:
	                    if pre==None:
	                        return None
	                    else:
	                        pre.next=None
	                        return head;
	                else:
	                    if pre==None:
	                        cur=cur.next
	                        head=cur
	                    else:
	                        pre.next=cur.next
	                        cur=cur.next
	            else:
	                pre=cur
	                cur=cur.next
	        return head
        
## 51.Longest Common Prefix

Write a function to find the longest common prefix string amongst an array of strings.

### 51.Longest Common Prefix-analysis

查找字符串最长公共前缀，先比第一第二个找到一个com 然后继续用com往下找，碰到不同的就缩短com

直到结束或者是com为空；

思路：

1. 判空是必须的
2. 找到最短字符串
3. 判断是否存在空串，如果有空串必然没有公共最小串，返回
4. 遍历最短串，与每个串的相同位置进行比较，如果全相同最小串增加其内容，继续下一个，否则直接返回

### 51.Longest Common Prefix-Solution-C/C++

	class Solution 
	{
	public:
	    string longestCommonPrefix(vector<string>& strs) 
	    {
	        if(strs.empty())
	            return "";
	        string com="";
	        char temp;
	        int i=0,j=0,minlen=65535,min;
	        for(i=0;i<strs.size();i++)
	        {
	            if(strs[i]=="")
	                return "";
	            if(strs[i].length()<minlen)
	            {
	                minlen=strs[i].length();
	                min=i;
	            }
	        }
	        for(i=0;i<minlen;i++)
	        {
	            temp=strs[min][i];
	            for(j=0;j<strs.size();j++)
	            {
	                if(temp==strs[j][i])
	                    continue;
	                else
	                    break;
	            }
	            //相等的情况下，说明完成一次全遍历 有公共com
	            if(j==strs.size())
	            {
	                com=com+temp;
	            }
	            else
	            {
	                return com;
	            }
	        }
	        return com;
	    }
	};

### 51.Longest Common Prefix-Solution-Python

又发现了python的一个小问题，for循环的问题，for会在循环的最后先判断条件后对i进行自增 如果条件不成立 那么i是不会自增的，这个就和c c++都不一样了，他们都是循环的最后先自增 然后去判断条件， 无论条件如何 最后的i肯定是增加了 让i与条件相当了，但是python则是会让i小于条件

	class Solution(object):
	    def longestCommonPrefix(self, strs):
	        """
	        :type strs: List[str]
	        :rtype: str
	        """
	        if strs==[]:
	            return ""
	        com=""
	        temp=""
	        minlen=65535
	        for i in range(len(strs)):
	            if strs[i]=="":
	                return ""
	            if len(strs[i])<minlen:
	                minlen=len(strs[i])
	                min=i
	        for i in range(minlen):
	            temp=strs[min][i]
	            for j in range(0,len(strs)):
	                if temp==strs[j][i]:
	                    continue
	                else:
	                    return com
	            if j+1==len(strs):
	                com=com+temp
	            else:
	                return com
	        return com

## 52.Bulls and Cows

You are playing the following Bulls and Cows game with your friend: You write down a number and ask your friend to guess what the number is. Each time your friend makes a guess, you provide a hint that indicates how many digits in said guess match your secret number exactly in both digit and position (called "bulls") and how many digits match the secret number but locate in the wrong position (called "cows"). Your friend will use successive guesses and hints to eventually derive the secret number.

For example:

	Secret number:  "1807"
	Friend's guess: "7810"

Hint: 1 bull and 3 cows. (The bull is 8, the cows are 0, 1 and 7.)

Write a function to return a hint according to the secret number and friend's guess, use A to indicate the bulls and B to indicate the cows. In the above example, your function should return "1A3B".

Please note that both secret number and friend's guess may contain duplicate digits, for example:

	Secret number:  "1123"
	Friend's guess: "0111"

In this case, the 1st 1 in friend's guess is a bull, the 2nd or 3rd 1 is a cow, and your function should return "1A1B".

You may assume that the secret number and your friend's guess only contain digits, and their lengths are always equal.

### 52.Bulls and Cows-analysis

猜数字游戏，如果才对位置和数字 那么这个数字就是公牛，如果只猜对了数字，但是位置不对，那么这个数字就是母牛

写一个函数来返回是公牛还是母牛 公牛用A表示 母牛用B表示

其中会出现重复的数字，但是可以假设二者的数字个数都是相同的

思路：

首先找到相同数字的个数 
（相同数字个数，先统计secret中各数字个数，然后减去guess中各个数字个数，如果为0则不动，最后得到二者的相同数字的个数）

然后找到相同位置的个数=bull

相同数字个数-相同位置个数=cow

### 52.Bulls and Cows-Solution-C/C++

	class Solution 
	{
	public:
	    string getHint(string secret, string guess) 
	    {
	        stringstream ss;
	        int bull=0;
	        int cow=0;
	        int i=0;
	        char num[10];
	        for(i=0;i<10;i++)
	            num[i]=0;
	        for(i=0;i<secret.length();i++)
	        {
	            num[secret[i]-48]++;
	        }
	
	        for(i=0;i<10;i++)
	            cow=num[i]+cow;
	     
	        for(i=0;i<secret.length();i++)
	        {
	            if(num[guess[i]-48]==0)
	                continue;
	            else
	            {
	                num[guess[i]-48]--;
	            }
	        }
	        for(i=0;i<10;i++)
	            bull=num[i]+bull;
	        cow=cow-bull;
	        bull=0;
	        cout<<cow;
	        for(i=0;i<secret.length();i++)
	            if(secret[i]==guess[i])
	                bull++;
	        cow=cow-bull;
	        ss<<bull<<'A'<<cow<<'B';
	        return ss.str();
	    }
	};

### 52.Bulls and Cows-Solution-Python

	class Solution(object):
	    def getHint(self, secret, guess):
	        """
	        :type secret: str
	        :type guess: str
	        :rtype: str
	        """
	        bull=0
	        cow=0
	        num=[0,0,0,0,0,0,0,0,0,0]
	        for i in range(len(secret)):
	            num[ord(secret[i])-48]=num[ord(secret[i])-48]+1
	        for i in range(10):
	            cow=num[i]+cow
	            
	        for i in range(len(secret)):
	            if num[ord(guess[i])-48]==0:
	                continue
	            else:
	                num[ord(guess[i])-48]=num[ord(guess[i])-48]-1
	        for i in range(10):
	            bull=num[i]+bull
	        cow=cow-bull
	        bull=0
	        for i in range(len(secret)):
	            if secret[i]==guess[i]:
	                bull=bull+1
	        cow=cow-bull
	        return str(bull)+'A'+str(cow)+'B'


	
## Quote

> http://blog.csdn.net/hancunai0017/article/details/7032383
> http://www.cnblogs.com/xFreedom/archive/2011/05/16/2048037.html



