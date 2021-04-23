import { HierarchicalModelResolver, MinecraftModel, MinecraftModelLoader, MinecraftModelMesh, MinecraftTexture, MinecraftTextureLoader } from '@oran9e/three-mcmodel';
import { AssetResolver, showError } from '../extensionApi';
import { writable, get, readable } from 'svelte/store';
import { MinecraftModelGeometry } from '@oran9e/three-mcmodel/dist/src/geometry';

export const modelMesh = writable<MinecraftModelMesh |undefined>(undefined);
export const textures = writable<{[assetPath: string]: MinecraftTexture}>({});

window.addEventListener('message', e => {
    switch(e.data.command) {
        case "loadModel":
            (async () => {
                try {
                    await loadModel(e.data.value);
                } catch(e) {
                    showError(e.message);
                }
            })();
            break;
    }
});

async function loadModel(modelUrl: string) {
    let model = await new MinecraftModelLoader().load(modelUrl);

    let ancestors: {[assetPath: string]: MinecraftModel} = {};
    let current = model;
    while(current.parent != null) {
        const ancestorUrl = (await AssetResolver.resolveAssets([current.parent], "model"))[current.parent];
        if(ancestorUrl === null) {
            throw new Error("Couldn't resolve parent: " + current.parent);
        }
        let ancestor: MinecraftModel;
        try {
            ancestor = await new MinecraftModelLoader().load(ancestorUrl);
        } catch(e) {
            throw new Error(`Failed loading parent '${current.parent}': ${e.message}`);
        }
        ancestors[current.parent] = ancestor;
        current = ancestor;
    }

    const resolver = new HierarchicalModelResolver(model, ancestors);
    const elements = resolver.elements ?? [];
    const textures = resolver.textures;

    const geometry = new MinecraftModelGeometry(elements, textures);
    modelMesh.set(new MinecraftModelMesh(geometry, textures));

    AssetResolver.resolveAssets(Object.values(textures), "texture")
        .then((textureUrls) => loadTextures(textureUrls));
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

    get(modelMesh)?.resolveTextures((assetPath) => loadedTextures[assetPath]);
    textures.set(loadedTextures);
}