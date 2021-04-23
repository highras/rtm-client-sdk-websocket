globalThis.md5 = require('./js/libs/md5.min.js')
globalThis.msgpack = require('./js/libs/msgpack.min.js')
globalThis.Int64BE = require('./js/libs/int64.min.js').Int64BE
globalThis.fpnn = require('./js/libs/fpnn.min.js')
globalThis.rtm = require('./js/libs/rtm.min.js')

let client = new rtm.RTMClient({ 
    ssl_endpoint: 'rtm-intl-frontgate.ilivedata.com:13322',
    autoReconnect: true,
    connectionTimeout: 10 * 1000,
    pid: 11000001,
    platformImpl: new fpnn.WechatImpl()
});

client.on('ErrorRecorder', function(err) {
    console.error("on ErrorRecorder");
    console.error(err);
});

client.on('ReloginCompleted', function(successful ,retryAgain, errorCode, retriedCount) {
    console.log("ReloginCompleted, successful: " + successful + " retryAgain: " + retryAgain + " errorCode: " + errorCode + " retriedCount: " + retriedCount);
});

client.on('SessionClosed', function(errorCode) {
    console.log("SessionClosed, errorCode: " + errorCode);
    if (errorCode == rtm.RTMConfig.ERROR_CODE.RTM_EC_INVALID_AUTH_TOEKN) {
        // token error, need to get a new token and login again.
    }
});

client.login(uid, token, function(ok, errorCode) {

    if (errorCode == fpnn.FPConfig.ERROR_CODE.FPNN_EC_OK) {

        if (!ok) {
            // token error, need to get a new token
            return;
        } else {
            // login successfully

            client.sendMessage(new rtm.RTMConfig.Int64(123789), 8, 'hello !', '', new rtm.RTMConfig.Int64(0), 10 * 1000, function (err, data) {

                if (err) {
        
                    if (err.hasOwnProperty('mid')) {
        
                        console.error('\n mid:' + err.mid.toString(), err.error);
                        return;
                    }
        
                    console.error('\n ', err);
                }
        
                if (data) {
        
                    if (data.hasOwnProperty('mid')) {
        
                        console.log('\n mid:' + data.mid.toString(), data.payload);
                        return;
                    }
        
                    console.log('\n ', data);
                }
            });

        }

    } else {
        // login error
    }
}, 60 * 1000);

//push service
let pushName = rtm.RTMConfig.SERVER_PUSH.recvPing;
client.processor.on(pushName, function (data) {

    console.log('\n[PUSH] ' + pushName, data);
});

