

import MapObject from "./MapObject";
import Cell from "./Cell";
import CellTypes from "./CellTypes";
import UnitBuilder from "./UnitBuilder";

var unitIds = 0;

import { Composite, Constraint, Bodies, Body, Query } from "matter-js"
import { UNIT_START_ENERGY_PER_CELL, ENERGY_STORAGE_PER_FAT } from "../settings"
import DNA from "./DNA.js"
import { 
    COLLISION_CATEGORY_UNITS, 
    LIFESTATE_UNBORN,
    LIFESTATE_CHILD, 
    LIFESTATE_MATURE, 
    LIFESTATE_DEAD,
    MAP_OBJ_UNIT
} from "../constants"




function getNonFunctions(obj) {

}


class Unit extends MapObject {
    
    constructor(body, id, props={}) {
        props.type = MAP_OBJ_UNIT;
        super(body, id, props);
    }

    makeBody() {

    }


    getCells() {
        let cellBodies = this.body.parts.slice(1);
        return cellBodies.map(body=> {
            return {
                type: body.label
            }
        });
    }

    getDnaAsObjects() {
        return this.encodedDna ? DNA.decodeDna(this.encodedDna) : null;
    }

    getEncodedDna() {
        return this.species.encodedDna;
    }

    getDecodedDna() {
        return this.species.dna;
    }

    getSpecies() {
        return this.species;
    }


    spawn(species, cells, parent = null, bornAt = 0) {

        //this.speciesId = speciesId;
        this.species = species;
        this.cells = [];
        this.mutatingSpecies = null;

        this.body.render.encodedDna = this.encodedDna;

        this.energy = this.species.startEnergy;
        // The initial storage is their start energy, they cant get more storage
        // until the unit matures with fat cells
        this.energyStorage = 0;
        this.matureTries = 0;
        this.lifeState = LIFESTATE_CHILD;

        // Born at is number of game steps since start of simulation
        this.bornAt = bornAt;
        this.children = [];

        // The chicken or the egg?
        if (parent) {
            this.parentId = parent.id;
            this.generation = parent.generation + 1;
            parent.children.push(this.id);
        } else {
            this.parentId = null;
            this.generation = 0;
        }

        this.species.unitIsBorn(this);
    }

    applyMutation(species) {
        this.mutatingSpecies = species;
    }

    stopMutation(species) {
        this.mutatingSpecies = null;
    }

    toString(){
        const summary = {
            id: this.id,
            dna: this.encodedDna,
            position: this.body.position,
            bodyLabel: this.body.label,
            bodyId: this.body.id
        }
        return summary;
        //return summary.toString();
      }

    getData() {
        return Object.assign({}, this);
    }

    getAge(currStep) {
        /*
        let t = Math.floor(moment().diff(this.bornAt));
        let seconds = Math.floor((t / 1000) % 60);
        let minutes = Math.floor((t / 1000 / 60) % 60);
        let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        seconds = ('0' + seconds).slice(-2);
        hours = ('0' + hours).slice(-2);
        minutes = ('0' + minutes).slice(-2);
        */
        return currStep - this.bornAt;
        /*
        return "10:00";
        age = minutes + ":" + seconds;
        */

    }

    isMature() {
        return (this.lifeState === LIFESTATE_MATURE);
    }

    addChild(unit) {
        this.children.push(unit);
        unit.generation = this.generation + 1;
        unit.parent = this;
    }

    getCellCount() {
        return DNA.getCellCount(this.DNA.seedCell); 
    }

    getCellBody(index) {
        return this.body.parts[index+1];
    }

    // Creates the cells
    mature(body) {
        // Clone the cells on the dna
        this.cells = this.species.dna.cells.map(cell => Object.assign({},cell));
        //this.cells = newCells;
        this.cells.forEach(cell => {
            if (CellTypes[cell.type].onCreate) {
                CellTypes[cell.type].onCreate(cell, this);
            }
        });        
        this.energyStorage = this.species.energyStorage;
        body.frictionAir = this.species.bodyFrictionAir;
        this.lifeState = LIFESTATE_MATURE;
        this.species.unitMatured(this);    
    }

    die() {
        this.DNA = null;
        this.cells = null;
        this.lifeState = LIFESTATE_DEAD;
    }
}

export default Unit