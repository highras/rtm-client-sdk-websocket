# fpnn rtm sdk websocket #

* 不支持`FPNN`加密链接, 支持`SSL`加密链接
* 支持源码方式接入, 支持自定义构建

#### 关于三方包依赖 ####
* [fpnn](https://github.com/highras/fpnn-sdk-webjs) `./libs/fpnn.min.js`
* [md5](https://github.com/emn178/js-md5) `./libs/md5.min.js`
* [msgpack](https://github.com/kawanet/msgpack-lite) `./libs/msgpack.min.js`
* [Int64BE](https://github.com/kawanet/int64-buffer) `./libs/int64.min.js`

#### Promise支持 ####
* 支持动态转Promise接口
* 参考:[Promise.promisifyAll](http://bluebirdjs.com/docs/api/promise.promisifyall.html)

#### 关于编译 ####
* 支持源码编译[详见: `./webpack.config.js` `./package.json`]
* 编译依赖的模块[`babel-loader` `babel-preset-es2015` `webpack` `webpack-cli`]
* 编译内置的模块[`buffer`]
```
yarn run build
```

#### 一个例子 ####
* 参考 `./test/test-wechat.js`

```javascript
GameGlobal.md5 = require('./js/libs/md5.min.js')
GameGlobal.msgpack = require('./js/libs/msgpack.min.js')
GameGlobal.Int64BE = require('./js/libs/int64.min.js').Int64BE
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
```