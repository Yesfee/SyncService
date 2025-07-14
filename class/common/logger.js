var log4js = require('log4js');

global.yfConfig = {
    appenders: {
        dateFile: {
            type: 'dateFile',
            filename: global.appRoot + '/logs/debug.log',
            pattern: 'yyyy-MM-dd',
            maxLogSize: 10 * 1024 * 1024,
            compress: false,
            encoding: 'utf-8',
            alwaysIncludePattern: true,
            daysToKeep: 30,
            flags: 'a+'
        },
        out: {
            type: 'stdout'
        }
    },
    categories: {
        default: { appenders: ['dateFile', 'out'], level: 'debug' },
    },
    disableClustering: true,
    pm2: false,
}

log4js.configure(
    global.yfConfig
);

module.exports = log4js;