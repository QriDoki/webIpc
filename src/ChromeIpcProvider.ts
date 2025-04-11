import {IpcProvider, ProviderInfo} from "./IpcProvider";
import {DEFAULT_IPC_CONTEXT_ID, IpcContext, WebIpcRequestInfo} from "./IpcContext";

// { serviceId: {contextId: object} }
const instances: Map<string, Map<string, ProviderInfo<any>>> = new Map();

function startListen() {
    console.log(startListen)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("receive message from ipcListener")
        if (message.action != "WEB_IPC_INVOKE") {
            return true;
        }
        let reqInfo: WebIpcRequestInfo = message["WEB_IPC_REQUEST_INFO"]
        if (!instances.has(reqInfo.serviceId)) {
            sendResponse({
                error: `Service ${reqInfo.serviceId} not found`
            });
            return true;
        }

        let implMap = instances.get(reqInfo.serviceId)!
        let contextId = DEFAULT_IPC_CONTEXT_ID
        if (reqInfo.ipcContext?.contextId) {
            contextId = reqInfo.ipcContext.contextId
        }
        let providerInfo = implMap.get(contextId)
        if (!providerInfo) {
            sendResponse({
                error: `Context ${contextId} not found for service ${reqInfo.serviceId}`
            });
            return true;
        }
        let impl = providerInfo.impl
        if (typeof impl[reqInfo.method] !== 'function' || !impl[reqInfo.method].constructor.name.includes('AsyncFunction')) {
            sendResponse({
                error: `Method ${reqInfo.serviceId}.${reqInfo.method} must be an async function`
            });
            return true;
        }
        impl[reqInfo.method](...reqInfo.args).then((result: any) => {
            sendResponse({ result });
        }).catch((error: any) => {
            sendResponse({
                error: `Method ${reqInfo.serviceId}.${reqInfo.method} execution failed: ${error.message}`
            });
        });
        return true
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

const chromeMessageIpcProvider = new ChromeMessageIpcProvider()
export const register = chromeMessageIpcProvider.register

startListen()