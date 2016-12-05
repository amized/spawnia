
import { Engine } from 'matter-js';
import Universe from "../lib/Universe.js"
import Simulation from "../lib/Simulation.js";
import socketClient from "./socketClient";
import { synced, lostSync } from "../actions";
import Game from '../lib/Game'



export default class GameClient extends Game {



	constructor(makeWorld, store, options = {}) {
		
		super(makeWorld);

		const defaults = {
			bufferLength: 120, // Number of steps of events we need to buffer before continuing to run game
			bufferTimeout: 10  // Smallest number of steps events buffered before we stop and wait for more updates
		}

		Object.assign(this, defaults, options);

		this.store = store;

		// The simulation is responsible for running the engine
		this.latestStepFromServer = null;
		this.earliestStepFromServer = null;
		this.hasRecievedDump = false;

		this.simulation.onAfterUpdate = (currStep) => {
			// Make sure we keep up/dont outrun the server
			this.checkSync();
		}

		socketClient.initConnection(store, "", "1111111", {
			onUpdate: this.onUpdate,
			onDump: this.onDump
		});
	}

	reset() {
		this.latestStepFromServer = null;
		this.earliestStepFromServer = null;		
		this.hasRecievedDump = false;
		this.universe.clear();
		this.simulation.reset();
	}

	onUpdate = (data) => {
		/*
		data.events.forEach(evt => {
			this.simulation.dispatch(evt.action,null,evt.timeout);
		});
		*/
		this.simulation.bufferEvents(data.events);
		this.latestStepFromServer = data.toStep;
		this.earliestStepFromServer = data.fromStep;
		this.checkSync();
		console.log("got update - ", data.toStep, data.fromStep);
	}

	onDump = (data) => {
		let { currStep, state } = data;
		this.hasRecievedDump = true;
		this.simulation.pause();
		this.simulation.setCurrStep(currStep);
		this.universe.hydrate(state);
		this.checkSync();
		//console.log("got dump - ", this.simulation.curr, state);
	}

	checkSync() {

		if (!this.hasRecievedDump) {
			return;
		}

		let currStep = this.simulation.getCurrStep();
		let store = this.store;
		if (!this.simulation.isRunning()) {
			// We can assume if we're not running, we go
			if (currStep + this.bufferLength < this.latestStepFromServer) {
				console.log("resuming....", this.simulation.curr);
				store.dispatch(synced());
				this.simulation.resume();
			} 
		}
		else {
			if (currStep + this.bufferTimeout >= this.latestStepFromServer) {
				console.log("slowwwwing down....");
				store.dispatch(lostSync());
				this.simulation.pause();
			} 
		}			
	}
}