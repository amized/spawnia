
import { Composite, Constraint, Bodies, Body } from "matter-js"
import { FOOD_RADIUS } from "../settings"
import { COLLISION_CATEGORY_FOOD, COLLISION_CATEGORY_DEFAULT, MAP_OBJ_FOOD  } from "../constants"
import MapObject from './MapObject';

class Food extends MapObject {


    constructor(body, id, props) {
        props.type = MAP_OBJ_FOOD;
        super(body, id, props);
        this.growthLimit = props.amount;
    }

    grow(amount) {
        const growBy = this.growthLimit/2;
        this.amount = Math.min(this.growthLimit, this.amount + growBy);
    	this.body.render.text = this.amount;

    }

    getConsumedBy(amount) {
    	this.amount = this.amount - amount;
    	this.body.render.text = this.amount;
    }
}

export default Food