# RTM Client Websocket SDK Chat API Docs

## Index

[TOC]

## Apis

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

* `deleteChat(from, mid, xid, type, timeout, callback)`: 删除消息
    * `from`: **(Required | Int64)** 发送者用户 id
    * `mid`: **(Required | Int64)** 消息 id
    * `xid`: **(Required | Int64)** 消息接收方 id (userId/RoomId/GroupId)
    * `type`: **(Required | number)** 接收方类型 (1:p2p, 2:group, 3:room)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getChat(from, mid, xid, type, timeout, callback)`: 获取聊天
    * `from`: **(Required | Int64)** 发送者用户 id
    * `mid`: **(Required | Int64)** 消息 id
    * `xid`: **(Required | Int64)** 消息接收方 id (userId/RoomId/GroupId)
    * `type`: **(Required | number)** 接收方类型 (1:p2p, 2:group, 3:room)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[id: Int64, mtype: number, msg: string, attrs: string, mtime: Int64])** 

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

* `getSession(timeout, callback)`: 获取所有会话
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[p2p:object[string, Int64], group:object[string, Int64]])** 对应值为最后一次会话的UTC时间戳

* `setTranslationLanguage(targetLanguage, timeout, callback)`: 设置自动翻译的默认目标语言类型, 如果 targetLanguage 为空字符串, 则取消自动翻译
    * `targetLanguage`: **(Required | string)** 翻译的目标语言类型
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getP2PConversationList(mtime, mtypes, timeout, callback)`: 获取所有p2p会话列表
    * `mtime`: **(Optional | int64)** 毫秒级时间戳，大于该时间戳的消息被计为未读消息，未读消息的最后一条作为会话的最后一条消息。不传则默认取上次离线时间。
    * `mtypes`: **(Optional | set<int8>)** 消息类型列表，不传则默认查询mtype为30-50的消息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
            * conversations参数为会话id列表，为p2p会话中对方的uid
            * unreads参数为未读数量列表
            * msgs参数为最后一条消息列表

* `getP2PUnreadConversationList(mtime, mtypes, timeout, callback)`: 获取所有p2p会话列表
    * `mtime`: **(Optional | int64)** 毫秒级时间戳，大于该时间戳的消息被计为未读消息，未读消息的最后一条作为会话的最后一条消息。不传则默认取上次离线时间。
    * `mtypes`: **(Optional | set<int8>)** 消息类型列表，不传则默认查询mtype为30-50的消息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
            * conversations参数为会话id列表，为p2p会话中对方的uid
            * unreads参数为未读数量列表
            * msgs参数为最后一条消息列表

* `getGroupConversationList(mtime, mtypes, timeout, callback)`: 获取所有群组会话列表
    * `mtime`: **(Optional | int64)** 毫秒级时间戳，大于该时间戳的消息被计为未读消息，未读消息的最后一条作为会话的最后一条消息。不传则默认取上次离线时间。
    * `mtypes`: **(Optional | set<int8>)** 消息类型列表，不传则默认查询mtype为30-50的消息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
            * conversations参数为会话id列表，为p2p会话中对方的uid
            * unreads参数为未读数量列表
            * msgs参数为最后一条消息列表

* `getGroupUnreadConversationList(mtime, mtypes, timeout, callback)`: 获取所有群组未读会话列表
    * `mtime`: **(Optional | int64)** 毫秒级时间戳，大于该时间戳的消息被计为未读消息，未读消息的最后一条作为会话的最后一条消息。不传则默认取上次离线时间。
    * `mtypes`: **(Optional | set<int8>)** 消息类型列表，不传则默认查询mtype为30-50的消息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
            * conversations参数为会话id列表，为p2p会话中对方的uid
            * unreads参数为未读数量列表
            * msgs参数为最后一条消息列表

* `getUnreadConversationList(clear, mtime, mtypes, timeout, callback)`: 获取所有群组未读会话列表
    * `clear`: **(Optional | bool)** 是否清除会话未读状态
    * `mtime`: **(Optional | int64)** 毫秒级时间戳，大于该时间戳的消息被计为未读消息，未读消息的最后一条作为会话的最后一条消息。不传则默认取上次离线时间。
    * `mtypes`: **(Optional | set<int8>)** 消息类型列表，不传则默认查询mtype为30-50的消息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
            * groupConversations参数为群组会话id列表，为群组id
            * groupUnreads参数为群组会话未读数量列表
            * groupMsgs参数为群组会话最后一条消息列表
            * p2pConversations参数为P2P会话id列表，为p2p会话中对方的uid
            * p2pUnreads参数为P2P会话未读数量列表
            * p2pMsgs参数为P2P会话最后一条消息列表

* `removeSession(to, timeout, callback)`: 删除p2p会话
    * `to`: **(Required | Int64)** p2p会话中对方的uid
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64, error:Error])** 
        * `data`: **(object)** 

