import { HubConnectionBuilder, IHttpConnectionOptions } from '@microsoft/signalr';

export interface SignalRConfig {
	url: string;
	disconnected?: () => void;
	reconnected?: () => void;
	accessTokenFactory?: () => string | Promise<string>;
	prebuild?: (builder: HubConnectionBuilder, options: IHttpConnectionOptions) => void;
	automaticReconnect?: boolean;
}
