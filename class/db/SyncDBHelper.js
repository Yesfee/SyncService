/**
 * Synchronization table operation class
 */
const CommonFun = require('../common/CommonFun');
var mysqlCtl = require('./mysqlCtrl');
var ServerFolderTable = require('./ServerFolderTable');
var ServerConfigTable = require('./ServerConfigTable');
var CmdFolderTable = require('./CmdFolderTable');
var CmdContentTable = require('./CmdContentTable');
var ProtocolHelper = require('../common/ProtocolHelper');
const OpSystemTable = require('./OpSystemTable');

function SyncDBHelper() {
    var self = this;

    this.serverFolderTableName = "serverfolder";
    this.serverConfigTableName = "serverconfig";
    this.cmdFolderTableName = "cmdfolder";
    this.cmdContentTableName = "cmdcontent";
    this.opSystemTableName = "opsystem";

    /**
     * Find the update identifier for the current system
     * @param {*} userId 
     * @param {*} tableName 
     * @param {*} callBack 
     */
    this.getAllSignList = function (req, userId, tableName, callBack) {
        var sql = "select * from " + tableName + " where userId = ?";
        var lowTabelName = tableName.toLowerCase();
        if (lowTabelName == self.serverConfigTableName || lowTabelName == self.opSystemTableName) {
            mysqlCtl.querySql(sql, [userId], (err, rows, fields) => {
                if (err) return callBack(err, rows, fields);

                for (var i = 0; i < rows.length; i++) {
                    var pwd = CommonFun.getValue(["pwd"], rows[i], "");
                    var pwdEnc = ProtocolHelper.reEncodeWithSecretKey(req, pwd);
                    rows[i]["pwd"] = pwdEnc;
                    if (lowTabelName == self.serverConfigTableName) {
                        var priKey = CommonFun.getValue(["priKey"], rows[i], "");
                        var priKeyEnc = ProtocolHelper.reEncodeWithSecretKey(req, priKey);
                        rows[i]["priKey"] = priKeyEnc;
                    }

                }
                callBack(err, rows, fields);
            });
        }
        else {
            mysqlCtl.querySql(sql, [userId], callBack);
        }
    }

    /**
     * Set the data to unavailable state
     * @param {*} userId 
     * @param {*} tableName 
     * @param {*} unid 
     * @param {*} callBack 
     */
    this.disableData = function (userId, tableName, unid, callBack) {
        var sql = "UPDATE " + tableName + " set state=1 WHERE userId = ? AND unid=?";
        mysqlCtl.querySql(sql, [userId, unid], callBack);
    }

    /**
     * Obtain the corresponding record of the current user based on unid
     * @param {*} userId 
     * @param {*} unid 
     * @param {*} callBack 
     */
    this.getDataByUserIdAndUnid = function (userId, unid, tableName, callBack) {
        var sql = "SELECT * FROM " + tableName + " WHERE userId = ? AND unid=?";
        mysqlCtl.querySql(sql, [userId, unid], callBack);
    }

    this.insertWithTableName = function (req, item, userId, lowTabelName, callBack) {
        if (lowTabelName == self.serverFolderTableName) {
            //serverfolder
            var param = {
                "unid": CommonFun.getValue(["unid"], item, ""),
                "title": CommonFun.getValue(["title"], item, ""),
                "sType": CommonFun.getValue(["sType"], item, 0),
                "parentId": CommonFun.getValue(["parentId"], item, ""),
                "userId": userId,
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var sfTable = new ServerFolderTable();
            sfTable.insertNewRecord(param, callBack);
        }
        else if (lowTabelName == self.serverConfigTableName) {
            var pwd = CommonFun.getValue(["pwd"], item, "");
            if (CommonFun.isParamEmpty(pwd)) {
                pwd = CommonFun.getValue(["d_pwd"], item, "");
            }
            var pwdEnc = ProtocolHelper.reEncodeWithConfigKey(req, pwd);

            var account = CommonFun.getValue(["account"], item, "");
            if (CommonFun.isStringEmpty(account)) {
                account = CommonFun.getValue(["d_account"], item, "");
            }

            var priKey = CommonFun.getValue(["priKey"], item, "");
            var priKeyEnc = ProtocolHelper.reEncodeWithConfigKey(req, priKey);
            var param = {
                "userId": userId,
                "unid": CommonFun.getValue(["unid"], item, ""),
                "title": CommonFun.getValue(["title"], item, ""),
                "host": CommonFun.getValue(["host"], item, ""),
                "port": CommonFun.getValue(["port"], item, 22),
                "desc": CommonFun.getValue(["desc"], item, ""),
                "account": account,
                "pwd": pwdEnc,
                "priKey": priKeyEnc,
                "authType": CommonFun.getValue(["authType"], item, 0),
                "sType": CommonFun.getValue(["sType"], item, 0),
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var sfTable = new ServerConfigTable();
            sfTable.insertNewRecord(param, callBack);
        }
        else if (lowTabelName == self.cmdFolderTableName) {
            //cmdFolder
            var param = {
                "unid": CommonFun.getValue(["unid"], item, ""),
                "title": CommonFun.getValue(["title"], item, ""),
                "sType": CommonFun.getValue(["sType"], item, 0),
                "parentId": CommonFun.getValue(["parentId"], item, ""),
                "userId": userId,
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var sfTable = new CmdFolderTable();
            sfTable.insertNewRecord(param, callBack);
        }
        else if (lowTabelName == self.cmdContentTableName) {
            //cmdFolder
            var param = {
                "unid": CommonFun.getValue(["unid"], item, ""),
                "content": CommonFun.getValue(["content"], item, ""),
                "userId": userId,
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var sfTable = new CmdContentTable();
            sfTable.insertNewRecord(param, callBack);
        }
        else if (lowTabelName == self.opSystemTableName) {
            var pwd = CommonFun.getValue(["pwd"], item, "");
            var pwdEnc = ProtocolHelper.reEncodeWithConfigKey(req, pwd);
            //opsystem
            var param = {
                "unid": CommonFun.getValue(["unid"], item, ""),
                "title": CommonFun.getValue(["title"], item, ""),
                "url": CommonFun.getValue(["url"], item, ""),
                "summary": CommonFun.getValue(["summary"], item, ""),
                "account": CommonFun.getValue(["account"], item, ""),
                "pwd": pwdEnc,
                "userId": userId,
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var opsystem = new OpSystemTable();
            opsystem.insertNewRecord(param, callBack);
        }
        else {
            if (callBack) callBack(true, "Not Allow to Operations");
        }
    }

    //插入数据
    this.updateWithTableName = function (req, item, userId, lowTabelName, callBack) {
        if (lowTabelName == self.serverFolderTableName) {
            //serverfolder
            var param = {
                "unid": CommonFun.getValue(["unid"], item, ""),
                "title": CommonFun.getValue(["title"], item, ""),
                "sType": CommonFun.getValue(["sType"], item, 0),
                "parentId": CommonFun.getValue(["parentId"], item, ""),
                "userId": userId,
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var sfTable = new ServerFolderTable();
            sfTable.updateRecord(param, callBack);
        }
        else if (lowTabelName == self.serverConfigTableName) {
            var pwd = CommonFun.getValue(["pwd"], item, "");
            if (CommonFun.isParamEmpty(pwd)) {
                pwd = CommonFun.getValue(["d_pwd"], item, "");
            }
            var pwdEnc = ProtocolHelper.reEncodeWithConfigKey(req, pwd);

            var account = CommonFun.getValue(["account"], item, "");
            if (CommonFun.isStringEmpty(account)) {
                account = CommonFun.getValue(["d_account"], item, "");
            }

            var priKey = CommonFun.getValue(["priKey"], item, "");
            var priKeyEnc = ProtocolHelper.reEncodeWithConfigKey(req, priKey);

            var param = {
                "unid": CommonFun.getValue(["unid"], item, ""),
                "title": CommonFun.getValue(["title"], item, ""),
                "host": CommonFun.getValue(["host"], item, ""),
                "port": CommonFun.getValue(["port"], item, 22),
                "desc": CommonFun.getValue(["desc"], item, ""),
                "account": account,
                "pwd": pwdEnc,
                "priKey": priKeyEnc,
                "authType": CommonFun.getValue(["authType"], item, 0),
                "sType": CommonFun.getValue(["sType"], item, 0),
                "userId": userId,
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var sfTable = new ServerConfigTable();
            sfTable.updateRecord(param, callBack);
        }
        else if (lowTabelName == self.cmdFolderTableName) {
            //cmdFolder
            var param = {
                "unid": CommonFun.getValue(["unid"], item, ""),
                "title": CommonFun.getValue(["title"], item, ""),
                "sType": CommonFun.getValue(["sType"], item, 0),
                "parentId": CommonFun.getValue(["parentId"], item, ""),
                "userId": userId,
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var sfTable = new CmdFolderTable();
            sfTable.updateRecord(param, callBack);
        }
        else if (lowTabelName == self.cmdContentTableName) {
            //cmdFolder
            var param = {
                "unid": CommonFun.getValue(["unid"], item, ""),
                "content": CommonFun.getValue(["content"], item, ""),
                "userId": userId,
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var sfTable = new CmdContentTable();
            sfTable.updateRecord(param, callBack);
        }
        else if (lowTabelName == self.opSystemTableName) {
            var pwd = CommonFun.getValue(["pwd"], item, "");
            var pwdEnc = ProtocolHelper.reEncodeWithConfigKey(req, pwd);
            //opsystem
            var param = {
                "unid": CommonFun.getValue(["unid"], item, ""),
                "title": CommonFun.getValue(["title"], item, ""),
                "url": CommonFun.getValue(["url"], item, ""),
                "summary": CommonFun.getValue(["summary"], item, ""),
                "account": CommonFun.getValue(["account"], item, ""),
                "pwd": pwdEnc,
                "userId": userId,
                "cTime": CommonFun.getValue(["cTime"], item, 0),
                "state": CommonFun.getValue(["state"], item, 0),
            };
            var opsystem = new OpSystemTable();
            opsystem.updateRecord(param, callBack);
        }
    }

    //Insert or update data
    this.updateOrInsert = function (req, item, userId, tableName, callBack) {
        var unid = CommonFun.getValue(["unid"], item, "");
        if (unid.length <= 0) return callBack(false);

        var lowTabelName = tableName.toLowerCase();

        self.getDataByUserIdAndUnid(userId, unid, lowTabelName, (err, rows, fields) => {
            if (err) {
                return callBack(false);
            }
            else {
                if (rows.length <= 0) {
                    //insert data
                    self.insertWithTableName(req, item, userId, lowTabelName, callBack);
                }
                else {
                    //update data
                    self.updateWithTableName(req, item, userId, lowTabelName, callBack);
                }
            }
        });
    }
}

module.exports = SyncDBHelper;