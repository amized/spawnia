var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');

import _ from "underscore"

import UnitPanel from "./UnitPanel.jsx"
import SpeciesPanel from "./SpeciesPanel.jsx"
import SpeciesEditor from "./SpeciesEditor.jsx"
import CommandPanel from "./CommandPanel.jsx"
import SpeciesViewerPanel from "./SpeciesViewerPanel"

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
        let selectedSpecies = this.props.selectedSpecies;
    	return (
            <div className="control-panel">
                <div className="control-panel__top"></div>
                <div className="control-panel__main">
                    <UnitPanel unit={ this.props.selectedUnit } unselectUnit={this.props.unselectUnit} universe={this.props.universe} />
                    {
                        selectedSpecies ?
                            <SpeciesViewerPanel species={selectedSpecies} />
                        :
                            null
                    }
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








