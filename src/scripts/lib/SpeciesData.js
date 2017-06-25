// Species data is a collection of objects representing the unique
// species that currently exist on the map. It gets updated when
// units are added or deleted.

export default class SpeciesData {


	constructor() {
		this.data = {};
	}

	addToSpecies(unit) {
		let encodedDna = unit.getEncodedDna();
		let species = this.data[encodedDna];		
		if (species) {
			species.population++;
			species.totalPopulation++;
		}
		else {
			species = {
				encodedDna: encodedDna,
				speciesId: unit.speciesId,
				population: 1,
				totalPopulation: 1,
				adamUnitId: unit.id
			}
			this.data[encodedDna] = species;
		}
		unit.speciesIndex = species.totalPopulation;		
	}

	unitDies(unit) {
		if (unit.isMature()) {
			let encodedDna = unit.getEncodedDna();
			let species = this.data[encodedDna];
			if (species) {
				species.population = (species.population > 0) ? species.population - 1 : 0;
			}
		}
	}

	getSpeciesArr() {
		return Object.keys(this.data).map(key => this.data[key]).filter(species => species.population > 0); 
	}

	updateSpeciesName(encodedDna, name) {
		if (this.data[encodedDna]) {
			this.data[encodedDna].name = name;
			return true; 
		}
		return false;
	}

	getSpeciesOfUnit(unit) {
		return this.data[unit.getEncodedDna()];
	}


}