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
import DNA from "./DNA";

import { Query, Body } from "matter-js"
import { msToSteps } from "./Utils/utils";


const MATURATION_STEPS = msToSteps(MATURATION_TIME);

const Gameloop = {

	// Do not mutate state, for looking only
	// Make changes using dispatch()
	onStep: (step, state, dispatch) => {

		const units = state.mapObjects.filter(obj => obj.type === MAP_OBJ_UNIT);

		dispatch({
			type: "UPDATE_UNITS_ENERGY"
		});

		dispatch({
			type: "GROW_ALL_FOOD"
		});

		units.forEach((unit, index) => {
			if (unit) {

				// Maturing
				if (unit.lifeState === LIFESTATE_CHILD && (step - unit.bornAt) > MATURATION_STEPS) {

					let age = step - unit.bornAt;

					let currBody = unit.body;

			    	let sampleBody = unit.species.sampleBody;
			    	Body.setPosition(sampleBody, { x: currBody.position.x, y: currBody.position.y});
			    	// Check collision
			    	var bounds  = sampleBody.bounds;
					var intruding = Query.region(state.world.bodies, bounds);
					intruding = intruding.filter((body)=>{
						let [type,id] = body.label.split(":");
						return type !== MAP_OBJ_FOOD;
					});

					if (intruding.length > 1) {
						if (age > MATURATION_STEPS + msToSteps(5000)) {
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
					if (cellType && cellType.onStep) {
						cellType.onStep(step, cell, cellBody, unit, state, dispatch);
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
	}

};



export default Gameloop