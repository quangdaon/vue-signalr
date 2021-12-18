/** The name of a command to send to the SignalR server */
export interface HubCommandToken<T> extends String { }

/** The name of an event sent by the SignalR server */
export interface HubEventToken<T> extends String {}
