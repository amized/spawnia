var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');
var connect = require("react-redux").connect;
import { PropTypes } from "react"
import { Composite, Mouse, Bounds, Events } from "matter-js"

import World from './World.jsx';
import MapEvents from "./MapEvents.jsx";
import ControlPanel from './ControlPanel.jsx';
import DNA from '../lib/DNA';
import uuid from 'uuid'
import { 
	PLAYSTATE_PLAYING, 
	PLAYSTATE_PAUSED,
	GAME_STAGE_NOGAME,
	GAME_STAGE_BUILDINGSPECIES,
	GAME_STAGE_PLACESPECIES,
	GAME_STAGE_READY_TO_START,
	GAME_STAGE_WATCHING,
	GAME_STAGE_ENDED,
	GAME_STAGE_ENDED_DEATH,
	GAME_STAGE_ENDED_TIMEOUT
} from "../constants";

import {
	MUTATION_TIME
} from "../settings";

import { getCanvasDimensions } from "../lib/Utils/utils";
import Modals from "./Modals";
import { newGame, startSpeciesPlacement, startSimulation } from "../actions";
import SpeciesEditor from "./SpeciesEditor.jsx"
import NotificationBar from "./NotificationBar"
import DnaBlueprint from "./DnaBlueprint"
import Roo from '../../../../react-oo';

class Game extends React.Component {

	static propTypes = {
		game: PropTypes.object
	}

	static defaultProps = {
	}


	constructor(props) {
		super(props);

		const canvasSize = getCanvasDimensions();

		this.state = {
			selectedUnit: null,
			selectedSpecies: null,
			hoveredUnit: null,
			playState: PLAYSTATE_PLAYING,
			speciesPlacementHelperOpen: false,
			primaryModalOpen: false,
			zoom: 1,
			viewportBoundingBox: {
				min: { 
					x: 0,
					y: 0
				}, 
				max: { 
					x: canvasSize.width,
					y: canvasSize.height
				}
			},
			isEditingMutation: false
		}
	}

