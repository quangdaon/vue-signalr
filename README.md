# Vue SignalR Plugin

[![NPM Install](https://nodei.co/npm/@quangdao/vue-signalr.png?mini=true)](https://www.npmjs.com/package/@quangdao/vue-signalr)

This plugin has only been tested with Vue 3 and TypeScript. Use at your own risk.

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

### Events

For type safety, I recommend declaring constant methods like so:

```typescript
import {
  SignalRServerMethod,
  SignalRClientMethod
} from '@quangdao/vue-signalr';

const SendMessage: SignalRServerMethod<MyObject> = 'SendMessage';
const MessageReceived: SignalRClientMethod<MyObject> = 'MessageReceived';

interface MyObject {
  prop: string;
}
```

#### Receiving Messages

If you used typed method keys mentioned above:

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

Eventually, I want to automatically unbind all subscription within the context of a component when that component is destroyed, but for now I recommend unsubscribing from all of your connections onBeforeUnmount.

Same rules regarding method keys above apply here.

```typescript
setup() {
  const messageReceivedCallback = (message) => console.log(message.prop);

  signalr.on(MessageReceived, messageReceivedCallback);
  onBeforeUnmount(() => signalr.off(MessageReceived, messageReceivedCallback));
}
```

#### Sending Message

Same rules regarding method keys above apply here.

```typescript
signalr.invoke(SendMessage, { prop: 'value' });
```

### Error Handling

Errors are handled at the app level by passing in a property to the options object. I used a redirect here, but you can probably get creative with some fancy state management or something.

```typescript
import { createApp } from 'vue';
import { VueSignalR } from '@quangdao/vue-signalr';
import router from './router';
import App from './App.vue';

createApp(App)
  .use(VueSignalR, {
    url: 'http://localhost:5000/signalr',
    disconnected() {
      router.push('/disconnected');
    }
  })
  .mount('#app');
```
