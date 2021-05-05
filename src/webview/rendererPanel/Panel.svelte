<script lang="ts">
    import Canvas from './Canvas.svelte';
    import { textures } from '../data/model';
    import { onMount } from 'svelte';
    import { Animator } from '../utils/Animator';
    import { calculateCommonAnimationPeriod } from '@oran9e/three-mcmodel';
    import { get } from 'svelte/store';
    import { ShadingMode } from '../data/shading';
    import RendererControls from './Controls.svelte';
    import { overlaySettings } from '../data/config';

    let shadingMode = ShadingMode.Material;
    let showOverlays = true;

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

<RendererControls {shadingMode} setShadingMode={m => shadingMode = m} {showOverlays} setShowOverlays={s => showOverlays = s}/>
<Canvas bind:this={canvas} {shadingMode} {showOverlays} overlaySettings={$overlaySettings}/>