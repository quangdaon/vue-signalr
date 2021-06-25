import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { App } from 'vue';
import { SignalRConfig } from './models/SignalRConfig';
import { SignalRClientMethod, SignalRServerMethod } from './models/SignalRMethods';

export class SignalRService {
	private connection: HubConnection;
	private connected = false;

	private invokeQueue: (() => void)[] = [];

	constructor(private app: App, private options: SignalRConfig) {
		this.connection = new HubConnectionBuilder().withUrl(options.url).build();
	}

	init() {
		this.connection.start().then(() => {
			this.connected = true;
			while (this.invokeQueue.length) {
				const action = this.invokeQueue.shift();
				action?.call(this);
			}
		});
	}

	invoke<T>(target: SignalRServerMethod<T>, message: T) {
		if (this.connected) {
			this.connection.invoke(target as string, message);
		} else {
			this.invokeQueue.push(() => this.connection.invoke(target as string, message));
		}
	}

	on<T>(target: SignalRClientMethod<T>, callback: (arg: T) => void) {
		this.connection.on(target as string, callback);
	}
}
