import * as vscode from 'vscode';
import * as config from './config';

export class MCModelPanel {

    public static currentPanel?: MCModelPanel;
    public static readonly viewType = "mcmodel-viewer.preview";

    private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	static get webview() {
		return this.currentPanel?._panel.webview;
	}

    public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.ViewColumn.Beside;

		// If we already have a panel, show it.
		if (MCModelPanel.currentPanel) {
			MCModelPanel.currentPanel._panel.reveal(column);
            MCModelPanel.currentPanel._update();
			return;
		}

		let localResourceRoots = [
			vscode.Uri.joinPath(extensionUri, "media"),
			vscode.Uri.joinPath(extensionUri, "out/compiled")
		];
		vscode.workspace.workspaceFolders?.forEach(f => localResourceRoots.push(f.uri));
		config.getAssetRoots().forEach(f => localResourceRoots.push(f));

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			MCModelPanel.viewType,
			'MCModel Viewer',
			column,
			{
                enableScripts: true, // Enable Javascript in webview,
				localResourceRoots
            }
		);

		MCModelPanel.currentPanel = new MCModelPanel(panel, extensionUri);
	}

    public static kill() {
        MCModelPanel.currentPanel?.dispose();
        MCModelPanel.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		MCModelPanel.currentPanel = new MCModelPanel(panel, extensionUri);
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

		// Update the content based on view changes
		this._panel.onDidChangeViewState(e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		MCModelPanel.currentPanel = undefined;

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
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "MCModelViewer.js")
		);

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));

        // Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https: data:; script-src 'nonce-${nonce}'; connect-src data: vscode-webview-resource:">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<script nonce="${nonce}"></script>
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