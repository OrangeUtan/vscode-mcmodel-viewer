<script lang="ts">
    import ModelCanvas from './ModelCanvas.svelte'
    import { MinecraftModelLoader, MinecraftModelMesh, MinecraftTexture, MinecraftTextureLoader } from '@oran9e/three-mcmodel';
    import { RendererSettings } from '../data/config'
    import { onMount } from 'svelte';

    const vscode = acquireVsCodeApi();

    let modelCanvas: ModelCanvas
    let modelMesh: MinecraftModelMesh | undefined = undefined
    let textures: {[assetPath: string]: MinecraftTexture} = {}
    let rendererSettings = new RendererSettings();
    let animationFrame = 0

    onMount(async () => {
        const animationUpdateHandle = setInterval(() => {
            animationFrame++;
            if(modelMesh) {
                modelMesh.setAnimationFrame(animationFrame);
            }
        }, 500)

        return () => {
            clearInterval(animationUpdateHandle)
        }
    });

    window.addEventListener('message', e => {
        switch(e.data.command) {
            case "loadModel":
                ((async () => loadModel(e.data.value)))();
                break;
            case "resolvedTextures":
                ((async () => loadTextures(e.data.value)))();
                break;
            case "updateRendererSettings":
                updateRendererSettings(e.data.value)
                break;
        }
    });

    async function loadModel(modelUrl: string) {
        const model = await new MinecraftModelLoader().load(modelUrl)
        modelMesh = new MinecraftModelMesh(model)

        if(model.textures) {
            vscode.postMessage({command: "resolveTextures", value: Object.values(model.textures)});
        }
    }

    async function loadTextures(textureUrls: any) {
        const textureLoader = new MinecraftTextureLoader();
        const loadedTextures: {[assetPath: string]: MinecraftTexture} = {}

        for(const assetPath in textureUrls) {
            loadedTextures[assetPath] = await textureLoader.load(textureUrls[assetPath])
        }

        textures = loadedTextures
        modelMesh?.resolveTextures((assetPath) =>  textures[assetPath])
    }

    function updateRendererSettings(settings: any) {
        rendererSettings = new RendererSettings(
            settings.showBoundingBox,
            settings.showCardinalDirectionLabels,
            settings.show3x3BlocksGrid,
            settings.showVoxelGrid,
            settings.antiAliasing,
        )
    }

</script>

<style lang="scss">
    :global(body) {
        height: 100vh;
        width: 100vw;
    }

    #container {
        height: 100%;
        width: 100%;
    }
</style>

<div id="container">
    <ModelCanvas bind:this={modelCanvas} {modelMesh} settings={rendererSettings} />
</div>
