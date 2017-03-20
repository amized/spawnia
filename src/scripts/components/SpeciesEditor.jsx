

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
import CellTypes from "../lib/CellTypes";
import ClassNames from 'classnames';
import UnitBuilder from '../lib/UnitBuilder';
import { getNewCellPosFromParent, DIR } from '../lib/Geometry.js';
import Species from "../lib/Species";
import DNA from '../lib/DNA';
import Dna from "../lib/DnaClass";


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


export default class SpeciesEditor extends React.Component {

	static defaultProps = {
	}

	constructor(props) {
		super(props);
	
		console.log("The initial species", props.initialSpecies);
		let dna = props.initialSpecies ? props.initialSpecies.dna : new Dna();
		let encodedDna = dna.getEncodedDna();
		let species = new Species(encodedDna);

		this.state = {
			dna: dna,
			cellMenuOpen: false,
			currDraggingCellType: null,
			currDraggingBranch: null,
			currSpecies: species
		}
	}

	save() {
		
		this.props.saveSpecies(this.state.currSpecies);
	}


	openCellMenu(cell) {
		this.setState({
			cellMenuOpen: true,
			currCell: cell
		});
	}

	dragCellType(cellType) {
		this.setState({
			currDraggingCellType: cellType
		});
		window.addEventListener("mouseup", this.stopDragCellType);
	}

	stopDragCellType = () => {
		window.removeEventListener("mouseup", this.stopDragCellType);
		this.setState({
			currDraggingCellType: null
		})
	}

	onDragBranch = (cell) => {
		window.addEventListener("mouseup", this.onStopDragBranch);
		this.setState({
			currDraggingBranch: cell
		})
	}

	onStopDragBranch = () => {
		window.removeEventListener("mouseup", this.onStopDragBranch);
		this.setState({
			currDraggingBranch: null
		});
	}


	addCell() {

	}

	createCell(cellType, x, y, angle) {
		console.log("attempting to create new cell");
		let cell = {
			cellType: cellType,
			x: x,
			y: y,
			angle: angle
		}

		return cell;

	}

	dropOnCell(parentCell, cellIndex) {
		console.log("Cropping on cell", parentCell, cellIndex);
		if (this.state.currDraggingCellType) {
			let { dna } = this.state;
			dna.addChild(parentCell, this.state.currDraggingCellType.id, cellIndex);
			let species = new Species(dna.getEncodedDna());
			this.setState({
				dna: dna,
				currDraggingCellType: null,
				currSpecies: species
			});
		}

		else if (this.state.currDraggingBranch) {

			console.log("dropped branch!!!");


		}
	}



