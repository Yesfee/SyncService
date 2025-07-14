var express = require('express');
var router = express.Router();
const LimiteHelper = require('../class/common/LimiteHelper');
var ProtocolHelper = require('../class/common/ProtocolHelper');
const Codefine = require('../class/common/Codefine');
var SyncHelper = require('../class/business/SyncHelper');
var logger = require("../class/common/logger").getLogger('default');

/* syncSignList */
router.post('/syncSignList.do', LimiteHelper.syncLimit, function (req, res, next) {
    res.setHeader("Content-Type", Codefine.JSON_CONTENT);
    if (!ProtocolHelper.checkPostParamNotEmpty(req, ["signList", "syncVer", "hash", "userSign"])) {
        return res.send(JSON.stringify(ProtocolHelper.getErrorMsgObj(-1, __("Parameter not allowed to be empty, please check!"))));
    }
    try {
        var syncHelper = new SyncHelper();
        syncHelper.syncSignList(req, res, (err, data) => {
            return res.send(JSON.stringify(data));
        });
    }
    catch (e) {
        logger.error("[syncSignList.do] have error:" + e);
        return res.send(JSON.stringify(ProtocolHelper.getErrorMsgObj(-1, __("Operation failed, please try again later!"))));
    }
});

/* syncData */
router.post('/syncData.do', LimiteHelper.syncLimit, function (req, res, next) {
    res.setHeader("Content-Type", Codefine.JSON_CONTENT);
    if (!ProtocolHelper.checkPostParamNotEmpty(req, ["data", "syncVer", "hash", "userSign", "encType"])) {
        return res.send(JSON.stringify(ProtocolHelper.getErrorMsgObj(-1, __("Parameter not allowed to be empty, please check!"))));
    }
    try {
        var syncHelper = new SyncHelper();
        syncHelper.syncData(req, res, (err, data) => {
            return res.send(JSON.stringify(data));
        });
    }
    catch (e) {
        logger.error("[syncData.do] have error:" + e);
        return res.send(JSON.stringify(ProtocolHelper.getErrorMsgObj(-1, __("Operation failed, please try again later!"))));
    }
});

module.exports = router;