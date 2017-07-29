
import React from "react"
import {
  GAME_MODE_INTRO,
  GAME_MODE_SETUP,
  GAME_MODE_STARTED
} from "../constants";
import Game from "./Game.jsx"


export default class App extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      //gameMode: GAME_MODE_INTRO,
      gameMode: GAME_MODE_SETUP,
      currGame: null
    }

  }

  onNewGame = () => {

    this.setState({
      game: this.props.game,
      gameMode: GAME_MODE_SETUP
    })
  }


  render() {
    const { game } = this.props;
    const { gameMode } = this.state;
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
                    game={game}
                    gameStage={game.gameStage}
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