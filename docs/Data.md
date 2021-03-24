# RTM Client Websocket SDK Data API Docs

## Index

[TOC]

## Apis

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


