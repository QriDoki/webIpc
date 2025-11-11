import {IpcProvider} from "../IpcProvider";
import {WebIpcRequestInfo} from "../IpcContext";

const ipcProvider = new IpcProvider((handleWebIpcRequestInfo) => {
    console.log("startListen")
    window.addEventListener("message", (event) => {
        // 安全检查：确保消息来自同源
        // 如果需要跨域通信，可以添加 origin 白名单验证
        if (event.origin !== window.location.origin) {
            return;
        }

        const message = event.data;
        console.log(`receive message from ipcListener: ${message?.WEB_IPC_REQUEST_INFO?.serviceId}`, {message, event})

        if (message.action !== "WEB_IPC_INVOKE") {
            return
        }

        let reqInfo: WebIpcRequestInfo = message["WEB_IPC_REQUEST_INFO"]

        const sendResponse = (response: any) => {
            window.postMessage({
                action: "WEB_IPC_RESPONSE",
                requestId: message.requestId,
                response: response
            }, "*");
        };

        handleWebIpcRequestInfo(reqInfo, sendResponse, { message, event })
    })
})

export const windowMessageIpcProviderRegister = ipcProvider.register
