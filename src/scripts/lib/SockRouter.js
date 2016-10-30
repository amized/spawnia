"use strict";

// channelManager = require("./channelManager");

export default class SockRouter {

	constructor(games) {
		this.messageHandlers = [];
        this.games = games;
	}

	on(msgType, callback) {
		this.messageHandlers.push({
			msgType: msgType,
			callback: callback
		});
	}

	handleMessage(msg, conn) {
		const message = JSON.parse(msg);
        const channelId = message.data.channelId;
        const game = (channelId !== undefined) ? (this.games.filter(game => game.id === channelId))[0] : null;
        this.messageHandlers.forEach(function(handler, index) {
        	if (handler.msgType === message.msgType) {
        		handler.callback(message.data, conn, game);
        	}
        });
    }
}
