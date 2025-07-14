<p align="center">
  <img width="200" src="https://www.yesfee.com/assets/img/logo.png">
</p>

简体中文 | [English](./readme.md) |

## 简介
SyncService是一个后端Nodejs程序，是依据Yesfee公司官方公布的[自建同步服务器文档]()，实现的与FinalTerm程序进行同步数据的服务器端程序。

## 前序准备
- 要布署此程序，你需要准备至少一台服务器主机，在服务器主机上安装如下的软件：

	**1: Mysql**, 创建数据库，设置好账号等权限, 将yesfee官网中定义的数据库表在数据库中进行创建。

	**2: Nodejs（如18.20.4)**

	同时,如果你需要外网访问，你可能还需要提供域名与SSL证书以保证数据传输的安全。当然这不是必须的。

- 同步系统需要用到用户标识做识别，请前住[Yesfee官网](https://www.yesfee.com/download.html)或者各应用市场去下载FinalTerm软件，使用FinalTerm注册账号并登录。

## 布署
- 下载本程序代码到你要布署的服务器上。
- 进入config目录下，将SysConfig_sample.js文件在当前目录下复制一份出来，将其命名成SysConfig.js
- 自行生成32位长度的storeKey, appKey与SecretKey随机字符串
- 打开SysConfig.js文件，依据该文件的说明将相关参数填入其中。
```javascript
var SysConfig = {
    nod_env: "production", //The operating environment of the system
    //Mysql config
    dbConfig: {				
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'syncdb',
        connectionLimit: 10,
    },
    serverPort: 4000,   //service port
    storeKey: "aCrnTuohqpoNROMDSk5nKKBVChD8AHHz",   //store key 32Byte
    appKey: "QrJWKPsvGXamK116ELMMr8hRlZ0Pt45W",     //32Byte
    secretKey: "6b3324553431d8175f5632ded7874d1d",  //32Byte
    reqAllowMaxTime: 60 * 1000,       //Maximum allowable time for anti replay,millisecond
}
```
- 回到程序的根目录下，运行
```dash
npm install
```
安装系统运行所需要的插件。完成后，运行如下命令启动系统：
```dash
npm run start
```
- 系统启动后，在浏览器中输入http://{服务器域名或IP}:{端口},进行访问，如果能看到SyncService，表明服务器已正常运行。 为了使服务器长久运行，可以通过一些软件，如pm2, 将命令加载进来。关于pm2的使用，请自行搜索安装。

## 连接
自建同步服务器搭建好后，就可以在FinalTerm软件设备里面，在同步服务器设置中，通过配入你自已的同步服务器的信息，将软件中的同步数据：服务器管理，Shell管理与我的系统等的信息同步到你自建的服务器了。

## 注意
- storeKey本地存储密钥非常重要，如果弄丢，会造成加密数据无法解密,数据无法使用。

- appKey与SecretKey非常重要，请一定严重格保存，如果不幸泄露了，请自行重新生成，并更新到SyncService的SysConfig.js与FinalTerm软件配置里面。

- 可以将同步服务器的访问地址，appKey与SecretKey分享给你的同事或下属，充许他们将数据也同步到你自建的服务器上面。
