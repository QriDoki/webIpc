import {IpcProvider, ProviderInfo} from "./IpcProvider";
import {DEFAULT_IPC_CONTEXT, DEFAULT_IPC_CONTEXT_ID, IpcContext, WebIpcRequestInfo} from "./IpcContext";

// { serviceId: {contextId: object} }
const instances: Map<string, Map<string, ProviderInfo<any>>> = new Map();

function getParameterNames(func: Function) {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;

    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    const result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    return result || [];
}

function startListen() {
    console.log(startListen)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(`receive message from ipcListener: ${message?.WEB_IPC_REQUEST_INFO?.serviceId}`, {message, sender})
        if (message.action === "WEB_IPC_INVOKE") {
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
            let func = impl[reqInfo.method]
            let definedParameters = getParameterNames(func)
            let args = [...reqInfo.args]
            // 依赖注入
            definedParameters.forEach((paramName, index) => {
                if (paramName === "$message") {
                    args[index] = message;
                }
                if (paramName === "$sender") {
                    args[index] = sender;
                }
            });
            impl[reqInfo.method](...args).then((result: any) => {
                sendResponse(result);
            }).catch((error: any) => {
                sendResponse({
                    error: `Method ${reqInfo.serviceId}.${reqInfo.method} execution failed: ${error.message}`
                });
            });
            return true
        }
    })
}

class ChromeMessageIpcProvider extends IpcProvider<IpcContext> {
    register<T>(itfcName: string, impl: T, context: IpcContext = DEFAULT_IPC_CONTEXT): void {
        if (!instances.get(itfcName)) {
            instances.set(itfcName, new Map());
        }
        instances.get(itfcName)!.set(context.contextId, new ProviderInfo(impl, context));
    }
}

const chromeMessageIpcProvider = new ChromeMessageIpcProvider()
export const chromeMessageIpcProviderRegister = chromeMessageIpcProvider.register

startListen()