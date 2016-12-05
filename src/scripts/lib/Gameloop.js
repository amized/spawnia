import { 
	MAP_OBJ_UNIT, 
	MAP_OBJ_FOOD,
	LIFESTATE_CHILD 
} from "../constants"

import {
	MATURATION_TIME
} from "../settings"


import CellTypes from "./CellTypes"
import UnitBuilder from "./UnitBuilder"


import { Query } from "matter-js"

const Gameloop = {

	// Do not mutate state, for looking only
	// Make changes using dispatch()
	onStep: (state, dispatch) => {

		const units = state.mapObjects.filter(obj => obj.type === MAP_OBJ_UNIT);
		const now = Date.now();

		dispatch({
			type: "UPDATE_UNITS_ENERGY"
		});

		dispatch({
			type: "GROW_ALL_FOOD"
		});


		units.forEach((unit, index) => {
			if (unit) {

				// Maturing
				if (unit.lifeState === LIFESTATE_CHILD && (now - unit.bornAt) > MATURATION_TIME) {

					let age = now - unit.bornAt;

					let currBody = unit.body;
			    	let newBody = UnitBuilder.buildBody(
			    		unit.DNA, 
			    		currBody.position.x, 
			    		currBody.position.y
			    	);

			    	// Check collision
			    	var bounds  = newBody.bounds;
					var intruding = Query.region(state.world.bodies, bounds);
					intruding = intruding.filter((body)=>{
						let [type,id] = body.label.split(":");
						return type !== MAP_OBJ_FOOD;
					});

					if (intruding.length > 1) {
						if (age > MATURATION_TIME + 5000) {
							dispatch({
						    	type: "KILL_UNIT",
						    	unitId: unit.id
						    });
						} 
						return;
					}
					else {
						dispatch({
					    	type: "MATURE_UNIT",
					    	unitId: unit.id
					    });						
					}
				}

				// Go through the cells
				unit.cells.forEach((cell, index) => {
					var cellType = CellTypes[cell.type];
					var cellBody = unit.body.parts[index+1];
					if (cellType) {
						cellType.onStep(cell, cellBody, unit, state, dispatch);
					}
				});
				// Check for any dead
				if (unit.energy <= 0) {
					dispatch({
						type: "KILL_UNIT",
						unitId: unit.id
					})
				}
			}
		});

		// Update the food
		/*
		var foods = universe.foods;

		foods.forEach((food, index)=>{
			food.grow(FOOD_GROWTH_RATE);
		});
		return;
		*/

	}

};



export default Gameloop