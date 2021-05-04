export enum ViewerMessageType {
    ResolveAssets = "resolveAssets",
    Error = "error"
}

export type ResolveAssetsMsg = {command: ViewerMessageType.ResolveAssets, assetPaths: string[], assetType: string, requestId: number};
export type ErrorMsg = {command: ViewerMessageType.Error, text: string};

export type ViewerMessage = ResolveAssetsMsg | ErrorMsg;
