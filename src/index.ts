export { VueSignalR, useSignalR } from './plugin';
export { SignalRService } from './service';
export { SignalRConfig } from './config';
export { HubCommandToken, HubEventToken } from './tokens';
export { SignalRSymbol } from './symbols';

import { HubCommandToken, HubEventToken } from './tokens';

/** @deprecated Use HubEventToken instead */
export type SignalRClientMethod<T> = HubEventToken<T>;

/** @deprecated Use HubCommandToken instead */
export type SignalRServerMethod<T> = HubCommandToken<T>;
