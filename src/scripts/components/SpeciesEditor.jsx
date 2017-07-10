

import React from "react"
import ReactDOM from "react-dom"
import { PropTypes } from "react"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from "underscore"
import DnaBlueprint from "./DnaBlueprint"
import CellMenu from "./SpeciesEditor/CellMenu"
import SpeciesSelector from "./SpeciesEditor/SpeciesSelector"
import { 
	ENERGY_COST_PER_CELL, 
	UNIT_START_ENERGY_PER_CELL, 
	ENERGY_STORAGE_PER_FAT 
} from "../settings"
import CellTypes from "../lib/CellTypes";
import ClassNames from 'classnames';
import UnitBuilder from '../lib/UnitBuilder';
import { getNewCellPosFromParent, DIR } from '../lib/Geometry.js';
import Species from "../lib/Species";
import DNA from '../lib/DNA';
import Dna from "../lib/DnaClass";
import tinycolor from "tinycolor2"
import Roo from '../../../../react-oo';

const resetCellState = [
	{
		type: "S",
		position: {
			x:0,
			y:0
		}
	},
	{
		type: null,
		position: {
			x: 0,
			y: 0
		}
	}
]



function makeCell(parent, type, x, y, index, direction) {
    return {
    	parent,
    	type,
    	x,
    	y,
    	index,
    	direction
    }
}


const initialCellsState = [makeCell(null, "S", 0, 0, 0, DIR.NORTH)];


class SpeciesEditor extends React.Component {


	static propTypes = {
		myPlayer: PropTypes.object,
		mySpecies: PropTypes.array,
		initialSpecies: PropTypes.object,
		saveSpecies: PropTypes.func,
		onClose: PropTypes.func,
		editMode: PropTypes.string, // "MUTATION" or "CREATION"
	}

	static defaultProps = {
		myPlayer: null
	}

	constructor(props) {
		super(props);
		let species, dna, ancestorSpeciesId;

		if (props.editMode === "MUTATION" && props.mySpecies.length > 0) {
			let encodedDna = props.mySpecies[0].dna.getEncodedDna();
			species = new Species(encodedDna);
			ancestorSpeciesId = props.mySpecies[0].id;
			console.log("acestor species id", ancestorSpeciesId);
		}
		else {
			if (props.initialSpecies) {
				let encodedDna = props.initialSpecies.dna.getEncodedDna();
				species = new Species(encodedDna);
			}
			else {
				species = new Species("S");
			}			
		}

		dna = species.dna;

		this.state = {
			dna: dna,
			cellMenuOpen: false,
			currDraggingBranch: null,
			currSpecies: species,
			dragOrigin: null,
			justPlacedLocation: null,
			moves: [],
			ancestorSpeciesId: ancestorSpeciesId
		}
	}

	save() {
		
		this.props.saveSpecies(this.state.currSpecies);
	}

	applyMutation() {
		if (this.state.moves.length > 0) {
			this.props.saveSpecies(this.state.currSpecies, this.state.ancestorSpeciesId);
		}
	}

	openCellMenu(cell) {
		this.setState({
			cellMenuOpen: true,
			currCell: cell
		});
	}

	dragCellFromMenu(cellType) {
		this.setState({
			currDraggingBranch: Dna.makeCell(cellType.id),
			dragOrigin: "menu"
		});
		window.addEventListener("mouseup", this.onStopDrag);
	}

	onStopDrag = () => {
		window.removeEventListener("mouseup", this.onStopDrag);
		// need to reattch branch
		
		let { dragOrigin, dna, currDraggingBranch, toDetach } = this.state;

		if (currDraggingBranch) {
			if (toDetach) {
				dna.detachChild(toDetach);
			}

			if (typeof dragOrigin === "object") {
				dna.attachBranchToCell(currDraggingBranch, dragOrigin.parent, dragOrigin.index);
			}

			this.applyMove(dna);
		}
	}

	applyMove(updatedDna) {

		let species = this.state.currSpecies;
		let dna = updatedDna;
		let moves = this.state.moves;

		if (this.props.editMode === "MUTATION" &&
			this.props.myPlayer.mutations.length - moves.length <= 0) {
			
			dna = new Dna(species.encodedDna);
		}
		else {
			let encodedDna = dna.getEncodedDna();
			if (encodedDna !== moves[moves.length - 1]) {
				moves.push(encodedDna);
				species = new Species(encodedDna);
			}
			else {
				dna = species.dna
			}
		}

		this.setState({
			currDraggingBranch: null,
			dna: dna,
			moves: moves,
			currSpecies: species,
			dragOrigin: null,
			toDetach: null
		})

	}

