export interface SignalRConfig {
	url: string;
	disconnected?: () => void;
}
