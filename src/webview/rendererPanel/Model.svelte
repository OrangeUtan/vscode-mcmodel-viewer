<script lang="ts">
    import type { ElementMesh } from '@oran9e/three-mcmodel';
    import * as THREE from 'three';
    import { ShadingMode } from '../data/shading';

    export let elements: ElementMesh[];
    export let container: THREE.Object3D | undefined;
    export let shadingMode: ShadingMode;

    const elementsGroup = new THREE.Group();
    const wireframeGroup = new THREE.Group();

    $: if (container != null) {
        elementsGroup.translateX(-8);
        elementsGroup.translateZ(-8);
        container.add(elementsGroup);

        wireframeGroup.translateX(-8);
        wireframeGroup.translateZ(-8);
        container.add(wireframeGroup);
    }

    // Add meshes to groups
    $: if(elements.length > 0) {
        elementsGroup.clear();
        elementsGroup.add(...elements)

        wireframeGroup.clear();
        wireframeGroup.add(
            ...elements.map(e => new THREE.LineSegments(new THREE.WireframeGeometry(e.geometry), new THREE.LineBasicMaterial()))
        )
    }

    // Set visibility of groups
    $: {
        elementsGroup.visible = false;
        wireframeGroup.visible = false;

        switch(shadingMode) {
            case ShadingMode.Wireframe:
                wireframeGroup.visible = true;
                break;
            case ShadingMode.Material:
                elementsGroup.visible = true;
        }
    }
</script>