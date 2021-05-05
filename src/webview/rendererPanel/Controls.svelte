<script lang="ts">
import { ShadingMode } from "../data/shading";
    export let shadingMode: ShadingMode;
    export let setShadingMode: (mode: ShadingMode) => void;
    export let showOverlays: boolean;
    export let setShowOverlays: (show: boolean) => void;
</script>

<style lang="scss">
    *{
        box-sizing: border-box;
    }

    .wrapper {
        position:fixed;
        top: 4px;
        right: 4px;
        display: flex;
        flex-direction: row;
    }

    .btn {
        border: 0.6px solid black;
        background-color: #5a5a5a;
        padding: 2px;
        display: flex;
        align-content: center;

        .icon {
            height: 12px;
            width: 12px;
            fill: #C2C2C2;
            stroke: #C2C2C2;

            &:hover {
                fill: white;
                stroke: white;
            }
        }

        &.selected {
            background-color: var(--vscode-focusBorder);

            .icon {
                fill: white;
                stroke: white;
            }
        }
    }

    .btn-group {
        margin-left: 2px;
        display: flex;
        flex-direction: row;

        .btn:not(:first-child) {
            border-left: unset;
        }

        .btn:first-child.btn{
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
        }

        .btn:last-child {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }
    }
</style>

<div class="wrapper">
    <div class="btn-group">
        <div title="Toggle Overlays" class="btn right" class:selected={showOverlays} on:click={() => setShowOverlays(!showOverlays)}>
            <svg class="icon" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="4.5" x2="4.5" y2="14"/>
                <line x1="9.5" x2="9.5" y2="14"/>
                <line y1="4.5" x2="14" y2="4.5"/>
                <line y1="9.5" x2="14" y2="9.5"/>
            </svg>
        </div>
    </div>
    <div class="btn-group">
        <div title="Shading: Wireframe" class="btn" class:selected={shadingMode === ShadingMode.Wireframe} on:click={() => setShadingMode(ShadingMode.Wireframe)}>
            <svg class="icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="8.5" fill="transparent"/>
                <path d="M17 6H1M1 12H17M5.5 1.5V16.5M12.5 16.5V1.5"/>
            </svg>
        </div>
        <div title="Shading: Matierial" class="btn right" class:selected={shadingMode === ShadingMode.Material} on:click={() => setShadingMode(ShadingMode.Material)}>
            <svg class="icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="8.5"/>
            </svg>
        </div>
    </div>
</div>