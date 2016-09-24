
import CellTypes from "./CellTypes";


function CoinFlip() {
    return (Math.random() < 0.5);
}



let probabilities = {

    EXTEND: 50,
    DUPLICATE: 10, 
    SWAP: 10,
    DIE: 2,
    MORPH: 0,
    SPAWN: 50
}

let mutationProbability = 0.03;


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
        encoded = encoded + "(";
        encoded = encoded + cell.children.map((cell, index) => {
            return encodeCell(cell);
        }).join();
        encoded = encoded + ")";
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
        let cell = {
            parent: null
        };
        let seedCell = cell;
        for (let i = 0; i < encodedDna.length; i++) {
            let c = encodedDna[i];
            
            if (c === '(') {
                let parent = cell;
                cell = {
                    parent: parent
                }
                parent.children = [cell];
            }
            else if (c.match(/^[A-Z]*$/)) {
                if (!CellTypes[c]) {
                    throw("ERROR with decoding cell: unknown cell type " + c);
                }
                cell.type = c;
            }
            else if (c === ',') {
                let parent = cell.parent;
                cell = {
                    parent: parent
                };
                parent.children.push(cell);
            }
            else if (c === ')') {
                let parent = cell.parent;
                parent.children = parent.children.map((cell)=>{
                    return (cell.type) ? cell : null;
                })
                cell = cell.parent;
            }
            else {
                throw("ERROR with decoding cell: unknown token " + c);
                return false;
            }
        }

        if (cell !== seedCell) {
            throw("ERROR with decoding cell: incorrect format");
            return false;
        }

        return {
            seedCell: cell
        }
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
                if (cell.children) {
                    newCell.children = cell.children.map((childCell) => {
                        return (childCell) ? this.copyCell(childCell) : { type: "B"};
                    });
                } else {
                    if (CoinFlip()) {
                        newCell.children = [{type: "B"}, null];
                    }
                    else {
                        newCell.children = [null, {type: "B"}];
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

    // Returns new DNA copy
    static copyDNA(DNA) {
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