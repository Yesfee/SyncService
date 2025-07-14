//config
var SysConfig = {
    nod_env: "production", //production, test, development
    dbConfig: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'syncdb',
        connectionLimit: 10,
    },
    serverPort: 4000,   //service port
    storeKey: "hYgoRbDaUYxfqM2hOSWTW4BB12345678",   //store key 32Byte
    appKey: "QrJWKPsvGXamK116ELMMr8hRlZ0Pt45W",     //32Byte
    secretKey: "6b3324553431d8175f5632ded7874d1d",  //32Byte
    reqAllowMaxTime: 60 * 1000,       //Maximum allowable time for anti replay,millisecond
}

module.exports = SysConfig;