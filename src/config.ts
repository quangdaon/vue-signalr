export interface SignalRConfig {
	url: string;
	disconnected?: () => void;
	accessTokenFactory?: () => string | Promise<string>;
	automaticReconnect?: boolean;
}
