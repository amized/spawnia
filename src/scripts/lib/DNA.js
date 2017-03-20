
import CellTypes from "./CellTypes";
import { getNewCellPosFromParent, DIR } from "./Geometry";

function CoinFlip() {
    return (Math.random() < 0.5);
}



let probabilities = {

    EXTEND: 10,
    DUPLICATE: 2, 
    SWAP: 10,
    DIE: 2,
    MORPH: 0,
    SPAWN: 10
}

let mutationProbability = 0.02;


function getProbTiers() {
    let n = 0;
    let count = 0;
    let probTiers = [];

    for (let p in probabilities) {
        n = n + probabilities[p];
        probTiers.push({
            value: n,
            type: p
        });
        
    }

    return probTiers;
}

let probTiers = getProbTiers();

function encodeCell(cell) {
    if (!cell) {
        return "";
    }
    let token = CellTypes[cell.type].id;
    let encoded = token;
    if (cell.children) {
        let children = cell.children.map((cell, index) => {
            return encodeCell(cell);
        });
        if (children.filter(str => str !== "").length === 0) {
            return encoded;
        }

        encoded = encoded + "(" + children.join() + ")";
    }
    return encoded;
}


class DNA {

    // Expects dna object
    static encodeDna(dna) {
        return encodeCell(dna.seedCell);
    }

    // Expects string
    static decodeDna(encodedDna) {

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

        let cellTree = {
            seedCell: cell
        }

        return cellTree;
    }

    static copyCell(cell) {
        
        if (cell === null || cell === undefined) {
            return null;
        }

        let newCell = {
            type: cell.type
        };

        // Generate a mutation
        let mutation = null;
        if (Math.random() < mutationProbability) {
            let i;
            let total = probTiers[probTiers.length - 1].value;
            let rnd = Math.floor(Math.random() * total);
            for (i = 0; i < probTiers.length; i++) {
                if (rnd < probTiers[i].value) {
                    mutation = probTiers[i].type;
                    break;
                }
            }
        }
        switch (mutation) {
            case "DIE":
                console.log("DIE MUTATION");

                if (!cell.children) {
                    return null;
                }

                // When we kill a cell, we choose one of its children
                // to survive by taking this cells place, and the other child 
                // and its decesdedants die.
                let toLive
                if (CoinFlip()) {
                    toLive = cell.children[0];
                }
                else {
                    toLive = cell.children[1];
                }
                return this.copyCell(toLive);
            
            case "EXTEND":
                console.log("EXTEND MUTATION");
                
                let duplicatedCell = {
                    type: cell.type
                };
                
                if (cell.children) {
                    duplicatedCell.children = cell.children.map((childCell, index)=>{
                        return this.copyCell(childCell);
                    });
                }

                if (CoinFlip()) {
                    newCell.children = [duplicatedCell, null];
                }
                else {
                    newCell.children = [null, duplicatedCell];
                }
                
                return newCell;    

            case "DUPLICATE":
                // Copies one of the child cells to the other
                console.log("DUPLICATE MUTATION");
                if (cell.children) {
                    newCell.children = [null,null];
                    // The left node
                    if (CoinFlip()) {
                        newCell.children[0] = this.copyCell(cell.children[0]);
                        newCell.children[1] = this.copyCell(cell.children[0]); 
                    }
                    // The right node
                    else {
                        newCell.children[0] = this.copyCell(cell.children[1]);
                        newCell.children[1] = this.copyCell(cell.children[1]); 
                    }
                }
                return newCell;

            case "SWAP":
                console.log("SWAP MUTATION");
                if (cell.children) {
                    newCell.children = [null,null];
                    newCell.children[0] = this.copyCell(cell.children[1]);
                    newCell.children[1] = this.copyCell(cell.children[0]);
                }
                return newCell;

            // No mutation
            case "SPAWN":
                console.log("SPAWN MUTATION");
                let spawnedCell = {
                    type: cell.type
                }
                if (cell.children) {
                    newCell.children = cell.children.map((childCell) => {
                        return (childCell) ? this.copyCell(childCell) : spawnedCell;
                    });
                } else {
                    if (CoinFlip()) {
                        newCell.children = [spawnedCell, null];
                    }
                    else {
                        newCell.children = [null, spawnedCell];
                    }
                }
                return newCell;
            default:
                if (cell.children) {
                    newCell.children = cell.children.map((childCell) => this.copyCell(childCell));
                }
                return newCell;
        }
    }

    static getCells(decodeDna) {
        const cells = [];
        this.getCellsRecurse(decodeDna.seedCell, null, 0, 0, DIR.NORTH, cells);
        return cells;
    }

    static getCellsRecurse(currNode, parentCell, x, y, direction, allCells) {
        // Make sure it doesnt intrsect any current

        let newCell = {
          type: currNode.type,
          x: x,
          y: y,
          direction: direction,
          parent: parentCell,
          children: allCells.length === 0 ? [null,null,null,null] : [null,null,null]
        }

        allCells.push(newCell);

        // Recursively create bodies of all the children cells
        if (currNode.children) {
          currNode.children.forEach((childNode, index) => {
            if (!childNode) {
              return;
            }
            let { pos, dir } = getNewCellPosFromParent(x, y, direction, index, 1);
            let childCell = this.getCellsRecurse(childNode, newCell, pos.x, pos.y, dir, allCells);
            newCell.children[index] = childCell;
          });
        }
        return newCell;
    }


    // Returns new DNA copy
    static copyDNA(DNA) {

        return {
            seedCell: DNA.seedCell
        }

        let newDNA = {};
        newDNA.seedCell = {};
        newDNA.seedCell.type = DNA.seedCell.type;
        newDNA.seedCell.children = DNA.seedCell.children.map((cell, index)=>{
            return this.copyCell(cell);
        });
        return newDNA;
    }

    static getCellCount(cell) {
    	let amount = 0;
    	if (cell.children) {
    		cell.children.forEach((cell, index)=>{
    			if (!cell) return;
	            amount = amount + this.getCellCount(cell);
	        });
    	}
    	return amount + 1;
    }
}

export default DNA