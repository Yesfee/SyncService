/**
 * Database operation class
 */

var logger = require("../common/logger").getLogger('default');
const pool = require("./mydb")

var CMysqlCtrl = {
}

/**
 * Execute SQL and return results
 * @param sql
 * @param callBack
 */
CMysqlCtrl.querySql = function (sql, params, callBack) {
    pool.getConnection(function (err, conn) {
        if (err) {
            logger.error("Failed to retrieve database connection pool:" + err);
            if (callBack) callBack(err, "pool.getConnection error");
        }
        else {
            conn.query(sql, params, function (err, rows) {
                if (err) {
                    logger.error("SQL execution failed, sql=" + sql + ", param=" + JSON.stringify(params) + ", err=" + err);
                }
                if (callBack) callBack(err, rows);
                conn.release();
            });
        }
    });
}

/**
 * Insert a data
 * @param {*} table 
 * @param {*} dataObj 
 * @param {*} callBack 
 */
CMysqlCtrl.insertNewRecord = function (table, dataObj, callBack) {
    var keyArray = Object.keys(dataObj);
    var valueArray = [];
    var keyStr = "(";
    var valueStr = "(";
    for (var i = 0; i < keyArray.length; i++) {
        var key = keyArray[i];
        keyStr += "`" + key + "`";
        valueStr += "?";
        valueArray.push(dataObj[key]);
        if (i != keyArray.length - 1) {
            keyStr += ",";
            valueStr += ",";
        }
    }
    keyStr += ")";
    valueStr += ")";
    var sql = "INSERT INTO " + table + " " + keyStr + " VALUES " + valueStr;
    CMysqlCtrl.querySql(sql, valueArray, callBack);
}

/**
 * Update data
 * @param {*} table 
 * @param {*} dataObj 
 * @param {*} callBack 
 */
CMysqlCtrl.updateRecord = function (table, dataObj, conditionStr, conditionArray, callBack) {
    var keyArray = Object.keys(dataObj);
    var valueArray = [];
    var keyStr = "";
    for (var i = 0; i < keyArray.length; i++) {
        var key = keyArray[i];
        keyStr += "`" + key + "`=?";
        valueArray.push(dataObj[key]);
        if (i != keyArray.length - 1) {
            keyStr += ",";
        }
    }

    if (Array.isArray(conditionArray)) {
        valueArray.push.apply(valueArray, conditionArray);
    }
    else {
        valueArray.push(conditionArray);
    }

    var sql = "UPDATE " + table + " SET " + keyStr + " WHERE " + conditionStr;
    CMysqlCtrl.querySql(sql, valueArray, callBack);
}

/**
 * Close database connection
 */
CMysqlCtrl.close = function () {

}

module.exports = CMysqlCtrl;
