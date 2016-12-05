

import Unit from "./Unit"
import DNA from "./DNA"
import uuid from "uuid"
import { Body, Query, Composite, Vector, World } from "matter-js"
import { 
  ENERGY_COST_PER_CELL, 
  FOOD_GROWTH_RATE, 
  FOOD_EAT_RATE, 
  MATURATION_TIME, 
  REPRODUCTION_COST_PER_CELL,
  UNIT_START_ENERGY_PER_CELL,
  FOOD_RADIUS,
  REPRODUCTION_TIME,
} from "../settings"

import { MAP_OBJ_FOOD } from "../constants";

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
  onStep: function (cell, cellBody, unit, state, dispatch) {

    return;

    // Can't eat if we're full
    if (unit.energy >= unit.energyStorage) {
      return;
    }

    // Check if theres any food in our vacinity
    var foodsBodies = state.mapObjects.filter(obj=>obj.type = MAP_OBJ_FOOD).map(obj=>obj.body);   
    let intersecting = Query.point(foodsBodies, cellBody.position);

    if (intersecting.length > 0) {
      // Choose the first intersecting, cannot eat more than once at one time
      let [type,foodId] = intersecting[0].label.split(":");
      dispatch({
        type: "EAT",
        foodId: foodId,
        unitId: unit.id,
        amount: FOOD_EAT_RATE
      });
    }

    intersecting.forEach((foodBody)=> {


    });

  }
}



CellTypes.R = {
  name: "Reproduce",
  id: "R",
  bodyColor: "#cb8dbd",
  onStep: function (cell, cellBody, unit, state, dispatch) {

    if (cell.isReproducing)
      return;
    /*
    if (Object.keys(universe.units).length > 100) {
      return;
    }
    */
    
    var energyCost = UNIT_START_ENERGY_PER_CELL * unit.cells.length;
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
      newId: uuid.v1(),
      dna: DNA.encodeDna(dna),
      timestamp: Date.now() + REPRODUCTION_TIME
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