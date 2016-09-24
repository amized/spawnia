/*
function visibilityFilter(state = 'SHOW_ALL', action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case 'COMPLETE_TODO':
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: true
          })
        }
        return todo
      })
    default:
      return state
  }
}
*/
//import { VisibilityFilters } from '../actions'

const initialAppState = {
  mapState: {
    isInit: false
  }
}

function app(state = initialAppState, action) {

  switch (action.type) {
    case 'NEW_MAP':
      return {
        mapState: action.mapState
      }
    case 'UPDATE':
      return {
        mapState: action.mapState
      }
    default:
      return state
  }
}


/*
import { combineReducers } from 'redux'

const spawniaApp = combineReducers({
  map,
  units
})
*/
export default app





