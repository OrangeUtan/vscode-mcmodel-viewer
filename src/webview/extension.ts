import type { ResolvedAssetsMsg } from "../extension/messages";
import { ViewerMessageType } from './messages';
import type { ViewerMessage } from './messages';

export const vscode = acquireVsCodeApi();

export function showError(text: string) {
    vscode.postMessage({command: ViewerMessageType.Error, text} as ViewerMessage);
}

type OnResolve = (assets: {[assetPath: string]: string | null}) => void;

export class AssetResolver {
    private static assetRequests: {[key: number]: OnResolve} = {};
    private static currentRequestID = 0;

    static async resolveAssets(assetPaths: string[], assetType: string) {
        return await new Promise((resolve: (assets: {[assetPath: string]: string | null}) => void) => this._resolveAsset(assetPaths, assetType, resolve));
    }

    private static _resolveAsset(assetPaths: string[], assetType: string, onResolved: OnResolve) {
        const requestId = this.currentRequestID++;
        vscode.postMessage({command: ViewerMessageType.ResolveAssets, assetPaths, assetType, requestId} as ViewerMessage);
        AssetResolver.assetRequests[requestId] = onResolved;
    }

    static onResolvedAssets(requestID: number, assets: any) {
        const cb = this.assetRequests[requestID];
        if(cb != null) {
            delete this.assetRequests[requestID];
            cb(assets || []);
        }
    }
}

export function onResolvedAssetsMsg(msg: ResolvedAssetsMsg) {
    AssetResolver.onResolvedAssets(msg.requestId, msg.assets);
}
