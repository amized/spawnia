

import { GAME_STAGE_WATCHING } from "../../constants"


function kickStart(game, actionList) {
  game.reset();
  let simulation = game.simulation;
  game.newGame(2);

  game.addSpecies("S(X(,X(F,E,R),G),F,E,R)", 0);
  game.addSpecies("S(,G(,F(,E,F,),E,,),R,,)", 0);



  game.gameStage = GAME_STAGE_WATCHING;
  actionList.forEach(action => {
    simulation.immediateDispatch(action);
  });
  game.run();
}


export {
  kickStart
}