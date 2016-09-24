// Main JS entry point

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './components/App.jsx'
import Game from "./lib/Game.js"

import DelayChain from "./lib/utils/DelayChain.js"
import TransitionClass from "./lib/utils/TransitionClass.js"


Game.init();

console.log(Game);

let store = Game.store;
let rootEl = document.getElementById("root")
let dispatch = Game.getDispatchFn();

render(
    <App engine={Game.getEngine()} universe={Game.getUniverse()} dispatch={dispatch} />,
  rootEl
)