<script lang="ts">
	import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    import { Text2D } from './utils/Text2D'
    import { AntiAliasing } from './data/config'
    import type { OverlaySettings } from './data/config'
    import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
    import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
    import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
    import type { Pass } from 'three/examples/jsm/postprocessing/Pass';
    import { onMount } from 'svelte';
    import type { ElementMesh } from '@oran9e/three-mcmodel';
    import { ShadingMode } from './data/shading';

    // Props
    export let elements: ElementMesh[];
    export let overlaySettings: OverlaySettings;
    export let shadingMode: ShadingMode;
    export let showOverlays: boolean;

    // Html elements
    let canvas: HTMLCanvasElement;

    // Scene components
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let renderer: THREE.Renderer;
    let composer: EffectComposer;
    let antiAliasingPass: Pass | undefined;
    const elementsGroup = new THREE.Group();
    const wireframeGroup = new THREE.Group();

    // Overlays
    let voxelGrid: THREE.GridHelper | undefined;
    let blockGrid: THREE.GridHelper | undefined;
    let cardinalDirectionLabels: Text2D[] | undefined;
    let boundingBox: THREE.LineSegments | undefined;

    onMount(async () => {
        initScene()
        animate()

        const resizeHandle = () => resizeRendererToDisplaySize();
        window.addEventListener('resize', resizeHandle);

        return () => {
            window.removeEventListener('resize', resizeHandle);
        }
    })

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

    // Update overlays
    $: if(scene != null) {
        removeOverlays();
        if(showOverlays) {
            addOverlays(overlaySettings);
        }

        if(antiAliasingPass) {
            composer.removePass(antiAliasingPass)
        }
        switch(overlaySettings.antiAliasing) {
            case AntiAliasing.SSAA:
                antiAliasingPass = new SSAARenderPass(scene, camera, 0, 0);
                composer.addPass(antiAliasingPass);
                break
        }
    }

    function initScene () {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000)
        camera.position.set(0, 48, -48)

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas })
        composer = new EffectComposer(renderer as THREE.WebGLRenderer)
        composer.addPass(new RenderPass(scene, camera));
        resizeRendererToDisplaySize()

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableKeys = false
        controls.screenSpacePanning = true

        elementsGroup.translateX(-8);
        elementsGroup.translateZ(-8);
        scene.add(elementsGroup);

        wireframeGroup.translateX(-8);
        wireframeGroup.translateZ(-8);
        scene.add(wireframeGroup);
    }

    function animate () {
        requestAnimationFrame(animate)
        controls.update()
        composer.render()
    }

    function resizeRendererToDisplaySize() {
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio, height = canvas.clientHeight * pixelRatio

        if(canvas.width !== width ||  canvas.height != height) {
            renderer.setSize(width, height, false)
            composer.setSize(width, height)

            camera.aspect = width / height
            camera.updateProjectionMatrix()
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

    function removeOverlays() {
        if(boundingBox) scene.remove(boundingBox)
        if(blockGrid) scene.remove(blockGrid)
        if(voxelGrid) scene.remove(voxelGrid)
        if(cardinalDirectionLabels != null) scene.remove(...cardinalDirectionLabels)
    }

    async function addOverlays(settings: OverlaySettings) {
        if(settings.showBoundingBox) {
            if(!boundingBox) {
                boundingBox = new THREE.LineSegments(
                    new THREE.EdgesGeometry(new THREE.BoxGeometry(48, 48, 48)).translate(0, 8, 0),
                    new THREE.LineBasicMaterial({ color: 0x444444, linewidth: 3 })
                )
            }
            scene.add(boundingBox)
        }
        if(settings.showVoxelGrid) {
            if(!voxelGrid) voxelGrid = new THREE.GridHelper(48, 48, 0x444444, 0x444444)
            scene.add(voxelGrid)
        }
        if(settings.show3x3BlocksGrid) {
            if(!blockGrid) blockGrid = new THREE.GridHelper(48, 3);
            scene.add(blockGrid)
        }
        if(settings.showCardinalDirectionLabels) {
            if(cardinalDirectionLabels == null) {
                cardinalDirectionLabels = await createCardinalDirectionLabels();
            }
            scene.add(...cardinalDirectionLabels)
        }
    }
</script>

<style lang="scss">
    canvas {
        width: 100%;
		height: 100%;
        display: block;
    }
</style>

<canvas bind:this={canvas}/>