
import Cell from "./Cell"
import CellTypes from "./CellTypes";
import { COLLISION_CATEGORY_UNITS, COLLISION_CATEGORY_DEFAULT, COLLISION_CATEGORY_FOOD } from "../constants"
import { FOOD_RADIUS } from "../settings"
import { Body, Bodies, Query, Composite } from "matter-js"
import DNA from "./DNA"
import _ from 'underscore'

export default class UnitBuilder {



    /**
     * Creates a cell object for the seed
     */
    static buildFood(x, y) {
        return Bodies.circle(0, 0, FOOD_RADIUS, {
            friction: 0.5,
            frictionAir: 0.9,
            label: "food",
            isStatic: true,
            owner: this,
            position: {
                x: x,
                y: y
            },
            collisionFilter: {
                category: COLLISION_CATEGORY_FOOD
            },
            render: {
                 objectType: "food",
                 strokeStyle: "#ebedc8",
                 fillStyle: "#f7ffe1"
            }
        });      
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
                category: COLLISION_CATEGORY_UNITS,
                mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_UNITS
            },
            render: {}
        });

		//let cellBodies = cells.map(item => { return item.body });
		//let c = Composite.create();

        Body.setParts(body, cells);
        return body;
    }

	/**
     * Creates a matured body from the given dna
     */
    static buildBody(dna, x, y) {

        if (typeof dna === "string") {
            // Decode
            dna = DNA.decodeDna(dna);
        }

    	let cells = this.buildAllCells(dna);
    	let body = this.buildParentBody(this.buildCellBodies(cells, x, y));
    	return body;
    }

    /**
     * Creates bodies for this cell and all it's decendant cells in the dna tree
     */
    static getHexVertices(x,y) {
        let hexHeight = 7;
        let hexWidth = hexHeight / (Math.sqrt(3)/2);
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numColumns; j++) {
            let pts = getPoints(hexHeight, hexWidth);
            let yOffset = (j%2 === 0) ? 0 : hexHeight/2;
            pts = pts.map((pt, index) => {
                return {
                  x: pt.x + (hexWidth * j * 0.75),
                  y: pt.y + (hexHeight * i) + yOffset
                }
            });
            polygons.push(pts);
            index++;
          }
        }
    }




    /**
     * Creates a cell object for the seed
     */
    static buildSeedCell(dna, x, y) {
        let cell = dna.seedCell;
        //let newCell = new Cell(x, y, cell.type, 0);
        let newCell = this.buildCellBody(cell, x, y);
        return this.buildParentBody([newCell]);      
    }

    

    static buildCellBodies(cells, x, y) {
        return cells.map(cell=> {
            return this.buildCellBody(cell, x + cell.offsetX, y + cell.offsetY)
        })
    }


    /**
     * Create body for the cell
     */
    static buildCellBody(cell, x, y) {
        let cellType = CellTypes[cell.type];
        let color = cellType ? cellType.bodyColor : "#FFFFFF";
        let cellMargin = 10;
        return Bodies.polygon(x, y, 6, 6, {
            friction: 0.0,
            frictionAir: 0,
            label: 1,
            restitution:1,
            label: cell.type,
            collisionFilter: {
                category: COLLISION_CATEGORY_UNITS,
                mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_UNITS
            },
            render: {
                 fillStyle: color,
                 strokeStyle: '#333333',
                 lineWidth: 1,
                 cellType: cellType
            }
        });
    }


    /**
     * Creates the matured body and returns an array of cells
     */
    static buildAllCells(dna, x, y) {
        let cells = [];
        this.buildCellRecurse(dna.seedCell, 0, 0, 0, cells);
        return cells;
    }

	/**
     * Creates bodies for this cell and all it's decendant cells in the dna tree
     */
    static buildCellRecurse(cell, x, y, angle, allCells, cellBodies) {
        // Make sure it doesnt intrsect any current
        /*
        let currBodies = allCells.map((cell)=>{
            return cell.body
        });*/
        /*
        let currBodies = allCells;
        let intersecting = Query.point(currBodies, {x:x, y:y});
        if (intersecting.length > 0) {
            console.log("We FOUNDDD AN INTERASECTING CELL!!");
            return null;
        }
        */
        //let newCell = new Cell(x, y, cell.type, angle);
        allCells.push({
            type: cell.type,
            offsetX: x,
            offsetY: y,
            angle: angle
        });

        //cellBodies.push(this.buildCellBody(newCell));


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
        //return newCell;
    }





}