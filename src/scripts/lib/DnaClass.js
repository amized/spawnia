
import CellTypes from "./CellTypes";
import { Bodies } from "matter-js"
import { UNIT_START_ENERGY_PER_CELL } from "../settings"
import { COLLISION_CATEGORY_UNITS, COLLISION_CATEGORY_DEFAULT } from "../constants"
import { getNewCellPosFromParent, DIR } from "./Geometry";
import DNA from "./DNA";

function decodeDna(encodedDna) {

    let cell;
    let parent = null;
    let seedCell = cell;
    let childIndex = 0;

    for (let i = 0; i < encodedDna.length; i++) {
        let c = encodedDna[i];
        
        // Open braket - move down tree
        if (c === '(') {
            parent = cell;
            // dummy cell so we can get back to the parent
            cell = {
                parent: parent
            }
            parent.children = [null,null,null];
            childIndex = 0;
        }
        else if (c === ')') {
            cell = cell.parent;
            parent = cell ? cell.parent : null;
            childIndex = cell.index;
        }
        else if (c.match(/^[A-Z]*$/)) {
            if (!CellTypes[c]) {
                throw("ERROR with decoding cell: unknown cell type " + c);
            }
            cell = {
                parent: parent,
                type: c,
                index: childIndex
            }
            if (parent) { parent.children[childIndex] = cell; }
        }
        else if (c === ',') {
            childIndex++;
        }
        else {
            throw("ERROR with decoding cell: unknown token " + c);
            return false;
        }
    }

    return cell;
}




class Dna {

    constructor(encodedDna) {

        const seedCell = new Cell("S", 0,0,DIR.NORTH, null, [null,null,null,null]);

        if (encodedDna) {
            const seedNode = decodeDna(encodedDna);
            this.cells = [seedCell];
            this._getCellsRecurse(seedNode, seedCell);
        }
        
        else {
            this.cells = [seedCell];
        }
    }

    _getCellsRecurse(parentNode, parentCell) {
        if (parentNode.children) {
          parentNode.children.forEach((childNode, index) => {
            if (!childNode) {
              return;
            }
            const childCell = this.addChild(parentCell, childNode.type, index);
            if (childCell) {
                this._getCellsRecurse(childNode, childCell);
            }
          });
        }
    }

    getEncodedDna() {
        return DNA.encodeDna({ seedCell: this.cells[0] });
    }

    getCellCount() {
        return this.cells.length;
    }

    addChild(cell, type, index) {
        let { pos, dir } = getNewCellPosFromParent(cell.x, cell.y, cell.direction, index, 1);
        
        // Make sure it doesnt overlap an existing cell
        let overlapping = this.cells.filter((cell) => {
            return cell.x === pos.x && cell.y === pos.y;
        })

        if (overlapping.length > 0) {
            return false;
        }

        let children = [null, null, null];
        const newChild = new Cell(type, pos.x, pos.y, dir, cell, children);
        cell.children[index] = newChild;
        this.cells.push(newChild);   
        return newChild;     
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

export default Dna