var assert = require('assert');

import GameServer from '../src/scripts/lib/GameServer.js'
import Simulation from '../src/scripts/lib/Simulation'
import { ENGINE_STEP_TIMEOUT } from '../src/scripts/settings.js' 
import ActionBroadcaster from '../src/scripts/lib/ActionBroadcaster'
import sinon from "sinon";
import Unit from "../src/scripts/lib/Unit"

const game = new GameServer();
const { universe, engine, channel } = game;
const channelSpy = sinon.spy(channel, "broadcastUpdate");

describe('Unit', function () {
	it('should mature', function(done) {
		let data, action;
		

		const simulation = new Simulation(engine, universe);
		const ab = new ActionBroadcaster(simulation, channel);

		simulation.dispatch({
			type: "DUMMY_EVENT"
		});

		// Should not broadcast any events since we havent run it yet
		ab.onInterval();
		data = channelSpy.lastCall.args[0];
		assert.equal(data.events.length, 0);

		simulation._step();
		simulation._step();
		simulation._step();

		ab.onInterval();
		data = channelSpy.lastCall.args[0];
		assert.equal(data.events.length, 1);

		action = data.events[0].action;
		assert.equal("DUMMY_EVENT", action.type);
		done();
	});



});






