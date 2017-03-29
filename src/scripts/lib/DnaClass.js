
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


    static makeCell(type) {
        return new Cell(type, 0, 0, DIR.NORTH, null, [null,null,null]);
    }

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

    detachChild(cell) {
        let parent = cell.parent;
        if (parent) {
            let oldIndex = parent.children.indexOf(cell);
            parent.children[oldIndex] = null;  
            cell.parent = null;         
        }
        this.removeBranch(cell);
        return cell;
    }

    removeBranch(branch) {
        
        if (branch === null) {
            return;
        }
        
        let index = this.cells.indexOf(branch);
        if (index !== -1) {
            this.cells.splice(index, 1);
        }

        branch.children.forEach(child=> {
            this.removeBranch(child);
        })
    }

    isBranchInCells(branch) {
        if (!branch) {
            return false;
        }
        if (this.cells.indexOf(branch) !== -1) {
            return true;
        }

        let i;
        let result = false;

        for (i = 0; i < branch.children.length; i++) {
            let child = branch.children[i];
            result = result || this.isBranchInCells(child);
        }
        return result
    }

    attachBranchToCell(branch, cell, index) {

        // Don't override
        if (cell.children && cell.children[index] !== null) {
            return false;
        }

        // Not allowed to add a branch to one of it's children
        if (this.isBranchInCells(branch)) {
            console.log("Branch is already is cellls!!!!");
            return false;
        }

        // Remove branch
        cell.children[index] = branch;
        branch.parent = cell;
        this.recalculateBranchPositions(branch, cell, index);
        return true;
    }

    posOccupied(pos) {
        let index = this.cells.findIndex(cell => cell.x == pos.x && cell.y == pos.y);
        return index !== -1;
    }

    recalculateBranchPositions(branch, parent, cellIndex) {
        if (!branch) {
            return;
        }
        let { pos, dir } = getNewCellPosFromParent(parent.x, parent.y, parent.direction, cellIndex, 1);
        
        if (this.posOccupied(pos)) {
            // If the position is occupied we need to debranch this
            //this.detachChild(branch);
            console.log("Recalculate branch positions: Is position occupied, TRUE ", pos);
            parent.children[cellIndex] = null;
            branch.parent = null;
            return;
        }

        branch.direction = dir;
        branch.x = pos.x;
        branch.y = pos.y;
        // Make sure it's registered
        if (this.cells.indexOf(branch) === -1) {
            this.cells.push(branch);
        }
        branch.children.forEach((child, index) => {
            this.recalculateBranchPositions(child, branch, index);
        })
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

    copy() {
        let newCell = new Cell(this.type, this.x, this.y, this.direction, this.parent, null);
        let children = this.children.map(child=> {
            if (!child) {
                return null
            }
            let newChild = child.copy();
            newChild.parent = newCell;
            return newChild;
        });
        newCell.children = children;
        return newCell;
    }

    getIndex() {
        return this.parent ? 
            this.parent.children.findIndex(c => c === this)
            : null;
    }
}

export default Dna