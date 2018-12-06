GameGlobal.msgpack = require('./js/libs/msgpack.min.js')
GameGlobal.Int64BE = require('./js/libs/int64-buffer.min.js').Int64BE
GameGlobal.fpnn = require('./js/libs/fpnn.min.js')
GameGlobal.rtm = require('./js/libs/rtm.min.js')

let client = new rtm.RTMClient({
    dispatch: '35.167.185.139:13325',
    uid: new rtm.RTMConfig.Int64(654321),
    token: '609C0728A2D9115280E1A00ACE4873B3',
    autoReconnect: true,
    connectionTimeout: 20 * 1000,
    pid: 1000012,
    ssl: true,
    proxyEndpoint: 'infra-dev.ifunplus.cn:13556',
    platformImpl: new fpnn.WechatImpl()
});

client.on('error', function (err) {

    console.error(err);
});

client.on('close', function (retry) {

    console.log('closed!', retry);
});

client.on('login', function (data) {

    if (data.error) {

        console.error(data.error);
        // need to get new token
        return;
    }

    //send to server
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
});

//push service
let pushName = rtm.RTMConfig.SERVER_PUSH.recvPing;
client.processor.on(pushName, function (data) {

    console.log('\n[PUSH] ' + pushName, data);
});

client.login();