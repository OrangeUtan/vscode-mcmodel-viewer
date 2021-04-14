import * as vscode from 'vscode';
import { MCModelPanel } from './MCModelPanel';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('mcmodel-viewer.test', () => {
		MCModelPanel.createOrShow(context.extensionUri);
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
