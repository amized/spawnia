
import Cell from "./Cell"
import CellTypes from "./CellTypes";
import { COLLISION_CATEGORY_UNITS, COLLISION_CATEGORY_DEFAULT, COLLISION_CATEGORY_FOOD } from "../constants"
import { FOOD_RADIUS } from "../settings"
import { Body, Bodies, Query, Composite } from "matter-js"
import DNA from "./DNA"
import _ from 'underscore'
import { getNewCellPosFromParent, DIR } from "./Geometry";
export default class UnitBuilder {



  /**
   * Creates a cell object for the seed
   */
  static buildFood(x, y, amount = 500) {

    let radius = 8 * Math.sqrt(amount/Math.PI);

    return Bodies.circle(0, 0, radius, {
      friction: 0.5,
      frictionAir: 0.9,
      label: "food",
      isStatic: true,
      owner: this,
      position: {
        x: x,
        y: y
      },
      collisionFilter: {
        //category: COLLISION_CATEGORY_FOOD
        mask: 0
      },
      render: {
         objectType: "food",
         strokeStyle: "#D8D8AB",
         fillStyle: "rgba(252, 255, 174, 0.2)"
      }
    });      
  }





  /**
   * Method for creating a matter js body object that wraps some child cells
   */
  static buildParentBody(cells) {
  let body = Body.create({
      label: "unit:",
      restitution: 0.5,
      friction: 0.0,
      frictionAir: 0,           
      force: {
        x: 0,
        y: 0
      },
      collisionFilter: {
        //group: 1
        
        category: COLLISION_CATEGORY_UNITS
        //mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_UNITS
        
      },
      render: {}
    });

  //let cellBodies = cells.map(item => { return item.body });
  //let c = Composite.create();

    Body.setParts(body, cells);
    /*
    let vertices = [];
    cells.forEach((cell) => {
      console.log(cell);
      let left = cell.position.x - 5;
      let right = cell.position.x + 5;
      let top = cell.position.y + 5;
      let bottom = cell.position.y - 5;

      let vectors = [{x: left,y: top},{x:right,y:top},{x:left,y:bottom},{x:right,y:bottom}];

      vertices = _.uniq(_.union(vertices, vectors), (item, key) => {
        return "X" + Math.round(item.x) + "Y" + Math.round(item.y);
      });
    });

    console.log("The vertices!", vertices);
    return Bodies.fromVertices(cells[0].position.x, cells[0].position.y, vertices);
    */
    return body;
  }

 /**
   * Creates a matured body from the given dna
   */
  static buildBody(dna, x, y) {

    if (typeof dna === "string") {
      // Decode
      dna = DNA.decodeDna(dna);
    }

    let cells = this.buildAllCells(dna, x, y);

   let body = this.buildParentBody(this.buildCellBodies(cells, x, y));
   return body;
  }

  /**
   * Creates bodies for this cell and all it's decendant cells in the dna tree
   */
  static getHexVertices(x,y) {
    let hexHeight = 7;
    let hexWidth = hexHeight / (Math.sqrt(3)/2);
    for (let i = 0; i < numRows; i++) {
     for (let j = 0; j < numColumns; j++) {
      let pts = getPoints(hexHeight, hexWidth);
      let yOffset = (j%2 === 0) ? 0 : hexHeight/2;
      pts = pts.map((pt, index) => {
        return {
         x: pt.x + (hexWidth * j * 0.75),
         y: pt.y + (hexHeight * i) + yOffset
        }
      });
      polygons.push(pts);
      index++;
     }
    }
  }




  /**
   * Creates a cell object for the seed
   */
  static buildSeedCell(dna, x, y) {
    let cell = dna.seedCell;
    //let newCell = new Cell(x, y, cell.type, 0);
    let newCell = this.buildCellBody(cell, x, y);
    return this.buildParentBody([newCell]);      
  }

  

  static buildCellBodies(cells, x, y) {
    return cells.map(cell=> {
      return this.buildCellBody(cell, x + cell.offsetX, y + cell.offsetY)
    })
  }


  /**
   * Create body for the cell
   */
  static buildCellBody(cell, x, y) {
    let cellType = CellTypes[cell.type];
    let color = cellType ? cellType.bodyColor : "#FFFFFF";
    let cellMargin = 10;
    return Bodies.circle(x, y, 5, {
      label: cell.type,
      render: {
         fillStyle: color,
         strokeStyle: '#333333',
         lineWidth: 1,
         cellType: cellType
      }
    });
  }


  /**
   * Creates the matured body and returns an array of cells
   */
  static buildAllCells(dna, x, y) {
    let cells = [];
    this.buildCellRecurse(dna.seedCell, 0, 0, 0, DIR.NORTH, cells);
    //console.log("Result of convex gull", this.buildConvexHull(dna, x, y));
    return cells;
  }


