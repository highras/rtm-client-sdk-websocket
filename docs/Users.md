# RTM Client Websocket SDK User API Docs

## Index

[TOC]

## Apis

* `getUserGroups(timeout, callback)`: 获取用户所在的Group
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





