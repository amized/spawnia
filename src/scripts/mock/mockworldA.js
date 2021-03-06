		
import DNA from '../lib/DNA'
import { Dna1, Dna2, Dna3, Dna4, Dna5, Dna6 } from "../mock/dna";
import uuid from 'uuid'
import { MATURATION_TIME } from "../settings"
import { Bodies } from "matter-js"
import {
	COLLISION_CATEGORY_DEFAULT,
	COLLISION_CATEGORY_UNITS,
	MAP_OBJ_FOOD
} from "../constants"
import { Food } from "../lib/Food"


export default function makeWorld(dispatch) {


	/*

	const props = {
		isStatic: true,
		restitution: 1,
		collisionFilter: {
            category: COLLISION_CATEGORY_UNITS
            //mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_UNITS
        }
    }

    let bodies = [];

	bodies.push(Bodies.rectangle(500, 300, 20, 200, props));
	bodies.push(Bodies.circle(200, 300, 20, props));
	bodies.push(Bodies.circle(100, 400, 20, props));
	bodies.push(Bodies.rectangle(200, 200, 20, 200, props));
	bodies.push(Bodies.rectangle(500, 500, 300, 30));

	const worldObjects = bodies.map((body,index) => new MapObject(body, index));
	
	const foods = [new Food(body, 400)]




	return bodies.map((body,index) => new MapObject(body, index));



	*/

	let unitid = uuid.v1();
	let now = Date.now();
	/*
	dispatch({
		type: "ADD_UNIT",
		dna: "S(X(,X(F,E,R),G),F,E,R)",
		x: 400,
		y: 450,
		id: unitid,
		bornAt: 0
	});
	*/
/*
	dispatch({
		type: "ADD_UNIT",
		dna: DNA.encodeDna(Dna3),
		x: 200,
		y: 450,
		id: uuid.v1(),
		bornAt: 0
	});
	*/

	dispatch({
		type: "BUILD_WORLD"
	});
	/*
    dispatch({
    	type: "MATURE_UNIT",
    	unitId: unitid
    }, MATURATION_TIME);
	*/





	dispatch({
		type: "ADD_FOOD",
		amount: 2000,
		x: 1500,
		y: 600,
		id: uuid.v1()
	});


	dispatch({
		type: "ADD_FOOD",
		amount: 5000,
		x: 2500,
		y: 300,
		id: uuid.v1()
	});




	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 300,
		y: 50,
		id: uuid.v1()
	});

	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 500,
		y: 50,
		id: uuid.v1()
	});

	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 400,
		y: 50,
		id: uuid.v1()
	});
	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 200,
		y: 400,
		id: uuid.v1()
	});

	dispatch({
		type: "ADD_FOOD",
		amount: 500,
		x: 300,
		y: 400,
		id: uuid.v1()
	});


	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 400,
		y: 300,
		id: uuid.v1()
	});

	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 500,
		y: 300,
		id: uuid.v1()
	});	

	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 600,
		y: 300,
		id: uuid.v1()
	});	

	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 100,
		y: 500,
		id: uuid.v1()
	});

	dispatch({
		type: "ADD_FOOD",
		amount: 200,
		x: 400,
		y: 450,
		id: uuid.v1()
	});

	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 300,
		y: 200,
		id: uuid.v1()
	});
	dispatch({
		type: "ADD_FOOD",
		amount: 100,
		x: 50,
		y: 50,
		id: uuid.v1()
	});
	
	dispatch({
		type: "ADD_FOOD",
		amount: 600,
		x: 900,
		y: 100,
		id: uuid.v1()
	});

	dispatch({
		type: "ADD_FOOD",
		amount: 600,
		x: 900,
		y: 300,
		id: uuid.v1()
	});


	dispatch({
		type: "ADD_FOOD",
		amount: 500,
		x: 1100,
		y: 500,
		id: uuid.v1()
	});
	dispatch({
		type: "ADD_FOOD",
		amount: 800,
		x: 900,
		y: 700,
		id: uuid.v1()
	});
	dispatch({
		type: "ADD_FOOD",
		amount: 1000,
		x: 200,
		y: 800,
		id: uuid.v1()
	});


	dispatch({
		type: "ADD_STATIC_BLOCK",
		x: 500,
		y: 300,
		width: 20,
		height: 200
	});

	dispatch({
		type: "ADD_STATIC_BLOCK",
		x: 200,
		y: 200,
		width: 20,
		height: 200
	});

	dispatch({
		type: "ADD_STATIC_BLOCK",
		x: 500,
		y: 500,
		width: 300,
		height: 30
	});

	dispatch({
		type: "ADD_STATIC_BLOCK",
		x: 800,
		y: 500,
		width: 40,
		height: 300
	});

	dispatch({
		type: "ADD_STATIC_BLOCK",
		x: 1200,
		y: 300,
		width: 30,
		height: 600
	});

	dispatch({
		type: "ADD_STATIC_CIRCLE",
		x: 200,
		y: 300,
		r: 20
	});

	dispatch({
		type: "ADD_STATIC_CIRCLE",
		x: 100,
		y: 400,
		r: 20
	});	



	/*


	dispatch({
		type: "ADD_UNIT",
		DNA: Dna6,
		x: 350,
		y: 200
	}, 120);

	dispatch({
		type: "ADD_UNIT",
		DNA: Dna1,
		x: 400,
		y: 100
	}, 120);



	dispatch({
		type: "ADD_UNIT",
		DNA: Dna1,
		x: 450,
		y: 100
	}, 120);			


	dispatch({
		type: "ADD_UNIT",
		DNA: Dna1,
		x: 250,
		y: 400
	}, 220);


	dispatch({
		type: "ADD_UNIT",
		DNA: Dna5,
		x: 150,
		y: 400
	}, 140);



	dispatch({
		type: "ADD_UNIT",
		DNA: Dna1,
		x: 700,
		y: 200
	}, 220);

	dispatch({
		type: "ADD_UNIT",
		DNA: Dna4,
		x: 650,
		y: 200
	}, 140);
	dispatch({
		type: "ADD_UNIT",
		DNA: Dna4,
		x: 650,
		y: 300
	}, 140);

	dispatch({
		type: "ADD_UNIT",
		DNA: Dna4,
		x: 650,
		y: 400
	}, 140);
	dispatch({
		type: "ADD_UNIT",
		DNA: Dna4,
		x: 650,
		y: 500
	}, 140);		

	dispatch({
		type: "ADD_UNIT",
		DNA: Dna4,
		x: 700,
		y: 150
	}, 160);		
	*/
}