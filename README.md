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
    uid: new Int64BE(0, 654321),
    token: 'B66731BB8DCEEB9127495C0932B94317',
    autoReconnect: false,
    connectionTimeout: 10 * 1000,
    pid: 1000001,
    version: undefined,
    recvUnreadMsgStatus: false,
    ssl: true,
    proxyEndpoint: 'highras.ifunplus.cn:13550'
});

client.on('error', function(err){
    console.error(err);
});

client.on('close', function(){
    console.log('closed!');
});

client.login();

//push service
let pushName = client.rtmConfig.SERVER_PUSH.recvMessage;
client.processor.on(pushName, function(data){
    console.log('\n[PUSH] ' + pushName + ':\n', data);
    // console.log(data.mid.toString());
});

//send to server
client.on('login', function(data){
    if (data.error){
        console.error(data.error);
        // need to get new token
        return;
    }

    client.sendMessage(new Int64BE(123789), 8, 'hello !', '', 10 * 1000, function(err, data){
        if (err){
            console.error('\n[ERR] ' + name + ':\n', err.message);
        }
        if (data){
            console.log('\n[DATA] ' + name + ':\n', data);
        }
    });
});

```

#### Events ####
* `event`:
    * `login`: 登陆
        * `data.endpoint`: **(string)** 当前连接的RTMGate地址, 可在本地缓存, 下次登陆可使用该地址以加速登陆过程, **每次登陆成功需更新本地缓存**
        * `data.error`: **(object)** auth失败, token失效需重新获取

    * `error`: 异常
        * `err`: **(Error)**

    * `close`: 连接关闭

#### PushService ####
请参考 `RTMConfig.SERVER_PUSH` 成员

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
    * `data.ftype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushgroupfile`: RTMGate主动推送Group文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.gid`: **(Int64BE)** Group id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushroomfile`: RTMGate主动推送Room文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.rid`: **(Int64BE)** Room id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushbroadcastfile`: RTMGate主动推送广播文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

#### API ####
* `constructor(options)`: 构造RTMClient
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

* `processor`: **(RTMProcessor)** 监听PushService的句柄

* `rtmConfig`: **(object)** 请参考 `RTMConfig` 成员

* `login(endpoint, ipv6, timeout)`: 连接并登陆 
    * `endpoint`: **(Optional | string)** RTMGate服务地址, 由Dispatch服务获取, 或由RTM提供
    * `ipv6`: **(Optional | bool)** 是否为IPV6地址格式, 默认: `false`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`

* `sendMessage(to, mtype, msg, attrs, timeout, callback)`: 发送消息
    * `to`: **(Required | Int64BE)** 接收方uid
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendMessages(tos, mtype, msg, attrs, timeout, callback)`: 发送多人消息
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendGroupMessage(gid, mtype, msg, attrs, timeout, callback)`: 发送group消息
    * `gid`: **(Required | Int64BE)** group id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendRoomMessage(rid, mtype, msg, attrs, timeout, callback)`: 发送room消息
    * `rid`: **(Required | Int64BE)** room id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `close()`: 断开连接

* `addVariables(dict, timeout, callback)`: 添加属性
    * `dict`: **(Required | object)** 参数字典, 值必须是`string`类型, 具体参数参见 RTM 文档。
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addFriends(friends, timeout, callback)`: 添加好友
    * `friends`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(object)**

* `deleteFriends(friends, timeout, callback)`: 删除好友
    * `friends`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(object)**

* `getFriends(timeout, callback)`: 获取好友
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(array[Int64BE])**

* `addGroupMembers(gid, uids, timeout, callback)`: 添加group成员
    * `gid`: **(Required | Int64BE)** group id
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteGroupMembers(gid, uids, timeout, callback)`:  删除group成员
    * `gid`: **(Required | Int64BE)** group id
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getGroupMembers(gid, timeout, callback)`: 获取group成员
    * `gid`: **(Required | Int64BE)** group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64BE])** 

