
var mysql = require('mysql');
var sysConfig = require('../../config/SysConfig')

const pool = mysql.createPool(sysConfig.dbConfig);

module.exports = pool;