
import { stateChange } from '../../../../react-oo';

const playerColors = [
	"FF2929",
	"316FC9",
	"32C643",
	"F4E23D"
]
 


 export default class Player {

 	constructor(id) {
 		this.score = 0;
		this.color = playerColors[id];
		this.id = id;
		this.name = "Player " + id;
		this.mutations = [];
		this.maxMutations = 3;
		this.score = 0;
		this.isOut = false;
		this.score = 0;
 	}
 	
 	getScore() {
 		return this.score;
 	}
 	

 	@stateChange
 	updateScore(game) {
 		let playerSpecies = game.getSpeciesForPlayer(this.id);
		let score = 0;
		if (playerSpecies.length > 0) {
			score = playerSpecies.map(species => {
				return species.getScore();
			}).reduce((acc, cur) => {
				return acc + cur;
			});
		}

		this.score = score;
 	}

 	@stateChange
 	goOut() {
 		this.isOut = true;
 	}

 	@stateChange 
 	dealMutation() {
		if (this.mutations.length < this.maxMutations) {
			this.mutations.push(1);
			return true;
		}
		return false;
 	}

 	@stateChange
 	useMutations(num) {
 		if (num < this.mutations.length) {
 			throw new Error("Spawnia: Trying to use more mutations than available")
 		}
 		//this.mutations = this.mutations.slice(-1 * num);
 		this.mutations = [];
 	}

 }




