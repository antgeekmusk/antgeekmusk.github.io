> 本文的hive版本 : 1.2.2
>

查看函数的命令

```sql
-- 查看全部函数
show functions;

-- 查看某个函数的解释
desc function abs;
```

# 一.关系运算
## 等值比较
= : 等于

```sql
用法 : a = b 
解释 : 和==一样,如果a和b相等就返回true,否则返回false
注意 : 如果a,b中有null值,则返回null
```



<=> : 等于(可以处理null值)

```sql
用法 : a <=> b
解释 : 对于非null值比较和=效果一样,但是如果两个值都是null,则返回true,如果一个值是null就返回false
```



== : 等于和=一样

```sql
用法 : a == b
解释 : 和=一样,如果a和b相等就返回true,否则返回false
```

## 不等值比较
<> : 不等于

```sql
用法 : a <> b
解释 : 和!=一样,a 不等于 b 返回 true,否则返回 false
```



!= : 不等于

```sql
用法 : a != b
解释 : 和<>一样,a 不等于 b 返回 true,否则返回 false
```



## 范围比较
>: 大于

```sql
用法 : a > b
解释 : 如果a大于b返回true,否则false
```



>= : 大于等于

```sql
用法 : a >= b
解释 : 如果a大于等于b返回true,否则false
```



< : 小于

```sql
用法 : a < b
解释 : 如果a小于b返回true,否则false
```



<= : 小于等于

```sql
用法 : a <= b
解释 : 如果a小于等于b返回true,否则false
```



## null值判断
is null : 判断为null

```sql
用法 : a is null
解释 : 判断a是否是null,如果是null,就返回true,否则返回false
```



is not null : 判断不为null

```sql
用法 : a is not null
解释 : 判断a是否不是null,如果不是null返回true,否则返回false
```



## 模式匹配
like : 模糊匹配

```sql
用法 : a like 'pattern'
解释 : 判断a是否匹配模式,占位符有两个,_和%,_表示任意1个字符,%表示任意n个字符(n可以是0)
比如 
a like '123' => a是否等于123
a like '%123' => a是否以123结尾
a like '123%' => a是否以123开头
a like '%123%' => a是否包含123

注意 : like 是逐字进行匹配的,它的功能完全可以用rlike代替,如果你的正则表达式用的比较熟的话
```



rlike : 正则模糊匹配

```sql
用法 : a rlike 'pattern'
解释 : 判断 a 是否符合 正则表达式 这个和 regexp一样
```



regexp : 正则模糊匹配

```sql
用法 : a regexp 'pattern'
解释 : 判断 a 是否符合 正则表达式 这个和rlike一样
```



# 二.逻辑运算
and : 与

or : 或

not : 非



# 三.数学运算
## 四则运算
+: 加

```sql
用法 : a + b 
解释 : 加法
```



-: 减

```sql
用法 : a - b 
解释 : 减法
```



*: 乘

```sql
用法 : a * b
解释 : 乘法
```



/: 除

```sql
用法 : a / b
解释 : 除法
```



% : 取余

```sql
用法 : a % b
解释 : 返回 a 除以 b 的余数
```



