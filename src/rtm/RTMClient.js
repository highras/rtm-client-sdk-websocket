'use strict'

const RTMConfig = require('./RTMConfig');
const RTMProcessor = require('./RTMProcessor');

function buildEndpoint(endpoint) {
    let protol = 'ws://';

    if (this._ssl) {

        protol = 'wss://';
    }

    return protol + endpoint + '/service/websocket';
}

function connectRTMGate(callback, timeout) {

    if (this._baseClient != null) {

        this._baseClient.destroy();
    }

    this._baseClient = new fpnn.FPClient({ 
        endpoint: buildEndpoint.call(this, this._endpoint), 
        autoReconnect: false,
        connectionTimeout: this._connectionTimeout,
        platformImpl: this._platformImpl
    });

    let self = this;

    // for connect event
    let connectEventTrigger = false;
    this._baseClient.on('close', function() {});

    this._baseClient.on('error', function(err) {
        onErrorRecorder.call(self, err);
        if (!connectEventTrigger) {
            callback && callback(false, fpnn.FPConfig.ERROR_CODE.FPNN_EC_CORE_INVALID_CONNECTION);
            connectEventTrigger = true;
        }
    });

    this._baseClient.on('connect', function() {
        if (!connectEventTrigger) {
            this._requireClose = false;
            auth.call(self, callback, timeout);
            connectEventTrigger = true;
        }
    });

    this._baseClient.processor = this._processor;
    this._baseClient.connect();
}

function auth(callback, timeout) {

    let payload = {
        pid: this._pid,
		uid: this._uid,
		token: this._token,
        version: "WebSocket_" + RTMConfig.SDK_VERSION
    };

    if (this._attrs) {
        payload.attrs = this._attrs;
    }

    let options = {
        flag: 1,
        method: 'auth',
        payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
    };

    let self = this;

    sendQuest.call(this, this._baseClient, options, function(err, data) {

        if (data && data.ok) {

            if (self._reconnectTimeout) {
                clearTimeout(self._reconnectTimeout);
                self._reconnectTimeout = 0;
            }
            self._reconnectCount = 0;
            self._reconnectInterval = 0; // ms
            self._canReconnect = true;

            self._baseClient.on('close', function() {
                onClose.call(self);
            });
        
            self._baseClient.on('error', function(err) {
                onErrorRecorder.call(self, err);
            });

            self._lastPingTime = parseInt(Date.now() / 1000);

            self._checkLastPingTimerID = setInterval(function() {
                if (parseInt(Date.now() / 1000) - self._lastPingTime >= self._maxPingIntervalSeconds) {
                    onErrorRecorder.call(self, new fpnn.FPError(fpnn.FPConfig.ERROR_CODE.FPNN_EC_CORE_CONNECTION_CLOSED, Error('Close connection for no ping, start reconnect')));
                    self.startAutoReconnect();
                }
            }, self._maxPingIntervalSeconds * 1000 / 2);

            callback && callback(true, fpnn.FPConfig.ERROR_CODE.FPNN_EC_OK);
            return;
        }

        if (data && !data.ok) {
            callback && callback(false, fpnn.FPConfig.ERROR_CODE.FPNN_EC_OK);
        }

        if (err) {
            callback && callback(false, err.code);
            onErrorRecorder.call(self, err);
        }

        if (self._reconnectTimeout) {
            clearTimeout(self._reconnectTimeout);
            self._reconnectTimeout = 0;
        }
        self._reconnectCount = 0;
        self._reconnectInterval = 0; // ms
    }, timeout);
}

function onClose() {

    if (this._reconnectTimeout) {
        clearTimeout(this._reconnectTimeout);
        this._reconnectTimeout = 0;
    }

    if (this._checkLastPingTimerID) {
        clearInterval(this._checkLastPingTimerID);
        this._checkLastPingTimerID = 0;
    }

    if (this._requireClose) {
        this.emit('SessionClosed', fpnn.FPConfig.ERROR_CODE.FPNN_EC_OK);
        this._reconnectCount = 0;
        this._reconnectInterval = 0; // ms
        this._canReconnect = false;
        return;
    }

    if (!this._autoReconnect) {
        this.emit('SessionClosed', fpnn.FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR);
        this._reconnectCount = 0;
        this._reconnectInterval = 0; // ms
        this._canReconnect = false;
        return;
    }

    onErrorRecorder.call(this, new fpnn.FPError(fpnn.FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR, new Error("connection closed, requireClose: " + this._requireClose)));

    reConnect.call(this);
}

