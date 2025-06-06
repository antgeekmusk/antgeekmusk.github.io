# 概述
数据倾斜是大数据处理中常见的一个问题,主要就是指某些任务的数据处理量或者处理时间远超其他任务,导致任务整体的运行效率下降的问题.

在hive中最终是将任务转换成MapReduce操作,在map端和reduce端都有可能发生数据倾斜.



# map端
## 1.不可以拆分的大文件导致的数据倾斜
描述 : 

在map端由于某些文件不可拆分,导致了所有的数据只能放到一个map task,比如文件格式是textfile,压缩是Gzip.

(这里需要注意的是,是否可切分不是单纯的压缩格式或者文件格式决定的,比如orc,它的几种压缩格式都是不可以拆分的,但是orc这种文件格式的机制使得它是可以拆分的,所以最终还是可以拆分的,具体是否可以拆分可以看作者的另外一篇文章 : [Hive 文件存储格式和压缩格式](https://antgeekmusk.github.io/blog/20250528/3/Hive%20%E6%96%87%E4%BB%B6%E5%AD%98%E5%82%A8%E6%A0%BC%E5%BC%8F%E5%92%8C%E5%8E%8B%E7%BC%A9%E6%A0%BC%E5%BC%8F))

解决方案 : 

1.尽量使用可拆分的格式

2.先在hdfs上解压,然后再进行操作



## 2.上游文件的大小特别不均匀
描述 : 

上游文件大小不均匀,小文件多,导致map任务数据分布不均匀,导致长尾

解决方案 : 

通过配置一些参数来合并小文件或者对小文件提前进行处理

```sql
-- 每个MapTask最大文件大小(这个值决定了合并后的文件数量)
set mapred.max.split.size=100000000; -- 100M
-- 节点上最小分片大小,决定了多个data node上的文件是否需要合并
set mapred.min.split.size.per.node=100000000; -- 100M
-- 机架上最小分片大小,决定了多个交换机上的文件是否需要合并
set mapred.min.split.size.per.rack=100000000; -- 100M
-- 通常会将这三个参数设置为一样,这样就可以实现我们想要的每个map处理100MB的效果
-- 即单个节点上会向着100M这个大小合并,如果不到就暂存起来,不同机架和节点用这些暂存的碎片朝着目标合并,向100M靠近
```

可以看作者的另外一篇文章 :[ Hive 小文件问题](https://antgeekmusk.github.io/blog/20250521/1)



# reduce端
## 1.分组聚合中存在热点key
问题描述

1.在进行分组聚合的时候,由于某些热点key导致数据量很大,其他的key很少就会到时在进行shuffle的时候将大量热点数据发送到单个实例上,导致出现倾斜



解决方案

1.判断倾斜值是否是null

如果是null值,看是否需要,如果不需要可以提前进行过滤,如果要保留,再看如下方案



2..双层group by + rand()

给key拼接一个随机数,然后再内层进行group by,这样就相当于将key打散成了n份,然后再在外层去掉随机数再聚合一次

```sql
-- hive sql
select project_id,count(1) n from bx_ods.hmb_insure_claim_case_info_ods where dt='2024-06-13' group by project_id;
34.364 seconds

-- presto sql
select split(a,'_')[1],sum(n) as n from (
select concat(cast(project_id as varchar),'_',cast(ceil(rand()*10) as varchar)) a,count(1) n from hive.bx_ods.hmb_insure_claim_case_info_ods where dt='2024-06-13'
group by concat(cast(project_id as varchar),'_',cast(ceil(rand()*10) as varchar))
) t group by split(a,'_')[1]
```



3.开启map端聚合

将部分聚合操作提前在map端进行

```sql
-- 开启map端的combiner
set hive.map.aggr=true;
set hive.map.aggr.hash.min.reduction=0.5;
set hive.groupby.mapaggr.checkinterval=0.5;
set hive.map.aggr.hash.force.flush.memory.threshold=0.9;
```



4.skew-groupby 

这个是hive专门用来优化分组聚合导致数据倾斜的一个优化方案,原理是开启两个mr,第一个mr先随机发散数据进行初步聚合,然后第二个mr按照分组字段完成最终聚合

```sql
-- 启用分组聚合数据倾斜优化
set hive.groupby.skewindata=true;
```

## 2.count distinct 数据倾斜
描述 : 

一般count distinct 是由一个reduce来完成的,所以就会导致任务处理时间很长



解决方案 : 

1.使用group by 代替distinct 的全局去重

# join倾斜
## 1.大小表join 场景导致的倾斜
描述 : 

比如某些电商场景下,日志数据和商家维表进行关联,某些大型商家的处理结果就会很慢

日志数据通常会很大,几亿几十亿上百亿等条数,但是商家就几千条上万条,这种就是典型的大小表join,某些热点商家的日志数据都会发送到一个实例上进行计算,这就会导致长尾出现

解决方案 : 

使用map join ,即将小表广播到各个map节点的内存中进行join

map join 开启方式 

方式一 :  自动转换,hive中开启mapjoin的参数 : 

```sql
-- 自动转换为map join
set hive.auto.convert.join = true;
-- 大小表的阈值 默认是25M,也就是如果小于这个值就会转换成map join
set hive.mapjoin.smalltable.filesize;
```

方式二 : hint方式手动指定小表

```sql
select /*+ mapjoin(b)*/ b.shop,count(distinct a.id) from big_table a left join small_table b on a.shop_id=b.shop_id
```



## 2.join 关联条件中存在大量空值导致倾斜
描述 : 

数据表中经常会有空值,如果关联条件中出现了大量空值,这些空值会发送到一个节点上去处理就会导致倾斜.

解决 : 

将空值设置成随机值,因为空值本来也关联不上,所以处理成随机值也不会影响处理结果,就可以避免倾斜

🌰例子 : 

```sql
select * from a left join b on coalesce(a.key,rand()*9999)=b.key
```



## 3.join 关联条件中存在少量热点key
描述 : 

关联条件中如果有热点key并且两个表的数据量都很大无法使用map join就会导致数据倾斜



解决方案 : 

大概的处理思路如下 : 

1.先group by 热点key判断key值分布

2.将热点key存储到一个临时表中

3.热点key和非热点key单独处理最后在union all起来(热点key如果比较少可以再结合map join)



## 4.join 关联条件中存在大量热点key
描述 : 

在存在少量热点key的时候可以将热点key和非热点key拆分开进行处理,但是如果热点key非常多就没法用这种方式了



解决方案 : 

思路 : 随机前缀+扩容维表

1.将大表的key加上一个n以内的随机前缀

2.小表上每个key复制n份

3.将大表和扩容后的小表进行关联



一个简单的demo

```sql
-- 大表加随机前缀 1-10
with a as (
select col1,col2,concat(ceil(rand()*10),key) as rk from bgt
)
-- 小表加随机前缀 并扩容100倍
,b as (
select c1,c2,concat(exploded_v,key) as rk from smlt 
lateral view explode(split('1,2,3,4,5,6,7,8,9,10',',')) data as exploded_v
)
select * from a left join b on a.rk=b.rk
```





## 5.数据类型不一样导致的数据倾斜
描述 : 

join 可以分为map join 和hash join,常见的都是hashjoin 也就是会按照关联键取hash值然后发送到一个reduce节点进行关联处理,但是当关联键的数据类型不一样的时候,就有可能会导致数据都被发送到一个节点上处理



解决方案 : 

将数据类型统一即可,如果存在字符串的类型,尽量都转换成字符串

# 参考文档
[https://blog.csdn.net/lihuazaizheli/article/details/136157913](https://blog.csdn.net/lihuazaizheli/article/details/136157913)

[https://blog.csdn.net/weixin_46389691/article/details/139163456](https://blog.csdn.net/weixin_46389691/article/details/139163456)

[https://cloud.tencent.com/developer/article/1011039](https://cloud.tencent.com/developer/article/1011039)

[https://zhuanlan.zhihu.com/p/320515172](https://zhuanlan.zhihu.com/p/320515172)

[https://blog.csdn.net/weixin_40809627/article/details/109449780](https://blog.csdn.net/weixin_40809627/article/details/109449780)

