
import DNA from '../lib/DNA'

import { Dna1, Dna2, Dna3, Dna4, Dna5, Dna6 } from "../mock/dna";
import uuid from 'uuid'
import Unit from "../lib/Unit"
import { Food } from "../lib/Food"

// Must return a bunch of game actions. Actions get called in order of 
function gameStateA() {

	return [




		{
			type: "ADD_UNIT",
			dna: DNA.encodeDna(Dna3),
			x: 200,
			y: 450,
			id: uuid.v1(),
			bornAt: 0,
			speciesId: 0
		},
		{
			type: "ADD_UNIT",
			dna: "S(X(,X(F,E,R),G),F,E,R)",
			x: 400,
			y: 450,
			id: uuid.v1(),
			bornAt: 0,
			speciesId: 0
		},
		{
			type: "ADD_UNIT",
			dna: DNA.encodeDna(Dna3),
			x: 200,
			y: 450,
			id: uuid.v1(),
			bornAt: 0,
			speciesId: 0
		},
		{
			type: "ADD_FOOD",
			amount: 2000,
			x: 200,
			y: 450,
			id: uuid.v1()
		},
		{
			type: "ADD_FOOD",
			amount: 2000,
			x: 600,
			y: 450,
			id: uuid.v1()
		},
		{
			type: "ADD_STATIC_BLOCK",
			x: 100,
			y: 100,
			width: 500,
			height: 20,
			id: uuid.v1()
		},
		{
			type: "ADD_STATIC_BLOCK",
			x: 100,
			y: 600,
			width: 500,
			height: 20,
			id: uuid.v1()
		},
		{
			type: "ADD_STATIC_BLOCK",
			x: 10,
			y: 350,
			width: 20,
			height: 500,
			id: uuid.v1()
		},
	];
}


export {
	gameStateA
}