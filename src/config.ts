import * as vscode from 'vscode';

export function getAssetRoots() {
    const roots = <Array<string>> vscode.workspace.getConfiguration("mcmodel-viewer").get("assetRoots");
    return roots.map(r => vscode.Uri.file(r));
}