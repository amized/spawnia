

import Unit from "./Unit"
import { Body, Query, Composite, Vector, World } from "matter-js"
import { 
  ENERGY_COST_PER_CELL, 
  FOOD_GROWTH_RATE, 
  FOOD_EAT_RATE, 
  MATURATION_TIME, 
  REPRODUCTION_COST_PER_CELL,
  UNIT_START_ENERGY_PER_CELL,
  FOOD_RADIUS,
  REPRODUCTION_TIME
} from "../settings"


const CellTypes = {}


// Bone
CellTypes.B = {
  name: "Bone",
  id: "B",
  bodyColor: "#FFF",
  onStep: function (cell, unit, universe) {
    return;
  }
}



CellTypes.S = {
  name: "Seed",
  id: "S",
  bodyColor: "#333",
  onStep: function (cell, unit, universe) {
    return;
  }
}


// Grounding cell
CellTypes.G = {
  name: "Grounding",
  id: "G",
  bodyColor: "#733a00",
  onCreate: function(cell, unit) {
    console.log("setting static...");
    let body = cell.body;
    body.frictionAir = 100;
    Body.setStatic(body);
    console.log(cell.body);
  },
  onStep: function (cell, unit, universe) {
    return;
  }
}



CellTypes.E = {
  name: "Eat",
  id: "E",
  bodyColor: "#b2d572",
  onStep: function (cell, unit, universe, dispatch) {
    
    // Can't eat if we're full
    if (unit.energy >= unit.energyStorage) {
      return;
    }

    // Check if theres any food in our vacinity
    var foodsBodies = universe.getFoodBodies();   
    let intersecting = Query.point(foodsBodies, cell.body.position);

    if (intersecting.length > 0) {
      let numEatIntervals = 4 // number of eats till the next tick, to spread
      for (var i =0; i< numEatIntervals; i++) {
        dispatch({
          type: "EAT",
          foodId: intersecting[0].owner.id,
          unitId: unit.id,
          amount: FOOD_EAT_RATE/numEatIntervals
        }, i*(1000/numEatIntervals));
      }
    }

    intersecting.forEach((foodBody)=> {


    });

  }
}



CellTypes.R = {
  name: "Reproduce",
  id: "R",
  bodyColor: "#cb8dbd",
  onStep: function (cell, unit, universe, dispatch) {

    if (cell.isReproducing)
      return;
    /*
    if (Object.keys(universe.units).length > 100) {
      return;
    }
    */
    
    var energyCost = UNIT_START_ENERGY_PER_CELL * unit.getCellCount();
    // You can't kill yourself to reproduce
    if (unit.energy <= (energyCost * 2)) {
      return false;
    }

    unit.energy = unit.energy - energyCost;
    cell.isReproducing = true;

    dispatch({
      type: "REPRODUCE_UNIT",
      unit: unit,
      cell: cell
    }, REPRODUCTION_TIME);

  }
}

CellTypes.F = {
  name: "Fat",
  id: "F",
  bodyColor: "#e4d088",
  onStep: function (cell, unit, universe, dispatch) {
    return;
  }
}


export default CellTypes