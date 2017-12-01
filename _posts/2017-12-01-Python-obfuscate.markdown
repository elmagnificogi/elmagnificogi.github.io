---
layout:     post
title:      "Python 混淆"
subtitle:   "obfuscate"
date:       2017-12-01
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
catalog:    true
tags:
    - python
---

# Foreword

python 由于是脚本语言,本质上使用了python就会遇到一个问题,当你需要加密的时候,就非常尴尬.

当然解决办法还是有的,当然还是要根据需要加密的场景来对应改变

## pyc

最普遍的自然就是使用.pyc,不过pyc只是字节码文件,虽然对于普通用户来说可以达到加密的效果,但是只要对有心人来说,就好像一本日记没有上锁似的,只是合上了而已.

可以通过下面的网站,直接在线反编译pyc,简直不能再简单了

> https://tool.lu/pyc/

## pyinstaller

毫无疑问,如果能直接把python转化成对应的exe,其反向难度会上升一个台阶，但是破解依然可行．

类似的py2exe什么的都有相同的效果,但是这会遇到一个问题,这个问题如果对方接口是源码输入的情况下,那么要如何加密呢？

## 混淆

国内有一位大神写了一个混淆，还是十分不错的,混淆的效果也很好

> http://pyob.oxyry.com/

```python
import sys
# save the default console interface -- maya script editor
__console__=sys.stdout
reload(sys)
# set gbk encode for Chinese
sys.setdefaultencoding('gbk')

# recover the default console interface
# sys.stdout=__console__

import maya.cmds as cmds
import maya.mel as cmds_mel
import random
import json
import copy
import math
import os
import time
import urllib2

# Clears maya output window by Zohar
from ctypes import *
user32 = windll.user32
enum_windows_proc = WINFUNCTYPE(c_int, c_int, c_int)

# in maya there is a bug , u cant use {}*10 for init
Dmd_UAVC_group = [{},{},{},{},{},{},{},{},{},{}]
def Dmd_UAVC_get_windows_handle(title, parent = None):
    # Returns handles to windows with matching titles
	rHwnd = []
	def EnumCB(hwnd, lparam, match = title.lower(), rHwnd = rHwnd):
		# child
		if lparam == 1:
			rHwnd.append(hwnd)
			return False

		title = c_buffer(' ' * 256)
		user32.GetWindowTextA(hwnd, title, 255)
		if title.value.lower() == match:
			rHwnd.append(hwnd)
			#print "Matched", title.value
			return False
		return True

	if parent is not None:
		user32.EnumChildWindows(parent, enum_windows_proc(EnumCB), 1)
	else:
		user32.EnumWindows(enum_windows_proc(EnumCB), 0)
	return rHwnd

def Dmd_UAVC_exfunc_clear_output_windows():
	# print("Clearing Maya output window")
	output_window_handle = Dmd_UAVC_get_windows_handle("Output Window")
	if not output_window_handle:
		print("Output window wasn't found")
	else:
		ch = Dmd_UAVC_get_windows_handle("", output_window_handle[0])
		if ( ch[0] ):
			user32.SendMessageA(ch[0], 0x00B1, 0, -1)
			user32.SendMessageA(ch[0], 0x00C2, 1, "")
		else:
			print("Child window wasn't found")
```

上面的是源码,下面的是混淆后的代码.可以看到导入库的名称被混淆了,函数名,变量名进行了混淆,全局性质的他不会进行混淆.

```python
import sys as O0O0O0OO0O0O0OO0O #line:1
__console__ =O0O0O0OO0O0O0OO0O .stdout #line:3
reload (O0O0O0OO0O0O0OO0O )#line:4
O0O0O0OO0O0O0OO0O .setdefaultencoding ('gbk')#line:6
import maya .cmds as O0OO0O0OOOOO00OO0 #line:11
import maya .mel as O00O0OOOOOOO0OOOO #line:12
import random as O0OO0OOOO0O00OOO0 #line:13
import json as OOO0O00O00OOOO0OO #line:14
import copy as OOOO0000OOO0O0O00 #line:15
import math as OO0O0OO000O00O0OO #line:16
import os as OO0000OO0000O0OOO #line:17
import time as O0O0OO0O00OOO000O #line:18
import urllib2 as O0O00OOO0OOO0O0OO #line:19
from ctypes import *#line:22
user32 =windll .user32 #line:23
enum_windows_proc =WINFUNCTYPE (c_int ,c_int ,c_int )#line:24
Dmd_UAVC_group =[{},{},{},{},{},{},{},{},{},{}]#line:27
def Dmd_UAVC_get_windows_handle (O0OO000O00OOO00O0 ,parent =None ):#line:28
	O0O0OOOO000O0O0O0 =[]#line:30
	def O00O000O0OO0OOO00 (O00O0OO0O0O0OO000 ,O000OOOOO000O0OO0 ,match =O0OO000O00OOO00O0 .lower (),rHwnd =O0O0OOOO000O0O0O0 ):#line:31
		if O000OOOOO000O0OO0 ==1 :#line:33
			rHwnd .append (O00O0OO0O0O0OO000 )#line:34
			return False #line:35
		O000O0OO00O0OO000 =c_buffer (' '*256 )#line:37
		user32 .GetWindowTextA (O00O0OO0O0O0OO000 ,O000O0OO00O0OO000 ,255 )#line:38
		if O000O0OO00O0OO000 .value .lower ()==match :#line:39
			rHwnd .append (O00O0OO0O0O0OO000 )#line:40
			return False #line:42
		return True #line:43
	if parent is not None :#line:45
		user32 .EnumChildWindows (parent ,enum_windows_proc (O00O000O0OO0OOO00 ),1 )#line:46
	else :#line:47
		user32 .EnumWindows (enum_windows_proc (O00O000O0OO0OOO00 ),0 )#line:48
	return O0O0OOOO000O0O0O0 #line:49
def Dmd_UAVC_exfunc_clear_output_windows ():#line:51
	OO0O0000OOOO0OO0O =Dmd_UAVC_get_windows_handle ("Output Window")#line:53
	if not OO0O0000OOOO0OO0O :#line:54
		print ("Output window wasn't found")#line:55
	else :#line:56
		O0O0OO0O0OOO0OOO0 =Dmd_UAVC_get_windows_handle ("",OO0O0000OOOO0OO0O [0 ])#line:57
		if (O0O0OO0O0OOO0OOO0 [0 ]):#line:58
			user32 .SendMessageA (O0O0OO0O0OOO0OOO0 [0 ],0x00B1 ,0 ,-1 )#line:59
			user32 .SendMessageA (O0O0OO0O0OOO0OOO0 [0 ],0x00C2 ,1 ,"")#line:60
		else :#line:61
			print ("Child window wasn't found")
#e9015584e6a44b14988f13e2298bcbf9


#===============================================================#
# Obfuscated by Oxyry Python Obfuscator (http://pyob.oxyry.com) #
#===============================================================#

```

