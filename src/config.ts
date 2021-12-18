import { HubConnectionBuilder } from '@microsoft/signalr';

export interface SignalRConfig {
	url: string;
	disconnected?: () => void;
	reconnected?: () => void;
	accessTokenFactory?: () => string | Promise<string>;
	onBeforeBuild?: (builder: HubConnectionBuilder) => void;
	automaticReconnect?: boolean;
}
