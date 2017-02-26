import React from "react"
import ReactDOM from "react-dom"
import moment from "moment"
import DnaBlueprint from "./DnaBlueprint"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { 
	ENERGY_COST_PER_CELL, 
	UNIT_START_ENERGY_PER_CELL, 
	ENERGY_STORAGE_PER_FAT 
} from "../settings"

import {
	LIFESTATE_DEAD
} from "../constants"


function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  return {
    'total': t,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}



export default class SpeciesViewerPanel extends React.Component {

	componentDidMount() {
		this.refreshTimer = setInterval(()=>{
			this.forceUpdate();
		}, 500);
	}

	componentWillUnmount() {
		console.log("Unmounting species viewpeanel");
		clearInterval(this.refreshTimer);
	}

	close = (e) => {
		this.props.selectSpecies(null);
	}

	render() {
		let age;
		let species = this.props.species;
		let universe = this.props.universe;
		let name = (species && species.name) ? species.name : species.encodedDna;
		let adam = species.adam;
		
		if (adam) {
			let t = Math.floor(moment().diff(adam.bornAt));
			let seconds = Math.floor((t / 1000) % 60);
			let minutes = Math.floor((t / 1000 / 60) % 60);
			let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
			seconds = ('0' + seconds).slice(-2);
			hours = ('0' + hours).slice(-2);
			minutes = ('0' + minutes).slice(-2);
			age = minutes + ":" + seconds;
		}

		let popPercent = Math.floor(species.population/universe.getNumMaturedUnits() * 100) + "%";
		

		return (
			<div className="species-viewer-panel"> 
				<div className="unit-panel__heading">SPECIES</div> 
				<div className="species-viewer-panel__name">{ name }</div>  
				<div className="unit-panel__inner">
					<div className="unit-panel__close" onClick={this.close}>
						&#10005;
					</div>
					<div className="species-viewer-panel__main" key={species.encodedDna} >
						<DnaBlueprint dna={species.encodedDna} width={160} height={160} />   
						<div className="unit-panel__stats stats-container"> 
			                <div className="stats-item">Current pop: <span>{species.population}</span></div>
			                <div className="stats-item">Percentage pop: <span>{popPercent}</span></div>
			                <div className="stats-item">Total ever: <span>{species.totalPopulation}</span></div>
			                <div className="stats-item">Age: <span>{age}</span></div>
		                </div>
	                </div>
                </div>
            </div>
       	);
	}
}


