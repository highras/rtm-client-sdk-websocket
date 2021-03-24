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

## 注意： 如果没有ssl连接需求， 请将ssl参数设置为false，同时不需要传proxyEndpoint参数，这样有助于提高性能 ##

```javascript
let client = new rtm.RTMClient({ 
    dispatch: 'rtm-intl-frontgate.ilivedata.com:13325',
    uid: new rtm.RTMConfig.Int64(654321),
    token: '5C65CD872903AAB37211EC468B4A1364',
    autoReconnect: false,
    connectionTimeout: 10 * 1000,
    pid: 1000012,
    ssl: true,
    proxyEndpoint: 'rtm-intl-frontgate.ilivedata.com:13556',
});

client.on('error', function(err) {

    console.error(err);
});

client.on('close', function() {

    console.log('closed!');
});

client.on('login', function(data) {

    if (data.error) {

        console.error(data.error);
        // need to get new token
        return;
    }

    //send to server
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
});

//push service
let pushName = rtm.RTMConfig.SERVER_PUSH.recvMessage;
client.processor.on(pushName, function(data) {

    console.log('\n[PUSH] ' + pushName + ':\n', data);
    // console.log(data.mid.toString());
});

client.login();

// destroy
// client.destroy();
```

#### Wechat ####
[Wechat Version](README-WECHAT.md)

#### Events ####
* `event`:
    * `login`: 登陆
        * `data.endpoint`: **(string)** 当前连接的RTMGate地址, 可在本地缓存, 下次登陆可使用该地址以加速登陆过程, **每次登陆成功需更新本地缓存**
        * `data.error`: **(object)** auth失败, token失效需重新获取

    * `error`: 异常
        * `err`: **(Error)**

    * `close`: 连接关闭
        * `retry`: **(bool)** 是否自动重连

#### API ####
* `constructor(options)`: 构造RTMClient
    * `options.dispatch`: **(Optional | string)** Dispatch服务地址, RTM提供
    * `options.pid`: **(Required | number)** 应用编号, RTM提供
    * `options.uid`: **(Required | Int64)** 用户ID
    * `options.token`: **(Required | string)** 用户登录Token, RTM提供
    * `options.autoReconnect`: **(Optional | bool)** 是否自动重连, 默认: `false`
    * `options.connectionTimeout`: **(Optional | number)** 超时时间(ms), 默认: `30 * 1000`
    * `options.version`: **(Optional | string)** 服务器版本号, RTM提供
    * `options.attrs`: **(Optional | object[string, string])** 设置用户端信息, 保存在当前链接中, 客户端可以获取到
    * `options.ssl`: **(Optional | string)** 是否开启SSL加密, 若开启需设置代理地址 默认: `true`
    * `options.platformImpl`: **(Optional | Object)** 平台相关接口注入, 默认: `new BrowserImpl()`
    * `options.proxyEndpoint`: **(Optional | string)** 若开启SSL加密, 需设置代理地址, 测试代理: `highras.ifunplus.cn:13550`
    * `options.md5`: **(Optional | function)** `md5`字符串加密方法

* `processor`: **(RTMProcessor)** 监听PushService的句柄

* `login(endpoint, ipv6)`: 连接并登陆 
    * `endpoint`: **(Optional | string)** RTMGate服务地址, 由Dispatch服务获取, 或由RTM提供
    * `ipv6`: **(Optional | bool)** 是否为IPV6地址格式, 默认: `false`

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
