/**
 * @license Rust-WebRcon (c) 2016 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/rust-webrcon for details
 */
(function(global, factory) {

    /* AMD */ if (typeof define === 'function' && define["amd"])
        define(factory)
    /* CommonJS */ else if (typeof require === "function" && typeof module === "object" && module && module["exports"])
        module["exports"] = factory()
    /* Global */ else
        (global["dcodeIO"] = global["dcodeIO"] || {})["WebRcon"] = factory()

})(this, function(isNode) {
    "use strict"
    
    /**
     * Actual WebSocket implementation used.
     * @type {function(string, new:WebSocket)}
     * @inner
     */
    var WebSocketImpl = typeof WebSocket !== 'undefined' ? WebSocket : require('ws')
    
    /**
     * WebRcon interface.
     * @exports WebRcon
     * @constructor
     * @param {string} ip Server IP
     * @param {number} port Server port
     */
    function WebRcon(ip, port) {
        
        /**
         * Server IP.
         * @type {string}
         */
        this.ip = ip
        
        /**
         * Server port.
         * @type {number}
         */
        this.port = port
        
        /**
         * WebSocket.
         * @type {?WebSocket}
         */
        this.socket = null
        
        /**
         * Event listeners.
         * @type {!Object.<string,!Array.<function()>>}
         * @private
         */
        this._listeners = {}
    }
    
    /**
     * Connecting socket state.
     * @type {number}
     * @const
     */
    WebRcon.STATE_CONNECTING = 0
    
    /**
     * Connected socket state.
     * @type {number}
     * @const
     */
    WebRcon.STATE_CONNECTED = 1
    
    /**
     * Closing socket state.
     * @type {number}
     * @const
     */
    WebRcon.STATE_CLOSING = 2
    
    /**
     * Closed socket state.
     * @type {number}
     * @const
     */
    WebRcon.STATE_CLOSED = 3
    
    /**
     * Error message type.
     * @type {number}
     * @const
     */
    WebRcon.TYPE_ERROR = 0
    
    /**
     * Assert message type.
     * @type {number}
     * @const
     */
    WebRcon.TYPE_ASSERT = 0
    
    /**
     * Warning message type.
     * @type {number}
     * @const
     */
    WebRcon.TYPE_WARNING = 2
    
    /**
     * Log message type.
     * @type {number}
     * @const
     */
    WebRcon.TYPE_LOG = 3
    
    /**
     * Exception message type.
     * @type {number}
     * @const
     */
    WebRcon.TYPE_EXCEPTION = 4        
    
    /**
     * @name WebRconconnecting
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(WebRcon.prototype, 'connecting', {
        get: function get_connecting() {
            return (this.socket && this.socket.readyState === WebRcon.STATE_CONNECTING) === true
        }
    })
    
    /**
     * @name WebRcon#connected
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(WebRcon.prototype, 'connected', {
        get: function get_connected() {
            return (this.socket && this.socket.readyState === WebRcon.STATE_CONNECTED) === true
        }
    })
    
    /**
     * @name WebRconN#closing
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(WebRcon.prototype, 'closing', {
        get: function get_closing() {
            return (this.socket && this.socket.readyState === WebRcon.STATE_CLOSING) === true
        }
    })
    
    /**
     * @name WebRcon#closed
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(WebRcon.prototype, 'closed', {
        get: function get_closed() {
            return (this.socket === null || this.socket.readyState === WebRcon.STATE_CLOSED) === true
        }
    })
    
    /**
     * @name WebRcon#status
     * @type {string}
     * @readonly
     */
    Object.defineProperty(WebRcon.prototype, 'status', {
        get: function get_status() {
            if (!this.socket)
                return 'CLOSED'
            switch (this.socket.readyState) {
                case WebRcon.STATE_CONNECTING:
                    return 'CONNECTING'
                case WebRcon.STATE_CONNECTED:
                    return 'CONNECTED'
                case WebRcon.STATE_CLOSING:
                    return 'CLOSING'
                case WebRcon.STATE_CLOSED:
                    return 'CLOSED'
                default:
                    return 'UNKNOWN'
            }
        }
    })
    
    function onopen(e) {
        this.emit('connect', e)
    }
    
    function onmessage(e) {
        try {
            this.emit('message', ServerMessage.fromPayload(e.data))
        } catch (err) {
            this.emit('error', err)
        }
    }
    
    function onerror(e) {
        this.emit('error', e)
    }
    
    function onclose(e) {
        this.emit('disconnect', e)
        this.socket = null
    }
    
    /**
     * Connects to the specified endpoint.
     * @param {string} endpoint Endpoint address
     * @private
     */
    WebRcon.prototype._connect = function(endpoint) {
        if (!this.closed)
            throw Error('already connected')
        this.socket = new WebSocketImpl(endpoint)
        this.socket.addEventListener('open', onopen.bind(this))
        this.socket.addEventListener('message', onmessage.bind(this))
        this.socket.addEventListener('error', onerror.bind(this))
        this.socket.addEventListener('close', onclose.bind(this))
    }
    
    /**
     * Asynchronously connects to the RCON interface.
     * @param {string} password The RCON password
     * @throws {Error} If the RCON interface is already connecting, connected or still closing
     */
    WebRcon.prototype.connect = function connect(password) {
        this._connect('ws://' + this.ip + ':' + this.port + '/' + password)
    }
    
    /**
     * Disconnects from the RCON interface.
     * @returns {boolean} `true` if now closing, `false` if not connected
     */
    WebRcon.prototype.disconnect = function disconnect() {
        if (!this.connected)
            return false
        this.socket.close()
        this.socket = null
        return true
    }
    
    /**
     * Runs an RCON command.
     * @param {string} command Command to run
     * @param {number=} identity Server identity, defaults to -1
     */
    WebRcon.prototype.run = function run(command, identity) {
        this.socket.send(JSON.stringify({
            Identifier: identity === void 0 ? -1 : identity,
            Message: command,
            Name: 'WebRcon'
        }))
    }
    
    // Minimal EventEmitter
    
    /**
     * Adds an event listener for the specified event.
     * @param {string} event Event name
     * @param {function(...*)} callback Callback
     */
    WebRcon.prototype.addListener = function addListener(event, callback) {
        if (!this._listeners.hasOwnProperty(event)) {
            this._listeners[event] = [ callback ]
            return
        }
        var listeners = this._listeners[event]
        if (listeners.indexOf(callback) < 0)
            listeners.push(callback)
    }
    
    /**
     * Adds an event listener for the specified event.
     * @function
     * @param {string} event Event name
     * @param {function(...*)} callback Callback
     */
    WebRcon.prototype.on = WebRcon.prototype.addListener
    
    /**
     * Adds an event listener for the specified event that is executed only once.
     * @function
     * @param {string} event Event name
     * @param {function(...*)} callback Callback
     */
    WebRcon.prototype.once = function once(event, callback) {
        var self = this
        var onceCallback = function onceCallback(a1, a2, a3) {
            self.removeListener(event, onceCallback)
            callback(a1, a2, a3)
        }
        this.addListener(event, onceCallback)
    }
    
    /**
     * Removes an event listener.
     * @param {string} event Event name
     * @param {function()} callback Callback
     */
    WebRcon.prototype.removeListener = function removeListener(event, callback) {
        if (!this._listeners.hasOwnProperty(event))
            return
        var listeners = this._listeners[event],
            index = listeners.indexOf(callback)
        if (index < 0)
            return
        if (listeners.length === 1)
            delete this._listeners[event]
        else
            listeners.splice(index, 1)
    }
    
    /**
     * Removes all listeners.
     * @param {string=} event If specified, removes all listeners for this event only
     */
    WebRcon.prototype.removeAllListeners = function(event) {
        if (event === void 0) {
            this._listeners = {}
            return
        }
        if (this._listeners.hasOwnProperty(event))
            this._listeners[event] = []
    }
    
    /**
     * Emits an event by calling all associated listeners.
     * @param {string} event Event name
     * @param {...*} var_args Arguments
     */
    WebRcon.prototype.emit = function emit(event, a1, a2, a3) {
        var listeners = this._listeners[event],
            k
        if (!(listeners && (k = listeners.length)))
            return
        for (var i = 0; i < k; ++i)
            listeners[i](a1, a2, a3)
    }
    
    /**
     * A message sent by the server.
     * @constructor
     */
    function ServerMessage(message, type, stacktrace, identity) {
        
        /**
         * Message string.
         * @type {string}
         */
        this.message = message
        
        /**
         * Message type.
         * @type {number}
         * @see {@link WebRcon#TYPE_ERROR}
         * @see {@link WebRcon#TYPE_ASSERT}
         * @see {@link WebRcon#TYPE_WARNING}
         * @see {@link WebRcon#TYPE_LOG}
         * @see {@link WebRcon#TYPE_EXCEPTION}
         */
        this.type = type
        
        /**
         * Stacktrace, if any.
         * @type {?string}
         */
        this.stacktrace = stacktrace || null
        
        /**
         * Server identity.
         * @type {number}
         */
        this.identity = identity
        
        /**
         * Message time.
         * @type {number}
         */
        this.time = Date.now()
    }
    
    /**
     * Constructs a ServerMessage from the specified payload.
     * @param {string} Payload JSON
     * @returns {!ServerMessage}
     */
    ServerMessage.fromPayload = function fromPayload(payload) {
        var data = JSON.parse(payload)
        return new ServerMessage(data.Message, data.Type, data.Stacktrace, data.Identifier)
    }
    
    /**
     * @name ServerMessage#isError
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(ServerMessage.prototype, 'isError', {
        get: function get_isError() {
            return this.type === WebRcon.TYPE_ERROR
        }
    })
    
    /**
     * @name ServerMessage#isAssert
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(ServerMessage.prototype, 'isAssert', {
        get: function get_isAssert() {
            return this.type === WebRcon.TYPE_ASSERT
        }
    })
    
    /**
     * @name ServerMessage#isWarning
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(ServerMessage.prototype, 'isWarning', {
        get: function get_isWarning() {
            return this.type === WebRcon.TYPE_WARNING
        }
    })
    
    /**
     * @name ServerMessage#isLog
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(ServerMessage.prototype, 'isLog', {
        get: function get_isLog() {
            return this.type === WebRcon.TYPE_LOG
        }
    })
    
    /**
     * @name ServerMessage#isException
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(ServerMessage.prototype, 'isException', {
        get: function get_isException() {
            return this.type === WebRcon.TYPE_EXCEPTION
        }
    })
    
    /**
     * @name ServerMessage#hasStacktrace
     * @type {boolean}
     * @readonly
     */
    Object.defineProperty(ServerMessage.prototype, 'hasStacktrace', {
        get: function get_hasStacktrace() {
            return this.stacktrace !== null
        }
    })
    
    /**
     * @alias ServerMessage
     */
    WebRcon.ServerMessage = ServerMessage
    
    return WebRcon
})
