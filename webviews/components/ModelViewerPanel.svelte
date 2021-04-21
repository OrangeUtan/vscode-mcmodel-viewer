<script lang="ts">
    import ModelCanvas from './ModelCanvas.svelte'
    import { MinecraftModelLoader, MinecraftModelMesh, MinecraftTexture, MinecraftTextureLoader } from '@oran9e/three-mcmodel';
    import { RendererSettings } from '../data/config'

    let modelCanvas: ModelCanvas
    let modelMesh: MinecraftModelMesh | undefined = undefined
    let textures: {[assetPath: string]: MinecraftTexture} = {}
    let rendererSettings = new RendererSettings();

    window.addEventListener('message', e => {
        switch(e.data.command) {
            case "loadModel":
                ((async () => {
                    loadModel(e.data.value.model)
                    loadTextures(e.data.value.textures);
                }))();
                break;
                case "updateRendererSettings":
                    updateRendererSettings(e.data.value)
        }
    });

    async function loadModel(modelUrl: string) {
        const model = await new MinecraftModelLoader().load(modelUrl)
        modelMesh = new MinecraftModelMesh(model)
    }

    async function loadTextures(textureUrls: any) {
        const textureLoader = new MinecraftTextureLoader();
        const loadedTextures: {[assetPath: string]: MinecraftTexture} = {}

        for(const assetPath in textureUrls) {
            loadedTextures[assetPath] = await textureLoader.load(textureUrls[assetPath])
        }

        textures = loadedTextures
    }

    $: if(modelMesh && textures && Object.values(textures).length > 0) {
        modelMesh.resolveTextures((assetPath) =>  textures[assetPath])
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

<ModelCanvas bind:this={modelCanvas} {modelMesh} settings={rendererSettings} />