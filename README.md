# Web IPC

A TypeScript library for IPC (Inter-Process Communication) between different contexts (e.g. chrome extension's content.js and background.js) in web. It provides a native-like calling experience between different contexts.

## Features
- Native-like method invocation between different contexts
- Full TypeScript support ensuring type safety
- Promise-based async method call support
- Context-based service registration and invocation

## Installation
```bash
npm install web-ipc
```

## Usage
### 1. define an interface
```typescript
export interface BackgroundNotificationInterface {
    // must return a Promise
    notify(title: string, message: string): Promise<string>
}
```

### 2. implement the interface in background script and register it
```typescript
class BackgroundNotification implements BackgroundNotificationInterface {
    async notify(title: string, message: string): Promise<string> {
        let notificationId = `notification-${Date.now()}`;
        chrome.notifications.create(notificationId, {
            type: 'basic',
            title: title,
            message: message
        });
        return notificationId;
    }
}

import {chromeMessageIpcProviderRegister} from "web-ipc/src/ChromeIpcProvider";
chromeMessageIpcProviderRegister("BackgroundNotificationInterface", new BackgroundNotification())
```

### 3. call the interface in content script or popup script by creating a proxy
```typescript
import {chromeIpcInvoker} from "web-ipc/src/ChromeIpcInvokerFactory";
const backgroundNotification = chromeIpcInvoker.createProxy<BackgroundNotificationInterface>("BackgroundNotificationInterface")

let notificationId = await backgroundNotification.notify("hello", "this is a notification from content script")
console.log(notificationId)
```

## License

MIT

