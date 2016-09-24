

class DelayChain {

	constructor() {
		this.timeout  = null;
		this.delays   = [];
		this.curr     = 0;
	}

	_setNextTimeout() {
		// If there are no more functions in the queue
		if (this.curr >= this.delays.length) {
			this._reset();
			return;
		}
		var nextFunc = this.delays[this.curr].func;
		var nextMs   = this.delays[this.curr].ms;
		this.timeout = window.setTimeout(() => {
			nextFunc();
			this.curr++;
			this._setNextTimeout();
		}, nextMs);
	}

	_reset() {
		this.timeout  = null;
		this.delays   = [];
		this.curr     = 0;
	}

	/**
   	* Cancel the current execution chain
   	*/
	cancel () {
		window.clearTimeout(this.timeout);
		this._reset();
	}

	/**
   	* Add a new delayed function to the chain
   	* @param {int} ms Number of milliseconds to delay execution of func
   	* @param {function} func Function to execute after delay
   	* @return {DelayChain} This DelayChain object
   	*/
	delay(ms, func) {
		// Queue up the next function
		this.delays.push({
			ms: ms,
			func: func
		})

		// Start executing the chain if we havent started
		if (this.timeout === null) {
			this._setNextTimeout();
		}

		// Return this so we can chain up delays
		return this;
	}
}

export default DelayChain
