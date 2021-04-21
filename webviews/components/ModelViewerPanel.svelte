<script lang="ts">
    import { MinecraftModelLoader } from '@oran9e/three-mcmodel';
    import ModelCanvas from './ModelCanvas.svelte'
    import { modelStore, texturesStore } from '../data/model'
    import { RendererSettings, rendererSettingsStore } from '../data/config'

    let modelCanvas: ModelCanvas

    window.addEventListener('message', e => {
        switch(e.data.command) {
            case "loadModel":
                new MinecraftModelLoader().load(e.data.value.model, mesh => {
                    texturesStore.set(e.data.value.textures)
                    modelStore.set(mesh)
                })
                break;
                case "updateRendererSettings":
                    const settings = e.data.value
                    rendererSettingsStore.set(new RendererSettings(
                        settings.showBoundingBox,
                        settings.showCardinalDirectionLabels,
                        settings.show3x3BlocksGrid,
                        settings.showVoxelGrid,
                        settings.antiAliasing,
                    ))
        }
    });

</script>

<ModelCanvas bind:this={modelCanvas} />