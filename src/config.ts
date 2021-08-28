export interface SignalRConfig {
	url: string;
	disconnected?: () => void;
	automaticReconnect?: boolean;
}
