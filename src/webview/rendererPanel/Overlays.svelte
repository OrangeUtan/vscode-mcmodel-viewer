<script lang="ts">
    import type { OverlaySettings } from "../data/config";
    import { Text2D } from "./Text2D";
    import * as THREE from 'three';

    export let container: THREE.Object3D | undefined;
    export let overlaySettings: OverlaySettings;
    export let visible: boolean = true;

    // Overlays
    let voxelGrid: THREE.GridHelper | undefined;
    let blockGrid: THREE.GridHelper | undefined;
    let cardinalDirectionLabels: Text2D[] | undefined;
    let boundingBox: THREE.LineSegments | undefined;

    // Update overlays
    $: if(container != null){
        removeOverlays();
        if(visible) {
            addOverlays(overlaySettings);
        }
    }

    function removeOverlays() {
        if(boundingBox) container!.remove(boundingBox)
        if(blockGrid) container!.remove(blockGrid)
        if(voxelGrid) container!.remove(voxelGrid)
        if(cardinalDirectionLabels != null) container!.remove(...cardinalDirectionLabels)
    }

    async function addOverlays(settings: OverlaySettings) {
        if(settings.showBoundingBox) {
            if(!boundingBox) {
                boundingBox = new THREE.LineSegments(
                    new THREE.EdgesGeometry(new THREE.BoxGeometry(48, 48, 48)).translate(0, 8, 0),
                    new THREE.LineBasicMaterial({ color: 0x444444, linewidth: 3 })
                )
            }
            container!.add(boundingBox)
        }
        if(settings.showVoxelGrid) {
            if(!voxelGrid) voxelGrid = new THREE.GridHelper(48, 48, 0x444444, 0x444444)
            container!.add(voxelGrid)
        }
        if(settings.show3x3BlocksGrid) {
            if(!blockGrid) blockGrid = new THREE.GridHelper(48, 3);
            container!.add(blockGrid)
        }
        if(settings.showCardinalDirectionLabels) {
            if(cardinalDirectionLabels == null) {
                cardinalDirectionLabels = await createCardinalDirectionLabels();
            }
            container!.add(...cardinalDirectionLabels)
        }
    }

    async function createCardinalDirectionLabels() {
        const loader = new THREE.FontLoader();
        const font = await loader.loadAsync(RESOURCES_ROOT + '/helvetiker_regular.typeface.json');

        return [
            new Text2D("N", font, [-Math.PI / 2, 0, 0], [-2, 0, -26]),
            new Text2D("E", font, [0, -Math.PI / 2, -Math.PI / 2], [26, 0, -2]),
            new Text2D("S", font, [-Math.PI / 2, Math.PI, 0], [2, 0, 26]),
            new Text2D("W", font, [0, Math.PI / 2, Math.PI / 2], [-26, 0, 2]),
        ]
    }
</script>