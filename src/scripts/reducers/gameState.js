
import { 
	GAME_STAGE_NOGAME, 
	GAME_STAGE_BUILDINGSPECIES, 
	GAME_STAGE_PLACESPECIES,
	GAME_STAGE_READY_TO_START,
	GAME_STAGE_WATCHING,
	GAME_STAGE_ENDED
} from "../constants"

import Species from "../lib/species";

const initialGameState = {
	gameStage: GAME_STAGE_NOGAME,
	species: [],
	players: [],
	myPlayer: null
}



const testGameState = {
	gameStage: GAME_STAGE_WATCHING,
	species: [],
	players: [{
			id: 0,
			name: "Player 1",
			mutations: [1, 1, 1],
			maxMutations: 3,
			score: 0
		},
		{
			id: 1,
			name: "Player 2",
			mutations: [1],
			maxMutations: 3,
			score: 0
		}				
	],
	myPlayer: 0	
}


const playerColors = [
	"FF2929",
	"316FC9",
	"32C643",
	"F4E23D"
]


function players(state, action) {


	switch (action.type) {


		case "NEW_GAME": {
			let { numPlayers } = action;
			let players = [];
			for (let i = 0; i < numPlayers; i++) {
				players.push({
					color: playerColors[i],
					id: i,
					name: "Player " + i,
					species: [],
					mutations: [],
					maxMutations: 3,
					score: 0,
					isOut: false
				})
			}
			return players
		}

		case "DEAL_MUTATIONS": {
			let players = state.slice();
			players.forEach((player) => {
				if (player.mutations.length < player.maxMutations) {
					player.mutations.push(1);
				}
				
			})
			return players
		}

		case "PLAYER_OUT": {
			let players = state.slice();
			let { playerId, endGame } = action;
			let player = players.find(p => p.id === playerId);
			player.isOut = true;
			return players;
		}

		default: {
			return state;
		}
	}
}

function species(state, action) {


	switch(action.type) {

		case "NEW_GAME": {
			return []
		}

		case "SAVE_INIT_SPECIES": {
			const { playerId, species, speciesId } = action;
			const newSpeciesList = state.slice();
			species.playerId = playerId;
			species.id = speciesId;
			newSpeciesList.push(species);
			return newSpeciesList;
		}

		case "ADD_SPECIES": {
			const { playerId, species, speciesId } = action;
			const newSpeciesList = state.slice();
			species.playerId = playerId;
			species.id = speciesId;
			newSpeciesList.push(species);
			return newSpeciesList;
		}

		case "ADD_TO_SPECIES": {
			const { speciesId } = action;
			const newSpeciesList = state.slice();
			let species = newSpeciesList.find(s => s.id === speciesId);
			species.unitIsBorn();
			return newSpeciesList;
		}

		case "REMOVE_FROM_SPECIES": {
			const { speciesId } = action;
			const newSpeciesList = state.slice();
			let species = newSpeciesList.find(s => s.id === speciesId);
			species.unitDies();
			return newSpeciesList;
		}

		case "APPLY_MUTATION": {
			let { type, ancestorSpeciesId, newDna, newSpeciesId } = action;
			const newSpeciesList = state.slice();
			let ancestorSpecies = newSpeciesList.find(s => s.id === ancestorSpeciesId);
			let newSpecies = new Species(newDna);

			ancestorSpecies.mutatingTo = newSpeciesId;
			newSpecies.id = newSpeciesId;
			newSpecies.playerId = ancestorSpecies.playerId;
			newSpeciesList.push(newSpecies);
			
			return newSpeciesList;
		}


		default: {
			return state;
		}
	}	


}

function gameStage(state, action) {
	switch(action.type) {

		case "NEW_GAME": {
			return GAME_STAGE_BUILDINGSPECIES
		}

		case "PLAYER_OUT": {
			return action.endGame ? GAME_STAGE_ENDED : state;
		}

		case "SET_GAME_STAGE": {
			return action.value
		}

		case "START_SPECIES_PLACEMENT": {
			return GAME_STAGE_PLACESPECIES
		}

		default: {
			return state;
		}
	}	
}

function myPlayer(state, action) {
	
	switch(action.type) {
		case "NEW_GAME": {
			return 0
		}
	}
	
	return state;
}

export default function gameState(state=initialGameState, action) {	

	switch(action.type) {
		case "MOCK_GAME_1": {
			return testGameState
		}
		default: {
			return {
				players: players(state.players, action),
				gameStage: gameStage(state.gameStage, action),
				species: species(state.species, action),
				myPlayer: myPlayer(state.myPlayer, action)
			}			
		}
	}
}