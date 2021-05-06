export enum ExtensionMessageType {
    ShowModel = "showModel",
    UpdateOverlaySettings = "updateOverlaySettings",
    ResolvedAssets = "resolvedAssets"
}

export type ShowModelMsg = {command: ExtensionMessageType.ShowModel, modelUri: string};
export type UpdateOverlaySettingsMsg = {command: ExtensionMessageType.UpdateOverlaySettings, settings: any};
export type ResolvedAssetsMsg = {command: ExtensionMessageType.ResolvedAssets, assetType: string, requestId: number, assets: {[key: string]: string | null} | null};

export type ExtensionMessage = ShowModelMsg | UpdateOverlaySettingsMsg | ResolvedAssetsMsg;