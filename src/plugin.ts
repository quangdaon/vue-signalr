import { SignalRConfig } from './models/SignalRConfig';
import { App, inject, Plugin } from 'vue';
import { SignalRService } from './service';

export const VueSignalR: Plugin = {
	install(app: App, options: SignalRConfig) {
		const service = new SignalRService(app, options);

		app.provide('signalr', service);

		inject('signalr');

		service.init();
	}
};
