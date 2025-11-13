import {DEFAULT_IPC_CONTEXT, DEFAULT_IPC_CONTEXT_ID, IpcContext, WebIpcRequestInfo} from "./IpcContext";

export class ProviderInfo<T> {
    impl: T
    context: IpcContext

    constructor(impl: any, context: IpcContext) {
        this.impl = impl;
        this.context = context;
    }
}

export type ExeRequest = (reqInfo: WebIpcRequestInfo, rawInfos: any) => Promise<any> | undefined

export class IpcProvider {
    // { serviceId: {contextId: ProviderInfo} }
    private instances: Map<string, Map<string, ProviderInfo<any>>> = new Map();

    startListen: (exeRequest: ExeRequest) => void

    private startedListen = false;

    constructor(startListener: (handleWebIpcRequestInfo: ExeRequest) => void) {
        this.startListen = startListener;
    }

    exeRequest: ExeRequest = (reqInfo: WebIpcRequestInfo, rawInfos: any) => {
        if (!this.instances.has(reqInfo.serviceId)) {
            return undefined;
        }
        let implMap = this.instances.get(reqInfo.serviceId)!
        let contextId = DEFAULT_IPC_CONTEXT_ID
        if (reqInfo.ipcContext?.contextId) {
            contextId = reqInfo.ipcContext.contextId
        }
        let providerInfo = implMap.get(contextId)
        if (!providerInfo) {
            return undefined;
        }
        let impl = providerInfo.impl
        if (typeof impl[reqInfo.method] !== 'function' || !impl[reqInfo.method].constructor.name.includes('AsyncFunction')) {
            return undefined;
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
        return (func.apply(impl, args) as Promise<any>)
    }

    register = <T>(itfcName: string, impl: T, context: IpcContext = DEFAULT_IPC_CONTEXT): void => {
        if (!this.startedListen) {
            this.startListen(this.exeRequest);
            this.startedListen = true;
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
