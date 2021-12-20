# Vue SignalR Plugin

[![NPM Install](https://nodei.co/npm/@quangdao/vue-signalr.png?mini=true)](https://www.npmjs.com/package/@quangdao/vue-signalr)

SignalR plugin for Vue 3.

## Installation

To install in Vue 3:

```typescript
import { createApp } from 'vue';
import { VueSignalR } from '@quangdao/vue-signalr';
import App from './App.vue';

createApp(App)
  .use(VueSignalR, { url: 'http://localhost:5000/signalr' })
  .mount('#app');
```

### Configuration

The plugin accepts a configuration object with the following values:

| Property             | Required | Description                                                                                         |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| url                  | Yes      | The address to your SignalR server                                                                  |
| disconnected         | No       | Callback to trigger when the connection is lost                                                     |
| reconnected          | No       | Callback to trigger when the connection is reestablished                                            |
| accessTokenFactory   | No       | Factory that returns an access token to pas to the hub                                              |
| prebuild             | No       | Hook to modify the connection builder before the connection is built                                     |
| automaticReconnect   | No       | When true, the connection will automatically attempt to reconnect; _Default: false_                    |
| automaticUnsubscribe | No       | When true, events will automatically be unsubscribed when a component is destroyed; _Default: true_ |

### Accessing SignalR Directly

If the built-in configuration options are not enough for you, Vue SignalR exposes both the connection and the builder itself. The connection is accessible through `signalr.connection` during normal usage (see [Usage](#usage) below). In order to hook into the builder, you need to pass a `prebuild` method in the configuration object upon initialization. For example:

```typescript
createApp(App)
  .use(VueSignalR, {
    url: 'http://localhost:5000/signalr',
    prebuild(builder: HubConnectionBuilder) {
      builder.configureLogging(LogLevel.Information);
    }
  })
  .mount('#app');
```

## Usage

This plugin provides a composable function to inject the SignalR service:

```typescript
import { inject } from 'vue';
import { useSignalR } from '@quangdao/vue-signalr';

export default {
  setup() {
    const signalr = useSignalR();
  }
};
```

### Tokens

For type safety, I recommend declaring constant tokens. As an example:

```typescript
import { MyObject } from '@/models/my-object';
import { HubCommandToken, HubEventToken } from '@quangdao/vue-signalr';

const SendMessage: HubCommandToken<MyObject> = 'SendMessage';
const MessageReceived: HubEventToken<MyObject> = 'MessageReceived';

// models/my-object.ts
interface MyObject {
  prop: string;
}
```

**Note**: In version 0.0.6, SignalRClientMethod and SignalRServerMethod were renamed to HubEventToken and HubCommandToken, respectively. The original names are exported as aliases for compatibility reasons, but will be removed in a final release. Please make sure to update these accordingly if you are upgrading from 0.0.5.

#### Receiving Messages

If you used tokens mentioned above:

```typescript
setup() {
  signalr.on(MessageReceived, (message) => console.log(message.prop));
}
```

Alternative, you can pass in the method name as a string, with an optional type argument for the data:

```typescript
// Both of these work:
signalr.on('MessageReceived', message => console.log(message.prop)); // Data object is untyped
signalr.on<MyObject>('MessageReceived', message => console.log(message.prop));
```

#### Unsubscribing

If `automaticUnsubscribe` is configured (enabled by default), Vue SignalR will automatically unsubscribe from all events called within a component when the component is destroyed. If you need to programmatically unsubscribe from an event, you can use `signalr.off`.

Same rules regarding tokens above apply here.

```typescript
setup() {
  const messageReceivedCallback = (message) => console.log(message.prop);

  signalr.on(MessageReceived, messageReceivedCallback);
  onBeforeUnmount(() => signalr.off(MessageReceived, messageReceivedCallback));
}
```

Automatic unsubscribe can also be configured per-basis by passing a third boolean argument to `signalr.on`. This option will always take precendence over the initial configuration, so regardless of whether it's enabled or not, `true` will always automatically unsubscribe, and `false` will always prevent it.


```typescript
// Unsubscribes
signalr.on(MessageReceived, messageReceivedCallback, true);

// Does not unsubscribe
signalr.on(MessageReceived, messageReceivedCallback, false);
```

#### Sending Message

To send a message to the server, you can either `invoke` a command if you are expecting a response, or `send` a command without waiting for an acknowledgement. Same rules regarding tokens above apply to both methods.

```typescript
signalr.send(SendMessage, { prop: 'value' });
```

```typescript
signalr
  .invoke(SendMessage, { prop: 'value' })
  .then(response => doSomethingWith(response));
```

### Error Handling

Errors are handled at the app level by passing in a property to the options object. I used a redirect here, but you can probably get creative with some fancy state management or something.

```typescript
createApp(App)
  .use(VueSignalR, {
    url: 'http://localhost:5000/signalr',
    disconnected() {
      router.push('/disconnected');
    }
  })
  .mount('#app');
```

You can also attach an event listener to the connection itself, however, be aware that because this is the global connection object used by the service, the listener will not be unbound when the component is destroyed:

```typescript
setup() {
  const signalr = useSignalR();
  signalr.connection.onclose(() => customCallback());
}
```

Alternatively, if you just need a flag to check whether the you are still connected, the service exposes a ref through `signalr.getConnectionStatus()`.
