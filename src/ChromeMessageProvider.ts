import {IpcProvider, ProviderInfo} from "./IpcProvider";
import {DEFAULT_IPC_CONTEXT_ID, IpcContext, IpcRequest} from "./IpcContext";

// { serviceId: {contextId: object} }
const instances: Map<string, Map<string, ProviderInfo<any>>> = new Map();

function startListen() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action != "WEB_IPC_INVOKE") {
            return true;
        }
        let reqInfo: IpcRequest = message.get("WEB_IPC_REQUEST_INFO")
        if (!instances.has(reqInfo.serviceId)) {
            // todo 返回报错信息
            return true
        }

        let implMap = instances.get(reqInfo.serviceId)!
        let contextId = DEFAULT_IPC_CONTEXT_ID
        if (reqInfo.ipcContext?.contextId) {
            contextId = reqInfo.ipcContext.contextId
        }
        let providerInfo = implMap.get(contextId)
        if (!providerInfo) {
            // todo 返回报错信息
            return true
        }
        let impl = providerInfo.impl
        // todo: 使用reqInfo.args调用reqInfo.method
    })
}

class ChromeMessageIpcProvider extends IpcProvider<IpcContext> {
    register<T>(itfcName: string, impl: T, context: IpcContext): void {
        if (!instances.get(itfcName)) {
            instances.set(itfcName, new Map());
        }
        instances.get(itfcName)!.set(context.contextId, new ProviderInfo(impl, context));
    }
}