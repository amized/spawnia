var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');


// module aliases
import { Composite, Mouse, Bounds, Events } from "matter-js"
import Render from "../lib/Render.js"





var World = React.createClass({

	getDefaultProps: function () {
		return {
			
		}
	},

    getInitialState: function () {
    	return {

    	}
    },

    shouldComponentUpdate: function () {
        return false;
    },

    componentDidMount: function () {
        //this.refs.container.appendChild(canvas);
        // create a renderer

        let { engine } = this.props;
        let vw = window.innerWidth;
        
        this.render = Render.create({
            element: this.refs.container,
            engine: engine,
            options: {
                delta: 500,
                width: 1200,
                height: 600,
                pixelRatio: 1,
                background: '#fafafa',
                wireframeBackground: '#222',
                hasBounds: false,
                enabled: true,
                wireframes: false,
                showSleeping: true,
                showDebug: false,
                showBroadphase: false,
                showBounds: false,
                showVelocity: false,
                showCollisions: false,
                showSeparations: false,
                showAxes: false,
                showPositions: false,
                showAngleIndicator: false,
                showIds: false,
                showShadows: false,
                showVertexNumbers: false,
                showConvexHulls: false,
                showInternalEdges: false,
                showMousePosition: false
            }
        });

        this.mouse = Mouse.create(this.render.canvas);
        Render.run(this.render);
    },

    click: function () {
        let mouse = this.mouse;
        this.props.onClick(mouse);
    },

    render: function () {
    	return (
            <div className="map-wrapper">
                <div className="map" ref="container" onClick={this.click}></div>
            </div>
    		
    	)
    }
})


module.exports = World;









