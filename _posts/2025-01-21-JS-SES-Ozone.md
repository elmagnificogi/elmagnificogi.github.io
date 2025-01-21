---
layout:     post
title:      "SES Threads 自定义JS脚本"
subtitle:   "Ozone,ST"
date:       2025-01-21
update:     2025-01-21
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
tobecontinued: false
tags:
    - SES
---

## Foreword

最近又遇到了一些奇怪的bug，意外发现调试手段上还是有所欠缺，而SES的js脚本可以做更多自定义的工具，可以进一步改造方便疑难杂症使用



## Threads Script

需要注意Threads Script用的是Java Script，而不是Jlink Script（前面查了半天发现不对），虽然都简称成了js，但是Jlink Script应该只有Jlink的一些批处理程序才会使用这种方式写脚本



之前有说过SES的RTOS Awareness好像有点问题，老是显示不全，不如Ozone的

![image-20250121152552349](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121152552469.png)

貌似这个问题在我提给官方以后修复了

![image-20250121152724232](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121152724290.png)

之前有提到显示操作系统线程情况的脚本，这里发现其实这个东西可以自定义的程度还是蛮高的

```js
/*********************************************************************
*               SEGGER MICROCONTROLLER GmbH                          *
*       Solutions for real time microcontroller applications         *
**********************************************************************
*                                                                    *
*       (c) 1995 - 2019  SEGGER Microcontroller GmbH                 *
*                                                                    *
*       www.segger.com     Support: support@segger.com               *
*                                                                    *
**********************************************************************
*                                                                    *
*       Please note:                                                 *
*                                                                    *
*       Knowledge of this file may under no circumstances            *
*       be used to write a similar product                           *
*                                                                    *
*       Thank you for your fairness !                                *
*                                                                    *
**********************************************************************
*                                                                    *
*       Current version number will be inserted here                 *
*       when shipment is built.                                      *
*                                                                    *
**********************************************************************

----------------------------------------------------------------------
File        : FreeRTOSPlugin_CM7.js
Purpose     : Ozone FreeRTOS-awareness JavaScript Plugin for Cortex-M7
---------------------------END-OF-HEADER------------------------------
*/

/*********************************************************************
*
*       Local Functions
*
**********************************************************************
*/

/*********************************************************************
*
*       GetTaskStackGrowDir
*  
* Function description
*   Indicates if the task stack grows in positive (1) or negative (-1) memory direction
*
* Notes
*   (1) The stack grow direction depends on the FreeRTOS-port.
*       Currently, a positive grow direction is only used on the PIC architecture.
*/
function GetTaskStackGrowDir() {    
  return -1;
}

/*********************************************************************
*
*       GetTaskPrioName
*  
* Function description
*   Returns the display text of a task priority
*
* Parameters
*   Priority: task priority (integer)
*/
function GetTaskPrioName(Priority) {
    
  var sName;
  
  if (Priority == 0) {
    sName = "Idle"
  } else if (Priority == 1) {
    sName = "Low"
  } else if (Priority == 2) {
    sName = "Normal";
  } else if (Priority == 3) {
    sName = "High";
  } else if (Priority == 4) {
    sName = "Highest";
  } else {
    return Priority.toString();
  } 
  sName = sName + " (" + Priority + ")";
  return sName;
}

/*********************************************************************
*
*       GetTaskName
*  
* Function description
*   Returns the display text of a task name
*
* Parameters
*   tcb:   task control block (type tskTCB)
*   Addr:  control block memory location
*/
function GetTaskName(tcb, Addr) {
    
   var sTaskName;
   
   sTaskName = Debug.evaluate("(char*)(*(tskTCB*)" + Addr + ").pcTaskName");
   if (sTaskName == undefined) {
     sTaskName = Debug.evaluate("(char*)(*(TCB_t*)" + Addr + ").pcTaskName");
   }
   
   if (tcb.uxTCBNumber != undefined) {
     sTaskName = "#" + tcb.uxTCBNumber + " \"" + sTaskName + "\"";
   }
   return sTaskName;
}

/*********************************************************************
*
*       GetTaskID
*  
* Function description
*   Returns the display text of a task ID
*
* Parameters
*   tcb:   task control block (type tskTCB)
*   Addr:  control block memory location
*/
function GetTaskID(tcb, Addr) { 
   return  "0x" + (tcb.uxTCBNumber == undefined ? Addr.toString(16) : tcb.uxTCBNumber.toString(16));
}

/*********************************************************************
*
*       GetTCB
*  
* Function description
*   Returns the task control block of a task
*
* Parameters
*   Addr: control block memory location
*/
function GetTCB(Addr) { 
  var tcb;
  tcb = Debug.evaluate("*(tskTCB*)" + Addr);
  if (tcb == undefined) {
    tcb = Debug.evaluate("*(TCB_t*)" + Addr);
  }
  return tcb;
}

/*********************************************************************
*
*       GetTaskNotifyStateStr
*  
* Function description
*   Returns the display string of a task notify state
*
* Parameters
*   tcb: task control block (type tskTCB)
*/
function GetTaskNotifyStateStr(tcb) {

   if (tcb.ucNotifyState == undefined) {
     return tcb.eNotifyState == undefined ? "N/A" : tcb.eNotifyState.toString();
   } else {
     return tcb.ucNotifyState.toString()
   }
}

/*********************************************************************
*
*       GetTaskStackInfoStr
*  
* Function description
*   Returns a display text of the format "<free space> / <stack size>"
*
* Parameters
*   tcb: task control block (type tskTCB)
*
* Notes
*   (1) pxEndOfStack is only available when FreeRTOS was compiled with 
*       configRECORD_STACK_HIGH_ADDRESS == 1
*/
function GetTaskStackInfoStr(tcb) {
  var FreeSpace;
  var UsedSpace;
  var Size;
  //                                GrowDir == 0     GrowDir == 1
  //
  // pxStack       |  Low Addr   |  Stack Top     |  Stack Base    |
  //               |             |                |                |
  // pxTopOfStack  |             |  Stack Pointer |  Stack Pointer |       
  //               |             |                |                |
  // pxEndOfStack  |  High Addr  |  Stack Base    |  Stack Top     |
  // 
  if (GetTaskStackGrowDir() == 1) { // stack grows in positive address direction
  
    if (tcb.pxEndOfStack == undefined) {
      UsedSpace  =  tcb.pxTopOfStack - tcb.pxStack;
      FreeSpace  =  undefined;
      Size       =  undefined;  
    } else {
      FreeSpace  =  tcb.pxEndOfStack - tcb.pxTopOfStack;
      UsedSpace  =  tcb.pxTopOfStack - tcb.pxStack;
      Size       =  FreeSpace + UsedSpace;  
    }
  } else {    // stack grows in negative address direction
  
    if (tcb.pxEndOfStack == undefined) {
      FreeSpace  =  tcb.pxTopOfStack - tcb.pxStack;     
      UsedSpace  =  undefined;      
      Size       =  undefined;
    } else {
      FreeSpace  =  tcb.pxTopOfStack - tcb.pxStack;     
      UsedSpace  =  tcb.pxEndOfStack - tcb.pxTopOfStack;      
      Size       =  FreeSpace + UsedSpace;
    }   
  }   
  return FreeSpace + " / " + (Size == undefined ? "N/A" : Size);   
}

function GetLabel1(tcb) {
  var FreeSpace;
  var UsedSpace;
  var Size;
  //                                GrowDir == 0     GrowDir == 1
  //
  // pxStack       |  Low Addr   |  Stack Top     |  Stack Base    |
  //               |             |                |                |
  // pxTopOfStack  |             |  Stack Pointer |  Stack Pointer |       
  //               |             |                |                |
  // pxEndOfStack  |  High Addr  |  Stack Base    |  Stack Top     |
  // 
  if (GetTaskStackGrowDir() == 1) { // stack grows in positive address direction
  
    if (tcb.pxEndOfStack == undefined) {
      UsedSpace  =  tcb.pxTopOfStack - tcb.pxStack;
      FreeSpace  =  undefined;
      Size       =  undefined;  
    } else {
      FreeSpace  =  tcb.pxEndOfStack - tcb.pxTopOfStack;
      UsedSpace  =  tcb.pxTopOfStack - tcb.pxStack;
      Size       =  FreeSpace + UsedSpace;  
    }
  } else {    // stack grows in negative address direction
    // FreeRTOS -1 ,go on here
    if (tcb.pxEndOfStack == undefined) {
      FreeSpace  =  tcb.pxTopOfStack - tcb.pxStack;     
      UsedSpace  =  undefined;      
      Size       =  undefined;
    } else {
      FreeSpace  =  tcb.pxTopOfStack - tcb.pxStack;     
      UsedSpace  =  tcb.pxEndOfStack - tcb.pxTopOfStack;      
      Size       =  FreeSpace + UsedSpace;
    }   
  }   
  return "0x"+tcb.pxTopOfStack.toString(16) + " / " + "0x"+tcb.pxStack.toString(16);   
}

function GetLabel2(addr) {
  return addr.toString(16);   
}

function GetLabel3(param) {
  return param.toString(16);   
}

/*********************************************************************
*
*       AddTask
*  
* Function description
*   Adds a task to the task window
*
* Parameters
*   Addr:            memory location of the task's control block (TCB)
*   CurrTaskAddr:    memory location of the executing task's control block (TCB)
*   sState:          state of the task (e.g. "executing")
*/
function AddTask(Addr, CurrTaskAddr, sState) {
  var tcb;
  var sTaskName; 
  var sPriority;
  var sRunCnt;
  var sMutexCnt;
  var sTimeout;
  var sStackInfo;
  var sID;
  var sNotifiedValue;
  var sNotifyState; 
  var Lable1
  var Lable2
  var Lable3

  tcb            = GetTCB(Addr);
  sTaskName      = GetTaskName(tcb, Addr);
  sID            = GetTaskID(tcb, Addr);
  sStackInfo     = GetTaskStackInfoStr(tcb);
  sPriority      = GetTaskPrioName(tcb.uxPriority);
  sNotifyState   = GetTaskNotifyStateStr(tcb);
  sTimeout       = (tcb.Timeout          == undefined ? "N/A" : tcb.Timeout.toString());
  sRunCnt        = (tcb.ulRunTimeCounter == undefined ? "N/A" : tcb.ulRunTimeCounter.toString());
  sNotifiedValue = (tcb.ulNotifiedValue  == undefined ? "N/A" : tcb.ulNotifiedValue.toString());
  sMutexCnt      = (tcb.uxMutexesHeld    == undefined ? "N/A" : tcb.uxMutexesHeld.toString());

  // custom labels
  Lable1  = GetLabel1(tcb);
  Lable2  = GetLabel2(Addr);
  Lable3  = GetLabel3(0);
 
  if (Addr == CurrTaskAddr) {
    sState = "executing";
  } 
  Threads.add(sTaskName, sRunCnt, sPriority, sState, sTimeout, sStackInfo, sID, sMutexCnt, sNotifiedValue, sNotifyState, Lable1,Lable2,Lable3,(Addr == CurrTaskAddr) ? undefined : Addr);
}

/*********************************************************************
*
*       AddList
*  
* Function description
*   Adds all tasks of a task list to the task window
*
* Parameters
*   List:            task list (type xLIST)
*   CurrTaskAddr:    memory location of the executing task's control block (TCB)
*   sState:          common state of all tasks within 'list'
*/
function AddList(List, CurrTaskAddr, sState) {
  var i;
  var Index;
  var Item;
  var TaskAddr;

  if ((List != undefined) && (List.uxNumberOfItems > 0)) {
      
    Index = List.xListEnd.pxNext;
    
    for (i = 0; i < List.uxNumberOfItems; i++) {
        
      Item = Debug.evaluate("*(xLIST_ITEM*)" + Index);

      TaskAddr = Item != 0 ? Item.pvOwner : 0;

      if (TaskAddr != 0) {
        AddTask(TaskAddr, CurrTaskAddr, sState);
      }
      Index = Item.pxNext;

      if (i > 1000) { // infinite loop guard
        break;
      }
    }
  }
}

/*********************************************************************
*
*       API Functions
*
**********************************************************************
*/

/*********************************************************************
*
*       init
*  
* Function description
*   Initializes the task window
*/
function init() {
    
  Threads.clear();
  Threads.newqueue("Task List");
  Threads.setColumns("Name", "Run Count", "Priority", "Status", "Timeout", "Stack Info", "ID", "Mutex Count", "Notified Value", "Notify State","Lable1","Lable2","Lable3");
  Threads.setColor("Status", "ready", "executing", "blocked");
}

/*********************************************************************
*
*       update
*  
* Function description
*   Updates the task window
*/
function update() {
  var i;
  var pList;
  var List;
  var MaxPriority;
  var CurrTaskAddr;

  Threads.clear();

  if((Debug.evaluate("pxCurrentTCB") == 0) || (Debug.evaluate("pxCurrentTCB") == undefined)) {
    return;
  }
  MaxPriority  = Debug.evaluate("uxTopReadyPriority");  
  CurrTaskAddr = Debug.evaluate("pxCurrentTCB");

  for (i = MaxPriority; i >= 0; i--) {
    List = Debug.evaluate("pxReadyTasksLists[" + i + "]");
    AddList(List, CurrTaskAddr, "ready");
  }

  pList = Debug.evaluate("pxDelayedTaskList");
  if (pList != 0) {
    List = Debug.evaluate("*(xLIST*)" + pList);
    AddList(List, CurrTaskAddr, "blocked");
  }

  pList = Debug.evaluate("pxOverflowDelayedTaskList");
  if (pList != 0) {
    List = Debug.evaluate("*(xLIST*)" + pList);
    AddList(List, CurrTaskAddr, "blocked");
  }

  List = Debug.evaluate("xSuspendedTaskList");
  if (List != 0) {
    AddList(List, CurrTaskAddr, "suspended");
  } 
}

/*********************************************************************
*
*       getregs
*
* Function description
*   Returns the register set of a task.
*   For ARM cores, this function is expected to return the values
*   of registers R0 to R15 and PSR.
*
* Parameters
*   hTask: integer number identifiying the task.
*   Identical to the last parameter supplied to method Threads.add.
*   For convenience, this should be the address of the TCB.
*
* Return Values
*   An array of unsigned integers containing the tasks register values.
*   The array must be sorted according to the logical indexes of the regs.
*   The logical register indexing scheme is defined by the ELF-DWARF ABI.
*
**********************************************************************
*/
function getregs(hTask) { 
  var i;
  var SP;
  var LR;
  var Addr;
  var tcb;
  var aRegs = new Array(17);

  tcb  =  GetTCB(hTask);
  SP   =  tcb.pxTopOfStack;
  Addr =  SP;
  
  /* the following registers are pushed by the FreeRTOS-scheduler */
  //
  // R4...R11
  //
  for (i = 4; i < 12; i++) {
    aRegs[i] = TargetInterface.peekWord(Addr); 
    Addr += 4;
  }
  //
  // EXEC_RET
  //
  LR = TargetInterface.peekWord(Addr);
  Addr += 4;
  //
  // S16...S31
  //
  if ((LR & 0x10) != 0x10) { // FP context has been saved?
    Addr += 4*16; // skip S16..S31
  }
  /* the following registers are pushed by the ARM core */
  //
  // R0...R3
  //
  for (i = 0; i < 4; i++) {
    aRegs[i] = TargetInterface.peekWord(Addr);  
    Addr += 4;
  }
  //
  // R12, LR, PC, PSR
  //
  aRegs[12] = TargetInterface.peekWord(Addr); 
  Addr += 4;
  aRegs[14] = TargetInterface.peekWord(Addr);  
  Addr += 4;
  aRegs[15] = TargetInterface.peekWord(Addr); 
  Addr += 4;
  aRegs[16] = TargetInterface.peekWord(Addr); 
  Addr += 4;
  //
  // S0..S15
  //
  if ((LR & 0x10) != 0x10) { // FP context has been saved?
    Addr += 4*18; // skip S0...S15
  }
  if (aRegs[16] & (1<<9)) { // Stack has been 8-byte aligned
    Addr += 4;
  }
  //
  // SP
  //
  aRegs[13] = Addr;
  
  return aRegs;
}

/*********************************************************************
*
*       getContextSwitchAddrs
*
*  Functions description
*    Returns an unsigned integer array containing the base addresses 
*    of all functions that complete a task switch when executed.
*/
function getContextSwitchAddrs() {
  
  var aAddrs;
  var Addr;
  
  Addr = Debug.evaluate("&vTaskSwitchContext");
  
  if (Addr != undefined) {
    aAddrs = new Array(1);
    aAddrs[0] = Addr;
    return aAddrs;
  } 
  return [];
}

/*********************************************************************
*
*       getOSName()
*
*  Functions description:
*    Returns the name of the RTOS this script supplies support for
*/
function getOSName() {
  return "FreeRTOS";
}

```

