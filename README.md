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
* 参考 `./test/index.html` `./test/test-rtm.js` 打开浏览器console输出

```html
<script src="../libs/md5.min.js"></script>
<script src="../libs/int64.min.js"></script>
<script src="../libs/msgpack.min.js"></script>
<script src="../libs/fpnn.min.js"></script>
<script src="../libs/rtm.min.js"></script>
```

```javascript
let client = new rtm.RTMClient({ 
    endpoint: 'rtm-intl-frontgate.ilivedata.com:13321',
    //ssl_endpoint: 'rtm-intl-frontgate.ilivedata.com:13322',
    autoReconnect: false,
    connectionTimeout: 10 * 1000,
    pid: 1000012,
    //platformImpl: new fpnn.WechatImpl()
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
        }

    } else {
        // login error
    }
}, 60 * 1000);

//push service
let pushName = rtm.RTMConfig.SERVER_PUSH.recvMessage;
client.processor.on(pushName, function(data) {

    console.log('\n[PUSH] ' + pushName + ':\n', data);
    // console.log(data.mid.toString());
});

//send message 
client.sendMessage(new rtm.RTMConfig.Int64(123789), 8, 'hello !', '', new rtm.RTMConfig.Int64(0), 10 * 1000, function(err, data) {

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

// destroy
// client.destroy();
```

#### Wechat ####
[Wechat Version](README-WECHAT.md)

#### Events ####

* `event`:
    * `ErrorRecorder`: 内部异常信息输出
        * `err`: **(FPError)** 异常错误结构
    
ErrorRecorder事件只用于异常信息的记录，可将SDK内部产生的一些异常状态和流程输出用于问题排查，请勿在该事件中进行任何其他操作，如重连等。

* `ReloginCompleted`: 重连完成事件
    * `successful`: **(Bool)** 重连是否成功
    * `retryAgain`: **(Bool)** 是否会进行下一次重连尝试
    * `errorCode`: **(Int))** 本次重连收到的错误码
    * `retriedCount`: **(Int)** 已经尝试重连了多少次

在进行自动重连时，每次重连完成都会触发ReloginCompleted事件。

* `SessionClosed`: 连接关闭事件
    * `errorCode`: **(Int)** 造成连接关闭的错误码

#### API ####
* `constructor(options)`: 构造RTMClient
    * `options.endpoint`: **(Optional | string)** rtmGated服务地址, RTM提供
    * `options.ssl_endpoint`: **(Optional | string)** ssl加密rtmGated服务地址, RTM提供
    * `options.pid`: **(Required | number)** 应用编号, RTM提供
    * `options.autoReconnect`: **(Optional | bool)** 是否自动重连, 默认: `true`
    * `options.connectionTimeout`: **(Optional | number)** 超时时间(ms), 默认: `30 * 1000`
    * `options.maxPingIntervalSeconds`: **(Optional | number)** 心跳检查时间，超过多少秒没收到心跳既认为连接断开, 默认: `60`
    * `options.attrs`: **(Optional | object[string, string])** 设置用户端信息, 保存在当前链接中, 客户端可以获取到
    * `options.platformImpl`: **(Optional | Object)** 平台相关接口注入, 默认: `new BrowserImpl()`
    * `options.md5`: **(Optional | function)** `md5`字符串加密方法
    * `options.regressiveStrategy`: **(Optional | Object)** 退行性重连策略

参数endpoint和ssl_endpoint必须至少存在一个, ssl_endpoint代表加密连接方式，当存在ssl_endpoint时忽略endpoint

* `options.regressiveStrategy`: 退行性重连策略
    * `startConnectFailedCount`: 连接失败多少次后，开始退行性处理,默认3
    * `maxIntervalSeconds`: 退行性重连最大时间间隔,默认8
    * `linearRegressiveCount`: 从第一次退行性连接开始，到最大链接时间，允许尝试几次连接，每次时间间隔都会增大,默认4

* `processor`: **(RTMProcessor)** 监听PushService的句柄

* `login(uid, token, callback, timeout)`: 连接并登陆 

* `destroy()`: 断开连接并开始销毁

* `close()`: 断开连接

#### RTM System Functions

Please refer [RTM System Functions](docs/System.md)

#### Chat Functions

Please refer [Chat Functions](docs/Chat.md)

#### Value-Added Functions

Please refer [Value-Added Functions](docs/ValueAdded.md)

#### Messages Functions

Please refer [Messages Functions](docs/Messages.md)

#### Files Functions

Please refer [Files Functions](docs/Files.md)

#### Friends Functions

Please refer [Friends Functions](docs/Friends.md)

#### Groups Functions

Please refer [Groups Functions](docs/Groups.md)

#### Rooms Functions

Please refer [Rooms Functions](docs/Rooms.md)

#### Users Functions

Please refer [Users Functions](docs/Users.md)

#### Data Functions

Please refer [Data Functions](docs/Data.md)
