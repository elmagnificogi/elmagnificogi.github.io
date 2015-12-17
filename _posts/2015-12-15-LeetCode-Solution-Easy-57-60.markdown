---
layout:     post
title:      "LeetCode Solution(Easy.57-60)"
subtitle:   "c/c++，python，for work"
date:       2015-12-15
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
tags:
    - LeetCode
    - Work
---


## 57.Implement strStr()

Implement strStr().

Returns the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.

### 57.Implement strStr()-analysis

判断一个字符串是否是另外一个字符串的字串

方法一：直接挨个比较，直到完全匹配，这样的简单，但是慢，纯暴力

方法二：KMP，基本是这个的极限了

#### KMP

KMP算法，简单说就是先要计算出需要匹配的串，在每一个匹配失败的情况下需要超前移动多少位

剩下的部分就是和寻常的暴力算法一样了，只是每次移动的位数不一定是1位而已

KMP的算法就是需要提前计算这个匹配失败的情况，next数组，用来存储匹配失败的情况下移动的位数

其关键就在于如何计算子串的next，需要先弄明白以下概念

	字符串 bread
	前缀：b,br,bre,brea(除了最后一个字符以外，前面所有字串的种类)
	后缀：read,ead,ad,d(除了第一个字符以外，后面所有字符的种类)
	b      前缀 空             后缀 空             公有元素长度为 0
	br     前缀 b              后缀 r             公有元素长度为 0
	bre    前缀 b,br           后缀 re,e          公有元素长度为 0
	brea   前缀 b,br,bre       后缀 rea,ea,a      公有元素长度为 0
	bread  前缀 b,br,bre,brea  后缀 read,ead,ad,d 公有元素长度为 0
	字符串 b r e a d
	next  0 0 0 0 0
	由于这个字符是bread 字符本身没有重复的地方，也就是说任何一个位置错了，需要移动的长度就是当前已经匹配的长度。

	字符串 abcdabd
	a        前缀 空                          后缀 空                         公有元素长度为 0
	ab       前缀 a                           后缀 b                          公有元素长度为 0
	abc      前缀 ab,a                        后缀 bc,c                       公有元素长度为 0
	abcd     前缀 abc,ab,a                    后缀 bcd,cd,d                   公有元素长度为 0
	abcda    前缀 abcd,abc,ab,a               后缀 bcda,cda,da,a              公有元素长度为 1
	abcdab   前缀 abcda,abcd,abc,ab,a         后缀 bcdab,cdab,dab,ab,b        公有元素长度为 2
	abcdabd  前缀 abcdab,abcda,abcd,abc,ab,a  后缀 bcdabd,cdabd,dabd,abd,bd,d 公有元素长度为 0

	字符串 a b c d a b d
	next  0 0 0 0 1	2 0

通过上面的方法就计算出来了对应next数组的内容，但是仔细查看发现这完全是人工在求next，如果把上面的每一步转化成代码，就够喝一壶的。

所以我们需要仔细看一下有什么规律可循，或者说是上面这么做的本质是什么？

仔细查看发现，其实所谓的next就是在找如果我匹配到第n个字符的时候失败了，那么这n个字符之中是否有出现头尾相等的情况呢？，如果有的话，那么只需把当前的字符往后移动到相等的情况的地方就可以了，那么求next就是求子串的前n个字符中头尾相等的部分的长度。	

下面代码是我自己根据上面的理解，用来求解next的，可以得到正确的next信息

	vector<int> findnext(string sub)
	{
		vector<int>next;
		next.push_back(0);
		int n = 0, i = 0;
		for (n = 1; n < sub.length(); n++)
		{
			next.push_back(0);
			for (i = 1; i <=n; i++)
			{
				if (sub[0] == sub[i])
				{
					//开启另一个循环判断下一个值是否相等
					if (i == n)//头尾相等的情况 n=1
					{
						if (1>next[n])
							next[n] = 1;
					}
					else//sub[i]非尾部的情况
					{
						bool com = false;
						int k = 1;
						for (k = 1; k <= n - i; k++)
						{
							//判断下一个元素是否相等
							if (sub[0 + k] == sub[i + k])
								com = true;
							else//如果出现了元素不相等
							{
								//相当于白费 这两个不匹配的
								com = false;
								break;
							}
						}
						if (com == true)//找到了相同的元素
						{
							if (k>next[n])
								next[n] = k;
						}
					}
				}
			}
		}
		return next;
	}

