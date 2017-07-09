import React from "react"
import ReactDOM from "react-dom"
import { stepsToMs, formatTime } from "../lib/Utils/utils";

export default class GameTimer extends React.Component {

	componentDidMount() {
		this.interval = setInterval(() => {
			this.forceUpdate();
		}, 1000);
	}

	componeneWillUnmount() {
		clearInterval(this.interval);
	}

	render() {

		const game = this.props.game;
		const timeRemaining = formatTime(game.gameDuration - stepsToMs(game.simulation.getCurrStep()));

		return (
			<div className="game-timer">
				<div className="game-timer__heading">
					Time left:
				</div>
				<div className="game-timer__time">{ timeRemaining }</div>
			</div>
		)
	}

}