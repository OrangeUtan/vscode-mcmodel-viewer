import * as vscode from 'vscode';
import { MCModelPanel } from './MCModelPanel';
import * as minecraft from './minecraft';
import * as fs from 'fs';
import * as path from 'path';
import {isMinecraftModel, MinecraftModel} from './minecraftModel';
import * as config from './config';

let textureAssetsRoots: Array<vscode.Uri> = [];

export async function activate(context: vscode.ExtensionContext) {
	textureAssetsRoots = textureAssetsRoots.concat(
		await minecraft.getTextureAssetsRoots(),
		await minecraft.getTextureAssetsRoots(config.getAssetRoots())
	);

	context.subscriptions.push(vscode.commands.registerCommand('mcmodel-viewer.showPreview', async () => {
		if(!vscode.window.activeTextEditor) {return;}
		const modelUri = vscode.window.activeTextEditor.document.uri;

		const model: MinecraftModel = JSON.parse(fs.readFileSync(modelUri.fsPath).toString());
		if(!isMinecraftModel(model)) {
			return;
		}

		MCModelPanel.createOrShow(context.extensionUri);

		const modelTextures = await minecraft.resolveModelTextures(model, textureAssetsRoots);
		let webviewModelTextures = {};
		for(let key of Object.keys(modelTextures)) {
			webviewModelTextures[key] = MCModelPanel.webview?.asWebviewUri(modelTextures[key]).toString();
		}

		const val = {
			model: MCModelPanel.webview?.asWebviewUri(modelUri).toString(),
			textures: webviewModelTextures
		};

		setTimeout(() => {
			MCModelPanel.postMessage({command: "loadModel", value: val});
		}, 50);
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
