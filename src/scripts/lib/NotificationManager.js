import { stateChange } from '../../../../react-oo';

class NotificationManager {

	constructor(game) {
		this.notifications = [];
		this.ids = 0;
	}

	@stateChange
	notify(data) {
		this.notifications.unshift({
			type: data.type,
			msg: data.msg,
			id: this.ids++
		})
	}

	getLastN(n) {
		return this.notifications.slice(0, n);
	}
}


export default NotificationManager

/****** Types of notificatiosn we may want: ******

- Species dies
- Species getting low
- Mutation
- Change of winning player


*/