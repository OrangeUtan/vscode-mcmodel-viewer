import * as vscode from 'vscode';
import * as minecraft from './minecraft';

export type OnAssetChangedListener = (assetPath: string, assetType: string, uri: vscode.Uri) => void;

export class AssetsManager {
    private _assetWatchers: {[assetPath: string]: vscode.Disposable} = {};
    private _onAssetChangedListener: OnAssetChangedListener | undefined;

    async resolveAssets(assetPaths: string[], assetType: string) {
		switch(assetType) {
			case "texture":
				return await minecraft.resolveTextureAssets(assetPaths);
			case "model":
				return await minecraft.resolveModelAssets(assetPaths);
			default:
				return {};
		}
	}

    watchAssets(assets: {[assetPath: string]: vscode.Uri | undefined}, assetType: string) {
        for(const [assetPath, uri] of Object.entries(assets)) {
            if(uri == null) continue;
            if(this._assetWatchers[assetPath] != null) {
                this._assetWatchers[assetPath].dispose();
                delete this._assetWatchers[assetPath];
            }

            const watcher = vscode.workspace.createFileSystemWatcher(uri?.fsPath);
            this._assetWatchers[assetPath] = watcher;
            watcher.onDidChange((uri) => this.onAssetChanged(assetPath, assetType, uri));
        }
    }

    setOnAssetChangedListener(listener: OnAssetChangedListener) {
        this._onAssetChangedListener = listener;
    }

    reset() {
        for(const watcher of Object.values(this._assetWatchers)) {
            watcher.dispose();
        }
    }

    dispose() {
        this.reset();
    }

    private onAssetChanged(assetPath: string, assetType: string, uri: vscode.Uri) {
        if(this._onAssetChangedListener) {
            this._onAssetChangedListener(assetPath, assetType, uri);
        }
    }
}