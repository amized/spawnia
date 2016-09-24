
import { Events, Engine, World, Bodies, Body, Query } from "matter-js"
import runAction from "./Actions"
import _ from "underscore";
import $ from "jquery";

const stepTimeout = 1000/60;

export default class Simulation {


	constructor (engine, universe) {
		this.universe = universe;
		this.events = [];
		this.pending = [];
		this.timer = null;
		this.curr = 0;

		// create an engine
		this.engine = engine;

		this.dispatch = this.dispatch.bind(this);

		$(window).blur(()=>{
		  this.pause();
		});
		$(window).focus(()=>{
		  this.resume();
		});

	}

	_step() {	

		// Update the physics engine
		//Engine.update(this.engine, stepTimeout, 1);

		// Consume any outstanding events
		let evt = this.events[0];
		while (evt && evt.timeout < this.curr) {
			//console.log("executing event ", evt.action,evt.timeout);
			runAction(evt.action, this.universe, this.dispatch.bind(this));
			this.events.shift();
			evt = this.events[0];
		}

		// Add any qued dispatches to the events list,
		// to be executed in further _step calls
		this.pending.forEach((evt, index) => {
			// Add them in order of their timeout property
			let sortedIndex = _.sortedIndex(this.events, evt, 'timeout');
			this.events.splice(sortedIndex, 0, evt);
		});
		this.pending = [];

		// Increment step counter
		this.curr++;
	}

	getEngine() {
		return this.engine;
	}

	start () {
		this.running = true;
		console.log("The engine", this.engine);
		//this.engine.isFixed = true;
		Engine.run(this.engine);
		Events.on(this.engine, "afterUpdate", this._step.bind(this));
		/*
        this.timer = window.setInterval(() => {
        	this._step();
        }, stepTimeout);
        */
	}

	pause() {
		this.engine.enabled = false;
	}

	resume() {
		this.engine.enabled = true;
	}

	dispatch (action, delay = 1) {
		let evt = {
			timeout: this.curr + (Math.floor(delay/stepTimeout)),
			action: action
		};
		this.pending.push(evt);
	}


}