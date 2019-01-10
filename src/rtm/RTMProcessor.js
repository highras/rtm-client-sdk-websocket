'use strict'

const RTMConfig = require('./RTMConfig');

class RTMProcessor {

    constructor() {

        fpnn.FPEvent.assign(this);

        this._map = {};

        this._msgOptions = {

            codec: RTMConfig.MsgPack.createCodec({  

                int64: true
            }) 
        };


        checkExpire.call(this);
    }

    service(data, cb) {

        let callCb = true;

        if (RTMConfig.SERVER_PUSH.kickOut == data.method) {

            callCb = false;
        }

        if (RTMConfig.SERVER_PUSH.kickOutRoom == data.method) {

            callCb = false;
        }

        if (callCb) {

            if (data.flag == 0) {

                cb(JSON.stringify({}), false);
            }

            if (data.flag == 1) {

                cb(RTMConfig.MsgPack.encode({}, this._msgOptions), false);
            }
        }

        let payload = null;

        if (data.flag == 0) {

            payload = JSON.parse(data.payload);
        }

        if (data.flag == 1) {

            payload = RTMConfig.MsgPack.decode(data.payload, this._msgOptions);
        }

        if (payload) {

            this[data.method].call(this, payload);
        }
    }

    destroy() {

        this._map = {};
    }

    /**
     * 
     * @param {object} data 
     */
    kickout(data) {

        this.emit(RTMConfig.SERVER_PUSH.kickOut, data);
    }

    /**
     * 
     * @param {Int64} data.rid 
     */
    kickoutroom(data) {
        
        if (data.rid) {

            data.rid = new RTMConfig.Int64(data.rid);
        }

        this.emit(RTMConfig.SERVER_PUSH.kickOutRoom, data);
    }

    /**
     * 
     * @param {Int64} data.from
     * @param {number} data.mtype
     * @param {Int64} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     * @param {Int64} data.mtime
     */
    pushmsg(data) {

        if (data.from) {
            
            data.from = new RTMConfig.Int64(data.from);
        }

        if (data.mid) {

            data.mid = new RTMConfig.Int64(data.mid);

            if (!checkMid.call(this, 1, data.mid, data.from)) {

                return;
            }
        }
        
        if (data.mtime) {
            
            data.mtime = new RTMConfig.Int64(data.mtime);
        }

        if (data.mtype >= 40 && data.mtype <= 50) {

            this.emit(RTMConfig.SERVER_PUSH.recvFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvMessage, data);
    }

    /**
     * 
     * @param {Int64} data.from
     * @param {Int64} data.gid
     * @param {number} data.mtype
     * @param {Int64} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     * @param {Int64} data.mtime
     */
    pushgroupmsg(data) {
        
        if (data.from) {

            data.from = new RTMConfig.Int64(data.from);
        }

        if (data.mid) {
            
            data.mid = new RTMConfig.Int64(data.mid);

            if (!checkMid.call(this, 2, data.mid, data.from, data.gid)) {

                return;
            }
        }

        if (data.gid) {

            data.gid = new RTMConfig.Int64(data.gid);
        }

        if (data.mtime) {
            
            data.mtime = new RTMConfig.Int64(data.mtime);
        }

        if (data.mtype >= 40 && data.mtype <= 50) {

            this.emit(RTMConfig.SERVER_PUSH.recvGroupFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvGroupMessage, data);
    }

    /**
     * 
     * @param {Int64} data.from
     * @param {Int64} data.rid
     * @param {number} data.mtype
     * @param {Int64} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     * @param {Int64} data.mtime
     */
    pushroommsg(data) {

        if (data.from) {

            data.from = new RTMConfig.Int64(data.from);
        }

        if (data.mid) {
            
            data.mid = new RTMConfig.Int64(data.mid);

            if (!checkMid.call(this, 3, data.mid, data.from, data.rid)) {

                return;
            }
        }

        if (data.rid) {

            data.rid = new RTMConfig.Int64(data.rid);
        }

        if (data.mtime) {
            
            data.mtime = new RTMConfig.Int64(data.mtime);
        }

        if (data.mtype >= 40 && data.mtype <= 50) {

            this.emit(RTMConfig.SERVER_PUSH.recvRoomFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvRoomMessage, data);
    }

    /**
     * 
     * @param {Int64} data.from
     * @param {number} data.mtype
     * @param {Int64} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     * @param {Int64} data.mtime
     */
    pushbroadcastmsg(data) {

        if (data.from) {

            data.from = new RTMConfig.Int64(data.from);
        }

        if (data.mid) {

            data.mid = new RTMConfig.Int64(data.mid);

            if (!checkMid.call(this, 4, data.mid, data.from)) {

                return;
            }
        }

        if (data.mtime) {
            
            data.mtime = new RTMConfig.Int64(data.mtime);
        }

        if (data.mtype >= 40 && data.mtype <= 50) {
            
            this.emit(RTMConfig.SERVER_PUSH.recvBroadcastFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvBroadcastMessage, data);
    }

    /**
     * 
     * @param {object} data 
     */
    ping(data) {

        this.emit(RTMConfig.SERVER_PUSH.recvPing, data);
    }
}

function checkMid(type, mid, uid, rgid) {

    let arr = [];

    arr.push(type);
    arr.push(mid);
    arr.push(uid);

    if (rgid != undefined) {

        arr.push(rgid);
    } 

    let key = arr.join('_');

    if (this._map.hasOwnProperty(key)) {

        if (this._map[key] > Date.now()) {

            return false;
        }

        delete this._map[key];
    }

    this._map[key] = RTMConfig.MID_TTL + Date.now();
    return true;
}

function checkExpire() {

    let self = this;

    setInterval(function() {

        for (let key in self._map) {

            if (self._map[key] > Date.now()) {

                continue;
            } 

            delayRemove.call(self, key);
        }
    }, RTMConfig.MID_TTL + 1000);
}

function delayRemove(key) {

    let self = this;

    setTimeout(function() {

        delete self._map[key];
    }, 0);
}

module.exports = RTMProcessor;