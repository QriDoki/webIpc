import {IpcContext} from "./IpcContext";

export class ProviderInfo<T> {
    impl: T
    context: IpcContext

    constructor(impl: any, context: IpcContext) {
        this.impl = impl;
        this.context = context;
    }
}

export abstract class IpcProvider<C extends IpcContext> {
    abstract register<T>(itfcName: string, impl: T, context: C): void
}