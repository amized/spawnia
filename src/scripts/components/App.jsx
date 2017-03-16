
import React from "react"
import {
  GAME_MODE_INTRO,
  GAME_MODE_SETUP,
  GAME_MODE_STARTED
} from "../constants";
import GameStandalone from "../lib/GameStandalone";
import Game from "./Game.jsx"
import makeWorld from "../mock/mockworldA";



export default class App extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      gameMode: GAME_MODE_INTRO,
      currGame: null
    }

  }

  onNewGame = () => {
    const game = new GameStandalone(makeWorld);
    this.setState({
      game: game,
      gameMode: GAME_MODE_SETUP
    })
  }


  render() {
    const { gameMode, game } = this.state;
    console.log("The game", game);
    return (
      <div className="app-wrapper">
        {
          (()=>{
            switch(gameMode) {
              case GAME_MODE_INTRO:
                return (
                  <div className="intro">
                    <h1>Welcome to Spawnia!</h1>
                    <p>The game where you design a species to dominate the world.</p>

                    <button onClick={this.onNewGame}>New game</button>
                  </div>

                );
              case GAME_MODE_SETUP:
                const simulDispatch = game.simulation.dispatch;
                const simulPlay = game.simulation.resume;
                const simulPause = game.simulation.pause;
                const getCurrStep = game.simulation.getCurrStep;
                return (
                  <Game
                    engine={game.engine} 
                    universe={game.universe} 
                    simulation={game.simulation}
                    simulDispatch={simulDispatch} 
                    simulPlay={simulPlay}
                    simulPause={simulPause}
                    getCurrStep={getCurrStep}
                  />
                );
            }
          })()
        }
      </div>


    )
  }


}