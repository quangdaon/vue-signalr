/**
 * The name of a command to send to the SignalR server
 * @typeParam TMessage - The type of the payload to send
 * @typeParam TResponse - The type of the response when using "signalr.invoke".
 */
export interface HubCommandToken<TMessage, TResponse = void> extends String {}

/**
 * The name of an event sent by the SignalR server
 * @typeParam TMessage - The type of the payload sent by the server
 */
export interface HubEventToken<TMessage> extends String {}
