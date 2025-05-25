# 概述
我们知道,hive是hadoop生态中的一个分析工具,它可以将hdfs上的文件以表的形式进行分析,可以将sql语句转换成MR任务实现对hdfs上数据的快速分析.但是hdfs适合存储大量的大文件而不是小文件,所谓的小文件就是文件大小远小于HDFS块的大小(一般是128M),小文件太多就会导致存储和分析的性能下降,所以就有了hive 小文件的问题及一些处理方案



# 产生的原因
小文件的产生一定是因为数据导入产生的,先来看一下hive的几种数据导入方式

1.直接插入

```sql
insert into table t values (1,'tom'),(2,'jack');
```

这种方式每次插入都会产生一个文件,生产环境中很少使用,一般是测试的时候会用到.



2.load方式

```sql
load data local inpath '/data/file.csv' overwrite into table t1 -- 导入文件
load data local inpath '/data/dir' overwrite into table t1 -- 导入文件夹
```

一般来说,通过load命令导入单个文件仅会在hdfs上生成一个文件,如果是导入文件夹,hdfs上生成的文件数量一般和文件夹的文件数量一致



3.查询插入

```sql
insert overwrite table t1 select age,name from t2
```

这种方式一般是生产上常用的,也是最容易产生小文件的方式

insert 会转换成一个MR任务,最后的文件数量一般是 **reduce任务数*分区数**,有的任务仅有map阶段,那么就是 **map任务数*分区数量**



产生小文件的几种场景

+ 频繁的写入,例如一个flink或者spark等程序实时的向hive表插入数据,每次写入都会产生一个文件,所以会产生很多个小文件.
+ 动态分区插入数据的时候可能会产生大量的小文件,因为动态分区会根据更加数据自动创建分区,这个过程就可能导致大量的小文件产生
+ 数据源本身含有大量的小文件,比如要通过load的方式导入一个文件夹下的数据,但是这些数据都少,就会导致大量小文件的产生
+ reduce数量太多,会产生很多的小文件



# 产生的影响
1.**会增加namenode的内存压力**,每个小文件的元信息在内存中都会占大约**150byte**,如果小文件太多就会占用大量的内存,这样namenode内容容量会严重**限制集群的拓展**.

hadoop 并不擅长对小文件的存储,因为hadoop的文件存储单元是block(块),block存储在datanode,元数据存储到namenode上,而且namenode会将所有的block元数据放到内存中以便快速响应客户端的查询,如果说小文件太多就会大量占用namenode的内存.



2.**影响查询性能,**小文件越多开启的map任务就会越多,而每一个map任务都会启动一个JVM虚拟机,每个虚拟机都要创建任务,执行任务,这些会导致资源的大量浪费.比如处理的数据很少,仅是10条,处理时间1s,但是任务初始化,执行等需要花费10s,大部分的时间都浪费到了任务的初始化上了.



3.**对查询引擎造成压力**,当我们使用一些查询引擎去查询hive的数据的时候,比如SparkSQL,大量的分片信息会对引擎内存造成压力

# 解决方案
主要两个方向 : 一是小文件的预防,二是对于已有小文件的合并

## 小文件预防
在产生小文件之前就通过一些方式来避免产生小文件

map端控制

```sql
-- 输入合并
-- 此方法是在mapper中将多个文件合成一个split作为输入
set hive.input.format=org.apache.hadoop.hive.ql.io.CombineHiveInputFormat; -- 默认

-- 每个MapTask最大文件大小(这个值决定了合并后的文件数量)
set mapred.max.split.size=100000000; -- 100M
-- 节点上最小分片大小,决定了多个data node上的文件是否需要合并
set mapred.min.split.size.per.node=100000000; -- 100M
-- 机架上最小分片大小,决定了多个交换机上的文件是否需要合并
set mapred.min.split.size.per.rack=100000000; -- 100M
-- 通常会将这三个参数设置为一样,这样就可以实现我们想要的每个map处理100MB的效果
-- 即单个节点上会向着100M这个大小合并,如果不到就暂存起来,不同机架和节点用这些暂存的碎片朝着目标合并,向100M靠近


-- 输出合并
-- map结束时合并小文件,默认开启
set hive.merge.mapredfiles=true;
-- 输出结果时合并,默认关闭
set hive.merge.mapfiles=true;
-- 小于这个值会开启一个独立的mapreduce任务进行小文件合并,默认16m
set hive.merge.smallfiles.avgsize=16000000;
-- 合并后的文件大小,默认256m,推荐128m,一个hdfs分块的大小
set hive.merge.size.per.task=256000000;


-- 启用压缩
-- hive的查询结果输出是否进行压缩
set hive.exec.compress.output=true;
-- MapReduce Job的结果输出是否使用压缩
set mapreduce.output.fileoutputformat.compress=true;
```



reduce端控制

控制reduce的数量的参数