	onCellMouseUp = (e, cell) => {
		let { toDetach, currDraggingBranch } = this.state;
		// In this case we leave toDetach
		if (cell === toDetach) {
			e.stopPropagation();
			e.preventDefault();
			this.applyMove(this.state.dna);
		}
		// Otherwise event bubbles up to onStopDrag
	}

	onDragBranch = (cell) => {
		if (cell.type === "S") {
			return;
		}
		window.addEventListener("mouseup", this.onStopDrag);
		let dragOrigin = this.state.dragOrigin;
		if (dragOrigin === null) {
			dragOrigin = { parent: cell.parent, index: cell.getIndex() }
		}

		this.setState({
			currDraggingBranch: cell,
			dragOrigin: dragOrigin,
			toDetach: cell
		})
	}

	onPullOffCell = (cell) => {
		let { dna, toDetach } = this.state;

		if (toDetach && cell === toDetach) {	
			dna.detachChild(toDetach);
			this.setState({
				dna: dna,
				toDetach: null
			});
		}
	}

	onSelectAncestorSpecies = (speciesId) => {
		let { mySpecies } = this.props;
		let species = mySpecies.find(s => s.id === speciesId);
		if (species) {
			let currSpecies = new Species(species.encodedDna);
			this.setState({
				dna: currSpecies.dna,
				currSpecies: currSpecies,
				ancestorSpeciesId: speciesId,
				moves: []
			})
		}
		else {
			throw new Error("onSelectAncestorSpecies: invalid index");
		}
	}

	dropOnCell(parentCell, cellIndex) {
		if (this.state.currDraggingBranch) {
			let { dna, toDetach, currDraggingBranch } = this.state;
			let branch = currDraggingBranch;
			let copy = branch.copy();
			let to = parentCell;
			// This is a workaround for a weird ui quirk where
			// if you drag really fast the event missfires and the cell
			// doesn't detach
			if (toDetach) {
				dna.detachChild(toDetach);
			} 
			let result = dna.attachBranchToCell(copy, to, cellIndex);
			if (!result) {
				return;
			}
			this.setState({
				dna: dna,
				toDetach: copy
			});
		}
	}

	onBinDrop = (e) => {
		e.stopPropagation();
		if (this.state.currDraggingBranch) {
			// Throwing something in the bin is a move
			this.applyMove(this.state.dna);
			/*
			let { dna, toDetach, currDraggingBranch } = this.state;
			this.setState({
				currDraggingBranch: null,
				dna: dna,
				toDetach: copy
			});
			*/


		}
		console.log("Bin drop!");
	}

	onCanvasMouseMove = (e) => {
	}



	// Factory function for rendering svg components to draw the cells
	// in the species preview
	getCellComps(cells) {

		//let items = [<CellFilled cell={cell} />];
		let { currDraggingBranch } = this.state;
		let cellEls = [];
		let connectionEls = [];
		let cellMargin = 100;
		let cellKey = 0;
		let usedPositions = [];

		cells.forEach((cell, cellIndex)=>{
			const parentCoord = { x: cell.x*cellMargin, y: cell.y*cellMargin }
			const key = cell.x + "-" + cell.y;
			cellEls.push(
				<CellFilled 
					x={parentCoord.x} 
					y={parentCoord.y} 
					type={cell.type} 
					key={key}
					cell={cell}
					onDrag={this.onDragBranch}
					onPullOff={this.onPullOffCell}
					onMouseUp={this.onCellMouseUp}
					isDragging={currDraggingBranch !== null}
				/>
			);
			usedPositions.push(parentCoord);
			cell.children.forEach((child, index)=> {
				
				// Check if the cell type allows children here
				let parentCellType = CellTypes[cell.type];
				if (parentCellType.connections && parentCellType.connections[index]) {
					const { pos, dir } = getNewCellPosFromParent(parentCoord.x, parentCoord.y, cell.direction, index, cellMargin);
					
					
					if (usedPositions.findIndex(p => p.x === pos.x && p.y === pos.y) !== -1) {
						return;
					}

					//usedPositions.push(pos);
					
					connectionEls.push(
						<path 
							className={ child ? "species-editor__path--connected" : "species-editor__path" }
							d={"M" + parentCoord.x + " " + parentCoord.y + " L" + pos.x + " " + pos.y}>
						</path>
					);

					if (child === null) {
						cellKey++;
						const key = pos.x + "-" + pos.y + "-empty-" + cellKey;
						cellEls.push(
							<CellEmpty 
								key={key}
								x={pos.x}
								y={pos.y}
								cellIndex={index}
								parentCell={cell}
								onClick={this.openCellMenu.bind(this)} 
								onDrop={this.dropOnCell.bind(this)}
								isDragging={currDraggingBranch !== null}
							/>
						)
					}
				}
			});
			cellKey++;
		});
		return connectionEls.concat(cellEls);
	}



