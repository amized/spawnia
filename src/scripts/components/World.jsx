import React, {Component, PropTypes} from 'react';
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');

// module aliases
import { Composite, Mouse, MouseConstraint, World, Events, Bounds, Vertices } from "matter-js"
import Render from "../lib/Render.js"
import $ from "jquery"
import { SYNC_STATUS_WAITING, SYNC_STATUS_SYNCED, MAP_OBJ_GENERAL, MAP_OBJ_UNIT } from "../constants"
import { getCanvasDimensions } from "../lib/Utils/utils";



export default class SpawniaWorld extends React.Component {

    static propTypes = {
        viewportBoundingBox: PropTypes.object
    }

    constructor(props) {
    	super(props);
    }

    shouldComponentUpdate() {
        return true;
    }

    componentDidMount() {
        //this.refs.container.appendChild(canvas);
        // create a renderer

        let { engine, viewportBoundingBox } = this.props;
        const canvasSize = getCanvasDimensions();

        this.mapRender = Render.create({
            //element: this.refs.container,
            canvas: this.canvas,
            engine: engine,
            bounds: viewportBoundingBox,
            options: {
                hasBounds: true,
                delta: 16.666,
                width: canvasSize.width,
                height: canvasSize.height,
                background: 'transparent',
                pixelRatio: 1,
                wireframeBackground: '#222',
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


        let canvas = this.canvas;

        this.mouse = Mouse.create(canvas);
        this.mouseConstraint = MouseConstraint.create(engine, {
            mouse: this.mouse
        });

        Events.on(this.mouseConstraint, "mousemove", this.onMouseMove);
        Events.on(this.mouseConstraint, "mouseup", this.onMouseUp);
        Events.on(this.mouseConstraint, "mousedown", this.onMouseDown);
        Events.on(engine, 'afterUpdate', this.onTick);


        Render.run(this.mapRender);

        if (this.props.onRenderCreate) {
            this.props.onRenderCreate(this.mapRender);
        }

    }

    componentDidUpdate(prevProps) {
        let { selectedSpecies, universe, selectedUnit, engine, viewportBoundingBox } = this.props;


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

        if (viewportBoundingBox !== prevProps.viewportBoundingBox) {
            this.mapRender.bounds = viewportBoundingBox;
            this.mapRender.options.width = this.canvas.width;
            this.mapRender.options.height = this.canvas.height;
        }

    }


    onTick = (e) => {
        let bodies = this.getBodiesAtMouse(this.mouse);
        let unitHover = null;
        for (let i = 0; i < bodies.length; i++) {
            let split = bodies[i].label.split(":");
            
            if (split[0] === MAP_OBJ_UNIT) {
                unitHover = split[1];
                break;
            }
        }        

        if (this.unitHover !== unitHover) {
            this.unitHover = unitHover;
            this.props.onUnitHover(unitHover);
        }        
    }

    onMouseUp = (e) => {
        if (this.mapMouseDown !== null) {
            this.props.onMapClick(e);
            this.mapMouseDown = null;
        }
        if (this.unitMouseDown !== null) {
            let bodies = this.getBodiesAtMouse(e.mouse);
            for (let i = 0; i < bodies.length; i++) {
                let split = bodies[i].label.split(":");
                let id = split[1];
                if (split[0] === MAP_OBJ_UNIT && id === this.unitMouseDown) {
                    this.props.onUnitClick(id);
                    break;
                }
            } 
            this.unitMouseDown = null;
        }
    }

    onMouseDown = (e) => {
        console.log("mouse down");
        let bodies = this.getBodiesAtMouse(e.mouse);

        for (let i = 0; i < bodies.length; i++) {
            let split = bodies[i].label.split(":");
            if (split[0] === MAP_OBJ_UNIT) {
                this.unitMouseDown = split[1];
                return;
            }
        }

        this.mapMouseDown = 1;


    }

    onMouseMove = (e) => {
    }

    getBodiesAtMouse(mouse) {
        let engine = this.props.engine;
        let allBodies = Composite.allBodies(engine.world);
        return allBodies.filter((body)=>{
            return Bounds.contains(body.bounds, mouse.position) &&
                   Vertices.contains(body.vertices, mouse.position);
        });
    }


    render() {
        const bb = this.props.viewportBoundingBox;
        const canvasWidth = Math.floor(bb.max.x - bb.min.x);
        const canvasHeight = Math.floor(bb.max.y - bb.min.y);
        const bg1style = {
            width: canvasWidth,
            height: canvasHeight,
            backgroundPosition: (-bb.min.x*0.2) + "px " + (-bb.min.y*0.2) + "px"
        }
    	return (
            <div className="map-wrapper">
                <div className="map" ref="container" key={1}>
                    <div className="map-bg-1" style={bg1style}>
                    </div>
                    <canvas width={canvasWidth} height={canvasHeight} ref={(el)=>{this.canvas=el;}} />
                </div>
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










