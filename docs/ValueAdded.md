# RTM Client Websocket SDK ValueAdded API Docs

## Index

[TOC]

## Apis

* `translate(originalMessage, originalLanguage, targetLanguage, type, profanity, timeout, callback)`: 翻译消息
    * `originalMessage`: **(Required | stirng)** 待翻译的原始消息
    * `originalLanguage`: **(Optional | string)** 待翻译的消息的语言类型, 可为 `undefined`
    * `targetLanguage`: **(Required | string)** 本次翻译的目标语言类型
    * `type`: **(Required | string)** 可选值为chat或mail。如未指定，则默认使用chat
    * `profanity`: **(Required | string)** 敏感语过滤。设置为以下3项之一: off, stop, censor，默认：off
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[source:string, target:string, targetText:string, sourceText:string])** 

* `textCheck(text, timeout, callback)`: 文本审核
    * `text`: **(Required | string)** 文本
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **({ result: int32, ?text: string,?tags:list<int32>,?wlist:list<string> })**
            * `result`: 0: 通过，2，不通过
            * `text`: 敏感词过滤后的文本内容，含有的敏感词会被替换为*，如果没有被标星，则无此字段
            * `tags`: 触发的分类，比如涉黄涉政等等，具体见文本审核分类
            * `wlist`: 敏感词列表

* `imageCheck(image, type, timeout, callback)`: 图片审核
    * `image`: **(Required | string)**  图片的url 或者内容
    * `type`: **(Required | number)**  1, url, 2, 内容
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **({ result: int32, ?tags:list<int32> })**
            * `result`: 0: 通过，2，不通过
            * `tags`: 触发的分类，比如涉黄涉政等等，具体见文本审核分类

* `audioCheck(audio, type, lang, codec, srate, timeout, callback)`: 音频审核
    * `audio`: **(Required | string)**  音频的url 或者内容
    * `type`: **(Required | number)**  1, url, 2, 内容
    * `lang`: **(Required | string)**  音频语言
    * `codec`: **(Optional | string)**  音频b编码, 默认AMR_WB
    * `srate`: **(Optional | number)**  音频采样率, 16000
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **({ result: int32, ?tags:list<int32> })**
            * `result`: 0: 通过，2，不通过
            * `tags`: 触发的分类，比如涉黄涉政等等，具体见文本审核分类

* `videoCheck(video, type, videoName, timeout, callback)`: 视频审核
    * `video`: **(Required | string)**  视频的url 或者内容
    * `type`: **(Required | number)**  1, url, 2, 内容
    * `videoName`: **(Required | string)**  音频文件名
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **({ result: int32, ?tags:list<int32> })**
            * `result`: 0: 通过，2，不通过
            * `tags`: 触发的分类，比如涉黄涉政等等，具体见文本审核分类

* `speech2Text(audio, type, lang, codec, srate, timeout, callback)`: 语音转文字
    * `audio`: **(Required | string)**  音频的url 或者内容
    * `type`: **(Required | number)**  1, url, 2, 内容
    * `lang`: **(Required | string)**  音频语言
    * `codec`: **(Optional | string)**  音频b编码, 默认AMR_WB
    * `srate`: **(Optional | number)**  音频采样率, 16000
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)**
        * `data`: **({ text: string, lang: string })**
            * `text`: 识别的结果
            * `lang`: 识别的语言
