# RTM Client Websocket SDK Group API Docs

## Index

[TOC]

## Apis

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

* `getGroupMembers(gid, online, timeout, callback)`: 获取group成员
    * `gid`: **(Required | Int64)** group id
    * `online`: **(Optional | Bool)** get online users
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64])** 

* `getGroupCount(gid, online, timeout, callback)`: 获取group成员
    * `gid`: **(Required | Int64)** group id
    * `online`: **(Optional | Bool)** get online users count
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64])** 
