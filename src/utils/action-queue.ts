type Action = () => void | Promise<void>;

export class ActionQueue {
	private actions: Action[] = [];

	enqueue(action: Action): void {
		this.actions.push(action);
	}

	resolve(): void {
		while (this.actions.length) {
			const action = this.actions.shift() as Action;
			action.call(this);
		}
	}
}
