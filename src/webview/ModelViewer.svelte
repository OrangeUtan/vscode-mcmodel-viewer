<script lang="ts">
    import { onMount } from 'svelte';
    import { onExtensionMessage } from './extension';
    import RendererPanel from './RendererPanel.svelte';

    let rendererPanel: RendererPanel;

    onMount(() => {
        const handleMessage = (e: MessageEvent) => onExtensionMessage(e.data);
        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        }
    });
</script>

<style lang="scss">
    :global {
        @import './styles/global.scss';
    }

    #container {
        height: 100%;
        width: 100%;
    }
</style>

<div id="container">
    <RendererPanel bind:this={rendererPanel}/>
</div>
