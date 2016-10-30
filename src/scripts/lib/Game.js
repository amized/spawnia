
import Universe from "./Universe.js"
import Simulation from "./Simulation.js";
import Channel from "./Channel.js";
import { Engine, MouseConstraint, World  } from 'matter-js';
import { default as C } from "../constants"

var map;
var ticker;
var stepManager;
var store;
var world;

let gameIds = 0;

import { Dna1, Dna2, Dna3, Dna4, Dna5, Dna6 } from "../mock/dna";

export default class Game {

	constructor () {
		console.log("initialising the game");
		// The third argument here is a callback for when an action is dispatched
		// and we may need to update the UI
		this.id = gameIds++;
		this.engine = Engine.create({
			timing: {
				timeScale: 0.3
			}
		});

		this.channel = new Channel(this.id);

		// The universe is an object that holds the game state
		this.universe = new Universe(this.engine.world);
		// The simulation is responsible for running the engine
		this.simulation = new Simulation(this.engine, this.universe);
		let dispatch = this.simulation.dispatch;
		
		dispatch({
			type: "BUILD_WORLD"
		});

		dispatch({
			type: "ADD_FOOD",
			amount: 500,
			x: 200,
			y: 400
		});

		dispatch({
			type: "ADD_FOOD",
			amount: 500,
			x: 100,
			y: 500
		});

		dispatch({
			type: "ADD_FOOD",
			amount: 500,
			x: 700,
			y: 200
		});

		dispatch({
			type: "ADD_FOOD",
			amount: 500,
			x: 300,
			y: 200
		});
		dispatch({
			type: "ADD_FOOD",
			amount: 500,
			x: 700,
			y: 500
		});
		
		dispatch({
			type: "ADD_FOOD",
			amount: 500,
			x: 900,
			y: 100
		});


		dispatch({
			type: "ADD_FOOD",
			amount: 500,
			x: 1100,
			y: 500
		});


		dispatch({
			type: "ADD_UNIT",
			DNA: Dna6,
			x: 350,
			y: 200
		}, 120);

		dispatch({
			type: "ADD_UNIT",
			DNA: Dna1,
			x: 400,
			y: 100
		}, 120);



		dispatch({
			type: "ADD_UNIT",
			DNA: Dna1,
			x: 450,
			y: 100
		}, 120);			

/*
		dispatch({
			type: "ADD_UNIT",
			DNA: Dna1,
			x: 250,
			y: 400
		}, 220);


		dispatch({
			type: "ADD_UNIT",
			DNA: Dna5,
			x: 150,
			y: 400
		}, 140);



		dispatch({
			type: "ADD_UNIT",
			DNA: Dna1,
			x: 700,
			y: 200
		}, 220);

		dispatch({
			type: "ADD_UNIT",
			DNA: Dna4,
			x: 650,
			y: 200
		}, 140);
		dispatch({
			type: "ADD_UNIT",
			DNA: Dna4,
			x: 650,
			y: 300
		}, 140);

		dispatch({
			type: "ADD_UNIT",
			DNA: Dna4,
			x: 650,
			y: 400
		}, 140);
		dispatch({
			type: "ADD_UNIT",
			DNA: Dna4,
			x: 650,
			y: 500
		}, 140);		
		/*
		dispatch({
			type: "ADD_UNIT",
			DNA: Dna4,
			x: 700,
			y: 150
		}, 160);		
*/

		setInterval(()=>{
			dispatch({
				type: "STEP"
			});
		}, 1000);

		this.simulation.start();
		this.isInitialised = true;
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

	getStore () {
		return store;
	}


	getMap () {
		return map;
	}
}

