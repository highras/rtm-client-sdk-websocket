# RTM Client Websocket SDK File API Docs

## Index

[TOC]

## Apis

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


