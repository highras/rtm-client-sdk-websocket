# RTM Client Websocket SDK Friends API Docs

## Index

[TOC]

## Apis

* `addFriends(friends, timeout, callback)`: 添加好友
    * `friends`: **(Required | array[Int64])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(object)**

* `deleteFriends(friends, timeout, callback)`: 删除好友
    * `friends`: **(Required | array[Int64])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(object)**

* `getFriends(timeout, callback)`: 获取好友
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(array[Int64])**

* `addBlacks(blacks, timeout, callback)`: 添加黑名单，每次最多添加100人，拉黑后对方不能给自己发消息，自己可以给对方发，双方能正常获取session及历史消息
    * `blacks`: **(Required | array[Int64])** 多个用户id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(object)**

* `deleteBlacks(blacks, timeout, callback)`: 解除拉黑，每次最多解除100人
    * `friends`: **(Required | array[Int64])** 多个用户id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(object)**

* `getBlacks(timeout, callback)`: 获取被我拉黑的用户列表
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **(array[Int64])**

