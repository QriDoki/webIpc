import {IpcContext} from "./IpcContext";

export interface IpcInvokerFactory {
    createProxy<T extends object>(interfaceName: string, ipcContext: IpcContext): T
}