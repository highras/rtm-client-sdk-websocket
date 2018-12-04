# FPNN RTM WebJs SDK #

* 不支持`FPNN`加密链接, 支持`SSL`加密链接
* 源码方式接入

#### 关于三方包依赖 ####
* [base64](https://github.com/dankogai/js-base64) `./libs/base64-js.js`
* [ieee754](https://github.com/feross/ieee754) `./libs/ieee754.js`
* [buffer](https://github.com/feross/buffer) `./libs/buffer.js`
* [md5](https://github.com/emn178/js-md5) `./libs/md5.min.js`
* [int64-buffer](https://github.com/kawanet/int64-buffer) `./lib/int64-buffer.min.js`
* [msgpack-lite](https://github.com/kawanet/msgpack-lite) `./lib/msgpack.min.js`

#### Promise支持 ####
* 支持动态转Promise接口
* 参考:[Promise.promisifyAll](http://bluebirdjs.com/docs/api/promise.promisifyall.html)

#### 一个例子 ####
* 添加依赖包到`libs`文件夹中
* 创建`livedata`文件夹并导入SDK源代码
* 目录结构(推荐) 
```
- js/
    + base/
    - libs/
        - base64-js.js
        - buffer.js
        - ieee754.js
        - int64-buffer.min.js
        - md5.min.js
        - msgpack.min.js
        ...
    - livedata/
        + fpnn/
        + rtm/
    + npc/
    + player/
    + runtime/
    - main.js
    ...
- game.js
- game.json
...
```

* 参考 `./test/test-wechat.js`

```javascript
import Rtm from './js/livedata/rtm/RTMClient.js'
import WechatImpl from './js/livedata/fpnn/platform/WechatImpl'

let client = new Rtm.RTMClient({
    dispatch: '35.167.185.139:13325',
    uid: new Rtm.RTMConfig.Int64(654321),
    token: '609C0728A2D9115280E1A00ACE4873B3',
    autoReconnect: true,
    connectionTimeout: 20 * 1000,
    pid: 1000012,
    ssl: true,
    proxyEndpoint: 'infra-dev.ifunplus.cn:13556',
    platformImpl: new WechatImpl()
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
    client.sendMessage(new Rtm.RTMConfig.Int64(123789), 8, 'hello !', '', new Rtm.RTMConfig.Int64(0), 10 * 1000, function (err, data) {

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
let pushName = Rtm.RTMConfig.SERVER_PUSH.recvPing;
client.processor.on(pushName, function (data) {

    console.log('\n[PUSH] ' + pushName, data);
});

client.login();
```
