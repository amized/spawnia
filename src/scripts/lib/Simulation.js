
import { Events, Engine, World, Bodies, Body, Query } from "matter-js"
import runAction from "./Actions"
import _ from "underscore";
import $ from "jquery";
import { ENGINE_STEP_TIMEOUT, GAME_STEP_TIMEOUT } from "../settings"
import { msToSteps } from "./Utils/utils";

const GAME_STEP_INTERVAL = GAME_STEP_TIMEOUT / ENGINE_STEP_TIMEOUT;

export default class Simulation {


	constructor (engine, universe, options) {

		const defaults = {
			runGameLoop: true,
			onAfterUpdate: null,
			cachePastEventsTo: 5000
		}

		Object.assign(this, defaults, options);

		this.universe = universe;
		this.events = [];
		this.pastEvents = [];
		this.timer = null;
		this.curr = 0;
		this.running = false;

		// create an engine
		this.engine = engine;
		this.dispatch = this.dispatch.bind(this);

	}

	_step() {


		// Consume any outstanding events
		let evt = this.events[0];

		// The while loop here makes sure we only look at events of the past
		// and will only check ones dispatched in the current step in the next step
		while (evt && evt.timeout < this.curr) {
			if (evt.timeout === this.curr - 1) {
				//console.log("running: " + evt.timeout + " " + evt.action.type);
				runAction(evt.action, this.universe, this.curr);
			}
			else {
				console.log("Warning we are trying to run an event of the past: ", this.curr, evt.timeout);
			}
			let removed = this.events.shift();
			this.pastEvents.push(removed);

			if (this.pastEvents.length > 200) {
				this.pastEvents = [];
			}

			evt = this.events[0];
		}

		// Update the physics engine
		Engine.update(this.engine, ENGINE_STEP_TIMEOUT);

		// Increment step counter
		this.curr++;

		if (this.onAfterUpdate) {
			this.onAfterUpdate(this.curr);
		}
	}

	getEngine() {
		return this.engine;
	}

	getCurrStep = () => {
		return this.curr;
	}

	setCurrStep(stepNum) {
		this.curr = stepNum;
	}

	getPastEventsTo(stepNum) {
		let events = this.pastEvents.filter((evt)=>{
			return evt.timeout >= stepNum;
		});
		this.pastEvents = [];
		return events;
	}

	getPastEvents() {
		let events = this.pastEvents.slice();
		this.pastEvents = [];
		return events;
	}

	reset() {
		this.pause();
		this.curr = 0;
		this.events = [];
		this.pastEvents = [];		
	}

	resume(stepNum) {
		if (stepNum) {
			console.log("RESUMING FROM: ", stepNum);
			this.curr = stepNum;
		}
		this.start();
	}

	start () {
		console.log("Starting simulation");
		clearInterval(this.timer);
		this.running = true;
        this.timer = setInterval(() => {
        	this._step();
        }, ENGINE_STEP_TIMEOUT);
	}

	pause() {
		clearInterval(this.timer);
		this.running = false;
	}

	isRunning() {
		return this.running;
	}


	// Dispatch
	// Delay is default 1 step, meaning any dispatch calls
	// are always delayed until the current step is complete
	/*
		All events that are dispatched are placed in a queue
		and added to an events list. The events which
		have a delay of 0 (default) get assigned a timeout of this.curr.

		This means we want the event to fire in the current step. 



	 */
	dispatch (action, delay = 0, absTimeout = null) {
		let evt = {
			timeout: (absTimeout) ? absTimeout : this.curr + msToSteps(delay),
			action: action
		};

		let sortedIndex = _.sortedIndex(this.events, evt, 'timeout');
		this.events.splice(sortedIndex, 0, evt);
	}

	bufferEvents(events) {
		// This method is used by the game client to buffer events
		// that were already dispatched and run on the server
		// Therefor we assume that this method is always dumping the
		// latest set of events

		// Check we are in order
		if (this.events.length > 0) {
			let latest = this.events[this.events.length-1].timeout;	
			if (events[0].timeout < latest) {
				throw "ERROR Trying to buffer events out of order: My latest " + latest + " Recieved earliest: " + events[0].timeout;
				return;
			}		
		}

		this.events = this.events.concat(events);
	}


}