<p align="center">
  <img width="200" src="https://www.yesfee.com/assets/img/logo.png">
</p>

English | [简体中文](./README.zh-CN.md) |

## Introduction
SyncService is a backend Nodejs program that synchronizes data with the FinalTerm program on the server side, based on Yesfee's official self built synchronization server documentation.

## Preface preparation
- To deploy this program, you need to prepare at least one server host and install the following software on the server host:

	**1: Mysql**, Create a database, set up account and other permissions, and create the database tables defined on the Yesfee official website in the database.

	**2: Nodejs (such as 18.20.4)**

Meanwhile, if you need external network access, you may also need to provide a domain name and SSL certificate to ensure the security of data transmission. Of course, this is not necessary.

- The synchronization system requires the use of user identification for recognition. Please stay on the [Yesfee official website](https://www.yesfee.com/download.html) Alternatively, download FinalTerm software from various application markets, register an account with FinalTerm, and log in.

## Deployment
- Download the program code to the server you want to deploy.

- Go to the config directory, copy the SysConfig. sample. js file from the current directory and name it SysConfig. js

- Generate a 32-bit storeKey, appKey, and SecretKey random string by yourself

- Open the SysConfig. js file and fill in the relevant parameters according to the instructions in the file.
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
- Go back to the root directory of the program and run it
```dash
npm install
```
- Install the plugins required for system operation. After completion, run the following command to start the system:
```dash
npm run start
```
- After the system is started, enter http://{server domain name or IP}: {port} in the browser to access it. If SyncService can be seen, it indicates that the server is running normally. To ensure the long-term operation of the server, commands can be loaded into it through software such as pm2. Regarding the use of PM2, please search and install it yourself.

## Connect
After setting up your own synchronization server, you can synchronize the synchronization data in the software, such as server management, shell management, and my system, to your own server by configuring your own synchronization server information in the synchronization server settings in the FinalTerm software device.

## Attention
- The storeKey local storage key is very important. If lost, it can cause encrypted data to be unable to be decrypted and the data to be unusable.

- The appKey and SecretKey are very important, please save them carefully. If they are unfortunately leaked, please regenerate them yourself and update them to the SysConfig. js and FinalTerm software configurations of SyncService.

- You can share the access address, appKey, and SecretKey of the synchronization server with your colleagues or subordinates, allowing them to also synchronize data to your own server.

