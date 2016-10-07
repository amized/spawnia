

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



	constructor(props) {
		super(props);
		

		this.state = {
			seedCell: { type: "S", x:0, y:0, angle: 0 },
			cells: [
				{ type: "S", x:0, y:0, angle: 0 }
			],
			cellMenuOpen: false,
			currDraggingCellType: null
		}
	}

	save() {
		this.props.saveSpecies(this.state.cells);
	}


	openCellMenu(cell) {
		console.log("hello");
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
		console.log("on drop cell", cell);
		console.log(this.state);
		if (this.state.currDraggingCellType) {

			let newCell = Object.assign({}, cell, { type: this.state.currDraggingCellType.id });
			let parentChildren = newCell.parent.children || [null,null];

			parentChildren[newCell.index] = newCell;
			
			
			let arr = this.state.cells;
			arr.push(newCell);

			this.setState({
				cells: arr
			});

			console.log(newCell);
		}

	}


	getChildFromParent(parentCell, index) {
		let cellMargin = 100;
		let angle = parentCell.angle;
		let angleOffset;

		switch (index) {
	        case 0:
	            angleOffset = angle + Math.PI * (1/3);
	            break;
	        case 1:
	            angleOffset = angle - Math.PI * (1/3);
	            break;
	        case 2:
	            angleOffset = angle + Math.PI;
	            break;                      
    	}

		let newPos = {
            x: parentCell.x +  (cellMargin * Math.cos(angleOffset)),
            y: parentCell.y + (cellMargin*Math.sin(angleOffset))
        }    	

        // Check if already exists
        let cells = this.state.cells;

        for (let i = 0; i < cells.length; i++) {
        	let cell = cells[i];
        	if (Math.round(cell.x) ===  Math.round(newPos.x) &&
        		Math.round(cell.y) ===  Math.round(newPos.y)) {
        		console.log("found intersecting");
        		return null;
        	}
        }
       
        let cell = {
        	parent: parentCell,
        	type: null,
        	x: newPos.x,
        	y: newPos.y,
        	angle: angleOffset,
        	index: index
        }
        return cell;
	}

	getCellComps(cells) {

		//let items = [<CellFilled cell={cell} />];

		let cellEls = [];
		let connectionEls = [];

		cells.forEach((cell, index)=>{
			cellEls.push(<CellFilled cell={cell} />);
			if (!cell.children) {
				cell.children = [null, null];
			}
			cell.children.forEach((child, index)=> {
				if (child) {
					connectionEls.push(<path className="species-editor__path--connected" d={"M" + cell.x + " " + cell.y + " L" + child.x + " " + child.y}></path>);
					return;
				}
				else {
					let newChild = this.getChildFromParent(cell, index);
					if (newChild) {
						connectionEls.push(<path className="species-editor__path"  d={"M" + cell.x + " " + cell.y + " L" + newChild.x + " " + newChild.y}></path>);
						cellEls.push(
							<CellEmpty 
							cell={newChild}
							onClick={this.openCellMenu.bind(this)} 
							onDrop={this.dropOnCell.bind(this)} />)
					}
				}
			});
		});
		return connectionEls.concat(cellEls);
	}



	render() {

		let { cells, seedCell } = this.state;

		let cellComps = this.getCellComps(cells);

		let cellTypes = Object.keys(CellTypes).map((k) => CellTypes[k]);
		let classnames = ClassNames({
			"species-editor": true,
			"species-editor--cell-menu-open": this.state.cellMenuOpen
		})
		return (
			<div className={classnames}>
				<div className="species-editor__close" onClick={this.props.closeSpeciesEditor}>&#215;</div>
				<div className="species-editor__heading">Species Editor</div>
				<svg width="100%" height="100%" viewBox="0 0 1000 1000">
					<g transform="translate(500, 500)">

					 	{ cellComps }

					</g>
				</svg>

				<div className="species-editor__cell-menu">
					<div className="species-editor__cell-menu-list">
					{

						cellTypes.map((cellType) => {
							return (
								<CellMenuItem onDrag={this.dragCellType.bind(this)} addCell={this.addCell.bind(this)} cellType={cellType} key={cellType.id} />
							)
						})
					}
					</div>
					<div className="species-editor__save" onClick={this.save.bind(this)}>
						Save
					</div>
				</div>
			</div>

		)
	}

}


class CellEmpty extends React.Component {
	
	onDrop(e) {
		e.preventDefault();
		this.props.onDrop(this.props.cell);
	}

	onDragOver(e) {
		e.preventDefault();
	}
	render() {
		let cell = this.props.cell;
		return (
			<circle 
				className="species-editor__cell-empty" 
				cx={cell.x}
				cy={cell.y}
				r="40" 
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
		console.log("On drag evenent", this.props.cellType);
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
