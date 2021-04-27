import * as vscode from 'vscode';
import { ModelViewerPanel } from './ModelViewerPanel';
import * as config from './config';
import * as utils from './utils';
import * as minecraft from './minecraft';

let currentlyModel: vscode.Uri | undefined = undefined;

export async function activate(context: vscode.ExtensionContext) {
	minecraft.updateAssetsRoots();

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(onChangedActiveTextEditor)
	);

	// Listen to configuration changes
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(e => {
			if(e.affectsConfiguration(config.SECTION_RENDERER)) {
				ModelViewerPanel.updateRendererSettings(config.getHelperConfiguration());
			} else if(e.affectsConfiguration(config.SECTION_ASSETS_ROOTS)) {
				minecraft.updateAssetsRoots();
			}
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
		vscode.commands.registerCommand('mcmodel-viewer.addAssetsRoot', () => addAssetsRoot()),
		vscode.commands.registerCommand('mcmodel-viewer.toggleWireframe', () => ModelViewerPanel.toggleWireframe())
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
		 && minecraft.modelAssetsRoots.some(root => utils.isParentDir(root.path, editor.document.uri.path));
}
