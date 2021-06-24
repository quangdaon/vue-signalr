# Vue SignalR Plugin

This plugin has only been tested with Vue 3 and TypeScript. Use at your own risk.

## Installation

To install in Vue 3:

```javascript
import { createApp } from 'vue';
import { VueSignalR } from '@quangdao/vue-signalr';
import App from './App.vue';

createApp(App)
	.use(VueSignalR, { url: 'http://localhost:5000/signalr' })
	.mount('#app');
```

