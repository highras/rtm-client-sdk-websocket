# RTM Client Websocket SDK System API Docs

## Index

[TOC]

## Apis

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


