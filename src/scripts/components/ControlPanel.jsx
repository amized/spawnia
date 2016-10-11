var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');

import _ from "underscore"

import UnitPanel from "./UnitPanel.jsx"
import SpeciesPanel from "./SpeciesPanel.jsx"
import SpeciesEditor from "./SpeciesEditor.jsx"
import CommandPanel from "./CommandPanel.jsx"
import SpeciesViewerPanel from "./SpeciesViewerPanel"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class ControlPanel extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            totalUnits: 0,
            speciesEditorOpen: false,
            savedSpecies: null
        }
    }

    componentDidMount() {
        this.timeout = window.setInterval(()=>{
            this.forceUpdate()
        }, 500);
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
        console.log("saving species!", species);
        this.closeSpeciesEditor();
        this.props.saveNewSpecies(species);
    }


    render() {

        let allSpecies = this.props.universe.getSpeciesArr();
        let { selectedUnit, selectedSpecies } = this.props;
    	return (
            <div className="control-panel">
                <div className="control-panel__top"></div>
                <div className="control-panel__main">
                    <div className="control-panel__left">
                        <ReactCSSTransitionGroup 
                            transitionName="panel__left" 
                            transitionEnterTimeout={500} 
                            transitionLeaveTimeout={500}
                        >
                        {
                            selectedUnit ?
                                 <UnitPanel 
                                 key={"unit:" + this.props.selectedUnit.id }
                                 unit={ this.props.selectedUnit } 
                                 unselectUnit={this.props.unselectUnit} 
                                 selectSpecies={this.props.selectSpecies} 
                                 universe={this.props.universe} />
                            :
                                null
                        }
                        {
                            selectedSpecies ?
                                <SpeciesViewerPanel 
                                key={ selectedSpecies.encodedDna }
                                species={selectedSpecies} 
                                selectSpecies={this.props.selectSpecies} 
                                universe={this.props.universe} />
                            :
                                null
                        }
                        </ReactCSSTransitionGroup>
                    </div>
                    <SpeciesPanel 
                        selectedSpecies={selectedSpecies} 
                        selectSpecies={this.props.selectSpecies} 
                        dispatch={this.props.dispatch} 
                        allSpecies={allSpecies} />
                    {
                        this.state.speciesEditorOpen ?
                            <SpeciesEditor 
                                closeSpeciesEditor={this.closeSpeciesEditor.bind(this)}
                                saveSpecies={this.saveSpecies.bind(this)}
                            />
                        :
                            null
                    }
                    <CommandPanel 
                        openSpeciesEditor={this.openSpeciesEditor.bind(this)}
                    />
                </div>
            </div>
    	)
    }
}

export default ControlPanel;








