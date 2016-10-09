
import DNA from "./DNA";
import {LIFESTATE_MATURE} from "../constants"

class Universe {
	constructor(world) {
		this.units = {};
		this.foods = [];
		this.world = world;
		this.world.gravity = {
			x: 0,
			y: 0.0
		}

		// Species data is a collection of objects representing the unique
		// species that currently exist on the map. It gets updated when
		// units are added or deleted.
		this.speciesData = {};
	}


	/* Species */
	addToSpecies(unit) {
		let species = this.speciesData[unit.encodedDna];
		if (species) {
			species.population++;
			species.totalPopulation++;
		}
		else {
			species = {
				dna: unit.DNA,
				encodedDna: unit.encodedDna,
				population: 1,
				totalPopulation: 1
			}
			this.speciesData[unit.encodedDna] = species;
		}
		unit.speciesIndex = species.totalPopulation;		
	}

	updateSpeciesName(encodedDna, name) {
		if (this.speciesData[encodedDna]) {
			this.speciesData[encodedDna].name = name;
			return true; 
		}
		return false;
	}

	getSpeciesOfUnit(unit) {
		return this.speciesData[unit.encodedDna];
	}

	getUnitsOfSpecies(species) {
		return this.getUnitsArr().filter(unit => unit.encodedDna === species.encodedDna );
	}	

	getSpeciesArr() {
		return Object.keys(this.speciesData).map(key => this.speciesData[key]).filter(species => species.population > 0); 
	}

	applySelectedSpecies(species) {

		let units = this.getUnitsArr();
		units.forEach((unit) => {
			unit.deselect();
		});

		if (species) {
			units = units.filter(unit => unit.encodedDna === species.encodedDna );
			units.forEach((unit) => {
				unit.applySelected();
			});
		}
	}




	/* Units */
	getUnitsArr() {
		return Object.keys(this.units).map(key => this.units[key]);
	}

	getNumUnits() {
		return Object.keys(this.units).length;
	}

	getUnit(unitId) {
		return this.units[unitId];
	}

	addUnit(unit) {

		this.units[unit.id] = unit;
	}

	selectUnit(unit) {
		unit.applySelected();
	}

	deleteUnit(unit) {
		// We only add species data once the unit matures, so remove it only
		// if the unit is mature
		if (unit.isMature()) {
			let species = this.speciesData[unit.encodedDna];
			if (species) {
				species.population = (species.population > 0) ? species.population - 1 : 0;
			}
		}

		unit.die();
		delete this.units[unit.id];
	}



	/* Foood */
	getFood(foodId) {
		return this.foods.filter((food)=> food.id === foodId)[0];
	}

	getFoodBodies() {
		return this.foods.map((food)=>{ return food.body }); 
	}
}


export default Universe