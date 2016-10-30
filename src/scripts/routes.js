import { Serializer } from "mousse"



module.exports = function(sockRouter){


	/******** CONNECTIONS ********/

    sockRouter.on("SUBSCRIBE_TO_CHANNEL", function(data, conn, game) {

    	console.log("HIYYA!");
    	console.log(data, game);

    	const channel = game.channel;
    	const user = null;
    	channel.requestConnection(conn, user);

    	let universeData = game.universe.getData();

    	console.log(universeData);

    	conn.write(new Serializer.serializeObject({
    		dump: true,
    		universe: game.universe
    	}));


    });

}