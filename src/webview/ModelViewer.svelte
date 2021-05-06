<script lang="ts">
    import { onMount } from 'svelte';
    import { onExtensionMessage } from './extension';
    import RendererPanel from './rendererPanel/Panel.svelte';

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
        body {
            height: 100vh;
            width: 100vw;
        }
    }

    #container {
        height: 100%;
        width: 100%;
    }
</style>

<div id="container">
    <RendererPanel bind:this={rendererPanel}/>
</div>
