
import Game from './Game'
import Species from './Species'
import Gameloop from './Gameloop'
import uuid from 'uuid'
import { stateChange } from '../../../../react-oo';
import { ENGINE_STEP_TIMEOUT, GAME_STEP_TIMEOUT, ACTION_BROADCAST_TIMEOUT, MUTATION_DEAL_INTERVAL } from "../settings"

const GAME_STEP_INTERVAL = GAME_STEP_TIMEOUT / ENGINE_STEP_TIMEOUT;
const MUTATION_ALLOCATION_TIMEOUT = Math.floor(MUTATION_DEAL_INTERVAL / ENGINE_STEP_TIMEOUT);
const ACTION_BROADCAST_INTERVAL = ACTION_BROADCAST_TIMEOUT / ENGINE_STEP_TIMEOUT;

import { 
	GAME_STAGE_NOGAME,
	GAME_STAGE_BUILDINGSPECIES,
	GAME_STAGE_PLACESPECIES,
	GAME_STAGE_ENDED,
	GAME_STAGE_ENDED_TIMEOUT,
	GAME_STAGE_ENDED_DEATH,
	GAME_STAGE_WATCHING,
	GAME_STAGE_READY_TO_START 
} from "../constants";

import _ from "underscore";

import { stepsToMs } from "./Utils/utils";

import { newGame, startSpeciesPlacement, startSimulation } from "../actions";
import Player from "./Player"
import NotificationManager from "./NotificationManager"

export default class GameStandalone extends Game {

	constructor(store, makeWorld, numPlayers = 2) {
		super(store, makeWorld, numPlayers);
		
		this.simulation.onAfterUpdate = (currStep) => {
			
			let gameTime = stepsToMs(currStep);
			// Check end game
			if (gameTime > this.gameDuration) {
				this.timeOut();
				return;
			}

			if (currStep % GAME_STEP_INTERVAL === 0) {
				//let state = this.universe.getState();
				let state = this.universe;
				Gameloop.onStep(currStep, state, this.simulation.dispatch);
			}

			if (currStep % MUTATION_ALLOCATION_TIMEOUT === 0) {
				this.dealMutations();
			}
		}

		this.gameDuration = 300000; // Game time in seconds
		this.nm = new NotificationManager();
		this.myPlayerId = 0;
		this.makeWorld = makeWorld;
		this.newGame(2, makeWorld);
	}

	@stateChange
	reset() {
		this.nm = new NotificationManager();
		this.myPlayerId = 0;
		this.speciess = [];
		this.simulation.reset();
		this.universe.clear();		
		this.newGame(2, this.makeWorld);
	}

	@stateChange
	newGame(numPlayers, makeWorld) {
		this.players = [];
		for (let i = 0; i < numPlayers; i++) {
			this.players.push(new Player(i));
		}
		this.myPlayer = this.players[this.myPlayerId];
		this.gameStage = GAME_STAGE_BUILDINGSPECIES;
		this.buildMap(makeWorld);
	}

	@stateChange
	changeGameStage(newStage) {
		this.gameStage = newStage;
	}

	@stateChange
	saveInitSpecies(species) {

		this.addSpecies(species.encodedDna, this.myPlayer.id);
		let aiPlayers = this.players.filter(player => player.id !== this.myPlayer.id);
		aiPlayers.forEach(player=> {
			this.addSpecies("S(X(,X(F,E,R),G),F,E,R)", player.id);
		})
		this.gameStage = GAME_STAGE_PLACESPECIES;
		console.log("saving...", this);
	}


	@stateChange
	addSpecies(encodedDna, playerId) {
		let species = new Species(encodedDna);
		species.playerId = playerId;
		species.id = this.speciesIds++;
		this.speciess.push(species);
		return species;
	}

	@stateChange
	removeFromSpecies() {
	}

	isEnded() {
		return this.gameStage === GAME_STAGE_ENDED_DEATH || this.gameStage === GAME_STAGE_ENDED_TIMEOUT;
	}
	
	getSpecies(id) {
		return this.speciess.find(species => species.id === id);
	}

