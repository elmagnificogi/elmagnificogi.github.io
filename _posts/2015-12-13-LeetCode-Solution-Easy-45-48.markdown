---
layout:     post
title:      "LeetCode Solution(Easy.45-48)"
subtitle:   "c/c++，python，for work"
date:       2015-12-13
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
---


## 45.Remove Nth Node From End of List

Given a linked list, remove the nth node from the end of list and return its head.

For example,

	Given linked list: 1->2->3->4->5, and n = 2.
	
	After removing the second node from the end, the linked list becomes 1->2->3->5.

Note:

Given n will always be valid.

Try to do this in one pass.

### 45.Remove Nth Node From End of List-analysis

要求删除倒数第n个元素

而且要求遍历一遍就完成。

有一个小技巧：两个指针，让其中一个先走n步，然后让另外一个指针跟上，同步走，当先走的指针到达队尾的时候，删除当前的指针，连接起来就行了

### 45.Remove Nth Node From End of List-Solution-C/C++

但是有一个麻烦的东西，就是临界值的判断，有可能需要删除的就是头节点，这样删除的节点就没有上一节点 或者是要删除的是尾节点，就没有下一节点。

	/**
	 * Definition for singly-linked list.
	 * struct ListNode {
	 *     int val;
	 *     struct ListNode *next;
	 * };
	 */
	struct ListNode* removeNthFromEnd(struct ListNode* head, int n) 
	{
	    int i=0;
	    if(!head->next)
	        return NULL;
	    
	    struct ListNode* first=head;
	    struct ListNode* second=head;
	    struct ListNode* temp;
	    for(i=0;i<n;i++)
	        if(first->next)
	            first=first->next;
	        else
	        {
	            //得到还几个数到达目的地，然后改变second的位置，返回
	            int j=n-i;
	            while(j--)
	                second=second->next;
	            return second;
	        }
	    while(first)
	    {
	        first=first->next;
	        temp=second;
	        second=second->next;
	    }
	    if(second->next)
	        temp->next=second->next;
	    else
	        temp->next=NULL;
	    return head;
	}

### 45.Remove Nth Node From End of List-Solution-Python

	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def removeNthFromEnd(self, head, n):
	        """
	        :type head: ListNode
	        :type n: int
	        :rtype: ListNode
	        """
	        first=head
	        second=head
	        if not head.next:
	            return None
	        for i in range(n):
	            if first.next:
	                first=first.next
	            else:
	                j=n-i
	                while j:
	                    j=j-1
	                    second=second.next
	                return second
	        while first:
	            first=first.next
	            temp=second
	            second=second.next
	        if second.next:
	            temp.next=second.next
	        else:
	            temp.next=None
	        return head
	            
## 46.Valid Parentheses

Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

The brackets must close in the correct order, "()" and "()[]{}" are all valid but "(]" and "([)]" are not.

### 46.Valid Parentheses-analysis

确定其中的括号是否匹配，也简单，只需要把对应的左括号压入栈中，每遇到一个右括号，就弹出一次，弹出的如果是相同的就ok 不同的话 就表示错误了

### 46.Valid Parentheses-Solution-C/C++

	class Solution 
	{
	public:
	    bool isValid(string s) 
	    {
	        stack<char> store;
	        int i=0;
	        for(i=0;i<s.length();i++)
	        {
	            if(s[i]=='('||s[i]=='['||s[i]=='{')
	                store.push(s[i]);
	                
	            if(s[i]==')')
	                if(!store.empty())
	                    if('('==store.top())
	                        store.pop();
	                    else
	                        return false;
	                else
	                    return false;
	                    
	            if(s[i]==']')
	                if(!store.empty())
	                    if('['==store.top())
	                        store.pop();
	                    else
	                        return false;
	                else
	                    return false;
	            
	            if(s[i]=='}')
	                if(!store.empty())
	                    if('{'==store.top())
	                        store.pop();
	                    else
	                        return false;  
	                else
	                    return false;
	        }
	        if(store.empty())
	            return true;
	        return false;
	    }
	};

### 46.Valid Parentheses-Solution-Python

本来很简单的，弄了老半天就是错，才发现之前一直用的一个函数竟然理解错了

python的list remove 是删除第一个和目标元素相同的元素，是从list头往后删除的，所以就导致我在这里用的时候出错了，应该直接用del来删除的

	class Solution(object):
	    def isValid(self, s):
	        """
	        :type s: str
	        :rtype: bool
	        """
	        store=[]
	        for i in range(len(s)):
	            if(s[i]=='[' or s[i]=='(' or s[i]=='{'):
	                store.append(s[i])
	            if s[i]==']':
	                if (store!=[] and store[-1]=='['):
	                    del store[-1]
	                else:
	                    return False
	            if s[i]=='}':
	                if (store!=[] and store[-1]=='{'):
	                    del store[-1]
	                else:
	                    return False
	            if s[i]==')':
	                if (store!=[] and store[-1]=='('):
	                    del store[-1]
	                else:
	                    return False
	            print(store)
	        
	        if store==[]:
	            return True
	        return False            
                
