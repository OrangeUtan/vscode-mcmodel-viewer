import * as vscode from 'vscode';
import * as config from './config';
import * as minecraft from './minecraft';
import * as path from 'path';
import { ExtensionMessage, ExtensionMessageType } from './messages';
import { ViewerMessage, ViewerMessageType } from '../webview/messages';

export class ModelViewerPanel {

	public static readonly VIEW_TYPE = "mcmodel-viewer.viewer";
	private static readonly VIEW_COLUMN = vscode.ViewColumn.Beside;
	private static readonly DEFAULT_TITLE = 'Minecraft Model Viewer';

    private static _instance?: ModelViewerPanel;
    private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static get() {
		return ModelViewerPanel._instance;
	}

    public static createOrShow(extensionUri: vscode.Uri) {
		if (ModelViewerPanel._instance) {
			ModelViewerPanel._instance._panel.reveal(this.VIEW_COLUMN, true);
			return ModelViewerPanel._instance;
		}

		return this.create(extensionUri);
	}

	public static create(extensionUri: vscode.Uri) {
		let localResourceRoots = [
			vscode.Uri.joinPath(extensionUri, "res"),
			vscode.Uri.joinPath(extensionUri, "dist/webview")
		];
		vscode.workspace.workspaceFolders?.forEach(f => localResourceRoots.push(f.uri));
		config.getAssetsRoots().forEach(f => localResourceRoots.push(f));

		const panel = vscode.window.createWebviewPanel(
			this.VIEW_TYPE,
			this.DEFAULT_TITLE,
			this.VIEW_COLUMN,
			{
                enableScripts: true,
				localResourceRoots
            }
		);
		ModelViewerPanel._instance = new ModelViewerPanel(panel, extensionUri);
		this._instance?.updateOverlaySettings(config.getHelperConfiguration());

		return ModelViewerPanel._instance;
	}

    public static kill() {
        ModelViewerPanel._instance?.dispose();
        ModelViewerPanel._instance = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		ModelViewerPanel._instance = new ModelViewerPanel(panel, extensionUri);
	}

    constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(message => {
			const msg = message as ViewerMessage;
				switch (msg.command) {
					case ViewerMessageType.ResolveAssets:
						this.resolveAssets(msg.assetPaths, msg.assetType, msg.requestId);
						break;
					case ViewerMessageType.Error:
						vscode.window.showErrorMessage(msg.text);
						break;
				}
			},
			null,
			this._disposables
		);

		panel.onDidChangeViewState(e => {
			vscode.commands.executeCommand("setContext", "mcmodel-viewer.viewerActive", e.webviewPanel.active);
		}, null, this._disposables);
	}

	get webview() {
		return this._panel.webview;
	}

	postMessage(msg: ExtensionMessage) {
		this._panel.webview.postMessage(msg);
	}

	public showModel(modelUri: vscode.Uri) {
		this._panel.title = path.basename(modelUri.path.toString());
		this.postMessage({command: ExtensionMessageType.ShowModel, modelUri: this.webview.asWebviewUri(modelUri).toString()});
	};

	public updateOverlaySettings(cfg: any) {
		this.postMessage({command: ExtensionMessageType.UpdateOverlaySettings, settings: cfg});
	}

	dispose() {
		ModelViewerPanel._instance = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private async resolveAssets(assetPaths: string[], assetType: string, requestId: number) {
		const response: ExtensionMessage = {command: ExtensionMessageType.ResolvedAssets, assetType, requestId, assets: null};

		let resolvedAssets: {[assetPath: string]: vscode.Uri | undefined};
		switch(assetType) {
			case "texture":
				resolvedAssets = await minecraft.resolveTextureAssets(assetPaths);
				break;
			case "model":
				resolvedAssets = await minecraft.resolveModelAssets(assetPaths);
				break;
			default:
				this.postMessage(response);
				return;
		}

		let webviewAssets: {[key: string]: string | null} = {};
		for(const assetPath in resolvedAssets) {
			const assetUri = resolvedAssets[assetPath];
			webviewAssets[assetPath] = assetUri != null ? this._panel.webview?.asWebviewUri(assetUri).toString() : null;
		}

		response["assets"] = webviewAssets;
		this.postMessage(response);
	}

	private _update() {
        const webview = this._panel.webview;

        this._panel.webview.html = this._getHtmlForWebview(webview);

        webview.onDidReceiveMessage(async data => {
            switch(data.type) {
            }
        });
	}

    private _getHtmlForWebview(webview: vscode.Webview) {
		const compiledDirUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist", "webview"));
		const scriptUri = vscode.Uri.joinPath(compiledDirUri, "main.js");
		const bundleCSSUri = vscode.Uri.joinPath(compiledDirUri, "bundle.css");

		const resourcesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'res'));

        // Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https: data:; script-src 'nonce-${nonce}'; connect-src data: vscode-webview-resource:">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<link href="${vscode.Uri.joinPath(resourcesUri, 'reset.css')}" rel="stylesheet">
					<link href="${bundleCSSUri}" rel="stylesheet">
					<script nonce="${nonce}">
						var RESOURCES_ROOT = "${resourcesUri.toString()}";
					</script>
				</head>
				<body>
				</body>
				<script src="${scriptUri}" nonce="${nonce}"></script>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}