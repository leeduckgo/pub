### 准备环境

你需要安装 Docker

- 如果你使用 Mac，下载 [Docker 客户端（Mac）](https://docs.docker.com/docker-for-mac/install/)
- 如果你使用 Windows，下载 [Docker 客户端（Windows）](https://docs.docker.com/docker-for-windows/install/)

克隆这个项目： `git clone https://github.com/Press-One/pub.git`

然后运行：

```
./install.sh
```

### 生成配置

运行向导程序，根据提示注册两个 Mixin App 即可生成配置文件

```
./scripts/generate_config.sh
```

（备注：在启动向导程序时，需要花一点时间初始化环境，估计耗时 5 分钟，完成之后才会进入向导程序）

### 启动

```
./start.sh
```

项目启动完毕，你可以访问写作站服务：[http://localhost:4000](http://localhost:4000)

### 打包镜像

```
./build.sh
```
