# FPNN RTM WebJs SDK #

* 不支持`FPNN`加密链接。

#### 关于三方包依赖 ####
* [int64-buffer](https://github.com/kawanet/int64-buffer) `./lib/int64-buffer.min.js`
* [msgpack-lite](https://github.com/kawanet/msgpack-lite) `./lib/msgpack.min.js`

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
<script src="./lib/int64-buffer.min.js"></script>
<script src="./lib/msgpack.min.js"></script>
<script src="./dist/rtm.min.js"></script>
```

```javascript
let client = new RTMClient({ 
    dispatch: '117.50.4.158:13325',
    uid: new Int64BE(654321),
    token: 'B66731BB8DCEEB9127495C0932B94317',
    autoReconnect: false,
    connectionTimeout: 10 * 1000,
    pid: 1000001,
    version: undefined,
    recvUnreadMsgStatus: false,
    ssl: false
});

client.on('error', (err) => {
    console.error(err);
});

client.login();

client.on('login', (data) => {
    //send to server
    client.sendMessage(to, 8, 'hello !', '', (err, data) => {
        if (err){
            console.error('\n[ERR] ' + name + ':\n', err)
        }
        if (data){
            console.log('\n[DATA] ' + name + ':\n', data);
        }
    });

    //push service
    let pushName = data.services.recvMessage;
    data.processor.on(pushName, (data) => {
        console.log('\n[PUSH] ' + pushName + ':\n', data);
    });
});

```

#### Events ####
* `event`:
    * `login`: 登陆成功
        * `data.endpoint`: **(string)** 当前连接的RTMGate地址, 可在本地缓存, 下次登陆可使用该地址以加速登陆过程, **每次登陆成功需更新本地缓存**
        * `data.processor`: **(RTMProcessor)** 监听PushService的句柄
        * `data.services`: **(object)** 支持的PushService定义
    * `error`: 发生异常
        * `err`: **(object)**
    * `close`: 连接关闭

#### PushService ####
 关于 `services` 列表可参考: `RTMConfig.SERVER_PUSH`

* `kickout`: RTMGate主动断开
    * `data`: **(object)**

* `kickoutroom`: RTMGate主动从Room移除
    * `data.rid`: **(Int64BE)** Room id

* `ping`: RTMGate主动ping
    * `data`: **(object)**

* `pushmsg`: RTMGate主动推送P2P消息
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushgroupmsg`: RTMGate主动推送Group消息
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.gid`: **(Int64BE)** Group id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushroommsg`: RTMGate主动推送Room消息
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.rid`: **(Int64BE)** Room id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushbroadcastmsg`: RTMGate主动推送广播消息
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `transmsg`: RTMGate主动推送翻译消息(P2P)
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.mid`: **(Int64BE)** 翻译后的消息 id, 当前链接会话内唯一
    * `data.omid`: **(Int64BE)** 原始消息的消息 id
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 翻译后的消息内容

* `transgroupmsg`: RTMGate主动推送翻译消息(Group)
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.gid`: **(Int64BE)** Group id
    * `data.mid`: **(Int64BE)** 翻译后的消息 id, 当前链接会话内唯一
    * `data.omid`: **(Int64BE)** 原始消息的消息 id
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 翻译后的消息内容
    
* `transroommsg`: RTMGate主动推送翻译消息(Room)
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.rid`: **(Int64BE)** Room id
    * `data.mid`: **(Int64BE)** 翻译后的消息 id, 当前链接会话内唯一
    * `data.omid`: **(Int64BE)** 原始消息的消息 id
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 翻译后的消息内容
    
* `transbroadcastmsg`: RTMGate主动推送翻译消息(广播)
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.mid`: **(Int64BE)** 翻译后的消息 id, 当前链接会话内唯一
    * `data.omid`: **(Int64BE)** 原始消息的消息 id
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 翻译后的消息内容

* `pushunread`: RTMGate主动推送消息(未读)
    * `data.p2p`: **(array[Int64BE])** 有未读消息的发送者 id 列表
    * `data.group`: **(array[Int64BE])** 有未读消息的Group id 列表
    * `data.bc`: **(bool)** `true`代表有未读广播消息

* `pushfile`: RTMGate主动推送P2P文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 RTMConfig.FILE_TYPE成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushgroupfile`: RTMGate主动推送Group文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.gid`: **(Int64BE)** Group id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 RTMConfig.FILE_TYPE成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushroomfile`: RTMGate主动推送Room文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.rid`: **(Int64BE)** Room id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 RTMConfig.FILE_TYPE成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushbroadcastfile`: RTMGate主动推送广播文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 RTMConfig.FILE_TYPE成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

#### API ####
* constructor(options)`: 构造RTMClient
    * `options.dispatch`: **(Optional | string)** Dispatch服务地址, RTM提供
    * `options.pid`: **(Required | number)** 应用编号, RTM提供
    * `options.uid`: **(Required | Int64BE)** 用户ID
    * `options.token`: **(Required | string)** 用户登录Token, RTM提供
    * `options.autoReconnect`: **(Optional | bool)** 是否自动重连, 默认: `false`
    * `options.connectionTimeout`: **(Optional | number)** 超时时间(ms), 默认: `30 * 1000`
    * `options.version`: **(Optional | string)** 服务器版本号, RTM提供
    * `options.recvUnreadMsgStatus`: **(Optional | bool)** 是否接收未读消息状态信息, 默认: `true`
    * `options.ssl`: **(Optional | string)** 是否开启SSL加密, 若开启需设置代理地址 默认: `true`
    * `options.proxyEndpoint`: **(Optional | string)** 若开启SSL加密, 需设置代理地址, 测试代理: `highras.ifunplus.cn:13550`

* `authed`: 是否处于登陆状态
    * `return`: **(bool)**

* `login(endpoint, ipv6)`: 连接并登陆 
    * `endpoint`: **(Optional | string)** RTMGate服务地址, 由Dispatch服务获取, 或由RTM提供
    * `ipv6`: **(Optional | bool)** 是否为IPV6地址格式, 默认: `false`

* `sendMessage(to, mtype, msg, attrs, callback, timeout)`: 发送消息
    * `to`: **(Required | Int64BE)** 接收方uid
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendMessages(tos, mtype, msg, attrs, callback, timeout)`: 发送多人消息
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendGroupMessage(gid, mtype, msg, attrs, callback, timeout)`: 发送group消息
    * `gid`: **(Required | Int64BE)** group id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendRoomMessage(rid, mtype, msg, attrs, callback, timeout)`: 发送room消息
    * `rid`: **(Required | Int64BE)** room id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `close()`: 断开连接

* `addVariables(dict, callback, timeout)`: 添加属性
    * `dict`: **(Required | object)** 参数字典, 值必须是`string`类型, 具体参数参见 RTM 文档。
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `addFriends(friends, callback, timeout)`: 添加好友
    * `friends`: **(Required | array[Int64BE])** 多个好友 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)**
        * `data`: **(object)**
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `deleteFriends(friends, callback, timeout)`: 删除好友
    * `friends`: **(Required | array[Int64BE])** 多个好友 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)**
        * `data`: **(object)**
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getFriends(callback, timeout)`: 获取好友
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)**
        * `data`: **(array[Int64BE])**
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `addGroupMembers(gid, uids, callback, timeout)`: 添加group成员
    * `gid`: **(Required | Int64BE)** group id
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `deleteGroupMembers(gid, uids, callback, timeout)`:  删除group成员
    * `gid`: **(Required | Int64BE)** group id
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getGroupMembers(gid, callback, timeout)`: 获取group成员
    * `gid`: **(Required | Int64BE)** group id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[Int64BE])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getUserGroups(callback, timeout)`: 获取用户所在的Group
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[Int64BE])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `enterRoom(rid, callback, timeout)`: 进入房间
    * `rid`: **(Required | Int64BE)** 房间 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`
    
* `leaveRoom(rid, callback, timeout)`: 离开房间
    * `rid`: **(Required | Int64BE)** 房间 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getUserRooms(callback, timeout)`: 获取用户所在的Room
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[Int64BE])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getOnlineUsers(uids, callback, timeout)`: 获取在线用户
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[Int64BE])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `checkUnreadMessage(callback, timeout)`: 获取离线消息／未读消息数目
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object[uidOfUnreadMessage:array[Int64BE], gidOfUnreadGroupMessage:array[Int64BE], haveUnreadBroadcastMessage:bool])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getGroupMessage(gid, num, desc, page, localmid, localid, mtypes, callback, timeout)`: 获取Group历史消息
    * `gid`: **(Required | Int64BE)** Group id
    * `num`: **(Required | number)** 获取数量, **一次最多获取10条**
    * `desc`: **(Required | bool)** `true`: 降序排列, `false`: 升序排列
    * `page`: **(Required | number)** 翻页索引, 基数为 0
    * `localmid`: **(Optional | Int64BE)** 本地保存消息的 mid, 没有传递 -1, 服务器将返回此 mid 之后的新消息
    * `localid`: **(Optional | Int64BE)** 本地保存的上一轮获取到的消息的最大消息 id, 没有传递 -1, 服务器将返回大于这个id的所有消息, 翻页时, 本参数传一样的值
    * `mtypes`: **(Optional | array[number])** 关心的消息类型列表, 空代表所有类型
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object[num:number, maxid:Int64BE, msgs:array[GroupMsg]])** 
            * `GroupMsg.id` **(Int64BE)**
            * `GroupMsg.from` **(Int64BE)**
            * `GroupMsg.mtype` **(number)**
            * `GroupMsg.ftype` **(number)**
            * `GroupMsg.mid` **(Int64BE)**
            * `GroupMsg.msg` **(string)**
            * `GroupMsg.attrs` **(string)**
            * `GroupMsg.mtime` **(number)**
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getRoomMessage(rid, num, desc, page, localmid, localid, mtypes, callback, timeout)`: 获取Room历史消息
    * `rid`: **(Required | Int64BE)** Room id
    * `num`: **(Required | number)** 获取数量, **一次最多获取10条**
    * `desc`: **(Required | bool)** `true`: 降序排列, `false`: 升序排列
    * `page`: **(Required | number)** 翻页索引, 基数为 0
    * `localmid`: **(Optional | Int64BE)** 本地保存消息的 mid, 没有传递 -1, 服务器将返回此 mid 之后的新消息
    * `localid`: **(Optional | Int64BE)** 本地保存的上一轮获取到的消息的最大消息 id, 没有传递 -1, 服务器将返回大于这个id的所有消息, 翻页时, 本参数传一样的值
    * `mtypes`: **(Optional | array[number])** 关心的消息类型列表, 空代表所有类型
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object[num:number, maxid:Int64BE, msgs:array[RoomMsg]])** 
            * `RoomMsg.id` **(Int64BE)**
            * `RoomMsg.from` **(Int64BE)**
            * `RoomMsg.mtype` **(number)**
            * `RoomMsg.ftype` **(number)**
            * `RoomMsg.mid` **(Int64BE)**
            * `RoomMsg.msg` **(string)**
            * `RoomMsg.attrs` **(string)**
            * `RoomMsg.mtime` **(number)**
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getBroadcastMessage(num, desc, page, localmid, localid, mtypes, callback, timeout)`: 获取广播历史消息
    * `num`: **(Required | number)** 获取数量, **一次最多获取10条**
    * `desc`: **(Required | bool)** `true`: 降序排列, `false`: 升序排列
    * `page`: **(Required | number)** 翻页索引, 基数为 0
    * `localmid`: **(Optional | Int64BE)** 本地保存消息的 mid, 没有传递 -1, 服务器将返回此 mid 之后的新消息
    * `localid`: **(Optional | Int64BE)** 本地保存的上一轮获取到的消息的最大消息 id, 没有传递 -1, 服务器将返回大于这个id的所有消息, 翻页时, 本参数传一样的值
    * `mtypes`: **(Optional | array[number])** 关心的消息类型列表, 空代表所有类型
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object[num:number, maxid:Int64BE, msgs:array[BroadcastMsg]])** 
            * `BroadcastMsg.id` **(Int64BE)**
            * `BroadcastMsg.from` **(Int64BE)**
            * `BroadcastMsg.mtype` **(number)**
            * `BroadcastMsg.ftype` **(number)**
            * `BroadcastMsg.mid` **(Int64BE)**
            * `BroadcastMsg.msg` **(string)**
            * `BroadcastMsg.attrs` **(string)**
            * `BroadcastMsg.mtime` **(number)**
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getP2PMessage(peeruid, num, direction, desc, page, localmid, localid, mtypes, callback, timeout)`: 获取P2P历史消息
    * `peeruid`: **(Required | Int64BE)** 发送者 id
    * `num`: **(Required | number)** 获取数量, **一次最多获取10条**
    * `direction`: **(Required | number)** `0`: sent + recv, `1`: sent, `2`: recv
    * `desc`: **(Required | bool)** `true`: 降序排列, `false`: 升序排列
    * `page`: **(Required | number)** 翻页索引, 基数为 0
    * `localmid`: **(Optional | Int64BE)** 本地保存消息的 mid, 没有传递 -1, 服务器将返回此 mid 之后的新消息
    * `localid`: **(Optional | Int64BE)** 本地保存的上一轮获取到的消息的最大消息 id, 没有传递 -1, 服务器将返回大于这个id的所有消息, 翻页时, 本参数传一样的值
    * `mtypes`: **(Optional | array[number])** 关心的消息类型列表, 空代表所有类型
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object[num:number, maxid:Int64BE, msgs:array[P2PMessage]])** 
            * `P2PMessage.id` **(Int64BE)**
            * `P2PMessage.direction` **(number)**
            * `P2PMessage.mtype` **(number)**
            * `P2PMessage.ftype` **(number)**
            * `P2PMessage.mid` **(Int64BE)**
            * `P2PMessage.msg` **(string)**
            * `P2PMessage.attrs` **(string)**
            * `P2PMessage.mtime` **(number)**
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `addDevice(ptype, dtype, token, callback, timeout)`: 添加设备信息
    * `ptype`: **(Required | string)** 平台信息
    * `dtype`: **(Required | string)** 设备信息
    * `token`: **(Required | string)** 设备ID
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `setTranslationLanguage(targetLanguage, callback, timeout)`: 设置自动翻译的默认目标语言类型, 如果 targetLanguage 为空字符串, 则取消自动翻译
    * `targetLanguage`: **(Required | string)** 翻译的目标语言类型
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `translate(originalMessage, originalLanguage, targetLanguage, callback, timeout)`: 翻译消息
    * `originalMessage`: **(Required | stirng)** 待翻译的原始消息
    * `originalLanguage`: **(Optional | string)** 待翻译的消息的语言类型, 可为 `undefined`
    * `targetLanguage`: **(Required | string)** 本次翻译的目标语言类型
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object[stext:string, src:string, dtext:string, dst:string])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `setPushName(pushname, callback, timeout)`: 设置名字
    * `pushname`: **(Required | string)** 名字
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getPushName(callback, timeout)`: 获取名字
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(string)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `setGeo(lat, lng, callback, timeout)`: 设置位置
    * `lat`: **(Required | number)** 纬度
    * `lng`: **(Required | number)** 经度
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getGeo(callback, timeout)`: 获取位置
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object[lat:number, lng:number])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getGeos(uids, callback, timeout)`: 获取位置
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[array[uid:Int64BE,lat:number,lng:number])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendFile(mtype, to, file, callback, timeout)`: 发送文件
    * `mtype`: **(Required | number)** 消息类型
    * `to`: **(Required | Int64BE)** 接收者 id
    * `file`: **(Required | File)** 要发送的文件
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendFiles(mtype, tos, file, callback, timeout)`: 发送多人文件
    * `mtype`: **(Required | number)** 消息类型
    * `tos`: **(Required | array[Int64BE])** 多个接受者 id
    * `file`: **(Required | File)** 要发送的文件
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendGroupFile(mtype, gid, file, callback, timeout)`: 发送文件
    * `mtype`: **(Required | number)** 消息类型
    * `gid`: **(Required | Int64BE)** Group id
    * `file`: **(Required | File)** 要发送的文件
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendRoomFile(mtype, rid, file, callback, timeout)`: 发送文件
    * `mtype`: **(Required | number)** 消息类型
    * `rid`: **(Required | Int64BE)** Room id
    * `file`: **(Required | File)** 要发送的文件
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`
