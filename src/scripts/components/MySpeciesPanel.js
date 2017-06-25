

import React from "react"
import ReactDOM from "react-dom"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from "underscore"
import DnaBlueprint from "./DnaBlueprint"
import ClassNames from 'classnames'
import { 
	ENERGY_COST_PER_CELL, 
	UNIT_START_ENERGY_PER_CELL, 
	ENERGY_STORAGE_PER_FAT 
} from "../settings"
import { connect } from "react-redux"
import Roo from '../../../../react-oo';
import throttle from 'react-throttle-render'

class MySpeciesPanel extends React.Component {


	render() {
		const { myPlayer, mySpecies } = this.props;

		return (
			<div className="my-species-panel">
				<div className="my-species-panel__list">
				{
					mySpecies.filter(s => s.population > 0).map((s, index) => {
						return (
							<div className="my-species-panel__item" key={index}>
								<DnaBlueprint dna={s.encodedDna} width={50} height={50} />
							</div>
						)
					})

				}
				{

					myPlayer.mutations.length > 0 ?
						<div className="my-species-panel__mutation" onClick={this.props.onEditMutation}>
							?
							<div className="my-species-panel__mutation-count">{myPlayer.mutations.length}</div>
						</div>
					:
						null
				}

				</div>
      </div>
    );
	}
}

function select(state) {

  const { gameState } = state;
  const mySpecies = gameState.species.filter((species) => {
  	return species.playerId === gameState.myPlayer;
  })
  const myPlayer = gameState.players[gameState.myPlayer]

  return {
    mySpecies: mySpecies,
    myPlayer: myPlayer
  };
}

function mapToProps(objs) {

	const { game } = objs;

	return {
		mySpecies: game.getMySpecies(),
		myPlayer: game.getMyPlayer()
	}

}

export default Roo.connect()(throttle(500)(MySpeciesPanel));

