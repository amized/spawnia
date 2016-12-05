
import Game from './Game'
import Gameloop from './Gameloop'
import Channel from "./Channel.js";
import ActionBroadcaster from './ActionBroadcaster'
import { ENGINE_STEP_TIMEOUT, GAME_STEP_TIMEOUT, ACTION_BROADCAST_TIMEOUT } from "../settings"

const GAME_STEP_INTERVAL = GAME_STEP_TIMEOUT / ENGINE_STEP_TIMEOUT;
const ACTION_BROADCAST_INTERVAL = ACTION_BROADCAST_TIMEOUT / ENGINE_STEP_TIMEOUT;

export default class GameServer extends Game {

	constructor(makeWorld) {
		super(makeWorld);

		this.channel = new Channel(this.id);
		this.actionBroadcaster = new ActionBroadcaster(this.simulation, this.channel);

		this.simulation.onAfterUpdate = (currStep) => {
			if (currStep % GAME_STEP_INTERVAL === 0) {
				let state = this.universe.getState();
				Gameloop.onStep(state, this.simulation.dispatch);
			}
			if (currStep % ACTION_BROADCAST_INTERVAL === 0) {
				this.actionBroadcaster.onInterval();
			}
		}
	}

	run() {
		super.run();
	}
}

