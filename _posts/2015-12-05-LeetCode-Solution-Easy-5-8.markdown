---
layout:     post
title:      "LeetCode Solution(Easy.5-8)"
subtitle:   "c/c++，python，for work"
date:       2015-12-5
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - LeetCode
---


## 5.Move Zeroes

Given an array nums, write a function to move all 0's to the end of it while maintaining the relative order of the non-zero elements.

For example, given nums = [0, 1, 0, 3, 12], after calling your function, nums should be [1, 3, 12, 0, 0].

Note:
You must do this in-place without making a copy of the array.
Minimize the total number of operations.

#### Analysis

空间压缩，并且要求是0的元素到最后去，而非0的元素的顺序不变。

并且不能开辟新空间，只用交换顺序来完成。

思路，先找0值，如果是0那么就找下一个非0值来交换，并且让空位变成0。

要操作数最少，那么需要保存每次找到了非0值的位置，下次依然接着寻找，这样交换的次数是最少的

#### Solution-C/C++

```cpp
void moveZeroes(int* nums, int numsSize)
{
	int i = 0, j = 0;
	for (i = 0; i<numsSize; i++)
		if (nums[i] == 0)
			//寻找下一个非0值，进行交换，0的个数增加
			for (j = i + 1; j<numsSize; j++)
				if (nums[j] != 0)
				{
		nums[i] = nums[j];
		nums[j] = 0;
		break;
				}
}
```

#### Solution-Python

```python	
class Solution(object):
    def moveZeroes(self, nums):
        """
        :type nums: List[int]
        :rtype: void Do not return anything, modify nums in-place instead.
        """
	i = 0
	j = 0
	for i in range(i, len(nums)) :
		if (nums[i] == 0) :
			j = i + 1
			for j in range(j, len(nums)) :
				if (nums[j] != 0) :
					nums[i] = nums[j]
					nums[j] = 0
					break
```

## 6.Same Tree

Given two binary trees, write a function to check if they are equal or not.

Two binary trees are considered equal if they are structurally identical and the nodes have the same value.

#### Analysis

检测两个二叉树是不是相同的子树.

这里认为镜面对称的二叉树是不同子树.

1. 如果相同位置节点都存在且值相等,该位置对称
2. 如果相同位置节点都不存在,对称
3. 非以上两种情况,不对称

#### Solution-C/C++

###### 递归

```cpp
class Solution 
{
public:
    bool isSameTree(TreeNode* p, TreeNode* q)
    {
        if(p&&q&&p->val==q->val)
        {
            return isSameTree(p->left,q->left)&isSameTree(p->right,q->right);
        }
        else if(p==NULL&&q==NULL)
        {
            return true;
        }
        else
            return false;
    }
};
```

如果要判断是否镜像对称,可以在返回的地方加上判断镜像的部分

	//如果加上下面的判断，就是对称相等也算相同
	return isSameTree(p->left,q->left)&isSameTree(p->right,q->right)
	||isSameTree(p->left,q->right)&isSameTree(p->right,q->left);

###### 迭代

用迭代的方法，那么就是简单的左右子树相比较，但是需要一个容器用来存储上一次比较的地方，队列就可以了

