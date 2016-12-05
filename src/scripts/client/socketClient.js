//var actions = require("../actions/actions");
//var store = require("./store");
var settings = require("../settings");

import { CONN_STATUS_WAITING } from "../constants";
import { SERVER_URL } from "../serverConfig";
import { socketConnected, socketDisconnected, socketWaiting } from "../actions"
import CircularJSON from 'circular-json';
import SockJS from "sockjs-client"

var SocketClient = class {
	
	constructor(options) {

		const defaults = {
			onUpdate: null,
			onDump: null
		}

		Object.assign(this, defaults, options);

		this.retryInterval = 5000;
		this.maxRetries = 20;
		this.sock = null;
		this.retryCount = 0;
		this.timeout = null;
		this.heatbeatTimeout = null;
	}


	setOnUpdate(func) {
		this.onUpdate = func;
	}
	setOnDump(func) {
		this.onDump = func;
	}
	reset() {
		this.retryCount = 0;
		clearTimeout(this.timeout);		
	}

	sendData(msgType, data) {
		this.sock.send(JSON.stringify({
			msgType: msgType,
			data: data
		}));
	}

	initConnection (store, nodeUrl, sessionKey, events = null) {

		this.store = store;
		this.sessionKey = sessionKey;
		this.nodeUrl = SERVER_URL;

		if (events) {
			this.onUpdate = events.onUpdate;
			this.onDump = events.onDump;			
		}

		// We are only allowing one connection per client at a time,
		// so close any existing socks
		if (this.sock) {
			this.sock.close();
		}

		this.sock = new SockJS(SERVER_URL + "/live", null, { heartbeatTimeout: 30000 });
		this.retryCount++;
		if (this.store.getState().client.connectionStatus !== CONN_STATUS_WAITING) {
			this.store.dispatch(socketWaiting());
		}
		var self = this;

		this.sock.onopen = function() {
			this.reset();
			this.sendData("SUBSCRIBE_TO_CHANNEL", {
				channelId: 0,
				sessionKey: this.sessionKey
			});		
		}.bind(this);


		// The server emits a heartbeat message every 25 seconds, so if
		// we don't get one then we reinitialise the reconnect strategy
		this.sock.onheartbeat = function() {
		    clearTimeout(this.heatbeatTimeout);
		    this.heatbeatTimeout = setTimeout(this.reconnectInit.bind(this), settings.heatbeatDelay + 5000)
		}.bind(this);

		this.sock.onmessage = (e) => {

			// Either we will get dump message, or an update with an action,
			// which both get dispatched immediately to the local store
			// which keeps it in sync with the server.

			var response = JSON.parse(e.data);
			if (response.dump) {
				let state = CircularJSON.parse(response.state);
				if (this.onDump) {
					this.onDump({
						state: state,
						currStep: response.currStep
					});
				}
			}
			else if (response.update) {
				if (this.onUpdate) {
					this.onUpdate(response.data);
				}
				
			}
		};

		this.sock.onclose = function() {
			// Handles attempting to reconnect after being refused
			// connection or thrown off
			if (self.retryCount > self.maxRetries) {
				this.store.dispatch(socketDisconnected());
			}
			else {
				this.reconnectInit();
			}
		}.bind(this);
	}

	reconnectInit() {
		if (this.store.getState().client.connectionStatus !== CONN_STATUS_WAITING) {
			this.store.dispatch(socketWaiting());
		}
		this.timeout = setTimeout(function () {
			this.reconnect();
		}.bind(this), this.retryInterval);
	}

	reconnect() {
		if (this.store && this.sessionKey) {
			this.initConnection(this.store, this.nodeUrl, this.sessionKey);
		}
	}

	reconnectNewSession(sessionKey) {
		if (this.store) {
			this.initConnection(this.store, this.nodeUrl, sessionKey);
		}		
	}
}

const socketClient = new SocketClient();


export default socketClient


//sock.close();