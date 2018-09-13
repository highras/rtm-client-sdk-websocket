/**
    微信平台不支持二进制数据结构, 所以需要加入以下三个类库
    ./js/libs/base64-js.js
    ./js/libs/ieee754.js
    ./js/libs/buffer.js

    md5类库
    ./js/libs/md5.min.js

    int64支持
    ./js/libs/int64-buffer.min.js

    msgpack支持
    ./js/libs/msgpack.min.js
*/

import Rtm from './js/rtm/rtm/RTMClient.js'

let client = new Rtm.RTMClient({

    dispatch: '35.167.185.139:13325',
    uid: new Rtm.RTMConfig.Int64(654321),
    token: '609C0728A2D9115280E1A00ACE4873B3',
    autoReconnect: true,
    connectionTimeout: 20 * 1000,
    pid: 1000012,
    recvUnreadMsgStatus: false,
    ssl: true,
    // proxyEndpoint: 'highras.ifunplus.cn:13555'
    proxyEndpoint: 'infra-dev.ifunplus.cn:13555'
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
    client.sendMessage(new Rtm.RTMConfig.Int64(123789), 8, 'hello !', '', 10 * 1000, function (err, data) {

        if (err) {

            console.error('\n[ERR]', err.message);
        }

        if (data) {

            console.log('\n[DATA]', data);
        }
    });
});

//push service
let pushName = Rtm.RTMConfig.SERVER_PUSH.recvPing;
client.processor.on(pushName, function (data) {

    console.log('\n[PUSH] ' + pushName, data);
});

client.login();