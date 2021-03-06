import { MinecraftTexture, MinecraftTextureLoader, ElementMesh, MinecraftModelJsonLoader } from '@oran9e/three-mcmodel';
import { resolveModelJson, MinecraftModelJson } from '@oran9e/minecraft-model';
import { MinecraftModel } from '@oran9e/minecraft-model';
import { AssetResolver } from '../extension';
import * as extension from '../extension';
import { writable, get } from 'svelte/store';
import { ElementGeometry } from '@oran9e/three-mcmodel/dist/geometry';
import { ExtensionMessageType, ShowModelMsg,AssetChangedMsg } from '../../extension/messages';
import { persistStore } from './persistStore';

/*-------*/
/* State */
/*-------*/
export const modelUrl = persistStore<string|undefined>("modelUrl", undefined);
export const elementMeshes = writable<ElementMesh[]>([]);
export const textures = writable<{[assetPath: string]: MinecraftTexture}>({});

let jsonModel: MinecraftModelJson | undefined = undefined;

let ancestors: string[] = [];
let cachedJsonModels: {[assetPath: string]: MinecraftModelJson} = {};

/*---------------*/
/* State changes */
/*---------------*/
modelUrl.subscribe(url => {
    if(url) {
        showModel(url);
    };
});

/*--------------------*/
/* Extension messages */
/*--------------------*/
extension.addExtensionMessageListener<ShowModelMsg>(ExtensionMessageType.ShowModel, msg => {
    modelUrl.set(undefined);
    modelUrl.set(msg.modelUri);
});
extension.addExtensionMessageListener<AssetChangedMsg>(ExtensionMessageType.AssetChanged, msg => {
    switch(msg.assetType) {
        case "model":
            onAncestorChanged(msg.assetPath);
            break;
        case "texture":
            break;
        default:
            return;
    }
});

async function onAncestorChanged(assetPath: string) {
    if(!ancestors.includes(assetPath)) return;
    if(jsonModel) {
        const updatedAncestor = cachedJsonModels[assetPath];
        try {
            delete cachedJsonModels[assetPath];
            await updateModel(jsonModel);
        } catch(e) {
            extension.showError(e.message);
            cachedJsonModels[assetPath] = updatedAncestor;
            return;
        }
    }
}

async function showModel(modelUrl: string) {
    let newJsonModel: MinecraftModelJson;
    try {
        newJsonModel = await new MinecraftModelJsonLoader().load(modelUrl);
    } catch(e) {
        extension.showError(e.message);
        return;
    }

    cachedJsonModels = {};
    ancestors = [];
    updateModel(newJsonModel);
}

async function updateModel(newJsonModel: MinecraftModelJson) {
    const {ancestors: newAncestors, ancestorJsonModels: newAncestorJsonModels}= await loadAncestors(newJsonModel);
    const model = MinecraftModel.fromJson(resolveModelJson(newJsonModel, newAncestorJsonModels));

    jsonModel = newJsonModel;
    ancestors = newAncestors;
    for(const key in newAncestorJsonModels) {
        cachedJsonModels[key] = newAncestorJsonModels[key];
    }

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
    let ancestors: string[] = [];
    let ancestorJsonModels: {[assetPath: string]: MinecraftModelJson} = {};

    let current = root;
    while(current.parent != null) {
        let ancestor: MinecraftModelJson | undefined = cachedJsonModels[current.parent];

        // Load ancestor if it is not cached
        if(ancestor == null) {
            const url = (await AssetResolver.resolveAssets([current.parent], "model"))[current.parent];

            if(url === null) {
                throw new Error("Couldn't resolve parent: " + current.parent);
            }

            try {
                ancestor = await new MinecraftModelJsonLoader().load(url);
            } catch(e) {
                throw new Error(`Failed loading parent '${current.parent}': ${e.message}`);
            }
        }

        ancestors.push(current.parent);
        ancestorJsonModels[current.parent] = ancestor;
        current = ancestor;
    }

    return {
        ancestors,
        ancestorJsonModels
    };
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