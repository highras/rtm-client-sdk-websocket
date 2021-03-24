# RTM Client Websocket SDK Event Process API Docs

## Index

[TOC]

## Apis

请参考 `RTMConfig.SERVER_PUSH` 成员

* `kickout`: RTMGate主动断开
    * `data`: **(object)**

* `kickoutroom`: RTMGate主动从Room移除
    * `data.rid`: **(Int64)** Room id

* `ping`: RTMGate主动ping
    * `data`: **(object)**

* `pushmsg`: RTMGate主动推送P2P消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushgroupmsg`: RTMGate主动推送Group消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.gid`: **(Int64)** Group id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushroommsg`: RTMGate主动推送Room消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.rid`: **(Int64)** Room id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushbroadcastmsg`: RTMGate主动推送广播消息
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushfile`: RTMGate主动推送P2P文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushgroupfile`: RTMGate主动推送Group文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.gid`: **(Int64)** Group id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushroomfile`: RTMGate主动推送Room文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.rid`: **(Int64)** Room id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushbroadcastfile`: RTMGate主动推送广播文件
    * `data.from`: **(Int64)** 发送者 id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容
    * `data.mtime`: **(Int64)**

* `pushchat`: RTMGate主动推送聊天消息
    * 参数与pushmsg一致

* `pushaudio`: RTMGate主动推送语音聊天消息
    * 参数与pushmsg一致

* `pushcmd`: RTMGate主动推送聊天控制命令
    * 参数与pushmsg一致

* `pushgroupchat`: RTMGate主动推送组聊天消息
    * 参数与pushgroupmsg一致

* `pushgroupaudio`: RTMGate主动推送组语音消息
    * 参数与pushgroupmsg一致

* `pushgroupcmd`: RTMGate主动推送组聊天控制命令
    * 参数与pushgroupmsg一致

* `pushroomchat`: RTMGate主动推送房间聊天消息
    * 参数与pushroommsg一致

* `pushroomaudio`: RTMGate主动推送房间语音消息
    * 参数与pushroommsg一致

* `pushroomcmd`: RTMGate主动推送房间聊天控制命令
    * 参数与pushroommsg一致

* `pushbroadcastchat`: RTMGate主动推送广播聊天消息
    * 参数与pushbroadcastchat一致

* `pushbroadcastaudio`: RTMGate主动推送广播语音消息
    * 参数与pushbroadcastchat一致

* `pushbroadcastcmd`: RTMGate主动推送广播聊天控制命令
    * 参数与pushbroadcastchat一致
