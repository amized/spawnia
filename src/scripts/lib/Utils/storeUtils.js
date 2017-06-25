



let store = null;

export default function storeUtils(s) {
	store = s;
}

export function getPlayerScore(playerId) {
	const state = store.getState();
	const species = state.gameState.species;
	const playerSpecies = species.filter(s => s.playerId === playerId);
	let score = 0;
	if (playerSpecies.length > 0) {
		score = playerSpecies.map(species => {
			return species.getScore();
		}).reduce((acc, cur) => {
			return acc + cur;
		});
	}
	return score;
}


export function getPlayersStillIn() {
	const state = store.getState();
	const players = state.gameState.players;
	return players.filter(p => !p.isOut);	
}
