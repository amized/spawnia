
import { 
	GAME_STAGE_NOGAME, 
	GAME_STAGE_BUILDINGSPECIES, 
	GAME_STAGE_PLACESPECIES,
	GAME_STAGE_WATCHING
} from "../constants"


export function startSpeciesBuild() {
	return {
		type: "SET_GAME_STAGE",
		value: GAME_STAGE_BUILDINGSPECIES

	}
}

export function newGame() {
	return {
		type: "NEW_GAME",
		numPlayers: 2
	}
}

export function startSpeciesPlacement(species) {
	return {
		type: "START_SPECIES_PLACEMENT",
		value: GAME_STAGE_PLACESPECIES,
		species: species
	}
}

export function startSimulation() {
	return {
		type: "SET_GAME_STAGE",
		value: GAME_STAGE_WATCHING
	}
}