实际的KMP算法中求解next是这样写的，他是利用之前的判断来当作下一次的判断从而节省了重复判断的地方
（他的返回值整理比上面我自己写的小了1，表示为了进行1位的位移）

	void getNext(const std::string &p, std::vector<int> &next)
	{
		//next.resize(p.size());
		next[0] =-1;
	
		int i = -1, j = 1;
		for (; j < p.length(); j++)
		{
			while (p[i + 1] != p[j] && i >= 0)
				i = next[i];
			if (p[i + 1] == p[j])
				i++;
			next[j] = i;
		}
		
	}

发现原版的next写的非常简单，我又对自己写的next优化了一次，只用一个循环来判断

	vector<int> findnext2(string sub)
	{
		vector<int>next(sub.length());
		next[0]=0;
		int n = 0;
		//优化，首先直到前一个next，可以知道什么呢？？，可以知道前一个字符是否有匹配的
		for (n = 1; n < sub.length(); n++)
		{
			//next[n - 1] 内的值是前一个匹配的程度，对于增加了一个值来说,只需要在其基础上往后判断一个字符就知道是否相等了。
			if (next[n - 1] == 0)//表示前者并不匹配
			{
				//那么只用看首字符和新来的是否匹配就可以了
				if (sub[0] == sub[n])
					next[n] = 1;//如果二者匹配，那么就说明了当前的首尾匹配，确定该层的next值
				else
					next[n] = 0;//如果二者不匹配，说明当前没有和首相同的字符
			}
			else//如果前者不为0的情况下，那么需要看的字符应该就是从首字符开始往后的next[n]个字符是否和现在的最后一个字符一样
			{
				if (sub[next[n - 1]] == sub[n])//新添字符是否和已有相同子串的后一个字符相等
				{
					next[n] = next[n - 1] + 1;//如果相等，就表示子串还可以再长一个字符，当前前缀和后缀相等的长度就是上一层长度+1
				}
				else
				{
					//如果二者不相等，还要看后来的字符是否和头部的单字符相等
					if (sub[0] == sub[n])
						next[n] = 1;//如果二者匹配，那么就说明了当前的首尾匹配，确定该层的next值
					else
						next[n] = 0;//如果二者不匹配，说明当前没有和首相同的字符
				}
			}
		}
		return next;
	
	}

代码长度变短了，同时也没有了循环嵌套， 只是简单的判断就可以了。

还可以再优化一下，把上面相同结果的情况优化到一起去

	vector<int> findnext3(string sub)
	{
		vector<int>next(sub.length());
		next[0] = 0;
		int n = 0;
		for (n = 1; n < sub.length(); n++)
		{
				//这个条件可能涵盖了上面的next[n - 1] == 0的这个条件 如果next[n - 1] =0 那么这里就是头部和尾部直接比较
				if (sub[next[n - 1]] == sub[n])
					next[n] = next[n - 1] + 1;
				else
				{
					if (sub[0] == sub[n])
						next[n] = 1;
					else
						next[n] = 0;
				}
		}
		return next;
	}

这样基本就是next值的本质了，再优化我就不会了，只做到这里

至于字符串搜索子串的算法以后会单独写一篇blog，把各种算法都写一遍放进去。

### 57.Implement strStr()-Solution-C/C++

	class Solution 
	{
	public:
	    vector<int> findnext3(string sub)
	    {
	        vector<int>next(sub.length());
	        next[0] = 0;
	        int n = 0;
	        for (n = 1; n < sub.length(); n++)
	        {
	                if (sub[next[n - 1]] == sub[n])
	                    next[n] = next[n - 1] + 1;
	                else
	                {
	                    if (sub[0] == sub[n])
	                        next[n] = 1;
	                    else
	                        next[n] = 0;
	                }
	        }
	        return next;
	    }
	    int strStr(string haystack, string needle)
	    {
	       if(haystack==needle||needle=="")
	           return 0;
	       if(haystack=="")      
	            return -1;
	       vector<int> next=findnext3(needle);
	       int i=0,j=0;
	       for(i=0;i<haystack.length();i++)
	       {
	           if(needle[j]==haystack[i])
	           {
	               j++;
	               if(j==needle.length())
	                   return i-needle.length()+1;
	           }
	           else
	           {
	               if(j==0)
	                    continue;
	               else
	               {
	                 i=i-next[j-1]-1;
	                 j=0;
	               }
	           }
	       }
	       return -1;
	    }
	};

