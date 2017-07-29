

import Unit from "./Unit"
import DNA from "./DNA"
import uuid from "uuid"
import { Body, Query, Composite, Vector, World } from "matter-js"
import { 
  ENERGY_COST_PER_CELL, 
  ENERGY_STORAGE_PER_FAT,
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

const CellTypes = {}


CellTypes.S = {
  name: "Seed",
  id: "S",
  bodyColor: "#333333",
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
  allowedChildCellTypes: ALLOWED_CELLTYPE_ANY,
  description: "The X joint allows you to connect an additional 3 cells."
}



// Grounding cell
CellTypes.G = {
  name: "Grounding",
  description: "The grounding cell will make your units to stick to the map, and slow to a halt if floating. " +
              "The more grounding cells your unit has over all, the stronger the slowing effect.",
  id: "G",
  bodyColor: "#95969e",
  connections: [
    ['G'],
    ['G'],
    ['G']
  ],
  onCreate: function(cell, unit) {
    unit.body.frictionAir = Math.min(unit.body.frictionAir + 0.1, 1);
  }
}



CellTypes.E = {
  name: "Eat",
  description: "Eating cells allow your units to consume energy from energy pods (the big circles on the map). " +
    "One eating cell will consume " + FOOD_EAT_RATE + " units of energy per cycle when it is placed over an energy pod.",
  id: "E",
  bodyColor: "#9ccb3b",
  connections: [
    ['E'],
    ['E'],
    ['E']
  ],

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
  description: "The reproduce cell is needed for your species to multiply. " +
    "Each cell requires energy and time to reproduce, both which are proportional to " +
    "the species's size. ",

  id: "R",
  bodyColor: "#d4519d",

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
      let dna, speciesId;
      if (unit.species.mutatingTo !== null) {
        speciesId = unit.species.mutatingTo;
      }
      else {
        dna = unit.species.dna;
        speciesId = unit.species.id;
      }
      
      dispatch({
        type: "REPRODUCE_UNIT",
        unitId: unit.id,
        cellIndex: cellIndex,
        newId: uuid.v1(),
        speciesId: speciesId,
        bornAt: step
      });

      return;
    }
  }
}

CellTypes.F = {
  name: "Fat",
  description: "Fat cells are needed for your units to store energy. Units cannot consume more " +
    "than the maximum energy storage. Each fat cell stores " + ENERGY_STORAGE_PER_FAT + " units of energy.",
  id: "F",
  connections: [
    ['F'],
    ['F'],
    ['F']
  ],

  bodyColor: "#e2b832"
}


export default CellTypes