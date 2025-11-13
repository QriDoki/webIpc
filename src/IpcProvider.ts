import {DEFAULT_IPC_CONTEXT, DEFAULT_IPC_CONTEXT_ID, IpcContext, WebIpcRequestInfo} from "./IpcContext";

export class ProviderInfo<T> {
    impl: T
    context: IpcContext

    constructor(impl: any, context: IpcContext) {
        this.impl = impl;
        this.context = context;
    }
}

export type HandleWebIpcRequestInfo = (reqInfo: WebIpcRequestInfo, sendResponseFunc: (msg: any) => void, rawInfos: any) => boolean

export class IpcProvider {
    // { serviceId: {contextId: ProviderInfo} }
    private instances: Map<string, Map<string, ProviderInfo<any>>> = new Map();

    startListen: (handleWebIpcRequestInfo: HandleWebIpcRequestInfo) => void

    private startedListen = false;

    constructor(startListener: (handleWebIpcRequestInfo: HandleWebIpcRequestInfo) => void) {
        this.startListen = startListener;
    }

    handleWebIpcRequestInfo: HandleWebIpcRequestInfo = (reqInfo: WebIpcRequestInfo, sendResponseFunc: (msg: any) => void, rawInfos: any) => {
        if (!this.instances.has(reqInfo.serviceId)) {
            sendResponseFunc({
                error: `Service ${reqInfo.serviceId} not found`
            });
            return true;
        }
        let implMap = this.instances.get(reqInfo.serviceId)!
        let contextId = DEFAULT_IPC_CONTEXT_ID
        if (reqInfo.ipcContext?.contextId) {
            contextId = reqInfo.ipcContext.contextId
        }
        let providerInfo = implMap.get(contextId)
        if (!providerInfo) {
            sendResponseFunc({
                error: `Context ${contextId} not found for service ${reqInfo.serviceId}`
            });
            return true;
        }
        let impl = providerInfo.impl
        if (typeof impl[reqInfo.method] !== 'function' || !impl[reqInfo.method].constructor.name.includes('AsyncFunction')) {
            sendResponseFunc({
                error: `Method ${reqInfo.serviceId}.${reqInfo.method} must be an async function`
            });
            return true;
        }
        let func = impl[reqInfo.method]
        let definedParameters = getParameterNames(func)
        let args = [...reqInfo.args]
        // 依赖注入
        definedParameters.forEach((paramName, index) => {
            if (paramName === "$rawInfos") {
                args[index] = rawInfos;
            }
        });
        impl[reqInfo.method](...args).then((result: any) => {
            sendResponseFunc(result);
        }).catch((error: any) => {
            sendResponseFunc({
                error: `Method ${reqInfo.serviceId}.${reqInfo.method} execution failed: ${error.message}`
            });
        });
        return true
    }

    register = <T> (itfcName: string, impl: T, context: IpcContext = DEFAULT_IPC_CONTEXT) => {
        if (!this.startedListen) {
            this.startListen(this.handleWebIpcRequestInfo);
            this.startedListen = true
        }
        if (!this.instances.get(itfcName)) {
            this.instances.set(itfcName, new Map());
        }
        this.instances.get(itfcName)!.set(context.contextId, new ProviderInfo(impl, context));
    }
}

function getParameterNames(func: Function) {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;

    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    const result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    return result || [];
}
