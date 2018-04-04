'use strict'

const FPConfig = require('./FPConfig');
const FPEvent = require('./FPEvent');

class FPSocket{
    constructor(options){
        FPEvent.assign(this);

        this._endpoint = options.endpoint || null;
        this._connectionTimeout = options.connectionTimeout || 30 * 1000;

        this._client = null;
        this._timeoutID = 0;
    }

    get endpoint(){ 
        return this._endpoint; 
    }

    write(buf){
        if (buf){
            let arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            this._client.send(arrayBuffer);
        }
    }

    close(err){
        if (err){
            this.emit('error', err);
        }
        
        if (this._client){
            this._client.close();
        }
    }

    open(){
        if (this.isConnecting || this.isOpen || !this._endpoint){
            this.emit('error', new Error('has connected or worng endpoint!'));
            return;
        }

        let self = this;

        try {
            this._client = new WebSocket(this._endpoint);
        } catch (err) {
            onError.call(self, err);
            onClose.call(self);
            return;
        }

        this._client.binaryType = 'arraybuffer';

        this._timeoutID = setTimeout(function(){
            if (self.isConnecting){
                self.close(new Error('connect timeout!'));
            }
        }, this._connectionTimeout);

        this._client.onopen = function(evt){ 
            onConnect.call(self);
        };
          
        this._client.onmessage = function(evt){
            onData.call(self, evt.data);
        };
          
        this._client.onclose = function(evt){
            onClose.call(self);
        };      

        this._client.onerror = function(evt){
            onError.call(self, evt);
        };
    }

    get isOpen(){
        if (!this._client){
            return false;
        }

        return this._client.readyState == WebSocket.OPEN;
    }

    get isConnecting(){
        if (!this._client){
            return false;
        }

        return this._client.readyState == WebSocket.CONNECTING;
    }
}

function onData(chunk){
    this.emit('data', chunk);
}

function onConnect(){
    if (this._timeoutID){
        clearTimeout(this._timeoutID);
        this._timeoutID = 0;
    }

    this.emit('connect');
}

function onClose(){
    if (this._timeoutID){
        clearTimeout(this._timeoutID);
        this._timeoutID = 0;
    }

    this.emit('close');
}

function onError(err){
    this.emit('error', err);
}

module.exports = FPSocket;