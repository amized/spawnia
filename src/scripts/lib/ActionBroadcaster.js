


/**** Broadcasts actions to all clients in clusters ****/

export default class ActionBroadcaster {

	constructor(simulation, channel) {
		this.channel = channel;
		this.simulation = simulation;
		this.lastUpdatedStep = 0;
		this.currUpdatedStep = 0;
	}

	onInterval = () => {
		let simulation = this.simulation;
		let events = simulation.getPastEvents();
		//console.log("The past events:", events);
		let curr = simulation.getCurrStep();
		let data = {
			events: events,
			fromStep: this.lastUpdatedStep,
			toStep: curr
		}
		this.channel.broadcastUpdate(data);
		this.lastUpdatedStep = curr;
	}



}