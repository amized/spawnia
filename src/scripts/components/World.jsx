var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');


// module aliases
import { Composite, Mouse, MouseConstraint, World } from "matter-js"
import Render from "../lib/Render.js"





export default class SpawniaWorld extends React.Component {


    constructor(props) {
    	super(props);
    }

    shouldComponentUpdate() {
        return true;
    }

    componentDidMount() {
        //this.refs.container.appendChild(canvas);
        // create a renderer

        let { engine } = this.props;
        let vw = window.innerWidth;
        
        this.mapRender = Render.create({
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

        Render.run(this.mapRender);

        if (this.props.onRenderCreate) {
            this.props.onRenderCreate(this.mapRender);
        }
    }


    componentDidUpdate(prevProps) {
        console.log("render updated", this.props);
        let { selectedSpecies, universe, selectedUnit } = this.props;


        if (selectedSpecies !== prevProps.selectedSpecies) {
            Render.setUiState(this.mapRender, {
                selectedSpecies: selectedSpecies
            });
        }

        if (selectedUnit !== prevProps.selectedUnit) {
            Render.setUiState(this.mapRender, {
                selectedUnit: selectedUnit
            });
        }
    }



    render() {

    	return (
            <div className="map-wrapper">
                <div className="map" ref="container" key={1}></div>
            </div>
    		
    	)
    }
}













