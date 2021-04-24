import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as config from './config';

export let assetsRoots: vscode.Uri[] = [];
export let modelAssetsRoots: Array<vscode.Uri> = [];

export async function updateAssetsRoots() {
    assetsRoots = (await findAssetsRootsInWorkspace()).concat(config.getAssetsRoots());
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
 * Searches root directories for subdirs containing minecraft model assets
 */
export async function findModelAssetsRoots(assetsRoots: vscode.Uri[]) {
    return assetsRoots
        .map(root => vscode.Uri.joinPath(root, "minecraft", "models"))
        .filter(root => fs.existsSync(root.fsPath));
}

export async function resolveTextureAssets(resourceLocations: string[]) {
    return resolveAssets(resourceLocations, "textures", '.png');
}

export async function resolveModelAssets(resourceLocations: string[]) {
    return resolveAssets(resourceLocations, "models", '.json');
}

export function parseResourceLocation(loc: string) {
    const parts = loc.split(":");
    const [namespace, path] = parts.length === 2 ? parts : ["minecraft", parts[0]];
    return {namespace, path};
}

export async function resolveAssets(resourceLocations: string[], category: string, fileExtension: string) {
    let resolvedAssets: {[assetPath: string]: vscode.Uri | undefined} = {};
    for(const resLoc of resourceLocations) {
        const {namespace, path} = parseResourceLocation(resLoc);
        resolvedAssets[resLoc] = undefined;
        for(const root of assetsRoots) {
            const uri = vscode.Uri.joinPath(root, namespace, category, path + fileExtension);
            if(fs.existsSync(uri.fsPath)) {
                resolvedAssets[resLoc] = uri;
                break;
            }
        }
    }
    return resolvedAssets;
}