	getSpeciesForPlayer(playerId) {
		return this.speciess.filter(species => species.playerId === playerId);
	}

	getMySpecies() {
		return this.getSpeciesForPlayer(this.myPlayerId);
	}

	getPlayer(playerId) {
		return this.players.find(player => player.id === playerId);
	}

	getMyPlayer() {
		return this.getPlayer(this.myPlayerId);
	}

	getMyMutations() {
	  let mutatedSpecies;
	  let mutatingSpecies = this.getMySpecies().find(s=> s.mutatingTo !== null);
	  if (mutatingSpecies) {
	  	mutatedSpecies = this.getSpecies(mutatingSpecies.mutatingTo);
	  	return {
	  		mutatingSpecies: mutatingSpecies,
	  		mutatedSpecies: mutatedSpecies
	  	}
	  }
	  else {
	  	return {
			mutatingSpecies: null,
	  		mutatedSpecies: null  		
	  	}
	  }
	}

	@stateChange
	placeUnit(pos, speciesId) {
		this.simulation.immediateDispatch({
			type: "ADD_UNIT",
			x: pos.x,
			y: pos.y,
			playerId: this.myPlayerId,
			speciesId: speciesId,
			id: uuid.v1()                
		})

		// now place the ais
		let aiPlayers = this.players.filter(player => player.id !== this.myPlayerId);
		aiPlayers.forEach(player=> {
			let species = this.getSpeciesForPlayer(player.id);
			this.simulation.immediateDispatch({
				type: "ADD_UNIT",
				x: 250,
				y: 450,
				playerId: player.id,
				speciesId: species[0].id,
				id: uuid.v1()                
			})
		})

		this.gameStage = GAME_STAGE_READY_TO_START;

	}

	dealMutations() {
		this.players.forEach(player => { 
			let dealt = player.dealMutation();
			if (player === this.myPlayer && dealt) {
				this.nm.notify({
					type: "DEAL_MUTATION",
					msg: "New Mutation Received!"
				});			
			} 
		});
	}
	
	@stateChange
	applyMutation (ancestorSpeciesId, newDna) {
		let ancestorSpecies = this.getSpecies(ancestorSpeciesId);
		let newSpecies = this.addSpecies(newDna, ancestorSpecies.playerId);
		ancestorSpecies.mutatingTo = newSpecies.id;
    }

    @stateChange
    stopMutation (ancestorSpeciesId) {
    	let ancestorSpecies = this.getSpecies(ancestorSpeciesId);
    	ancestorSpecies.mutatingTo = null;
    }

    @stateChange
    playerOut(playerId) {
    	let player = this.players.find(player=> player.id === playerId);
    	player.goOut();
		let stillIn = this.players.filter(player => !player.isOut);
		if (stillIn.length < 2) {
			this.endedEarly = true;
			this.endGame();
		}
    }

    @stateChange
    speciesOut(speciesId) {
    	let species = this.speciess.find(species => species.id === speciesId);
    	this.nm.notify({
    		type: "SPECIES_OUT",
    		msg: "A species has just died!",
    		species: species
    	});
    }

    @stateChange
    timeOut() {
    	this.endGame();
    }

    @stateChange
    endGame() {
    	
    	let stillIn = this.players.filter(player => !player.isOut);
    	console.log("Still in", this.players);
    	if (stillIn.length === 1) {
    		this.gameStage = GAME_STAGE_ENDED_DEATH;
    		this.winner = stillIn[0];
    	}

    	else if (stillIn.length > 1) {
    		this.gameStage = GAME_STAGE_ENDED_TIMEOUT;
    		this.winner = _.max( stillIn, p => p.getScore() );
    	}

    	else {
    		throw new Error("Spawnia: No players on end game!");
    	}

    	console.log("The winner issss...", this.winner);
    	this.simulation.pause();
    }

    @stateChange
	run() {
		this.gameStage = GAME_STAGE_WATCHING;
		this.simulation.reset();
		this.simulation.start();	
		this.nm.notify({
			type: "GAME_STARTED",
			msg: "The game has begun!"
		})
	}
}

