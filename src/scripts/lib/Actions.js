

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

import { 
	ENERGY_COST_PER_CELL, 
	FOOD_GROWTH_RATE, 
	FOOD_EAT_RATE, 
	MATURATION_TIME 
} from "../settings"

import {
	COLLISION_CATEGORY_DEFAULT,
	COLLISION_CATEGORY_UNITS,
	MAP_OBJ_FOOD
} from "../constants"


function runAction(action, universe, dispatch) {

	switch (action.type) {

		case "BUILD_WORLD":

			const props = {
				isStatic: true,
				restitution: 1,
				collisionFilter: {
	                category: COLLISION_CATEGORY_DEFAULT,
	                mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_UNITS
	            }
            }

			var barrier = Bodies.rectangle(500, 300, 20, 200, props);
			var barrier2 = Bodies.circle(200, 300, 20, props);
			var barrier3 = Bodies.circle(100, 400, 30, props);
			var barrier4 = Bodies.rectangle(200, 200, 20, 200, props);


			var offset = 20;
			var mapWidth = 1200;
			var mapHeight = 600;

			const propsBarriers = {
				isStatic: true,
				restitution: 1,
				collisionFilter: {
	                category: COLLISION_CATEGORY_DEFAULT,
	                mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_UNITS
	            },
	            render: {
					fillStyle: "#367d00",
					strokeStyle: "#367d00",
					wireframes: true
				}
            }

			let bodies = [barrier, barrier2, barrier3, barrier4, 
				Bodies.rectangle(mapWidth/2, -offset, mapWidth + 2 * offset, 50.5, propsBarriers),
				Bodies.rectangle(-offset, mapHeight/2, 50.5, mapHeight + 2 * offset, propsBarriers)
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
			
			let dna = DNA.decodeDna(action.DNA);
			let body = UnitBuilder.buildSeedCell(dna, action.x, action.y);
			let unit = new Unit(body, action.id);

			unit.spawn(dna, [], null, action.bornAt);
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
			const cells = UnitBuilder.buildAllCells(unit.DNA);
			const cellBodies = UnitBuilder.buildCellBodies(cells, unit.body.position.x, unit.body.position.y);
            const newBody = UnitBuilder.buildParentBody(cellBodies);
	    	unit.mature(cells);            
			universe.replaceMapObjectBody(unit.id, newBody);
	    	
	    	Body.setVelocity(newBody, v);
			universe.addToSpecies(unit);
	    	
			
		    //let parts = _.partition(unit.cells, (cell) => cell.type === "G");
	    	return;
	    }


	    case "START_REPRODUCE": {
	    	const unit = universe.getMapObject(action.unitId);
   		    if (!unit) return;
   		   	const cell = unit.cells[action.cellIndex];
   		   	if (unit.energy <= (action.energyCost * 2)) {
		      return false;
		    }
    		unit.energy = unit.energy - action.energyCost;
    		cell.isReproducing = true;
	    	return;
	    }
	   	case "REPRODUCE_UNIT": {
   		    /*
   		    var cell = unit.cells[action.cellIndex];
		    var newUnit = new Unit();

		    // Save the child-parent connection for stats
		    unit.addChild(newUnit);

		    // Get the Matter JS body object
		    var unitBody = newUnit.spawn(action.dna, cell.body.position.x, cell.body.position.y);

		    Body.setVelocity(unitBody, {
		      x: Math.cos(unit.body.angle + cell.angle),
		      y: Math.sin(unit.body.angle + cell.angle)         
		    });

		    World.add(universe.world, unitBody);
		    // Add it to the world
		    
		    universe.addUnit(newUnit);
		    */


		    const { unitId, cellIndex, newId, dna, timestamp } = action;

			let unit = universe.getMapObject(unitId);
   		    if (!unit) return;

		    let cell = unit.cells[cellIndex];

		    if (!cell) {
		    	throw("For some reason the cell tryibg to reproduce is null:", unit.cells, cellIndex);
		    	return;
		    }
		    cell.isReproducing = false;

			let decodedDna = DNA.decodeDna(dna);
			let cellBody = unit.getCellBody(cellIndex);
			let body = UnitBuilder.buildSeedCell(decodedDna, cellBody.position.x, cellBody.position.y);

			Body.setVelocity(body, {
		      x: Math.cos(unit.body.angle + cell.angle),
		      y: Math.sin(unit.body.angle + cell.angle)         
		    });

			/*
			Body.setPosition(body, {
		      x: cell.body.position.x,
		      y: cell.body.position.y       
		    });
		    */

			//console.log("The unit body", body);
			let newUnit = new Unit(body, newId);
			newUnit.spawn(decodedDna, [], unit, timestamp);
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
			const body = UnitBuilder.buildFood(action.x, action.y);
			const food = new Food(body, action.id, {
				amount: action.amount
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

