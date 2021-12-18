export interface SignalRConfig {
	url: string;
	disconnected?: () => void;
	reconnected?: () => void;
	accessTokenFactory?: () => string | Promise<string>;
	automaticReconnect?: boolean;
}
