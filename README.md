# fpnn rtm sdk websocket #

* 不支持`FPNN`加密链接, 支持`SSL`加密链接
* 支持源码方式接入, 支持自定义构建

#### 关于三方包依赖 ####
* [int64-buffer](https://github.com/kawanet/int64-buffer) `./lib/int64-buffer.min.js`
* [msgpack-lite](https://github.com/kawanet/msgpack-lite) `./lib/msgpack.min.js`

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
<script src="./dist/rtm.min.js"></script>
```

```javascript
let client = new Rtm.RTMClient({ 
    dispatch: 'rtm-nx-front.ifunplus.cn:13325',
    uid: new Rtm.RTMConfig.Int64(0, 654321),
    token: '5C65CD872903AAB37211EC468B4A1364',
    autoReconnect: false,
    connectionTimeout: 10 * 1000,
    pid: 1000012,
    ssl: true,
    proxyEndpoint: 'highras.ifunplus.cn:13556',
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
    client.sendMessage(new Rtm.RTMConfig.Int64(123789), 8, 'hello !', '', new Rtm.RTMConfig.Int64(0), 10 * 1000, function(err, data) {

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
let pushName = Rtm.RTMConfig.SERVER_PUSH.recvMessage;
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

#### PushService ####
请参考 `RTMConfig.SERVER_PUSH` 成员

* `kickout`: RTMGate主动断开
    * `data`: **(object)**

* `kickoutroom`: RTMGate主动从Room移除
    * `data.rid`: **(Int64)** Room id

* `ping`: RTMGate主动ping
    * `data`: **(object)**

* `pushmsg`: RTMGate主动推送P2P消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)** 消息入库 id

* `pushgroupmsg`: RTMGate主动推送Group消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.gid`: **(Int64)** Group id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)** 消息入库 id

* `pushroommsg`: RTMGate主动推送Room消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.rid`: **(Int64)** Room id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)** 消息入库 id

* `pushbroadcastmsg`: RTMGate主动推送广播消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)** 消息入库 id

* `pushfile`: RTMGate主动推送P2P文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)** 消息入库 id

* `pushgroupfile`: RTMGate主动推送Group文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.gid`: **(Int64)** Group id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)** 消息入库 id

* `pushroomfile`: RTMGate主动推送Room文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.rid`: **(Int64)** Room id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)** 消息入库 id

* `pushbroadcastfile`: RTMGate主动推送广播文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)** 消息入库 id

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

* `processor`: **(RTMProcessor)** 监听PushService的句柄

* `login(endpoint, ipv6)`: 连接并登陆 
    * `endpoint`: **(Optional | string)** RTMGate服务地址, 由Dispatch服务获取, 或由RTM提供
    * `ipv6`: **(Optional | bool)** 是否为IPV6地址格式, 默认: `false`

* `destroy()`: 断开连接并开始销毁

* `sendMessage(to, mtype, msg, attrs, mid, timeout, callback)`: 发送消息
    * `to`: **(Required | Int64)** 接收方uid
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendGroupMessage(gid, mtype, msg, attrs, mid, timeout, callback)`: 发送group消息
    * `gid`: **(Required | Int64)** group id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendRoomMessage(rid, mtype, msg, attrs, mid, timeout, callback)`: 发送room消息
    * `rid`: **(Required | Int64)** room id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `getUnreadMessage(timeout, callback)`: 检测未读消息数目
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[p2p:object[string, number], group:object[string, number]])** 对应值为未读消息数目

