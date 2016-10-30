

import Unit from "./Unit"
import DNA from "./DNA"
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
  bodyColor: "#95969e",
  onCreate: function(cell, unit) {
    unit.body.frictionAir = Math.min(unit.body.frictionAir + 0.1, 1);
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

    let cellIndex = unit.cells.indexOf(cell);
    let dna = DNA.copyDNA(unit.DNA);

    dispatch({
      type: "START_REPRODUCE",
      unitId: unit.id,
      cellIndex: cellIndex,
      energyCost: energyCost,
    });

    dispatch({
      type: "REPRODUCE_UNIT",
      unitId: unit.id,
      cellIndex: cellIndex,
      dna: dna
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