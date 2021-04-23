export const vscode = acquireVsCodeApi();

export function showError(text: string) {
    vscode.postMessage({command: 'error', text});
}

type OnResolve = (assets: {[assetPath: string]: string | null}) => void;

export class AssetResolver {
    private static assetRequests: {[key: number]: OnResolve} = {};
    private static currentRequestID = 0;

    static async resolveAssets(assetPaths: string[], assetType: string) {
        return await new Promise((resolve: (assets: {[assetPath: string]: string | null}) => void) => this._resolveAsset(assetPaths, assetType, resolve));
    }

    private static _resolveAsset(assetPaths: string[], assetType: string, onResolved: OnResolve) {
        const requestID = this.currentRequestID++;
        vscode.postMessage({command: "resolveAssets", assetPaths, assetType, requestID});
        AssetResolver.assetRequests[requestID] = onResolved;
    }

    static onResolvedAssets(data: any) {
        const cb = this.assetRequests[data.requestID];
        if(cb != null) {
            delete this.assetRequests[data.requestID];
            cb(data.assets || []);
        }
    }
}

window.addEventListener('message', e => {
    switch(e.data.command) {
        case "resolvedAssets":
            AssetResolver.onResolvedAssets(e.data);
            break;
    }
});