```sql
-- reduce 的数量决定了最后输出的文件数量,所以可以通过调整reduce的数量来控制表文件的数量

-- 控制reduce的数量有两种方式
-- 1.直接设置reduce的数量
set mapreduce.job.reduces=10;

-- 2.设置每个reduce的大小,hive会根据总大小计算出一个reduce的个数 
-- 参数1 : hive.exec.reducers.max 默认1009
-- 参数2 : hive.exec.reducers.bytes.per.reducer 默认256M
-- reduce数量=min(hive.exec.reducers.max,总数据量/hive.exec.reducers.bytes.per.reducer)
set hive.exec.reducers.bytes.per.reducer=5120000000; -- 默认是256M，设置为5G
```



尽量不要使用动态分区,如果必须用,可以使用 distribute by rand() 加 每个reduce处理数据量 来减少小文件,比如一个表,不用动态分区就是1个文件,但是如果用了动态分区 ,比如10个分区,这个文件就要拆分成10个文件,如果再来个二级分区比如地域,30个地域,那最后的文件数量就是10*30 最后300个文件,全部都是小文件.

```sql
-- 每个reduce处理数据量
set hive.exec.reducers.bytes.per.reducer=1024*10*1000*1000; ---10G
 
insert overwrite table t partition(dt)
select * 
from table
distribute by cast(rand()*100 as int);
-- 这样就可以控制每个分区下的文件数量为100,具体可以调整
-- cast( rand() * N as int) 可以生成0-n的随机数
-- 通过这种方式可以预防数据过大或者过小
```

## 小文件合并 
查看小文件的数量

```shell
# 查看目录下的明细
hdfs dfs -ls <path>
# 统计信息(这个方法可以递归查询目录下及其子目录下的信息 分别是 目录数量,文件数量,存储大小,路径)
hdfs dfs -count <path>
```

对于已经产生的小文件进行处理

方式一 : concatenate命令

```sql
-- 非分区表
alter table t1 concatenate;
-- 分区表
alter table t2 partition(dt='2024-06-12') concatenate;
```

> 注意事项  : 
>
> + 只支持orc和rcfile 类型
> + 无法指定最终要合并的文件数量,但是可以通过多次执行concatenate命令来减少文件数量
> + 多次执行concatenate文件数量不变的时候,和参`mapreduce.input.fileinputformat.split.minsize`有关,这个可以设置文件的最小大小.
>



手搓的一个concatenate合并脚本

```shell
# created by Antgeek
file_path='hdfs://xxx/user/hive/warehouse/xxx.db/table1'
db_name='xxx'
table_name='table1'
current_date=$(date +'%Y-%m-%d')
yesterday_date=$(date -d "1 day ago" +"%Y-%m-%d")
# 向上取整函数
function ceil(){
  floor=`echo "scale=0;$1/1"|bc -l ` # 向下取整
  add=`awk -v num1=$floor -v num2=$1 'BEGIN{print(num1<num2)?"1":"0"}'`
  echo `expr $floor  + $add`
}
# 获取所有的分区值
hdfs dfs -ls $file_path | grep $table_name | grep -v Found | while read path
do
dt=${path:0-10:10}
if [ "$dt" = "$current_date" ];then
  echo "当日分区不进行合并"
  continue
fi
# 获取该目录下文件数量以及文件个数,每个文件的平均大小
# 如果该目录下文件数量不为1或者平均大小小于250M,那么就循环concatenate
# created by Antgeek
echo "分区 : "$file_path'/dt='$dt
echo "循环concatenate 合并小文件开始"
ttl=10 # 防止死循环
while true;do
file_total_num=$(hdfs dfs -ls $file_path'/dt='$dt | grep -v inprogress | grep -v _SUCCESS | grep -v hive-staging | grep -v Found | wc -l)
file_total_size=$(hdfs dfs -count $file_path'/dt='$dt | awk '{print $3}')
file_avg_size=$(printf  "%.4f" `echo "$file_total_size/$file_total_num" | bc -l`)
file_avg_size_mb=$(printf  "%.4f" `echo "$file_total_size/$file_total_num/1024/1024" | bc -l`)
target_num=$(ceil $(printf  "%.4f" `echo "$file_total_size/1024/1024/256" | bc -l`))
if [ $target_num -eq 0 ];then
target_num=$((target_num + 1))
fi
# 允许多一个小文件 也就是最少的文件个数是2
target_num=$((target_num + 1))
echo "当前分区文件数量 : "$file_total_num
echo "当前分区文件大小 : "$file_total_size
echo "当前分区文件平均大小 : "$file_avg_size" B"
echo "当前分区文件平均大小 : "$file_avg_size_mb" MB"
echo "最终要合并成的文件数量 : "$target_num
echo "即将要执行的命令 : ""alter table xxx.table1 partition(dt='"$dt"') concatenate;"
echo ""
if [ $file_total_num -le $target_num ] || [ $ttl -le 0 ];then
  if [ $ttl -le 0 ];then
    echo "WARN : TTL值耗尽"
  fi
  if [ $ttl -eq 10 ];then
    echo "该分区不需要合并"
  fi
  echo "分区$dt 合并完成,最终信息如下"
  file_total_num=$(hdfs dfs -ls $file_path'/dt='$dt | grep -v inprogress | grep -v _SUCCESS | grep -v hive-staging | grep -v Found | wc -l)
  file_total_size=$(hdfs dfs -count $file_path'/dt='$dt | awk '{print $3}')
  file_avg_size=$(printf  "%.4f" `echo "$file_total_size/$file_total_num" | bc -l`)
  file_avg_size_mb=$(printf  "%.4f" `echo "$file_total_size/$file_total_num/1024/1024" | bc -l`)
  echo "当前分区文件数量 : "$file_total_num
  echo "当前分区文件大小 : "$file_total_size
  echo "当前分区文件平均大小 : "$file_avg_size" B"
  echo "当前分区文件平均大小 : "$file_avg_size_mb" MB"
  break
fi 
hive_cli -e "alter table xxx.table1 partition(dt='"$dt"') concatenate;"
ttl=$((ttl - 1))
echo "TTL值 : "$ttl
done
done
```



