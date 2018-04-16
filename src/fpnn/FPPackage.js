'use strict'

const Buffer = require('buffer/').Buffer;
const FPConfig = require('./FPConfig');

class FPPackage{
    constructor(){}

    buildPkgData(options){
        let data = {};

        data.magic = options.magic || FPConfig.TCP_MAGIC;
        data.version = options.version || 0;
        data.flag = options.flag || 0;
        data.mtype = options.mtype || 0;
        data.ss = options.ss || 0;
        data.method = options.method || null;
        data.seq = options.seq || 0;
        data.payload = options.payload || null;

        if (data.payload){
            data.psize = Buffer.byteLength(data.payload);
        }

        if (data.method){
            data.ss = Buffer.byteLength(data.method);
        }

        data.wpos = 0;

        return data;
    }

    cbKey(data){
        return data.magic + '_' + data.seq;
    }

    isHTTP(data){
        return FPConfig.HTTP_MAGIC.equals(data.magic);
    }

    isTCP(data){
        return FPConfig.TCP_MAGIC.equals(data.magic);
    }

    isMsgPack(data){
        return 1 == data.flag;
    }

    isJson(data){
        return 0 == data.flag;    
    }

    isOneWay(data){
        return 0 == data.mtype;
    }

    isTwoWay(data){
        return 1 == data.mtype;
    }

    isQuest(data){
        return this.isTwoWay(data) || this.isOneWay(data);
    }

    isAnswer(data){
        return 2 == data.mtype;
    }

    isSupportPack(data){
        return this.isMsgPack(data) != this.isJson(data);
    }

    enCode(data){
        let buf = null;

        if (this.isOneWay(data)){
            buf = this.enCodeOneway(data);
        }
        if (this.isTwoWay(data)){
            buf = this.enCodeTwoway(data);
        }
        if (this.isAnswer(data)){
            buf = this.enCodeAnswer(data);
        }

        return buf;
    }

    enCodeOneway(data){
        let buf = buildHeader.call(this, data, 12 + data.ss + data.psize);

        data.wpos = buf.writeUInt8(data.ss, data.wpos);
        data.wpos = buf.writeUInt32LE(data.psize, data.wpos);

        let mbuf = Buffer.from(data.method)
        data.wpos += mbuf.copy(buf, data.wpos, 0);

        if (this.isJson(data)){
            let pbuf = Buffer.from(data.payload)
            data.wpos += pbuf.copy(buf, data.wpos, 0);
        }

        if (this.isMsgPack(data)){
            this.wpos += this.payload.copy(buf, this.wpos, 0);
        }

        return buf;
    }

    enCodeTwoway(data){
        let buf = buildHeader.call(this, data, 16 + data.ss + data.psize);

        data.wpos = buf.writeUInt8(data.ss, data.wpos);
        data.wpos = buf.writeUInt32LE(data.psize, data.wpos);
        data.wpos = buf.writeUInt32LE(data.seq, data.wpos);

        let mbuf = Buffer.from(data.method)
        data.wpos += mbuf.copy(buf, data.wpos, 0);

        if (this.isJson(data)){
            let pbuf = Buffer.from(data.payload)
            data.wpos += pbuf.copy(buf, data.wpos, 0);
        }

        if (this.isMsgPack(data)){
            data.wpos += data.payload.copy(buf, data.wpos, 0);
        }

        return buf; 
    }

    enCodeAnswer(data){
        let buf = buildHeader.call(this, data, 16 + data.psize);

        data.wpos = buf.writeUInt8(data.ss, data.wpos);
        data.wpos = buf.writeUInt32LE(data.psize, data.wpos);
        data.wpos = buf.writeUInt32LE(data.seq, data.wpos);

        if (this.isJson(data)){
            let pbuf = Buffer.from(data.payload)
            data.wpos += pbuf.copy(buf, data.wpos, 0);
        }

        if (this.isMsgPack(data)){
            data.wpos += data.payload.copy(buf, data.wpos, 0);
        }

        return buf;
    }

