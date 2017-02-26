var assert = require('assert');

import GameClient from "../src/scripts/client/gameClient.js"
import GameServer from '../src/scripts/lib/GameServer.js'
import Simulation from '../src/scripts/lib/Simulation'
import { ENGINE_STEP_TIMEOUT } from '../src/scripts/settings.js' 
import ActionBroadcaster from '../src/scripts/lib/ActionBroadcaster'
import sinon from "sinon";
import Unit from "../src/scripts/lib/Unit"
import { createStore } from 'redux'
import reducers from '../src/scripts/reducers'
import makeWorld from '../src/scripts/mock/syncTestWorldA.js'
import DNA from '../src/scripts/lib/DNA'
import { Dna1, Dna2, Dna3, Dna4, Dna5, Dna6 } from "../src/scripts/mock/dna";

import CircularJSON from 'circular-json';





function checkWorldsInSync(state1, state2) {

	console.log("Server map objects", state1.world.bodies.map(obj => obj.id));
	console.log("Client map objects", state2.world.bodies.map(obj => obj.id));
	assert.equal(state1.mapObjects.length, state2.mapObjects.length);
	assert.equal(state1.world.bodies.length, state2.world.bodies.length);
	//assert.deepEqual(state1.world, state2.world);

	for (let i = 0; i < state1.mapObjects.length; i++) {
		let state1Obj = state1.mapObjects[i];
		let state2Obj = state2.mapObjects[i];
		let body1 = state1Obj.body;
		let body2 = state2Obj.body;



		assert.equal(state1Obj.id, state2Obj.id);
		assert.deepEqual(body1.position, body2.position);
		// We're just gonna check a bunch of properties on the object to make
		// sure the objects are identical
		assert.equal(body1.mass, body2.mass);
		assert.equal(body1.inertia, body2.inertia);	
		assert.equal(body1.speed, body2.speed);
		assert.equal(body1.friction, body2.friction);
		assert.deepEqual(body1.force, body2.force);
		assert.equal(body1.density, body2.density);
		assert.equal(body1.angle, body2.angle);
		assert.equal(body1.angularVelocity, body2.angularVelocity);

	}
}




