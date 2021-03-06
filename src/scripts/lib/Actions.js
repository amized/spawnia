

// Define all method that do something to the world


import { World, Body, Bodies, Composite, Constraint, Query } from "matter-js"
import Unit from "./Unit";
import Food from "./Food";
import Species from "./Species";
import MapObject from "./MapObject"
import Cell from "./Cell";
import CellTypes from "./CellTypes";
import DNA from "./DNA";
import UnitBuilder from "./UnitBuilder";
import { buildStaticCircle, buildStaticBlock } from "./MapBuilder";
import _ from "underscore";
import { getAngleOfDirection } from "./Geometry";
import { getPlayerScore, getPlayersStillIn } from "./Utils/storeUtils";
import { updateOnce } from '../../../../react-oo';

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


function runAction(action, universe, currStep, store, game) {
			
	switch (action.type) {

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

				    let eatIndex = 0;
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
					      	amount: FOOD_EAT_RATE,
					      	eatIndex: eatIndex++
					      })
					  	}
					});
				}
			});

			// Sort the eats by eatIndex. This makes sure the eats are distributed fairly
			// so all units get their first round of eating before anyone gets their second.
			eats = _.sortBy(eats, 'eatIndex');

			// Run the eats
			
			eats.forEach(eat => {
				const unit = eat.unit;
				const food = universe.getMapObject(eat.foodId);

				if (unit && food && food.amount > 0) {
			      // Can only eat up to the amount of storage we have left, or
			      // the amount of food available
		          let amount = Math.min(food.amount, eat.amount, unit.energyStorage - unit.energy);
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

		case "ADD_UNIT": {
			
			const { dna, x, y, playerId, speciesId } = action;
			//const gameState = store.getState().gameState;
			const species = game.getSpecies(speciesId);
			console.log("trying to add unit", species);
			if (!species) {
				return false;
			}

			let body = UnitBuilder.buildSeedCell(x, y);
			let unit = new Unit(body, action.id);

			unit.spawn(species, [], null, currStep);
			//console.log("World before add unit", universe.world.bodies.map(body=>body.id));
			universe.add(unit);
			let player = game.getPlayer(species.playerId);
			player.updateScore(game);
			/*
			store.dispatch({
				type: "ADD_TO_SPECIES",
				speciesId: speciesId
			})
			*/

			//console.log("World after add unit", universe.world.bodies.map(body=>body.id));
			return;
		}

		case "MATURE_UNIT": {
			let unit = universe.getMapObject(action.unitId);
			if (!unit) {
				return;
			}
	    	const v = unit.body.velocity;
			const species = unit.getSpecies();
			const newBody = UnitBuilder.buildBody(species.dna, unit.body.position.x, unit.body.position.y);

	    	unit.mature(newBody);	    	      
			universe.replaceMapObjectBody(unit.id, newBody);

			Body.setMass(newBody, 20);
	    	Body.setVelocity(newBody, v);

	    	let player = game.getPlayer(species.playerId);
			player.updateScore(game);
			
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

		    const { unitId, cellIndex, newId, bornAt, speciesId } = action;

			let unit = universe.getMapObject(unitId);
   		    if (!unit) return;
		    let species =  game.getSpecies(speciesId);
		    if (!species) return;
		    let cell = unit.cells[cellIndex];

		    if (!cell) {
		    	throw("For some reason the cell tryibg to reproduce is null:", unit.cells, cellIndex);
		    	return;
		    }
		    
		    cell.startedReproductionAt = null;

			let cellBody = unit.getCellBody(cellIndex);
			let body = UnitBuilder.buildSeedCell(cellBody.position.x, cellBody.position.y);
			let angle = getAngleOfDirection(cell.direction);
			
			Body.setVelocity(body, {
		      x: Math.cos(unit.body.angle + angle),
		      y: Math.sin(unit.body.angle + angle)         
		    });

			//console.log("The unit body", body);
			let newUnit = new Unit(body, newId);
			newUnit.spawn(species, [], unit, bornAt);
			universe.add(newUnit);

			let player = game.getPlayer(species.playerId);
			player.updateScore(game);

			/*
			store.dispatch({
				type: "ADD_TO_SPECIES",
				speciesId: species.id
			})
			*/
		    return;
		}

		case "APPLY_MUTATION": {

			let { ancestorSpeciesId, newDna, numChanges } = action;
			game.applyMutation(ancestorSpeciesId, newDna, numChanges);
			return;
		}

		case "STOP_MUTATION": {
			let { ancestorSpeciesId } = action;
			game.stopMutation(ancestorSpeciesId);
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
			const unit = universe.getMapObject(action.unitId);
			if (unit) {

				const species = unit.species;
				species.unitDies(unit.isMature()); 
				unit.energy = 0;
				universe.deleteUnit(unit);
				let player = game.getPlayer(species.playerId);
				player.updateScore(game);
				if (!species.isAlive()) {
					let score = player.getScore();
					if (score === 0) {
						game.playerOut(unit.species.playerId);
					}
					else {
						game.speciesOut(unit.species.id);
					}
				}

			}
			return;
		}

		case "STEP_UNIT":
			// Get the unit
			var unit = action.unit;

			unit.energy = unit.energy - (unit.cells.length * ENERGY_COST_PER_CELL);

			return;

		case "ADD_STATIC_BLOCK": {

			const { x, y, width, height } = action;
			const props = {
				isStatic: true,
				restitution: 1,
				collisionFilter: {
		            category: COLLISION_CATEGORY_UNITS
		            //mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_UNITS
		        }
		    }

		    const m = new MapObject(Bodies.rectangle(x, y, width, height, props), -1);
			universe.add(m);
			return
		}

		case "ADD_STATIC_BLOCK": {
			const { x, y, width, height } = action;
			const m = new MapObject(buildStaticBlock(x, y, width, height), -1);
			universe.add(m);			
			return
		}
		case "ADD_STATIC_CIRCLE": {
			const { x, y, r } = action;
			const m = new MapObject(buildStaticCircle(x, y, r), -1);
			universe.add(m);			
			return
		}

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

export default updateOnce(runAction);

