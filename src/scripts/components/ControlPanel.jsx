import {Component, PropTypes} from 'react';
import React from 'react';
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');

import _ from "underscore"

import UnitPanel from "./UnitPanel.jsx"
import SpeciesPanel from "./SpeciesPanel.jsx"
import SpeciesEditor from "./SpeciesEditor.jsx"
import CommandPanel from "./CommandPanel.jsx"
import SpeciesViewerPanel from "./SpeciesViewerPanel"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import WorldTimer from './WorldTimer.js';
import { PLAYSTATE_PLAYING, PLAYSTATE_PAUSED } from "../constants";
import MiniMap from './MiniMap.js';

class ControlPanel extends Component {

    static propTypes = {
        dispatch: PropTypes.func,
        selectedUnit: PropTypes.object,
        selectedSpecies: PropTypes.object,
        newSpecies: PropTypes.object,
        saveNewSpecies: PropTypes.func,
        unselectUnit:PropTypes.func,
        selectSpecies: PropTypes.func,
        togglePlayState: PropTypes.func,
        getCurrStep: PropTypes.func,
        viewportBoundingBox: PropTypes.object,
        mapSize: PropTypes.object,
        updateViewportBB: PropTypes.func
    }

    static defaultProps = {

    }

    constructor(props) {
        super(props);

        this.state = {
            totalUnits: 0,
            speciesEditorOpen: false,
            savedSpecies: null
        }
    }

    componentDidMount() {
    }

    openSpeciesEditor() {
        this.setState({
            speciesEditorOpen: true
        })
    }

    closeSpeciesEditor() {
        this.setState({
            speciesEditorOpen: false
        })
    }

    saveSpecies(species) {
        this.closeSpeciesEditor();
        this.props.saveNewSpecies(species);
    }


    render() {

        let allSpecies = this.props.universe.speciesData.getSpeciesArr();
        let { 
            selectedUnit, 
            selectedSpecies, 
            unselectUnit, 
            selectSpecies, 
            universe, 
            playState, 
            getCurrStep, 
            viewportBoundingBox,
            mapSize,
            updateViewportBB
        } = this.props;

    	return (
            <div className="control-panel">
                <div className="control-panel__top"></div>
                <div className="control-panel__main">
                    <MiniMap updateViewportBB={updateViewportBB} viewportBoundingBox={viewportBoundingBox} mapSize={mapSize} />
                    <div className="control-panel__left">
                        <ReactCSSTransitionGroup 
                            transitionName="panel__left" 
                            transitionEnterTimeout={500} 
                            transitionLeaveTimeout={500}
                        >
                        {
                            selectedUnit ? (
                                <UnitPanel 
                                    key={"unit:" + selectedUnit.id }
                                    unit={ selectedUnit } 
                                    unselectUnit={ unselectUnit} 
                                    selectSpecies={ selectSpecies} 
                                    universe={ universe} 
                                    getCurrStep={getCurrStep}
                                />
                            )
                            :
                                null
                        }
                        {
                            selectedSpecies ?
                                <SpeciesViewerPanel 
                                key={ 5 }
                                species={selectedSpecies} 
                                selectSpecies={this.props.selectSpecies} 
                                universe={this.props.universe} />
                            :
                                null
                        }
                        </ReactCSSTransitionGroup>
                    </div>
                    <SpeciesPanel 
                        universe={this.props.universe}
                        selectedSpecies={selectedSpecies} 
                        selectSpecies={this.props.selectSpecies} 
                        dispatch={this.props.dispatch} 
                    />
                    {
                        this.state.speciesEditorOpen ?
                            <SpeciesEditor 
                                closeSpeciesEditor={this.closeSpeciesEditor.bind(this)}
                                saveSpecies={this.saveSpecies.bind(this)}
                            />
                        :
                            null
                    }
                    <div className="command-panel">
                        <a href="#" className="command-panel__create" onClick={this.openSpeciesEditor.bind(this)}>Create unit...</a>
                        <div className="command-panel__play" onClick={this.props.togglePlayState}>
                        { playState === PLAYSTATE_PLAYING ? 
                            <div>
                                <i className="fa fa-pause"></i>
                            </div>
                            :
                            <div>
                                <i className="fa fa-play"></i>
                            </div>
                        }
                        </div>
                        <div className="command-panel__timer">
                            <WorldTimer getCurrStep={getCurrStep} />
                        </div>
                    </div>
                </div>
            </div>
    	)
    }
}

export default ControlPanel;