### 57.Implement strStr()-Solution-Python

	class Solution(object):
	    def findnext(self,sub):
	        next=[0];
	        for n in range(1,len(sub)):
	            next.append(0)
	            if sub[next[n-1]]==sub[n]:
	                next[n]=next[n-1]+1
	            else:
	                if sub[0]==sub[n]:
	                    next[n]=1
	                else:
	                    next[n]=0
	        return next
	    def strStr(self, haystack, needle):
	        """
	        :type haystack: str
	        :type needle: str
	        :rtype: int
	        """
	        if haystack==needle or needle=="":
	            return 0
	        if haystack=="":
	            return -1
	        j=0
	        i=0
	        next=self.findnext(needle)
	        while i<len(haystack):
	            if needle[j]==haystack[i]:
	                j=j+1
	                i=i+1
	                if j==len(needle):
	                    return i-len(needle)
	            else:
	                if j==0:
	                    i=i+1;
	                else:
	                    i=i-next[j-1]
	                    j=0
	                
	        return -1

在这里还发现了一个python的问题，python的for循环中的循环变量，可以在循环体中修改，但修改后的结果并不会影响到循环自身，也就是说在循环体中让循环变量自增一后，下次循环并不会跳过一个变量，依然是严格按照顺序来的。


## 58.Reverse Integer

Reverse digits of an integer.

Example1: x = 123, return 321

Example2: x = -123, return -321

### 58.Reverse Integer-analysis

翻转整数。这个很简单，只要提取之后翻转就可以了

### 58.Reverse Integer-Solution-C/C++

理论上这样就可以了，但是其实有个小问题 第一个是负数的情况下，如果是最大负数需要另外判断

第二个如果这个数翻转之后是2147483640-21474836407 应该可以正常返回，大于21474836407的应该返回0

但是leetcode中的2147483640-21474836407 这些也被认为是返回0了 所以...这个答案应该被修复，同时这个题其实出得并不好

	int reverse(int x) 
	{
	    int n=0,temp=0;
	    if(x==-2147483648)
	        return 0;
	    if(x<0)
	        n=-x;
	    else
	        n=x;
	    while(1)
	    {
	        temp=temp*10+n%10;
	        n=n/10;
	        if(temp>214748364&&n!=0)
	        {
	            return 0;
	        }
	        if(n==0)
	            break;
	    }
	    if(x<0)
	        return -temp;
	    else
	        return temp;
	}

### 58.Reverse Integer-Solution-Python

像是python 由于位数可以从32跳到64 所以 其实这个题对于python来说 没什么意义，特别是判断条件1 534 236 469 返回0的情况

	class Solution(object):
	    def reverse(self, x):
	        """
	        :type x: int
	        :rtype: int
	        """
	        if x<0:
	            n=-x
	        else:
	            n=x
	        temp=0
	        while True:
	            temp=temp*10+n%10
	            n=n/10
	            if temp>214748364 and n!=0:
	                return 0
	            if n==0:
	                break;
	        if x<0:
	            return -temp
	        else:
	            return temp





## 59.Valid Palindrome

Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.

For example,

	"A man, a plan, a canal: Panama" is a palindrome.
	"race a car" is not a palindrome.

Note:

Have you consider that the string might be empty? This is a good question to ask during an interview.

For the purpose of this problem, we define empty string as valid palindrome.

### 59.Valid Palindrome-analysis

有效回文判定，也就是无视大小写，无视符号，用剩下的字母来判断回文。

思路：首先做大小写转换，都转成相同的大小写，然后把所有符号全修改为同一种符合

接着首尾进行遍历，遇到符合的时候跳过，相同继续，不同返回，直到二者相遇

