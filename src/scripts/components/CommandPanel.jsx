import React from "react"
import ReactDOM from "react-dom"

export default class CommandPanel extends React.Component {

	onClick(e) {
		e.preventDefault();
		this.props.openSpeciesEditor();
	}

	render() {
		return (
			<div className="command-panel">
				<a href="#" onClick={this.onClick.bind(this)}>Create unit...</a>
			</div>
		)
	}

}