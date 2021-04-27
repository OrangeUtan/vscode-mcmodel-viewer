<script lang="ts">
    import ModelCanvas from './ModelCanvas.svelte'
    import { RendererSettings } from '../data/config'
    import { onMount } from 'svelte';
    import { Animator } from '../utils/Animator';
    import { elementMeshes, textures } from '../data/model';
    import { get } from 'svelte/store';
import { calculateCommonAnimationPeriod } from '@oran9e/three-mcmodel/dist/texture';

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
        const _textures = Object.values(get(textures));

        animator.stop();
        if(_textures.some(t => t.isAnimated())) {
            animator.start(frame => _textures.forEach(t => t.setAnimationFrame(frame)), 500, calculateCommonAnimationPeriod(_textures));
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
    <ModelCanvas bind:this={modelCanvas} elements={$elementMeshes} settings={rendererSettings} />
</div>
