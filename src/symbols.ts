import { SignalRService } from './service';
import type { InjectionKey } from 'vue';

/** The injection key for the SignalR service */
export const SignalRSymbol: InjectionKey<SignalRService> =
	Symbol('SignalRService');
