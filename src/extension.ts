import * as vscode from 'vscode';
import { MCModelPanel } from './MCModelPanel';
import * as minecraft from './minecraft';
import * as fs from 'fs';
import * as path from 'path';
import {isMinecraftModel, MinecraftModel} from './minecraftModel';
import * as config from './config';

let textureAssetsRoots: Array<vscode.Uri> = [];
let textEditorController;

export async function activate(context: vscode.ExtensionContext) {
	textureAssetsRoots = textureAssetsRoots.concat(
		await minecraft.getTextureAssetsRoots(),
		await minecraft.getTextureAssetsRoots(config.getAssetRoots())
	);

	textEditorController = new TextEditorController();
	context.subscriptions.push(textEditorController);

	context.subscriptions.push(vscode.commands.registerCommand('mcmodel-viewer.showPreview', async () => {
		if(!vscode.window.activeTextEditor) {return;}
		const modelUri = vscode.window.activeTextEditor.document.uri;

		MCModelPanel.createOrShow(context.extensionUri);
		MCModelPanel.loadModel(modelUri, textureAssetsRoots);
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
		const val = editor ? this._isModelFile(editor) : false;
		vscode.commands.executeCommand("setContext", "mcmodel-viewer.activeTextEditorIsModel", val);
	}

	private _isModelFile(editor: vscode.TextEditor) {
		return editor
			&& editor.document.languageId === "json"
			&& isMinecraftModel(JSON.parse(editor.document.getText()));
	}
}