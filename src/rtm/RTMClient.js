'use strict'

const RTMConfig = require('./RTMConfig');
const RTMProcessor = require('./RTMProcessor');
const RTMProxy = require('./RTMProxy');

class RTMClient {

    /**
     * 
     * @param {object} options 
     * 
     * options:
     * {string} options.dispatch
     * {number} options.pid 
     * {Int64} options.uid
     * {string} options.token
     * {bool} options.autoReconnect 
     * {number} options.connectionTimeout 
     * {string} options.version
     * {object<string, string>} options.attrs
     * {bool} options.ssl
     * {string} options.proxyEndpoint
     */
    constructor(options) {

        fpnn.FPEvent.assign(this);

        this._dispatch = options.dispatch;
        this._pid = options.pid;
        this._uid = options.uid;
        this._token = options.token;
        this._version = options.version || '';
        this._attrs = options.attrs;
        this._ssl = options.ssl !== undefined ? options.ssl : true;
        this._autoReconnect = options.autoReconnect !== undefined ? options.autoReconnect : true;
        this._connectionTimeout = options.connectionTimeout || 30 * 1000;

        if (this._ssl) {

            this._proxyEndpoint = options.proxyEndpoint; 
        }

        this._midSeq = 0;
        this._saltSeq = 0;
        this._endpoint = null;
        this._ipv6 = false;

        this._baseClient = null;
        this._dispatchClient = null;
        this._loginOptions = null; 
        this._reconnectTimeout = 0;

        this._isClose = false;

        this._msgOptions = {

            codec: RTMConfig.MsgPack.createCodec({  

                int64: true
            }) 
        };

        this._processor = new RTMProcessor();

        if (this._proxyEndpoint) {

            let endpoint = buildEndpoint.call(this, this._proxyEndpoint);
            this._proxy = new RTMProxy(endpoint);
            this._fileProxy = new RTMProxy(endpoint);
        }
    }

    get processor() {

        return this._processor;
    }

    /**
     * 
     * @param {string} endpoint
     * @param {bool} ipv6 
     */
    login(endpoint, ipv6) {

        this._endpoint = endpoint || null;
        this._ipv6 = ipv6 || false;
        this._isClose = false;

        if (this._endpoint) {

            connectRTMGate.call(this);
            return;
        }

        let self = this;

        getRTMGate.call(this, 'rtmGated', function(err, data) {

            if (data) {
                
                self.login(data.endpoint, self._ipv6);
            }

            if (err) {

                onClose.call(self, true);
                self.emit('error', err);
            }
        }, this._connectionTimeout);
    }

    destroy() {

        this.close();

        this._midSeq = 0;
        this._saltSeq = 0;

        if (this._proxy) {

            this._proxy = null;
        }

        if (this._processor) {

            this._processor.destroy();
            this._processor = null;
        }

        if (this._baseClient) {

            this._baseClient.destroy();
            this._baseClient = null;
        }

        if (this._dispatchClient) {

            this._dispatchClient.destroy();
            this._dispatchClient = null;
        }

        this.removeEvent();
        onClose.call(this);
    }

    /**
     *  
     * rtmGate (2)
     * 
     * @param {Int64} to 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {Int64} mid    
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64, error:Error>} err
     * @param {object<mid:Int64, payload:object<mtime:Int64>>} data
     */
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

    /**
     *  
     * rtmGate (3)
     * 
     * @param {Int64} gid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {Int64} mid    
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64, error:Error>} err
     * @param {object<mid:Int64, payload:object<mtime:Int64>>} data
     */
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

    /**
     *  
     * rtmGate (4)
     * 
     * @param {Int64} rid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {Int64} mid    
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64, error:Error>} err
     * @param {object<mid:Int64, payload:object<mtime:Int64>>} data
     */
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

