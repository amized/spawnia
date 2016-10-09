
import Cell from "./Cell"
import { COLLISION_CATEGORY_UNITS } from "../constants"
import { Body, Query } from "matter-js"


export default class UnitBuilder {



	/**
     * Creates a cell object for the seed
     */
    static buildSeedCell(dna, x, y) {
        let cell = dna.seedCell;
        let newCell = new Cell(x, y, cell.type, 0);
        return newCell;        
    }

	/**
     * Creates the matured body and returns an array of cells
     */
    static buildAllCells(dna, x, y) {
        let cells = [];
        this.buildCellRecurse(dna.seedCell, x, y, 0, cells);
        return cells;
    }

    /**
     * Method for creating a matter js body object that wraps some child cells
     */
    static buildParentBody(cells) {
		let body = Body.create({
            label: "unit:",
            restitution: 1,
            force: {
                x: 0,
                y: 0
            },
            collisionFilter: {
                category: COLLISION_CATEGORY_UNITS
            },
            render: {}
        });
        Body.setParts(body, cells.map(item => { return item.body }));
        return body;
    }

	/**
     * Creates a matured body from the given dna
     */
    static buildBody(dna, x, y) {
    	let cells = this.buildAllCells(dna, x, y);
    	let body = this.buildParentBody(cells);
    	return body;
    }

	/**
     * Creates bodies for this cell and all it's decendant cells in the dna tree
     */
    static buildCellRecurse(cell, x, y, angle, allCells) {
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
                var childCell = this.buildCellRecurse(childCell, newPos.x, newPos.y, angleOffset, allCells);
            });
        }
        // return the body so it can link to its parents
        return newCell;
    }





}