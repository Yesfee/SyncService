/**
 * CmdFolder table operation class
 */
var mysqlCtl = require('./mysqlCtrl')

function CmdFolderTable() {
    var self = this;
    this.table = "cmdfolder";

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
}

module.exports = CmdFolderTable;