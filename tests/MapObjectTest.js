var assert = require('assert');

import Game from '../src/scripts/lib/Game.js'
import Simulation from '../src/scripts/lib/Simulation'
import { ENGINE_STEP_TIMEOUT } from '../src/scripts/settings.js' 
import { Bodies } from "matter-js"
import MapObject from '../src/scripts/lib/MapObject'
import { MAP_OBJ_GENERAL } from "../src/scripts/constants.js"
const game = new Game();

describe('MapObject', function () {

	it('should set the correct label on the body', function() {
		const body = Bodies.circle(0, 0, 10);
		const id = 1;
		const obj = new MapObject(body, id);
		assert.equal("GENERAL:1", body.label);
	});

});






