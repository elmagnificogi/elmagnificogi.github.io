---
layout:     post
title:      "LeetCode Solution(Easy.13-16)"
subtitle:   "c/c++，python，for work"
date:       2015-12-8
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
    - Work
---


## 13.Number of 1 Bits

Write a function that takes an unsigned integer and returns the number of ’1' bits it has (also known as the Hamming weight).

For example, the 32-bit integer ’11' has binary representation 00000000000000000000000000001011, so the function should return 3.

## 13.Number of 1 Bits-analysis

返回位为1的数量，so easy 

看了下面这个链接里五花八门的方法感觉这个世界真大

> http://www.cnblogs.com/graphics/archive/2010/06/21/1752421.html

## 13.Number of 1 Bits-Solution-C/C++

我的普通解法

	int hammingWeight(uint32_t n) 
	{
	    int i=0,sum=0;
	    for(i=0;i<32;i++)
	        sum=sum+((n>>i)&1);
	    return sum;
	}

其实看给的标准函数名是hamming 就应该想到这个是哈明码，用来纠错的，或者说是奇偶校验码

hamming算法

算法思路是什么呢？

其实就是每两个位相加，将之前的一个32位的数，转换为用16位来表示的数，然后把16位的数再次压缩为8位，再压缩到16位，那么这个时候就已经计算出来了32位所具有的1的个数

0x55555555则是用010101为间隔，将32位的中的每两位的1的个数 用两位来表示，而每两位最多具有2个1 所以用两位来表示足够

0x33333333则是用00110011为间隔，将上面的两位表示的1的个数再通过两两组合合并成用四位表示的二进制。

之后都是以此类推最终得到最后的解
	
	例：
	如果n=0xABCDEFAA（1010 1011 1100 1101 1110 1111 1010 1010 ）
	按照算法思路先要把每两位的1的个数统计出来，并且用二进制表示
	那么就需要得到这样的结果
	原数二进制  1010 1011 1100 1101 1110 1111 1010 1010
	   		   0101 0110 1000 1001 1001 1010 0101 0101
	4位压缩	   0010 0011 0010 0011 0011 0100 0010 0010
	8位压缩       0101       0101      0111     0100
    16位压缩           1010                1011
    32位压缩                10101   = 21
	这样就得到了最后的结果21，剩下的问题就集中在于如何把这样的想法用算法实现了
	首先看每两位计算1的个数要怎么做，两位，那就各取一位，然后相加不就可以了吗？
	取位则用&，而每次只取两位中的1位 那么就可以用 01和10分别取高低位，但是这样取来的高位还是在高位上，低位还是在低位上
	我们需要他们在低位的地方相加才行，那要怎么弄？ 
	自然选择用01来获取低位，之后将原数右移1位，丢失了一位低位（但低位已经取过了所以没关系），而原来的高位顺移到了以前的低位的位置上，那么就能得到原来高位的0/1了，然后将二者相加即可得到用两位表示的两位的1的个数
		
	之后就是将上面的两位表示的两位的1的个数两两相加，从而得到用四位表示的四位的1的个数，由于是用四位表示了，可以从中分开分成高两位和低两位 同样的要面对获取高两位和低两位的问题，那么扩展之前的 使用0011来获取，移位时向右移动2位便可以获得低位/高位  
		
	以此类推就能得到 8位的时候应该用 00001111 移动4位 16位的时候是 0000 0000 1111 1111 移动8位 
	最后则是32位的压缩 0000 0000 0000 0000 1111 1111 1111 1111 移动16位 
	由于原数自身是32位的那么 所得到的结果32位的压缩 通过内存编译解释出来的数（1的个数的二进制表示） 自然也就是最后的结果1的个数的 如果原数是64位的 那么最后还需要再进一步 64位的压缩 然后才能得到结果

	int hammingWeight(uint32_t n) 
	{
	    int count = n;
	    int a = 0x55555555; //010101010101010101010101010101 //用于相邻的两位相加
	    int b = 0x33333333; //用于相邻的四位相加
	    int c = 0x0f0f0f0f;
	    int d = 0x00ff00ff;
	    int e = 0x0000ffff;
	    count = (count & a) + ((count>>1) & a);
	    count = (count & b) +((count>>2) & b);
	    count = (count & c) + ((count>>4) & c);
	    count = (count & d) + ((count>>8) & d);
	    count = (count & e) + ((count>>16) & e);
	    return count;
	}

HAKMEM算法 

HAKMEM算法和上面的也有类似的地方 他是使用3位为一组来做的 只是最后需要对63来进行求余 得到的余数就是结果了，但是算法原理跟上面的根本不同！！详见此blog的分析，二进制的数的本质

> http://blog.csdn.net/msquare/article/details/4536388

