'use strict'

const FPConfig = require('./FPConfig');
const FPEvent = require('./FPEvent');
const PlatFormImpl = require('./platform/BrowserImpl');

class FPSocket {

    constructor(options) {

        FPEvent.assign(this);

        this._endpoint = options.endpoint || null;
        this._timeout = options.connectionTimeout || 10 * 1000;
        this._platform = options.platformImpl || new PlatFormImpl();

        this._connectTimeout = 0;
        this._queue = [];

        let self = this;
        FPEvent.assign(this._platform);

        this._platform.on('open', function() {

            onConnect.call(self);
        });

        this._platform.on('message', function(data) {

            onData.call(self, data);
        });

        this._platform.on('close', function() {

            onClose.call(self);
        });

        this._platform.on('error', function(err) {

            onError.call(self, err);
        });
    }

    get endpoint() { 

        return this._endpoint; 
    }

    write(data) {

        if (data) {

            if (Object.prototype.toString.call(data) === '[object String]') {

                this._queue.push(data);
            } else {

                let arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
                this._queue.push(arrayBuffer);
            }
        }

        writeSocket.call(this);
    }

    close(err) {

        if (err) {

            this.emit('error', err);
        }

        this._platform.close();
    }

    open() {

        if (this.isConnecting || this.isOpen || !this._endpoint) {

            this.emit('error', new Error('has connected or worng endpoint!'));
            return;
        }

        let self = this;

        if (this._connectTimeout) {

            clearTimeout(this._connectTimeout);
            this._connectTimeout = 0;
        }

        this._connectTimeout = setTimeout(function() {

            let err = new Error('connect timeout!');

            if (self.isOpen) {

                self.close(err);
                return;
            }

            if (self.isConnecting) {

                self.close(err);
                onClose.call(self);
                return;
            } 

            onError.call(self, err);
            onClose.call(self);
        }, this._timeout);

        this._platform.open(this._endpoint);
    }

    get isOpen() {

        return this._platform.isOpen;
    }

    get isConnecting() {

        return this._platform.isConnecting;
    }

    destroy() {

        this.removeEvent();
        this.close();

        this._platform.removeEvent();

        onClose.call(this);
    }
}

function writeSocket() {

    if (!this.isOpen) {

        return;
    }

    while (this._queue.length) {

        this._platform.send(this._queue.shift());
    }
}

function onData(chunk) {

    this.emit('data', chunk);
}

function onConnect() {
    
    if (this._connectTimeout) {

        clearTimeout(this._connectTimeout);
        this._connectTimeout = 0;
    }

    writeSocket.call(this);
    this.emit('connect');
}

function onClose() {

    if (this._connectTimeout) {

        clearTimeout(this._connectTimeout);
        this._connectTimeout = 0;
    }

    this._queue = [];
    this.emit('close');
}

function onError(err) {

    this.emit('error', err);
}

module.exports = FPSocket;