
import DNA from './DNA';
import UnitBuilder from './UnitBuilder';
import _ from "underscore";
import Species from "./Species";
// DnaManager will cache some useful objects associated
// with unique dnas so they can be shared across units that
// share the same functionality and boost performace


let ids = 0;

class SpeciesManager {


	constructor() {
		this.species = {};
	}

	add(encodedDna) {

		//let index = Object.keys(this.species).find((species) => species.encodedDna == encodedDna);

		let id = _.findKey(this.species, (species) => species.encodedDna == encodedDna);
		let species;
		if (id !== undefined) {
			
		}
		else {
			id = ids++;
			this.species[id] = new Species(encodedDna);
		}
		return id;
	}

	getSpecies(speciesId) {
		return this.species[speciesId];
	}

	getEncodedDna(speciesId) {
		return this.species[speciesId].encodedDna;
	}

	getCellCount(speciesId) {
		return DNA.getCellCount(this.species[speciesId].decodedDna.seedCell);
	}

	getSpeciesArr() {
		return Object.keys(this.species).map(key => this.species[key]).filter(species => species.population > 0); 
	}

	getSampleBody(speciesId) {
		return this.species[speciesId].sampleBody;
	}

}

let speciesManager = new SpeciesManager();

export default speciesManager;