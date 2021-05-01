import * as vscode from 'vscode';

export const ROOT = "mcmodel-viewer";
export const SECTION_OVERLAY = ROOT + ".overlay";
export const SECTION_ASSETS_ROOTS = ROOT + ".assetsRoots";

export function getAssetsRoots(): vscode.Uri[] {
    const roots = <Array<string>> vscode.workspace.getConfiguration(ROOT).get("assetsRoots");
    return roots.map(r => vscode.Uri.file(r));
}

export function addAssetsRoot(assetsRoot: vscode.Uri) {
	const roots = <Array<string>> vscode.workspace.getConfiguration(ROOT).get("assetsRoots");
	roots.push(assetsRoot.fsPath);
	vscode.workspace.getConfiguration(ROOT).update("assetsRoots", roots, vscode.ConfigurationTarget.Workspace);
}

export function getHelperConfiguration() {
	return {
		showBoundingBox: vscode.workspace.getConfiguration(SECTION_OVERLAY).get("showBoundingBox"),
		showCardinalDirectionLabels: vscode.workspace.getConfiguration(SECTION_OVERLAY).get("showCardinalDirectionLabels"),
		show3x3BlocksGrid: vscode.workspace.getConfiguration(SECTION_OVERLAY).get("show3x3BlocksGrid"),
		showVoxelGrid: vscode.workspace.getConfiguration(SECTION_OVERLAY).get("showVoxelGrid"),
		antiAliasing: vscode.workspace.getConfiguration(SECTION_OVERLAY).get("antiAliasing"),
	};
}

