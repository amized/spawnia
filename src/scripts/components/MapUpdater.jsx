

import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"
import { Composite, Mouse, MouseConstraint, Bounds, Vertices, Events, World } from "matter-js"


export default class MapUpdater extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps) {


    }

    componentDidMount() {

        //World.add(engine.world, this.mouseConstraint);
    }

    render () {
        return (
            <div></div>
        )
    }


}