describe('Sync', function () {
	this.timeout(15000);
	it('should sync', function(done) {


		const game = new GameServer();

		const { universe, engine, channel, simulation } = game;

		const store = createStore(reducers, {});
		const gameClient = new GameClient(null, store, {
			bufferLength: 10,
			bufferTimeout: 10
		});
		const clientUniverse = gameClient.universe;
		const clientSimulation= gameClient.simulation;

		// Remember the update functions so we override them
		const clientUpdate = clientSimulation.onAfterUpdate;
		const serverUpdate = simulation.onAfterUpdate;


		let data, action;
		let events1, events2, events3;
		

		simulation.dispatch({
			type: "ADD_UNIT",
			DNA: "S(B(E,E(B(R,F),F),),R)",
			x: 250,
			y: 150,
			id: 2,
			bornAt: Date.now()
		});


		let gameStateAt30, gameStateAt31, gameStateAt32, gameStateAt20;

		simulation.onAfterUpdate = function(step) {
			console.log("Server update", step);
			serverUpdate(step);
			switch (step) {

				case 10: {
					
					assert.equal(simulation.curr, 10);
					
					events1 = simulation.getPastEventsTo(0);

					gameClient.onUpdate({
						events: events1,
						toStep: 10,
						fromStep: 0
					});
					// The simulation should not run
					assert.equal(clientUniverse.mapObjects.length, 0);
					assert.equal(clientSimulation.isRunning(), false);
					assert.equal(clientSimulation.curr, 0);

					return;

				}

				case 20: {
					
					events2 = simulation.getPastEventsTo(0);

					gameClient.onDump({
						currStep: simulation.getCurrStep(),
						state: universe.getState()
					});
					// The simulation should not run, because we havent dispatched past 2 seconds
					assert.equal(clientSimulation.isRunning(), false);

					// Was the universe hydrated?
					assert.equal(clientUniverse.mapObjects.length, 1);
					assert.equal(clientUniverse.world.bodies.length, 1);
					// Were the events injected?
					assert.deepEqual(events1, clientSimulation.events);

					gameStateAt20 = universe.getState();

					return;

				}

				case 30: {
					gameStateAt30 = universe.getState();
					return;
				}

				case 31: {
					gameStateAt31 = universe.getState();
					return;
				}

				case 32: {
					gameStateAt32 = universe.getState();
					return;
				}				

				case 70: {

					events3 = simulation.getPastEventsTo(0);
					let currStep3 = simulation.getCurrStep();

					gameClient.onUpdate({
						events: events3,
						toStep: currStep3,
						fromStep: 0
					});

					// The simulation should start
					assert.equal(clientSimulation.isRunning(), true);
					assert.equal(clientSimulation.curr, 20);
					return;

				}

				case 200: {
					simulation.pause();
					//done();
					return;
				}

			}


		}

		clientSimulation.onAfterUpdate = function(step) {
			console.log("Client update", step);
			clientUpdate(step);
			switch (step) {
				case 20: {
					checkWorldsInSync(gameStateAt20, clientUniverse.getState());
					return;		
				}

				case 30: {
					checkWorldsInSync(gameStateAt30, clientUniverse.getState());
					return;
				}

				case 31: {
					checkWorldsInSync(gameStateAt31, clientUniverse.getState());
					return;
				}

				case 32: {
					checkWorldsInSync(gameStateAt32, clientUniverse.getState());
					return;	
				}			

				case 40: {
					simulation.pause();
					clientSimulation.pause();
					done();
					return;
				}
			}
		}
		simulation.start();
	});





	it('should be able to over-chase then resync', function(done) {

		console.log("----------------- TEST 2 ------------------");

		const game = new GameServer();

		const { universe, engine, channel, simulation } = game;

		const store = createStore(reducers, {});
		const gameClient = new GameClient(null, store, {
			bufferLength: 10,
			bufferTimeout: 10
		});
		const clientUniverse = gameClient.universe;
		const clientSimulation= gameClient.simulation;

		// Remember the update functions so we override them
		const clientUpdate = clientSimulation.onAfterUpdate;
		const serverUpdate = simulation.onAfterUpdate;

		let gameStateAt11, 
			gameStateAt12, 
			gameStateAt20, 
			gameStateAt40, 
			gameStateAt41,
			gameStateAt31,
			gameStateAt91,
			gameStateAt130,
			eventsDumped;

		simulation.onAfterUpdate = function(step) {
			console.log("TEST 2 Server update", step);
			serverUpdate(step);
			switch (step) {

				case 10: {
					
					assert.equal(simulation.curr, 10);
	
					simulation.dispatch({
						type: "ADD_UNIT",
						DNA: "S(B(E,E(B(R,F),F),),R)",
						x: 250,
						y: 150,
						id: 2,
						bornAt: Date.now()
					});
					// The simulation should not run
					assert.equal(universe.mapObjects.length, 0);
					assert.equal(clientUniverse.mapObjects.length, 0);
					assert.equal(clientSimulation.isRunning(), false);
					assert.equal(clientSimulation.curr, 0);


					gameClient.onDump({
						currStep: simulation.getCurrStep(),
						state: universe.getState()
					});

					return;

				}

				case 11: {
					gameStateAt11 = CircularJSON.parse(CircularJSON.stringify(universe.getState()));
					return;
				}

				case 12: {
					gameStateAt12 = CircularJSON.parse(CircularJSON.stringify(universe.getState())); 
					console.log("Server game state at 12", gameStateAt12);
					return;
				}

				case 20: {
					simulation.dispatch({
						type: "KILL_UNIT",
						unitId: 2
					});
					gameStateAt20 = CircularJSON.parse(CircularJSON.stringify(universe.getState()));
					return;
				}



				case 30: {
					simulation.dispatch({
						type: "ADD_UNIT",
						DNA: "S(B(E,E(B(R,F),F),),R(F))",
						x: 250,
						y: 150,
						id: 3,
						bornAt: Date.now()
					});
					simulation.dispatch({
						type: "ADD_UNIT",
						DNA: "S(B(E,E(B(R,F),F),),R)",
						x: 350,
						y: 150,
						id: 4,
						bornAt: Date.now()
					});					
					return;
				}

				case 31: {
					gameStateAt31 = CircularJSON.parse(CircularJSON.stringify(universe.getState()));
					return;
				}


				case 40: {
					simulation.dispatch({
						type: "KILL_UNIT",
						unitId: 4
					});
					gameStateAt40 = CircularJSON.parse(CircularJSON.stringify(universe.getState()));
					return;
				}


				case 41: {
					simulation.dispatch({
						type: "KILL_UNIT",
						unitId: 3
					});
					gameStateAt41 = CircularJSON.parse(CircularJSON.stringify(universe.getState()));
					return;
				}

				case 50: {
					let events = simulation.getPastEventsTo(0);
					gameClient.onUpdate({
						events: events,
						toStep: 50,
						fromStep: 0
					});
					eventsDumped = events;
					return;
				}
				case 80: {
					simulation.dispatch({
						type: "ADD_UNIT",
						DNA: "S(B,E,R)",
						x: 350,
						y: 150,
						id: 5,
						bornAt: Date.now()
					});
					simulation.dispatch({
						type: "ADD_UNIT",
						DNA: "S(B,E,R)",
						x: 650,
						y: 150,
						id: 6,
						bornAt: Date.now()
					});							
					return;
				}



				case 85: {
				    simulation.dispatch({
				      type: "REPRODUCE_UNIT",
				      unitId: 5,
				      cellIndex: 0,
				      newId: 9,
				      dna: "S(B,E,R)",
				      timestamp: Date.now(),
				      position: {
				      	x: 400,
				      	y: 400
				      }
				    });						
					return;
				}

				case 90: {
					simulation.dispatch({
						type: "KILL_UNIT",
						unitId: 6
					});	
					return;				
				}

				case 91: {
					gameStateAt91 = CircularJSON.parse(CircularJSON.stringify(universe.getState()));
					return;				
				}

				

				case 130: {
					gameStateAt130 = CircularJSON.parse(CircularJSON.stringify(universe.getState()));	
					return;
				}

				case 140: {
					let events = simulation.getPastEventsTo(0);
					gameClient.onUpdate({
						events: events,
						toStep: 140,
						fromStep: 0
					});

					return;
				}
			}
		}

		clientSimulation.onAfterUpdate = function(step) {
			console.log("TEST 2 Client update", step);
			clientUpdate(step);
			switch (step) {
				case 11: {
					checkWorldsInSync(gameStateAt11, clientUniverse.getState());
					return;
				}

				case 12: {
					// be careful we not
					checkWorldsInSync(gameStateAt12, clientUniverse.getState());
					return;
				}

				case 20: {			
					checkWorldsInSync(gameStateAt20, clientUniverse.getState());
					return;
				}

				case 31: {
					checkWorldsInSync(gameStateAt31, clientUniverse.getState());
					return;
				}

				case 40: {
					assert.equal(gameClient.latestStepFromServer, 50);
					assert.equal(clientSimulation.isRunning(), false);
					checkWorldsInSync(gameStateAt40, clientUniverse.getState());
					return;
				}

				// Expecting client to stop at 40, since our latest step in only 50
				// and the bufferTimeout is 10
				//
				// Then we expect to restart at 41 once the next set of updates come in
				case 41: {
					assert.equal(gameClient.latestStepFromServer, 140);
					assert.equal(clientSimulation.isRunning(), true);
					checkWorldsInSync(gameStateAt41, clientUniverse.getState());
					return;
				}

				case 91: {
					checkWorldsInSync(gameStateAt91, clientUniverse.getState());
					return;
				}

				// Expect it to stop again at 130
				case 129: {
					assert.equal(clientSimulation.isRunning(), true);
					return;
				}

				// Expect it to stop again at 130
				case 130: {
					checkWorldsInSync(gameStateAt130, clientUniverse.getState());
					assert.equal(clientSimulation.isRunning(), false);
					simulation.pause();
					clientSimulation.pause();
					done();
					return;
				}
			}
		}
		simulation.start();

	});
});