	componentDidMount() {
		
		const canvasSize = getCanvasDimensions();
		this.updateViewportBB({
			min: { 
				x: 0,
				y: 0
			}, 
			max: { 
				x: canvasSize.width,
				y: canvasSize.height
			}
		});
		
		window.onresize = this.onWindowResize;
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.playState !== this.state.playState) {

			if (this.state.playState === PLAYSTATE_PLAYING) {
				this.props.simulation.resume();
			}
			else {
				this.props.simulation.pause();
			}
		}

	}


	onWindowResize = () => {
		
		const canvasSize = getCanvasDimensions();
		let currBB = this.state.viewportBoundingBox;
		let zoom = this.state.zoom;

		this.updateViewportBB({
			min: { 
				x: currBB.min.x,
				y: currBB.min.y
			}, 
			max: { 
				x: currBB.min.x + canvasSize.width*zoom,
				y: currBB.min.y + canvasSize.height*zoom
			}
		});
	}

	onZoom = (factor, focalPoint) => {
		const bb = Object.assign({}, this.state.viewportBoundingBox);
		const maxZoom = Math.pow(1.2, 3);
		const minZoom = 1/maxZoom;
		let zoom = factor === "in" ? this.state.zoom * 1.2 : this.state.zoom / 1.2;

		if (zoom > maxZoom) {
			zoom = maxZoom;
		}
		else if (zoom < minZoom) {
			zoom = minZoom;
		}

		let offset = {
			x: (focalPoint.x-bb.min.x)/(bb.max.x-bb.min.x), 
			y: (focalPoint.y-bb.min.y)/(bb.max.y-bb.min.y)
		}

		const canvasSize = getCanvasDimensions();
		const bbWidth = canvasSize.width * zoom;
		const bbHeight = canvasSize.height * zoom;
 

		bb.min.x = focalPoint.x - bbWidth * (offset.x);
		bb.min.y = focalPoint.y - bbHeight * (offset.y);

		bb.max.x = focalPoint.x + bbWidth * (1 - offset.x);
		bb.max.y = focalPoint.y + bbHeight * (1 - offset.y);

		this.updateViewportBB(bb);
	}

	updateViewportBB = (boundingBox) => {


		const bb = Object.assign({}, boundingBox);
		const mapSize = this.props.game.universe.getMapSize();

		let bbHeight = bb.max.y - bb.min.y;
		let bbWidth = bb.max.x - bb.min.x;
		
		if (bbWidth > mapSize.width) {
			let scale = mapSize.width / bbWidth;
			bb.min.x = 0;
			bb.max.x = mapSize.width;
			bb.max.y = bb.min.y + (bbHeight * scale);
			bbHeight = bb.max.y - bb.min.y;
			bbWidth = mapSize.width;
		}
		else {
			// Adjust if we went beyond the edge of map
			if (bb.min.x < 0) {
				bb.max.x -= bb.min.x;
				bb.min.x = 0;
			}
			if (bb.max.x > mapSize.width) {
				bb.min.x -= (bb.max.x - mapSize.width);
				bb.max.x = mapSize.width;
			}
		}

		if (bbHeight > mapSize.height) {
			let scale = mapSize.height / bbHeight;
			bb.min.y = 0;
			bb.max.y = mapSize.height;
			bb.max.x = bb.min.x + ((bb.max.x - bb.min.x) * scale);
			bbHeight = mapSize.height;
			bbWidth = bb.max.x - bb.min.x;
		}
		else {
			// Adjust if we went beyond the edge of maps
			if (bb.min.y < 0) {
				bb.max.y -= bb.min.y;
				bb.min.y = 0;
			}
			if (bb.max.y > mapSize.height) {
				bb.min.y -= (bb.max.y - mapSize.height);
				bb.max.y = mapSize.height;
			}            
		}

		const canvasSize = getCanvasDimensions();
		const zoom = bbWidth / canvasSize.width;

		this.setState({
			viewportBoundingBox: bb,
			zoom: zoom
		});
	}


	togglePlayState() {
		this.setState({
			playState: this.state.playState === PLAYSTATE_PAUSED ? PLAYSTATE_PLAYING : PLAYSTATE_PAUSED
		})
	}

	onWorldMove(e) {
		console.log("world move");
	}

	onUnitClick (unitId) {
		if (this.state.selectedUnit !== null && this.state.selectedUnit.id === unitId) {
			this.setState({
				selectedUnit: null
			});
			return;
		}
		let unit = this.props.game.universe.getMapObject(unitId);
		this.setState({
			selectedUnit: unit,
			selectedSpecies: null
		})
	}

	onMapClick(pos) {

		


		if (this.state.selectedUnit || this.state.selectedSpecies) {
			this.setState({
				selectedUnit: null,
				selectedSpecies: null
			})
		}
	}


	onMapDoubleClick(pos) {


		const { myPlayer, mySpecies, gameStage, game } = this.props;

		if (gameStage === GAME_STAGE_PLACESPECIES && mySpecies.length > 0) {
			game.placeUnit(pos, mySpecies[0].id);
			/*
			this.setState({
				showStartSimulationDialog: true
			})
			*/   
		}        
	}




	closeSpeciesPlacementHelper = () => {
		this.setState({
			speciesPlacementHelperOpen: false
		})
	}

	closePrimaryModal = () => {
		this.setState({
			primaryModalOpen: false
		})
	}


	onUnitHover (unitId) {
		let unit = this.props.game.universe.getMapObject(unitId);
		this.setState({
			hoveredUnit: unit
		})
	}

	unselectUnit () {
		this.setState({
			selectedUnit: null
		});
	}

	saveNewSpecies = (species) => {
		this.props.game.saveInitSpecies(species);
	}

	editSelectedSpecies = () => {
		//this.props.dispatch(startSpeciesBuild());
	}

	closeSpeciesEditor = () => {
		this.setState({
			isEditingMutation: false
		})
	}


	selectSpecies (species) {
		this.setState({
			selectedSpecies: species,
			selectedUnit: null
		});
	}

	isUnitSelected(unit) {
		return (
			this.state.selectedUnit === unit ||
			(this.state.selectedSpecies && this.state.selectedSpecies.encodedDna === unit.encodedDna)
		);
	}

	startSpeciesPlacement = () => {
		this.props.game.changeGameStage(GAME_STAGE_BUILDINGSPECIES);
	}

	onEditMutation = () => {
		this.setState({
			isEditingMutation: true
		})
	}

	applyMutation = (newSpecies, ancestorSpeciesId) => {
		//this.props.game.applyMutation(newSpecies, ancestorSpeciesId);
		let startAction = {
            type: "APPLY_MUTATION",
            newDna: newSpecies.encodedDna,
            ancestorSpeciesId: ancestorSpeciesId
        }

        let stopAction = {
            type: "STOP_MUTATION",
            ancestorSpeciesId: ancestorSpeciesId              
        }

		this.props.game.simulation.dispatch(startAction);
		this.props.game.simulation.dispatch(stopAction, MUTATION_TIME);

		this.setState({
			isEditingMutation: false
		});
	}

	renderNotification() {

		const { game } = this.props;
		const gameStage = game.gameStage;


					newSpecies ?
						<NotificationBar show={gameStage === GAME_STAGE_PLACESPECIES}>
						   <DnaBlueprint dna={newSpecies.encodedDna} width={40} height={40} /> 
						   Double click on the map to place your new species!
						   <button onClick={this.editSelectedSpecies}>Edit</button>
						</NotificationBar>
					:
						null


	}

	render () {

		let { dispatch, getCurrStep, mySpecies, myPlayer, gameStage, game } = this.props;
		const { universe, engine } = game;

		let mapSize = universe.getMapSize();
		let { 
			selectedUnit, 
			selectedSpecies, 
			hoveredUnit, 
			playState, 
			viewportBoundingBox,
			zoom,
			speciesPlacementHelperOpen,
			isEditingMutation,
			primaryModalOpen
		} = this.state;
		
		let style = {};
		let myAliveSpecies = mySpecies.filter(s => s.isAlive());

		if (hoveredUnit) {
			style.cursor="pointer";
		}

		let newSpecies;
		let notification = null;

		const isBuildingSpecies = gameStage === GAME_STAGE_BUILDINGSPECIES;
		const showPlaceSpeciesDialog = gameStage === GAME_STAGE_PLACESPECIES;

		if (showPlaceSpeciesDialog && mySpecies.length > 0) {
			newSpecies = mySpecies[0];
			notification = (
				<NotificationBar show={gameStage === GAME_STAGE_PLACESPECIES}>
				   <DnaBlueprint dna={newSpecies.encodedDna} width={40} height={40} /> 
				   Double click on the map to place your new species!
				   <button onClick={this.editSelectedSpecies}>Edit</button>
				</NotificationBar>
			)
		}
		return (
			<div style={style}>
				<World 
					universe={universe}
					engine={engine}
					syncStatus={this.props.syncStatus}
					onUnitClick={this.onUnitClick.bind(this)}
					onUnitHover={this.onUnitHover.bind(this)}
					onMapClick={this.onMapClick.bind(this)}  
					onMapDoubleClick={this.onMapDoubleClick.bind(this)}
					mapSize={mapSize}  
					updateViewportBB={this.updateViewportBB}  
					onZoom={this.onZoom} 
					zoom={zoom}             
					{...this.state}
				/>              
				<ControlPanel {...this.props}
					game={game}
					selectedUnit={selectedUnit}
					selectedSpecies={selectedSpecies}
					newSpecies={newSpecies}
					unselectUnit={this.unselectUnit.bind(this)} 
					selectSpecies={this.selectSpecies.bind(this)}
					togglePlayState={this.togglePlayState.bind(this)}
					getCurrStep={getCurrStep}
					viewportBoundingBox={viewportBoundingBox}
					mapSize={mapSize}
					updateViewportBB={this.updateViewportBB}
					onEditMutation={this.onEditMutation}
					notificationEl={notification}
					{...this.state}
				/>
				{
					isBuildingSpecies ?
						<SpeciesEditor 
							closeSpeciesEditor={this.closeSpeciesEditor}
							saveSpecies={this.saveNewSpecies}
							initialSpecies={null}
							editMode="CREATION"
						/>
					:
						null
				}

				{

					isEditingMutation ?
					  <SpeciesEditor 
							closeSpeciesEditor={this.closeSpeciesEditor}
							saveSpecies={this.applyMutation}
							initialSpecies={null}
							editMode="MUTATION"
							myPlayer={myPlayer}
							mySpecies={myAliveSpecies}
						/>
					:
						null
				}
				<Modals game={game} gameStage={game.gameStage} />
			</div>
			
		)
	}
}

function mapToProps(objs) {
	return {
		gameStage: objs.game.gameStage,
		mySpecies: objs.game.getMySpecies(),
		myPlayer: objs.game.myPlayer,
		getCurrStep: objs.game.simulation.getCurrStep
	}
}

export default Roo.connect(mapToProps)(Game);