function reConnect() {

    if (this._requireClose || !this._canReconnect) {
        return;
    }

    let interval = 0;
    if (this._reconnectCount >= this._regressiveStrategy.startConnectFailedCount) {
        interval = this._reconnectInterval + this._regressiveStrategy.maxIntervalSeconds * 1000 / this._regressiveStrategy.linearRegressiveCount;
        if (interval > this._regressiveStrategy.maxIntervalSeconds * 1000) {
            interval = this._regressiveStrategy.maxIntervalSeconds * 1000;
        }
        this._reconnectInterval = interval;
    }
    this._reconnectCount += 1;
    let reconnectCountCache = this._reconnectCount;

    let self = this;

    this._reconnectTimeout = setTimeout(function() {
        self.login(self._uid, self._token, function(ok, errorCode) {
            if (errorCode == fpnn.FPConfig.ERROR_CODE.FPNN_EC_OK) {
                if (!ok) {
                    self.emit('ReloginCompleted', false, false, rtm.RTMConfig.ERROR_CODE.RTM_EC_INVALID_AUTH_TOEKN, reconnectCountCache);
                    self.emit('SessionClosed', rtm.RTMConfig.ERROR_CODE.RTM_EC_INVALID_AUTH_TOEKN);
                    onErrorRecorder.call(self, new fpnn.FPError(RTMConfig.ERROR_CODE.RTM_EC_UNKNOWN_ERROR, new Error("relogin fail, token error, reconnectCount: " + reconnectCountCache)));
                    self._reconnectCount = 0;
                    self._reconnectInterval = 0; // ms
                    self._canReconnect = false;
                } else {
                    self.emit('ReloginCompleted', true, false, fpnn.FPConfig.ERROR_CODE.FPNN_EC_OK, reconnectCountCache);
                    onErrorRecorder.call(self, new fpnn.FPError(fpnn.FPConfig.ERROR_CODE.FPNN_EC_OK, new Error("relogin successfully, reconnectCount: " + reconnectCountCache)));
                    self._reconnectCount = 0;
                    self._reconnectInterval = 0; // ms
                }
            } else {
                self.emit('ReloginCompleted', false, true, errorCode, reconnectCountCache);
                reConnect.call(self);
                onErrorRecorder.call(self, new fpnn.FPError(RTMConfig.ERROR_CODE.RTM_EC_UNKNOWN_ERROR, new Error("relogin fail, errorCode: " + errorCode + ", reconnectCount: " + reconnectCountCache)));
            }
        }, interval);
    }, interval);
}

function onErrorRecorder(err) {
    this.emit('ErrorRecorder', err);
}

function md5_encode(str) {

    if (this._md5) {

        return this._md5(str).toUpperCase();
    }

    return md5(str).toUpperCase();
}

function fileSendProcess(ops, file, mid, callback, timeout) {

    let self = this;

    if (!mid || mid.toString() == '0') {

        mid = genMid.call(this);
    }

    filetoken.call(self, ops, function(err, data) {

        if (err) {
            callback && callback({ mid: mid, error: err }, null);
            return;
        }

        let token = data["token"];
        let endpoint = data["endpoint"];

        let ext = null;
        if (file != undefined && file.name !== undefined) {
            let index = file.name.lastIndexOf('.');

            if (index != -1) {

                ext = file.name.slice(index + 1);
            }
        }

        if (!token || !endpoint) {

            callback && callback({ mid: mid, error: new fpnn.FPError(RTMConfig.ERROR_CODE.RTM_EC_UNKNOWN_ERROR, new Error(JSON.stringify(data))) }, null);
            return;
        }

        let reader = new FileReader();

        reader.onload = function(e) {

            let content = Buffer.from(e.target.result);

            console.log("content:");
            console.log(content.length);

            if (!content) {

                callback && callback({ mid: mid, error: new fpnn.FPError(RTMConfig.ERROR_CODE.RTM_EC_UNKNOWN_ERROR, new Error('no file content!')) }, null);
                return;
            }

            let md5_content = md5_encode.call(self, content).toLowerCase();
            let sign = md5_encode.call(self, md5_content + ':' + token).toLowerCase();

            let ep = self._endpoint.split(':');
            
            var fileEndpoint = "ws://fileproxy-" + ep[0] + ":13461/service/websocket";
            if (self._ssl) {
                fileEndpoint = "wss://fileproxy-" + ep[0] + ":13462/service/websocket";
            }

            let fileClient = new fpnn.FPClient({ 
                endpoint: fileEndpoint,
                autoReconnect: false,
                connectionTimeout: timeout,
                platformImpl: self._platformImpl
            });

            fileClient.on('close', function(){

            });

            fileClient.on('error', function(err) {
                let errorCode = RTMConfig.ERROR_CODE.RTM_EC_UNKNOWN_ERROR;
                if (err.code !== undefined) {
                    errorCode = err.code;
                }
                onErrorRecorder.call(self, new fpnn.FPError(errorCode, err));
            });

            fileClient.on('connect', function() {
                let options = {
                    token: token,
                    sign: sign,
                    ext: ext,
                    file: content,
                    endpoint: endpoint
                };

                for (let key in ops) {

                    options[key] = ops[key];
                }

                sendFileCommon.call(self, fileClient, options, mid, callback, timeout);

            });

            fileClient.connect();
        };
        
        reader.readAsArrayBuffer(file);
    });
}

function filetoken(ops, callback, timeout) {

    let payload = {};

    for (let key in ops) {

        if (key == 'mtype') {

            continue;
        }

        payload[key] = ops[key];
    }

    let options = {
        flag: 1,
        method: 'filetoken',
        payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, this._baseClient, options, callback, timeout);
}

