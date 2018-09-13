'use strict'

class WechatImpl {

	constructor() {

		this._socket = null;
	}

	open(endpoint) {

        let self = this;

        this._socket = wx.connectSocket({

        	url: endpoint,
			protocols: 'arraybuffer'
		})

        this._socket.onOpen(function(header) { 

            self.emit('open');
        });
          
        this._socket.onMessage(function(data) {

            self.emit('message', data.data);
        });
          
        this._socket.onClose(function() {

            self.emit('close');
        });      

        this._socket.onError(function(err) {

            self.emit('error', err);
        });
	}

	send(data) {

		if (this._socket) {

            this._socket.send({ data: data });
		}
	}

	close() {

		if (this._socket) {

			this._socket.close({});
		}
	}

	get isOpen() {

		if (this._socket) {

	        return this._socket.readyState == 1;
        }

        return false;
	}

	get isConnecting() {

		if (this._socket) {

	        return this._socket.readyState == 0;
        }

        return false;
	}
}

module.exports = WechatImpl;
