
import React, { PropTypes } from "react"
import Modal from "./Modal"


import { 
  PLAYSTATE_PLAYING, 
  PLAYSTATE_PAUSED,
  GAME_STAGE_NOGAME,
  GAME_STAGE_BUILDINGSPECIES,
  GAME_STAGE_PLACESPECIES,
  GAME_STAGE_READY_TO_START,
  GAME_STAGE_WATCHING,
  GAME_STAGE_ENDED,
  GAME_STAGE_ENDED_DEATH,
  GAME_STAGE_ENDED_TIMEOUT
} from "../constants";


export default class Modals extends React.Component {

  static propTypes = {
    game: PropTypes.object,
    gameStage: PropTypes.number
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
  }

  startSimulation = () => {
    this.props.game.run();
  }

  startGame = () => {
    this.props.game.reset();
  }


  componentWillReceiveProps(nextProps) {

    const nextStage = nextProps.gameStage;
    const currStage = this.props.gameStage;

    if (nextStage !== currStage) {
      switch (nextStage) {
        case GAME_STAGE_PLACESPECIES:
          this.setState({
            isOpen: true
          })
          return;
        case GAME_STAGE_BUILDINGSPECIES:
          this.setState({
            isOpen: false
          })
          return;
      }
    }

    if (nextStage === GAME_STAGE_PLACESPECIES && currStage !== GAME_STAGE_PLACESPECIES) {
      this.setState({
        isOpen: true
      })
    }
  }


  render() {

    const { isOpen } = this.state;
    const { game } = this.props;
    const { myPlayer, gameStage } = game;

    let showNewGameDialog = isOpen && gameStage === GAME_STAGE_NOGAME;
    let showPlaceSpeciesDialog = isOpen && gameStage === GAME_STAGE_PLACESPECIES;
    let showStartSimulationDialog = isOpen && gameStage === GAME_STAGE_READY_TO_START;
   
    let showIWonBySurvivingDialog, showIWonByScoreDialog, showILostDialog, showImOutDialog = false;

    if (game.isEnded()) {
      if (game.winner !== myPlayer) {
        showImOutDialog = myPlayer.isOut;
        showILostDialog = !showImOutDialog;
      }
      else {
        showIWonBySurvivingDialog = gameStage === GAME_STAGE_ENDED_DEATH;
        showIWonByScoreDialog = gameStage === GAME_STAGE_ENDED_TIMEOUT;
      }
    }


    return (
      <div>

        <Modal show={showIWonBySurvivingDialog}>
          <h2>Congratulations, you won!</h2>
          <p>All your opponents species have died off while you remain a surviver. Well done!</p>
          <button onClick={this.startGame}>Another game</button>
        </Modal>
        <Modal show={showIWonByScoreDialog}>
          <h2>Congratulations, you won!</h2>
          <p>The timer ran out and you ended with the highest score of { myPlayer.score } points!</p>
          <button onClick={this.startGame}>Another game</button>
        </Modal>

        <Modal show={showImOutDialog} >
          <h2>You're dead!</h2>
          <p>Too bad, it looks like all your units have died.</p>
          <button onClick={this.startGame}>Another game</button>
        </Modal>

        {
          game.winner ?
            <Modal show={showILostDialog}>
              <h2>Game over!</h2>
              <p>{ "Too bad, " + game.winner.name  + " has won with a total of " + game.winner.score +  " points. You finished with " + myPlayer.score  + "."}</p>
              <button onClick={this.startGame}>Another game</button>
            </Modal>
          :
            null
        }



        <Modal
          show={showNewGameDialog}
        >
          <h2>New Game</h2>
          <p>Looks like you're new, so I'll take you through how the game
          works.</p>
          <hr />
          <h3>Step 1: Design a species</h3>
          <p>The first step is to design a species that you will
          plant into the world of Spawnia. To get started
          click below!</p>

          <button onClick={this.startGame}>Create a species</button>
        </Modal>
        <Modal
          show={showStartSimulationDialog}
        >
          <h2>We're ready to go!</h2>
          <p>Congratulations you have now placed your first species into 
          the world of Spawnia. When you're ready to start, click below.
          </p>
          <button onClick={this.startSimulation}>Start</button>
        </Modal>
      </div>

    )
  }
}



