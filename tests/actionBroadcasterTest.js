var assert = require('assert');

import Game from '../src/scripts/lib/Game.js'
import Simulation from '../src/scripts/lib/Simulation'
import { ENGINE_STEP_TIMEOUT } from '../src/scripts/settings.js' 
import ActionBroadcaster from '../src/scripts/lib/ActionBroadcaster'
import sinon from "sinon";


const game = new Game();
const { universe, engine, channel } = game;
const channelSpy = sinon.spy(channel, "broadcastUpdate");

describe('Action broadcaster', function () {
	it('should dispatch past events', function(done) {
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

	it('should never broadcast the same event twice', function(done) {
		let data, action;
		const simulation = new Simulation(engine, universe);
		const ab = new ActionBroadcaster(simulation, channel);

		simulation.dispatch({
			type: "DUMMY_EVENT"
		});

		simulation._step();
		simulation._step();
		simulation._step();

		ab.onInterval();

		assert.equal(channelSpy.called, true);
		data = channelSpy.lastCall.args[0];
		assert.equal(data.events.length, 1);
		action = data.events[0].action;
		assert.equal("DUMMY_EVENT", action.type);

		ab.onInterval();
		data = channelSpy.lastCall.args[0];
		assert.equal(data.events.length, 0);

		done();

	});

});