```cpp
class Solution 
{
public:
    bool isSameTree(TreeNode* p, TreeNode* q) 
    {
        queue<TreeNode*> ptemp;
        queue<TreeNode*> qtemp;
        while(1)
        {
            if(p==NULL && q==NULL)
            {
                //从队列中获得上一个分支，再进行比较
                //如果分支为空，那么直接返回true
                if(ptemp.empty() && qtemp.empty() )
                    return true;
                else
                {
                    p=ptemp.front();
                    ptemp.pop();
                    q=qtemp.front();
                    qtemp.pop();
                }   
            }
            if((p==NULL && q!=NULL)||(p!=NULL && q==NULL)||(p->val!=q->val))
                return false;

            if(p->left!=NULL&&q->left!=NULL)
            {    
                if(p->right!=NULL&&q->right!=NULL)
                {
                    ptemp.push(p->right);
                    qtemp.push(q->right);      
                    //把分支加入队列  
                }
                else if((p->right==NULL&&q->right!=NULL)||(p->right!=NULL&&q->right==NULL)) 
                    return false;
                p=p->left;
                q=q->left;
            }
            else if((p->left==NULL&&q->left!=NULL)||(p->left!=NULL&&q->left==NULL))
                return false;
            else 
            {
                if((p->right==NULL&&q->right!=NULL)||(p->right!=NULL&&q->right==NULL)) 
                    return false;
                else if(p->right!=NULL&&q->right!=NULL)
                {    
                    p=p->right;
                    q=q->right;
                    continue;
                }
                if(p->right==NULL&&q->right==NULL)
                {
                    if(ptemp.empty() && qtemp.empty() )
                        return true;
                    else
                    {
                        p=ptemp.front();
                        ptemp.pop();
                        q=qtemp.front();
                        qtemp.pop();
                    }

                }
            }
        }      
    }
};
```
2017年2月20日 17:20:00

上面这是第一次写的,判断逻辑太罗嗦了.

其实逻辑应该很简单:

1. 从队列中取出节点,判断是否为空,全为空,继续循环
2. 判断节点是否都存在,都存在情况下是否值相等,都相等,则取出其左右节点放入队列中
3. 不相等的话说明,两树不等,返回false

```cpp
class Solution 
{
public:
    bool isSameTree(TreeNode* p, TreeNode* q)
    {
        //if(!q&&!p)
          // return true;
        queue<TreeNode*> qq;
        queue<TreeNode*> pq;
        qq.push(q);
        pq.push(p);
        while(!qq.empty() && !pq.empty())
        {
            TreeNode* curq=qq.front();
            TreeNode* curp=pq.front();
            qq.pop();
            pq.pop();
            if(curq==NULL&&curp==NULL)
                continue;
            if((curq&&curp)&&(curq->val==curp->val))
            {
                qq.push(curq->left);
                qq.push(curq->right);
                pq.push(curp->left);
                pq.push(curp->right);
                continue;
            }
            else
            {
                return false;
            }
        }
        return true;
    }
};
```

#### Solution-Python

###### 递归

```python
class Solution(object):
    def isSameTree(self, p, q):
        """
        :type p: TreeNode
        :type q: TreeNode
        :rtype: bool
        """
        if not((p and q and p.val==q.val)or(p==None and q==None)):
            return False
        if (p==None and q==None) :
            return True
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)
    //如果加上下面的判断，就是对称相等也算相同
    //or (self.isSameTree(p->left,q->right) and self.isSameTree(p->right,q->left))
```

才发现，python的class中递归自身需要前置self，不然就会提示没找到

2017年2月20日 17:30:34 第二遍写

```python
class Solution(object):
    def isSameTree(self, p, q):
        """
        :type p: TreeNode
        :type q: TreeNode
        :rtype: bool
        """
        if (p and q and p.val==q.val):
            return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)
        elif(p==None and q==None):
            return True;
        else:
            return False;
```

###### 迭代

```python
class Solution(object):
    def isSameTree(self, p, q):
        """
        :type p: TreeNode
        :type q: TreeNode
        :rtype: bool
        """
        ptemp=[];
        qtemp=[];
        while 1 :
            if(p==None and q==None):
                if(ptemp==[] and qtemp==[]):
                    return True;
                else:
                    p=ptemp[0]
                    ptemp.remove(ptemp[0])
                    q=qtemp[0]
                    qtemp.remove(qtemp[0])
            if(p==None and q!=None)or(p!=None and q==None)or(p.val!=q.val):
                return False

            if(p.left!=None and q.left!=None):
                if(p.right!=None and q.right!=None):
                    ptemp.append(p.right)
                    qtemp.append(q.right)
                elif(p.right==None and q.right!=None)or(p.right!=None and q.right==None):
                    return False
                p=p.left
                q=q.left
            elif (p.left==None and q.left!=None)or(p.left!=None and q.left==None):
                return False
            else:
                if(p.right!=None and q.right!=None):
                    p=p.right
                    q=q.right
                    continue
                elif(p.right==None and q.right!=None)or(p.right!=None and q.right==None):
                    return False
                else:
                    if(ptemp==[] and qtemp==[]):
                        return True;
                    else:
                        p=ptemp[0]
                        ptemp.remove(ptemp[0])
                        q=qtemp[0]
                        qtemp.remove(qtemp[0])
```

