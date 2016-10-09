

// Define all method that do something to the world


import { World, Body, Bodies, Composite, Constraint, Query } from "matter-js"
import Unit from "./Unit";
import Food from "./Food";
import CellTypes from "./CellTypes";
import DNA from "./DNA";
import UnitBuilder from "./UnitBuilder";

import { 
	ENERGY_COST_PER_CELL, 
	FOOD_GROWTH_RATE, 
	FOOD_EAT_RATE, 
	MATURATION_TIME 
} from "../settings"



function runAction(action, universe, dispatch) {

	switch (action.type) {

		case "BUILD_WORLD":

			var barrier = Bodies.rectangle(500, 300, 20, 200, { isStatic: true, restitution:1 });
			var barrier2 = Bodies.circle(200, 300, 20, { isStatic: true, restitution:1 });
			var barrier3 = Bodies.circle(100, 400, 30, { isStatic: true, restitution:1 });
			var barrier4 = Bodies.rectangle(200, 200, 20, 200, { isStatic: true, restitution:1 });


			var offset = 20;
			var mapWidth = 1200;
			var mapHeight = 600;
			console.log(mapHeight);
			let render = {
				fillStyle: "#367d00",
				strokeStyle: "#367d00",
				wireframes: true
			}
	        World.add(universe.world, [
	            Bodies.rectangle(mapWidth/2, -offset, mapWidth + 2 * offset, 50.5, { isStatic: true, render: render }),
	            Bodies.rectangle(mapWidth/2, mapHeight + offset, mapWidth + 2 * offset, 50.5, { isStatic: true, render: render }),
	            Bodies.rectangle(mapWidth + offset, mapHeight/2, 50.5, mapHeight + 2 * offset, { isStatic: true, render: render }),
	            Bodies.rectangle(-offset, mapHeight/2, 50.5, mapHeight + 2 * offset, { isStatic: true, render: render })
	        ]);

	        World.add(universe.world, [barrier, barrier2, barrier3, barrier4]);
			//World.add(universe.world, [ground, side, side2, top, barrier, barrier2, barrier3, barrier4]);
			return;

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
							unit: unit
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

		case "ADD_UNIT":
			// Create the unit object
			var unit = new Unit();

			// Get the Matter JS body object
			let unitBody = unit.build(action.DNA, action.x, action.y);
			
			// Add it to the world
		    World.add(universe.world, unitBody);

		    // Update the list of bodies
		    universe.addUnit(unit);

		    dispatch({
		    	type: "MATURE_UNIT",
		    	unit: unit
		    }, MATURATION_TIME);

			return;

		case "MATURE_UNIT":

			let currBody = action.unit.body;

	    	let newBody = UnitBuilder.buildBody(
	    		action.unit.DNA, 
	    		currBody.position.x, 
	    		currBody.position.y
	    	);

	    	// Check collision
	    	var bounds  = newBody.bounds;
			var intruding = Query.region(universe.world.bodies, bounds);
			intruding = intruding.filter((body)=>{
				return body.label !== "food";
			});

			if (intruding.length > 1) {
				action.unit.matureTries++;
				if (action.unit.matureTries > 3) {
					dispatch({
				    	type: "KILL_UNIT",
				    	unit: action.unit
				    });
				}
				else {
					dispatch({
				    	type: "MATURE_UNIT",
				    	unit: action.unit
				    }, 2000);
				}
				return false;
			}

			let v = currBody.velocity;
			World.remove(universe.world, currBody);
			universe.addToSpecies(action.unit);
	    	newBody = action.unit.mature();
	    	//
	    	Body.setVelocity(newBody, v);
	    	World.add(universe.world, newBody);
	    	
	    	return;

	   	case "REPRODUCE_UNIT":

   		    var unit = action.unit;
   		    var cell = action.cell;
		    var newUnit = new Unit();

		    // Save the child-parent connection for stats
		    unit.addChild(newUnit);

		    // Get the Matter JS body object
		    var unitBody = newUnit.build(DNA.copyDNA(unit.DNA), cell.body.position.x, cell.body.position.y);

		    // Apply correct render state
		    if (unit.body.render.isSelected) {
		    	newUnit.applySelected();
		    }

		    Body.setVelocity(unitBody, {
		      x: Math.cos(unit.body.angle + cell.angle),
		      y: Math.sin(unit.body.angle + cell.angle)         
		    })

		    // Add it to the world
		    World.add(universe.world, unitBody);
		    universe.addUnit(newUnit);
		    cell.isReproducing = false;

		    dispatch({
		      type: "MATURE_UNIT",
		      unit: newUnit
		    }, MATURATION_TIME);

		    return;

		case "EAT":
			var unit = universe.getUnit(action.unitId);
			var food = universe.getFood(action.foodId);

			if (unit && food.amount > 0) {
	          let amount = Math.min(food.amount, action.amount);
	          amount = Math.min(amount, unit.energyStorage - unit.energy);
	          food.getConsumedBy(amount);
	          unit.energy = unit.energy + amount;
	        }
			return;


		case "KILL_UNIT":
			// Get the unit
			var unit = action.unit;

			// Remove it from the world
			World.remove(universe.world, unit.body);

			// Delete the object
			universe.deleteUnit(unit);
			return;

		case "STEP_UNIT":
			// Get the unit
			var unit = action.unit;

			unit.energy = unit.energy - (unit.cells.length * ENERGY_COST_PER_CELL);

			return;


		case "ADD_FOOD":
			var food = new Food(action.amount);

			Body.setPosition(food.body, { x: action.x, y: action.y })

			World.add(universe.world, food.body);

			universe.foods.push(food);

			return;

		case "GROW_FOOD":
			var food = action.food;
			food.amount = food.amount + FOOD_GROWTH_RATE;
			return;

		case "CHANGE_SPECIES_NAME":
			console.log("Change specie name", action);
			universe.updateSpeciesName(action.encodedDna, action.value);
			return
		default:
			console.log("No action type found!");


	}





}

export default runAction;

