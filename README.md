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
    dispatch: 'rtm-nx-front.ifunplus.cn:13325',
    uid: new rtm.RTMConfig.Int64(0, 654321),
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
    * `data.mtime`: **(Int64)**

* `pushgroupmsg`: RTMGate主动推送Group消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.gid`: **(Int64)** Group id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushroommsg`: RTMGate主动推送Room消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.rid`: **(Int64)** Room id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushbroadcastmsg`: RTMGate主动推送广播消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushfile`: RTMGate主动推送P2P文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushgroupfile`: RTMGate主动推送Group文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.gid`: **(Int64)** Group id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushroomfile`: RTMGate主动推送Room文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.rid`: **(Int64)** Room id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushbroadcastfile`: RTMGate主动推送广播文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushchat`: RTMGate主动推送聊天消息
    * 参数与pushmsg一致

* `pushaudio`: RTMGate主动推送语音聊天消息
    * 参数与pushmsg一致

* `pushcmd`: RTMGate主动推送聊天控制命令
    * 参数与pushmsg一致

* `pushgroupchat`: RTMGate主动推送组聊天消息
    * 参数与pushgroupmsg一致

* `pushgroupaudio`: RTMGate主动推送组语音消息
    * 参数与pushgroupmsg一致

* `pushgroupcmd`: RTMGate主动推送组聊天控制命令
    * 参数与pushgroupmsg一致

* `pushroomchat`: RTMGate主动推送房间聊天消息
    * 参数与pushroommsg一致

* `pushroomaudio`: RTMGate主动推送房间语音消息
    * 参数与pushroommsg一致

* `pushroomcmd`: RTMGate主动推送房间聊天控制命令
    * 参数与pushroommsg一致

* `pushbroadcastchat`: RTMGate主动推送广播聊天消息
    * 参数与pushbroadcastchat一致

* `pushbroadcastaudio`: RTMGate主动推送广播语音消息
    * 参数与pushbroadcastchat一致

* `pushbroadcastcmd`: RTMGate主动推送广播聊天控制命令
    * 参数与pushbroadcastchat一致

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

* `sendChat(to, msg, attrs, mid, timeout, callback)`: 发送文本聊天
    * `to`: **(Required | Int64)** 接收方uid
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendGroupChat(gid, msg, attrs, mid, timeout, callback)`: 发送group文本聊天
    * `gid`: **(Required | Int64)** group id
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendRoomChat(rid, mtype, msg, attrs, mid, timeout, callback)`: 发送room文本聊天
    * `rid`: **(Required | Int64)** room id
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendAudio(to, msg, attrs, mid, timeout, callback)`: 发送语音聊天
    * `to`: **(Required | Int64)** 接收方uid
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendGroupAudio(gid, msg, attrs, mid, timeout, callback)`: 发送group语音聊天
    * `gid`: **(Required | Int64)** group id
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendRoomAudio(rid, mtype, msg, attrs, mid, timeout, callback)`: 发送room语音聊天
    * `rid`: **(Required | Int64)** room id
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendCmd(to, msg, attrs, mid, timeout, callback)`: 发送聊天控制命令
    * `to`: **(Required | Int64)** 接收方uid
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendGroupCmd(gid, msg, attrs, mid, timeout, callback)`: 发送group聊天控制命令
    * `gid`: **(Required | Int64)** group id
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `sendRoomCmd(rid, mtype, msg, attrs, mid, timeout, callback)`: 发送room聊天控制命令
    * `rid`: **(Required | Int64)** room id
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64)** 消息 id, 用于过滤重复消息, 非重发时为`Int64(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[mid:Int64, payload:object[mtime:Int64]])** 

* `getUnreadMessage(clear, timeout, callback)`: 检测未读消息数目
    * `clear`: **(Optional | bool)** 是否除离线提醒
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[p2p:array(Int64), group:array(Int64)])** 对应值为未读消息数目

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

* `getGroupMessage(gid, desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取Group历史消息
    * `gid`: **(Required | Int64)** Group id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(Optional | array(number))** 获取哪些mtype的历史
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

* `getRoomMessage(rid, desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取Room历史消息
    * `rid`: **(Required | Int64)** Room id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(Optional | array(number))** 获取哪些mtype的历史
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

* `getBroadcastMessage(desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取广播历史消息
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(Optional | array(number))** 获取哪些mtype的历史
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

* `getP2PMessage(ouid, desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取P2P历史消息
    * `ouid`: **(Required | Int64)** 获取和哪个用户id的历史消息
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(Optional | array(number))** 获取哪些mtype的历史
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

* `getGroupChat(gid, desc, num, begin, end, lastid, timeout, callback)`: 获取Group历史聊天
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

* `getRoomChat(rid, desc, num, begin, end, lastid, timeout, callback)`: 获取Room历史聊天
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

* `getBroadcastChat(desc, num, begin, end, lastid, timeout, callback)`: 获取广播历史聊天
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

* `getP2PChat(ouid, desc, num, begin, end, lastid, timeout, callback)`: 获取P2P历史聊天
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

* `translate(originalMessage, originalLanguage, targetLanguage, type, profanity, postProfanity, timeout, callback)`: 翻译消息
    * `originalMessage`: **(Required | stirng)** 待翻译的原始消息
    * `originalLanguage`: **(Optional | string)** 待翻译的消息的语言类型, 可为 `undefined`
    * `targetLanguage`: **(Required | string)** 本次翻译的目标语言类型
    * `type`: **(Required | string)** 可选值为chat或mail。如未指定，则默认使用chat
    * `profanity`: **(Required | string)** 敏感语过滤。设置为以下3项之一: off, stop, censor，默认：off
    * `postProfanity`: **(Required | bool)** 是否把翻译后的文本过滤
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[source:string, target:string, targetText:string, sourceText:string])** 

* `profanity(text, classify, timeout, callback)`: 敏感词过滤
    * `text`: **(Required | stirng)** 原始消息
    * `classify`: **(Required | bool)** 是否进行文本分类检测
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[text:string, classification：array(string)])** 

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

* `deleteChat(mid, xid, type, timeout, callback)`: 删除消息
    * `mid`: **(Required | Int64)** 消息 id
    * `xid`: **(Required | Int64)** 消息接收方 id (userId/RoomId/GroupId)
    * `type`: **(Required | number)** 接收方类型 (1:p2p, 2:group, 3:room)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getMessage(mid, xid, type, timeout, callback)`: 获取消息
    * `mid`: **(Required | Int64)** 消息 id
    * `xid`: **(Required | Int64)** 消息接收方 id (userId/RoomId/GroupId)
    * `type`: **(Required | number)** 接收方类型 (1:p2p, 2:group, 3:room)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[id: Int64, mtype: number, msg: string, attrs: string, mtime: Int64])** 

* `getChat(mid, xid, type, timeout, callback)`: 获取聊天
    * `mid`: **(Required | Int64)** 消息 id
    * `xid`: **(Required | Int64)** 消息接收方 id (userId/RoomId/GroupId)
    * `type`: **(Required | number)** 接收方类型 (1:p2p, 2:group, 3:room)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[id: Int64, mtype: number, msg: string, attrs: string, mtime: Int64])** 

