
const UPDATE = 'UPDATE'
//const REMOVE_TODO = 'REMOVE_TODO'
//const LOAD_ARTICLE = 'LOAD_ARTICLE'


export function updateMap(mapState) {
  return {
    type: UPDATE,
    mapState: mapState
  }
}


//export default update