<script lang="ts">
    import RendererPanel from './RendererPanel.svelte';

    let rendererPanel: RendererPanel;
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
    <RendererPanel bind:this={rendererPanel}/>
</div>
