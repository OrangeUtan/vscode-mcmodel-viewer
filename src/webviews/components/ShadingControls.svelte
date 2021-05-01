<script lang="ts">
import { ShadingMode } from "../data/shading";
    export let shadingMode: ShadingMode;
    export let setShadingMode: (mode: ShadingMode) => void;
</script>

<style lang="scss">
    *{
        box-sizing: border-box;
    }

    .wrapper {
        position:fixed;
        top: 4px;
        right: 6px;
        display: flex;
        flex-direction: row;
    }

    .btn {
        border: 1px solid black;
        background-color: #5a5a5a;
        padding: 1.5px;
        display: flex;
        align-content: center;

        &.right {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        &.left {
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            border-right: unset;
            padding-right: 1px;
        }

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
</style>

<div class="wrapper">
    <div title="Wireframe" class="btn left" class:selected={shadingMode === ShadingMode.Wireframe} on:click={() => setShadingMode(ShadingMode.Wireframe)}>
        <svg class="icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="8.5" fill="transparent"/>
            <path d="M17 6H1M1 12H17M5.5 1.5V16.5M12.5 16.5V1.5"/>
        </svg>
    </div>
    <div title="Matierial" class="btn right" class:selected={shadingMode === ShadingMode.Material} on:click={() => setShadingMode(ShadingMode.Material)}>
        <svg class="icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="8.5"/>
        </svg>
    </div>
</div>