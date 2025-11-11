import {IpcProvider, ProviderInfo} from "../IpcProvider";
import {DEFAULT_IPC_CONTEXT, DEFAULT_IPC_CONTEXT_ID, IpcContext, WebIpcRequestInfo} from "../IpcContext";

const ipcProvider = new IpcProvider((handleWebIpcRequestInfo) => {
    console.log("startListen")
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(`receive message from ipcListener: ${message?.WEB_IPC_REQUEST_INFO?.serviceId}`, {message, sender})
        if (message.action !== "WEB_IPC_INVOKE") {
            return
        }
        let reqInfo: WebIpcRequestInfo = message["WEB_IPC_REQUEST_INFO"]
        handleWebIpcRequestInfo(reqInfo, sendResponse, { message, sender })
    })
})

export const chromeRuntimeMessageIpcProviderRegister = ipcProvider.register
