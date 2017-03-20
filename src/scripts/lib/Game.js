
import Universe from "./Universe.js"
import Simulation from "./Simulation.js";
import Player from "./Player.js";
import { Engine, World  } from 'matter-js';
import { default as C } from "../constants"
import MapObject from "./MapObject"
import uuid from 'uuid';
import { getBarriers } from "./MapBuilder"
import { 
	GAME_STAGE_NOGAME, 
	GAME_STAGE_BUILDINGSPECIES, 
	GAME_STAGE_WATCHING
} from "../constants"


let gameIds = 0;


const GAME_STAGES = [
	"NOGAME",
	"BUILDING_SPECIES",
	""


]



export default class Game {

	constructor (makeWorld, numPlayers = 2) {
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
		this.players = [];

		this.gameStage = GAME_STAGE_NOGAME;

		for (var i = 0; i < numPlayers; i++) {
			this.players.push(new Player(i))
		}

		if (makeWorld) { 
			this.buildMap(makeWorld);
		}

	}

	buildMap(makeWorld) {

		makeWorld(this.simulation.immediateDispatch);
		// Runs all the dispatches issued in make world;

		const mapSize = this.universe.getMapSize();
		const barriers = getBarriers(mapSize.width, mapSize.height);
		const mapObjs = barriers;
		mapObjs.forEach((m, index) => {
			this.universe.add(m);
		});

		//this.simulation._step();	
		//this.simulation._step();		
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
	getSimulation () {
		return this.getSimulation;
	}

}








