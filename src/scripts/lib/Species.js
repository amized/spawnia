
import DNA from './DNA';
import UnitBuilder from './UnitBuilder';
import { UNIT_START_ENERGY_PER_CELL, ENERGY_STORAGE_PER_FAT, ENERGY_COST_PER_CELL } from "../settings"

export default class Species {


	constructor(encodedDna) {


		this.decodedDna = DNA.decodeDna(encodedDna);
		this.encodedDna = encodedDna;
		this.sampleBody = UnitBuilder.buildBody(
    		encodedDna, 
    		0, 
    		0
    	);

		this.cellCount = DNA.getCellCount(this.decodedDna.seedCell);
    	this.startEnergy = UNIT_START_ENERGY_PER_CELL * this.cellCount;
    	this.energyCostPerStep = ENERGY_COST_PER_CELL * this.cellCount;
    	this.cells = UnitBuilder.buildAllCells(this.decodedDna, 0, 0);

    	console.log("The cells in the species", this.cells);

        this.energyStorage = this.countCellsOfType("F") * ENERGY_STORAGE_PER_FAT;
        this.bodyFrictionAir = this.countCellsOfType("G") * 0.03;
        this.reproductionCost = this.startEnergy;
        this.reproductionTime = this.cells.length * 1000; 


        this.population = 0;
        this.totalPopulation = 0;
	}


	unitIsBorn(unit) {
		this.population++;
		this.totalPopulation++;		
	}

	unitDies(unit) {
		if (unit.isMature()) {
			this.population = (this.population > 0) ? this.population - 1 : 0;
		}
	}

	countCellsOfType(type) {
		return this.cells.filter((cell) => cell.type === type).length;
	}

	getCellCount() {
		return this.cellCount;
	}

	getStartEnery() {
		return this.startEnergy;
	}



}