2017年2月20日 17:44:33 第二次写

```python
class Solution(object):
    def isSameTree(self, p, q):
        """
        :type p: TreeNode
        :type q: TreeNode
        :rtype: bool
        """
        qq=[]
        pq=[]
        qq.append(q)
        pq.append(p)
        while not(qq==[]) and not(pq==[]):
            curq=qq[0]
            curp=pq[0]
            qq.remove(qq[0])
            pq.remove(pq[0])
            if(curq==None and curp==None):
                continue;
            if(curq!=None and curp!=None)and(curq.val==curp.val):
                qq.append(curq.left)
                qq.append(curq.right)
                pq.append(curp.left)
                pq.append(curp.right)
            else:
                return False
        return True    
```

## 7.Invert Binary Tree

Invert a binary tree.

	     4
	   /   \
	  2     7
	 / \   / \
	1   3 6   9

to

	     4
	   /   \
	  7     2
	 / \   / \
	9   6 3   1

Trivia:
This problem was inspired by this original tweet by Max Howell:
Google: 90% of our engineers use the software you wrote (Homebrew), but you can’t invert a binary tree on a whiteboard so fuck off.

#### 7.Analysis

就是要翻转二叉树，用递归就是遍历到最后一个节点然后开始依次往上翻转，并且是做节点的交换，而不是值的交换（值交换，需要判读空的情况，并且新建节点，而且值交换的情况下，需要左右大子树交换的时候就很麻烦了，必须得用节点交换才比较方便）

#### 7.Solution-C/C++

###### 递归

递归思路：首先找到左右子树最下面的叶子节点，然后由叶子节点开始交换位置，并且依次往上进行

```cpp
class Solution 
{
public:
    TreeNode* invertTree(TreeNode* root) 
    {
        TreeNode* temp;
        if(root==NULL)
            return NULL;
        invertTree(root->left);
        invertTree(root->right);
        temp=root->left;
        root->left=root->right;
        root->right=temp;
        return root;
        
    }
};
```

###### 迭代

非递归就需要挨个遍历一遍，依次交换.

我是用自上而下的遍历方法：

1.先把第一个根进行左右交换

2.判断根的左是否为空，右是否为空，都不为空，就把右存起来，如果左空，右不空，就用右作为根继续遍历

3.左右都为空的情况下，检查存储区是否有内容，有就拿来做为根，没有就是整个遍历结束了
```cpp
class Solution 
{
public:
    TreeNode* invertTree(TreeNode* root) 
    {
        TreeNode* temp;
        TreeNode* tmproot=root;
        if(root==NULL)
            return NULL;
        stack<TreeNode*>store;
        while(1)
        {
            temp=tmproot->left;
            tmproot->left=tmproot->right;
            tmproot->right=temp;
            if(tmproot->left!=NULL)
            {
                if(tmproot->right!=NULL)
                    store.push(tmproot->right);
                tmproot=tmproot->left;
            }
            else
            {
         
                if(tmproot->right!=NULL)
                {
                    tmproot=tmproot->right;
                    continue;
                }
                if(store.empty())
                    return root;
                tmproot=store.top();
                store.pop();
            }
        }
    }
};
```

2017年2月20日 18:17:15

第二次重写,思路更加清晰明确

1. 加入队列
2. 取队列头,不为空,交换左右
3. 不为空,把左右节点加入队列,循环

