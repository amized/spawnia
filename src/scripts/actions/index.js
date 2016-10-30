
const UPDATE = 'UPDATE'
//const REMOVE_TODO = 'REMOVE_TODO'
//const LOAD_ARTICLE = 'LOAD_ARTICLE'


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


//export default update