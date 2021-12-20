# Vue SignalR Plugin

[![NPM Install](https://nodei.co/npm/@quangdao/vue-signalr.png?mini=true)](https://www.npmjs.com/package/@quangdao/vue-signalr)

SignalR plugin for Vue 3.

## Quick Start

> For more detailed instructions, check out the wiki at <https://github.com/quangdaon/vue-signalr/wiki>.

### Installation

To install in Vue 3:

```typescript
import { createApp } from 'vue';
import { VueSignalR } from '@quangdao/vue-signalr';
import App from './App.vue';

createApp(App)
  .use(VueSignalR, { url: 'http://localhost:5000/signalr' })
  .mount('#app');
```

### Usage

This plugin provides a composable function to inject the SignalR service. The service exposes a few methods from the SignalR connection to support your app.

```typescript
import { inject } from 'vue';
import { useSignalR } from '@quangdao/vue-signalr';

interface MyObject {
  prop: string;
}

// Optional Tokens
// Learn More: https://github.com/quangdaon/vue-signalr/wiki/03.-Usage#tokens
const SendMessage: HubCommandToken<MyObject> = 'SendMessage';
const MessageReceived: HubEventToken<MyObject> = 'MessageReceived';

export default {
  setup() {
    // Inject the service
    const signalr = useSignalR();

    // Listen to the "MessageReceived" event
    signalr.on(MessageReceived, () => doSomething());

    // Send a "SendMessage" payload to the hub
    signalr.send(SendMessage, { prop: 'Hello world!' });

    // Invoke "SendMessage" and wait for a response
    signalr.invoke(SendMessage, { prop: 'Hello world!' })
      .then(() => doSomething())
  }
};
```