* `cleanUnreadMessage(timeout, callback)`: 清除未读消息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getSession(timeout, callback)`: 获取所有会话
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[p2p:object[string, Int64], group:object[string, Int64]])** 对应值为最后一次会话的UTC时间戳

* `getGroupMessage(gid, desc, num, begin, end, lastid, timeout, callback)`: 获取Group历史消息
    * `gid`: **(Required | Int64)** Group id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, lastid:Int64, begin:Int64, end:Int64, msgs:array[GroupMsg]])** 
            * `GroupMsg.id` **(Int64)**
            * `GroupMsg.from` **(Int64)**
            * `GroupMsg.mtype` **(number)**
            * `GroupMsg.mid` **(Int64)**
            * `GroupMsg.deleted` **(bool)**
            * `GroupMsg.msg` **(string)**
            * `GroupMsg.attrs` **(string)**
            * `GroupMsg.mtime` **(Int64)**

* `getRoomMessage(rid, desc, num, begin, end, lastid, timeout, callback)`: 获取Room历史消息
    * `rid`: **(Required | Int64)** Room id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, lastid:Int64, begin:Int64, end:Int64, msgs:array[RoomMsg]])** 
            * `RoomMsg.id` **(Int64)**
            * `RoomMsg.from` **(Int64)**
            * `RoomMsg.mtype` **(number)**
            * `RoomMsg.mid` **(Int64)**
            * `RoomMsg.deleted` **(bool)**
            * `RoomMsg.msg` **(string)**
            * `RoomMsg.attrs` **(string)**
            * `RoomMsg.mtime` **(Int64)**

* `getBroadcastMessage(desc, num, begin, end, lastid, timeout, callback)`: 获取广播历史消息
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, lastid:Int64, begin:Int64, end:Int64, msgs:array[BroadcastMsg]])** 
            * `BroadcastMsg.id` **(Int64)**
            * `BroadcastMsg.from` **(Int64)**
            * `BroadcastMsg.mtype` **(number)**
            * `BroadcastMsg.mid` **(Int64)**
            * `BroadcastMsg.deleted` **(bool)**
            * `BroadcastMsg.msg` **(string)**
            * `BroadcastMsg.attrs` **(string)**
            * `BroadcastMsg.mtime` **(Int64)**

* `getP2PMessage(ouid, desc, num, begin, end, lastid, timeout, callback)`: 获取P2P历史消息
    * `ouid`: **(Required | Int64)** 获取和哪个用户id的历史消息
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, lastid:Int64, begin:Int64, end:Int64, msgs:array[P2PMsg]])** 
            * `P2PMsg.id` **(Int64)**
            * `P2PMsg.direction` **(number)**
            * `P2PMsg.mtype` **(number)**
            * `P2PMsg.mid` **(Int64)**
            * `P2PMsg.deleted` **(bool)**
            * `P2PMsg.msg` **(string)**
            * `P2PMsg.attrs` **(string)**
            * `P2PMsg.mtime` **(Int64)**

* `fileToken(cmd, tos, to, rid, gid, timeout, callback)`: 获取发送文件的token
    * `cmd`: **(Required | string)** 文件发送方式`sendfile | sendroomfile | sendgroupfile`
    * `tos`: **(Optional | array[Int64])** 接收方 uids
    * `to`: **(Optional | Int64)** 接收方 uid
    * `rid`: **(Optional | Int64)** Room id
    * `gid`: **(Optional | Int64)** Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(object[token:string, endpoint:string])**

* `close()`: 断开连接

* `addAttrs(attrs, timeout, callback)`: 设置客户端信息, 保存在当前链接中, 客户端可以获取到
    * `attrs`: **(Required | object[string, string])** key-value形式的变量
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getAttrs(timeout, callback)`: 获取客户端信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[attrs:array[Map])** 
            * `Map.ce` **(string)** 链接的`endpoint`, 需要让其下线可以调用`kickout`
            * `Map.login` **(string)** 登录时间, UTC时间戳
            * `Map.my` **(string)** 当前链接的`attrs`

