
import { 
  ENGINE_STEP_TIMEOUT
} from "../../settings"

export function msToSteps(ms) {
	return (Math.floor(ms/ENGINE_STEP_TIMEOUT))
}

export function stepsToMs(steps) {
	return (Math.floor(steps) * ENGINE_STEP_TIMEOUT)
}


export function formatTime(ms) {
	let minutes = Math.floor((ms / 1000 / 60) % 60);
	let seconds = Math.floor((ms / 1000) % 60);
    seconds = ('0' + seconds).slice(-2);
    minutes = ('0' + minutes).slice(-2);		
	return minutes + ":" + seconds;
}



export function getCanvasDimensions() {
    return {
    	width: window.innerWidth,
    	height: window.innerHeight - 252
    }  
}



