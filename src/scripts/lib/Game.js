
import Universe from "./Universe.js"
import Simulation from "./Simulation.js";
import { Engine, World  } from 'matter-js';
import { default as C } from "../constants"
import uuid from 'uuid';

let gameIds = 0;

export default class Game {

	constructor (makeWorld) {
		console.log("initialising the game");
		this.id = gameIds++;
		this.engine = Engine.create({
			timing: {
				timeScale: 0.3
			}
		});

		let world = this.engine.world;
		
		this.universe = new Universe(this.engine.world);
		this.simulation = new Simulation(this.engine, this.universe);

		if (makeWorld) { 
			makeWorld(this.simulation.dispatch);
		}
	}

	reset() {
		this.universe.clear();
		this.simulation.reset();
	}

	run() {
		this.simulation.start();	
	}

	getDispatchFn () {
		return this.simulation.dispatch;
	}

	getEngine () {
		return this.engine;
	}

	getUniverse () {
		return this.universe;
	}
}