* `addDebugLog(msg, attrs, timeout, callback)`: 添加debug日志
    * `msg`: **(Required | string)** 调试信息msg 
    * `attrs`: **(Required | string)** 调试信息attrs 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addDevice(apptype, devicetoken, timeout, callback)`: 添加设备, 应用信息
    * `apptype`: **(Required | string)** 应用信息
    * `devicetoken`: **(Required | string)** 设备信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeDevice(devicetoken, timeout, callback)`: 删除设备, 应用信息
    * `devicetoken`: **(Required | string)** 设备信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `setTranslationLanguage(targetLanguage, timeout, callback)`: 设置自动翻译的默认目标语言类型, 如果 targetLanguage 为空字符串, 则取消自动翻译
    * `targetLanguage`: **(Required | string)** 翻译的目标语言类型
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `translate(originalMessage, originalLanguage, targetLanguage, timeout, callback)`: 翻译消息
    * `originalMessage`: **(Required | stirng)** 待翻译的原始消息
    * `originalLanguage`: **(Optional | string)** 待翻译的消息的语言类型, 可为 `undefined`
    * `targetLanguage`: **(Required | string)** 本次翻译的目标语言类型
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[stext:string, src:string, dtext:string, dst:string])** 

* `addFriends(friends, timeout, callback)`: 添加好友
    * `friends`: **(Required | array[Int64])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(object)**

* `deleteFriends(friends, timeout, callback)`: 删除好友
    * `friends`: **(Required | array[Int64])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(object)**

* `getFriends(timeout, callback)`: 获取好友
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(array[Int64])**

* `addGroupMembers(gid, uids, timeout, callback)`: 添加group成员
    * `gid`: **(Required | Int64)** group id
    * `uids`: **(Required | array[Int64])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteGroupMembers(gid, uids, timeout, callback)`:  删除group成员
    * `gid`: **(Required | Int64)** group id
    * `uids`: **(Required | array[Int64])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getGroupMembers(gid, timeout, callback)`: 获取group成员
    * `gid`: **(Required | Int64)** group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64])** 

* `getUserGroups(timeout, callback)`: 获取用户所在的Group
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64])** 

* `enterRoom(rid, timeout, callback)`: 进入房间
    * `rid`: **(Required | Int64)** 房间 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
    
* `leaveRoom(rid, timeout, callback)`: 离开房间
    * `rid`: **(Required | Int64)** 房间 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getUserRooms(timeout, callback)`: 获取用户所在的Room
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64])** 

* `getOnlineUsers(uids, timeout, callback)`: 获取在线用户
    * `uids`: **(Required | array[Int64])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64])** 

* `deleteMessage(mid, xid, type, timeout, callback)`: 删除消息
    * `mid`: **(Required | Int64)** 消息 id
    * `xid`: **(Required | Int64)** 消息接收方 id (userId/RoomId/GroupId)
    * `type`: **(Required | number)** 接收方类型 (1:p2p, 2:group, 3:room)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `kickout(ce, timeout, callback)`: 踢掉一个链接 (只对多用户登录有效, 不能踢掉自己, 可以用来实现同类设备唯一登录)
    * `ce`: **(Required | string)** 当前链接的`endpoint`, 可以通过调用`getAttrs`获取
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `dbGet(key, timeout, callback)`: 获取存储的数据信息, 返回值不包含`val`表示`key`不存在
    * `key`: **(Required | string)** 存储数据对应键值, 最长`128 字节`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[val:string])** 

* `dbSet(key, value, timeout, callback)`: 设置存储的数据信息, `value`为空则删除对应`key`
    * `key`: **(Required | string)** 存储数据对应键值, 最长`128 字节`
    * `value`: **(Optional | string)** 存储数据实际内容, 最长`1024 * 1024 * 2 字节`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendFile(mtype, to, file, mid, timeout, callback)`: 发送文件
    * `mtype`: **(Required | number)** 文件类型
    * `to`: **(Required | Int64)** 接收者 id
    * `file`: **(Required | File)** 要发送的文件
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendGroupFile(mtype, gid, file, mid, timeout, callback)`: 给Group发送文件
    * `mtype`: **(Required | number)** 文件类型
    * `gid`: **(Required | Int64)** Group id
    * `file`: **(Required | File)** 要发送的文件
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendRoomFile(mtype, rid, file, mid, timeout, callback)`: 给Room发送文件
    * `mtype`: **(Required | number)** 文件类型
    * `rid`: **(Required | Int64)** Room id
    * `file`: **(Required | File)** 要发送的文件
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 
