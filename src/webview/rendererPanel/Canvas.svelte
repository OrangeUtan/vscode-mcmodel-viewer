<script lang="ts">
	import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    import { AntiAliasing } from '../data/config'
    import type { OverlaySettings } from '../data/config'
    import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
    import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
    import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
    import type { Pass } from 'three/examples/jsm/postprocessing/Pass';
    import { onMount } from 'svelte';
    import type { ElementMesh } from '@oran9e/three-mcmodel';
    import { ShadingMode } from '../data/shading';
    import Overlays from './Overlays.svelte';

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

    // Update anti aliasing
    $: if(scene != null) {
        setAnitAliasing(overlaySettings.antiAliasing);
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


    function setAnitAliasing(mode: string) {
        if(antiAliasingPass) {
            composer.removePass(antiAliasingPass)
        }
        switch(mode) {
            case AntiAliasing.SSAA:
                antiAliasingPass = new SSAARenderPass(scene, camera, 0, 0);
                composer.addPass(antiAliasingPass);
                break
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
<Overlays container={scene} {overlaySettings} visible={showOverlays}></Overlays>