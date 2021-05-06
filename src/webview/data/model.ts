import { MinecraftTexture, MinecraftTextureLoader, ElementMesh, MinecraftModelJsonLoader } from '@oran9e/three-mcmodel';
import { resolveModelJson, MinecraftModelJson } from '@oran9e/minecraft-model';
import { MinecraftModel } from '@oran9e/minecraft-model';
import { AssetResolver } from '../extension';
import * as extension from '../extension';
import { writable, get } from 'svelte/store';
import { ElementGeometry } from '@oran9e/three-mcmodel/dist/geometry';
import { ExtensionMessageType, ShowModelMsg } from '../../extension/messages';

export const jsonModel = writable<MinecraftModelJson | undefined>(undefined);
export const ancestorJsonModels = writable<{[assetPath: string]: MinecraftModelJson}>({});
export const elementMeshes = writable<ElementMesh[]>([]);
export const textures = writable<{[assetPath: string]: MinecraftTexture}>({});

extension.addExtensionMessageListener<ShowModelMsg>(ExtensionMessageType.ShowModel, msg => showModel(msg.modelUri));

async function showModel(modelUrl: string) {
    // Load model and ancestors
    let newJsonModel: MinecraftModelJson;
    let newAncestorJsonModels: {[assetPath: string]: MinecraftModelJson};
    try {
        newJsonModel = await new MinecraftModelJsonLoader().load(modelUrl);
        newAncestorJsonModels = await loadAncestors(newJsonModel);
    } catch(e) {
        extension.showError(e.message);
        return;
    }

    // Update and show model
    jsonModel.set(newJsonModel);
    ancestorJsonModels.set(newAncestorJsonModels);
    updateModel(newJsonModel, newAncestorJsonModels);
}

async function updateModel(jsonModel: MinecraftModelJson, ancestorJsonModels: {[assetPath: string]: MinecraftModelJson}) {
    const model = MinecraftModel.fromJson(resolveModelJson(jsonModel, ancestorJsonModels));

    let elements = [];
    for(const element of model.elements) {
        const geometry = new ElementGeometry(element, model.textures);
        const mesh = new ElementMesh(geometry, model.textures);
        elements.push(mesh);
    }
    elementMeshes.set(elements);


    AssetResolver.resolveAssets(Object.values(model.textures), "texture")
        .then((textureUrls) => loadTextures(textureUrls));
}

async function loadAncestors(root: MinecraftModelJson) {
    let ancestors: {[assetPath: string]: MinecraftModelJson} = {};
    let current = root;
    while(current.parent != null) {
        const url = (await AssetResolver.resolveAssets([current.parent], "model"))[current.parent];

        if(url === null) {
            throw new Error("Couldn't resolve parent: " + current.parent);
        }

        let ancestor: MinecraftModelJson;
        try {
            ancestor = await new MinecraftModelJsonLoader().load(url);
        } catch(e) {
            throw new Error(`Failed loading parent '${current.parent}': ${e.message}`);
        }
        ancestors[current.parent] = ancestor;
        current = ancestor;
    }

    return ancestors;
}

async function loadTextures(textureUrls: {[assetPath: string]: string | null}) {
    const textureLoader = new MinecraftTextureLoader();
    const loadedTextures: {[assetPath: string]: MinecraftTexture} = {};

    for(const assetPath in textureUrls) {
        const url = textureUrls[assetPath];
        if(url === null) {
            extension.showError(`Couldn't resolve texture: ${assetPath}`);
            continue;
        }

        try {
            loadedTextures[assetPath] = await textureLoader.load(url);
        } catch(e) {
            extension.showError(`Failed loading texture: ${assetPath}. System path: ${url}`);
            continue;
        }
    }

    get(elementMeshes)?.forEach(e => e.resolveTextures((assetPath) => loadedTextures[assetPath]));
    textures.set(loadedTextures);
}