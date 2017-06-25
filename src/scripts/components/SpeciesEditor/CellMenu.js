					
import React from "react"
import CellTypes from "../../lib/CellTypes";
import classNames from "classnames";

export default class CellMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tooltipCelltype: null
		}
	}

	showTooltip = (cellType) => {
		this.setState({
			tooltipCelltype: cellType
		})
	}

	hideTooltip = () => {
		this.setState({
			tooltipCelltype: null
		})
	}

	render () {

		const { onDrag } = this.props;
		const { tooltipCelltype } = this.state;
		let cellTypes = Object.values(CellTypes).filter(type => type.id !== "S");
		return (
			<div className="species-editor__cell-menu">
				<CellMenuTooltip type={tooltipCelltype} />
				<div className="species-editor__cell-menu-list">
					{

						cellTypes.map((cellType, index) => {
							return (
								<CellMenuItem onHoverOn={this.showTooltip} onHoverOff={this.hideTooltip} onDrag={onDrag} cellType={cellType} key={cellType.id} />
							)
						})
					}
					<CellBin onMouseUp={this.props.onBinDrop} />
				</div>
			</div>
		)
	}
}

class CellBin extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			hover: false
		}
	}

	onHoverOn = () => {
		this.setState({
			hover: true
		})
	}

	onHoverOff = () => {
		this.setState({
			hover: false
		})
	}

	render () {

		const classnames = classNames({
			"cell-trash": true,
			"cell-trash--active": this.state.hover
		});

		return (

			<div className={classnames} onMouseUp={this.props.onMouseUp}
			    onMouseEnter={this.onHoverOn} 
				onMouseLeave={this.onHoverOff}>
				<i className="fa fa-trash-o"></i>
				Trash
			</div>

		)
	}
}



class CellMenuItem extends React.Component {

	onDragStart(e) {
		this.props.onDrag(this.props.cellType);
	}

	onHoverOn = (e) => {
		this.props.onHoverOn(this.props.cellType);
	}

	onHoverOff = (e) => {
		this.props.onHoverOff();
	}

	render() {
		let { cellType } = this.props;
		let color = cellType.bodyColor;
		return (
			<div 
				className="species-editor__cell-menu-item" 
				onMouseEnter={this.onHoverOn} 
				onMouseLeave={this.onHoverOff} 
				onMouseDown={this.onDragStart.bind(this)}>
				<div className="species-editor__cell-menu-cell" style={{ background: color }}>
					{ cellType.id }
				</div>
			</div>
		)
	}
}

class CellMenuTooltip extends React.Component {
	render() {
		const { type } = this.props;
		return (
			<div>
			{
				type ?
					<div className="species-editor__cell-menu-tooltip" key={type.id}>
						<h2>
							<div className="species-editor__cell-menu-cell" style={{ background: type.bodyColor }}>
								{ type.id }
							</div>
							<span>{type.name}</span>

						</h2>
						<p>{type.description}</p>

					</div>
				: 
					null
			}
			</div>

		)
	}
}