function sendFileCommon(fileClient, ops, mid, callback, timeout) {

    let payload = {
        pid: this._pid,
        from: this._uid,
        mid: mid,
        endpoint: ops.endpoint
    };

    for (let key in ops) {

        if (key == 'sign') {
            payload.attrs = JSON.stringify({ rtm: {sign: ops.sign, ext: ops.ext } });
            continue;
        }

        if (key == 'ext') {

            continue;
        }

        if (key == 'cmd') {

            continue;
        }

        payload[key] = ops[key];
    }

    let options = {
        flag: 1,
        method: ops.cmd,
        payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, fileClient, options, function(err, data){

        fileClient.destroy();

        if (err) {

            callback && callback({ mid: payload.mid, error: err }, null);
            return;
        }

        if (data.mtime !== undefined) {

            data.mtime = new RTMConfig.Int64('' + data.mtime);
        }

        callback && callback(null, { mid: payload.mid, payload: data });
    }, timeout);
}

function genMid() {


    if (++this._midSeq >= 999) {

        this._midSeq = 0;
    }

    let strFix = this._midSeq.toString();

    if (this._midSeq < 100) {

        strFix = '0' + strFix;
    }

    if (this._midSeq < 10) {

        strFix = '0' + strFix;
    }

    return new RTMConfig.Int64(Date.now().toString() + strFix);
}

function isException(isAnswerErr, data) {

    if (!data) {

        return new fpnn.FPError(RTMConfig.ERROR_CODE.RTM_EC_UNKNOWN_ERROR, Error('data is null'));
    }

    if (data instanceof Error) {
        let errorCode = RTMConfig.ERROR_CODE.RTM_EC_UNKNOWN_ERROR;
        if (data.code !== undefined) {
            errorCode = data.code;
        }
        return new fpnn.FPError(errorCode, data);
    }

    if (isAnswerErr) {

        if (data.hasOwnProperty('code') && data.hasOwnProperty('ex')) {
            return new fpnn.FPError(data.code, new Error(data.ex));
        }
    }

    return null;
}

function sendQuest(client, options, callback, timeout, hasBinary = false) {

    let self = this;

    if (!client) {

        callback && callback(new fpnn.FPError(fpnn.FPConfig.ERROR_CODE.FPNN_EC_CORE_INVALID_CONNECTION, Error('invalid connection')), null);
        return;
    }

    client.sendQuest(options, function(data) {
        
        if (!callback) {

            return;
        }

        let err = null;
        let isAnswerErr = false;

        if (data.payload) {

            let payload = null;

            if (hasBinary) {
                payload = RTMConfig.MsgPack.decode(data.payload, self._binaryOptions);
            } else {
                payload = RTMConfig.MsgPack.decode(data.payload, self._msgOptions);
            }

            if (data.mtype == 2) {

                isAnswerErr = data.ss != 0;
            }

            err = isException.call(self, isAnswerErr, payload);

            if (err) {

                callback && callback(err, null);
                return;
            }

            callback && callback(null, payload);
            return;
        }

        err = isException.call(self, isAnswerErr, data);

        if (err) {

            callback && callback(err, null);
            return;
        }

        callback && callback(null, data);
    }, timeout);
}

class RTMClient {

    constructor(options) {

        fpnn.FPEvent.assign(this);

        this._endpoint = options.endpoint;
        this._pid = options.pid;
        this._attrs = options.attrs;
        this._autoReconnect = options.autoReconnect !== undefined ? options.autoReconnect : true;
        this._connectionTimeout = options.connectionTimeout || 30 * 1000;
        this._maxPingIntervalSeconds = RTMConfig.MAX_PING_SECONDS;
        this._platformImpl = undefined;

        if (options.maxPingIntervalSeconds !== undefined) {
            this._maxPingIntervalSeconds = options.maxPingIntervalSeconds;
        }
        this._lastPingTime = 0;
        this._checkLastPingTimerID = 0;

        this._regressiveStrategy = {
            startConnectFailedCount: 3,
            maxIntervalSeconds: 8,
            linearRegressiveCount: 4
        };
        if (options.regressiveStrategy !== undefined
            && options.regressiveStrategy.startConnectFailedCount !== undefined
            && options.regressiveStrategy.maxIntervalSeconds !== undefined
            && options.regressiveStrategy.linearRegressiveCount !== undefined) {
            this._regressiveStrategy.startConnectFailedCount = options.regressiveStrategy.startConnectFailedCount;
            this._regressiveStrategy.maxIntervalSeconds = options.regressiveStrategy.maxIntervalSeconds;
            this._regressiveStrategy.linearRegressiveCount = options.regressiveStrategy.linearRegressiveCount;
        }
        this._canReconnect = false;
        this._reconnectCount = 0;
        this._reconnectInterval = 0; // ms

        if (this._endpoint != undefined) {
            let ep = this._endpoint.split(':');
            if (ep.length == 2 && ep[1] == '13325') {
                this._endpoint = ep[0] + ':13321';
            }
        }

        this._ssl = false;
        if (options.ssl_endpoint != undefined) {
            this._endpoint = options.ssl_endpoint;
            this._ssl = true;
        }

        if (options.platformImpl !== undefined) {
            this._platformImpl = options.platformImpl;
        }

        this._md5 = options.md5 || null;

        this._midSeq = 0;
        this._saltSeq = 0;

        this._baseClient = null;
        this._reconnectTimeout = 0;

        this._requireClose = false;

        this._msgOptions = {

            codec: RTMConfig.MsgPack.createCodec({  

                int64: true
            }) 
        };

        this._binaryOptions = {

            codec: RTMConfig.MsgPack.createCodec({  

                int64: true,
                useraw: true
            }) 
        };

        let self = this;
        this._processor = new RTMProcessor(this);
        this._processor.on(RTMConfig.SERVER_PUSH.kickOut, function(data) {
            self._requireClose = true;
            self._baseClient.close();
        });
    }

