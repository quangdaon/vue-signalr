import { App } from 'vue';

export interface SignalRConfig {
	url: string;
	disconnected?: () => void
}
