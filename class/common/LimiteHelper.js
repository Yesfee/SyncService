
var ProtocolHelper = require('./ProtocolHelper');
const Codefine = require('./Codefine');
const rateLimit = require("express-rate-limit");

//Interface access restriction class
var LimiteHelper = {
    limiter: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        statusCode: 200,
        message: () => { return ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("Request too fast, please try again later")) },
    }),

    comLimiter: rateLimit({
        windowMs: 5 * 1000, // 5s
        max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        statusCode: 200,
        message: () => { return ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("Request too fast, please try again later")) },
    }),

    syncLimit: rateLimit({
        windowMs: 60 * 1000, // 60s
        max: 120, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        statusCode: 200,
        message: () => { return ProtocolHelper.getErrorMsgObj(Codefine.RESULT_FAIL, __("Request too fast, please try again later")) },
    }),
}

module.exports = LimiteHelper;