  /**
   *
   */
  static buildConvexHull(dna, x, y) {

    const DIR = {
      LEFT: 0,
      UP: 1,
      RIGHT: 2,
      DOWN: 3
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

    function getOffsetPos(x, y, dir) {
      console.log("in get offset pos", x, y, dir);
      switch (dir) {
        case DIR.LEFT:
          return {
            x: x - 10,
            y: y
          }
        case DIR.RIGHT:
          return {
            x: x + 10,
            y: y
          }
        case DIR.UP:
          return {
            x: x,
            y: y - 10
          }
        case DIR.DOWN:      
          return {
            x: x,
            y: y + 10
          }          
      }
    }

    function recurse(cell, x, y, vertices, currVerticeIndex, direction) {

      console.log("The direction", direction);

      let left = x - 5;
      let top = y - 5;
      let right = x + 5;
      let bottom = y + 5;

      let newVertices;

      if (cell === null) {
        return;
      }

      if (cell.type === "S") {
        newVertices = [
          { x: left, y: top },
          { x: right, y: top },                
          { x: right, y: bottom }, 
          { x: left, y: bottom }
        ]
      }
      else {
        switch (direction) {

          case DIR.LEFT:
            newVertices = [
              {x: left, y: bottom},
              {x: left, y: top},
            ]
            break;
          case DIR.RIGHT:
            newVertices = [
              {x: right, y: top},
              {x: right, y: bottom},
            ]          
            break;
          case DIR.UP:
            newVertices = [
              {x: left, y: top},
              {x: right, y: top},
            ]          
            break;
          case DIR.DOWN:
            newVertices = [
              {x: right, y: bottom},
              {x: left, y: bottom},
            ]          
            break;          
        }        
      }


      vertices.splice(currVerticeIndex, 0, newVertices[1]);
      vertices.splice(currVerticeIndex, 0, newVertices[0]);

      if (cell.children) {
        cell.children.forEach((childCell, index) => {

/*
          ---------
          | A | B |
          ---------
          | D | C |
          ---------
*/

          let newX, newY, verticeIndex, newDir;
          switch(index) {
            // turn left
            case 0: {
              verticeIndex = currVerticeIndex;
              newDir = turnLeft(direction);
              break;
            }
            // go straight
            case 1:
              verticeIndex = currVerticeIndex + 1;
              newDir = goStraight(direction);
              break;
            // turn right
            case 2:
              verticeIndex = currVerticeIndex + 2;
              newDir = turnRight(direction);
              break;
            // go back
            case 3:
              verticeIndex = currVerticeIndex + 3;
              newDir = goBack(direction);            
              break;                       
          }
          const newPos = getOffsetPos(x, y, newDir);
          recurse(childCell, newPos.x, newPos.y, vertices, verticeIndex, newDir);
        });
      }
    }
    let vertices = [];
    recurse(dna.seedCell, 0, 0, vertices, 0, DIR.UP);
    return vertices;
  }



  static transformPosFromIndex(x, y, index, cellMargin) {
    switch (index) {
      // left
      case 0:
        return {
          x: x - cellMargin,
          y: y
        }
      // up
      case 1:
        return {
          x: x,
          y: y - cellMargin
        }            
      // right
      case 2:
        return {
          x: x + cellMargin,
          y: y
        }            
      // down   
      case 3: 
        return {
          x: x,
          y: y + cellMargin
        }                                 
      default:
        console.log("Transforming index to position: INDEX INVALID - ", index);
        return {
          x, y
        }       
    }      
  }


 /**
   * Creates bodies for this cell and all it's decendant cells in the dna tree
   */
  static buildCellRecurse(cell, x, y, angle, direction, allCells, cellBodies) {
    
    // Make sure it doesnt intrsect any current
    const cellMargin = 10;
    let thresh = cellMargin / 2;
    let intersecting = allCells.find(c=> {
      return (Math.abs(c.offsetX - x) < thresh && Math.abs(c.offsetY - y) < thresh)
    });

    if (intersecting) {
      console.log("found an intersection cell!");
      return;
    }

    allCells.push({
      type: cell.type,
      offsetX: x,
      offsetY: y,
      direction: direction,
      angle: angle
    });

    //cellBodies.push(this.buildCellBody(newCell));

    // Recursively create bodies of all the children cells
    if (cell.children) {
      cell.children.forEach((childCell, index) => {
        if (!childCell) {
          return;
        }

        let angleOffset = 0;

        //let newPos = this.transformPosFromIndex(x, y, index, cellMargin);
        let { pos, dir } = getNewCellPosFromParent(x, y, direction, index, cellMargin);
        /*
        let newPos = {
          x: x +  (cellMargin * Math.cos(angleOffset)),
          y: y + (cellMargin*Math.sin(angleOffset))
        }
        */
        var childCell = this.buildCellRecurse(childCell, pos.x, pos.y, angleOffset, dir, allCells);
      });
    }
    // return the body so it can link to its parents
    //return newCell;
  }





}