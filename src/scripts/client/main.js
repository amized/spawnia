// Main JS entry point

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { app } from '../reducers'

import App from '../components/App.jsx'
import Game from '../lib/Game.js'

import DelayChain from '../lib/utils/DelayChain.js'
import TransitionClass from '../lib/utils/TransitionClass.js'

import reducers from '../reducers'

var socketClient 	= require("./socketClient");

const game = new Game();

console.log(Game);

let store = createStore(reducers, {});
let rootEl = document.getElementById("root");
let dispatch = game.getDispatchFn();



socketClient.initConnection(store, "", "1111111");

render(
	<Provider store={store}>
    	<App engine={game.getEngine()} universe={game.getUniverse()} dispatch={dispatch} />
  	</Provider>,
  rootEl
)

