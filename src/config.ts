import {
	HubConnectionBuilder,
	IHttpConnectionOptions
} from '@microsoft/signalr';

export interface SignalRConfig {
	/** The address to your SignalR server */
	url: string;

	/** Callback to trigger when the connection is lost */
	disconnected?: () => void;

	/** Callback to trigger when the connection is reestablished */
	reconnected?: () => void;

	/**
	 * Function returning either the an access token to pass to every
	 * command or a promise that returns the token
	 * @example
	 * accessTokenFactory: () => '<my-access-token>'
	 * @example
	 * accessTokenFactory: authService.getAccessToken */
	accessTokenFactory?: () => string | Promise<string>;

	/**
	 * Hook to modify the connection build before the connect is built
	 * @param builder The connection builder
	 * @param options The connection builder options
	 * @example
	 * prebuild(builder: HubConnectionBuilder) {
	 *   builder.configureLogging(LogLevel.Information)
	 * }
	 */
	prebuild?: (
		builder: HubConnectionBuilder,
		options: IHttpConnectionOptions
	) => void;

	/**
	 * When true, the connection will automatically attempt to reconnect
	 * @default false
	 */
	automaticReconnect?: boolean;

	/**
	 * When true, events will automatically be unsubscribed when a component is destroyed
	 * @default true
	 */
	 automaticUnsubscribe?: boolean;
}
