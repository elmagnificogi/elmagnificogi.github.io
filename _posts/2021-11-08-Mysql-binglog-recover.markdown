---
layout:     post
title:      "Mysql binlog 数据恢复"
subtitle:   "误删,删库,跑路"
date:       2021-11-08
update:     2021-11-08
author:     "elmagnifico"
header-img: "img/web.jpg"
catalog:    true
tags:
    - mysql
---

## Forward

删库跑路怎么办?刚好有点Mysql的数据想要恢复一下，就查了一下，发现还挺简单的



## binlog

一般来说直接通过binlog就能恢复误删的数据。



由于是在docker里的mysql，所以先连进去瞧瞧

```bash
docker exec -it 容器id bash
mysql -uroot -p
# 输入密码

# 然后看看 binlog是否打开了
show variables like '%log_bin%';
+---------------------------------+-----------------------------+
| Variable_name                   | Value                       |
+---------------------------------+-----------------------------+
| log_bin                         | ON                          |
| log_bin_basename                | /var/lib/mysql/binlog       |
| log_bin_index                   | /var/lib/mysql/binlog.index |
| log_bin_trust_function_creators | OFF                         |
| log_bin_use_v1_row_events       | OFF                         |
| sql_log_bin                     | ON                          |
+---------------------------------+-----------------------------+
6 rows in set (0.01 sec)
```

可以看到，我这里是打开了，我这是mysql8.0，默认设置，我啥都没改。还是很方便的。



然后就可以查看最后一个binlog的编号是什么，和对应操作的位置

```bash
show master status;
+---------------+----------+--------------+------------------+-------------------+
| File          | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+---------------+----------+--------------+------------------+-------------------+
| binlog.000026 | 82243452 |              |                  |                   |
+---------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
```



如果此时数据库还有操作的话，可以通过 flash logs来刷新日志状态。就是新开一个文件开始记录log，而不影响之前出错的log，防止覆盖或者重复操作套娃。

```bash
mysql> flush logs;
Query OK, 0 rows affected (0.03 sec)

mysql> show master status;
+---------------+----------+--------------+------------------+-------------------+
| File          | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+---------------+----------+--------------+------------------+-------------------+
| binlog.000027 |    13656 |              |                  |                   |
+---------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

```



清空所有binlog日志，**慎用**，这基本上就是回收站清空了，再找回就比较麻烦了

```bash
reset master;
```



查询binlog信息，指定从200的pos开始，跳过3行，然后显示5行内容

```bash
mysql> show binlog events in 'binlog.000027' from 200 limit 3,5;
+---------------+-----+----------------+-----------+-------------+----------------------------------------+
| Log_name      | Pos | Event_type     | Server_id | End_log_pos | Info                                   |
+---------------+-----+----------------+-----------+-------------+----------------------------------------+
| binlog.000027 | 453 | Table_map      |         1 |         529 | table_id: 98 (kdc_test.candidate_room) |
| binlog.000027 | 529 | Delete_rows    |         1 |         593 | table_id: 98 flags: STMT_END_F         |
| binlog.000027 | 593 | Xid            |         1 |         624 | COMMIT /* xid=1575206 */               |
| binlog.000027 | 624 | Anonymous_Gtid |         1 |         703 | SET @@SESSION.GTID_NEXT= 'ANONYMOUS'   |
| binlog.000027 | 703 | Query          |         1 |         782 | BEGIN                                  |
+---------------+-----+----------------+-----------+-------------+----------------------------------------+
5 rows in set (0.00 sec)

```



## 实际恢复

建议先把数据库备份一份，再进行恢复。

mysqldump是在bash里执行的，不是在mysql的命令行里执行的

```
mysqldump -uroot -p test > /backup/mysqldump/test.db
```

然后去mysql命令行里，新建一个log

```
flush logs;
```



#### 根据位置恢复

首先查看binlog，找到你要恢复的地方，比如是从头开始，一直到435 position的时候是需要恢复的，后面的内容不要，就可以类似下面这样操作

```
/usr/bin/mysqlbinlog  --stop-position=435 --database=数据库名称  /var/lib/mysql/binlog.000006 | /usr/bin/mysql -uroot -p密码 -v 数据库
```

#### 根据时间恢复

比如指定，从什么时间开始，什么时间结束，这个部分是需要恢复的

```
/usr/bin/mysqlbinlog --start-datetime="2018-04-27 20:57:55" --stop-datetime="2018-04-27 20:58:18" --database=数据库名称 /var/lib/mysql/mysql-bin.000009 | /usr/bin/mysql -uroot -p密码 -v 数据库 
```



#### 从头恢复

简单说就是从binlog000001开始，一直恢复到目标binlog00000xx前，由于DDL是不能回滚的，所以如果数据里经过了大变动，会出现从中间部分开始恢复，可能并不行。只能从头恢复。

这种情况就写个脚本，自动运行一下，逐个执行恢复，等他跑完了，在进行精准定位恢复。

```bash
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000001 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000002 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000003 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000004 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000005 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000006 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000007 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000008 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000009 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000010 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000011 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000012 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000013 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000014 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000015 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000016 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000017 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000018 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000019 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000020 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
/usr/bin/mysqlbinlog --database=kdc_test  /var/lib/mysql/binlog.000021 | /usr/bin/mysql -uroot -ppassword -v kdc_test ;
```



## Summary

就是恢复起来有点慢，还好不用人管，花时间而已。



然而后来遇到了一次，mysql直接崩溃，所有数据丢失，同时binlog也凭空消失了若干小时的



## Quote

>https://www.cnblogs.com/YCcc/p/10825870.html
>
>https://www.cnblogs.com/markLogZhu/p/11398028.html
