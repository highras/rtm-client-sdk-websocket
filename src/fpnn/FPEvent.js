'use strict'

class FPEvent {

    static assign(target) {

        if (!target || target.hasOwnProperty('events')) {

            throw new Error(target + ' is null or hasOwnProperty [ events ]');
        }

        if (target.hasOwnProperty('on') || target.hasOwnProperty('emit') || target.hasOwnProperty('removeEvent')) {

            throw new Error(target + ' hasOwnProperty [ on | emit | removeEvent | listenerCount]');
        }

        target.events = {};

        target.on = function(t, cb) {

            if (!target.events.hasOwnProperty(t)) {
                
                target.events[t] = [];
            }
    
            if (target.events[t].indexOf(cb) == -1) {

                target.events[t].push(cb);
            }
        };

        target.emit = function() {

            if (arguments.length == 0) {

                return;
            }

            let list = target.events[arguments[0]] || [];

            for (let i = 0; i < list.length; i++) {

                let cb = list[i];
                
                if (cb) {

                    let args = [];

                    for (let j = 1; j < arguments.length; j++) {

                        args[j - 1] = arguments[j];
                    }

                    cb.apply(target, args);
                }
            }
        };

        target.removeEvent = function() {

            if (arguments.length == 0) {

                target.events = {};
                return;
            }

            if (arguments.length == 1) {

                let t = arguments[0];

                if (target.events.hasOwnProperty(t)) {

                    delete target.events[t];
                }

                return;
            }

            let t = arguments[0];
            let index = target.events[t].indexOf(arguments[1]);

            if (index > -1) {

                target.events[t].splice(index, 1);
            }
        };

        target.listenerCount = function(t) {
            
            if (target.events.hasOwnProperty(t)) {

                let list = target.events[t] || [];
                return list.length;
            }

            return 0;
        };
    }
}

module.exports = FPEvent;