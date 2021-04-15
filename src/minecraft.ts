import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { MinecraftModel } from './minecraftModel';

export async function getAssetRoots() {
    const files = await vscode.workspace.findFiles("**/.mcassetsroot");
    return files.map(f => vscode.Uri.file(path.dirname(f.path)));
}

export async function getTextureAssetRoots() {
    const assetRoots = await getAssetRoots();
    return assetRoots
        .map(root => vscode.Uri.joinPath(root, "minecraft", "textures"))
        .filter(root => fs.existsSync(root.fsPath));
}

export async function resolveModelTextures(model: MinecraftModel) {
    const textureAssetRoots = await getTextureAssetRoots();

    let textures: {[key: string]: vscode.Uri} = {};
    for(let texture of Object.values(model.textures)) {
        for(let root of textureAssetRoots) {
            const textureUri = vscode.Uri.joinPath(root, texture + ".png");
            if(fs.existsSync(textureUri.fsPath)) {
                textures[texture] = textureUri;
            }
        }
    }
    return textures;
}