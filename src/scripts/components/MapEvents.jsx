

import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"
import { Composite, Mouse, MouseConstraint, Bounds, Vertices, Events, World } from "matter-js"


export default class MapEvents extends React.Component {

    constructor(props) {
        super(props);


        this.mouse = null;
        this.mouseConstraint = null;
        this.unitMouseDown = null;
        this.unitHover = null;
    }

    componentDidMount() {

        let { engine } = this.props;
        let canvas = $("canvas")[0];

        this.mouse = Mouse.create(canvas);
        
        this.mouseConstraint = MouseConstraint.create(engine, {
            mouse: this.mouse
        });
    
        Events.on(this.mouseConstraint, "mousemove", this.onMouseMove);
        Events.on(this.mouseConstraint, "mouseup", this.onMouseUp);
        Events.on(this.mouseConstraint, "mousedown", this.onMouseDown);

        World.add(engine.world, this.mouseConstraint);
    }

    onMouseUp = (e) => {
        if (this.unitMouseDown !== null) {
            let bodies = this.getBodiesAtMouse(e.mouse);
            for (let i = 0; i < bodies.length; i++) {
                let split = bodies[i].label.split(":");
                let id = parseInt(split[1]);
                if (split[0] === "unit" && id === this.unitMouseDown) {
                    this.props.onUnitClick(id);
                    break;
                }
            }
            this.unitMouseDown = null;
        }
    }

    onMouseDown = (e) => {
        let bodies = this.getBodiesAtMouse(e.mouse);
        for (let i = 0; i < bodies.length; i++) {
            let split = bodies[i].label.split(":");
            if (split[0] === "unit") {
                this.unitMouseDown = parseInt(split[1]);
                break;
            }
        }
    }

    onMouseMove = (e) => {
        let bodies = this.getBodiesAtMouse(e.mouse);
        let unitHover = null;
        for (let i = 0; i < bodies.length; i++) {
            let split = bodies[i].label.split(":");
            if (split[0] === "unit") {
                unitHover = parseInt(split[1]);
                break;
            }
        }        

        if (this.unitHover !== unitHover) {
            this.unitHover = unitHover;
            this.props.onUnitHover(unitHover);
        }
    }

    getBodiesAtMouse(mouse) {
        let engine = this.props.engine;
        let allBodies = Composite.allBodies(engine.world);
        return allBodies.filter((body)=>{
            return Bounds.contains(body.bounds, mouse.position) &&
                   Vertices.contains(body.vertices, mouse.position);
        });
    }




    render () {
        return (
            <div></div>
        )
    }


}


