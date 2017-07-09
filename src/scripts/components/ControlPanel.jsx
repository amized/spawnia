import {Component, PropTypes} from 'react';
import React from 'react';
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');

import _ from "underscore"

import UnitPanel from "./UnitPanel.jsx"
import SpeciesPanel from "./SpeciesPanel.jsx"
import CommandPanel from "./CommandPanel.jsx"
import SpeciesViewerPanel from "./SpeciesViewerPanel"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import WorldTimer from './WorldTimer.js';
import { PLAYSTATE_PLAYING, PLAYSTATE_PAUSED } from "../constants";
import MiniMap from './MiniMap.js';
import MySpeciesPanel from './MySpeciesPanel'
import ScoreBoard from './ScoreBoard'
import MutationPanel from './MutationPanel'
import NotificationPanel from './NotificationPanel'
import GameTimer from './GameTimer'

class ControlPanel extends Component {

    static propTypes = {
        game: PropTypes.object,
        selectedUnit: PropTypes.object,
        selectedSpecies: PropTypes.object,
        unselectUnit:PropTypes.func,
        selectSpecies: PropTypes.func,
        togglePlayState: PropTypes.func,
        getCurrStep: PropTypes.func,
        viewportBoundingBox: PropTypes.object,
        mapSize: PropTypes.object,
        updateViewportBB: PropTypes.func,
        notificationEl: PropTypes.element
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

    render() {

        let { 
            game,
            selectedUnit, 
            selectedSpecies, 
            unselectUnit, 
            selectSpecies, 
            playState, 
            getCurrStep, 
            viewportBoundingBox,
            mapSize,
            updateViewportBB,
            newSpecies,
            myPlayer,
            notificationEl
        } = this.props;

        const { universe } = game;
        const speciess = game.speciess;

    	return (
            <div className="control-panel">
                <div className="control-panel__top"></div>
                <div className="control-panel__main">
                    <MiniMap updateViewportBB={updateViewportBB} viewportBoundingBox={viewportBoundingBox} mapSize={mapSize} />
                    <div className="control-panel__middle">
                        <div className="control-panel__status">
                            <ScoreBoard 
                                speciess={speciess}
                                players={game.players}
                                selectSpecies={this.props.selectSpecies}
                            />
                            <GameTimer game={game} />
                        </div>
                        <div className="control-panel__middle-lower">
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
                                        key={ 0 }
                                        species={selectedSpecies} 
                                        selectSpecies={this.props.selectSpecies} 
                                        universe={this.props.game.universe} />
                                    :
                                        null
                                }
                                { notificationEl }
                                <NotificationPanel manager={game.nm} key={2} />
                                                     
                            </ReactCSSTransitionGroup>
                        </div>
                    </div>
                    <div className="command-panel">
                        <MySpeciesPanel 
                            mySpecies={game.getMySpecies()}
                            myPlayer={game.myPlayer}
                            onEditMutation={this.props.onEditMutation}
                        />
                        <MutationPanel game={game} key={1}/>   
                    </div>
                </div>
            </div>
    	)
    }
}

export default ControlPanel;








