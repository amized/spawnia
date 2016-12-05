var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');


// module aliases
import { Composite, Mouse, MouseConstraint, World } from "matter-js"
import Render from "../lib/Render.js"
import $ from "jquery"
import { SYNC_STATUS_WAITING, SYNC_STATUS_SYNCED } from "../constants"




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
        let h = window.innerHeight - $(".control-panel").height();
        
        this.mapRender = Render.create({
            element: this.refs.container,
            engine: engine,
            options: {
                delta: 500,
                width: vw,
                height: h,
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
        console.log("map props", this.props);
    	return (
            <div className="map-wrapper">
                <div className="map" ref="container" key={1}></div>
                {
                    this.props.syncStatus === SYNC_STATUS_WAITING ?
                        <div className="sync-loader">
                            <div className="sk-fading-circle">
                              <div className="sk-circle1 sk-circle"></div>
                              <div className="sk-circle2 sk-circle"></div>
                              <div className="sk-circle3 sk-circle"></div>
                              <div className="sk-circle4 sk-circle"></div>
                              <div className="sk-circle5 sk-circle"></div>
                              <div className="sk-circle6 sk-circle"></div>
                              <div className="sk-circle7 sk-circle"></div>
                              <div className="sk-circle8 sk-circle"></div>
                              <div className="sk-circle9 sk-circle"></div>
                              <div className="sk-circle10 sk-circle"></div>
                              <div className="sk-circle11 sk-circle"></div>
                              <div className="sk-circle12 sk-circle"></div>
                            </div>
                        </div>
                    :
                        null
                }
            </div>
    		
    	)
    }
}













