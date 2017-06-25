import React from "react"
import { PropTypes } from "react"
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

import { stepsToMs, formatTime } from "../lib/Utils/utils";


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

	static propTypes = {
		unit: PropTypes.object,
        universe: PropTypes.object,
        unselectUnit: PropTypes.func,
        selectSpecies: PropTypes.func
	}


	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.refreshTimer = setInterval(()=>{
			this.forceUpdate();
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.refreshTimer);
	}

	selectSpecies = (e) => {
		// TODO PUT THS BACK IN
		let species = this.props.unit.getSpecies();
		this.props.selectSpecies(species);
	}

	render() {
		const {unit} = this.props;
		if (!unit) {
			return <div></div>;
		}
		const ageMs = stepsToMs(unit.getAge(this.props.getCurrStep()));
		const age = formatTime(ageMs);
		const name = "Sme name man";
		//const species = this.props.universe.getSpeciesOfUnit(unit);

		//name = (species && species.name) ? "" + species.name + unit.speciesIndex : "Unit " + unit.id;

			//console.log("The unit we clicked on's dna:", unit.DNA);

		return (

			<div className="unit-panel"> 
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
								<DnaBlueprint dna={unit.getEncodedDna()} width={160} height={160} />   
								<div className="unit-panel__stats stats-container"> 
									<div className="stats-item">Name: <span>{ name ? name : "Selected Unit" }</span></div>
					                <div className="stats-item">Age: <span>{ age }</span></div>
					                <div className="stats-item">Generation <span>{ unit.generation }</span></div>
					                <div className="stats-item">Energy: <span>{ unit.energy + "/" + unit.energyStorage }</span></div>
					                <div className="stats-item">Children: <span>{ unit.children.length }</span></div>
					                <div className="stats-item">Status: <span>{ unit.lifeState }</span></div>
				                </div>
				                <div className="unit-panel__options">
		                		<button onClick={this.selectSpecies}>
			                		View species...
			                	</button>
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


