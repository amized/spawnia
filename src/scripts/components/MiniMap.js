import React, {Component, PropTypes} from 'react';



const miniMapSize = 210;



export default class MiniMap extends Component {


	static propTypes = {
		viewportBoundingBox: PropTypes.object,
		mapSize: PropTypes.object,
		updateViewportBB: PropTypes.func
	}

	constructor(props) {
		super(props);
		this.state = {
			isDragging: false
		}
	}

	onMouseDown = (e) => {
		e.preventDefault();
		this.setState({
			isDragging: true
		})

		window.addEventListener("mouseup", this.onMouseUp);
		window.addEventListener("mousemove", this.onMouseMove);

		this.updateBB(e);
	}

	onMouseUp = (e) => {
		this.setState({
			isDragging: false
		})
		window.removeEventListener("mouseup", this.onMouseUp);
		window.removeEventListener("mousemove", this.onMouseMove);
	}

	onMouseMove = (e) => {
		if (!this.state.isDragging) {
			return;
		}
		e.preventDefault();
		this.updateBB(e);
	}

	updateBB(e) {
		const { mapSize } = this.props;
		const r = this.svg.getBoundingClientRect();
		let scale = mapSize.width/miniMapSize;
		let x = (e.pageX - r.left) * scale;
		let y = (e.pageY - r.top) * scale;

		const bb = this.props.viewportBoundingBox;


		let w = (bb.max.x - bb.min.x);
		let h = (bb.max.y - bb.min.y);

		let newMiddleX = Math.max(w/2, x);
		newMiddleX = Math.min(mapSize.width - (w/2), newMiddleX);

		let newMiddleY = Math.max(h/2, y);
		newMiddleY = Math.min(mapSize.height - (h/2), newMiddleY);


		let newBB = {
			min: {
				x: newMiddleX - w/2,
				y: newMiddleY - h/2
			},
			max: {
				x: newMiddleX + w/2,
				y: newMiddleY + h/2
			}
		}

		this.props.updateViewportBB(newBB);
	}

	render() {
		const mapSize = this.props.mapSize;
		const bb = this.props.viewportBoundingBox;
		let x, y, width, height;

		if (this.svg) {
			let vpWidth = bb.max.x - bb.min.x;
			let vpHeight = bb.max.y - bb.min.y;
			let scale = miniMapSize/mapSize.width;
			x = Math.floor(bb.min.x * scale);
			y = Math.floor(bb.min.y * scale);
			width = Math.floor(vpWidth * scale);
			height = Math.floor(vpHeight * scale);
		}

		return (
			<div className="minimap">
				<div className="minimap-inner">
					<svg 
						width="100%" 
						height="100%" 
						ref={(el) => {this.svg = el}} 
						onMouseDown={this.onMouseDown}
					>
						<rect className="minimap-bb" x={x} y={y} width={width} height={height} />
					</svg>
				</div>
			</div>
		)
	}

}