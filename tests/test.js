var assert = require('assert');

import Game from '../src/scripts/lib/Game.js'
import { Dna1 } from '../src/scripts/mock/dna'
import DNA from '../src/scripts/lib/DNA'

var game = new Game();

describe('DispatchAddUnit', function () {
	it('should create a unit', function(done) {
		const { simulation, universe } = game;
		simulation.dispatch({
			type: "ADD_UNIT",
			DNA: DNA.encodeDna(Dna1),
			x: 450,
			y: 100,
			id: 55
		});
		simulation.start();
		setTimeout(()=> {
			let exists = (universe.getMapObject(55) !== -1);
			assert.equal(true, exists);
			simulation.pause();
			done();
		}, 1000)
	});
});