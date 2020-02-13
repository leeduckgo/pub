飞帖写作站，负责把数据上传到区块链

![Flying pub architecture](https://xue-images.pek3b.qingstor.com/213-pub.png)

## 准备环境

你需要安装 Docker

- 如果你使用 Mac，下载 [Docker 客户端（Mac）](https://docs.docker.com/docker-for-mac/install/)
- 如果你使用 Windows，下载 [Docker 客户端（Windows）](https://docs.docker.com/docker-for-windows/install/)

克隆基础服务仓库（数据库，redis，同步服务）：`git clone https://github.com/Press-One/flying-pub`

克隆飞帖写作站仓库：`git clone https://github.com/Press-One/pub.git`

## 生成配置

进入 `flying-pub` 仓库

运行向导程序，根据提示注册两个 Mixin App 即可生成配置文件

```
./scripts/generate_config.sh
```

（备注：在启动向导程序时，需要花一点时间初始化环境，估计耗时 5 分钟，完成之后才会进入向导程序）

配置生成之后，请打开 `atom.env`，手动修改一行代码

```
TOPIC=e4d4d92b8bb666fcd72a3483c95cf945f19c2bd9;http://${YOUR_HOST_IP}:8000/api/webhook/medium
```

把你的电脑的本地 IP 填到 `${YOUR_HOST_IP}`

## 启动

### 基础服务

进入 `flying-pub` 仓库

```
 ./scripts/start.sh
```

### 写作站服务

进入 `pub` 仓库，复制配置文件

```
cp ../flying-pub/config/config.pub.js ./be/config.js
cp ../flying-pub/config/config.pub-wallet.js ./be/config.wallet.js
```

启动

```
./start.sh
```

项目启动完毕，你可以访问写作站服务：[http://localhost:4000](http://localhost:4000)

## 打包镜像

```
./build.sh
```
