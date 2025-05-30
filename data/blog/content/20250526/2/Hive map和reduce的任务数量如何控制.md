# map数量
情况1 : 文件大小小于块大小(默认128M)

小于块大小的话一个文件就会产生一个map任务(这时候就会产生另外一个问题,小文件问题,太多小文件不仅会对namenode造成压力,还会特别耗费性能,因为map的初始化时间要远大于逻辑处理的时间,具体小文件的处理可以看作者的另外一篇文章 [Hive 小文件问题](https://antgeekmusk.github.io/blog/20250521/1/Hive%20%E5%B0%8F%E6%96%87%E4%BB%B6%E9%97%AE%E9%A2%98) )



情况2 : 文件大小大于等于块大小(默认128M,块大小可以通过修改hdfs-site.xml中dfs.block.size来调整)

map数量=split数量

split数量=文件大小/split size

split szie= Matn.max(`mapred.min.split.size`,Math.min(`mapred.max.split.size`,`dfs.block.size`))

如果使用默认值,split size 就是128M Math.max(1,Math.min(256000000,134217728)))=128M

```sql
mapred.min.split.size=1
mapred.max.split.size=256000000
dfs.block.size=134217728
```



情况三 : 通过参数`mapred.map.tasks`指定了map任务的数量

注意这个参数仅在 大于 输入文件的大小/块大小的时候 才会生效



举个栗子🌰🌰🌰

```sql
例子1 : 一个大文件为500M,那么最后会产生 ceil(500/128)=4 个map任务,3个 128M的 1个116M的
例子2 : 有多个文件(1M,2M,129M),最后会产生4个map任务,分别是 1M,2M,128M,1M
```



调大map的数量 :

调小 mapred.max.split.size 的值(默认256M),而且必须要小于块大小(默认128)才会生效

```sql
-- 当前hdfs上有个表的在hdfs上仅一个文件,大小为 27525172300 字节
hdfs dfs -count hdfs://xxx/user/hive/warehouse/ods.db/test

-- 执行sql看到底有多少个map任务
-- 理论上应该有 ceil(27525172300/128*1014*1024)=18个map
hive -e "select max(update_time) from ods.test"
-- 结果 11个map (应该是有优化)

-- 设置maxSize的参数为128M
hive -e "set mapred.max.split.size=134217728;select max(update_time) from ods.test"
-- 结果 18个map 符合上面的公式了

-- 设置maxSize的参数为64M,理论上应该有35个map
hive -e "set mapred.max.split.size=67108864;select max(update_time) from ods.test"
-- 结果 35个map
```

调小map的数量 :

同理 如果要减少map的数量,可以增大`mapred.min.split.size` 的大小,而且必须要大于块的大小



一般在生产环境不会调整,都是默认,但是有些情况可以适当调整,比如一个文件仅1列,但是大小有1G,这时候就可以调大map的数量来加快处理速度.

# reduce数量
情况一 : 通过参数`mapred.reduce.tasks`指定了reduce的个数

这个参数默认是-1,如果指定了后就优先按照这个值来启动reduce,如果不指定是默认值-1会动态计算



情况二 : `mapred.reduce.tasks=-1` ,根据其他参数动态计算reduce的个数

```sql
-- 每个reduce处理的数据量 默认256M
hive.exec.reducers.bytes.per.reducer=256000000
-- 最大的reduce数量
hive.exec.reducers.max=1009
```

reduce数量=min(`hive.exec.reducers.max`,数据总量/`hive.exec.reducers.bytes.per.reducer`)



减少reduce的数量 : 调大参数 `hive.exec.reducers.bytes.per.reducer`,让每个reduce处理的数据多一些



增加reduce的数量 : 减少参数 `hive.exec.reducers.bytes.per.reducer`,让每个reduce处理的数据少一些



各个参数的具体含义 :

我们在执行mr任务的时候一般会有如下提示

```shell
Number of reduce tasks determined at compile time: 1
In order to change the average load for a reducer (in bytes):
  set hive.exec.reducers.bytes.per.reducer=<number>
In order to limit the maximum number of reducers:
  set hive.exec.reducers.max=<number>
In order to set a constant number of reducers:
  set mapreduce.job.reduces=<number>
```

所以在控制reduce数量可以通过这3个参数来控制

+ hive.exec.reducers.bytes.per.reducer
  - 含义 : 每个reducer处理的字节数量
  - 默认值 : 0.2.0版本引入,0.14.0 开始 256M,之前是1G
  - 解释 : 比如1g的数据,会有4个reducer来处理
+ mapreduce.job.reduces
  - 含义 : reduce的个数
  - 默认值 : 从0.1.0 开始引入,默认值-1
  - 解释 : 手动指定reduce的个数,如果是-1则hive自动计算reduce的个数,但是需要注意如果参数mapred.job.tracker 的值是local,这个参数将会被忽略
+ hive.exec.reducers.max
  - 含义 : 最多启动的reduce个数
  - 默认值 :0.2.0版本引入, 0.14.0 开始 1009,之前是999
  - 解释 : 仅在mapreduce.job.reduces=-1的时候这个参数生效,什么时候会触发这个参数呢?当时**输入数据大小/** **hive.exec.reducers.bytes.per.reducer**大于**hive.exec.reducers.max**的时候才会生效,否则reduce的数量就是**输入数据大小/** **hive.exec.reducers.bytes.per.reducer**



# 参考文章
[https://www.iteblog.com/archives/1697.html](https://www.iteblog.com/archives/1697.html)

[https://blog.csdn.net/u010711495/article/details/110297858](https://blog.csdn.net/u010711495/article/details/110297858)

[https://blog.csdn.net/lihuazaizheli/article/details/107580462](https://blog.csdn.net/lihuazaizheli/article/details/107580462)

