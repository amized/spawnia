
import { 
	GAME_STAGE_NOGAME, 
	GAME_STAGE_BUILDINGSPECIES, 
	GAME_STAGE_PLACESPECIES,
	GAME_STAGE_WATCHING
} from "../constants"


const initialGameState = {
	gameStage: GAME_STAGE_NOGAME,
	players: [{
		isAi: false,
		name: "Player 1"
	}],

}

export default function gameState(state=initialGameState, action) {
	switch(action.type) {

		case "SET_GAME_STAGE": {
			return Object.assign({}, state, {
				gameStage: action.value
			})
		}

		case "START_SPECIES_PLACEMENT": {
			return Object.assign({}, state, {
				gameStage: GAME_STAGE_PLACESPECIES,
				speciesToPlace: action.species
			})

		}

		default: {
			return state;
		}
	}
}