    peekHead(buf){
        let peek = {};
        let pos = 0;
        let mbuf = Buffer.allocUnsafe(4);

        pos += buf.copy(mbuf, 0, pos, pos + 4);
        peek.magic = mbuf;

        mbuf = Buffer.allocUnsafe(1);
        pos += buf.copy(mbuf, 0, pos, pos + 1);
        peek.version = FPConfig.FPNN_VERSION.indexOf(mbuf);

        pos += buf.copy(mbuf, 0, pos, pos + 1);
        peek.flag = FPConfig.FP_FLAG.indexOf(mbuf);

        pos += buf.copy(mbuf, 0, pos, pos + 1);
        peek.mtype = FPConfig.FP_MESSAGE_TYPE.indexOf(mbuf);

        pos += buf.copy(mbuf, 0, pos, pos + 1);
        peek.ss = mbuf.readUInt8(0);

        peek.psize = buf.readUInt32LE(pos);
        peek.wpos = pos + 4;
        
        return peek;
    }

    deCode(buf){
        let data = this.peekHead(buf);

        if (this.isOneWay(data)){
            this.deCodeOneWay(buf, data);
        }
        if (this.isTwoWay(data)){
            this.deCodeTwoWay(buf, data);
        }
        if (this.isAnswer(data)){
            this.deCodeAnswer(buf, data);
        }

        return data;
    }

    deCodeOneWay(buf, data){
        if (buf.length != 12 + data.ss + data.psize){
            data = null;
            return;
        }

        let mbuf = Buffer.allocUnsafe(data.ss);
        data.wpos += buf.copy(mbuf, 0, data.wpos, data.wpos + data.ss);

        data.method = mbuf.toString();

        let pbuf = Buffer.allocUnsafe(data.psize);
        data.wpos += buf.copy(pbuf, 0, data.wpos);

        if (this.isJson(data)){
            data.payload = pbuf.toString();
        }

        if (this.isMsgPack(data)){
            data.payload = pbuf;
        }
    }

    deCodeTwoWay(buf, data){
        if (buf.length != 16 + data.ss + data.psize){
            data = null;
            return;
        }

        data.seq = buf.readUInt32LE(data.wpos);
        data.wpos += 4;

        let mbuf = Buffer.allocUnsafe(data.ss);
        data.wpos += buf.copy(mbuf, 0, data.wpos, data.wpos + data.ss);

        data.method = mbuf.toString();

        let pbuf = Buffer.allocUnsafe(data.psize);
        data.wpos += buf.copy(pbuf, 0, data.wpos);

        if (this.isJson(data)){
            data.payload = pbuf.toString();
        }

        if (this.isMsgPack(data)){
            data.payload = pbuf;
        }
    }

    deCodeAnswer(buf, data){
        if (buf.length != 16 + data.psize){
            data = null;
            return;
        }

        data.seq = buf.readUInt32LE(data.wpos);
        data.wpos += 4;

        let pbuf = Buffer.allocUnsafe(data.psize);
        data.wpos += buf.copy(pbuf, 0, data.wpos);

        if (this.isJson(data)){
            data.payload = pbuf.toString();
        }

        if (this.isMsgPack(data)){
            data.payload = pbuf;
        }
    }
}

function isString(src){
    return '[object String]' == Object.prototype.toString.call(src);
}

function buildHeader(data, size){
    let buf = Buffer.allocUnsafe(size);

    if (this.isHTTP(data)){
        data.wpos += FPConfig.HTTP_MAGIC.copy(buf, data.wpos, 0);
    }

    if (this.isTCP(data)){
        data.wpos += FPConfig.TCP_MAGIC.copy(buf, data.wpos, 0);
    }

    data.wpos += FPConfig.FPNN_VERSION.copy(buf, data.wpos, data.version, data.version + 1);

    if (this.isJson(data)){
        data.wpos += FPConfig.FP_FLAG.copy(buf, data.wpos, data.flag, data.flag + 1);
    }

    if (this.isMsgPack(data)){
        data.wpos += FPConfig.FP_FLAG.copy(buf, data.wpos, data.flag, data.flag + 1);
    }

    data.wpos += FPConfig.FP_MESSAGE_TYPE.copy(buf, data.wpos, data.mtype, data.mtype + 1);

    return buf;
}

module.exports = FPPackage;