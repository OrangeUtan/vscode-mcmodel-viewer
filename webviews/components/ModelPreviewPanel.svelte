<script lang="ts">
    import { MinecraftModelLoader } from '@oran9e/three-mcmodel';
    import ModelCanvas from './ModelCanvas.svelte'
    import { modelStore, texturesStore } from '../data/model'
    import { rendererSettingsStore } from '../data/config'

    let modelCanvas: ModelCanvas

    window.addEventListener('message', e => {
        switch(e.data.command) {
            case "loadModel":
                new MinecraftModelLoader().load(e.data.value.model, mesh => {
                    texturesStore.set(e.data.value.textures)
                    modelStore.set(mesh)
                    console.log("Loaded model");
                })
                break;
                case "updateRendererSettings":
                    rendererSettingsStore.set(e.data.value)
        }
    });

</script>

<ModelCanvas bind:this={modelCanvas} />