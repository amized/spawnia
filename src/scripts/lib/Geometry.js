



export const DIR = {
  WEST: 0,
  NORTH: 1,
  EAST: 2,
  SOUTH: 3
}


function turnLeft(dir) {
  return dir - 1 < 0 ? dir + 3 : dir - 1;
}
function goStraight(dir) {
  return dir;
}
function turnRight(dir) {
  return dir + 1 > 3 ? dir - 3 : dir + 1;
}  
function goBack(dir) {
  return dir - 2 < 0 ? dir + 2 : dir - 2;
} 


export function getAngleOfDirection(dir) {

  switch (dir) {
      case DIR.SOUTH:
        return Math.PI / 2;
      case DIR.EAST:
        return 0;           
      case DIR.NORTH:
        return -Math.PI / 2;
      case DIR.WEST: 
        return Math.PI;
      default:
        throw new Error("Invalid direction! " + dir);
  }
}



export function transformPosInDirection(x, y, dir, cellMargin) {

	switch (dir) {
      case DIR.WEST:
        return {
          x: x - cellMargin,
          y: y
        }
      case DIR.NORTH:
        return {
          x: x,
          y: y - cellMargin
        }            
      case DIR.EAST:
        return {
          x: x + cellMargin,
          y: y
        }
      case DIR.SOUTH: 
        return {
          x: x,
          y: y + cellMargin
        }
      default:
      	throw new Error("Invalid direction! " + dir);
	}
}

export function getNewCellPosFromParent(parentX, parentY, parentDir, childIndex, cellMargin) {
	let newDir;
	switch (childIndex) {
		// turn left
	    case 0:
	      newDir = turnLeft(parentDir);
	      break;
	    // go straight
	    case 1:
	      newDir = goStraight(parentDir);
	      break;
	    // turn right
	    case 2:
	      newDir = turnRight(parentDir);
	      break;
	    // go back
	    case 3:
	      newDir = goBack(parentDir);            
	      break;                       
	}
	return {
		pos: transformPosInDirection(parentX, parentY, newDir, cellMargin),
		dir: newDir
	}
}


 