我之所以会选择他的混淆并不是以上的几点,而是他没有选择混淆函数名,可以看到上面的代码中全局级别的函数名都是保留了的,保留的目的也很简单为了应对UI与函数绑定的问题.

比如下面的代码中将一个button与函数进行了绑定,如果混淆了函数名,那么带来的问题就是UI的button将无法使用,找不到函数接口

```python
cmds.   rowLayout(numberOfColumns = 1)
cmds.       button(label = "清空输出窗口",width = 350,command = "Dmd_UAVC_exfunc_clear_output_windows()")
cmds.setParent( '..' )
```

## pyobfuscate

> https://github.com/astrand/pyobfuscate

这个是一个12年前的老代码了,但是如今依然可用,他会混淆函数名,并且会在代码中穿插一些毫无意义的if xxx的判断

```python
if 24 - 24: TOKENBLANKS % NameTranslator / O0
if 46 - 46: O0 * TOKENBLANKS / NameTranslator * NameTranslator * NameTranslator . NameTranslator
if 62 - 62: i11iIiiIii - TOKENBLANKS % NameTranslator - iIii1I11I1II1 . NameTranslator . TOKENBLANKS
```

当然这种有点弱智,如果能直接插入一些被混淆的变量去做的话,更能掩人耳目一些.

后来在CSDN上看到了一个半成品,基本是基于上面的代码来改的,用来支持多线程,多文件同时混淆

> http://download.csdn.net/download/zhangyulin54321/9749787

不过他的代码有问题,直接使用会出现混淆效果非常差,很多东西都不混淆的情况.

所以基于此我又修改了一下pyobfuscate的代码,其原来的输出接口是直接输出到console端口,我改成了输出到文件

