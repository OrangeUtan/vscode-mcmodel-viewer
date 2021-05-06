import * as path from 'path';
import * as vscode from 'vscode';

export function isParentDir(parent: string, file: string) {
    const relativePath = path.relative(parent, file);
    return relativePath && relativePath.split(path.sep)[0] !== '..' && !path.isAbsolute(relativePath);
}

export function asWebviewUris(uris: {[key: string]: vscode.Uri | undefined | null}, webview: vscode.Webview) {
    let webviewUris: {[key: string]: string | null} = {};
    Object.entries(uris).forEach(([key, uri]) => {
        webviewUris[key] = (uri != null) ? webview.asWebviewUri(uri).toString() : null;
    });
    return webviewUris;
}