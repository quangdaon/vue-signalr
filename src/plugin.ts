import type { SignalRConfig } from './config';
import { App, inject } from 'vue';
import { SignalRService } from './service';
import { SignalRSymbol } from './symbols';
import { HubConnectionBuilder } from '@microsoft/signalr';

/** The SignalR Plugin for Vue JS */
export const VueSignalR = {
	install(app: App, options: SignalRConfig): void {
		const service = new SignalRService(options, new HubConnectionBuilder());

		app.provide(SignalRSymbol, service);

		service.init();
	}
};

/** Inject the SignalR service */
export function useSignalR(): SignalRService {
	const signalr = inject(SignalRSymbol);

	if (!signalr) {
		throw new Error('Failed to inject SignalR');
	}

	return signalr;
}
