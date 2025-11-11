import {WebIpcRequestInfo} from "../IpcContext";
import {IpcInvokerFactory} from "../IpcInvokerFactory";

class WindowMessageIpcInvokerFactory extends IpcInvokerFactory {
    private pendingRequests: Map<string, {resolve: Function, reject: Function}> = new Map();
    private listenerSetup = false;

    private generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    private setupResponseListener() {
        window.addEventListener("message", (event) => {
            // 安全检查：确保消息来自同源
            if (event.origin !== window.location.origin) {
                return;
            }

            const message = event.data;

            if (message.action !== "WEB_IPC_RESPONSE") {
                return;
            }

            const requestId = message.requestId;
            const pending = this.pendingRequests.get(requestId);

            if (pending) {
                this.pendingRequests.delete(requestId);
                const response = message.response;

                if (!response) {
                    pending.reject("response is undefined");
                } else if (response.error) {
                    pending.reject(response.error);
                } else {
                    pending.resolve(response);
                }
            }
        });
    }

    msg(webIpcRequestInfo: WebIpcRequestInfo): Promise<any> {
        if (!this.listenerSetup) {
            this.listenerSetup = true;
            this.setupResponseListener();
        }

        const requestId = this.generateRequestId();
        const message = {
            action: "WEB_IPC_INVOKE",
            requestId: requestId,
            WEB_IPC_REQUEST_INFO: {
                serviceId: webIpcRequestInfo.serviceId,
                method: webIpcRequestInfo.method,
                args: webIpcRequestInfo.args,
                ipcContext: webIpcRequestInfo.ipcContext
            }
        };

        return new Promise((resolve, reject) => {
            this.pendingRequests.set(requestId, {resolve, reject});

            // 设置超时
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error("Request timeout"));
                }
            }, 8000); // 8秒超时

            window.postMessage(message, "*");
        });
    }
}

export const windowMessageIpcInvoker = new WindowMessageIpcInvokerFactory()
