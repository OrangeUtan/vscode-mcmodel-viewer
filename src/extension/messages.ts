export enum ExtensionMessageType {
    LoadModel = "loadModel",
    UpdateOverlaySettings = "updateOverlaySettings",
    ResolvedAssets = "resolvedAssets"
}

export type LoadModelMsg = {command: ExtensionMessageType.LoadModel, modelUri: string};
export type UpdateOverlaySettingsMsg = {command: ExtensionMessageType.UpdateOverlaySettings, settings: any};
export type ResolvedAssetsMsg = {command: ExtensionMessageType.ResolvedAssets, assetType: string, requestId: number, assets: {[key: string]: string | null} | null};

export type ExtensionMessage = LoadModelMsg | UpdateOverlaySettingsMsg | ResolvedAssetsMsg;