// Main JS entry point

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { app } from '../reducers'

import App from '../components/App.jsx'
import GameClient from './GameClient.js'
import GameStandalone from '../lib/GameStandalone.js'

import DelayChain from '../lib/utils/DelayChain.js'
import TransitionClass from '../lib/utils/TransitionClass.js'

import reducers from '../reducers'


import { synced, lostSync } from "../actions";


function runClient() {
	const store = createStore(reducers, {});
	const game = new GameClient(null, store);
	const rootEl = document.getElementById("root");
	render(
		<Provider store={store}>
	    	<App engine={game.engine} universe={game.universe} dispatch={null} />
	  	</Provider>,
	  rootEl
	)
	game.run();
}


function runStandAlone() {
	const store = createStore(
		reducers,
		window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
	);
	store.dispatch(synced());
	const rootEl = document.getElementById("root");

	render(
		<Provider store={store}>
	    	<App />
	  	</Provider>,
	  rootEl
	)
}

runStandAlone();
//runClient();


