

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
  REPRODUCTION_COST_THRESHOLD
} from "../settings"

import { MAP_OBJ_FOOD, ALLOWED_CELLTYPE_ANY } from "../constants";
import { msToSteps } from "./Utils/utils";
import speciesManager from "./speciesManager";

const CellTypes = {}


CellTypes.S = {
  name: "Seed",
  id: "S",
  bodyColor: "#333",
  connections: [
    true,
    true,
    true,
    true
  ],
  allowedChildCellTypes: ALLOWED_CELLTYPE_ANY
}


// X-joint
CellTypes.X = {
  name: "X-joint",
  id: "X",
  bodyColor: "#CCCCCC",
  connections: [
    true,
    true,
    true
  ],
  allowedChildCellTypes: ALLOWED_CELLTYPE_ANY
}



// Grounding cell
CellTypes.G = {
  name: "Grounding",
  id: "G",
  bodyColor: "#95969e",
  onCreate: function(cell, unit) {
    unit.body.frictionAir = Math.min(unit.body.frictionAir + 0.1, 1);
  }
}



CellTypes.E = {
  name: "Eat",
  id: "E",
  bodyColor: "#b2d572",
  onStep: function (step, cell, cellBody, unit, state, dispatch) {

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
  onStep: function (step, cell, cellBody, unit, state, dispatch) {
    /*
    if (cell.isReproducing === true) {
      return;
    }
  */
    const reproductionTime = unit.species.reproductionTime;
    const reproductionSteps = msToSteps(reproductionTime);
    const cellIndex = unit.cells.indexOf(cell);
    const startedReproductionAt = cell.startedReproductionAt;
    
    if (!startedReproductionAt) {
      const energyCost = UNIT_START_ENERGY_PER_CELL * unit.cells.length;

      // You can't kill yourself to reproduce
      if (unit.energy <= (energyCost * REPRODUCTION_COST_THRESHOLD)) {
        return false;
      }

      dispatch({
        type: "START_REPRODUCE",
        unitId: unit.id,
        cellIndex: cellIndex,
        energyCost: energyCost
      });

      return;
    }


    if (startedReproductionAt < step - reproductionSteps) {
      let dna = speciesManager.getSpecies(unit.speciesId).dna;
      dispatch({
        type: "REPRODUCE_UNIT",
        unitId: unit.id,
        cellIndex: cellIndex,
        newId: uuid.v1(),
        dna: dna.getEncodedDna(),
        bornAt: step
      });

      return;
    }
  }
}

CellTypes.F = {
  name: "Fat",
  id: "F",
  bodyColor: "#e4d088"
}


export default CellTypes