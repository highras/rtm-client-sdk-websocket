# RTM Client Websocket SDK Message API Docs

## Index

[TOC]

## Apis

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

* `getP2PUnreadMessageNum(uids, mtime, mtypes, timeout, callback)`: 获取未读P2P消息数目
    * `uids`: **(Required | [int64])** uid列表
    * `mtime`: **(Required | int64)** 毫秒级时间戳，获取这个时间戳之后的未读消息，如果mtime 为空，则获取上一次logout后的未读消息
    * `mtypes`: **(Required | [number])** 获取指定mtype的未读消息，为空或undefined，则获取聊天相关未读消息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`:
            * `p2p` : **({ uid => num})**
            * `ltime` : **({ session_id => time})** 每个session的的最新一条消息时间

* `getGroupUnreadMessageNum(gids, mtime, mtypes, timeout, callback)`: 获取未读Group消息数目
    * `gids`: **(Required | [int64])** gid列表
    * `mtime`: **(Required | int64)** 毫秒级时间戳，获取这个时间戳之后的未读消息，如果mtime 为空，则获取上一次logout后的未读消息
    * `mtypes`: **(Required | [number])** 获取指定mtype的未读消息，为空或undefined，则获取聊天相关未读消息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`:
            * `group` : **({ gid => num})**
            * `ltime` : **({ session_id => time})** 每个session的的最新一条消息时间    

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

* `getMessage(frrom, mid, xid, type, timeout, callback)`: 获取消息
    * `from`: **(Required | Int64)** 发送者用户 id
    * `mid`: **(Required | Int64)** 消息 id
    * `xid`: **(Required | Int64)** 消息接收方 id (userId/RoomId/GroupId)
    * `type`: **(Required | number)** 接收方类型 (1:p2p, 2:group, 3:room)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[id: Int64, mtype: number, msg: string, attrs: string, mtime: Int64])** 

* `deleteMessage(from, mid, xid, type, timeout, callback)`: 删除消息
    * `from`: **(Required | Int64)** 发送者用户 id
    * `mid`: **(Required | Int64)** 消息 id
    * `xid`: **(Required | Int64)** 消息接收方 id (userId/RoomId/GroupId)
    * `type`: **(Required | number)** 接收方类型 (1:p2p, 2:group, 3:room)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
