import { combineReducers } from "redux"
import { 
  CONN_STATUS_CONNECTED, 
  CONN_STATUS_DISCONNECTED, 
  CONN_STATUS_WAITING, 
  SYNC_STATUS_WAITING,
  SYNC_STATUS_SYNCED
} from "../constants"

import gameState from "./gameState";

function client(state, action) {

  if (state === undefined) {
    return {
      connectionStatus: "DISCONNECTED"
    }    
  }

  switch(action.type) {
    case "DUMP_ME":
      var user = action.user;
      if (action.user === null) {
        user = {
          status: USER_STATUS_CANNOT_CHAT
        }
      }
      var copy = Object.assign({}, state, {
        user: user
      });
      return copy;      
    case "SOCKET_CONNECTED":
      var copy = Object.assign({}, state, {
        connectionStatus: CONN_STATUS_CONNECTED
      });
      return copy;

    case "SOCKET_DISCONNECTED":
      var copy = Object.assign({}, state, {
        connectionStatus: CONN_STATUS_DISCONNECTED
      });
      return copy;

    case "SOCKET_WAITING":
      var copy = Object.assign({}, state, {
        connectionStatus: CONN_STATUS_WAITING
      });
      return copy; 

    default: 
      return state;
  }  
}


function syncStatus(state = SYNC_STATUS_WAITING, action) {
  switch(action.type) {
    case "SYNCED":
      return SYNC_STATUS_SYNCED;
    case "LOST_SYNC":
      return SYNC_STATUS_WAITING;
    default: 
      return state;
  }  
}

var app = combineReducers({
  client: client,
  syncStatus: syncStatus,
  gameState: gameState
});

export default app





