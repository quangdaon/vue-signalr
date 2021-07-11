import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { App } from 'vue';
import { SignalRConfig } from './models/SignalRConfig';
import {
	SignalRClientMethod,
	SignalRServerMethod
} from './models/SignalRMethods';

export class SignalRService {
	private connection: HubConnection;
	private connected = false;

	private invokeQueue: (() => void)[] = [];
	private successQueue: (() => void)[] = [];

	constructor(private app: App, private options: SignalRConfig) {
		this.connection = new HubConnectionBuilder().withUrl(options.url).build();
		this.connection.onclose(() => this.fail());
	}

	init() {
		console.log('connected');
		this.connection
			.start()
			.then(() => {
				this.connected = true;
				while (this.invokeQueue.length) {
					const action = this.invokeQueue.shift();
					action?.call(this);
				}

				while (this.successQueue.length) {
					const action = this.successQueue.shift();
					action?.call(null);
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

	invoke<T>(target: SignalRServerMethod<T>, message: T) {
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

	on<T>(target: SignalRClientMethod<T>, callback: (arg: T) => void) {
		this.connection.on(target as string, callback);
	}

	off<T>(target: SignalRClientMethod<T>, callback?: (arg: T) => void) {
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
