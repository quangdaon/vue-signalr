# Vue SignalR Plugin

This plugin has only been tested with Vue 3 and TypeScript. Use at your own risk.

## Installation

To install in Vue 3:

```typescript
import { createApp } from "vue";
import { VueSignalR } from "@quangdao/vue-signalr";
import App from "./App.vue";

createApp(App)
	.use(VueSignalR, { url: "http://localhost:5000/signalr" })
	.mount("#app");
```

## Usage

To use signalr, you need to inject the service like so:

```typescript
import { inject } from "vue";
import { SignalRSymbol } from "@quangdao/vue-signalr";

export default {
	setup() {
		const signalr = inject(SignalRSymbol);

		if (!signalr) throw new Error("Failed to inject SignalR");
	},
};
```

### Invoking

For type safety, I recommend declaring constant methods like so:

```typescript
import { SignalRMethod } from "@quangdao/vue-signalr";

const DoThing: SignalRMethod<MyObject> = "DoThing";

interface MyObject {
	prop: string;
}
```

Then, in your component:

```typescript
signalr.invoke(DoThing, { prop: "value" });
```

Alternative, you can pass in the method name as a string, with an optional type argument for the data:

```typescript
// Both of these work:
signalr.invoke("DoThing", { prop: "value" }); // Data object is untyped
signalr.invoke<MyObject>("DoThing", { prop: "value" });
```
