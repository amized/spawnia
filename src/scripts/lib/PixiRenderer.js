import "pixi.js"
import { 
	MAP_OBJ_GENERAL,
	MAP_OBJ_UNIT,
	MAP_OBJ_FOOD,
  COLLISION_CATEGORY_UNITS, 
  LIFESTATE_UNBORN,
  LIFESTATE_CHILD, 
  LIFESTATE_MATURE, 
  LIFESTATE_DEAD
} from "../constants";

import _ from "underscore";
import { Vertices } from "matter-js";
import { goBack, transformPosInDirection, DIR } from "./Geometry";

const PIXI = window.PIXI;

export default class PixiRenderer {



	constructor(options) {

		this.options = options;

		this.app = new PIXI.Application({
			width: options.width, 
			height: options.height, 
			view: options.canvas, 
			antialias: true
		});

		this.renderer = PIXI.autoDetectRenderer();
		this.renderer.backgroundColor = 0xFFFFFF;

		this.ticker = new PIXI.ticker.Ticker();
		this.ticker.stop();
		this.ticker.add((deltaTime) => {
		  this.renderWorld(this.universe);
		});

				// create a texture from an image path
		const backTexture = PIXI.Texture.fromImage('/assets/img/space1.png');
		const blurFilter = new PIXI.filters.BlurFilter();
		this.backTilingSprite = new PIXI.extras.TilingSprite(backTexture, options.width, options.height);
		//this.backTilingSprite.filters = [blurFilter];
		this.backTilingSprite.tileScale.x = 0.3;
		this.backTilingSprite.tileScale.y = 0.3;
		this.backTilingSprite.alpha = 0.7;
		blurFilter.blur = 0.5;

		this.graphics = {};
		this.worldContainer = new PIXI.Container();
		
		this.foreground = new PIXI.Container();
		this.background = new PIXI.Container();

		this.background.addChild(this.backTilingSprite);
		this.foreground.addChild(this.worldContainer);

		this.app.stage.addChild(this.background);
		this.app.stage.addChild(this.foreground);

		this.universe = options.universe;
		this.prevMapObjects = [];

	}

	drawUnit(species) {




	}

	run() {
		this.ticker.start();
	}

	stop() {
    this.ticker.stop();
  };

  updateBounds(boundingBox, canvasWidth, canvasHeight) {
  	this.bounds = boundingBox;
  	this.options.width = canvasWidth;
  	this.options.height = canvasHeight;
  	this.renderer.view.style.width = canvasWidth;
  	this.renderer.view.style.height = canvasHeight;
  	this.backTilingSprite.tilePosition.x = -0.2 * boundingBox.min.x;
  	this.backTilingSprite.tilePosition.y = -0.2 * boundingBox.min.y;
  }

  renderUnit(mapObject) {

  	const body = mapObject.body;
  	const species = mapObject.species;

  	const graphics = new PIXI.Graphics();
    // handle compound parts
    for (let k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
      let part = body.parts[k];
      let cell = part.render.cell;
      let color = parseInt('0x' + part.render.fillStyle.slice(1));
      let {x, y} = {x: part.position.x - body.position.x, y: part.position.y - body.position.y};

			graphics.lineStyle(1, 0x333333);
			graphics.beginFill(color);
      graphics.drawCircle(x, y, part.circleRadius);

      if (cell.type !== "S") {
      	graphics.lineStyle(1, 0x000000, 0.2);
	      let parentBorderPos = transformPosInDirection(x, y, goBack(cell.direction), 5);
	      graphics.moveTo(x, y);
	      graphics.lineTo(parentBorderPos.x, parentBorderPos.y);
	      if (cell.children) {
		      cell.children.forEach((child, index) => {
		      	if (child) {
		      		let pos = transformPosInDirection(x, y, child.direction, 5);
		      		graphics.moveTo(x, y);
		      		graphics.lineTo(pos.x, pos.y);
		      	}
		      });
	      }      	
      }


      graphics.closePath();
      graphics.endFill();
    }

    let colorMatrix = new PIXI.filters.ColorMatrixFilter();
		graphics.filters = [colorMatrix];
		colorMatrix.saturate(-0.5);

    graphics.zIndex = 2;
		graphics.lifeState = mapObject.lifeState;

    return graphics;
  }