这里0开头的是八进制

	int hammingWeight(uint32_t n) 
	{
	    unsigned x;     
	    x = (n >> 1) & 033333333333;     
	    n = n - x;    
	    x = (x >> 1) & 033333333333;    
	    n = n - x;     
	    n = (n + (n >> 3)) & 030707070707;    
	    n = n%63;   
	    return n;
	}

## 13.Number of 1 Bits-Python

	class Solution(object):
	    def hammingWeight(self, n):
	        """
	        :type n: int
	        :rtype: int
	        """
	        sum=0
	        for i in range(0,32):
	            sum=((n>>i)&1)+sum
	        return sum

## 14.Roman to Integer

Given a roman numeral, convert it to an integer.

Input is guaranteed to be within the range from 1 to 3999.

## 14.Roman to Integer-analysis

把罗马数字转换为普通数字

首先得知道罗马数字的表示方法

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

这里需要把这个规则转换为数字

- 如果当前处理的字符对应的值和上一个字符一样，那么临时变量加上这个字符。比如III = 3
- 如果当前比前一个大，说明这一段的值应该是当前这个值减去前面记录下的临时变量中的值。比如IIV = 5 – 2
- 如果当前比前一个小，那么就可以先将临时变量的 值加到结果中，然后开始下一段记录。比如VI = 5 + 1

> http://blog.unieagle.net/2012/10/18/leetcode%E9%A2%98%E7%9B%AE%EF%BC%9Aroman-to-integer/

（在他blog看到一个会动的球形tags，并且会根据鼠标移动轨迹来顺着移动好流弊的样子，有空研究一下，扒一个过来）

## 14.Roman to Integer-Solution-C/C++
	
	int flagtoint(char f)
	{
	    if(f=='I')
	        return 1;
	    if(f=='V')
	        return 5;
	    if(f=='X')
	        return 10;
	    if(f=='L')
	        return 50;
	    if(f=='C')
	        return 100;
	    if(f=='D')
	        return 500;
	    if(f=='M')
	        return 1000;        
	}
	int romanToInt(char* s) 
	{
	    int sum=0;
	    int temp=flagtoint(*s);
	    
	    while(*s)
	    {
	        s++;
	        if(flagtoint(*s)==temp)
	        {
	            sum+=temp;
	            temp=flagtoint(*s);
	        }
	        else if(flagtoint(*s)>temp)
	        {
	            sum-=temp;
	            temp=flagtoint(*s);
	        }
	        else
	        {
	            sum+=temp;
	            temp=flagtoint(*s);
	        }
	    }
	    
	    return sum;
	}


## 14.Roman to Integer-Python

	class Solution(object):
	    def flagtoint(self, f):
	        """
	        :type f: str
	        :rtype: int
	        """    
	        if f=='I':
	            return 1
	        if f=='V':
	            return 5   
	        if f=='X':
	            return 10 
	        if f=='L':
	            return 50 
	        if f=='C':
	            return 100
	        if f=='D':
	            return 500
	        if f=='M':
	            return 1000
	    def romanToInt(self, s):
	        """
	        :type s: str
	        :rtype: int
	        """
	        sum=0
	        temp=self.flagtoint(s[0])
	        i=0
	        while i<len(s)-1:
	            i=i+1
	            if self.flagtoint(s[i])==temp:
	                sum=sum+temp
	                temp=self.flagtoint(s[i])
	            elif self.flagtoint(s[i])>temp:
	                sum=sum-temp
	                temp=self.flagtoint(s[i])            
	            else:
	                sum=sum+temp
	                temp=self.flagtoint(s[i])            
	        sum=sum+self.flagtoint(s[-1])     
	        return sum

## 15.Reverse Linked List

Reverse a singly linked list.

click to show more hints.

Hint:
A linked list can be reversed either iteratively or recursively. Could you implement both?

## 15.Reverse Linked List-analysis

用两种方法来翻转单链表，这个练得比较多，easy

首先需要明白 如何翻转 

    null head head->next -> first  first.next -> second second.next -> third third.next -> forth....
     ^    ^                  ^                                                                                  
	 |pre |cur               |next  第一次的时候是这么指向的，要翻转就得改变箭头的方向变成下面这样的
    null<-head.next head <-first.next first  second second.next -> third third.next -> forth forth.next->....
                     ^                 ^        ^                                                                                    
                     |pre              |cur     |next  第二次是这样的 按照这个顺序循环就可以了

如果要用递归，也简单，只需要递归到最后一个next为空的情况下，开始进行翻转就可以了。

## 15.Reverse Linked List-Solution-C/C++

