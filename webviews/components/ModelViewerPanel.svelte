<script lang="ts">
    import ModelCanvas from './ModelCanvas.svelte'
    import { RendererSettings } from '../data/config'
    import { onMount } from 'svelte';
    import { Animator } from '../utils/Animator';
    import { modelMesh, textures } from '../data/model';
    import { get } from 'svelte/store';

    let modelCanvas: ModelCanvas;
    let rendererSettings = new RendererSettings();

    let animator = new Animator();

    onMount(async () => {
        return () => {
            animator.stop();
        }
    });

    window.addEventListener('message', e => {
        switch(e.data.command) {
            case "updateRendererSettings":
                updateRendererSettings(e.data.value)
                break;
        }
    });

    textures.subscribe(() => {
        const mesh = get(modelMesh);

        animator.stop();
        if(mesh?.isAnimated()) {
            animator.start((frame) => mesh?.setAnimationFrame(frame), 500, mesh?.getAnimationPeriod() ?? 1)
        }
    });

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
    <ModelCanvas bind:this={modelCanvas} modelMesh={$modelMesh} settings={rendererSettings} />
</div>
