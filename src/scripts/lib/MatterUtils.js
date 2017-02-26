
import {
	MAP_OBJ_FOOD,
	MAP_OBJ_UNIT,
	MAP_OBJ_GENERAL
} from "../constants"

// Takes world state and applies it to the world

export function mapStateToWorld(state, world) {
	

	let i;

	let mapObjects = state.mapObjects;

	for (i = 0; i < mapObjects.length; i++) {

		let mapObj = mapObjects[i];

		// check if body exists
		
		
		
		switch (mapObj.type) {

			case MAP_OBJ_FOOD:



		}



	}



}