## 47.Isomorphic Strings

Given two strings s and t, determine if they are isomorphic.

Two strings are isomorphic if the characters in s can be replaced to get t.

All occurrences of a character must be replaced with another character while preserving the order of characters. No two characters may map to the same character but a character may map to itself.

For example,

	Given "egg", "add", return true.
	
	Given "foo", "bar", return false.
	
	Given "paper", "title", return true.

Note:

You may assume both s and t have the same length.

### 47.Isomorphic Strings-analysis

确定两个字符串是同构的，同构的定义是类似 

	*BB，B*B这样的，
	A*A**的这种也可以

由于后一种同构的存在，让这个变得很难啊，但是题目中说到只有一个字母会出现同构

而且二者的长度都是相同的，那么只需要找到一个单词中，多次出现的那个字母，然后和另外一个单词去比较，在相同位置如果都是相同的字母，那么就是同构，否则就不是。

首先找到两个字符串中出现频率最高的，设定为同构的词，然后检索是否在同构词的位置上，二者是否都为同构词，如果有一者不是同构，那么就返回false，到最后返回true

然后写出了下面的代码，然后修掉各种小bug以后，最后一个超级复杂的验证，没通过，然后我去百度了一下，发现我理解错了。

题目中的同构的字母并不是一个的存在，而是多个的存在，说白了这类似一个一对一映射，类似于字符平移的密码，要求一对一对应，否则就无法解出来了。

	bool isIsomorphic(char* s, char* t) 
	{
	    int c[128]={0};
	    int i=0,j=0,max=0;
	    char coms,comt;
	    bool find=false;
	    char *ss=s;
	    char *st=t;
	    for(i=0;i<128;i++)
	        c[i]=0;
	    while(*s)
	    {
	        c[(*s)]++;
	        if(j<c[(*s)])
	        {
	            j=c[(*s)];
	            max=*s;
	        }
	        s++;
	    }
	    //得到出现次数最多的字符，设定为同构的字符
	    coms=max;
	    j=0;
	    for(i=0;i<128;i++)
	        c[i]=0;
	    while(*t)
	    {
	        c[(*t)]++;
	        if(j<c[(*t)])
	        {
	            j=c[(*t)];
	            max=*t;
	        }
	        t++;
	    }    
	    //得到出现次数最多的字符，设定为同构的字符
	    comt=max;
	    printf("%c",coms);
	    printf("%c",comt);
	    while(*ss)
	    {
	        //同构位置不相同时
	        if((*ss==coms&&*st!=comt)||(*ss!=coms&&*st==comt))
	        {   
	            return false;
	        }
	        ss++;
	        st++;
	    }
	    return true;
	}

所以正确的解法就是建立映射，只要出现了某个字母对应多个字符的情况，就返回false否则是true。

当然这样对于 ab cc 这样的建立了 a-c b-c 这样是合法的 但是对于cc来说建立的就是 c-a c-b 就不合法了

所以最后需要对于二者分别进行一次映射确保二者都没有相同元素就可以了。

### 47.Isomorphic Strings-Solution-C/C++

这里利用一个128的数字来做为映射的对应值，s作为index，t作为值， 每次建立映射之前，先判断映射是否存在，然后判断对应的s所对的值是否为t 为t就不管了
不为t的话 就表示映射错误，然后颠倒二者的位置再来一遍就保证了二者都是唯一映射

	bool isIsomorphic(char* s, char* t) 
	{
	    char *ss=s,*tt=t;
	    int sc[128];
	    int i=0;
	    for(i=0;i<128;i++)
	        sc[i]=0;
	    while(*s)
	    {
	        if(sc[*s]==0)
	        {
	            sc[*s]=*t;
	        }
	        else
	        {
	            if(sc[*s]==*t)
	                ;
	            else
	                return false;
	        }
	        s++;
	        t++;
	    }
	    
	    for(i=0;i<128;i++)
	        sc[i]=0;
	    while(*tt)
	    {
	        if(sc[*tt]==0)
	        {
	            sc[*tt]=*ss;
	        }
	        else
	        {
	            if(sc[*tt]==*ss)
	                ;
	            else
	                return false;
	        }
	        ss++;
	        tt++;
	    }    
	    return true;
	}

