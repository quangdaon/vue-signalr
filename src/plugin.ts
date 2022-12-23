import { NamedSignalRConfig, SignalRConfig } from './config';
import { App, inject, InjectionKey, Plugin } from 'vue';
import { SignalRService } from './service';
import { SignalRSymbol } from './symbols';
import { HubConnectionBuilder } from '@microsoft/signalr';

function registerService(
	app: App,
	key: string | InjectionKey<SignalRService>,
	options: SignalRConfig
) {
	const service = new SignalRService(options, new HubConnectionBuilder());

	app.provide(key, service);

	service.init();
}

/** The SignalR Plugin for Vue JS */
export const VueSignalR = {
	install(app: App, options: SignalRConfig | NamedSignalRConfig[]): void {
		if (options instanceof Array) {
			options.forEach(opt => registerService(app, opt.name, opt));
		} else {
			registerService(app, SignalRSymbol, options);
		}
	}
};

/** Inject the SignalR service */
export function useSignalR(
	key: string | InjectionKey<SignalRService> = SignalRSymbol
): SignalRService {
	const signalr = inject(key);

	if (!signalr) {
		throw new Error(`Failed to inject SignalR with key ${key.toString()}`);
	}

	return signalr;
}