    get processor() {

        return this._processor;
    }

    login(uid, token, callback, timeout) {
        this._uid = uid;
        this._token = token;
        connectRTMGate.call(this, callback, timeout);
    }

    bye() {
        let payload = {};

        let options = {
            flag: 1,
            method: 'bye',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        let self = this;
        this._requireClose = true;

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (self._baseClient) {

                self._baseClient.close();
            }
        });
    }
    
    close() {
        this._requireClose = true;
        if (this._baseClient) {
            this._baseClient.close();
        }
    }

    startAutoReconnect() {
        this._requireClose = false;
        if (this._baseClient) {
            this._baseClient.close();
        }
    }

    destroy() {

        this.close();

        this._midSeq = 0;
        this._saltSeq = 0;

        if (this._processor) {

            this._processor.destroy();
            this._processor = null;
        }

        if (this._baseClient) {

            this._baseClient.destroy();
            this._baseClient = null;
        }

        if (this._reconnectTimeout) {
            clearTimeout(this._reconnectTimeout);
            this._reconnectTimeout = 0;
        }

        if (this._checkLastPingTimerID) {
            clearInterval(this._checkLastPingTimerID);
            this._checkLastPingTimerID = 0;
        }

        this.removeEvent();
    }

    sendMessage(to, mtype, msg, attrs, mid, timeout, callback) {
        
        if (!mid || mid.toString() == '0') {

            mid = genMid.call(this);
        }

        let payload = {
            to: to,
            mid: mid,
            mtype: mtype,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {
                callback && callback({ mid: payload.mid, error: err }, null);
                return;
            }

            if (data.mtime !== undefined) {

                data.mtime = new RTMConfig.Int64(data.mtime);
            }

            callback && callback(null, { mid: payload.mid, payload: data });
        }, timeout);
    }

    sendGroupMessage(gid, mtype, msg, attrs, mid, timeout, callback) {
        
        if (!mid || mid.toString() == '0') {

            mid = genMid.call(this);
        }

        let payload = {
            gid: gid,
            mid: mid || genMid.call(this),
            mtype: mtype,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendgroupmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback({ mid: payload.mid, error: err }, null);
                return;
            }

            if (data.mtime !== undefined) {

                data.mtime = new RTMConfig.Int64(data.mtime);
            }

            callback && callback(null, { mid: payload.mid, payload: data });
        }, timeout);
    }

    sendRoomMessage(rid, mtype, msg, attrs, mid, timeout, callback) {

        if (!mid || mid.toString() == '0') {

            mid = genMid.call(this);
        }

        let payload = {
            rid: rid,
            mid: mid || genMid.call(this),
            mtype: mtype,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendroommsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback({ mid: payload.mid, error: err }, null);
                return;
            }

            if (data.mtime !== undefined) {

                data.mtime = new RTMConfig.Int64(data.mtime);
            }

            callback && callback(null, { mid: payload.mid, payload: data });
        }, timeout);
    }

    getUnreadMessage(clear, timeout, callback) {

        let payload = {
            clear: clear
        };

        let options = {
            flag: 1,
            method: 'getunread',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let p2p = data['p2p'];
            if (p2p) {
                let bp2p = [];
                p2p.forEach(function(item, index) {
                    bp2p[index] = new RTMConfig.Int64('' + item);
                });
                data.p2p = p2p;
            }

            let group = data['group'];
            if (group) {
                let bgroup = [];
                group.forEach(function(item, index) {
                    bgroup[index] = new RTMConfig.Int64('' + item);
                });
                data.group = group;
            }

            callback && callback(null, data);
        }, timeout);
    }

    getP2PUnreadMessageNum(uids, mtime, mtypes, timeout, callback) {

        let payload = {
            uids: uids
        };

        if (mtime !== undefined) {
            payload.mtime = mtime;
        }

        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getp2punread',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let result = {};
            result['p2p'] = {};
            result['ltime'] = {};
            let p2p = data['p2p'];
            if (p2p) {
                for (var key in p2p) {
                    result['p2p'][new RTMConfig.Int64('' + key)] = p2p[key];
                }
            }

            let ltime = data['ltime'];
            if (ltime) {
                for (var key in ltime) {
                    result['ltime'][new RTMConfig.Int64('' + key)] = new RTMConfig.Int64('' + ltime[key]);
                }
            }

            callback && callback(null, result);
        }, timeout);
    }

    getGroupUnreadMessageNum(gids, mtime, mtypes, timeout, callback) {

        let payload = {
            gids: gids
        };

        if (mtime !== undefined) {
            payload.mtime = mtime;
        }

        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getgroupunread',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let result = {};
            result['group'] = {};
            result['ltime'] = {};
            let group = data['group'];
            if (group) {
                for (var key in group) {
                    result['group'][new RTMConfig.Int64('' + key)] = group[key];
                }
            }

            let ltime = data['ltime'];
            if (ltime) {
                for (var key in ltime) {
                    result['ltime'][new RTMConfig.Int64('' + key)] = new RTMConfig.Int64('' + ltime[key]);
                }
            }

            callback && callback(null, result);
        }, timeout);
    }

    cleanUnreadMessage(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'cleanunread',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getSession(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getsession',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {
            
            if (err) {

                callback && callback(err, null);
                return;
            }

            let p2p = data['p2p'];
            if (p2p) {
                let bp2p = [];
                p2p.forEach(function(item, index) {
                    bp2p[index] = new RTMConfig.Int64('' + item);
                });
                data.p2p = p2p;
            }

            let group = data['group'];
            if (group) {
                let bgroup = [];
                group.forEach(function(item, index) {
                    bgroup[index] = new RTMConfig.Int64('' + item);
                });
                data.group = group;
            }

            callback && callback(null, data);
        }, timeout);
    }

    getGroupMessage(gid, desc, num, begin, end, lastid, mtypes, timeout, callback) {
        
        let payload = {
            gid: gid,
            desc: desc,
            num: num
        };

        if (begin !== undefined) {

            payload.begin = begin;
        }

        if (end !== undefined) {

            payload.end = end;
        }

        if (lastid !== undefined) {

            payload.lastid = lastid;
        }

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getgroupmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                msgs.forEach(function(item, index) {

                    let msg = item[5];
                    let binary = msg;
                    try {
                        msg = new TextDecoder("utf-8", {"fatal":true}).decode(msg);
                    } catch (err) {
                        msg = undefined;
                    }

                    let attrs = item[6];
                    try {
                        attrs = new TextDecoder("utf-8", {"fatal":true}).decode(attrs);
                    } catch (err) {}

                    msgs[index] = {
                        id: new RTMConfig.Int64('' + item[0]),
                        from: new RTMConfig.Int64(''+ item[1]),
                        mtype: Number(item[2]),
                        mid: new RTMConfig.Int64('' + item[3]),
                        deleted: item[4],
                        msg: msg,
                        binary: binary,
                        attrs: attrs,
                        mtime: new RTMConfig.Int64('' + item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout, true);
    }

    getRoomMessage(rid, desc, num, begin, end, lastid, mtypes, timeout, callback) {

        let payload = {
            rid: rid,
            desc: desc,
            num: num
        };

        if (begin !== undefined) {

            payload.begin = begin;
        }

        if (end !== undefined) {

            payload.end = end;
        }

        if (lastid !== undefined) {

            payload.lastid = lastid;
        }

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getroommsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                msgs.forEach(function(item, index) {

                    let msg = item[5];
                    let binary = msg;
                    try {
                        msg = new TextDecoder("utf-8", {"fatal":true}).decode(msg);
                    } catch (err) {
                        msg = undefined;
                    }

                    let attrs = item[6];
                    try {
                        attrs = new TextDecoder("utf-8", {"fatal":true}).decode(attrs);
                    } catch (err) {}

                    msgs[index] = {
                        id: new RTMConfig.Int64('' + item[0]),
                        from: new RTMConfig.Int64('' + item[1]),
                        mtype: Number(item[2]),
                        mid: new RTMConfig.Int64('' + item[3]),
                        deleted: item[4],
                        msg: msg,
                        binary: binary,
                        attrs: attrs,
                        mtime: new RTMConfig.Int64('' + item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout, true);
    }

    getBroadcastMessage(desc, num, begin, end, lastid, mtypes, timeout, callback) {

        let payload = {
            desc: desc,
            num: num
        };

        if (begin !== undefined) {

            payload.begin = begin;
        }

        if (end !== undefined) {

            payload.end = end;
        }

        if (lastid !== undefined) {

            payload.lastid = lastid;
        }

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getbroadcastmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                msgs.forEach(function(item, index) {

                    let msg = item[5];
                    let binary = msg;
                    try {
                        msg = new TextDecoder("utf-8", {"fatal":true}).decode(msg);
                    } catch (err) {
                        msg = undefined;
                    }

                    let attrs = item[6];
                    try {
                        attrs = new TextDecoder("utf-8", {"fatal":true}).decode(attrs);
                    } catch (err) {}

                    msgs[index] = {
                        id: new RTMConfig.Int64('' + item[0]),
                        from: new RTMConfig.Int64('' + item[1]),
                        mtype: Number(item[2]),
                        mid: new RTMConfig.Int64('' + item[3]),
                        deleted: item[4],
                        msg: msg,
                        binary: binary,
                        attrs: attrs,
                        mtime: new RTMConfig.Int64('' + item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout, true);
    }

    getP2PMessage(ouid, desc, num, begin, end, lastid, mtypes, timeout, callback) {

        let payload = {
            ouid: ouid,
            desc: desc,
            num: num
        };

        if (begin !== undefined) {

            payload.begin = begin;
        }

        if (end !== undefined) {

            payload.end = end;
        }

        if (lastid !== undefined) {

            payload.lastid = lastid;
        }

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getp2pmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                msgs.forEach(function(item, index) {

                    let msg = item[5];
                    let binary = msg;
                    try {
                        msg = new TextDecoder("utf-8", {"fatal":true}).decode(msg);
                    } catch (err) {
                        msg = undefined;
                    }

                    let attrs = item[6];
                    try {
                        attrs = new TextDecoder("utf-8", {"fatal":true}).decode(attrs);
                    } catch (err) {}

                    msgs[index] = {
                        id: new RTMConfig.Int64('' + item[0]),
                        direction: Number(item[1]),
                        mtype: Number(item[2]),
                        mid: new RTMConfig.Int64('' + item[3]),
                        deleted: item[4],
                        msg: msg,
                        binary: binary,
                        attrs: item[6],
                        mtime: new RTMConfig.Int64('' + item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout, true);
    }

    fileToken(cmd, tos, to, rid, gid, timeout, callback) {

        let options = {
            cmd: cmd
        }

        if (tos !== undefined) {

            options.tos = tos;
        }

        if (to !== undefined) {

            options.to = to;
        }

        if (rid !== undefined) {

            options.rid = rid;
        }

        if (gid !== undefined) {

            options.gid = gid;
        }

        filetoken.call(this, options, callback, timeout); 
    }

    addAttrs(attrs, timeout, callback) {

        let payload = {
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'addattrs',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getAttrs(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getattrs',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    addDebugLog(msg, attrs, timeout, callback) {

        let payload = {
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'adddebuglog',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    addDevice(apptype, devicetoken, timeout, callback) {

        let payload = {
            apptype: apptype,
            devicetoken: devicetoken
        };

        let options = {
            flag: 1,
            method: 'adddevice',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    removeDevice(devicetoken, timeout, callback) {

        let payload = {
            devicetoken: devicetoken
        };

        let options = {
            flag: 1,
            method: 'removedevice',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    setTranslationLanguage(targetLanguage, timeout, callback) {

        let payload = {
            lang: targetLanguage
        };

        let options = {
            flag: 1,
            method: 'setlang',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    translate(originalMessage, originalLanguage, targetLanguage, type, profanity, timeout, callback) {

        let payload = {
            text: originalMessage,
            dst: targetLanguage
        };

        if (originalLanguage !== undefined) {

            payload.src = originalLanguage;
        }

        if (type !== undefined) {

            payload.type = type;
        }

        if (profanity !== undefined) {

            payload.profanity = profanity;
        }

        let options = {
            flag: 1,
            method: 'translate',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    profanity(text, classify, timeout, callback) {

        let payload = {
            text: text
        };

        if (classify !== undefined) {

            payload.classify = classify;
        }

        let options = {
            flag: 1,
            method: 'profanity',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    textCheck(text, strategyId, timeout, callback) {

        let payload = {
            text: text,
        };

        if (strategyId !== undefined) {
            payload.strategyId = strategyId;
        }

        let options = {
            flag: 1,
            method: 'tcheck',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    imageCheck(image, type, strategyId, timeout, callback) {

        let payload = {
            image: image,
            type: type,
        };

        if (strategyId !== undefined) {
            payload.strategyId = strategyId;
        }

        let options = {
            flag: 1,
            method: 'icheck',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    audioCheck(audio, type, lang, codec, srate, strategyId, timeout, callback) {

        let payload = {
            audio: audio,
            type: type,
            lang: lang
        };

        if (codec !== undefined) {

            payload.codec = codec;
        }

        if (srate !== undefined) {

            payload.srate = srate;
        }

        if (strategyId !== undefined) {
            payload.strategyId = strategyId;
        }

        let options = {
            flag: 1,
            method: 'acheck',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    videoCheck(video, type, videoName, strategyId, timeout, callback) {

        let payload = {
            video: video,
            type: type,
            videoName: videoName
        };

        if (strategyId !== undefined) {
            payload.strategyId = strategyId;
        }

        let options = {
            flag: 1,
            method: 'vcheck',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    speech2Text(audio, type, lang, codec, srate, timeout, callback) {

        let payload = {
            audio: audio,
            type: type,
            lang: lang
        };

        if (codec !== undefined) {

            payload.codec = codec;
        }

        if (srate !== undefined) {

            payload.srate = srate;
        }

        let options = {
            flag: 1,
            method: 'speech2text',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getGroupsOpenInfo(gids, timeout, callback) {

        let payload = {
            gids: gids
        };

        let options = {
            flag: 1,
            method: 'getgroupsopeninfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getRoomsOpenInfo(rids, timeout, callback) {

        let payload = {
            rids: rids
        };

        let options = {
            flag: 1,
            method: 'getroomsopeninfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getRoomMembers(rid, timeout, callback) {

        let payload = {
            rid: rid
        };

        let options = {
            flag: 1,
            method: 'getroommembers',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getRoomCount(rids, timeout, callback) {

        let payload = {
            rids: rids
        };

        let options = {
            flag: 1,
            method: 'getroomcount',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    addDevicePushOption(type, xid, mtypes, timeout, callback) {

        let payload = {
            type: type,
            xid: xid
        };

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'addoption',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    removeDevicePushOption(type, xid, mtypes, timeout, callback) {

        let payload = {
            type: type,
            xid: xid
        };

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'removeoption',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getDevicePushOption(timeout, callback) {

        let payload = {
          
        };

        let options = {
            flag: 1,
            method: 'getoption',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    addFriends(friends, timeout, callback) {

        let payload = {
            friends: friends
        };

        let options = {
            flag: 1,
            method: 'addfriends',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    deleteFriends(friends, timeout, callback) {

        let payload = {
            friends: friends
        };

        let options = {
            flag: 1,
            method: 'delfriends',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getFriends(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getfriends',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];

            if (uids) {

                let buids = [];

                uids.forEach(function(item, index) {

                    buids[index] = new RTMConfig.Int64(item);
                });

                callback && callback(null, buids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    addGroupMembers(gid, uids, timeout, callback) {

        let payload = {
            gid: gid,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'addgroupmembers',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };
        
        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    deleteGroupMembers(gid, uids, timeout, callback) {
        
        let payload = {
            gid: gid,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'delgroupmembers',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getGroupMembers(gid, online, timeout, callback) {

        let payload = {
            gid: gid
        };

        if (online !== undefined) {
            payload.online = online;
        }

        let options = {
            flag: 1,
            method: 'getgroupmembers',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];

            if (uids) {
                let buids = [];
                uids.forEach(function(item, index) {

                    buids[index] = new RTMConfig.Int64(item);
                });

                data['uids'] = buids;
            }

            let onlines = data['onlines'];
            if (onlines) {
                let ouids = [];
                onlines.forEach(function(item, index) {

                    ouids[index] = new RTMConfig.Int64(item);
                });

                data['onlines'] = ouids;
            }

            callback && callback(null, data);
        }, timeout);
    }

    getGroupCount(gid, online, timeout, callback) {

        let payload = {
            gid: gid
        };

        if (online !== undefined) {
            payload.online = online;
        }

        let options = {
            flag: 1,
            method: 'getgroupcount',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }
            callback && callback(null, data);
        }, timeout);
    }

    getUserGroups(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getusergroups',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let gids = data['gids'];

            if (gids) {

                let bgids = [];

                gids.forEach(function(item, index) {

                    bgids[index] = new RTMConfig.Int64(item);
                });

                callback && callback(null, bgids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    enterRoom(rid, timeout, callback) {

        let payload = {
            rid: rid
        };

        let options = {
            flag: 1,
            method: 'enterroom',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    leaveRoom(rid, timeout, callback) {

        let payload = {
            rid: rid
        };

        let options = {
            flag: 1,
            method: 'leaveroom',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getUserRooms(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getuserrooms',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let rids = data['rooms'];

            if (rids) {

                let brids = [];

                rids.forEach(function(item, index) {
                    
                    brids[index] = new RTMConfig.Int64(item);
                });

                callback && callback(null, brids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    getOnlineUsers(uids, timeout, callback) {
        
        let payload = {
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'getonlineusers',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];

            if (uids) {

                let buids = [];

                uids.forEach(function(item, index) {

                    buids[index] = new RTMConfig.Int64(item);
                });

                callback && callback(null, buids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    deleteMessage(from, mid, xid, type, timeout, callback) {

        let payload = {
            from: from,
            mid: mid,
            xid: xid,
            type: type
        };

        let options = {
            flag: 1,
            method: 'delmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getMessage(from, mid, xid, type, timeout, callback) {
        
        let payload = {
            from: from,
            mid: mid,
            xid: xid,
            type: type
        };

        let options = {
            flag: 1,
            method: 'getmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            if (data.id !== undefined) {
                data.id = new RTMConfig.Int64('' + data.id);
            }

            if (data.mtime !== undefined) {
                data.mtime = new RTMConfig.Int64('' + data.mtime);
            }

            callback && callback(null, data);
        }, timeout, true);
    }

    sendChat(to, msg, attrs, mid, timeout, callback) {
        this.sendMessage.call(this, to, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback)
    }

    sendAudio(to, msg, attrs, mid, timeout, callback) {
        this.sendMessage.call(this, to, RTMConfig.CHAT_TYPE.audio, msg, attrs, mid, timeout, callback)
    }

    sendCmd(to, msg, attrs, mid, timeout, callback) {
        this.sendMessage.call(this, to, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback)
    }

    sendGroupChat(gid, msg, attrs, mid, timeout, callback) {
        this.sendGroupMessage.call(this, gid, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback)
    }

    sendGroupAudio(gid, msg, attrs, mid, timeout, callback) {
        this.sendGroupMessage.call(this, gid, RTMConfig.CHAT_TYPE.audio, msg, attrs, mid, timeout, callback)
    }

    sendGroupCmd(gid, msg, attrs, mid, timeout, callback) {
        this.sendGroupMessage.call(this, gid, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback)
    }

    sendRoomChat(rid, msg, attrs, mid, timeout, callback) {
        this.sendRoomMessage.call(this, rid, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback)
    }

    sendRoomAudio(rid, msg, attrs, mid, timeout, callback) {
        this.sendRoomMessage.call(this, rid, RTMConfig.CHAT_TYPE.audio, msg, attrs, mid, timeout, callback)
    }

    sendRoomCmd(rid, msg, attrs, mid, timeout, callback) {
        this.sendRoomMessage.call(this, rid, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback)
    }

    getGroupChat(gid, desc, num, begin, end, lastid, timeout, callback) {
        this.getGroupMessage.call(this, gid, desc, num, begin, end, lastid, [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd], timeout, callback);
    }

    getRoomChat(rid, desc, num, begin, end, lastid, timeout, callback) {
        this.getRoomMessage.call(this, rid, desc, num, begin, end, lastid, [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd], timeout, callback);
    }

    getP2PChat(ouid, desc, num, begin, end, lastid, timeout, callback) {
        this.getP2PMessage.call(this, ouid, desc, num, begin, end, lastid, [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd], timeout, callback);
    }

    getBroadcastChat(desc, num, begin, end, lastid, timeout, callback) {
        this.getBroadcastMessage.call(this, desc, num, begin, end, lastid, [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd], timeout, callback);
    }

    deleteChat(from, mid, xid, type, timeout, callback) {
        this.deleteMessage(this, from, mid, xid, type, timeout, callback);
    }

    getChat(from, mid, xid, type, timeout, callback) {
        this.getChat(this, from, mid, xid, type, timeout, callback);
    }

    setUserInfo(oinfo, pinfo, timeout, callback) {

        let payload = {};

        if (oinfo !== undefined) {
            payload.oinfo = oinfo;
        }

        if (pinfo !== undefined) {
            payload.pinfo = pinfo;
        }

        let options = {
            flag: 1,
            method: 'setuserinfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getUserInfo(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getuserinfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getUserOpenInfo(uids, timeout, callback) {

        let payload = {
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'getuseropeninfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    setGroupInfo(gid, oinfo, pinfo, timeout, callback) {

        let payload = {
            gid: gid
        };

        if (oinfo !== undefined) {
            payload.oinfo = oinfo;
        }

        if (pinfo !== undefined) {
            payload.pinfo = pinfo;
        }

        let options = {
            flag: 1,
            method: 'setgroupinfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getGroupInfo(gid, timeout, callback) {

        let payload = {
            gid: gid
        };

        let options = {
            flag: 1,
            method: 'getgroupinfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getGroupOpenInfo(gid, timeout, callback) {

        let payload = {
            gid: gid
        };

        let options = {
            flag: 1,
            method: 'getgroupopeninfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    setRoomInfo(rid, oinfo, pinfo, timeout, callback) {

        let payload = {
            rid: rid
        };

        if (oinfo !== undefined) {
            payload.oinfo = oinfo;
        }

        if (pinfo !== undefined) {
            payload.pinfo = pinfo;
        }

        let options = {
            flag: 1,
            method: 'setroominfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getRoomInfo(rid, timeout, callback) {

        let payload = {
            rid: rid
        };

        let options = {
            flag: 1,
            method: 'getroominfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getRoomOpenInfo(rid, timeout, callback) {

        let payload = {
            rid: rid
        };

        let options = {
            flag: 1,
            method: 'getroomopeninfo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    dataSet(key, value, timeout, callback) {

        let payload = {
            key: key,
            val: value
        };

        let options = {
            flag: 1,
            method: 'dataset',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    dataGet(key, timeout, callback) {

        let payload = {
            key: key
        };

        let options = {
            flag: 1,
            method: 'dataget',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    dataDelete(key, timeout, callback) {

        let payload = {
            key: key
        };

        let options = {
            flag: 1,
            method: 'datadel',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    addBlacks(blacks, timeout, callback) {

        let payload = {
            blacks: blacks
        };

        let options = {
            flag: 1,
            method: 'addblacks',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    deleteBlacks(blacks, timeout, callback) {

        let payload = {
            blacks: blacks
        };

        let options = {
            flag: 1,
            method: 'delblacks',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getBlacks(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getblacks',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];

            if (uids) {

                let buids = [];

                uids.forEach(function(item, index) {

                    buids[index] = new RTMConfig.Int64('' + item);
                });

                callback && callback(null, buids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    sendFile(mtype, to, file, mid, timeout, callback) {

        let ops = {
            to: to,
            mtype: mtype,
            cmd: 'sendfile'
        };

        fileSendProcess.call(this, ops, file, mid, callback, timeout);
    }

    sendGroupFile(mtype, gid, file, mid, timeout, callback) {

        let ops = {
            gid: gid,
            mtype: mtype,
            cmd: 'sendgroupfile'
        };

        fileSendProcess.call(this, ops, file, mid, callback, timeout);
    }

    sendRoomFile(mtype, rid, file, mid, timeout, callback) {

        let ops = {
            rid: rid,
            mtype: mtype,
            cmd: 'sendroomfile'
        };

        fileSendProcess.call(this, ops, file, mid, callback, timeout);
    }

    getP2PConversationList(mtime, mtypes, timeout, callback) {
        let payload = {

        };

        if (mtime !== undefined) {
            payload.mtime = mtime;
        }

        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getp2pconversationlist',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getP2PUnreadConversationList(mtime, mtypes, timeout, callback) {
        let payload = {

        };

        if (mtime !== undefined) {
            payload.mtime = mtime;
        }

        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getp2punreadconversationlist',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getGroupConversationList(mtime, mtypes, timeout, callback) {
        let payload = {

        };

        if (mtime !== undefined) {
            payload.mtime = mtime;
        }

        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getgroupconversationlist',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getGroupUnreadConversationList(mtime, mtypes, timeout, callback) {
        let payload = {

        };

        if (mtime !== undefined) {
            payload.mtime = mtime;
        }

        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getgroupunreadconversationlist',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    getUnreadConversationList(clear, mtime, mtypes, timeout, callback) {
        let payload = {

        };

        if (clear !== undefined) {
            payload.clear = clear;
        }

        if (mtime !== undefined) {
            payload.mtime = mtime;
        }

        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getunreadconversationlist',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    removeSession(to, timeout, callback) {
        let payload = {
          to: to,
        };

        let options = {
            flag: 1,
            method: 'removesession',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }
    
}

module.exports = RTMClient;
