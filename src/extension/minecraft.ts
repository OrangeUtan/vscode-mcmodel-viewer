import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as config from './config';

export let assetsRoots: vscode.Uri[] = [];
export let textureAssetsRoots: Array<vscode.Uri> = [];
export let modelAssetsRoots: Array<vscode.Uri> = [];

export async function updateAssetsRoots() {
    assetsRoots = (await findAssetsRootsInWorkspace()).concat(config.getAssetsRoots());
	textureAssetsRoots = await findTextureAssetsRoots(assetsRoots);
	modelAssetsRoots = await findModelAssetsRoots(assetsRoots);
}

/**
 * Searches current workspace for directories containing minecraft assets
*/
export async function findAssetsRootsInWorkspace(): Promise<vscode.Uri[]> {
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

export async function resolveTextureAssets(assets: string[]) {
    return resolveAssets(assets, '.png', textureAssetsRoots);
}

export async function resolveModelAssets(assets: string[]) {
    return resolveAssets(assets, '.json', modelAssetsRoots);
}

export async function resolveAssets(assets: string[], fileExtension: string, assetsRoots: vscode.Uri[]) {
    let resolvedAssets: {[assetPath: string]: vscode.Uri | undefined} = {};
    for(const assetPath of assets) {
        resolvedAssets[assetPath] = undefined;
        for(const root of assetsRoots) {
            const uri = vscode.Uri.joinPath(root, assetPath + fileExtension);
            if(fs.existsSync(uri.fsPath)) {
                resolvedAssets[assetPath] = uri;
                break;
            }
        }
    }
    return resolvedAssets;
}
