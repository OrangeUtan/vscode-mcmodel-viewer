import * as vscode from 'vscode';
import { ModelViewerPanel } from './ModelViewerPanel';
import * as config from './config';
import * as utils from './utils';

let currentlyModel: vscode.Uri | undefined = undefined;

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
			loadModel(vscode.window.activeTextEditor.document.uri, context);
		}),
		vscode.commands.registerCommand('mcmodel-viewer.refresh', () => {
			ModelViewerPanel.kill();
			ModelViewerPanel.createOrShow(context.extensionUri);

			setTimeout(() => {
				vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
			}, 500);
		}),
		vscode.commands.registerCommand('mcmodel-viewer.addAssetsRoot', () => addAssetsRoot())
	);

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((e) => {
			if(currentlyModel && e.uri === currentlyModel) {
				loadModel(currentlyModel, context);
			}
		}),
	);
}

export function deactivate() {}

function loadModel(modelUri: vscode.Uri, context: vscode.ExtensionContext) {
	currentlyModel = modelUri;
	ModelViewerPanel.createOrShow(context.extensionUri);
	ModelViewerPanel.loadModel(modelUri);
	ModelViewerPanel.updateRendererSettings(config.getHelperConfiguration());
}

async function addAssetsRoot() {
	const selections = await vscode.window.showOpenDialog({canSelectFiles: false, canSelectFolders: true, title: "Select assets root", canSelectMany: false});
	if(selections == null) {
		return;
	}
	config.addAssetsRoot(selections[0]);
}

function onChangedActiveTextEditor(editor?: vscode.TextEditor) {
	const val = editor ? isModelFile(editor) : false;
	vscode.commands.executeCommand("setContext", "mcmodel-viewer.activeTextEditorIsModel", val);
}

function isModelFile(editor: vscode.TextEditor) {
	return editor
		&& editor.document.languageId === "json"
		 && config.modelAssetsRoots.some(root => utils.isParentDir(root.path, editor.document.uri.path));
}
