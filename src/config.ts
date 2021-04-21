import * as vscode from 'vscode';
import * as minecraft from './minecraft';

export const RENDERER_SECTION = "mcmodel-viewer.renderer";

export let assetRoots: vscode.Uri[] = [];
export let textureAssetsRoots: Array<vscode.Uri> = [];
export let modelAssetsRoots: Array<vscode.Uri> = [];

export function getAssetRoots(): vscode.Uri[] {
    const roots = <Array<string>> vscode.workspace.getConfiguration("mcmodel-viewer").get("assetRoots");
    return roots.map(r => vscode.Uri.file(r));
}

export function getHelperConfiguration() {
	return {
		showBoundingBox: vscode.workspace.getConfiguration(RENDERER_SECTION).get("showBoundingBox"),
		showCardinalDirectionLabels: vscode.workspace.getConfiguration(RENDERER_SECTION).get("showCardinalDirectionLabels"),
		show3x3BlocksGrid: vscode.workspace.getConfiguration(RENDERER_SECTION).get("show3x3BlocksGrid"),
		showVoxelGrid: vscode.workspace.getConfiguration(RENDERER_SECTION).get("showVoxelGrid")
	};
}

export function createConfigurationListeners() {
    onAssetRootsChanged();

    return [
        vscode.workspace.onDidChangeConfiguration((e) => {
			if(e.affectsConfiguration("mcmodel-viewer.assetRoots")) {
				onAssetRootsChanged();
			}
		}),
        vscode.workspace.onDidChangeConfiguration((e) => {
			if(e.affectsConfiguration(RENDERER_SECTION)) {
				notifyConfigChanged(RENDERER_SECTION);
			}
		})
    ];
}

let configSubscribers: {[config: string]: Set<() => void>} = {};

export function subscribeConfiguration(config: string, onDidChange: () => void) {
	if(!(config in configSubscribers)) {
		configSubscribers[config] = new Set();
	}
	configSubscribers[config].add(onDidChange);
	return new vscode.Disposable(() => configSubscribers[config].delete(onDidChange));
}

function notifyConfigChanged(config: string) {
	configSubscribers[config]?.forEach((cb) => {
		cb();
	});
}

async function onAssetRootsChanged() {
	assetRoots = (await minecraft.findAssetRootsInWorkspace()).concat(getAssetRoots());
	textureAssetsRoots = await minecraft.findTextureAssetsRoots(assetRoots);
	modelAssetsRoots = await minecraft.findModelAssetsRoots(assetRoots);
	notifyConfigChanged("mcmodel-viewer.assetRoots");
}