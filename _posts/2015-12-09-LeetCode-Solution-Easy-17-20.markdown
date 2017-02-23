---
layout:     post
title:      "LeetCode Solution(Easy.17-20)"
subtitle:   "c/c++，python，for work"
date:       2015-12-9
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - LeetCode
---


## 17.Ugly Number

Write a program to check whether a given number is an ugly number.

Ugly numbers are positive numbers whose prime factors only include 2, 3, 5. For example, 6, 8 are ugly while 14 is not ugly since it includes another prime factor 7.

Note that 1 is typically treated as an ugly number.

#### Analysis

就是分解质因数，如果其质因子只包括2，3，5 那么就是丑数，否则就不是 而1是丑数

如果这个数可以直接整除235 然后判读一次是否可以继续整除，如果还可以 再判读， 直到剩下1或者是剩下的不可整除，就结束了

#### Solution-C/C++

```c
bool isUgly(int num)
{
    if(num==0)
        return false;
    //int temp=0;
    while(1)
    {
        if(num==1)
            return true;
        if(num%2==0)
        {
            num=num/2;
            continue;
        }
        if(num%3==0)
        {
            num=num/3;
            continue;
        }
        if(num%5==0)
        {
            num=num/5;
            continue;
        }
        else
            return false;
    }
}
```

#### Solution-Python

```
class Solution(object):
    def isUgly(self, num):
        """
        :type num: int
        :rtype: bool
        """
        if num==0:
            return False
        while(1):
            if num==1:
                return True
            if num%2==0:
                num=num/2
                continue
            if num%3==0:
                num=num/3
                continue
            if num%5==0:
                num=num/5
                continue
            else:
                return False
```

## 18.Happy Number

Write an algorithm to determine if a number is "happy".

A happy number is a number defined by the following process: Starting with any positive integer, replace the number by the sum of the squares of its digits, and repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1. Those numbers for which this process ends in 1 are happy numbers.

Example: 19 is a happy number

	1^2 + 9^2 = 82
	8^2 + 2^2 = 68
	6^2 + 8^2 = 100
	1^2 + 0^2 + 0^2 = 1

#### Analysis

先要分解n 得到每位数字，然后再按照这个来做 但题目没说这个数字有多大啊 如果非常大 那就很蛋疼了啊

也有办法 每次分解一个数字 然后平方相加 再去分解 再平方相加 成为一个循环。

然后这个题有一个无限循环的机制，这个需要在程序中预判出。

如果要无限循环，应该不是所有值都能无限的，看看是否能找到有限个循环值

首先这个值应该是个两位数，并且两个的平方和等于其自身 或者等于一个会无限的两位数
（本来想用一个计数器来设置循环次数，发现9999999都无法算出来17 我擦勒）

最后解决办法基本上就是每计算一次所有值，然后记录一次，如果这个值为1就为真，不为1 去记录区寻找是否有相同的

没有相同的就记录一下， 如果查找到了相同的数字 ，那么就是假的

#### Solution-C/C++

```c
bool isHappy(int n)
{
    //先分解n
    int digit=n,sum=0,digit2=0,digit3=0,count=0,i=0;
    int sumlist[30]={0};
    while(1)
    {
        digit=n%10;
        n=n/10;
        sum=digit*digit+sum;
        if(n==0)
        {
            //这个数计算完毕，开始计算下一个数，存储sum
            n=sum;
            if(sum==1)
            	return true;
            sum=0;
			//检索是否有重复的结果
            for(i=0;i<count+1;i++)
                if(n==sumlist[i])
                    return false;
			//当前结果加入检索
            sumlist[count++]=n;
        }
    }
    return false;
}
```

#### Solution-Python

python的代码相对简单了一些，因为有set的存在 直接判断是否存在就很容易

