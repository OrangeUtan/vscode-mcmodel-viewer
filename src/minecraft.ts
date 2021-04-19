import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { MinecraftModel } from '@oran9e/three-mcmodel';

export async function getAssetRoots() {
    const files = await vscode.workspace.findFiles("**/.mcassetsroot");
    return files.map(f => vscode.Uri.file(path.dirname(f.path)));
}

export async function getTextureAssetsRoots(assetsRoots?: vscode.Uri[]) {
    if(!assetsRoots) {
        assetsRoots = await getAssetRoots();
    }

    return assetsRoots
        .map(root => vscode.Uri.joinPath(root, "minecraft", "textures"))
        .filter(root => fs.existsSync(root.fsPath));
}

export async function resolveModelTextures(model: MinecraftModel, assetRoots?: vscode.Uri[]) {
    if(!assetRoots) {
        assetRoots = await getTextureAssetsRoots();
    }

    let textures: {[key: string]: vscode.Uri} = {};
    for(let texture of Object.values(model.textures!)) {
        for(let root of assetRoots) {
            const textureUri = vscode.Uri.joinPath(root, texture + ".png");
            if(fs.existsSync(textureUri.fsPath)) {
                textures[texture] = textureUri;
                break;
            }
        }
    }
    return textures;
}