	// Factory function for rendering svg components to draw the cells
	// in the species preview
	getCellComps(cells) {

		//let items = [<CellFilled cell={cell} />];
		let { currDraggingCellType } = this.state;
		let cellEls = [];
		let connectionEls = [];
		let cellMargin = 100;
		let cellKey = 0;

		cells.forEach((cell, cellIndex)=>{
			const parentCoord = { x: cell.x*cellMargin, y: cell.y*cellMargin }
			cellEls.push(
				<CellFilled 
					x={parentCoord.x} 
					y={parentCoord.y} 
					type={cell.type} 
					key={cellKey}
					cell={cell}
					onDrag={this.onDragBranch}
				/>
			);
			cell.children.forEach((child, index)=> {
				
// Check if the cell type allows children here
				let parentCellType = CellTypes[cell.type];
				if (parentCellType.connections && parentCellType.connections[index]) {
					const { pos, dir } = getNewCellPosFromParent(parentCoord.x, parentCoord.y, cell.direction, index, cellMargin);
					connectionEls.push(
						<path 
							className={ child ? "species-editor__path--connected" : "species-editor__path" }
							d={"M" + parentCoord.x + " " + parentCoord.y + " L" + pos.x + " " + pos.y}>
						</path>
					);

					if (child === null) {
						cellKey++;
						cellEls.push(
							<CellEmpty 
								x={pos.x}
								y={pos.y}
								cellIndex={index}
								parentCell={cell}
								onClick={this.openCellMenu.bind(this)} 
								onDrop={this.dropOnCell.bind(this)}
								isDragging={currDraggingCellType !== null}
								key={cellKey} 
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
			cells, 
			seedCell, 
			currSpecies,
			currDraggingBranch,
			currDraggingCellType, 
			dna 
		} = this.state;
		//let { cellTypes } = this.props;

		let cellComps = this.getCellComps(dna.cells);

		let cellTypes = Object.keys(CellTypes).map((k) => CellTypes[k]).filter(type => type.id !== "S");
		let classnames = ClassNames({
			"species-editor": true,
			"species-editor--cell-menu-open": this.state.cellMenuOpen,
			"species-editor--dragging": currDraggingBranch || currDraggingCellType
		})

		let currDraggingType = currDraggingCellType ? currDraggingCellType.id : null;

		return (
			<div className={classnames}>
				<CellDragPreview
					cellType={currDraggingType}
				/>
				<div className="species-editor__close" onClick={this.props.closeSpeciesEditor}>&#215;</div>
				<div className="species-editor__heading">
					<h1>Species Editor</h1>
					<div className="species-editor__save" onClick={this.save.bind(this)}>
						Insert into world
					</div>
				</div>
				<div className="species-editor__main">
					<div className="species-editor__cell-menu">
						<div className="species-editor__cell-menu-list">
						{

							cellTypes.map((cellType, index) => {
								return (
									<CellMenuItem onDrag={this.dragCellType.bind(this)} addCell={this.addCell.bind(this)} cellType={cellType} key={cellType.id} />
								)
							})
						}
						</div>
					</div>
					<div className="species-editor__map-container">
						<svg width="100%" height="100%" viewBox="0 0 1000 1000">
							<g transform="translate(500, 500)">

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

		)
	}

}


class CellEmpty extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			draggingOver: false
		}
	}

	onMouseOver = (e) => {
		if (this.props.isDragging && !this.state.draggingOver) {
			this.setState({
				draggingOver: true
			})
		}		
	}


	onMouseOut = (e) => {
		if (this.props.isDragging) {
			this.setState({
				draggingOver: false
			})
		}		
	}

	onDragOver = (e) => {
		e.preventDefault();
	}

	onDrop(e) {
		e.preventDefault();
		e.stopPropagation();
		console.log("mouse up that fucker");
		this.props.onDrop(this.props.parentCell, this.props.cellIndex);
		this.setState({
			draggingOver: false
		})
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
				onMouseUp={this.onDrop.bind(this)}
				onMouseOver={this.onMouseOver}
				onMouseOut={this.onMouseOut}
			/>
		);
	}
}


class CellFilled extends React.Component {

	onDragStart = (e) => {
		console.log("drag start goddamit");
		this.props.onDrag(this.props.cell);
	}	

	onDragOver(e) {
		e.preventDefault();
	}
	render() {
		//let cell = this.props.cell;
		//let color = CellTypes[cell.type].bodyColor;
		let { x, y, type } = this.props;
		let color = CellTypes[type].bodyColor;
		return (
			<circle 
				className="species-editor__cell" 
				cx={x}
				cy={y}
				r="40"
				fill={color} 
				onDragOver={this.onDragOver}
				onMouseDown={this.onDragStart}
				onClick={this.props.onClick} 
				onDrop={this.props.onDrop}
				draggable={true}
			/>
		);
	}
}




class CellMenuItem extends React.Component {
	onClick() {
		this.props.addCell(this.props.cellType);
	}

	onDragStart(e) {
		this.props.onDrag(this.props.cellType);
	}

	render() {
		let { cellType } = this.props;
		let color = cellType.bodyColor;
		return (
			<div className="species-editor__cell-menu-item" onMouseDown={this.onDragStart.bind(this)}>
				<div className="species-editor__cell-menu-cell" style={{ background: color }} onClick={this.props.onClick}>
					{ cellType.id }
				</div>
			</div>
		)
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


