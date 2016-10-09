var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');
var connect = require("react-redux").connect;
import { Composite, Mouse, Bounds, Events } from "matter-js"

import World from './World.jsx';
import MapEvents from "./MapEvents.jsx";
import ControlPanel from './ControlPanel.jsx';
import MapUpdater from './MapUpdater.jsx';



export default class App extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            selectedUnit: null,
            selectedSpecies: null,
            newSpecies: null,
            hoveredUnit: null
        }
    }

    componentDidMount() {


    }

    componentDidUpdate(prevProps, prevState) {


    }

    onWorldClick (e) {
        let mouse = e.mouse;
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

    onWorldMove(e) {
        console.log("on world move", e);
    }

    onUnitClick (unitId) {
        if (this.state.selectedUnit !== null && this.state.selectedUnit.id === unitId) {
            this.setState({
                selectedUnit: null
            });
            return;
        }
        let unit = this.props.universe.getUnit(unitId);
        this.setState({
            selectedUnit: unit
        })
    }

    onUnitHover (unitId) {
        console.log("hovering", unitId);
        let unit = this.props.universe.getUnit(unitId);
        this.setState({
            hoveredUnit: unit
        })
    }

    unselectUnit () {
        this.setState({
            selectedUnit: null
        });
    }

    saveNewSpecies(species) {
        this.setState({
            newSpecies: species
        });
    }


    selectSpecies (species) {
        this.setState({
            selectedSpecies: species
        });
    }

    isUnitSelected(unit) {
        return (
            this.state.selectedUnit === unit ||
            (this.state.selectedSpecies && this.state.selectedSpecies.encodedDna === unit.encodedDna)
        );
    }

    render () {

        let { dispatch } = this.props;
        let { selectedUnit, selectedSpecies, newSpecies, hoveredUnit } = this.state;
        let style = {};

        if (hoveredUnit) {
            style.cursor="pointer";
        }

    	return (
            <div style={style}>
                <World 
                    universe={this.props.universe}
                    engine={this.props.engine}
                    onMouseDown={this.onWorldClick.bind(this)}
                    onMouseMove={this.onWorldMove.bind(this)}
                    onMouseUp={()=>false}
                    {...this.state}
                />
                <MapEvents 
                    engine={this.props.engine}
                    onUnitClick={this.onUnitClick.bind(this)}
                    onUnitHover={this.onUnitHover.bind(this)}
                />
                <MapUpdater
                    {...this.props}
                    {...this.state}
                />                
                <ControlPanel {...this.props}
                    dispatch={dispatch} 
                    selectedUnit={selectedUnit}
                    selectedSpecies={selectedSpecies}
                    newSpecies={newSpecies}
                    saveNewSpecies={this.saveNewSpecies.bind(this)}
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







