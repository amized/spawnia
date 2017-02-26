
import DNA from "./DNA";
import {
	MAP_OBJ_UNIT,
	MAP_OBJ_FOOD
} from "../constants"
import Unit from "./Unit"
import Food from "./Food"
import MapObject from "./MapObject"
import SpeciesData from "./SpeciesData"

import { World, Composite } from "matter-js"


class Universe {
	constructor(world) {
		this.world = world;
		this.mapObjects = [];
		this.world.gravity = {
			x: 0,
			y: 0
		}

		this.mapSize = {
			width: 3500,
			height: 3500
		}

		this.speciesData = new SpeciesData();
	}

	getMapSize() {
		return this.mapSize;
	}

	getMapObject(id) {
		return this.mapObjects.find(obj => obj.id === id);
	}

	replaceMapObjectBody(id, body) {
		let obj = this.getMapObject(id);
		let oldBody = obj.body;
		World.remove(this.world, oldBody);
		World.add(this.world, body);
		obj.setBody(body);
	}

	deleteMapObject(id) {
		let index = this.mapObjects.findIndex(obj => obj.id === id);
		if (index !== -1) {
			World.remove(this.world, this.mapObjects[index].body);
			this.mapObjects.splice(index, 1);
		}
	}


	deleteUnit(unit) {
		this.speciesData.unitDies(unit);		
		unit.die();
		this.deleteMapObject(unit.id);

		// We only add species data once the unit matures, so remove it only
		// if the unit is mature

		/*

		*/


	}

	clear() {
		World.clear(this.world);
		this.mapObjects = [];		
	}

	hydrate(state) {
		this.clear();
		console.log("HYDRATING UNIVERSE - ", Composite.allBodies(state.world).map(b=>b.id));
		state.mapObjects.forEach(obj => {
			
			let newObj;
			let MapObjClass;

			switch (obj.type) {
				case MAP_OBJ_UNIT: {
					MapObjClass = Unit;
					break;
				}
				case MAP_OBJ_FOOD: {
					MapObjClass = Food;
					break;
				}
				default:
					MapObjClass = MapObject;

			}

			newObj = new MapObjClass(obj.body, obj.id, obj);
			
			this.add(newObj);

		});
		console.log("HYDRATING UNIVERSE - ", Composite.allBodies(this.world).map(b=>b.id));
	}

	add(mapObject) {
		World.add(this.world, mapObject.body);
		this.mapObjects.push(mapObject);
	}

	getState() {
		return {
			mapObjects: this.mapObjects.map(obj => Object.assign({}, obj)),
			world: this.world
		}
	}

	getUnits() {
		return this.mapObjects.filter(obj => obj.type === MAP_OBJ_UNIT);
	}

	getFoods() {
		return this.mapObjects.filter(obj => obj.type === MAP_OBJ_FOOD);
	}


	getMapBody(id) {
		let body = Matter.Composite.get(this.world, id, "");
		return body;
	}

	getData() {
		return {
			world: this.world,
			mapObjects: this.mapObjects.map(o => o.getData())
		}
		//return new Serializer().serializeObject(this);
		/*
		return {
			//foods: this.foods.map(food=>food.getData()),
			world: this.world,
			//units: this.getUnitsArr().map(unit=>unit.getData()), 
			//speciesData: this.speciesData
		}
		*/
	}

	getUnitsOfSpecies(species) {
		return this.getUnitsArr().filter(unit => unit.encodedDna === species.encodedDna );
	}	



	applySelectedSpecies(species) {

		let units = this.getUnitsArr();
		units.forEach((unit) => {
			unit.deselect();
		});

		if (species) {
			units = units.filter(unit => unit.encodedDna === species.encodedDna );
			units.forEach((unit) => {
				unit.applySelected();
			});
		}
	}




	/* Units */
	getUnitsArr() {
		return Object.keys(this.units).map(key => this.units[key]);
	}

	getNumUnits() {
		return Object.keys(this.units).length;
	}

	getNumMaturedUnits() {
		return this.getUnits().filter(unit => unit.isMature()).length;
	}



	addUnit(unit) {

		this.units[unit.id] = unit;
	}

	selectUnit(unit) {
		unit.applySelected();
	}

	/* Foood */
	getFood(foodId) {
		return this.foods.filter((food)=> food.id === foodId)[0];
	}

	getFoodBodies() {
		return this.foods.map((food)=>{ return food.body }); 
	}
}


export default Universe