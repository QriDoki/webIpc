import {DEFAULT_IPC_CONTEXT, IpcContext, WebIpcRequestInfo} from "./IpcContext";

export abstract class IpcInvokerFactory {
    createProxy<T extends object>(interfaceName: string, ipcContext: IpcContext = DEFAULT_IPC_CONTEXT): T {
        return new Proxy({} as T, {
            get: (target, methodName: string) => {
                return async (...args: [any]) => {
                    const requestInfo = new WebIpcRequestInfo(ipcContext, interfaceName, methodName, args)
                    return this.msg(requestInfo)
                };
            }
        });
    }

    abstract msg(webIpcRequestInfo: WebIpcRequestInfo): Promise<any>
}