* `getUserGroups(timeout, callback)`: 获取用户所在的Group
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64BE])** 

* `enterRoom(rid, timeout, callback)`: 进入房间
    * `rid`: **(Required | Int64BE)** 房间 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
    
* `leaveRoom(rid, timeout, callback)`: 离开房间
    * `rid`: **(Required | Int64BE)** 房间 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getUserRooms(timeout, callback)`: 获取用户所在的Room
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64BE])** 

* `getOnlineUsers(uids, timeout, callback)`: 获取在线用户
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64BE])** 

* `checkUnreadMessage(timeout, callback)`: 获取离线消息／未读消息数目
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[uidOfUnreadMessage:array[Int64BE], gidOfUnreadGroupMessage:array[Int64BE], haveUnreadBroadcastMessage:bool])** 

* `getGroupMessage(gid, num, desc, page, localmid, localid, mtypes, timeout, callback)`: 获取Group历史消息
    * `gid`: **(Required | Int64BE)** Group id
    * `num`: **(Required | number)** 获取数量, **一次最多获取10条**
    * `desc`: **(Required | bool)** `true`: 降序排列, `false`: 升序排列
    * `page`: **(Required | number)** 翻页索引, 基数为 0
    * `localmid`: **(Optional | Int64BE)** 本地保存消息的 mid, 没有传递 -1, 服务器将返回此 mid 之后的新消息
    * `localid`: **(Optional | Int64BE)** 本地保存的上一轮获取到的消息的最大消息 id, 没有传递 -1, 服务器将返回大于这个id的所有消息, 翻页时, 本参数传一样的值
    * `mtypes`: **(Optional | array[number])** 关心的消息类型列表, 空代表所有类型
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, maxid:Int64BE, msgs:array[GroupMsg]])** 
            * `GroupMsg.id` **(Int64BE)**
            * `GroupMsg.from` **(Int64BE)**
            * `GroupMsg.mtype` **(number)**
            * `GroupMsg.ftype` **(number)**
            * `GroupMsg.mid` **(Int64BE)**
            * `GroupMsg.msg` **(string)**
            * `GroupMsg.attrs` **(string)**
            * `GroupMsg.mtime` **(number)**

* `getRoomMessage(rid, num, desc, page, localmid, localid, mtypes, timeout, callback)`: 获取Room历史消息
    * `rid`: **(Required | Int64BE)** Room id
    * `num`: **(Required | number)** 获取数量, **一次最多获取10条**
    * `desc`: **(Required | bool)** `true`: 降序排列, `false`: 升序排列
    * `page`: **(Required | number)** 翻页索引, 基数为 0
    * `localmid`: **(Optional | Int64BE)** 本地保存消息的 mid, 没有传递 -1, 服务器将返回此 mid 之后的新消息
    * `localid`: **(Optional | Int64BE)** 本地保存的上一轮获取到的消息的最大消息 id, 没有传递 -1, 服务器将返回大于这个id的所有消息, 翻页时, 本参数传一样的值
    * `mtypes`: **(Optional | array[number])** 关心的消息类型列表, 空代表所有类型
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, maxid:Int64BE, msgs:array[RoomMsg]])** 
            * `RoomMsg.id` **(Int64BE)**
            * `RoomMsg.from` **(Int64BE)**
            * `RoomMsg.mtype` **(number)**
            * `RoomMsg.ftype` **(number)**
            * `RoomMsg.mid` **(Int64BE)**
            * `RoomMsg.msg` **(string)**
            * `RoomMsg.attrs` **(string)**
            * `RoomMsg.mtime` **(number)**

* `getBroadcastMessage(num, desc, page, localmid, localid, mtypes, timeout, callback)`: 获取广播历史消息
    * `num`: **(Required | number)** 获取数量, **一次最多获取10条**
    * `desc`: **(Required | bool)** `true`: 降序排列, `false`: 升序排列
    * `page`: **(Required | number)** 翻页索引, 基数为 0
    * `localmid`: **(Optional | Int64BE)** 本地保存消息的 mid, 没有传递 -1, 服务器将返回此 mid 之后的新消息
    * `localid`: **(Optional | Int64BE)** 本地保存的上一轮获取到的消息的最大消息 id, 没有传递 -1, 服务器将返回大于这个id的所有消息, 翻页时, 本参数传一样的值
    * `mtypes`: **(Optional | array[number])** 关心的消息类型列表, 空代表所有类型
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, maxid:Int64BE, msgs:array[BroadcastMsg]])** 
            * `BroadcastMsg.id` **(Int64BE)**
            * `BroadcastMsg.from` **(Int64BE)**
            * `BroadcastMsg.mtype` **(number)**
            * `BroadcastMsg.ftype` **(number)**
            * `BroadcastMsg.mid` **(Int64BE)**
            * `BroadcastMsg.msg` **(string)**
            * `BroadcastMsg.attrs` **(string)**
            * `BroadcastMsg.mtime` **(number)**

* `getP2PMessage(peeruid, num, direction, desc, page, localmid, localid, mtypes, timeout, callback)`: 获取P2P历史消息
    * `peeruid`: **(Required | Int64BE)** 发送者 id
    * `num`: **(Required | number)** 获取数量, **一次最多获取10条**
    * `direction`: **(Required | number)** `0`: sent + recv, `1`: sent, `2`: recv
    * `desc`: **(Required | bool)** `true`: 降序排列, `false`: 升序排列
    * `page`: **(Required | number)** 翻页索引, 基数为 0
    * `localmid`: **(Optional | Int64BE)** 本地保存消息的 mid, 没有传递 -1, 服务器将返回此 mid 之后的新消息
    * `localid`: **(Optional | Int64BE)** 本地保存的上一轮获取到的消息的最大消息 id, 没有传递 -1, 服务器将返回大于这个id的所有消息, 翻页时, 本参数传一样的值
    * `mtypes`: **(Optional | array[number])** 关心的消息类型列表, 空代表所有类型
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, maxid:Int64BE, msgs:array[P2PMessage]])** 
            * `P2PMessage.id` **(Int64BE)**
            * `P2PMessage.direction` **(number)**
            * `P2PMessage.mtype` **(number)**
            * `P2PMessage.ftype` **(number)**
            * `P2PMessage.mid` **(Int64BE)**
            * `P2PMessage.msg` **(string)**
            * `P2PMessage.attrs` **(string)**
            * `P2PMessage.mtime` **(number)**

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

* `setGeo(lat, lng, timeout, callback)`: 设置位置
    * `lat`: **(Required | number)** 纬度
    * `lng`: **(Required | number)** 经度
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getGeo(timeout, callback)`: 获取位置
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[lat:number, lng:number])** 

* `getGeos(uids, timeout, callback)`: 获取位置
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[array[uid:Int64BE,lat:number,lng:number])** 

* `sendFile(mtype, to, file, timeout, callback)`: 发送文件
    * `mtype`: **(Required | number)** 消息类型
    * `to`: **(Required | Int64BE)** 接收者 id
    * `file`: **(Required | File)** 要发送的文件
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendFiles(mtype, tos, file, timeout, callback)`: 发送多人文件
    * `mtype`: **(Required | number)** 消息类型
    * `tos`: **(Required | array[Int64BE])** 多个接受者 id
    * `file`: **(Required | File)** 要发送的文件
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendGroupFile(mtype, gid, file, timeout, callback)`: 发送文件
    * `mtype`: **(Required | number)** 消息类型
    * `gid`: **(Required | Int64BE)** Group id
    * `file`: **(Required | File)** 要发送的文件
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendRoomFile(mtype, rid, file, timeout, callback)`: 发送文件
    * `mtype`: **(Required | number)** 消息类型
    * `rid`: **(Required | Int64BE)** Room id
    * `file`: **(Required | File)** 要发送的文件
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