这里主要是增加了三个标签的显示

![image-20250121152852234](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121152852286.png)

可以显示栈的起始指针和当前指针位置、TCB指针位置，还多了一个标签待定，随便定义显示什么



整个脚本里主要显示的表格是Threads，只要在它里面去加内容就行了

```js
function init() {
    
  Threads.clear();
  Threads.newqueue("Task List");
  Threads.setColumns("Name", "Run Count", "Priority", "Status", "Timeout", "Stack Info", "ID", "Mutex Count", "Notified Value", "Notify State","Lable1","Lable2","Lable3");
  Threads.setColor("Status", "ready", "executing", "blocked");
}
```



剩下显示具体变量也好，还是什么其他东西也好，都可以使用这个函数来完成

```
Debug.evaluate("pxCurrentTCB")
```

他会把对应的变量转成实际的内容返回



如果要调试某个函数，还可以通过这种方式来获取到具体的函数名称

```
Debug.getfunction(address)
```



如果相加额外的表格列，对应加上一个数字即可

```js
function init()
{
  ...
  Threads.setColumns2("Timers", "Id(Timers)", "Name", "Hook", "Timeout", "Period", "Active");
```



```js
function update()
{
  ...
  Threads.add2("Timers", "0x1FF0A30", "MyTimer", "0x46C8 (Timer50)", "50(550)", "50", "1");
```



![image-20250121154225511](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121154225558.png)

每次更新脚本以后只需要Reload一下，就可以直接加载允许了，不需要断开jlink重连什么的，还是非常方便的

特别是如果遇到踩内存或者需要遍历各个队列什么的，就可以用js脚本直接写一个然后输出到外部框里就行了



## 其他

虽然官方文档里有Echo，类似console.log，但是试了一下在js这里写这个内容是完全无效的，可以正常执行，但是结果不知道输出到哪里去了

```
WScript.Echo(s) 
```

这个小插件的报错有点不友好，很容易看不出来具体错误是什么，要怎么改

而又缺少对这个小插件调试的手段，只能一遍遍试着跑，有点蛋疼



## Summary

好用的脚本还是得多积累积累，下次遇到问题才能派上用场



## Quote

> https://studio.segger.com/index.htm?https://studio.segger.com/ide_debug_expressions.htm

