import * as vscode from 'vscode';
import { MCModelPanel } from './MCModelPanel';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('mcmodel-viewer.showPreview', () => {
		MCModelPanel.createOrShow(context.extensionUri);

		if(vscode.window.activeTextEditor) {
			const val = {
				model: MCModelPanel.currentPanel?._panel.webview.asWebviewUri(vscode.window.activeTextEditor.document.uri).toString(),
				textures: {
					'block/cake_bottom': MCModelPanel.currentPanel?._panel.webview.asWebviewUri(vscode.Uri.parse("d%3A/repos/Oran9eUtan/vscode-mcmodel-viewer/test/assets/cake_bottom.png")).toString(),
					'block/cake_side': MCModelPanel.currentPanel?._panel.webview.asWebviewUri(vscode.Uri.parse("d%3A/repos/Oran9eUtan/vscode-mcmodel-viewer/test/assets/cake_side.png")).toString(),
					'block/cake_top': MCModelPanel.currentPanel?._panel.webview.asWebviewUri(vscode.Uri.parse("d%3A/repos/Oran9eUtan/vscode-mcmodel-viewer/test/assets/cake_top.png")).toString()
				}
			};

			console.log("sending message: ");
			console.dir(val);

			setTimeout(() => {
				MCModelPanel.currentPanel?._panel.webview.postMessage({command: "loadModel", value: val});
			}, 50);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('mcmodel-viewer.refresh', () => {
		MCModelPanel.kill();
		MCModelPanel.createOrShow(context.extensionUri);

		setTimeout(() => {
			vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
		}, 500);
	}));
}

export function deactivate() {}
