
const UPDATE = 'UPDATE'
//const REMOVE_TODO = 'REMOVE_TODO'
//const LOAD_ARTICLE = 'LOAD_ARTICLE'

//import * as gameState from "./gameState";



export * from "./gameState";

export function updateMap(mapState) {
  return {
    type: UPDATE,
    mapState: mapState
  }
}


export function	socketConnected() {
		return {
			type: "SOCKET_CONNECTED"
		}
	}

export function	socketDisconnected() {
		return {
			type: "SOCKET_DISCONNECTED"
		}
	}

export function	socketWaiting() {
		return {
			type: "SOCKET_WAITING"
		}
	}


export function	synced() {
	return {
		type: "SYNCED"
	}
}

export function	lostSync() {
	return {
		type: "LOST_SYNC"
	}
}








//export default update