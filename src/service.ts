import {
	HubConnection,
	HubConnectionBuilder,
	IHttpConnectionOptions
} from '@microsoft/signalr';
import { ref } from 'vue';
import { SignalRConfig } from './config';
import { HubEventToken, HubCommandToken } from './tokens';

type Action = () => void;

export class SignalRService {
	private connection: HubConnection;
	private initiated = false;
	private connected = ref(false);

	private invokeQueue: Action[] = [];
	private successQueue: Action[] = [];

	constructor(
		private options: SignalRConfig,
		connectionBuilder: HubConnectionBuilder
	) {
		const connOptions: IHttpConnectionOptions = {};

		if (options.accessTokenFactory) {
			connOptions.accessTokenFactory = options.accessTokenFactory;
		}

		connectionBuilder.withUrl(options.url, connOptions);
		if (options.automaticReconnect) connectionBuilder.withAutomaticReconnect();

		this.connection = connectionBuilder.build();
		this.connection.onclose(() => this.fail());
	}

	init() {
		this.connection
			.start()
			.then(() => {
				this.initiated = true;
				this.connected.value = true;
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
		if (this.initiated) {
			callback();
		} else {
			this.successQueue.push(callback);
		}
	}

	invoke<T>(target: HubCommandToken<T>, message?: T) {
		const invoke = () =>
			message
				? this.connection.invoke(target as string, message)
				: this.connection.invoke(target as string);

		return new Promise((res, rej) => {
			if (this.initiated) {
				invoke().then(res).catch(rej);
			} else {
				this.invokeQueue.push(() => invoke().then(res).catch(rej));
			}
		});
	}

	send<T>(target: HubCommandToken<T>, message?: T) {
		const send = () =>
			message
				? this.connection.send(target as string, message)
				: this.connection.send(target as string);

		if (this.initiated) {
			send();
		} else {
			this.invokeQueue.push(send);
		}
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

	getConnectionStatus() {
		return this.connected;
	}

	private fail() {
		this.connected.value = false;
		this.options.disconnected?.call(null);
	}
}
