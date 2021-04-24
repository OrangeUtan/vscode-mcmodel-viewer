import * as vscode from 'vscode';

export const RENDERER_SECTION = "mcmodel-viewer.renderer";

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

