type Action = () => void | Promise<any>;

export class ActionQueue {
	private actions: Action[] = [];

	enqueue(action: Action) {
		this.actions.push(action);
	}

	resolve() {
		while (this.actions.length) {
			const action = this.actions.shift() as Action;
			action.call(this);
		}
	}
}
