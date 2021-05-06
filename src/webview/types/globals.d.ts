declare var RESOURCES_ROOT: string;

declare class VSCodeAPI {
    postMessage(message: any): void
    getState(): any
    setState(state: any)
}
declare function acquireVsCodeApi(): VSCodeAPI