

import MapObject from "./MapObject";
import Cell from "./Cell";
import CellTypes from "./CellTypes";
import UnitBuilder from "./UnitBuilder";


var unitIds = 0;

import { Composite, Constraint, Bodies, Body, Query } from "matter-js"
import { UNIT_START_ENERGY_PER_CELL, ENERGY_STORAGE_PER_FAT } from "../settings"
import DNA from "./DNA.js"
import { COLLISION_CATEGORY_UNITS, LIFESTATE_UNBORN,LIFESTATE_CHILD, LIFESTATE_MATURE, LIFESTATE_DEAD} from "../constants"




function getNonFunctions(obj) {

}


class Unit {
    constructor() {
        this.id = unitIds++;
        this.energy = 100;
        this.matureTries = 0;
        this.lifeState = LIFESTATE_UNBORN;
        this.children = [];
        this.generation = 0;
    }


    getData() {
        return Object.assign({}, this);
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

    build(dna, x, y) {
        this.DNA = dna;
        this.encodedDna = DNA.encodeDna(dna);
        // Builds all the cells and ads them into bodies array
        this.cells = [UnitBuilder.buildSeedCell(dna, x, y)];

        this.body = UnitBuilder.buildParentBody(this.cells);

        this.body.label = "unit:" + this.id;
        this.body.render.encodedDna = this.encodedDna;

        this.energy = UNIT_START_ENERGY_PER_CELL * this.getCellCount();
        // The initial storage is their start energy, they cant get more storage
        // until the unit matures with fat cells
        this.energyStorage = 0;
        this.lifeState = LIFESTATE_CHILD;
        this.bornAt = Date.now();
        return this.body;
    }

    // Creates the cells
    mature() {

        this.cells = UnitBuilder.buildAllCells(this.DNA, this.body.position.x, this.body.position.y);
        this.body = UnitBuilder.buildParentBody(this.cells);

        this.cells.forEach(cell => {
            if (CellTypes[cell.type].onCreate) {
                CellTypes[cell.type].onCreate(cell, this);
            }
        })

        this.body.render.encodedDna = this.encodedDna;
        this.body.label = "unit:" + this.id;

        this.energyStorage = this.cells.filter((cell) => { 
            return cell.type === "F"}).length * ENERGY_STORAGE_PER_FAT;
        this.lifeState = LIFESTATE_MATURE;
        return this.body;
    }

    die() {
        this.DNA = null;
        this.cells = null;
        this.body = null;
        this.lifeState = LIFESTATE_DEAD;
    }
}

export default Unit