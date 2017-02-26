import React, {Component, PropTypes} from 'react';
import { stepsToMs, formatTime } from "../lib/Utils/utils";
export default class WorldTimer extends Component {


	static propTypes = {
		getCurrStep: PropTypes.func
	}

	constructor(props) {
		super(props);
		this.state = {
			currStep: 0
		}
	}

	componentDidMount() {
		this.interval = setInterval(()=>{
			this.setState({
				currStep: stepsToMs(this.props.getCurrStep())
			})
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {

		const time = formatTime(this.state.currStep);

		return (
			<div className="world-timer">
				{time}
			</div>
		)
	}

}