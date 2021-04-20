import * as vscode from 'vscode';
import { MCModelPanel } from './MCModelPanel';
import * as config from './config';

let textEditorController;

export async function activate(context: vscode.ExtensionContext) {
	textEditorController = new TextEditorController();
	context.subscriptions.push(textEditorController);

	// Listen to configuration changes
	context.subscriptions.push(...config.createConfigurationListeners());

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('mcmodel-viewer.showPreview', async () => {
			if(!vscode.window.activeTextEditor) {return;}
			const modelUri = vscode.window.activeTextEditor.document.uri;

			MCModelPanel.createOrShow(context.extensionUri);
			MCModelPanel.loadModel(modelUri);
		}),
		vscode.commands.registerCommand('mcmodel-viewer.refresh', () => {
			MCModelPanel.kill();
			MCModelPanel.createOrShow(context.extensionUri);

			setTimeout(() => {
				vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
			}, 500);
		})
	);
}

export function deactivate() {}

class TextEditorController {
	private _disposable: vscode.Disposable;

	constructor() {
		let subscriptions: vscode.Disposable[] = [];
		vscode.window.onDidChangeActiveTextEditor(this._onChangedActiveTextEditor, this, subscriptions);
		this._disposable = vscode.Disposable.from(...subscriptions);
	}

	dispose() {
		this._disposable.dispose();
	}

	private _onChangedActiveTextEditor(editor?: vscode.TextEditor) {
	}
}