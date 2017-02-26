

// Define all method that do something to the world


import { World, Body, Bodies, Composite, Constraint, Query } from "matter-js"
import Unit from "./Unit";
import Food from "./Food";
import MapObject from "./MapObject"
import Cell from "./Cell";
import CellTypes from "./CellTypes";
import DNA from "./DNA";
import UnitBuilder from "./UnitBuilder";
import _ from "underscore";
import speciesManager from "./speciesManager";
import { getAngleOfDirection } from "./Geometry";


import { 
	ENERGY_COST_PER_CELL, 
	FOOD_GROWTH_RATE, 
	FOOD_EAT_RATE, 
	MATURATION_TIME,
	REPRODUCTION_COST_THRESHOLD
} from "../settings"

import {
	COLLISION_CATEGORY_DEFAULT,
	COLLISION_CATEGORY_UNITS,
	MAP_OBJ_FOOD
} from "../constants"


function runAction(action, universe, currStep) {

	switch (action.type) {

		case "BUILD_WORLD":

			const props = {
				isStatic: true,
				restitution: 1,
				collisionFilter: {
	                category: COLLISION_CATEGORY_UNITS
	                //mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_UNITS
	            }
            }

			var barrier = Bodies.rectangle(500, 300, 20, 200, props);
			var barrier2 = Bodies.circle(200, 300, 20, props);
			var barrier3 = Bodies.circle(100, 400, 30, props);
			var barrier4 = Bodies.rectangle(200, 200, 20, 200, props);


			var offset = 20;
			var boundsWidth = 50;
			var mapWidth = universe.getMapSize().width;
			var mapHeight = universe.getMapSize().width;

			const propsBarriers = {
				isStatic: true,
				restitution: 1,
				collisionFilter: {
	                category: COLLISION_CATEGORY_UNITS
	            },
	            render: {
					fillStyle: "#999",
					strokeStyle: "#999",
					wireframes: true
				}
            }

			let bodies = [barrier, barrier2, barrier3, barrier4, 
				// top
				Bodies.rectangle(mapWidth/2, 0, mapWidth, boundsWidth, propsBarriers),
				
				// bottom
				Bodies.rectangle(mapWidth/2, mapHeight, mapWidth, boundsWidth, propsBarriers),

				// left
				Bodies.rectangle(0, mapHeight/2, boundsWidth, mapHeight, propsBarriers),
				
				// right
				Bodies.rectangle(mapWidth, mapHeight/2, boundsWidth, mapHeight, propsBarriers)
			];


			/*
	        World.add(universe.world, [
	            Bodies.rectangle(mapWidth/2, -offset, mapWidth + 2 * offset, 50.5, { isStatic: true, render: render }),
	            //Bodies.rectangle(mapWidth/2, mapHeight + offset, mapWidth + 2 * offset, 50.5, { isStatic: true, render: render }),
	            //Bodies.rectangle(mapWidth + offset, mapHeight/2, 50.5, mapHeight + 2 * offset, { isStatic: true, render: render }),
	            Bodies.rectangle(-offset, mapHeight/2, 50.5, mapHeight + 2 * offset, { isStatic: true, render: render })
	        ]);

	        World.add(universe.world, [barrier, barrier2, barrier3, barrier4]);
			//World.add(universe.world, [ground, side, side2, top, barrier, barrier2, barrier3, barrier4]);
			*/
			bodies.forEach((body, index) => {
				const m = new MapObject(body, index);
				universe.add(m);
			});
			return;

		case "UPDATE_UNITS_ENERGY": {
			// Update all of the units
			let units = universe.getUnits();
			let eats = [];
			units.forEach((unit) => {
				if (unit) {
					// Update the units energy
					unit.energy = unit.energy - (unit.cells.length * ENERGY_COST_PER_CELL);

					// Consume foods
					// Can't eat if we're full
				    if (unit.energy >= unit.energyStorage) {
				      return;
				    }

					const eatCells = unit.cells.filter(cell=>cell.type === "E");
					eatCells.forEach((cell, index) => {
					    // Check if theres any food in our vacinity
					    const cellBody = unit.getCellBody(index);
					    const foodsBodies = universe.getFoods().map(food=>food.body);   
					    let intersecting = Query.point(foodsBodies, cellBody.position);

					    if (intersecting.length > 0) {
					      // Choose the first intersecting, cannot eat more than once at one time
					      let [type,foodId] = intersecting[0].label.split(":");
					      eats.push({
					      	foodId: foodId,
					      	unit: unit,
					      	amount: FOOD_EAT_RATE
					      })
					    }
					})
				}
			});

			// Run the eats
			eats.forEach(eat => {
				const unit = eat.unit;
				const food = universe.getMapObject(eat.foodId);

				if (unit && food && food.amount > 0) {
		          let amount = Math.min(food.amount, eat.amount);
		          amount = Math.min(amount, unit.energyStorage - unit.energy);
		          food.getConsumedBy(amount);
		          unit.energy = unit.energy + amount;
		        }
			})


			return;
		}

		case "GROW_ALL_FOOD": {
			// Update the food
			var foods = universe.getFoods();
			foods.forEach((food, index)=>{
				food.grow(FOOD_GROWTH_RATE);
			});

			return;
		}
		/*
		case "STEP":
			// Update all of the units
			for(var unitId in universe.units) {

				var unit = universe.units[unitId];
				if (unit) {
					// Update the units energy
					unit.energy = unit.energy - (unit.cells.length * ENERGY_COST_PER_CELL);
					if (unit.cells.length === 1) {
					}
					// Go through the cells
					unit.cells.forEach((cell, index) => {
						var cellType = CellTypes[cell.type];
						if (cellType) {
							cellType.onStep(cell, unit, universe, dispatch);
						}
					});

					if (unit.energy <= 0) {
						unit.energy = 0;
						dispatch({
							type: "KILL_UNIT",
							unitId: unit.id
						})
					}
				}


			}
			// Update the food
			var foods = universe.foods;

			foods.forEach((food, index)=>{
				food.grow(FOOD_GROWTH_RATE);
			});
			return;
		*/
		case "ADD_UNIT": {
			
			const { dna, x, y } = action;

			let dcdDna = DNA.decodeDna(dna);
			let body = UnitBuilder.buildSeedCell(dcdDna, x, y);
			let unit = new Unit(body, action.id);
			let speciesId = speciesManager.add(dna);
			unit.spawn(speciesId, [], null, currStep);
			//console.log("World before add unit", universe.world.bodies.map(body=>body.id));
			universe.add(unit);
			//console.log("World after add unit", universe.world.bodies.map(body=>body.id));
			return;
		}

		case "MATURE_UNIT": {
			let unit = universe.getMapObject(action.unitId);
			if (!unit) {
				return;
			}
	    	const v = unit.body.velocity;
			const cells = UnitBuilder.buildAllCells(speciesManager.getDecodedDna(unit.speciesId));
			const cellBodies = UnitBuilder.buildCellBodies(cells, unit.body.position.x, unit.body.position.y);
            const newBody = UnitBuilder.buildParentBody(cellBodies);
	    	unit.mature(cells, newBody);	    	      
			universe.replaceMapObjectBody(unit.id, newBody);

			Body.setMass(newBody, 20);
	    	Body.setVelocity(newBody, v);
			universe.speciesData.addToSpecies(unit);
	    	
			
		    //let parts = _.partition(unit.cells, (cell) => cell.type === "G");
	    	return;
	    }


	    case "START_REPRODUCE": {
	    	const { unitId, cellIndex, energyCost } = action;
	    	const unit = universe.getMapObject(unitId);
   		    if (!unit) return;

   		   	const cell = unit.cells[cellIndex];
   		   	if (unit.energy <= energyCost * REPRODUCTION_COST_THRESHOLD) {
   		   		return;
   		   	}
    		unit.energy = unit.energy - energyCost;
    		cell.startedReproductionAt = currStep;
	    	return;
	    }
	   	case "REPRODUCE_UNIT": {

		    const { unitId, cellIndex, newId, dna, bornAt } = action;

			let unit = universe.getMapObject(unitId);
   		    if (!unit) return;
   
		    let cell = unit.cells[cellIndex];

		    if (!cell) {
		    	throw("For some reason the cell tryibg to reproduce is null:", unit.cells, cellIndex);
		    	return;
		    }
		    
		    cell.startedReproductionAt = null;

		    let speciesId = speciesManager.add(dna);
			let decodedDna = speciesManager.getDecodedDna(speciesId);
			let cellBody = unit.getCellBody(cellIndex);
			let body = UnitBuilder.buildSeedCell(decodedDna, cellBody.position.x, cellBody.position.y);

			let angle = getAngleOfDirection(cell.direction);
			
			Body.setVelocity(body, {
		      x: Math.cos(unit.body.angle + angle),
		      y: Math.sin(unit.body.angle + angle)         
		    });

			//console.log("The unit body", body);
			let newUnit = new Unit(body, newId);
			newUnit.spawn(speciesId, [], unit, bornAt);
			universe.add(newUnit);
		    return;
		}

		case "EAT": {
			const unit = universe.getMapObject(action.unitId);
			const food = universe.getMapObject(action.foodId);

			if (unit && food && food.amount > 0) {
	          let amount = Math.min(food.amount, action.amount);
	          amount = Math.min(amount, unit.energyStorage - unit.energy);
	          food.getConsumedBy(amount);
	          unit.energy = unit.energy + amount;
	        }
			return;
		}

		case "KILL_UNIT": {
			console.log("Killing unit");
			const unit = universe.getMapObject(action.unitId);
			if (unit) {
				unit.energy = 0;
				universe.deleteUnit(unit);
			}
			return;
		}

		case "STEP_UNIT":
			// Get the unit
			var unit = action.unit;

			unit.energy = unit.energy - (unit.cells.length * ENERGY_COST_PER_CELL);

			return;


		case "ADD_FOOD": {
			const { amount, id, x, y } = action;
			const body = UnitBuilder.buildFood(x, y, amount);
			const food = new Food(body, id, {
				amount
			});
			universe.add(food);
			return;
		}

		case "CHANGE_SPECIES_NAME":
			console.log("Change specie name", action);
			universe.updateSpeciesName(action.encodedDna, action.value);
			return
		default:
			console.log("No action type found!");


	}





}

export default runAction;

