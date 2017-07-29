
import DNA from './DNA';
import Dna from './DnaClass';
import UnitBuilder from './UnitBuilder';
import { UNIT_START_ENERGY_PER_CELL, ENERGY_STORAGE_PER_FAT, ENERGY_COST_PER_CELL } from "../settings"
import { stateChange } from '../../../../react-oo';

export default class Species {


	constructor(encodedDna, playerId = 0) {

		this.encodedDna = encodedDna;
		this.playerId = playerId;
		this.dna = new Dna(encodedDna);
		this.sampleBody = UnitBuilder.buildBody(
    		this.dna, 
    		0, 
    		0
    	);

		this.cellCount = this.dna.getCellCount();
    this.startEnergy = UNIT_START_ENERGY_PER_CELL * this.cellCount;
    this.energyCostPerStep = ENERGY_COST_PER_CELL * this.cellCount;

    this.energyStorage = this.countCellsOfType("F") * ENERGY_STORAGE_PER_FAT;
    this.bodyFrictionAir = this.countCellsOfType("G") * 0.03;
    this.reproductionCost = this.startEnergy;
    this.reproductionTime = this.cellCount * 1000;

    this.population = 0;
    this.totalPopulation = 0;
    this.maturedPopulation = 0;
    this.mutatingTo = null;
	}

	isSameAs(species) {
		return this.encodedDna === species.encodedDna;
	}

	@stateChange
	unitIsBorn(unit) {
		this.population++;
		this.totalPopulation++;		
	}
	
	@stateChange
	unitMatured(unit) {
		this.maturedPopulation++;
	}

	@stateChange
	unitDies(isMature) {
		if (isMature) {
			this.maturedPopulation = (this.maturedPopulation > 0) ? this.maturedPopulation - 1 : 0;
		}
		this.population = (this.population > 0) ? this.population - 1 : 0;
	}

	countCellsOfType(type) {
		return this.dna.cells.filter((cell) => cell.type === type).length;
	}

	getCellCount() {
		return this.dna.cells.length;
	}

	getStartEnery() {
		return this.startEnergy;
	}
	getScore() {
		return this.cellCount * this.maturedPopulation;
	}

	isAlive() {
		return this.population > 0;
	}



}