### 59.Valid Palindrome-Solution-C/C++

	class Solution 
	{
	public:
	    bool isPalindrome(string s) 
	    {
	        int i=0,j=s.length()-1;
	        for(i=0;i<s.length();i++)
	        {
	            s[i]=tolower(s[i]);
	            if(s[i]<48||(s[i]>57&&s[i]<65)||(s[i]>90&&s[i]<97)||(s[i]>122))
	                s[i]=' ';
	        }
	        for(i=0;i<s.length();i++)
	        {
	            if(i==j)
	                return true;
	            if(s[i]==' ')
	                continue;
	            if(s[j]==' ')
	            {
	                i--;
	                j--;
	                continue;
	            }
	            if(s[i]==s[j])
	            {
	                j--;
	            }
	            else
	            {
	                return false;
	            }
	            
	        }
	        return true;
	    }
	};

### 59.Valid Palindrome-Solution-Python

python的这部分就简单一些了，可以直接把string转list然后，把非字母数字的字符删除之后再进行遍历比较就可以了，这样很简单。

也发现了一个问题，python的string是const 也就是string是元祖类型的，不能改变，除外转换为list才能改。

	class Solution(object):
	    def isPalindrome(self, s):
	        """
	        :type s: str
	        :rtype: bool
	        """
	        i=0
	        s=s.lower()
	        ss=list(s)
	        while i<len(ss):
	            if (ord(ss[i])<48) or ((ord(ss[i])>57) and (ord(ss[i])<65)) or ((ord(ss[i])>90) and (ord(ss[i])<97)) or (ord(ss[i])>122):
	                del ss[i]
	                continue
	            i=i+1
	        for i in range(len(ss)/2):
	            if ss[i]==ss[len(ss)-i-1]:
	                continue
	            else:
	                return False
	        return True






## 60.ZigZag Conversion

The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)

	P   A   H   N
	A P L S I I G
	Y   I   R

And then read line by line: "PAHNAPLSIIGYIR"

Write the code that will take a string and make this conversion given a number of rows:

	string convert(string text, int nRows);

convert("PAYPALISHIRING", 3) should return "PAHNAPLSIIGYIR".

### 60.ZigZag Conversion-analysis

看起来就很变态的输出格式啊，需要把数据转化成对角线，然后最后用横行的方式来输出

仔细看斜的字符个数为 row-2 

可以发现 第一个字符在第一行，第二个字符在第二行，第三个字符在第三行，第四个字符在第二行，第五个在第一行，也就是说只要提前分好行，然后按照行号依次压入到对应的行中，最后把行合起来进行输出就行了。

关键点：通过对行号*2-2进行求余，然后分段进行加入到行中

### 60.ZigZag Conversion-Solution-C/C++

	class Solution 
	{
	public:
	    string convert(string s, int numRows)
	    {
	        int i=0,j=0;
	        if(numRows==1)
	            return s;
	        vector<string> line(numRows);
	        for(i=0;i<s.length();i++)
	        {
	            j=i%(numRows*2-2);
	            if(j<numRows)
	            {
	                line[j]=line[j]+s[i];
	            }
	            else
	            {
	                j=j-numRows+1;
	                line[numRows-j-1]=line[numRows-j-1]+s[i];
	            }
	        }
	        string ret="";
	        for(i=0;i<numRows;i++)
	            ret=ret+line[i];
	        return ret;
	    }
	};

### 60.ZigZag Conversion-Solution-Python
	            
	class Solution(object):
	    def convert(self, s, numRows):
	        """
	        :type s: str
	        :type numRows: int
	        :rtype: str
	        """
	        if numRows==1:
	            return s
	            
	        line=[]
	        for i in range(numRows):
	            line.append("")
	        for i in range(len(s)):
	            j=i%(numRows*2-2)
	            if j<numRows:
	                line[j]=line[j]+s[i]
	            else:
	                j=j-numRows+1
	                line[numRows-j-1]=line[numRows-j-1]+s[i]
	        ret=""
	        for i in range(numRows):
	            ret=ret+line[i]
	        return ret

## Quote

> http://blog.csdn.net/yutianzuijin/article/details/11954939
> http://blog.csdn.net/buaa_shang/article/details/9907183
> http://www.matrix67.com/blog/archives/115
> http://www.ruanyifeng.com/blog/2013/05/boyer-moore_string_search_algorithm.html
> http://www.cppblog.com/oosky/archive/2006/07/06/9486.html
> http://www.cnblogs.com/sanghai/p/3632528.html



