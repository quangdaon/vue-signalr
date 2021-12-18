import {
	HubConnectionBuilder,
	IHttpConnectionOptions
} from '@microsoft/signalr';

export interface SignalRConfig {
	/** The url of the hub to connect to */
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

	/** When true, the connect will automatically attempt to reconnect */
	automaticReconnect?: boolean;
}
