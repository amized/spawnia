

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


export default class SpeciesEditor extends React.Component {

	static defaultProps = {
	}

	constructor(props) {
		super(props);
		
		let dna = {
			seedCell: 
				{ 
					type: "S", 
					x:0, 
					y:0, 
					angle: 0,
					direction: DIR.NORTH
				}
		}

		let encodedDna = DNA.encodeDna(dna);

		this.state = {
			seedCell: { type: "S", x:0, y:0, angle: 0 },
			cells: [
				{ 
					type: "S", 
					x:0, 
					y:0, 
					angle: 0,
					direction: DIR.NORTH
				}
			],
			cellMenuOpen: false,
			currDraggingCellType: null,
			currSpecies: new Species(encodedDna)
		}
	}

	save() {
		
		this.props.saveSpecies(this.state.cells);
	}


	openCellMenu(cell) {
		this.setState({
			cellMenuOpen: true,
			currCell: cell
		});
	}

	dragCellType(cellType) {
		console.log("draging!", cellType);
		this.setState({
			currDraggingCellType: cellType
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

	dropOnCell(cell) {
		if (this.state.currDraggingCellType) {

			let newCell = Object.assign({}, cell, { type: this.state.currDraggingCellType.id });
			let parentChildren = newCell.parent.children || [null,null];

			parentChildren[newCell.index] = newCell;
			
			
			let arr = this.state.cells;
			arr.push(newCell);

			let encodedDna = DNA.encodeDna({seedCell: arr[0]});
			let species = new Species(encodedDna);

			this.setState({
				cells: arr,
				currDraggingCellType: null,
				currSpecies: species 
			});

		}

	}


	getChildFromParent(parentCell, index) {
		let cellMargin = 100;
		let angle = parentCell.angle;
		let angleOffset;

		//let newPos = UnitBuilder.transformPosFromIndex(parentCell.x, parentCell.y, index, cellMargin); 	
		let { pos, dir } = getNewCellPosFromParent(parentCell.x, parentCell.y, parentCell.direction, index, cellMargin);

        // Check if already exists
        let cells = this.state.cells;

        for (let i = 0; i < cells.length; i++) {
        	let cell = cells[i];
        	if (Math.round(cell.x) ===  Math.round(pos.x) &&
        		Math.round(cell.y) ===  Math.round(pos.y)) {
        		console.log("found intersecting");
        		return null;
        	}
        }
       
        let cell = {
        	parent: parentCell,
        	type: null,
        	x: pos.x,
        	y: pos.y,
        	angle: angleOffset,
        	index: index,
        	direction: dir
        }
        return cell;
	}

	// Factory function for rendering svg components to draw the cells
	// in the species preview
	getCellComps(cells) {

		//let items = [<CellFilled cell={cell} />];
		let { currDraggingCellType } = this.state;
		let cellEls = [];
		let connectionEls = [];

		let cellKey = 0;

		cells.forEach((cell, cellIndex)=>{
			cellEls.push(<CellFilled cell={cell} key={cellKey}/>);
			if (!cell.children) {
				cell.children = (cellIndex === 0) ? [null,null,null,null] : [null, null,null];
			}
			cell.children.forEach((child, index)=> {
				if (child) {
					connectionEls.push(<path className="species-editor__path--connected" d={"M" + cell.x + " " + cell.y + " L" + child.x + " " + child.y}></path>);
					return;
				}
				else {

					cellKey++;

					// Check if the cell type allows children here
					let parentCellType = CellTypes[cell.type];

					if (parentCellType.connections && parentCellType.connections[index]) {
						let newChild = this.getChildFromParent(cell, index);
						if (newChild) {
							connectionEls.push(<path className="species-editor__path"  d={"M" + cell.x + " " + cell.y + " L" + newChild.x + " " + newChild.y}></path>);
							cellEls.push(
								<CellEmpty 
								cell={newChild}
								onClick={this.openCellMenu.bind(this)} 
								onDrop={this.dropOnCell.bind(this)}
								isDragging={currDraggingCellType !== null}
								key={cellKey} 
								/>
							)
						}
					}
				}
			});
			cellKey++;
		});
		return connectionEls.concat(cellEls);
	}



	render() {

		let { cells, seedCell, currSpecies } = this.state;
		//let { cellTypes } = this.props;

		let cellComps = this.getCellComps(cells);

		let cellTypes = Object.keys(CellTypes).map((k) => CellTypes[k]).filter(type => type.id !== "S");
		let classnames = ClassNames({
			"species-editor": true,
			"species-editor--cell-menu-open": this.state.cellMenuOpen
		})
		return (
			<div className={classnames}>
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
									<CellMenuItem key={index} onDrag={this.dragCellType.bind(this)} addCell={this.addCell.bind(this)} cellType={cellType} key={cellType.id} />
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

	onDragEnter = (e) => {
		if (this.props.isDragging && !this.state.draggingOver) {
			this.setState({
				draggingOver: true
			})
		}		
	}


	onDragLeave = (e) => {
		console.log("mouse leave");
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
		this.props.onDrop(this.props.cell);
		this.setState({
			draggingOver: false
		})
	}

	render() {
		let cell = this.props.cell;
		let classnames = ClassNames({
			'species-editor__cell-empty': true,
			'species-editor__cell-empty--hover': this.state.draggingOver
		});
		return (
			<circle 
				className={classnames}
				cx={cell.x}
				cy={cell.y}
				r="40" 
				onDragEnter={this.onDragEnter}
				onDragLeave={this.onDragLeave}
				onDragOver={this.onDragOver}
				onClick={this.props.onClick} 
				onDrop={this.onDrop.bind(this)}
			/>
		);
	}
}


class CellFilled extends React.Component {
	

	onDragOver(e) {
		e.preventDefault();
	}
	render() {
		let cell = this.props.cell;
		let color = CellTypes[cell.type].bodyColor;

		return (
			<circle 
				className="species-editor__cell" 
				cx={cell.x}
				cy={cell.y}
				r="40"
				fill={color} 
				onDragOver={this.onDragOver}
				onClick={this.props.onClick} 
				onDrop={this.props.onDrop}
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
			<div className="species-editor__cell-menu-item" onDragStart={this.onDragStart.bind(this)} draggable={true}>
				<div className="species-editor__cell-menu-cell" style={{ background: color }} onClick={this.props.onClick}>
					{ cellType.id }
				</div>
			</div>
		)
	}
}
