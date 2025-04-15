export const DEFAULT_IPC_CONTEXT_ID = 'DEFAULT_IPC_CONTEXT_ID'

export class IpcContext {
    contextId: string = DEFAULT_IPC_CONTEXT_ID


    constructor(contextId: string = DEFAULT_IPC_CONTEXT_ID) {
        this.contextId = contextId;
    }
}

export const DEFAULT_IPC_CONTEXT = new IpcContext()

export class WebIpcRequestInfo {
    ipcContext: IpcContext
    serviceId: string
    method: string
    args: [any]


    constructor(ipcContext: IpcContext, serviceId: string, method: string, args: [any]) {
        this.ipcContext = ipcContext;
        this.serviceId = serviceId;
        this.method = method;
        this.args = args;
    }
}