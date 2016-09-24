

import React from "react"
import ReactDOM from "react-dom"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from "underscore"
import DnaBlueprint from "./DnaBlueprint"
import { 
	ENERGY_COST_PER_CELL, 
	UNIT_START_ENERGY_PER_CELL, 
	ENERGY_STORAGE_PER_FAT 
} from "../settings"



export default class SpeciesPanel extends React.Component {
	render() {

		// Sort the list by population and save the sorted index as a property on each item to allow ordering via css
		let sortByPop = _.sortBy(this.props.allSpecies, (species)=>{
			return -species.population;
		}).map((species,index) => {
			species.sortedIndex = index;
			return species;
		});
		// Re-sort the list by it's key, this will ensure that React never reorders the DOM elements
		let allSpecies = _.sortBy(sortByPop, "encodedDna");
		return (
			<div className="species-panel">
				<div className="species-panel__heading">Species</div>
				<div className="species-panel__list">
					<ReactCSSTransitionGroup transitionName="species-panel__item-wrapper" transitionEnterTimeout={600} transitionLeaveTimeout={600}>
					{
						allSpecies.map((species, index) => {
							return (
								<SpeciesItem 
									dispatch={this.props.dispatch} 
									species={species} 
									key={species.encodedDna} 
									index={species.sortedIndex}
									selectSpecies={this.props.selectSpecies}
								/>
							);
						})
					}   
					</ReactCSSTransitionGroup>
				</div>
            </div>
       	);
	}
}


class SpeciesItem extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			mode: "normal",
			nameValue: null
		}
	}

	onNameChange(e) {
		this.setState({
			nameValue: e.target.value
		});
	}

	onKeyUp(e) {
		if (e.keyCode == 13) {
			this.submitName();
		}
	}

	onMouseEnter(e) {
		this.props.selectSpecies(this.props.species);
	}

	onMouseLeave(e) {
		this.props.selectSpecies(null);
	}

	componentWillReceiveProps(nextProps) {
		// Got a name update
		if (nextProps.species.name !== this.props.species.name) {
			console.log("resetting to stuf");
			this.setState({
				nameValue: nextProps.species.name
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.mode !== this.state.mode) {
			if(this.state.mode ==="edit") {
				this.refs.input.focus();
			}
		}
	}

	submitName() {
		this.props.dispatch({
			type: "CHANGE_SPECIES_NAME",
			value: this.state.nameValue,
			encodedDna: this.props.species.encodedDna
		});
		//this.refs.input.blur();
		this.setState({
			mode: "normal"
		})		
	}

	editName() {
		this.setState({
			mode: "edit"
		});
	}

	render() {
		let { species, index } = this.props;
		//console.log("This is the state:", this.state);
		let isEdit = this.state.mode === "edit";
		let style = {
			transform: "translateX(" + index * 220	 + "px)"	
		}
		return (
			<div className="species-panel__item-wrapper" 
				style={style} 
				onMouseEnter={this.onMouseEnter.bind(this)}
				onMouseLeave={this.onMouseLeave.bind(this)}
			>
				<div className="species-panel__item">   
					
					<div className="species-panel__item-inner">
						<DnaBlueprint body={species.bodyTemplate} width={100} height={100} />
						<div className="species-panel__stats">
							<div>
							<div className="species-panel__stats-pop-title">Population: </div>
							<span className="species-panel__stats-pop">{species.population}</span>
							</div>
						</div>
					</div>
					{
						species.name && !isEdit ?
							<div onClick={this.editName.bind(this)} className="species-panel__item-name">{ this.state.nameValue }</div>
						:
							(
								species.population > 3 ?
									<input key={0}
										value={this.state.nameValue} 
										ref="input" 
										className="species-name__input" 
										onKeyUp={this.onKeyUp.bind(this)} 
										onBlur={this.submitName.bind(this)} 
										onChange={this.onNameChange.bind(this)} 
										type="text" 
										placeholder="Name this species"/>
								:
									null
							)
							
					}
					<div className="species-panel__item-title">{species.encodedDna}</div>
	            </div>
            </div>
       	);
	}
}

