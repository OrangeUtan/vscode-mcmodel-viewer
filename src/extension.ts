import * as vscode from 'vscode';
import { MCModelPanel } from './MCModelPanel';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('mcmodel-viewer.test', () => {
		MCModelPanel.createOrShow(context.extensionUri);
	}));
}

export function deactivate() {}
