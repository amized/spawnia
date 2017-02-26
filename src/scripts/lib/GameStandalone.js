
import Game from './Game'
import Gameloop from './Gameloop'
import { ENGINE_STEP_TIMEOUT, GAME_STEP_TIMEOUT, ACTION_BROADCAST_TIMEOUT } from "../settings"

const GAME_STEP_INTERVAL = GAME_STEP_TIMEOUT / ENGINE_STEP_TIMEOUT;
const ACTION_BROADCAST_INTERVAL = ACTION_BROADCAST_TIMEOUT / ENGINE_STEP_TIMEOUT;

export default class GameStandalone extends Game {

	constructor(makeWorld) {
		super(makeWorld);
		
		this.simulation.onAfterUpdate = (currStep) => {
			if (currStep % GAME_STEP_INTERVAL === 0) {
				//let state = this.universe.getState();
				let state = this.universe;
				Gameloop.onStep(currStep, state, this.simulation.dispatch);
			}
		}
	}

	run() {
		super.run();
	}
}