```python
#!/usr/bin/env python
# -*-mode: python; coding: utf-8 -*-
#
# pyobfuscate - Python source code obfuscator
#
# Copyright 2004-2007 Peter Astrand <astrand@cendio.se> for Cendio AB
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; version 2 of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
#
# 2017-11-24 15:58:34
# log:
#       use file replace the 'sys.stdout'
#       set the source path at the main first
# by elmagnifico

import sys
import types
import symbol
import token
import keyword
import tokenize
import compiler
import parser
import random
import symtable
import StringIO
import getopt
import re
import time
import shutil
import codecs

TOKENBLANKS=1

class NameTranslator:
    def __init__(self):
        self.realnames = {}
        self.bogusnames = []


    def get_name(self, name):
        """Get a translation for a real name"""
        if not self.realnames.has_key(name):
            self.realnames[name] = self.gen_unique_name()
        return self.realnames[name]


    def get_bogus_name(self,):
        """Get a random bogus name"""
        if len(self.bogusnames) < 20:
            newname = self.gen_unique_name()
            self.bogusnames.append(newname)
            return newname
        else:
            return random.choice(self.bogusnames)


    def gen_unique_name(self):
        """Generate a name that hasn't been used before;
        not as a real name, not as a bogus name"""
        existing_names = self.realnames.values() + self.bogusnames
        name = ""
        while 1:
            name += self.gen_name()
            if name not in existing_names:
                break
        return name


    def gen_name():
        if random.choice((True, False)):
            # Type ilII1ili1Ilil1il1Ilili1
            chars = ("i", "I", "1")
        else:
            # Type oooOo0oOo00oOO0o0O0
            chars = ("o", "O", "0")

        # Name must'nt begin with a number
        result = random.choice(chars[:2])
        for x in range(random.randint(1, 12)):
            result += random.choice(chars)
        return result
    gen_name = staticmethod(gen_name)



class LambdaSymTable:
    def __init__(self, symtabs, argnames):
        # Well, lambdas have no name, so they are safe to obfuscate...
        self.symtabs = symtabs
        self.mysymbs = {}
        for argname in argnames:
            self.mysymbs[argname] = symtable.Symbol(argname, symtable.DEF_PARAM)


    def lookup(self, name):
        lsymb = self.mysymbs.get(name)
        if lsymb:
            return lsymb
        else:
            # If the symbol is not found in the current sumboltable,
            # then look in the toplevel symtable. Perhaps we should
            # even look in all symtabs.
            try:
                return self.symtabs[-1].lookup(name)
            except KeyError:
                return self.symtabs[0].lookup(name)


    def get_type(self):
        return self.symtabs[-1].get_type()


    def is_lambda_arg(self, id):
        return self.mysymbs.has_key(id)


class CSTWalker:
    def __init__(self, source_no_encoding, pubapi):
        # Our public API (__all__)
        self.pubapi = pubapi
        # Names of imported modules
        self.modnames = []
        self.symtab = symtable.symtable(source_no_encoding, "-", "exec")
        cst = parser.suite(source_no_encoding)
        elements = parser.ast2tuple(cst, line_info=1)
        self.names = {}
        self.walk(elements, [self.symtab])



    def getNames(self):
        return self.names


    def addToNames(self, line, name, doreplace):
        namedict = self.names.get(line, {})
        if not namedict:
            self.names[line] = namedict

        occurancelist = namedict.get(name, [])
        if not occurancelist:
            namedict[name] = occurancelist

        occurancelist.append(doreplace)


    def res_name(self, name):
        if name.startswith("__") and name.endswith("__"):
            return 1
        if name in self.modnames:
            return 1
        if hasattr(__builtins__, name):
            return 1
        return 0


    def walk(self, elements, symtabs):
        # We are not interested in terminal tokens
        if type(elements) != types.TupleType:
            return
        if token.ISTERMINAL(elements[0]):
            return

        production = elements[0]
        if production == symbol.funcdef:
            self.handle_funcdef(elements, symtabs)
        elif production == symbol.varargslist:
            self.handle_varargslist(elements, symtabs)
        elif production == symbol.fpdef:
            self.handle_fpdef(elements, symtabs)
        elif production == symbol.import_as_name:
            self.handle_import_as_name(elements, symtabs)
        elif production == symbol.dotted_as_name:
            self.handle_dotted_as_name(elements, symtabs)
        elif production == symbol.dotted_name:
            self.handle_dotted_name(elements, symtabs)
        elif production == symbol.global_stmt:
            self.handle_global_stmt(elements, symtabs)
        elif production == symbol.atom:
            self.handle_atom(elements, symtabs)
        elif production == symbol.trailer:
            self.handle_trailer(elements, symtabs)
        elif production == symbol.classdef:
            self.handle_classdef(elements, symtabs)
        elif production == symbol.argument:
            self.handle_argument(elements, symtabs)
        elif production == symbol.lambdef:
            self.handle_lambdef(elements, symtabs)
        elif production == symbol.decorator:
            self.handle_decorator(elements, symtabs)
        else:
            for node in elements:
                self.walk(node, symtabs)


    def mangle_name(self, symtabs, name):
        if self.res_name(name):
            return name

        if not name.startswith("__"):
            return name

        for i in xrange(len(symtabs)):
            tab = symtabs[-1 - i]
            tabtype = tab.get_type()
            if tabtype == "class":
                classname = tab.get_name().lstrip("_")
                return "_" + classname + name

        return name

    def should_obfuscate(self, id, symtabs):
        # This is the primary location of the magic in pyobfuscate,
        # where we try to figure out if a given symbol should be
        # obfuscated or left alone.

        tab = symtabs[-1]

        # Don't touch reserved names
        if self.res_name(id):
            return False

        # Need to get the internal symbol name before we can look it
        # up (needed for private class/object members)
        orig_id = id
        id = self.mangle_name(symtabs, id)
        try:
            s = tab.lookup(id)
        except Exception:
            return False

        # XXX: Debug code
        #      Add the symbols you want to examine to this list
        debug_symbols = []
        if id in debug_symbols:
            print >>sys.stderr, "%s:" % id
            print >>sys.stderr, "  Imported:", s.is_imported()
            print >>sys.stderr, "  Parameter:", s.is_parameter()
            print >>sys.stderr, "  Global:", s.is_global()
            print >>sys.stderr, "  Local:", s.is_local()

        # Explicit imports are a clear no
        if s.is_imported():
            return False

        # Don't obfuscate arguments as the caller might be external
        # and referencing them by name
        if s.is_parameter():
            # But we assume that lambda arguments are never referenced
            # by name. FIXME?
            if isinstance(tab, LambdaSymTable):
                if tab.is_lambda_arg(id):
                    return True

            return False

        # Lambda scopes have some kind of pseudo-inheritance from
        # the surounding scope. As lambdas can only declare arguments
        # (which we just handled), we should start digging upwards for
        # all other symbols.
        if isinstance(tab, LambdaSymTable):
            while True:
                symtabs = symtabs[:-1]
                if symtabs == []:
                    raise RuntimeError("Lambda symbol '%s' is not present on any scope" % id)

                if id in symtabs[-1].get_identifiers():
                    return self.should_obfuscate(orig_id, symtabs)

        # Global objects require special consideration. Need to figure
        # out where the symbol originated...
        if s.is_global():
            topsymtab = symtabs[0]

            # A global that's not in the global symbol table is a symbol
            # that Python has no idea where it comes from (it is only
            # "read" in every context in the module). That means either
            # buggy code, or that it got dragged in via "import *". Assume
            # the latter and don't obfuscate it.
            if id not in topsymtab.get_identifiers():
                return False

            topsym = topsymtab.lookup(id)

            # XXX: See above:
            if id in debug_symbols:
                print >>sys.stderr, "  Imported (G):", topsym.is_imported()
                print >>sys.stderr, "  Parameter (G):", topsym.is_parameter()
                print >>sys.stderr, "  Global (G):", topsym.is_global()
                print >>sys.stderr, "  Local (G):", topsym.is_local()

            # Explicit imports are a clear no
            if topsym.is_imported():
                return False

            # "Local" really means "written to", or "declared". So a
            # global that is not "local" in the global symbol table is
            # something that was created in another scope. This can happen
            # in two cases:
            #
            #  a) Imported via *
            #
            #  b) Created via "global foo" inside a function
            #
            # We want to obfuscate b), but not a). But we cannot tell which
            # is which, so just leave both alone.
            if not topsym.is_local():
                return False

            # This is something we declared, so obfuscate unless it is
            # part of the module API.
            return id not in self.pubapi

        # If it's not global, nor local, then it must come from a
        # containing scope (e.g. function inside another function).
        if not s.is_local():
            # Any more scopes to try?
            if len(symtabs) <= 2:
                raise RuntimeError("Symbol '%s' is not present on any scope" % id)
            return self.should_obfuscate(orig_id, symtabs[:-1])

        # Local symbols are handled differently depending on what
        # our current scope is.
        tabtype = tab.get_type()
        if tabtype == "module":
            # Toplevel. Check with pubapi.
            return id not in self.pubapi
        elif tabtype == "function":
            # Function/method. Always OK.
            return True
        elif tabtype == "class":
            # This is a class method/variable (or, perhaps, a class in a class)
            # FIXME: We cannot obfuscate methods right now,
            # because we cannot handle calls like obj.meth(),
            # since we do not know the type of obj.
            return False
        else:
            raise RuntimeError("Unknown scope '%s' for symbol '%s'" % (tabtype, id))

    def handle_funcdef(self, elements, symtabs):
        # funcdef: 'def' NAME parameters ':' suite
        # elements is something like:
        # (259, (1, 'def', 6), (1, 'f', 6), (260, ...
        name = elements[2]
        assert name[0] == token.NAME
        id = name[1]
        line = name[2]
        obfuscate = self.should_obfuscate(id, symtabs)

        self.addToNames(line, id, obfuscate)

        tab = symtabs[-1]

        orig_id = id
        id = self.mangle_name(symtabs, id)

        functabs = tab.lookup(id).get_namespaces()

        # Mangled names mess up the association with the symbol table, so
        # we need to find it manually
        if len(functabs) == 0:
            functabs = []
            for child in tab.get_children():
                if child.get_name() == orig_id:
                    functabs.append(child)

        for node in elements:
            self.walk(node, symtabs + functabs)


    def handle_varargslist(self, elements, symtabs):
        # varargslist: (fpdef ['=' test] ',')* ('*' NAME [',' '**' NAME] | '**' NAME) ...
        # elements is something like:
        # (261, (262, (1, 'XXX', 37)), (12, ',', 37), (262, (1, 'bar', 38)), (22, '=', 38), (292, (293, (294,
        # The purpose of this method is to find vararg and kwarg names
        # (which are not fpdefs).
        tab = symtabs[-1]

        for tok in elements:
            if type(tok) != types.TupleType:
                continue

            toktype = tok[0]
            if toktype == symbol.test:
                # This is a "= test" expression
                for node in tok:
                    # The [:-1] is because we actually are not in the
                    # functions scope yet.
                    self.walk(node, symtabs[:-1])
            elif toktype == token.NAME:
                # This is either an "*args" or an "**kwargs". We could
                # in theory obfuscate these as they cannot be referenced
                # directly by the caller. However, we currently have no
                # idea of telling that these are special when we hit the
                # references to them. So for now we treat them as we
                # would any other argument.
                id = tok[1]
                line = tok[2]
                obfuscate = self.should_obfuscate(id, symtabs)
                self.addToNames(line, id, obfuscate)
            elif toktype == symbol.fpdef:
                self.handle_fpdef(tok, symtabs)
            else:
                assert(toktype in [token.STAR, token.DOUBLESTAR,
                                   token.COMMA, token.EQUAL])

    def handle_fpdef(self, elements, symtabs):
        # fpdef: NAME | '(' fplist ')'
        # elements is something like:
        # (262, (1, 'self', 13))
        name = elements[1]
        assert name[0] == token.NAME
        id = name[1]
        line = name[2]
        obfuscate = self.should_obfuscate(id, symtabs)

        self.addToNames(line, id, obfuscate)
        for node in elements:
            self.walk(node, symtabs)


    def handle_import_as_name(self, elements, symtabs):
        # import_as_name: NAME [NAME NAME]
        # elements is something like:
        # (279, (1, 'format_tb', 11))
        # or
        # (279, (1, 'format_tb', 11), (1, 'as', 11), (1, 'ftb', 11))
        name1 = elements[1]
        assert name1[0] == token.NAME
        id1 = name1[1]
        line1 = name1[2]
        self.addToNames(line1, id1, 0)

        if len(elements) > 2:
            assert len(elements) == 4

            name2 = elements[2]
            assert name2[0] == token.NAME
            id2 = name2[1]
            assert id2 == "as"
            line2 = name2[2]
            self.addToNames(line2, id2, 0)

            name3 = elements[3]
            assert name3[0] == token.NAME
            id3 = name3[1]
            line3 = name3[2]
            # FIXME: Later, obfuscate if scope/pubabi etc OK
            self.addToNames(line3, id3, 0)
            self.modnames.append(id3)

        for node in elements:
            self.walk(node, symtabs)


    def handle_dotted_as_name(self, elements, symtabs):
        # dotted_as_name: dotted_name [NAME NAME]
        # elements is something like:
        # (280, (281, (1, 'os', 2)))
        # or
        # (280, (281, (1, 'traceback', 11)), (1, 'as', 11), (1, 'tb', 11))
        # handle_dotted_name takes care of dotted_name
        dotted_name = elements[1]

        modname = dotted_name[1]
        assert modname[0] == token.NAME
        mod_id = modname[1]
        mod_line = modname[2]
        self.addToNames(mod_line, mod_id, 0)
        self.modnames.append(mod_id)

        if len(elements) > 2:
            # import foo as bar ...
            assert len(elements) == 4

            asname = elements[2]
            assert asname[0] == token.NAME
            asid = asname[1]
            assert asid == "as"
            asline = asname[2]
            self.addToNames(asline, asid, 0)

            name = elements[3]
            assert name[0] == token.NAME
            id = name[1]
            line = name[2]
            # FIXME: Later, obfuscate if scope/pubabi etc OK
            self.addToNames(line, id, 0)
            self.modnames.append(id)

        for node in elements:
            self.walk(node, symtabs)


    def handle_dotted_name(self, elements, symtabs):
        # dotted_name: NAME ('.' NAME)*
        # elements is something like:
        # (281, (1, 'os', 2))
        # or
        # (281, (1, 'compiler', 11), (23, '.', 11), (1, 'ast', 11))
        # or
        # (281, (1, 'bike', 11), (23, '.', 11), (1, 'bikefacade', 11), (23, '.', 11), (1, 'visitor', 11))
        name = elements[1]
        assert name[0] == token.NAME
        id = name[1]
        line = name[2]
        self.addToNames(line, id, 0)

        # Sequence length should be even
        assert (len(elements) % 2 == 0)
        for x in range(2, len(elements), 2):
            dot = elements[x]
            name = elements[x+1]

            assert dot[0] == token.DOT
            assert name[0] == token.NAME
            id = name[1]
            line = name[2]
            self.addToNames(line, id, 0)
        for node in elements:
            self.walk(node, symtabs)


    def handle_global_stmt(self, elements, symtabs):
        # global_stmt: 'global' NAME (',' NAME)*
        # elements is something like:
        # (282, (1, 'global', 41), (1, 'foo', 41))
        # or
        # (282, (1, 'global', 32), (1, 'aaaa', 32), (12, ',', 32), (1, 'bbbb', 32))
        gname = elements[1]
        assert gname[0] == token.NAME
        gid = gname[1]
        assert gid == "global"

        name1 = elements[2]
        assert name1[0] == token.NAME
        id1 = name1[1]
        line1 = name1[2]
        obfuscate = self.should_obfuscate(id1, symtabs)
        self.addToNames(line1, id1, obfuscate)

        # Sequence length should be odd
        assert (len(elements) % 2)
        for x in range(3, len(elements), 2):
            comma = elements[x]
            name = elements[x+1]
            assert comma[0] == token.COMMA
            assert name[0] == token.NAME
            id = name[1]
            line = name[2]
            obfuscate = id not in self.pubapi
            self.addToNames(line, id, obfuscate)
        for node in elements:
            self.walk(node, symtabs)


    def handle_atom(self, elements, symtabs):
        # atom: ... | NAME | ...
        # elements is something like:
        # (305, (1, 'os', 15))
        name = elements[1]
        if name[0] == token.NAME:
            id = name[1]
            line = name[2]
            obfuscate = self.should_obfuscate(id, symtabs)

            self.addToNames(line, id, obfuscate)

        for node in elements:
            self.walk(node, symtabs)


    def handle_trailer(self, elements, symtabs):
        # trailer: ... | '.' NAME
        # elements is something like:
        # (308, (23, '.', 33), (1, 'poll', 33))
        trailer = elements[1]
        if trailer[0] == token.DOT:
            name = elements[2]
            assert name[0] == token.NAME
            id = name[1]
            line = name[2]
            # Cannot obfuscate these as we have no idea what the base
            # object is.
            self.addToNames(line, id, 0)
        for node in elements:
            self.walk(node, symtabs)


    def handle_classdef(self, elements, symtabs):
        # classdef: 'class' NAME ['(' testlist ')'] ':' suite
        # elements is something like:
        # (316, (1, 'class', 48), (1, 'SuperMyClass', 48), (11, ':', 48),
        name = elements[2]
        assert name[0] == token.NAME
        id = name[1]
        line = name[2]
        obfuscate = self.should_obfuscate(id, symtabs)

        self.addToNames(line, id, obfuscate)

        aftername = elements[3]
        aftername2 = elements[4]
        # Should be either a colon or left paren
        assert aftername[0] in (token.COLON, token.LPAR)
        if aftername[0] == token.LPAR and aftername2[0] != token.RPAR:
            # This class is inherited
            testlist = elements[4]
            assert testlist[0] == symbol.testlist
            # Parsing of testlist should be done in the original scope
            for node in testlist:
                self.walk(node, symtabs)
            elements = elements[5:]

        tab = symtabs[-1]
        classtab = tab.lookup(id).get_namespace()

        for node in elements:
            self.walk(node, symtabs + [classtab])


    def handle_argument(self, elements, symtabs):
        # argument: [test '='] test       # Really [keyword '='] test
        # elements is like:
        # (318, (292, (293, (294, (295, (297, (298, (299, (300, (301,
        # (302, (303, (304, (305, (3, '"SC_OPEN_MAX"', 15

        # Keyword argument?
        if len(elements) >= 4:
            # keyword=test
            # FIXME: A bit ugly...
            if sys.hexversion >= 0x2040000:
                keyword = elements[1][1][1][1][1][1][1][1][1][1][1][1][1][1][1]
            else:
                keyword = elements[1][1][1][1][1][1][1][1][1][1][1][1][1][1]
            assert keyword[0] == token.NAME
            keyword_id = keyword[1]
            keyword_line = keyword[2]

            # Argument names have to be in the clear as we cannot track all
            # callers. See should_obfuscate().
            self.addToNames(keyword_line, keyword_id, False)

            # Let the obfuscator continue handling the value
            elements = elements[3]

        for node in elements:
            self.walk(node, symtabs)


    def handle_lambdef(self, elements, symtabs):
        # lambdef: 'lambda' [varargslist] ':' test
        # elements is like:
        # (307, (1, 'lambda', 588), (261, (262, (1, 'e', 588))), (11, ':', 588)
        # or
        # (307, (1, 'lambda', 40), (11, ':', 40), (292 ...
        if elements[2][0] == token.COLON:
            # There are no lambda arguments. Simple!
            # We still need to create a LambdaSymTable though since we
            # rely on some magic lookup that it does.
            test = elements[3]
            lambdatab = LambdaSymTable(symtabs, [])
            for node in test:
                self.walk(node, symtabs + [lambdatab])
        else:
            # The more common case: You have a varargslist.
            varargslist = elements[2]

            # Part 1: Deal with varargslist. Fetch the names of the
            # arguments. Construct a LambdaSymTable.
            arguments = self.get_varargs_names(varargslist)
            for line, name in arguments:
                self.addToNames(line, name, 1)

            argnames = [e[1] for e in arguments]
            lambdatab = LambdaSymTable(symtabs, argnames)

            # Part 2: Parse the 'test' part, using the LambdaSymTable.
            test = elements[4]
            for node in test:
                self.walk(node, symtabs + [lambdatab])

    def handle_decorator(self, elements, symtabs):
        # decorator: '@' NAME parameters
        # elements is something like:
        # (259, (50, '@', 39), (288, (1, 'f', 39)), (4, '', 39))
        name = elements[2][1]
        assert name[0] == token.NAME
        id = name[1]
        line = name[2]
        obfuscate = self.should_obfuscate(id, symtabs)

        self.addToNames(line, id, obfuscate)
        for node in elements:
            self.walk(node, symtabs)

    def get_varargs_names(elements):
        """Extract all argument names and lines from varargslist"""
        result = []

        next_is_name = False
        for tok in elements:
            if type(tok) != types.TupleType:
                continue

            toktype = tok[0]
            if next_is_name:
                assert tok[0] == token.NAME
                id = tok[1]
                line = tok[2]
                result.append((line, id))
                next_is_name = False
            elif toktype in [token.STAR, token.DOUBLESTAR]:
                next_is_name = True
            elif toktype == symbol.fpdef:
                result.extend(CSTWalker.get_fpdef_names(tok))

        return result

    get_varargs_names = staticmethod(get_varargs_names)


    def get_fpdef_names(elements):
        """Extract all argument names from fpdef"""
        result = []

        # We are not interested in terminal tokens
        if type(elements) != types.TupleType:
            return result
        if token.ISTERMINAL(elements[0]):
            return result

        name = elements[1]
        assert name[0] == token.NAME
        id = name[1]
        line = name[2]
        result.append((line, id))
        for node in elements:
            result.extend(CSTWalker.get_fpdef_names(node))
        return result

    get_fpdef_names = staticmethod(get_fpdef_names)



class PubApiExtractor:
    def __init__(self, source_no_encoding):
        ast = compiler.parse(source_no_encoding)
        self.pubapi = None
        self.matches = 0
        compiler.walk(ast, self)
        if self.pubapi == None:
            # Didn't find __all__.
            if conf.allpublic:
                symtab = symtable.symtable(source_no_encoding, "-", "exec")
                self.pubapi = filter(lambda s: s[0] != "_",
                                     symtab.get_identifiers())
            else:
                self.pubapi = []

        if self.matches > 1:
            print >>sys.stderr, "Warning: Found multiple __all__ definitions"
            print >>sys.stderr, "Using last definition"


    def visitAssign(self, node):
        for assnode in node.nodes:
            if not isinstance(assnode, compiler.ast.AssName):
                continue

            if assnode.name == "__all__" \
                   and assnode.flags == compiler.consts.OP_ASSIGN:
                self.matches += 1
                self.pubapi = []
                # Verify that the expression is a list
                constant = isinstance(node.expr, compiler.ast.List)
                if constant:
                    # Verify that each element in list is a Const node.
                    for node in node.expr.getChildNodes():
                        if isinstance(node, compiler.ast.Const):
                            self.pubapi.append(node.value)
                        else:
                            constant = False
                            break

                if not constant:
                    print >>sys.stderr, "Error: __all__ is not a list of constants."
                    sys.exit(1)



class ColumnExtractor:
    def __init__(self, source, names):

        self.indent = 0
        self.first_on_line = 1
        # How many times have we seen this symbol on this line before?
        self.symboltimes = {}
        self.names = names
        # Dictionary indexed on (row, column), containing name
        self.result = {}
        # To detect line num changes; backslash constructs doesn't
        # generate any token
        self.this_lineno = 1
        f = StringIO.StringIO(source)
        self.parse(f)


    def parse(self, f):
        for tok in tokenize.generate_tokens(f.readline):
            t_type, t_string, t_srow_scol, t_erow_ecol, t_line = tok

            assert self.this_lineno <= t_srow_scol[0]
            if self.this_lineno < t_srow_scol[0]:
                # Gosh, line has skipped. This must be due to an
                # ending backslash.
                self.this_lineno = t_srow_scol[0]
                self.symboltimes = {}

            if t_type in [tokenize.NL, tokenize.NEWLINE]:
                self.this_lineno += 1
                self.symboltimes = {}
            elif t_type == tokenize.NAME:
                # Make life easier on us by ignoring keywords
                if keyword.iskeyword(t_string):
                    continue

                srow = t_srow_scol[0]
                scol = t_srow_scol[1]

                namedict = self.names.get(srow)
                if not namedict:
                    raise RuntimeError("Overlooked symbol '%s' on line %d column %d" % (t_string, srow, scol))

                occurancelist = namedict.get(t_string)
                if not occurancelist:
                    raise RuntimeError("Overlooked symbol '%s' on line %d column %d" % (t_string, srow, scol))

                seen_times = self.saw_symbol(t_string)
                if seen_times > len(occurancelist):
                    raise RuntimeError("Overlooked symbol '%s' on line %d column %d" % (t_string, srow, scol))

                if occurancelist[seen_times]:
                    # This occurance should be obfuscated.
                    assert self.result.get((srow, scol)) == None
                    self.result[(srow, scol)] = t_string


    def saw_symbol(self, name):
        """Update self.symboltimes, when we have seen a symbol
        Return the current seen_times for this symbol"""
        seen_times = self.symboltimes.get(name, -1)
        seen_times += 1
        self.symboltimes[name] = seen_times
        return seen_times



class TokenPrinter:
    AFTERCOMMENT = 0
    INSIDECOMMENT = 1
    BEFORECOMMENT = 2

    def __init__(self, source, names, filename=None):
        self.indent = 0
        self.first_on_line = 1
        self.symboltimes = {}
        self.names = names
        self.nametranslator = NameTranslator()
        # Pending, obfuscated noop lines. We cannot add the noop lines
        # until we know what comes after.
        self.pending = []
        self.pending_indent = 0
        # To detect line num changes; backslash constructs doesn't
        # generate any token
        self.this_lineno = 1
        self.pending_newlines = 0
        # Skip next token?
        self.skip_token = 0
        # Keep track of constructions that can span multiple lines
        self.paren_count = 0
        self.curly_count = 0
        self.square_count = 0
        # Comment state. One of AFTERCOMMENT, INSIDECOMMENT, BEFORECOMMENT
        if conf.firstcomment:
            self.commentstate = TokenPrinter.AFTERCOMMENT
        else:
            self.commentstate = TokenPrinter.BEFORECOMMENT
        f = StringIO.StringIO(source)
        self.play(f, filename)


    def play(self, f, filename):
        for tok in tokenize.generate_tokens(f.readline):
            t_type, t_string, t_srow_scol, t_erow_ecol, t_line = tok

            #print >>sys.stderr, "TTTT", tokenize.tok_name[t_type], repr(t_string), self.this_lineno, t_srow_scol[0]

            if t_type == tokenize.OP:
                if t_string == "(":
                    self.paren_count += 1
                elif t_string == ")":
                    self.paren_count -= 1
                elif t_string == "{":
                    self.curly_count += 1
                elif t_string == "}":
                    self.curly_count -= 1
                elif t_string == "[":
                    self.square_count += 1
                elif t_string == "]":
                    self.square_count -= 1

                assert self.paren_count >= 0
                assert self.curly_count >= 0
                assert self.square_count >= 0

            if self.skip_token:
                self.skip_token = 0
                continue

            # Make sure we keep line numbers
            # line numbers may not decrease
            assert self.this_lineno <= t_srow_scol[0]
            if self.this_lineno < t_srow_scol[0]:
                # Gosh, line has skipped. This must be due to an
                # ending backslash.
                self.pending_newlines += t_srow_scol[0] - self.this_lineno
                self.this_lineno = t_srow_scol[0]

            if t_type in [tokenize.NL, tokenize.NEWLINE]:
                for x in range(self.pending_newlines):
                    if conf.blanks != conf.KEEP_BLANKS:
                        self.pending.append(self.gen_noop_line() + "\n")
                        self.pending_indent = self.indent
                    else:
                        #sys.stdout.write("\n")
                        filename.write("\n")
                self.pending_newlines = 0

            if t_type == tokenize.NL:
                if self.first_on_line and conf.blanks != conf.KEEP_BLANKS:
                    self.pending.append(self.gen_noop_line() + "\n")
                    self.pending_indent = self.indent
                else:
                    #sys.stdout.write("\n")
                    filename.write("\n")
                self.this_lineno += 1
                if self.commentstate == TokenPrinter.INSIDECOMMENT:
                    self.commentstate = TokenPrinter.AFTERCOMMENT

            elif t_type == tokenize.NEWLINE:
                self.first_on_line = 1
                self.this_lineno += 1
                #sys.stdout.write("\n")
                filename.write("\n")
                if self.commentstate == TokenPrinter.INSIDECOMMENT:
                    self.commentstate = TokenPrinter.AFTERCOMMENT

            elif t_type == tokenize.INDENT:
                self.indent += conf.indent
            elif t_type == tokenize.DEDENT:
                self.indent -= conf.indent
            elif t_type == tokenize.COMMENT:
                if self.commentstate == TokenPrinter.BEFORECOMMENT:
                    self.commentstate = TokenPrinter.INSIDECOMMENT

                if self.first_on_line:
                    if self.commentstate in [TokenPrinter.BEFORECOMMENT, TokenPrinter.INSIDECOMMENT]:
                        # Output comment. Only old Python includes newline.
                        if sys.hexversion >= 0x2040000:
                            t_string += "\n"
                        self.line_append(t_string, filename)
                    elif conf.blanks != conf.KEEP_BLANKS:
                        self.pending.append(self.gen_noop_line() + "\n")
                        self.pending_indent = self.indent
                    else:
                        #sys.stdout.write("\n")
                        filename.write("\n")

                    self.this_lineno += 1
                else:
                    if sys.hexversion >= 0x2040000:
                        #sys.stdout.write("\n")
                        filename.write("\n")
                        self.this_lineno += 1

                # tokenizer does not generate a NEWLINE after comment
                self.first_on_line = 1
                if sys.hexversion >= 0x2040000:
                    # tokinizer generates NL after each COMMENT
                    self.skip_token = 1
            elif t_type == tokenize.STRING:
                if self.first_on_line:
                    # Skip over docstrings
                    # FIXME: This simple approach fails with:
                    # "foo"; print 3
                    if self.paren_count > 0 or \
                       self.curly_count > 0 or \
                       self.square_count > 0:
                        self.line_append(t_string,filename)
                        self.this_lineno += t_string.count("\n")
                    else:
                        self.skip_token = 1
                else:
                    self.line_append(t_string,filename)
                    self.this_lineno += t_string.count("\n")
            elif t_type == tokenize.NAME:
                (srow, scol) = t_srow_scol
                if self.names.get(t_srow_scol):
                    t_string = self.nametranslator.get_name(t_string)

                self.line_append(t_string,filename)
            else:
                self.line_append(t_string,filename)


    def line_append(self, s, filename):
        if self.pending:
            indent = max(self.indent, self.pending_indent)
            self.pending = map(lambda row: " "*indent + row,
                               self.pending)
            if conf.blanks == conf.OBFUSCATE_BLANKS:
                #sys.stdout.write(''.join(self.pending))
                filename.write(''.join(self.pending))
            self.pending = []

        if self.first_on_line:
            #sys.stdout.write(" "*self.indent)
            filename.write(" "*self.indent)
        else:
            #sys.stdout.write(" "*TOKENBLANKS)
            filename.write(" "*TOKENBLANKS)
        #sys.stdout.write(s)
        filename.write(s)
        self.first_on_line = 0


    def gen_noop_line(self):
        if self.paren_count > 0 or \
           self.curly_count > 0 or \
           self.square_count > 0:
            result = "# "
        else:
            testint = random.randint(1, 100)
            result = "if %d - %d: " % (testint, testint)
        num_words = random.randint(1, 6)
        for x in range(num_words - 1):
            op = random.choice((".", "/", "+", "-", "%", "*"))
            result += self.nametranslator.get_bogus_name() + " %s " % op
        result += self.nametranslator.get_bogus_name()
        return result



def strip_encoding(source):
    f = StringIO.StringIO(source)
    lines = [f.readline(), f.readline()]
    buf = ""
    for line in lines:
        if re.search("coding[:=]\s*([-\w_.]+)", line):
            if line.strip().startswith("#"):
                # Add a empty line instead
                buf += "\n"
            else:
                # Gosh, not a comment.
                print >>sys.stderr, "ERROR: Python 2.3 with coding declaration in non-comment!"
                sys.exit(1)
        else:
            # Coding declaration not found on this line; add
            # unmodified
            buf += line

    return buf + f.read()



def usage():
    print >>sys.stderr, """
Usage:

pyobfuscate [options] <file>

Options:

-h, --help              Print this help.
-i, --indent <num>      Indentation to use. Default is 1.
-s, --seed <seed>       Seed to use for name randomization. Default is
                        system time.
-r, --removeblanks      Remove blank lines, instead of obfuscate
-k, --keepblanks        Keep blank lines, instead of obfuscate
-f, --firstcomment      Remove first block of comments as well
-a, --allpublic	        When __all__ is missing, assume everything is public.
                        The default is to assume nothing is public.
-v, --verbose	        Verbose mode.
"""


class Configuration:
    KEEP_BLANKS = 0
    OBFUSCATE_BLANKS = 1
    REMOVE_BLANKS = 2

    def __init__(self):
        try:
            opts, args = getopt.getopt(sys.argv[1:], "hi:s:rkfav",
                                       ["help", "indent=", "seed=", "removeblanks",
                                        "keepblanks", "firstcomment", "allpublic",
                                        "verbose"])
            if len(args) != 1:
                raise getopt.GetoptError("A filename is required", "")
        except getopt.GetoptError, e:
            print >>sys.stderr, "Error:", e
            usage()
            sys.exit(2)

        self.file = args[0]
        self.indent = 1
        self.seed = 42
        self.blanks = self.OBFUSCATE_BLANKS
        self.firstcomment = False
        self.allpublic = False
        self.verbose = False

        for o, a in opts:
            if o in ("-h", "--help"):
                usage()
                sys.exit()
            if o in ("-i", "--indent"):
                self.indent = int(a)
            if o in ("-s", "--seed"):
                self.seed = a
            if o in ("-r", "--removeblanks"):
                self.blanks = self.REMOVE_BLANKS
            if o in ("-k", "--keepblanks"):
                self.blanks = self.KEEP_BLANKS
            if o in ("-f", "--firstcomment"):
                self.firstcomment = True
            if o in ("-a", "--allpublic"):
                self.allpublic = True
            if o == ("-v", "--verbose"):
                self.verbose = True



def main(file):
    global conf
    conf = Configuration()
    random.seed(conf.seed)

    source = open(conf.file, 'rU').read()

    if sys.version_info[:2] == (2, 3):
        # Enable Python 2.3 workaround for bug 898271.
        source_no_encoding = strip_encoding(source)
    else:
        source_no_encoding = source


    # Step 1: Extract __all__ from source.
    pae = PubApiExtractor(source_no_encoding)


    # Step 2: Walk the CST tree. The result of this step is a
    # dictionary indexed on line numbers, which contains dictionaries
    # indexed on symbols, which contains a list of the occurances of
    # this symbol on this line. A 1 in this list means that the
    # occurance should be obfuscated; 0 means not. Example: {64:
    # {'foo': [0, 1], 'run': [0]}
    cw = CSTWalker(source_no_encoding, pae.pubapi)


    # Step 3: We need those column numbers! Use the tokenize module to
    # step through the source code to gather this information. The
    # result of this step is a dictionary indexed on tuples (row,
    # column), which contains the symbol names. Example: {(55, 6):
    # 'MyClass'} Only symbols that should be replaced are returned.
    # (This step could perhaps be merged with step 4, but there are
    # two reasons for not doing so: 1) Make each step less
    # complicated. 2) If we want to use BRM some day, then we'll need
    # the column numbers.)
    ce = ColumnExtractor(source, cw.names)


    # Step 4: Play the tokenizer game! Step through the source
    # code. Obfuscate those symbols gathered earlier. Change
    # indentation, blank lines etc.
    TokenPrinter(source, ce.result, (file if file else None))

    # Step 5: Output a marker that makes it possible to recognize
    # obfuscated files
    print "Obfuscate Complete"

if __name__ == "__main__":
    # set the file source
    soure_file_path = unicode(r"F:\Editor.py", "utf-8")
    sys.argv.append(soure_file_path)

    # new file with time stamp
    output_time = time.strftime('%Y-%m-%d %H%M%S',time.localtime(time.time()))
    output_file_path = unicode(r'F:\Editor_'+ output_time+'.py', "utf-8")

    # start obfuscate
    with open(output_file_path, "w+") as file:
            if file:
                main(file)
```

