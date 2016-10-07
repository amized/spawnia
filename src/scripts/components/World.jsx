var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');


// module aliases
import { Composite, Mouse, MouseConstraint, World } from "matter-js"
import Render from "../lib/Render.js"





var SpawniaWorld = React.createClass({


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

        Render.run(this.render);
    },

    render: function () {

    	return (
            <div className="map-wrapper">
                <div className="map" ref="container"></div>
            </div>
    		
    	)
    }
});

module.exports = SpawniaWorld;














