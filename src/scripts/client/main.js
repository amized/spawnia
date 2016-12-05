// Main JS entry point

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { app } from '../reducers'

import App from '../components/App.jsx'
import GameClient from './GameClient.js'

import DelayChain from '../lib/utils/DelayChain.js'
import TransitionClass from '../lib/utils/TransitionClass.js'

import reducers from '../reducers'

import socketClient from "./socketClient";

const store = createStore(reducers, {});
const game = new GameClient(null, store);


let rootEl = document.getElementById("root");



render(
	<Provider store={store}>
    	<App engine={game.engine} universe={game.universe} dispatch={null} />
  	</Provider>,
  rootEl
)

