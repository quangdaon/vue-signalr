import { SignalRConfig } from './models/SignalRConfig';
import { App, inject, Plugin } from 'vue';
import { SignalRService } from './service';
import { SignalRSymbol } from './symbols';
import { HubConnectionBuilder } from '@microsoft/signalr';

export const VueSignalR: Plugin = {
	install(app: App, options: SignalRConfig) {
		const service = new SignalRService(options, new HubConnectionBuilder());

		app.provide(SignalRSymbol, service);

		service.init();
	}
};

export function useSignalR() {
  const signalr = inject(SignalRSymbol);

  if (!signalr) {
    throw new Error('Failed to inject SignalR');
  }

  return signalr;
}
