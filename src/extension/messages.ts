export enum ExtensionMessageType {
    ShowModel = "showModel",
    UpdateOverlaySettings = "updateOverlaySettings",
    ResolvedAssets = "resolvedAssets",
    AssetChanged = "assetChanged"
}

export type ShowModelMsg = {command: ExtensionMessageType.ShowModel, modelUri: string};
export type UpdateOverlaySettingsMsg = {command: ExtensionMessageType.UpdateOverlaySettings, settings: any};
export type ResolvedAssetsMsg = {command: ExtensionMessageType.ResolvedAssets, assetType: string, requestId: number, assets: {[key: string]: string | null} | null};
export type AssetChangedMsg = {command: ExtensionMessageType.AssetChanged, assetPath: string, assetType: string, uri: string};

export type ExtensionMessage = ShowModelMsg | UpdateOverlaySettingsMsg | ResolvedAssetsMsg | AssetChangedMsg;