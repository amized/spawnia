
import { 
	COLLISION_CATEGORY_UNITS, 
	COLLISION_CATEGORY_DEFAULT, 
	COLLISION_CATEGORY_FOOD 
} from "../constants"

import MapObject from "./MapObject"
import { Body, Bodies, Query, Composite } from "matter-js"

export function getBarriers(mapWidth, mapHeight) {

    let bodies = [];
    var boundsWidth = 50;
    const propsBarriers = {
        isStatic: true,
        restitution: 1,
        collisionFilter: {
            category: COLLISION_CATEGORY_UNITS
        },
        render: {
            fillStyle: "#999",
            strokeStyle: "#999",
            wireframes: true
        }
    }

    bodies.push(Bodies.rectangle(mapWidth/2, 0, mapWidth, boundsWidth, propsBarriers));
    bodies.push(Bodies.rectangle(mapWidth/2, mapHeight, mapWidth, boundsWidth, propsBarriers));
    bodies.push(Bodies.rectangle(0, mapHeight/2, boundsWidth, mapHeight, propsBarriers));
    bodies.push(Bodies.rectangle(mapWidth, mapHeight/2, boundsWidth, mapHeight, propsBarriers));

    return bodies.map((body,index) => new MapObject(body, index));

}


export function buildStaticBlock(x, y, width, height) {
	const props = {
		isStatic: true,
		restitution: 1,
		collisionFilter: {
            category: COLLISION_CATEGORY_UNITS
        }
    }

    return Bodies.rectangle(x, y, width, height, props);
}


export function buildStaticCircle(x, y, r) {
	const props = {
		isStatic: true,
		restitution: 1,
		collisionFilter: {
            category: COLLISION_CATEGORY_UNITS
        }
    }

    return Bodies.circle(x, y, r, props);
}









