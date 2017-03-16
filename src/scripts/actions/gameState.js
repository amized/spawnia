
import { 
	GAME_STAGE_NOGAME, 
	GAME_STAGE_BUILDINGSPECIES, 
	GAME_STAGE_PLACESPECIES,
	GAME_STAGE_WATCHING
} from "../constants"


export function startGame() {
	return {
		type: "SET_GAME_STAGE",
		value: GAME_STAGE_BUILDINGSPECIES

	}
}

export function startSpeciesPlacement(species) {
	return {
		type: "START_SPECIES_PLACEMENT",
		value: GAME_STAGE_PLACESPECIES,
		species: species
	}
}