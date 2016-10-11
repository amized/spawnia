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



export default class UnitPanel extends React.Component {
	selectSpecies = (e) => {
		let species = this.props.universe.getSpeciesOfUnit(this.props.unit);
		this.props.selectSpecies(species);
	}

	render() {
		let name, age, species;
		let unit = this.props.unit;
		if (unit) {
			let t = Math.floor(moment().diff(unit.bornAt));
			let seconds = Math.floor((t / 1000) % 60);
			let minutes = Math.floor((t / 1000 / 60) % 60);
			let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
			seconds = ('0' + seconds).slice(-2);
			hours = ('0' + hours).slice(-2);
			minutes = ('0' + minutes).slice(-2);
			age = minutes + ":" + seconds;

			species = this.props.universe.getSpeciesOfUnit(unit);

			name = (species && species.name) ? "" + species.name + unit.speciesIndex : "Unit " + unit.id;

			//console.log("The unit we clicked on's dna:", unit.DNA);
			
		}
		
		return (
			<div className="unit-panel"> 
				<div className="unit-panel__heading">{ name ? name : "Selected Unit" }</div>  
				<div className="unit-panel__inner">
					<div className="unit-panel__close" onClick={this.props.unselectUnit}>
						&#10005;
					</div>
					<div className="unit-panel__content">
					<ReactCSSTransitionGroup 
						transitionName="unit-panel-content" 
  						transitionEnterTimeout={500} 
  						transitionLeaveTimeout={500}
  					>
					{
						(unit.lifeState === LIFESTATE_DEAD) ? 
							<div key={-1} className="unit-panel__dead">
								<div className="unit-panel__dead-tomb">{name}</div>
								<div>He was a good kid.</div>
							</div>
						:
							<div className="unit-panel__unit" key={1}>
								<DnaBlueprint dna={unit.DNA} width={160} height={160} />   
								<div className="unit-panel__stats stats-container"> 
					                <div className="stats-item">Age: <span>{ age }</span></div>
					                <div className="stats-item">Generation <span>{ unit.generation }</span></div>
					                <div className="stats-item">Energy: <span>{ unit.energy + "/" + unit.energyStorage }</span></div>
					                <div className="stats-item">Children: <span>{ unit.children.length }</span></div>
					                <div className="stats-item">Status: <span>{ unit.lifeState }</span></div>
					                <div className="stats-item"> 
					                	<span className="stats-item__link" onClick={this.selectSpecies}>
					                		View species...
					                	</span>
					                </div>
				                </div>
			                </div>
					}
					</ReactCSSTransitionGroup>
					</div>

                </div>
            </div>
       	);
	}
}


