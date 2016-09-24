var React = require("react");
var ReactDOM = require('react-dom');
var ClassNames = require('classnames');

import _ from "underscore"

import UnitPanel from "./UnitPanel.jsx"
import SpeciesPanel from "./SpeciesPanel.jsx"

class ControlPanel extends React.Component {


    constructor(props) {
        super(props);

        this.state = {

            totalUnits: 0

        }
    }

    componentDidMount() {
        this.timeout = window.setInterval(()=>{
            this.forceUpdate()
        }, 500);
    }


    render() {

        let allSpecies = this.props.universe.getSpeciesArr();

    	return (
            <div className="control-panel">
                <div className="control-panel__top"></div>
                <div className="control-panel__main">
                    <UnitPanel unit={ this.props.selectedUnit } unselectUnit={this.props.unselectUnit} universe={this.props.universe} />
                    <SpeciesPanel selectSpecies={this.props.selectSpecies} dispatch={this.props.dispatch} allSpecies={allSpecies} />
                </div>
            </div>
    	)
    }
}

export default ControlPanel;








