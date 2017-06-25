

import React from "react"
import ReactDOM from "react-dom"
import { connect } from "react-redux"
import DnaBlueprint from "./DnaBlueprint"
import Roo from '../../../../react-oo';
import {
	MUTATION_TIME
} from "../settings"

class MutationPanel extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			startedMutationAt: null,
			complete: false
		}
	}

	componentWillReceiveProps (nextProps) {
		if (!this.props.mutatingSpecies && nextProps.mutatingSpecies) {
			this.intervalId = window.setInterval(this.progressTimer, 100);
			this.setState({
				startedMutationAt: Date.now()
			})
		}
		else if (this.props.mutatingSpecies && !nextProps.mutatingSpecies) {
			//window.clearInterval(this.intervalId);
			this.mutationFinished();
		}
	}


	mutationFinished() {
		window.clearInterval(this.intervalId);
		this.setState({
			complete: true
		})
		setTimeout(() => {
			this.setState({
				complete: false
			})
		}, 2000);
	}

	progressTimer = () => {
		let now = Date.now();
		let duration = now - this.state.startedMutationAt;
		let progress = duration / MUTATION_TIME;

		this.progressEl.style.width = (progress * 100) + "%";

		if (progress >= 1) {
			window.clearInterval(this.intervalId);
		}

		console.log("This is the progress!", duration, progress);

	}

	render() {
		const { mutatingSpecies, mutatedSpecies } = this.props;
		const { complete } = this.state;
		
		if (mutatingSpecies) {

			return (
				<div className="mutation-panel">
					<div className="mutation-panel__heading">
						Mutating species...
					</div>
					<div className="mutation-panel__species">
						<DnaBlueprint dna={mutatingSpecies.encodedDna} width={50} height={50} />
			      		<i className="fa fa-arrow-right"></i> 
			      		<DnaBlueprint dna={mutatedSpecies.encodedDna} width={50} height={50} />
		      		</div>
		      		<div className="mutation-panel__progress">
			      		<div className="mutation-panel__progress-inner" ref={(el) => { this.progressEl = el; }}>
			      		</div>
		      		</div>
		      	</div>
			)
		}
		else if (complete) {
			return (
				<div className="mutation-panel">
					<div className="mutation-panel__heading">
						Mutation complete!
					</div>
				</div>
			)
		}

		return null;
	}
}
/*
function select(state) {

  const { gameState } = state;
  let mutatedSpecies;
  let mutatingSpecies = gameState.species.find(s=> s.mutatingTo !== null);

  if (mutatingSpecies) {
  	mutatedSpecies = gameState.species.find(s=> s.id === mutatingSpecies.mutatingTo);
  	return {
  		mutatingSpecies: mutatingSpecies,
  		mutatedSpecies: mutatedSpecies
  	}
  }
  else {
  	return {
		mutatingSpecies: null,
  		mutatedSpecies: null  		
  	}
  }
}
*/

function mapToProps(objs) {
	let mutations = objs.game.getMyMutations();
	return {
		mutatingSpecies: mutations.mutatingSpecies,
		mutatedSpecies: mutations.mutatedSpecies
	}
}

export default Roo.connect(mapToProps)(MutationPanel);

