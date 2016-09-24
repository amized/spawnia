var uuid = require('node-uuid');

class MapObject {
    constructor(map, body, x, y) {
        this.map = map;
        this.body = body;
        this.x = x | 0;
        this.y = y | 0;
        this.id = uuid.v1();
    }

    getProps() {
    	return {
    		width: this.x,
    		height: this.y
    	}
    }
}

module.exports = MapObject;