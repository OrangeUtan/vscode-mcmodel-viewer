import * as vscode from 'vscode';
import { ModelViewerPanel } from './ModelViewerPanel';
import * as config from './config';
import * as utils from './utils';


export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(onChangedActiveTextEditor)
	);

	// Listen to configuration changes
	context.subscriptions.push(
		...config.createConfigurationListeners(),
		config.subscribeConfiguration(config.RENDERER_SECTION, () => {
			ModelViewerPanel.updateRendererSettings(config.getHelperConfiguration());
		})
	);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('mcmodel-viewer.showInViewer', async () => {
			if(!vscode.window.activeTextEditor) {return;}
			const modelUri = vscode.window.activeTextEditor.document.uri;

			ModelViewerPanel.createOrShow(context.extensionUri);
			ModelViewerPanel.loadModel(modelUri);
			ModelViewerPanel.updateRendererSettings(config.getHelperConfiguration());
		}),
		vscode.commands.registerCommand('mcmodel-viewer.refresh', () => {
			ModelViewerPanel.kill();
			ModelViewerPanel.createOrShow(context.extensionUri);

			setTimeout(() => {
				vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
			}, 500);
		})
	);
}

export function deactivate() {}

function onChangedActiveTextEditor(editor?: vscode.TextEditor) {
	const val = editor ? isModelFile(editor) : false;
	vscode.commands.executeCommand("setContext", "mcmodel-viewer.activeTextEditorIsModel", val);
}

function isModelFile(editor: vscode.TextEditor) {
	return editor
		&& editor.document.languageId === "json"
		 && config.modelAssetsRoots.some(root => utils.isParentDir(root.path, editor.document.uri.path));
}
