<script lang="ts">
    import ModelCanvas from './ModelCanvas.svelte';
    import { elementMeshes, textures } from '../data/model';
    import { RendererSettings } from '../data/config'
    import { onMount } from 'svelte';
    import { Animator } from '../utils/Animator';
    import { calculateCommonAnimationPeriod } from '@oran9e/three-mcmodel';
    import { get } from 'svelte/store';

    let rendererSettings = new RendererSettings();

    let canvas: ModelCanvas;
    let wireframe = false;

    let animator = new Animator();

    onMount(async () => {
        window.addEventListener('message', handleMessage);

        const unsubscribeTextures = textures.subscribe(() => {
            const _textures = Object.values(get(textures));

            animator.stop();
            if(_textures.some(t => t.isAnimated())) {
                animator.start(frame => _textures.forEach(t => t.setAnimationFrame(frame)), 500, calculateCommonAnimationPeriod(_textures));
            }
        });

        return () => {
            animator.stop();
            window.removeEventListener('message', handleMessage);
            unsubscribeTextures();
        }
    });

    function handleMessage(e: MessageEvent) {
        switch(e.data.command) {
            case "updateRendererSettings":
                updateRendererSettings(e.data.value)
                break;
            case "toggleWireframe":
                wireframe = !wireframe;
        }
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

<ModelCanvas bind:this={canvas} elements={$elementMeshes} settings={rendererSettings} {wireframe} />