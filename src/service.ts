import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { SignalRConfig } from './config';
import {
	HubEventToken,
	HubCommandToken
} from './tokens';

type Action = () => void;

export class SignalRService {
	private connection: HubConnection;
	private connected = false;

	private invokeQueue: Action[] = [];
	private successQueue: Action[] = [];

	constructor(
		private options: SignalRConfig,
		connectionBuilder: HubConnectionBuilder
	) {
		this.connection = connectionBuilder.withUrl(options.url).build();
		this.connection.onclose(() => this.fail());
	}

	init() {
		this.connection
			.start()
			.then(() => {
				this.connected = true;
				while (this.invokeQueue.length) {
					const action = this.invokeQueue.shift() as Action;
					action.call(this);
				}

				while (this.successQueue.length) {
					const action = this.successQueue.shift() as Action;
					action.call(null);
				}
			})
			.catch(() => {
				this.fail();
			});
	}

	connectionSuccess(callback: () => void) {
		if (this.connected) {
			callback();
		} else {
			this.successQueue.push(callback);
		}
	}

	invoke<T>(target: HubCommandToken<T>, message: T) {
		return new Promise((res, rej) => {
			if (this.connected) {
				this.connection
					.invoke(target as string, message)
					.then(res)
					.catch(rej);
			} else {
				this.invokeQueue.push(() =>
					this.connection
						.invoke(target as string, message)
						.then(res)
						.catch(rej)
				);
			}
		});
	}

	on<T>(target: HubEventToken<T>, callback: (arg: T) => void) {
		this.connection.on(target as string, callback);
	}

	off<T>(target: HubEventToken<T>, callback?: (arg: T) => void) {
		if (callback) {
			this.connection.off(target as string, callback);
		} else {
			this.connection.off(target as string);
		}
	}

	private fail() {
		this.options.disconnected?.call(null);
	}
}
