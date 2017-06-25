import React from "react"
import ClassNames from "classnames"
import { PropTypes } from "react"
import DnaBlueprint from "../DnaBlueprint"




export default class SpeciesSelector extends React.Component {

	static propTypes = {
		allSpecies: PropTypes.array,
		numMutations: 0,
		onSelectSpecies: PropTypes.func,
		selected: PropTypes.number
	}

	onSelectSpecies = (species) => {
		this.props.onSelectSpecies(species);
	}

	render() {

		const { allSpecies, onSelectSpecies, numMutations, selected } = this.props;

		return (
			<div className="species-selector">
				<h2>Choose which of your species to mutate</h2>
				<div className="species-selector__list">
					{
						allSpecies.map((species, index) => {
							const classnames = ClassNames({
								"species-selector__item": true,
								"species-selector__item--selected": selected === species.id
							});
							return(
								<div className={classnames} onClick={this.onSelectSpecies.bind(this, species.id)}>
									<DnaBlueprint dna={species.encodedDna} width={60} height={60} />
								</div>
							)
						})
					}
				</div>
			</div>
		)
	}
}