```python
class Solution(object):
    def isHappy(self, n):
        """
        :type n: int
        :rtype: bool
        """
        sum=0
        s=set()
        while 1:
            digit=n%10
            n=n/10
            sum=sum+digit*digit
            if n==0:
                if sum==1:
                    return True
                n=sum
                sum=0
                if(n in s ):
                    return False
                else:
                    s.add(n)
```

## 19.Implement Queue using Stacks

Implement the following operations of a queue using stacks.

- push(x) -- Push element x to the back of queue.
- pop() -- Removes the element from in front of queue.
- peek() -- Get the front element.
- empty() -- Return whether the queue is empty.


Notes:
You must use only standard operations of a stack -- which means only push to top, peek/pop from top, size, and is empty operations are valid.
Depending on your language, stack may not be supported natively. You may simulate a stack by using a list or deque (double-ended queue), as long as you use only standard operations of a stack.
You may assume that all operations are valid (for example, no pop or peek operations will be called on an empty queue).

#### Analysis

使用栈来实现队列，所以用C++来写，而不用c，发现leetcode上c和c++要求还不一样，多了好几个函数

队列是先进先出，栈是先进后出，那要如何做到这个呢

首先得想到如果只用一个栈，那么要peek的时候就需要把剩下元素全都临时弹出去 然后拿到最底部的那个才能返回

如果在这个时候还需要添加或者删除队尾元素 就很麻烦，所以需要一个栈来存储剩下的元素。让两个栈来回切换存储就可以了。

#### Solution-C/C++

```cpp
	class Queue 
	{
	public:
	    stack<int> in;
	    stack<int> out;
	    // Push element x to the back of queue.
	    void move(void)
	    {
	        while(!in.empty())
	        {
	            out.push(in.top());
	            in.pop();
	        }
	    }
	    void push(int x) 
	    {
	        in.push(x);
	    }
	
	    // Removes the element from in front of queue.
	    void pop(void)
	    {
	        if(out.empty())
	            move();//把in中内容移动到out中
	        out.pop();//得到第一个元素
	        
	    }
	
	    // Get the front element.
	    int peek(void)
	    {
	        if(out.empty())
	            move();//把in中内容移动到out中
	        return out.top();//得到第一个元素
	    }
	
	    // Return whether the queue is empty.
	    bool empty(void)
	    {
	        if(in.empty()&&out.empty())
	            return true;
	        else
	            return false;
	    }
	};
```

2017年2月21日 13:53:10 第二次重写,要求也有些不同了

思路更加明确:

1. 首先两个栈,分管输入与输出.
2. push时,全部加入输入栈
3. peek时,由于要拿到最底的数据,如果out中有内容,那么栈顶就是队首,如果out是空的,那么把in栈内容全部压入out中,栈顶就是队首
4. pop时,由于要先返回队首,所以先调用peek保存栈首内容,然后再像上面一样处理两个栈,处理完了以后再pop栈就行了.

```cpp
class MyQueue 
{
private:
    stack<int> in;
	stack<int> out;
public:
    /** Initialize your data structure here. */
    MyQueue() 
    {
        
    }
    
    /** Push element x to the back of queue. */
    void push(int x)
    {
        in.push(x);
    }
    
    /** Removes the element from in front of queue and returns that element. */
    int pop() 
    {
        int temp=peek();
        if(!out.empty())
        {
            out.pop();
        }
        else
        {
            while(!in.empty())
            {
                out.push(in.top());
                in.pop();
            }
            out.pop();
            
        }
        return temp;
    }
    
    /** Get the front element. */
    int peek() 
    {
        if(!out.empty())
        {
            return out.top();
        }
        else
        {
            while(!in.empty())
            {
                out.push(in.top());
                in.pop();
            }
            return out.top();
        }
    }
    
    /** Returns whether the queue is empty. */
    bool empty()
    {
        if(in.empty()&&out.empty())
            return true;
        else
            return false;
    }
};
```

#### Solution-Python

