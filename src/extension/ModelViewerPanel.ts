import * as vscode from 'vscode';
import * as config from './config';
import * as minecraft from './minecraft';
import * as path from 'path';


export class ModelViewerPanel {

    public static currentPanel?: ModelViewerPanel;
    public static readonly viewType = "mcmodel-viewer.viewer";

    private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static loadModel(modelUri: vscode.Uri) {
		if(this.currentPanel) {
			this.currentPanel._panel.title = path.basename(modelUri.path.toString());
			this.postMessage({command: "loadModel", value: this.webview?.asWebviewUri(modelUri).toString()});
		}
	};

	public static updateRendererSettings(cfg: any) {
		ModelViewerPanel.postMessage({command: "updateRendererSettings", value: cfg});
	}

	static get webview() {
		return this.currentPanel?._panel.webview;
	}

    public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.ViewColumn.Beside;

		// If we already have a panel, show it.
		if (ModelViewerPanel.currentPanel) {
			ModelViewerPanel.currentPanel._panel.reveal(column, true);
			return;
		}

		let localResourceRoots = [
			vscode.Uri.joinPath(extensionUri, "res"),
			vscode.Uri.joinPath(extensionUri, "dist/webviews")
		];
		vscode.workspace.workspaceFolders?.forEach(f => localResourceRoots.push(f.uri));
		config.getAssetsRoots().forEach(f => localResourceRoots.push(f));

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			ModelViewerPanel.viewType,
			'Minecraft Model Viewer',
			column,
			{
                enableScripts: true,
				localResourceRoots
            }
		);

		ModelViewerPanel.currentPanel = new ModelViewerPanel(panel, extensionUri);
	}

    public static kill() {
        ModelViewerPanel.currentPanel?.dispose();
        ModelViewerPanel.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		ModelViewerPanel.currentPanel = new ModelViewerPanel(panel, extensionUri);
	}

	public static postMessage(message: any) {
		this.currentPanel?._panel.webview.postMessage(message);
	}

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'resolveAssets':
						this.resolveAssets(message.assetPaths, message.assetType, message.requestID);
						break;
					case 'error':
						vscode.window.showErrorMessage(message.text);
						break;
				}
			},
			null,
			this._disposables
		);
	}

	private async resolveAssets(assetPaths: string[], assetType: string, requestID: number) {
		const response = {command: "resolvedAssets", assetType, requestID};

		let resolvedAssets: {[assetPath: string]: vscode.Uri | undefined};
		switch(assetType) {
			case "texture":
				resolvedAssets = await minecraft.resolveTextureAssets(assetPaths);
				break;
			case "model":
				resolvedAssets = await minecraft.resolveModelAssets(assetPaths);
				break;
			default:
				response["assets"] = null;
				ModelViewerPanel.postMessage(response);
				return;
		}

		let webviewAssets: {[key: string]: string | null} = {};
		for(const assetPath in resolvedAssets) {
			const assetUri = resolvedAssets[assetPath];
			webviewAssets[assetPath] = assetUri != null ? this._panel.webview?.asWebviewUri(assetUri).toString() : null;
		}

		response["assets"] = webviewAssets;
		ModelViewerPanel.postMessage(response);
	}

	public dispose() {
		ModelViewerPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
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
		const compiledDirUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist", "webviews"));
		const scriptUri = vscode.Uri.joinPath(compiledDirUri, "MCModelViewer.js");
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