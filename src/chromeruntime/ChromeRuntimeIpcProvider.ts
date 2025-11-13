import {ExeRequest, IpcProvider, ProviderInfo} from "../IpcProvider";
import {DEFAULT_IPC_CONTEXT, DEFAULT_IPC_CONTEXT_ID, IpcContext, WebIpcRequestInfo} from "../IpcContext";

const ipcProvider = new IpcProvider((exeRequest: ExeRequest) => {
    console.log("startListen")
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(`receive message from ipcListener: ${message?.WEB_IPC_REQUEST_INFO?.serviceId}`, {message, sender})
        if (message.action !== "WEB_IPC_INVOKE") {
            return
        }
        let reqInfo: WebIpcRequestInfo = message["WEB_IPC_REQUEST_INFO"]
        let res = exeRequest(reqInfo, { message, sender })
        if (res) {
            res.then((result: any) => {
                sendResponse(result)
            }).catch((error: any) => {
                sendResponse({
                    error: `Method ${reqInfo.serviceId}.${reqInfo.method} execution failed: ${error.message}`
                });
            });
        }
        return true;
    })
})

export const chromeRuntimeMessageIpcProviderRegister = ipcProvider.register
