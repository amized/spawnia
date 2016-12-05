import CircularJSON from 'circular-json';

module.exports = function(sockRouter){


	/******** CONNECTIONS ********/

    sockRouter.on("SUBSCRIBE_TO_CHANNEL", function(data, conn, game) {

    	console.log("HIYYA!");

    	const channel = game.channel;
    	const user = null;
    	channel.requestConnection(conn, user);

    	let state = game.universe.getState();
        let currStep = game.simulation.getCurrStep();
        let serialized = CircularJSON.stringify(state);

    	//console.log(universeData);

    	conn.write(JSON.stringify({
    		dump: true,
    		state: serialized,
            currStep: currStep
    	}));


    });

}