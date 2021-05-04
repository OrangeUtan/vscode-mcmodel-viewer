import { MinecraftTexture, MinecraftTextureLoader, ElementMesh, MinecraftModelJsonLoader } from '@oran9e/three-mcmodel';
import { resolveModelJson, MinecraftModelJson } from '@oran9e/minecraft-model';
import { MinecraftModel } from '@oran9e/minecraft-model';
import { AssetResolver, showError } from '../extension';
import { writable, get } from 'svelte/store';
import { ElementGeometry } from '@oran9e/three-mcmodel/dist/geometry';
import type { LoadModelMsg } from '../../extension/messages';

export const elementMeshes = writable<ElementMesh[]>([]);
export const textures = writable<{[assetPath: string]: MinecraftTexture}>({});

export async function onLoadModelMsg(msg: LoadModelMsg) {
    try {
        await loadModel(msg.modelUri);
    } catch(e) {
        showError(e.message);
    }
}

async function loadModel(modelUrl: string) {
    let modelJson = await new MinecraftModelJsonLoader().load(modelUrl);
    const ancestors = await loadAncestors(modelJson);

    const model = MinecraftModel.fromJson(resolveModelJson(modelJson, ancestors));

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
            showError(`Couldn't resolve texture: ${assetPath}`);
            continue;
        }

        try {
            loadedTextures[assetPath] = await textureLoader.load(url);
        } catch(e) {
            showError(`Failed loading texture: ${assetPath}. System path: ${url}`);
            continue;
        }
    }

    get(elementMeshes)?.forEach(e => e.resolveTextures((assetPath) => loadedTextures[assetPath]));
    textures.set(loadedTextures);
}