		
import DNA from '../lib/DNA'
import { Dna1, Dna2, Dna3, Dna4, Dna5, Dna6 } from "../mock/dna";
import uuid from 'uuid'
import { MATURATION_TIME } from "../settings"

export default function makeWorld(dispatch) {

	let unitid = uuid.v1();

	dispatch({
		type: "ADD_UNIT",
		DNA: DNA.encodeDna(Dna1),
		x: 250,
		y: 150,
		id: unitid
	});

	
	/*
	dispatch({
		type: "BUILD_WORLD"
	});
	*/


	/*
    dispatch({
    	type: "MATURE_UNIT",
    	unitId: unitid
    }, MATURATION_TIME);
	*/

/*
	dispatch({
		type: "ADD_FOOD",
		amount: 500,
		x: 200,
		y: 400,
		id: uuid.v1()
	});




	dispatch({
		type: "ADD_UNIT",
		DNA: Dna4,
		x: 650,
		y: 400
	}, 140);
	dispatch({
		type: "ADD_UNIT",
		DNA: Dna4,
		x: 650,
		y: 500
	}, 140);		

	dispatch({
		type: "ADD_UNIT",
		DNA: Dna4,
		x: 700,
		y: 150
	}, 160);		
	*/
}