### 47.Isomorphic Strings-Solution-Python

	class Solution(object):
	    def isIsomorphic(self, s, t):
	        """
	        :type s: str
	        :type t: str
	        :rtype: bool
	        """
	        ss=s
	        tt=t
	        c=dict()
	        for i in range(len(s)):
	            exist=c.get(s[i])
	            if exist==None:
	                c[s[i]]=t[i]
	                continue
	            if exist==t[i]:
	                continue
	            else:
	                return False
	        cc=dict()
	        for i in range(len(ss)):
	            exist=cc.get(tt[i])
	            if exist==None:
	                cc[tt[i]]=ss[i]
	                continue
	            if exist==ss[i]:
	                continue
	            else:
	                return False        
	        return True

## 48.Word Pattern

Given a pattern and a string str, find if str follows the same pattern.

Here follow means a full match, such that there is a bijection between a letter in pattern and a non-empty word in str.

Examples:

	pattern = "abba", str = "dog cat cat dog" should return true.
	pattern = "abba", str = "dog cat cat fish" should return false.
	pattern = "aaaa", str = "dog cat cat dog" should return false.
	pattern = "abba", str = "dog dog dog dog" should return false.

Notes:

You may assume pattern contains only lowercase letters, and str contains lowercase letters separated by a single space.

Credits:

Special thanks to @minglotus6 for adding this problem and creating all test cases.

### 48.Word Pattern-analysis

又一个是对应，只是这次是给定固定模式，检测是否相对应

一样的，建立一个字典，来对应对应的元素，检查一下就知道是否正确了。

和上一题的解法相同，也是正面检查一次，然后反过来再检查一次元素的映射，就可以了。

### 48.Word Pattern-Solution-C/C++

c++是参考别人的方法，首先解决str是用空格为分隔符，istringstream类对象在输出的时候会自动用空格来分行输出

通过依次输出istringstream的对象，就得到了每一个字符

之前是假定二者长度是相等的，但这种字符映射字符串，就不一定是相等的，所以需要检测是否长度相等，不相等就返回false

然后使用map来建立好映射,检查二者的映射是否正确。

	class Solution 
	{
	public:
	    bool wordPattern(string pattern, string str) 
	    {
	        vector<string> dic;
	        istringstream sin(str);
	        string tmp;
	        while (sin >> tmp) dic.push_back(tmp);
	        if (dic.size() != pattern.size()) return false;
	        unordered_map<char, string> mp1;
	        unordered_map<string, char> mp2;
	        for (int i = 0; i < pattern.size(); ++i)
	        {
	            if (mp1.find(pattern[i]) == mp1.end())
	            {
	                //为空
	                mp1[pattern[i]] = dic[i];
	            } 
	            else if (mp1[pattern[i]] != dic[i]) 
	            {
	                return false;
	            }
	            if (mp2.find(dic[i]) == mp2.end())
	            {
	                mp2[dic[i]] = pattern[i];
	            }
	            else if (mp2[dic[i]] != pattern[i])
	            {
	                return false;
	            }
	        }
	        return true;
	    }
	};

### 48.Word Pattern-Solution-Python

先写了python的代码，成功通过了

	class Solution(object):
	    def wordPattern(self, pattern, str):
	        """
	        :type pattern: str
	        :type str: str
	        :rtype: bool
	        """
	        d=0
	        s=''
	        t=''
	        def getword(s,d):
	            """    
	            :rtype: str
	            """
	            for j in range(d,len(str)):
	                if str[j]!=' ':
	                    s=s+str[j]
	                else:
	                    d=d+j+1
	                    return s
	            return s
	        c=dict()
	        for i in range(len(pattern)):
	            exist=c.get(pattern[i])
	            t=getword(s,d)
	            d=d+len(t)+1
	            if exist==None:
	                c[pattern[i]]=t
	                continue
	            if exist==t:
	                continue
	            else:
	                return False
	
	        cc=dict()
	        d=0
	        for i in range(len(pattern)):
	            t=getword(s,d)
	            exist=cc.get(t)
	            d=d+len(t)+1
	            if exist==None:
	                cc[t]=pattern[i]
	                continue
	            if exist==pattern[i]:
	                continue
	            else:
	                return False  
	        d=d-1
	        if d!=len(str):
	            return False
	                
	        return True
	            
	        
	
## Quote

> http://blog.csdn.net/wcyoot/article/details/6426436
> http://www.cnblogs.com/zhengyuxin/articles/1938300.html
> http://www.yiibai.com/python/dictionary_get.html
> http://blog.csdn.net/xiayang05/article/details/5933893
> http://www.cnblogs.com/easonliu/p/4856850.html



