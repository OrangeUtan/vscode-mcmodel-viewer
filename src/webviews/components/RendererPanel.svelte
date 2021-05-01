<script lang="ts">
    import ModelCanvas from './ModelCanvas.svelte';
    import { elementMeshes, textures } from '../data/model';
    import { RendererSettings } from '../data/config'
    import { onMount } from 'svelte';
    import { Animator } from '../utils/Animator';
    import { calculateCommonAnimationPeriod } from '@oran9e/three-mcmodel';
    import { get } from 'svelte/store';
    import { ShadingMode } from '../data/shading';
    import RendererControls from './RendererControls.svelte';

    let shadingMode = ShadingMode.Material;
    let showOverlays = true;

    let canvas: ModelCanvas;
    let rendererSettings = new RendererSettings();
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

<RendererControls {shadingMode} setShadingMode={m => shadingMode = m} {showOverlays} setShowOverlays={s => showOverlays = s}/>
<ModelCanvas bind:this={canvas} elements={$elementMeshes} settings={rendererSettings} {shadingMode} {showOverlays}/>