var uuid = require('node-uuid');
import { World } from "matter-js";
import { MAP_OBJ_GENERAL } from "../constants";

/*

MapObjects are in charge of:

-  building their own bodies
- reflushing with props
- 



*/

class MapObject {

    constructor(body, id, props={}) {
        this.id = id;
        this.body = body;
        this.bodyId = body.id;
        this.type = (props.type) ? props.type : MAP_OBJ_GENERAL;
        this.body.label = this.type + ":" + id;
        Object.assign(this, props);
    }

    getBody(world) {
        return World.get(world, this.bodyId);
    }

    setBody(body) {
        this.body = body;
        this.body.label = this.type + ":" + this.id;
    }

    getData() {
        let data = {};
        let props = Object.getOwnPropertyNames(this).forEach(function (p) {
            if (typeof this[p] !== 'function') {
                data[p] = this[p];
            }
        });
    }

    getState() {
        return {
            id: this.id,
            body: this.body
        }   
    }
    /*
    reconstruct(props) {
        if (props) {
            Object.assign(this, props);
        }
    }
    */

    static reconstruct(props) {
        const mapObject = new MapObject(props.body, props.id, props);
        return mapObject;
    }

    makeBody() {
        let body = {};
        return body;
    }

}

module.exports = MapObject;