import React from "react"
import ReactDOM from "react-dom"
import { Render, Body } from "matter-js"

export default class DnaBlueprint extends React.Component {
	
	shouldComponentUpdate() {
		return false;
	}


	componentDidMount() {
		let {width, height} = this.props;
		this.unitRender = Render.create({
			element: this.refs.canvas,
			options: {
				width: width,
				height: height,
				wireframes: false
			}

		})
				// Draw the unit's bodies
		let body = this.props.body;
		Body.setPosition(body, {
			x: 0,
			y: 0
		});

		let scaleX = width/80;
		let scaleY = height/80;
		this.unitRender.context.translate((width/2),(height/2));
		this.unitRender.context.scale(scaleX,scaleY);

		Render.bodies(this.unitRender, [body], this.unitRender.context);
	}


	render() {
		let {width, height} = this.props;
		return (
			<div className="dna-blueprint" style={{width: width, height: height }} ref="canvas">
			</div>
		);
	}

}


