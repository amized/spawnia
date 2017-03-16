 


 export default class Player {

 	contructor(id) {
 		this.id = id;
 		this.isAi = false;
 	

 		this.species = [];
 		this.score = 0;


 	}

 	reset () {
 		this.species = [];
 		this.score = 0;

 	}

 	setToAi() {
 		this.isAi = true;
 	}

 }