var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');
var connect = require("react-redux").connect;
import { Composite, Mouse, Bounds, Events } from "matter-js"

import World from './World.jsx';
import MapEvents from "./MapEvents.jsx";
import ControlPanel from './ControlPanel.jsx';
import DNA from '../lib/DNA';
import uuid from 'uuid'
import { PLAYSTATE_PLAYING, PLAYSTATE_PAUSED } from "../constants";
import { getCanvasDimensions } from "../lib/Utils/utils";

class App extends React.Component {


    static defaultProps = {
        mapSize: {
            width: 4000,
            height: 4000
        }
    }


    constructor(props) {
        super(props);

        const canvasSize = getCanvasDimensions();
        console.log("canvas size1!!", canvasSize);
        this.state = {
            selectedUnit: null,
            selectedSpecies: null,
            newSpecies: null,
            hoveredUnit: null,
            playState: PLAYSTATE_PLAYING,
            viewportBoundingBox: {
                min: { 
                    x: 0,
                    y: 0
                }, 
                max: { 
                    x: canvasSize.width,
                    y: canvasSize.height
                }
            }
        }
    }

    componentDidMount() {
        window.onresize = this.onWindowResize;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.playState !== this.state.playState) {

            if (this.state.playState === PLAYSTATE_PLAYING) {
                this.props.simulation.resume();
            }
            else {
                this.props.simulation.pause();
            }
        }

    }


    onWindowResize = () => {
        const canvasSize = getCanvasDimensions();

        let currBB = this.state.viewportBoundingBox;

        this.setState({
            viewportBoundingBox: {
                min: { 
                    x: currBB.min.x,
                    y: currBB.min.y
                }, 
                max: { 
                    x: currBB.min.x + canvasSize.width,
                    y: currBB.min.y + canvasSize.height
                }
            }
        })
    }

    updateViewportBB = (newBB) => {
        this.setState({
            viewportBoundingBox: newBB
        });
    }


    togglePlayState() {
        this.setState({
            playState: this.state.playState === PLAYSTATE_PAUSED ? PLAYSTATE_PLAYING : PLAYSTATE_PAUSED
        })
    }

    onWorldMove(e) {
        console.log("world move");
    }

    onUnitClick (unitId) {
        if (this.state.newSpecies) {
            return;
        }
        if (this.state.selectedUnit !== null && this.state.selectedUnit.id === unitId) {
            this.setState({
                selectedUnit: null
            });
            return;
        }
        let unit = this.props.universe.getMapObject(unitId);
        console.log("UNIT ID", unitId);
        console.log("UNIT", unit);
        this.setState({
            selectedUnit: unit
        })
    }

    onMapClick(e) {

        if (this.state.newSpecies) {

            let dna = {
                seedCell: this.state.newSpecies[0]
            }

            let encodedDna = DNA.encodeDna(dna);

            this.props.simulDispatch({
                type: "ADD_UNIT",
                dna: encodedDna,
                x: e.mouse.position.x,
                y: e.mouse.position.y,
                id: uuid.v1()
            });
            
            this.setState({
                newSpecies: null
            })
            
        }
        


        if (this.state.selectedUnit || this.state.selectedSpecies) {
            this.setState({
                selectedUnit: null,
                selectedSpecies: null
            })
        }
    }

    onUnitHover (unitId) {
        let unit = this.props.universe.getMapObject(unitId);
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

        let { dispatch, getCurrStep, universe } = this.props;
        let mapSize = universe.getMapSize();
        let { 
            selectedUnit, 
            selectedSpecies, 
            newSpecies, 
            hoveredUnit, 
            playState, 
            viewportBoundingBox 
        } = this.state;
        
        let style = {};

        if (hoveredUnit) {
            style.cursor="pointer";
        }

    	return (
            <div style={style}>
                <World 
                    universe={this.props.universe}
                    engine={this.props.engine}
                    syncStatus={this.props.syncStatus}
                    onUnitClick={this.onUnitClick.bind(this)}
                    onUnitHover={this.onUnitHover.bind(this)}
                    onMapClick={this.onMapClick.bind(this)}  
                    mapSize={mapSize}                  
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
                    togglePlayState={this.togglePlayState.bind(this)}
                    getCurrStep={getCurrStep}
                    viewportBoundingBox={viewportBoundingBox}
                    mapSize={mapSize}
                    updateViewportBB={this.updateViewportBB}
                    {...this.state}
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

export default connect(select)(App);






