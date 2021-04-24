import * as vscode from 'vscode';
import * as minecraft from './minecraft';

export const RENDERER_SECTION = "mcmodel-viewer.renderer";

export let assetsRoots: vscode.Uri[] = [];
export let textureAssetsRoots: Array<vscode.Uri> = [];
export let modelAssetsRoots: Array<vscode.Uri> = [];

export function getAssetsRoots(): vscode.Uri[] {
    const roots = <Array<string>> vscode.workspace.getConfiguration("mcmodel-viewer").get("assetsRoots");
    return roots.map(r => vscode.Uri.file(r));
}

export function addAssetsRoot(assetsRoot: vscode.Uri) {
	const roots = <Array<string>> vscode.workspace.getConfiguration("mcmodel-viewer").get("assetsRoots");
	roots.push(assetsRoot.fsPath);
	vscode.workspace.getConfiguration("mcmodel-viewer").update("assetsRoots", roots, vscode.ConfigurationTarget.Workspace);
}

export function getHelperConfiguration() {
	return {
		showBoundingBox: vscode.workspace.getConfiguration(RENDERER_SECTION).get("showBoundingBox"),
		showCardinalDirectionLabels: vscode.workspace.getConfiguration(RENDERER_SECTION).get("showCardinalDirectionLabels"),
		show3x3BlocksGrid: vscode.workspace.getConfiguration(RENDERER_SECTION).get("show3x3BlocksGrid"),
		showVoxelGrid: vscode.workspace.getConfiguration(RENDERER_SECTION).get("showVoxelGrid"),
		antiAliasing: vscode.workspace.getConfiguration(RENDERER_SECTION).get("antiAliasing"),
	};
}

export function createConfigurationListeners() {
    onAssetsRootsChanged();

    return [
        vscode.workspace.onDidChangeConfiguration((e) => {
			if(e.affectsConfiguration("mcmodel-viewer.assetsRoots")) {
				onAssetsRootsChanged();
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

async function onAssetsRootsChanged() {
	assetsRoots = (await minecraft.findAssetsRootsInWorkspace()).concat(getAssetsRoots());
	textureAssetsRoots = await minecraft.findTextureAssetsRoots(assetsRoots);
	modelAssetsRoots = await minecraft.findModelAssetsRoots(assetsRoots);
	notifyConfigChanged("mcmodel-viewer.assetsRoots");
}