指定输入和输出文件,然后运行即可得到混淆后的结果

## others

github 上还有不少混淆的工程,但是呢需要注意一下,这里经常会遇到各种错误,这些错误大部分都产生于编码以及字符集出错,导致的.比如我用的是UTF-8以及GBK,其中含有中文(用于界面部分),然后就出现了各种报错

比如这个项目就会出现中文报错的情况
> https://github.com/QQuick/Opy

这个项目其实从根本上改变了文件的格式,并且用了AES加密来保护你的代码
> https://github.com/Falldog/pyconcrete/tree/master/example/django

当然还有直接修改python的虚拟机,非常变态,而且有局限的方式来保护代码

> 就这么几行代码，大部分时间都用在解决这个包的安装上了
实加密很简单的,修改Python虚拟机的代码,针对编译出pyc的部分修改下虚拟码,或者对调几个.别人死都解不出来的.这个方法是来自于(云风大侠的书<我的编程感悟>中的)缺点也很显而易见,执行时必须使用自己的修改的Python虚拟机.

# Summary

总而言之,想要保护python代码,混淆是一种策略,然而更好的办法其实是不用python,用其他语言来完成同样的事情,比如c/c++或者java,他们有更好的代码加密的措施,而不会遇到这种给对方提供源码的情况

# Quote

> https://www.cnblogs.com/welhzh/p/5975676.html
>
> https://www.v2ex.com/amp/t/348602
>
> https://segmentfault.com/q/1010000000666948
>
> https://www.zhihu.com/question/30296617
>
> https://www.zhihu.com/question/42636207
