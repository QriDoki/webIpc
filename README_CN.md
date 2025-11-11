# Web IPC

一个用于Web应用程序再不同context之间(比如浏览器插件的content和background) 进行IPC（进程间通信）的TypeScript库。它提供了不同上下文之间类似原生的调用体验。

## 特性
- 不同上下文之间类似原生的方法调用
- 完整的TypeScript支持确保类型安全
- 基于Promise的异步方法调用支持
- 基于上下文的服务注册和调用

## 安装
```bash
npm install web-ipc
```

## 使用方法
### 1. 定义接口
```typescript
export interface BackgroundNotificationInterface {
    // 必须返回Promise
    notify(title: string, message: string): Promise<string>
}
```

### 2. 在background脚本中实现接口并注册
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

import {chromeRuntimeMessageIpcProviderRegister} from "web-ipc";
chromeRuntimeMessageIpcProviderRegister("BackgroundNotification", new BackgroundNotification())
```

### 3. 通过创建代理在content脚本或popup脚本中调用接口
```typescript
import {chromeRuntimeIpcInvoker} from "web-ipc";
const backgroundNotification = chromeRuntimeIpcInvoker.createProxy<BackgroundNotificationInterface>("BackgroundNotificationInterface")

let notificationId = await backgroundNotification.notify("hello", "这是来自content脚本的通知")
console.log(notificationId)
```

### 以上是使用`chrome.runtime`进行通信的
如果要用`window.postMessage`的通信, 则使用`windowMessageIpcProviderRegister`和`windowMessageIpcInvoker`  

## 许可证

MIT