```cpp
class Solution 
{
public:
    TreeNode* invertTree(TreeNode* root) 
    {
        queue<TreeNode*> q;
        q.push(root);
        while(!q.empty())
        {
            
            TreeNode* cur=q.front();
            q.pop();
            if(cur!=NULL)
            {
                TreeNode* temp;
                q.push(cur->left);
                q.push(cur->right);
                temp=cur->left;
                cur->left=cur->right;
                cur->right=temp;
            }
        }
        return root;
    }
};
```

#### Solution-Python

###### 递归

```python
# Definition for a binary tree node.
# class TreeNode(object):
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class Solution(object):
    def invertTree(self, root):
        """
        :type root: TreeNode
        :rtype: TreeNode
        """
        if root==None:
            return None;
        self.invertTree(root.left)
        self.invertTree(root.right)
        temp=root.left
        root.left=root.right
        root.right=temp
        return root
```

###### 迭代

```python
class Solution(object):
    def invertTree(self, root):
        """
        :type root: TreeNode
        :rtype: TreeNode
        """
        store=[]
        store.append(root)
        while len(store)!=0:
            cur=store[0];
            store.remove(store[0]);
            if(cur!=None):
                store.append(cur.left)
                store.append(cur.right)
                temp=cur.left
                cur.left=cur.right
                cur.right=temp
        return root;
```
## 8.Valid Anagram

Given two strings s and t, write a function to determine if t is an anagram of s.

For example,
s = "anagram", t = "nagaram", return true.
s = "rat", t = "car", return false.

Note:
You may assume the string contains only lowercase alphabets.

#### Analysis

关键在于anagram这个词，意思是相同字母但是改变了顺序，而不是逆序。

想到两个方法

1. 从s中依次取一个字母，然后去t中查找，找到后删除，如果最后没剩余，则是ok的
2. 提前预备好26个字母，然后遍历s和t将其所含字母对应数组内容依此加一/减一，最后检测一次求数组总和，总和为0，则是ok的否则就是错的

想想看那个用的时间更少，第一种方法则是s/t越大，需要消耗时间更多。第二种方法则耗时更少一些

百度了一下还看到一种思路，直接字母排序判等，这种貌似也可以，但是考虑时间的消耗当然是计数的方法最好只需要一遍就ok。（字母排序并不够稳定，耗时也很多）

#### Solution-C/C++

c用计数的方法来完成

```c
bool isAnagram(char* s, char* t)
{
    int num[26],i;
    for(i=0;i<26;i++)
        num[i]=0;    
    if(s==t&&s==NULL)
        return true;
    while(*s)
    {
        num[(int)(*s-'a')]++;
        s++;
    }
    while(*t)
    {
        num[(int)(*t-'a')]--;
        t++;
    }
    for(i=0;i<26;i++)
        if(num[i]!=0)
            return false;
    return true;
}
```

#### Solution-Python

python就用第三种排序的方法来解决这个问题
python的list有自带的排序功能比较好用，而c没有，c++就要用STL库的容器来弄。虽然python也需要转换一下容器。

```pytho
class Solution(object):
    def isAnagram(self, s, t):
        """
        :type s: str
        :type t: str
        :rtype: bool
        """
        lists = list(s)
        listt = list(t)
        lists.sort()
        listt.sort()
        if(lists==listt):
            return True
        else:
            return False
```

当然这里也学习了一次如何把list和string相互转换

	>>> import string
	>>> str = 'abcde'
	>>> list = list(str)
	>>> list
	['a', 'b', 'c', 'd', 'e']
	>>> str
	'abcde'
	>>> str_convert = ''.join(list)
	>>> str_convert
	'abcde'
	>>>

## Quote

> http://segmentfault.com/a/1190000003768716
> 
> http://www.linuxidc.com/Linux/2015-01/111637.htm
> 
> http://blog.devtang.com/blog/2015/06/16/talk-about-tech-interview/
> 
> http://piziyin.blog.51cto.com/2391349/568426
> 
> http://www.cnblogs.com/ganganloveu/p/4694703.html



