# Web IPC

A TypeScript library for IPC (Inter-Process Communication) between web applications and browser extensions. It provides a native-like calling experience between different contexts.

## Features

- Native-like method invocation between different contexts
- Full TypeScript support ensuring type safety
- Promise-based async method call support
- Context-based service registration and invocation
- Simple and easy-to-use API, calling methods just like local ones

## Installation

```bash
npm install web-ipc
```

## API Reference

### IpcContext

```typescript
class IpcContext {
  constructor(public contextId: string = "default") {}
}
```

### Service Registration

```typescript
function register<T>(interfaceName: string, implementation: T, context: IpcContext): void
```

### Service Invocation

```typescript
const chromeIpcInvoker = new ChromeIpcInvokerFactory();
const proxy = chromeIpcInvoker.createProxy<T>(interfaceName: string, context: IpcContext): T
```

## License

MIT