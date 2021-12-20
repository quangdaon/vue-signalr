import {
	HubConnection,
	HubConnectionBuilder,
	IHttpConnectionOptions
} from '@microsoft/signalr';
import { onBeforeUnmount, ref } from 'vue';
import { SignalRConfig } from './config';
import { HubEventToken, HubCommandToken } from './tokens';

type Action = () => void;

/**
 * A service to integrate SignalR with VueJS
 */
export class SignalRService {
	/** The current SignalR connection object */
	public readonly connection: HubConnection;

	private initiated = false;
	private connected = ref(false);

	private invokeQueue: Action[] = [];
	private successQueue: Action[] = [];

	constructor(
		private options: SignalRConfig,
		connectionBuilder: HubConnectionBuilder
	) {
		const connection = this.buildConnection(connectionBuilder);
		this.configureConnection(connection);
		this.connection = connection;
	}

	/** Start the connection; called automatically when the plugin is registered */
	async init() {
		try {
			await this.connection.start();

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
		} catch {
			this.fail();
		}
	}

	/** Set a callback to trigger when a connection to the hub is successfully established */
	connectionSuccess(callback: () => void) {
		if (this.initiated) {
			callback();
		} else {
			this.successQueue.push(callback);
		}
	}

	/**
	 * Send a command to the SignalR hub
	 * @param target The name or token of the command to send to
	 * @param message The payload to send to the command
	 * @returns a promise the resolves with the event returns a value
	 */
	invoke<TMessage, TResponse = any>(
		target: HubCommandToken<TMessage>,
		message?: TMessage
	): Promise<TResponse> {
		const invoke = () =>
			message
				? this.connection.invoke(target as string, message)
				: this.connection.invoke(target as string);

		return new Promise<TResponse>((res, rej) => {
			if (this.initiated) {
				invoke().then(res).catch(rej);
			} else {
				this.invokeQueue.push(() => invoke().then(res).catch(rej));
			}
		});
	}

	/**
	 * Send a command to the SignalR hub without awaiting a response
	 * @param target The name or token of the command to send to
	 * @param message The payload to send to the command
	 */
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

	/**
	 * Subscribe to an event on the hub
	 * @param target The name or token of the event to listen to
	 * @param callback The callback to trigger with the hub sends the event
	 */
	on<T>(target: HubEventToken<T>, callback: (arg: T) => void) {
		this.connection.on(target as string, callback);
		onBeforeUnmount(() => this.off(target, callback));
	}

	/**
	 * Unsubscribe from an event on the hub
	 * @param target The name or token of the event to unsubscribe from
	 * @param callback The specific callback to unsubscribe. If none is provided, all listeners on the target will be unsubscribed
	 */
	off<T>(target: HubEventToken<T>, callback?: (arg: T) => void) {
		if (callback) {
			this.connection.off(target as string, callback);
		} else {
			this.connection.off(target as string);
		}
	}

	/** Get a reactive connection status */
	getConnectionStatus() {
		return this.connected;
	}

	private buildConnection(builder: HubConnectionBuilder) {
		const options = this.options;
		const connOptions: IHttpConnectionOptions = {};

		if (options.accessTokenFactory) {
			connOptions.accessTokenFactory = options.accessTokenFactory;
		}

		if (options.prebuild) options.prebuild(builder, connOptions);

		builder.withUrl(options.url, connOptions);

		if (options.automaticReconnect) builder.withAutomaticReconnect();

		return builder.build();
	}

	private configureConnection(connection: HubConnection) {
		connection.onreconnected(() => this.reconnect());
		connection.onreconnecting(() => this.fail());
		connection.onclose(() => this.fail());
	}

	private reconnect() {
		this.connected.value = true;
		this.options.reconnected?.call(null);
	}

	private fail() {
		this.connected.value = false;
		this.options.disconnected?.call(null);
	}
}
