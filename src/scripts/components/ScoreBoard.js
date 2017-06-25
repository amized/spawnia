

import React, {Component, PropTypes} from 'react';
//import { connect } from "react-redux"
import DnaBlueprint from "./DnaBlueprint"
import throttle from 'react-throttle-render'
import Roo from '../../../../react-oo';

class ScoreBoard extends Component {
	constructor(props) {
		super(props);
		this.renderCount = 0;
	}

	selectSpecies = (species) => {
		this.props.selectSpecies(species);
	}

	render() {
		const { speciess, players } = this.props;
		const playerScores = players.map(player => player.getScore(speciess));
		//const total = Math.max.apply(null, playerScores);
		const total = playerScores.reduce((a,b)=> a + b , 0);
		const maxSpeciesScore = Math.max.apply(null, speciess.map(s => s.getScore()));
		const avSpeciesScore = total / speciess.length;

		return (
			<div className="score-board">
				<div className="species-panel__heading">Scores</div>
				<div className="score-board__list">
				{
					players.map((player, index) => {
						const playerSpecies = speciess.filter(s => s.playerId === player.id);
						return <ScoreBoardPlayer 
							player={player} 
							playerSpecies={playerSpecies} 
							selectSpecies={this.selectSpecies} 
							total={total}
							score={playerScores[index]}
							maxSpeciesScore={maxSpeciesScore}
							avSpeciesScore={avSpeciesScore}
							key={index}
						/>
					})

				}
				</div>
			</div>
		)
	}
}

ScoreBoard = Roo.connect()(ScoreBoard);



class ScoreBoardPlayer extends Component {
	render() {
		const { playerSpecies, player, total, score, maxSpeciesScore, avSpeciesScore } = this.props;
		const barHeight = total === 0 ? "0" : (score*100/total) + "%";
		return (
			<div className="score-board__player">
				<div className="score-board__top">
					<div className="score-board__player-flag" style={{background: "#"+ player.color}}></div>
					<div className="score-board__player-name">{ player.name }</div>
				</div>
				<div className="score-board__bottom">
					<div className="score-board__bar">
						<div className="score-board__bar-inner" style={{height: barHeight}}>
						</div>
					</div>
					<div className="score-board__score">{score}</div>
					{
						playerSpecies.filter(s=>s.population > 0).map((species, index) => {
							return <ScoreBoardSpecies 
								key={index}
								species={species} 
								maxSpeciesScore={maxSpeciesScore} 
								avSpeciesScore={avSpeciesScore} 
								selectSpecies={this.props.selectSpecies} />
						})
					}
				</div>
			</div>
		)
	}
}

class ScoreBoardSpecies extends Component  {
	render() {
		const { species, maxSpeciesScore, avSpeciesScore } = this.props;
		const score = species.getScore();
		const minBarSpan = 200;
		let percent = 0;
		//const percent = score*100/maxSpeciesScore;
		//const upperLimit = 2; // This means 2 X the average represents 100% on the bar
		//const percent = ((score / upperLimit)/avSpeciesScore) * 100;

		if (maxSpeciesScore > minBarSpan * 0.9) {
			percent = ((score * 0.9) / maxSpeciesScore) * 100;
		}
		else {
			percent = (score / minBarSpan) * 100;
		}

		return (
			<div className="score-board__species">
				<HealthBar percent={percent} />
				<DnaBlueprint dna={species.encodedDna} width={44} height={44} onClick={this.props.selectSpecies.bind(this, species)} />
			</div>
		)
	}
}

//ScoreBoardSpecies = Roo.connect()(ScoreBoardSpecies);


class HealthBar extends Component  {

	static propTypes = {
		percent: PropTypes.number
	}


	getColor(percent) {

		const numSteps = 8;
		const step = Math.floor((parseInt(percent) / 100) * numSteps);
		switch (step) {
			case 8:
				return "23DA16";
			case 7: 
				return "5DDA18";
			case 6:
				return "95DA1B";
			case 5:
				return "CCDA1S";
			case 4:
				return "DBB420";
			case 3:
				return "DB8122";
			case 2:
				return "DB4E25";
			case 1:
				return "DC2732";
			case 0:
				return "DC2732";
			default:
				return "000000";
		}
	}

	render () {
		let { percent } = this.props;
		
		percent = Math.min(percent, 100);
		const color = this.getColor(percent);
		const barHeight = percent === 0 ? "0" : percent + "%";
		const style={
			height: barHeight,
			backgroundColor: "#" + color
		}
		return (
			<div className="health-bar">
				<div className="health-bar__inner" style={style}>
				</div>
			</div>
		)
	}

}



export default ScoreBoard;