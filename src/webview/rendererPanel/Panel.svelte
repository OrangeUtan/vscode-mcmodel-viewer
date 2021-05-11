<script lang="ts">
    import Canvas from './Canvas.svelte';
    import { textures } from '../state/model';
    import { onMount } from 'svelte';
    import { Animator } from './Animator';
    import { calculateCommonAnimationPeriod } from '@oran9e/three-mcmodel';
    import { get } from 'svelte/store';
    import { ShadingMode } from '../state/shading';
    import RendererControls from './Controls.svelte';
    import { overlaySettings } from '../state/config';
    import { persistStore } from '../state/persistStore';

    let shadingMode = persistStore<ShadingMode>("shadingMode", ShadingMode.Material);
    let showOverlays = persistStore<boolean>("showOverlays", true);

    let canvas: Canvas;
    let animator = new Animator();

    onMount(async () => {
        const unsubscribeTextures = textures.subscribe(() => {
            const _textures = Object.values(get(textures));

            animator.stop();
            if(_textures.some(t => t.isAnimated())) {
                animator.start(frame => _textures.forEach(t => t.setAnimationFrame(frame)), 500, calculateCommonAnimationPeriod(_textures));
            }
        });

        return () => {
            animator.stop();
            unsubscribeTextures();
        }
    });
</script>

<RendererControls bind:shadingMode={$shadingMode} bind:showOverlays={$showOverlays}/>
<Canvas bind:this={canvas} shadingMode={$shadingMode} showOverlays={$showOverlays} overlaySettings={$overlaySettings}/>