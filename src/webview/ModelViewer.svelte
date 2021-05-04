<script lang="ts">
    import { onMount } from 'svelte';
    import type { ExtensionMessage } from '../extension/messages';
    import { ExtensionMessageType } from '../extension/messages';
    import {onLoadModelMsg} from './data/model';
    import {onResolvedAssetsMsg} from './extension';

    import RendererPanel from './RendererPanel.svelte';

    let rendererPanel: RendererPanel;

    onMount(() => {
        const handleMessage = (e: MessageEvent) => handleExtensionMessage(e.data);
        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        }
    });

    function handleExtensionMessage(msg: ExtensionMessage) {
        switch(msg.command) {
            case ExtensionMessageType.LoadModel:
                onLoadModelMsg(msg);
                break;
            case ExtensionMessageType.ResolvedAssets:
                onResolvedAssetsMsg(msg);
                break;
        }
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
    <RendererPanel bind:this={rendererPanel}/>
</div>