```python
class Queue(object):
    datain=[] #我假装认为这里的list其实是一个栈好了
    dataout=[]
    def __init__(self):
        """
        initialize your data structure here.
        """
        self.datain=[] #我假装认为这里的list其实是一个栈好了
        self.dataout=[]
        
    def move(self):
        """
        :type : nothing
        :rtype: nothing
        """
        while(self.datain!=[]):
            self.dataout.append(self.datain.pop())

    def push(self, x):
        """
        :type x: int
        :rtype: nothing
        """
        self.datain.append(x)
        

    def pop(self):
        """
        :rtype: nothing
        """
        if(self.dataout==[]):
            self.move()
        self.dataout.remove(self.dataout[-1])

    def peek(self):
        """
        :rtype: int
        """
        if(self.dataout==[]):
            self.move()
        return self.dataout[-1] 

    def empty(self):
        """
        :rtype: bool
        """
        if self.datain==[] and self.dataout==[] :
            return True
        else:
            return False
```


## 20.Merge Two Sorted Lists

Merge two sorted linked lists and return it as a new list. The new list should be made by splicing together the nodes of the first two lists.

#### Analysis

合并两个有序链表，没啥难得，就是不知道这个链表是什么顺序排列的 一般应该是由到大吧

然后分别插入就ok了

#### Solution-C/C++

###### 迭代

说白了首先把各种空指针传入的情况给排除掉

然后开始先确定头指针是谁 

然后用pre记录上一节点，l1是在l1链表上的滑动指针，l2是在l2链表上的头指针，通过比较l1与l2的大小，插入值

```c
struct ListNode* mergeTwoLists(struct ListNode* l1, struct ListNode* l2) 
{
    struct ListNode* temp=NULL;
    struct ListNode* head=l1;
    struct ListNode* pre=NULL;
    if(!l1&&!l2)
        return l1;
    if(!l1&&l2)
        return l2;
    if(l1&&!l2)
        return l1;
    //先解决头部问题，头部肯定是最小的值
    if(l2->val<l1->val||l2->val==l1->val)
    {
        if(l2->next)
        {
            temp=l2->next;
            l2->next=l1;
            head=l2;
            pre=head;
            l2=temp;
        }
        else
        {
            l2->next=l1;
            l1=l2;
            return l1;
        }
    }
    else
        pre=l1;
        
    while(1)
    {
        if(l2->val<l1->val||l2->val==l1->val)
        {    
            if(l2->next)
            {
                temp=l2->next;
                l2->next=l1;
                pre->next=l2;
                pre=l2;
                l2=temp;
            }
            else
            {
                l2->next=l1;
                pre->next=l2;
                l1=l2;
                break;
            }
        }
        else
        {
            if(l1->next)
            {
                pre=l1;
                l1=l1->next;
            }
            else
            {
                l1->next=l2;
                break;
            }
        }
    }
    return head;
}
```

2017年2月21日 15:54:17 更简洁的写法.

思路清晰:

1. 首先创建一个pre头指针,保存好融合后的头指针,利用cur来指向当前尾指针
2. 然后依次滑动两个链表,取小值,链入当前指针尾部,被取得链表头指针移动,当前尾指针移动
3. 结束时由于有一个链表提前到尾部,结束循环,那么把剩下的另一个链表整个链接进来

```cpp
class Solution 
{
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) 
    {
        ListNode prehead(INT_MIN);
        ListNode *tail =&prehead;
        
        while (l1 && l2)
        {
            if (l1->val < l2->val) 
            {
                tail->next = l1;
                l1 = l1->next;
            } 
            else 
            {
                tail->next = l2;
                l2 = l2->next;
            }
            tail = tail->next;
        }
        tail->next = l1 ? l1 : l2;
        return prehead.next;
    }
};
```

###### 递归

这个题目无意间看到一个递归的解法，写的非常简单，比上面的代码少多了

想一想递归怎么解呢

结束条件肯定是l1或者是l2为空的时候开始返回，而返回之后需要将当前的尾部和上一个值进行连接

