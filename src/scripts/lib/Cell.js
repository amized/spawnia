
import CellTypes from "./CellTypes";
import { Bodies } from "matter-js"
import { UNIT_START_ENERGY_PER_CELL } from "../settings"
import { COLLISION_CATEGORY_UNITS, COLLISION_CATEGORY_DEFAULT } from "../constants"

class Cell {
    constructor(x, y, type, angle) {

        this.type = type;
        this.angle = angle;


        let cellType = CellTypes[type];
        let color = cellType ? cellType.bodyColor : "#FFFFFF";
        let cellMargin = 10;


        this.body = Bodies.polygon(x, y, 6, 6, {
            friction: 0.0,
            frictionAir: 0,
            label: 1,
            restitution:1,
            collisionFilter: {
                category: COLLISION_CATEGORY_UNITS,
                mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_UNITS
            },
            render: {
                 fillStyle: color,
                 strokeStyle: '#333333',
                 lineWidth: 1,
                 cellType: cellType
            }
        });
    }
}

export default Cell