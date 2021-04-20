import * as vscode from 'vscode';
import * as minecraft from './minecraft';

export let assetRoots: vscode.Uri[] = [];
export let textureAssetsRoots: Array<vscode.Uri> = [];
export let modelAssetsRoots: Array<vscode.Uri> = [];

export function getAssetRoots(): vscode.Uri[] {
    const roots = <Array<string>> vscode.workspace.getConfiguration("mcmodel-viewer").get("assetRoots");
    return roots.map(r => vscode.Uri.file(r));
}

export function createConfigurationListeners() {
    onAssetRootsChanged();

    return [
        vscode.workspace.onDidChangeConfiguration((e) => {
			if(e.affectsConfiguration("mcmodel-viewer.assetRoots")) {
				onAssetRootsChanged();
			}
		})
    ];
}

async function onAssetRootsChanged() {
	assetRoots = (await minecraft.findAssetRootsInWorkspace()).concat(getAssetRoots());
	textureAssetsRoots = await minecraft.findTextureAssetsRoots(assetRoots);
	modelAssetsRoots = await minecraft.findModelAssetsRoots(assetRoots);
}