    /**
     *  
     * rtmGate (5)
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<p2p:object<string, number>, group:object<string, number>>} data
     */
    getUnreadMessage(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getunreadmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * rtmGate (6)
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    cleanUnreadMessage(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'cleanunreadmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * rtmGate (7)
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<p2p:object<string, Int64>, group:object<string, Int64>>} data
     */
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

            for (let key in p2p) {

                p2p[key] = new RTMConfig.Int64(p2p[key]);
            }

            let group = data['group'];

            for (let key in group) {

                group[key] = new RTMConfig.Int64(group[key]);
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * rtmGate (8)
     * 
     * @param {Int64} gid 
     * @param {bool} desc 
     * @param {number} num
     * @param {Int64} begin
     * @param {Int64} end
     * @param {Int64} lastid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, lastid:Int64, begin:Int64, end:Int64, msgs:array<GroupMsg>>} data 
     * 
     * <GroupMsg>
     * @param {Int64} GroupMsg.id
     * @param {Int64} GroupMsg.from
     * @param {number} GroupMsg.mtype
     * @param {Int64} GroupMsg.mid
     * @param {bool} GroupMsg.deleted
     * @param {string} GroupMsg.msg
     * @param {string} GroupMsg.attrs
     * @param {Int64} GroupMsg.mtime
     */
    getGroupMessage(gid, desc, num, begin, end, lastid, timeout, callback) {
        
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

                    msgs[index] = {
                        id: new RTMConfig.Int64(item[0]),
                        from: new RTMConfig.Int64(item[1]),
                        mtype: Number(item[2]),
                        mid: new RTMConfig.Int64(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new RTMConfig.Int64(item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * rtmGate (9)
     * 
     * @param {Int64} rid 
     * @param {bool} desc 
     * @param {number} num
     * @param {Int64} begin
     * @param {Int64} end
     * @param {Int64} lastid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, lastid:Int64, begin:Int64, end:Int64, msgs:array<RoomMsg>>} data 
     * 
     * <RoomMsg>
     * @param {Int64} RoomMsg.id
     * @param {Int64} RoomMsg.from
     * @param {number} RoomMsg.mtype
     * @param {Int64} RoomMsg.mid
     * @param {bool} RoomMsg.deleted
     * @param {string} RoomMsg.msg
     * @param {string} RoomMsg.attrs
     * @param {Int64} RoomMsg.mtime
     */
    getRoomMessage(rid, desc, num, begin, end, lastid, timeout, callback) {

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

                    msgs[index] = {
                        id: new RTMConfig.Int64(item[0]),
                        from: new RTMConfig.Int64(item[1]),
                        mtype: Number(item[2]),
                        mid: new RTMConfig.Int64(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new RTMConfig.Int64(item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * rtmGate (10)
     * 
     * @param {bool} desc 
     * @param {number} num
     * @param {Int64} begin
     * @param {Int64} end
     * @param {Int64} lastid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, lastid:Int64, begin:Int64, end:Int64, msgs:array<BroadcastMsg>>} data 
     * 
     * <BroadcastMsg>
     * @param {Int64} BroadcastMsg.id
     * @param {Int64} BroadcastMsg.from
     * @param {number} BroadcastMsg.mtype
     * @param {Int64} BroadcastMsg.mid
     * @param {bool} BroadcastMsg.deleted
     * @param {string} BroadcastMsg.msg
     * @param {string} BroadcastMsg.attrs
     * @param {Int64} BroadcastMsg.mtime
     */
    getBroadcastMessage(desc, num, begin, end, lastid, timeout, callback) {

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

                    msgs[index] = {
                        id: new RTMConfig.Int64(item[0]),
                        from: new RTMConfig.Int64(item[1]),
                        mtype: Number(item[2]),
                        mid: new RTMConfig.Int64(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new RTMConfig.Int64(item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * rtmGate (11)
     * 
     * @param {Int64} ouid 
     * @param {bool} desc
     * @param {number} num 
     * @param {Int64} begin 
     * @param {Int64} end
     * @param {Int64} lastid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, lastid:Int64, begin:Int64, end:Int64, msgs:array<P2PMsg>>} data 
     * 
     * <P2PMsg>
     * @param {Int64} P2PMsg.id
     * @param {number} P2PMsg.direction
     * @param {number} P2PMsg.mtype
     * @param {Int64} P2PMsg.mid
     * @param {bool} P2PMsg.deleted
     * @param {string} P2PMsg.msg
     * @param {string} P2PMsg.attrs
     * @param {Int64} P2PMsg.mtime
     */
    getP2PMessage(ouid, desc, num, begin, end, lastid, timeout, callback) {

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

                    msgs[index] = {
                        id: new RTMConfig.Int64(item[0]),
                        direction: Number(item[1]),
                        mtype: Number(item[2]),
                        mid: new RTMConfig.Int64(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new RTMConfig.Int64(item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * rtmGate (12)
     * 
     * @param {string} cmd 
     * @param {array<Int64>} tos
     * @param {Int64} to 
     * @param {Int64} rid 
     * @param {Int64} gid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<token:string, endpoint:string>} data 
     */
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

    /**
     *  
     * rtmGate (13)
     * 
     */
    close() {

        let payload = {};

        let options = {
            flag: 1,
            method: 'bye',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        let self = this;
        this._isClose = true;

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (self._baseClient) {

                self._baseClient.close();
            }
        });
    }

    /**
     *  
     * rtmGate (14)
     * 
     * @param {object<string, string>} attrs
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
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

    /**
     *  
     * rtmGate (15)
     * 
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {Error} err
     * @param {object<attrs:array<Map>>} data
     *  
     * <Map>
     * @param {string} Map.ce
     * @param {string} Map.login
     * @param {string} Map.my
     */
    getAttrs(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getattrs',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * rtmGate (16)
     * 
     * @param {string} msg
     * @param {string} attrs
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
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

    /**
     *  
     * rtmGate (17)
     * 
     * @param {string} apptype 
     * @param {string} devicetoken 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
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

    /**
     *  
     * rtmGate (18)
     * 
     * @param {string} devicetoken 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
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

    /**
     *  
     * rtmGate (19)
     * 
     * @param {string} targetLanguage 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
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

    /**
     *  
     * rtmGate (20)
     * 
     * @param {string} originalMessage 
     * @param {string} originalLanguage 
     * @param {string} targetLanguage 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<stext:string, src:string, dtext:string, dst:string>} data 
     */
    translate(originalMessage, originalLanguage, targetLanguage, timeout, callback) {

        let payload = {
            text: originalMessage,
            dst: targetLanguage
        };

        if (originalLanguage !== undefined) {

            payload.src = originalLanguage;
        }

        let options = {
            flag: 1,
            method: 'translate',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * rtmGate (21)
     * 
     * @param {array<Int64>} friends 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
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

    /**
     *  
     * rtmGate (22)
     * 
     * @param {array<Int64>} friends 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
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

    /**
     *  
     * rtmGate (23)
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
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

    /**
     *  
     * rtmGate (24)
     * 
     * @param {Int64} gid 
     * @param {array<Int64>} uids 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
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

    /**
     *  
     * rtmGate (25)
     * 
     * @param {Int64} gid 
     * @param {array<Int64>} uids 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
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

    /**
     *  
     * rtmGate (26)
     * 
     * @param {Int64} gid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
    getGroupMembers(gid, timeout, callback) {

        let payload = {
            gid: gid
        };

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

                callback && callback(null, buids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * rtmGate (27)
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
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

    /**
     *  
     * rtmGate (28)
     * 
     * @param {Int64} rid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
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

    /**
     *  
     * rtmGate (29)
     * 
     * @param {Int64} rid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
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

    /**
     *  
     * rtmGate (30)
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
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

    /**
     *  
     * rtmGate (31)
     * 
     * @param {array<Int64>} uids 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
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

    /**
     *  
     * rtmGate (32)
     * 
     * @param {Int64} mid
     * @param {Int64} xid
     * @param {number} type
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    deleteMessage(mid, xid, type, timeout, callback) {

        let payload = {
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

    /**
     *  
     * rtmGate (33)
     * 
     * @param {string} ce
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    kickout(ce, timeout, callback) {

        let payload = {
            ce: ce
        };

        let options = {
            flag: 1,
            method: 'kickout',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * rtmGate (34)
     * 
     * @param {string} key
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {Error} err
     * @param {object<val:string>} data
     */
    dbGet(key, timeout, callback) {

        let payload = {
            key: key && key.toString()
        };

        let options = {
            flag: 1,
            method: 'dbget',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * rtmGate (35)
     * 
     * @param {string} key
     * @param {string} value 
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    dbSet(key, value, timeout, callback) {

        let payload = {
            key: key && key.toString(),
            val: (value && value.toString()) || ''
        };

        let options = {
            flag: 1,
            method: 'dbset',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * fileGate (1)
     * 
     * @param {number} mtype 
     * @param {Int64} to 
     * @param {File} file
     * @param {Int64} mid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64, error:Error>} err
     * @param {object<mid:Int64, payload:object<mtime:Int64>>} data
     */
    sendFile(mtype, to, file, mid, timeout, callback) {

        let ops = {
            to: to,
            mtype: mtype,
            cmd: 'sendfile'
        };

        fileSendProcess.call(this, ops, file, mid, callback, timeout);
    }

    /**
     *  
     * fileGate (3)
     * 
     * @param {number} mtype 
     * @param {Int64} gid 
     * @param {File} file
     * @param {Int64} mid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64, error:Error>} err
     * @param {object<mid:Int64, payload:object<mtime:Int64>>} data
     */
    sendGroupFile(mtype, gid, file, mid, timeout, callback) {

        let ops = {
            gid: gid,
            mtype: mtype,
            cmd: 'sendgroupfile'
        };

        fileSendProcess.call(this, ops, file, mid, callback, timeout);
    }

    /**
     *  
     * fileGate (4)
     * 
     * @param {number} mtype 
     * @param {Int64} rid 
     * @param {File} file
     * @param {Int64} mid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64, error:Error>} err
     * @param {object<mid:Int64, payload:object<mtime:Int64>>} data
     */
    sendRoomFile(mtype, rid, file, mid, timeout, callback) {

        let ops = {
            rid: rid,
            mtype: mtype,
            cmd: 'sendroomfile'
        };

        fileSendProcess.call(this, ops, file, mid, callback, timeout);
    }

    // Code for AsyncStressTester
    /* 
    sendQuest(options, callback, timeout) {

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    connect(endpoint, timeout) {

        if (this._baseClient != null && this._baseClient.isOpen) {

            this._baseClient.destroy();
            return;
        }

        this._endpoint = endpoint;
    
        this._baseClient = new fpnn.FPClient({ 
            endpoint: buildEndpoint.call(this, this._endpoint), 
            autoReconnect: false,
            connectionTimeout: this._connectionTimeout,
            proxy: this._proxy
        });
    
        let self = this;
    
        this._baseClient.on('connect', function() {
    
            self.emit('connect');
        });
    
        this._baseClient.on('close', function() {
    
            onClose.call(self);
        });
    
        this._baseClient.on('error', function(err) {
            
            self.emit('error', err);
        });
    
        this._baseClient.processor = this._processor;
        this._baseClient.connect();
    }
    */
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
        let index = file.name.lastIndexOf('.');

        if (index != -1) {

            ext = file.name.slice(index + 1);
        }

        if (!token || !endpoint) {

            callback && callback({ mid: mid, error: new Error(JSON.stringify(data)) }, null);
            return;
        }

        let reader = new FileReader();

        reader.onload = function(e) {

            let content = Buffer.from(e.target.result);

            if (!content) {

                callback && callback({ mid: mid, error: new Error('no file content!') }, null);
                return;
            }

            let sign = md5(md5(content) + ':' + token);

            let fileClient = new fpnn.FPClient({ 

                endpoint: buildEndpoint.call(self, endpoint),
                autoReconnect: false,
                connectionTimeout: timeout,
                proxy: self._fileProxy 
            });

            fileClient.on('close', function(){

                self.destroy();
            });

            fileClient.on('error', function(err) {

                self.emit('error', new Error('file client: ' + err.message));
            });

            fileClient.connect();

            let options = {
                token: token,
                sign: sign,
                ext: ext,
                file: content
            };

            for (let key in ops) {

                options[key] = ops[key];
            }

            sendfile.call(self, fileClient, options, mid, callback, timeout);
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

function sendfile(fileClient, ops, mid, callback, timeout) {

    let payload = {
        pid: this._pid,
        from: this._uid,
        mid: mid
    };

    for (let key in ops) {

        if (key == 'sign') {

            payload.attrs = JSON.stringify({ sign: ops.sign, ext: ops.ext });
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

            data.mtime = new RTMConfig.Int64(data.mtime);
        }

        callback && callback(null, { mid: payload.mid, payload: data });
    }, timeout);
}

function genMid() {

    if (++this._midSeq >= 999) {

        this._midSeq = 0;
    }

    return new RTMConfig.Int64(Date.now().toString() + this._midSeq);
}

function isException(isAnswerErr, data) {

    if (!data) {

        return new Error('data is null!');
    }

    if (data instanceof Error) {

        return data;
    }

    if (isAnswerErr) {

        if (data.hasOwnProperty('code') && data.hasOwnProperty('ex')) {

            return new Error('code: ' + data.code + ', ex: ' + data.ex);
        }
    }

    return null;
}

function sendQuest(client, options, callback, timeout) {

    let self = this;

    if (!client) {

        callback && callback(new Error('client has been destroyed!'), null);
        return;
    }

    client.sendQuest(options, function(data) {
        
        if (!callback) {

            return;
        }

        let err = null;
        let isAnswerErr = false;

        if (data.payload) {

            let payload = RTMConfig.MsgPack.decode(data.payload, self._msgOptions);

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

            callback && callback(data, null);
            return;
        }

        callback && callback(null, data);
    }, timeout);
}

function getRTMGate(service, callback, timeout) {
    
	let self = this;

    if (this._dispatchClient == null) {

        this._dispatchClient = new fpnn.FPClient({
            endpoint: buildEndpoint.call(this, this._dispatch),
            autoReconnect: false,
            connectionTimeout: this._connectionTimeout,
            proxy: this._proxy
        });

        this._dispatchClient.on('close', function() {

            if (self._dispatchClient) {

                self._dispatchClient.destroy();
                self._dispatchClient = null;
            }

            if (!self._endpoint) {

                callback && callback(new Error('dispatch client close with err'), null);
            }
        });
    }

    if (!this._dispatchClient.hasConnect) {

        this._dispatchClient.connect();
    }

    which.call(this, service, callback, timeout);
}

function which(service, callback, timeout) {

    let payload = {
        pid: this._pid,
        uid: this._uid,
        what: service,
        addrType: this._ipv6 ? 'ipv6' : 'ipv4',
        version: this._version
    };

    let options = {
        flag: 1,
        method: 'which',
        payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
    };

    let self = this;

    sendQuest.call(this, this._dispatchClient, options, function (err, data){

        if (self._dispatchClient) {

            self._dispatchClient.destroy();
            self._dispatchClient = null;
        }
        
        if (data) {
            
            callback && callback(null, data);
        }

        if (err) {

            callback && callback(err, null);
        }
    }, timeout);
}

function buildEndpoint(endpoint) {
    
    if (this._proxy) {

        return endpoint;
    }

    let protol = 'ws://';

    if (this._ssl) {

        protol = 'wss://';
    }

    return protol + endpoint + '/service/websocket';
}

function connectRTMGate(timeout) {

    if (this._baseClient != null) {

        this._baseClient.destroy();
    }

    this._baseClient = new fpnn.FPClient({ 
        endpoint: buildEndpoint.call(this, this._endpoint), 
        autoReconnect: false,
        connectionTimeout: this._connectionTimeout,
        proxy: this._proxy
    });

    let self = this;

    this._baseClient.on('close', function() {

        onClose.call(self, true);
    });

    this._baseClient.on('error', function(err) {
        
        self.emit('error', err);
    });

    this._processor.on(RTMConfig.SERVER_PUSH.kickOut, function(data) {
        
        self._isClose = true;
        self._baseClient.close();
    });

    this._baseClient.processor = this._processor;
    this._baseClient.connect();

    auth.call(this, timeout);
}

/**
 *  
 * rtmGate (1)
 *  
 */
function auth(timeout) {

    let payload = {
        pid: this._pid,
		uid: this._uid,
		token: this._token
    };

    if (this._version) {

        payload.version = this._version;
    }

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

            self.emit('login', { endpoint: self._endpoint });
            return;
        }

        if (data && !data.ok) {

            if (data.gate) {
                
                self._endpoint = data.gate;
                onClose.call(self, true);
                return;
            }

            self.emit('error', new Error('token error!'));
            self.emit('login', { error: data });
        }

        if (err) {

            self._baseClient.close(err);
        }
    }, timeout);
}

function onClose(reconnect) {

    if (this._reconnectTimeout) {

        clearTimeout(this._reconnectTimeout);
        this._reconnectTimeout = 0;
    }

    if (reconnect) {

        reConnect.call(this);
        return;
    }

    this.emit('close', !this._isClose && this._autoReconnect);
}

function reConnect() {

    if (!this._autoReconnect) {

        return;
    }

    if (this._reconnectTimeout) {

        return;
    }

    if (this._isClose) {

        return;
    }

    let self = this;

    this._reconnectTimeout = setTimeout(function() {

        self.login(self._endpoint, self._ipv6);
    }, 100);
}

module.exports = RTMClient;
