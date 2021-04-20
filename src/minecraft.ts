import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { MinecraftModel } from '@oran9e/three-mcmodel';
import * as config from './config';

/**
 * Searches current workspace for directories containing minecraft assets
*/
export async function findAssetRootsInWorkspace(): Promise<vscode.Uri[]> {
    const files = await vscode.workspace.findFiles("**/.mcassetsroot");
    return files.map(f => vscode.Uri.file(path.dirname(f.path)));
}

/**
 * Searches root directories for subdirs containing minecraft texture assets
 */
export async function findTextureAssetsRoots(assetsRoots: vscode.Uri[]) {
    return assetsRoots
        .map(root => vscode.Uri.joinPath(root, "minecraft", "textures"))
        .filter(root => fs.existsSync(root.fsPath));
}

/**
 * Searches root directories for subdirs containing minecraft model assets
 */
export async function findModelAssetsRoots(assetsRoots: vscode.Uri[]) {
    return assetsRoots
        .map(root => vscode.Uri.joinPath(root, "minecraft", "models"))
        .filter(root => fs.existsSync(root.fsPath));
}

export async function resolveModelTextures(model: MinecraftModel) {
    let textures: {[key: string]: vscode.Uri} = {};
    for(let texture of Object.values(model.textures!)) {
        for(let root of config.textureAssetsRoots) {
            const textureUri = vscode.Uri.joinPath(root, texture + ".png");
            if(fs.existsSync(textureUri.fsPath)) {
                textures[texture] = textureUri;
                break;
            }
        }
    }
    return textures;
}