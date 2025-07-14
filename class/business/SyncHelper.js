const CommonFun = require("../common/CommonFun");
const ProtocolHelper = require('../common/ProtocolHelper');
var SyncDBHelper = require("../db/SyncDBHelper");
const Codefine = require('../common/Codefine');
const SysConfig = require("../../config/SysConfig");
const AESCrypto = require("../common/AESCrypto");
var logger = require("../common/logger").getLogger('default');

/**
 * Synchronous operation control class
 */
function SyncHelper() {
    var self = this;
    this.randAuthKey = "";

    this.syncTables = ["serverfolder", "serverconfig", "cmdfolder", "cmdcontent", "opsystem"];
    this.syncDB = new SyncDBHelper();

    //Is the table name in the table to be synchronized
    this._isInSyncTable = function (tableName) {
        var lowTableName = tableName.toLowerCase();
        for (var i = 0; i < self.syncTables.length; i++) {
            if (lowTableName == self.syncTables[i]) return true;
        }
        return false;
    }


    this._addTableDataToArray = function (req, tableName, updateArray, deleteArray, callBack) {
        var userId = self._getUserSign(req);

        self.syncDB.getAllSignList(req, userId, tableName, (err, rows, fields) => {
            if (err) {
                callBack(err, false);
            } else {
                if (rows.length > 0) {
                    var updateObj = {
                        "tableName": tableName,
                        "data": []
                    };

                    var deleteObj = {
                        "tableName": tableName,
                        "data": []
                    };

                    self._doClientDataArray(rows, updateArray, deleteArray, updateObj, deleteObj, false);
                }
                callBack(false, true);
            }
        });
    }

    //Obtain the values of the requested parameters
    this._getTheReqObj = function (jsonArray, lowTableName) {
        for (var i = 0; i < jsonArray.length; i++) {
            var obj = jsonArray[i];
            var tableName = obj["tableName"];

            if (tableName.toLowerCase() == lowTableName) {
                return i;
            }
        }
        return -1;
    }

    this._getUserSign = function (req) {
        return CommonFun.getValue(["userSign"], req.body, "");
    }

    //Processing client filtering identity requests
    this._filterClientSignListReq = function (req, lowTableName, jsonArray, uploadArray, updateArray, deleteArray, callBack) {
        var userId = self._getUserSign(req);

        var index = self._getTheReqObj(jsonArray, lowTableName);
        if (index < 0) {
            callBack(false, false);
        }
        else {
            var obj = jsonArray[index];
            var tableName = obj["tableName"];
            var dataArray = CommonFun.getValue(["data"], obj, []);
            var uploadObj = {
                "tableName": tableName,
                "data": []
            };
            var updateObj = {
                "tableName": tableName,
                "data": []
            };
            var deleteObj = {
                "tableName": tableName,
                "data": []
            };

            self.syncDB.getAllSignList(req, userId, tableName, (err, rows, fields) => {
                if (err) {
                    jsonArray.splice(index, 1);
                    callBack(true, false);
                    return;
                }
                else {
                    if (rows.length <= 0) {
                        //If there is no content on the server side, notify the client to upload it
                        self._doClientDataArray(dataArray, uploadArray, deleteArray, uploadObj, deleteObj, true);
                    }
                    else {
                        if (dataArray.length <= 0) {
                            self._doClientDataArray(rows, updateArray, deleteArray, updateObj, deleteObj, false);
                        }
                        else {
                            //If there is data on both the client and server sides, compare and update it
                            for (var pos = 0; pos < rows.length; pos++) {
                                var item = rows[pos];
                                var ret = self._doWithData(item, dataArray);
                                if (ret == 4) {
                                    if (!self._itemIsDelete(item)) {
                                        item["state"] = Codefine.PARAM_1;
                                        self.syncDB.disableData(userId, tableName, item["unid"], (err, rows, fields) => { });
                                    }
                                    deleteObj.data.push(self._formatSignReturnObj(item));
                                }
                                else if (ret == 3) {
                                    updateObj.data.push(item);
                                }
                                else if (ret == 2) {
                                    uploadObj.data.push(self._formatSignReturnObj(item));
                                }
                                else if (ret == 1) {

                                }
                                else if (ret == 0) {
                                    updateObj.data.push(item);
                                }
                            }

                            //When everything is processed If the dataArray on the client side still contains data, update the server-side
                            self._uploadRemainDataArray(uploadObj.data, dataArray, deleteObj.data);

                            //Add the final result of processing to the data
                            if (updateObj.data.length > 0) {
                                updateArray.push(updateObj);
                            }
                            if (uploadObj.data.length > 0) {
                                uploadArray.push(uploadObj);
                            }
                            if (deleteObj.data.length > 0) {
                                deleteArray.push(deleteObj);
                            }
                        }
                    }

                    jsonArray.splice(index, 1);
                    callBack(false, true);
                    return;
                }
            });
        }
    }

    this._doForLoop = function (req, jsonArray, index, uploadArray, updateArray, deleteArray, callBack) {
        if (index < self.syncTables.length) {
            var lowTableName = self.syncTables[index];

            self._filterClientSignListReq(req, lowTableName, jsonArray, uploadArray, updateArray, deleteArray, (err, isGet) => {
                if (err) {
                    return callBack(err, isGet);
                }
                else {
                    return self._doForLoop(req, jsonArray, ++index, uploadArray, updateArray, deleteArray, callBack);
                }
            });
        }
        else {
            callBack(false, false);
        }
    }

    this.checkCanSync = function (req, res, callBack, funcBack) {
        try {
            var hashEnc = CommonFun.getValue(["hash"], req.body, "");
            var hash = AESCrypto.decrypt(hashEnc, SysConfig.secretKey);
            if (CommonFun.isStringEmpty(hash)) {
                if (callBack) return callBack(true, ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("Authentication failed, please contact the administrator!")));
                return;
            }
            //检查appKey+","+{当前客户端的13位时间戳}
            const hashArray = hash.split(',');
            if (hashArray.length != 2) {
                if (callBack) return callBack(true, ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("Authentication failed, please contact the administrator!")));
                return;
            }

            var appKey = hashArray[0];
            var reqTime = hashArray[1];
            if (appKey != SysConfig.appKey) {
                if (callBack) return callBack(true, ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("Authentication failed, please contact the administrator!")));
                return;
            }

            var nowTime = Date.now();
            if (nowTime - reqTime > SysConfig.reqAllowMaxTime) {
                if (callBack) return callBack(true, ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("Bad request, please contact the administrator!")));
                return;
            }

            self.randAuthKey = reqTime;
            if (funcBack) return funcBack(true);
        } catch (error) {
            logger.error("checkCanSync error=" + error);
            if (callBack) return callBack(true, ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("Authentication failed, please contact the administrator!")));
        }
    }

    //Processing of verifying and signing the returned data
    this._returnValAuth = function (resDict) {
        var hashEnc = AESCrypto.encrypt(self.randAuthKey, SysConfig.secretKey);
        resDict["hash"] = hashEnc;
    }

    this.syncSignList = function (req, res, callBack) {

        self.checkCanSync(req, res, callBack, (result) => {
            if (!result) return;

            var jsonArray = JSON.parse(req.body["signList"]);
            var index = 0;
            var uploadArray = [];   //The data to be uploaded by the client
            var updateArray = [];   //The data to be updated by the client
            var deleteArray = [];   //The data to be deleted by the client

            self._doForLoop(req, jsonArray, index, uploadArray, updateArray, deleteArray, (err, isGet) => {
                if (err) {
                    return callBack(true, ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("System error, please contact the administrator!")));
                }
                else {
                    var resDict = {};
                    if (uploadArray.length > 0) resDict["upload"] = uploadArray;
                    if (updateArray.length > 0) resDict["update"] = updateArray;
                    if (deleteArray.length > 0) resDict["delete"] = deleteArray;

                    self._returnValAuth(resDict);

                    if (callBack) {
                        callBack(false, ProtocolHelper.getDataMsg(resDict));
                    }
                }
            });
        });
    }

    //Notify the client to upload the remaining data
    this._uploadRemainDataArray = function (uploadObjArray, dataArray, deleteObjArray) {
        if (dataArray.length > 0) {
            for (var i = 0; i < dataArray.length; i++) {
                var item = dataArray[i];
                if (self._itemIsDelete(item)) {
                    deleteObjArray.push(self._formatSignReturnObj(item));
                }
                else {
                    uploadObjArray.push(self._formatSignReturnObj(item));
                }
            }
        }
    }

    //Return the simplified data object of the comparison protocol
    this._formatSignReturnObj = function (item) {
        return {
            "unid": CommonFun.getValue(["unid"], item, ""),
            "state": CommonFun.getValue(["state"], item, "0"),
        }
    }

    //Determine whether the data is in a deleted state
    this._itemIsDelete = function (item) {
        var state = CommonFun.getValue(["state"], item, 0);
        if (typeof state == 'string') state = parseInt(state);
        return state == 0 ? false : true;
    }

    /**
     * Processing data for client requests
     */
    this._doClientDataArray = function (dataArray, chuliArray, deleteArray, chuliObj, deleteObj, isDelete) {
        for (var k = 0; k < dataArray.length; k++) {
            var dataItem = dataArray[k];
            if (self._itemIsDelete(dataItem)) {
                if (isDelete)
                    deleteObj.data.push(dataItem);
            }
            else {
                chuliObj.data.push(dataItem);
            }
        }
        if (deleteObj.data.length > 0) deleteArray.push(deleteObj);
        if (chuliObj.data.length > 0) chuliArray.push(chuliObj);
    }

    /**
     * Processing data, 
     * if it exists and needs to be deleted, return 4; 
     * if it exists and needs to be updated, return 3 from the client; 
     * if it exists and needs to be updated, return 2 from the server; 
     * if it exists and does not need to be updated, return 1; 
     * all three remove the data from the dataArray; 
     * if it does not exist, return 0
     * @param {*} item 
     * @param {*} dataArray 
     * @returns 
     */
    this._doWithData = function (item, dataArray) {
        for (var k = 0; k < dataArray.length; k++) {
            var dataItem = dataArray[k];
            if (dataItem["unid"] == item["unid"]) {
                dataArray.splice(k, 1);
                if (self._itemIsDelete(item) || self._itemIsDelete(dataItem)) {
                    if (item["cTime"] >= dataItem["cTime"]) {
                        return 4;
                    }
                    else {
                        return 2;
                    }
                }

                if (item["cTime"] > dataItem["cTime"]) {
                    return 3;
                }
                else if (item["cTime"] == dataItem["cTime"]) {
                    return 1;
                }
                else {
                    return 2;
                }
            }
        }

        if (self._itemIsDelete(item)) return -1;
        return 0;
    }

    //Process inner data array loop
    this._doTableDataLoop = function (req, index, dataArray, userId, tableName, callBack) {
        if (index < dataArray.length) {
            var item = dataArray[index];
            self.syncDB.updateOrInsert(req, item, userId, tableName, (err) => {
                if (err) {
                    callBack(true);
                    return;
                }
                else {
                    self._doTableDataLoop(req, ++index, dataArray, userId, tableName, callBack);
                }
            });
        }
        else {
            callBack(false);
        }
    }

    //Processing layer cyclic storage
    this._doSyncDataLoop = function (req, index, jsonArray, userId, callBack) {
        if (index < jsonArray.length) {
            var item = jsonArray[index];
            var tableName = CommonFun.getValue(["tableName"], item, "");
            var dataArray = CommonFun.getValue(["data"], item, []);
            if (tableName.length <= 0 || dataArray.length <= 0 || self._itemIsDelete(item)) {
                return self._doSyncDataLoop(req, ++index, jsonArray, userId, callBack);
            }
            else {
                self._doTableDataLoop(req, 0, dataArray, userId, tableName, (err) => {
                    if (err) {
                        callBack(true);
                    }
                    else {
                        return self._doSyncDataLoop(req, ++index, jsonArray, userId, callBack);
                    }
                });
            }
        }
        else {
            callBack(false);
        }
    }

    //Process client uploaded data
    this.syncData = function (req, res, callBack) {
        self.checkCanSync(req, res, callBack, (result) => {
            if (!result) {
                return;
            }
            var jsonArray = JSON.parse(req.body["data"]);
            var userId = self._getUserSign(req);

            self._doSyncDataLoop(req, 0, jsonArray, userId, (err) => {
                if (err) {
                    return callBack(true, ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("System error, please contact the administrator!")));
                }
                else {
                    if (callBack) {
                        callBack(false, ProtocolHelper.getOKMsgObj('OK'));
                    }
                }
            });
        });
    }
}

module.exports = SyncHelper;