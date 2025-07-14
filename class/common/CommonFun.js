
const fs = require('fs');
var UUID = require('uuid');
const crypto = require('crypto-js');

function CommonFun() {
    var self = this;

    /**
     * Convert the obtained content into a string, pay attention to control
     * @param {*} attiArray 
     * @param {*} dataObj 
     * @param {*} defaultVal 
     * @returns 
     */
    this.getValueToString = function (attiArray, dataObj, defaultVal) {
        var value = self.getValue(attiArray, dataObj, defaultVal);
        if (value == undefined) return value;

        if (typeof value === 'string') return value;
        else if (typeof value === 'number' || typeof value === 'bigint') {
            return value.toString();
        }
        else {
            return defaultVal;
        }
    }

    this.getValue = function (attiArray, dataObj, defaultVal) {
        var lastValue = undefined;

        try {
            for (var i = 0; i < attiArray.length; i++) {
                if (lastValue == undefined) {
                    if (typeof dataObj === 'object' && 'hasOwnProperty' in dataObj) {
                        if (!dataObj.hasOwnProperty(attiArray[i])) return defaultVal;
                        else lastValue = dataObj[attiArray[i]];
                    }
                    else {
                        if (dataObj[attiArray[i]] == undefined) return defaultVal;
                        else lastValue = dataObj[attiArray[i]];
                    }

                } else {
                    if (i < attiArray.length - 1) {
                        if (typeof dataObj === 'object' && 'hasOwnProperty' in dataObj) {
                            if (!lastValue.hasOwnProperty(attiArray[i])) return defaultVal;
                        }
                        else {
                            if (lastValue[attiArray[i]] == undefined) return defaultVal;
                        }
                    }

                    lastValue = lastValue[attiArray[i]];
                }
            }

            if (lastValue == null) return defaultVal;

            return lastValue;
        }
        catch (e) {
            return defaultVal;
        }
    }

    /**
     * Set value
     * @param attiArray
     * @param value
     * @param dataObj
     * @returns {undefined}
     */
    this.setValue = function (attiArray, value, dataObj) {
        var lastValue = undefined;

        for (var i = 0; i < attiArray.length; i++) {
            if (lastValue == undefined) {
                lastValue = dataObj[attiArray[i]];
                if (i == attiArray.length - 1) {
                    dataObj[attiArray[i]] = value;
                }
            } else {
                if (i < attiArray.length - 1) {
                    if (!lastValue.hasOwnProperty(attiArray[i])) return undefined;
                    lastValue = lastValue[attiArray[i]];
                } else {
                    lastValue[attiArray[i]] = value;
                }
            }
        }
    }

    /**
     * Generate a random string based on the content
     */
    this.createMD5Key32 = function (content) {
        var md5Str = crypto.MD5(content).toString();
        return md5Str;
    }


    /**
     * 3DES encryption
     * @param content
     * @param secret
     * @returns {*}
     */
    this.desc3Encry = function (content, secret) {
        var key = crypto.enc.Utf8.parse(secret);
        var encContent = crypto.TripleDES.encrypt(content, key, {
            // iv: iv,
            mode: crypto.mode.ECB,
            padding: crypto.pad.Pkcs7
        });
        return encContent.toString();
    }

    this.desc3Decry = function (content, secret) {
        var key = crypto.enc.Utf8.parse(secret);
        var decContent = crypto.TripleDES.decrypt(content, key, {
            //iv: iv,
            mode: crypto.mode.ECB,
            padding: crypto.pad.Pkcs7
        });
        return decContent.toString(crypto.enc.Utf8);
    }

    this.getUUID = function () {
        var randKey = crypto.MD5(UUID.v1() + UUID.v4());
        return randKey.toString();
    }

    /**
     * Split string
     * @param posStr
     * @param spe
     * @returns {{}}
     */
    this.splitString = function (posStr, spe = ",") {
        var returnVal = [];
        var strArry = posStr.split(spe);
        if (strArry != undefined && Array.isArray(strArry) && strArry.length > 0) {
            for (var i = 0; i < strArry.length; i++) {
                returnVal[i] = strArry[i];
            }
        }
        return returnVal;
    }

    this.converValToString = function (key, obj) {
        var val = obj[key];
        if (val != undefined) {
            if (typeof val === 'string') return;
            else {
                obj[key] = JSON.stringify(val);
            }
        }
        else {
            obj[key] = "";
        }
    }

    this.converStringToVal = function (key, obj) {
        var val = obj[key];
        if (val != undefined) {
            if (typeof val === 'string') {
                obj[key] = JSON.parse(val);
            }
        }
    }


    this.readFile = function (filePath, callBack) {
        fs.readFile(filePath, 'utf8', function (err, dataStr) {
            if (err) {
                if (callBack) callBack(err, dataStr);
            }
            else {
                console.log(dataStr);
                if (callBack) callBack(err, Buffer.from(dataStr).toString('base64'));
            }
        });
    }

    this.readFileNoBase64 = function (filePath, callBack) {
        fs.readFile(filePath, 'utf8', function (err, dataStr) {
            if (err) {
                if (callBack) callBack(err, dataStr);
            }
            else {
                console.log(dataStr);
                if (callBack) callBack(err, dataStr);
            }
        });
    }

    this.writeFile = function (filePath, content, module, callBack) {
        fs.open(filePath, module, function (err, fd) {
            if (!err) {
                fs.write(fd, content, function (err) {
                    fs.close(fd, function (err) {
                    });
                    if (!err) {
                        if (callBack) callBack(err, 'Writing file successful!');
                    } else {
                        if (callBack) callBack(err, 'fail to write to file');
                    }
                });
            } else {
                if (callBack) callBack(err, 'fail to write to file');
            }
        });
    }

    this.changeObjToString = function (obj) {
        if (typeof obj == 'object') {
            return JSON.stringify(obj);
        }
        if (typeof obj == 'array') {
            return JSON.stringify(obj);
        }
        return obj;
    }

    this.isStringEmpty = function (str) {
        return !str || str.length === 0;
    }

    this.isParamEmpty = function (param) {
        if (param == undefined || param == null) {
            return true;
        }
        return false;
    }
    this.checkArrayParamNotEmpty = function (dataObj, keyArray) {
        var valArray = [];
        for (var i = 0; i < keyArray.length; i++) {
            var val = dataObj[keyArray[i]];
            valArray.push(val);
        }
        return self._checkParamNotEmpty(valArray);
    }

    this._checkParamNotEmpty = function (valArray) {
        for (var i = 0; i < valArray.length; i++) {
            if (valArray[i] == undefined) return false;
            if (typeof valArray[i] == 'string') {
                if (valArray[i].length <= 0) return false;
            }
        }
        return true;
    }

    this.fileIsExist = function (filePath) {
        return fs.existsSync(filePath);
    }
}

module.exports = new CommonFun();