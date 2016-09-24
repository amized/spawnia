

import MapObject from "./MapObject";
import Cell from "./Cell";
import CellTypes from "./CellTypes";

var unitIds = 0;

import { Composite, Constraint, Bodies, Body, Query } from "matter-js"
import { UNIT_START_ENERGY_PER_CELL, ENERGY_STORAGE_PER_FAT } from "../settings"
import DNA from "./DNA.js"
import { COLLISION_CATEGORY_UNITS, LIFESTATE_UNBORN,LIFESTATE_CHILD, LIFESTATE_MATURE, LIFESTATE_DEAD} from "../constants"


class Unit {
    constructor() {
        this.id = unitIds++;
        this.energy = 100;
        this.matureTries = 0;
        this.lifeState = LIFESTATE_UNBORN;
        this.children = [];
        this.generation = 0;
    }

    isMature() {
        return (this.lifeState === LIFESTATE_MATURE);
    }

    applySelected() {
        this.body.render.isSelected = true;
    }

    deselect() {
        this.body.render.isSelected = false;
    }

    addChild(unit) {
        this.children.push(unit);
        unit.generation = this.generation + 1;
        unit.parent = this;
    }

    getCellCount() {
        return DNA.getCellCount(this.DNA.seedCell); 
    }

    makeBody() {
        return Body.create({
            label: "unit:" + this.id,
            restitution: 1,
            force: {
                x: 0,
                y: 0
            },
            collisionFilter: {
                category: COLLISION_CATEGORY_UNITS
            }

        });
    }

    build(dna, x, y) {
        this.DNA = dna;
        this.encodedDna = DNA.encodeDna(dna);
        // Builds all the cells and ads them into bodies array
        this.cells=[this.buildSeed(x, y)];

        // The parent body
        this.body = this.makeBody();

        // Adds all the child bodies into the parent
        Body.setParts(this.body, this.cells.map(item => { return item.body }));
        this.energy = UNIT_START_ENERGY_PER_CELL * this.getCellCount();
        // The initial storage is their start energy, they cant get more storage
        // until the unit matures with fat cells
        this.energyStorage = 0;
        this.lifeState = LIFESTATE_CHILD;
        this.bornAt = Date.now();
        return this.body;

    }

    getMaturedCells() {
        let cells = [];
        // Builds all the cells and ads them into bodies array
        let seed = this.buildCell(this.DNA.seedCell, this.body.position.x, this.body.position.y, 0, cells);
        return cells;
    }

    getMaturedCellsFromDna(dna) {
        let cells = [];
        // Builds all the cells and ads them into bodies array
        let seed = this.buildCell(dna.seedCell, 0, 0, 0, cells);
        return cells;
    }

    getMaturedBody(cells) {
        // The parent body
        let body = this.makeBody();
        // Adds all the child bodies into the parent
        Body.setParts(body, cells.map(item => { return item.body }));
        return body;
    }

    // Creates the cells
    mature() {
        // List of "sub" bodies that get added to a parent body
        this.cells = this.getMaturedCells();
        this.energyStorage = this.cells.filter((cell) => { 
            return cell.type === "F"}).length * ENERGY_STORAGE_PER_FAT;
        // Builds all the cells and ads them into bodies array
        this.body = this.getMaturedBody(this.cells);
        this.lifeState = LIFESTATE_MATURE;
        return this.body;
    }

    die() {
        this.lifeState = LIFESTATE_DEAD;
    }

    getBodyTemplate() {
        let cells = this.getMaturedCells();
        return this.getMaturedBody(cells);
    }

    buildSeed(x,y) {
        let cell = this.DNA.seedCell;
        let newCell = new Cell(x, y, cell.type, 0);
        return newCell;        
    }

    // Recursive function to build a unit from a DNA scheme
    buildCell(cell, x, y, angle, allCells) {
        // Make sure it doesnt intrsect any current
        let currBodies = allCells.map((cell)=>{
            return cell.body
        });
        let intersecting = Query.point(currBodies, {x:x, y:y});
        if (intersecting.length > 0) {
            console.log("We FOUNDDD AN INTERASECTING CELL!!");
            return null;
        }
        let newCell = new Cell(x, y, cell.type, angle);
        allCells.push(newCell);

        let cellMargin = 10;
        // Recursively create bodies of all the children cells
        if (cell.children) {
            cell.children.forEach((childCell, index) => {
                let angleOffset;
                if (!childCell) {
                    return;
                }
                switch (index) {
                    case 0:
                        angleOffset = angle + Math.PI * (1/3);
                        break;
                    case 1:
                        angleOffset = angle - Math.PI * (1/3);
                        break;
                    case 2:
                        angleOffset = angle + Math.PI;
                        break;                      
                }
                let newPos = {
                    x: x +  (cellMargin * Math.cos(angleOffset)),
                    y: y + (cellMargin*Math.sin(angleOffset))
                }
                var childCell = this.buildCell(childCell, newPos.x, newPos.y, angleOffset, allCells);
            });
        }
        // return the body so it can link to its parents
        return newCell;
    }
}

export default Unit