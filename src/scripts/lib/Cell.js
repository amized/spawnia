
import CellTypes from "./CellTypes";
import { Bodies } from "matter-js"
import { UNIT_START_ENERGY_PER_CELL } from "../settings"
import { COLLISION_CATEGORY_UNITS, COLLISION_CATEGORY_DEFAULT } from "../constants"
import { getNewCellPosFromParent, DIR } from "./Geometry";


class Dna {

    constructor() {
        this.cells = [new Cell("S", 0,0,DIR.NORTH, null, [null,null,null,null])];
    }

    addChild(cell, type, index) {
        let { pos, dir } = getNewCellPosFromParent(cell.x, cell.y, cell.direction, index, 1);
        let children = [null, null, null];
        const newChild = new Cell(type, pos.x, pos.y, dir, cell, children);
        cell.children[index] = newChild;        
    }

}




class Cell {
    constructor( type, x, y, direction, parent, children) {
        this.type = type,
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.parent = parent;
        this.children = children;
    }
}

export default Cell