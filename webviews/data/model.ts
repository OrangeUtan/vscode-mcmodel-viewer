import { MinecraftModel, MinecraftModelLoader, MinecraftModelMesh, MinecraftTexture, MinecraftTextureLoader } from '@oran9e/three-mcmodel';
import { AssetResolver, showError } from '../extensionApi';
import { writable, get, readable } from 'svelte/store';

export const modelMesh = writable<MinecraftModelMesh |undefined>(undefined);
export const textures = writable<{[assetPath: string]: MinecraftTexture}>({});

window.addEventListener('message', e => {
    switch(e.data.command) {
        case "loadModel":
            (async () => loadModel(e.data.value))();
            break;
    }
});

async function loadModel(modelUrl: string) {
    let model: MinecraftModel;
    try {
        model = await new MinecraftModelLoader().load(modelUrl);
    } catch(e) {
        showError(`Loading model failed: ${e.message}`);
        return;
    }
    modelMesh.set(new MinecraftModelMesh(model));

    if(model.textures) {
        AssetResolver.resolveAssets(Object.values(model.textures), "texture")
            .then((textureUrls) => loadTextures(textureUrls));
    }
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

    textures.set(loadedTextures);
    get(modelMesh)?.resolveTextures((assetPath) => loadedTextures[assetPath]);
}