### 迭代

	/**
	 * Definition for singly-linked list.
	 * struct ListNode {
	 *     int val;
	 *     struct ListNode *next;
	 * };
	 */
	struct ListNode* reverseList(struct ListNode* head)
	{
	    struct ListNode*pre=NULL;
	    struct ListNode*cur=head;
	    if(!head||!head->next)
	        return head;
	    struct ListNode*temp=head->next;
	    struct ListNode*next=head->next;
	    while(1)
	    {
	        if(next->next!=NULL)
	          temp=next->next;
	        else
	            temp=NULL;
	        next->next=cur;

	        cur->next=pre;
	        pre=cur;
	        cur=next;
	        if(temp==NULL)
	            break;
	        else
	            next=temp;
	    }
	    return cur;
	}

另外一份 逻辑上更简单明了一些

	/**
	 * Definition for singly-linked list.
	 * struct ListNode {
	 *     int val;
	 *     struct ListNode *next;
	 * };
	 */
	struct ListNode* reverseList(struct ListNode* head)
	{
	    struct ListNode* pre=NULL;
	    struct ListNode* next;
	    while(head)
	    {
	        next=head->next;//next指向head的下一个节点
	        head->next=pre;//当前的head的下一个节点修改为前一个节点
	        pre=head;//前一个节点更替为当前结点
	        head=next;//当前节点更替为下一个节点
	    }
	    return pre;
		/*
		这种方式其实next用来保存下一个节点，pre其实是逆序后的节点头，head则是指向修改节点
		*/
	}

### 递归

	/**
	 * Definition for singly-linked list.
	 * struct ListNode {
	 *     int val;
	 *     struct ListNode *next;
	 * };
	 */
	struct ListNode* reverseList(struct ListNode* head)
	{
	    struct ListNode* temp;
	    if(head==NULL||head->next==NULL)
	    {
	        //开始翻转
	        return head;
	    }
	    else
	    {
	        temp=reverseList(head->next);
	        head->next->next=head;
	        head->next=NULL;
	        return temp;
	    }
	}

## 15.Reverse Linked List-Python

### 递归

	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def reverseList(self, head):
	        """
	        :type head: ListNode
	        :rtype: ListNode
	        """
	        if(head==None or head.next==None ):
	            return head
	        temp=self.reverseList(head.next)
	        head.next.next=head
	        head.next=None
	        return temp

### 迭代

	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def reverseList(self, head):
	        """
	        :type head: ListNode
	        :rtype: ListNode
	        """
	        pre=None
	        cur=head
	        if(head==None or head.next==None ):
	            return head        
	        next=head.next
	        while(cur):
	            cur.next=pre
	            pre=cur
	            cur=next
	            if(next.next!=None):
	                next=next.next
	            else:
	                break
	        cur.next=pre
	        pre=cur
	        return cur

逻辑更好的

	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def reverseList(self, head):
	        """
	        :type head: ListNode
	        :rtype: ListNode
	        """
	        pre=None
	        cur=head
	        while(cur):
	            next=cur.next
	            cur.next=pre
	            pre=cur
	            cur=next
	        return pre

## 16.Remove Duplicates from Sorted List

Given a sorted linked list, delete all duplicates such that each element appear only once.

For example,
Given 1->1->2, return 1->2.
Given 1->1->2->3->3, return 1->2->3.

## 16.Remove Duplicates from Sorted List-analysis

删除有序链表中的重复部分，看起来也很简单啊。

## 16.Remove Duplicates from Sorted List-Solution-C/C++

	/**
	 * Definition for singly-linked list.
	 * struct ListNode {
	 *     int val;
	 *     struct ListNode *next;
	 * };
	 */
	struct ListNode* deleteDuplicates(struct ListNode* head)
	{
	    struct ListNode*pre=NULL;
	    struct ListNode*cur=head;
	    struct ListNode*next;
	    if(head==NULL||head->next==NULL)
	        return head;
	    while(cur)
	    {
	        if(cur->next!=NULL)
	            next=cur->next;
	        else
	            break;
	        if(next->val==cur->val)
	        {
	            if(next->next!=NULL)
	                cur->next=next->next;
	            else
	                {cur->next=NULL;cur=NULL;}
	            continue;
	        }
	        cur=next;
	    }
	    return head;
	}


## 16.Remove Duplicates from Sorted List-Python

python在上面c的基础上，把一些重复的逻辑去掉了，稍微简洁了一些
	
	# Definition for singly-linked list.
	# class ListNode(object):
	#     def __init__(self, x):
	#         self.val = x
	#         self.next = None
	
	class Solution(object):
	    def deleteDuplicates(self, head):
	        """
	        :type head: ListNode
	        :rtype: ListNode
	        """
	        if(head==None or head.next==None):
	            return head
	        cur=head
	        while (cur):
	            if cur.next==None:
	                break;
	            if cur.val==cur.next.val:
	                cur.next=cur.next.next
	            else:
	                cur=cur.next
	        return head

## Quote

> http://iask.sina.com.cn/b/1775817.html
> http://blog.csdn.net/autumn20080101/article/details/7607148



