<script lang="ts">
    import { MinecraftModelLoader, MinecraftModelMesh } from '@oran9e/three-mcmodel';
    import ModelCanvas from './ModelCanvas.svelte'
    import { modelStore, texturesStore } from '../data/model'

    let modelCanvas: ModelCanvas

    window.addEventListener('message', e => {
        switch(e.data.command) {
            case "loadModel":
                new MinecraftModelLoader().load(e.data.value.model, mesh => {
                    texturesStore.set(e.data.value.textures)
                    modelStore.set(mesh)
                })
        }
    });
</script>

<ModelCanvas bind:this={modelCanvas} />