	render() {

		let { 
			currSpecies,
			currDraggingBranch,
			dna,
			ancestorSpeciesId,
			moves
		} = this.state;

		const { editMode, myPlayer, mySpecies } = this.props;
		//let { cellTypes } = this.props;


		const isMutation = editMode === "MUTATION";
		let mutationsRemaining = 0;
		if (isMutation) {
			mutationsRemaining = myPlayer.mutations.length - moves.length;
		}

		let cellComps = this.getCellComps(dna.cells);
		let classnames = ClassNames({
			"species-editor": true,
			"species-editor--cell-menu-open": this.state.cellMenuOpen,
			"species-editor--dragging": currDraggingBranch,
			"species-editor--mode-mutation": isMutation,
			"species-editor--no-mutations": mutationsRemaining <= 0
		})

		return (
			<div className="species-editor__wrapper">
				<CellDragPreview
					cellType={currDraggingBranch ? currDraggingBranch.type : null}
				/>
				<div className={classnames}>
					<div className="species-editor__close" onClick={this.props.closeSpeciesEditor}>&#215;</div>
					{
						isMutation ?
							<div className="species-editor__heading">
								<h1>Mutate Species</h1>
								<div className="species-editor__save" onClick={this.applyMutation.bind(this)}>
									Apply Mutation
								</div>
							</div>
						:
							<div className="species-editor__heading">
								<h1>Create species</h1>
								<div className="species-editor__save" onClick={this.save.bind(this)}>
									Insert into world
								</div>
							</div>
					}
					{
						isMutation ?
							<div className="mutation-banner">
								<SpeciesSelector 
									onSelectSpecies={this.onSelectAncestorSpecies} 
									selected={ancestorSpeciesId}
									allSpecies={ mySpecies } />
								<div className="species-selector__remaining">
									<div className="mutation-heading">Remaining mutations:</div> 
									<div className="mutation-list">
										{
											moves.map((move) => <div className="mutation-used"></div>)
										}
										{
											Array.apply(null, Array(mutationsRemaining)).map(()=> <div className="mutation-remaining"></div>)
										}
										<span className="mutation-num">{ mutationsRemaining }</span>
									</div>
								</div>
							</div>
						:
							null

					}

					<div className="species-editor__main">
						<CellMenu onDrag={this.dragCellFromMenu.bind(this)} onBinDrop={this.onBinDrop} />
						<div className="species-editor__map-container">
							<svg width="100%" height="100%" viewBox="0 0 1000 1000" onMouseMove={this.onCanvasMouseMove}>
								<g transform="translate(500, 500) scale(1.5)">

								 	{ cellComps }

								</g>
							</svg>
						</div>	
						{currSpecies ?
							<div className="species-editor__info">
								<h2>Species Info</h2>
								<div className="species-editor__info-item">
									<span className="species-editor__info-sm">{currSpecies.encodedDna}</span>
								</div>							
								<div className="species-editor__info-item">
									<label>Energy cost per step</label>
									<span>{currSpecies.energyCostPerStep}</span>
								</div>

								<div className="species-editor__info-item">
									<label>Max energy storage</label>
									<span>{currSpecies.energyStorage}</span>
								</div>

								<div className="species-editor__info-item">
									<label>Starting energy</label>
									<span>{currSpecies.startEnergy}</span>
								</div>

								<div className="species-editor__info-item">
									<label>Energy cost to reproduce</label>
									<span>{currSpecies.reproductionCost}</span>
								</div>							
								<div className="species-editor__info-item">
									<label>Time to reproduce</label>
									<span>{ (currSpecies.reproductionTime / 1000) + "s"}</span>
								</div>	
							</div>
							:
							null
						}
					</div>
				</div>
			</div>

		)
	}

}