  renderBody(mapObject) {

  	const graphics = new PIXI.Graphics();

  	switch (mapObject.type) {
  		case MAP_OBJ_UNIT:
  			return this.renderUnit(mapObject);

  		case MAP_OBJ_FOOD: 
    		graphics.beginFill(0xF2CF3B, 0.2);
    		graphics.zIndex = 1;
				break;

			case MAP_OBJ_GENERAL:
				graphics.beginFill(0xAAAAAA);
				graphics.lineStyle(2, 0x999999);
				graphics.zIndex = 5;
				break;
  	}

  	const body = mapObject.body;


    // handle compound parts
    for (let k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
      let part = body.parts[k];
      if (part.circleRadius) {
          graphics.arc(part.position.x - body.position.x, part.position.y - body.position.y, part.circleRadius, 0, 2 * Math.PI);
          graphics.closePath();
          graphics.endFill();
      } else {
      		//let vertices = Object.assign({}, part.vertices);   //Vertices.translate(parts.vertices, {x: -body.position.x, y: -body.position.y});
      		let vertices = part.vertices.map((v) => {
      			return {
      				x: v.x - body.position.x,
      				y: v.y - body.position.y,
      				isInternal: v.isInternal
      			}
      		});

          graphics.moveTo(vertices[0].x, vertices[0].y);

          for (var j = 1; j < vertices.length; j++) {
              if (!vertices[j - 1].isInternal || showInternalEdges) {
                  graphics.lineTo(vertices[j].x, vertices[j].y);
              } else {
                  graphics.moveTo(vertices[j].x, vertices[j].y);
              }

              if (vertices[j].isInternal && !showInternalEdges) {
                  graphics.moveTo(vertices[(j + 1) % vertices.length].x, vertices[(j + 1) % vertices.length].y);
              }
          }
          
          graphics.lineTo(vertices[0].x, vertices[0].y);
          graphics.closePath();
      }
	  }
	  return graphics;
	}

	renderBackground() {



		var viewWidth = (this.renderer.width / this.renderer.resolution); // its the same width you assigned in resize. Resolution is used for Retina, dont ask now, you will thank me later :)

		var back = new PIXI.Container();

		back.scale.x = 1000 / viewWidth;
		back.scale.y = back.scale.x;

		stage.addChild(back);
	}

	renderWorld(universe) {


		// Apply transform to update bb
    let boundsWidth = this.bounds.max.x - this.bounds.min.x,
        boundsHeight = this.bounds.max.y - this.bounds.min.y,
        boundsScaleX = boundsWidth / this.options.width,
        boundsScaleY = boundsHeight / this.options.height;

    //console.log("The bounds", this.bounds);
    //console.log("The canvas", this.options.width, this.options.height);
    this.worldContainer.scale = { x: 1 / boundsScaleX, y: 1 / boundsScaleY };
    this.worldContainer.position = { x: -this.bounds.min.x, y: -this.bounds.min.y };


    let mapObjects = universe.mapObjects;

		let i = 0;
		for (i = 0; i < universe.mapObjects.length; i++) {
			let mapObject = universe.mapObjects[i];
			let body = mapObject.body;
			let graphics = this.graphics[mapObject.id];
			if (graphics === undefined) {
				graphics = this.renderBody(mapObject);
				this.worldContainer.addChild(graphics);
				this.graphics[mapObject.id] = graphics;
			}

			

			switch (mapObject.type) {

				case MAP_OBJ_GENERAL: {
					break;
				}

				case MAP_OBJ_UNIT: {

					if (graphics.lifeState !== mapObject.lifeState) {
						// Maturing, replace the artwork
						if (mapObject.lifeState === LIFESTATE_MATURE) {
							graphics.destroy();
							graphics = this.renderBody(mapObject);
							this.worldContainer.addChild(graphics);
							this.graphics[mapObject.id] = graphics;

						}						
					}
					let health = mapObject.getHealth();
					graphics.filters[0].saturate(health - 1);
				}

				case MAP_OBJ_FOOD: {
					break;
				}
			}

			graphics.position = {
				x: body.position.x,
				y: body.position.y
			}
			graphics.rotation = body.angle;

		}

		// Overlay

		// Finds graphics with missing mapObjects and destroys them
		for (let key in this.graphics) {
			let graphics = this.graphics[key];
			if (graphics) {
				let obj = mapObjects.find(mo => mo.id === key);
				if (obj === undefined) {
					graphics.destroy();
					this.graphics[key] = undefined;
				}
			}
		}

		this.worldContainer.children.sort(function(a,b) {
      a.zIndex = a.zIndex || 0;
      b.zIndex = b.zIndex || 0;
      return a.zIndex - b.zIndex
		});

		this.prevMapObjects = universe.mapObjects.slice();



	}




}