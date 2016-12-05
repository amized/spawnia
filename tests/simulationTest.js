var assert = require('assert');

import Game from '../src/scripts/lib/Game.js'
import Simulation from '../src/scripts/lib/Simulation'
import { ENGINE_STEP_TIMEOUT } from '../src/scripts/settings.js' 
const game = new Game();

describe('Simulation', function () {

	it('should run the dispatched event on the next step', function() {
		const { universe, engine } = game;
		const simulation = new Simulation(engine, universe);
		simulation.dispatch({
			type: "DUMMY_EVENT"
		});

		assert.equal(0, simulation.curr);
		assert.equal(1, simulation.events.length);
		
		simulation._step();
		
		assert.equal(1, simulation.curr);
		assert.equal(1, simulation.events.length);

		simulation._step();

		assert.equal(2, simulation.curr);
		assert.equal(0, simulation.events.length);
	});



	it('should fire an event at the right time', function(done) {
		const { universe, engine } = game;
		const simulation = new Simulation(engine, universe);

		simulation.dispatch({
			type: "DUMMY_EVENT"
		}, 200); 

		setTimeout(()=> {
			assert.equal(1, simulation.events.length);
			assert.equal("DUMMY_EVENT", simulation.events[0].action.type);
			//assert.equal(Math.floor(100/ENGINE_STEP_TIMEOUT), simulation.events[0].timeout);
		}, 100);

		// We expect the event to fire after 1s

		setTimeout(()=> {
			assert.equal(0, simulation.events.length);
			simulation.pause();
			done();
		}, 300);

		simulation.start();
	});

	it('should fire an event at the right delay', function(done) {
		const { universe, engine } = game;
		const simulation = new Simulation(engine, universe);

		setTimeout(()=> {
			simulation.dispatch({
				type: "DUMMY_EVENT"
			}, 100);
		}, 50);

		// expecting 'around' 1500

		setTimeout(()=> {
			assert.equal(1, simulation.events.length);
			assert.equal("DUMMY_EVENT", simulation.events[0].action.type);
			let expectedCurrStep = simulation.getCurrStep();
			assert.equal(expectedCurrStep + Math.floor(50/ENGINE_STEP_TIMEOUT), simulation.events[0].timeout);
		}, 100);

		// We expect the event to fire after 1s

		setTimeout(()=> {
			assert.equal(0, simulation.events.length);
			simulation.pause();
			done();
		}, 200);

		simulation.start();
	});





	it('should be able to dispatch events with an absolute timeout, and run at the right time', function() {
		const { universe, engine } = game;
		const simulation = new Simulation(engine, universe);


		simulation.setCurrStep(5001);

		simulation.dispatch({
			type: "DUMMY_EVENT"
		}, null, 5000);

		assert.equal(1, simulation.events.length);
		simulation._step();
		assert.equal(0, simulation.events.length);
	});

	it('should not run past events', function() {
		const { universe, engine } = game;
		const simulation = new Simulation(engine, universe);


		simulation.setCurrStep(5000);

		simulation.dispatch({
			type: "DUMMY_EVENT"
		}, null, 4999);

		assert.equal(1, simulation.events.length);
		simulation._step();
		assert.equal(0, simulation.events.length);
	});

});






