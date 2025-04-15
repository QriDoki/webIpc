import {DEFAULT_IPC_CONTEXT, IpcContext, WebIpcRequestInfo} from "./IpcContext";
import {IpcInvokerFactory} from "./IpcInvokerFactory";

function msg(webIpcRequestInfo: WebIpcRequestInfo): Promise<any> {
    const message = {
        action: "WEB_IPC_INVOKE",
        WEB_IPC_REQUEST_INFO: {
            serviceId: webIpcRequestInfo.serviceId,
            method: webIpcRequestInfo.method,
            args: webIpcRequestInfo.args
        }
    };

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (response.error) {
                reject(response.error)
            } else {
                resolve(response)
            }
        });
    })

}

class ChromeIpcInvokerFactory implements IpcInvokerFactory {
    createProxy<T extends object>(interfaceName: string, ipcContext: IpcContext = DEFAULT_IPC_CONTEXT): T {
        return new Proxy({} as T, {
            get: (target, methodName: string) => {
                return async (...args: [any]) => {
                    const requestInfo = new WebIpcRequestInfo(ipcContext, interfaceName, methodName, args)
                    return msg(requestInfo)
                };
            }
        });
    }
}

export const chromeIpcInvoker = new ChromeIpcInvokerFactory()