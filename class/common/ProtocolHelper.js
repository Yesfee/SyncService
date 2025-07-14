const SysConfig = require("../../config/SysConfig");
const Codefine = require("./Codefine");
const CommonFun = require("./CommonFun");
const AESCrypto = require("./AESCrypto");
var logger = require("./logger").getLogger('default');

//Basic protocol processing class
function ProtocolHelper() {
    var self = this;

    //Check if the variable in the POST request is empty
    this.checkPostParamNotEmpty = function (req, keyArray) {
        var valArray = [];
        for (var i = 0; i < keyArray.length; i++) {
            var val = req.body[keyArray[i]];
            valArray.push(val);
        }
        return self.checkParamNotEmpty(valArray);
    }

    //Check if the variable in the GET request is empty
    this.checkGetParamNotEmpty = function (req, keyArray) {
        var valArray = [];
        for (var i = 0; i < keyArray.length; i++) {
            var val = req.query[keyArray[i]];
            valArray.push(val);
        }
        return self.checkParamNotEmpty(valArray);
    }

    /**
     * 先用本地的storeKey解密,再用SecretKey的加密
     * @param {*} req 
     * @param {*} content 
     */
    this.reEncodeWithSecretKey = function (req, content) {
        if (CommonFun.isParamEmpty(content) || CommonFun.isStringEmpty(content)) return "";
        var conDec = self.decodeWithConfigKey(content);
        var conEncode = AESCrypto.encrypt(conDec, SysConfig.secretKey);
        return conEncode;
    }

    /**
     * 先用secretKey的AES解码,再用本地的AES加密
     * @param {*} req 
     * @param {*} content 
     */
    this.reEncodeWithConfigKey = function (req, content) {
        if (CommonFun.isStringEmpty(content)) return "";
        var conDec = self.decodeWithSecretKey(req, content);
        var conEncode = AESCrypto.encrypt(conDec, SysConfig.storeKey);
        return conEncode;
    }

    //用用户secretKey的3DES解码
    this.decodeWithSecretKey = function (req, content) {
        var conDes = AESCrypto.decrypt(content, SysConfig.secretKey);
        return conDes;
    }

    //Use AES decoding in the configuration file
    this.decodeWithConfigKey = function (content) {
        var conDes = AESCrypto.decrypt(content, SysConfig.storeKey);
        return conDes;
    }

    //Check if the data of the value is empty
    this.checkParamNotEmpty = function (valArray) {
        for (var i = 0; i < valArray.length; i++) {
            if (valArray[i] == undefined) return false;
            if (typeof valArray[i] == 'string') {
                if (valArray[i].length <= 0) return false;
            }
        }
        return true;
    }

    this.getErrorMsgObj = function (result, msg) {
        logger.error("getErrorMsgObj:result=" + result + ", msg=" + msg);
        return {
            "result": result.toString(),
            "hash": Date.now().toString(),
            "msg": msg
        };
    }

    this.getOKMsgObj = function (msg) {
        logger.info("getOKMsgObj:" + msg);
        return {
            "result": "0",
            "hash": Date.now().toString(),
            "msg": msg
        };
    }

    //Obtain failed data information
    this.getDataErrorMsg = function (result, msg, dataObj) {
        var resultObj = self.getDataMsg(dataObj);
        resultObj["result"] = result.toString();
        resultObj["msg"] = msg;

        return resultObj;
    }

    this.getDataMsg = function (dataObj, pageObj = null) {
        if (CommonFun.isParamEmpty(dataObj)) {
            logger.info("getDataMsg: return OK");
            return {
                "result": Codefine.RESULT_SUCESS.toString(),
                "hash": Date.now().toString(),
                "msg": "OK",
            };
        }
        else {
            self.changeObjToString(dataObj);

            logger.info("getDataMsg:" + JSON.stringify(dataObj));
            var returnVal = {
                "result": Codefine.RESULT_SUCESS.toString(),
                "hash": Date.now().toString(),
                "msg": "OK",
                "data": dataObj
            };
            if (!CommonFun.isParamEmpty(pageObj)) {
                self.changeObjToString(pageObj);
                returnVal["page"] = pageObj;
            }
            return returnVal;
        }
    }

    //Convert the value inside the object to a string if it is an int type
    this.changeObjToString = function (obj) {
        if (CommonFun.isParamEmpty(obj)) return;

        var dataArray = Object.keys(obj);

        for (var i = 0; i < dataArray.length;) {
            var item = obj[dataArray[i]];
            if (CommonFun.isParamEmpty(item)) {
                //如果该值是undefine或者null, 则移除
                delete obj[dataArray[i]];
                dataArray.splice(i, 1);
            }
            else {
                var type = typeof item;
                if (type === 'object' || type === 'array') {
                    self.changeObjToString(item);
                }
                if (type === 'number') {
                    obj[dataArray[i]] = item.toString();
                }
                i++;
            }
        }
    }

    //Return HTTP status code
    this.returnHttpHeadResponse = function (res, stateCode, msg) {
        res.writeHead(stateCode);
        res.write(msg);
        res.end();
    }
}

module.exports = new ProtocolHelper();