方式二 : insert overwrite

执行流程

+ 创建备份表
+ 设置合并相关参数,将原始表数据insert overwrite 到备份表中
+ 检查备份表和原始表是否数据一致
+ 检查备份表的分区数和小文件数是否达到预期
+ 检查无误后将两个表名进行交换
+ 观察一段时间后删除临时表(可选,存储足够可以留着)



```sql
-- 创建备份表
create table tmp.t_back20240612 like tmp.t;

-- =================================================

-- 设置合并相关参数,将原始表数据insert overwrite 到备份表中
  -- hive的查询结果输出是否进行压缩
  set hive.exec.compress.output=true;
  -- MapReduce Job的结果输出是否使用压缩
  set mapreduce.output.fileoutputformat.compress=true;
  -- 设置压缩方式 snappy
  set parquet.compression = snappy;
insert overwrite table tmp.t_back20240612 partiton(dt)
select * from tmp.t;

-- 技巧 : 控制每个分区下的文件数量
insert overwrite table 目标表 [partition(hour=...)] 
select * from 目标表 
distribute by cast( rand() * 具体最后分区内落地生成多少个文件数 as int);
-- insert overwrite：会重写数据，先进行删除后插入（不用担心如果overwrite失败，数据没了，这里面是有事务保障的）;
-- distribute by分区：能控制数据从map端发往到哪个reduceTask中，distribute by的分区规则：分区字段的hashcode值对reduce 个数取模后， 余数相同的数据会分发到同一个reduceTask中。
-- rand()函数：生成0-1的随机小数，控制最终输出多少个文件。


-- =================================================

-- 检查备份表和原始表是否数据一致
-- 对两个表的数量和备份表的列值进行查看,检查是否有问题

-- =================================================

-- 检查备份表小文件数是否达到预期
-- 方式一 : 查看某个分区下的文件数量及大小
hdfs dfs -ls <path>
-- 方式二 : 差个某个表及其子目录下的文件数量
hdfs dfs -count <path>

-- =================================================

-- 检查无误后将两个表名进行交换
alter table tmp.t rename to tmp.t_tmp;
alter table tmp.t_back20240612 rename to tmp.t;

-- =================================================

-- 观察一段时间后删除临时表(可选,存储足够可以留着)
drop table tmp.t_tmp
```



方式三 : archive 归档

Hadoop Archive简称HAR,是一个可以将小文件高效放入hdfs块的存档工具,它可以将多个小文件打包成一个har文件,可以在减少namenode内存的同时,还可以访问数据

```sql
#用来控制归档是否可用
set hive.archive.enabled=true;
#通知Hive在创建归档时是否可以设置父目录
set hive.archive.har.parentdir.settable=true;
#控制需要归档文件的大小
set har.partfile.size=1099511627776;
#使用以下命令进行归档
ALTER TABLE A ARCHIVE PARTITION(dt='2020-12-24', hr='12');
#对已归档的分区恢复为原文件
ALTER TABLE A UNARCHIVE PARTITION(dt='2020-12-24', hr='12');
```

> 注意 : 
>
> 归档的分区不可以insert overwrite 必须先unarchive
>



方式四 : hadoop fs getmerge

对于txt格式的文件可以使用hadoop fs etmerge 来将数据拉取到本机合并,然后再上传到hdfs上

```shell
# 下载数据到本地
hadoop fs -getmerge /user/hive/warehouse/xxxx.db/xxxx/pdate=20220815/*  /home/hadoop/pdate/20220815;
# 删除原始数据
hadoop fs -rm  /user/hive/warehouse/xxxx.db/xxxx/pdate=20220815/*
# 新建目录
 hadoop fs -mkdir -p /user/hive/warehouse/xxxx.db/xxxx/pdate=20220815
# 上传文件
hadoop fs -put  /home/hadoop/pdate/20220815  /user/hive/warehouse/xxxx.db/xxxx/pdate=20220815/*
```

# 参考文章
[https://developer.aliyun.com/article/897671](https://developer.aliyun.com/article/897671)

[https://www.zhihu.com/tardis/bd/art/678367444?source_id=1001](https://www.zhihu.com/tardis/bd/art/678367444?source_id=1001)

[https://blog.csdn.net/SHWAITME/article/details/136108785](https://blog.csdn.net/SHWAITME/article/details/136108785)