/*
function select(state) {

	const { gameState } = state;
	const mySpecies = gameState.species.filter(s => s.playerId === gameState.myPlayer);
	const myPlayer = gameState.players[gameState.myPlayer];
  	return {
		mySpecies: mySpecies,
		myPlayer: myPlayer
  	};
}
*/

export default Roo.connect()(SpeciesEditor);



class CellEmpty extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			draggingOver: false
		}
	}

	onMouseEnter = (e) => {
		if (this.props.isDragging) {
			/*
			this.setState({
				draggingOver: true
			})
			*/
			this.props.onDrop(this.props.parentCell, this.props.cellIndex);
		}		
	}

	onMouseLeave = (e) => {
		if (this.props.isDragging) {
			this.setState({
				draggingOver: false
			})
		}		
	}

	render() {
		let { x, y } = this.props;
		let classnames = ClassNames({
			'species-editor__cell-empty': true,
			'species-editor__cell-empty--hover': this.state.draggingOver
		});
		return (
			<circle 
				className={classnames}
				cx={x}
				cy={y}
				r="40" 
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			/>
		);
	}
}


class CellFilled extends React.Component {

	onDragStart = (e) => {
		this.props.onDrag(this.props.cell);
	}	

	onDragOver(e) {
		e.preventDefault();
	}

	onMouseUp = (e) => {
		this.props.onMouseUp(e, this.props.cell);
	}

	onMouseLeave = (e) => {
		if (this.props.isDragging) {
			this.props.onPullOff(this.props.cell);
		}
	}

	render() {
		//let cell = this.props.cell;
		//let color = CellTypes[cell.type].bodyColor;
		let { x, y, type } = this.props;
		let color = CellTypes[type].bodyColor;
		let c = tinycolor(color);
		let rgb = c.toRgb();
		let dim = 0.8;
		let stroke = tinycolor({
			r: rgb.r * dim,
			g: rgb.g * dim,
			b: rgb.b * dim
		}).toString();

		let style = {
			fill: color,
			stroke: stroke
		}

		return (
			<g className="species-editor__cell-wrapper" 
				onMouseDown={this.onDragStart}
				onMouseUp={this.onMouseUp}>
				<circle 
					className="species-editor__cell" 
					cx={x}
					cy={y}
					r="40"
					style={style}
					fill={color} 
					stroke={stroke}
					onDragOver={this.onDragOver}
					onMouseLeave={this.onMouseLeave}
					onClick={this.props.onClick} 
					onDrop={this.props.onDrop}
					draggable={true}
				/>
				<text 
					className="species-editor__cell-text"  
					x={x} 
					y={y+10} 
					fill={stroke} 
					textAnchor="middle"
					dominantBaseline="central"
				>
					{type}
				</text>
			</g>
		);
	}
}





class CellDragPreview extends React.Component {

	constructor(props) {
		super(props);
		this.isFollowing = false;
		this.pos = {
			x:0, y: 0
		}
	}

	componentDidMount() {
		window.addEventListener("mousemove", this.windowMouseMove);
		if (this.props.cellType) {
			this.startFollow();
		}
	}

	componentWillUnmount() {
		window.removeEventListener("mousemove", this.windowMouseMove);
		this.stopFollow();
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.cellType !== nextProps.cellType) {
			if (nextProps.cellType === null) {
				this.stopFollow();
			}
			else {
				this.startFollow();
			}
		}
	}

	startFollow() {
		this.isFollowing = true;
		this.el.style.transform = "translate(" + this.pos.x + "px," + this.pos.y +"px)";
		this.el.style.display = "block";
	}
	stopFollow() {
		this.isFollowing = false;
		this.el.style.display = "none"; 
	}

	windowMouseMove = (e) => {
		this.pos = {x: e.pageX, y: e.pageY};
		if (this.isFollowing) {
			this.el.style.transform = "translate(" + this.pos.x + "px," + this.pos.y +"px)";
		}
	}


	render() {
		const style = this.props.cellType ? {
			background: CellTypes[this.props.cellType].bodyColor
		} : null;
		return(
			<div className="cell-drag-preview" ref={(el)=> {this.el = el}} style={style}>
				{this.props.cellType}
			</div>
		)
	}
}





