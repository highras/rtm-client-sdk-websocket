# RTM Client Websocket SDK Room API Docs

## Index

[TOC]

## Apis

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


* `getRoomMembers(rid, timeout, callback)`: 获取房间成员
    * `rid`: **(Required | int64)** RoomID
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(uids: [int64])** 成员列表

* `getRoomCount(rids, timeout, callback)`: 获取房间成员数量
    * `rids`: **(Required | [int64])** RoomID列表
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(cn: [string => int])** 房间人数
