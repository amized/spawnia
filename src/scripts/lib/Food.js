
import { Composite, Constraint, Bodies, Body } from "matter-js"
import { FOOD_RADIUS } from "../settings"
import { COLLISION_CATEGORY_FOOD, COLLISION_CATEGORY_DEFAULT  } from "../constants"


let foodIds = 0;

class Food {
    constructor(amount) {
        this.id = foodIds++;
        this.amount = amount;
        this.growthLimit = amount;
        this.body = Bodies.circle(0, 0, FOOD_RADIUS, {
            friction: 0.5,
            frictionAir: 0.9,
            label: "food",
            isStatic: true,
            owner: this,
            collisionFilter: {
                mask: COLLISION_CATEGORY_DEFAULT
            },
            render: {
                 objectType: "food",
                 text: this.amount,
                 strokeStyle: "#ebedc8",
                 fillStyle: "#f7ffe1"
            }
        });
    }

    getData() {
        return Object.assign({}, this);
    }

    grow(amount) {
    	if (this.amount + amount > this.growthLimit) {
    		this.amount = this.growthLimit;
    	}
    	else {
    		this.amount = this.amount + amount;
    	}

    	this.body.render.text = this.amount;
    }

    getConsumedBy(amount) {
    	this.amount = this.amount - amount;
    	this.body.render.text = this.amount;
    }
}

export default Food