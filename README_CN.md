# Web IPC

一个用于 Web 应用和浏览器扩展之间进行进程间通信（IPC）的 TypeScript 库。它提供了在不同上下文之间进行类似原生方法调用的体验。

## 特性

- 在不同上下文之间提供类似原生方法调用的体验
- 完整的 TypeScript 支持，确保类型安全
- 基于 Promise 的异步方法调用支持
- 基于上下文的服务注册和调用
- 简单易用的 API，调用方式与本地方法无异

## 安装

```bash
npm install web-ipc
```

## API 参考

### IpcContext

```typescript
class IpcContext {
  constructor(public contextId: string = "default") {}
}
```

### 服务注册

```typescript
function register<T>(interfaceName: string, implementation: T, context: IpcContext): void
```

### 服务调用

```typescript
const chromeIpcInvoker = new ChromeIpcInvokerFactory();
const proxy = chromeIpcInvoker.createProxy<T>(interfaceName: string, context: IpcContext): T
```

## 许可证

MIT 