var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');
var connect = require("react-redux").connect;
import { Composite, Mouse, Bounds, Events } from "matter-js"

import World from './World.jsx';
import ControlPanel from './ControlPanel.jsx';




export default class App extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            selectedUnit: null,
            selectedSpecies: null
        }
    }

    componentDidMount() {


    }

    componentDidUpdate(prevProps, prevState) {

        if (prevState.selectedSpecies != this.state.selectedSpecies) {
            this.props.universe.applySelectedSpecies(this.state.selectedSpecies);
        }

        let unit = this.state.selectedUnit;
        if (prevState.selectedUnit !== unit) {
            if (unit) {
                unit.applySelected();
            }
            if (prevState.selectedUnit) {
                prevState.selectedUnit.deselect();
            }
        }


    }

    onWorldClick (mouse) {
        let engine = this.props.engine;
        if (!mouse) {
            return;
        }
        let allBodies = Composite.allBodies(engine.world);
        allBodies.forEach((body, index)=>{
            if (Bounds.contains(body.bounds, mouse.position)) {
                console.log("Clicked on", body.label);

                let split = body.label.split(":");

                if (split[0] === "unit") {
                    let id = split[1];
                    this.onUnitClick(this.props.universe.getUnit(id));
                }

            }
        });
    }

    onUnitClick (unit) {
        this.setState({
            selectedUnit: unit
        })
    }

    unselectUnit () {
        this.setState({
            selectedUnit: null
        });
    }


    selectSpecies (species) {
        this.setState({
            selectedSpecies: species
        });
    }

    render () {

        let { dispatch } = this.props;
        let { selectedUnit } = this.state;

    	return (
            <div>
                <World 
                    engine={this.props.engine}
                    onClick={this.onWorldClick.bind(this)} 
                />
                <ControlPanel 
                    dispatch={dispatch} 
                    engine={this.props.engine} 
                    universe={this.props.universe} 
                    selectedUnit={selectedUnit}
                    unselectUnit={this.unselectUnit.bind(this)} 
                    selectSpecies={this.selectSpecies.bind(this)}
                />
            </div>
    		
    	)
    }
}

//<Map mapState={this.props.mapState}></Map>

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
  return state;
}