连接的时候 首先得让小的值来当作头节点，然后移动具有头部节点的列表的当前指针，和另一个列表 进行下一次比较返回一个较小的值

继续把较小的值作为头部，再去寻找下一个较小的值，直到某一方为空，当为空时返回对方的值，然后将返回值连接到当前较小的值中去

从而达成了递归

```cpp
struct ListNode* mergeTwoLists(struct ListNode* l1, struct ListNode* l2) 
{
    if (l1 == NULL) return l2;
    if (l2 == NULL) return l1;
    
    struct ListNode *ret = NULL;
    
    if (l1->val < l2->val)
    {
        ret = l1;
        ret->next = mergeTwoLists(l1->next, l2);
    }
    else
    {
        ret = l2;
        ret->next = mergeTwoLists(l1, l2->next);
    }
    
    return ret;
}
```

#### Solution-Python

###### 迭代
	
把之前c迭代部分稍微改了改，去掉了一些冗余判断

```python
class Solution(object):
    def mergeTwoLists(self, l1, l2):
        """
        :type l1: ListNode
        :type l2: ListNode
        :rtype: ListNode
        """
        #排除空节点情况
        if(not l1):
            return l2
        if(not l2):
            return l1
        #确定头和上一节点
        if (l2.val<l1.val or l2.val==l1.val):
            if l2.next:#如果l2的下一个节点还存在，顺移l2，修改头和上一节点
                temp=l2.next
                l2.next=l1
                head=l2
                pre=l2
                l2=temp
            else:#如果l2的下一节点不存在了，l2直接接到l1的前面就可以了 返回l2
                l2.next=l1
                return l2
        else:
            head=l1
            pre=l1
            
        while True:
            if (l2.val<l1.val or l2.val==l1.val):
                if l2.next:#如果l2的下一个节点还存在，顺移l2，修改上一节点
                    temp=l2.next
                    l2.next=l1
                    pre.next=l2
                    pre=l2
                    l2=temp
                else:#如果l2的下一节点不存在了，l2直接接到l1的前面就可以了 返回l2
                    l2.next=l1
                    pre.next=l2
                    return head
            else:
                if l1.next:
                    pre=l1
                    l1=l1.next
                else:
                    l1.next=l2
                    break;
            
        return head
```

2017年2月23日 19:00:37 

```python
class Solution(object):
    def mergeTwoLists(self, l1, l2):
        """
        :type l1: ListNode
        :type l2: ListNode
        :rtype: ListNode
        """
        head=ListNode(1)
        cur=head
        while l1 and l2:
            if l1.val<l2.val:
                cur.next=l1;
                l1=l1.next
            else:
                cur.next=l2;
                l2=l2.next
            cur=cur.next
        cur.next=l1 or l2
        return head.next
```

###### 递归

```python
class Solution(object):
    def mergeTwoLists(self, l1, l2):
        """
        :type l1: ListNode
        :type l2: ListNode
        :rtype: ListNode
        """
        if l1==None:
            return l2
        if l2==None:
            return l1
        if l1.val<l2.val:
            ret=l1
            ret.next=self.mergeTwoLists(l1.next, l2)
        else:
            ret=l2
            ret.next=self.mergeTwoLists(l1, l2.next)
        return ret
```

发现还能优化一下上面的代码

```python
class Solution(object):
    def mergeTwoLists(self, l1, l2):
        """
        :type l1: ListNode
        :type l2: ListNode
        :rtype: ListNode
        """
        if not l1 or not l2:
            return l1 or l2
        if l1.val < l2.val:
            l1.next = self.mergeTwoLists(l1.next, l2)
            return l1
        else:
            l2.next = self.mergeTwoLists(l1, l2.next)
            return l2
```

这样递归思路就是:找到两个链表的尾部,然后开始链接,最后返回的自然就是链表头了.


## Quote

> http://blog.csdn.net/business122/article/details/7541486
> 
> http://blog.csdn.net/sunao2002002/article/details/46793425



