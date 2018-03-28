'use strict'

const FPEvent = require('../fpnn/FPEvent');
const RTMConfig = require('./RTMConfig');

class RTMProcessor{
    constructor(msgOptions){
        FPEvent.assign(this);

        this._map = {};
        this._msgOptions = msgOptions;
        checkExpire.call(this);
    }

    service(data, cb){
        let callCb = true;

        if (RTMConfig.SERVER_PUSH.kickOut == data.method){
            callCb = false;
        }
        if (RTMConfig.SERVER_PUSH.kickOutRoom == data.method){
            callCb = false;
        }

        if (callCb){
            if (data.flag == 0){
                cb(JSON.stringify({}), false);
            }
            if (data.flag == 1){
                cb(msgpack.encode({}, this._msgOptions), false);
            }
        }

        let payload = null;

        if (data.flag == 0){
            payload = JSON.parse(data.payload);
        }

        if (data.flag == 1){
            payload = msgpack.decode(data.payload, this._msgOptions);
        }

        if (payload){
            this[data.method].call(this, payload);
        }
    }

    /**
     * 
     * @param {object} data 
     */
    kickout(data){
        this.emit(RTMConfig.SERVER_PUSH.kickOut, data);
    }

    /**
     * 
     * @param {Int64BE} data.rid 
     */
    kickoutroom(data){
        if (data.rid){
            data.rid = new Int64BE(data.rid);
        }

        this.emit(RTMConfig.SERVER_PUSH.kickOutRoom, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {number} data.mtype
     * @param {number} data.ftype
     * @param {Int64BE} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     */
    pushmsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }

        if (data.ftype > 0){
            this.emit(RTMConfig.SERVER_PUSH.recvFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvMessage, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {Int64BE} data.gid
     * @param {number} data.mtype
     * @param {number} data.ftype
     * @param {Int64BE} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     */
    pushgroupmsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }


        if (data.gid){
            data.gid = new Int64BE(data.gid);
        }

        if (data.ftype > 0){
            this.emit(RTMConfig.SERVER_PUSH.recvGroupFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvGroupMessage, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {Int64BE} data.rid
     * @param {number} data.mtype
     * @param {number} data.ftype
     * @param {Int64BE} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     */
    pushroommsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }

        if (data.rid){
            data.rid = new Int64BE(data.rid);
        }

        if (data.ftype > 0){
            this.emit(RTMConfig.SERVER_PUSH.recvRoomFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvRoomMessage, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {number} data.mtype
     * @param {number} data.ftype
     * @param {Int64BE} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     */
    pushbroadcastmsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }

        if (data.ftype > 0){
            this.emit(RTMConfig.SERVER_PUSH.recvBroadcastFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvBroadcastMessage, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {Int64BE} data.mid
     * @param {Int64BE} data.omid
     * @param {string} data.msg
     */
    transmsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }

        if (data.omid){
            data.omid = new Int64BE(data.omid);
        }

        this.emit(RTMConfig.SERVER_PUSH.recvTranslatedMessage, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {Int64BE} data.gid
     * @param {Int64BE} data.mid
     * @param {Int64BE} data.omid
     * @param {string} data.msg
     */
    transgroupmsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }

        if (data.gid){
            data.gid = new Int64BE(data.gid);
        }

        if (data.omid){
            data.omid = new Int64BE(data.omid);
        }

        this.emit(RTMConfig.SERVER_PUSH.recvTranslatedGroupMessage, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {Int64BE} data.rid
     * @param {Int64BE} data.mid
     * @param {Int64BE} data.omid
     * @param {string} data.msg
     */
    transroommsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }

        if (data.rid){
            data.rid = new Int64BE(data.rid);
        }

        if (data.omid){
            data.omid = new Int64BE(data.omid);
        }

        this.emit(RTMConfig.SERVER_PUSH.recvTranslatedRoomMessage, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {Int64BE} data.mid
     * @param {Int64BE} data.omid
     * @param {string} data.msg
     */
    transbroadcastmsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }

        if (data.omid){
            data.omid = new Int64BE(data.omid);
        }

        this.emit(RTMConfig.SERVER_PUSH.recvTranslatedBroadcastMessage, data);
    }

    /**
     * 
     * @param {array<Int64BE>} data.p2p
     * @param {array<Int64BE>} data.group
     * @param {bool} data.bc
     */
    pushunread(data){
        if (data.p2p){
            let bp2p = [];
            data.p2p.forEach(function(item, index){
                bp2p[index] = new Int64BE(item);
            });

            data.p2p = bp2p;
        }

        if (data.group){
            let bgroup = [];
            data.group.forEach(function(item, index){
                bgroup[index] = new Int64BE(item);
            });

            data.group = bgroup;
        }

        this.emit(RTMConfig.SERVER_PUSH.recvUnreadMsgStatus, data);
    }

    /**
     * 
     * @param {object} data 
     */
    ping(data){
        this.emit(RTMConfig.SERVER_PUSH.ping, data);
    }
}

function checkMid(mid){
    let key = mid.toString();
    if (this._map.hasOwnProperty(key)){
        if (this._map[key] > Date.now()){
            return false; 
        }
        delete this._map[key];
    }

    this._map[key] = RTMConfig.MID_TTL + Date.now();
    return true;
}

function checkExpire(){
    let self = this;
    setInterval(function(){
        for (let key in self._map){
            if (self._map[key] > Date.now()){
                continue;
            } 
            delayRemove.call(self, key);
        }
    }, RTMConfig.MID_TTL);
}

function delayRemove(key){
    let self = this;
    setTimeout(function(){
        delete self._map[key];
    }, 0);
}

module.exports = RTMProcessor;