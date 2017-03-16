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
import { 
    PLAYSTATE_PLAYING, 
    PLAYSTATE_PAUSED,
    GAME_STAGE_NOGAME,
    GAME_STAGE_BUILDINGSPECIES,
    GAME_STAGE_PLACESPECIES,
    GAME_STAGE_WATCHING
} from "../constants";
import { getCanvasDimensions } from "../lib/Utils/utils";
import Modal from "./Modal";
import { startGame, startSpeciesPlacement } from "../actions";
import SpeciesEditor from "./SpeciesEditor.jsx"


class Game extends React.Component {


    static defaultProps = {
    }


    constructor(props) {
        super(props);

        const canvasSize = getCanvasDimensions();
        this.state = {
            selectedUnit: null,
            selectedSpecies: null,
            newSpecies: null,
            hoveredUnit: null,
            playState: PLAYSTATE_PLAYING,
            speciesPlacementHelperOpen: false,
            zoom: 1,
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
        this.updateViewportBB(this.state.viewportBoundingBox);
        window.onresize = this.onWindowResize;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.gameState.gameStage === GAME_STAGE_PLACESPECIES) {
            this.setState({
                speciesPlacementHelperOpen: true
            })
        }
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
        let zoom = this.state.zoom;
        this.updateViewportBB({
            min: { 
                x: currBB.min.x,
                y: currBB.min.y
            }, 
            max: { 
                x: currBB.min.x + canvasSize.width*zoom,
                y: currBB.min.y + canvasSize.height*zoom
            }
        });
    }

    onZoom = (factor, focalPoint) => {
        const bb = Object.assign({}, this.state.viewportBoundingBox);
        const maxZoom = Math.pow(1.2, 3);
        const minZoom = 1/maxZoom;
        let zoom = factor === "in" ? this.state.zoom * 1.2 : this.state.zoom / 1.2;

        if (zoom > maxZoom) {
            zoom = maxZoom;
        }
        else if (zoom < minZoom) {
            zoom = minZoom;
        }

        let offset = {
            x: (focalPoint.x-bb.min.x)/(bb.max.x-bb.min.x), 
            y: (focalPoint.y-bb.min.y)/(bb.max.y-bb.min.y)
        }

        const canvasSize = getCanvasDimensions();
        const bbWidth = canvasSize.width * zoom;
        const bbHeight = canvasSize.height * zoom;
 

        bb.min.x = focalPoint.x - bbWidth * (offset.x);
        bb.min.y = focalPoint.y - bbHeight * (offset.y);

        bb.max.x = focalPoint.x + bbWidth * (1 - offset.x);
        bb.max.y = focalPoint.y + bbHeight * (1 - offset.y);

        this.updateViewportBB(bb, zoom);
    }

    updateViewportBB = (bb, zoom=this.state.zoom) => {

        const mapSize = this.props.universe.getMapSize();
        const bbWidth = bb.max.x - bb.min.x;
        // Centers if the viewport is bigger than the map
        if (bbWidth > mapSize.width) {
            bb.min.x = -(bbWidth - mapSize.width) / 2;
            bb.max.x =  mapSize.width + ((bbWidth - mapSize.width) / 2);
        }
        else {
            // Adjust if we went beyond the edge of map
            if (bb.min.x < 0) {
                bb.max.x -= bb.min.x;
                bb.min.x = 0;
            }
            if (bb.max.x > mapSize.width) {
                bb.min.x -= (bb.max.x - mapSize.width);
                bb.max.x = mapSize.width;
            }
        }

        const bbHeight = bb.max.y - bb.min.y;
        if (bbHeight > mapSize.height) {
            bb.min.y = -(bbHeight - mapSize.height) / 2;
            bb.max.y = mapSize.height + ((bbHeight - mapSize.height) / 2);
        }
        else {
            // Adjust if we went beyond the edge of maps
            if (bb.min.y < 0) {
                bb.max.y -= bb.min.y;
                bb.min.y = 0;
            }
            if (bb.max.y > mapSize.height) {
                bb.min.y -= (bb.max.y - mapSize.height);
                bb.max.y = mapSize.height;
            }            
        }

        this.setState({
            viewportBoundingBox: bb,
            zoom: zoom
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
        this.setState({
            selectedUnit: unit,
            selectedSpecies: null
        })
    }

    onMapClick(pos) {

        if (this.state.newSpecies) {

            let dna = {
                seedCell: this.state.newSpecies[0]
            }

            let encodedDna = DNA.encodeDna(dna);

            this.props.simulDispatch({
                type: "ADD_UNIT",
                dna: encodedDna,
                x: pos.x,
                y: pos.y,
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




    closeSpeciesPlacementHelper = () => {
        this.setState({
            speciesPlacementHelperOpen: false
        })
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

    saveNewSpecies = (species) => {
        console.log("saving species", species);
        this.setState({
            newSpecies: species
        });
        this.props.dispatch(startSpeciesPlacement(species));
    }

    closeSpeciesEditor = () => {
        console.log("close species editor");
    }


    selectSpecies (species) {
        this.setState({
            selectedSpecies: species,
            selectedUnit: null
        });
    }

    isUnitSelected(unit) {
        return (
            this.state.selectedUnit === unit ||
            (this.state.selectedSpecies && this.state.selectedSpecies.encodedDna === unit.encodedDna)
        );
    }

    startGame = () => {
        this.props.dispatch(startGame());
    }

    startSpeciesPlacement = () => {
        this.props.dispatch(startSpeciesPlacement());
    }

    render () {

        let { dispatch, getCurrStep, universe, gameState } = this.props;
        const { gameStage } = gameState;

        console.log("The gamestate is!", gameState);

        let mapSize = universe.getMapSize();
        let { 
            selectedUnit, 
            selectedSpecies, 
            newSpecies, 
            hoveredUnit, 
            playState, 
            viewportBoundingBox,
            zoom,
            speciesPlacementHelperOpen
        } = this.state;
        
        let style = {};

        const showNewGameDialog = gameStage === GAME_STAGE_NOGAME;
        const speciesEditorOpen = gameStage === GAME_STAGE_BUILDINGSPECIES;
        const showPlaceSpeciesDialog = gameStage === GAME_STAGE_PLACESPECIES;
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
                    updateViewportBB={this.updateViewportBB}  
                    onZoom={this.onZoom} 
                    zoom={zoom}             
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
                {
                    speciesEditorOpen ?
                        <SpeciesEditor 
                            closeSpeciesEditor={this.closeSpeciesEditor}
                            saveSpecies={this.saveNewSpecies}
                        />
                    :
                        null
                }


                <Modal
                    show={showNewGameDialog}
                >
                  <h2>New Game</h2>
                  <p>Looks like you're new, so I'll take you through how the game
                  works.</p>
                  <hr />
                  <h3>Step 1: Design a species</h3>
                  <p>The first step is to design a species that you will
                  plant into the world of Spawnia. To get started
                  click below!</p>

                  <button onClick={this.startGame}>Create a species</button>
                </Modal>

                <Modal
                    show={speciesPlacementHelperOpen}
                >
                  <h2>You have designed your first species!</h2>
                  <p>You are now ready to place it into the world and see
                  how well it can thrive.</p>
                  <hr />
                  <button onClick={this.closeSpeciesPlacementHelper}>Place my species</button>
                </Modal>

            </div>
    		
    	)
    }
}

//<Map mapState={this.props.mapState}></Map>

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
  return {
    gameState: state.gameState,
    syncStatus: state.syncStatus,
    client: state.client
  };
}

export default connect(select)(Game);