## 位运算
> 位运算是一种高效的运算方式,因为它是直接操作内存中的二进制数据的所以速度会比普通运算要快很多,在hive 中 支持四种位运算 与/或/非/异或 ,没有左移和右移,因为这块内容比较难理解所以单独有一篇文章介绍 : [位运算总结](https://www.yuque.com/antgcode/ry5al9/vkom2l8tg2xh0hfs)  ,这里就简单介绍一些它们的用法
>

& : 与

```sql
用法 : a & b
解释 : 按位与 全1为1,否则为0 例如 0110 & 0101 = 0100
```



| : 或

```sql
用法 : a | b
解释 : 按位或 全0为0,否则为1 0110 | 0101 = 0111
```



~ : 求反

```sql
用法 : ~ a
解释 : 位求反 ~0101=1010
```



^ : 异或

```sql
用法 : a ^ b
解释 : 按位异或 0变1,1变0 0101 ^ 1010 = 1010  
这个可以实现变量原地交换
比如要交换 a和b的值 ,常规方法是用一个中间变量c,但是如果用异或就可以不用中间变量
实现方法如下 : 
a=a^b
b=a^b
a=a^b
```



# 四.字符串处理
## 连接字符串 
concat : 连接字符串

```sql
用法 : concat(str1, str2, ... strN)
解释 : 连接字符串
注意 : 其中有一个值是null值整体返回是null
如果想防止因为null值把整体结果变成null,可以使用这个语法 concat_ws('',[string | array(string)]+)
例子 : 
select concat('1','2','3');
123
select concat('1',null,'3');
null
```



concat_ws : 带分割符号的字符串连接

```sql
用法 : concat_ws(separator, [string | array(string)]+)
解释 : 带分隔符连接字符串
注意 : 有null值跳过,但是如果是array类型会拼接上字符串null
例子 : 
select concat_ws(',','1','2','3');
1,2,3
select concat_ws(',','1',null,'3');
1,3
select concat_ws(',',array('1','2','3'),array('a',null,'c'));
1,2,3,a,null,c
```



repeat : 将一个字符串重复n次

```sql
用法 : repeat(str, n)
解释 : 将字符串str重复n次
例子 : 
select repeat('a',3);
aaa
```

## 截取字符串
substr 和 subtring(和substr一样) : 字符串截取

```sql
用法 : substr(str, pos[, len])
解释 : 从 pos 位置开始,截止长度为len的字符串,len可选参数,如果不写就截取到字符串最末尾
如果 pos 等于0或者1 就相当于从起始位置截取,因为pos的含义是第几个字符开始,第0个和第1个含义是相同的
如果 pos 是负数,就代表从右往左数第几个字符,截取的时候还是从左往右截取
例子 : 
select substr('abcdef',2); -- 从第二个字符串开始到最后
bcdef
select substr('abcdef',2,1);  -- 从第二个字符串开始截取一个字符
b
select substr('abcdef',0); -- 从第一个字符开始截取到最后
abcdef
select substr('abcdef',1); -- 从第一个字符开始截取到最后
abcdef
select substr('abcdef',-1); -- 从右边数第一个字符开始截取到最后
f
select substr('abcdef',-2); -- 从右边数第二个字符开始截取到最后
ef
select substr('abcdef',-2,1);  -- 从右边数第二个字符开始截取一个字符
e
```



## 分割字符串
split : 分割字符串

```sql
用法 : split(str, regex)
解释 : 按照正则表达式 regex 来分割字符串,返回值是一个数组
例子 : 
select split('abc,de',','); -- 按逗号分割字符串
["abc","de"]
select split('abccccdecccff','c+'); -- 按照n个c分割字符串
["ab","de","ff"]
select split('abccccdecccff','c+')[0]; -- 按照n个c分割字符串,取第一个值
ab
```



## 替换字符串
regexp_replace : 替换字符串中的特定字符串

```sql
用法 : regexp_replace(str, regexp, rep);
解释 : 替换str中符合正则表达式regexp的字符串,替换成rep
例子 : 
select regexp_replace('abccccdecccff','c+','z'); -- 将n个c替换成字符串c
abzdezff
select regexp_replace('abccccdecccff','ff','a'); -- 将ff替换成a
abccccdeccca
```



## 解析字符串
get_json_object : 解析json字符串

```sql
用法 : get_json_object(json_txt, path)
解释 : 从路径中提取一个json对象,如果json格式错误,或者路径没有则返回null
例子 : 
-- 获取对象 success $.success
select get_json_object('{"data":{"initialized":true,"mailEnable":false},"success":true}','$.success');
-- 获取对象 data 中的mailEnable $.data.mailEnable
select get_json_object('{"data":{"initialized":true,"mailEnable":false},"success":true}','$.data.mailEnable');
-- 解析json 数组中的值 $.arr[1].age
select get_json_object('{"data":{"initialized":true,"mailEnable":false},"success":true,"arr":[{"age":10,"name":"tom"},{"age":12,"name":"jack"}]}','$.arr[1].age');
```



regexp_extract : 按照正则解析字符串

```sql
用法 : regexp_extract(str, regexp[, idx])
解释 : 提取与regexp匹配的组,如果没有匹配到就返回空字符串,idx不传的话默认是1
例子 :
select regexp_extract('helloworld', 'hello(.*?)(rld)');
wo
select regexp_extract('helloworld', 'hello(.*?)(rld)', 0);
helloworld
select regexp_extract('helloworld', 'hello(.*?)(rld)', 1);
wo
select regexp_extract('helloworld', 'hello(.*?)(rld)', 2);
rld
```



parse_url : 解析url

```sql
用法 : parse_url(url, partToExtract[, key])
解释 : 解析url中的一部分值
三个参数
第一个是要解析的 url
第二个是要解析的模块枚举值(必须大写) 包括如下
HOST: 提取 URL 的主机部分（域名或 IP 地址）
PATH: 提取 URL 的路径部分
PROTOCOL: 提取 URL 的协议部分
QUERY: 提取 URL 的查询字符串部分
REF: 提取 URL 的引用部分（即 # 后面的部分）也就是锚点

FILE: 提取 URL 的文件名部分 (这个实际测试中发现是提取的HOST后所有字符串)
AUTHORITY: 提取 URL 的授权信息部分 (这个实际测试中发现提取的是 协议和路径中间的所有值)

其中 PROTOCOL,HOST,PATH,QUERY,REF 最常用

第三个参数key 仅在partToExtract是QUERY的时候才可以使用,它指的是要提取的参数名称
如果QUERY,后不加key参数,那就是返回所有的key和value
例子 :
-- 提取HOST
SELECT parse_url("https://www.example.com/path/to/page?query=123", 'HOST') AS extracted_host;
www.example.com
-- 提取PATH
SELECT parse_url("https://www.example.com/path/to/page?query=123", 'PATH') AS extracted_path;
/path/to/page
-- 提取所有的参数QUERY
SELECT parse_url("https://www.example.com/path/to/page?q1=123&q2=456", 'QUERY') AS extracted_query_string;
q1=123&q2=456
-- 提取其中的一个参数
SELECT parse_url("https://www.example.com/path/to/page?q1=123&q2=456", 'QUERY','q2') AS extracted_query_string;
456
-- 提取协议PROTOCOL
SELECT parse_url("https://www.example.com/path/to/page?query=123", 'PROTOCOL') AS extracted_protocol;
https
-- 提取REF(锚点)
SELECT parse_url("https://www.example.com/path/to/page?query=123#section1", 'REF') AS extracted_reference;
section1

-- FILE
SELECT parse_url("https://www.example.com/path/to/page/file.txt?query=123", 'FILE') AS extracted_file_name;
/path/to/page/file.txt?query=123
-- AUTHORITY
SELECT parse_url("https://username:password@example.com/path/to/page?query=123", 'AUTHORITY') AS extracted_authority;
username:password@example.com
SELECT parse_url("https://username:password@example.com/path/to/page?query=123", 'HOST') AS extracted_authority;
example.com

```



parse_url_tuple : 解析字符串返回多列

```sql
用法 : parse_url_tuple(url, partname1, partname2, ..., partnameN)
解释 : 解析多个参数并返回多列,如果要解析多个参数可以使用QUERY:k1,QUERY:k2的形式解析
例子 : 
SELECT parse_url_tuple("https://www.example.com/path/to/page?q1=123&q2=456",'PROTOCOL','HOST','PATH','QUERY','QUERY:q1','QUERY:q2');
+--------+------------------+----------------+----------------+------+------+--+
|   c0   |        c1        |       c2       |       c3       |  c4  |  c5  |
+--------+------------------+----------------+----------------+------+------+--+
| https  | www.example.com  | /path/to/page  | q1=123&q2=456  | 123  | 456  |
+--------+------------------+----------------+----------------+------+------+--+

with a as (
select 'https://www.example.com/path/to/page?q1=123&q2=456' as url
)
select * from a lateral view parse_url_tuple(url,'PROTOCOL','HOST','PATH','QUERY','QUERY:q1','QUERY:q2') b 
as protocol,host,path,query,q1,q2;
+-----------------------------------------------------+-------------+------------------+----------------+----------------+-------+-------+--+
|                        a.url                        | b.protocol  |      b.host      |     b.path     |    b.query     | b.q1  | b.q2  |
+-----------------------------------------------------+-------------+------------------+----------------+----------------+-------+-------+--+
| https://www.example.com/path/to/page?q1=123&q2=456  | https       | www.example.com  | /path/to/page  | q1=123&q2=456  | 123   | 456   |
+-----------------------------------------------------+-------------+------------------+----------------+----------------+-------+-------+--+

```

## 求字符长度
length : 获取字符串长度

```sql
用法 : length(str1)
解释 : 求字符串str1的长度
例子 : 
select length('123');
3
```



## 翻转字符串
reverse : 翻转字符串

```sql
用法 : reverse(str1)
解释 : 反转字符串
例子 : 
select reverse('123');
321
```



## 去空格
trim : 去左右两边空格

```sql
用法 : trim(str)
解释 : 去除左右两边空格
例子 : 
select trim(' 123 ');
'321'
```



ltrim : 去左边空格

```sql
用法 : ltrim(str)
解释 : 去左边空格
例子 : 
select trim('123 ');
'321 '
```



rtrim : 去右边空格

```sql
用法 : rtrim(str)
解释 : 去右边空格
例子 : 
select trim(' 123 ');
' 321'
```



## 大小写转换
upper/ucase : 转大写

```sql
用法 : upper(str)/ucase(str)
解释 : 将所有字符大写
例子 : 
select upper('abC');
ABC
select ucase('abC');
ABC
```



lower/lcase

```sql
用法 : lower(str)/lcase(str)
解释 : 将所有字符小写
例子 : 
select lower('abC');
abc
select lcase('abC');
abc
```



## 获取字符ASCII码
ascii : 获取字符串首个字符ascii码([ascii码表](https://www.yuque.com/antgcode/ry5al9/tux16ez7ctmiknxz))

```sql
用法 : ascii(str)
解释 : 获取字符串首个字符ascii码
例子 : 
select ascii('abc');
97
select ascii('Abc');
65
```



## 字符串补齐长度函数
lpad : 向左补齐长度

```sql
用法 : lpad(str, len, pad)
解释 : 如果字符串str长度不足len,就向左补齐pad
如果pad长度超出了补齐的长度,就从左往右截取对应长度补齐
例子 : 
select lpad('1111',8,'0');
00001111
select lpad('1111',8,'abcdefg');
abcd1111
```



rpad : 向右补齐长度

```sql
用法 : rpad(str, len, pad)
解释 : 如果字符串str长度不足len,就向右补齐pad
如果pad长度超出了补齐的长度,就从左往右截取对应长度补齐
例子 : 
select rpad('1111',8,'0');
11110000
select rpad('1111',8,'abcdefg');
1111abcd
```



## 获取n个空格
space : 返回n个空格

```sql
用法 : space(n)
解释 : 返回n个空格,相当于repeat(' ',10)
例子 : 
select space(10);
'          '
```



## 查询逗号分割字符串中某个字符第一次出现的下标
find_in_set : 查询逗号分割字符串中某个字符第一次出现的下标

```sql
用法 : find_in_set(str,str_array)
解释 : 查询str_array中str第一次出现的下标(从1开始)
其中 str_array 是逗号分割的字符串,不是数组
如果查询不到就返回0
如果参数有null就返回null

例子 : 
select find_in_set('a','ab,dc,e,ac,a');
5
select find_in_set('a',null);
NULL
```



## 将字符串按语句切分成数组
sentences : 将一段话按句子切分开

```sql
用法 : sentences(str)
解释 : 将str拆分为句子数组，其中每个句子都是单词数组。
返回结果是一个二维数组,每个句子都是一个由单词组成的数组
例子 : 
select sentences('Hello Antgeek!How are you?');
[["Hello","Antgeek"],["How","are","you"]]

select sentences('你好 Antgeek!你好吗');
[["你好","Antgeek"],["你好吗"]]
```



## ngrams函数
ngrams :

```sql
用法 : ngrams(expr, n, k)
解释 : 
expr 是一个字符串数组,可以是一维数组,或者一个二维的数组
这个函数会返回这个expr中,按n个单词切分(切分的最大范围是一维数组或者二维数组的单个子元素)
然后返回出现频率最高的前k个值
这段话有点绕口,来多看几个例子就知道了


例子 : 
一般结合者sentences函数使用,先来看sentences的结果
select sentences('hello boy!how are you!hello Antgeek!hello you');
[["hello","boy"],["how","are","you"],["hello","Antgeek"],["hello","you"]]

select ngrams(sentences('hello boy!how are you!hello Antgeek!hello you'),1,2);
[{"ngram":["hello"],"estfrequency":3.0},{"ngram":["you"],"estfrequency":2.0}]

select ngrams(sentences('hello boy!how are you!hello Antgeek!hello you'),2,2);
[{"ngram":["hello","Antgeek"],"estfrequency":1.0},{"ngram":["how","are"],"estfrequency":1.0}]

select ngrams(sentences('hello boy!how are you!hello Antgeek!hello you'),3,2);
[{"ngram":["how","are","you"],"estfrequency":1.0}]

select ngrams(sentences('hello boy!how are you!hello Antgeek!hello you'),4,2);
NULL

select ngrams(sentences('hello boy,how are you,hello Antgeek,hello you'),4,2);
[{"ngram":["how","are","you","hello"],"estfrequency":1.0},{"ngram":["you","hello","Antgeek","hello"],"estfrequency":1.0}]

```



## context_ngrams函数
context_ngrams : 可以用来求某个语句或者单词后出现频率最高的单词或者句子

```sql
用法 : context_ngrams(array<array> content,array mode,int k)
解释 : 
content : 带解析的二维数组 一般使用sentensce来使用
mode : 匹配模式, 例如 array('a',null) 就是求a后出现频率最高的k个值 
array('a',null,null) 就是求a后出现评率最高的两个单词
例子 :
select context_ngrams(sentences('hello word!hello hive,hi hive,hello hive'),array('hello'),4);
ERROR : Ended Job = job_1718421743821_101361 with errors
Error: Error while processing statement: FAILED: Execution Error, return code 2 from org.apache.hadoop.hive.ql.exec.mr.MapRedTask (state=08S01,code=2)

select context_ngrams(sentences('hello word!hello hive,hi hive,hello hive'),array('hello',null),4);
[{"ngram":["hive"],"estfrequency":2.0},{"ngram":["word"],"estfrequency":1.0}]

select context_ngrams(sentences('hello word!hello hive,hi hive,hello hive'),array('hello',null,null),4);
[{"ngram":["hive","hi"],"estfrequency":1.0}]

```



# 五.日期处理
## 获取时间戳/时间字符串转时间戳
unix_timestamp : 当前时间戳

```sql
用法 : unix_timestamp([date[, pattern]])
解释 : 获取时间戳,单位秒
如果不传参数就获取当前时间戳
如果传入一个时间可以获取指定时间的时间戳
传入时间后,还可以传入一个pattern(yyyy-MM-dd HH:mm:ss),这个可以获取该模式下的时间戳
例子 : 
-- 获取当前时间戳
select unix_timestamp();
1720777134
-- 获取指定时间的时间戳 2024-07-15 12:15:00
select unix_timestamp('2024-07-15 12:15:00');
1721016900
-- 获取指定时间指定模式的时间戳 2024-07-15 12:15:00 yyyy-MM-dd
select unix_timestamp('2024-07-15 12:15:00','yyyy-MM-dd');
1720972800
```



## 时间戳转时间
from_unixtime : 时间戳转时间

```sql
用法 : from_unixtime(unix_time[, format])
解释 : 仅传入unix_time 参数就返回 yyyy-MM-dd HH:mm:ss 格式的时间,否则返回format格式的日期
例子 : 
-- 将时间戳转日期
select from_unixtime(1721016732);
2024-07-15 12:12:12
-- 将时间戳转换成特定格式日期
select from_unixtime(1721016732,'yyyy-MM-dd');
2024-07-15
```



> 我们可以使用unix_timestamp 和 from_unixtime 来完成所有的日期操作,比如日期的加减,时间加减,日期差,时间差等,但是为了方便还有些封装函数可以使用,但是时间加减和作差只支持日期格式的,其他格式还得是这俩函数
>

## 获取时间的各个维度
```sql
获取日期 : 
select to_date('2024-07-15 12:12:12');
2024-07-15

获取年 : 
select year('2024-07-15 12:12:12');
2024

获取月 : 
select month('2024-07-15 12:12:12');
7

获取周 : (注意 : 第一个星期是从本年第一个大于3天的星期的星期一开始计算的)
select weekofyear('2024-07-15 12:13:14');
29

获取天 : 
select day('2024-07-15 12:12:12');
select dayofmonth('2024-07-15 12:12:12');
15

获取时 : 
select hour('2024-07-15 12:13:14');
12

获取分 : 
select minute('2024-07-15 12:13:14');
13

获取秒 : 
select second('2024-07-15 12:13:14');
14
```



## 获取两个日期差多少天
datediff : 获取两个日期差多少天

```sql
用法 : datediff(end_date, start_date)
解释 : 返回 end_date - start_date 的日期差值
例子 : 
select datediff('2024-07-15','2024-07-14');
1
select datediff('2024-07-15 00:00:00','2024-07-14 23:59:00');
1
select datediff('2024-07-15','2024-07-16');
-1
```



## 日期加减
date_add : 增加日期

```sql
用法 : date_add(start_date, num_days)
解释 : 返回在start_date之后num_days的日期
例子 : 
select date_add('2024-07-15',10);
2024-07-25
select date_add('2024-07-15',-1);
2024-07-14
select date_add('2024-07-15 12:13:14',1);
2024-07-16
```



date_sub : 减少日期

```sql
用法 : date_sub(start_date, num_days)
解释 : 返回比start_date早num_days的日期。
例子 : 
select date_sub('2024-07-15',10);
2024-07-05
select date_sub('2024-07-15',-1);
2024-07-16
select date_add('2024-07-15 12:13:14',1);
2024-07-14
```



## 月份加减
add_months : 月份加减,正数加,负数减

```sql
用法 : add_months(start_date, num_months)
解释 : 返回start_date增加n月后的日期
例子 : 
select add_months('2024-12-12 13:14:21',1);
2025-01-12
select add_months('2024-03-31 13:14:21',-1);
2024-02-29
```





## 日期格式化
date_format

```sql
用法 : date_format(date/string, fmt)
解释 : 将日期/字符串转换为日期格式fmt指定格式的string值。
例子 :
select date_format('2024-07-15 12:13:14','yyyy-MM-dd');
2024-07-15
```



## 获取当前日期
curren_date : 获取当前日期

```sql
用法 : current_date()
解释 : 获取当前日期
例子 :
select current_date();
2024-08-12
```



## 获取当前的时间(精确到毫秒)
current_timestamp : 获取当前的时间(精确到毫秒)

```sql
用法 : current_timestamp()
解释 : 获取当前的时间(精确到毫秒)
例子 :
select current_timestamp();
2024-08-12 23:04:42.161
```



# 六.数字处理
## 精度处理
round : 四舍五入精度处理

```sql
用法 : round(x[, d])
解释 : 把x四舍五入到小数点后d位
例子 : 
select round(3.1415)
3.0
select round(3.1415926,4);
3.1416
```



floor : 向下取整

```sql
用法 : floor(x)
解释 : 求不大于x的最大整数
例子 : 
select floor(6.6)
6
```



ceil/ceiling : 向上取整

```sql
用法 : ceil(x) / ceiling(x)
解释 : 求不小于x的最小整数
例子 : 
select ceil(3.3);
4
```





## 随机数
rand : 获取随机数

```sql
用法 : rand([send])
解释 : 返回一个0到1之间的伪随机数[0,1)
注意 : 包含0但是不包含1,rand的底层实现函数是java.util.Random#nextDouble()
如果传入一个seed值,就会返回一个固定的随机值
例子 : 
select rand();
0.2584322362378255
select rand(10);
0.7304302967434272
select rand(10);
0.7304302967434272
```



## 求绝对值
abs : 求绝对值

```sql
用法 : abs(x)
解释 : 求x的绝对值
例子 : 
select abs(-10);
10
select abs(10);
10
```



## 指数运算
exp : 求指数e的n次方

```sql
用法 : exp(x)
解释 : 求指数e的n次方
例子 : 
select exp(2);
7.38905609893065
```

ln : 自然对数函数

```sql
用法 : ln(x)
解释 : 求指数x的自然对数
例子 : 
select ln(7.38905609893065);
2.0
```



## 幂运算
pow/power : 幂运算

```sql
用法 : pow(x1, x2) / power(x1, x2)
解释 : 求x1的x2次方,返回double类型
例子 : 
select pow(2,3);
8.0
select power(2,3);
8.0
```



## 对数运算
log10 : 10为底的对数

```sql
用法 : log10(x)
解释 : 返回x以10为底的对数
例子 : 
select log10(10);
1.0
```



log2 : 2为底的对数

```sql
用法 : log2(x)
解释 : 返回x以2为底的对数
例子 : 
select log2(4);
2.0
```



log : 对数函数

```sql
用法 : log([b], x)
解释 : 返回x以b为底的对数,默认是以指数e(2.718281828459045)为底
例子 : 
select log(2.718281828459045);
1.0
select log(2,4);
2.0
```



## 开方
sqrt : 开方

```sql
用法 : sqrt(x)
解释 : 返回x的平方根(square root)
例子 : 
select sqrt(4);
2.0
```



cbrt : 开立方

```sql
用法 : cbrt(x)
解释 : 返回x的立方根(cube root)
例子 : 
select cbrt(27);
3.0
```



## 进制转换
conv : 进制转换

```sql
用法 : conv(num, from_base, to_base)
解释 : 将数值num,从from_base的进制转换成to_base的进制
例子 : 
select conv(11,10,16);
B
select conv(5,10,2);
101
```



bin : 转换为2进制

```sql
用法 : bin(n)
解释 : 返回n的二进制
例子 : 
select bin(5);
101
```



hex : 转换为16进制

```sql
用法 : hex(n)
解释 : 返回n的16进制
例子 : 
select hex(11);
B
```



unhex : 将十六进制参数转换对应ASCII码的图形显示([ascii码表](https://www.yuque.com/antgcode/ry5al9/tux16ez7ctmiknxz))

```sql
用法 : unhex(n)
解释 : 将十六进制参数转换对应ASCII码的图形显示
例子 : 
select unhex('21');
!
select unhex(61);
a
select unhex(41);
A
```



## 三角函数
sin : 正弦函数

```sql
用法 : sin(n)
解释 : 求n的正弦值
例子 : 
select sin(1);
0.8414709848078965
```



cos : 余弦函数

```sql
用法 : cos(n)
解释 : 求n的余弦值
例子 : 
select cos(1);
0.5403023058681398
```



asin : 反正弦函数

```sql
用法 : asin(n)
解释 : 求n的反正弦值,并且 1>=n>=-1,否则返回NaN
例子 : 
select asin(1);
1.5707963267948966
select asin(1.2);
NaN
```



acos : 反余弦函数

```sql
用法 : acos
解释 : 求n的反余弦值,并且 1>=n>=-1,否则返回NaN
例子 : 
select acos(1);
0.0
select acos(1.2);
NaN
```



tan : 正切函数

```sql
用法 : tan(x)
解释 : 求x的正切值,x是个弧度
例子 : 
select tan(1);
1.5574077246549023
```



atan : 反正切函数

```sql
用法 : atan(x)
解释 : 求x的反正切值,x是个弧度
例子 : 
select atan(1);
0.7853981633974483
```



degrees : 将弧度转换为角度

```sql
用法 : degrees(x)
解释 : 将弧度转换为角度
例子 : 
select degrees(1);
57.29577951308232
```

## 其他
div  : 用a除以b舍入到长整数

```sql
用法 : a div b
解释 : 用a除以b舍入到长整数
例子 : 
select 1 div 2;
0
select 2 div 2;
1
```



e : 返回自然数e

```sql

用法 : e()
解释 : 返回自然数e
例子 : 
select e();
2.718281828459045
```



positive : 这是一个无用的函数,输入什么返回什么

```sql
用法 : positive(a)
解释 : 返回a
例子 : 
select positive(10);
10
select positive('a');
a
```



negative : 数值取反,正数变负数,负数变正数

```sql
用法 : negative(a)
解释 : 返回 -a,如果传入的不是数字就返回null
例子 : 
select negative(10);
-10
select negative(-10);
10
select negative('a');
NULL
```



pmod : 取正模

```sql
用法 : pmod(a,b)
解释 : (计算正模)Compute the positive modulo
这个函数不太理解有什么作用,规律大概如下 : 
1.如果a和b都是正数,则和正常取模一样
2.如果a是正数,b是负数,则取值规则是res=a%(-b)+b
3.若果a是负数,b是正数,则取值规则是res=-((-a)%b)+b
4.如果a和b都是负数,则取值规则是res=-(-a%-b)
例子 : 
select pmod(10,7);
3
select pmod(10,-7);
4
select pmod(-10,7);
-4
select pmod(-10,-7);
-3

和%的对比
select 10%7;
3
select 10%-7;
3
select -10%7;
-3
select -10%-7;
-3

这俩的相同点和不同点大概也可以看出来了
就是结果的符号位是由被除数a决定的
%是比较正常的取模
pmod的话,如果除数是负数,结果就是两个整数取模然后再加上这个除数b的值
```



# 七.聚合函数
> 为了做统计我们先做一列数据,然后基于这列数据来做统计,直接使用sql来生成
>

基础数据

```sql
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select col from base;
+------+--+
| col  |
+------+--+
| 0    |
| 1    |
| 2    |
| 3    |
| 4    |
| 5    |
| 6    |
| 7    |
| 8    |
| 9    |
+------+--+
```



## 计数
count : 计数

```sql
用法 : 
count(*)
count(expr)
count(DISTINCT expr[, expr...])

解释 : 
count(*) 或者count(1)等 :  返回总共的行数,null值也会算
count(expr) :  返回总共的行数,但是不包含null值
count(DISTINCT expr[, expr...]) :  返回非null的去重后的行数

例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select count(1) n from base;
10
```



## 求和
sum : 求和

```sql
用法 : sum(x)
解释 : 返回一列数字的和
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select sum(col) n from base;
45.0
```



## 求平均
avg : 求平均

```sql
用法 : avg(x)
解释 : 返回一列数字的平均值
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select avg(col) n from base;
4.5
```



## 求最大
max : 求最大

```sql
用法 : max(x)
解释 : 返回一列数字的最大值
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select max(col) n from base;
9
```





## 求最小
min : 求最小

```sql
用法 : min(x)
解释 : 返回一列数字的最小值
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select min(col) n from base;
0
```



## 总体方差
var_pop : 求方差

方差公式 : 

![](1721200667574-3cf62b4f-5a3b-4534-8bb9-77c01e30d3e1.png)

方差的作用 : 分析数据与均值的离散程度,方差越大,说明数据的波动越大

```sql
用法 : var_pop(x)
解释 : 返回一列数字的总体方差
例子 :
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select var_pop(col) n from base;
8.25 
((0-4.5)^2 + (1-4.5)^2 + ...(9-4.5)^2)/10=8.25
```



## 样本方差
var_samp : 样本方差

样本方差的公式就是 方差的的分母换成(n-1)

```sql
用法 : var_samp(x)
解释 : 返回一列数字的样本方差
例子 :
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select var_samp(col) n from base;
9.166666666666666
((0-4.5)^2 + (1-4.5)^2 + ...(9-4.5)^2)/(10-1)=9.166666666666666
```



## 总体标准差
stddev_pop : 总体标准差

```sql
用法 : stddev_pop
解释 : 返回一列数字的总体标准差(总体方差开方)
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select stddev_pop(col) n from base;
2.8722813232690143
```

## 样本标准差
stddev_samp : 样本标准差

```sql
用法 : stddev_pop
解释 : 返回一列数字的样本标准差(样本方差开方)
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select stddev_samp(col) n from base;
3.0276503540974917
```



## 总体协方差
> 公式 : covar_pop(x,y)=avg((x-avg(x))*(y-avg(y)))
>
> 方差是协方差的一种特殊情况,也就是x和y相等的时候
>
> 
>
>**总体协方差用于分析两个变量的总体误差**，‌它衡量的是两个变量之间的线性关系强度和方向。‌具体来说，‌协方差分析可以帮助我们了解两个变量是如何一起变化的。‌如果两个变量的变化趋于一致，‌它们的协方差就是正值，‌这表明它们之间存在正相关关系；‌如果变化方向相反，‌协方差就是负值，‌表示它们之间存在负相关关系。‌此外，‌如果两个变量是统计独立的，‌它们的协方差为零。‌因此，‌协方差不仅告诉我们两个变量之间的关系类型，‌还提供了关于这种关系强度的一个量化指标。‌
>

```sql
用法 : covar_pop(x,y)
解释 : 求x和y两列的总体协方差
例子 : 
create table tmp.antgeek(
col1 int,
col2 int
);
insert into tmp.antgeek(col1,col2) values
(1,2),
(2,3),
(3,4);
select covar_pop(col1,col2) from tmp.antgeek;
0.6666666666666666
```



## 样本呢协方差
```sql
用法 : covar_samp(x,y)
解释 : 求x和y两列的样本协方差,样本协方差就是总体协方差公式中,分母是数据量n-1
例子 : 
create table tmp.antgeek(
col1 int,
col2 int
);
insert into tmp.antgeek(col1,col2) values
(1,2),
(2,3),
(3,4);
select covar_samp(col1,col2) from tmp.antgeek;
1.0
```



## 百分位函数(中位数)
percentile : 百分位函数(可以用来求中位数)

```sql
用法 : percentile(expr, pc)
解释 : 返回expr在pc(范围:[0,1])处的百分位数。PC可以是双精度或双精度数组
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
-- 中位数
select percentile(cast(col as bigint),0.5) n from base;
4.5
-- 传入数组,返回结果也是数组
select percentile(cast(col as bigint),array(0.1,0.5)) n from base;
[0.9,4.5]
```



## 近似百分位函数
percential_approx : 近似百分位函数

```sql
用法 : percentile_approx(expr, pc, [nb])
解释 : 对于非常大的数据，从直方图中计算近似的百分位数，使用可选参数[nb]作为要使用的直方图bin的数量。nb值越高(nb默认是10000)，近似值越精确，但代价是内存占用越高。
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select percentile_approx(cast(col as bigint),0.5) n from base;
4.0
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select percentile_approx(cast(col as bigint),0.5,100000) n from base;
4.0
```



## 直方图
histogram_numeric : 直方图函数

```sql
用法 : histogram_numeric(expr, nb)
解释 : 使用nb个bin计算数字 expr 的直方图。(为了构建直方图，第一步是将值的范围分段，即将整个值的范围分成一系列间隔，然后计算每个间隔中有多少值)
最后返回的结果是x : 横坐标; y : 纵坐标
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,7,8,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select histogram_numeric(cast(col as bigint),5) n from base;
[{"x":0.5,"y":2.0},{"x":2.0,"y":1.0},{"x":3.5,"y":2.0},{"x":5.5,"y":2.0},{"x":8.0,"y":3.0}]
```

画直方图的方式 : [https://baijiahao.baidu.com/s?id=1670799862542929913&wfr=spider&for=pc](https://baijiahao.baidu.com/s?id=1670799862542929913&wfr=spider&for=pc)

几个重要的概念 : 

极差(R) : 最大-最小

组数(k) : 横坐标的数量,也就是参数中的nb

组距(d) : d=R/k



## 皮尔逊相关系数
>**‌**[Pearson相关系数](https://www.baidu.com/s?tn=44004473_8_oem_dg&wd=Pearson%E7%9B%B8%E5%85%B3%E7%B3%BB%E6%95%B0&usm=4&ie=utf-8&rsv_pq=814f11080001e063&oq=pearson%E7%9B%B8%E5%85%B3%E7%B3%BB%E6%95%B0&rsv_t=ba14bzHJnAoI5AF%2Bdzqo47XBflrEzXdzzL%2Fp95jNe3W6QGOW80DG2MFiJdd2fZ3kfugQXi%2BIi9Q&sa=re_dqa_zy)是一种用于度量两个变量之间线性相关程度的统计指标。 它由统计学家‌[卡尔·皮尔逊](https://www.baidu.com/s?tn=44004473_8_oem_dg&wd=%E5%8D%A1%E5%B0%94%C2%B7%E7%9A%AE%E5%B0%94%E9%80%8A&usm=4&ie=utf-8&rsv_pq=814f11080001e063&oq=pearson%E7%9B%B8%E5%85%B3%E7%B3%BB%E6%95%B0&rsv_t=4e33rG1t2XwkDrJXS0iDJeYA9%2BWlHx4rTIsyhk5Fn0Luy6nzLcKYiooRvJQmzzi0gASxFwhmjiA&sa=re_dqa_zy)提出，其值介于-1和1之间。当两个变量完全正相关时，相关系数为1；完全负相关时，相关系数为-1；没有线性相关关系时，相关系数为0
>

公式 : 



corr : 计算皮尔逊相关系数

```sql
用法 : corr(col1,col2)
解释 :
用于计算两个数值型列之间的皮尔逊相关系数。皮尔逊相关系数用于衡量两个变量之间的线性相关性。其范围在 -1 到 1 之间：
1 表示完全正相关
-1 表示完全负相关
0 表示无相关性
例子 : 
create table tmp.antgeek(
col1 int,
col2 int
);
insert into tmp.antgeek(col1,col2) values
(1,2),
(2,3),
(3,4);
select corr(col1,col2) from tmp.antgeek;
0.9999999999999999

解释 : 
1,2,3 
均值2
2,3,4
均值3
分子 : (1-2)*(2-3) + (2-2)*(3-3) + (3-2)*(4-3) = 2
分母 : sqrt((1-2)^2 + (2-2)^2 + (3-2)^2) * sqrt((2-3)^2 + (3-3)^2 + (4-3)^2) = 
结果 1

分子 : x的每个值减去均值乘y的每个值减去均值 将所有结果求和
分母 : x的每个值减去均值的二次方求和 然后再开方得出结果a,对y进行同样操作登出结果b,分母为a*b
```



## 


# 八.复合类型函数
## hive支持的数据类型
基本类型

+ TINYINT
+ SMALLINT
+ INT
+ BIGINT
+ BOOLEAN
+ FLOAT
+ DOUBLE
+ STRING
+ BINARY (Hive 0.8.0以上才可用)
+ TIMESTAMP (Hive 0.8.0以上才可用)

复合类型

+ arrays: ARRAY<data_type>
+ maps: MAP<primitive_type, data_type>
+ structs: STRUCT<col_name : data_type [COMMENT col_comment], ...>
+ union: UNIONTYPE<data_type, data_type, ...>

## 数组
### 构建数组和访问数组
```sql
用法 : array(n0, n1...)
解释 : 用给定的元素创建一个数组,数组下标从0开始
例子 : 
select array(1,2,3);
[1,2,3]

select array('A','n','t','g','e','e','k');
["A","n","t","g","e","e","k"]

select array(1,2,3)[0];
1
```



### 判断一个值是否在数组中
array_contains

```sql
用法 : array_contains(array, value)
解释 : 判断一个值是否在数组中,是的话返回true,否则false
例子 : 
select array_contains(array(1,2,3,4),2);
true
select array_contains(array(1,2,3,4),7);
false
```



### 将一列聚合成一个数组
collect_list

```sql
用法 : collect_list(x)
解释 : 返回的一个数组
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,0,9,7,8,9,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select collect_list(col) from base;
["0","1","2","3","4","5","6","0","9","7","8","9","9"]
```

### 将一列去重后聚合成一个数组
collect_set

```sql
用法 : collect_set(x)
解释 : 返回去重后的一个数组
例子 : 
with base as (
select col from (select '0,1,2,3,4,5,6,0,9,7,8,9,9' as a) t lateral view explode(split(a,',')) tmp as col
)
select collect_set(col) from base;
["0","1","2","3","4","5","6","9","7","8"]
```



## Map
### 构建Map和访问Map
```sql
用法 : map(key0, value0, key1, value1...)
解释 : 用给定的k,v对创建一个map
例子 : 
select map('k1','v1','k2','v2');
{"k1":"v1","k2":"v2"}

select map('k1','v1','k2','v2')['k2'];
v2
```



## Struct
### 构建struct和访问struct
struct : 无名称构建

```sql
用法 : struct(col1, col2, col3, ...)
解释 : 用给定的字段值创建一个结构体
例子 : 
select struct('a','b',1,0.3);
{"col1":"a","col2":"b","col3":1,"col4":0.3}
select struct('a','b',1,0.3).col1;
a
```



named_struct  : 带名称构建

```sql
用法 : named_struct(name1, val1, name2, val2, ...)
解释 : 用给定的字段值创建一个结构体
例子 : 
select named_struct('k1','a','k2','b','k3',1,'k4',0.3);
{"k1":"a","k2":"b","k3":1,"k4":0.3}

select named_struct('k1','a','k2','b','k3',1,'k4',0.3).k2;
b

select named_struct('k1','a','k2','b','k3',1,'k4',0.3,'k5',array(1,2),'k6',map('k61','1','k62',2),'k7',named_struct('k71','tom'));
{"k1":"a","k2":"b","k3":1,"k4":0.3,"k5":[1,2],"k6":{"k61":"1","k62":"2"},"k7":{"k71":"tom"}}

select named_struct('k1','a','k2','b','k3',1,'k4',0.3,'k5',array(1,2),'k6',map('k61','1','k62',2),'k7',named_struct('k71','Antgeek')).k7.k71;
Antgeek
```



## Union
### 构建union类型
create_union : 用给定的tag和数据结构,构建一个uniontype 类型

```sql
用法 : create_union (tag, val1, val2, …)
解释 : 返回一个uniontype 类型{i:obj} 其中i就是tag,obj是第tag个元素,tag从0开始,超出下标会报错
用法 : 
select create_union(0,1,'a',array(1,2),named_struct('k1','v1','k2','v2'));
{0:1}
select create_union(1,1,'a',array(1,2),named_struct('k1','v1','k2','v2'));
{1:"a"}
select create_union(2,1,'a',array(1,2),named_struct('k1','v1','k2','v2'));
{2:[1,2]}
select create_union(3,1,'a',array(1,2),named_struct('k1','v1','k2','v2'));
{3:{"k1":"v1","k2":"v2"}}
select create_union(4,1,'a',array(1,2),named_struct('k1','v1','k2','v2'));
Error: java.io.IOException: org.apache.hadoop.hive.ql.metadata.HiveException: Error evaluating create_union(4,1,'a',array(1,2),named_struct('k1','v1','k2','v2')) (state=,code=0)
```



# 九.开窗函数
cume_dist (待处理)

dense_rank

# 十.其他
## 断言函数
assert_true : 如果不是true就抛出异常,否则返回null

```sql
用法 : assert_true(condition)
解释 : 如果condition不是true就抛出异常,否则返回null,应用场景可能是如果某个函数不符合条件直接不执行后续操作了,可以快速中断sql
例子 : 
select assert_true(1=2);
Error: java.io.IOException: org.apache.hadoop.hive.ql.metadata.HiveException: ASSERT_TRUE(): assertion failed. (state=,code=0)
select assert_true(1=1);
NULL
```



## 类型转换函数
binary : 将字符或者字符串转换为二进制形式

```sql
用法 : binary(a)
解释 : 将a转换成二进制
例子 : 
select binary('a');
```



cast : 将某个数值转换类型

```sql
用法 : cast(value as data_type)
解释 : 将某个数值转换类型(这个准确来说不是一个函数,而是一个语法,show functions中看不到这个)
例子 : 
select cast()
```

## base64函数
base64 : 将一个二进制参数转换为base64字符串

```sql
用法 : base64(bin)
解释 : 将一个二进制参数转换为base64字符串
例子 : 
select base64(binary('1'));
MQ==
select base64(cast('1' as binary));
MQ==
```



## NULL值处理函数
coalesce : 返回第一个非null的值,一般用来处理null值

```sql
用法 : coalesce(a1, a2, ...)
解释 : 返回第一个非null的值,一般用来处理null值
例子 : 
select coalesce(null,1,2);
1
select coalesce(null,null,2);
2
select coalesce(null,null,null);
NULL
```



## 获取当前数据库
current_database : 获取当前数据库

```sql
用法 : current_database()
解释 : 获取当前的数据库名称
例子 : 
select current_database();
default
```



## 获取当前用户
current_user : 获取当前用户

```sql
用法 : current_user()
解释 : 获取当前的用户名称
例子 : 
select current_user();
work
```

## 字符编码解码
decode : 将二进制数据用特定字符集解码

```sql
用法 : decode(bin, str)
解释 : 使用第二个参数字符集解码第一个参数,第一个参数必须是个二进制数据,否则会报错
第二个参数的字符编码类型必须存在,否则也会报错
例子 : 
select decode(binary('a'),'utf8');
a
select decode(binary('a'),'utf');
Error: Error while compiling statement: FAILED: UnsupportedCharsetException utf (state=42000,code=40000)
select decode('a','utf8');
Error: Error while compiling statement: FAILED: SemanticException [Error 10016]: Line 1:14 Argument type mismatch ''a'': The first argument to Decode() must be binary (state=42000,code=10016)
```



encode : 将一个字符串用字符集进行编码

```sql
用法 : decode(str, str)
解释 : 将第一个参数字符串用第二个参数字符集进行编码
例子 : 
select encode('a','utf8');
```



## 返回第n个字符串
elt : 返回第n个字符串

```sql
用法 : elt(n, str1, str2, ...)
解释 : 返回第n个字符串,下标从1开始
例子 : 
select elt(0,'a','b','c');
NULL
select elt(1,'a','b','c');
a
```

# 参考
[https://cloud.tencent.com/developer/article/2061278](https://cloud.tencent.com/developer/article/2061278)

[https://blog.csdn.net/qq_46893497/article/details/109960185](https://blog.csdn.net/qq_46893497/article/details/109960185)

[https://stackoverflow.com/questions/31820469/in-hive-what-does-the-positive-function-do](https://stackoverflow.com/questions/31820469/in-hive-what-does-the-positive-function-do)

[https://cloud.tencent.com/developer/article/1808498](https://cloud.tencent.com/developer/article/1808498)

