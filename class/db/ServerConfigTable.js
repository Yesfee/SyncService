/**
 * ServerConfig table operation class
 */
var mysqlCtl = require('./mysqlCtrl')

function ServerConfigTable() {
    var self = this;
    this.table = "serverconfig";

    /**
     * get current data
     * @param {*} userId 
     * @param {*} callBack 
     */
    this.getAllDataList = function (userId, callBack) {
        var sql = "select * from " + self.table + " where userId = ?";
        mysqlCtl.querySql(sql, userId, callBack);
    }

    /**
     * get general data
     * @param {*} userId 
     * @param {*} callBack 
     */
    this.getCommDataList = function (userId, callBack) {
        var sql = "select unid, title, host, port, " + this.table + ".desc, account, sType, cTime, state  from " + self.table + " where userId = ?";
        mysqlCtl.querySql(sql, userId, callBack);
    }

    /**
     * Insert a data
     * @param dataObj
     * @param callBack
     */
    this.insertNewRecord = function (dataObj, callBack) {
        mysqlCtl.insertNewRecord(self.table, dataObj, callBack);
    }

    /**
     * Update data
     * @param dataObj
     * @param callBack
     */
    this.updateRecord = function (dataObj, callBack) {
        var conditionStr = "unid=? And userId=?";
        var conditionArray = [dataObj["unid"], dataObj["userId"]];
        delete dataObj["unid"];
        delete dataObj["userId"];
        mysqlCtl.updateRecord(self.table, dataObj, conditionStr, conditionArray, callBack);
    }

    /**
     * Delete data
     * @param {*} dataObj 
     * @param {*} callBack 
     */
    this.delRecord = function (userId, unid, callBack) {
        var sql = "DELETE from " + self.table + " where userId = ? And unid = ?";
        mysqlCtl.querySql(sql, [userId, unid], callBack);
    }

}

module.exports = ServerConfigTable;