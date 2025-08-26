# yarn常用命令
```shell
# 列出正在执行的所有任务
yarn application -list
# 根据applicationID kill 某个应用
yarn application -kill <application_id>
# 查看 YARN 集群中的节点状态
yarn node -list
```



# hdfs常用命令
- 1.文件 / 目录操作
    - `hadoop fs -ls /path`：列出指定路径下的文件和目录（类似 Linux `ls`）。
    - `hadoop fs -ls -R /path`：递归列出所有子目录和文件。
    - `hadoop fs -mkdir /path`：创建目录（类似 `mkdir`）。
    - `hadoop fs -mkdir -p /path/subdir`：递归创建多级目录（类似 `mkdir -p`）。
    - `hadoop fs -rm /file`：删除文件。
    - `hadoop fs -rm -r /dir`：递归删除目录（类似 `rm -r`）。
    - `hadoop fs -cp /src /dest`：复制文件 / 目录到目标路径。
    - `hadoop fs -mv /src /dest`：移动 / 重命名文件 / 目录。
- 2.文件上传与下载
    - `hadoop fs -put local_file /hdfs_path`：将本地文件上传到 HDFS。
    - `hadoop fs -get /hdfs_file local_path`：将 HDFS 文件下载到本地。
    - `hadoop fs -appendToFile local_file /hdfs_file`：将本地文件内容追加到 HDFS 文件。
- 3.文件内容查看
    - `hadoop fs -cat /hdfs_file`：查看文件内容（类似 `cat`）。
    - `hadoop fs -tail /hdfs_file`：查看文件末尾内容（类似 `tail`）。
    - `hadoop fs -head /hdfs_file`：查看文件开头内容（类似 `head`）。
- 4.权限与空间管理
    - `hadoop fs -chmod 755 /file`：修改文件权限（类似 `chmod`）。
    - `hadoop fs -chown user:group /file`：修改文件所有者和组（类似 `chown`）。
    - `hadoop fs -du /path`：查看目录 / 文件的大小。
    - `hadoop fs -df /`：查看 HDFS 整体磁盘使用情况。
- 5.提交MapReduce任务
    - `hadoop jar jar包路径 主类名 [参数]`：提交 MapReduce 作业



