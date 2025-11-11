import {DEFAULT_IPC_CONTEXT, IpcContext, WebIpcRequestInfo} from "../IpcContext";
import {IpcInvokerFactory} from "../IpcInvokerFactory";


class ChromeRuntimeIpcInvokerFactory extends IpcInvokerFactory {
    msg(webIpcRequestInfo: WebIpcRequestInfo): Promise<any> {
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
                if(!response) {
                    reject("response from background is undefined")
                } else if (response.error) {
                    reject(response.error)
                } else {
                    resolve(response)
                }
            });
        })
    }
}

export const chromeRuntimeIpcInvoker = new ChromeRuntimeIpcInvokerFactory()