* `kickout(ce, timeout, callback)`: 踢掉一个链接 (只对多用户登录有效, 不能踢掉自己, 可以用来实现同类设备唯一登录)
    * `ce`: **(Required | string)** 当前链接的`endpoint`, 可以通过调用`getAttrs`获取
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

* `setUserInfo(oinfo, pinfo, timeout, callback) `: 设置用户信息
    * `oinfo`: **(Optional | string)** 公开信息
    * `pinfo`: **(Optional | string)** 私有信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object)** 

* `getUserInfo(timeout, callback) `: 获取用户信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[oinfo:string, pinfo:string])** 

* `getUserOpenInfo(uids, timeout, callback) `: 获取用户信息
    * `uids`: **(Required | array(Int64))** 用户id列表  
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[info:map<string, string>])** 

* `setGroupInfo(gid, oinfo, pinfo, timeout, callback) `: 设置组信息
    * `gid`: **(Required | Int64)** 组id  
    * `oinfo`: **(Optional | string)** 公开信息
    * `pinfo`: **(Optional | string)** 私有信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object)** 

* `getGroupInfo(gid, timeout, callback) `: 获取群组的公开信息和私有信息，会检查用户是否在组内
    * `gid`: **(Required | Int64)** 组id  
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[oinfo:string, pinfo:string])** 

* `getGroupOpenInfo(gid, timeout, callback) `: 获取群组的公开信息
    * `gid`: **(Required | Int64)** 组id  
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[oinfo:string, pinfo:string])** 

* `setRoomInfo(rid, oinfo, pinfo, timeout, callback) `: 设置房间信息
    * `rid`: **(Required | Int64)** 房间id  
    * `oinfo`: **(Optional | string)** 公开信息
    * `pinfo`: **(Optional | string)** 私有信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object)** 

* `getRoomInfo(rid, timeout, callback) `: 获取房间的公开信息和私有信息，会检查用户是否在房间内
    * `rid`: **(Required | Int64)** 房间id  
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[oinfo:string, pinfo:string])** 

* `getRoomOpenInfo(rid, timeout, callback) `: 获取房间的公开信息
    * `rid`: **(Required | Int64)** 房间id  
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[oinfo:string, pinfo:string])** 

* `dataSet(key, value, timeout, callback)`: 设置存储的数据信息(key:最长128字节，val：最长65535字节)
    * `key`: **(Required | string)** 数据的key
    * `value`: **(Optional | string)** 数据的value
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object)** 

* `dataGet(key, timeout, callback) `: 获取存储的数据信息(key:最长128字节，val：最长65535字节)
    * `key`: **(Required | string)** 数据的key
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object[val:string])** 


* `dataDelete(key, timeout, callback)`: 删除存储的数据信息
    * `key`: **(Required | string)** 数据的key
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object)** 